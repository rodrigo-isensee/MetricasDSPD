# K-309: proposta do pre-push com política de refs e recusa de não fast-forward

Pedido 102-forge-0460, E1.37 e E3. Decisão 5a do dono (2026-11-14 08:47): o arquivo da trava de envio (`.githooks/pre-push`) é do dono, então o time entrega a proposta pronta e testada aqui, e o dono aplica com um comando. Nenhum arquivo de `.githooks/` foi alterado nesta entrega.

## Resumo
- Mantém tudo o que o atual faz: bloqueio de envio para a `main` (mesma mensagem), lint e typecheck dos alterados (K-317 e K-322, com a regra da árvore suja) e o desvio spec e código do Siegard.
- Acrescenta, do modelo do Forge 0.46.0 (`templates/projeto/.githooks/pre-push`): recusa de envio que não é fast-forward (branch e tag movida), recusa quando o commit remoto não existe aqui (pede `git fetch`), só `refs/heads/` e `refs/tags/` (barra `refs/notes/`, `refs/remotes/` e o envio espelho), no máximo uma branch com código e uma remoção por envio (PREPUSH-REFS e PREPUSH-DELETE).
- Divergência declarada do modelo: o modelo do Forge não tem lista de nomes de branch. A lista pedida pelo brief (branch com código só em `feature/*`, `fix/*`, `docs/*`, `chore/*`, `develop` e `homolog`, mais as correções A1 e A2 do review; tags liberadas; apagar não passa pela lista) foi acrescentada num bloco à parte, "PREPUSH-REFS (nomes)", que o dono pode apagar sem afetar o resto. A lista aceita também `hotfix/*`, `forge/upgrade-*` e `refactor/*` (previstos no fluxo do projeto, no `fluxo-homologacao.md` §6 e no R-FLUXO). Um envio de `melhoria/*` fica recusado por esse bloco. `test/*` e `integracao/*` estão em uso no remoto e ficam aceitos num bloco à parte, comentado, que depende da resposta do dono (ver "Pergunta ao dono" na seção 3).
- O modelo do Forge traz também a fila e a trava de `pre-push.local` (flock, timeout, prioridade, `so_docs`). Não foram trazidas: este projeto não usa `pre-push.local`, o lint e o typecheck rápidos já rodam direto, e o ganho não paga a complexidade. Se o dono quiser a trava completa, é outra proposta.
- Validado numa cópia descartável (remoto bare, envios reais pelo `git push` com `core.hooksPath` apontando para a cópia): casos do roteiro verdes (seção 2), `shellcheck` do hook sem avisos.

## 1. Arquivo proposto (`.githooks/pre-push` inteiro)

