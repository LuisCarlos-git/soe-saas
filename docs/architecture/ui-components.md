# Componentes UI do SOE

Base adotada em 15/11/2026: shadcn/ui, com as transições de produto do
Transitions.dev. Identidade e aplicação visual: [DESIGN.md](../../DESIGN.md).

## Estrutura e imports

O CLI oficial `shadcn@4.23.0 add --all --yes` instalou **61 componentes e um hook**.
O fonte está em `packages/ui/src/primitives`, e os controles compostos do SOE em
`packages/ui/src/components`. Componentes genéricos ficam nesse pacote; módulos
web fornecem dados, validação de apresentação e comportamento de negócio.

```tsx
import { Button, InputField, FieldMessage, cn } from "@soe/ui";
import { Dialog, DialogContent, DialogTitle } from "@soe/ui/primitives/dialog";
import { Card, CardContent } from "@soe/ui/primitives/card";
```

Esses imports de controles são internos à implementação do design system e dos
adapters. Nas telas, todos os componentes de formulário vêm de `@soe/form`,
incluindo checkbox, textarea, seleção e envio; as regras do guia de form são
verificadas por lint e dependency-cruiser.

`Button` e `Input` da raiz compõem os respectivos componentes shadcn e preservam
a identidade SOE. `InputField` reúne Label, Input, ajuda e FieldMessage; este usa
FieldError do shadcn. O Sonner global compõe a base shadcn com richColors, mensagens
pt-BR e cores semânticas. TooltipProvider é composto no documento raiz do web.
Para composição Slot/asChild, a API integral do botão base está disponível em
`@soe/ui/primitives/button`; o Button com loading da raiz representa ação nativa.

### Validação de formulários

O web declara Zod 4.6.7 diretamente, na mesma versão de `@soe/contracts`.
Schemas de apresentação ficam em `modules/<feature>/model`, derivados dos
contratos compartilhados. No login, `loginFormSchema` preserva as restrições do
contrato e personaliza apenas mensagens pt-BR por clones locais, sem configurar
estado global do Zod ou alterar a senha digitada.

TanStack Form consome o schema completo diretamente por Standard Schema em
`validators.onChange`, com `validationLogic: validateOnChangeAndBlur` de
`@soe/form`. A estratégia revalida no change, no blur e no submit,
usando um único canal de erros para não manter mensagens antigas após correção.
Exiba a mensagem quando `field.state.meta.isTouched` for verdadeiro: digitação e
blur tocam o campo; a tentativa de envio toca todos os campos. Evite ler o estado
global do formulário dentro de um Field sem uma assinatura reativa correspondente.
O pacote form conecta TextField ao InputField e SubmitButton ao Button, usando
`createFormHook`, contextos únicos e assinaturas `useSelector`. O login usa
`useAppForm`, `AppField`, `AppForm`, `formOptions` e um bloco extraído com `withForm`.
O formatter aceita strings e issues desconhecidos, removendo mensagens duplicadas.
Não envie formulários inválidos. Inputs e FieldMessage recebem o resultado;
o pacote UI não conhece regras dos formulários nem importa form. A validação no
servidor continua obrigatória, e erros seguros da API permanecem no Sonner global
com richColors. API, exports, fronteiras e exemplo no
[guia de @soe/form](../../packages/form/README.md).

