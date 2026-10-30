#!/bin/bash
# Uso: scripts/bm-diagnostico.sh. Carrega .env (se existir) e imprime a estrutura do BusinessMap (só leitura).
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a
pnpm --filter @metricas-dspd/server exec tsx src/entradas/diagnostico-businessmap.ts
