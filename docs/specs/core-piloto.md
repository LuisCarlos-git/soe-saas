## Problem Statement

A equipe escolar precisa dar continuidade ao cuidado com estudantes, mas registros dispersos entre planilhas, anotações e conversas não deixam claro quem assumiu uma providência, quando haverá retorno nem qual resultado foi documentado. Essa é uma hipótese de problema a validar com escolas, e não uma conclusão de pesquisa de campo já realizada.

Um registro isolado não deve abrir automaticamente um acompanhamento nem liberar relatos sensíveis a todos os envolvidos. A escola precisa coordenar triagem, responsabilidades, prazos e devolutivas preservando o acesso mínimo necessário, inclusive quando vários estudantes participam da mesma situação.

Esta especificação cobre o core do piloto gratuito do SOE para escolas em geral, com acesso apenas à equipe escolar, consolidando o PRD 1.3 e as 77 decisões confirmadas na entrevista. O repositório inspecionado contém somente scaffold Next.js/Turborepo e componentes demonstrativos, sem domínio, API, worker, persistência ou suítes de testes de produto. A implementação deve alcançar a arquitetura obrigatória; o scaffold não constitui escolha alternativa aprovada.

## Solution

Entregar uma central privada de acompanhamento educacional, em português brasileiro e responsiva, na qual a escola configura sua equipe e seus estudantes, registra situações, realiza triagem, abre ou relaciona acompanhamentos, atribui providências, revisa devolutivas e documenta encerramentos.

Cada escola mantém seus dados e permissões independentes. A operação mostra pendências, responsáveis e próximos prazos, enquanto relatos e anexos restritos exigem concessões delimitadas. Histórico, correções, acessos e exportações ficam rastreáveis. O piloto não exige pagamento e somente recebe dados reais após aprovação escolar e verificação técnica das condições de segurança e operação.

## User Stories

### Escola, equipe e primeiro uso

1. Como responsável escolar, quero cadastrar a escola piloto por convite administrativo, para iniciar o uso sem cobrança.
2. Como responsável escolar, quero configurar fuso, ano letivo, nomenclaturas e categorias, para refletir a rotina da escola.
3. Como responsável escolar, quero aprovar prazo de triagem e política de acesso, para definir responsabilidades operacionais dentro das proteções obrigatórias.
4. Como administrador escolar, quero convidar profissionais por convites com expiração e uso único, para controlar quem ingressa na equipe.
5. Como profissional de duas escolas, quero escolher explicitamente a escola ativa, para trabalhar no contexto correto.
6. Como profissional de duas escolas, quero vínculos e permissões independentes, para que uma desativação local não bloqueie a outra escola.
7. Como administrador escolar, quero gerenciar cadastros sem receber leitura automática de relatos restritos, para separar administração e acompanhamento.
8. Como representante da escola, quero aprovar nominalmente o primeiro concessor e suas substituições, para controlar a autoridade sobre acessos restritos.
9. Como operador do SaaS, quero efetivar a designação aprovada sem ler relatos, para apoiar o onboarding com acesso mínimo.
10. Como escola, quero indicar responsável pela fila e triador autorizado antes de receber registros restritos, para não criar uma fila sem atendimento possível.

### Estudantes, turmas e importação

11. Como profissional autorizado, quero cadastrar estudante com nome, chave escolar, ano, turma e situação, para começar sem exigir CPF, foto, endereço completo ou dados de saúde.
12. Como profissional autorizado, quero registrar contatos familiares apenas quando necessários, para evitar coleta cadastral excessiva.
13. Como administrador escolar, quero identificar estudantes por chave estável no escopo da escola, para preservar identidade entre anos letivos.
14. Como administrador escolar, quero manter matrículas por período, para preservar o histórico após troca de turma.
15. Como profissional autorizado, quero consultar estudante arquivado dentro do escopo permitido, para manter continuidade do histórico.
16. Como administrador escolar, quero um modelo de CSV e prévia com validação por linha, para corrigir problemas antes de confirmar a importação.
17. Como administrador escolar, quero separar linhas importadas, rejeitadas e pendentes, para reconciliar o resultado de uma importação parcial.
18. Como administrador escolar, quero resolver identidade ambígua explicitamente, para não unir homônimos por comparação de nome.
19. Como administrador escolar, quero revisar alterações propostas para cadastros existentes, para confirmar somente atualizações permitidas.
20. Como administrador escolar, quero que valores vazios ou estudantes ausentes no CSV não apaguem dados nem encerrem matrículas, para importar arquivos parciais com segurança.
21. Como administrador escolar, quero repetir uma importação sem duplicar estudantes e vínculos, para recuperar falhas de execução.
22. Como responsável escolar, quero corrigir duplicidades por procedimento assistido, autorizado e auditado, para preservar identidade e rastreabilidade sem misturar históricos.

### Registro e triagem

23. Como professor ou monitor, quero registrar estudante, fato, categoria, descrição, prioridade e providência imediata, para comunicar uma situação objetivamente.
24. Como autor, quero receber protocolo e próximo passo após o envio, para saber que o registro foi recebido.
25. Como autor, quero que duplo clique ou repetição de rede produzam um único registro, para não duplicar a demanda.
26. Como autor, quero marcar um registro como restrito por precaução, para proteger informações que exigem cuidado adicional.
27. Como escola, quero restrição obrigatória nas categorias sensíveis, para impedir que o autor reduza a proteção exigida.
28. Como autor sem conhecimento do histórico completo, quero enviar o registro à triagem sem abrir acompanhamento automaticamente, para a orientação decidir o destino adequado.
29. Como responsável pela triagem, quero identificar registros pendentes e vencidos, para evitar demandas esquecidas.
30. Como avaliador autorizado, quero assumir um registro, para tornar explícito quem está conduzindo sua avaliação.
31. Como avaliador, quero ser avisado quando outro profissional já tiver assumido ou finalizado o registro, para não sobrescrever sua decisão.
32. Como avaliador, quero abrir acompanhamento ou vincular a um existente, para reunir intervenções relacionadas sem duplicar o trabalho.
33. Como avaliador, quero encerrar a triagem com motivo e resultado quando não houver necessidade de acompanhamento, para documentar providência suficiente, duplicidade ou envio indevido.
34. Como orientação, quero corrigir o destino de uma triagem preservando a decisão anterior, para reparar erros sem apagar histórico.
35. Como orientação, quero preservar intervenções no acompanhamento de origem ao corrigir um vínculo, para revisar a continuidade de cada acompanhamento explicitamente.
36. Como autor, quero acompanhar meu relato, protocolo e retorno operacional permitido, para saber o encaminhamento sem acessar conteúdos de outros profissionais.
37. Como profissional responsável pela fila sem leitura restrita, quero ver somente protocolo, data, situação e encarregado, para coordenar sem conhecer autor, estudante, categoria ou relato.
38. Como responsável pela fila, quero que a desativação de um avaliador devolva seus registros em avaliação a Pendente, para reatribuir o trabalho.

