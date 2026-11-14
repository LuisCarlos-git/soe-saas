import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("página SSR verifica dados sintéticos, informa falha e recupera após nova tentativa", async ({
  page,
  request,
  context,
}) => {
  const response = await request.get("/");
  expect(await response.text()).toContain(
    "SOE: ambiente de desenvolvimento validado.",
  );
  await page.goto("/");
  const verify = page.getByRole("button", { name: "Verificar novamente" });
  await expect(verify).toHaveCSS("background-color", "rgb(15, 118, 110)");
  expect((await verify.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await expect(
    page.getByText("Conexão verificada", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Verificar novamente" }).click();
  await expect(
    page.getByText("Conexão verificada", { exact: true }),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await context.setOffline(true);
  await page.getByRole("button", { name: "Verificar novamente" }).click();
  await expect(
    page.getByText("Não foi possível verificar a conexão", { exact: true }),
  ).toBeVisible();
  await context.setOffline(false);
  await page.getByRole("button", { name: "Verificar novamente" }).click();
  await expect(
    page.getByText("Conexão verificada", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/environment-${test.info().project.name}.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
