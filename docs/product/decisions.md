# Decisões de aprofundamento do PRD

Registro da entrevista `grill-with-docs`, a partir do [PRD 1.3](../PRD.md).
Somente decisões explicitamente confirmadas entram neste documento; perguntas
abertas permanecem identificadas como tal. O registro não autoriza alterações
contrárias às regras normativas do PRD.

## Rodada 1 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

1. **Recorte da entrevista:** aprofundar primeiro registrar → atribuir → devolver
   → concluir. Importação, relatórios e operação serão discutidos em rodadas
   posteriores; continuam no escopo do PRD.
2. **Registro sem acompanhamento:** permitir que um registro aguarde na fila de
   triagem da orientação, sem criar acompanhamento automaticamente. A orientação
   pode vinculá-lo a um acompanhamento existente, abrir um novo ou encerrar a
   triagem com justificativa. O registro é preservado.
3. **Responsabilidade pela fila:** cada escola designa explicitamente um
   profissional responsável pela triagem, com substituição explícita. A fila
   pode ser acessível a vários profissionais autorizados.
4. **Autoridade de acesso restrito:** cada escola designa explicitamente quem
   concede e revoga acesso a relatos restritos. Direção e administração de
   cadastros não recebem essa autoridade automaticamente.

## Rodada 2 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

5. **Responsabilidade e leitura separadas:** o responsável pela fila pode ver
   os metadados permitidos; ler relatos restritos exige concessão específica.
   A responsabilidade operacional não concede esse acesso. Registros restritos
   precisam chegar a um profissional autorizado a avaliá-los. A lista original
   de metadados incluía o autor; a decisão 11 a substitui para relatos restritos.
6. **Retorno limitado ao autor:** o autor acompanha seu próprio relato,
   protocolo, situação da triagem e retorno operacional autorizado. Vincular a um
   acompanhamento não libera os demais relatos, participantes ou anexos.
7. **Encerramento sem acompanhamento:** a orientação pode encerrar a triagem por
   providência imediata documentada suficiente, duplicidade ou envio indevido.
   Motivo e resultado são obrigatórios e o histórico é preservado.
8. **Responsável desde a abertura:** abrir acompanhamento exige escolha explícita
   de um responsável principal ativo, mesmo que seja o profissional da triagem.
   Assumir a fila não implica assumir os acompanhamentos.

## Rodada 3 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

9. **Primeira designação:** no onboarding do piloto, um representante
   formalmente indicado pela escola aprova nominalmente o primeiro concessor
   de acesso restrito, com registro da aprovação. O operador do SaaS efetiva
   a designação aprovada sem receber acesso aos relatos.
10. **Destino autorizado antes do recebimento:** a escola deve designar pelo
    menos um profissional autorizado a ler e fazer a triagem de registros
    restritos antes de habilitar seu recebimento. O responsável pela fila pode
    acumular a função mediante concessão explícita.
11. **Metadados mínimos sem autorização de leitura:** mostrar apenas protocolo,
    data, situação e profissional encarregado. Ocultar autor, estudante,
    categoria e descrição. Esta decisão refina a decisão 5 e substitui sua
    permissão inicial de exibir o autor de relato restrito.
12. **Revogação do acesso do autor:** um profissional autorizado pode retirar o
    acesso posterior do autor ao próprio relato por necessidade de proteção,
    exigindo justificativa e auditoria. O autor mantém protocolo e confirmação
    neutra de recebimento, sem conteúdo ou andamento restrito.

## Rodada 4 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

13. **Autoridade separada da leitura e sem autoconcessão:** conceder acessos não
    implica poder ler os relatos. O concessor não pode liberar conteúdo para si
    mesmo; seu acesso requer aprovação por outro concessor autorizado ou pelo
    processo formal de designação da escola.
14. **Concessões delimitadas:** cada autorização identifica os registros ou
    acompanhamentos abrangidos e as ações permitidas, separando leitura de
    exportação. Acesso a um acompanhamento não libera automaticamente todo o
    histórico restrito dos estudantes envolvidos.
15. **Designação de concessores:** nomear ou substituir concessor exige aprovação
    nominal do representante da escola, como na primeira designação. A autoridade
    para conceder leitura não permite nomear novos concessores. A substituição
    preserva concessões existentes até revisão explícita.
16. **Ausência de triador autorizado:** se o único triador autorizado for
    desativado, preservar registros pendentes e suspender novos envios restritos
    até a escola designar substituto. Emitir aviso operacional sem conteúdo
    sensível; administradores não recebem leitura automaticamente.

## Rodada 5 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