### Acompanhamentos e continuidade

39. Como orientação, quero abrir acompanhamento com responsável principal ativo, próxima ação e prazo, para estabelecer continuidade desde a criação.
40. Como profissional autorizado, quero iniciar explicitamente um acompanhamento Aberto, para distinguir criação e início do trabalho.
41. Como responsável principal, quero consultar resumo, situação, prioridade, atribuições e linha do tempo autorizada, para decidir a próxima providência.
42. Como orientação, quero manter um vínculo principal por registro e referências autorizadas a outros acompanhamentos, para preservar sua origem.
43. Como responsável principal, quero registrar a próxima ação e seu prazo, para manter um próximo passo em todo acompanhamento ativo.
44. Como responsável principal, quero documentar novo prazo e motivo ao replanejar uma ação vencida, para preservar o compromisso anterior.
45. Como orientação, quero identificar o retorno esperado e a data de revisão ao aguardar família ou órgão externo, para manter a espera sob acompanhamento.
46. Como orientação, quero revisar o retorno recebido antes de encerrar a espera, para não mudar o estado automaticamente por uma resposta insuficiente.
47. Como responsável principal, quero definir outro próximo passo ou encerrar legitimamente após realizar uma ação, para não deixar acompanhamento ativo sem continuidade.
48. Como orientação, quero trocar o responsável principal sem transferir tarefas automaticamente, para distinguir coordenação e execução.
49. Como responsável pela segurança, quero bloquear imediatamente um profissional mesmo sem substituto, para revogar acesso sem depender de regularização operacional.
50. Como responsável pela fila, quero enxergar acompanhamentos sem responsável ativo após bloqueio emergencial, para regularizá-los sem ganhar leitura restrita.
51. Como orientação, quero agrupar estudantes somente quando houver objetivo e coordenação comuns, para não confundir participação no mesmo fato com necessidade de acompanhamento coletivo.
52. Como profissional autorizado, quero consultar o histórico de um estudante sem revelar dados dos outros participantes, para preservar limites individuais.
53. Como orientação, quero corrigir relatos publicados por versão ou adendo, para preservar o conteúdo anterior e sua autoria.

### Atribuições e devolutivas

54. Como encaminhador, quero criar atribuições internas com um destinatário, instrução e prazo cada, para tornar inequívoca a responsabilidade de execução.
55. Como encaminhador, quero criar atribuições separadas para vários profissionais, para acompanhar cada providência e devolutiva.
56. Como encaminhador, quero fornecer instrução operacional própria e mínima, para orientar sem copiar automaticamente relatos restritos.
57. Como destinatário, quero consultar minhas pendências por prazo e iniciar uma tarefa, para organizar o trabalho recebido.
58. Como destinatário, quero enviar ação, resultado e data de execução diretamente de Pendente quando já executei a providência, para não inventar um início de trabalho.
59. Como destinatário, quero registrar impedimento sem encerrar a tarefa, para solicitar replanejamento ou reatribuição.
60. Como revisor autorizado, quero aceitar uma devolutiva, para reconhecer que a providência foi revisada.
61. Como revisor autorizado, quero solicitar complementação com instrução e preservar a resposta anterior, para obter retorno suficiente sem sobrescrever a primeira versão.
62. Como profissional autorizado, quero reatribuir com motivo e sem reiniciar prazo automaticamente, para preservar o compromisso e avisar o novo destinatário.
63. Como destinatário anterior, quero perder os acessos que dependiam exclusivamente da atribuição transferida, para não manter permissões indevidas.
64. Como orientação, quero corrigir aceite indevido por adendo e nova atribuição quando necessária, para preservar o aceite original sem reabrir tarefas encerradas.
65. Como orientação, quero retomar providência cancelada por nova atribuição relacionada, para preservar o motivo do cancelamento anterior.
66. Como orientação, quero registrar órgão, responsável, data e prazo de acompanhamento de encaminhamento externo, para acompanhar retorno sem enviar documentos nem conceder acesso ao órgão.

### Conclusão, cancelamento e reabertura

67. Como profissional autorizado, quero impedir conclusão com atribuições Pendente, Em andamento ou Devolutiva enviada, para exigir resolução e revisão das pendências.
68. Como profissional autorizado, quero concluir com responsável ativo e resultado documentado, para registrar o motivo do encerramento sem afirmar resolução definitiva do problema.
69. Como profissional autorizado, quero cancelar com motivo e tratamento explícito das atribuições abertas, para encerrar sem apagamentos ou cancelamentos silenciosos.
70. Como orientação, quero cancelar diretamente um acompanhamento ainda Aberto, para não simular início de trabalho.
71. Como profissional autorizado, quero reabrir um acompanhamento concluído com justificativa, responsável ativo, próxima ação e prazo, para retomar o cuidado com rastreabilidade.
72. Como orientação, quero manter tarefas antigas encerradas na reabertura, para criar apenas as novas providências necessárias.
73. Como orientação, quero exigir reabertura ou novo acompanhamento relacionado para novos relatos após conclusão, para preservar o encerramento anterior.
74. Como orientação, quero manter cancelamentos terminais e retomar por outro acompanhamento relacionado, para não apagar a decisão anterior.

### Acesso restrito e revogação

75. Como concessor, quero autorizações com escopo, ações, justificativa e data de revisão, para conceder apenas o acesso necessário.
76. Como concessor, quero separar leitura e exportação, para não transformar consulta em autorização de saída de dados.
77. Como escola, quero impedir autoconcessão e exigir aprovação independente para acesso do próprio concessor, para evitar concentração indevida de autoridade.
78. Como escola, quero separar designação de concessores e concessão de leitura, para impedir delegação administrativa não aprovada.
79. Como concessor, quero que novos relatos restritos não herdem liberações antigas do acompanhamento, para avaliar o alcance de cada compartilhamento.
80. Como concessor, quero expiração automática de acessos temporários e pendências de revisão separadas, para distinguir término e reavaliação.
81. Como profissional autorizado, quero aumentar a restrição de um registro e bloquear acessos incompatíveis, para proteger próximos acessos sem apagar auditoria anterior.
82. Como concessor, quero aprovar reduções de restrição com justificativa, para impedir ampliação silenciosa por mudança de categoria.
83. Como profissional autorizado, quero revogar o acesso posterior do autor quando necessário à proteção, para manter apenas protocolo e confirmação neutra.
84. Como escola, quero invalidar concessões ao desativar um vínculo e exigir novas ao reativar, para não restaurar acessos antigos automaticamente.
85. Como escola, quero suspender novos envios restritos se não houver triador autorizado ativo, para exigir substituição sem liberar leitura a administradores.

### Atendimento, anexos, notificações e auditoria

