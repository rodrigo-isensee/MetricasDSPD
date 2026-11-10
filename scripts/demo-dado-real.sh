#!/bin/bash
# Uso: scripts/demo-dado-real.sh [--reconhecer-mudanca]
# Demo com dado real (pedido 087, E4.1): roda no checkout do dono, com o .env dele. Nesta ordem, e para no primeiro erro:
#   env -> banco -> migracoes -> ref-sync -> carga inicial BusinessMap -> carga inicial Acelerato -> carga inicial apontamento
#   -> projecao -> API e web -> consulta de prova do 075 (so contagens).
# So GET nas fontes (os comandos reusados ja sao so leitura). Nunca imprime valor do .env nem texto de erro de driver.
# Teste: DEMO_ENV_ARQUIVO aponta outro arquivo no lugar de ./.env (so para o caminho de erro).
set -euo pipefail
cd "$(dirname "$0")/.."

ARQUIVO_ENV="${DEMO_ENV_ARQUIVO:-.env}"
RECONHECER=""
for arg in "$@"; do
  case "$arg" in
    --reconhecer-mudanca) RECONHECER="--reconhecer-mudanca" ;;
    *) echo "uso: demo-dado-real.sh [--reconhecer-mudanca]" >&2; exit 2 ;;
  esac
done

falhar() { # etapa, categoria, dica
  echo "" >&2
  echo "FALHOU na etapa '$1' (categoria: $2). $3" >&2
  exit 1
}

etapa() { echo ""; echo "== $1 =="; }

# Roda um comando; a saida (JSON de contagens e codigos, ou erro ja sanitizado pelo comando) segue para a tela.
executar() { # etapa, categoria, dica, comando...
  local nome="$1" categoria="$2" dica="$3"
  shift 3
  "$@" || falhar "$nome" "$categoria" "$dica (codigo de saida $?)"
}

# --- 1. .env (so os nomes) ---
etapa "1/10 .env"
[ -f "$ARQUIVO_ENV" ] || falhar "env" "arquivo-ausente" "O arquivo $ARQUIVO_ENV nao existe na raiz do projeto; copie .env.example e preencha."
NECESSARIAS=(
  DSPD_PWD_MIGRADOR DSPD_PWD_COLETOR DSPD_PWD_API DSPD_PWD_REF DSPD_PWD_APONTAMENTO
  BUSINESSMAP_URL_BASE BUSINESSMAP_APIKEY BUSINESSMAP_QUADROS_IDS PESSOA_ELIMINADA_SAL
  ACELERATO_MYSQL_HOST ACELERATO_MYSQL_PORT ACELERATO_MYSQL_DATABASE ACELERATO_MYSQL_USER
  ACELERATO_MYSQL_PASSWORD ACELERATO_MYSQL_TLS_SHA256 ACELERATO_MYSQL_TLS_CERT_FILE
)
FALTAM=()
for nome in "${NECESSARIAS[@]}"; do
  grep -Eq "^(export[[:space:]]+)?${nome}=.+" "$ARQUIVO_ENV" || FALTAM+=("$nome")
done
if [ "${#FALTAM[@]}" -gt 0 ]; then
  falhar "env" "variavel-ausente" "Faltam (so os nomes): ${FALTAM[*]}"
