import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("campos conectados validam, enviam tipos corretos e restauram valores", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const form = page.getByRole("form", {
    name: "Formulário editável",
    exact: true,
  });
  const disabled = page.getByRole("form", {
    name: "Formulário desabilitado",
    exact: true,
  });
  await form.getByRole("button", { name: "Salvar exemplo" }).click();
  for (const message of [
    "Informe o título.",
    "Informe a observação.",
    "Confirme a leitura.",
    "Escolha a categoria.",
    "Escolha a unidade.",
    "Escolha o período.",
  ]) {
    await expect(form.getByText(message, { exact: true })).toBeVisible();
  }
  const note = form.getByLabel("Observação", { exact: true });
  await expect(note).toHaveAttribute("aria-invalid", "true");
  const description = await note.getAttribute("aria-describedby");
  expect(description?.split(" ")).toHaveLength(2);
  await expect(note).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await form.getByLabel("Título", { exact: true }).fill("Título sintético");
  await note.fill("Primeira linha\nSegunda linha");
  await expect(
    form.getByText("Informe a observação.", { exact: true }),
  ).toBeHidden();
  const checkbox = form.getByRole("checkbox", { name: "Confirmo a leitura" });
  await checkbox.focus();
  await page.keyboard.press("Space");
  await expect(checkbox).toBeChecked();
  await expect(
    form.getByText("Confirme a leitura.", { exact: true }),
  ).toBeHidden();
  const toggle = form.getByRole("switch", { name: "Receber avisos" });
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toBeChecked();
  await form.getByRole("combobox", { name: "Categoria", exact: true }).click();
  await expect(
    page.getByRole("option", { name: "Indisponível" }),
  ).toBeDisabled();
  await page.getByRole("option", { name: "Categoria A", exact: true }).click();
  await form
    .getByRole("combobox", { name: "Unidade", exact: true })
    .selectOption("central");
  await form.getByRole("radio", { name: "Manhã", exact: true }).check();
  const amount = form.getByRole("spinbutton", { name: "Quantidade" });
  await expect(amount).toHaveValue("0");
  await amount.clear();
  await expect(
    form.getByText("Informe a quantidade.", { exact: true }),
  ).toBeVisible();
  await amount.fill("0");
  await expect(
    form.getByText("Informe a quantidade.", { exact: true }),
  ).toBeHidden();
  await form.getByRole("button", { name: "Salvar exemplo" }).click();
  const output = form.getByRole("status", { name: "Valores enviados" });
  await expect(output).toContainText('"title":"Título sintético"');
  expect(JSON.parse(await output.innerText())).toEqual({
    title: "Título sintético",
    note: "Primeira linha\nSegunda linha",
    confirmed: true,
    notifications: true,
    category: "a",
    unit: "central",
    period: "morning",
    amount: 0,
  });
  await expect(disabled.getByLabel("Título", { exact: true })).toHaveValue("");
  await expect(disabled.getByRole("checkbox")).not.toBeChecked();
  await form.getByRole("button", { name: "Restaurar" }).click();
  await expect(note).toHaveValue("");
  await expect(checkbox).not.toBeChecked();
  await expect(toggle).not.toBeChecked();
  await expect(amount).toHaveValue("0");
  await expect(
    form.getByRole("combobox", { name: "Categoria", exact: true }),
  ).toHaveText("Selecione");
  await expect(
    form.getByRole("combobox", { name: "Unidade", exact: true }),
  ).toHaveValue("");
  await expect(form.getByRole("radio", { name: "Manhã" })).not.toBeChecked();
  expect(errors).toEqual([]);
});

test("labels, foco, seleção por teclado, disabled e acessibilidade", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const form = page.getByRole("form", {
    name: "Formulário editável",
    exact: true,
  });
  const disabled = page.getByRole("form", {
    name: "Formulário desabilitado",
    exact: true,
  });
  for (const label of ["Título", "Observação", "Quantidade"])
    await expect(disabled.getByLabel(label, { exact: true })).toBeDisabled();
  for (const role of [
    "checkbox",
    "switch",
    "combobox",
    "radio",
    "button",
  ] as const) {
    for (const control of await disabled.getByRole(role).all())
      await expect(control).toBeDisabled();
  }
  const select = form.getByRole("combobox", { name: "Categoria", exact: true });
  await select.focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toBeHidden();
  await expect(select).toBeFocused();
  const morning = form.getByRole("radio", { name: "Manhã" });
  await morning.focus();
  await page.keyboard.down("ArrowDown");
  await expect(form.getByRole("radio", { name: "Tarde" })).toBeChecked();
  await page.keyboard.up("ArrowDown");
  const ids = await page
    .locator("[id]")
    .evaluateAll((elements) => elements.map((element) => element.id));
  expect(new Set(ids).size).toBe(ids.length);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(form.getByLabel("Observação", { exact: true })).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  await page.screenshot({
    path: testInfo.outputPath("form-controls.png"),
    fullPage: true,
  });
});
