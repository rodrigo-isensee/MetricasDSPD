#!/bin/bash
# Teste do scripts/lint-alterados.sh: repositório descartável e pnpm falso, sem rodar eslint de verdade.
# Casos: só docs, .ts/.tsx alterados, .ts removido e fallback sem origin/develop.
set -uo pipefail
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$TMP/bin"
cat >"$TMP/bin/pnpm" <<'EOS'
#!/bin/bash
echo "pnpm $*" >>"$PNPM_LOG"
EOS
chmod +x "$TMP/bin/pnpm"
export PNPM_LOG="$TMP/pnpm.log" PATH="$TMP/bin:$PATH"
export GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t

falhas=0
verifica() { if [ "$2" -eq 0 ]; then echo "ok - $1"; else echo "FALHOU - $1"; falhas=$((falhas + 1)); fi; }

novo_repo() { # nome; cria repo com o script e um commit base
  mkdir -p "$TMP/$1/scripts"
  cp "$RAIZ/scripts/lint-alterados.sh" "$TMP/$1/scripts/"
  cd "$TMP/$1" || exit 1
  git init -q -b develop .
  echo a >velho.ts
  echo d >doc.md
  git add -A
  git commit -qm base
}
roda() { : >"$PNPM_LOG"; saida="$(bash scripts/lint-alterados.sh 2>&1)"; }

novo_repo com-base
git update-ref refs/remotes/origin/develop HEAD
git switch -q -c feature/x

# 1) só docs: pula, sem chamar pnpm.
echo mais >>doc.md
git commit -qam docs
roda
grep -q 'lint pulado' <<<"$saida"
verifica "só docs pula o lint" $?
[ ! -s "$PNPM_LOG" ]
verifica "só docs não chama pnpm" $?

# 2) .ts e .tsx alterados: eslint só neles, com cache.
echo b >>velho.ts
mkdir -p 'dir com espaco'
echo c >'dir com espaco/novo.tsx'
git add -A
git commit -qm ts
roda
grep -qF 'pnpm exec eslint --cache --cache-location node_modules/.cache/eslint --no-warn-ignored dir com espaco/novo.tsx velho.ts' "$PNPM_LOG"
verifica ".ts/.tsx alterados vão ao eslint com cache" $?
! grep -q 'doc.md' "$PNPM_LOG"
verifica "arquivo não-ts fica fora do eslint" $?

# 3) .ts removido: não é listado, e sem outros .ts o lint é pulado.
git switch -q -c feature/y develop
git rm -q velho.ts
git commit -qm rm
roda
grep -q 'lint pulado' <<<"$saida"
verifica ".ts removido não vai ao eslint" $?

# 4) fallback: sem origin/develop, lint inteiro.
novo_repo sem-base
git switch -q -c feature/z
roda
grep -qx 'pnpm run lint' "$PNPM_LOG"
verifica "sem origin/develop cai no lint inteiro" $?

[ "$falhas" -eq 0 ]
