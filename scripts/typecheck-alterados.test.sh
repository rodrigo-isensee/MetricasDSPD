#!/bin/bash
# Teste do scripts/typecheck-alterados.sh: repositório descartável e pnpm falso, sem rodar tsc de verdade.
# Casos: só docs, web, web+server, e2e, packages/* (inteiro), raiz (inteiro), tools sem typecheck e fallback sem origin/develop.
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
  mkdir -p "$TMP/$1/scripts" "$TMP/$1/web/src" "$TMP/$1/server/src" "$TMP/$1/e2e" "$TMP/$1/packages/contratos/src" "$TMP/$1/tools/spec-check"
  cp "$RAIZ/scripts/typecheck-alterados.sh" "$TMP/$1/scripts/"
  cd "$TMP/$1" || exit 1
  git init -q -b develop .
  echo a >web/src/a.ts
  echo a >server/src/a.ts
  echo a >e2e/a.ts
  echo a >packages/contratos/src/a.ts
  echo a >tools/spec-check/a.ts
  echo '{}' >package.json
  echo d >doc.md
  git add -A
  git commit -qm base
}
roda() { : >"$PNPM_LOG"; saida="$(bash scripts/typecheck-alterados.sh 2>&1)"; }
volta() { git switch -q develop; git switch -q -c "$1"; }

novo_repo com-base
git update-ref refs/remotes/origin/develop HEAD

# 1) só docs: pula, sem chamar pnpm.
volta feature/docs
echo mais >>doc.md
git commit -qam docs
roda
grep -q 'typecheck pulado' <<<"$saida"
verifica "só docs pula o typecheck" $?
[ ! -s "$PNPM_LOG" ]
verifica "só docs não chama pnpm" $?

# 2) só web: filtra por web.
volta feature/web
echo b >>web/src/a.ts
git commit -qam web
roda
grep -qx 'pnpm --filter @metricas-dspd/web run typecheck' "$PNPM_LOG"
verifica "mudança em web roda só o typecheck do web" $?
[ "$(wc -l <"$PNPM_LOG")" -eq 1 ]
verifica "web chama o pnpm uma vez" $?

# 3) web + server: dois filtros numa chamada.
volta feature/web-server
echo b >>web/src/a.ts
echo b >>server/src/a.ts
git commit -qam ws
roda
grep -qx 'pnpm --filter @metricas-dspd/server --filter @metricas-dspd/web run typecheck' "$PNPM_LOG"
verifica "web e server rodam juntos, sem repetir" $?

# 4) só e2e: tsc direto no e2e.
volta feature/e2e
echo b >>e2e/a.ts
git commit -qam e2e
roda
grep -qx 'pnpm --filter @metricas-dspd/e2e exec tsc --noEmit' "$PNPM_LOG"
verifica "mudança em e2e roda o tsc do e2e" $?

# 5) packages/*: typecheck inteiro.
volta feature/pacote
echo b >>packages/contratos/src/a.ts
git commit -qam pacote
roda
grep -qx 'pnpm run typecheck' "$PNPM_LOG"
verifica "mudança em packages/* roda o typecheck inteiro" $?

# 6) raiz (package.json): typecheck inteiro.
volta feature/raiz
echo '{"a":1}' >package.json
git commit -qam raiz
roda
grep -qx 'pnpm run typecheck' "$PNPM_LOG"
verifica "mudança em package.json da raiz roda o typecheck inteiro" $?

# 6b) raiz (package.json) só no bloco scripts: não conta, pula.
volta feature/raiz-scripts
echo '{"scripts":{"x":"y"}}' >package.json
git commit -qam raiz-scripts-base
git update-ref refs/remotes/origin/develop HEAD
echo '{"scripts":{"x":"z"}}' >package.json
git commit -qam raiz-scripts
roda
grep -q 'typecheck pulado' <<<"$saida"
verifica "package.json da raiz só em scripts não dispara typecheck" $?
git update-ref refs/remotes/origin/develop develop

# 7) tools sem typecheck na raiz: pula.
volta feature/tools
echo b >>tools/spec-check/a.ts
git commit -qam tools
roda
grep -q 'typecheck pulado' <<<"$saida"
verifica "tools/spec-check fica fora do typecheck" $?

# 8) .ts removido em web: ainda roda o web (a remoção pode quebrar quem importava).
volta feature/rm
git rm -q web/src/a.ts
git commit -qm rm
roda
grep -qx 'pnpm --filter @metricas-dspd/web run typecheck' "$PNPM_LOG"
verifica ".ts removido em web roda o typecheck do web" $?

# 9) fallback: sem origin/develop, typecheck inteiro.
novo_repo sem-base
git switch -q -c feature/z
roda
grep -qx 'pnpm run typecheck' "$PNPM_LOG"
verifica "sem origin/develop cai no typecheck inteiro" $?

[ "$falhas" -eq 0 ]
