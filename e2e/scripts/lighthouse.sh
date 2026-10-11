#!/usr/bin/env bash
# Roda o Lighthouse CI nas 8 rotas (LHCI_ROTAS=/,/dados restringe) (F10). Pré-requisito: `pnpm install` em e2e/ e web/ com build recente (`pnpm run build` em web/).
# O Chromium usado é o do Playwright (mesma versão dos E2E). Resultado: e2e/lighthouse/relatorios/ + código de saída do lhci.
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -z "${CHROME_PATH:-}" ]]; then
  CHROME_PATH="$(node -e "import('@playwright/test').then(m=>console.log(m.chromium.executablePath()))")"
  export CHROME_PATH
fi
[[ -x "$CHROME_PATH" ]] || { echo "Chromium não encontrado em $CHROME_PATH (rode: pnpm exec playwright install chromium)"; exit 2; }
[[ -f ../web/dist/index.html ]] || { echo "Sem ../web/dist: rode 'pnpm run build' em web/ antes."; exit 2; }
echo "Chrome: $CHROME_PATH"
pnpm exec lhci autorun --config=lighthouse/lighthouserc.cjs
