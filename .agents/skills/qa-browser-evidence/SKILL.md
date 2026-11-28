---
name: qa-browser-evidence
description: Planeje e execute QA por etapa com PRD, Chrome conectado, cenários exploratórios de UI/API e evidências sanitizadas em prints e GIFs nas issues do GitHub. Use antes de implementar uma etapa e antes de avançar, abrir PR ou concluir uma entrega.
---

# QA com evidência por etapa

Transforme requisitos em cenários rastreáveis, exercite o produto real e publique
o resultado verificável na issue. Uma etapa é uma fatia de implementação ou
marco de entrega; chamadas de ferramenta individuais não criam novos ciclos.
O pedido do usuário torna este fluxo obrigatório no SOE a partir de agora.

## Antes da etapa: contexto, baseline e plano

1. Leia as instruções do repositório, a issue e a spec pai, PRD, decisões,
   glossário e ADRs relevantes. Para UI, leia DESIGN.md e aplique as skills de
   design exigidas pelo projeto, incluindo `screen-design-review`. Para API,
   confira o contrato/OpenAPI da mesma versão da aplicação e a arquitetura.
2. Identifique critérios de aceite, regras confirmadas e dúvidas em separado.
   Registre branch, SHA e alterações locais: resultados de uma árvore suja
   não podem ser atribuídos só ao SHA base. Defina ambiente, URLs, fuso,
   identidades sintéticas, papéis, escolas e viewports.
3. Descubra as ferramentas realmente disponíveis e confirme que a extensão
   Chrome está conectada. Leia [browser-evidence.md](references/browser-evidence.md)
   para controlar o navegador, capturar mídia e observar tráfego. Se faltar
   acesso, registre o QA pela extensão como BLOQUEADO, explique a conexão
   necessária e continue apenas as verificações independentes possíveis.
4. Execute o baseline relevante já disponível e publique um plano na issue
   **antes de alterar a implementação da etapa**. Quando o fluxo começar no
   meio de um trabalho, registre esse fato; não invente um baseline anterior.
   Para mudanças apenas documentais, valide instruções e cenários de uso;
   marque UI/API sem impacto como NÃO APLICÁVEL com justificativa.
5. Monte a matriz com o [modelo de relatório](assets/report-template.md).
   Cada cenário tem ID estável, fonte do requisito, risco/prioridade,
   preparação, passos, resultado esperado observável e evidências necessárias.
   Use [cenários exploratórios](references/exploration.md) para selecionar
   ações plausíveis na superfície alterada. Adapte a cobertura ao risco;
   evite uma lista grande de cenários sem execução ou propósito.

## Durante a etapa: executar, investigar e corrigir

- Use a interface real pela extensão Chrome como percurso de exploração.
  Exercite o estado visível e seus efeitos; scripts de teste complementam
  esse percurso e têm sua origem identificada. Valide o backend pelo HTTP
  público e banco/serviços reais previstos pelo projeto. Mocks servem para
  falhas controladas quando identificados; não comprovam a integração real.
- Para cada cenário, compare esperado/observado e registre APROVADO, FALHOU,
  BLOQUEADO, NÃO EXECUTADO ou NÃO APLICÁVEL. Somente execução com evidência
  recebe APROVADO. Um HTTP 200 ou screenshot sem asserção não basta.
- Confira UI: hierarquia e alinhamento, nomes longos e caracteres especiais,
  overflow, ações alcançáveis, loading/vazio/erro/sucesso, teclado/foco,
  validação, refresh, retorno e reduced-motion quando houver animação.
  Capture desktop e celular nas superfícies afetadas. Abra todos os prints;
  assista ao GIF inteiro e confira começo, ação e resultado.
- Confira API: método/rota, status esperado pelo contrato, schema e valores,
  erros seguros, efeitos persistidos e ausência de efeitos indevidos. Compare
  UI/rede/estado após reload. Para recursos escolares, prove autorização no
  servidor e isolamento entre duas escolas, incluindo acesso direto à URL
  e requisição de identidade sem permissão. Menu oculto não prova autorização.
- Registre console e falhas de rede pertinentes. Para e-mail, diferencie
  enfileirado, aceito pelo SMTP e convite aceito; caixa local não prova leitura
  humana nem entrega externa. Para retry/concorrência, verifique duplicidade,
  persistência e auditoria; não inferir efeito só pela resposta.
- Em uma falha, capture reprodução mínima e mídia sanitizada; registre
  gravidade, frequência, esperado/observado e passos. Corrija problemas no
  escopo autorizado, rode regressão e recapture a mesma sequência. Preserve
  a falha original e seu reteste como execuções separadas. Para defeitos fora
  do escopo, vincule o achado na issue; abra bug separado quando for útil,
  seguindo as regras de triagem do projeto. Não ampliar o produto para
  satisfazer uma expectativa que não existe no requisito.

## Antes de avançar: evidência e decisão

Leia [github-evidence.md](references/github-evidence.md) para publicar o plano,
relatório, prints, GIFs e provas de API na issue correspondente. A instrução
do usuário autoriza essas publicações no repositório do projeto; respeite
permissões de ferramenta e publique somente dados sintéticos saneados.

Faça o checkpoint ao terminar a etapa e novamente quando mudanças posteriores
invalidarem a evidência. Registre comandos e exit codes realmente observados,
limitações e bugs remanescentes. Todo resultado deve apontar para um arquivo
publicado ou log verificável; um caminho local é só pendência de publicação.

O gate está APROVADO quando os cenários exigidos da etapa passaram, as falhas
materiais foram resolvidas/retestadas e a evidência foi publicada. Se a
extensão, mídia requerida, ambiente ou upload estiver indisponível, o gate
continua PENDENTE/BLOQUEADO. Trabalho independente pode continuar com esse
limite explícito; não declarar a etapa validada, pronta para PR ou concluída.
Não fechar a issue nem marcar critérios de aceite com base apenas neste
protocolo ou em testes parciais. Se o usuário aceitar uma exceção, registre
qual cobertura foi dispensada e a mensagem que autorizou a exceção.
