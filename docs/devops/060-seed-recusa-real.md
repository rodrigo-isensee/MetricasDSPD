---
tipo: revisao-devops
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-seed-recusa-real
commit: 63a9d91e8af463757dd373580330f7dc5a7660a8
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-02
---
# Review de devops: P1 do plano 060-sem-mock (E2.10, K-195)

## Parecer
Aprovado, sem achado bloqueante. Escopo: `git diff d05bbfc...63a9d91 -- .github tools scripts package.json` (6 arquivos, 7 linhas a mais, 7 a menos), lido por diff, sem rodar workflow nem suíte.

- `.github/workflows/restauracao.yml:54` · o passo "Migrar e semear (mock)" passa `PG_SEED_URL="$PG_MIGRADOR_URL"` só no comando do seed; `PG_MIGRADOR_URL` já é definida no `env` do job e aponta para o Postgres descartável do runner, nunca para a base real. O `migrate up` anterior segue com `PG_MIGRADOR_URL`. Permissões, SHAs das ações, `timeout-minutes` e gatilhos não mudaram. Aprovado.
- `tools/homolog/src/comandos.ts:40` · o `homolog:subir` troca `PG_MIGRADOR_URL` por `PG_SEED_URL` na chamada do seed, com a URL montada da porta do `.env.homolog` (`127.0.0.1`, banco `metricas` de homologação). O `exec` mescla `process.env` com o `env` explícito (`main.ts:17`), então a variável chega ao CLI. O teste `comandos.test.ts:28` acompanha a troca. Aprovado.
- `scripts/com-api-mock.sh:13` · exporta `PG_SEED_URL="$PG_TESTE_URL"` antes da checagem de que o nome termina em `_test`, que aborta se não terminar. O script não chama o seed (busca em `scripts/` e `.github/`), então a variável é inócua hoje, como o node-backend registrou. Recomendado, não devolve: nenhuma ação.
- `package.json` e `scripts/db.sh` · saem `db:seed` e o ramo `seed`, e a mensagem de uso foi atualizada. Busca por `db:seed`, `db.sh seed` e `run seed` em `.github`, `scripts`, `tools`, `e2e` e `package.json` não acha chamador restante; o único consumidor do seed fora do CLI é o `restauracao.yml`, já ajustado. Referências em `docs/` a `db:seed` são históricas (pedidos e QA antigos) ou já atualizadas em `README.md` e `docs/architecture/server.md`. Nenhum workflow nem script quebra.
- Comportamento novo, sem ação: o seed falha com `PG_SEED_URL ausente` se um chamador futuro esquecer a variável, e o `homolog:subir` repetido segue seguro porque a recusa só vale para esquema com coleta real.

Ferramentas: `shellcheck` em `scripts/db.sh` e `scripts/com-api-mock.sh` com dois avisos antigos (SC1091 info e SC2164 warning), nenhum nas linhas alteradas; `actionlint` fora do PATH (lacuna registrada, nada instalado); `docker build` não aplicável (sem Dockerfile no diff).

## Custo e rollback
Sem minuto de CI novo, sem serviço ou recurso novo (`R-CUSTO`); nenhum workflow escreve na `main` (`R-MAIN`) e nada foi desligado ou pulado (`R-VERIFY`). Rollback: reverter o commit `63a9d91` (restaura `db:seed`, o ramo `seed` e o env antigo); nenhuma migração nem estado de ambiente envolvido.