17. **Restrição no envio:** categorias sensíveis tornam o registro restrito
    obrigatoriamente. O autor pode marcar qualquer outro registro como restrito
    por precaução, mas não remover a proteção exigida pela categoria.
18. **Reclassificação controlada:** um profissional autorizado a ler e revisar
    pode aumentar a restrição do registro. Reduzi-la exige aprovação de concessor,
    justificativa e auditoria. Corrigir categoria não amplia acesso silenciosamente.
19. **Efeito do aumento de restrição:** bloquear imediatamente acessos
    incompatíveis, incluindo anexos e futuras exportações, preservando a auditoria
    dos acessos anteriores. A mudança protege próximos acessos; não recolhe
    arquivos já baixados nem desfaz leituras anteriores.
20. **Novos relatos não herdam concessão:** a concessão de leitura de um
    acompanhamento abrange seu resumo operacional e somente os relatos restritos
    explicitamente incluídos. Novos relatos restritos não são liberados
    automaticamente por uma autorização anterior.

## Rodada 6 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

21. **Estados da triagem:** Pendente → Em avaliação → Finalizada. Finalizar
    exige um destino: novo acompanhamento, vínculo a acompanhamento existente
    ou encerramento justificado sem acompanhamento. Os estados da triagem são
    separados dos estados do acompanhamento.
22. **Avaliação individual atribuída:** iniciar a avaliação atribui o registro
    a um profissional autorizado e permite que colegas autorizados à fila vejam
    quem assumiu. O responsável geral pela fila supervisiona pendências sem
    assumir automaticamente cada avaliação.
23. **Concorrência na triagem:** se dois profissionais tentarem assumir ou
    finalizar o mesmo registro, aceitar somente a primeira operação válida e
    informar ao outro que o registro mudou. Evitar acompanhamentos duplicados
    para o mesmo registro e sobrescrita da decisão de um colega.
24. **Desativação do avaliador:** devolver seus registros Em avaliação para
    Pendente, preservando histórico e avisando o responsável pela fila para
    reatribuição. Sem outro leitor autorizado para um registro restrito, aplicar
    a contingência aprovada sem ampliar permissões automaticamente.

## Rodada 7 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

25. **Um vínculo principal por registro:** cada registro pertence a no máximo
    um acompanhamento, podendo relacionar-se a outros por referência. Isso
    mantém uma origem clara mesmo em situações com vários estudantes.
26. **Correção da triagem finalizada:** corrigir o destino exige justificativa e
    preserva a decisão anterior no histórico, sem apagar registros ou
    intervenções. Intervenções existentes devem ser tratadas explicitamente;
    não mover nem cancelar tudo automaticamente.
27. **Coordenação separada das tarefas:** o responsável principal coordena o
    acompanhamento; cada atribuição tem destinatário, prazo e devolutiva próprios.
    Trocar o responsável principal não transfere automaticamente as tarefas
    atribuídas aos demais profissionais.
28. **Destinatário único:** cada atribuição interna tem exatamente um
    profissional responsável. Quando várias pessoas precisarem agir, criar
    atribuições separadas, mantendo prazo e devolutiva com responsabilidade clara.

## Rodada 8 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

29. **Revisão autorizada:** o responsável principal pode aceitar devolutivas
    somente com permissão explícita de revisão. Outro profissional autorizado
    da orientação também pode revisar. A responsabilidade principal, sozinha,
    não concede permissão de aceite.
30. **Complementação:** devolver uma resposta para complementação leva a
    atribuição de Devolutiva enviada para Em andamento, preserva a resposta
    anterior e exige instrução do revisor. Novo prazo exige alteração explícita
    e justificada; o prazo anterior não muda automaticamente.
31. **Impedimento não encerra:** o destinatário pode registrar impedimento, mas
    a atribuição permanece aberta até replanejamento, reatribuição ou cancelamento
    autorizado. Informar impedimento não equivale a cumprir ou encerrar a tarefa.
32. **Reatribuição justificada:** trocar destinatário exige motivo, preserva
    histórico e notifica o novo profissional, sem reiniciar o prazo automaticamente.
    A troca retira do destinatário anterior o acesso que dependia exclusivamente
    daquela atribuição.

## Rodada 9 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

33. **Pendências impedem conclusão:** atribuições em Pendente, Em andamento ou
    Devolutiva enviada bloqueiam a conclusão. Todas devem estar Aceitas ou
    Canceladas com justificativa; receber uma resposta não equivale a revisá-la.
