# Design do SOE

Base visual aprovada pelo responsável pelo produto em 14/11/2026, após a revisão
do login. Use estas diretrizes ao criar ou revisar interfaces do SOE. O PRD define
produto, permissões e acessibilidade; este documento registra a identidade e os
padrões visuais aprovados. SOE continua sendo o nome de trabalho.

## Direção

Uma interface escolar acolhedora, clara e sóbria: verde suave, fundos claros,
tipografia de sistema, espaço entre grupos e ações explícitas. A qualidade aparece
no alinhamento, na legibilidade e na continuidade entre as telas.

Preserve a paleta e os componentes existentes. Adapte a composição à tarefa da
tela, mantendo a mesma identidade. Informações sensíveis e providências precisam
ser fáceis de ler; use cor semântica junto de texto ou ícone.

## Cores e superfícies

A fonte dos tokens de implementação é
[`packages/ui/src/styles.css`](packages/ui/src/styles.css). Use suas classes
Tailwind em vez de cores locais por funcionalidade.

| Token              | Cor       | Uso                                 |
| ------------------ | --------- | ----------------------------------- |
| `primary`          | `#0F766E` | Ação principal, destaque e marca    |
| `primary-hover`    | `#115E59` | Hover da ação principal             |
| `canvas`           | `#F8FAFC` | Fundo neutro e cartão do formulário |
| `surface`          | `#FFFFFF` | Superfícies claras e campos         |
| `ink`              | `#0F172A` | Texto principal                     |
| `muted-foreground` | `#475569` | Explicações e metadados             |
| `rule`             | `#E2E8F0` | Separadores e bordas decorativas    |
| `control`          | `#64748B` | Bordas de campos                    |

Sucesso, atenção, erro e informação usam os tokens semânticos do mesmo arquivo.
Vermelho comunica falha ou urgência operacional; nunca identifica um estudante.
Botões primários usam texto branco.

O fundo aprovado para a entrada ocupa **toda a viewport**, com superfície branca
e gradiente vertical: `bg-surface bg-linear-to-b from-primary/10 via-primary/5
to-surface`. Preserve esse verde derivado do token, sem introduzir outra paleta.
O contêiner de composição é transparente: a hierarquia vem do espaço e dos blocos
necessários, não de uma caixa externa envolvendo toda a página.

## Tipografia, espaço e forma

- Fonte: `system-ui, sans-serif`, como no app atual. Corpo e campos em 16 px;
  explicações em 14–16 px; metadados em 12–14 px. Entrelinha de leitura próxima de 1,5.
- Títulos de telas operacionais: 24–32 px, peso 600 e tracking discreto. O título
  de acolhimento do login pode chegar a 42 px em desktop. Mantenha títulos compactos.
- Escala de espaço: 4, 8, 12, 16, 24, 32 e 48 px. Use espaçamento maior entre
  assuntos e menor entre label, campo e ajuda. Preserve bordas de alinhamento.
- Campos e botões: raio de 8 px; cartões comuns: 12 px. No login, o cartão tem
  20 px e a fotografia 16 px. Essas exceções pertencem à superfície de entrada.
- Bordas finas, separadores discretos e pouca elevação. Sombras ficam reservadas
  a elementos que realmente flutuam, como menus, painéis e diálogos.

## Composição aprovada do login

Referência visual: [captura aprovada](docs/design/login-approved-desktop.png).
Os Devtools presentes na captura são ferramentas de desenvolvimento e não fazem
parte do design do produto.

- Gradiente na página inteira; sem borda, fundo próprio, sombra ou cantos no
  contêiner externo. Largura máxima de **1600 px**, centralizada.
- Margens externas: 16 px no celular, 24 px em telas intermediárias e 32 px no
  desktop. Em desktop, altura mínima da composição igual à viewport menos 64 px.
- Duas colunas a partir de 1024 px, proporção **1,1 : 1**: contexto e imagem à
  esquerda; cartão de acesso centralizado na coluna direita.
- Cartão do formulário com largura de 100% até **520 px**, dentro da faixa aprovada
  de 400–600 px. Use a largura disponível em telas menores, sem impor mínimo de 400 px.
