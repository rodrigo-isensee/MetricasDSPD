#!/bin/bash
# Backup do banco `metricas` (C2). Uso: DSPD_BACKUP_DIR=/pasta/fora/do/projeto scripts/db-backup.sh
#
# Gera em $DSPD_BACKUP_DIR:  metricas-AAAAMMDD-HHMMSS.dump (pg_dump -Fc), .inventario.txt (contagens + colunas na hora do backup),
# roles-AAAAMMDD-HHMMSS.sql (pg_dumpall --roles-only --no-role-passwords: as senhas ficam só no .env) e `ultimo-backup-ok`
# (data de Brasília; é o que libera `migrate down` sem prefixo). Mantém os 7 conjuntos mais recentes (DSPD_BACKUP_RETENCAO).
# Só confirma o backup depois de o dump ser lido de volta (`pg_restore --list`). Em falha, sai com código != 0 e não toca na confirmação.
set -euo pipefail
. "$(dirname "$0")/lib-pg.sh"
umask 077

DIR="$(exigir_dir_fora_do_repo "${DSPD_BACKUP_DIR:-}")"
RETENCAO="${DSPD_BACKUP_RETENCAO:-7}"
[[ "$RETENCAO" =~ ^[1-9][0-9]*$ ]] || falhar "DSPD_BACKUP_RETENCAO inválido: $RETENCAO"
CARIMBO="$(TZ=America/Sao_Paulo date +%Y%m%d-%H%M%S)"
BASE="$DIR/metricas-$CARIMBO"
trap 'rm -f "$BASE.dump.tmp" "$BASE.inventario.txt.tmp" "$DIR/roles-$CARIMBO.sql.tmp"' EXIT
INICIO=$SECONDS

echo "[backup] $PGDATABASE@$PGHOST:$PGPORT como $PGUSER -> $DIR"
pg pg_dump -Fc --no-password -d "$PGDATABASE" > "$BASE.dump.tmp"
pg pg_dumpall --roles-only --no-role-passwords --no-password > "$DIR/roles-$CARIMBO.sql.tmp"
pg psql -X -At -v ON_ERROR_STOP=1 --no-password -d "$PGDATABASE" < "$(dirname "$0")/sql/inventario.sql" > "$BASE.inventario.txt.tmp"

# Verificação: o dump precisa ser legível e conter tabelas; o inventário precisa ter conteúdo.
pg pg_restore --list < "$BASE.dump.tmp" | grep -q 'TABLE' || falhar "dump ilegível ou sem tabelas"
[ -s "$BASE.inventario.txt.tmp" ] || falhar "inventário vazio"

mv "$BASE.dump.tmp" "$BASE.dump"
mv "$BASE.inventario.txt.tmp" "$BASE.inventario.txt"
mv "$DIR/roles-$CARIMBO.sql.tmp" "$DIR/roles-$CARIMBO.sql"

# Rotação: fica com os N conjuntos mais recentes (por nome, que carrega a data), nunca por mtime.
ls -1 "$DIR"/metricas-*.dump | sort | head -n "-$RETENCAO" | while read -r velho; do
  stem="${velho%.dump}"; rm -f "$velho" "$stem.inventario.txt" "$DIR/roles-${stem##*metricas-}.sql"
done

# Confirmação do dia (a trava do `down` lê isto). Só depois de tudo acima.
hoje_brasilia > "$DIR/ultimo-backup-ok"
TAM="$(du -h "$BASE.dump" | cut -f1)"
echo "[backup] ok: $(basename "$BASE.dump") ($TAM) em $((SECONDS - INICIO))s; $(ls -1 "$DIR"/metricas-*.dump | wc -l) conjunto(s) guardado(s)"
