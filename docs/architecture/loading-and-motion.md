# Loading de botões e navegação

Solicitação de 14/11/2026: spinner nos botões durante operações e livro folheando entre páginas, criado com hairline-create.

## Comportamento

`Button` de @soe/ui recebe `loading`, desabilita a ação, expõe aria-busy e mostra LoaderCircle decorativo ao lado do texto. Entrar, Sair e Verificar novamente usam esse estado. Com prefers-reduced-motion, o arco fica estático e texto/estado continuam disponíveis.

`PageNavigation` observa isLoading do Router. Navegação superior a 150 ms mostra `PageLoading`, evitando flash em navegações rápidas; não há tempo mínimo de exibição nem espera por uma volta do livro. Ao terminar ou falhar a navegação, o loading sai imediatamente. É status de carregamento, sem foco modal nem interceptação de cliques. Dados não são persistidos no navegador.

O Router habilita sua integração nativa com View Transitions. A área das páginas tem nome próprio; fades e deslocamento de 8 px usam os tokens de packages/ui/src/styles/motion.css. Receitas/wrappers ficam em packages/ui/src/motion. Navegadores sem View Transitions continuam navegando normalmente. Reduced-motion remove fades/deslocamentos; os controles continuam funcionais.

## Livro Hairline

Fonte única: packages/ui/src/illustrations/book/book.js. Metáfora: livro aberto com capas, lombada e blocos de papel; a folha flexiona pela largura, um canto avança antes do outro e a ponta assenta do outro lado. Regras usadas: 1, 2, 3, 4, 6, 7, 8, 9 e 10. O percurso interativo da bancada usa duas folhas e repouso: [228,195], [224,178], [228,195], null. No loading real, o host habilita um ciclo contínuo próprio da figura, independente das pausas desse percurso.

A figura segue a skill hairline-create instalada, sem alterar kernel.js ou bench.html. Build, validação e look oficiais foram realmente executados. O HTML independente está em artifacts/hairline/hairline-book.html; abra e pressione Play, ou acrescente ?play=1 à URL. As folhas de revisão, thumbnail e sequência de movimento estão na mesma pasta.

O pacote Hairline 0.5.1 só publica figuras prontas e tipos, sem uma API pública de extensão. Para a figura criada pela skill, o núcleo original é preservado byte a byte em packages/ui/vendor/hairline, com licença MIT e hash verificado pelo build. Não há import de internals do pacote nem engine reescrito. O adapter monta o mesmo fonte da figura no app, gerando somente um módulo de runtime. Os tipos públicos de Hairline mantêm o contrato de lifecycle. A ilustração fica encapsulada em ui, sem conceito de estudante/caso.

`BookIllustration` tem play=false por padrão. Somente o loading pedido pelo usuário usa play=true. O wrapper impede iniciar o tour sob reduced-motion e a figura também bloqueia seu ciclo ambiente nessa preferência. O clock Hairline avança somente enquanto o host mantém play ativo e a figura está visível. Tudo desmonta com destroy (tour, frame loop, SVG e listener). O módulo é importado apenas no efeito cliente: SSR mantém espaço reservado e texto acessível. As cores usam --hairline-plate/--hairline-hi e tokens da identidade do SOE.

## Referências e revisão

Consultadas as skills ui-ux-pro-max, frontend-design, frontend-ui-engineering, interface-design, Impeccable 4.8.2 e Taste 2.5.1. Mantida a direção operacional existente: verde, legibilidade, foco e toque. Não houve instalação/reinstalação de skills.

- [Transitions.dev Library](https://transitions.dev/library.html): Page side-by-side e Skeleton loader/reveal como referências; adaptação reduzida para telas operacionais.
- [Transitions.dev instalação/acessibilidade](https://transitions.dev/detail.html?doc=introduction): tokens compartilhados, propriedades de composição e movimento reduzido. Sem receita Pro ou contratação.
- [Hairline Docs](https://hairline.lucasmarkes.com/docs): montagem cliente, play=false padrão, lifecycle e tokens CSS.
- [hairline-create](https://github.com/lucasmarkes/hairline/tree/main/skills/hairline-create): núcleo e bench originais, figura customizada e QA oficial.

Look oficial aprovado: oito estados, temas claro/escuro, extremos de intensidade, thumbnail 240 px e resposta do ponteiro; quadro 400×320 respeitado, desenho estável em até 1,8 s, read-out correto e nenhuma ocorrência no console do browser. Foram inspecionados a folha de revisão e os 16 frames do movimento. A ferramenta Node emitiu TimeoutNegativeWarning no próprio processo de captura; as verificações do browser e a execução encerraram com sucesso.

No app, Playwright testa resposta lenta real: botão com spinner/aria-busy e bloqueio de novo envio; livro visível durante loader; geometria muda quando play está habilitado e fica imóvel com reduced-motion; loading desaparece após a resposta; saída usa o mesmo spinner. Axe e screenshots cobrem desktop e 360 px. Evidências de execução final registradas abaixo.

Resultados da entrega inicial: seis E2E aprovados (diagnóstico, autenticação e motion nos dois projetos), quatro testes unitários aprovados, typecheck/lint/formatação/fronteiras/bundle cliente aprovados. O build web/SSR passou com o módulo do livro carregado separadamente (6,51 kB gzip no cliente). A medição Axe aguarda animações finitas terminarem antes de avaliar o contraste final dos toasts; nenhum teste de acessibilidade foi desativado. Portas locais liberadas ao final. Não foi repetida integração backend nesta alteração de UI; os E2E continuam usando API e PostgreSQL temporário reais. Resultados locais, sem declaração de CI remoto.

## Refinamento: papel flexível e ciclo contínuo

Aprovado o conceito, o usuário pediu uma passagem contínua de ponta a ponta. Cada folha percorre 0–180 graus com aceleração/desaceleração suave e deformação ao longo da largura; um canto fica ligeiramente atrasado. A borda tem amostras adicionais e conserva sua curvatura, sem convex hull que a transformaria em placa rígida. A lombada permanece fixa. Folhas completamente assentadas são pintadas atrás do bloco de papel antes de serem reutilizadas, sem salto aparente entre lados.

Uma nova folha começa a cada 1,55 s e termina em 1,78 s, com sobreposição curta entre assentamento e próxima saída. Não há retorno de toda a pilha, pausa do tour nem espera artificial de navegação. O runtime usa apenas register do kernel original e continua respeitando visibilidade, reduced-motion e destroy. Alterado somente o fonte da figura, mantendo kernel e bench intactos.

A bancada oficial foi validada novamente: oito estados dentro do quadro, read-out correto, browser sem erros e repouso/resposta interativa estáveis. Foi inspecionada uma captura adicional de 12 momentos do ciclo real em artifacts/hairline/book-continuous-loop.png. A prévia contínua independente em artifacts/hairline/book-loop.html usa o mesmo runtime do produto; a bancada oficial hairline-book.html continua disponível para a inspeção interativa. Gere a prévia com node scripts/build-book-preview.mjs após compilar @soe/ui.

O E2E de motion agora observa a geometria em 12 amostras ao longo de mais de um ciclo, rejeitando as pausas do percurso antigo. Desktop e celular/reduced-motion passaram. Build web/SSR, lint, typecheck e bundle cliente aprovados.

A prévia contínua foi verificada separadamente em Chromium: reprodução normal, controle Parar e modo estático sob reduced-motion, sem erros de página. No refinamento foram repetidos apenas os dois E2E de motion, que cobrem o comportamento alterado; os demais fluxos não foram modificados. O chunk atualizado mede 6,92 kB gzip no cliente.
