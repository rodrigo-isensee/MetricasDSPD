---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vm-recomendados
commit: 0fb2e35aaefb3eada16ab83a96768b74376f70b6
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105-melhorias-15-11 (K-388, recomendados da VM)

Revalidação por delta: `forge-check parecer delta` de `3c8267ae..0fb2e35a`. No domínio: `scripts/gerar-sql-migracoes.mjs` e `deploy/sql/00_papeis_e_banco.sql` (regenerado). Fora do domínio, lido pelo foco pedido: `docs/devops/105-implantacao-vm.md` (rollback e `-f docker-compose.prod.yml`) e o teste novo `server/tests/papeis-sql-senhas-log.test.ts`. A rodada anterior (head `3c8267ae`, reprovado pelo A1) cobriu o compose de produção, o `verify-full` fora do Docker e o restante do diff; nada disso mudou neste delta.

## Gatilhos
`R-SEGURANCA`: credenciais (senhas dos cinco papéis com LOGIN do banco da empresa), conexão com o banco (TLS fora do Docker), infraestrutura (compose de produção).

## Achados
- A4 (recomendado) scripts/db.sh:6 · O verify-full fora do Docker segue só no documento (105-implantacao-vm.md:91,109): nada recusa PG_MIGRADOR_URL de host não local sem sslmode=verify-full. Uma checagem no db.sh e no lib-pg.sh fecharia o erro de operador.
- A5 (recomendado) docs/devops/105-implantacao-vm.md:191 · O texto ainda diz que o script abre só com SET log_statement; agora são três SET de log e o \set ON_ERROR_STOP. Atualizar a frase, inclusive o caminho sem permissão para os SET (o script para; usar \password).
- A6 (recomendado) deploy/sql/00_papeis_e_banco.sql:59 · Com pg_stat_statements e track_utility ligados, o texto do CREATE ROLE com a senha fica na view (visível a superusuário e pg_read_all_stats). Pré-existente; avisar o DBA no item 4 ou usar \password.

## Sondas

## Detalhe dos achados
**A1 (fechado).** Em `0fb2e35a`, o gerado abre com `\set ON_ERROR_STOP on` (linha 10) e `SET log_statement = 'none'`, `SET log_min_duration_statement = -1`, `SET log_min_error_statement = panic` (linhas 11 a 13), antes dos `\getenv` e do primeiro `SELECT (btrim(:'pwd_migrador') = '')`. Nenhum comando com senha vai ao servidor antes dos SET; a origem é `scripts/gerar-sql-migracoes.mjs:53-58` (os SET antes de `${ler}` e `${conferir}`). Conferi a deriva: rodei a fase `arquivos` do gerador nesta worktree e o `00_papeis_e_banco.sql` saiu idêntico ao commitado (os demais arquivos de `deploy/sql/` foram restaurados com `git checkout`; nada da worktree mudou). Se o administrador não tiver permissão para os SET (todos exigem superusuário ou `GRANT SET ON PARAMETER`), o `ON_ERROR_STOP` para o script no primeiro SET, antes de qualquer senha sair do cliente: falha fechada.

**A2 e A3 (incorporados).** `log_min_duration_statement = -1` e `log_min_error_statement = panic` cobrem o registro por duração e o registro do comando que falha (por exemplo, `CREATE ROLE` de papel já existente); `\set ON_ERROR_STOP on` tira a dependência do `-v ON_ERROR_STOP=1` da linha de comando. O `btrim` recusa senha só de espaços, e as mensagens do `RAISE` continuam nomeando só a variável.

**Teste novo.** `server/tests/papeis-sql-senhas-log.test.ts` prova a ordem (cada SET e o `ON_ERROR_STOP` antes do primeiro `:'pwd_`), que nenhum `SELECT`/`DO`/`CREATE`/`ALTER`/`INSERT`/`GRANT` precede os SET e o `btrim`. Rodei: 7 de 7 passam. O teste lê o arquivo gerado; a ligação com o gerador fica pela conferência de deriva acima e pelo `db:sql` do CI.

**Roteiro da VM (fora do domínio, lido pelo foco).** Todos os comandos `docker compose` da seção usam `-f docker-compose.prod.yml` (some o risco de subir o compose de desenvolvimento, com portas e senhas de dev, por esquecer o `COMPOSE_FILE`). O rollback ganhou o passo 0, que para os quatro timers de coleta antes da restauração, e o passo 4 os religa; o `verify-full` e a CA continuam exigidos no `db:migrate down`. Sem achado de segurança.

**A4 (recomendado, mantido).** Inalterado desde a rodada anterior: proposta de recusar host diferente de `127.0.0.1`/`localhost` sem `sslmode=verify-full` na URL (`scripts/db.sh`) ou sem `PGSSLMODE=verify-full` (`scripts/lib-pg.sh`). Severidade baixa (erro de operador, não ataque direto). Esforço P. Dono: `devops-engineer`.

**A5 (recomendado).** Documento desatualizado em relação ao script; sem caminho de ataque, só clareza para o DBA. Esforço P. Dono: `devops-engineer`.

**A6 (recomendado).** Comandos utilitários como `CREATE ROLE ... PASSWORD` entram no `pg_stat_statements` com o texto literal quando `pg_stat_statements.track_utility` está ligado (o padrão quando a extensão é carregada). Quem tem `pg_read_all_stats` na empresa (equipe de monitoramento, ferramenta de APM) leria as senhas. Os SET de log não cobrem isso. Severidade baixa (exige a extensão e um papel de monitoramento privilegiado; pré-existente, não introduzido por este delta). Correção mínima: no item 4 e na seção 6, avisar o DBA para rodar `SET pg_stat_statements.track_utility = off;` junto (se a extensão existir) ou criar os papéis sem senha e definir com `\password` (o psql envia só o hash SCRAM). Esforço P. Dono: `devops-engineer`.

Suíte: sem PR para esta branch, a suíte inteira fica para o CI do PR; este parecer não afirma CI verde. Rodei só o teste novo de abuso (7/7) e a conferência de deriva do gerador.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas: `forge-check parecer delta`, leitura do diff, vitest no teste novo e o gerador local para a deriva. Faltaram no ambiente: `gitleaks` e o cliente `psql` no host (lacunas registradas; nada foi instalado), por isso não houve sonda contra um servidor com `log_statement = 'all'`.
