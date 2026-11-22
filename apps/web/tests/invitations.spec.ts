import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { totp } from "../../../scripts/test-totp.mjs";

// Invitation URLs and MFA enrollment material must stay out of CI trace artifacts.
test.use({ trace: "off" });

const origin = "http://127.0.0.1:43220";
async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill("12345678");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
}
async function enroll(page: Page) {
  const setup = await page.request.post("/api/auth/two-factor/enable", {
    headers: { Origin: origin },
    data: { password: "12345678" },
  });
  expect(setup.status()).toBe(200);
  const { totpURI } = await setup.json();
  expect(
    (
      await page.request.post("/api/auth/two-factor/verify-totp", {
        headers: { Origin: origin },
        data: { code: totp(totpURI) },
      })
    ).status(),
  ).toBe(204);
}
async function menu(page: Page) {
  const trigger = page.getByRole("button", { name: "Abrir menu de navegação" });
  if ((page.viewportSize()?.width ?? 1280) < 768) {
    await expect(trigger).toBeVisible();
    await trigger.click();
  }
}
async function capture(page: Page, name: string) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document
        .getAnimations({ subtree: true })
        .filter((animation) =>
          Number.isFinite(animation.effect?.getComputedTiming().endTime),
        )
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const modal = page.getByRole("dialog");
  if (await modal.isVisible())
    await modal.evaluate((element) => {
      element.scrollTop = 0;
    });
  await page.screenshot({
    path: `test-results/invitation-${name}-${test.info().project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  if (
    (await modal.isVisible()) &&
    (await modal.evaluate(
      (element) => element.scrollHeight > element.clientHeight + 1,
    ))
  ) {
    await modal.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await page.screenshot({
      path: `test-results/invitation-${name}-actions-${test.info().project.name}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await modal.evaluate((element) => {
      element.scrollTop = 0;
    });
  }
}

async function exerciseTable(page: Page, schoolId: string, project: string) {
  for (let index = 0; index < 12; index++) {
    const response = await page.request.post(
      `/api/v1/schools/${schoolId}/invitations`,
      {
        headers: { Origin: origin },
        data: {
          name: `Equipe ${String(index).padStart(2, "0")}`,
          email: `table-${project}-${index}@example.test`,
          roles: ["TEACHER"],
        },
      },
    );
    expect(response.status()).toBe(201);
  }
  await page
    .getByRole("button", { name: "Atualizar lista", exact: true })
    .click();
  await expect(page.getByText("1–10 de 13", { exact: true })).toBeVisible();
  const header = page.getByRole("columnheader", {
    name: "Profissional",
    exact: true,
  });
  await header.getByRole("button").click();
  await expect(header).toHaveAttribute("aria-sort", "ascending");
  await expect(page.getByRole("row").nth(1)).toContainText("Equipe 00");
  await capture(page, "table-sorted");
  if (project === "desktop") {
    const viewport = page.viewportSize()!;
    for (const width of [320, 768, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      await capture(page, `table-width-${width}`);
    }
    await page.setViewportSize(viewport);
  }
  await page
    .getByRole("button", { name: "Próxima página", exact: true })
    .click();
  await expect(page.getByText("11–13 de 13", { exact: true })).toBeVisible();
  await capture(page, "table-page-2");
  await page
    .getByLabel("Buscar profissional", { exact: true })
    .fill(`table-${project}-0@example.test`);
  await page.getByRole("button", { name: "Filtrar", exact: true }).click();
  await expect(page.getByText("1–1 de 1", { exact: true })).toBeVisible();
  await expect(page.getByRole("row").nth(1)).toContainText("Equipe 00");
  await page
    .getByLabel("Buscar profissional", { exact: true })
    .fill("não-existe");
  await page.getByRole("button", { name: "Filtrar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Nenhum convite encontrado" }),
  ).toBeVisible();
  await capture(page, "table-no-results");
  await page.getByRole("button", { name: "Limpar", exact: true }).click();
  await expect(page.getByText("1–10 de 13", { exact: true })).toBeVisible();
  await header.getByRole("button").click();
  await expect(header).toHaveAttribute("aria-sort", "descending");
  await expect(page.getByRole("row").nth(1)).toContainText(
    "Maria da Conceição",
  );
  await page
    .getByLabel("Situação do convite", { exact: true })
    .selectOption("ACCEPTED");
  await page.getByRole("button", { name: "Filtrar", exact: true }).click();
  await expect(page.getByText("1–1 de 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Ativo", { exact: true })).toBeVisible();
  const region = page.getByRole("region", {
    name: "Tabela de convites, role horizontalmente em telas pequenas",
  });
  if (project === "mobile") {
    await region.focus();
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => region.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);
    await region.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
    });
    await capture(page, "table-active-right");
    await region.evaluate((element) => {
      element.scrollLeft = 0;
    });
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await capture(page, "table-active-filter");
  await page.getByRole("button", { name: "Limpar", exact: true }).click();
}