86. Como profissional autorizado, quero registrar escuta, orientação, mediação, reunião e contatos familiares, para documentar ações e próximos passos.
87. Como profissional autorizado, quero distinguir tentativa de contato e contato realizado com seu resultado, para não interpretar ausência de resposta como concordância.
88. Como orientação, quero registrar eventos coletivos preventivos sem abrir caso individual, para documentar trabalho coletivo com dados mínimos.
89. Como profissional autorizado, quero enviar anexos privados PDF, JPEG e PNG, para apoiar o registro sem exposição pública.
90. Como autor, quero enviar o relato enquanto o arquivo aguarda verificação, para não bloquear a comunicação por quarentena.
91. Como leitor autorizado, quero acesso ao anexo somente após aprovação e autorização atual, para impedir download por conhecimento do caminho.
92. Como autor, quero ser informado de arquivo rejeitado e poder reenviar com autorização, para corrigir o anexo sem perder o registro.
93. Como destinatário de tarefa, quero acessar somente anexos explicitamente autorizados, para não receber todos os documentos do acompanhamento.
94. Como profissional, quero alertas internos de atribuição, prazos e devolutivas, para agir sobre pendências relevantes.
95. Como profissional, quero que notificações deixem de revelar referências após revogação, para que mensagens antigas respeitem meu acesso atual.
96. Como auditor autorizado, quero consultar metadados de acessos, alterações, exportações e concessões, para investigar ações sem reproduzir relatos.
97. Como escola, quero auditar a consulta à própria auditoria, para controlar acesso a informações de rastreabilidade.

### Painel, filtros, relatórios e operação do piloto

98. Como profissional, quero painel com minhas pendências, vencidos, retornos e próximos prazos, para priorizar ações.
99. Como gestor autorizado, quero visão da equipe com os mesmos limites de acesso das listas, para acompanhar trabalho sem acesso irrestrito por cargo.
100.  Como profissional, quero abrir a lista correspondente a cada indicador, para conciliar número, filtro e resultado.
101.  Como profissional autorizado, quero filtrar por estudante, turma, período, categoria, prioridade, responsável, tutor, autor do encaminhamento e situação, para localizar trabalho pertinente.
102.  Como profissional, quero paginação no servidor e buscas sensíveis fora da URL, para consultar dados sem expô-los no histórico de navegação.
103.  Como profissional autorizado, quero prévia de PDF individual com período, seções, escola e autoria da geração, para saber o que será exportado.
104.  Como profissional autorizado, quero CSV mínimo sem relato sensível por padrão e com neutralização de fórmulas, para analisar dados tabulares com segurança.
105.  Como exportador autorizado, quero selecionar explicitamente conteúdo restrito e dados de terceiros permitidos, para exportar somente o necessário.
106.  Como escola, quero verificar autorização ao solicitar, gerar e baixar, para bloquear entrega após revogação.
107.  Como escola, quero relatórios privados com expiração e remoção controlada, para evitar retenção indefinida de arquivos de saída.
108.  Como profissional, quero que logout e troca de escola descartem dados anteriores, para não consultar informação de outra sessão ou organização.
109.  Como profissional, quero receber aviso de conflito ao editar, para não sobrescrever o trabalho de um colega.
110.  Como escola que utiliza alternância, quero marcar Tempo Escola ou Tempo Comunidade, para contextualizar sem exigir frequência especializada.
111.  Como escola que não utiliza alternância, quero operar sem essa configuração, para manter a rotina pertinente ao meu contexto.
112.  Como responsável escolar, quero aprovar matriz de acesso e políticas antes de dados reais, para iniciar o piloto sob condições conhecidas.
113.  Como responsável escolar, quero comprovação de isolamento, MFA exigido, restauração e fluxo nos dispositivos acordados, para autorizar o uso real com evidências.
114.  Como operador do SaaS, quero observar saúde, erros e jobs sem conteúdo escolar, para manter o serviço com privacidade.
115.  Como responsável pelo produto, quero validar ativação, recorrência e continuidade com eventos mínimos, para avaliar o piloto sem nomes ou relatos em analytics.

## Implementation Decisions

### Escopo, fontes e estado inicial

- Implementar a fundação e o core do piloto gratuito, cobrindo onboarding, escola/equipe, estudantes, triagem, acompanhamentos, atribuições, atendimentos, contatos familiares, anexos, notificações internas, painel, filtros, PDF, CSV, auditoria e operação segura. As expansões do PRD permanecem posteriores.
- Usar o vocabulário do glossário: acompanhamento equivale ao Case técnico; registro não equivale a acompanhamento; responsável pela triagem, avaliador, responsável principal e destinatário são responsabilidades distintas.
- A síntese final da entrevista confirma decisões 1–76. A decisão 11 substitui a exposição do autor inicialmente considerada na decisão 5. A continuidade com próxima ação e prazo passou a ser regra obrigatória na decisão 43, além da meta de piloto originalmente proposta.
- O scaffold Next.js atual precisa ser adequado ao destino obrigatório. Não existe funcionalidade de domínio nem dado real que justifique conservar sua stack como alternativa.

### Arquitetura e fronteiras

- Monorepo TypeScript estrito com pnpm e Turborepo; frontend TanStack Start/React e Router, Query, Form e Table; API e worker NestJS separados; PostgreSQL e Prisma como único ORM; pg-boss para jobs duráveis. Backend é monólito modular, não microsserviços.
- Apps são folhas do grafo e não importam outros apps. API e worker compartilham módulos backend. Separar pacotes de backend, database, contratos Zod, cliente HTTP neutro, UI genérica, configurações e utilitários de teste. Nomes internos usam o escopo SOE, dependências explícitas e exports públicos; dependências internas usam protocolo workspace.
- Módulos backend por funcionalidade: identidade/acesso, organizações, estudantes, registros, acompanhamentos, encaminhamentos, notificações, documentos e relatórios, criados quando houver implementação. Separar domínio puro, aplicação, portas, infraestrutura e composição Nest.
- Domínio e aplicação não importam Nest, Prisma, transporte HTTP, SDKs de observabilidade ou bibliotecas de autorização. Composição injeta dependências por tokens e factories; infraestrutura implementa portas do consumidor. Controllers e consumidores de jobs adaptam entrada e chamam APIs públicas de aplicação, sem acessar ORM ou repositórios concretos.
- Comunicação entre módulos passa por portas e APIs públicas, sem acessar domínio interno, infraestrutura ou tabelas de outro módulo. Proibir ciclos e uso de forwardRef para escondê-los. Interfaces correspondem a fronteiras reais, sem repositórios genéricos que exponham ORM, BaseService de negócio ou abstração especulativa.
- Web usa módulos por funcionalidade com apresentação, modelo de UI e dados; rotas são finas e páginas compõem APIs públicas. Módulos web não importam outros módulos diretamente. UI genérica não contém conceitos escolares. Web, inclusive SSR, não importa backend, database, Nest ou Prisma.
- Regras de dependência verificadas por ESLint e dependency-cruiser bloqueiam ciclos, acesso a internals e inversão de camadas. Incluir testes negativos para provar que imports proibidos falham. TypeScript exige strict, noUncheckedIndexedAccess e exactOptionalPropertyTypes. Proibir any para contornar contratos e exports indiscriminados de internals.
- Versões estáveis compatíveis, diretas exatas, gerenciador fixado e lockfile único. Conferir documentação oficial das versões adotadas; consultar docs da versão instalada do Turbo antes de alterar sua configuração. Não criar workspace Nest separado nem instalar componentes experimentais críticos sem revisão.

