---
tipo: review
contrato: 1
pedido: 102-forge-0460
branch: fix/k319-lint-nao-ascii
commit: c316e6900edbf93765f49c4b594493613813d2d9
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-13
---
# Code review: K-319, lint e typecheck dos alterados com nome não ASCII e branch órfã (E1.16)

Diff lido: `git diff acf421e8...c316e690` (1 commit de código; o `4c1c0b06` é o parecer de devops, citado e não refeito): `scripts/lint-alterados.sh`, `scripts/typecheck-alterados.sh` e os dois testes deles.

## Ferramentas (citadas, não refeitas)
- Testes do diff rodados aqui, com o PATH do nvm (git e pnpm falsos, repositórios descartáveis sob `node_modules/.cache`): `lint-alterados.test.sh` 19/19, `typecheck-alterados.test.sh` 17/17, `pre-push.test.sh` 2/2, nenhum FALHOU.
- `shellcheck` 0.11.0 nos dois scripts: limpo. Nos testes, só os 4 SC2319 que já existiam (o A1 do devops); os casos novos não acrescentam nenhum.
- Mutante (cópia fora da branch, sem `-c core.quotePath=false` nas quatro chamadas): morrem 4 casos do lint (acento na raiz, acento em server, octal, não rastreado) e o 8c do typecheck. Mutante só no `ls-files` do typecheck: sobrevive, 0 FALHOU (A1).
- CI do head `4c1c0b06` (check-runs do commit, lidos na hora do review): `build`, `openapi`, `seguranca`, `imagem` e `filtro` verdes; `e2e` e `perf` pulados pelo filtro; `rapida`, `testes` e `banco` ainda em andamento. O merge depende deles verdes (`R-REVIEW`).
- Tamanho (M14): 68 linhas de código e teste (`git diff --numstat --no-renames`), dentro das 150; um comportamento só.

## Conferência
- **Faz o que o cartão pede:** as quatro listagens (`diff --name-only` e `ls-files --others` nos dois scripts) passam a `git -c core.quotePath=false`; o caminho acentuado sai cru, casa com `server/*` e chega ao eslint com o nome real. Sem o ajuste, o nome citado (`"server/..."`) caía no `*/*` do typecheck e era pulado em silêncio.
- **Branch órfã:** 3g e 8d fecham o A1 do review do K-317 (guarda "sem merge-base" sem teste do ramo de falha): a órfã cai no lint/typecheck inteiro e avisa. Devolver o script sob teste como não rastreado na órfã é necessário e está comentado.
- **Nada em /tmp:** os repositórios descartáveis vão para `node_modules/.cache/<script>-test.XXXXXX`, com `trap` de limpeza; `node_modules` está no `.gitignore`.
- **Ordem no 3f:** `açaí.ts ñovo.ts` depende do `sort -u`; `a` vem antes de `ñ` tanto em C quanto em pt_BR/en_US UTF-8, então o caso é determinístico.
- **Resto conhecido:** nome com quebra de linha continua citado pelo git; irreal em `.ts` do projeto, registrado no parecer de devops.
- **Regras invioláveis:** só ferramental de pre-push; nada de métrica, fonte nem dado de pessoa.

## Achados
- A1 (recomendado) scripts/typecheck-alterados.sh:43 · `-c core.quotePath=false` do `ls-files --others` sem caso que o mate: mutante só nessa linha passa 17/17. Sugestão: no 8c, um `.ts` acentuado não rastreado em server/ (como o 3f faz no lint).

## Sondas

## Parecer
Aprovado. A correção é mínima, simétrica nos dois scripts e provada pelos casos novos (o mutante da correção inteira morre em 5 casos). O A1 é lacuna de teste de uma linha que repete o padrão já coberto no lint; não devolve.
