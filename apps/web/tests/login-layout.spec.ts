import { expect, test } from "@playwright/test";
import type { Route } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("login preserva formulário responsivo e mostra a cena realista", async ({
  page,
}) => {
  await page.goto("/login");
  const button = page.getByRole("button", { name: "Entrar", exact: true });
  const form = page.locator("form");
  const input = page.getByLabel("E-mail", { exact: true });
  await expect(button).toBeEnabled();
  await expect
    .poll(async () => {
      const box = await button.boundingBox();
      const field = await input.boundingBox();
      return Boolean(box && field && Math.abs(box.width - field.width) < 1);
    })
    .toBe(true);
  expect(
    await form.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await input.fill("ana@example.test");
  await expect(input).toHaveValue("ana@example.test");
  const figure = page.locator(".soe-classroom-illustration");
  const wide = (page.viewportSize()?.width ?? 0) >= 1024;
  if (wide) {
    await expect(figure).toBeVisible();
    await expect
      .poll(() =>
        figure.evaluate(
          (element) =>
            element instanceof HTMLImageElement &&
            element.complete &&
            element.naturalWidth > 0,
        ),
      )
      .toBe(true);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(figure).toBeVisible();
  } else {
    await expect(figure).toBeHidden();
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("validação local aparece sob os campos e falha da API permanece no toast", async ({
  page,
}) => {
  let requests = 0;
  await page.route("**/api/auth/sign-in/email", async (route) => {
    requests++;
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        code: "INVALID_CREDENTIALS",
        message: "E-mail ou senha inválidos",
        correlationId: "00000000-0000-4000-8000-000000000001",
      }),
    });
  });
  await page.goto("/login");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(
    page.getByText("Informe seu e-mail.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Informe sua senha.", { exact: true }),
  ).toBeVisible();
  expect(requests).toBe(0);
  const email = page.getByLabel("E-mail", { exact: true });
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await email.fill("ana@example.test");
  await page.getByLabel("Senha", { exact: true }).fill("12345678");
  await expect(email).not.toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(
    page.locator("[data-sonner-toast][data-type=error][data-rich-colors=true]"),
  ).toBeVisible();
  expect(requests).toBe(1);
});

test("login aguarda a resposta de autenticação e apresenta sua falha no toast", async ({
  page,
}) => {
  let pendingRoute: Route | undefined;
  let requests = 0;
  await page.route("**/api/auth/sign-in/email", (route) => {
    requests++;
    pendingRoute = route;
  });
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Entrar", exact: true });
  await expect(submit).toBeEnabled();
  await page.getByLabel("E-mail", { exact: true }).fill("ana@example.test");
  await page.getByLabel("Senha", { exact: true }).fill("12345678");
  const submitted = page.waitForRequest("**/api/auth/sign-in/email");
  await submit.click();
  await submitted;
  await expect(submit).toBeDisabled();
  await expect(submit).toHaveAttribute("aria-busy", "true");
  await expect(submit.locator("[data-loading-spinner]")).toBeVisible();
  expect(requests).toBe(1);
  if (!pendingRoute)
    throw new Error("A requisição de login não foi interceptada.");
  await pendingRoute.fulfill({
    status: 401,
    contentType: "application/json",
    body: JSON.stringify({
      code: "INVALID_CREDENTIALS",
      message: "E-mail ou senha inválidos",
      correlationId: "00000000-0000-4000-8000-000000000001",
    }),
  });
  await expect(submit).toBeEnabled();
  await expect(submit).toHaveAttribute("aria-busy", "false");
  await expect(
    page.locator("[data-sonner-toast][data-type=error][data-rich-colors=true]"),
  ).toBeVisible();
});
