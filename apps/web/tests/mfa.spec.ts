import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createHmac } from "node:crypto";
// Independent RFC 6238 implementation: never read a secret from persistence.
function totp(uri: string) {
  const secret = new URL(uri).searchParams.get("secret")!;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bits = [...secret.replace(/=+$/, "")]
    .map((c) => alphabet.indexOf(c).toString(2).padStart(5, "0"))
    .join("");
  const key = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const digest = createHmac("sha1", key).update(counter).digest();
  const offset = digest[19] & 15;
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000).padStart(
    6,
    "0",
  );
}

test("configurar aplicativo, rejeitar código inválido e entrar com MFA", async ({
  page,
}) => {
  // Each viewport owns a different identity, so enrollment does not collide.
  const email =
    test.info().project.name === "mobile"
      ? "mfa-bia@example.test"
      : "mfa-ana@example.test";
  await page.goto("/login");
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill("12345678");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Proteção em duas etapas" }),
  ).toBeVisible();
  const denied = await page.request.get("/api/v1/administration");
  expect(denied.status()).toBe(403);
  await page.getByRole("button", { name: "Configurar aplicativo" }).click();
  await expect(
    page.getByText("Confirme sua senha para configurar o aplicativo."),
  ).toBeVisible();
  await page.getByLabel("Confirme sua senha").fill("12345678");
  await page.getByRole("button", { name: "Configurar aplicativo" }).click();
  const secret = await page.locator("code").innerText();
  const uri = `otpauth://totp/SOE?secret=${secret}`;
  const code = totp(uri);
  await page
    .getByLabel("Código do aplicativo")
    .fill(code === "000000" ? "000001" : "000000");
  await page.getByRole("button", { name: "Verificar código" }).click();
  await expect(
    page.locator("[data-sonner-toast]").filter({ hasText: "Código inválido" }),
  ).toBeVisible();
  expect((await page.request.get("/api/v1/administration")).status()).toBe(403);
  await page.getByLabel("Código do aplicativo").fill(totp(uri));
  await page.getByRole("button", { name: "Verificar código" }).click();
  await expect(page.getByText("Proteção ativa nesta sessão.")).toBeVisible();
  await expect(page.locator("code")).toHaveCount(0);
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill("12345678");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByLabel("Código do aplicativo")).toBeFocused();
  expect((await page.request.get("/api/v1/identity/session")).status()).toBe(
    401,
  );
  const loginCode = totp(uri);
  await page
    .getByLabel("Código do aplicativo")
    .fill(loginCode === "000000" ? "000001" : "000000");
  await page.getByRole("button", { name: "Verificar código" }).click();
  await expect(
    page.locator("[data-sonner-toast]").filter({ hasText: "Código inválido" }),
  ).toBeVisible();
  expect((await page.request.get("/api/v1/identity/session")).status()).toBe(
    401,
  );
  await page.screenshot({
    path: `test-results/mfa-${test.info().project.name}.png`,
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByLabel("Código do aplicativo").fill(totp(uri));
  await page.getByRole("button", { name: "Verificar código" }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByText("Proteção ativa nesta sessão.")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage }),
    ),
  ).toBe("{}");
  expect(await (await page.request.get("/account")).text()).not.toContain(
    secret,
  );
});
