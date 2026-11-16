---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vm-recomendados
commit: 3c8267ae348c82a635614f601527f25d36b4daee
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: recomendados da produção da VM (K-388, E7.336, review E7.338)

## Escopo lido
`git diff d999ee29..3c8267ae` (Base-sha da develop com o #502): `deploy/sql/00_papeis_e_banco.sql` (+41/-1), `docker-compose.prod.yml` (+13), `docs/devops/105-implantacao-vm.md` (+25/-4), `scripts/gerar-sql-migracoes.mjs` (+6/-1). Código e teste: 7 linhas no gerador (o SQL é gerado), dentro do teto M14. O `docs/engineering/praticas.md` não traz regra "decidida por" que alcance estes arquivos.

## O que foi conferido
- **Restart:** `restart: unless-stopped` em `api`, `worker` e `web`; `migrate` e `coleta` seguem `"no"` (a coleta é do systemd). Confere com o texto da seção 7.
- **Teto de log:** âncora `x-log` (json-file, `max-size: 10m`, `max-file: 5`) aplicada nos cinco serviços. O texto separa o log dos contêineres da retenção de 30 dias do `journalctl`.
- **Rollback em ordem:** `down` do Compose, depois banco (restaurar backup ou `DSPD_PERMITIR_DOWN=1 pnpm run db:migrate down`, com o código novo, que conhece a migração), depois `git checkout <tag anterior>`, `build`, `up -d`, e conferência. A ordem está correta: o `down` precisa rodar antes do checkout. `DSPD_PERMITIR_DOWN` e a exigência do backup do dia existem em `server/src/plataforma/db/cli.ts:5,11`.
- **verify-full fora do Docker:** `db:migrate` passa por `scripts/db.sh`, que respeita o `PG_MIGRADOR_URL` do ambiente; `server/src/plataforma/db/migrar.ts:83` usa `connectionString`, então o `sslmode=verify-full` da URL vale e a CA entra por `NODE_EXTRA_CA_CERTS`. O backup usa os binários do host via `scripts/lib-pg.sh`, que herda `PGSSLMODE` e `PGSSLROOTCERT` do ambiente. Correto.
- **Pós-deploy:** inclui `curl` no painel (`127.0.0.1:8080`) além do `/health/ready`, antes de ligar os timers.
- **Conferência das senhas:** o gerador emite, para cada uma das cinco, `\if :{?var}` (ausente) e `SELECT (:'var' = '') ... \gset` (vazia), com `RAISE EXCEPTION` que nomeia a variável. O SQL regenerado é a saída do gerador. As sondas S2 e S3 confirmam o comportamento: rc=3, a mensagem nomeia a variável e nada é criado.
- **Defeito:** a conferência de "vazia" manda a senha ao servidor num `SELECT` literal **antes** do `SET log_statement = 'none'` (A1, sonda S1). O controle que já existia, e que a seção 6 do doc descreve ("o comando com senha não vai ao log do servidor"), deixa de valer para as cinco senhas.
- **Ferramentas e CI:** sem PR para a branch, a suíte fica para o CI do PR; não afirmo CI verde neste head. O brief não traz PQ do autor para citar. Não há teste do gerador; a conferência foi provada pelas sondas abaixo.
- **Segurança e pipeline:** o `security-engineer` e o `devops-engineer` revisam em paralelo. A1 é defeito provado por sonda, com gatilho; não refaço os pareceres deles.

As sondas rodaram no PostgreSQL 17 local de desenvolvimento (`metricasdspd-postgres-1`), com `psql -X -v ON_ERROR_STOP=1`. Na S1 rodou só o trecho do arquivo antes do `SET log_statement`; nas S2 e S3 o script parou antes do primeiro `CREATE`. No gerado, os `SELECT` com senha ficam em `deploy/sql/00_papeis_e_banco.sql:19,26,33,40,47`; os `\if :{?var}` não tocam o servidor e podem ficar onde estão.

## Sondas
- S1 · trecho de `00_papeis_e_banco.sql` até antes do `SET`, com `PGOPTIONS='-c log_statement=all'` e `PWD_MIGRADOR=SONDA_K388_MIG` · espera: senha fora do log do servidor · obtido: `LOG:  statement: SELECT ('SONDA_K388_MIG' = '') AS pwd_migrador_vazia` no `docker logs`
- S2 · arquivo inteiro sem `PWD_REF` · espera: rc=3, mensagem nomeando PWD_REF, nada criado · obtido: `ERROR:  falta a variável de ambiente PWD_REF; nada foi criado`, rc=3
- S3 · arquivo inteiro com `PWD_COLETOR=` (vazia) · espera: rc=3, mensagem nomeando PWD_COLETOR · obtido: `ERROR:  PWD_COLETOR está vazia; nada foi criado`, rc=3

## Achados
- A1 (bloqueante) scripts/gerar-sql-migracoes.mjs:54 · o `SELECT (:'pwd_x' = '')` de `${conferir}` manda cada senha ao servidor antes do `SET log_statement = 'none'` da linha 55; com `log_statement = all` elas vão ao log (S1). Emita o `SET` antes de `${conferir}` e regenere (`pnpm run db:sql`).
- A2 (recomendado) scripts/gerar-sql-migracoes.mjs:39 · a guarda nova (ausente e vazia, por variável) não tem teste do ramo de falha nem mutante declarado. Sugestão: um teste que gere o `00` e confira que o `SET log_statement` vem antes do primeiro `SELECT` com `:'pwd_`, o que também trava a regressão do A1.
- A3 (recomendado) docs/devops/105-implantacao-vm.md:245 · os passos do rollback usam `docker compose` sem `-f` e dependem do `export COMPOSE_FILE`/`COMPOSE_ENV_FILES` do bloco "Subir"; numa sessão nova, o operador cai no Compose de desenvolvimento. Sugestão: abrir o rollback com os dois `export`, ou usar `-f docker-compose.prod.yml`.

## Parecer
Reprovado no head `3c8267ae348c82a635614f601527f25d36b4daee` por A1. Restart, teto de log, rollback, verify-full com CA e pós-deploy estão corretos. A conferência das senhas funciona (S2 e S3), mas vaza as senhas para o log antes do `SET` que existe para evitar isso.
