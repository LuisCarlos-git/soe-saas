# Sessões e demonstração sintética

Depois de `pnpm install --frozen-lockfile` e `pnpm build`, executar `node scripts/e2e-server.mjs` com Docker disponível. Esse comando cria PostgreSQL descartável, aplica migrations reais, provisiona duas identidades sintéticas e inicia web/API. Abrir http://127.0.0.1:43220/login. Usar `ana@example.test` ou `bia@example.test`, senha `12345678`. O limite nessa demonstração é 100 tentativas/60 segundos para permitir jornadas repetidas. Ctrl+C encerra processos e remove o banco. Não usar as fixtures em banco persistente nem cadastrar dados reais.

Para testar com `pnpm dev`, após build e migrations execute `pnpm dev:seed`. Esse comando cria ou atualiza somente `ana@example.test` e `bia@example.test`, com senha `12345678`, e limpa o contador de tentativas no banco local. É idempotente e aceita somente NODE_ENV=development, host 127.0.0.1, porta 54329, banco soe_dev e usuário soe. A rotina E2E continua limitada ao ambiente test e banco soe_test. Nenhuma rotina é endpoint HTTP ou aceita produção; não há cadastro público nem contas na migração. Convites continuam na issue #6.

Configuração: `AUTH_ORIGIN` deve ser uma origem única, sem caminho/barra final; o navegador a envia em Origin. `AUTH_SECRET` deve ser independente por ambiente (gerar fora do repositório, por exemplo `openssl rand -base64 48`). Em produção, o boot rejeita o segredo de desenvolvimento e origem sem HTTPS. Não expor variáveis AUTH_* no Vite. `AUTH_RATE_WINDOW` está em segundos, `AUTH_RATE_MAX` limita tentativas por IP do socket e endpoint; defaults 60/5. O ingress local é conservador: não confia em cabeçalhos de proxies; revisar a topologia antes de implantação pública.

Entrar: POST `/api/auth/sign-in/email`, JSON `{email,password}`, Origin permitido. Sucesso 204, sem token JSON; cookie `soe.session_token` (prefixo `__Secure-` em produção), HttpOnly, SameSite=Lax, duração de 8 horas sem refresh automático nesta fatia. Sair: POST `/api/auth/sign-out`, mesmo Origin e cookie, sucesso 204 com remoção do cookie. GET `/api/v1/identity/session` retorna somente id/nome/e-mail ou 401. Todas as respostas são no-store. Rate limit retorna 429 e Retry-After. Origem indevida/ausente é 403. Falhas de credenciais não distinguem e-mail desconhecido e senha incorreta.

Para investigar, seguir x-correlation-id e eventos técnicos `session.start`/`session.end` nos logs JSON. Não registrar bodies, cookies, senha ou URL livre. A tabela global `authentication_audit` registra SESSION_CREATED/SESSION_REVOKED com usuário técnico e instante, na transação da sessão; não copia token, e-mail ou IP. A auditoria não tem endpoint público. Falhas inesperadas do banco falham fechadas; não habilitar cache de sessão como contorno. Revogação consulta o banco em cada chamada.

No SSR, o destino é fixo e o cliente HTTP é criado por execução; somente o cookie de sessão é encaminhado, sem Authorization ou demais cookies. QueryClient é criado por Router, dados de sessão não são persistidos no navegador. Login/logout confirmados cancelam consultas e limpam o cache antes de navegar. Não colocar SSR autenticado em cache público/CDN.

Verificações: `pnpm test:integration`, `pnpm test:e2e`, `pnpm architecture:check` e `pnpm bundle:check`. Não limpar/resetar um banco persistente para executar testes. Os testes usam exclusivamente Testcontainers e migrations.

## MFA TOTP — issue #4

Better Auth 1.7.23 e seu plugin `twoFactor` executam inscrição e desafio TOTP no
NestJS. Referência oficial: https://better-auth.com/docs/plugins/2fa; o código e o
schema da versão instalada foram conferidos. Nenhum SDK de autenticação entra
no web. O segredo TOTP e os códigos de recuperação ficam cifrados pelo provedor
com AUTH_SECRET; proteger a chave e os backups é requisito operacional. Rotação
desse segredo requer procedimento validado antes do piloto.

