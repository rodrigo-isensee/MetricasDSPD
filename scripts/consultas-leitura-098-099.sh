#!/bin/bash
# Uso: scripts/consultas-leitura-098-099.sh [--so-pg | --so-mysql]
# Roda, num comando so, as consultas de leitura dos pedidos 098 e 099 (PostgreSQL da demo e MySQL do Acelerato) e grava
# a saida em consultas-098-099-<data>.txt na pasta de ONDE foi chamado. Quem roda e o dono, com o .env dele; o time nunca roda isto.
# Seguranca (todas as camadas valem, uma nao substitui a outra):
#   - .env lido como o projeto le (set -a; . .env); so os NOMES das variaveis sao conferidos; nenhum valor e impresso;
#     senhas vao por ambiente (PostgreSQL) ou por arquivo temporario 0600 (MySQL), nunca por argv.
#   - PostgreSQL: papel dspd_coletor, sessao default_transaction_read_only=on e a consulta dentro de BEGIN READ ONLY ... ROLLBACK.
#   - MySQL: a mesma conta so leitura da coleta (ADR 0023), SET SESSION TRANSACTION READ ONLY, START TRANSACTION READ ONLY,
#     max_execution_time e ROLLBACK; TLS com o certificado fixado pela impressao SHA-256 conferida aqui antes de conectar.
#   - Cada arquivo .sql declara `-- COLUNAS: nome:tipo,...` (tipo = numero | data | dominio). A saida de cada consulta so
#     entra no arquivo se o cabecalho for exatamente esse, nenhuma coluna estiver na lista de pessoa/texto livre e cada
#     valor cumprir o tipo (numero so digitos; data so data; dominio curto e sem '@'). Senao a consulta e RECUSADA e
#     o arquivo recebe so o motivo (coluna e linha), nunca o valor.
#   - Arquivo .sql com INSERT/UPDATE/DELETE/DDL e recusado antes de rodar.
#   - Texto de erro de driver nunca e impresso (so o codigo de saida).
# Teste: DEMO_ENV_ARQUIVO aponta outro .env; CONSULTAS_SQL_DIR aponta outra pasta de .sql.
set -uo pipefail
# pnpm muda para a raiz do projeto e deixa a pasta de quem chamou em INIT_CWD.
ORIGEM="${INIT_CWD:-$PWD}"
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
DIR_SQL="${CONSULTAS_SQL_DIR:-$RAIZ/scripts/sql/consultas-098-099}"
ARQUIVO_ENV="${DEMO_ENV_ARQUIVO:-$RAIZ/.env}"
TETO_MS=120000

FONTES="pg mysql"
for arg in "$@"; do
  case "$arg" in
    --) ;; # pnpm repassa o -- de "pnpm run consultas:098-099 -- --so-pg"
    --so-pg) FONTES="pg" ;;
    --so-mysql) FONTES="mysql" ;;
    *) echo "uso: consultas-leitura-098-099.sh [--so-pg | --so-mysql]" >&2; exit 2 ;;
  esac
done

falhar() { echo "" >&2; echo "FALHOU na etapa '$1' (categoria: $2). $3" >&2; exit 1; }

cd "$RAIZ" || exit 1
umask 077
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# --- 1. .env (so os nomes) ---
[ -f "$ARQUIVO_ENV" ] || falhar "env" "arquivo-ausente" "O arquivo $ARQUIVO_ENV nao existe; copie .env.example e preencha."
NECESSARIAS=()
case " $FONTES " in *" pg "*) NECESSARIAS+=(DSPD_PWD_COLETOR) ;; esac
case " $FONTES " in *" mysql "*) NECESSARIAS+=(ACELERATO_MYSQL_HOST ACELERATO_MYSQL_PORT ACELERATO_MYSQL_DATABASE ACELERATO_MYSQL_USER ACELERATO_MYSQL_PASSWORD ACELERATO_MYSQL_TLS_SHA256 ACELERATO_MYSQL_TLS_CERT_FILE) ;; esac
FALTAM=()
for nome in "${NECESSARIAS[@]}"; do
  grep -Eq "^(export[[:space:]]+)?${nome}=.+" "$ARQUIVO_ENV" || FALTAM+=("$nome")