### Identidade, HTTP, SSR e cache

- Uma organização corresponde a uma escola no core. Identidade e sessão são globais; vínculo profissional, papéis, concessões e histórico escolar são independentes por escola. A escola ativa exige escolha explícita. Desativação local não afeta outros vínculos.
- API NestJS é autoridade de sessão e negócio. Better Auth permanece candidato a adapter backend, sujeito à validação com NestJS, Prisma e MFA; não instalar segunda autenticação no Start. Exigir MFA dos perfis com acesso restrito e administração privilegiada antes do piloto real.
- Usar uma origem pública com API REST versionada e autenticação encaminhadas ao NestJS. Cookies HttpOnly/Secure, política SameSite e proteção CSRF validadas. Endpoints de autenticação externos aos controllers também precisam de proteção contra abuso.
- Contratos de entrada/saída Zod neutros geram adapters DTO Nest e OpenAPI compatíveis, sem schemas manuais paralelos. API revalida entradas, limita paginação/tamanho, trata propriedades desconhecidas e mapeia payload para comandos de aplicação. Respostas são DTOs, nunca objetos Prisma. Erros têm código estável, mensagem segura, campos e correlationId; datas ISO 8601 e IDs opacos.
- Cliente HTTP usa fetch injetável e AbortSignal; componentes não espalham transporte. Servidor cria cliente HTTP, Router e QueryClient por requisição, sem compartilhar cookies ou cache. SSR usa destino interno confiável e encaminha apenas credenciais/cabeçalhos permitidos; não aceita host fornecido pelo usuário. Isolar código server-only pelos mecanismos oficiais e verificar bundle cliente.
- Router e Query compartilham factories de opções e chaves; loaders antecipam com ensureQueryData e componentes usam as mesmas opções. Chave inclui recurso, organização, contexto de sessão/permissão, identificadores e filtros normalizados. SSR serializa somente dados autorizados necessários e não usa cache público/CDN autenticado.
- Logout e troca de escola cancelam requisições e descartam caches anteriores. Mudança de permissão invalida consultas e API reautoriza cada operação. Não persistir relatos em armazenamento do navegador. Estado remoto fica em Query, formulário em Form, filtros públicos no Router e estado efêmero no React.
- Retry automático somente para leitura com falha transitória; não repetir mutação não idempotente ou erros de autorização indefinidamente. Encerramento e mudanças de acesso aguardam confirmação do servidor. Paginação e filtros são executados na API; dados sensíveis e busca livre não entram na URL.

### Modelo persistente, isolamento e consistência

- Modelo inclui escola, identidade/vínculo, ano letivo, turma/matrícula por período, estudante, contato familiar e vínculo de tutoria; acompanhamento e estudantes relacionados; registro, triagem e eventos de linha do tempo; atribuição e devolutivas; concessões; anexos; notificações/jobs; auditoria; capacidades de plano sem billing.
- Toda entidade escolar é escopada por organização. Índices, unicidade e integridade de relações incluem esse escopo. Repositórios autorizados filtram leituras, escritas, contagens, agregações e exportações; consultar apenas por ID não basta. Organização da URL só vira contexto após validar vínculo. Autor e permissões não são confiados ao body.
- Prisma fica restrito a database e infraestrutura aprovada. UnitOfWork independente do ORM fornece repositórios, auditoria e outbox no mesmo contexto transacional. Transições e conclusão verificam versões e pendências sob proteção de concorrência, sem leitura desprotegida seguida de atualização independente.
- Notificações e efeitos externos usam outbox após commit e jobs idempotentes; rede longa fica fora de transações. Retentativas de conflito são limitadas e seguras. RLS é defesa adicional opcional, não isolamento automático: se usada, testar contexto transacional, pooling e papel sem bypass.
- Fixar versão coerente de Prisma CLI/client/adapter, documentar a decisão e gerar cliente antes dos dependentes. Migrações reais versionadas, revisadas e ensaiadas em banco temporário. Release executa migração uma vez. Proibir reset, sincronização destrutiva, seed real e migração de desenvolvimento em produção. Mudanças incompatíveis usam expandir/migrar/contrair; SQL manual parametrizado fica na infraestrutura.

### Escola, matrícula e importação

- Onboarding por convite administrativo informa escola, fuso, ano letivo e nomenclaturas. Convites expiram e são de uso único. Configurações escolares não podem desativar isolamento, auditoria ou autorização.
- Cadastro mínimo não exige dados de saúde, CPF, foto ou endereço completo. Contatos familiares são opcionais até necessidade. Chave estável identifica estudante por escola entre anos; números anuais reutilizados exigem outra chave confiável antes da importação.
- Matrícula por período preserva turma e situação. Troca de turma conserva datas do vínculo anterior e mantém somente uma turma principal vigente por estudante/ano no core. Arquivamento não apaga histórico permitido.
- CSV tem modelo, prévia, validação por linha e confirmação. Linhas válidas podem ser importadas; ambiguidades de identidade ficam pendentes de resolução explícita. Resultado separa importadas, rejeitadas e pendentes. Reexecução não duplica os mesmos vínculos.
- Atualização de cadastro existente exige prévia e confirmação dos campos permitidos. Campo vazio não apaga dados e ausência no arquivo não arquiva nem encerra matrícula. Importação cadastral não modifica relatos, permissões ou histórico de acompanhamentos.
- Duplicidades no piloto usam procedimento assistido e auditado, limitado à mesma escola, com confirmação documentada da identidade pela escola e prévia dos vínculos afetados. Execução por profissional autorizado; não fundir automaticamente homônimos, ampliar permissões ou misturar pessoas distintas.

### Registro e triagem

