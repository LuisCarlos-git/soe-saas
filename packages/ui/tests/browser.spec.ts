import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("loading troca texto por spinner sem mudar tamanho; erros entram e saem acessíveis", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const button = page.getByRole("button", {
    name: "Salvar exemplo",
    exact: true,
  });
  const before = await button.boundingBox();
  const originalLabel = await button.locator(".soe-button-label").boundingBox();
  await button.click();
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute("aria-busy", "true");
  const label = button.locator(".soe-button-label");
  const spinner = button
    .locator("[aria-hidden=true]")
    .filter({ has: page.locator("[data-loading-spinner]") });
  await expect(label).toHaveCSS("opacity", "0");
  await expect(spinner).toHaveCSS("opacity", "1");
  const icon = await spinner.boundingBox();
  expect(icon).not.toBeNull();
  expect(originalLabel).not.toBeNull();
  if (icon && originalLabel)
    expect(icon.y + icon.height / 2).toBeCloseTo(
      originalLabel.y + originalLabel.height / 2,
      0,
    );
  const after = await button.boundingBox();
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);
  const reduced = await page.evaluate(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  if (reduced) await expect(label).toHaveCSS("transition-duration", "0s");
  const finish = page.getByRole("button", { name: "Finalizar exemplo" });
  await expect(finish).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await finish.click();
  await expect(finish).toHaveCSS("background-color", "rgb(204, 251, 241)");
  await expect(finish).toHaveCSS("color", "rgb(17, 94, 89)");
  await expect(label).toHaveCSS("opacity", "1");
  await expect(button).toBeEnabled();
  const input = page.getByLabel("Nome de demonstração", { exact: true });
  await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await input.focus();
  await input.blur();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  const error = page.locator("[data-slot=field-error]");
  await expect(error).toHaveText("Informe um nome.");
  await expect(error).toHaveCSS("opacity", "1");
  await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
  expect(await input.getAttribute("aria-describedby")).toContain(
    await error.getAttribute("id"),
  );
  await input.fill("Exemplo");
  await expect(input).not.toHaveAttribute("aria-invalid", "true");
  await expect(error).toHaveCSS("visibility", "hidden");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: `../../test-results/ui/controls-${test.info().project.name}.png`,
    fullPage: true,
  });
});

test("componentes shadcn preservam teclado, foco e presença durante entrada e saída", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Abrir diálogo" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const reduced = await page.evaluate(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  if (!reduced)
    await expect(dialog).toHaveCSS("animation-name", "soe-modal-enter");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Detalhes do componente" }).click();
  await expect(page.getByText("Conteúdo do accordion.")).toBeVisible();
  await page.getByRole("tab", { name: "Segunda aba" }).click();
  await expect(page.getByRole("tabpanel")).toHaveText("Segundo painel.");
  await page.getByRole("switch").click();
  await expect(page.getByRole("switch")).toBeChecked();
  await page.getByRole("checkbox").click();
  await expect(page.getByRole("checkbox")).toBeChecked();
  await page.getByRole("button", { name: "Abrir painel" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.getByRole("button", { name: "Navegação de teste" }).click();
  await expect(
    page.getByRole("link", { name: "Destino de teste" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Destino de teste" }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Abrir comandos" }).click();
  await expect(
    page.getByRole("dialog", { name: "Comandos de teste" }),
  ).toBeVisible();
  if (!reduced)
    await expect(
      page.getByRole("dialog", { name: "Comandos de teste" }),
    ).toHaveCSS("animation-name", "soe-modal-enter");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(errors).toEqual([]);
});
