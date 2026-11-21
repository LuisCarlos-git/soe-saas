import { describe, expect, it } from "vitest";
import { renderSchoolInvitationEmail } from "./index";

const invitation = {
  recipientName: "Ana Oliveira",
  schoolName: "Escola Horizonte",
  acceptUrl: "http://localhost:43120/invitations/accept#synthetic-preview-only",
  expiresAtLabel: "24/11/2026 às 15:00 (horário da escola)",
  roleLabels: ["Professor", "Tutor"],
};

describe("e-mail de convite escolar", () => {
  it("gera HTML e texto com a mesma ação, escola, papéis e validade", async () => {
    const email = await renderSchoolInvitationEmail(invitation);
    expect(email.subject).toBe("Convite para Escola Horizonte");
    for (const content of [email.html, email.text]) {
      for (const value of [
        invitation.recipientName,
        invitation.schoolName,
        invitation.acceptUrl,
        invitation.expiresAtLabel,
        "Professor, Tutor",
        "uso único",
      ])
        expect(content).toContain(value);
    }
    expect(email.html).toContain('lang="pt-BR"');
    expect(email.text).not.toMatch(/<(?:html|table|style|a)\b/i);
    expect(email.html).not.toMatch(/<script\b/i);
  });

  it("escapa dados do remetente e remove quebras no assunto", async () => {
    const email = await renderSchoolInvitationEmail({
      ...invitation,
      recipientName: '<script>alert("x")</script>',
      schoolName: "Escola\r\nBcc: outra",
    });
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.subject).not.toMatch(/[\r\n]/);
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,convite",
    "https://user:secret@example.test/convite",
    "/convite",
  ])("recusa URL inadequada: %s", async (acceptUrl) => {
    await expect(
      renderSchoolInvitationEmail({ ...invitation, acceptUrl }),
    ).rejects.toThrow();
  });
});
