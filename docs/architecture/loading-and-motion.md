# Loading de botões e navegação

Solicitação de 14/11/2026: spinner nos botões durante operações e livro folheando entre páginas, criado com hairline-create.

## Comportamento

`Button` de @soe/ui recebe `loading`, desabilita a ação, expõe aria-busy e mostra LoaderCircle decorativo ao lado do texto. Entrar, Sair e Verificar novamente usam esse estado. Com prefers-reduced-motion, o arco fica estático e texto/estado continuam disponíveis.

`PageNavigation` observa isLoading do Router. Navegação superior a 150 ms mostra `PageLoading`, evitando flash em navegações rápidas; não há tempo mínimo de exibição nem espera por uma volta do livro. Ao terminar ou falhar a navegação, o loading sai imediatamente. É status de carregamento, sem foco modal nem interceptação de cliques. Dados não são persistidos no navegador.

O Router habilita sua integração nativa com View Transitions. A área das páginas tem nome próprio; fades e deslocamento de 8 px usam os tokens de packages/ui/src/styles/motion.css. Receitas/wrappers ficam em packages/ui/src/motion. Navegadores sem View Transitions continuam navegando normalmente. Reduced-motion remove fades/deslocamentos; os controles continuam funcionais.

## Livro Hairline

Fonte única: packages/ui/src/illustrations/book/book.js. Metáfora: livro aberto com capas, lombada e blocos de papel; o ponteiro vira uma folha e as vizinhas seguem com stagger por distância. Regras usadas: 1, 2, 3, 4, 6, 7, 8, 9 e 10. Tour: folha 1, folha 2, folha 3 e repouso, com pontos [228,195], [224,178], [215,155], null.

A figura segue a skill hairline-create instalada, sem alterar kernel.js ou bench.html. Build, validação e look oficiais foram realmente executados. O HTML independente está em artifacts/hairline/hairline-book.html; abra e pressione Play, ou acrescente ?play=1 à URL. As folhas de revisão, thumbnail e sequência de movimento estão na mesma pasta.

O pacote Hairline 0.5.1 só publica figuras prontas e tipos, sem uma API pública de extensão. Para a figura criada pela skill, o núcleo original é preservado byte a byte em packages/ui/vendor/hairline, com licença MIT e hash verificado pelo build. Não há import de internals do pacote nem engine reescrito. O adapter monta o mesmo fonte da figura no app, gerando somente um módulo de runtime. Os tipos públicos de Hairline mantêm o contrato de lifecycle. A ilustração fica encapsulada em ui, sem conceito de estudante/caso.

`BookIllustration` tem play=false por padrão. Somente o loading pedido pelo usuário usa play=true. O tour original para sob reduced-motion; o wrapper também impede iniciar o tour nessa preferência. Tudo desmonta com destroy (tour, frame loop, SVG e listener). O módulo é importado apenas no efeito cliente: SSR mantém espaço reservado e texto acessível. As cores usam --hairline-plate/--hairline-hi e tokens da identidade do SOE.

## Referências e revisão

Consultadas as skills ui-ux-pro-max, frontend-design, frontend-ui-engineering, interface-design, Impeccable 4.8.2 e Taste 2.5.1. Mantida a direção operacional existente: verde, legibilidade, foco e toque. Não houve instalação/reinstalação de skills.

- [Transitions.dev Library](https://transitions.dev/library.html): Page side-by-side e Skeleton loader/reveal como referências; adaptação reduzida para telas operacionais.
- [Transitions.dev instalação/acessibilidade](https://transitions.dev/detail.html?doc=introduction): tokens compartilhados, propriedades de composição e movimento reduzido. Sem receita Pro ou contratação.
- [Hairline Docs](https://hairline.lucasmarkes.com/docs): montagem cliente, play=false padrão, lifecycle e tokens CSS.
- [hairline-create](https://github.com/lucasmarkes/hairline/tree/main/skills/hairline-create): núcleo e bench originais, figura customizada e QA oficial.

Look oficial aprovado: oito estados, temas claro/escuro, extremos de intensidade, thumbnail 240 px e resposta do ponteiro; quadro 400×320 respeitado, desenho estável em até 1,8 s, read-out correto e nenhuma ocorrência no console do browser. Foram inspecionados a folha de revisão e os 16 frames do movimento. A ferramenta Node emitiu TimeoutNegativeWarning no próprio processo de captura; as verificações do browser e a execução encerraram com sucesso.

No app, Playwright testa resposta lenta real: botão com spinner/aria-busy e bloqueio de novo envio; livro visível durante loader; geometria muda quando play está habilitado e fica imóvel com reduced-motion; loading desaparece após a resposta; saída usa o mesmo spinner. Axe e screenshots cobrem desktop e 360 px. Evidências de execução final registradas abaixo.

Resultados finais: seis E2E aprovados (diagnóstico, autenticação e motion nos dois projetos), quatro testes unitários aprovados, typecheck/lint/formatação/fronteiras/bundle cliente aprovados. O build web/SSR passou com o módulo do livro carregado separadamente (6,51 kB gzip no cliente). A medição Axe aguarda animações finitas terminarem antes de avaliar o contraste final dos toasts; nenhum teste de acessibilidade foi desativado. Portas locais liberadas ao final. Não foi repetida integração backend nesta alteração de UI; os E2E continuam usando API e PostgreSQL temporário reais. Resultados locais, sem declaração de CI remoto.
