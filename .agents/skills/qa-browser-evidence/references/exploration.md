# Cenários exploratórios plausíveis

Selecione os casos que podem violar uma regra da entrega. Para cada um, defina
o estado esperado antes de executar. Experimentos sem regra confirmada geram
uma pergunta de produto, não automaticamente um bug. Use apenas ambientes e
dados sintéticos autorizados; limites/falhas deliberadas não atingem produção.

| Situação do usuário                                                          | Pergunta verificável                                                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Clica duas vezes em enviar ou pressiona Enter repetidamente                  | Há uma única operação e feedback coerente?                                                 |
| Fecha modal durante envio e a reabre; usa Escape                             | O resultado permanece correto e o foco retorna ao lugar esperado?                          |
| Usa voltar/avançar, reload ou link direto no meio do fluxo                   | A rota, o passo e os dados permanecem consistentes sem pular autorização?                  |
| Abre o mesmo formulário ou convite em duas abas                              | Conflito/reuso é tratado sem duplicar efeito nem perder atualização silenciosamente?       |
| Tem sessão expirada ou faz logout em outra aba                               | A operação recusa acesso e conduz à recuperação sem exibir dados antigos?                  |
| Troca de escola, conta ou papel com uma tela aberta                          | Respostas atrasadas e cache não exibem dados da escola anterior?                           |
| Tenta URL/API de outra escola ou recurso de outro usuário                    | O servidor recusa acesso e não revela conteúdo/metadados indevidos?                        |
| Cola texto longo, acentos, emoji, espaços e caracteres HTML                  | Limites/normalização são coerentes entre UI/API; texto não quebra layout nem executa HTML? |
| Preenche só espaços, apaga seleção, envia campos extras ou enum desconhecido | A validação devolve erro seguro sem alterar persistência?                                  |
| Perde rede, recebe timeout/erro ou tenta novamente após resposta ambígua     | O estado final é recuperável e a repetição não duplica efeito?                             |
| Recebe respostas fora de ordem ao filtrar/trocar abas rapidamente            | A tela mostra a seleção atual, com loading/erro coerentes?                                 |
| Usa teclado, zoom de 200%, celular estreito e reduced-motion                 | Conteúdo e ações continuam acessíveis, sem foco preso ou overflow?                         |
| Tem nome comprido, lista vazia ou muitos resultados                          | Quebra de linha, paginação e estados vazios preservam contexto e ações?                    |
| Aceita link expirado, revogado, reutilizado ou com outra conta               | O vínculo não é criado indevidamente; o erro permite entender a recuperação?               |
| Age perto da expiração ou em outro fuso                                      | A regra de validade segue o servidor e o horário é compreensível?                          |
| Tem papel de direção/administração e tenta conteúdo restrito                 | O cargo não concede acesso sigiloso automático?                                            |

Para convites do SOE, priorize envio real no Mailpit, falha/retry da fila,
uso único concorrente, conta existente/nova, MFA quando exigido, duas escolas
e ausência de token em logs/URLs públicas/evidência. Não gerar carga sem limite
para provar rate limiting; use tentativas limitadas num ambiente descartável.