Referências: [TanStack Form — validação com schemas](https://tanstack.com/form/latest/docs/framework/react/guides/validation#validation-through-schema-libraries),
[Zod — clone](https://zod.dev/packages/zod) e
[personalização de erros](https://zod.dev/error-customization).

As APIs adicionais são exports explícitos de `primitives/*`, `components/*`,
`hooks/*` e `lib/*`. Não acesse src/dist de outro pacote. O fonte usa imports sem
extensão e aliases internos #ui, #lib e #hooks. TypeScript usa ESNext/Bundler;
esbuild emite ESM com splitting e sourcemaps. Extensões .js nos artefatos emitidos
são resolvidas pelo build. Os 61 módulos públicos foram importados com Node ESM,
e Button/InputField foram renderizados via react-dom/server.

## Classes e tema

Use **cn() de #lib/utils** para combinar className e estados condicionais. A
implementação única combina clsx e tailwind-merge. O ESLint bloqueia template
literals, concatenação e condições diretamente no className e imports relativos
com .js no fonte UI. A regra foi testada com um caso proibido e um caso válido.

```tsx
className={cn("base", { "is-active": active }, className)}
```

Tokens shadcn foram mapeados para a paleta existente. `muted` representa agora
uma superfície neutra; `muted-foreground` mantém #475569 para texto secundário.
Os usos do app foram migrados sem mudança de cor. Campos usam fundo branco,
inclusive em erro; o modo escuro do sistema não ativa automaticamente variantes
dark. Tema claro continua sendo a decisão do piloto.

Os componentes próprios preservam altura mínima de 44 px, labels persistentes,
bordas legíveis e foco visível. Não alterar a paleta ao instalar componentes.

## Movimento e estado

A skill gratuita `Jakubantalik/transitions.dev/skills/transitions-dev` foi instalada
e lida. O conteúdo e a licença permitem uso das receitas no produto. Não foi
adotado outro motor de animação. As referências consultadas ficam registradas
nos cabeçalhos de `styles/transitions.css`, `styles/surface-recipes.css` e
`styles/shadcn-motion.css`. Importe `@soe/ui/styles.css` e `@soe/ui/motion.css`.

| Família                                                                               | Receita e integração                                                                                                                                                |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button com loading                                                                    | Text states swap: texto sobe e perde opacidade; spinner entra de baixo no mesmo centro. Nome acessível, dimensões e bloqueio preservados.                           |
| Validação de InputField                                                               | Error-message reveal: mensagem abaixo do campo revela/oculta suavemente, com aria-invalid e descrição associada; permanece até correção, sem shake ou auto-dismiss. |
| Dialog e AlertDialog                                                                  | Modal: escala sutil e opacidade, abertura 250 ms/fechamento 150 ms.                                                                                                 |
| Dropdown, ContextMenu, Menubar, Popover, Select, HoverCard, Combobox e NavigationMenu | Menu dropdown: origem da superfície e estados nativos de abertura/fechamento.                                                                                       |
| Sheet                                                                                 | Panel reveal: distância, blur e tempos compartilhados, com direção adaptada ao lado.                                                                                |
| Accordion e Collapsible                                                               | Accordion expand: grid-template-rows e conteúdo interno recortado.                                                                                                  |
| Tooltip                                                                               | Tempos e escala de tooltip; posicionamento e medição ficam com Radix.                                                                                               |
| Tabs                                                                                  | Revelação do painel com opacidade e curva suave; seleção/teclado permanecem nativos.                                                                                |
| Checkbox, Radio e Switch                                                              | Tempos de checkbox-check e toggle; estados e posições seguem os controles nativos.                                                                                  |
| Skeleton                                                                              | Pulso com tokens da receita skeleton-reveal.                                                                                                                        |
| Sonner                                                                                | Tempos de toast; empilhamento, offsets e encerramento seguem Sonner.                                                                                                |

As receitas de superfícies originais são preservadas; adapters ligam os hooks aos
atributos data-state de Radix e data-open/data-closed de Base UI. Animações CSS de
saída mantêm a presença nativa até o término. Foco, teclado, semântica, drag de Vaul
e Embla continuam sob suas bibliotecas. Elementos estáticos não recebem animação
artificial. Propriedades de transição são explícitas; reduced-motion desativa
movimento decorativo, preservando o estado final e a funcionalidade.

No login, TanStack Form valida dados locais com os contratos existentes; a UI só
recebe error. Mensagens duplicadas de múltiplos gatilhos são consolidadas. Erros da
API continuam somente no toast. O botão aguarda a hidratação antes de aceitar
envio, e o formulário usa método POST como defesa contra envio nativo em URL.
O catálogo inclui Form compatível com React Hook Form por ser parte do registro;
os fluxos do SOE continuam em **TanStack Form**, conforme o PRD.

## Ferramentas e verificações

- Atualizar um componente: `pnpm dlx shadcn@4.23.0 add <nome> --yes --cwd packages/ui`.
  components.json e package imports apontam para src. Preserve o tema e adapters;
  fixe versões novas e confira imports após cada atualização.
- Build: `pnpm --filter @soe/ui build`. Declarações e bundles são gerados, não editados.
- Navegador: `pnpm --filter @soe/ui test:browser`. A suíte isolada usa Vite e não
  depende da API. O comando raiz test:e2e a executa antes das jornadas web no CI.
- Prévia local dos controles: `pnpm --filter @soe/ui exec vite --config vite.preview.config.ts`.

A revisão local executou typecheck, lint, fronteiras e build web/SSR; quatro testes
UI (desktop/reduced-motion) e quatro de layout/validação do login. Axe cobriu a
prévia e o login. Fundos brancos foram verificados com preferência de sistema
escura; Button mantém tamanho e nome acessível nos dois estados. Regras cn() e
imports foram verificadas pelo lint. Nenhum resultado de CI remoto é presumido.

## Scan Transitions Motion Agent

Scanner 0.11.2: antes de ampliar o catálogo, o Polish escolhido pelo usuário
corrigiu uma duração do spinner (UI 99 → 100). Após instalar o catálogo e os
adapters, o scan passou a reconhecer novas superfícies; o segundo Polish aplicado
à escala do catálogo mudou **69 → 74**. Essas notas têm escopos diferentes e não
são comparação de regressão da mesma quantidade de componentes.

O [relatório salvo](../design/transitions-scan-ui.json) registra o resultado e cada
componente reconhecido. O scanner estático ainda aponta sugestões de Revamp e mismatches em wrappers
NavigationMenu/Command e adapters de recipes ligados por data-slot. Há diferenças
entre detectar classes locais e medir o DOM renderizado. A nota não representa
aprovação de todas as receitas; as evidências de navegador listadas acima são as
verificações de execução. Não foi contratado Revamp nem aplicado fix de lógica.
O serviço alterou apenas CSS e classes de duração. Artefatos e núcleo Hairline
originais permaneceram intactos. Não continuar correções hospedadas sem respeitar
a escolha do usuário e as instruções do Transitions Motion Agent.

## Catálogo instalado

- `accordion`
- `alert`
- `alert-dialog`
- `aspect-ratio`
- `attachment`
- `avatar`
- `badge`
- `breadcrumb`
- `bubble`
- `button`
- `button-group`
- `calendar`
- `card`
- `carousel`
- `chart`
- `checkbox`
- `collapsible`
- `combobox`
- `command`
- `context-menu`
- `dialog`
- `direction`
- `drawer`
- `dropdown-menu`
- `empty`
- `field`
- `form`
- `hover-card`
- `input`
- `input-group`
- `input-otp`
- `item`
- `kbd`
- `label`
- `marker`
- `menubar`
- `message`
- `message-scroller`
- `native-select`
- `navigation-menu`
- `pagination`
- `popover`
- `progress`
- `radio-group`
- `resizable`
- `scroll-area`
- `select`
- `separator`
- `sheet`
- `sidebar`
- `skeleton`
- `slider`
- `sonner`
- `spinner`
- `switch`
- `table`
- `tabs`
- `textarea`
- `toggle`
- `toggle-group`
- `tooltip`

Hook: `use-mobile`.

Validação adicional: NavigationMenu e Command foram exercitados no navegador,
incluindo abertura, interação e saída via Escape; o diálogo composto de comandos
usa a mesma animação do Dialog base. Variantes de Button preservam suas cores
shadcn (outline normal e hover verificados). A regra cn() foi verificada com um
caso negativo; o lint rejeitou classes condicionais diretas e aceitou cn().

## Fluxos de etapas em modais

`useStepFlow` e `StepFlowContent` são exports públicos de `@soe/ui`, também disponíveis
em `@soe/ui/hooks/use-step-flow` e `@soe/ui/components/step-flow-content`.
O hook não conhece modais, formulários ou MFA: recebe um grafo tipado de etapas e
controla a navegação. A primeira aplicação real é a inscrição MFA: senha → QR → código.

```tsx
const navigation = useStepFlow<"password" | "scan" | "verify">({
  initialStep: "password",
  flow: {
    password: { next: ["scan"] },
    scan: { next: ["verify"] },
    verify: {},
  },
});

<StepFlowContent navigation={navigation}>
  {/* Conteúdo da etapa navigation.currentStep */}
</StepFlowContent>;
```

- `goTo(target)` só aceita destinos declarados em `next` da etapa atual. Falha
  retorna `false`, não muda o histórico e chama `onInvalidTransition(from,to)`.
- `next()` avança somente quando há exatamente um destino; ramificações exigem
  escolha explícita. Etapas sem destinos são finais (`isFinalStep`).
- `back()` retorna pelo histórico; no início retorna `false`. `reset(target?)`
  começa um novo histórico de uma etapa declarada (a inicial por padrão).
- Comandos retornam boolean e resolvem a partir da última navegação aceita,
  inclusive em várias chamadas no mesmo evento ou callbacks assíncronos retidos.
  `history`/`nextSteps` são snapshots somente para leitura.
- `initialStep` inicializa o hook. Mantenha os nomes do grafo estáveis enquanto
  montado; trocar o fluxo completo exige remontar o consumidor. Destinos não
  declarados são recusados em runtime; remover a etapa ativa é erro de configuração.
- Cada etapa pode fornecer `component`, que recebe `{navigation}`; `StepComponent`
  e `renderStep()` permitem renderizá-lo. Sem component, `renderStep()` retorna null,
  e o consumidor pode compor conteúdo e dados de domínio diretamente.

`StepFlowContent` recebe a navegação e aplica a receita Page side-by-side de
Transitions.dev aos conteúdos novos: deslocamento de 8px, duração e curva dos
tokens de página do SOE, sentido invertido ao voltar. Reset/início não anima.
Reduced-motion desabilita a animação. O conteúdo anterior é desmontado imediatamente,
sem clones ou campos secretos ocultos mantidos para executar saída. Use
`data-step-focus` em um título focável com `tabIndex={-1}` para orientar a leitura;
caso contrário, o primeiro campo/controle recebe foco após mudar de etapa.
Não persistir senhas ou material de inscrição no histórico. Para zerar dados ao
fechar uma modal, desmonte o consumidor junto com o conteúdo.

A prévia pública testa ramificações, transições recusadas, avanço único, histórico,
reset em outro início, retorno e duas navegações no mesmo evento. A jornada MFA
verifica esse mesmo módulo com API real, QR e animação/reduced-motion.

## Navegação autenticada e configurações

A sidebar usa a primitiva shadcn existente, com superfície canvas, borda rule e
seleção primary. Em desktop ocupa 16rem; em telas menores que 768px, o menu abre
em Sheet com título em português, retorno de foco e fechamento por Escape.
O rodapé agrupa Configurações, identificação da conta e Sair. Somente áreas
implementadas aparecem como destinos.

O layout pathless `_authenticated` verifica a sessão antes de mostrar páginas
internas e mantém a mesma moldura entre elas. `/account` permanece como visão
geral. Configurações usa abas Perfil e Segurança, com URLs
`/settings/profile` e `/settings/security`; `/settings` redireciona para Perfil.
A lista de seções concentra rótulo, caminho e ícone de cada aba para expansão.
Radix mantém semântica tablist/tab/tabpanel e teclado; a ativação é manual.

O perfil apresenta a identificação atual, sem prometer edição ainda indisponível.
MFA fica exclusivamente em Segurança e mantém a modal, QR local e controles da
API. Adicionar novas telas escolares não concede permissões implicitamente.

Referências consultadas em 20/11/2026:

- [Linear: organização de acesso em configurações](https://linear.app/docs/login-methods):
  referência para separar configurações pessoais e segurança.
- [Vercel: navegação de conta e configurações](https://vercel.com/changelog/improved-user-experience-for-account-settings):
  referência para distinguir visão geral e opções da conta.
- [Vercel: autenticação em duas etapas](https://vercel.com/docs/two-factor-authentication):
  referência de localização da configuração do autenticador.

A adaptação preserva os tokens e a tipografia de DESIGN.md, sem importar a marca,
os planos comerciais ou a política de acesso das referências.

`SidebarSelection` envolve Header/Content/Footer dentro de Sidebar e recebe
`activeKey` (no SOE, o pathname). Ele preserva um marcador de seleção único entre
os menus, movendo apenas esse fundo. As trocas de abas não remontam a sidebar.
Primeiro posicionamento, resize e scroll não animam; reduced-motion desativa o
movimento. O foco do Sheet móvel retorna ao SidebarTrigger por uma ref do provider.
Os rótulos do menu móvel e dos controles são em português brasileiro.

Validação desta extensão (20/11/2026): build web/SSR, typecheck, lint, fronteiras,
formatação e bundle aprovados; 24 testes unitários e 36 testes da suíte completa
E2E aprovados (6 UI, 14 form, 16 web). Os testes de configurações e MFA foram
reexecutados após normalizar caminhos com barra final. Cobrem URLs diretas,
reload/histórico, teclado, mesmo indicador lateral/posição da moldura, animação
só no painel, reduced-motion, menu móvel e logout após falha de rede. Axe cobriu
as superfícies novas. Revisões de Standards/Spec sem pendências; revisão visual
independente aprovou as sete capturas de Perfil, Segurança, menu móvel e modal MFA.
Backend não foi alterado nesta extensão.
