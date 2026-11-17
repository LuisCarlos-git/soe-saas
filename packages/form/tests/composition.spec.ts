import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/composition.html");
});

for (const { label, message, validValue } of [
  {
    label: "Título",
    message: "Informe o título.",
    validValue: "Título sintético",
  },
  {
    label: "Observação",
    message: "Informe a observação.",
    validValue: "Observação sintética",
  },
]) {
  test(`withForm liga blur e change aos erros acessíveis de ${label}`, async ({
    page,
  }) => {
    const field = page.getByLabel(label, { exact: true });
    const error = page.getByText(message, { exact: true });
    await field.focus();
    await expect(error).toBeHidden();
    await field.press("Tab");
    await expect(error).toBeVisible();
    await expect(field).toHaveAttribute("aria-invalid", "true");
    await expect(field).toHaveAccessibleDescription(message);
    await field.fill(validValue);
    await expect(error).toBeHidden();
    await expect(field).not.toHaveAttribute("aria-invalid", "true");
    await field.clear();
    await expect(error).toBeVisible();
    await expect(error).toHaveCount(1);
    await expect(field).toHaveAccessibleDescription(message);
    await expect(error).toHaveCSS("opacity", "1");
    await expect(
      page.getByRole("status", { name: "Envios iniciados" }),
    ).toHaveText("0");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}

for (const title of ["", "Título sintético"]) {
  test(`submit revela campo intocado e impede envio inválido (título: ${title || "vazio"})`, async ({
    page,
  }) => {
    if (title) await page.getByLabel("Título", { exact: true }).fill(title);
    const note = page.getByLabel("Observação", { exact: true });
    await expect(
      page.getByText("Informe a observação.", { exact: true }),
    ).toBeHidden();
    await page
      .getByRole("button", { name: "Salvar exemplo", exact: true })
      .click();
    await expect(
      page.getByText("Informe a observação.", { exact: true }),
    ).toBeVisible();
    await expect(note).toHaveAttribute("aria-invalid", "true");
    await expect(note).toHaveAccessibleDescription("Informe a observação.");
    await expect(
      page.getByRole("status", { name: "Envios iniciados" }),
    ).toHaveText("0");
    await expect(
      page.getByRole("status", { name: "Estado do envio" }),
    ).toHaveText("Pronto");
    await expect(page).toHaveURL(/\/composition.html$/);
  });
}

test("AppForm compartilha contexto público e SubmitButton acompanha a promessa do consumidor", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.getByLabel("Título", { exact: true }).fill("Título sintético");
  await page
    .getByLabel("Observação", { exact: true })
    .fill("Observação sintética");
  const submit = page.getByRole("button", {
    name: "Salvar exemplo",
    exact: true,
  });
  const before = await submit.boundingBox();
  await submit.click();
  await expect(submit).toBeDisabled();
  await expect(submit).toHaveAttribute("aria-busy", "true");
  await expect(
    page.getByRole("status", { name: "Estado do envio" }),
  ).toHaveText("Enviando");
  await expect(
    page.getByRole("status", { name: "Envios iniciados" }),
  ).toHaveText("1");
  const during = await submit.boundingBox();
  expect(during?.width).toBe(before?.width);
  expect(during?.height).toBe(before?.height);
  await page.getByLabel("Observação", { exact: true }).press("Enter");
  await expect(
    page.getByRole("status", { name: "Envios iniciados" }),
  ).toHaveText("1");
  await page
    .getByRole("button", { name: "Concluir envio", exact: true })
    .click();
  await expect(submit).toBeEnabled();
  await expect(submit).not.toHaveAttribute("aria-busy", "true");
  await expect(
    page.getByRole("status", { name: "Estado do envio" }),
  ).toHaveText("Pronto");
  await expect(
    page.getByRole("status", { name: "Valores enviados" }),
  ).toHaveText(
    JSON.stringify({
      title: "Título sintético",
      note: "Observação sintética",
    }),
  );
  await expect(
    page.getByRole("status", { name: "Envios iniciados" }),
  ).toHaveText("1");
  expect(errors).toEqual([]);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath("form-composition.png"),
    fullPage: true,
  });
});
