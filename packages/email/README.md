# @soe/email

Templates transacionais React Email e renderização de HTML/texto simples.
O primeiro consumidor é o envio de convites escolares na API. O pacote não
conhece banco, autenticação, fila, SMTP, contratos HTTP ou módulos escolares.
Recebe somente os dados da mensagem; a API gera o link e decide quando enviar.

Use `renderSchoolInvitationEmail` pela raiz do pacote. Componentes e tipos do
template também são exportados para pré-visualização controlada. O renderer
segue a API unificada do React Email 6.11.16, com React 19.2.8. Tailwind do React
Email converte os estilos para clientes de e-mail; a identidade e as cores
acompanham DESIGN.md. Não há import de @soe/ui nem de CSS da aplicação.

A saída contém um link de convite secreto destinado ao e-mail: não registrar
HTML/texto em logs, expor em respostas da API ou incluir no bundle público web.
O envio usa a fila transacional e o SMTP de desenvolvimento da API; não há
contratação ou configuração de um provedor externo neste pacote.

```ts
import { renderSchoolInvitationEmail } from "@soe/email";

const message = await renderSchoolInvitationEmail({
  recipientName: "Ana Oliveira",
  schoolName: "Escola Horizonte",
  acceptUrl: "http://localhost:43120/invitations/accept#synthetic-preview-only",
  expiresAtLabel: "24/11/2026 às 15:00 (horário da escola)",
  roleLabels: ["Professor"],
});
// message.subject, message.html e message.text são entregues ao transporte.
```

Datas e rótulos de papéis chegam prontos do consumidor, que conhece o fuso
da escola e as regras do domínio. Os dados textuais são escapados pelo React;
o renderer aceita somente links absolutos HTTP(S), sem credenciais na URL.
Não existe valor padrão de token nem geração de credenciais no template.

Validação: `pnpm --filter @soe/email build`,
`pnpm --filter @soe/email typecheck` e
`pnpm exec vitest run packages/email/src/email.test.ts`.
O teste HTTP `apps/api/tests/invitations.test.mjs` usa PostgreSQL e Mailpit
reais para verificar a entrega. As regras arquiteturais impedem consumo no
web, imports internos e dependências do pacote em código da aplicação.
Pré-visualização no Chromium não certifica compatibilidade com todos os
clientes de e-mail; Gmail e Outlook ainda precisam de validação própria.

Referências: [Render](https://react.email/docs/utilities/render),
[Tailwind](https://react.email/docs/components/tailwind) e
[Button](https://react.email/docs/components/button).