- Registro inicial inclui estudante(s), data/hora do fato, categoria, descrição objetiva, autor autenticado, prioridade operacional e providência imediata; contexto/local é opcional. Exigir estudante, descrição e categoria, salvo evento coletivo preventivo sem caso individual. Categorias sugeridas: aprendizagem, convivência, frequência, acompanhamento familiar e outros.
- Protocolo legível único por escola/ano e ID técnico opaco. Envio é idempotente contra duplo clique/repetição de rede e retorna protocolo e próximo passo. Categoria e prioridade podem ser corrigidas com histórico; relato publicado não tem edição silenciosa.
- Registro pode aguardar triagem sem acompanhamento. Cada escola designa responsável pela fila, com substituição explícita. Responsabilidade geral não equivale à avaliação de cada registro nem à leitura restrita. Prazo escolar de triagem é aprovado em horas corridas; vencimento alerta sem exposição de conteúdo. Não definir valor universal nem função de emergência.
- Triagem segue Pendente → Em avaliação → Finalizada. Iniciar atribui avaliador autorizado. Finalização exige novo acompanhamento, vínculo a existente ou encerramento sem acompanhamento com justificativa e resultado. Encerramento sem acompanhamento atende providência imediata suficiente, duplicidade ou envio indevido, sem apagar o registro.
- Concorrência em assumir/finalizar aceita somente primeira operação válida e informa alteração ao outro profissional. Desativação do avaliador devolve registros em avaliação a Pendente e avisa responsável pela fila. Sem leitor autorizado, aplicar contingência de restritos sem ampliar permissões.
- Registro pertence a no máximo um acompanhamento, com referências autorizadas a outros. Corrigir triagem finalizada preserva decisão anterior e exige justificativa. Intervenções ficam na origem; revisar explicitamente continuidade e novo vínculo, sem mover/cancelar em massa. Referências não revelam conteúdo a quem não tem autorização.

### Acompanhamento, ações e estados

- Abrir exige responsável principal ativo, próxima ação e prazo e deixa estado Aberto. Profissional autorizado inicia explicitamente Em acompanhamento. Responsável da fila não assume casos automaticamente. Trocar responsável principal não transfere tarefas dos demais.
- Estados: Aberto, Em acompanhamento, Aguardando retorno, Concluído e Cancelado. Em acompanhamento pode ir a Aguardando retorno e voltar após revisão autorizada. Aguardando retorno exige identificar retorno esperado e data de revisão, mantendo responsável. Receber devolutiva notifica, mas não encerra espera automaticamente.
- Todo acompanhamento ativo mantém próxima ação e prazo. Realização exige nova ação/prazo ou encerramento autorizado. Prazo vencido indica ação pendente atrasada, não novo estado. Replanejamento exige data nova e motivo, preservando anterior. Datas/horas corridas no fuso da escola, instantes armazenados em UTC; não presumir dias úteis.
- Concluir exige permissão, responsável principal ativo, resultado/motivo e eventual orientação de continuidade. Todas as atribuições devem estar Aceitas ou Canceladas com justificativa; Devolutiva enviada continua pendência. Conclusão não prova resolução definitiva da situação.
- Reabrir aplica-se somente a Concluído, exige permissão, justificativa, responsável ativo e próxima ação/prazo, voltando a Em acompanhamento. Atribuições antigas não reabrem; criar novas providências. Novos relatos em concluído exigem reabertura ou outro acompanhamento relacionado; adendos corretivos autorizados preservam relato e conclusão anteriores.
- Cancelar exige permissão, motivo e tratamento explícito de todas as atribuições abertas, cada qual com justificativa de encerramento. Pode ocorrer diretamente em Aberto. Cancelado é terminal; eventual retomada cria outro acompanhamento relacionado, sem apagar cancelamento.
- Desativação normal do responsável principal exige substituto autorizado. Bloqueio emergencial de segurança ocorre imediatamente mesmo sem substituto, invalida acesso e sinaliza acompanhamentos para regularização; não concede leitura automaticamente. Essa é exceção explícita à continuidade regular, visível operacionalmente.
- Acompanhamento coletivo exige objetivo e coordenação comuns. Relatos individuais são separados; histórico de um estudante revela apenas trechos autorizados, sem nomes, relatos e anexos indevidos dos demais.

### Atribuições, devolutivas e atendimentos

- Cada atribuição interna tem acompanhamento, um destinatário ativo, instrução mínima e prazo. Várias pessoas agindo geram atribuições separadas. Instrução própria do encaminhador não copia automaticamente conteúdo restrito nem concede acesso ao relato ou anexos de origem.
- Estados: Pendente, Em andamento, Devolutiva enviada, Aceita e Cancelada. Destinatário pode iniciar ou enviar diretamente de Pendente com data de execução, sem inventar início. Devolutiva registra ação, resultado e eventual impedimento.
- Revisão exige permissão explícita, inclusive para responsável principal; outro profissional autorizado da orientação pode revisar. Aceitar encerra atribuição. Complementação retorna Devolutiva enviada a Em andamento com instrução do revisor e resposta anterior preservada. Novo prazo exige alteração explícita justificada.
- Impedimento não encerra atribuição; manter aberta até replanejamento, reatribuição ou cancelamento autorizado. Reatribuição exige motivo, notifica novo destinatário, conserva prazo salvo alteração explícita e retira do anterior acessos exclusivamente dependentes da tarefa.
- Aceita e Cancelada são terminais. Corrigir aceite exige adendo e, se necessário, nova atribuição relacionada; acompanhamento concluído exige reabertura para novas providências. Retomar tarefa cancelada cria outra relacionada e preserva motivo anterior.
- Encaminhamento externo registra órgão, data, profissional e prazo de acompanhamento/resposta; não transmite documento, envia mensagem ou concede acesso automaticamente.
- Atendimentos cobrem escuta, orientação, mediação, reunião, contato familiar e coletivo, com data, participantes, objetivo, síntese, compromissos e próximo passo, podendo vincular-se a acompanhamento. Evento coletivo usa dados mínimos e observações individuais separadas. Contato registra canal, destinatário, tentativa/realização e resultado; sem resposta não equivale a concordância.

### Concessões e proteção de conteúdo

