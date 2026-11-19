# Login: referência de implementação

Design aprovado pelo responsável pelo produto em 14/11/2026. A base normativa
para as próximas interfaces está em [`DESIGN.md`](../../DESIGN.md); este documento
registra asset, implementação e evidências da tela de acesso.

## Referências aplicadas

A segunda referência de layout fornecida pelo usuário orientou a disposição de
contexto à esquerda e formulário à direita. A paleta permaneceu a do SOE. O
refinamento final aplica o gradiente à página inteira, remove a caixa externa e
mantém somente o cartão do formulário com a largura definida na base de design.

Foram consultadas Taste 2.5.1, ui-ux-pro-max, frontend-design,
frontend-ui-engineering, interface-design e Impeccable 4.8.2. As regras do PRD para
interfaces operacionais e as decisões do usuário prevalecem sobre composições
promocionais de landing pages.

[Transitions.dev](https://transitions.dev/detail.html?doc=introduction) orienta
movimento e reduced-motion; [Hairline](https://hairline.lucasmarkes.com/docs)
permanece na figura do livro usada entre páginas. Nenhuma receita Pro ou serviço
pago foi contratado.

## Asset e responsabilidade

A página está em `apps/web/src/modules/identity/ui/login-page.tsx` e mantém o
fluxo real de autenticação, validação local e toast global para erros da API.
Não há cadastro público ou login social nesta entrega.

A imagem local `apps/web/public/images/classroom-reading-realistic.jpg` foi gerada
com imagegen: professora adulta e duas crianças em leitura compartilhada, luz
natural e roupa verde discreta. As pessoas são fictícias e não representam uma
escola piloto ou equipe real. O JPEG foi otimizado para 1000×800, cerca de 213 KB.

A imagem pertence ao módulo web e é exibida por img, com espaço reservado no SSR
e alt vazio por ser decorativa. É estática para preservar rostos e mãos; não usa
runtime próprio ou controle de reprodução. A foto é omitida no celular para
priorizar o formulário. O livro Hairline das transições mantém seu comportamento.

A proposta anterior de pessoas em traços isométricos foi rejeitada por parecer
rígida e não integra o login. Seus artefatos de exploração permanecem em
`artifacts/hairline/hairline-classroom*`; são históricos, não a referência aprovada.

## Evidências de revisão

- Captura final em 1967×925 inspecionada e salva em
  [`docs/design/login-approved-desktop.png`](../design/login-approved-desktop.png).
- Dois testes em `apps/web/tests/login-layout.spec.ts` aprovados em desktop e
  celular: carregamento real da imagem, largura do botão, ausência de overflow,
  reduced-motion e Axe sem violações.
- Typecheck e formatação aprovados após o último ajuste de layout.
- Build cliente/SSR, lint, fronteiras e inspeção do bundle aprovados na troca
  para a imagem realista. Detector Impeccable sem findings nessa revisão.
- A suíte completa de autenticação não foi repetida nas mudanças de apresentação;
  a revisão usou uma porta isolada porque as portas padrão estavam em uso.

Os testes acima são evidências locais, não declaração de execução do CI remoto.
A captura inclui o botão dos Devtools de desenvolvimento, que não é parte da UI
de produção nem da identidade visual.

## Limites do gate Taste

Resultado histórico executado na proposta anterior: **GATE: FAIL 22 (round 1 of 3)**,
sem waivers. O gate completo não foi repetido nas trocas posteriores e não se
registra aprovação dele. As capturas finais e os testes listados acima são as
verificações efetivamente realizadas.

Os findings preservados daquela execução foram:

- `hero-fill`, `flush`, `cta`: regiões lado a lado da mesma tela de autenticação.
- `copy-headline`, `copy-fact`: mensagem de acolhimento, sem fatos comerciais inventados.
- `moment-none`, `hero-screen`, `section-height`: composição operacional, sem
  seções promocionais ou scroll narrativo.
- `one-section`, `one-heading`: skip link e regiões semânticas do formulário.
- `container-edges` (cinco ocorrências) e `container`: grid Tailwind próprio,
  padding interno e alinhamentos dos painéis, sem classe .wrap.
- `text-only`: formulário priorizado no celular, sem a imagem decorativa.
- `focus-ring` (três ocorrências) e `focus-visible`: regras internas dos React
  Query Devtools de desenvolvimento.
- `heading-scale`: título do formulário no celular foi reduzido após o gate.

Avisos não bloqueantes incluíram copy-buttons/copy-actions, section-gaps,
skip-link e metadados promocionais. O controle de pausa da figura anterior foi
removido junto da figura. Esses resultados históricos não dispensam revisão de
acessibilidade e foco em alterações futuras.
