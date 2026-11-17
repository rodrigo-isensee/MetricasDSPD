---
tipo: revisao-devops
contrato: 1
pedido: 105-melhorias-15-11
branch: feat/105-t8-sprint-real
commit: 453348a218247c5f9ca0e451a99cc210366c3db5
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-17
---
# Review de devops: 105 T8 sprint real (E7.530)

## Achados
- A1 (recomendado) deploy/sql/consolidado.sql:1573 · 0042 entra sem a 0041 (T3, ainda fora da develop): na VM as duas devem ir na mesma release; aplicar a 0042 antes da 0041 quebra a ordem do runner. Regerar `pnpm run db:sql` depois que o T3 entrar.

## Detalhes
Aprovado. Escopo: migração 0042, deploy/sql, GRANTs, caminho vm:preparar e do DBA. Nada em `.github/`, Dockerfile, compose ou IaC mudou.
- Migração `server/migrations/0042_bm_sprint.ts`: duas tabelas só com ids, instantes e booleano (sem pessoa, título ou texto); `down` existe (drop das duas). `fato_sprint_filho` é append-only (gatilhos de update/delete e truncate) com UNIQUE (sprint_id, filho_id). Checksum registrado em `checksums.json`.
- GRANTs (`grants.ts` e `9000_grants.sql`): coletor SELECT/INSERT/UPDATE/DELETE em `dim_sprint` e SELECT/INSERT em `fato_sprint_filho`; api só SELECT nas duas. Confere com o decidido.
- deploy/sql: `pnpm run db:sql -- --check` regerou tudo sem diferença na árvore (git status limpo) e disse "runner e SQL gerado produzem o mesmo esquema" e "41 migracoes registradas nos dois caminhos". O `0042_bm_sprint.sql` registra em `pgmigrations` dentro de BEGIN/COMMIT; o caminho do DBA (consolidado + grants) fica coerente com o runner.
- vm:preparar: a entrada não mudou; a 0042 é aditiva (CREATE TABLE, não toca dado existente), então a trava de backup e a idempotência seguem valendo; sem primeira carga nem reprojeção nova.
- `tests/migracoes.estatico.test.ts` (sequência) falha até o T3 entrar: esperado, não é defeito do T8. A suíte inteira fica no CI do PR; este parecer não afirma CI verde.
- Ferramentas: `db:sql` rodou com Postgres descartável; actionlint, shellcheck e docker build não se aplicam (sem mudança neles).

## Custo e rollback
Sem minuto de CI novo nem recurso pago (`R-CUSTO`). Rollback: `down` da 0042 (drop de `fato_sprint_filho` e `dim_sprint`), com backup do dia confirmado pelo vm:preparar; as tabelas são novas e a versão anterior do código as ignora.
