# PRD da plataforma SOE SaaS

Versão 1.3 • 12 de novembro de 2026 • Documento de produto e orientação técnica

Complemento confirmado em 13 de novembro de 2026: antes de planejar, implementar
ou revisar os fluxos deste PRD, leia as [decisões de aprofundamento](product/decisions.md)
e o [glossário do domínio](../GLOSSARY.md). As decisões registram o refinamento
aprovado na entrevista `grill-with-docs`, incluindo a revisão explícita da decisão
5 pela decisão 11. As perguntas ainda abertas permanecem identificadas no
complemento; esta documentação não representa implementação concluída.

## 1. Resumo e decisões confirmadas

Construir um SaaS de orientação e acompanhamento educacional para escolas em geral. O produto deve permitir que a equipe registre uma situação, defina providências e responsáveis, acompanhe devolutivas e prazos e documente o resultado. O valor central é dar continuidade ao cuidado com o estudante e evitar que demandas se percam entre profissionais.

Base: documento “Funcionalidades da Plataforma SOE”, da Escola Família Agrícola de Porto Nacional. O escopo abaixo transforma suas propostas em requisitos e separa o núcleo operacional das expansões. Exemplos e números do documento original são demonstrativos, não métricas reais.

| Decisão                     | Definição                                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Mercado inicial             | Escolas em geral; não limitar o produto às EFAs                                                                 |
| Usuários da primeira versão | Somente equipe escolar                                                                                          |
| Lançamento                  | Piloto gratuito para validar o produto                                                                          |
| Stack obrigatória           | Monorepo pnpm + Turborepo; TanStack Start/React Query no frontend; NestJS no backend; PostgreSQL com Prisma ORM |
| Arquitetura obrigatória     | Módulos por funcionalidade no frontend; SOLID, Clean Architecture e fronteiras verificadas no CI                |
| Base visual obrigatória     | Tailwind CSS; consultar Taste para design, Hairline para figuras e Transitions.dev para animações               |
| Formato proposto            | Aplicação web responsiva, em português brasileiro                                                               |
| Alternância                 | Configuração opcional; não aparece em escolas que não a utilizam                                                |
| Nome                        | SOE é nome de trabalho; marca comercial ainda será definida                                                     |

As decisões do usuário estão confirmadas. As regras técnicas da seção 7 e as diretrizes normativas de design da seção 6 são obrigatórias. Prazos, metas operacionais, limites comerciais e fornecedores ainda não definidos são propostas para validação, não compromissos contratados.

## 2. Problema, proposta de valor e limites

Situações escolares podem ficar dispersas entre planilhas, anotações e conversas. Um registro isolado não demonstra quem assumiu a providência, se houve retorno e qual foi o resultado. Essa é a hipótese de problema a validar com escolas, e não uma conclusão de pesquisa de campo já realizada.

Proposta de valor: uma central privada de acompanhamento educacional que mostra o que precisa de atenção, quem deve agir e o histórico necessário para decidir a próxima ação.

Objetivos:

- Reduzir o tempo para registrar e localizar um acompanhamento.
- Tornar explícitos os responsáveis, prazos e devolutivas.
- Manter histórico contínuo, com acesso compatível com cada função.
- Ajudar a gestão a avaliar volume de trabalho e continuidade das intervenções.
- Validar disposição de uso e de pagamento antes de ampliar o produto.

O produto não será, no core, ERP escolar, sistema financeiro, diário de classe completo, prontuário clínico, LMS ou canal de emergência. Não fará diagnóstico psicológico, classificação automática de estudantes ou decisões disciplinares automatizadas. “Conclusão” representa encerramento documentado do acompanhamento, não prova de que um problema foi definitivamente resolvido.

## 3. Público e papéis

Comprador potencial: direção escolar, mantenedora ou rede. Usuário principal: orientador educacional ou profissional que desempenhe essa função. Usuários colaboradores: coordenação, tutores, professores e monitores. Na interface, a escola pode usar “orientação”, “apoio ao estudante” ou outra denominação sem alterar as regras de acesso.

| Papel                   | Acesso padrão proposto                                                               |
| ----------------------- | ------------------------------------------------------------------------------------ |
| Orientação educacional  | Gerir casos do escopo autorizado, encaminhar, revisar e concluir                     |
| Direção                 | Indicadores e casos explicitamente autorizados; sem acesso irrestrito por cargo      |
| Coordenação             | Demandas pedagógicas pertinentes e providências atribuídas                           |
| Tutor                   | Estudantes vinculados e conteúdo necessário às suas atribuições                      |
| Professor ou monitor    | Criar registros, acompanhar seus envios com resumo permitido e responder atribuições |
| Administrador da escola | Cadastros, convites e configurações; sem acesso automático a relatos restritos       |
| Operador do SaaS        | Saúde técnica, organizações e suporte; sem leitura padrão de conteúdo escolar        |

Uma pessoa pode acumular papéis, mas cada concessão precisa ser explícita e auditada. O autor de um registro não ganha acesso permanente ao caso completo. Tutoria não implica acesso automático a informação de saúde ou proteção.

## 4. Core e evolução por fases

### Fase 0 — Descoberta e fundação

Entregas: entrevistas com 3 a 5 escolas, vocabulário e categorias iniciais, validação da matriz de acesso, protótipo dos fluxos principais, política de tratamento dos dados, configuração de ambientes e arquitetura multi-inquilino.

Validar com orientação, um colaborador e gestão: registrar → atribuir → devolver → concluir. Usar somente dados fictícios no protótipo. Definir um responsável operacional por escola piloto.

Critério de saída: cada participante conclui sua tarefa principal; nenhuma dúvida sobre quem pode ler relatos restritos; responsável escolar aprova o fluxo e o tratamento de dados antes de inserir informações reais.

### Fase 1 — Core do piloto gratuito

Entregar: organizações isoladas; autenticação e convites; estudantes, turmas e vínculos; importação CSV; registros e casos; atendimentos individuais/coletivos básicos; encaminhamentos e devolutivas; linha do tempo; pendências e alertas internos; contatos familiares como eventos; anexos básicos protegidos; filtros; relatório individual em PDF e exportação tabular CSV; auditoria e backups.

O fluxo deve funcionar de ponta a ponta sem módulos pedagógicos especializados. Um encaminhamento externo pode ser registrado, mas o sistema não transmite documentos a terceiros automaticamente. Tutores participam das atribuições comuns. Para EFAs, permitir marcar o contexto “Tempo Escola” ou “Tempo Comunidade”, sem calcular frequência especializada nesta fase.

Critério de saída: duas organizações de teste isoladas, todos os testes críticos de autorização aprovados, restauração de backup demonstrada, fluxo completo validado em desktop e celular e pelo menos uma escola usando dados reais sob condições aprovadas.

### Fase 2 — Profundidade educacional

Entregar: frequência e importação de dados de presença; planos de intervenção e evolução pedagógica; agenda; acompanhamento familiar estruturado; calendário de alternância por sessão; modelos de documentos; exportação XLSX; relatórios comparativos; filtros pessoais salvos; pautas de reunião e ações preventivas.

Pré-requisitos: validar origem da frequência, unidade de cálculo, regras da escola e dados disponíveis. Não construir diário de classe completo sem comprovar necessidade.

Critério de saída: cada escola entende como os percentuais são calculados; importações são reconciliáveis; planos e indicadores geram ações observáveis na rotina.

### Fase 3 — Comercialização e operação SaaS

Entregar: planos, assinatura e cobrança, onboarding com menos intervenção, quotas, gestão de assinatura, avisos de vencimento, exportação de saída e processo de cancelamento. Adicionar gestão de redes/múltiplas unidades quando houver demanda validada.

Pré-requisitos: escolas usando o core de forma recorrente, entrevistas de preço, custo de suporte conhecido e processo de atendimento definido. Esta fase pode ocorrer antes de toda a fase 2; vender o core validado não depende de construir todos os módulos educacionais.

Critério de saída: primeiros clientes pagantes, cobrança idempotente, política de inadimplência aprovada e acesso/exportação no encerramento de contrato testados.

### Fase 4 — Módulos especializados e integrações

Entregar sob demanda: estudos de caso, PEI e AEE; integrações com sistemas acadêmicos; SSO; portal de responsáveis; acesso de estudantes; notificações por canais externos; recursos de trabalho sem conexão; API para parceiros.

IA, se houver hipótese comprovada, fica restrita inicialmente a assistência de redação revisada por humano e com avaliação específica de dados. Não gerar rótulos, diagnósticos ou pontuação de risco de estudantes.

### Rastreabilidade do documento original

| Módulo de origem        | Core                                          | Evolução                                |
| ----------------------- | --------------------------------------------- | --------------------------------------- |
| 1. Dashboard            | Pendências, prazos, casos e responsáveis      | Comparativos e tendências na fase 2     |
| 2. Cadastro e histórico | Estudantes, turmas e linha do tempo           | Integrações na fase 4                   |
| 3. Ocorrências          | Registro, classificação e protocolo           | Formulários avançados após validação    |
| 4. Atendimentos         | Individual e coletivo básicos                 | Agenda e modelos na fase 2              |
| 5. Aprendizagem         | Categoria e ações textuais                    | Planos e evolução na fase 2             |
| 6. Frequência           | Registrar uma preocupação de infrequência     | Cálculos e importações na fase 2        |
| 7. Tutoria              | Atribuição, prazo e devolutiva                | Análises e sessões na fase 2            |
| 8. Família              | Contato e resultado como evento               | Agenda e acordos estruturados na fase 2 |
| 9. Inclusão             | Encaminhar sem criar prontuário especializado | PEI, AEE e estudos de caso na fase 4    |
| 10. Encaminhamentos     | Internos e registro dos externos              | Integrações externas na fase 4          |
| 11. Relatórios          | Filtros, PDF individual e CSV                 | XLSX e comparativos na fase 2           |
| 12. Administração       | Permissões, auditoria e backups               | Billing na fase 3; SSO na fase 4        |

Agenda, modelos, ações preventivas e pautas ficam na fase 2. Anexos mínimos e segurança entram no core porque suportam o fluxo e os dados já previstos na origem.

## 5. Requisitos funcionais do core

### RF01 — Organização, acesso e primeiro uso

Criar escola piloto por convite administrativo. O responsável informa nome, fuso, ano letivo e nomenclaturas. Convida profissionais, cria turmas e importa ou cadastra estudantes. A página inicial oferece uma lista curta de configuração e a ação “Registrar situação”. Não exigir pagamento no piloto.

Aceite: convite expira e é de uso único; usuário desativado perde acesso; uma pessoa vinculada a duas escolas escolhe explicitamente a escola ativa; a troca não exibe resultados em cache da escola anterior.

### RF02 — Estudantes, turmas e responsáveis

Campos mínimos: nome, identificador/matrícula escolar, ano letivo, turma e situação da matrícula. Dados de responsáveis e contatos são opcionais até haver necessidade operacional. CPF, foto, endereço completo e informações de saúde não são obrigatórios para iniciar.

Manter matrícula por período para preservar o histórico após troca de turma. Importação CSV com modelo, prévia, validação por linha e resumo dos erros. Não sobrescrever homônimos por comparação de nome. Usar chave externa/matrícula no escopo da escola; ausência dessa chave exige resolução assistida.

Aceite: repetir uma importação não duplica os mesmos vínculos; mudança de turma preserva os registros anteriores; estudante arquivado continua no histórico permitido.

### RF03 — Registro inicial e abertura de caso

Campos: estudante(s), data e hora do fato, categoria, contexto/local opcional, descrição objetiva, autor, prioridade operacional e providência imediata. Categoria e prioridade podem ser corrigidas pela orientação com histórico. Protocolo legível único por escola/ano, acompanhado de ID técnico não sequencial exposto.

Um registro pode iniciar um caso ou ser vinculado a caso existente. Caso reúne registros e intervenções relacionados, com responsável principal. Não transformar cada observação automaticamente em novo caso. O piloto pode oferecer “Criar acompanhamento” e “Adicionar ao acompanhamento existente”.

Categorias iniciais sugeridas: aprendizagem, convivência, frequência, acompanhamento familiar e outros. Categorias sensíveis usam visibilidade restrita. Não aceitar envio sem estudante, descrição e categoria. Em atendimentos coletivos preventivos, permitir evento sem caso individual.

Aceite: envio duplicado por duplo clique/repetição de rede produz um único registro; usuário vê protocolo e próximo passo; permissão é validada no servidor.

### RF04 — Caso e linha do tempo

