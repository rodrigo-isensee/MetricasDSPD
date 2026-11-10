#!/bin/bash
# Teste do scripts/demo-dado-real.sh sem base real: docker, pnpm e bash (coleta.sh) falsos num diretorio descartavel.
# Casos: .env ausente, variavel ausente (so o nome aparece), argumento invalido, ordem das etapas e parada no primeiro erro.
set -uo pipefail
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/bin" "$TMP/repo/scripts"
cp "$RAIZ/scripts/demo-dado-real.sh" "$TMP/repo/scripts/"
echo "# falso" >"$TMP/repo/scripts/db.sh"
echo "# falso" >"$TMP/repo/scripts/coleta.sh"
for cmd in docker pnpm; do
  # shellcheck disable=SC2016
  printf '#!/bin/bash\necho "%s $*" >>"$LOG"\n[ -n "${FALHA_EM:-}" ] && [[ "$*" == *"$FALHA_EM"* ]] && exit 7\nexit 0\n' "$cmd" >"$TMP/bin/$cmd"
  chmod +x "$TMP/bin/$cmd"
done
export LOG="$TMP/log" PATH="$TMP/bin:$PATH"
SCRIPT="$TMP/repo/scripts/demo-dado-real.sh"

falhas=0
verifica() { if [ "$2" -eq 0 ]; then echo "ok - $1"; else echo "FALHOU - $1"; falhas=$((falhas + 1)); fi; }

NOMES="DSPD_PWD_MIGRADOR DSPD_PWD_COLETOR DSPD_PWD_API DSPD_PWD_REF DSPD_PWD_APONTAMENTO BUSINESSMAP_URL_BASE BUSINESSMAP_APIKEY BUSINESSMAP_QUADROS_IDS PESSOA_ELIMINADA_SAL ACELERATO_MYSQL_HOST ACELERATO_MYSQL_PORT ACELERATO_MYSQL_DATABASE ACELERATO_MYSQL_USER ACELERATO_MYSQL_PASSWORD ACELERATO_MYSQL_TLS_SHA256 ACELERATO_MYSQL_TLS_CERT_FILE"
env_completo() { : >"$TMP/env"; for n in $NOMES; do echo "$n=valor-secreto-falso" >>"$TMP/env"; done; }

# 1. sem .env
: >"$LOG"
saida="$(DEMO_ENV_ARQUIVO="$TMP/nao-existe" bash "$SCRIPT" 2>&1)"; rc=$?
verifica ".env ausente: rc 1" "$([ "$rc" -eq 1 ] && echo 0 || echo 1)"
verifica ".env ausente: mensagem com etapa e categoria" "$(grep -q "etapa 'env' (categoria: arquivo-ausente)" <<<"$saida" && echo 0 || echo 1)"
verifica ".env ausente: nada executado" "$([ ! -s "$LOG" ] && echo 0 || echo 1)"

# 2. variavel ausente: so o nome, nunca o valor
env_completo; grep -v '^BUSINESSMAP_APIKEY=' "$TMP/env" >"$TMP/env2"
saida="$(DEMO_ENV_ARQUIVO="$TMP/env2" bash "$SCRIPT" 2>&1)"; rc=$?
verifica "variavel ausente: rc 1 e nome citado" "$([ "$rc" -eq 1 ] && grep -q 'BUSINESSMAP_APIKEY' <<<"$saida" && echo 0 || echo 1)"
verifica "variavel ausente: nenhum valor impresso" "$(grep -q 'valor-secreto-falso' <<<"$saida" && echo 1 || echo 0)"

# 3. argumento invalido
saida="$(bash "$SCRIPT" --outra 2>&1)"; rc=$?
verifica "argumento invalido: rc 2" "$([ "$rc" -eq 2 ] && echo 0 || echo 1)"
saida="$(bash "$SCRIPT" -- --outra 2>&1)"; rc=$?
verifica "-- seguido de argumento desconhecido: rc 2" "$([ "$rc" -eq 2 ] && echo 0 || echo 1)"
env_completo; : >"$LOG"
saida="$(DEMO_ENV_ARQUIVO="$TMP/env" bash "$SCRIPT" -- --reconhecer-mudanca 2>&1)"; rc=$?
verifica "-- --reconhecer-mudanca (chamada do pnpm): aceito, rc 0" "$([ "$rc" -eq 0 ] && echo 0 || echo 1)"
verifica "-- --reconhecer-mudanca: a flag foi reconhecida na saida" "$(grep -q 'com --reconhecer-mudanca' <<<"$saida" && echo 0 || echo 1)"

# 4. caminho feliz: ordem das etapas
env_completo; : >"$LOG"
saida="$(DEMO_ENV_ARQUIVO="$TMP/env" bash "$SCRIPT" 2>&1)"; rc=$?
verifica "caminho feliz: rc 0" "$([ "$rc" -eq 0 ] && echo 0 || echo 1)"
ordem="$(grep -o 'up -d --wait postgres\|bm:coleta carga-inicial\|bm:apontamento carga-inicial\|bm:projetar\|up -d --build --wait api web\|psql' "$LOG" | tr '\n' '|')"
esperado='up -d --wait postgres|bm:coleta carga-inicial|bm:apontamento carga-inicial|bm:projetar|up -d --build --wait api web|psql|'
verifica "caminho feliz: ordem banco, BM, apontamento, projecao, api/web, prova" "$([ "$ordem" = "$esperado" ] && echo 0 || echo 1)"
verifica "caminho feliz: a prova nao traz nome, e-mail nem texto" "$(grep psql "$LOG" | grep -qi 'nome\|email\|titulo\|descricao' && echo 1 || echo 0)"
verifica "caminho feliz: senha so pelo nome da variavel no argv do docker" "$(grep -q -e '-e PGPASSWORD ' "$LOG" && ! grep -q 'valor-secreto-falso' "$LOG" && echo 0 || echo 1)"

# 5. para no primeiro erro
: >"$LOG"
saida="$(FALHA_EM='bm:coleta' DEMO_ENV_ARQUIVO="$TMP/env" bash "$SCRIPT" 2>&1)"; rc=$?
verifica "erro na carga do BM: rc 1 com etapa" "$([ "$rc" -eq 1 ] && grep -q "etapa 'carga-businessmap'" <<<"$saida" && echo 0 || echo 1)"
verifica "erro na carga do BM: nada depois roda" "$(grep -q 'bm:projetar\|psql\|api web' "$LOG" && echo 1 || echo 0)"

if [ "$falhas" -eq 0 ]; then echo "tudo ok"; else echo "$falhas falha(s)"; exit 1; fi
