#!/bin/bash
# Teste do scripts/db-backup.sh sem base real: pg_dump falso registra a porta recebida e falha (o backup nunca conecta).
# Casos: PG_PORT vale, PGPORT vale, padrao 5432, PG_PORT e PGPORT divergentes recusam, mensagem traz host e porta.
set -uo pipefail
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/bin"
cat >"$TMP/bin/pg_dump" <<'EOS'
#!/bin/bash
echo "porta=$PGPORT host=$PGHOST" >>"$LOG"
exit 3
EOS
chmod +x "$TMP/bin/pg_dump"
FALHAS=0
roda() { # roda <VAR=valor>...; saida em $TMP/out, log em $TMP/log
  : >"$TMP/log"
  env -i PATH="$TMP/bin:/usr/bin:/bin" HOME="$TMP" LOG="$TMP/log" DSPD_NAO_CARREGAR_ENV=1 DSPD_BACKUP_DIR="$TMP/dest" "$@" \
    bash "$RAIZ/scripts/db-backup.sh" >"$TMP/out" 2>&1
}
ok() { if "$@"; then :; else echo "FALHOU: $*"; FALHAS=$((FALHAS+1)); fi; }
tem() { grep -q -- "$1" "$2"; }

roda PG_PORT=55432
ok tem "porta=55432" "$TMP/log"
ok tem "host 127.0.0.1 porta 55432" "$TMP/out"
roda PGPORT=55433
ok tem "porta=55433" "$TMP/log"
roda
ok tem "porta=5432" "$TMP/log"
ok tem "host 127.0.0.1 porta 5432" "$TMP/out"
roda PGPORT=1111 PG_PORT=2222
ok tem "divergem" "$TMP/out"
ok test ! -s "$TMP/log"
roda PGPORT=3333 PG_PORT=3333
ok tem "porta=3333" "$TMP/log"

[ "$FALHAS" -eq 0 ] && echo "db-backup.test: ok" || { echo "db-backup.test: $FALHAS falha(s)"; exit 1; }