34. **Conclusão documentada:** concluir exige permissão explícita, responsável
    principal ativo e resultado registrado, esclarecendo o motivo do encerramento
    e eventual orientação de continuidade. Não implica resolução definitiva da
    situação escolar.
35. **Reabertura com continuidade:** reabrir exige permissão, justificativa,
    responsável principal ativo e próxima ação com prazo. O acompanhamento volta
    para Em acompanhamento; tarefas antigas não são reativadas automaticamente.
    Novas providências geram novas atribuições, preservando o histórico anterior.
36. **Relatos após conclusão:** impedir inclusão direta de novos relatos em
    acompanhamento concluído. Exigir reabertura autorizada ou abertura de outro
    acompanhamento relacionado. Correções por adendo permanecem possíveis com
    autorização, preservando conteúdo e conclusão anteriores.

## Rodada 10 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

37. **Acompanhamento coletivo com propósito comum:** compartilhar acompanhamento
    entre estudantes somente quando houver objetivo e coordenação comuns,
    mantendo relatos individuais em registros separados. Participar do mesmo fato
    não implica precisar do mesmo acompanhamento.
38. **Histórico individual autorizado:** na consulta de um estudante, exibir
    somente trechos autorizados do acompanhamento coletivo. Ocultar nomes,
    relatos e anexos dos demais quando não houver permissão. O vínculo ao
    acompanhamento não libera conteúdo dos outros participantes.
39. **Instrução própria e mínima:** ao atribuir tarefa a quem não pode ler os
    relatos de origem, o encaminhador fornece instrução operacional própria, sem
    cópia automática de conteúdo restrito. A atribuição não concede leitura dos
    relatos; o encaminhador responde por compartilhar somente o necessário.
40. **Desativação do responsável principal:** na desativação normal, exigir
    indicação prévia de substituto autorizado. Por segurança, permitir revogação
    imediata sem substituto e sinalizar acompanhamentos para regularização pela
    triagem, sem conceder leitura restrita automaticamente. A falta de substituto
    não impede bloqueio de acesso; a exceção deve permanecer visível.

## Rodada 11 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

41. **Cancelamento explícito:** cancelar exige permissão e motivo, preserva o
    histórico e exige tratamento explícito de todas as atribuições abertas.
    Não apaga registros nem cancela tarefas silenciosamente; cada tarefa aberta
    precisa de justificativa para seu encerramento.
42. **Espera acompanhada:** Aguardando retorno exige identificação do retorno
    esperado e data de revisão, mantendo o responsável principal. Esperar família
    ou órgão externo não dispensa a próxima verificação.
43. **Continuidade mínima obrigatória:** todo acompanhamento ativo tem próxima
    ação e prazo. Exceções decorrentes de bloqueio emergencial de profissionais
    aparecem como pendências de regularização. Esta decisão torna a continuidade
    uma regra operacional, além da meta inicial de 90% proposta no PRD.
44. **Cancelado é terminal:** acompanhamento cancelado permanece encerrado.
    Retomada legítima exige outro acompanhamento relacionado, preservando o
    cancelamento original. A reabertura da decisão 35 aplica-se a concluídos.

## Rodada 12 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

45. **Vigência das concessões:** toda concessão restrita tem justificativa e data
    de revisão. Acessos temporários também têm expiração automática. Revisão
    vencida gera pendência para o concessor; somente a expiração definida encerra
    o acesso automaticamente.
46. **Reativação sem recuperação automática:** desativar profissional invalida
    suas concessões restritas. Reativar exige novas concessões; não recupera
    automaticamente acessos anteriores. Preservar o histórico das autorizações.
47. **Prazo escolar de triagem:** cada escola aprova no onboarding um prazo
    operacional em horas corridas para avaliar registros, sem valor universal
    presumido. Vencimento alerta o responsável pela fila, respeitando permissões.
    O SOE permanece sem função de canal de emergência.
48. **Correção com intervenções existentes:** preservar as intervenções no
    acompanhamento de origem e registrar referência autorizada à correção, sem
    movê-las automaticamente. A orientação revisa separadamente o destino do
    registro e a continuidade de cada acompanhamento; referências respeitam a
    autorização de quem consulta.

## Rodada 13 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

49. **Início explícito:** criar acompanhamento o deixa em Aberto. Profissional
    autorizado deve iniciar explicitamente o trabalho para passar a Em
    acompanhamento; criar e designar responsável não equivale a iniciar.
50. **Retorno recebido não encerra espera:** receber devolutiva notifica a
    orientação, mantendo Aguardando retorno até revisão por profissional
    autorizado, que decide a próxima ação. A resposta, sozinha, não demonstra
    que a espera terminou.
