# QA — ações da verificação MFA

Pedido atendido: **Cancelar** fica à esquerda de **Verificar código**, com
variante secundária outline. O rótulo alternativo **Voltar ao QR code** mantém
o mesmo posicionamento. Cancelar usa `type="button"` dentro do formulário,
preservando sua ação sem disparar envio.

- Plano: https://github.com/LuisCarlos-git/soe-saas/issues/4#issuecomment-7072830149.
- Base: `0a00412acfdc3351970b5cf6d51005b4b23aefb6`.
- Data da evidência: 22/11/2026 UTC (21/11 no fuso America/Sao_Paulo).
- Escopo: dois arquivos de UI/teste; sem mudança de API, autenticação ou papéis.
- Fonte e evidência publicadas no mesmo commit; o manifesto identifica os
  bytes dos arquivos testados. Os testes foram executados antes do commit.

## Verificação

Build e typecheck do web, lint dos arquivos alterados, Prettier e diff passaram.
A jornada MFA existente passou em desktop 1280×720 e mobile 360×780:
**2 testes aprovados**, cobrindo inscrição, voltar ao QR, desafio inválido,
retorno de foco e login com verificação válida. Nenhum teste novo de layout
foi criado; o percurso existente produziu as capturas complementares.

As quatro imagens foram abertas e revisadas; uma revisão independente não
encontrou problema material. As ações permanecem lado a lado em 360 px. Na
variante com rótulo longo, Verificar código quebra em duas linhas sem corte.
PNGs são fullPage; sua altura pode exceder a viewport. Toasts visíveis pertencem
aos casos negativos exercitados no percurso de teste.

| Estado                   | Desktop                                 | Mobile                                 |
| ------------------------ | --------------------------------------- | -------------------------------------- |
| Cancelar e verificar     | [Print](mfa-actions-cancel-desktop.png) | [Print](mfa-actions-cancel-mobile.png) |
| Voltar ao QR e verificar | [Print](mfa-actions-back-desktop.png)   | [Print](mfa-actions-back-mobile.png)   |

Logs em [mfa-e2e.log](mfa-e2e.log); origem e hashes no [manifesto](manifest.json).
Os prints publicados não têm QR, chave MFA ou código preenchido. Para futuras
evidências de CI, a captura do passo de QR é mascarada e traces MFA ficam
desabilitados; a leitura/verificação do QR pelo teste continua ocorrendo no DOM.

## Limites

Capturas e interação feitas com Playwright complementar. Nenhum Browser ou
Chrome conectado ficou disponível nesta sessão; GIF continua pendente e o gate
da skill qa-browser-evidence permanece pendente nesse recorte. Não houve teste
de leitor de tela, zoom ou dispositivo físico. Esta alteração não comprova
leitura restrita e não altera o critério pendente nem encerra a issue #4.
