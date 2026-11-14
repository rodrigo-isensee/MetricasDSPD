#!/bin/bash
# Teste do .githooks/pre-push: repositório descartável e pnpm falso, o hook real lendo as refs pela entrada padrão
# como o git faz. Casos: erro de lint plantado em arquivo de server/ recusa o envio (K-317).
set -uo pipefail
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$TMP/bin"
cat >"$TMP/bin/pnpm" <<'EOS'
#!/bin/bash
# eslint falso: erro de lint = arquivo com a marca ERRO_LINT; o eslint da raiz ignora server/**.
case "$*" in
  *"--filter @metricas-dspd/server exec eslint"*)
    for a in "$@"; do case "$a" in *.ts | *.tsx) grep -q ERRO_LINT "server/$a" && exit 1 ;; esac; done ;;
  *"exec eslint"*)
    for a in "$@"; do case "$a" in server/*) ;; *.ts | *.tsx) grep -q ERRO_LINT "$a" && exit 1 ;; esac; done ;;
esac
exit 0
EOS
chmod +x "$TMP/bin/pnpm"
export PATH="$TMP/bin:$PATH"
export GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t
unset GIT_DIR GIT_INDEX_FILE GIT_WORK_TREE

falhas=0
verifica() { if [ "$2" -eq 0 ]; then echo "ok - $1"; else echo "FALHOU - $1"; falhas=$((falhas + 1)); fi; }
ZERO=0000000000000000000000000000000000000000

novo_repo() { # nome; repo com o hook e os scripts reais, origin/develop no commit base
  mkdir -p "$TMP/$1/scripts" "$TMP/$1/.githooks" "$TMP/$1/server/src"
  cp "$RAIZ"/scripts/lint-alterados.sh "$RAIZ"/scripts/typecheck-alterados.sh "$TMP/$1/scripts/"
  cp "$RAIZ/.githooks/pre-push" "$TMP/$1/.githooks/"
  cd "$TMP/$1" || exit 1
  git init -q -b develop .
  echo a >server/src/s.ts
  git add -A
  git commit -qm base
  git update-ref refs/remotes/origin/develop HEAD
}
# hook REF_LOCAL SHA_LOCAL REF_REMOTA SHA_REMOTO: o que o git entrega ao hook, uma linha por ref
hook() { saida="$(printf '%s\n' "$1 $2 $3 $4" | bash .githooks/pre-push 2>&1)"; rc=$?; }

# 1) K-317: erro de lint plantado em arquivo de server/ alterado recusa o envio.
novo_repo lint-server
git switch -q -c feature/x
echo ERRO_LINT >>server/src/s.ts
git commit -qam erro-server
hook refs/heads/feature/x "$(git rev-parse HEAD)" refs/heads/feature/x "$ZERO"
[ "$rc" -ne 0 ] && grep -q 'corrija antes de enviar' <<<"$saida"
verifica "erro de lint em server/ alterado recusa o envio" $?

git revert --no-edit HEAD >/dev/null
hook refs/heads/feature/x "$(git rev-parse HEAD)" refs/heads/feature/x "$ZERO"
[ "$rc" -eq 0 ]
verifica "server/ sem erro de lint segue" $?

[ "$falhas" -eq 0 ]