```bash pre-push
#!/usr/bin/env bash
# Trava de envio do repositório. Ordem: (1) política de refs do modelo do Forge 0.46.0 (recusa envio que reescreve
# história, bloqueio da main, só branch e tag, nomes permitidos, uma branch com código e uma remoção por envio);
# (2) lint e typecheck dos alterados (K-317, K-322); (3) desvio spec<->código do Siegard, se instalado.
refs_branches=0; refs_remocoes=0  # PREPUSH-REFS: contadores do laço (nunca herdados do ambiente)
while read -r _ local_sha remote_ref remote_sha; do
  # R-VERIFY: reescrever histórico de ref remota existente (não fast-forward) é decisão do usuário.
  # Recusar quando o objeto remoto não existe localmente é intencional: sem ele não há como provar que
  # é fast-forward; um `git fetch` resolve. Apagar ref (local_sha zerado) não passa por esta checagem.
  case "$local_sha" in *[!0]*)
    case "$remote_sha" in *[!0]*)
      ref_nome="${remote_ref#refs/heads/}"; ref_nome="${ref_nome#refs/tags/}"
      if ! git cat-file -e "$remote_sha" 2>/dev/null; then
        echo "pre-push: o commit atual de ${ref_nome} no remoto não existe aqui, então não dá para saber se o envio é fast-forward; rode 'git fetch' e tente de novo." >&2
        exit 1
      fi
      if ! git merge-base --is-ancestor "$remote_sha" "$local_sha" 2>/dev/null; then
        case "$remote_ref" in
          refs/tags/*) echo "pre-push: R-VERIFY: mover a tag ${ref_nome} para outro commit (histórico reescrito) bloqueado; reescrever histórico é decisão do usuário." >&2 ;;
          *) echo "pre-push: R-VERIFY: envio não fast-forward para ${ref_nome} (histórico reescrito) bloqueado; traga a remota (git pull --rebase ou git merge) e envie normalmente; reescrever histórico é decisão do usuário." >&2 ;;
        esac
        exit 1
      fi ;;
    esac ;;
  esac
  if [ "$remote_ref" = "refs/heads/main" ]; then
    echo "pre-push: envio para a main bloqueado. Abra um pull request; o usuário valida e faz o merge." >&2
    exit 1
  fi
  # PREPUSH-REFS: a política vale para as refs reais do envio, qualquer que seja a sintaxe (--branches, mirror,
  # refspec com curinga, --prune): só branch (refs/heads/) e tag (refs/tags/).
  case "$remote_ref" in
    refs/heads/?*|refs/tags/?*) ;;
    *) echo "pre-push: R-FLUXO: a ref remota '${remote_ref}' não é branch (refs/heads/) nem tag (refs/tags/); envio bloqueado (o envio espelho leva refs/remotes/, refs/notes/ e afins)." >&2
       exit 1 ;;
  esac
  # PREPUSH-REFS (nomes): branch com código só em feature/*, fix/*, docs/*, chore/*, hotfix/*, refactor/*, forge/upgrade-*,
  # develop e homolog; nunca main.
  # Apagar ref e tag não passam por esta lista.
  case "$local_sha" in *[!0]*)
    case "$remote_ref" in
      refs/heads/feature/?*|refs/heads/fix/?*|refs/heads/docs/?*|refs/heads/chore/?*|refs/heads/hotfix/?*|refs/heads/refactor/?*|refs/heads/forge/upgrade-?*|refs/heads/develop|refs/heads/homolog|refs/tags/?*) ;;
      # PREPUSH-REFS (nomes, depende do dono): test/* e integracao/* estão em uso no remoto. Apague a linha abaixo
      # para recusá-los (e tire-os da mensagem); a decisão é do dono, não foi inferida.
      refs/heads/test/?*|refs/heads/integracao/?*) ;;
      *) echo "pre-push: R-FLUXO: a branch '${remote_ref#refs/heads/}' fora da política (feature/*, fix/*, docs/*, chore/*, hotfix/*, refactor/*, forge/upgrade-*, test/*, integracao/*, develop, homolog); envio bloqueado." >&2
         exit 1 ;;
    esac ;;
  esac
  case "$local_sha" in
    *[!0]*) case "$remote_ref" in refs/heads/*) refs_branches=$((refs_branches + 1)) ;; esac ;;
    *) refs_remocoes=$((refs_remocoes + 1)) ;;
  esac
  if [ "$refs_branches" -gt 1 ]; then
    echo "pre-push: R-FLUXO: mais de uma branch com código no mesmo envio bloqueado; envie uma branch por vez (git push origin <branch>)." >&2
    exit 1
  fi
  # PREPUSH-DELETE: a limpeza pós-merge apaga uma ref por envio; mais de uma remoção no mesmo envio é bloqueada.
  if [ "$refs_remocoes" -gt 1 ]; then
    echo "pre-push: R-FLUXO: mais de uma remoção de branch ou tag no mesmo envio bloqueada; apague uma por envio (git push origin --delete <ref>)." >&2
    exit 1
  fi
done

# Checagem rápida antes de enviar (lint + typecheck); o resto fica com o CI.
# Com alterações não commitadas (ex.: outro agente trabalhando na mesma árvore), uma falha pode não ser do commit
# enviado: nesse caso só avisa, e o CI valida o commit de verdade.
if ! { bash scripts/lint-alterados.sh && bash scripts/typecheck-alterados.sh; } >&2; then
  if [ -n "$(git status --porcelain)" ]; then
    echo "pre-push: lint/typecheck falharam com a árvore suja; seguindo (o CI valida o commit enviado)." >&2
  else
    echo "pre-push: lint/typecheck falharam; corrija antes de enviar." >&2
    exit 1
  fi
fi

# Desvio spec<->código: se o plugin Siegard estiver instalado nesta máquina, roda o --check dele (só local;
# o CI não roda Python). Plugin ausente ou sem siegard-trace.json: segue em silêncio.
trace_py="$(find "$HOME/.claude/plugins" -name trace.py -path '*siegard*' 2>/dev/null | head -n 1)"
if [ -n "$trace_py" ] && [ -f siegard-trace.json ] && command -v python3 >/dev/null; then
  for alvo in $(python3 -c 'import json;print(" ".join(json.load(open("siegard.json")).get("targets",{}).values()))' 2>/dev/null); do
    python3 -B "$trace_py" --check "$alvo" >&2 || { echo "pre-push: desvio spec<->código (trace.py --check $alvo); revise e religue com --bind." >&2; exit 1; }
  done
fi
exit 0
```

