#!/bin/bash
# Uso: scripts/bm-spike-paginacao.sh <id do card>. Carrega .env (se existir) e faz 1 GET em /loggedTime (card_ids e page=2).
# Imprime só status, contagem de registros e campos de paginação (só leitura; nada de conteúdo, pessoa ou chave).
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a
pnpm --filter @metricas-dspd/server exec tsx src/entradas/spike-paginacao-businessmap.ts "$@"
