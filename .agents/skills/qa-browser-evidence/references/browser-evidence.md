# Chrome, captura e observação

## Conexão

Descubra ferramentas de browser/computer use disponíveis nesta sessão e leia
suas instruções. Confirme o navegador e a aba alvo pela URL e estado visível.
Use o Chrome conectado pela extensão solicitada pelo usuário. Ter Chrome
instalado, uma ferramenta de busca web ou Playwright não comprova conexão.

Se as ferramentas não estiverem disponíveis, peça ao usuário para conectar
`@Chrome` pelo app desktop, conforme a documentação atual da extensão, e
registre o bloqueio. Não procurar credenciais do perfil, abrir portas de
depuração ou instalar outra extensão como efeito lateral. Planejamento,
testes HTTP e checks independentes podem continuar com origem explícita.
`@Browser` ou Playwright não substituem a extensão neste gate sem autorização
do usuário. O SOE já tem Playwright para regressão automatizada complementar.

Referência oficial para conexão (consulte novamente se precisar orientar a
configuração): https://learn.chatgpt.com/docs/chrome-extension.

## Capturas estáticas

Use a ferramenta de screenshot da aba efetivamente testada. Registre URL
sanitizada, identidade/papel sintéticos, viewport e estado. Capture início,
erro e resultado quando fizerem parte do cenário. Espere carregamento real,
fontes e animações finitas; não espere spinners infinitos. Para um bug de
transição, grave o movimento sem desativá-lo. Capture topo e ações de uma
modal rolável em arquivos separados quando necessário.

Nomes sugeridos: `QA-006-03-convite-erro-mobile.png` e
`QA-006-04-aceite-desktop.gif`. Registre dimensões reais; modo responsivo do
desktop não equivale a validação em dispositivo físico.

## GIFs de comportamento

Descubra se as ferramentas conectadas gravam/exportam GIF ou vídeo. Quando
disponível, inicie antes da ação e pare após o resultado; salve o arquivo real.
Se o formato for vídeo, converta com ferramenta local disponível, preservando
a ordem e a duração; documente recortes, aceleração e conversão no relatório.

Se houver apenas screenshots, capture frames reais durante a interação e
converta com um encoder local disponível, registrando os intervalos. Uma
montagem de estados deve ser rotulada **sequência de estados**, sem alegar
que comprova fluidez, duração ou ausência de flicker. Para testar movimento,
é necessária gravação contínua ou amostragem temporal suficiente e registrada.
Um print animado artificialmente não é evidência de comportamento do app.

Se faltar gravação, exportação ou encoder, registre exatamente a limitação e
deixe o GIF pendente; não anuncie um arquivo que não existe. Instalar uma
dependência adicional segue as permissões da sessão, sem contratar serviços.
Abra o GIF exportado e confira sequência, legibilidade e ausência de segredos
em todos os frames antes de publicá-lo.

## API e rede

Quando disponíveis, use as ferramentas de DevTools/CDP autorizadas para
observar requests, responses, console, erros e timing do cenário. Siga o
acesso suportado pela integração e as permissões do usuário; não habilite
depuração irrestrita por conta própria. Se a extensão não expuser a rede,
complete com testes HTTP pela fronteira pública e indique que a observação
no navegador ficou indisponível. Não afirmar que um request HTTP independente
é o mesmo disparado pela UI sem evidência de correlação.

Registre somente rota sanitizada, método, status, campos permitidos e asserções.
Mantenha cookies/sessões no contexto privado de teste. Não publicar HAR bruto,
headers de autenticação, corpo de login, HTML de e-mail com token, fragmentos
de convite, QR/secrets MFA ou respostas com dados reais. Para comprovar
saneamento de segredos, publique a asserção booleana e a localização do teste,
não o segredo sintético usado como sentinela.
