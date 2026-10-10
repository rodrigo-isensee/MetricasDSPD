#!/usr/bin/env bash
# Deixa o Chromium do Playwright rodar sem sudo (WSL/Linux sem libs do sistema):
# baixa os .deb das libs que faltam, extrai em ~/.local/chromium-libs e imprime o export de LD_LIBRARY_PATH.
# Uso: eval "$(bash scripts/setup-chromium-local.sh)"   (depois: npx playwright test)
set -euo pipefail
DEST="${CHROMIUM_LIBS_DIR:-$HOME/.local/chromium-libs}"
cd "$(dirname "$0")/.."
npx playwright install chromium >&2
CHROME="$(ls -d "$HOME"/.cache/ms-playwright/chromium_headless_shell-*/*/chrome-headless-shell 2>/dev/null | tail -1 || true)"
mkdir -p "$DEST/debs"
if [ -n "$CHROME" ]; then
  mapfile -t FALTAM < <(ldd "$CHROME" 2>/dev/null | awk '/not found/{print $1}')
else FALTAM=(); fi
if [ "${#FALTAM[@]}" -gt 0 ]; then
  echo "Libs faltando: ${FALTAM[*]}" >&2
  PKGS=$(for l in "${FALTAM[@]}"; do
    { apt-file search "$l" 2>/dev/null || true; } | head -1 | cut -d: -f1; done | sort -u | tr '\n' ' ')
  # sem apt-file: usa a lista usual do Chromium
  PKGS="${PKGS:-libnspr4 libnss3 libasound2t64 libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2}"
  (cd "$DEST/debs" && apt-get download $PKGS >&2)
  for d in "$DEST"/debs/*.deb; do dpkg-deb -x "$d" "$DEST/root"; done
fi
echo "export LD_LIBRARY_PATH=\"$DEST/root/usr/lib/x86_64-linux-gnu:$DEST/root/lib/x86_64-linux-gnu\${LD_LIBRARY_PATH:+:\$LD_LIBRARY_PATH}\""
