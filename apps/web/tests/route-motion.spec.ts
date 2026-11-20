import { expect, test, type Page } from "@playwright/test";

type MotionSample = {
  label: string;
  opacity: number;
  transform: string;
  animation: string;
  duration: string;
  delay: string;
  elapsed: (number | null)[];
  reduced: boolean;
};
declare global {
  interface Window {
    routeMotionSamples: MotionSample[];
    routeMotionStopped: boolean;
    routeMotionFrame?: number;
  }
}
async function observeRoute(
  page: Page,
  action: () => Promise<unknown>,
  target: string,
) {
  await page.evaluate(() => {
    if (window.routeMotionFrame !== undefined)
      cancelAnimationFrame(window.routeMotionFrame);
    window.routeMotionSamples = [];
    window.routeMotionStopped = false;
    const sample = () => {
      if (window.routeMotionStopped) return;
      const content = document.querySelector(".soe-route-content");
      if (content) {
        const style = getComputedStyle(content);
        const text = content.textContent ?? "";
        const label = text.includes("Proteção em duas etapas")
          ? "security"
          : text.includes("Seu perfil")
            ? "profile"
            : text.includes("Seu espaço no SOE")
              ? "overview"
              : "pending";
        window.routeMotionSamples.push({
          label,
          opacity: Number(style.opacity),
          transform: style.transform,
          animation: style.animationName,
          duration: style.animationDuration,
          delay: style.animationDelay,
          elapsed: content
            .getAnimations()
            .map((animation) =>
              typeof animation.currentTime === "number"
                ? animation.currentTime
                : null,
            ),
          reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
        });
      }
      window.routeMotionFrame = requestAnimationFrame(sample);
    };
    window.routeMotionFrame = requestAnimationFrame(sample);
  });
  await action();
  await page.waitForTimeout(500);
  return page.evaluate((expected) => {
    window.routeMotionStopped = true;
    if (window.routeMotionFrame !== undefined)
      cancelAnimationFrame(window.routeMotionFrame);
    window.routeMotionFrame = undefined;
    return window.routeMotionSamples.filter(
      (sample) => sample.label === expected,
    );
  }, target);
}

test("o conteúdo final entra progressivamente ao trocar abas e voltar à visão geral", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("E-mail", { exact: true }).fill("ana@example.test");
  await page.getByLabel("Senha", { exact: true }).fill("12345678");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Seu espaço no SOE" }),
  ).toBeVisible();
  const reduced = await page.evaluate(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  for (const [name, target, action] of [
    [
      "Perfil",
      "profile",
      () => page.getByRole("link", { name: "Abrir configurações" }).click(),
    ],
    [
      "Segurança",
      "security",
      () => page.getByRole("tab", { name: "Segurança", exact: true }).click(),
    ],
    [
      "Perfil novamente",
      "profile",
      () => page.getByRole("tab", { name: "Perfil", exact: true }).click(),
    ],
    [
      "Visão geral",
      "overview",
      async () => {
        if (reduced)
          await page
            .getByRole("button", { name: "Abrir menu de navegação" })
            .click();
        await page
          .getByRole("navigation", { name: "Navegação principal" })
          .getByRole("link", { name: "Visão geral", exact: true })
          .click();
      },
    ],
  ] as const) {
    const frames = await observeRoute(page, action, target);
    expect(frames.length, name).toBeGreaterThan(2);
    const progressive = frames.filter(
      (frame) => frame.opacity > 0.05 && frame.opacity < 0.98,
    );
    if (reduced)
      expect(
        frames.every((frame) => frame.opacity === 1),
        name,
      ).toBe(true);
    else
      expect
        .soft(
          progressive.length,
          `${name}: ${JSON.stringify(frames.slice(0, 4))}`,
        )
        .toBeGreaterThanOrEqual(2);
  }
});
