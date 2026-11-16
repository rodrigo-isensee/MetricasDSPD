---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vm-recomendados
commit: 3c8267ae348c82a635614f601527f25d36b4daee
parecer: reprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105-melhorias-15-11 (K-388, recomendados da VM)

Escopo: o diff `d999ee29..3c8267ae` (4 arquivos): `scripts/gerar-sql-migracoes.mjs`, `deploy/sql/00_papeis_e_banco.sql` (regenerado), `docker-compose.prod.yml` e `docs/devops/105-implantacao-vm.md`. Foco pedido: o roteiro de papéis (senhas por `\getenv`, nada impresso nem registrado) e o `verify-full` fora do Docker.

## Gatilhos
`R-SEGURANCA`: credenciais (senhas dos cinco papéis com LOGIN do banco da empresa), conexão com o banco (TLS fora do Docker), infraestrutura (compose de produção).

## Achados
- A1 (bloqueante) scripts/gerar-sql-migracoes.mjs:54 · A conferência nova manda as cinco senhas ao servidor (SELECT :'pwd_x' = '', 00_papeis_e_banco.sql:19,27,35,43,51) antes do SET log_statement='none' (linha 55): com log_statement=all no servidor, as senhas vão ao log. Pôr o SET antes de ${conferir} e regenerar.
- A2 (recomendado) scripts/gerar-sql-migracoes.mjs:55 · O SET só cobre log_statement; com log_min_duration_statement=0 o CREATE ROLE com senha (e o SELECT do A1) vai ao log mesmo assim. Acrescentar SET log_min_duration_statement = -1 na mesma linha do SET, antes da conferência.
- A3 (recomendado) deploy/sql/00_papeis_e_banco.sql:5 · A falha fechada depende do -v ON_ERROR_STOP=1 da linha de comando; sem ele o RAISE não para o script. Pôr \set ON_ERROR_STOP on como primeira linha executável do gerado.
- A4 (recomendado) scripts/db.sh:6 · O verify-full fora do Docker é só documento (105-implantacao-vm.md:91,109): nada recusa PG_MIGRADOR_URL de host não local sem sslmode=verify-full. Uma checagem no db.sh e no lib-pg.sh fecharia o erro de operador.

## Sondas

## Detalhe dos achados
**A1 (média, bloqueante).** Evidência: `deploy/sql/00_papeis_e_banco.sql:19`, `:27`, `:35`, `:43`, `:51` (`SELECT (:'pwd_<papel>' = '') AS ..._vazia \gset`) vêm antes de `:55` (`SET log_statement = 'none';`); a origem é `scripts/gerar-sql-migracoes.mjs:54-55` (`${conferir}` antes do `SET`). O psql interpola `:'pwd_x'` como literal no texto do comando, então cada senha viaja ao servidor dentro de um `SELECT` comum. Antes deste head, a senha só saía do cliente depois do `SET`; o próprio cabeçalho do script (linha 6) e o `docs/devops/105-implantacao-vm.md:191` afirmam esse controle, que a mudança anulou. Nada é impresso no terminal (o `\gset` não exibe; as mensagens do `RAISE` só nomeiam a variável): esse lado do pedido está cumprido. Caminho de ataque: quem lê o log do servidor da empresa (equipe de operação, envio do log a um SIEM ou a uma pasta compartilhada) sem ter direito às credenciais da aplicação, num servidor com `log_statement = 'all'` (configuração comum em banco auditado), obtém as senhas de `dspd_migrador` (DDL sobre o banco `metricas`), `dspd_coletor`, `dspd_api`, `dspd_ref` e `dspd_api_apontamento`. Severidade média (exige acesso ao log e a configuração de log do servidor; o ganho é segredo). Correção mínima: no gerador, emitir `SET log_statement = 'none';` logo depois de `${ler}` e antes de `${conferir}` (o `SET` vale para a sessão inteira, então os `CREATE ROLE` continuam cobertos), rodar `pnpm run db:sql` e commitar o `00_papeis_e_banco.sql` regenerado. Prova esperada do autor: no arquivo gerado, a linha do `SET` antecede o primeiro `SELECT (:'pwd_`. Esforço P. Dono: `devops-engineer` (autor do K-388).

