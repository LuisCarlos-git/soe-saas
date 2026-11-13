# Issue tracker: GitHub

Issues e specs ficam em https://github.com/LuisCarlos-git/soe-saas.
Use o CLI gh com a conta LuisCarlos-git e
--repo LuisCarlos-git/soe-saas nas operações de tickets.

## Operações

- Publicar: gh issue create --title "..." --body-file <arquivo>
- Ler: gh issue view <n> --json number,title,body,labels,comments
- Listar: gh issue list --state open
- Comentar: gh issue comment <n> --body-file <arquivo>
- Classificar: gh issue edit <n> --add-label "..."
- Remover label: gh issue edit <n> --remove-label "..."
- Encerrar: publique a explicação como comentário e depois
  execute gh issue close <n>.

Inclua --repo LuisCarlos-git/soe-saas nesses comandos.
Antes da primeira criação na sessão, confira a conta com
gh auth status e o destino com gh repo view --json nameWithOwner.

## Hierarquia e dependências

Use sub-issues e dependências nativas quando disponíveis na
versão instalada do gh. Consulte o --help do comando.

Como alternativa, coloque "Part of #<pai>" no início da issue
filha e mantenha uma lista de tarefas na issue pai.
Para bloqueios, use "Blocked by: #<n>, #<n>".
Uma issue está desbloqueada quando todos os bloqueadores
estiverem fechados.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## Interpretação das skills

"Publicar no issue tracker" significa criar uma GitHub issue.
"Buscar o ticket relevante" significa ler a GitHub issue.

## Wayfinder

O mapa é uma issue com label wayfinder:map.
Tickets filhos usam wayfinder:<tipo>, com tipo research,
prototype, grilling ou task, e seguem a hierarquia acima.

A próxima tarefa é a primeira filha aberta na ordem do mapa
que não tenha bloqueadores abertos nem responsável.
Para assumir, atribua a issue a @me.
Para resolver, comente o resultado, feche a issue e acrescente
um resumo com link às decisões do mapa.
