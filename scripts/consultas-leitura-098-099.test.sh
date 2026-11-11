#!/bin/bash
# Teste do scripts/consultas-leitura-098-099.sh sem base real: docker e mysql falsos num diretorio descartavel.
# Casos: .env ausente, variavel ausente (so o nome), argumento invalido, cabecalho dos 31 .sql versionados, sessao so leitura,
# senha fora do argv, impressao do certificado, guarda de colunas (cabecalho e valor), .sql com escrita, falha do driver.
set -uo pipefail
unset INIT_CWD # o pnpm o define; o teste chama o script de dentro de tmp/chamada
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/bin" "$TMP/repo/scripts" "$TMP/chamada"
cp "$RAIZ/scripts/consultas-leitura-098-099.sh" "$TMP/repo/scripts/"
cp -r "$RAIZ/scripts/sql" "$TMP/repo/scripts/"
SQLS="$TMP/repo/scripts/sql/consultas-098-099"

# Banco falso: gera TSV a partir do "-- COLUNAS:" que chega por stdin (numero=1, data=2026-01-01, dominio=x).
# Modos por variavel: FALSO_CABECALHO (substitui o cabecalho), FALSO_VALOR (substitui o 1o valor), FALHA=1 (rc 7).
cat >"$TMP/bin/falso-banco" <<'EOF'
#!/bin/bash
cat >"$ENTRADA_ULTIMA"
echo "$*" >>"$LOG"
cp "$ENTRADA_ULTIMA" "$ENTRADA_ULTIMA.$(date +%N)"
[ -n "${FALHA:-}" ] && { echo "texto de erro do driver SEGREDO-DO-DRIVER" >&2; exit 7; }
cols="$(sed -n 's/^-- COLUNAS: //p' "$ENTRADA_ULTIMA" | head -1 | tr -d ' ')"
IFS=',' read -ra C <<<"$cols"
cab=""; lin=""
for c in "${C[@]}"; do
  n="${c%%:*}"; t="${c##*:}"
  case "$t" in numero) v=1 ;; data) v=2026-01-01 ;; *) v=x ;; esac
  cab="${cab:+$cab$'\t'}$n"; lin="${lin:+$lin$'\t'}$v"
done
[ -n "${FALSO_CABECALHO:-}" ] && cab="$FALSO_CABECALHO"
[ -n "${FALSO_VALOR:-}" ] && lin="$FALSO_VALOR${lin#?}"
printf '%s\n%s\n' "$cab" "$lin"
EOF
chmod +x "$TMP/bin/falso-banco"
cat >"$TMP/bin/docker" <<'EOF'
#!/bin/bash
[ "$1" = compose ] || exit 9
echo "docker $*" >>"$LOG"
echo "PGPASSWORD-no-ambiente=${PGPASSWORD:+sim}" >>"$LOG"
exec "$(dirname "$0")/falso-banco" "$@"
EOF
cat >"$TMP/bin/mysql" <<'EOF'
#!/bin/bash
echo "mysql $*" >>"$LOG"
cnf="${1#--defaults-extra-file=}"
echo "cnf-perm=$(stat -c %a "$cnf")" >>"$LOG"
grep -q '^password=' "$cnf" && echo "cnf-tem-senha" >>"$LOG"
exec "$(dirname "$0")/falso-banco" "$@"
EOF
chmod +x "$TMP/bin/docker" "$TMP/bin/mysql"
export LOG="$TMP/log" ENTRADA_ULTIMA="$TMP/entrada" PATH="$TMP/bin:$PATH"
SCRIPT="$TMP/repo/scripts/consultas-leitura-098-099.sh"

openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -nodes -keyout "$TMP/k.pem" -out "$TMP/cert.pem" -subj /CN=teste -days 1 >/dev/null 2>&1
IMP="$(openssl x509 -in "$TMP/cert.pem" -noout -fingerprint -sha256 | sed 's/^.*=//')"
SENHA_PG="senha-pg-secreta-falsa"; SENHA_MY="senha-my-secreta-falsa"
env_completo() {
  cat >"$TMP/env" <<EOT
DSPD_PWD_COLETOR=$SENHA_PG
ACELERATO_MYSQL_HOST=127.0.0.1
ACELERATO_MYSQL_PORT=3306
ACELERATO_MYSQL_DATABASE=acelerato
ACELERATO_MYSQL_USER=leitor
ACELERATO_MYSQL_PASSWORD=$SENHA_MY
ACELERATO_MYSQL_TLS_SHA256=$IMP
ACELERATO_MYSQL_TLS_CERT_FILE=$TMP/cert.pem
EOT
}

falhas=0
verifica() { if [ "$2" -eq 0 ]; then echo "ok - $1"; else echo "FALHOU - $1"; falhas=$((falhas + 1)); fi; }
roda() { (cd "$TMP/chamada" && rm -f consultas-098-099-*.txt && DEMO_ENV_ARQUIVO="$TMP/env" bash "$SCRIPT" "$@" 2>&1); }
saida_arq() { cat "$TMP"/chamada/consultas-098-099-*.txt 2>/dev/null; }

