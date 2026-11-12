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

# Banco falso: gera TSV a partir do "-- COLUNAS:" que chega por stdin (numero=1, data=2026-01-01, dominio=x).
# Modos por variavel: FALSO_CABECALHO (substitui o cabecalho), FALSO_VALOR (substitui o 1o valor), FALHA=1 (rc 7).
cat >"$TMP/bin/falso-banco" <<'EOF'
#!/bin/bash
cat >"$ENTRADA_ULTIMA"
echo "$*" >>"$LOG"
cp "$ENTRADA_ULTIMA" "$ENTRADA_ULTIMA.$(date +%N)"
[ -n "${SAIDA_VAZIA:-}" ] && exit 0
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
cnf="${1#--defaults-file=}"
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
# sondas S1 a S7 do parecer de seguranca: cada uma deve ser recusada sem chamar o banco (lista do que e permitido)
sonda() { # nome, texto do .sql
  printf -- '-- ID: S\n-- FONTE: pg\n-- ORIGEM: teste\n-- COLUNAS: n:numero\n%s\n' "$2" >"$TMP/sql-ruim/01.sql"
  : >"$LOG"
  saida="$(cd "$TMP/chamada" && CONSULTAS_SQL_DIR="$TMP/sql-ruim" DEMO_ENV_ARQUIVO="$TMP/env" bash "$SCRIPT" --so-pg 2>&1)"; rc=$?
  verifica "$1: recusada, rc 1 e banco nao chamado" "$([ "$rc" -eq 1 ] && grep -q 'recusada  S' <<<"$saida" && [ ! -s "$LOG" ] && echo 0 || echo 1)"
}
sonda "S1 literal com dois tracos e DELETE" "SELECT '--'; DELETE FROM t;"
sonda "S2 1--1 e DELETE" "SELECT 1--1; DELETE FROM t;"
sonda "S3 SET TRANSACTION READ WRITE" "SET TRANSACTION READ WRITE;"
sonda "S4 gexec do psql" "SELECT 'INS'||'ERT INTO t VALUES (1)' \\gexec"
sonda "S5 system do cliente mysql" "system id"
sonda "S6 barra-bang do cliente" '\! id'
sonda "S7 DO com EXECUTE" "DO \$\$BEGIN EXECUTE 'DEL'||'ETE FROM t'; END\$\$;"
sonda "SELECT seguido de SET" "SELECT 1; SET default_transaction_read_only = off"
sonda "SELECT INTO OUTFILE" "SELECT 1 INTO OUTFILE 'x'"
# A2: so a barra invertida pega (sem INTO e sem palavra da lista)
sonda "A2 gexec sem INTO (guarda da barra invertida)" "SELECT 'DEL'||'ETE FROM t' \\gexec"
# A3: so o limite de um unico ponto e virgula pega
sonda "A3 SELECT 1; SELECT 2; (limite de um ponto e virgula)" "SELECT 1; SELECT 2;"
# funcoes que mudam a sessao ou leem arquivo do servidor
sonda "set_config" "SELECT set_config('default_transaction_read_only','off',false)"
sonda "pg_read_file" "SELECT pg_read_file('/etc/passwd')"
sonda "pg_read_binary_file" "SELECT pg_read_binary_file('/etc/passwd')"
sonda "lo_import" "SELECT lo_import('/etc/passwd')"
sonda "dblink" "SELECT dblink('x','y')"
# A5 (K-277): escape U&/UESCAPE e prefixos pg_ e lo_ (sondas S8 a S12 do parecer), em qualquer caixa
sonda "S8 U& com UESCAPE (set_config escapado)" "SELECT U&\"s!0065t!005fconfig\" UESCAPE '!'('transaction_read_only','off',false);"
sonda "S9 U& com UESCAPE (pg_sleep escapado)" "SELECT U&\"pg!005fsleep\" UESCAPE '!'(100);"
sonda "S10 pg_terminate_backend" "SELECT pg_terminate_backend(pid) FROM pg_stat_activity;"
sonda "S11 pg_advisory_lock" "SELECT pg_advisory_lock(1);"
sonda "S12 lo_create" "SELECT lo_create(0);"
sonda "UESCAPE sozinho, caixa mista" "SELECT 1 UeScApE '!'"
sonda "prefixo PG_ em maiuscula" "SELECT PG_backend_pid()"
sonda "prefixo LO_ em maiuscula" "SELECT LO_unlink(1)"
# A6 (K-281): funcoes que executam texto como SQL (sondas S13 e S14 do parecer do K-277), em qualquer caixa
sonda "S13 query_to_xml com nome montado por ||" "SELECT query_to_xml('select p'||'g_terminate_backend(pid) from p'||'g_stat_activity',true,false,'');"
sonda "S14 ts_stat com nome montado por ||" "SELECT ts_stat('select to_tsvector(p'||'g_sleep(5)::text)');"
sonda "query_to_xmlschema" "SELECT query_to_xmlschema('select 1',true,false,'')"
sonda "query_to_xml_and_xmlschema" "SELECT query_to_xml_and_xmlschema('select 1',true,false,'')"
sonda "ts_rewrite com consulta" "SELECT ts_rewrite('a & b'::tsquery, 'select t, s from aliases')"
sonda "query_to_xml em maiuscula" "SELECT QUERY_TO_XML('select 1',true,false,'')"
# A1 do review do K-277: U& sem UESCAPE tambem e recusado
sonda "U& sem UESCAPE" "SELECT U&\"x\""
# corpus de legitimos: os 31 .sql versionados passam na lista permitida (o caminho feliz acima ja exige 31 ok)
verifica "os 31 .sql versionados cumprem a lista permitida" "$(roda | grep -q '^recusada  ' && echo 1 || echo 0)"
# Q-RO-1: o dspd_coletor nao tem SELECT em view (so a API); nenhum .sql versionado le vw_ (permission denied = psql rc 3)
verifica "nenhum .sql versionado le view vw_ (coletor sem grant)" "$(cat "$RAIZ"/scripts/sql/consultas-098-099/*.sql | grep -v '^--' | grep -qiE '(^|[^[:alnum:]_])vw_' && echo 1 || echo 0)"

