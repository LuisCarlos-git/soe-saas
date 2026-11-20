import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

function gate() {
  let release: () => void = () => undefined;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

test("spinners e livro acompanham a operação real, respeitando movimento reduzido", async ({
  page,
}) => {
  const login = gate(),
    identity = gate(),
    logout = gate();
  await page.route("**/api/auth/sign-in/email", async (route) => {
    await login.promise;
    await route.continue();
  });
  await page.route("**/api/v1/identity/session", async (route) => {
    await identity.promise;
    await route.continue();
  });
  await page.route("**/api/auth/sign-out", async (route) => {
    await logout.promise;
    await route.continue();
  });
  await page.goto("/login");
  await page.getByLabel("E-mail", { exact: true }).fill("ana@example.test");
  await page.getByLabel("Senha", { exact: true }).fill("12345678");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  const entering = page.getByRole("button", { name: "Entrar", exact: true });
  await expect(entering).toBeDisabled();
  await expect(entering).toHaveAttribute("aria-busy", "true");
  await expect(entering.locator("[data-loading-spinner]")).toBeVisible();
  const reduced = await page.evaluate(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  if (reduced)
    await expect(entering.locator("[data-loading-spinner]")).toHaveCSS(
      "animation-name",
      "none",
    );
  login.release();
  const loading = page
    .getByRole("status")
    .filter({ hasText: "Carregando página…" });
  await expect(loading).toBeVisible();
  const book = loading.locator('[data-hairline="book"]');
  await expect(book.locator("svg")).toBeVisible();
  await expect(book).toHaveAttribute("data-playing", String(!reduced));
  if (!reduced) {
    // Observe more than one complete turn: the loader must not pause between tour stops.
    for (let sample = 0; sample < 12; sample++) {
      const initial = await book.locator("svg").innerHTML();
      await expect
        .poll(() => book.locator("svg").innerHTML(), { timeout: 600 })
        .not.toBe(initial);
      await page.waitForTimeout(300);
    }
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: `test-results/page-loading-${test.info().project.name}.png`,
    fullPage: true,
  });
  if (reduced) {
    const first = await book.locator("svg").innerHTML();
    await page.waitForTimeout(200);
    expect(await book.locator("svg").innerHTML()).toBe(first);
  }
  identity.release();
  await expect(page.getByText("Ana Teste", { exact: true })).toBeVisible();
  await expect(loading).toHaveCount(0);
  if (test.info().project.name === "mobile")
    await page.getByRole("button", { name: "Abrir menu de navegação" }).click();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  const leaving = page.getByRole("button", { name: "Sair", exact: true });
  await expect(leaving.locator("[data-loading-spinner]")).toBeVisible();
  await expect(leaving).toBeDisabled();
  logout.release();
  await expect(page).toHaveURL(/\/login$/);
  await expect(loading).toHaveCount(0);
});
