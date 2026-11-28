import { expect, test } from "@playwright/test";
test.use({ trace: "off" });
import jsQR from "jsqr";
import type { Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { totp } from "../../../scripts/test-totp.mjs";

async function readQr(qr: Locator) {
  const pixels = await qr.evaluate(async (svg) => {
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 416;
    const context = canvas.getContext("2d")!;
    context.drawImage(image, 0, 0, 416, 416);
    return Array.from(context.getImageData(0, 0, 416, 416).data);
  });
  const decoded = jsQR(new Uint8ClampedArray(pixels), 416, 416);
  expect(decoded).not.toBeNull();
  return decoded!.data;
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
  await expect(page).toHaveURL(/\/account$/);
  await page.goto("/settings/security");
  await expect(
    page.getByRole("heading", { name: "Proteção em duas etapas" }),
  ).toBeVisible();
  const denied = await page.request.get("/api/v1/administration");
  expect(denied.status()).toBe(403);
  const configure = page.getByRole("button", { name: "Configurar aplicativo" });
  await configure.click();
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  await expect(modal.getByLabel("Confirme sua senha")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  await expect(configure).toBeFocused();
  await configure.click();
  await modal.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(
    modal.getByText("Confirme sua senha para configurar o aplicativo."),
  ).toBeVisible();
  await modal.getByLabel("Confirme sua senha").fill("12345678");
  await modal.getByRole("button", { name: "Continuar", exact: true }).click();
  const qr = modal.getByRole("img", {
    name: "QR code para configurar SOe no aplicativo autenticador",
  });
  await expect(qr).toBeVisible();
  await expect(modal.locator("[data-slot=step-flow-content]")).toHaveAttribute(
    "data-step",
    "scan",
  );
  await expect(modal.getByLabel("Confirme sua senha")).toHaveCount(0);
  const firstUri = await readQr(qr);
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  await expect(
    page.getByRole("img", { name: /QR code para configurar/ }),
  ).toHaveCount(0);
  await expect(configure).toBeFocused();
  await configure.click();
  await expect(modal.getByLabel("Confirme sua senha")).toHaveValue("");
  await expect(qr).toHaveCount(0);
  await modal.getByLabel("Confirme sua senha").fill("12345678");
  await modal.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(qr).toBeVisible();
  const uri = await readQr(qr);
  expect(uri).not.toBe(firstUri);
  expect(new URL(uri).searchParams.get("issuer")).toBe("SOe");
  const secret = new URL(uri).searchParams.get("secret")!;
  await modal.getByText("Não consegue escanear?", { exact: true }).click();
  await expect(modal.locator("code")).toHaveText(secret);
  await modal.getByText("Não consegue escanear?", { exact: true }).click();
  await expect(
    modal.getByRole("button", { name: "Já adicionei ao aplicativo" }),
  ).toBeInViewport({ ratio: 1 });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: `test-results/mfa-setup-modal-${test.info().project.name}.png`,
    fullPage: true,
    animations: "disabled",
    mask: [qr, modal.locator("code")],
  });
  await modal
    .getByRole("button", { name: "Já adicionei ao aplicativo" })
    .click();
  await expect(modal.getByLabel("Código do aplicativo")).toBeFocused();
  await expect(qr).toHaveCount(0);
  await page.screenshot({
    path: `test-results/mfa-actions-back-${test.info().project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await modal.getByRole("button", { name: "Voltar ao QR code" }).click();
  const animatedStep = modal.locator("[data-slot=step-flow-content]");
  await expect(animatedStep).toHaveAttribute("data-direction", "back");
  const reduced = await page.evaluate(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  await expect(animatedStep).toHaveCSS(
    "animation-name",
    reduced ? "none" : "soe-step-back",
  );
  await expect(qr).toBeVisible();
  await modal
    .getByRole("button", { name: "Já adicionei ao aplicativo" })
    .click();
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
  await expect(modal).toBeHidden();
  await expect(page.getByText("Proteção ativa nesta sessão.")).toBeVisible();
  await expect(page.locator("code")).toHaveCount(0);
  if (test.info().project.name === "mobile")
    await page.getByRole("button", { name: "Abrir menu de navegação" }).click();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill("12345678");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(modal).toBeVisible();
  await expect(modal).toHaveAccessibleName("Verifique seu acesso");
  await expect(page.getByLabel("Código do aplicativo")).toBeFocused();
  await page.screenshot({
    path: `test-results/mfa-actions-cancel-${test.info().project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  await expect(page.getByLabel("E-mail", { exact: true })).toBeFocused();
  expect((await page.request.get("/api/v1/identity/session")).status()).toBe(
    401,
  );
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill("12345678");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(modal).toBeVisible();
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
  await page.goto("/settings/security");
  await expect(page.getByText("Proteção ativa nesta sessão.")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const storage = await page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage },
  }));
  expect(storage.local).toEqual({});
  expect(
    Object.keys(storage.session).every((key) =>
      key.startsWith("tsr-scroll-restoration-"),
    ),
  ).toBe(true);
  expect(JSON.stringify(storage)).not.toContain(secret);
  expect(JSON.stringify(storage)).not.toMatch(
    /12345678|session_token|AUTH_SECRET/,
  );
  expect(await (await page.request.get("/account")).text()).not.toContain(
    secret,
  );
});