# 1. sem .env
: >"$LOG"
saida="$(cd "$TMP/chamada" && DEMO_ENV_ARQUIVO="$TMP/nao-existe" bash "$SCRIPT" 2>&1)"; rc=$?
verifica ".env ausente: rc 1 e categoria" "$([ "$rc" -eq 1 ] && grep -q 'arquivo-ausente' <<<"$saida" && echo 0 || echo 1)"
verifica ".env ausente: nada executado" "$([ ! -s "$LOG" ] && echo 0 || echo 1)"

# 2. variavel ausente: so o nome
env_completo; grep -v '^ACELERATO_MYSQL_PASSWORD=' "$TMP/env" >"$TMP/env2"
saida="$(cd "$TMP/chamada" && DEMO_ENV_ARQUIVO="$TMP/env2" bash "$SCRIPT" 2>&1)"; rc=$?
verifica "variavel ausente: rc 1 e nome citado" "$([ "$rc" -eq 1 ] && grep -q 'ACELERATO_MYSQL_PASSWORD' <<<"$saida" && echo 0 || echo 1)"
verifica "variavel ausente: nenhum valor impresso" "$(grep -q "$SENHA_PG\|$IMP" <<<"$saida" && echo 1 || echo 0)"
saida="$(cd "$TMP/chamada" && DEMO_ENV_ARQUIVO="$TMP/env2" bash "$SCRIPT" --so-pg 2>&1)"; rc=$?
verifica "--so-pg nao exige as variaveis do MySQL" "$([ "$rc" -eq 0 ] && echo 0 || echo 1)"

# 3. argumento invalido
saida="$(bash "$SCRIPT" --outra 2>&1)"; rc=$?
verifica "argumento invalido: rc 2" "$([ "$rc" -eq 2 ] && echo 0 || echo 1)"

# 4. caminho feliz com os 31 .sql versionados
env_completo; : >"$LOG"
saida="$(roda)"; rc=$?
verifica "caminho feliz: rc 0" "$([ "$rc" -eq 0 ] && echo 0 || echo 1)"
verifica "caminho feliz: 31 consultas, todas ok" "$(grep -q 'Consultas: 31; ok: 31; recusadas: 0; falhas: 0' <<<"$saida" && echo 0 || echo 1)"
verifica "arquivo gravado na pasta de onde foi chamado, com a data" "$(ls "$TMP"/chamada/consultas-098-099-????-??-??.txt >/dev/null 2>&1 && echo 0 || echo 1)"
verifica "cabecalho com o id de cada consulta" "$(for i in B2-a B6-c C-AC1 C-BM5 Q-RO-1 Q-RO-6b Q-RO-10a Q-RO-11; do saida_arq | grep -q "^## $i " || exit 1; done; echo $?)"
linha_de() { saida_arq | grep -n "^## $1 " | cut -d: -f1; }
verifica "ordem das analises: B antes de C antes de Q" "$([ "$(linha_de B2-a)" -lt "$(linha_de C-AC1)" ] && [ "$(linha_de C-AC1)" -lt "$(linha_de Q-RO-1)" ] && echo 0 || echo 1)"
verifica "PostgreSQL: papel dspd_coletor, sessao so leitura" "$(grep -q 'docker compose exec -T -e PGPASSWORD -e PGOPTIONS=-c default_transaction_read_only=on' "$LOG" && grep -q -- '-U dspd_coletor' "$LOG" && echo 0 || echo 1)"
verifica "senha so por ambiente (PGPASSWORD presente, valor fora do argv)" "$(grep -q 'PGPASSWORD-no-ambiente=sim' "$LOG" && ! grep -q "$SENHA_PG" "$LOG" && echo 0 || echo 1)"
verifica "MySQL: senha so no arquivo 0600, nunca no argv" "$(grep -q 'cnf-perm=600' "$LOG" && grep -q 'cnf-tem-senha' "$LOG" && ! grep -q "$SENHA_MY" "$LOG" && echo 0 || echo 1)"
verifica "nenhuma senha na tela nem no arquivo de saida" "$(grep -q "$SENHA_PG\|$SENHA_MY" <<<"$saida$(saida_arq)" && echo 1 || echo 0)"
# stdin do PostgreSQL e do MySQL tem a transacao so leitura e o desfazer
: >"$LOG"; roda --so-pg >/dev/null
verifica "stdin PostgreSQL: BEGIN READ ONLY ... ROLLBACK" "$(grep -q '^BEGIN READ ONLY;' "$TMP/entrada" && tail -1 "$TMP/entrada" | grep -q '^ROLLBACK;' && echo 0 || echo 1)"
: >"$LOG"; roda --so-mysql >/dev/null
verifica "stdin MySQL: READ ONLY, teto e ROLLBACK" "$(grep -q '^SET SESSION TRANSACTION READ ONLY;' "$TMP/entrada" && grep -q '^START TRANSACTION READ ONLY;' "$TMP/entrada" && grep -q 'max_execution_time' "$TMP/entrada" && tail -1 "$TMP/entrada" | grep -q '^ROLLBACK;' && echo 0 || echo 1)"
verifica "--so-mysql nao chama docker" "$(grep -q '^docker ' "$LOG" && echo 1 || echo 0)"

