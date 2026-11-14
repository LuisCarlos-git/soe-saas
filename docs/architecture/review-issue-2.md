# Revisão e evidências da issue #2

Base confirmada pelo usuário: `aadf0b59751eed91c01d429a739266855394437b`.
Implementação: `1388ecb`. Correções de revisão: `047272e`.
Dois revisores independentes avaliaram padrões e spec; ambos reavaliaram as
correções sem alterações concorrentes no código.

## Standards

Dois achados P2, corrigidos:

- O helper de Testcontainers executava migrações, contrariando a neutralidade
  exigida no PRD 16.8. Agora fornece apenas ciclo de vida e URL; as suítes
  consumidoras executam migração real, com URL explícita de fixture sintética.
- O teardown E2E sinalizava a API e parava o banco sem aguardar seus pools.
  Agora aguarda a saída dos processos, com grace period de 10 segundos e fallback
  de encerramento, antes de parar o PostgreSQL.

Reavaliação: ambos resolvidos, sem novos achados acionáveis.
**Pendências Standards: 0.**

## Spec

Um achado P1, corrigido:

- A fixture negativa arquitetural dependia dos exports compilados locais e
  falharia no CI antes do build. A regra agora reconhece tanto o nome público
  proibido quanto seu caminho resolvido. O check passou sem os outputs dos
  pacotes, com os três imports proibidos efetivamente rejeitados.

Reavaliação: resolvido, sem novas lacunas ou aumento de escopo.
**Pendências Spec: 0.**

## Evidências executadas localmente

- Instalação com lockfile congelado e peers sem conflitos.
- Geração Prisma 7.10.1 e migração real em PostgreSQL temporário 17.9-alpine.
- Prettier, ESLint, typecheck, build e inspeção do bundle cliente aprovados.
- Architecture check aprovado com e sem builds locais, incluindo fixtures
  negativas para backend no web, Nest na aplicação pura e acesso a internals.
- Vitest: 1 teste de configuração segura aprovado.
- Jest/Supertest: 4 testes aprovados, cobrindo resposta sintética, saneamento de
  entrada/logs, OpenAPI coerente e banco pausado com live 200/ready 503 e recuperação.
- Playwright: 2 jornadas aprovadas em desktop e 360 px, com SSR real, nova
  consulta, rede offline, recuperação, alvo de 44 px, estilo do botão e axe sem
  violações nos cenários testados. Capturas foram inspecionadas visualmente.
- Detector Impeccable: nenhum achado nos alvos executados.
- Taste: `GATE: OFF (no build active)`. Não conta como gate visual aprovado;
  a revisão desta superfície operacional foi feita pelas capturas e Playwright.

O workflow de CI foi configurado; não houve push nem execução remota nesta tarefa.
Após as correções de revisão, os checks afetados de arquitetura em checkout sem
outputs, lint, tipos, integração e E2E foram repetidos com sucesso.

## Limites

A entrega verifica somente conteúdo sintético global e health; não implementa
escolas, sessões, permissões escolares ou auditoria de estudantes. Essas entregas
têm tickets próprios. Não autoriza dados reais, contratação ou produção.

## Revisão posterior — 14 de novembro de 2026

Uma nova revisão identificou um P2 no caminho de JSON malformado: o parser pode
rejeitar o corpo antes de o Pino criar a correlação, fazendo o próprio filtro
lançar ZodError e retornar HTML. O teste HTTP reproduziu a falha antes da correção.

O filtro agora valida a correlação existente e gera UUID seguro quando ausente,
mantendo o mesmo identificador no header e no envelope. Payload excessivo também
preserva HTTP 413 com mensagem segura, e o OpenAPI documenta essa resposta.

Foram acrescentados testes de JSON malformado (400), corpo excessivo (413) e um
processo isolado que verifica stderr vazio com logs desabilitados, sem stack ou
conteúdo sensível e sem mocks do logger. Os testes individuais demonstraram
falha antes das correções e sucesso depois.

Verificação final desta atualização: lint, formatação, typecheck da API,
arquitetura e seus três testes negativos aprovados; 1 teste unitário, 7 de
integração HTTP/PostgreSQL e 2 jornadas Playwright aprovados. Os dois revisores
reavaliaram o delta e confirmaram a resolução, sem novos achados materiais de
Standards ou Spec. Nenhuma execução remota de CI ou push foi realizada.