51. **Prazo vencido preservado:** a próxima ação vencida permanece pendente e
    atrasada, sem alteração automática do estado nem prorrogação. Replanejamento
    exige novo prazo e motivo, preservando o anterior no histórico.
52. **Continuidade após execução:** registrar realização da próxima ação exige
    outra ação com prazo ou conclusão/cancelamento autorizado do acompanhamento.
    Enquanto ativo, manter um próximo passo definido.

## Rodada 14 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

53. **Uma organização por escola no core:** cada organização representa uma
    única escola com cadastros, permissões e histórico próprios, mesmo sob a
    mesma mantenedora. Compartilhamento entre unidades fica para a evolução de
    gestão de redes.
54. **Identidade global e vínculos independentes:** uma pessoa pode usar uma
    identidade de acesso para várias escolas, recebendo vínculos, papéis e
    concessões independentes em cada uma. Desativar seu vínculo em uma escola
    não desativa o vínculo em outra.
55. **Identificação estável do estudante:** matrícula ou chave externa identifica
    o estudante dentro da escola e permanece estável entre anos letivos. Turma e
    situação ficam em matrículas por período. Se a escola reutilizar números
    anualmente, definir outra chave estável antes de importar, sem unir por nome.
56. **Importação com ambiguidades explícitas:** linhas sem chave confiável ou com
    identidade conflitante ficam pendentes de resolução explícita. Linhas válidas
    podem ser importadas após confirmação. Distinguir importadas, rejeitadas e
    pendentes; não resolver homônimos automaticamente.

## Rodada 15 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

57. **Atualização cadastral confirmada:** quando a chave identifica estudante
    existente, mostrar alterações propostas e exigir confirmação antes de atualizar
    campos permitidos. Campo vazio não apaga valor existente automaticamente.
    Relatos, permissões e histórico de acompanhamentos ficam fora da importação
    cadastral.
58. **Ausência no CSV não encerra vínculo:** estudante ausente do arquivo mantém
    cadastro e matrícula. Arquivar ou encerrar vínculo exige ação explícita;
    arquivo parcial não é lista definitiva de exclusão.
59. **Histórico de turma:** troca de turma preserva o vínculo anterior com suas
    datas. No core, manter somente uma turma principal vigente por estudante em
    cada ano letivo. Grupos e atividades complementares não são segunda turma
    principal.
60. **Duplicidades com assistência:** no piloto, corrigir duplicidades por
    procedimento assistido e auditado, sem fusão automática. Conferir identidade e
    vínculos antes de consolidar, manter rastreabilidade e impedir mistura de
    históricos de pessoas diferentes.

## Rodada 16 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

61. **Exportação mínima:** PDF e CSV começam somente com informações operacionais
    autorizadas. Incluir seções restritas exige seleção explícita e permissão
    específica de exportação; poder ler relato não autoriza exportá-lo.
62. **Autorização em cada etapa:** verificar autorização na solicitação, geração
    e download. Bloquear entrega se o acesso necessário for revogado; ter gerado
    arquivo antes da revogação não garante direito ao download posterior.
63. **Relatório individual sem terceiros por padrão:** excluir dados dos demais
    participantes, mesmo quando quem gera pode lê-los. Incluir identificação ou
    relatos de terceiros exige seleção explícita e autorização de exportação
    para cada trecho. A prévia mostra o conteúdo selecionado.
64. **Arquivos temporários privados:** relatórios gerados ficam em armazenamento
    privado, expiram e são removidos por rotina, mantendo registro auditável de
    geração e downloads. Definir prazo na política operacional aprovada antes do
    piloto; não presumir retenção indefinida.

## Rodada 17 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

65. **Notificações sob autorização atual:** usar texto operacional mínimo e
    deixar de revelar referências ao recurso quando o destinatário perde acesso,
    mesmo em notificações já recebidas. Consulta e abertura do destino revalidam
    autorização; título e prévia também não revelam conteúdo indevido.
66. **Quarentena sem bloquear o relato:** permitir envio do registro enquanto o
    anexo aguarda verificação, sem leitura ou download do arquivo até aprovação.
    Se rejeitado, preservar o registro, informar rejeição e permitir novo envio
    autorizado.
67. **Anexos sem liberação por atribuição:** atribuir tarefa não libera anexos do
    acompanhamento. Cada arquivo compartilhado deve estar explicitamente
    autorizado para o destinatário; instrução compartilhável não libera
    documentos de origem automaticamente.
