import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("entrar, SSR de duas sessões independentes e sair sem persistir credenciais", async ({
  page,
  browser,
}) => {
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("E-mail", { exact: true }).fill("ana@example.test");
  await page.getByLabel("Senha", { exact: true }).fill("wrong-password");
  await page.context().setOffline(true);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(
    page
      .locator("[data-sonner-toast][data-type=error]")
      .filter({ hasText: "Sem conexão com o serviço" }),
  ).toBeVisible();
  await page.context().setOffline(false);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(
    page
      .locator("[data-sonner-toast][data-type=error]")
      .filter({ hasText: "E-mail ou senha inválidos" }),
  ).toBeVisible();
  await expect(
    page.locator("[data-sonner-toast][data-type=error][data-rich-colors=true]"),
  ).toHaveCount(2);
  await page.getByLabel("Senha", { exact: true }).fill("12345678");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: `test-results/login-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByText("Ana Teste", { exact: true })).toBeVisible();
  const other = await browser.newContext();
  try {
    const second = await other.newPage();
    await second.goto("/login");
    await second.getByLabel("E-mail", { exact: true }).fill("bia@example.test");
    await second.getByLabel("Senha", { exact: true }).fill("12345678");
    await second.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(second.getByText("Bia Teste", { exact: true })).toBeVisible();
    const [firstHtml, secondHtml] = await Promise.all([
      page.context().request.get("/account"),
      other.request.get("http://127.0.0.1:43120/account"),
    ]);
    const ana = await firstHtml.text();
    const bia = await secondHtml.text();
    expect(ana).toContain("Ana Teste");
    expect(ana).not.toContain("Bia Teste");
    expect(bia).toContain("Bia Teste");
    expect(bia).not.toContain("Ana Teste");
    expect(ana + bia).not.toMatch(/12345678|session_token|AUTH_SECRET/);
    expect(firstHtml.headers()["cache-control"]).toBe("no-store");
    expect(
      await page.evaluate(() => ({
        local: { ...localStorage },
        session: { ...sessionStorage },
        cookies: document.cookie,
      })),
    ).toEqual({ local: {}, session: {}, cookies: "" });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({
      path: `test-results/account-${test.info().project.name}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.context().setOffline(true);
    await page.getByRole("button", { name: "Sair", exact: true }).click();
    await expect(
      page
        .locator("[data-sonner-toast][data-type=error]")
        .filter({ hasText: "Sem conexão com o serviço" }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/account$/);
    await page.context().setOffline(false);
    await page.getByRole("button", { name: "Sair", exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login$/);
    await second.reload();
    await expect(second.getByText("Bia Teste", { exact: true })).toBeVisible();
  } finally {
    await other.close();
  }
});
