#!/bin/bash
# Typecheck do pre-push: só nos pacotes tocados contra o merge-base com origin/develop (commits, índice, árvore de trabalho e arquivos novos; web, server, e2e, tools/homolog).
# Mudança em packages/* (libs compartilhadas), config da raiz (package.json, lockfile, tsconfig) ou no workspace roda o typecheck inteiro.
# Sem nenhum .ts/.tsx/tsconfig/package.json relevante, pula. A CI segue com o `pnpm run typecheck` inteiro.
# Fallback: se origin/develop não existir (clone raso, remoto sem a ref), roda o typecheck inteiro.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

base="origin/develop"
if ! git rev-parse --verify -q "refs/remotes/$base" >/dev/null; then
  echo "typecheck-alterados: $base inexistente; fallback para o typecheck inteiro (pnpm run typecheck)." >&2
  exec pnpm run typecheck
fi
if ! mb="$(git merge-base "refs/remotes/$base" HEAD 2>/dev/null)"; then
  echo "typecheck-alterados: sem merge-base com $base; fallback para o typecheck inteiro (pnpm run typecheck)." >&2
  exec pnpm run typecheck
fi

inteiro=0
raiz_pkg=0
filtros=()
e2e=0
adiciona() { # pacote; sem duplicar
  local p="$1" f
  for f in "${filtros[@]:-}"; do [ "$f" = "$p" ] && return 0; done
  filtros+=("$p")
}

while IFS= read -r f; do
  case "$f" in
    packages/*) inteiro=1 ;;
    web/*) adiciona web ;;
    server/*) adiciona server ;;
    tools/homolog/*) adiciona homolog ;;
    e2e/*) e2e=1 ;;
    tools/*) ;;                       # fora do typecheck da raiz
    */*) ;;                           # outras pastas (docs, scripts, .github...)
    package.json) raiz_pkg=1 ;;
    pnpm-lock.yaml | pnpm-workspace.yaml | tsconfig*.json) inteiro=1 ;;
  esac
done < <({
  git diff --name-only "$mb" -- '*.ts' '*.tsx' '*tsconfig*.json' '*package.json' 'pnpm-lock.yaml' 'pnpm-workspace.yaml'
  git ls-files --others --exclude-standard -- '*.ts' '*.tsx' '*tsconfig*.json' '*package.json' 'pnpm-lock.yaml' 'pnpm-workspace.yaml'
} | sort -u)

# package.json da raiz: só conta se mudou algo além do bloco "scripts" (dependências, workspaces, etc.).
if [ "$raiz_pkg" -eq 1 ] && [ "$inteiro" -eq 0 ]; then
  sem_scripts() { # ref (ou "arvore" para o arquivo em disco); imprime o package.json da raiz sem "scripts" (vazio se não existir)
    { if [ "$1" = arvore ]; then cat package.json; else git show "$1:package.json"; fi; } 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);delete j.scripts;console.log(JSON.stringify(j))}catch(e){console.log("")}})'
  }
  [ "$(sem_scripts "$mb")" != "$(sem_scripts arvore)" ] && inteiro=1
fi

if [ "$inteiro" -eq 1 ]; then
  echo "typecheck-alterados: mudança em packages/* ou na raiz contra $base; typecheck inteiro."
  exec pnpm run typecheck
fi

if [ "${#filtros[@]}" -eq 0 ] && [ "$e2e" -eq 0 ]; then
  echo "typecheck-alterados: nenhum pacote com .ts/.tsx/tsconfig/package.json alterado contra $base; typecheck pulado (a CI roda o typecheck inteiro)."
  exit 0
fi

if [ "${#filtros[@]}" -gt 0 ]; then
  args=()
  for p in "${filtros[@]}"; do args+=(--filter "@metricas-dspd/$p"); done
  echo "typecheck-alterados: typecheck em ${filtros[*]} contra $base."
  pnpm "${args[@]}" run typecheck || exit $?
fi
if [ "$e2e" -eq 1 ]; then
  echo "typecheck-alterados: typecheck em e2e contra $base."
  pnpm --filter @metricas-dspd/e2e exec tsc --noEmit || exit $?
fi