## 2. Roteiro de teste

A proposta perdida tinha 11 casos (os dois do K-317 já estão em `scripts/pre-push.test.sh`). Esta refeita tem 25, cobrindo as quatro frentes do hook: fast-forward, política de refs, nomes e o que o atual já fazia. O roteiro automático está no bloco 2.1; ele monta o repositório descartável, empurra de verdade para um remoto bare e confere o SHA remoto depois de cada recusa.

| # | Caso | Comando (no repositório descartável) | Resultado esperado |
|---|---|---|---|
| 01 | Branch nova permitida | `git push origin feature/x` | rc 0; remoto tem `feature/x` |
| 02 | Fast-forward | commit novo e `git push origin feature/x` | rc 0; remoto avança |
| 03 | Amend com force | `git commit --amend` e `git push --force origin feature/x` | rc 1, "não fast-forward"; remoto no SHA anterior |
| 04 | Refspec com `+` | `git push origin +HEAD:refs/heads/feature/x` | rc 1, "não fast-forward"; remoto intacto |
| 05 | Remoto com commit que não existe aqui | outro clone empurra `feature/x`; local, sem fetch: `git push origin feature/x` | rc 1, mensagem pede `git fetch` |
| 06 | Envio para a main | `git push origin HEAD:refs/heads/main` | rc 1, "envio para a main bloqueado"; `main` não nasce |
| 07 | Ref que não é branch nem tag | `git push origin HEAD:refs/notes/x` | rc 1, "não é branch"; ref não nasce |
| 08 | Nome fora da política | `git push origin HEAD:refs/heads/melhoria/x` | rc 1, "fora da política"; ref não nasce |
| 09 | Duas branches com código num envio | `git push origin fix/a docs/b` | rc 1, "mais de uma branch"; nem `fix/a` nem `docs/b` sobem |
| 10 | Prefixos permitidos, um por vez | `git push origin fix/a`, `docs/b`, `HEAD:refs/heads/chore/c` | rc 0 nos três; as três refs no remoto |
| 11 | Duas remoções num envio | `git push origin --delete fix/a docs/b` | rc 1, "mais de uma remoção"; as duas continuam |
| 12 | Uma remoção | `git push origin --delete chore/c` | rc 0; ref some |
| 13 | Tag nova | `git push origin v0.0.1` | rc 0 |
| 14 | Mover tag para commit não descendente | `git tag -f v0.0.1 <commit órfão>` e `git push --force origin v0.0.1` | rc 1, "mover a tag"; tag no SHA anterior |
| 15 | Erro de lint plantado (K-317 preservado) | `ERRO_LINT` em `server/src/s.ts`, commit, `git push origin feature/lint` | rc 1, "corrija antes de enviar"; ref não nasce |
| 16 | Lint corrigido | `git revert HEAD` e `git push origin feature/lint` | rc 0 |
| 17 | `develop` e `homolog` (A4) | `git push origin HEAD:refs/heads/develop` e `.../homolog` (fast-forward) | rc 0; as duas refs no remoto |
| 18 | `hotfix/*` (S1) | `git push origin HEAD:refs/heads/hotfix/x` | rc 0; ref no remoto |
| 19 | `forge/upgrade-*` (S2) | `git push origin HEAD:refs/heads/forge/upgrade-0.47.0` | rc 0; ref no remoto |
| 20 | `refactor/*` (S3) | `git push origin HEAD:refs/heads/refactor/x` | rc 0; ref no remoto |
| 21 | `test/*` (S4, depende do dono) | `git push origin HEAD:refs/heads/test/k1` | rc 0; ref no remoto |
| 22 | `integracao/*` (S5, depende do dono) | `git push origin HEAD:refs/heads/integracao/2026-11-14` | rc 0; ref no remoto |
| 23 | Feature com merge da develop (S6) | feature enviada, develop avança no remoto, `git merge --no-edit origin/develop` na feature e `git push origin feature/f` | rc 0 |
| 24 | Remoto avançou por outro clone (S7) | commit local e `git push` sem fetch | rc 1 (pede `git fetch`) |
| 25 | Depois do `git pull --rebase` (S7) | `git pull --rebase` e `git push` | rc 0 |