Tela com resumo, responsável, prioridade, situação, próxima ação e prazo; abaixo, eventos cronológicos. Separar informação operacional compartilhável de relatos e anexos restritos. A linha do tempo apresenta apenas os eventos permitidos ao leitor.

Estados do caso: Aberto, Em acompanhamento, Aguardando retorno, Concluído e Cancelado. Aberto pode avançar para Em acompanhamento; deste pode ir a Aguardando retorno e voltar. Conclusão exige resultado e responsável. Reabertura volta para Em acompanhamento e exige justificativa. Cancelamento exige motivo, por exemplo duplicidade, e não elimina auditoria.

“Atrasado” é condição calculada de uma providência com prazo vencido, não estado do caso. “Devolutiva recebida” é estado de uma atribuição, não conclusão automática do caso.

Aceite: histórico guarda autor/data das transições; não há edição silenciosa de relato publicado; correção gera versão ou adendo. Conflitos de edição exibem aviso, sem sobrescrever trabalho de outro profissional.

### RF05 — Encaminhamento e devolutiva

Cada atribuição tem caso, responsável, instrução mínima necessária, prazo e estado. Estados: Pendente, Em andamento, Devolutiva enviada, Aceita e Cancelada. O destinatário registra ação, resultado e eventual impedimento. A orientação aceita a devolutiva ou solicita complementação.

Permitir várias atribuições por caso. Responsável desativado exige reatribuição das pendências. Mudanças de prazo preservam valor anterior e motivo. Prazos usam o fuso da escola; inicialmente são datas/horas corridas, sem calendário de dias úteis implícito.

Encaminhamento externo registra órgão, data, profissional responsável, prazo de acompanhamento e resposta. Não concede acesso ao órgão nem envia dados automaticamente.

Aceite: caso não conclui com atribuições abertas sem resolver/cancelar cada uma com justificativa; lembretes não duplicam; profissionais veem apenas instruções e conteúdo autorizado.

### RF06 — Atendimentos e contatos familiares

Registrar escuta, orientação, mediação, reunião, contato familiar e atendimento coletivo. Campos: data, participantes, objetivo, síntese, compromissos e próximo passo. O registro pode se vincular a um caso.

Eventos coletivos mantêm dados compartilhados mínimos; observações individuais são registros separados e restritos. Contato com responsável inclui canal, destinatário, tentativa/realização e resultado. “Sem resposta” não significa concordância.

Aceite: consultar histórico de um estudante não revela automaticamente relatos individuais de outros envolvidos; registro de contato não dispara mensagem externa.

### RF07 — Painel operacional e notificações

Página inicial prioriza “Minhas pendências”, “Vencidos”, “Aguardando devolutiva” e “Próximos prazos”. Gestor autorizado pode alternar para visão da equipe. Cada número abre a lista com os mesmos filtros.

Alertas internos: nova atribuição, prazo próximo, prazo vencido e devolutiva recebida. Proposta inicial: lembrete no dia anterior e no vencimento, configurável pela escola. E-mails de acesso/convite entram no core; avisos operacionais por e-mail podem entrar após validar privacidade e preferência. Nenhuma notificação externa deve conter nome do estudante ou relato sensível.

Não exibir ranking de “piores estudantes”. Usar “acompanhamentos relacionados” para indicar repetição com contexto e revisão humana.

Aceite: indicadores respeitam as mesmas permissões das listas; notificações abrem somente recursos ainda autorizados; falha no job pode ser reprocessada sem duplicação.

### RF08 — Filtros, relatórios e exportações

Filtros combináveis: estudante, turma, período, categoria, prioridade, responsável, tutor, autor do encaminhamento e situação. Monitores são profissionais filtráveis por papel. Consultas paginadas no servidor. Na URL, manter filtros não sensíveis; nomes, relatos e busca livre sensível não devem ir para histórico de navegação ou logs de URL.

PDF individual com intervalo, seções selecionadas, autor/data da geração e identificação da escola. Prévia explicita o que será incluído. CSV de dados tabulares mínimos, sem texto sensível por padrão. Conteúdo restrito exige permissão específica de exportação. Neutralizar células interpretáveis como fórmulas em exportações.

Aceite: relatório aplica autorização a cada seção; tentativa de exportar outra escola falha; totais conciliam com a listagem sob o mesmo filtro; download fica auditado.

### RF09 — Documentos e administração

Anexos iniciais: PDF, JPEG e PNG, limite proposto de 10 MB por arquivo. Armazenamento privado, validação real do formato, verificação de malware/quarentena e links de curta duração emitidos após autorização. Remover arquivos temporários e órfãos por rotina controlada.

Administrador configura profissionais, vínculos, categorias e permissões operacionais aprovadas. Não pode se conceder acesso sigiloso apenas por ser administrador técnico. Mudanças em permissões restritas exigem concessão por responsável autorizado e trilha de auditoria.

Aceite: anexos herdam restrição do registro; saber o caminho do arquivo não permite baixá-lo; acesso, exportação, edição e alterações de permissão são auditados.

## 6. Direção de UX e referências pesquisadas

A pesquisa usa páginas oficiais públicas e documentação de produtos; não é uma auditoria dos aplicativos autenticados. As adaptações abaixo são recomendações de design, não reprodução das marcas ou comprovação de usabilidade na escola.

| Referência        | Padrão útil                                                  | Aplicação proposta                                                                 |
| ----------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| CPOMS StudentSafe | Registro de situações, casos relacionados e rastreabilidade  | Histórico contextual e separação entre registro, caso e providência                |
| Linear            | Listas com agrupamento, propriedades e modos de visualização | Lista de pendências objetiva, filtros claros e detalhe ao selecionar um item       |
| Linewize Pulse    | Indicadores de bem-estar orientados à ação                   | Painel com contexto e próximos passos; questionários estudantis ficam fora do core |
| shadcn/ui         | Base de componentes personalizáveis                          | Consistência de formulários, diálogos, menus e tabelas                             |

Não copiar a densidade de uma ferramenta para desenvolvedores. O usuário escolar precisa de rótulos explícitos, ajuda junto ao campo e botões com verbos: “Registrar situação”, “Encaminhar”, “Enviar devolutiva” e “Concluir acompanhamento”.

### Navegação e telas

Menu principal: Visão geral, Estudantes, Acompanhamentos, Minhas pendências e Relatórios. Configurações aparecem conforme permissão. Agenda e módulos especializados só aparecem quando habilitados.

| Tela                | Hierarquia e comportamento                                                           |
| ------------------- | ------------------------------------------------------------------------------------ |
| Visão geral         | Até quatro indicadores, lista prioritária e próximos prazos; gráficos secundários    |
| Estudantes          | Busca, turma e situação; nome, turma e tutor na lista; sem exposição de diagnósticos |
| Perfil do estudante | Resumo, acompanhamentos e histórico; contatos em seção própria                       |
| Novo registro       | Uma página curta com campos essenciais e detalhes opcionais recolhidos               |
| Detalhe do caso     | Cabeçalho de contexto, próxima ação, atribuições e linha do tempo                    |
| Minhas pendências   | Ordenação por prazo; ação direta para devolver; filtros simples                      |
| Relatórios          | Escopo, período, prévia e exportação consciente                                      |

Desktop: menu lateral de aproximadamente 240 px; conteúdo com respiro de 24–32 px. Detalhe rápido em painel lateral, com opção de página completa. Celular: menu recolhido, itens em cartões e formulários em uma coluna; sem depender de hover. Dados essenciais permanecem legíveis em 360 px de largura.

### Paletas propostas

Paletas originais sugeridas para o SOE; não são cores oficiais das referências. Recomenda-se a A para o piloto.

| Token             | A — Verde acolhedor | B — Azul institucional |
| ----------------- | ------------------- | ---------------------- |
| Primária          | #0F766E             | #1D4ED8                |
| Primária hover    | #115E59             | #1E40AF                |
| Fundo geral       | #F8FAFC             | #F8FAFC                |
| Superfície        | #FFFFFF             | #FFFFFF                |
| Texto principal   | #0F172A             | #0F172A                |
| Texto secundário  | #475569             | #475569                |
| Borda decorativa  | #E2E8F0             | #E2E8F0                |
| Borda de controle | #64748B             | #64748B                |
| Destaque suave    | #CCFBF1             | #DBEAFE                |

Tokens semânticos comuns: sucesso #166534 sobre #DCFCE7; atenção #92400E sobre #FEF3C7; erro/atraso #B91C1C sobre #FEE2E2; informação #1D4ED8 sobre #DBEAFE. Botão primário usa texto branco. Prioridade, status e restrição sempre têm texto/ícone além da cor. Reservar vermelho para erro e urgência operacional, não para identificar estudantes.

Tema escuro é posterior ao piloto; não duplicar o trabalho visual antes de validar fluxos. Personalização de marca por escola também é posterior, preservando cores semânticas e contraste.

### Tipografia, espaço e componentes

- Fonte sugerida: Inter, hospedada junto à aplicação, com fallback system-ui, sans-serif; outra fonte de sistema é aceitável para reduzir dependências.
- Corpo e campos: 16 px, entrelinha 1,5; tabelas: 14–16 px; metadados: 12–14 px; títulos: 24–32 px, peso 600.
- Escala de espaços: 4, 8, 12, 16, 24, 32 e 48 px. Cantos: 8 px em campos e 12 px em cartões. Sombras discretas somente onde houver elevação.
- Alvos de interação preferencialmente com 44 px; foco visível, labels persistentes, ordem de tabulação coerente e mensagens ligadas aos campos.
- Meta de acessibilidade: WCAG 2.2 AA; testar contraste, teclado, leitor de tela, zoom e cores nas combinações reais antes da entrega.
- Estados obrigatórios: carregando, vazio, erro, sem permissão, perda de conexão, salvando e conflito de edição. Estado vazio explica a próxima ação.
- Evitar salvar relatos sensíveis no armazenamento persistente do navegador. Rascunho no servidor pode ser adicionado com autorização e prazo de expiração; no core, avisar sobre alterações não salvas.

### Referências obrigatórias de design e animação

Regra normativa: antes de criar ou alterar telas, componentes, identidade visual ou animações, consultar as skills e referências abaixo. Tailwind CSS continua sendo a base obrigatória de estilização. As diretrizes desta seção complementam as regras técnicas da seção 7 e também são obrigatórias.

| Recurso                 | Papel no SOE                                                                                        | Estado informado                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Taste                   | Referência obrigatória para decisões de design, hierarquia, tipografia, composição e revisão visual | Skill já instalada no ambiente do usuário                                                      |
| Hairline                | Figuras ilustrativas para estados vazios e onboarding                                               | Skill já instalada no ambiente do usuário; dependência runtime deve ser configurada no projeto |
| Transitions.dev Library | Referência obrigatória para transições e componentes animados                                       | Skill/MCP com instruções abaixo; instalação não realizada nesta revisão                        |
| Tailwind CSS            | Layout, responsividade, tokens e estilos do produto                                                 | Base obrigatória da implementação                                                              |
| shadcn/ui e Lucide      | Componentes de interação e ícones operacionais                                                      | Mantidos; complementados pelas referências acima                                               |

Instalação informada pelo usuário não significa que as skills estão acessíveis em toda máquina ou sessão. Ao iniciar trabalho visual, localizar e ler o SKILL.md instalado, registrar sua versão quando disponível e consultar a documentação oficial atual. Não reinstalar Hairline/Taste sem necessidade. Nesta revisão foram consultadas as páginas públicas; as instalações locais do usuário não foram inspecionadas.

### Processo obrigatório de design

1. Consultar Taste antes de decidir layout, tipografia, densidade e cores. Para dashboard, cadastros e acompanhamento, usar sua orientação para telas de aplicativo, distinguindo-a da orientação para landing pages. [D1]
2. Identificar tarefa principal, público, dados e estados da tela. Manter a identidade aprovada: não sortear uma paleta ou estilo novo a cada funcionalidade.
3. Consultar Hairline ao definir ilustrações; consultar transitions.dev antes de adicionar ou modificar movimento. Documentar referência escolhida e adaptação ao SOE.
4. Implementar com Tailwind e componentes compartilhados. As skills orientam o agente; não são dependências runtime e não substituem a arquitetura do projeto.
5. Validar estados vazio, carregando, erro, sem permissão e sucesso; teclado, foco, toque e movimento reduzido. Revisar desktop, tablet e celular com dados sintéticos representativos.
6. Registrar na entrega os recursos consultados, decisão visual, componentes alterados e evidências de revisão. Scripts das skills só contam como executados quando houver resultado real.