# A3: certificado fixado por ssl-fp, --defaults-file, --sandbox; sem ssl-ca nem desligar verificacao
cat >"$TMP/bin/mysql" <<'EOF'
#!/bin/bash
echo "mysql $*" >>"$LOG"
cnf="${1#--defaults-file=}"
cp "$cnf" "$CNF_COPIA"
exec "$(dirname "$0")/falso-banco" "$@"
EOF
export CNF_COPIA="$TMP/cnf-copia"
: >"$LOG"; roda --so-mysql >/dev/null
verifica "mysql: --defaults-file e --sandbox no argv" "$(grep -q '^mysql --defaults-file=.* --sandbox ' "$LOG" && ! grep -q 'defaults-extra-file' "$LOG" && echo 0 || echo 1)"
FIXADA_ESPERADA="$(printf '%s' "$IMP" | tr -d ':' | tr 'A-F' 'a-f')"
verifica "mysql: ssl-fp com a impressao fixada, TLS ligado" "$(grep -qx "ssl-fp=$FIXADA_ESPERADA" "$CNF_COPIA" && grep -qx 'ssl' "$CNF_COPIA" && echo 0 || echo 1)"
verifica "mysql: verificacao nunca desligada (sem skip-ssl nem ssl-verify desligado)" "$(grep -Eq 'skip-ssl|ssl=0|ssl-verify-server-cert=(0|off|false)|disable' "$CNF_COPIA" && echo 1 || echo 0)"

# A4: chamado de dentro do repositorio, a saida vai para a pasta pessoal, nunca para o repositorio
mkdir -p "$TMP/home"
saida="$(cd "$TMP/repo" && HOME="$TMP/home" DEMO_ENV_ARQUIVO="$TMP/env" bash "$SCRIPT" --so-pg 2>&1)"
verifica "dentro do repositorio: saida na pasta pessoal" "$(ls "$TMP"/home/consultas-098-099-*.txt >/dev/null 2>&1 && ! ls "$TMP"/repo/consultas-098-099-*.txt >/dev/null 2>&1 && echo 0 || echo 1)"
verifica "gitignore cobre consultas-098-099-*.txt" "$(grep -qx 'consultas-098-099-\*.txt' "$RAIZ/.gitignore" && echo 0 || echo 1)"

# A1: MySQL sem nenhuma linha (sem cabecalho) e "0 linhas", nao recusa; PostgreSQL sem saida continua recusado
saida="$(SAIDA_VAZIA=1 roda --so-mysql)"; rc=$?
verifica "MySQL sem linha: rc 0, nenhuma recusa e 0 linhas no arquivo" "$([ "$rc" -eq 0 ] && grep -q 'recusadas: 0; falhas: 0' <<<"$saida" && saida_arq | grep -q '^0 linhas$' && echo 0 || echo 1)"
saida="$(SAIDA_VAZIA=1 roda --so-pg)"; rc=$?
verifica "PostgreSQL sem saida: continua recusado, rc 1" "$([ "$rc" -eq 1 ] && grep -q 'recusada' <<<"$saida" && echo 0 || echo 1)"

# A2: chamado por um link simbolico para dentro do repositorio, a saida vai para a pasta pessoal
ln -s "$TMP/repo" "$TMP/link-repo"
rm -f "$TMP"/home/consultas-098-099-*.txt
saida="$(cd "$TMP/chamada" && INIT_CWD="$TMP/link-repo" HOME="$TMP/home" DEMO_ENV_ARQUIVO="$TMP/env" bash "$SCRIPT" --so-pg 2>&1)"
verifica "link para dentro do repositorio: saida na pasta pessoal, nao no repositorio" "$(ls "$TMP"/home/consultas-098-099-*.txt >/dev/null 2>&1 && ! ls "$TMP"/repo/consultas-098-099-*.txt >/dev/null 2>&1 && echo 0 || echo 1)"

# A1: .env malformado nunca imprime nada dele (nem a primeira palavra da linha)
{ cat "$TMP/env"; echo 'PALAVRAUNICA linha ruim'; } >"$TMP/env-ruim"
saida="$(cd "$TMP/chamada" && DEMO_ENV_ARQUIVO="$TMP/env-ruim" bash "$SCRIPT" --so-pg 2>&1)"
verifica ".env com linha ruim: nenhuma palavra dele na tela" "$(grep -q 'PALAVRAUNICA\|linha ruim' <<<"$saida" && echo 1 || echo 0)"
{ echo 'PALAVRAUNICA "aberta sem fechar'; cat "$TMP/env"; } >"$TMP/env-ruim"
: >"$LOG"
saida="$(cd "$TMP/chamada" && DEMO_ENV_ARQUIVO="$TMP/env-ruim" bash "$SCRIPT" --so-pg 2>&1)"; rc=$?
verifica ".env com erro de sintaxe: rc 1, categoria env, nada impresso e banco nao chamado" "$([ "$rc" -eq 1 ] && grep -q 'categoria: env' <<<"$saida" && ! grep -q 'PALAVRAUNICA\|aberta' <<<"$saida" && [ ! -s "$LOG" ] && echo 0 || echo 1)"

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
