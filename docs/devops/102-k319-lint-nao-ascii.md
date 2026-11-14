---
tipo: revisao-devops
contrato: 1
pedido: 102-k319-lint-nao-ascii
branch: fix/k319-lint-nao-ascii
commit: c316e6900edbf93765f49c4b594493613813d2d9
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-13
---
# Review de devops: 102-k319-lint-nao-ascii (E1.15 do pedido 102-forge-0460)

## Achados
- A1 (recomendado) scripts/lint-alterados.test.sh:56 · shellcheck SC2319 em 3 linhas (56, 88, 95) e em typecheck-alterados.test.sh:51: `$?` após `[ ... ]` negado; já existia antes e o resultado do teste está correto

## Detalhes
Aprovado. K-319 (K317-001 do QA do K-317): `lint-alterados.sh` e `typecheck-alterados.sh` listavam os arquivos com `git diff --name-only` e `git ls-files --others` sem desligar a citação em octal; um caminho com acento saía como `"a\303\247a\303\255.ts"`, não casava com `server/*` e o eslint recebia um nome que não existe. Correção: `git -c core.quotePath=false` nas quatro chamadas (duas por script). Fica sem tratamento só o nome com quebra de linha, que o git ainda cita; irreal em `.ts` do projeto.

Testes acrescentados: em `lint-alterados.test.sh`, caso 3f (arquivo acentuado na raiz e em `server/` chega inteiro ao eslint certo, sem octal, e arquivo novo não rastreado também) e 3g (branch órfã por `git switch --orphan`: cai em `pnpm run lint` com o aviso "sem merge-base", A1 do review do K-317); em `typecheck-alterados.test.sh`, 8c (acento em `server/` roda o typecheck do server) e 8d (órfã cai no typecheck inteiro). Na órfã a árvore começa vazia, então o teste devolve o script sob teste como arquivo não rastreado. Os repositórios descartáveis dos dois testes passam a ficar em `node_modules/.cache/<script>-test.XXXXXX` (nada em /tmp).

Prova de que os casos novos pegam o defeito: com os dois `.sh` da `develop` (acf421e8) e os testes novos, FALHAM 4 casos do lint (acento na raiz, acento em server, octal, arquivo novo) e o 8c do typecheck; com a correção, `lint-alterados.test.sh` 19 ok, `typecheck-alterados.test.sh` 17 ok e `pre-push.test.sh` 2 ok, nenhum FALHOU. O `typecheck-alterados.test.sh` precisa de `node` no PATH (o caso do package.json da raiz usa node); sem ele esse caso falha, por limitação do ambiente e não da mudança.

Ferramentas: `shellcheck` rodou (só o A1, anterior à mudança); `actionlint` não aplicável (sem workflow) e não está no PATH. O hook `.githooks/pre-push` não foi tocado (é do dono).

## Custo e rollback
Sem minutos de CI novos nem recurso novo (`R-CUSTO`); os testes são locais, com pnpm falso. Rollback: `git revert` do commit, sem migração.