As paletas e a Inter já propostas continuam como ponto inicial sujeito à revisão de design. Uma vez aprovada a identidade, todos os componentes usam seus tokens. Regras externas para páginas promocionais não impõem fotografias, efeitos ou quantidade mínima de animações nas telas operacionais. Acesso, legibilidade, privacidade e tarefas do SOE prevalecem; consultar uma referência não autoriza substituir stack ou mudar requisitos do produto.

### Integração da Hairline

Pacote: `@lucasmarkes/hairline`; entrada React: `@lucasmarkes/hairline/react`. A documentação apresenta figuras SVG e opções como theme, label, intensity e play. [D2]

Decisões próprias do SOE: encapsular os imports em `packages/ui/src/illustrations/` e exportar componentes sem dependência de domínio. Usar `packages/ui/src/components/empty-state.tsx` para combinar figura, título, descrição e ação recebidos por props. O módulo web fornece conteúdo e comportamento, sem levar regras escolares ao pacote ui.

| Cenário              | Figura inicial sugerida | Ação/texto funcional                                        |
| -------------------- | ----------------------- | ----------------------------------------------------------- |
| Filtro sem resultado | Sieve                   | “Nenhum resultado” e “Limpar filtros”                       |
| Lista ainda vazia    | Drawer                  | Explicar o primeiro cadastro e apresentar a ação autorizada |
| Relatório sem dados  | Plot                    | Explicar período e ausência de registros                    |

Importar apenas figuras utilizadas. Usar `play={false}` como padrão do SOE. Validar hidratação no Start; se houver dependência de DOM, isolar a figura em montagem cliente mantendo espaço reservado e texto/ação disponíveis no SSR. Não pressupor compatibilidade apenas por ser React.

Aplicar os tokens de cor através das propriedades CSS documentadas pela Hairline, incluindo `--hairline-plate` e `--hairline-hi`. Testar contraste e movimento reduzido; se a versão ainda responder com movimento, o wrapper deve fornecer alternativa estática. Ilustração nunca substitui feedback textual, gráfico real ou indicação de permissão.

### Transitions.dev com Tailwind

A biblioteca disponibiliza receitas CSS e React, inclusive exemplos de menus, modais, painéis e accordions. Não exige adotar um novo framework de estilos. [D3]

Regras do SOE: guardar tokens em `packages/ui/src/styles/motion.css` e receitas adaptadas em `packages/ui/src/motion/`; exportar wrappers pelo pacote ui. Layout, cores e espaçamento permanecem em Tailwind. CSS específico de keyframes/receitas é permitido dentro do design system; proibir estilos globais duplicados e colisões de seletores.

Usar movimento para comunicar abertura, fechamento, carregamento e confirmação. Priorizar opacity/transform quando adequados; não aplicar `transition: all`. Durações e easing vêm de tokens compartilhados revisados contra a referência. Não adicionar um segundo motor de animação sem necessidade técnica documentada.

Movimento reduzido deve preservar o resultado funcional sem deslocamento decorativo. Não atrasar foco, leitura, envio ou navegação para terminar animação. Manter semântica e gerenciamento de foco dos componentes shadcn; animação não é implementação de acessibilidade. Evitar confete, tremores, loops e efeitos chamativos em casos sensíveis. Receitas Pro só entram se houver licença; a consulta obrigatória não exige contratação do plano pago.

### Links e comandos de instalação do Transitions.dev

Fontes oficiais verificadas em 12/11/2026: Skill e instalação, MCP e configuração e biblioteca. Comandos abaixo são instruções para o ambiente de desenvolvimento; não foram executados nesta revisão.

Skill principal gratuita:

```sh
npx skills add Jakubantalik/transitions.dev
```

Skill complementar de refinamento de animações:

```sh
npx skills add Jakubantalik/transitions.dev -s transitions-polish
```

A opção Pro é instalada por `npx transitions-dev skill` e exige assinatura correspondente. A documentação indica suporte da skill ao Codex e outros agentes. [D4]

MCP no Codex CLI — exige plano Pro ou Business e autenticação:

```sh
codex mcp add transitions-ui --url https://api.transitions.dev/ui/mcp
codex mcp login transitions-ui
```

Depois do login, iniciar uma nova conversa no Codex. Para outro cliente compatível, seguir as instruções oficiais e configurar o endpoint HTTP https://api.transitions.dev/ui/mcp. [D5]

A instalação da skill do agente não instala componentes no app. Adicionar somente receitas necessárias ao código, revisar licença e dependências e manter Tailwind. Não salvar conteúdo escolar no Studio externo nem enviar dados reais para gerar exemplos; usar conteúdo sintético. Documentar versão/revisão das receitas adotadas para tornar alterações rastreáveis.

## 7. Stack TanStack e pacotes

Decisão obrigatória: monorepo TypeScript com pnpm e Turborepo. TanStack Start cuida do web e SSR; NestJS concentra API, autorização e casos de uso; PostgreSQL com Prisma ORM mantém os dados; worker NestJS executa tarefas demoradas. API e worker compartilham módulos backend sem importar código entre apps. A organização e as regras da seção 7.1 em diante prevalecem sobre exemplos genéricos de frameworks.

A documentação consultada apresenta Start como estável e React Server Components como experimental. Usar os recursos estáveis e verificar versões compatíveis no início da implementação. Não usar latest sem lockfile em builds reprodutíveis. [T1]

| Pacote                          | Para que serve                                           | Uso no SOE                                                | Momento                               |
| ------------------------------- | -------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------- |
| @tanstack/react-start           | Framework full stack, SSR e funções/rotas de servidor    | Aplicação web e SSR; negócio exclusivamente na API NestJS | Core                                  |
| @tanstack/react-router          | Rotas tipadas, layouts, parâmetros e carregamento        | Navegação, filtros seguros e rotas por escola             | Core; integrado ao Start              |
| @tanstack/react-query           | Consulta, cache, mutações e invalidação de dados remotos | Casos, estudantes, pendências e indicadores               | Core                                  |
| @tanstack/react-form            | Estado de formulário e validação                         | Registro de situação, cadastro e devolutiva               | Core                                  |
| @tanstack/react-table           | Lógica headless de tabelas                               | Colunas, ordenação, filtros e paginação                   | Core                                  |
| @tanstack/react-query-devtools  | Inspeção do cache e requisições                          | Depuração de invalidação e erros                          | Somente desenvolvimento               |
| @tanstack/react-router-devtools | Inspeção de rotas                                        | Depuração de navegação e parâmetros                       | Somente desenvolvimento               |
| @tanstack/react-virtual         | Renderizar só os itens visíveis                          | Históricos muito longos após medição                      | Opcional; paginação primeiro          |
| @tanstack/react-pacer           | Debounce, throttle e coordenação de chamadas             | Busca enquanto digita                                     | Opcional; validar maturidade/versão   |
| @tanstack/react-store           | Estado reativo local compartilhado                       | Preferências temporárias complexas de UI                  | Só se React local/contexto não bastar |
| @tanstack/react-db              | Coleções reativas, consultas locais e mutações otimistas | Possível experiência colaborativa futura                  | Fora do core                          |

TanStack DB não substitui PostgreSQL, autorização ou backend. Recursos de sincronização, persistência local e tratamento de conflitos precisam de projeto próprio; instalar DB não torna a aplicação automaticamente offline. Não adicionar TanStack AI sem um caso de uso aprovado. [T2–T8]

### Contrato de integração entre Router e Query

Definir queryOptions compartilhadas. Loaders do Router podem antecipar os dados com ensureQueryData; componentes usam as mesmas chaves e opções. Evitar buscar o mesmo recurso com dois caches independentes.

Chaves de cache incluem organização, escopo de acesso, recurso e filtros normalizados. Criar QueryClient isolado por requisição no servidor. Na troca de escola/logout, cancelar requisições e limpar caches apropriados. Alteração de permissão invalida consultas. Não persistir cache de relatos em localStorage/IndexedDB.

Filtros e paginação ocorrem no servidor; TanStack Table controla a UI. TanStack Form apresenta validação, mas todos os dados são revalidados na API NestJS. Mutações invalidam detalhe, timeline, listas e indicadores afetados. Encerramento e mudança de acesso aguardam confirmação do servidor, evitando estados otimistas enganosos.

### Pacotes e serviços complementares

Prisma/PostgreSQL e ferramentas marcadas como obrigatórias na seção 7.10 são decisões de arquitetura. Fornecedores e adapters indicados como candidatos exigem validação de compatibilidade, manutenção e licença no spike inicial.

| Escolha sugerida                                      | Finalidade e limite                                                                                                              |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| PostgreSQL + Prisma ORM                               | Persistência e migrações obrigatórias; acesso restrito a adapters backend e pacote database                                      |
| Better Auth (better-auth)                             | Candidato para sessões/login/MFA hospedado no NestJS; validar integração com Prisma; não instalar autenticação paralela no Start |
| Zod (zod)                                             | Contratos de entrada validados no cliente e servidor                                                                             |
| Tailwind CSS + shadcn/ui                              | Estilo e componentes adaptados à identidade do SOE; shadcn distribui código de componentes                                       |
| Hairline (@lucasmarkes/hairline)                      | Figuras SVG encapsuladas em ui; consultar skill já instalada e documentação                                                      |
| Taste e Transitions.dev                               | Consulta obrigatória de design/movimento; ferramentas do agente, não frameworks de estilo                                        |
| Lucide (lucide-react)                                 | Ícones consistentes acompanhados de rótulos                                                                                      |
| Recharts (recharts)                                   | Gráficos simples com resumo textual e tabela acessível                                                                           |
| date-fns + suporte de fuso                            | Formatação pt-BR e datas; armazenar instantes em UTC e apresentar no fuso escolar                                                |
| Papa Parse (papaparse)                                | Leitura de CSV com validação própria e limites de tamanho                                                                        |
| @react-pdf/renderer                                   | PDF individual gerado a partir de dados já autorizados                                                                           |
| ExcelJS (exceljs)                                     | XLSX na fase 2; executar exportações grandes em job                                                                              |
| SDK de storage compatível com S3                      | Upload privado e URLs temporárias; políticas de acesso no servidor                                                               |
| pg-boss                                               | Fila de jobs PostgreSQL adotada, encapsulada em adapter e consumida por worker NestJS separado                                   |
| Vitest, Testing Library, Jest, Supertest e Playwright | Unidades e UI, integração Nest/HTTP e jornadas críticas; divisão normativa na seção 7.10                                         |
| Serviço de erros e métricas                           | Observabilidade sem nomes, relatos, anexos ou gravação de sessão sensível                                                        |

Hospedagem proposta: processos Node separados para Start, API NestJS e worker NestJS, PostgreSQL gerenciado e storage privado. Se escolher funções serverless, usar pool de conexões adequado e worker externo; não depender de execução em segundo plano após encerrar uma requisição. Comparar custos, região, backups e subprocessadores antes de contratar.

### 7.1 Decisões obrigatórias de arquitetura

Esta seção é normativa para desenvolvedores e agentes de código: DEVE indica obrigação e PROIBIDO indica bloqueio de entrega. As regras valem desde o primeiro commit, inclusive no piloto. Não existem exceções automáticas por prazo, protótipo ou conveniência. Mudanças de arquitetura exigem decisão explícita do responsável pelo produto, ADR aprovada e atualização deste PRD antes da implementação. Uma ADR isolada não autoriza violar uma regra vigente.

Stack definida: TypeScript estrito, pnpm workspaces, Turborepo, TanStack Start/React no web, NestJS na API e no processo de worker, PostgreSQL e Prisma ORM. NestJS é o framework de backend; PostgreSQL é o banco; Prisma é a camada de acesso ao banco. Não usar Drizzle nem adicionar um segundo ORM.

O backend será um monólito modular, executável como API e worker separados e com módulos de negócio compartilhados. Não adotar microsserviços no core. Turborepo coordena o workspace; não criar um segundo workspace com modo monorepo do Nest CLI dentro dele.

### 7.2 Pesquisa de arquiteturas para o frontend

| Organização analisada                      | Base da pesquisa                                                                               | Decisão para o SOE                                                                      |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Organização centrada em rotas              | Start usa rotas baseadas em arquivos; Router aceita arquivos, diretórios e combinação dos dois | Usar para navegação; não concentrar funcionalidades nos arquivos de rota                |
| Colocação de código perto das rotas        | Router oferece convenções para excluir arquivos da árvore de rotas                             | Não usar como padrão de negócio; formulários e consultas ficam em módulos reutilizáveis |
| Feature-Sliced Design                      | Documentação própria define camadas, fronteiras e APIs públicas                                | Aproveitar encapsulamento e APIs públicas; não alegar adoção integral do FSD            |
| Módulos por funcionalidade com rotas finas | Síntese das convenções de Start/Router e separação de responsabilidades                        | Arquitetura adotada, detalhada abaixo                                                   |

