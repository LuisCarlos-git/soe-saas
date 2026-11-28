# Revisão da issue 6

Base fixa: `d86641918c57f1725e6a753176b314e040c9a6e7` (`main`).
Fonte final revisada: `4c71d123160f55bbb73cc80cbd7a04eeca6f87cb`.
Comparação: `git diff d86641918c57f1725e6a753176b314e040c9a6e7...HEAD`.
Agentes independentes revisaram Standards e Spec, com novo checkpoint após a
correção `803cf51..4c71d12`. Este relatório e as evidências são adições documentais
posteriores à fonte revisada.

## Standards

Uma violação material corrigida: a busca por nome/e-mail aparecia na URL da API,
contrariando PRD RF08 e seção 7.6. As duas listas agora usam POST com filtros no
corpo; GET rejeita `search`; os formulários usam `method="post"` para impedir
fallback GET antes da hidratação. O reteste preserva autenticação, isolamento,
paginação, ordenação, credencial SSR e cancelamento. Revisão final sem violação
material remanescente.

Uma heurística não bloqueante de possível Duplicated Code permanece: as duas
tabelas repetem composição de cabeçalho ordenável e paginação. Avaliar primitivas
visuais compartilhadas quando houver nova alteração nesses comportamentos;
regras escolares continuam nos módulos consumidores.

Fontes: AGENTS.md, PRD, DESIGN.md, ADR 0002/0003, guias de arquitetura, UI e
formulários, runbooks e protocolo QA. Ferramentas cobrem lint, tipos e imports;
a revisão humana não repete esses achados.

## Spec

Nenhuma divergência material ou ampliação não autorizada encontrada. A revisão
confirmou aceite com conta correspondente, MFA administrativo, revalidação de
autorização do emissor e transação serializável para consumo, vínculo e auditoria.
Papéis ficam na escola convidante. Refinamentos de diretório, tabelas, modais,
e-mails e controles foram pedidos pelo usuário.

Uma pendência de entrega permanece: QA pela extensão Chrome e GIFs. As ferramentas
da sessão não expõem a extensão; Playwright é evidência complementar. Manter o
PR em rascunho e a issue aberta, sem declarar esse gate aprovado.

Fontes: issue 6 e especificação principal, `docs/specs/core-piloto.md`, PRD,
decisões de produto e solicitações de interface da conversa.

Standards: 1 violação corrigida, 0 material restante, 1 heurística não bloqueante.
Spec: 0 divergências materiais, 1 pendência de QA nativo.

Checks e capturas: [relatório de QA](../qa/issue-6/2026-11-22-pr-review/report.md).

## Revisão adicional — layout dos convites

Base incremental `1cfad2e`, fonte final `d0c766b`. Novos agentes independentes
revisaram a repaginação solicitada e a cobertura responsiva. Standards apontou
um padding fora da escala aprovada, corrigido de 20 para 16 px e revalidado.
Spec não encontrou divergências funcionais ou ampliação de escopo. A captura
antiga de 320 px foi substituída por captura da compilação final, mantendo a
reprodução do corte dos botões como evidência intermediária.

Standards: 1 apontamento menor corrigido, 0 pendências. Spec: 0 achados de
implementação; QA nativo continua pendente. [Logs, capturas e reteste](../qa/issue-6/2026-11-22-invitation-layout/report.md).