- Negação por padrão e autorização contextual por escola, papel, vínculo, recurso e sensibilidade. Botão oculto, guard de navegação ou papel de administrador não autorizam operação. Casos coletivos exigem autorização por trecho e participante. API e casos de uso, inclusive chamados pelo worker, revalidam acesso; não filtrar depois de buscar todos os registros.
- Representante formalmente indicado pela escola aprova nominalmente primeira designação e substituição de concessor; operador efetiva com evidência e sem leitura. Conceder leitura não permite nomear concessores. Substituir concessor preserva concessões existentes até revisão explícita.
- Concessor não ganha leitura pelo cargo nem pode autoconceder. Seu acesso exige outro concessor autorizado ou processo formal aprovado pela escola. Concessão explicita registros/acompanhamentos e ações, distingue leitura/exportação, tem justificativa e revisão. Acesso temporário tem expiração automática; revisão vencida gera pendência sem revogar por si só.
- Concessão do acompanhamento cobre resumo operacional autorizado e apenas relatos restritos explicitamente incluídos; não libera novos relatos nem histórico completo do estudante. Tutoria, direção, autoria e administração não liberam automaticamente informação de saúde/proteção.
- Antes de habilitar recebimento de restritos, designar pelo menos um triador autorizado. Se o único triador for desativado, preservar pendentes, suspender novos envios restritos e emitir aviso operacional até substituição, sem conceder leitura administrativa.
- Coordenador sem leitura vê apenas protocolo, data, situação e encarregado de restritos. Ocultar autor, estudante, categoria e descrição. Autor acompanha somente próprio relato, protocolo, situação e retorno operacional permitido; vínculo ao caso não abre outros participantes/conteúdos. Por proteção, profissional autorizado pode revogar leitura posterior do autor com motivo e auditoria, preservando só protocolo e confirmação neutra.
- Categorias sensíveis impõem restrição; autor pode aumentar proteção, não reduzi-la. Profissional autorizado a ler/revisar pode aumentar; redução exige concessor, justificativa e auditoria. Corrigir categoria não amplia acesso silenciosamente. Aumentar bloqueia imediatamente acessos incompatíveis, anexos e futuras exportações, sem prometer recolher arquivos baixados ou desfazer leitura.
- Desativação invalida concessões do vínculo; reativação exige novas autorizações, mantendo histórico. Auditoria de acessos anteriores é preservada.

### Anexos, notificações e auditoria

- PDF, JPEG e PNG, com limite inicial de 10 MB apenas proposto e sujeito à aprovação operacional. Storage privado, formato real validado, verificação de malware/quarentena e links curtos após autorização. Caminho conhecido não autoriza download; anexos herdam restrição do registro e compartilhamento exige permissão explícita do destinatário.
- Registro pode ser publicado enquanto anexo aguarda verificação; arquivo fica indisponível até aprovação. Rejeição informa autor, preserva relato e permite novo envio autorizado. Limpar temporários e órfãos por rotina controlada.
- Alertas internos: nova atribuição, prazo próximo/vencido e devolutiva. Lembretes sem duplicação e jobs reprocessáveis. Proposta de dia anterior e vencimento é configurável, não compromisso já aprovado. Convite/acesso por e-mail entra no core; avisos operacionais externos ficam posteriores à validação de privacidade/preferência.
- Notificação usa texto mínimo e revalida autorização na consulta e destino; após revogação não revela referências, mesmo se já recebida. Título e prévia respeitam acesso. Nenhuma notificação externa contém nome de estudante ou relato.
- Auditar leitura sensível, download, exportação, edição/transições, correção e concessões, sem copiar relatos. Consulta de auditoria exige permissão própria e também é auditada. Suporte excepcional é autorizado, temporário, justificado e auditado, sem impersonação irrestrita.

### Painel, consultas e exportações

- Painel prioriza Minhas pendências, Vencidos, Aguardando devolutiva e Próximos prazos. Visão de equipe exige autorização; contagens seguem mesma permissão/filtro das listas e abrem resultados conciliáveis. Não criar ranking de estudantes; relações entre situações usam contexto e revisão humana.
- Filtros combináveis incluem estudante, turma, período, categoria, prioridade, responsável, tutor, autor do encaminhamento e situação; monitores são filtráveis por papel. Consultas paginadas no servidor e sem exposição de busca sensível em URL/logs.
- PDF individual seleciona período e seções, identifica escola, autoria e data, com prévia. CSV mínimo não inclui relato sensível por padrão e neutraliza fórmulas. PDF e CSV começam com informações operacionais autorizadas; seções restritas exigem seleção explícita e permissão de exportação específica.
- Relatório individual exclui dados de terceiros por padrão mesmo que gerador possa lê-los. Inclusão exige seleção e permissão por trecho. Autorizar na solicitação, geração e download; revogação bloqueia entrega. Arquivo anterior não assegura direito posterior.
- Relatórios privados expiram e são removidos, preservando auditoria de geração/download. Prazo depende de política aprovada antes de dados reais; não presumir retenção indefinida. Exportações grandes executam por jobs, sem carregar tudo no navegador.

### Interface e experiência já exigidas pelo PRD

- Aplicação web responsiva pt-BR para equipe escolar, com navegação e hierarquia do PRD: visão geral, estudantes, acompanhamentos, minhas pendências e relatórios; configurações por permissão. Agenda e módulos futuros não aparecem sem habilitação. Alternância é opcional; no core apenas contexto Tempo Escola/Tempo Comunidade.
- Preservar as diretrizes aprovadas do PRD para rótulos claros, próximo passo, formulários essenciais e estados de carregamento, vazio, erro, sem permissão, conexão, salvamento e conflito. Alertar alterações não salvas sem persistir relatos localmente. Não introduzir nova identidade nesta especificação; paleta A e Inter continuam ponto inicial proposto, sujeito à revisão.
- Tailwind é obrigatório, com componentes compartilhados shadcn/ui/Lucide, figuras Hairline encapsuladas sem domínio e movimento com referência Transitions.dev. Ao implementar, ler as cinco skills de UI exigidas pelo projeto, Taste e referências aplicáveis, documentando versão, adaptação e evidências reais. Não presumir compatibilidade SSR/hidratação nem instalação local apenas por menção no PRD.
- Acessibilidade WCAG 2.2 AA, teclado/foco/leitor de tela, toque e largura de 360 px, com revisão desktop/tablet/celular. Restrição, prioridade e situação usam texto/ícone além de cor. Movimento reduzido preserva funcionalidade; figuras são estáticas por padrão e animações não atrasam foco ou envio. Não impor efeitos promocionais às telas operacionais.

### Ferramentas backend e operação

