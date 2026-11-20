# Provisionamento de escola piloto

Entrega sintética da [issue #5](https://github.com/LuisCarlos-git/soe-saas/issues/5).
Uma organização representa uma escola. Identidades são globais; vínculos e
configurações são independentes por escola, inclusive sob uma mantenedora comum.

## Demonstração local

Execute as migrations e `pnpm dev:seed` no ambiente de desenvolvimento local já
configurado. O seed cria a identidade sintética `operator@example.test` com senha
`12345678` e autoridade explícita em `saas_operator`. Ana e Bia continuam sem
essa autoridade. O seed não remove MFA existente nem reativa operadores revogados.
Os entrypoints de seed recusam bancos de produção.

1. Entre como operador e configure/verifique MFA em Configurações → Segurança.
2. Abra Configurações → Escolas → Nova escola.
3. Informe nome, fuso, ano letivo, nomenclaturas e e-mail de uma identidade já
   cadastrada, por exemplo `ana@example.test`. O vínculo inicial é de administração
   cadastral, sem concessão de leitura restrita.
4. Confirme “Criar escola piloto”. Não há pagamento ou contratação.
5. Entre como responsável, configure/verifique seu próprio MFA e abra
   Configurações → Escolas → Configurar. Altere e salve as configurações.
6. Para demonstrar isolamento, crie outra escola para `bia@example.test`.
   Ana não recebe vínculo nessa escola; o operador também não recebe vínculo
   automaticamente em nenhuma delas.

Convites, cadastro de novas identidades e atribuição geral de papéis pertencem à
issue #6. Nesta entrega, um e-mail sem identidade cadastrada impede a criação
inteira; nenhum vínculo ou escola parcial é gravado.

## Fronteira HTTP

| Método e caminho                                 | Autorização                                       | Resultado                                                              |
| ------------------------------------------------ | ------------------------------------------------- | ---------------------------------------------------------------------- |
| `GET /api/v1/identity/school-access`             | Sessão autenticada                                | Autoridade operacional e escolas administradas pela própria identidade |
| `GET /api/v1/administration/schools?offset=0`    | Operador ativo + MFA da sessão                    | Metadados de provisionamento, 20 por página e `hasMore`                |
| `POST /api/v1/administration/schools`            | Operador ativo + MFA + Origin confiável           | Escola, administrador inicial e auditoria em uma transação             |
| `GET /api/v1/schools/:organizationId/settings`   | Vínculo ativo de administrador nessa escola + MFA | Configurações dessa escola                                             |
| `PATCH /api/v1/schools/:organizationId/settings` | Mesmo vínculo + MFA + Origin confiável            | Configurações e auditoria atualizadas atomicamente                     |

Os contratos Zod e o OpenAPI são gerados junto ao build da API. Entradas recusam
campos adicionais: o cliente não escolhe papéis, ator, estado do piloto ou
organização por um campo confiado no body. O ID da URL é validado contra o vínculo
persistido. Recurso inexistente ou de outra escola retorna o mesmo `404`.

O PATCH exige a `version` lida. Edição desatualizada ou conflito serializável
retorna `409`; o formulário preserva os valores e oferece recarregamento explícito.
Fuso usa um identificador IANA validado; a interface oferece os quatro fusos
brasileiros e preserva outros identificadores válidos que já estejam configurados.
As nomenclaturas ficam persistidas para os próximos consumidores escolares.

## Auditoria e limites operacionais

`SCHOOL_PROVISIONED` registra a configuração inicial e o responsável; a criação
do vínculo pertence à mesma transação. `SCHOOL_SETTINGS_UPDATED` registra a
configuração confirmada e sua versão. Os eventos guardam organização, ator,
instante e projeção da configuração. Falha na escrita da auditoria desfaz a
operação. Não há endpoint de leitura de auditoria nesta fatia; a autorização
específica dessa consulta pertence à issue #38.

A autoridade do operador só permite provisionamento e leitura dos metadados
administrativos dessa operação. Ela não substitui um vínculo escolar nem concede
conteúdo, concessões restritas ou acesso de suporte. Não há endpoint para alguém
se promover a operador. O seed serve exclusivamente à demonstração sintética;
um procedimento controlado de concessão/revogação de operadores deve ser aprovado
antes de um piloto real.

Todas as escolas desta entrega mantêm `pilotStatus = SYNTHETIC_ONLY`, protegido
também por constraint no PostgreSQL. Criar a escola não cumpre aprovações de
tratamento/retenção/suporte, matriz de acesso, restauração de backup, validação
escolar ou qualquer outra condição para inserir dados reais.