- Cartão em `canvas`, borda `rule/70`, cantos de 20 px e padding horizontal de
  24 px no celular ou 40 px em telas maiores. Não estique os campos à largura
  inteira da coluna direita.
- Marca discreta, mensagem de acolhimento e fotografia na esquerda. A imagem é
  estática; não há moldura externa envolvendo imagem e formulário juntos.
- Antes de 1024 px, uma coluna: marca e mensagem compactas, depois formulário;
  fotografia e textos secundários de contexto cedem espaço à tarefa de acesso.

Esse arranjo é o padrão de entrada. Dashboards, listas, detalhes e relatórios usam
composições próprias para suas tarefas, preservando tokens, tipografia, campos,
estados e ritmo de espaçamento. A navegação operacional segue o PRD; não copie o
split de login ou sua fotografia para cada tela interna.

## Formulários e respostas

- Labels persistentes acima dos campos, ajuda perto do controle e foco visível.
  Campos com pelo menos 44 px de altura e largura coerente dentro do grupo.
- Uma ação principal por tarefa. Em formulários curtos de entrada, o botão ocupa
  100% da largura dos campos.
- No loading, o texto sai para cima e o spinner entra de baixo até o mesmo
  centro. Preserve o nome acessível da ação (Entrar), o tamanho do botão e o bloqueio
  com `aria-busy`. A transição respeita movimento reduzido.
- Erros de resposta da API passam pelo **Sonner global com `richColors`**. Erros
  de validação local podem ficar vinculados ao campo; evite feedback duplicado.
- Texto direto em português brasileiro: verbos explícitos, próximo passo claro
  e ajuda concreta. Estado vazio explica como começar ou ajustar a busca.
- Considere carregando, vazio, erro, sem permissão, sem conexão, salvando, sucesso
  e conflito de edição conforme a tarefa. A apresentação respeita o acesso real.

## Imagens e movimento

Pessoas devem ter anatomia, expressões e poses naturais. O login aprovado usa uma
imagem fotorealista gerada, com uma professora adulta e duas crianças em leitura
compartilhada. Ela é um asset sintético; não representa uma escola ou equipe real.
A fonte e a aplicação estão registradas em
[`docs/architecture/login-design.md`](docs/architecture/login-design.md).

Preserve o enquadramento dos rostos, reserve dimensões no SSR e sirva o asset
local otimizado. Imagens decorativas usam alt vazio; conteúdo informativo recebe
alternativa equivalente. A fotografia do login é estática; o estilo linear
isométrico da proposta rejeitada não é referência para representar pessoas.

O livro Hairline aprovado continua sendo o indicador de navegação. Consulte
[`docs/architecture/loading-and-motion.md`](docs/architecture/loading-and-motion.md)
para ciclo, lifecycle e integração com o Router. Movimento acompanha operações
reais, termina junto delas e respeita `prefers-reduced-motion`. Tokens e receitas
compartilhadas ficam em `packages/ui/src/styles/motion.css` e `packages/ui/src/motion/`.

## Aplicação em novas telas

### Cabeçalhos operacionais

O shell autenticado concentra um único h1 de 18 px na faixa superior branca,
onde ficava o breadcrumb. Em detalhes, a seta de 16 px fica imediatamente ao
lado do título, com alvo de 40 px, gap de 4 px e nome acessível do destino.
Páginas iniciais não inventam retorno. Em Configurações, a aba atual aparece
como contexto da localização. Sidebar e faixa superior permanecem estáveis;
a transição continua apenas no conteúdo.

O conteúdo usa `PageToolbar` de `@soe/ui/components/page-toolbar` para contexto
curto, como o nome da escola, e ações agrupadas à direita. Não repetir o título
do shell nem reservar uma segunda faixa para voltar. No celular as ações
podem ocupar a linha seguinte, mantendo atualizar e criar/convidar juntos.

