# Testar convites pela interface local

Use somente identidades e dados sintéticos. O fluxo exige a configuração local
do [runbook de desenvolvimento](local-foundation.md), migrations aplicadas e
Mailpit iniciado com `pnpm mailpit`. As variáveis `INVITATION_*` do `.env.example`
habilitam o envio; reinicie a API após adicioná-las ao `.env` existente.

1. Abra http://127.0.0.1:43120/login. Entre com um administrador de escola já
   preparado. Para criar uma escola, use o operador sintético
   `operator@example.test` e a senha de desenvolvimento `12345678`, após o seed.
2. O operador verifica MFA em Configurações → Segurança e cria a escola em
   Administração → Escolas piloto. Nesta entrega, o responsável inicial da
   escola ainda deve ser uma identidade existente, como `ana@example.test`.
3. Entre com a conta do responsável, configure/verifique MFA e abra
   Escola → Minhas escolas. Escolha explicitamente a escola e use a contagem
   de profissionais ou o menu da linha → Ver profissionais para abrir a equipe.
4. Clique em Convidar profissional. Preencha nome, um e-mail sintético novo
   (por exemplo `profissional-manual@example.test`) e os papéis. Revise os
   dados; Voltar e editar preserva o formulário. Enviar convite cria a entrada
   pendente e enfileira o e-mail.
5. Abra http://127.0.0.1:43124. Confira o e-mail e abra Aceitar convite em uma
   janela anônima para representar a pessoa convidada sem sair da conta
   administradora. Se abrir na conta errada, a tela oferece Trocar de conta.
6. Uma identidade nova cria nome/senha e entra. Uma identidade existente usa
   a senha que já possui. Confira escola e papéis e clique em Aceitar convite.
   Administração escolar exige configurar/verificar MFA antes desse aceite.
7. Volte à lista da escola e use Atualizar lista; a tag passa para Ativo quando
   o aceite cria um vínculo ativo. O tooltip e Ver detalhes separam envio e aceite.
   A pessoa passa a ter um vínculo somente nessa escola, com esses papéis.
   Reabrir o mesmo link deve informar Convite indisponível.

Papéis de administração ou direção não liberam relatos restritos. Uma pessoa
pode receber outro convite de outra escola com papéis independentes.

## Estados e recuperação

- E-mail na fila: o envio ainda será processado. A lista acompanha convites
  pendentes automaticamente enquanto a página está aberta.
- E-mail enviado: o SMTP local aceitou a mensagem; isso não comprova leitura
  humana. O Mailpit permite consultar a mensagem capturada.
- Falha no envio: o worker esgotou as tentativas; confira a configuração e
  disponibilidade do SMTP local. Reenvio geral/revogação pela UI ainda não
  fazem parte desta superfície.
- Pendente de aceite: o profissional ainda não concluiu o aceite.
- Expirado: crie outro convite para o mesmo e-mail/escola. A substituição do
  expirado preserva histórico e auditoria, e o link anterior continua inválido.
  Convite ainda válido duplicado retorna conflito, sem criar outro.

Não publique links completos de convite, senha, QR/chave MFA, cookies ou traces
brutos como evidência. Use prints somente de estados que não contenham segredos;
o QA das issues segue a skill `qa-browser-evidence`.