Resultado na cópia descartável (saída do roteiro): `ok` nos casos 01 a 25, "TUDO OK". Não coberto: bloco do Siegard (depende de plugin instalado na máquina, trecho inalterado) e a trava do `pre-push.local` (não existe neste projeto).

### 2.1 Roteiro automático

Para rodar: salvar o bloco como `prop.test.sh` fora do repositório e executar `bash prop.test.sh <arquivo pre-push> <raiz do projeto>` (a raiz fornece `scripts/lint-alterados.sh` e `scripts/typecheck-alterados.sh`; o `pnpm` é falso, só reconhece a marca `ERRO_LINT`).

```bash prop.test.sh
#!/bin/bash
# Roteiro do pre-push proposto (K-309): repositório descartável com remoto bare, envios reais pelo git.
# Uso: bash prop.test.sh CAMINHO_DO_PRE_PUSH RAIZ_DO_PROJETO
set -uo pipefail
HOOK="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
RAIZ="$2"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/bin"
cat >"$TMP/bin/pnpm" <<'EOS'
#!/bin/bash
# eslint falso: erro de lint = arquivo com a marca ERRO_LINT.
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
verifica() { if [ "$2" -eq 0 ]; then echo "ok - $1"; else echo "FALHOU - $1 :: $saida"; falhas=$((falhas + 1)); fi; }

git init -q --bare -b develop "$TMP/remoto.git"
git clone -q "$TMP/remoto.git" "$TMP/w" 2>/dev/null
cd "$TMP/w" || exit 1
mkdir -p scripts .githooks server/src
cp "$RAIZ"/scripts/lint-alterados.sh "$RAIZ"/scripts/typecheck-alterados.sh scripts/
cp "$HOOK" .githooks/pre-push
chmod +x .githooks/pre-push
git config core.hooksPath .githooks
git switch -q -c develop
echo a >server/src/s.ts
git add -A
git commit -qm base
BASE="$(git rev-parse HEAD)"
envia() { saida="$(git push "$@" 2>&1)"; rc=$?; }
topo() { git ls-remote "$TMP/remoto.git" "$1" | cut -f1; }

# 1) branch nova permitida
envia origin develop:refs/heads/develop
git push -q origin develop:refs/heads/homolog 2>/dev/null
git switch -q -c feature/x
echo b >>server/src/s.ts
git commit -qam b1
envia origin feature/x
[ "$rc" -eq 0 ] && [ "$(topo refs/heads/feature/x)" = "$(git rev-parse HEAD)" ]
verifica "01 branch nova feature/x segue" $?

# 2) fast-forward
echo c >>server/src/s.ts
git commit -qam b2
envia origin feature/x
[ "$rc" -eq 0 ] && [ "$(topo refs/heads/feature/x)" = "$(git rev-parse HEAD)" ]
verifica "02 fast-forward segue" $?

# 3) amend + force
ANTES="$(topo refs/heads/feature/x)"
git commit -q --amend -m b2-reescrito
envia --force origin feature/x
[ "$rc" -ne 0 ] && grep -q 'não fast-forward' <<<"$saida" && [ "$(topo refs/heads/feature/x)" = "$ANTES" ]
verifica "03 amend com --force recusado, remoto intacto" $?

# 4) +refspec
envia origin +HEAD:refs/heads/feature/x
[ "$rc" -ne 0 ] && grep -q 'não fast-forward' <<<"$saida" && [ "$(topo refs/heads/feature/x)" = "$ANTES" ]
verifica "04 +refspec recusado, remoto intacto" $?

# 5) objeto remoto ausente localmente
git clone -q "$TMP/remoto.git" "$TMP/outro" 2>/dev/null
( cd "$TMP/outro" && git config core.hooksPath "$TMP/w/.githooks" && git switch -q feature/x && echo z >>server/src/s.ts && git commit -qam z && git push -q origin feature/x ) >/dev/null 2>&1
git reset -q --hard "$ANTES"
echo y >>server/src/s.ts
git commit -qam y
envia origin feature/x
[ "$rc" -ne 0 ] && grep -q "git fetch" <<<"$saida"
verifica "05 remoto com commit ausente pede git fetch" $?

# 6) main
envia origin HEAD:refs/heads/main
[ "$rc" -ne 0 ] && grep -q 'envio para a main bloqueado' <<<"$saida" && [ -z "$(topo refs/heads/main)" ]
verifica "06 envio para a main bloqueado" $?

# 7) ref que não é branch nem tag
envia origin HEAD:refs/notes/x
[ "$rc" -ne 0 ] && grep -q 'não é branch' <<<"$saida" && [ -z "$(topo refs/notes/x)" ]
verifica "07 ref refs/notes/ recusada" $?

# 8) nome de branch fora da política
envia origin HEAD:refs/heads/melhoria/x
[ "$rc" -ne 0 ] && grep -q 'fora da política' <<<"$saida" && [ -z "$(topo refs/heads/melhoria/x)" ]
verifica "08 branch melhoria/x recusada" $?

# 9) duas branches com código no mesmo envio
git branch -f fix/a HEAD
git branch -f docs/b HEAD
envia origin fix/a docs/b
[ "$rc" -ne 0 ] && grep -q 'mais de uma branch' <<<"$saida" && [ -z "$(topo refs/heads/fix/a)" ] && [ -z "$(topo refs/heads/docs/b)" ]
verifica "09 duas branches no mesmo envio recusadas" $?

# 10) prefixos permitidos fix, docs e chore (um por vez)
git push -q origin fix/a 2>/dev/null
git push -q origin docs/b 2>/dev/null
envia origin HEAD:refs/heads/chore/c
[ "$rc" -eq 0 ] && [ -n "$(topo refs/heads/fix/a)" ] && [ -n "$(topo refs/heads/docs/b)" ] && [ -n "$(topo refs/heads/chore/c)" ]
verifica "10 fix/*, docs/* e chore/* seguem" $?

# 11) duas remoções no mesmo envio
envia origin --delete fix/a docs/b
[ "$rc" -ne 0 ] && grep -q 'mais de uma remoção' <<<"$saida" && [ -n "$(topo refs/heads/fix/a)" ]
verifica "11 duas remoções no mesmo envio recusadas" $?

# 12) uma remoção segue
envia origin --delete chore/c
[ "$rc" -eq 0 ] && [ -z "$(topo refs/heads/chore/c)" ]
verifica "12 remoção de uma branch segue" $?

# 13) tag nova segue; mover a tag recusa
git tag v0.0.1 "$BASE"
envia origin v0.0.1
[ "$rc" -eq 0 ] && [ -n "$(topo refs/tags/v0.0.1)" ]
verifica "13 tag nova segue" $?
ORFAO="$(git commit-tree 'HEAD^{tree}' -m orfao)"
git tag -f v0.0.1 "$ORFAO" >/dev/null
envia --force origin v0.0.1
[ "$rc" -ne 0 ] && grep -q 'mover a tag' <<<"$saida" && [ "$(topo refs/tags/v0.0.1)" = "$BASE" ]
verifica "14 mover a tag recusado" $?

# 15) K-317: erro de lint em arquivo enviado continua recusando
git switch -q -c feature/lint "$BASE"
echo ERRO_LINT >>server/src/s.ts
git commit -qam lint
envia origin feature/lint
[ "$rc" -ne 0 ] && grep -q 'corrija antes de enviar' <<<"$saida" && [ -z "$(topo refs/heads/feature/lint)" ]
verifica "15 erro de lint recusa o envio (K-317 preservado)" $?

# 16) correção do lint: envio segue
git revert --no-edit HEAD >/dev/null
envia origin feature/lint
[ "$rc" -eq 0 ]
verifica "16 sem erro de lint o envio segue" $?

# 17) develop e homolog (fast-forward, A4): o envio é conferido no remoto
git switch -q develop
echo d >>server/src/s.ts
git commit -qam d1
envia origin HEAD:refs/heads/develop
[ "$rc" -eq 0 ] && [ "$(topo refs/heads/develop)" = "$(git rev-parse HEAD)" ]
verifica "17a develop segue" $?
envia origin HEAD:refs/heads/homolog
[ "$rc" -eq 0 ] && [ "$(topo refs/heads/homolog)" = "$(git rev-parse HEAD)" ]
verifica "17b homolog segue" $?

# 18 a 22) um caso por nome aceito da lista (S1 a S5)
for nome in hotfix/x forge/upgrade-0.47.0 refactor/x test/k1 integracao/2026-11-14; do
  envia origin "HEAD:refs/heads/$nome"
  [ "$rc" -eq 0 ] && [ "$(topo "refs/heads/$nome")" = "$(git rev-parse HEAD)" ]
  verifica "18-22 $nome segue" $?
done

# 23) S6: feature enviada, develop avança no remoto, merge da develop na feature e envio
git switch -q -c feature/f develop
echo f >>server/src/s.ts
git commit -qam f1
envia origin feature/f
git clone -q "$TMP/remoto.git" "$TMP/dev2" 2>/dev/null
( cd "$TMP/dev2" && git switch -q develop && echo e >e.txt && git add e.txt && git commit -qm e1 && git push -q origin develop ) >/dev/null 2>&1
git fetch -q origin
git merge -q --no-edit origin/develop >/dev/null 2>&1
envia origin feature/f
[ "$rc" -eq 0 ] && [ "$(topo refs/heads/feature/f)" = "$(git rev-parse HEAD)" ]
verifica "23 feature com merge da develop segue (S6)" $?

# 24 e 25) S7: outro clone avança a feature; sem fetch recusa; depois do pull --rebase segue
( cd "$TMP/dev2" && git fetch -q origin && git switch -q feature/f && echo g >g.txt && git add g.txt && git commit -qm g1 && git push -q origin feature/f ) >/dev/null 2>&1
echo h >h.txt
git add h.txt
git commit -qm h1
envia origin feature/f
[ "$rc" -ne 0 ] && grep -q "git fetch" <<<"$saida"
verifica "24 remoto avançou, sem fetch recusa (S7)" $?
git pull -q --rebase origin feature/f >/dev/null 2>&1
envia origin feature/f
[ "$rc" -eq 0 ] && [ "$(topo refs/heads/feature/f)" = "$(git rev-parse HEAD)" ]
verifica "25 depois do pull --rebase segue (S7)" $?

[ "$falhas" -eq 0 ] && echo "TUDO OK" || echo "FALHAS: $falhas"
[ "$falhas" -eq 0 ]
```

