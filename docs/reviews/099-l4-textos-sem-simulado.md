---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-l4-textos-sem-simulado
commit: 1525bed8cb23d14bd18175a05697695780ff489a
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: L4 do pedido 099, textos do catálogo e das 8 notas sem "simulado" (E2.12, K-275)

## Achados
- A1 (recomendado) e2e/tests/complementares.spec.ts:132 · O17 aceita /Real|Sem dado real/, que passa com qualquer estado; O17 está em MOTIVO_ORIGEM_MOCK, então a linha deveria exigir "Sem dado real" e provar o caminho do ternário que O5 e O3 não provam no e2e.
- A2 (recomendado) docs/qa/metricas-complementares.md:27 · a descrição do COMP-12 ainda diz que a coluna mostra "Fictícios"; fora da lista de arquivos desta entrega, fica para o QA atualizar no L5.
- A3 (recomendado) packages/contratos/src/origem.ts:3 · o comentário do contrato ainda chama `mock` de "dado fictício" e de fonte do selo "Dados fictícios" (removido no L2c); fora do diff, fica para o L5 ou o dono do contrato.

## Sondas

## Parecer
Aprovado sobre 1525bed8 (base develop 96d9b69f). Diff: 8 arquivos em `web/src` e `e2e/tests`, +93 -29, 122 linhas pelo `git diff --numstat --no-renames`, dentro da orientação de 150; um comportamento só (os textos da web deixam de falar em simulado).

- **Faz o que a spec pede, nem mais nem menos:** conferi o diff contra `docs/ux/099-textos-sem-simulado.md`. As 8 notas (OP-21, TA-16, TA-17, TA-18a, TA-18b, ES-11, ES-12a, ES-12b) ficam com o texto novo palavra por palavra; o parágrafo de abertura e a legenda do catálogo são os da spec; o comentário "Decisão 20" sai de `linhas.ts`. Nenhuma lógica de cálculo nova.
- **Coluna Dados lida do mapa de origem:** `linhas.ts:44` deriva de `origemDaMetrica(m.id)` (fonte única em `packages/contratos/src/origem.ts`), com dois estados no tipo (`'Real' | 'Sem dado real'`), sem terceiro estado inventado. A pergunta 1 da spec (métrica com cartões em níveis diferentes) não se aplica: a espera invisível tem um id por nível (`EI_FL1`, `EI_FL2`, `EI_FL3`, `EI_SUST`, `catalogo-metricas.ts:313-346`), e cada linha lê o próprio id. Não há regra de negócio decidida por inferência.
- **Testes provam:** `catalogo.test.tsx` conta as células "Real" contra `CATALOGO` filtrado pelo mesmo `origemDaMetrica` e as "Sem dado real" pelo complemento de 65, o que derruba o teste se o ternário inverter ou se a coluna voltar a valor fixo; o teste de ausência (`fictíci|simulad|exemplo` na tabela) mira texto que existia na base e fica restrito à tabela (o parágrafo, que diz "número de exemplo", fica fora dela). `notas-sem-simulado.test.ts` exige os 8 textos exatos e varre as notas dos quatro painéis por `fict|mock|simulad`. O QA mostrou vermelho antes do verde (4 testes caem com a produção da develop).
- **Spec e2e ajustado faz sentido:** COMP-12 troca "Fictícios" por soma Real + Sem dado real = 65 e exige zero "Fictícios" e zero "Da coleta"; O5 e O3 exigem "Real" (o `toContainText('Real')` é sensível a maiúscula, então "Sem dado real" não satisfaz). Única fraqueza é a linha do O17 (A1). O QA rodou o spec no Playwright local: 30 passaram.
- **Regras invioláveis e segurança:** só texto e derivação de rótulo; sem pessoa, credencial, banco, dependência nova nem gatilho de `R-SEGURANCA`. BusinessMap e Acelerato não se misturam (a coluna Fonte não mudou). Nada rodou contra a base real nem `.env*`.
- **Execução:** `VITEST_MAX_WORKERS=2 npx vitest run src/features/catalogo src/features/complementares/notas-sem-simulado.test.ts` em `web/` da worktree (head d726d921 = 1525bed8 mais o parecer do QA): 3 arquivos, 9 testes, 9 passaram.
- **CI:** o run do push de 1525bed8 (43153127807) foi cancelado pelo push seguinte; o run 43153572346 (d726d921, mesmo código) estava em andamento na hora deste parecer. O verde dele é condição do PR por lote (E2.14), não deste parecer.
- **Commits:** dois commits, `fix(web): ...` e `test(web): ...`, Conventional Commits em português, com `Cartão: K-275`. O segundo corrige o tipo do teste do primeiro; no squash do PR viram um só.