Não há, nas fontes consultadas, uma exigência oficial do TanStack para usar FSD ou Clean Architecture. A organização modular abaixo é uma decisão específica deste projeto. [A1–A5]

### 7.3 Estrutura obrigatória do monorepo

Todos os caminhos são relativos à raiz do repositório. A tabela é o mapa de pastas; diretórios de funcionalidades futuras só devem ser criados quando houver implementação.

| Caminho                     | Responsabilidade                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| apps/web/                   | Aplicação TanStack Start, SSR e interface React                                                                                 |
| apps/api/                   | Bootstrap NestJS, controladores HTTP, guards, pipes e composição da API                                                         |
| apps/worker/                | Bootstrap NestJS sem servidor HTTP público e consumidores de jobs                                                               |
| packages/backend/           | Módulos de domínio, casos de uso, portas, adapters e composição Nest reutilizáveis por API/worker; pacote exclusivo de servidor |
| packages/database/          | Configuração Prisma, definição persistente, migrações, geração do cliente e ciclo de conexão; exclusivo de servidor             |
| packages/contracts/         | Schemas Zod de entrada/saída HTTP e envelopes de erro/paginação; sem regras de negócio                                          |
| packages/api-client/        | Transporte HTTP tipado com fetch injetável; sem React, Nest ou Prisma                                                           |
| packages/ui/                | Design system Tailwind, componentes genéricos, wrappers Hairline e receitas Transitions.dev; sem conceitos de estudante ou caso |
| packages/eslint-config/     | Configuração de lint compartilhada                                                                                              |
| packages/typescript-config/ | Configurações TypeScript por runtime                                                                                            |
| packages/test-utils/        | Utilitários de teste neutros, usados apenas como dependências de desenvolvimento                                                |
| docs/architecture/          | Matriz de dependências, decisões e convenções                                                                                   |
| docs/adr/                   | Registros de decisões de arquitetura                                                                                            |
| docs/runbooks/              | Migração, restauração, incidentes, implantação e jobs                                                                           |
| infra/compose.yaml          | PostgreSQL, storage compatível com S3 e serviço de e-mail de desenvolvimento                                                    |
| .github/workflows/          | CI e implantação; adaptar apenas se o provedor de Git escolhido for outro                                                       |
| package.json                | Scripts de orquestração e versão fixada do gerenciador                                                                          |
| pnpm-workspace.yaml         | Somente padrões apps/* e packages/*                                                                                             |
| pnpm-lock.yaml              | Lockfile único, versionado                                                                                                      |
| turbo.json                  | Grafo de tarefas, cache e dependências de build                                                                                 |
| .dependency-cruiser.cjs     | Regras executáveis de dependência por camada/pacote                                                                             |
| AGENTS.md                   | Instruções para agentes derivadas destas regras, a criar no bootstrap                                                           |

Cada app/pacote possui package.json, nome único @soe/_, tsconfig.json, dependências explícitas e exports públicos quando aplicável. Dependências internas usam workspace:_. Apps são folhas do grafo: nenhum pacote nem outro app importa código de apps/*. Não usar aliases que atravessem a raiz de outro pacote; imports internos de workspace passam pelos exports. [A6]

### 7.4 Estrutura obrigatória do web

| Caminho em apps/web/                                                | Conteúdo permitido                                                                            |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| src/router.tsx                                                      | Factory do Router e integração com o contexto Query/HTTP por instância                        |
| src/routeTree.gen.ts                                                | Arquivo gerado pelo Router; nunca editar manualmente                                          |
| src/routes/__root.tsx                                               | Documento raiz, providers e tratamento global de erro                                         |
| src/routes/login.tsx                                                | Configuração da rota de login e composição da página                                          |
| src/routes/_authenticated.tsx                                       | Layout autenticado e verificação inicial de sessão para UX                                    |
| src/routes/_authenticated/schools/$organizationId/route.tsx         | Layout da escola selecionada                                                                  |
| src/routes/_authenticated/schools/$organizationId/cases/index.tsx   | Rota da lista de acompanhamentos                                                              |
| src/routes/_authenticated/schools/$organizationId/cases/$caseId.tsx | Rota de detalhe do acompanhamento                                                             |
| src/pages/case-detail/                                              | Composição de tela que pode combinar módulos pela API pública                                 |
| src/modules/cases/ui/                                               | Componentes específicos de acompanhamentos                                                    |
| src/modules/cases/model/                                            | Estado de apresentação, mapeamento para view model e validadores específicos de UI            |
| src/modules/cases/data/                                             | Chamadas ao api-client, factories de queryOptions, query keys e hooks de mutação              |
| src/modules/cases/index.ts                                          | Exports públicos explícitos do módulo                                                         |
| src/modules/students/                                               | Mesma divisão para estudantes                                                                 |
| src/modules/referrals/                                              | Mesma divisão para encaminhamentos/devolutivas                                                |
| src/modules/identity/                                               | Sessão atual, login e seleção de escola; sem decidir autorização de negócio                   |
| src/shared/                                                         | Helpers e hooks independentes de funcionalidades; sem virar depósito de regras                |
| src/app/                                                            | Providers e composição global da aplicação                                                    |
| src/server/                                                         | Adapters exclusivamente server-side para SSR e encaminhamento autorizado de credenciais à API |
| src/styles/                                                         | Estilos globais e ligação com tokens de @soe/ui                                               |
| tests/                                                              | Integração e jornadas web; testes unitários podem ficar junto do código                       |

O prefixo _authenticated representa layout sem adicionar esse segmento à URL. Validar a árvore gerada no CI e manter as convenções padrão do Router. Não misturar sintaxe de rotas de Next.js, como [id] ou page.tsx, com Start. [A1, A2]

Regras de frontend:

1. Rotas contêm configuração, validação de parâmetros, beforeLoad/loader e composição de páginas. Não contêm formulários completos, lógica de negócio ou consultas SQL.
2. Páginas podem combinar módulos. Um módulo não importa outro módulo diretamente; integração visual acontece na página, por props/callbacks tipados. Código realmente genérico pode descer para shared ou ui.
3. Dentro de um módulo, ui pode usar model e data; data pode usar model e contratos; model não importa ui nem data. Exports públicos não podem criar ciclos com imports internos.
4. Estado remoto pertence a Query; estado de formulário a Form; filtros públicos compartilháveis ao Router; estado efêmero ao React. Store só entra se houver necessidade documentada. Não duplicar a mesma fonte de verdade.
5. React Query acessa a API NestJS por @soe/api-client. É proibido espalhar fetch em componentes, criar uma segunda API de negócio em server functions ou importar @soe/backend, @soe/database, Nest ou Prisma no web, inclusive em seu servidor SSR.
6. src/server só pode ser importado por entrypoints server-only reconhecidos pelo Start. O sufixo de arquivo sozinho não é mecanismo de segurança. Usar os mecanismos oficiais de isolamento e verificar o bundle cliente. [A3]
7. Uma server function do Start, se necessária, é apenas adapter para o NestJS e não decide permissão nem executa persistência. Preferir acesso HTTP direto à API através do ingress compartilhado.
8. Negócio e autorização permanecem no NestJS. Desabilitar um botão, validar um formulário ou redirecionar beforeLoad melhora UX, mas não autoriza uma operação.

### 7.5 Router, Query, SSR e comunicação HTTP

O ingress público usa uma origem: /api/v1/* e endpoints de autenticação são encaminhados ao NestJS; demais rotas ao Start. O navegador envia cookie de sessão HttpOnly/Secure, com política SameSite e proteção CSRF validadas. O NestJS é a autoridade de sessão; o web não mantém uma identidade paralela. Better Auth permanece candidato somente como adapter hospedado no backend, sujeito a spike com NestJS/Prisma/MFA; não usar o guia Start para instalar uma segunda autenticação.

No SSR, usar URL interna fixa e confiável da API e encaminhar somente credenciais/cabeçalhos permitidos da requisição corrente. Nunca aceitar host destino fornecido pelo usuário. Cliente HTTP, Router e QueryClient são criados por requisição no servidor; no navegador, pertencem à sessão corrente. Nenhum singleton server-side pode compartilhar cookies, tenant ou cache entre usuários.

Factories de queryOptions recebem o client da execução; loaders usam ensureQueryData com as mesmas opções consumidas pelos componentes. Configurar hidratação/deidratação com a integração oficial compatível com a versão escolhida. Só serializar dados autorizados necessários à página; nunca segredos de sessão. SSR autenticado não utiliza cache público/CDN. [A4]

Query key: recurso + organização + contexto de sessão/permissão + identificadores + filtros. Logout e troca de escola cancelam requisições e descartam caches anteriores. Atualização de permissão invalida os dados; a API sempre revalida a autorização. Não persistir relatos em cache local do navegador.

Filtros de URL são validados; buscas sensíveis não entram na URL. Consultas e tabelas são paginadas/filtradas na API. Cancelamento propaga AbortSignal ao fetch. Retry automático aplica-se somente a falhas transitórias de leitura; nunca repetir mutação não idempotente nem 401/403 indefinidamente.

REST versionado com schemas em @soe/contracts. Nest valida entrada através de pipe que usa esses schemas e mapeia para comandos de aplicação. Respostas são DTOs explícitos, nunca objetos Prisma. Manter OpenAPI gerado dos contratos/metadata compatíveis e testar divergências; não manter dois schemas manuais para o mesmo payload. Datas em ISO 8601, IDs opacos, paginação limitada e erros com código estável, mensagem segura, campos inválidos e correlationId.

### 7.6 Estrutura obrigatória do backend

| Caminho                                                         | Responsabilidade                                                            |
| --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| apps/api/src/main.ts                                            | Inicialização, limites HTTP, segurança e encerramento gracioso              |
| apps/api/src/app.module.ts                                      | Composição do processo HTTP                                                 |
| apps/api/src/modules/cases/cases.controller.ts                  | Converter HTTP em comando/query e chamar caso de uso                        |
| apps/api/src/modules/cases/cases-http.module.ts                 | Importar composição backend e registrar controller                          |
| apps/api/src/common/guards/                                     | Validar sessão e construir contexto autenticado                             |
| apps/api/src/common/pipes/                                      | Validar contratos de transporte                                             |
| apps/api/src/common/filters/                                    | Mapear erros de aplicação para HTTP, sem stack sensível                     |
| packages/backend/src/modules/cases/domain/                      | Entidades, value objects, invariantes e eventos puros                       |
| packages/backend/src/modules/cases/application/use-cases/       | Abrir, encaminhar, concluir e reabrir casos                                 |
| packages/backend/src/modules/cases/application/ports/           | CaseRepository, UnitOfWork e interfaces estritamente necessárias            |
| packages/backend/src/modules/cases/application/models/          | Comandos, resultados e projeções independentes de HTTP/ORM                  |
| packages/backend/src/modules/cases/infrastructure/prisma/       | Implementação de repositórios, consultas e mapeadores Prisma                |
| packages/backend/src/modules/cases/infrastructure/integrations/ | Adapters para portas que consultam outros módulos                           |
| packages/backend/src/modules/cases/composition/                 | Módulo Nest, tokens e factories de injeção                                  |
| packages/backend/src/modules/cases/public.ts                    | Contratos de aplicação explicitamente expostos                              |
| packages/backend/src/shared/domain/                             | Primitivos de domínio efetivamente comuns, sem frameworks                   |
| packages/backend/src/shared/application/                        | Contexto autenticado, clock, IDs e contratos transacionais comuns           |
| packages/backend/src/platform/                                  | Adapters técnicos de autenticação, logs, storage, fila e configuração       |
| packages/database/prisma/                                       | Fonte do modelo persistente e migrações da versão Prisma fixada             |
| packages/database/src/                                          | Factory de conexão/cliente, integração do driver e exports somente servidor |
| packages/database/generated/                                    | Cliente gerado quando exigido pela versão; nunca editar manualmente         |
| apps/worker/src/main.ts                                         | Inicialização do contexto Nest e shutdown                                   |
| apps/worker/src/processors/                                     | Desserializar job, resolver contexto e chamar caso de uso compartilhado     |

Repetir a divisão do módulo cases para identity/access, organizations, students, referrals, records, notifications, documents e reporting conforme forem entregues. Evitar criar dezenas de pacotes de domínio antes de necessidade real. O pacote backend compartilha código entre processos; não é acessível ao frontend.

### 7.7 Clean Architecture e direção dos imports

A regra central é que código de negócio não depende de detalhes externos. Fluxo de execução e direção de import não são a mesma coisa: um caso de uso chama uma porta; o adapter Prisma implementa essa porta. [A7]

| Origem                               | Pode importar                                       | Não pode importar                                                                 |
| ------------------------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------- |
| Backend domain                       | Próprio domínio e shared/domain puro                | Nest, Prisma, React, Zod HTTP, contratos de transporte, aplicação, infrastructure |
| Backend application                  | Próprio domain, portas e shared/application         | Nest/decorators, Prisma, HTTP, infrastructure e composição                        |
| Backend infrastructure               | Application/domain, database e adapters necessários | Controllers/apps e UI                                                             |
| Backend composition                  | Camadas do módulo e Nest para montar dependências   | Regras de negócio próprias                                                        |
| API controllers/processors de worker | API pública de aplicação, contratos e composição    | Prisma, repositório concreto ou acesso direto ao banco                            |
| Frontend pages/routes                | APIs públicas de módulos web e shared/ui            | Backend/database e internals de módulos                                           |
| Frontend shared/ui                   | Utilidades genéricas e bibliotecas de UI            | Módulos de negócio e transporte específico de casos                               |
| contracts/api-client                 | Schemas e transporte neutro                         | Backend, banco, React e segredo de ambiente                                       |

Domain e application são TypeScript puro, sem @Injectable, @Inject, HttpException ou tipos Prisma. O Nest usa providers com tokens e useFactory na composição para instanciar casos de uso por constructor injection. Erros de domínio/aplicação são próprios e mapeados para HTTP no adapter. [A8]

Um módulo de backend não importa infraestrutura, tabelas via repository ou domínio interno de outro. Necessidades entre módulos são portas do consumidor implementadas por adapters que chamam a API pública de aplicação do provedor. A composição resolve os vínculos; o grafo deve continuar acíclico. Se aparecer ciclo, revisar limites/orquestração. É proibido usar forwardRef para encobrir uma dependência arquitetural circular.

O frontend aplica separação de apresentação, estado e transporte, sem replicar entidades e casos de uso do backend. Não criar classes, interfaces ou repositórios de frontend apenas para repetir fetch. Clean Architecture protege decisões de negócio; não exige uma camada sem responsabilidade entre cada função.

### 7.8 SOLID traduzido em regras verificáveis

| Princípio                    | Regra obrigatória                                                                                                                    | Evidência                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| S — Responsabilidade única   | Controller adapta HTTP; caso de uso executa uma intenção; entidade protege invariantes; repository persiste; componente apresenta    | Review e testes separados por responsabilidade                                |
| O — Aberto para extensão     | Variações reais de storage, comunicação e persistência ficam atrás de portas; não espalhar decisões de fornecedor pelos casos de uso | Adapter substituível sem alterar domínio                                      |
| L — Substituição             | Adapters respeitam a mesma semântica de tenant, erro, inexistência e concorrência                                                    | Testes de contrato executados contra fake e implementação real onde aplicável |
| I — Segregação de interfaces | Portas pequenas orientadas ao consumidor; separar leitura e gravação quando seus consumidores diferirem                              | Nenhum adapter obrigado a implementar métodos que não suporta                 |
| D — Inversão de dependência  | Application declara interfaces; infrastructure implementa; composition injeta                                                        | Regras de import e teste de caso de uso sem Nest/DB                           |

Proibidos: BaseService com todas as regras, GenericRepository que exponha Prisma ao domínio, services com centenas de operações desconexas, any para contornar contratos, acesso global ao client Prisma e barrel export * que exponha internals. unknown deve ser validado/narrowed. Interfaces devem representar fronteiras reais; SOLID não obriga herança nem abstração especulativa.

### 7.9 Prisma, transações e multi-inquilino

Somente packages/database e adapters de infraestrutura aprovados usam Prisma. O domínio não conhece modelo gerado, filtro ORM ou transação Prisma. Repositórios convertem registro persistente em entidade/projeção. Listagens podem usar projeções read-only de aplicação sem montar um agregado completo; isso não autoriza expor modelos ORM.

O repositório recebe contexto de organização autenticado e filtra leitura, escrita, contagem, agregação e exportação. Consultar somente por ID é proibido em entidade escolar. Relações incluem integridade de organização, por constraints compostas ou validação transacional equivalente. organizationId vindo da URL só se torna contexto depois de validar Membership. Autor e permissões nunca vêm de campos confiados do body.

Caso de uso depende de UnitOfWork que fornece repositories e audit/outbox no mesmo contexto transacional. O adapter Prisma implementa a transação; seu tipo não vaza. Concluir caso, verificar pendências, atualizar versão e gravar auditoria/outbox exige consistência contra concorrência: bloquear registros pertinentes ou usar isolamento/controle de versão adequado; não fazer leitura prévia desprotegida seguida de update independente.

Eventos externos e envio de e-mail ocorrem após commit através de outbox e jobs idempotentes. Não fazer chamadas de rede longas dentro da transação. Retentativas de conflito devem ser limitadas e seguras. Prisma não oferece isolamento de tenant automaticamente. Se adicionar RLS, configurar contexto por transação, testar pooling e usar papel sem bypass.

Prisma tem diferenças entre versões principais. No bootstrap, fixar uma única versão suportada de ORM/CLI/client/adapter, registrar em ADR e usar os comandos e artefatos dessa mesma versão. Este PRD não mistura comandos antigos de migrate com APIs de versões novas. Scripts do pacote database abstraem db:generate, db:validate, db:migrate:dev e db:migrate:deploy; os comandos internos devem ser os oficialmente documentados para a versão fixada. [A9, A10]

Migrações são versionadas, revisadas, ensaiadas em banco temporário e executadas uma vez pelo job de release. É proibido usar sincronização destrutiva de schema, reset, seed real ou migração de desenvolvimento em produção. Evoluções incompatíveis usam expandir/migrar/contrair, mantendo compatibilidade entre releases. Seeds só usam dados sintéticos. SQL manual, quando necessário, é parametrizado, revisado e permanece na infraestrutura/migração.

### 7.10 Ferramental obrigatório e responsabilidades

| Ferramenta                               | Uso obrigatório                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| pnpm + Turborepo                         | Instalação única e execução do grafo de tarefas; versões fixadas                                 |
| TypeScript strict                        | strict, noUncheckedIndexedAccess e exactOptionalPropertyTypes nos pacotes próprios               |
| ESLint + typescript-eslint               | Correção e regras de imports; configs por runtime                                                |
| Prettier                                 | Formatação única; evitar formatter concorrente                                                   |
| dependency-cruiser                       | Bloquear ciclos, camadas invertidas, imports internos e dependências servidor → bundle web       |
| NestJS + Config                          | Composição backend e configuração validada no boot                                               |
| Prisma + PostgreSQL                      | Persistência, geração e evolução do modelo                                                       |
| Zod                                      | Contratos HTTP e ambiente; validação de negócio continua no domínio                              |
| TanStack Start/Router/Query/Form/Table   | Framework web e responsabilidades da tabela principal                                            |
| Tailwind + shadcn/ui + Lucide + Hairline | Estilos, componentes, ícones e figuras; Taste orienta design e Transitions.dev orienta movimento |
| Vitest + Testing Library                 | Frontend e unidades puras do backend                                                             |
| Jest + @nestjs/testing + Supertest       | Integração da composição Nest e HTTP; configuração isolada da suíte Vitest                       |
| Playwright                               | Jornadas reais em web/API e testes de acessibilidade integráveis                                 |
| PostgreSQL efêmero em CI                 | Testes reais de repository, migrations, constraints e concorrência                               |
| MSW                                      | Simulação HTTP em testes web; não substitui integração com API real                              |
| pg-boss                                  | Jobs duráveis no PostgreSQL, com adapters isolados do domínio                                    |
| Logging estruturado e OpenTelemetry      | Correlação web/API/worker; sem conteúdo escolar sensível                                         |
| Docker Compose                           | Ambiente local reproduzível; credenciais de exemplo sem segredos reais                           |

Versões exatas e compatibilidades são fixadas no bootstrap; não instalar pacotes experimentais como dependência crítica sem revisão da arquitetura. Cada pacote declara suas dependências; hoisting não é contrato. Builds e configuração de módulos ESM/CJS devem ser coerentes por runtime, sem importar TypeScript cru não suportado no Node de produção.

### 7.11 Tarefas, cache e pipeline

| Script/tarefa                                 | Comportamento obrigatório                                                        |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| pnpm dev                                      | turbo run dev; tarefas persistentes, sem cache                                   |
| pnpm build                                    | turbo run build; depende do build dos pacotes consumidos e da geração necessária |
| pnpm lint e pnpm typecheck                    | Verificações em todos os pacotes relevantes                                      |
| pnpm architecture:check                       | dependency-cruiser e regras de fronteira; falha bloqueia merge                   |
| pnpm test:unit                                | Suítes puras e componentes; cache apenas se herméticas                           |
| pnpm test:integration                         | Banco temporário, Nest/Prisma e HTTP; sem cache por padrão                       |
| pnpm test:e2e                                 | Web/API em execução com dados sintéticos; sem cache                              |
| pnpm --filter @soe/database db:generate       | Geração do client com a versão fixada, antes dos builds dependentes              |
| pnpm --filter @soe/database db:migrate:deploy | Job exclusivo de release; sem cache; não faz parte de build                      |

Configurar outputs reais por pacote em turbo.json, incluindo artefatos de geração quando cacheáveis. A geração que depender de ambiente/conexão deve ser não cacheável. Não presumir o diretório de saída do Start: usar o emitido pela configuração escolhida. Dependências de build usam o grafo do workspace, inclusive ^build quando aplicável. Variáveis que alteram artefatos entram no hash; segredos, .env, relatórios com dados pessoais e logs sensíveis nunca entram no cache remoto. [A11]

Pipeline de PR: instalação com lockfile congelado → geração → formatação/lint → checagem arquitetural/typecheck → testes unitários → migrações e integração em PostgreSQL efêmero → build → E2E críticos. Jobs independentes podem rodar em paralelo, preservando essas dependências. Reportar todos os resultados; nenhuma falha obrigatória pode ser ignorada.

Pipeline de release: backup/ponto de recuperação conforme operação → migração compatível em job único → deploy de API/worker/web → healthchecks e smoke tests. Deploy pode usar artefatos anteriores em rollback apenas enquanto o schema for compatível; rollback de banco nunca é presumido seguro. Builds não acessam dados reais.

### 7.12 Critérios obrigatórios para aceitar uma entrega

- Nenhuma violação de import, ciclo ou acesso a internals; implementar no CI testes negativos demonstrando que imports proibidos realmente falham.
- Casos de uso testáveis sem Nest e Prisma; controllers testados como adapters; repositories validados contra PostgreSQL real.
- DTO de entrada não atravessa a aplicação como objeto HTTP; tipos Prisma não saem de infrastructure/database.
- Todas as operações e exports testam isolamento entre duas escolas e acesso restrito.
- SSR não compartilha sessão/cache; bundle cliente não contém código ou configuração de servidor.
- API/worker reusam os mesmos casos de uso, sem copiar lógica nem importar um app no outro.
- Pacote novo tem dono, responsabilidade, exports e necessidade concreta documentados.
- ADRs, OpenAPI, modelo persistente e instruções para agentes acompanham mudanças relevantes.
- Mudanças visuais documentam consulta às skills/referências da seção 6; Tailwind permanece como base. Testar reduced-motion, foco, responsividade e SSR dos wrappers ilustrativos.

Estas são regras de implementação a configurar no repositório. Atualizar o PRD não significa que o monorepo, os testes ou os bloqueios de CI já foram implementados.

## 8. Arquitetura, dados e isolamento

Fluxo de execução: UI/rotas → cliente HTTP → API NestJS → autorização/caso de uso → portas → adapters Prisma/storage. A direção dos imports obedece à seção 7.7, independentemente desse fluxo. Jobs chamam os mesmos casos de uso com contexto explícito. O Start não acessa o banco nem executa regras de negócio.

Entidades principais:

| Entidade                         | Responsabilidade                                          |
| -------------------------------- | --------------------------------------------------------- |
| Organization                     | Escola/cliente e configurações                            |
| User e Membership                | Identidade global e vínculo/papel por organização         |
| AcademicYear, Class e Enrollment | Histórico de turma e matrícula                            |
| Student e GuardianLink           | Cadastro escolar e contatos autorizados                   |
| StaffStudentAssignment           | Vínculo de tutor/profissional com estudante               |
| Case e CaseStudent               | Acompanhamento e estudantes envolvidos                    |
| Record e TimelineEvent           | Registro inicial, atendimentos e evolução                 |
| Referral e Response              | Atribuição/encaminhamento e devolutiva                    |
| AccessGrant                      | Concessões de acesso restrito, com escopo e justificativa |
| Attachment                       | Metadados e referência privada ao arquivo                 |
| Notification e Job               | Avisos e execução assíncrona                              |
| AuditEvent                       | Acessos, alterações, exportações e permissões             |
| Plan e Entitlement               | Capacidades do plano; cobrança será posterior             |

Toda entidade persistente de escopo escolar tem organization_id. Índices e unicidade incluem o tenant quando pertinente. Relações usam validação/constraints que impeçam associar estudante de outra organização. Usuário e sessão são globais; permissões vêm de Membership e do escopo do recurso.

Servidor resolve a escola a partir da sessão e do vínculo, não confia no ID enviado pelo cliente. Implementar filtros de tenant em repositórios e considerar PostgreSQL RLS como camada adicional. Se RLS for usada, testar contexto transacional com pooling e evitar papéis de conexão que a contornem.

Atualizações concorrentes usam versão do registro. Criação, atribuição e auditoria correspondente devem ser transacionais; enfileiramento deve usar outbox ou mecanismo equivalente para não perder avisos após commit.

## 9. Privacidade, segurança e requisitos não funcionais

O documento de origem prevê dados pessoais e relatos potencialmente sensíveis de crianças e adolescentes. A ANPD orienta considerar as hipóteses legais aplicáveis e a prevalência do melhor interesse; não presumir consentimento como única base para todas as operações. A escola e o fornecedor devem validar responsabilidades, finalidades, bases e retenção antes do piloto real. [L1]

Requisitos de produto e operação:

- Negação por padrão e autorização por organização, papel, vínculo, caso e sensibilidade. Ocultar botão não protege endpoint.
- Separar resumo operacional de conteúdo restrito. Casos com múltiplos estudantes exigem autorização sobre cada seção, sem revelar participantes indevidamente.
- Auditar leitura de conteúdo sensível, download, exportação, alteração e concessão de acesso. Logs não copiam o conteúdo dos relatos.
- Sessões seguras, revogação, limitação de tentativas, proteção contra CSRF conforme arquitetura, escape de conteúdo e validação no servidor. Exigir MFA para perfis com acesso restrito e administração privilegiada no piloto.
- Acesso de suporte excepcional deve ser autorizado, temporário, justificado e auditado; não implementar impersonação irrestrita.
- Criptografia em trânsito e em repouso, backups e acesso operacional restrito. Testar restauração antes do piloto.
- Política de retenção e exclusão por categoria de dado, incluindo cópias e backups, definida com a escola; não inventar um prazo legal uniforme. Arquivar operacionalmente não equivale a apagar.
- Processo para solicitações de titulares, incidentes e exportação ao término do contrato. Dados de homologação são sintéticos.
- Não usar conteúdo escolar em analytics, ferramentas de replay, treinamento de IA ou telemetria.

Metas iniciais propostas: p95 de consultas comuns abaixo de 1 s no servidor e tela operacional utilizável em até 2,5 s no cenário de teste acordado; disponibilidade mensal de 99,5% no piloto; RPO de até 24 h e RTO de até 8 h. São objetivos a validar com infraestrutura, não SLA comercial.

Cenário de carga inicial proposto: 10 escolas, 2.000 estudantes por escola e 50 usuários concorrentes totais, com histórico representativo. Ajustar após conhecer o porte das escolas. Exportações grandes rodam de forma assíncrona; dados não são carregados integralmente no navegador.

## 10. Regras das funcionalidades futuras

Frequência: percentual = presenças válidas / unidades previstas elegíveis no período × 100. Definir se a unidade é dia, aula, hora ou atividade; não misturar unidades. Sem denominador, apresentar “Sem dados”. Diferenciar ausências justificadas, atividades não aplicáveis e lançamentos pendentes conforme política aprovada. Não assumir que Tempo Comunidade seja aferido como Tempo Escola. Limites são configuráveis e não representam automaticamente regra legal.

Pedagógico: plano com objetivo, estratégia, responsável, data de revisão e evidência de evolução. Concluir tarefa não prova melhora de aprendizagem. Inclusão: separar documentação especializada de orientações pedagógicas compartilháveis; PEI e AEE precisam de validação com profissionais da área antes da implementação.

Recorrência: sugerir situações relacionadas por estudante/categoria/período configurado, sem rótulo permanente nem inferência causal. Indicadores mostram contagem de registros e contexto, não “nota” do estudante.

## 11. Modelo SaaS e monetização

Piloto gratuito por convite, com escopo e duração combinados; hipótese de 6 a 8 semanas de uso após implantação. Não prometer gratuidade permanente. Registrar capacidades do plano desde o core, mas deixar checkout e cobrança fora desta entrega.

Hipótese comercial a testar: assinatura por escola com faixas de estudantes ativos e recursos adicionais para redes. Evitar cobrar por cada relato ou restringir participação essencial de professores. Não definir preços sem entrevistas e custo operacional.

Planos conceituais: Essencial com ciclo completo de acompanhamento; Gestão com relatórios/planejamento; Redes com múltiplas unidades e integrações. Segurança, auditoria e acesso mínimo necessário são requisitos de todos os planos, não extras pagos.

No futuro billing: webhooks idempotentes e verificáveis, reconciliação, estados de assinatura e concessões de acesso no servidor. Inadimplência não apaga histórico; definir aviso, carência, leitura/exportação e encerramento antes de lançar cobrança.

## 12. Métricas do piloto

Metas abaixo são hipóteses para validação; não resultados já obtidos.

| Métrica                    | Definição                                                                                      | Meta inicial proposta                   |
| -------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------- |
| Ativação                   | Escola cadastra turma, estudante e conclui registro → atribuição → devolutiva                  | 80% das escolas piloto em 7 dias        |
| Uso recorrente             | Escola com ação significativa em uma semana                                                    | 70% ativas em pelo menos 4 de 6 semanas |
| Tempo de registro          | Mediana entre início e envio de registro simples em teste                                      | Até 3 minutos                           |
| Atribuições no prazo       | Atribuições com devolutiva até o prazo / atribuições vencidas no período, excluindo canceladas | Melhorar contra linha de base da escola |
| Pendências sem responsável | Casos ativos sem responsável principal                                                         | Zero após triagem                       |
| Continuidade               | Casos com próxima ação documentada / casos ativos                                              | 90%                                     |
| Interesse comercial        | Escola declara intenção e faixa aceitável em entrevista                                        | 3 entrevistas com intenção concreta     |

“Concluídos no período” usa data de conclusão, e “abertos no período” usa data de criação. Não dividir os dois para afirmar resolutividade sem análise de coorte. Casos reabertos aparecem separadamente. Eventos analíticos usam identificadores opacos e não incluem nomes ou texto livre.

## 13. Ordem sugerida de implementação e validação

1. Fundação: workspace pnpm/Turbo, pacotes e exports, limites de imports no CI, NestJS/Prisma, modelo de dados, autenticação, tenant, permissões e auditoria.
2. Onboarding: equipe, turmas, estudantes e importação com prévia.
3. Registro e caso: protocolo, estados, timeline e correção versionada.
4. Atribuições: encaminhamento, devolutiva, aceite e reabertura.
5. Operação: painel, notificações, contatos e anexos protegidos.
6. Relatórios: filtros, PDF e CSV com autorização por seção.
7. Preparação do piloto: restauração, testes de isolamento, acessibilidade e treinamento.

Estimativa de calendário fica pendente de equipe, dedicação e prazo desejado. A ordem acima é de dependência, não previsão de semanas.

Critérios de teste indispensáveis:

- Usuário da escola A não acessa estudantes, casos, relatórios, arquivos ou indicadores da B, mesmo alterando IDs.
- Professor com atribuição restrita não lê conteúdo sigiloso pelo endpoint, exportação ou cache.
- Dois estudantes no mesmo caso não provocam vazamento entre históricos individuais.
- Duplo envio, retry de job e repetição de importação não duplicam ações.
- Desativação de profissional revoga acesso e sinaliza pendências para reatribuição.
- Conclusão exige resultado e tratamento das atribuições abertas; reabertura preserva o histórico.
- Contagens, filtros e exportações concordam sob o mesmo escopo de acesso.
- Formulários funcionam com teclado, leitor de tela e celular; erros explicam como corrigir.
- Um backup é restaurado e comparado em ambiente isolado.

## 14. Perguntas ainda abertas

Estas perguntas não impedem usar o PRD como base; as que envolvem dados e operação precisam ser resolvidas antes do piloto real.

| Pergunta                                                                   | Premissa provisória                                                 | Quando decidir                   |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------- |
| A EFAPN será uma escola piloto? Há outras interessadas?                    | Nenhuma escola está confirmada                                      | Descoberta                       |
| Prioridade comercial: públicas, privadas ou ambas? Quais etapas de ensino? | Produto configurável; selecionar um segmento inicial em entrevistas | Descoberta                       |
| Quantos alunos, profissionais e escolas no piloto?                         | Cenário de teste da seção 9                                         | Antes de dimensionar             |
| Quem desenvolverá e qual o prazo desejado?                                 | Sem cronograma fechado                                              | Antes do planejamento de sprints |
| Quais profissionais podem conceder acesso restrito?                        | Responsável designado pela escola                                   | Antes de dados reais             |
| Quais fontes fornecerão cadastros e frequência?                            | CSV no core; frequência posterior                                   | Descoberta e fase 2              |
| Existe necessidade comprovada de uso sem internet?                         | Core online, com mensagens claras de falha                          | Antes de prometer operação rural |
| Qual região de hospedagem, retenção e suporte serão contratados?           | Serviços gerenciados a selecionar                                   | Antes de dados reais             |
| Qual marca e identidade final?                                             | SOE e paleta A provisórios                                          | Antes do lançamento comercial    |

## 15. Fontes e notas de pesquisa

Consulta realizada em 12/11/2026. Documentação de pacotes pode mudar; conferir release e compatibilidade no início do projeto. Referências de produtos orientam padrões, não substituem pesquisa com usuários. Paletas, escopo, modelo de negócio e metas deste PRD são propostas próprias.

- Fonte de requisitos: “Funcionalidades da Plataforma SOE.docx”, fornecida pelo usuário.
- U1 — CPOMS StudentSafe: casos, registros e auditoria.
- U2 — Linear Display options: organização e apresentação de listas.
- U3 — Linewize Pulse: acompanhamento de bem-estar escolar.
- U4 — shadcn/ui: componentes e personalização.
- T1 — TanStack Start: framework e status dos recursos.
- T2 — TanStack Query: estado remoto e cache.
- T3 — TanStack Form: formulários.
- T4 — TanStack Table: tabelas headless.
- T5 — TanStack Virtual: virtualização.
- T6 — TanStack Pacer: controle de frequência de operações.
- T7 — TanStack Store: estado reativo.
- T8 — TanStack DB: coleções reativas no cliente.
- T9 — Better Auth com TanStack Start: referência pesquisada inicialmente; não define a integração final, que deve permanecer no backend NestJS.
- L1 — ANPD sobre dados de crianças e adolescentes: hipóteses legais e melhor interesse.

Próxima decisão recomendada: escolher as escolas piloto e validar as telas de registro, acompanhamento e devolutiva com seus profissionais antes de ampliar os módulos.

### Fontes da revisão de arquitetura

Consultadas em 12/11/2026. Os frameworks documentam mecanismos; o desenho de módulos e as regras normativas são decisões do SOE.

- A1 — Start Routing: rotas e árvore gerada.
- A2 — Router File Naming Conventions: nomes de arquivos e layouts.
- A3 — Start Code Execution Patterns: limites cliente/servidor.
- A4 — Router External Data Loading: integração com cache externo.
- A5 — Feature-Sliced Design Layers e Public API: referência para encapsulamento; SOE não adota FSD integral.
- A6 — Turborepo Structuring a repository: workspace, apps e pacotes.
- A7 — The Clean Architecture: regra de dependência.
- A8 — NestJS Custom providers e Modules: composição e injeção.
- A9 — NestJS Prisma: integração ORM/backend.
- A10 — Prisma Transactions e Applying a migration: validar APIs e comandos para a versão principal fixada.
- A11 — Turborepo Configuring tasks: dependências, cache e outputs.

### Registro da revisão 1.1

Substitui a arquitetura anterior de backend no Start e Drizzle por NestJS e Prisma em monorepo Turborepo. Acrescenta estrutura de pastas, fronteiras de execução, dependências, contratos HTTP, persistência, SOLID, Clean Architecture e requisitos de CI como regras obrigatórias. Preserva o escopo funcional, as fases e as decisões do piloto gratuito.

### Fontes de design da revisão 1.2

- D1 — Taste Docs: orientação de design e distinção entre páginas e telas de aplicativo.
- D2 — Hairline Docs: pacote, React, figuras, tema e acessibilidade.
- D3 — Transitions.dev Library e documentação: receitas CSS/React e integração.
- D4 — Transitions Skill: comandos de instalação da skill e opções.
- D5 — Transitions MCP: endpoint, configuração do Codex e exigência de plano.

### Registro da revisão 1.2

Acrescenta Hairline, consulta obrigatória ao Taste e Transitions.dev, preserva Tailwind como base e documenta caminhos no design system e critérios de revisão. Hairline e Taste constam como skills já instaladas conforme informação do usuário. Inclui links e comandos oficiais de instalação da skill/MCP Transitions.dev, sem executar instalações.

## 16. Guias de implementação das ferramentas de backend para o Codex

Revisão 1.3 — 12 de novembro de 2026. Esta seção complementa as regras obrigatórias da seção 7. Os passos, limites e critérios de aceite abaixo são decisões de engenharia propostas para o SOE; as referências oficiais explicam os mecanismos das ferramentas. A documentação não representa código implementado ou testado.

### 16.1 Escopo e ordem de adoção

| Ferramenta                   | Decisão para implementação                                     | Entrega                                                                                      |
| ---------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| @nestjs/throttler            | Limitação de requisições da API                                | Core                                                                                         |
| @nestjs/terminus             | Saúde e prontidão da API                                       | Core                                                                                         |
| nestjs-zod + @nestjs/swagger | Adapter de validação e documentação a partir dos contratos Zod | Core; validar compatibilidade no bootstrap                                                   |
| pino + nestjs-pino           | Logs estruturados e correlação                                 | Core                                                                                         |
| @testcontainers/postgresql   | PostgreSQL temporário para integração                          | Core; dependência de desenvolvimento                                                         |
| OpenTelemetry                | Traces e métricas da API e do worker                           | Instrumentação mínima no core                                                                |
| @sentry/nestjs               | Destino candidato para acompanhamento de erros                 | Preparar integração antes do piloto; ativar quando conta, região e orçamento forem definidos |
| @casl/ability                | Adapter candidato para autorização contextual                  | Opcional; regras de autorização já são obrigatórias no core                                  |

Manter PostgreSQL, Prisma e pg-boss. Não adicionar Redis, BullMQ, Kafka, microsserviços ou um segundo ORM como consequência automática destes guias. A escolha de um serviço pago não está autorizada por esta seção; a implementação local e os adapters podem ser concluídos sem contratação.

Ordem: validar versões → contratos HTTP → logs e configuração → testes com banco → rate limiting e health checks → traces/métricas → integração opcional de erros → avaliar CASL com casos reais da matriz de permissões.

### 16.2 Preparação do workspace e instalação

Antes de alterar código, ler este PRD e o AGENTS.md existente. Inspecionar os manifests e o lockfile. Se o projeto ainda não existir, criar primeiro a estrutura da seção 7.3. Não presumir que os nomes de pacote ou scripts já estão configurados.

1. Selecionar versões estáveis compatíveis entre Node, Nest, Prisma, Zod, SDKs de observabilidade e o adapter HTTP escolhido. Registrar versões e decisões em docs/architecture/backend-tooling.md.
2. Consultar as referências oficiais da seção 16.13 para a versão adotada. Não copiar APIs de versões diferentes.
3. Instalar cada dependência no pacote que a importa; não depender de hoisting. Gerar e versionar pnpm-lock.yaml.
4. Fixar versões diretas com --save-exact; no CI usar pnpm install --frozen-lockfile.
5. Validar variáveis de ambiente no boot e documentar apenas exemplos sem segredos. Configurações do servidor não podem entrar em variáveis públicas do Vite ou no bundle web.

Comandos iniciais de resolução, para executar somente após validar os manifests e compatibilidades. A primeira execução resolve versões; builds seguintes usam o lockfile. Instalar uma biblioteca não conclui sua integração.

```sh
pnpm --filter @soe/api add --save-exact @nestjs/throttler @nestjs/terminus nestjs-zod @nestjs/swagger
pnpm --filter @soe/backend add --save-exact pino nestjs-pino pino-http
pnpm --filter @soe/backend add -D --save-exact pino-pretty
pnpm --filter @soe/test-utils add -D --save-exact testcontainers @testcontainers/postgresql
pnpm --filter @soe/backend add --save-exact @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/sdk-metrics @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http @opentelemetry/exporter-metrics-otlp-http
```

Zod deve estar declarado em @soe/contracts; declarar também nos demais pacotes se houver import direto. Mesma regra para dependências e peers de qualquer adapter. pino-pretty é exclusivo de desenvolvimento. Sentry e CASL não entram no comando obrigatório: seguir seus guias condicionais.

### 16.3 Organização de arquivos e regras de dependência

Os caminhos abaixo refinam o mapa existente; criar arquivos com responsabilidade real e testes correspondentes, sem pastas vazias.

| Caminho                                                             | Responsabilidade                                                     |
| ------------------------------------------------------------------- | -------------------------------------------------------------------- |
| apps/api/src/common/rate-limit/                                     | Configuração e guards de rate limiting                               |
| apps/api/src/common/pipes/                                          | Validação de contratos HTTP                                          |
| apps/api/src/common/filters/                                        | Conversão de erros em respostas seguras                              |
| apps/api/src/health/                                                | Controllers e composição de health checks                            |
| apps/api/src/openapi/                                               | Geração e publicação controlada do OpenAPI                           |
| apps/api/src/instrumentation.ts                                     | Entrada de telemetria carregada antes do bootstrap da API            |
| apps/worker/src/instrumentation.ts                                  | Entrada de telemetria carregada antes do bootstrap do worker         |
| packages/backend/src/platform/logging/                              | Configuração Pino, serializers e redaction                           |
| packages/backend/src/platform/telemetry/                            | Inicialização OTel, instrumentação permitida e ciclo de encerramento |
| packages/backend/src/platform/error-reporting/                      | Adapter opcional de erros para Sentry                                |
| packages/backend/src/modules/identity/application/ports/            | Porta de autorização independente da biblioteca                      |
| packages/backend/src/modules/identity/infrastructure/authorization/ | Adapter CASL, se adotado                                             |
| packages/contracts/src/                                             | Schemas públicos Zod, sem imports de Nest, Swagger ou Prisma         |
| packages/test-utils/src/postgres/                                   | Ciclo de vida do banco temporário, sem importar código dos apps      |
| infra/otel-collector.yaml                                           | Recepção, saneamento, limites e exportação da telemetria             |
| docs/runbooks/observability.md                                      | Como investigar erros, lentidão e falhas de jobs                     |

Domain e application não importam SDKs, Nest, Pino, Sentry ou CASL. Telemetria fica em adapters, decorators externos e composição. Só criar porta de logging/telemetria na application quando existir uma necessidade concreta do caso de uso. Preferir instrumentar sua chamada externamente. Eventos de auditoria de negócio continuam persistidos separadamente; logs e traces não substituem auditoria.

Aplicar as regras de imports no dependency-cruiser, incluindo bloqueio de @soe/backend e dependências server-only no web. Expor factories por exports públicos do pacote backend. Nenhum app importa outro app.

### 16.4 Rate limiting com @nestjs/throttler

Finalidade: limitar requisições excessivas, com políticas específicas por endpoint. Fonte: [B1].

Implementação no SOE: registrar o módulo e o guard na composição da API; carregar limites de configuração validada. Documentar a unidade de tempo usada pela versão instalada. Política inicial para teste, ajustável após piloto: leitura autenticada 120 requisições/minuto por usuário e escola; solicitação de exportação 5/minuto; recuperação de acesso 5/15 minutos por identificador normalizado e 20/15 minutos por IP. Essas políticas são propostas do projeto, não valores universais da biblioteca.

No login, combinar controles do provedor de autenticação com limites na borda. Confirmar que endpoints montados fora de controllers Nest também estão cobertos: um guard global não garante interceptar rotas de um handler externo. Não revelar existência de uma conta por mensagens diferentes.

Usar identidade da sessão validada nas chaves autenticadas, nunca apenas organizationId recebido no body. Não colocar e-mail bruto em chaves de storage/log; usar representação pseudonimizada quando necessário. Configurar proxies confiáveis explicitamente para não aceitar IP arbitrário enviado pelo cliente.

Contagem em memória fica restrita ao desenvolvimento ou implantação de uma instância explicitamente documentada. Antes de múltiplas réplicas, adotar storage compartilhado compatível ou rate limiting centralizado no gateway, com teste entre instâncias. Não instalar Redis sem avaliar essa necessidade. Quotas comerciais do SaaS são uma regra separada.

Aceite: exceder limite retorna 429 com orientação de retry; janela expira corretamente; usuários/escolas têm isolamento; IP forjado não contorna controle; requisições por duas réplicas respeitam o limite agregado quando essa topologia for usada.

### 16.5 Health checks com @nestjs/terminus

Finalidade: disponibilizar verificações de saúde para operação e implantação. Fonte: [B2].

Implementação no SOE: criar GET /health/live para informar que o processo responde, sem consultar o banco, e GET /health/ready para testar dependências indispensáveis ao atendimento. A prontidão deve verificar PostgreSQL com timeout curto e retornar 503 quando indisponível. O controller chama um adapter público backend; não importa Prisma nem acessa o banco diretamente, preservando a seção 7.7.

Separar dependência crítica de serviço auxiliar: falha do destino de telemetria ou de envio de e-mail não deve retirar toda a API de circulação. Não executar escrita nem consulta pesada nas verificações. Respostas públicas são mínimas; detalhes internos ficam protegidos. Tratar encerramento gracioso para parar de aceitar trabalho antes de finalizar recursos.

O worker continua sem servidor HTTP público: monitorar heartbeat, idade do job mais antigo e última execução bem-sucedida por mecanismo interno. Não considerar um worker saudável somente porque seu processo existe.

Aceite: API viva com banco indisponível retorna live 200 e ready 503; recuperação do banco restabelece prontidão; timeout não prende a probe; resposta não expõe credenciais ou topologia interna.

### 16.6 Contratos com Zod, nestjs-zod e OpenAPI

Finalidade: reutilizar schemas Zod no adapter Nest e na descrição OpenAPI. Fontes: [B3], [B4].

Implementação no SOE: declarar schemas de entrada e saída em @soe/contracts. Criar DTOs/adapters Nest derivados desses schemas em apps/api, utilizando as APIs suportadas pela versão instalada. Configurar validação de entrada e serialização/validação de saída onde apropriado. Mapear DTO validado para comando de aplicação; nunca transportar um objeto HTTP até o domínio.

Aplicar limites de tamanho e paginação, validação de IDs e datas e política explícita para propriedades desconhecidas. Regras de negócio, como permissão para concluir um caso, permanecem nos casos de uso. Tipagem TypeScript sozinha não valida resposta em runtime.

Gerar OpenAPI durante o build/CI e validar que rotas, schemas, autenticação e respostas documentadas coincidem com o comportamento real. Não manter DTOs manuais paralelos ao schema Zod. Manter o artefato OpenAPI versionado ou publicado pelo CI conforme decisão documentada. Swagger UI fica no ambiente local e em homologação protegida; exposição em produção é desabilitada por padrão.

Aceite: payload inválido produz erro padronizado sem stack; saída não contém campos persistentes privados; schema reutilizado funciona no front e na API; alteração incompatível do contrato aparece na revisão; nenhum decorator Nest entra no pacote contracts.

### 16.7 Logging com Pino e nestjs-pino

Finalidade: produzir logs JSON com contexto de requisição; pino-pretty facilita leitura local. Fonte: [B5].

Implementação no SOE: criar factory compartilhada de configuração e integrá-la à composição Nest da API e do worker. Evitar registrar o mesmo evento via console, logger Nest e Pino simultaneamente. Usar stdout JSON em produção e coletor externo; não depender de arquivo no disco do container.

Campos permitidos: timestamp, nível, serviço, versão, ambiente, correlationId, traceId/spanId quando presentes, template da rota, status, duração e código de erro seguro. Validar formato/tamanho de correlationId recebido ou gerar um novo. Não usar URL completa com query string como mensagem ou atributo.

Configurar serializers por allowlist e redaction como defesa adicional: remover Authorization, cookies, senhas, tokens, body, query livre, nomes, e-mails, relatos e dados de anexos. Não serializar objetos Error indiscriminadamente: mensagens, causes e stack podem conter dados; testar saneamento também nesses campos. IDs técnicos só entram quando necessários e sob política de acesso/retenção.

Aceite: requisição e job têm correlação rastreável; logs seguem JSON válido; segredos sintéticos injetados em headers/body/erros não aparecem; modo de produção não usa pretty printing. Logs de auditoria de acesso sensível permanecem na trilha transacional própria.

### 16.8 Testes de integração com Testcontainers

Finalidade: executar testes contra uma instância temporária real de PostgreSQL. Fonte: [B6].

Implementação no SOE: disponibilizar Docker ou runtime compatível localmente e no CI. Fixar imagem PostgreSQL compatível com produção. Criar helper em @soe/test-utils para iniciar container, aguardar prontidão e entregar URL ao runner. O helper não importa Prisma nem apps; a suíte consumidora gera o cliente, executa migrações e instancia os adapters reais do seu pacote.

Nunca executar migração/reset em URL obtida de ambiente de produção. Passar a URL do container explicitamente e validar ambiente de teste. Isolar suites por banco/schema ou container; não executar suites paralelas sobre a mesma fixture mutável. Encerrar cliente/pools antes de parar container, inclusive em falhas. Não usar sleep fixo como prontidão.

Testar repositories, constraints compostas por organização, transações, concorrência, idempotência e migrações. Testes de domínio puro continuam rápidos e sem Docker. Cache de testes dependentes de banco permanece desligado no Turbo por padrão.

Aceite: testes com duas escolas comprovam isolamento; repetir importação/job não duplica efeito; falha na transação não deixa auditoria/outbox parcial; suite usa migrations reais e não db push; CI falha explicitamente se banco de teste não inicializar, sem trocar silenciosamente por mocks.

### 16.9 OpenTelemetry: traces, métricas e correlação

Finalidade: coletar e exportar telemetria de forma padronizada; armazenamento e visualização pertencem a um backend separado. O software OpenTelemetry é gratuito/open source, mas infraestrutura, retenção e serviços gerenciados podem ter custo. Fontes: [B7], [B8].

Decisão SOE: começar com traces e métricas da API e do worker, mantendo Pino como produtor de logs. A exportação OTLP de logs é uma etapa separada, condicionada à compatibilidade dos componentes adotados. A tabela abaixo descreve o papel dos pacotes, não versões garantidas.

| Pacote                                    | Papel                                                        |
| ----------------------------------------- | ------------------------------------------------------------ |
| @opentelemetry/api                        | API de contexto, spans e métricas                            |
| @opentelemetry/sdk-node                   | Bootstrap do SDK no Node                                     |
| @opentelemetry/sdk-metrics                | Leitura/exportação periódica das métricas                    |
| @opentelemetry/auto-instrumentations-node | Conjunto de instrumentações; habilitar apenas as necessárias |
| @opentelemetry/exporter-trace-otlp-http   | Envio de traces via OTLP/HTTP                                |
| @opentelemetry/exporter-metrics-otlp-http | Envio de métricas via OTLP/HTTP                              |

Passos obrigatórios do projeto:

1. Exportar uma factory de telemetria pelo pacote backend. As entradas instrumentation.ts da API e worker configuram nomes distintos: soe-api e soe-worker.
2. Carregar a instrumentação antes dos módulos instrumentados. Validar o mecanismo de preload/bootstrap compatível com Node, ESM/CJS e o build escolhido. Um import tardio após Nest/HTTP/banco pode perder spans.
3. Definir explicitamente instrumentações habilitadas e seus dados coletados. Desabilitar captura de corpos, parâmetros SQL, valores de binds, query strings e headers sensíveis. Não assumir que o pacote de auto-instrumentação cobre a versão Prisma/driver usada: comprovar spans e ausência de duplicação no teste.
4. Configurar Collector local em infra/compose.yaml, com imagem fixada, portas restritas ao ambiente de desenvolvimento e pipeline em infra/otel-collector.yaml. Usar dados sintéticos para visualização local. Escolher destino de armazenamento/visualização separadamente; o Collector sozinho não é um painel nem histórico persistente.
5. Propagar contexto em chamadas internas e metadados técnicos dos jobs pg-boss. Não transportar sessão, cookies ou relatos em baggage. Em retries, registrar tentativa e representar a relação com a execução original por contexto/link conforme desenho documentado.
6. Criar spans externos aos casos de uso para operações relevantes, como case.close e report.generate. Encerrar spans em sucesso/falha e mapear códigos seguros. Não registrar resultado completo nem conteúdo do documento.
7. Medir duração/erros HTTP, duração/falha de jobs e atraso da fila. Labels devem ter cardinalidade limitada: serviço, template da rota, status e tipo de job. Proibir userId, studentId, caseId, texto livre e IDs de organização como labels de métricas.
8. Configurar batching, limites de fila/memória, timeout e política de descarte. Exportação é best effort: falha de monitoramento não impede registrar um caso. Fazer flush/shutdown com prazo máximo no encerramento do processo.
9. Validar correlação Pino ↔ trace. Não exportar a mesma linha de log por dois pipelines. Auditoria obrigatória continua com persistência própria e não usa política best effort.

Configuração inicial ilustrativa, sem segredos:

```dotenv
# Nome diferente em cada processo: soe-api ou soe-worker
OTEL_SERVICE_NAME=soe-api
# Endereço interno do Compose; não expor receptor sem proteção na internet
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1
OTEL_SDK_DISABLED=false
LOG_LEVEL=info
```

Amostragem de 10% é apenas ponto inicial proposto para homologação; testes sintéticos podem usar 100%. Validar suporte das variáveis e defaults na versão fixada. Head sampling pode descartar requisições que terminam em erro; não prometer retenção de todos os erros. Se isso for requisito, projetar tail sampling ou canal separado de erros, com custo e privacidade avaliados. Não definir retenção ilimitada: começar com proposta operacional de 7 dias de traces, medindo volume, e documentar a política aprovada para cada sinal.

Aceite: uma operação sintética exibe etapas HTTP/banco e, quando aplicável, o job correlacionado; serviços aparecem separados; interrupção do Collector não causa falha funcional; encerramento não trava; payload com dados sensíveis fictícios não é encontrado nos eventos exportados; overhead e volume são medidos. Instrumentação não é considerada concluída apenas porque pacotes foram instalados.

### 16.10 Sentry: integração opcional de erros

Finalidade: capturar e acompanhar erros com contexto técnico usando SDK para NestJS. Fonte: [B9].

Implementação no SOE: quando selecionado, declarar @sentry/nestjs no pacote que implementa o adapter. Inicializar antes do código monitorado conforme guia da versão. Usar DSN, release e ambiente separados; credenciais de upload de source maps pertencem apenas ao CI. Sem configuração válida, a integração fica desabilitada e os logs continuam funcionando.

Adotar inicialmente Sentry para erros, mantendo OTel como responsável pelos traces. Desabilitar instrumentações sobrepostas ou seguir integração oficial comprovada para um único provider de tracing. Não inicializar dois SDKs concorrentes sobre HTTP/Nest/Prisma. Não habilitar profiling, replay ou captura de logs duplicada automaticamente.

Configurar saneamento antes do envio, com allowlist de campos. Desabilitar coleta padrão de dados pessoais e remover headers, cookies, corpos, query strings, breadcrumbs sensíveis e mensagens que incluam relato. Enviar falhas inesperadas uma vez; erros esperados de validação/permissão são métricas/códigos seguros, sem gerar tempestade de alertas.

Aceite: falha sintética produz um evento com release e correlação; stack pode ser interpretada com source maps; integração desligada não impede boot; eventos não duplicam; teste de saneamento passa. Não presumir gratuidade permanente ou quotas: verificar condições do serviço antes de ativar em produção.

### 16.11 CASL: adapter opcional de autorização

Finalidade: expressar permissões por ação, recurso e condições. Fonte: [B10].

Decisão SOE: não instalar até que a comparação entre políticas TypeScript simples e CASL demonstre benefício para a matriz de permissões. Se escolhido, usar @casl/ability encapsulado em adapter de infraestrutura e registrar a decisão. A porta da aplicação recebe contexto autenticado, ação e recurso mínimo necessário; não expõe objetos Ability.

Negação por padrão. Considerar organização, vínculo, atribuição, sensibilidade e concessão explícita. O caso de uso aplica autorização mesmo quando chamado pelo worker; guard HTTP sozinho não é suficiente. Repository continua filtrando organização e escopo autorizado. Nunca buscar todos os casos para filtrar em memória depois.

Não confiar em permissões calculadas no front nem em atributos de papel enviados pelo cliente. Se houver cache de políticas, invalidar por mudança de vínculo/permissão e isolar tenant/sessão. Separar concessão administrativa de acesso a relatos, conforme seção 3.

Aceite: testes de tabela cobrem cada papel × ação × contexto; usuário de escola A não acessa B; revogação funciona; administrador técnico não lê relato restrito automaticamente. Testes da porta devem servir tanto ao adapter simples quanto ao CASL, caso exista migração.

### 16.12 Checklist de entrega e instrução pronta para o Codex

- [ ] Matriz de versões e dependências documentada; lockfile único e instalação reproduzível.
- [ ] Fronteiras de imports verificadas, inclusive SDKs fora de domain/application e do bundle web.
- [ ] Configuração validada; .env.example sem credenciais reais.
- [ ] Contratos HTTP, OpenAPI e respostas reais coerentes.
- [ ] Logs JSON e saneamento testados com dados sensíveis sintéticos.
- [ ] Rate limiting cobre também endpoints de autenticação externos aos controllers.
- [ ] Live/readiness têm semânticas distintas e timeouts.
- [ ] PostgreSQL temporário executa migrations e testes de isolamento/concorrência.
- [ ] Trace sintético validado no destino, sem instrumentação duplicada.
- [ ] Indisponibilidade da telemetria não interrompe operação funcional.
- [ ] Runbook documenta como seguir correlationId, investigar jobs e desligar exporters.
- [ ] Sentry/CASL constam como opcionais enquanto suas condições de adoção não forem atendidas.
- [ ] CI executa checks reais; nenhum resultado é declarado sem execução.

Prompt de execução:

> Leia o PRD completo, o AGENTS.md do repositório e especialmente as seções 7 e 16. Inspecione a implementação existente e faça um checklist do que falta. Implemente as ferramentas obrigatórias em etapas pequenas, respeitando pnpm/Turborepo, TanStack Start no web, NestJS na API/worker e Prisma/PostgreSQL no backend. Mantenha domain e application independentes de frameworks e SDKs. Consulte a documentação oficial das versões escolhidas e fixe dependências compatíveis. Comece por contratos, logging e testes de banco, depois rate limiting, health checks e OpenTelemetry. Prepare adapters opcionais somente quando suas condições forem atendidas; não contrate serviços. Inclua configuração local, exemplos de ambiente, testes críticos e runbooks. Execute os checks apropriados a cada etapa e informe evidências, arquivos alterados e pendências reais. Não declare uma integração concluída sem validar seu comportamento. Preserve o escopo de produto, as regras de acesso entre escolas e as referências de design do PRD.

### 16.13 Documentação oficial e fontes dos guias

Referências consultadas em 12/11/2026. Consultar novamente durante implementação, porque APIs, versões e integração entre SDKs podem mudar. As regras operacionais deste capítulo são decisões próprias para o SOE, e não exigências universais dessas ferramentas.

- B1 — NestJS Throttler
- B2 — NestJS Terminus
- B3 — nestjs-zod, repositório do projeto
- B4 — NestJS OpenAPI
- B5 — nestjs-pino, repositório do projeto
- B6 — Testcontainers PostgreSQL para Node
- B7 — OpenTelemetry para Node.js
- B8 — O que é OpenTelemetry
- B9 — Sentry para NestJS
- B10 — NestJS Authorization e integração CASL

### Registro da revisão 1.3

Adiciona guias de backend para o Codex, com escopo por fase, instalação, mapa de arquivos, configuração, limites de dependência, testes e critérios de aceite. Detalha OpenTelemetry e sua relação com Pino e Sentry, custos operacionais e proteção de dados. Mantém Sentry e CASL como escolhas condicionais. Esta revisão atualiza o Markdown; o DOCX anteriormente entregue corresponde à revisão 1.2.