# 5. guarda de colunas
: >"$LOG"
saida="$(FALSO_CABECALHO=$'titulo\tn' roda --so-pg)"; rc=$?
verifica "cabecalho diferente do declarado: recusa e rc 1" "$([ "$rc" -eq 1 ] && grep -q 'recusada' <<<"$saida" && echo 0 || echo 1)"
saida="$(FALSO_VALOR='Maria Silva' roda --so-mysql)"; rc=$?
verifica "valor de coluna numero com texto: recusa" "$([ "$rc" -eq 1 ] && grep -q 'recusada' <<<"$saida" && echo 0 || echo 1)"
verifica "o valor recusado nunca chega a tela" "$(grep -q 'Maria Silva' <<<"$saida" && echo 1 || echo 0)"
verifica "o valor recusado nunca chega ao arquivo (consulta C-AC1 recusada)" "$(saida_arq | sed -n '/^## C-AC1 /,/^## C-AC2a /p' | grep -q 'Maria Silva' && echo 1 || echo 0)"
saida="$(FALSO_VALOR='joao@empresa.com' roda --so-pg)"
verifica "dominio com @ (e-mail): recusa" "$(grep -q 'recusada' <<<"$saida" && ! grep -q 'joao@' <<<"$saida$(saida_arq)" && echo 0 || echo 1)"
# coluna de pessoa declarada num .sql (alguem editou o arquivo): recusa mesmo com cabecalho igual
mkdir -p "$TMP/sql-ruim"
printf -- '-- ID: X1\n-- FONTE: pg\n-- ORIGEM: teste\n-- COLUNAS: solicitante:dominio,n:numero\nSELECT 1;\n' >"$TMP/sql-ruim/01.sql"
saida="$(cd "$TMP/chamada" && CONSULTAS_SQL_DIR="$TMP/sql-ruim" DEMO_ENV_ARQUIVO="$TMP/env" bash "$SCRIPT" --so-pg 2>&1)"
verifica "coluna de pessoa declarada no .sql: recusa" "$(grep -q 'recusada  X1' <<<"$saida" && echo 0 || echo 1)"

# 6. .sql com escrita: recusado sem executar
printf -- '-- ID: X2\n-- FONTE: pg\n-- ORIGEM: teste\n-- COLUNAS: n:numero\nDELETE FROM dspd_bm.dim_card;\n' >"$TMP/sql-ruim/01.sql"
: >"$LOG"
saida="$(cd "$TMP/chamada" && CONSULTAS_SQL_DIR="$TMP/sql-ruim" DEMO_ENV_ARQUIVO="$TMP/env" bash "$SCRIPT" --so-pg 2>&1)"; rc=$?
verifica ".sql com DELETE: recusado, rc 1 e banco nao chamado" "$([ "$rc" -eq 1 ] && grep -q 'recusada  X2' <<<"$saida" && [ ! -s "$LOG" ] && echo 0 || echo 1)"
# nenhum .sql versionado tem palavra de escrita (a mesma regra do script, sobre a pasta real)
verifica "os 31 .sql versionados passam na recusa de escrita" "$(sed 's/--.*$//' "$SQLS"/*.sql | grep -Eiq '\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|call|merge|replace|into[[:space:]]+(outfile|dumpfile))\b' && echo 1 || echo 0)"

# 7. impressao do certificado diferente: recusa antes de conectar
sed "s/^ACELERATO_MYSQL_TLS_SHA256=.*/ACELERATO_MYSQL_TLS_SHA256=$(printf 'AA:%.0s' {1..31})AA/" "$TMP/env" >"$TMP/env3"
: >"$LOG"
saida="$(cd "$TMP/chamada" && DEMO_ENV_ARQUIVO="$TMP/env3" bash "$SCRIPT" 2>&1)"; rc=$?
verifica "impressao diferente: rc 1, categoria e MySQL nao chamado" "$([ "$rc" -eq 1 ] && grep -q 'tls-impressao-diferente' <<<"$saida" && ! grep -q '^mysql ' "$LOG" && echo 0 || echo 1)"

# 8. falha do driver: so o codigo, nunca o texto
saida="$(FALHA=1 roda --so-pg)"; rc=$?
verifica "falha do driver: rc 1 e codigo 7" "$([ "$rc" -eq 1 ] && grep -q 'codigo 7' <<<"$saida" && echo 0 || echo 1)"
verifica "texto de erro do driver nunca impresso" "$(grep -q 'SEGREDO-DO-DRIVER' <<<"$saida$(saida_arq)" && echo 1 || echo 0)"

echo ""
[ "$falhas" -eq 0 ] && echo "todos os casos passaram" || echo "$falhas caso(s) falharam"
exit "$falhas"
