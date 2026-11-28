# QA complementar — dispensa local de MFA e tags

Fonte: `334bf9c80b12746fd7c91ae6839a413ce2278e99`.
Base: `b00f319f400096dd0e3f423d186b6d58d62b6c4a`. Execução em 22/11/2026.
Issue 4: opção explicitamente solicitada para desenvolvimento; issue 6: cores e
convite expirado sintético. Ambiente real local e PostgreSQL temporário nos
testes, sem dados escolares reais. [Manifesto](manifest.json).

## Entrega e comportamento

`DEV_MFA_BYPASS=true` está ativo somente no `.env` local ignorado pelo Git.
O exemplo versionado mantém false. A configuração rejeita a dispensa em test,
production, API externa, origem externa e banco remoto. Senha, origem, rate
limiting, sessões e autorização permanecem exigidos. Apenas o desafio após login
por senha e o pré-requisito efetivo de MFA são dispensados na composição local.
Não são alterados segredos, `twoFactorEnabled` ou `mfaVerified` persistidos.

O teste verifica o usuário já inscrito em MFA, senha errada, origem externa,
sessão ausente, lista autorizada vazia e negação da administração sem papel.
Reutilizar a sessão no servidor sem dispensa volta a exigir MFA; novo login
também volta a gerar o desafio. A opção é informada em Configurações → Segurança.

O convite “Convite expirado — teste visual”, `convite.expirado@example.test`, foi
criado transacionalmente na Escola de teste da Ana (`ana@example.test`), com
papel Professor, expiração anterior ao momento da criação da fixture e evento
`DEV_EXPIRED_INVITATION_FIXTURE` na auditoria escolar. Datas respeitam a ordem
createdAt < expiresAt < now. Nenhum e-mail foi enfileirado ou enviado; o estado
de entrega FAILED é sintético. A captura mostra somente esse registro filtrado.

## Checks e falhas preservadas

| Verificação                                                      | Resultado                   | Evidência                                                |
| ---------------------------------------------------------------- | --------------------------- | -------------------------------------------------------- |
| Unitários, incluindo guards e parse idempotente                  | 35 passaram                 | [log](unit.log)                                          |
| HTTP/PostgreSQL, MFA real e dispensa/reversão                    | 33 passaram, 6 suites       | [log](integration-final.log)                             |
| MFA real e Configurações, dispensa desligada                     | 4 passaram, desktop/celular | [log](browser-final.log)                                 |
| Jornadas de convite, tags e tooltips                             | 2 passaram, desktop/celular | [log](status-browser.log)                                |
| Login da Ana no servidor local sem MFA, aviso e convite expirado | passou                      | [log](live-check.log) · [estado seguro](live-check.json) |
| API/web build, tipos, lint, arquitetura, bundle e formato        | passaram                    | logs nomeados neste diretório                            |

Primeira integração: o teste antigo contava auditorias de todos os usuários e
incluiu a nova fixture; foi isolado pelo usuário de cada cenário antes do reteste.
[Falha original](integration-initial-audit-fixture.log).

Primeiro navegador: a API real faz parse da configuração duas vezes; a flag
transformada em boolean foi rejeitada na segunda leitura. O schema passou a
aceitar o resultado interno boolean, preservando validação estrita dos valores
externos, e o teste unitário cobre idempotência. [Falha](browser-initial-config.log)
e [reteste](browser-final.log).

Na automação contra o dev server, o preenchimento anterior à hidratação do
formulário foi descartado. A captura final aguardou a validação cliente de um
envio vazio antes de preencher. Os testes E2E acima usam o build da aplicação.

## Cores e contraste

| Tag      | Fundo     | Texto  | Contraste |
| -------- | --------- | ------ | --------- |
| Ativo    | `#166534` | branco | 7,13:1    |
| Pendente | `#856300` | branco | 5,55:1    |
| Expirado | `#B91C1C` | branco | 6,47:1    |

Cálculo de luminância relativa WCAG: [resultados](status-contrast.json).
Os três excedem 4,5:1. O browser confirma vermelho/branco computados no Expirado;
texto, ícones existentes e tooltips continuam identificando os estados além da cor.

## Capturas revisadas

- Dispensa informada: [desktop](development-mfa-desktop.png) · [celular](development-mfa-mobile.png).
- Convite expirado na Ana: [desktop](expired-invitation-desktop.png) · [celular](expired-invitation-mobile.png).
- Tags na jornada: [Pendente](invitation-pending-tooltip-desktop.png) · [Ativo](invitation-active-tooltip-mobile.png).

Revisões independentes Standards e Spec: 0 achados em ambos os eixos.
Extensão Chrome e GIF continuam indisponíveis; estas evidências Playwright são
complementares e o gate nativo permanece PENDENTE. PR 46 continua draft; nenhuma
issue foi encerrada e nenhum merge foi executado.
