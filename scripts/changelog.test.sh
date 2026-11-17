#!/bin/bash
# Teste do scripts/changelog.mjs (K-377): dois fragmentos de branches diferentes mesclam sem conflito e o `juntar` junta os
# dois; formato inválido reprova; o histórico do CHANGELOG.md (da versão fechada em diante) fica intacto; o contraste mostra
# que editar o topo do CHANGELOG.md em duas branches dá conflito. Sem rede, sem banco: repositório temporário.
set -uo pipefail
# Isola do repositório de fora: quando roda num gancho ou no `pronto`, GIT_DIR e afins apontariam os commits de teste para ele.
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_PREFIX GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES
cd "$(dirname "$0")/.." || exit 1
RAIZ="$PWD"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
CLI="$RAIZ/scripts/changelog.mjs"

falhas=0
verifica() { # descrição, condição (0 = ok)
  if [ "$2" -eq 0 ]; then echo "ok - $1"; else echo "FALHOU - $1"; falhas=$((falhas + 1)); fi
}

R="$TMP/repo"
mkdir -p "$R/changelog.d"
cd "$R" || exit 1
git init -q -b develop .
git config user.email t@t
git config user.name t
git config commit.gpgsign false
cp "$RAIZ/CHANGELOG.md" CHANGELOG.md
cp "$RAIZ/changelog.d/README.md" changelog.d/README.md
git add -A
git commit -q -m base

# 1) duas branches, cada uma com o próprio fragmento (pelo comando `novo`), mesclam sem conflito.
git switch -q -c feature/aaa-um develop
node "$CLI" novo Adicionado "entrada da branch um (pedido 1)" >/dev/null
node "$CLI" novo Corrigido "correção da branch um" >/dev/null
node "$CLI" novo "Mudanças de critério de cálculo" "critério da branch um (T2.6)" >/dev/null
node "$CLI" novo "Mudanças que quebram" "quebra da branch um" >/dev/null
node "$CLI" novo "Ações do dono na base real depois da release 999" "ação do dono da branch um" >/dev/null
git add -A && git commit -q -m um
git switch -q -c feature/bbb-dois develop
node "$CLI" novo Adicionado "entrada da branch dois (pedido 2)" >/dev/null
git add -A && git commit -q -m dois
git switch -q develop
git merge -q --no-edit feature/aaa-um
git merge -q --no-edit feature/bbb-dois
verifica "dois fragmentos de branches diferentes mesclam sem conflito" $?
[ -f changelog.d/feature-aaa-um.md ] && [ -f changelog.d/feature-bbb-dois.md ]
verifica "o fragmento tem o nome da branch, com o prefixo" $?
git switch -q -c fix/aaa-um develop
node "$CLI" novo Corrigido "mesma ponta, outro prefixo" >/dev/null
[ -f changelog.d/fix-aaa-um.md ]
verifica "feature/x e fix/x não colidem no nome do fragmento" $?
git switch -q develop
rm -rf changelog.d/fix-aaa-um.md

# 2) conferir aceita; formato inválido reprova.
node "$CLI" conferir >/dev/null
verifica "conferir aceita os fragmentos válidos" $?
printf 'texto solto\n' >changelog.d/ruim.md
node "$CLI" conferir >/dev/null 2>"$TMP/err"
[ $? -eq 1 ] && grep -q 'formato inválido' "$TMP/err"
verifica "conferir reprova fragmento fora do formato" $?
printf '### Removido\n\n- x\n' >changelog.d/ruim.md
node "$CLI" conferir >/dev/null 2>"$TMP/err"
[ $? -eq 1 ] && grep -q "tipo 'Removido' inválido" "$TMP/err"
verifica "conferir reprova tipo desconhecido" $?
rm changelog.d/ruim.md

# 3) conferir-release reprova com fragmento pendente.
node "$CLI" conferir-release >/dev/null 2>&1
[ $? -eq 1 ]
verifica "conferir-release reprova com fragmento pendente" $?

