#!/bin/bash
# Restauração verificada (C2). Uso: scripts/db-restaurar-verificada.sh [arquivo.dump]   (padrão: o mais recente de $DSPD_BACKUP_DIR)
#
# Restaura o dump num banco NOVO (`metricas_restauracao_<carimbo>`, removido ao final), e confere:
#   1. `migrate up` aplica 0 migrações (o dump traz a tabela de controle completa);
#   2. as contagens por tabela e as colunas batem com o `.inventario.txt` gravado junto do dump no momento do backup.
# Também confere (modo comparação) com o banco vivo se DSPD_COMPARAR_COM_VIVO=1 (CI: origem recém semeada).
# Precisa de um papel que crie banco: PGUSER_ADMIN (padrão postgres) + PGPASSWORD_ADMIN ou POSTGRES_PASSWORD no ambiente.
# O banco vivo NUNCA é alterado. Sai com código != 0 em qualquer divergência.
set -euo pipefail
. "$(dirname "$0")/lib-pg.sh"

DUMP="${1:-}"
if [ -z "$DUMP" ]; then
  DIR="$(exigir_dir_fora_do_repo "${DSPD_BACKUP_DIR:-}")"
  DUMP="$(ls -1 "$DIR"/metricas-*.dump 2>/dev/null | sort | tail -n 1 || true)"
fi
[ -f "$DUMP" ] || falhar "dump não encontrado: ${DUMP:-<nenhum>}"
INV="${DUMP%.dump}.inventario.txt"
[ -f "$INV" ] || falhar "inventário ausente: $INV"

ALVO="metricas_restauracao_$(date +%Y%m%d%H%M%S)"
ADMIN="${PGUSER_ADMIN:-postgres}"
SENHA_ADMIN="${PGPASSWORD_ADMIN:-${POSTGRES_PASSWORD:-}}"
VIVO_DB="$PGDATABASE"
INICIO=$SECONDS

# Conexão administrativa (cria e remove o banco novo). Senha só no ambiente do subprocesso.
adm() { PGUSER="$ADMIN" PGPASSWORD="$SENHA_ADMIN" pg "$@"; }
limpar() { adm psql -X -q --no-password -d postgres -c "DROP DATABASE IF EXISTS $ALVO WITH (FORCE)" >/dev/null 2>&1 || true; rm -f "${TMP:-/nonexistent}"; }
TMP=""
trap limpar EXIT

echo "[restauracao] $(basename "$DUMP") ($(du -h "$DUMP" | cut -f1)) -> $ALVO"
adm psql -X -q -v ON_ERROR_STOP=1 --no-password -d postgres -c "CREATE DATABASE $ALVO ENCODING 'UTF8' TEMPLATE template0"
adm psql -X -q -v ON_ERROR_STOP=1 --no-password -d "$ALVO" -c "ALTER DATABASE $ALVO SET timezone TO 'UTC'"
# O pg_dump -Fc não leva as permissões do banco: devolve ao migrador o CREATE (como no banco real) para o `migrate up` conferir.
adm psql -X -q -v ON_ERROR_STOP=1 --no-password -d "$ALVO" -c "GRANT CREATE, CONNECT ON DATABASE $ALVO TO dspd_migrador"
adm pg_restore --no-password --exit-on-error -d "$ALVO" < "$DUMP"

# 1) migrate up na restauração: deve aplicar 0 migrações.
SAIDA="$(cd "$RAIZ" && PG_MIGRADOR_URL="postgres://dspd_migrador:${PGPASSWORD:-$DSPD_PWD_MIGRADOR}@${PGHOST}:${PGPORT}/${ALVO}" \
  DSPD_SCHEMA_PREFIXO="" pnpm --silent --filter @metricas-dspd/server run migrate up 2>&1)" || { echo "$SAIDA" >&2; falhar "migrate up falhou na restauração"; }
echo "$SAIDA" | grep -q '^up: 0 migração' || { echo "$SAIDA" >&2; falhar "migrate up aplicou migrações na restauração (esperado: 0)"; }
echo "[restauracao] migrate up: 0 migração(ões), como esperado"

# 2) inventário da restauração = inventário gravado no backup.
RESTAURADO="$(mktemp)"; TMP="$RESTAURADO"
PGDATABASE="$ALVO" pg psql -X -At -v ON_ERROR_STOP=1 --no-password -d "$ALVO" < "$RAIZ/scripts/sql/inventario.sql" > "$RESTAURADO"
comparar() {
  if diff <(grep '^contagem|' "$1") <(grep '^contagem|' "$2") >/dev/null; then echo "[restauracao] contagens: iguais ($(grep -c '^contagem|' "$1") tabelas)"
  else diff <(grep '^contagem|' "$1") <(grep '^contagem|' "$2") >&2 || true; falhar "contagens divergem ($3)"; fi
  if diff <(grep '^coluna|' "$1") <(grep '^coluna|' "$2") >/dev/null; then echo "[restauracao] catálogo (colunas): igual ($(grep -c '^coluna|' "$1") colunas)"
  else diff <(grep '^coluna|' "$1") <(grep '^coluna|' "$2") >&2 || true; falhar "catálogo diverge ($3)"; fi
}
comparar "$INV" "$RESTAURADO" "backup x restauração"

# 3) opcional: banco vivo x restauração (só vale se nada gravou desde o backup).
if [ "${DSPD_COMPARAR_COM_VIVO:-}" = 1 ]; then
  VIVO="$(mktemp)"
  pg psql -X -At -v ON_ERROR_STOP=1 --no-password -d "$VIVO_DB" < "$RAIZ/scripts/sql/inventario.sql" > "$VIVO"
  comparar "$VIVO" "$RESTAURADO" "vivo x restauração" || { rm -f "$VIVO"; exit 1; }
  rm -f "$VIVO"
fi
echo "[restauracao] ok em $((SECONDS - INICIO))s; banco $ALVO removido"
