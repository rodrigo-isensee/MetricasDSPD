---
tipo: review
contrato: 1
pedido: 102-forge-0460
branch: fix/k322-pre-push-nomes
commit: 95a65933fbee98afd00fba20b797934f01bb61bd
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-14
---
# Code review: K-322, pre-push resistente a nomes com traço, quebra de linha, aspas e barra (E1.25)

Diff lido: `git diff 7cb86b26...95a65933` (1 commit de código; o `59265fb7` é o parecer de devops, citado e não refeito): `scripts/lint-alterados.sh`, `scripts/typecheck-alterados.sh` e os dois testes deles.

## Ferramentas (citadas, não refeitas)
- Testes do diff rodados aqui, com o PATH do nvm (pnpm falso, repositórios descartáveis sob `node_modules/.cache`): `lint-alterados.test.sh` 24/24, `typecheck-alterados.test.sh` 19/19, `pre-push.test.sh` 2/2, nenhum FALHOU.
- `shellcheck` nos dois scripts: limpo. Nos testes, só os 4 SC2319 do padrão `verifica` que já existiam (linhas fora do diff); os casos novos não acrescentam nenhum.
- Mutantes rodados aqui (scripts restaurados depois): listagem antiga sem `-z` no lint, mantendo o `--`: morrem os 3 casos de quebra de linha, aspas e barra invertida; `--` removido do eslint da raiz: morrem 3 casos (inclusive o do traço); listagem antiga no typecheck: morre o 8f. Os demais mutantes (cada `-z`, o `--` do server, o `unset`) estão no parecer de devops, todos mortos.
- CI do head `59265fb7` (check-runs do commit): concluídos e verdes, ver `## Detalhes`.
- Tamanho (M14): 76 linhas de código e teste (`git diff --numstat --no-renames`), dentro das 150; um comportamento só.

## Conferência
- **Faz o que o cartão pede (A1, A2 e A3 da segurança do K-319, A1 do QA do K-319):** `--` antes da lista nas duas chamadas do eslint; `git diff -z`, `git ls-files -z`, `sort -zu` e `read -r -d ''` nos dois scripts; `unset GIT_DIR GIT_INDEX_FILE GIT_WORK_TREE` no topo dos dois testes, antes de qualquer git (igual ao `pre-push.test.sh`); caso 8e mata o mutante do `ls-files` que sobrevivia no K-319.
- **`core.quotePath` removido:** com `-z` o git não cita nem escapa o caminho, então o `-c core.quotePath=false` ficou redundante e sair é correto; os casos acentuados do K-319 (3f, 8c, 8e) seguem verdes.
- **Casos de quebra, aspas e barra:** reprovam pelo comportamento (o eslint falso lê o arquivo com a marca `ERRO_LINT`), não pelo texto da fonte; o do traço confere a ordem dos argumentos no log, que é o próprio comportamento corrigido.
- **Escopo:** o item `DENTRO_DE_SUITE` do E1.24 é condicional ao forge0442 na develop; o PR 407 ainda não entrou, então ficar fora está certo.
- **Regras invioláveis:** só ferramental de pre-push; nada de métrica, fonte nem dado de pessoa.

## Achados

## Sondas

## Detalhes
CI do head `59265fb7` (check-runs lidos em 2026-11-14, todos concluídos): `rapida`, `testes`, `banco`, `build`, `openapi`, `seguranca`, `imagem` e `filtro` com `success`; `e2e`, `e2e-parte` e `perf` pulados pelo filtro (só scripts e docs). Nenhum vermelho nem pendente.

## Parecer
Aprovado. Correção mínima e simétrica nos dois scripts, cada mudança com caso que a mata.
