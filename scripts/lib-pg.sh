#!/bin/bash
# Biblioteca dos scripts de backup/restauração (use com `source`). Não imprime nem recebe senha na linha de comando.
#
# Conexão: PGHOST, PGPORT, PGUSER, PGDATABASE e a senha por PGPASSFILE (~/.pgpass) ou PGPASSWORD no ambiente.
# Se nada disso estiver definido, a senha do papel vem de DSPD_PWD_MIGRADOR (do .env), também só no ambiente.
# Binários: os do host (pg_dump, pg_restore, psql) ou, com DSPD_PG_CONTAINER=<nome>, os de dentro do contêiner do Compose
# (`docker exec -i -e PGPASSWORD`: o valor herda do ambiente e nunca aparece em argv).

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ -f "$RAIZ/.env" ] && [ -z "${DSPD_NAO_CARREGAR_ENV:-}" ] && { set -a; . "$RAIZ/.env"; set +a; }

export PGHOST="${PGHOST:-127.0.0.1}" PGPORT="${PGPORT:-5432}"
export PGUSER="${PGUSER:-dspd_migrador}" PGDATABASE="${PGDATABASE:-metricas}"
if [ -z "${PGPASSWORD:-}" ] && [ -z "${PGPASSFILE:-}" ] && [ ! -f "$HOME/.pgpass" ] && [ "$PGUSER" = dspd_migrador ] && [ -n "${DSPD_PWD_MIGRADOR:-}" ]; then
  export PGPASSWORD="$DSPD_PWD_MIGRADOR"
fi

falhar() { echo "ERRO: $*" >&2; exit 1; }

# pg <comando> [args...]: executa um binário do PostgreSQL no host ou no contêiner.
pg() {
  if [ -n "${DSPD_PG_CONTAINER:-}" ]; then
    # Dentro do contêiner o servidor é local (porta 5432); o host do Compose não existe lá.
    docker exec -i -e PGPASSWORD -e PGUSER -e PGDATABASE -e PGHOST=127.0.0.1 -e PGPORT=5432 "$DSPD_PG_CONTAINER" "$@"
  else
    "$@"
  fi
}

# Data civil de Brasília (AAAA-MM-DD): é o "dia" do backup (e o que a trava do `down` confere).
hoje_brasilia() { TZ=America/Sao_Paulo date +%F; }

# Diretório de destino: obrigatório e fora do repositório (os dumps têm dados reais).
exigir_dir_fora_do_repo() {
  local dir="${1:-}"
  [ -n "$dir" ] || falhar "DSPD_BACKUP_DIR não definido (pasta fora do projeto, p.ex. /mnt/d/backups-metricas)"
  mkdir -p "$dir" || falhar "não consegui criar $dir"
  local real; real="$(cd "$dir" && pwd -P)"
  case "$real/" in "$RAIZ"/*) falhar "DSPD_BACKUP_DIR ($real) está dentro do repositório ($RAIZ)";; esac
  echo "$real"
}