async function invitationLink(recipient: string, schoolName: string) {
  const { baseUrl } = JSON.parse(
    await readFile("test-results/mailpit.json", "utf8"),
  );
  let mailId: string | undefined;
  await expect
    .poll(
      async () => {
        const data = await (await fetch(`${baseUrl}/api/v1/messages`)).json();
        mailId = data.messages.find(
          (message: {
            ID: string;
            Subject: string;
            To: { Address: string }[];
          }) =>
            message.Subject === `Convite para ${schoolName}` &&
            message.To.some((to) => to.Address === recipient),
        )?.ID;
        return Boolean(mailId);
      },
      { timeout: 15000 },
    )
    .toBe(true);
  const message = await (
    await fetch(`${baseUrl}/api/v1/message/${mailId}`)
  ).json();
  const link: string | undefined = message.Text.match(
    /https?:\/\/[^\s]+\/invitations\/accept#[A-Za-z0-9_-]+/,
  )?.[0];
  if (!link) throw new Error("Synthetic invitation link missing");
  return link;
}

test("QA-006-UI01: acesso sem permissão e convite inválido têm estados seguros", async ({
  page,
}) => {
  await login(page, "bia@example.test");
  await menu(page);
  await expect(
    page.getByRole("link", { name: "Profissionais", exact: true }),
  ).toHaveCount(0);
  for (const route of [
    "/schools/professionals",
    "/schools/00000000-0000-4000-8000-000000000001/professionals",
  ]) {
    await page.goto(route);
    await expect(
      page.getByRole("heading", { name: "Página não encontrada" }),
    ).toBeVisible();
  }
  await page.goto("/invitations/accept#invalid");
  await expect(
    page.getByRole("heading", { name: "Convite indisponível" }),
  ).toBeVisible();
  await capture(page, "invalid");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("QA-006-UI02-07: admin convida pela modal e destinatário aceita o e-mail real", async ({
  page,
  browser,
}) => {
  test.setTimeout(90000);
  const project = test.info().project.name;
  const schoolName = `Escola Convites ${project}`;
  const recipient = `profissional-${project}@example.test`;
  const adminEmail = `invite-admin-${project}@example.test`;
  await login(page, `invite-operator-${project}@example.test`);
  await enroll(page);
  const created = await page.request.post("/api/v1/administration/schools", {
    headers: { Origin: origin },
    data: {
      name: schoolName,
      timeZone: "America/Sao_Paulo",
      academicYear: 2026,
      supportTeamLabel: "Orientação",
      studentLabel: "Estudante",
      classLabel: "Turma",
      initialAdministratorName: "Admin Convites",
      initialAdministratorEmail: adminEmail,
    },
  });
  expect(created.status()).toBe(201);
  const school = await created.json();
  const secondName = `Escola Segunda ${project}`;
  const secondSchoolResponse = await page.request.post(
    "/api/v1/administration/schools",
    {
      headers: { Origin: origin },
      data: {
        name: secondName,
        timeZone: "America/Manaus",
        academicYear: 2026,
        supportTeamLabel: "Orientação",
        studentLabel: "Estudante",
        classLabel: "Turma",
        initialAdministratorName: "Admin Convites",
        initialAdministratorEmail: adminEmail,
      },
    },
  );
  expect(secondSchoolResponse.status()).toBe(201);
  const secondSchool = await secondSchoolResponse.json();
  await menu(page);
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await login(page, adminEmail);
  await enroll(page);
  await page.reload();
  await menu(page);
  await page.getByRole("link", { name: "Profissionais", exact: true }).click();
  await page.getByRole("link", { name: schoolName, exact: true }).click();
  await expect(page.getByText("Nenhum convite por aqui")).toBeVisible();
  await capture(page, "empty");
  await page
    .getByRole("button", { name: "Convidar profissional", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Revisar convite" }).click();
  await expect(
    dialog.getByText("Informe o nome do profissional."),
  ).toBeVisible();
  await dialog
    .getByLabel("Nome do profissional", { exact: true })
    .fill("Maria da Conceição — Profissional de teste");
  await dialog
    .getByLabel("E-mail do profissional", { exact: true })
    .fill(recipient);
  await dialog.getByLabel("Nome do profissional", { exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByLabel("E-mail do profissional", { exact: true }),
  ).toBeFocused();
  const teacherRole = dialog.getByRole("checkbox", {
    name: "Professor",
    exact: true,
  });
  await teacherRole.focus();
  await page.keyboard.press("Space");
  await expect(teacherRole).toBeChecked();
  page.once("dialog", (prompt) => prompt.dismiss());
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await capture(page, "dialog-details");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await dialog.getByRole("button", { name: "Revisar convite" }).click();
  await expect(
    dialog.getByRole("heading", { name: "Confira antes de enviar" }),
  ).toBeFocused();
  await dialog.getByRole("button", { name: "Voltar e editar" }).click();
  await expect(
    dialog.getByLabel("Nome do profissional", { exact: true }),
  ).toHaveValue("Maria da Conceição — Profissional de teste");
  await dialog.getByRole("button", { name: "Revisar convite" }).click();
  await capture(page, "dialog-review");
  let sends = 0;
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      request.url().endsWith(`/schools/${school.id}/invitations`)
    )
      sends++;
  });
  await dialog
    .getByRole("button", { name: "Enviar convite", exact: true })
    .click();
  await expect(
    dialog.getByRole("heading", { name: "Convite criado", exact: true }),
  ).toBeVisible();
  expect(sends).toBe(1);
  await capture(page, "dialog-success");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await dialog.getByRole("button", { name: "Concluir", exact: true }).click();
  if (project === "desktop")
    await expect(dialog).toHaveAttribute("data-state", "closed");
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Convidar profissional", exact: true }),
  ).toBeFocused();
  await expect(page.getByText("Pendente", { exact: true })).toBeVisible();
  await expect(page.getByText("E-mail enviado", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await capture(page, "pending");
  const link = await invitationLink(recipient, schoolName);
  await page
    .getByRole("link", { name: "Escolher outra escola", exact: true })
    .click();
  await page.getByRole("link", { name: secondName, exact: true }).click();
  await expect(
    page.getByText("Nenhum convite por aqui", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(recipient, { exact: true })).toHaveCount(0);
  await page
    .getByRole("link", { name: "Escolher outra escola", exact: true })
    .click();
  await page.getByRole("link", { name: schoolName, exact: true }).click();
  const context = await browser.newContext({
    viewport: page.viewportSize() ?? { width: 1280, height: 900 },
    reducedMotion: project === "mobile" ? "reduce" : "no-preference",
  });
  try {
    const invited = await context.newPage();
    await login(invited, "bia@example.test");
    await invited.goto(link);
    await expect(
      invited.getByRole("heading", {
        name: "Use a conta do convite",
        exact: true,
      }),
    ).toBeVisible();
    await capture(invited, "wrong-account");
    await invited
      .getByRole("button", { name: "Trocar de conta", exact: true })
      .click();
    await expect(
      invited.getByRole("heading", { name: "Crie seu acesso", exact: true }),
    ).toBeVisible();
    await capture(invited, "register");
    await invited
      .getByLabel("Seu nome", { exact: true })
      .fill("Maria da Conceição");
    await invited
      .getByLabel("Crie uma senha", { exact: true })
      .fill("synthetic-invitation-password");
    await invited
      .getByRole("button", { name: "Criar conta e entrar", exact: true })
      .click();
    await expect(
      invited.getByRole("button", { name: "Aceitar convite", exact: true }),
    ).toBeVisible();
    await capture(invited, "confirm");
    expect(
      (await new AxeBuilder({ page: invited }).analyze()).violations,
    ).toEqual([]);
    await invited
      .getByRole("button", { name: "Aceitar convite", exact: true })
      .click();
    await expect(
      invited.getByRole("heading", { name: "Convite aceito", exact: true }),
    ).toBeVisible();
    expect(new URL(invited.url()).hash).toBe("");
    await capture(invited, "accepted");
    const memberships = await invited.request.get(
      `${origin}/api/v1/identity/memberships`,
    );
    expect(memberships.status()).toBe(200);
    expect((await memberships.json()).memberships).toEqual([
      { organizationId: school.id, name: schoolName, roles: ["TEACHER"] },
    ]);
    await invited.goto(link);
    await expect(
      invited.getByRole("heading", {
        name: "Convite indisponível",
        exact: true,
      }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
  await page
    .getByRole("button", { name: "Atualizar lista", exact: true })
    .click();
  await expect(page.getByText("Ativo", { exact: true })).toBeVisible();
  await capture(page, "list-accepted");
  await exerciseTable(page, school.id, project);
  const secondInvite = await page.request.post(
    `/api/v1/schools/${secondSchool.id}/invitations`,
    {
      headers: { Origin: origin },
      data: { name: "Maria da Conceição", email: recipient, roles: ["TUTOR"] },
    },
  );
  expect(secondInvite.status()).toBe(201);
  const secondLink = await invitationLink(recipient, secondName);
  const existingContext = await browser.newContext({
    viewport: page.viewportSize() ?? { width: 1280, height: 900 },
    reducedMotion: project === "mobile" ? "reduce" : "no-preference",
  });
  try {
    const existing = await existingContext.newPage();
    await existing.goto(secondLink);
    await expect(
      existing.getByRole("heading", {
        name: "Entre para aceitar",
        exact: true,
      }),
    ).toBeVisible();
    await capture(existing, "existing-sign-in");
    await existing
      .getByLabel("Senha", { exact: true })
      .fill("synthetic-invitation-password");
    await existing
      .getByRole("button", { name: "Entrar para continuar", exact: true })
      .click();
    await existing
      .getByRole("button", { name: "Aceitar convite", exact: true })
      .click();
    await expect(
      existing.getByRole("heading", { name: "Convite aceito", exact: true }),
    ).toBeVisible();
    const memberships = await existing.request.get(
      `${origin}/api/v1/identity/memberships`,
    );
    expect((await memberships.json()).memberships).toEqual([
      { organizationId: school.id, name: schoolName, roles: ["TEACHER"] },
      { organizationId: secondSchool.id, name: secondName, roles: ["TUTOR"] },
    ]);
  } finally {
    await existingContext.close();
  }

  const administrativeEmail = `administrative-${project}@example.test`;
  expect(
    (
      await page.request.post(`/api/v1/schools/${school.id}/invitations`, {
        headers: { Origin: origin },
        data: {
          name: "Admin convidado",
          email: administrativeEmail,
          roles: ["SCHOOL_ADMIN"],
        },
      })
    ).status(),
  ).toBe(201);
  const administrativeLink = await invitationLink(
    administrativeEmail,
    schoolName,
  );
  const administrativeContext = await browser.newContext({
    viewport: page.viewportSize() ?? { width: 1280, height: 900 },
    reducedMotion: project === "mobile" ? "reduce" : "no-preference",
  });
  try {
    const administrative = await administrativeContext.newPage();
    await administrative.goto(administrativeLink);
    await administrative
      .getByLabel("Crie uma senha", { exact: true })
      .fill("synthetic-administrative-password");
    await administrative
      .getByRole("button", { name: "Criar conta e entrar", exact: true })
      .click();
    await expect(
      administrative.getByRole("heading", {
        name: "Proteja o acesso administrativo",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      administrative.getByRole("button", {
        name: "Aceitar convite",
        exact: true,
      }),
    ).toHaveCount(0);
    await capture(administrative, "mfa-required");
    await administrative
      .getByRole("button", { name: "Configurar aplicativo", exact: true })
      .click();
    await administrative
      .getByLabel("Confirme sua senha", { exact: true })
      .fill("synthetic-administrative-password");
    const setupResponse = administrative.waitForResponse(
      (response) =>
        response.url().endsWith("/api/auth/two-factor/enable") &&
        response.status() === 200,
    );
    await administrative
      .getByRole("button", { name: "Continuar", exact: true })
      .click();
    const { totpURI } = await (await setupResponse).json();
    await administrative
      .getByRole("button", { name: "Já adicionei ao aplicativo", exact: true })
      .click();
    await administrative
      .getByLabel("Código do aplicativo", { exact: true })
      .fill(totp(totpURI));
    await administrative
      .getByRole("button", { name: "Verificar código", exact: true })
      .click();
    await administrative
      .getByRole("button", { name: "Aceitar convite", exact: true })
      .click();
    await expect(
      administrative.getByRole("heading", {
        name: "Convite aceito",
        exact: true,
      }),
    ).toBeVisible();
    await administrative
      .getByRole("link", { name: "Abrir minha conta", exact: true })
      .click();
    await expect(administrative).toHaveURL(/\/account$/);
    await menu(administrative);
    await expect(
      administrative.getByRole("link", { name: "Profissionais", exact: true }),
    ).toBeVisible();
  } finally {
    await administrativeContext.close();
  }
});
