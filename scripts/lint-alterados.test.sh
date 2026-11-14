#!/bin/bash
# Teste do scripts/lint-alterados.sh: repositório descartável e pnpm falso, sem rodar eslint de verdade.
# Casos: só docs, .ts/.tsx alterados, .ts removido, server/ (eslint do pacote, K-317), erro plantado,
# alteração não commitada e fallback sem origin/develop.
set -uo pipefail
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$TMP/bin"
cat >"$TMP/bin/pnpm" <<'EOS'
#!/bin/bash
echo "pnpm $*" >>"$PNPM_LOG"
# eslint falso: erro de lint = arquivo com a marca ERRO_LINT. O eslint da raiz ignora server/** (como o
# eslint.config.js real); o do pacote server confere server/<arquivo>.
case "$*" in
  *"--filter @metricas-dspd/server exec eslint"*)
    for a in "$@"; do case "$a" in *.ts | *.tsx) grep -q ERRO_LINT "server/$a" && exit 1 ;; esac; done ;;
  *"exec eslint"*)
    for a in "$@"; do case "$a" in server/*) ;; *.ts | *.tsx) grep -q ERRO_LINT "$a" && exit 1 ;; esac; done ;;
esac
exit 0
EOS
chmod +x "$TMP/bin/pnpm"
export PNPM_LOG="$TMP/pnpm.log" PATH="$TMP/bin:$PATH"
export GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t

falhas=0
verifica() { if [ "$2" -eq 0 ]; then echo "ok - $1"; else echo "FALHOU - $1"; falhas=$((falhas + 1)); fi; }

novo_repo() { # nome; cria repo com o script e um commit base
  mkdir -p "$TMP/$1/scripts" "$TMP/$1/server/src"
  cp "$RAIZ/scripts/lint-alterados.sh" "$TMP/$1/scripts/"
  cd "$TMP/$1" || exit 1
  git init -q -b develop .
  echo a >velho.ts
  echo a >server/src/s.ts
  echo d >doc.md
  git add -A
  git commit -qm base
}
roda() { : >"$PNPM_LOG"; saida="$(bash scripts/lint-alterados.sh 2>&1)"; rc=$?; }

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

# 3b) K-317: arquivo de server/ vai ao eslint do pacote server (caminho relativo ao pacote), não ao da raiz.
git switch -q -c feature/srv develop
echo b >>server/src/s.ts
git commit -qam srv
roda
grep -qF 'pnpm --filter @metricas-dspd/server exec eslint --cache --cache-location node_modules/.cache/eslint src/s.ts' "$PNPM_LOG"
verifica "server/ alterado vai ao eslint do pacote server" $?
! grep -q '^pnpm exec eslint' "$PNPM_LOG"
verifica "server/ alterado não vai ao eslint da raiz" $?
[ "$rc" -eq 0 ]
verifica "server/ limpo passa" $?

# 3c) K-317: erro de lint plantado em arquivo do server reprova.
echo ERRO_LINT >>server/src/s.ts
git commit -qam erro-server
roda
[ "$rc" -ne 0 ]
verifica "erro de lint em server/ alterado reprova" $?

# 3d) raiz e server juntos: os dois eslints rodam; erro na raiz reprova.
git switch -q -c feature/ambos develop
echo b >>velho.ts
echo b >>server/src/s.ts
echo ERRO_LINT >>velho.ts
git commit -qam ambos
roda
[ "$(wc -l <"$PNPM_LOG")" -eq 2 ] && [ "$rc" -ne 0 ]
verifica "raiz e server rodam os dois eslints e o erro da raiz reprova" $?

# 3e) alteração ainda não commitada (árvore e arquivo novo) também é conferida: sem commit não dá verde em branco.
git switch -q -c feature/suja develop
echo ERRO_LINT >>server/src/s.ts
roda
[ "$rc" -ne 0 ]
verifica "erro de lint não commitado em server/ reprova" $?
git checkout -q -- server/src/s.ts
echo ERRO_LINT >novo.ts
roda
[ "$rc" -ne 0 ]
verifica "arquivo novo não rastreado com erro de lint reprova" $?
rm novo.ts

# 4) fallback: sem origin/develop, lint inteiro.
novo_repo sem-base
git switch -q -c feature/z
roda
grep -qx 'pnpm run lint' "$PNPM_LOG"
verifica "sem origin/develop cai no lint inteiro" $?

[ "$falhas" -eq 0 ]
