# Depuração local

Execute `pnpm dev` com PostgreSQL disponível e migrações aplicadas, conforme
[fundação local](local-foundation.md). O Vite aguarda a prontidão da API antes de
abrir a interface. Se ela não responder em 45 segundos, confira os logs da API,
o Docker e as migrações. Durante um reinício, o proxy devolve erro 503 com mensagem
segura, exibida pelo toast padrão; operações de login não são repetidas automaticamente.

A geração Prisma usa `--no-hints` para evitar a oferta interativa de instalação de
skills no início do desenvolvimento. A configuração Prisma lê o `.env` da raiz,
preservando variáveis explicitamente fornecidas pelo ambiente de teste ou release.

## React Query Devtools

Em desenvolvimento, abra o ícone dos Devtools no canto inferior direito. Selecione
uma consulta (por exemplo, `synthetic-environment`) para usar:

- **Refetch**: executar uma nova leitura.
- **Invalidate**: marcar os dados como desatualizados e atualizar consultas ativas.
- **Trigger Loading**: simular carregamento; use o controle de restauração para sair.
- **Trigger Error**: simular falha da consulta e observar o tratamento da tela.
- **Reset**: reiniciar o estado da consulta.

O painel utiliza o QueryClient existente e é carregado apenas no navegador em
modo de desenvolvimento. A dependência não entra no bundle de produção.

Login e logout usam o fluxo do formulário, sem guardar credenciais em mutations
do Query. Para testar sua espera e transições reais de páginas, use a limitação
de rede do navegador (Network → Slow 3G), com a opção de preservar cache conforme
o cenário. Os controles das queries não simulam automaticamente todo o Router.

## Evidências desta alteração

- Inicialização local: cliente Prisma gerado sem prompt; Vite liberado após readiness.
- Login pela origem do web: 204; leitura da sessão autenticada: 200.
- Painel aberto em navegador real e consulta selecionada; controles de refetch,
  loading e erro disponíveis.
- Build, lint, typecheck, formatação e fronteiras arquiteturais aprovados.
- Integração: 14 testes aprovados em PostgreSQL temporário.
- E2E: 6 jornadas aprovadas em desktop e celular, incluindo login e transições.

As skills oficiais `prisma-cli`, `prisma-client-api`, `prisma-orm-setup` e
`prisma-database-setup` foram instaladas no ambiente do agente. Não são dependências
runtime do projeto e ficam disponíveis automaticamente na próxima conversa/turno.
