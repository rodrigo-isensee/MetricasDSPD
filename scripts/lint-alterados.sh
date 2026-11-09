#!/bin/bash
# Lint do pre-push: eslint só nos .ts/.tsx alterados contra origin/develop, com cache.
# Sem nenhum arquivo desses, pula o lint. A CI segue com o eslint inteiro (pnpm run lint).
# Fallback: se origin/develop não existir (clone raso, remoto sem a ref), roda o lint inteiro.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

base="origin/develop"
if ! git rev-parse --verify -q "refs/remotes/$base" >/dev/null; then
  echo "lint-alterados: $base inexistente; fallback para o lint inteiro (pnpm run lint)." >&2
  exec pnpm run lint
fi

arquivos=()
while IFS= read -r f; do
  [ -n "$f" ] && arquivos+=("$f")
done < <(git diff --name-only --diff-filter=d "$base...HEAD" -- '*.ts' '*.tsx')

if [ "${#arquivos[@]}" -eq 0 ]; then
  echo "lint-alterados: nenhum .ts/.tsx alterado contra $base; lint pulado (a CI roda o lint inteiro)."
  exit 0
fi

echo "lint-alterados: eslint em ${#arquivos[@]} arquivo(s) alterado(s) contra $base."
exec pnpm exec eslint --cache --cache-location node_modules/.cache/eslint --no-warn-ignored "${arquivos[@]}"
