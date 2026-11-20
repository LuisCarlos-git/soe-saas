import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("configurações protegidas, abas com URL e navegação responsiva", async ({
  page,
}) => {
  await page.goto("/settings/security");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("E-mail", { exact: true }).fill("ana@example.test");
  await page.getByLabel("Senha", { exact: true }).fill("12345678");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(
    page.getByRole("heading", { name: "Proteção em duas etapas" }),
  ).toHaveCount(0);
  await page.goto("/account/");
  if (test.info().project.name === "desktop")
    await expect(
      page
        .getByRole("navigation", { name: "Navegação principal" })
        .getByRole("link", { name: "Visão geral", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  const sidebar = page.getByRole("complementary", { name: "Menu lateral" });
  const marker = page.locator('[data-slot="sidebar-selection-indicator"]');
  const desktop = test.info().project.name === "desktop";
  const frame = desktop ? await sidebar.boundingBox() : null;
  const initialMarker = desktop ? await marker.boundingBox() : null;
  const originalMarker = desktop ? await marker.elementHandle() : null;
  await page.getByRole("link", { name: "Abrir configurações" }).click();
  await expect(page).toHaveURL(/\/settings\/profile$/);
  await expect(
    page.getByRole("heading", { name: "Configurações", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Perfil", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("Ana Teste");
  if (desktop) {
    expect(await sidebar.boundingBox()).toEqual(frame);
    expect(
      await marker.evaluate(
        (node, original) => node === original,
        originalMarker,
      ),
    ).toBe(true);
    await expect
      .poll(async () => (await marker.boundingBox())!.y)
      .toBeGreaterThan(initialMarker!.y + 100);
    expect(
      await marker.evaluate(
        (node) => getComputedStyle(node).transitionDuration,
      ),
    ).not.toBe("0s");
    await expect(sidebar).toHaveCSS("animation-name", "none");
  }
  await expect(page.locator(".soe-page-transition")).toHaveCount(0);
  const settingsHeading = await page
    .getByRole("heading", { name: "Configurações", exact: true })
    .elementHandle();

  await page.screenshot({
    path: `test-results/settings-profile-${test.info().project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("tab", { name: "Segurança", exact: true }).click();
  await expect(page).toHaveURL(/\/settings\/security\/?$/);
  await expect(
    page.getByRole("heading", { name: "Proteção em duas etapas" }),
  ).toBeVisible();
  expect(
    await page
      .getByRole("heading", { name: "Configurações", exact: true })
      .evaluate((node, original) => node === original, settingsHeading),
  ).toBe(true);
  await expect(
    page.getByRole("tabpanel").locator(".soe-route-content"),
  ).toHaveCSS("animation-name", desktop ? "soe-page-in" : "none");
  await page.reload();
  await expect(
    page.getByRole("tab", { name: "Segurança", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.goto("/settings/security/");
  await expect(
    page.getByRole("tab", { name: "Segurança", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("navigation", { name: "Localização" }),
  ).toContainText("Segurança");
  await page.getByRole("tab", { name: "Segurança", exact: true }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(
    page.getByRole("tab", { name: "Perfil", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/settings\/profile$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/settings\/security\/?$/);
  const menu = page.getByRole("button", { name: "Abrir menu de navegação" });
  if (test.info().project.name === "mobile") {
    await menu.click();
    const navigation = page.getByRole("dialog", { name: "Menu de navegação" });
    await expect(navigation).toBeVisible();
    await page.screenshot({
      path: "test-results/settings-sidebar-mobile.png",
      fullPage: true,
      animations: "disabled",
    });
    await page.keyboard.press("Escape");
    await expect(navigation).toBeHidden();
    await expect(menu).toBeFocused();
    await menu.click();
    await navigation
      .getByRole("link", { name: "Configurações", exact: true })
      .click();
    await expect(navigation).toBeHidden();
    await expect(page).toHaveURL(/\/settings\/profile$/);
    await page.getByRole("tab", { name: "Segurança", exact: true }).click();
  } else {
    await expect(
      page
        .getByRole("navigation", { name: "Conta e preferências" })
        .getByRole("link", { name: "Configurações", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  }
  await expect(
    page.getByRole("button", { name: "Configurar aplicativo" }),
  ).toBeVisible();
  await page
    .getByRole("heading", { name: "Configurações", exact: true })
    .click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/settings-security-${test.info().project.name}.png`,
    fullPage: true,
  });
  const html = await (await page.request.get("/settings/security")).text();
  expect(html).toContain("Proteção em duas etapas");
  expect(html).not.toMatch(/12345678|AUTH_SECRET|session_token/);
  if (test.info().project.name === "mobile")
    await page.getByRole("button", { name: "Abrir menu de navegação" }).click();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/settings/profile");
  await expect(page).toHaveURL(/\/login$/);
});