Não foi possível executar a sonda dinâmica (rodar o trecho do roteiro com senhas fictícias contra o banco local de desenvolvimento com `log_statement = 'all'` e procurar as senhas no log): a execução foi negada pela política de permissões da sessão. O achado se apoia na ordem das linhas do arquivo gerado e no comportamento documentado do psql (variável `:'x'` é interpolada no texto da consulta antes do envio). Por isso o bloco `## Sondas` fica vazio.

**A2 (baixa, recomendado).** `log_min_duration_statement = 0` (ou um limiar menor que a duração do comando) registra o texto do comando com a duração, independentemente de `log_statement`. Pré-existente para o `CREATE ROLE`; vale corrigir junto com o A1, na mesma linha: `SET log_statement = 'none'; SET log_min_duration_statement = -1;`. Ambos exigem superusuário, que é quem roda o roteiro. Esforço P. Dono: `devops-engineer`.

**A3 (baixa, recomendado).** Sem `ON_ERROR_STOP`, o `DO ... RAISE EXCEPTION` só imprime o erro e o psql segue; com variável ausente os `CREATE ROLE` falham por sintaxe e os `GRANT` seguintes também, sem dano de segurança mas com estado parcial (banco criado). Um `\set ON_ERROR_STOP on` no início do gerado tira a dependência do operador. Esforço P. Dono: `devops-engineer`.

**A4 (baixa, recomendado).** Conferi o caminho do TLS fora do Docker. Migração: `server/src/plataforma/db/migrar.ts:83` cria o cliente só com `connectionString`, sem sobrescrever `ssl`; a biblioteca de conexão da stack (2.14.1, conferida localmente) traduz `sslmode=verify-full` em `ssl: {}`, ou seja, validação da cadeia e do nome ligada por padrão, e `NODE_EXTRA_CA_CERTS` acrescenta a CA da empresa; sem `sslmode` o `ssl` fica indefinido (o texto do item 3 avisa). Backup: `scripts/lib-pg.sh` exporta só `PGHOST`, `PGPORT`, `PGUSER` e `PGDATABASE`, então `PGSSLMODE=verify-full` e `PGSSLROOTCERT` exportados pelo operador chegam ao `pg_dump`, `pg_dumpall` e `psql` do host (com `DSPD_PG_CONTAINER` eles não são repassados, mas esse modo é só de desenvolvimento). O rollback (`105-implantacao-vm.md:246`) reaproveita as mesmas variáveis. Está correto como documento; a recomendação é transformar em checagem: recusar host diferente de `127.0.0.1`/`localhost` sem `sslmode=verify-full` na URL (`db.sh`) ou sem `PGSSLMODE=verify-full` (`lib-pg.sh`). Esforço P. Dono: `devops-engineer`.

**Sem achado:** `restart: unless-stopped` em `api`, `worker` e `web`; `migrate` e `coleta` seguem `restart: "no"`; teto `json-file` de 5 x 10 MB em todos os serviços (reduz o risco de negação de serviço por disco cheio); portas continuam só em `127.0.0.1`; o pós-deploy só usa `127.0.0.1`; a ordem do rollback (banco antes do código, com backup confirmado) evita o `migrate` antigo sobre banco migrado. Nenhum segredo novo em arquivo versionado (as mensagens e comentários citam só nomes de variáveis).

Suíte: sem PR para esta branch, a suíte inteira fica para o CI do PR; este parecer não afirma CI verde. A revisão é estática sobre o diff; o teste do gerador cabe ao autor e ao QA.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas: leitura do diff e do código de conexão, e a conferência local da tradução de `sslmode` pela biblioteca de conexão. Faltaram no ambiente: `gitleaks` e o cliente `psql` no host (lacunas registradas; nada foi instalado). A sonda contra o banco local de desenvolvimento foi negada pela política de permissões.