Não repita o título em um cabeçalho grande e em outro bloco da mesma lista.
Atualizar uma lista usa botão secundário somente com ícone RefreshCw, label e
title; a ação principal de criar/convidar fica ao lado. Preserve ações de
formulário junto do envio, como recarregar configurações ao lado de salvar.
Listas de gestão com busca, ordenação e paginação consultam a coleção no
servidor; cabeçalhos ordenáveis indicam direção com ícone e `aria-sort`. Tags
usam texto junto da cor semântica. Rolagem de tabelas fica contida em uma região
com nome e acesso por teclado em telas pequenas.

O suporte de tags de situação fica em tooltip com texto completo, acessível
por foco, clique e hover; não ocupa uma linha fixa por registro. Detalhes e
todos os papéis continuam disponíveis no menu da linha. Na tabela, mostrar no
máximo dois papéis com reticências e truncar o excedente da largura da célula.

As telas Profissionais (seleção da escola) e Minhas escolas usam o mesmo
diretório tabular: nome, ano/fuso, profissionais ativos e convites pendentes
com total. Busca, ordenação, páginas e contagens vêm da API no escopo das
escolas administradas. Atalhos por linha levam à equipe ou configurações.

Referências desta revisão: [Atlassian Page header](https://atlassian.design/components/page-header/usage)
e [Polaris, retorno no cabeçalho](https://shopify.dev/docs/apps/build/app-home/migrate-from-polaris-react/breadcrumbs).

1. Leia o PRD, esta base e as instruções de interface do repositório; consulte as
   skills exigidas. Taste orienta composição; Hairline é consultada quando houver
   figura; Transitions.dev quando houver movimento. Adapte referências à tarefa
   escolar, mantendo a identidade aprovada.
2. Defina a tarefa principal, os dados permitidos e os estados. Escolha a
   composição adequada, reaproveitando tokens e componentes de `@soe/ui`.
3. Revise desktop, tablet e celular, incluindo 360 px; teclado, foco, contraste,
   zoom, movimento reduzido e ausência de overflow. Registre quais verificações
   foram realmente executadas. A meta de acessibilidade é WCAG 2.2 AA.
4. Documente novos padrões compartilháveis nesta base ou em referência específica
   ligada a ela. O código continua sendo a fonte dos valores de implementação;
   atualize a diretriz quando uma nova decisão visual for aprovada.

## Base de componentes e classes

As primitivas visuais partem do **shadcn/ui** e ficam em `@soe/ui`.
O catálogo oficial está em `packages/ui/src/primitives`; especializações genéricas
como Button com loading, InputField e FieldMessage ficam em `src/components`,
compostas sobre essa base. Formulários escolares permanecem nos módulos do web,
com TanStack Form; regras de negócio não pertencem ao pacote UI.

Todos os controles consumidos por formulários vêm de `@soe/form`, inclusive
checkbox, textarea, seleção e envio. Sua composição conectada ao TanStack usa
useAppForm, AppField, AppForm e withForm, reutilizando as primitivas de `@soe/ui`.
Os schemas e as ações específicas ficam nos módulos do web. Consulte
[o guia do pacote](packages/form/README.md) para reatividade, validação e extensão.

No fonte de `@soe/ui`, use **cn() de #lib/utils** para classes condicionais e
combinação com className recebido. Template literals, concatenação e ternários
no className são bloqueados pelo ESLint. Imports internos são sem extensão;
ESM e extensões dos artefatos são responsabilidade do build.

Campos têm fundo **branco**, inclusive no estado inválido e com o sistema em tema
escuro. O tema claro é o padrão do piloto; ativação automática por preferência
escura do navegador não muda essa decisão. Foco, bordas e feedback usam os tokens
aprovados. Mensagens locais revelam e ocultam suavemente, permanecendo associadas
ao campo até a correção. Erros da API continuam no Sonner global com richColors.

As transições dos componentes são centralizadas no pacote UI e seguem as receitas
Transitions.dev, com adapters de estado para Radix/Base UI. Preserve gerenciamento
de foco, teclado, presença de saída e reduced-motion. Consulte
[guia do pacote UI](docs/architecture/ui-components.md) para APIs, catálogo,
receitas, ferramentas e evidências de validação.
