# Evidências nas issues do GitHub

Leia o guia de issue tracker do repositório antes de operar. No SOE, o destino
é `LuisCarlos-git/soe-saas`, com a conta `LuisCarlos-git`; confirme a issue e a
conta usando o CLI. Leia também as regras de triagem antes de aplicar labels.
O pedido atual autoriza publicar planos, relatórios e mídia de QA nas issues
relacionadas. Não exige uma nova confirmação por comentário de rotina.

## Plano e relatório

Publique um comentário de plano antes de cada etapa e um comentário de
resultado antes de avançar. Use IDs estáveis e um identificador de execução
com data UTC; uma nova execução não sobrescreve a evidência anterior.
Inclua links entre plano, resultado, bug e reteste. Use `gh issue comment`
com `--repo` e `--body-file` para preservar Markdown e evitar expansão pelo
shell. Confira o retorno da publicação e registre a URL real do comentário.
Não fechar issues automaticamente nem editar o checklist a partir de uma
cobertura parcial.

## Publicação de mídia

Capture primeiro em diretório local ignorado pelo Git. Revise prints e todos
os frames do GIF; mantenha artefatos brutos privados. O SOE é público:
publique somente conteúdo sintético sanitizado. Sempre que possível, capture
um estado que não contenha segredos; mantenha originais privados e descreva
qualquer redação aplicada à cópia publicada. Refaça a captura se a redação
esconder o próprio comportamento que deveria comprovar.

Prefira anexos de mídia suportados pela interface do GitHub quando a ferramenta
conectada permitir upload. Só utilize a URL retornada após upload confirmado.
Um caminho no computador não é um anexo; `gh issue comment` publica texto e
não transforma arquivos locais em anexos. Não inventar endpoints de upload.

Alternativa para arquivos pequenos: versionar somente as evidências revisadas
e seu relatório em `docs/qa/issue-<N>/<run-id>/`, numa branch de trabalho.
Faça stage explícito desses caminhos, confira o diff staged e publique a
branch sem incluir alterações de produto pendentes. Nunca push em main nem
reescreva histórico. Ao fazer commit apenas de evidências, deixe claro que a
aplicação testada estava em WIP e liste os caminhos alterados relevantes; o
commit da evidência não é o commit completo da implementação. O fluxo de
revisão/PR do projeto continua valendo.

Vincule no comentário URLs imutáveis usando o SHA publicado:
`https://github.com/<owner>/<repo>/blob/<sha>/docs/qa/issue-<N>/<run-id>/report.md`.
Para imagens/GIFs revisados, use Markdown de imagem com a URL publicada do
arquivo, verificando que ele abre no GitHub. CI artifacts também podem ser
usados com o link real da execução e a retenção informada. Escolha o canal
que o ambiente realmente suporta e registre arquivos sem publicação como
PENDENTES. Evite vídeos grandes no Git; use o mecanismo de anexos ou artifacts
já disponível no projeto.

## Conteúdo seguro

Publique resumos de API com campos permitidos e asserções de status/schema/
efeitos. Exclua tokens de convite, cookies, senhas, QR MFA, storageState,
segredos de ambiente, HAR bruto e dados de estudantes. E-mails sintéticos
`example.test` podem ser usados para contexto, sem expor links autenticadores.
Não contornar bloqueios de publicação: registre o erro seguro e mantenha o
gate pendente até conseguir publicar pelo canal autorizado.