- Adotar contratos Zod/nestjs-zod/OpenAPI, logging Pino/nestjs-pino, PostgreSQL temporário Testcontainers, Throttler, Terminus e instrumentação mínima OpenTelemetry conforme o guia do PRD. Instalação de dependências não equivale a integração validada. Validar configuração no boot; exemplos sem segredos e sem configuração privada no bundle web.
- Rate limiting por identidade autenticada/contexto aprovado e endpoints, com proxies confiáveis e proteção do handler de autenticação. Limites numéricos do PRD são propostas de teste. Não expor e-mail bruto nas chaves. Contagem em memória somente desenvolvimento ou instância única documentada; múltiplas réplicas exigem limite agregado comprovado, sem instalar Redis automaticamente.
- Separar liveness sem banco de readiness com teste PostgreSQL curto e timeout, retornando indisponibilidade quando necessário. Telemetria/e-mail auxiliares não derrubam API. Health usa adapter público, sem Prisma no controller e sem detalhes sensíveis na resposta. Worker não tem HTTP público; observar heartbeat, atraso e execução de jobs.
- Logs JSON stdout por allowlist e redaction, sem duplicação, corpos, cookies, tokens, nomes, e-mails, query livre, relatos ou anexos. Sanear mensagens/causes/stacks de erros e correlationId recebido. Auditoria de negócio permanece separada e transacional.
- Telemetria carrega antes dos módulos instrumentados, com serviços distintos de API e worker, contexto técnico de jobs e correlação com Pino. Habilitar somente instrumentações revisadas, sem SQL/binds, query strings, headers sensíveis ou conteúdo escolar. Métricas têm cardinalidade limitada, sem IDs de usuário, escola, estudante ou acompanhamento.
- Collector local e pipeline saneado com imagens fixadas, limites de memória/fila, batching, timeout e shutdown limitado. Exportação de telemetria é best effort e falha não bloqueia operação. Collector não é armazenamento/painel. Amostragem e retenção do PRD continuam propostas; medir overhead/volume e não prometer todos os erros com head sampling.
- Sentry é integração condicional, inicialmente somente erros e sem tracing concorrente, replay ou profiling automático. Sem configuração válida fica desabilitado. CASL é opcional, apenas após comparação com políticas simples e encapsulado em adapter. Não instalar os opcionais nem contratar serviço automaticamente.
- Docker Compose reproduz PostgreSQL, storage privado compatível com S3, e-mail e Collector locais com exemplos sintéticos. Runbooks cobrem migração, restauração, incidente, deploy, jobs e investigação por correlação. Criptografia em trânsito/repouso, acesso operacional restrito e processo de titulares/saída/incidentes são condições do piloto.
- CI exige lockfile congelado, geração, formatação/lint, arquitetura/typecheck, unidades, migrações/integração em PostgreSQL efêmero, build e E2E críticos. Suítes Jest Nest/HTTP são isoladas de Vitest puro/UI; MSW não substitui API real. Tarefas persistentes e testes de integração/E2E não usam cache; outputs/hash refletem artefatos reais, sem segredos ou dados pessoais no cache.
- Release exige ponto de recuperação conforme operação, migração compatível em job único, deploy separado dos processos e health/smoke. Rollback de aplicação depende de compatibilidade do schema; rollback de banco não é presumido seguro. Builds e seeds não acessam dados reais.
- Dados reais ficam bloqueados até aprovações escolares de responsáveis, matriz de acesso, tratamento, retenção e suporte, e evidências de isolamento, acesso restrito, MFA exigido, restauração e fluxo nos dispositivos. Arquivar não equivale a apagar; retenção por categoria e backups depende de política aprovada, sem prazo legal uniforme inventado.

## Testing Decisions

Os pontos de teste abaixo foram apresentados e confirmados pelo usuário antes da publicação desta especificação.

- **Fronteira principal:** API HTTP pública com PostgreSQL real e migrações, percorrendo registro → triagem → acompanhamento → atribuição → devolutiva → conclusão. Preferir cenários completos que verifiquem respostas, permissões, efeitos persistidos visíveis por consultas autorizadas e auditoria, em vez de detalhes privados de classes, número de chamadas ou organização interna.
- **Fronteiras complementares obrigatórias:** Playwright para jornadas web/API reais; Vitest para invariantes puras e componentes; Jest/Nest testing/Supertest para composição e HTTP; contratos de adapters e repositories reais; jobs, saneamento de observabilidade e regras arquiteturais. Concentrar fixtures de contexto e cenários públicos, sem criar uma nova abstração de teste para cada função.
- **Estado do código:** não há suítes ou fronteiras de domínio existentes a reutilizar. As ferramentas citadas são requisitos aprovados, não testes já implementados ou executados. O scaffold não é precedente funcional para o produto.
- **Identidade/escola:** duas escolas com identidades e vínculos distintos; manipular IDs em cada recurso, contador, anexo, relatório e exportação não cruza tenant. Mesma pessoa em duas escolas não compartilha permissões; desativação local e troca de escola respeitam contexto.
- **Matriz de autorização:** testar papel × ação × recurso × sensibilidade × vínculo × concessão, incluindo direção, tutor, professor, administrador, concessor e operador sem privilégios implícitos. Comparar políticas simples e eventual CASL pelo mesmo contrato, se adotado. Concessor não autoconcede e autor pode perder acesso posterior.
- **Revogação:** testar invalidação por desativação, expiração, reatribuição e aumento de restrição; reativação não ressuscita concessões. Novos relatos restritos não herdam liberações. Revisão vencida gera pendência sem expiração indevida. Notificações, prévias e arquivos não vazam após revogação.
- **Triagem:** envio idempotente, destinos válidos, encerramento com motivo/resultado, avaliador explícito, primeira operação válida em concorrência e recuperação por desativação. Registro restrito não revela autor/estudante/categoria a coordenador sem leitura. Sem triador ativo, suspender novos restritos e manter pendentes.
- **Acompanhamentos:** abertura e início distintos; próxima ação/prazo obrigatórios; espera identificada e revisada; atraso não altera estado nem prazo. Conclusão bloqueada por qualquer atribuição não aceita/cancelada, inclusive devolutiva enviada. Reabertura exige condições aprovadas e não reativa tarefas. Cancelamento terminal e correções preservam histórico.
- **Atribuições:** um destinatário; envio direto de Pendente; impedimento não encerra; complementação conserva resposta e exige instrução; reatribuição conserva prazo e revoga acesso exclusivo anterior. Aceite/cancelamento não reabrem; correção usa adendo e nova atribuição.
- **Concorrência/transação:** duas tentativas de assumir triagem, concluir enquanto se cria pendência, atualizar versão ou reatribuir não geram estado impossível. Falha transacional não deixa auditoria/outbox parcial. Cliente HTTP recebe conflito seguro em vez de sobrescrita. Testar contra PostgreSQL real, incluindo constraints por organização.
- **Importação:** homônimos distintos, chave estável/reutilizada, repetição sem duplicação, alterações confirmadas, vazios sem apagamento, ausentes sem arquivamento, resultado parcial reconciliável e turma anterior preservada. Correção assistida não mistura identidade nem amplia acesso.
- **Coletivos:** consultar histórico individual, timeline ou relatório de um estudante não expõe outros participantes sem permissão por trecho. Observações individuais são separadas; evento preventivo sem caso funciona sem criar acompanhamento artificial.
- **Documentos/relatórios:** formato real, tamanho configurado, malware/quarentena, rejeição e reenvio; caminho ou URL não autorizam download. PDF e CSV refletem filtros/autorização, neutralizam fórmulas, minimizam terceiros e auditam downloads. Revogação entre solicitação, job e download bloqueia entrega. Expiração remove arquivo mantendo auditoria.
- **Jobs:** reprocessar outbox, lembrete, importação ou exportação não duplica efeitos; simular queda após commit e antes de confirmação. Prazos respeitam fuso e horas corridas. Worker usa mesmos casos de uso com contexto explícito e não ganha acesso por ser processo técnico.
- **SSR/cache/web:** requisições simultâneas de usuários/escolas não compartilham sessão ou QueryClient; logout/troca cancela requisições e elimina dados anteriores, inclusive respostas tardias. Não persistir relatos em armazenamento local nem serializar segredos. Inspecionar bundle cliente para imports e configuração de servidor.
- **Jornadas/acessibilidade:** registrar, assumir triagem, atribuir, devolver, complementar/aceitar, concluir e reabrir em desktop e celular. Cobrir teclado, leitor de tela, foco, contraste real, toque, zoom, movimento reduzido, SSR/hidratação e estados de erro, vazio, conexão e conflito com dados sintéticos.
- **Ferramentas operacionais:** rate limit 429/retry, janelas e isolamento, proxy forjado e topologia multi-instância quando aplicável; liveness 200/readiness 503 com banco indisponível e timeout curto; saída OpenAPI coerente com comportamento real; falha de telemetria não altera resultado funcional.
- **Privacidade de logs/traces:** injetar segredos e relatos fictícios em headers, body, query e erros, verificando ausência nos eventos exportados. Validar correlação API/worker/jobs, ausência de duplicação, cardinalidade limitada e shutdown sem bloqueio. Sentry desligado não impede boot, quando preparado.
- **Arquitetura e release:** testes negativos de imports, ciclos e internals devem falhar; domínio/aplicação testáveis sem Nest/Prisma. PostgreSQL temporário deve falhar explicitamente se indisponível, sem fallback a mocks. Migrações reais, restauração comparada em ambiente isolado e smoke pós-deploy geram evidência.
- **Aceite:** nenhum check obrigatório pode ser ignorado. Entrega reporta comandos, resultados, limitações e pendências reais. Sucesso em teste unitário ou instalação de pacote não prova integração. Aprovação escolar e verificações bloqueiam o uso de dados reais.