done
[ "${#FALTAM[@]}" -eq 0 ] || falhar "env" "variavel-ausente" "Faltam (so os nomes): ${FALTAM[*]}"
case "$ARQUIVO_ENV" in /*) ;; *) ARQUIVO_ENV="./$ARQUIVO_ENV" ;; esac
# shellcheck disable=SC1090
set -a && . "$ARQUIVO_ENV" && set +a

# --- 2. MySQL: certificado fixado e arquivo de opcoes 0600 (a senha nunca vai no argv) ---
if [[ " $FONTES " == *" mysql "* ]]; then
  command -v mysql >/dev/null 2>&1 || falhar "mysql" "cliente-ausente" "O cliente mysql/mariadb nao esta no PATH."
  command -v openssl >/dev/null 2>&1 || falhar "mysql" "cliente-ausente" "O openssl nao esta no PATH (confere a impressao do certificado)."
  [ -f "$ACELERATO_MYSQL_TLS_CERT_FILE" ] || falhar "mysql" "tls-configuracao" "O arquivo do certificado (ACELERATO_MYSQL_TLS_CERT_FILE) nao existe."
  FIXADA="$(printf '%s' "$ACELERATO_MYSQL_TLS_SHA256" | tr -d ':' | tr 'A-F' 'a-f')"
  REAL="$(openssl x509 -in "$ACELERATO_MYSQL_TLS_CERT_FILE" -noout -fingerprint -sha256 2>/dev/null | sed 's/^.*=//' | tr -d ':' | tr 'A-F' 'a-f')"
  [ -n "$REAL" ] && [ "$REAL" = "$FIXADA" ] || falhar "mysql" "tls-impressao-diferente" "A impressao SHA-256 do certificado nao confere com a fixada no .env."
  esc() { local s="${1//\\/\\\\}"; printf '%s' "${s//\"/\\\"}"; }
  {
    echo "[client]"
    echo "host=\"$(esc "$ACELERATO_MYSQL_HOST")\""
    echo "port=$ACELERATO_MYSQL_PORT"
    echo "user=\"$(esc "$ACELERATO_MYSQL_USER")\""
    echo "password=\"$(esc "$ACELERATO_MYSQL_PASSWORD")\""
    echo "database=\"$(esc "$ACELERATO_MYSQL_DATABASE")\""
    echo "ssl-ca=\"$(esc "$ACELERATO_MYSQL_TLS_CERT_FILE")\""
    echo "ssl-verify-server-cert"
  } >"$TMP/mysql.cnf"
  chmod 600 "$TMP/mysql.cnf"
fi

# --- validador da saida (TSV com cabecalho): so numero, data e dominio; falha sem imprimir valor ---
# Entrada: $1 = colunas declaradas "nome:tipo,...". Le a saida em stdin. rc 0 = ok; rc 3 = recusada (motivo no stderr).
validar() {
  awk -F'\t' -v decl="$1" '
    BEGIN {
      n = split(decl, d, ","); negra = "^(email|e_mail|mail|usuario|usuariokey|usuario_key|solicitante|agente|responsavel|responsavel_nome|titulo|descricao|pessoa|pessoa_ref|nome_pessoa)$"
      for (i = 1; i <= n; i++) { split(d[i], p, ":"); nome[i] = p[1]; tipo[i] = p[2]
        if (tolower(nome[i]) ~ negra) { print "coluna proibida declarada: " nome[i] > "/dev/stderr"; exit 3 }
        if (tipo[i] != "numero" && tipo[i] != "data" && tipo[i] != "dominio") { print "tipo invalido em " nome[i] > "/dev/stderr"; exit 3 } }
    }
    NR == 1 {
      if (NF != n) { print "cabecalho com " NF " colunas, esperado " n > "/dev/stderr"; exit 3 }
      for (i = 1; i <= n; i++) {
        if (tolower($i) ~ negra) { print "coluna proibida na saida: " $i > "/dev/stderr"; exit 3 }
        if ($i != nome[i]) { print "coluna " i " e \"" $i "\", esperado \"" nome[i] "\"" > "/dev/stderr"; exit 3 } }
      next
    }
    {
      if (NF != n) { print "linha " NR ": " NF " colunas, esperado " n > "/dev/stderr"; exit 3 }
      for (i = 1; i <= n; i++) {
        v = $i
        if (v == "NULL" || v == "") continue
        if (tipo[i] == "numero" && v !~ /^-?[0-9]+(\.[0-9]+)?$/) { print "linha " NR ", coluna " nome[i] ": nao e numero" > "/dev/stderr"; exit 3 }
        if (tipo[i] == "data" && v !~ /^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]([ T][0-9:.+Z-]*)?$/) { print "linha " NR ", coluna " nome[i] ": nao e data" > "/dev/stderr"; exit 3 }
        if (tipo[i] == "dominio" && (length(v) > 120 || index(v, "@") > 0)) { print "linha " NR ", coluna " nome[i] ": nao parece nome de dominio (longo ou com @)" > "/dev/stderr"; exit 3 }
      }
    }
    END { if (NR == 0) { print "saida vazia (sem cabecalho)" > "/dev/stderr"; exit 3 } }
  '
}

# --- executores (a consulta entra por stdin; o .sql e o unico texto que chega ao banco) ---
rodar_pg() { # arquivo
  { echo 'BEGIN READ ONLY;'; cat "$1"; echo; echo 'ROLLBACK;'; } |
    PGPASSWORD="$DSPD_PWD_COLETOR" docker compose exec -T -e PGPASSWORD \
      -e "PGOPTIONS=-c default_transaction_read_only=on -c statement_timeout=$TETO_MS" postgres \
      psql -X -q -v ON_ERROR_STOP=1 -U dspd_coletor -d metricas -A -F $'\t' -P footer=off -P null=NULL
}
rodar_mysql() { # arquivo
  { echo 'SET SESSION TRANSACTION READ ONLY;'; echo "SET SESSION max_execution_time = $TETO_MS;"; echo 'START TRANSACTION READ ONLY;'
    cat "$1"; echo; echo 'ROLLBACK;'; } |
    mysql --defaults-extra-file="$TMP/mysql.cnf" --batch --connect-timeout=10
}

# --- 3. consultas, na ordem dos arquivos (B das analises do 099, C do 098, Q do 099) ---
DATA="$(TZ=America/Sao_Paulo date +%F)"
SAIDA="$ORIGEM/consultas-098-099-$DATA.txt"
{
  echo "# Consultas de leitura dos pedidos 098 e 099, $DATA"
  echo "# So contagens, datas e nomes de dominio. Confira cada nome de dominio (equipe, organizacao, tag, etapa, campo) antes de colar em qualquer lugar: se trouxer nome de pessoa ou de cliente, apague."
} >"$SAIDA" || falhar "saida" "escrita" "Nao consegui gravar $SAIDA."
case "$ORIGEM/" in "$RAIZ"/*) echo "AVISO: a saida esta dentro do repositorio ($SAIDA); nao a inclua em commit." >&2 ;; esac

TOTAL=0 OK=0 RECUSADAS=0 FALHAS=0
shopt -s nullglob
for f in "$DIR_SQL"/*.sql; do
  id="$(sed -n 's/^-- ID: //p' "$f" | head -1)"
  fonte="$(sed -n 's/^-- FONTE: //p' "$f" | head -1)"
  colunas="$(sed -n 's/^-- COLUNAS: //p' "$f" | head -1 | tr -d ' ')"
  origem="$(sed -n 's/^-- ORIGEM: //p' "$f" | head -1)"
  [ -n "$id" ] && [ -n "$fonte" ] && [ -n "$colunas" ] || falhar "consultas" "arquivo-sem-cabecalho" "$(basename "$f") sem ID, FONTE ou COLUNAS."
  case "$fonte" in pg | mysql) ;; *) falhar "consultas" "fonte-invalida" "$(basename "$f"): FONTE deve ser pg ou mysql." ;; esac
  case " $FONTES " in *" $fonte "*) ;; *) continue ;; esac
  TOTAL=$((TOTAL + 1))
  {
    echo ""
    echo "## $id ($fonte; $origem)"
  } >>"$SAIDA"
  # Recusa qualquer escrita ou DDL (sem os comentarios) antes de tocar no banco.
  if sed 's/--.*$//' "$f" | grep -Eiq '\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|call|merge|replace|into[[:space:]]+(outfile|dumpfile))\b'; then
    echo "RECUSADA: o arquivo tem palavra de escrita ou DDL; nada foi executado." >>"$SAIDA"
    RECUSADAS=$((RECUSADAS + 1)); echo "recusada  $id (escrita no .sql)"; continue
  fi
  if [ "$fonte" = pg ]; then rodar_pg "$f" >"$TMP/bruta" 2>/dev/null; else rodar_mysql "$f" >"$TMP/bruta" 2>/dev/null; fi
  rc=$?
  if [ "$rc" -ne 0 ]; then
    echo "FALHOU: codigo de saida $rc (o texto de erro do driver nao e impresso; rode a consulta sozinha para ver)." >>"$SAIDA"
    FALHAS=$((FALHAS + 1)); echo "falhou    $id (codigo $rc)"; continue
  fi
  if validar "$colunas" <"$TMP/bruta" 2>"$TMP/motivo"; then
    cat "$TMP/bruta" >>"$SAIDA"
    OK=$((OK + 1)); echo "ok        $id"
  else
    { echo "RECUSADA pela guarda de colunas (a saida nao foi gravada): $(cat "$TMP/motivo")"; } >>"$SAIDA"
    RECUSADAS=$((RECUSADAS + 1)); echo "recusada  $id ($(head -1 "$TMP/motivo"))"
  fi
done

echo ""
echo "Consultas: $TOTAL; ok: $OK; recusadas: $RECUSADAS; falhas: $FALHAS."
echo "Saida: $SAIDA"
[ "$TOTAL" -gt 0 ] || falhar "consultas" "nenhuma" "Nenhum .sql encontrado em $DIR_SQL."
[ "$RECUSADAS" -eq 0 ] && [ "$FALHAS" -eq 0 ]
