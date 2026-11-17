#!/bin/bash
# Roda os testes de banco do servidor num Postgres DESCARTÁVEL: cada execução sobe o próprio servidor (projeto Compose e
# volume próprios, porta livre, init de docker/postgres/init criando os papéis com as senhas deste script) e o derruba no
# fim (trap: `down -v`). Nada é compartilhado entre execuções nem entre worktrees, então não há senha de papel
# divergente nem schema sobrando de outra execução (K-392).
# Com PG_TESTE_URL definida NO AMBIENTE (a CI, que já tem o próprio banco), usa essa URL e não sobe nada. A decisão é
# tomada antes de ler o .env: uma PG_TESTE_URL que venha só do .env é ignorada (quem copiou o .env.example não pula o
# descartável).
# Se a execução morrer por kill -9 (o trap não roda), limpe com: docker compose -p metricasdspd-teste-<id> down -v
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
PG_TESTE_URL_AMBIENTE="${PG_TESTE_URL:-}"
[ -f .env ] && set -a && . ./.env && set +a
if [ -n "$PG_TESTE_URL_AMBIENTE" ]; then PG_TESTE_URL="$PG_TESTE_URL_AMBIENTE"; else unset PG_TESTE_URL; fi

# As senhas dos papéis de teste vêm daqui, de um único lugar: criam os papéis (init do contêiner) e entram nos testes (ctx.ts).
# Valores de desenvolvimento, sem relação com credencial real; um .env do dono, se existir, vale igual para os dois lados.
: "${DSPD_PWD_MIGRADOR:=migrador_dev}" "${DSPD_PWD_COLETOR:=coletor_dev}" "${DSPD_PWD_API:=api_dev}" "${DSPD_PWD_REF:=ref_dev}"
: "${DSPD_PWD_WEBHOOK:=webhook_dev}" "${DSPD_PWD_AUTOMACAO:=automacao_dev}" "${DSPD_PWD_PESQUISA:=pesquisa_dev}" "${DSPD_PWD_APONTAMENTO:=apontamento_dev}"
export DSPD_PWD_MIGRADOR DSPD_PWD_COLETOR DSPD_PWD_API DSPD_PWD_REF DSPD_PWD_WEBHOOK DSPD_PWD_AUTOMACAO DSPD_PWD_PESQUISA DSPD_PWD_APONTAMENTO

if [ -z "${PG_TESTE_URL:-}" ]; then
  command -v docker >/dev/null || { echo "Docker não encontrado (veja docs/architecture/server.md)"; exit 1; }
  ID="$(od -An -N4 -tx1 /dev/urandom | tr -d ' \n')"
  export COMPOSE_PROJECT_NAME="metricasdspd-teste-$ID"
  PG_PORT="$(node -e 'const s=require("net").createServer().listen(0,"127.0.0.1",()=>{console.log(s.address().port);s.close()})')" \
    || { echo "não consegui achar uma porta livre"; exit 1; }
  export PG_PORT
  # Senha do administrador só desta instância descartável.
  POSTGRES_PASSWORD="$(od -An -N12 -tx1 /dev/urandom | tr -d ' \n')"; export POSTGRES_PASSWORD
  limpar() { docker compose down -v --remove-orphans >/dev/null 2>&1; }
  trap limpar EXIT
  trap 'exit 130' INT TERM
  trap 'exit 129' HUP
  docker compose up -d --wait postgres || exit 1
  export PG_TESTE_URL="postgres://dspd_migrador:${DSPD_PWD_MIGRADOR}@127.0.0.1:${PG_PORT}/metricas_test"
fi

pnpm --filter @metricas-dspd/server run test:pg
