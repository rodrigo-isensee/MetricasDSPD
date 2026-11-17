---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-changelog-teste-fixture
commit: 8349241cb29c0cb1f36d134bc578b290c443ae44
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-17
---
# Review de segurança: 105-melhorias-15-11 (K-401, E7.482)

## Gatilhos
Script de teste que executa git e o CLI do changelog (ferramenta de pipeline do `pronto`); classe C. Sem dado pessoal, credencial, rede nem banco.

## Resumo
O diff (3 arquivos) troca a cópia do `CHANGELOG.md` real por uma fixture própria (`scripts/fixtures/changelog-teste.md`) dentro do repositório temporário. Conferido: o teste só grava em `mktemp -d` (o `cd "$R"` precede todo `git` e todo `node "$CLI"`; o CLI usa `process.cwd()` como raiz, `scripts/changelog.mjs:156`), remove o temporário no `trap EXIT`, e desarma `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_COMMON_DIR`, `GIT_PREFIX`, `GIT_OBJECT_DIRECTORY` e `GIT_ALTERNATE_OBJECT_DIRECTORIES` (`scripts/changelog.test.sh:7`). A fixture e o fragmento não têm segredo nem dado pessoal. Execução local com `GIT_DIR=/nonexist`: tudo ok e árvore de trabalho limpa antes e depois.

## Achados

## Sondas

## Detalhe dos achados
Sem achados. Suíte inteira fica para o CI do PR (sem PR nesta etapa); vale o PQ do autor (pronto rc=0), não afirmo CI verde.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramenta de varredura de segredos ausente do PATH (lacuna); revisão manual da fixture e do fragmento.