## Out of Scope

- ERP escolar, financeiro, diário de classe completo, LMS, prontuário clínico ou canal de emergência.
- Diagnóstico psicológico, classificação automática, pontuação de risco, ranking de estudantes ou decisão disciplinar automatizada. Nenhuma IA é autorizada no core.
- Acesso de responsáveis, estudantes e terceiros; portal externo; envio automático de documentos a órgãos; notificações operacionais externas sem validação específica.
- Frequência calculada/importada especializada, planos pedagógicos, agenda, acompanhamento familiar estruturado, calendário de alternância, modelos, XLSX, comparativos, filtros pessoais salvos, pautas e ações preventivas, previstos para fase 2.
- Checkout, preços, assinatura, cobrança, inadimplência e gestão de redes/múltiplas unidades, previstos para fase comercial posterior. Registrar capacidades do plano não autoriza implantar billing.
- PEI, AEE, estudos de caso especializados, integrações acadêmicas, SSO, offline e API de parceiros, previstos sob demanda futura.
- Tema escuro e personalização de marca escolar no piloto; nova identidade visual decidida nesta especificação.
- Drizzle, segundo ORM, microsserviços, Redis, BullMQ, Kafka, autenticação paralela no Start ou novos motores de animação sem decisão técnica aprovada. Sentry/CASL continuam condicionais.
- Contratação de fornecedores, custos, região, SLA comercial, prazos legais uniformes, escolha de escolas, cronograma e preços presumidos. Não executar migração de dados reais, implantação ou contratação ao publicar esta issue.

## Further Notes

- Origem: PRD da plataforma SOE SaaS, versão 1.3 de 12/11/2026; entrevista grill-with-docs encerrada em 13/11/2026; glossário do domínio; confirmação final de entendimento; confirmação posterior dos pontos de teste para to-spec. Esta issue é uma síntese executável do core e não substitui as regras normativas de arquitetura e design do PRD.
- Rastreabilidade das 77 decisões: 1 delimita o aprofundamento; 2–8 e 21–28 definem triagem, vínculos e responsabilidades; 9–20, 45–46 e 65–68 delimitam concessões, restrições e proteção; 29–44 e 49–52 definem atribuições e acompanhamento; 47–48 tratam prazo e correção; 53–60 e 76 tratam escola, cadastro/importação e duplicidades; 61–64 tratam exportação; 69–72 completam transições; 73–75 definem configuração e entrada de dados reais; 77 confirma entendimento compartilhado. As regras estão incorporadas nas decisões de implementação e histórias acima.
- Ordem de dependência: fundação e fronteiras verificadas → identidade/escola/permissões/auditoria → onboarding e estudantes/importação → registro/triagem/acompanhamento → atribuições/devolutivas → operação/notificações/contatos/anexos → relatórios → preparação e validação do piloto. A ordem não é estimativa de semanas nem autorização para ignorar requisitos transversais.
- Fase de descoberta continua necessária: entrevistas com 3–5 escolas, validação da matriz e do fluxo com orientação, colaborador e gestão, usando dados fictícios e responsável operacional por escola. Nenhuma escola está confirmada.
- Metas de piloto continuam hipóteses: ativação de 80% em 7 dias; uso recorrente de 70% em 4 de 6 semanas; mediana de registro até 3 minutos; melhoria de devolutivas no prazo contra linha de base; zero acompanhamentos ativos sem responsável após regularização; continuidade inicialmente proposta em 90%, agora com regra obrigatória de próxima ação; três entrevistas com intenção comercial concreta. Não apresentar como resultados obtidos.
- Métricas distinguem data de criação e conclusão, registram reabertura e não inferem resolutividade dividindo conclusões por aberturas sem coorte. Eventos analíticos usam identificadores opacos sem nomes ou texto livre.
- Metas técnicas propostas, não SLA: consultas comuns p95 abaixo de 1 s, operação utilizável em 2,5 s no cenário acordado, disponibilidade de 99,5%, RPO 24 h/RTO 8 h. Carga ilustrativa de 10 escolas com 2.000 estudantes cada e 50 usuários concorrentes totais deve ser validada. Piloto de 6–8 semanas também é hipótese, sem gratuidade permanente prometida.
- Continuam pendentes: escolas e segmento inicial; equipe/dedicação/calendário; valores de categorias, prazo de triagem e nomenclaturas por escola; responsáveis nominais e políticas de acesso; hospedagem/região, fornecedores, retenção por categoria/backups, disponibilidade dos relatórios e suporte. Essas pendências não impedem construir e testar com dados sintéticos, mas as aprovações operacionais aplicáveis bloqueiam dados reais.
- Versões e adapters devem ser pesquisados e validados no bootstrap conforme o PRD; esta spec não confirma compatibilidade de versões nem a disponibilidade de serviços/skills. Nenhuma implementação, teste funcional, restauração ou integração é declarada concluída por sua publicação.
- Publicar como especificação consolidada com label ready-for-agent. A abrangência exige execução em etapas verificáveis; a label não elimina gates do piloto nem transforma propostas ou pendências em decisões confirmadas.