fi
echo "ok: ${#NECESSARIAS[@]} variaveis presentes (so os nomes foram conferidos)"
case "$ARQUIVO_ENV" in /*) ;; *) ARQUIVO_ENV="./$ARQUIVO_ENV" ;; esac
# shellcheck disable=SC1090
set -a && . "$ARQUIVO_ENV" && set +a
export PG_MIGRADOR_URL="${PG_MIGRADOR_URL:-postgres://dspd_migrador:${DSPD_PWD_MIGRADOR}@127.0.0.1:${PG_PORT:-5432}/metricas}"
export PG_COLETOR_URL="${PG_COLETOR_URL:-postgres://dspd_coletor:${DSPD_PWD_COLETOR}@127.0.0.1:${PG_PORT:-5432}/metricas}"
export PG_REF_URL="${PG_REF_URL:-postgres://dspd_ref:${DSPD_PWD_REF}@127.0.0.1:${PG_PORT:-5432}/metricas}"

# --- 2. banco ---
etapa "2/10 banco (postgres do Compose)"
executar "banco" "docker" "Confira se o Docker esta rodando e se a porta ${PG_PORT:-5432} esta livre." \
  docker compose up -d --wait postgres

# --- 3. migracoes ---
etapa "3/10 migracoes (ate a ultima, antes da API)"
executar "migracoes" "migracao" "Rode 'pnpm run db:migrate' sozinho para ver o erro." \
  bash scripts/db.sh migrate

# --- 4. dicionarios de referencia (versionados no repositorio; nao chamam as fontes) ---
etapa "4/10 dicionarios de referencia"
executar "ref-sync" "referencia" "Dicionario do BusinessMap (bm:ref-sync)." \
  pnpm --filter @metricas-dspd/server run bm:ref-sync
executar "ref-sync" "referencia" "Dicionario do apontamento (bm:ref-sync-apontamento)." \
  pnpm --filter @metricas-dspd/server run bm:ref-sync-apontamento
executar "ref-sync" "referencia" "Listas do Acelerato (ac:ref-sync)." \
  pnpm --filter @metricas-dspd/server run ac:ref-sync

# --- 5. BusinessMap: carga inicial (so GET) ---
etapa "5/10 carga inicial do BusinessMap"
executar "carga-businessmap" "coleta" "Veja a categoria no erro acima; a carga e repetivel (marca d'agua e staging idempotente)." \
  pnpm --filter @metricas-dspd/server run bm:coleta carga-inicial

# --- 6. Acelerato: carga inicial (so leitura) ---
etapa "6/10 carga inicial do Acelerato"
if [ -n "$RECONHECER" ]; then
  echo "com --reconhecer-mudanca (primeira coleta depois do L9-c)"
fi
executar "carga-acelerato" "coleta" "Se a categoria for 'parametros-mudaram', e a primeira coleta depois do L9-c: rode de novo com --reconhecer-mudanca." \
  bash scripts/coleta.sh ac ${RECONHECER:+"$RECONHECER"}

# --- 7. apontamento: carga inicial (so GET /loggedTime) ---
etapa "7/10 carga inicial do apontamento"
executar "carga-apontamento" "coleta" "Pre-requisitos: dicionario (etapa 4) e cards (etapa 5)." \
  pnpm --filter @metricas-dspd/server run bm:apontamento carga-inicial

# --- 8. projecao ---
etapa "8/10 projecao do BusinessMap"
executar "projecao" "projecao" "A projecao e repetivel; rode 'pnpm --filter @metricas-dspd/server run bm:projetar'." \
  pnpm --filter @metricas-dspd/server run bm:projetar

# --- 9. API e web (como o homolog:subir: build e espera de saude; sem seed) ---
etapa "9/10 API e web"
executar "api-web" "docker" "Confira 'docker compose logs api web'." \
  docker compose up -d --build --wait api web
echo "ok: API em http://127.0.0.1:${API_PORT:-3000} e web em http://127.0.0.1:${WEB_PORT:-8080}"

# --- 10. consulta de prova do 075 (so contagens) ---
etapa "10/10 prova do 075 (so contagens)"
PREFIXO="${DSPD_SCHEMA_PREFIXO:-}"
SQL="SELECT (SELECT count(*) FROM ${PREFIXO}dspd_bm.fato_bloqueio) AS fato_bloqueio,
            (SELECT count(*) FROM ${PREFIXO}dspd_bm.evt_bloqueio WHERE tipo = 'fim') AS evt_bloqueio_fim,
            (SELECT min(coletado_em) FROM ${PREFIXO}dspd_bm.stg_card) AS primeira_coleta_stg_card;"
# A senha vai so pelo ambiente do comando; o argv do docker leva o nome da variavel, nunca o valor.
PGPASSWORD="${DSPD_PWD_COLETOR}" executar "prova" "consulta" "Consulta so de contagens pelo papel dspd_coletor." \
  docker compose exec -T -e PGPASSWORD postgres psql -X -v ON_ERROR_STOP=1 -U dspd_coletor -d metricas -c "$SQL"

echo ""
echo "Pronto. Devolva ao Jarvis a saida da etapa 10 (tres valores) e o resumo das etapas 5 a 8."