## 3. Aplicar e voltar atrás

O dono roda, na raiz do repositório, numa branch dele (por exemplo `chore/k309-pre-push`, que a própria política aceita). O comando extrai o bloco da seção 1 deste documento, dá permissão de execução, confere sintaxe e mostra o diff:

```bash
awk '/^```bash pre-push$/{f=1;next} /^```$/{f=0} f' docs/devops/102-k309-pre-push-proposto.md > .githooks/pre-push && chmod +x .githooks/pre-push && bash -n .githooks/pre-push && git diff --stat -- .githooks/pre-push
```

Depois, commit e PR pelo fluxo normal. Para conferir antes de commitar, extraia o roteiro da seção 2.1 e rode contra o arquivo aplicado:

```bash
awk '/^```bash prop.test.sh$/{f=1;next} /^```$/{f=0} f' docs/devops/102-k309-pre-push-proposto.md > "$TMPDIR/prop.test.sh" && bash "$TMPDIR/prop.test.sh" .githooks/pre-push "$PWD"
```

Voltar atrás, antes de commitar:

```bash
git restore --source=HEAD --staged --worktree -- .githooks/pre-push
```

Depois de commitado e mesclado, voltar atrás é reverter o commit da aplicação (`git revert <sha>`) por PR, como qualquer mudança.

Pergunta ao dono (A3, não inferida): `test/*` e `integracao/*` estão em uso no remoto (`origin/test/k283-provas-pessoa-helper`, `origin/integracao/2026-11-07`). Esta proposta os aceita num bloco separado e comentado (as duas linhas "PREPUSH-REFS (nomes, depende do dono)"); apagar a linha recusa os dois e os casos 21 e 22 do roteiro passam a esperar rc 1. A resposta é do dono.

Observações para o dono:
- O pre-push local não vale como única barreira: a proteção de `develop`, `homolog` e `main` no GitHub continua sendo a trava de verdade.
- Para tirar só a lista de nomes, apague o bloco "PREPUSH-REFS (nomes)" (do comentário até o `esac ;;` e `esac` que o fecham); o resto não depende dele.
- As promoções `develop` → `homolog` e `homolog` → `main` são merges de PR feitos no GitHub, sem envio local, e não passam por este hook; o envio de tag de release local, se existir, passa (tag nova ou fast-forward).
