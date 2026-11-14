# Prisma 7 com adapter PostgreSQL explícito

Fixamos Prisma CLI, client e adapter-pg em 7.10.1 para manter uma única API de
geração/migração suportada e testada, em vez de adotar o release candidate da
linha 8 ou misturar seus novos comandos com a documentação da linha 7. O cliente
gerado usa ESM e fica no pacote database; limites de conexão/consulta pertencem
ao adapter, e controllers/aplicação não conhecem tipos Prisma. A troca de linha
principal exige revisar adapter, artefatos e migrações em conjunto.