# 4) juntar: as duas entradas entram em "Não publicado", os fragmentos somem, o histórico não muda.
HIST_ANTES="$(sed -n '/^## \[0\.2\.0\]/,$p' CHANGELOG.md | sha256sum)"
ENTRADAS_ANTES="$(grep -c '^- ' CHANGELOG.md)"
node "$CLI" juntar >/dev/null
verifica "juntar roda sem erro" $?
[ "$(grep -c '^- ' CHANGELOG.md)" -eq $((ENTRADAS_ANTES + 6)) ]
verifica "juntar só acrescenta: nenhuma entrada existente se perde (subseções repetidas)" $?
grep -q 'entrada da branch um (pedido 1)' CHANGELOG.md && grep -q 'entrada da branch dois (pedido 2)' CHANGELOG.md &&
  grep -q 'correção da branch um' CHANGELOG.md
verifica "juntar traz as entradas das duas branches" $?
grep -q 'critério da branch um' CHANGELOG.md && grep -q 'quebra da branch um' CHANGELOG.md && grep -q 'ação do dono da branch um' CHANGELOG.md
verifica "juntar traz critério de cálculo, quebra e ação do dono" $?
awk '/^### Mudanças de critério de cálculo/{f=1;next} /^### /{f=0} f&&/critério da branch um/{ok=1} END{exit !ok}' CHANGELOG.md
verifica "o critério entra na subseção Mudanças de critério de cálculo" $?
awk '/^### Ações do dono na base real depois da release 999/{a=NR} /^### Ações do dono na base real depois da release 105/{b=NR} /^## \[0\.2\.0\]/{c=NR} END{exit !(a && b && c && b<a && a<c)}' CHANGELOG.md
verifica "seção nova de ação do dono criada no fim da Não publicado, antes da versão fechada" $?
[ ! -f changelog.d/feature-aaa-um.md ] && [ ! -f changelog.d/feature-bbb-dois.md ] && [ -f changelog.d/README.md ]
verifica "juntar apaga os fragmentos e preserva o README" $?
[ "$(sed -n '/^## \[0\.2\.0\]/,$p' CHANGELOG.md | sha256sum)" = "$HIST_ANTES" ]
verifica "o histórico (da 0.2.0 em diante) ficou intacto" $?
[ "$(grep -c '^## \[Não publicado\]' CHANGELOG.md)" -eq 1 ]
verifica "uma só seção Não publicado" $?
node "$CLI" conferir-release >/dev/null
verifica "conferir-release passa depois do juntar" $?

# 5) juntar com versão fecha a seção e abre uma Não publicado vazia.
git add -A && git commit -q -m juntado
node "$CLI" novo Alterado "outra entrada" >/dev/null 2>&1 # em develop o `novo` recusa (branch protegida)
[ $? -ne 0 ]
verifica "novo recusa branch protegida" $?
git switch -q -c feature/ccc-tres
node "$CLI" novo Alterado "outra entrada" >/dev/null
node "$CLI" juntar 0.3.0 2026-11-20 >/dev/null
verifica "juntar com versão roda sem erro" $?
awk '/^## \[Não publicado\]/{a=NR} /^## \[0\.3\.0\] - 2026-11-20/{b=NR} /outra entrada/{c=NR} END{exit !(a && b && c && a<b && b<c)}' CHANGELOG.md
verifica "versão fechada abaixo de uma Não publicado vazia, com a entrada dentro dela" $?
node "$CLI" juntar 0.3.0 2026-11-20 >/dev/null 2>&1
[ $? -eq 1 ]
verifica "juntar recusa versão repetida" $?
node "$CLI" juntar x y >/dev/null 2>&1
[ $? -eq 1 ]
verifica "juntar recusa versão ou data mal escrita" $?

# 6) contraste: o modelo antigo (as duas branches editam o topo do CHANGELOG.md) conflita.
git checkout -q -f develop
git checkout -q -b velha-a
sed -i '0,/^### Adicionado$/s//### Adicionado\n\n- linha da velha-a/' CHANGELOG.md
git commit -q -am a
git checkout -q develop
git checkout -q -b velha-b
sed -i '0,/^### Adicionado$/s//### Adicionado\n\n- linha da velha-b/' CHANGELOG.md
git commit -q -am b
git merge -q --no-edit velha-a >/dev/null 2>&1
[ $? -ne 0 ]
verifica "contraste: duas edições do topo do CHANGELOG.md conflitam" $?

if [ "$falhas" -ne 0 ]; then echo "$falhas falha(s)"; exit 1; fi
echo "changelog.test.sh: tudo ok"
