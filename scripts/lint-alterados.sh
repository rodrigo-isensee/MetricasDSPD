#!/bin/bash
# Lint do pre-push: eslint só nos .ts/.tsx alterados, com cache. A CI segue com o eslint inteiro (pnpm run lint).
# "Alterado" = o que difere do merge-base com origin/develop: commits da branch, mudanças no índice e na árvore
# de trabalho, e arquivos novos não rastreados (assim a checagem não dá verde em branco antes do commit).
# Arquivos de server/ vão ao eslint do pacote server (o eslint.config.js da raiz ignora server/**, K-317); o resto, ao da raiz.
# Sem nenhum arquivo desses, pula o lint.
# Fallback: se origin/develop não existir (clone raso, remoto sem a ref) ou não houver merge-base, roda o lint inteiro.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

base="origin/develop"
if ! git rev-parse --verify -q "refs/remotes/$base" >/dev/null; then
  echo "lint-alterados: $base inexistente; fallback para o lint inteiro (pnpm run lint)." >&2
  exec pnpm run lint
fi
if ! mb="$(git merge-base "refs/remotes/$base" HEAD 2>/dev/null)"; then
  echo "lint-alterados: sem merge-base com $base; fallback para o lint inteiro (pnpm run lint)." >&2
  exec pnpm run lint
fi

raiz=()
servidor=()
# Listagem com -z e leitura por NUL: nome com quebra de linha, aspas ou barra invertida chega inteiro (K-322).
while IFS= read -r -d '' f; do
  [ -n "$f" ] || continue
  case "$f" in
    server/*) servidor+=("${f#server/}") ;;
    *) raiz+=("$f") ;;
  esac
done < <({
  git diff -z --name-only --diff-filter=d "$mb" -- '*.ts' '*.tsx'
  git ls-files -z --others --exclude-standard -- '*.ts' '*.tsx'
} | sort -zu)

if [ "${#raiz[@]}" -eq 0 ] && [ "${#servidor[@]}" -eq 0 ]; then
  echo "lint-alterados: nenhum .ts/.tsx alterado contra $base; lint pulado (a CI roda o lint inteiro)."
  exit 0
fi

rc=0
if [ "${#raiz[@]}" -gt 0 ]; then
  echo "lint-alterados: eslint da raiz em ${#raiz[@]} arquivo(s) alterado(s) contra $base."
  pnpm exec eslint --cache --cache-location node_modules/.cache/eslint --no-warn-ignored -- "${raiz[@]}" || rc=1
fi
if [ "${#servidor[@]}" -gt 0 ]; then
  echo "lint-alterados: eslint do server em ${#servidor[@]} arquivo(s) alterado(s) contra $base."
  pnpm --filter @metricas-dspd/server exec eslint --cache --cache-location node_modules/.cache/eslint -- "${servidor[@]}" || rc=1
fi
exit "$rc"
