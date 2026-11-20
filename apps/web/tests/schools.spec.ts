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
test("operador provisiona escola e responsável administra configurações isoladas", async ({
  page,
}) => {
  const viewport = test.info().project.name;
  const name = `Escola Horizonte ${viewport} — sintética`;
  const email = `school-${viewport}@example.test`;
  await login(page, `operator-${viewport}@example.test`);
  await page.goto("/settings/profile");
  await page.getByRole("tab", { name: "Escolas", exact: true }).click();
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
    page.getByRole("heading", { name: "Escolas", exact: true }),
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
  await modal.getByLabel("E-mail do responsável").fill(email);
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
  await page.goto("/settings/schools");
  await expect(page.getByRole("button", { name: "Nova escola" })).toHaveCount(
    0,
  );
  await page.getByRole("link", { name: `${name} Configurar` }).click();
  await expect(page.getByLabel("Nome da escola")).toHaveValue(name);
  await expect(page.getByLabel("Fuso horário")).toHaveValue("America/Manaus");
  await expect(page.getByLabel("Ano letivo")).toHaveValue("2027");
  await page.getByLabel("Equipe de acompanhamento").fill("Apoio ao estudante");
  page.once("dialog", (dialog) => {
    void dialog.dismiss();
  });
  await page.getByRole("tab", { name: "Perfil", exact: true }).click();
  await expect(page.getByLabel("Equipe de acompanhamento")).toHaveValue(
    "Apoio ao estudante",
  );
  // Another successful writer advances the version without refreshing this form.
  const settingsPath = `/api/v1/schools/${page.url().split("/").at(-1)}/settings`;
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
  await page.goto("/settings/schools/00000000-0000-4000-8000-000000000001");
  await expect(
    page.getByText("Você não tem permissão para administrar escolas."),
  ).toBeVisible();
  await expect(page.getByLabel("Nome da escola")).toHaveCount(0);
});