68. **Auditoria com permissão própria:** consultar eventos de acesso restrito
    exige permissão específica, separada da administração de cadastros. Auditar
    a consulta e mostrar metadados necessários sem reproduzir relatos.

## Rodada 18 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

69. **Cancelamento em Aberto:** permitir cancelamento direto de acompanhamento
    Aberto mediante permissão, motivo e tratamento das atribuições existentes,
    sem passagem artificial por Em acompanhamento.
70. **Correção de aceite:** atribuição Aceita permanece encerrada. Corrigir
    aceite indevido exige adendo justificado e, se necessário trabalho adicional,
    nova atribuição relacionada. Preservar o aceite anterior no histórico.
    Se o acompanhamento estiver concluído, novas providências exigem reabertura
    autorizada.
71. **Cancelamento terminal da atribuição:** atribuição Cancelada permanece
    encerrada. Retomar providência exige nova atribuição relacionada, preservando
    cancelamento e motivo.
72. **Envio direto de devolutiva:** permitir que o destinatário envie devolutiva
    de Pendente sem marcar Em andamento antes, registrando data da execução e
    histórico do envio, sem inventar horário de início.

## Rodada 19 — 13 de novembro de 2026

As quatro recomendações foram confirmadas pelo responsável pelo produto.

73. **Configuração aprovada por escola:** prazo de triagem, nomenclaturas,
    categorias, concessores e política de acesso são configurações aprovadas por
    cada escola no onboarding. A aprovação respeita as proteções obrigatórias do
    produto e não permite desativar isolamento, auditoria ou autorização.
74. **Condições para dados reais:** permitir dados reais somente após aprovação
    registrada dos responsáveis escolares, da matriz de acesso e das políticas
    de tratamento, retenção e suporte. Até lá, desenvolvimento e validação usam
    dados sintéticos. Escola piloto, segmento comercial e fornecedores continuam
    sem escolha confirmada.
75. **Verificações bloqueiam o piloto:** falhas nos testes de isolamento e acesso
    restrito, MFA dos perfis exigidos, restauração de backup ou validação do fluxo
    em desktop e celular bloqueiam entrada de dados reais. Demonstração visual
    ou fluxo com um usuário não substituem as verificações.
76. **Correção assistida de duplicidades:** exigir confirmação documentada da
    escola sobre a identidade e execução por profissional autorizado, com prévia
    dos vínculos afetados e histórico da correção. Limitar à mesma escola; não
    ampliar permissões nem juntar relatos de pessoas distintas.

## Questões ainda abertas

- Escolas piloto, segmento comercial, equipe e calendário: permanecem sem escolha
  confirmada, conforme a seção 14 do PRD.
- Valores das configurações por escola: serão aprovados no onboarding, conforme
  decisões 47 e 73.
- Região, fornecedores, retenção, disponibilidade dos arquivos exportados e
  condições de suporte: dependem das políticas aprovadas antes de dados reais,
  conforme decisões 64 e 74.
- Versões, adapters opcionais e detalhes técnicos: dependem de pesquisa e
  validação na implementação, conforme seções 7 e 16 do PRD.

## Estado da entrevista

Entrevista encerrada em 13 de novembro de 2026, com decisões 1–76 registradas
e entendimento compartilhado confirmado na decisão 77. As questões abertas
acima permanecem pendentes; a confirmação não atribui valores nem escolhe
escolas ou fornecedores. Implementação, migração de dados e contratação são
etapas posteriores, não executadas nesta entrevista.

## Confirmação final — decisão 77

O responsável pelo produto confirmou a síntese abaixo e o encerramento do
aprofundamento documental:

77. **Entendimento compartilhado:** registros passam por triagem; acompanhamentos
    têm responsável, próxima ação e prazo. Acesso restrito exige concessão
    explícita; cargo, autoria e atribuição não liberam todo o conteúdo.
    Devolutivas exigem revisão; conclusão, cancelamento e reabertura preservam
    histórico. Cada escola mantém dados e permissões independentes; importações
    não unem homônimos automaticamente. Exportações revalidam permissões; anexos
    e notificações seguem as mesmas restrições. Dados reais dependem de
    aprovações escolares e verificações técnicas. Escolas piloto, fornecedores,
    calendário e valores operacionais continuam pendentes. A implementação será
    uma etapa posterior.

## Verificação do repositório

Na exploração desta rodada, o código contém o scaffold Next.js/Turborepo,
sem implementação de domínio ou dados a migrar. O destino obrigatório permanece
TanStack Start, NestJS e Prisma/PostgreSQL, conforme o PRD; o scaffold não
constitui uma decisão alternativa aprovada.