Na página `/account`, “Configurar aplicativo” abre uma modal com confirmação da
senha, QR code e verificação do primeiro código. Escanear o QR code no aplicativo
autenticador e avançar em “Já adicionei ao aplicativo” para informar o primeiro
código. “Voltar ao QR code” retorna à etapa anterior dentro da modal. A conta é
identificada pelo emissor **SOe** e pelo e-mail do
profissional. “Não consegue escanear?” revela a chave para configuração manual com
códigos baseados em tempo. SOe é o nome da conta, não uma chave secreta fixa.
O QR code é gerado localmente por qrcode.react 4.2.0, sem enviar a URI a serviços
externos. [Documentação da biblioteca](https://github.com/zpao/qrcode.react).
A chave só permanece em memória enquanto a modal está aberta; não entra
no QueryClient, armazenamento do navegador, SSR, logs ou artefatos de build.
Fechar a modal remove o QR code, a chave e os campos. O foco retorna ao botão
que abriu a configuração; no login, retorna ao e-mail. Escape e “Fechar” não
autenticam a sessão. A inscrição pendente não concede MFA. Ao fechar ou recarregar
antes de confirmar, iniciar
a configuração novamente. A sessão é rotacionada pelo provedor na ativação.

Endpoints públicos, sempre no-store e sob o Origin permitido:

- POST `/api/auth/two-factor/enable`, `{password}`: 200 com somente `{totpURI}`.
- POST `/api/auth/two-factor/verify-totp`, `{code}` de seis dígitos: 204 e cookies
  HttpOnly; código inválido retorna 401/INVALID_MFA. Não aceitar trustDevice.
- GET `/api/v1/identity/mfa`: `{enabled,verified}` da sessão atual, ou 401.
- Login com MFA inscrita retorna 200 `{twoFactorRedirect:true}` sem sessão
  autenticada. Verificar o código antes de acessar `/account`.

Tokens JSON, códigos de recuperação e endpoints de desativação, geração de
códigos, OTP e dispositivos confiáveis não são expostos. Recuperação de conta e
remoção/troca do fator **não foram validadas** e não estão disponíveis. Não
prometer recuperação por e-mail ou desativar MFA via suporte sem um procedimento
separadamente aprovado. Não inserir dados reais com essa pendência operacional.

A marca `session.mfaVerified` nasce falsa, inclusive em sessões antigas, e só é
atualizada após sucesso do handler oficial TOTP. As triggers registram MFA_ENABLED
e MFA_VERIFIED na mesma transação de cada mudança, sem chave, código ou token.
Falha posterior do marcador mantém acesso fechado, ainda que o provedor já tenha
ativado o fator. Confirmar novamente o código ou entrar novamente.

`SessionSecurity.requireMfa` é o caso de uso puro para exigir essa pré-condição
em futuros consumidores, inclusive fora do HTTP. A fronteira HTTP aplica-o por
padrão a `/api/v1/*`, exceto as três rotas exatas de bootstrap/identidade acima.
Uma sessão sem MFA recebe 403/MFA_REQUIRED; ausente, 401. Essa proteção conservadora
antecede os módulos escolares: ainda não há papéis, vínculos, administração nem
relatos restritos implementados. Novos módulos devem compor a pré-condição com
autorização por escola/recurso no caso de uso; MFA sozinha não concede permissão.
Ao disponibilizar operações comuns sem MFA, delimitar explicitamente essa política
sem liberar administração privilegiada ou conteúdo restrito. Não declarar a matriz
de perfis validada antes da entrega dos respectivos módulos.

Limites por endpoint/IP usam o storage PostgreSQL e AUTH_RATE_WINDOW/MAX, inclusive
`/two-factor/*`; o provedor também limita desafios e bloqueia falhas por conta.
Não habilitar trust proxy ou alterar rate limiting sem rever a topologia.

Verificação específica: teste HTTP `apps/api/tests/mfa.test.mjs` com PostgreSQL
Testcontainers/migrations e jornada `apps/web/tests/mfa.spec.ts` com API real,
Axe e viewports desktop/360px. As identidades `mfa-ana@example.test` e
`mfa-bia@example.test` existem somente no provisionamento de teste descartável.
E2E usa web 43220/API 43221 para coexistir com `pnpm dev` em 43120/43121.
A demonstração `node scripts/e2e-server.mjs` passa a abrir em http://127.0.0.1:43220.
`SOE_WEB_PORT` e `SOE_API_PORT` configuram o servidor de preview; SSR usa somente
a porta de API local fornecida pelo ambiente servidor.
