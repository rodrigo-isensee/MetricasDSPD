---
tipo: qa
contrato: 1
pedido: 088-forge-0455
branch: forge/upgrade-0.45.5
commit: fb24b343c63c65c2bf677c98de066e5179d1aca4
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 0
data: 2026-11-10
---
# QA: 088-forge-0455 (registro do Forge 0.45.5)

## Achados
- A1 (recomendado) server/tests/ref-sync-apontamento-entrada.test.ts:53 · o teste "sem configuração" depende do .env da raiz (a entrada o lê por loadEnvFile): com .env que define PG_REF_URL cai (conexão), sem ele passa. Isolar o ambiente do teste (BUG-088-QA1, média).

## Escopo
O diff contra a develop (129fc3d5..fb24b343) é uma linha: `.forge/versao` de 0.45.2 para 0.45.5. Não há código de produção, teste, contrato nem interface alterados; não há `CA-n` novo (pedido de atualização da fábrica, sem especificação de UX). Plano antecipado: não se aplica.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Obrigação: o registro da versão não quebra o projeto (E1.4) | `pnpm run pronto` na worktree | n/a | 1 falha em 2209 testes do server, fora do diff (ver abaixo); demais pacotes verdes |

## Cenários e resultado real
`pnpm run pronto` rodado na worktree sobre fb24b343 (saída em arquivo do scratchpad).
- test:trava (suite-unica, lint-alterados, typecheck-alterados, demo-dado-real): verde (`tudo ok`).
- lint e format:check da raiz: verdes.
- tools/spec-check 14/14, tools/homolog 73/73, packages/contratos 219/219, tools/pesquisa 33/33, packages/metricas 1278/1278, packages/mock 258/258: verdes.
- server: typecheck e lint verdes; cobertura: 1 falha, 1934 passaram, 274 puladas (as puladas são as do próprio projeto, sem `skip` meu). A falha: `tests/ref-sync-apontamento-entrada.test.ts > sem configuração: só a categoria com o nome da variável`; esperado `bm:ref-sync-apontamento falhou: configuração: PG_REF_URL`, obtido `bm:ref-sync-apontamento falhou: conexão`. Reproduz isolada (5 passaram, 1 caiu), então é determinística nesta máquina e não instabilidade.
- web: o `pronto` do web não chegou a concluir, porque o `pnpm -r` abortou na falha do server. Typecheck do web passou (`tsc -b`); a cobertura do web não foi vista.

Causa: a entrada lê o `.env` da raiz com `process.loadEnvFile` (linha 18 de `server/src/entradas/ref-sync-apontamento.ts`) e o teste só limpa o ambiente do processo filho, não o arquivo. A worktree tem `.env`; pelo comportamento, ele define `PG_REF_URL` (não abri o arquivo, por regra). Num checkout sem `.env` (CI) o teste vê a variável ausente e passa. A falha não vem do diff: o arquivo alterado é só a versão do Forge e a árvore é idêntica à base fora dele. Não rodei contra a base separadamente.

Prova do CI: o `bateria` do sha fb24b343 não existe (branch sem PR; os check-runs listados são `filtro`, `build`, `openapi`, `rapida`, `imagem`, `seguranca` com sucesso e `banco`, `e2e`, `perf` pulados). A suíte inteira só se prova no CI do PR; este parecer não a declara verde.

Vermelho antes do verde e mutação: não se aplicam (nenhum teste novo nem código alterado; `forge-mutante` não se aplica, pois o diff não toca `bin/`, `hooks/` nem `.githooks/` do projeto).

## Bugs
- BUG-088-QA1 (média, node-backend): teste não hermético, descrito em A1. Não bloqueia; vira cartão no quadro (`R-QA`). Sem arquivo separado em `docs/qa/bugs/` porque o brief limitou a gravação ao parecer.

## Parecer
Aprovado para a mudança em si (uma linha de versão, sem efeito em código). Ressalvas ditas acima: `pronto` local vermelho por teste dependente do `.env`, web sem cobertura vista, e a suíte completa pendente do check `bateria` do PR.
