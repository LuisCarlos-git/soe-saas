import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { totp } from "../../../scripts/test-totp.mjs";

async function enroll(page: Page) {
  const origin = "http://127.0.0.1:43220";
  const response = await page.request.post("/api/auth/two-factor/enable", {
    headers: { Origin: origin },
    data: { password: "12345678" },
  });
  expect(response.status()).toBe(200);
  const { totpURI } = (await response.json()) as { totpURI: string };
  expect(
    (
      await page.request.post("/api/auth/two-factor/verify-totp", {
        headers: { Origin: origin },
        data: { code: totp(totpURI) },
      })
    ).status(),
  ).toBe(204);
}
async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill("12345678");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
}
async function openMenu(page: Page) {
  const trigger = page.getByRole("button", { name: "Abrir menu de navegação" });
  if (await trigger.isVisible()) await trigger.click();
}
test("pessoa sem permissão não vê menus escolares e não abre suas rotas", async ({
  page,
}) => {
  await login(page, "bia@example.test");
  await openMenu(page);
  await expect(
    page.getByRole("navigation", { name: "Escola", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Administração", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Configurações", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/school-sidebar-unprivileged-${test.info().project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  for (const path of [
    "/schools",
    "/administration/schools",
    "/settings/schools",
    "/schools/00000000-0000-4000-8000-000000000001/settings",
  ]) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", { name: "Página não encontrada" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Nova escola" })).toHaveCount(
      0,
    );
    await expect(page.getByLabel("Nome da escola")).toHaveCount(0);
  }
});
test("operador provisiona escola e responsável administra configurações isoladas", async ({
  page,
}) => {
  const viewport = test.info().project.name;
  const name = `Escola Horizonte ${viewport} — sintética`;
  const email = `school-${viewport}@example.test`;
  await login(page, `operator-${viewport}@example.test`);
  await page.goto("/settings/profile");
  await expect(page.getByRole("tab")).toHaveCount(2);
  await openMenu(page);
  await expect(
    page.getByRole("navigation", { name: "Escola", exact: true }),
  ).toHaveCount(0);
  await page.screenshot({
    path: `test-results/school-sidebar-operator-${viewport}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByRole("navigation", { name: "Administração", exact: true })
    .getByRole("link", { name: "Escolas piloto" })
    .click();
  await expect(page).toHaveURL(/\/administration\/schools$/);
  await expect(
    page.getByRole("heading", {
      name: "Confirme sua identidade para continuar",
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Nova escola" })).toHaveCount(
    0,
  );
  await enroll(page);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Escolas piloto", exact: true }),
  ).toBeVisible();
  const trigger = page.getByRole("button", { name: "Nova escola" });
  await trigger.click();
  const modal = page.getByRole("dialog");
  await expect(modal.getByLabel("Nome da escola")).toBeFocused();
  await modal.getByRole("button", { name: "Criar escola piloto" }).click();
  await expect(modal.getByText("Informe o nome da escola.")).toBeVisible();
  await modal.getByLabel("Nome da escola").fill(name);
  await modal.getByLabel("Fuso horário").selectOption("America/Manaus");
  await modal.getByLabel("Ano letivo").fill("2027");
  await modal
    .getByLabel("Nome do responsável")
    .fill(`Responsável da escola ${viewport}`);
  await modal.getByLabel("E-mail do responsável").fill(email);
  await modal.evaluate((node) =>
    Promise.all(
      node
        .getAnimations({ subtree: true })
        .filter((animation) => {
          const end = animation.effect?.getComputedTiming().endTime;
          return typeof end === "number" && Number.isFinite(end);
        })
        .map((animation) => animation.finished.catch(() => {})),
    ),
  );
  const nameBox = await modal.getByLabel("Nome da escola").boundingBox();
  const nextLabelBox = await modal
    .getByText("Fuso horário", { exact: true })
    .boundingBox();
  expect(nameBox).not.toBeNull();
  expect(nextLabelBox).not.toBeNull();
  const fieldGap = nextLabelBox!.y - (nameBox!.y + nameBox!.height);
  expect(fieldGap).toBeGreaterThanOrEqual(8);
  expect(fieldGap).toBeLessThanOrEqual(16);
  await test.info().attach("school-form-spacing", {
    body: JSON.stringify({ viewport, fieldGap }),
    contentType: "application/json",
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await modal.evaluate((node) => {
    node.scrollTop = 0;
  });
  await page.screenshot({
    path: `test-results/school-create-${viewport}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await modal
    .getByRole("button", { name: "Criar escola piloto" })
    .scrollIntoViewIfNeeded();
  await expect(modal.getByLabel("Nome do responsável")).toBeInViewport({
    ratio: 1,
  });
  await page.screenshot({
    path: `test-results/school-create-actions-${viewport}.png`,
    fullPage: true,
    animations: "disabled",
  });
  // Protected focus: declining dismissal preserves all entered values.
  page.once("dialog", (dialog) => {
    void dialog.dismiss();
  });
  await page.keyboard.press("Escape");
  await expect(modal).toBeVisible();
  await expect(modal.getByLabel("Nome da escola")).toHaveValue(name);
  await page.context().setOffline(true);
  await modal.getByRole("button", { name: "Criar escola piloto" }).click();
  await expect(
    page.getByText(
      "Sem conexão com o serviço. Verifique a rede e tente novamente.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(modal.getByLabel("Nome da escola")).toHaveValue(name);
  await page.context().setOffline(false);
  await modal.getByRole("button", { name: "Criar escola piloto" }).click();
  await expect(modal).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await page.screenshot({
    path: `test-results/schools-${viewport}.png`,
    fullPage: true,
    animations: "disabled",
  });
  // Logout through the real endpoint; the next UI session must contain only the administrator's access.
  expect(
    (
      await page.request.post("/api/auth/sign-out", {
        headers: { Origin: "http://127.0.0.1:43220" },
        data: {},
      })
    ).status(),
  ).toBe(204);
  await login(page, email);
  await enroll(page);
  await openMenu(page);
  await expect(
    page.getByRole("navigation", { name: "Administração", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Escola", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/school-sidebar-admin-${viewport}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("link", { name: "Minhas escolas", exact: true }).click();
  await expect(page).toHaveURL(/\/schools\/?$/);
  await expect(page.getByRole("button", { name: "Nova escola" })).toHaveCount(
    0,
  );
  await page.getByRole("link", { name, exact: true }).click();
  await expect(page.getByLabel("Nome da escola")).toHaveValue(name);
  await expect(page.getByLabel("Fuso horário")).toHaveValue("America/Manaus");
  await expect(page.getByLabel("Ano letivo")).toHaveValue("2027");
  await page.getByLabel("Equipe de acompanhamento").fill("Apoio ao estudante");
  page.once("dialog", (dialog) => {
    void dialog.dismiss();
  });
  await openMenu(page);
  await page.getByRole("link", { name: "Configurações", exact: true }).click();
  await expect(page.getByLabel("Equipe de acompanhamento")).toHaveValue(
    "Apoio ao estudante",
  );
  page.once("dialog", (dialog) => {
    void dialog.accept();
  });
  await page.getByRole("button", { name: "Recarregar configurações" }).click();
  await expect(page.getByLabel("Equipe de acompanhamento")).toHaveValue(
    "Orientação educacional",
  );
  await page.getByLabel("Equipe de acompanhamento").fill("Apoio ao estudante");
  // Another successful writer advances the version without refreshing this form.
  const settingsPath = `/api/v1/schools/${new URL(page.url()).pathname.split("/")[2]}/settings`;
  const current = (await (
    await page.request.get(settingsPath)
  ).json()) as Record<string, unknown>;
  const competing = {
    name: current.name,
    timeZone: current.timeZone,
    academicYear: current.academicYear,
    supportTeamLabel: "Equipe de apoio",
    studentLabel: current.studentLabel,
    classLabel: current.classLabel,
    version: current.version,
  };
  expect(
    (
      await page.request.patch(settingsPath, {
        headers: { Origin: "http://127.0.0.1:43220" },
        data: competing,
      })
    ).status(),
  ).toBe(200);
  await page.getByRole("button", { name: "Salvar configurações" }).click();
  await expect(
    page.getByText(/Não foi possível salvar\. Confira o responsável informado/),
  ).toBeVisible();
  await expect(page.getByLabel("Equipe de acompanhamento")).toHaveValue(
    "Apoio ao estudante",
  );
  page.once("dialog", (dialog) => {
    void dialog.accept();
  });
  await page.getByRole("button", { name: "Recarregar configurações" }).click();
  await expect(page.getByLabel("Equipe de acompanhamento")).toHaveValue(
    "Equipe de apoio",
  );
  await page.getByLabel("Equipe de acompanhamento").fill("Apoio ao estudante");
  await page.getByRole("button", { name: "Salvar configurações" }).click();
  await expect(
    page.getByText("Configurações da escola salvas.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Equipe de acompanhamento")).toHaveValue(
    "Apoio ao estudante",
  );
  await expect(page.getByLabel("Fuso horário")).toHaveValue("America/Manaus");
  await expect(page.getByLabel("Ano letivo")).toHaveValue("2027");
  await page
    .locator(".soe-route-content")
    .evaluate((node) =>
      Promise.all(node.getAnimations().map((animation) => animation.finished)),
    );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: `test-results/school-settings-${viewport}.png`,
    fullPage: true,
    animations: "disabled",
  });
  const mainFrame = await page
    .locator('[data-slot="sidebar-inset"]')
    .boundingBox();
  const contentFrame = await page.locator(".soe-route-content").boundingBox();
  expect(mainFrame).not.toBeNull();
  expect(contentFrame).not.toBeNull();
  const leftSpace = contentFrame!.x - mainFrame!.x;
  const rightSpace =
    mainFrame!.x + mainFrame!.width - contentFrame!.x - contentFrame!.width;
  expect(Math.abs(leftSpace - rightSpace)).toBeLessThanOrEqual(1);
  if (viewport === "desktop") expect(contentFrame!.width).toBeGreaterThan(800);
  const reloadFrame = await page
    .getByRole("button", { name: "Recarregar configurações" })
    .boundingBox();
  const saveFrame = await page
    .getByRole("button", { name: "Salvar configurações" })
    .boundingBox();
  expect(reloadFrame).not.toBeNull();
  expect(saveFrame).not.toBeNull();
  if (viewport === "desktop")
    expect(Math.abs(reloadFrame!.y - saveFrame!.y)).toBeLessThanOrEqual(1);
  else expect(saveFrame!.width).toBe(reloadFrame!.width);
  await page
    .getByRole("link", { name: "Voltar às escolas", exact: true })
    .click();
  await expect(page).toHaveURL(/\/schools\/?$/);
  await page.goto("/schools/00000000-0000-4000-8000-000000000001/settings");
  await expect(
    page.getByRole("heading", { name: "Página não encontrada" }),
  ).toBeVisible();
  await expect(page.getByLabel("Nome da escola")).toHaveCount(0);
});
