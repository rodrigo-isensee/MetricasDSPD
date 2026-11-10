---
tipo: qa
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l5-fluxo-real
commit: e751242b53f2aaac546ec2cd016d126fe8ea726e
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-10
---
# QA: 077 lote 5, TENDENCIA_FLUXO no mapa real (E2.3, K-211)

Código testado: `e751242b` (diff `8e2889ba..e751242b`, 6 arquivos; o HEAD `ad6a7a71` só soma o review em `docs/reviews/`). Obrigações: `## Lote 5` de `docs/analises/077-desenho.md`, A8, A9, A11, A12 e A14 da revisão do desenho, ADR 0003 (A1, C3). Sem alteração minha em código ou teste: as reversões e mutantes abaixo foram feitos à mão na worktree e restaurados (`git status` limpo antes do commit).

## Escopo
- Dentro: `TENDENCIA_FLUXO` em `METRICAS_ORIGEM_REAL` (e fora da simulação), constante da virada do BusinessMap, guarda A14 (`sem-dado-real` sem carga inicial com sucesso), prova de rota com `historicoDesde = 2026-07-01` e `dataReferencia = 2026-12-01`, `contagemParcial` (8a) pela rota.
- Fora: tela (L3/L4), `TENDENCIA_SUST` (Lote 7), E2E e acessibilidade (sem mudança de tela; `web/` sem diff), Postgres real.
- Escopo conferido contra o diff: nada além do Lote 5; `qa-f6-painel.test.ts` só inclui o id na lista dos reais.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Junho a agosto com `janelaIncompleta` (e sem estatística) e setembro a novembro publicados, no mesmo resultado, pelo schema | `tendencia-fluxo-real-l5.test.ts` "janela incompleta e mês publicado..." | mês logo antes e logo depois da janela de 12 semanas; `historicoDesde` | passou |
| Tipo com 19 entregues `insuficiente` num mês publicado (abaixo de 20 não publica) | "tipo com 19 entregues sai insuficiente" | 19 (mínimo - 1) | passou |
| BusinessMap e Acelerato não se misturam: chamado do Acelerato não muda o corpo | "dado do Acelerato não altera o resultado" | n/a | passou (ver nota 1) |
| `contagemParcial` no mês anterior ao histórico; mês que começa no histórico sem marca (08-01 com `desde` 08-01; 07-15 marca julho) | "o mês que começa antes do histórico leva contagemParcial" | igual ao limite e logo fora | passou |
| Sem carga inicial com sucesso: `sem-dado-real` (cabeçalho e corpo); com carga o resultado segue | "sem carga inicial com sucesso responde sem-dado-real..." | carga ausente | passou |
| Marca da virada em `criterios` (id e data da constante) | "a marca da virada aparece em criterios" | n/a | passou |
| Id no mapa real e nunca simulável | `packages/contratos/src/origem.test.ts` (lista por id, T-C1), `qa-f6-painel.test.ts` | lista exata de ids | passou |
| Não publicar em `modoMock` explícito muda: guarda só fora do mock | `api.sistemico-intensivo.test.ts` (TENDENCIA_FLUXO com filtros, 146 testes) | modo mock | passou (cobertura vem da suíte, ver M4) |

Nota 1: com o código do lote revertido o teste do Acelerato continua passando (o corpo `sem-dado-real` é igual com e sem chamado); ele só prova a separação com o cálculo ligado, e a prova de que o Acelerato não é lido está no `dominioDe('TENDENCIA_FLUXO')` (`servico.ts:273`, lido por mim: `ac` é `null` para domínio `businessmap`).

## Execução
Node 24.22.1 do nvm, `TZ=UTC`, `--maxWorkers=2`, na worktree, no head `e751242b` (conteúdo igual a `ad6a7a71` fora de `docs/reviews/`).
- `server/tests/tendencia-fluxo-real-l5.test.ts`: 6 passaram.
- `server/tests/qa-f6-painel.test.ts` (junto): 6 passaram; `server/tests/api.sistemico-intensivo.test.ts`: 146 passaram.
- `packages/contratos/src/origem.test.ts`: 17 passaram.
- Suíte completa: não rodei local. Prova: check-run da CI do push em `e751242b`, run 42818122127 `success` (citado no review; não reaberto por mim).
- Observação: `tests/apontamento-entradas.test.ts` falhou na minha rodada do mutante M4 (execução de processo filho sem `node` no PATH do sandbox, sem relação com o lote); não a repeti no head limpo.

## Vermelho antes do verde
Código do lote revertido à mão à base (`git checkout 8e2889ba -- packages/contratos/src/origem.ts packages/metricas/src/core/criterios.ts server/src/modulos/metricas/servico.ts`), testes do head mantidos; restaurado com `git checkout HEAD -- server/src packages`.
- `server`: 6 falharam, 6 passaram (12). Falham: o mapa real do `qa-f6-painel`, "janela incompleta...", "19 entregues", "contagemParcial", "sem carga inicial", "marca da virada". Passou na base: "dado do Acelerato não altera o resultado" (nota 1) e os testes não ligados ao id.
- `packages/contratos` `origem.test.ts`: 2 falharam, 15 passaram ("é real exatamente para as..." e "T-C1").
- Não usei `forge-testes --vermelho` (pedido de produto, árvore da worktree; reversão à mão, como o brief pediu).

## Mutação à mão no diff (cada mutante contra os testes dos 3 arquivos)
| Mutante | Resultado |
|---|---|
| M1 remover a guarda A14 (`servico.ts:275`) | morto: "sem carga inicial..." |
| M2 `modoMock !== true` por `=== true` | morto: "sem carga inicial..." |
| M3 `historicoDesde === undefined` por `!== undefined` | morto: 5 falham no `server` |
| M4 remover só `modoMock !== true` da guarda | sobrevive nos testes do lote; morto pela suíte do `server`: `api.sistemico-intensivo` "TENDENCIA_FLUXO: filtros válidos = 200 no schema..." (modo mock deixaria de calcular) |
| M5 tirar `TENDENCIA_FLUXO` de `METRICAS_ORIGEM_REAL` | morto: 6 no `server`, 2 em `origem.test.ts` |
| M6 tirar a constante de `VERSOES_DA_BIBLIOTECA` | morto: "marca da virada" |
| M7 `afeta` da constante trocado para `TENDENCIA_SUST` | morto: "marca da virada" |
Nenhum sobrevivente injustificado. O M4 depende de teste fora do lote: ver A1.

## Latência (R3 do desenho, A1 e C3 da ADR 0003): medido, com ressalva
Método: arquivo temporário `server/tests/zz-qa-lat.test.ts` (removido; não vai ao repositório), `app.inject` na rota `GET /api/v1/metricas/TENDENCIA_FLUXO?dataReferencia=...` com o `buildApp` real e pg em dublê (mesma fixture do lote, ampliada com cards sintéticos de 4 tipos, 18.175 + 149 = 18.324 cards, transições de 4 colunas por card), carga inicial em 2026-07-01, load médio 1,5 a 2,0 na máquina (outras frentes rodando), 1 chamada fria mais 20 medidas, relógio de parede.
| Condição | Fria | p50 | p95 |
|---|---|---|---|
| 149 cards, app novo a cada chamada (monta app, lê base e calcula) | 270 ms | 71 ms | 97 ms |
| 18.324 cards, app novo a cada chamada | 435 e 648 ms | 214 e 262 ms | 301 e 301 ms |
| 18.324 cards, app único, `dataReferencia` variando (duas rodadas) | 268 e 290 ms | 6 e 7 ms | 10 e 12 ms |
Leitura: a primeira consulta sobre 18 mil cards (leitura da base e cálculo, sem Postgres) fica em 268 a 290 ms, a 3 a 11% do limite de 300 ms da A1; as seguintes ficam em 6 a 12 ms (cache da base e do resultado). O A1 pede p95 de `GET` de painel; o pior caso medido (app novo a cada chamada, que não é o uso real) bate em 301 ms. **Não medido:** o A1 contra o Postgres real com 2 anos de seed (`e2e/tests/perf-api.spec.ts` exige a pilha no ar, e a regra é não rodar nada contra a base real); o C3 em CPU time da biblioteca isolada (o teste de desempenho do pacote `mock` não cobre este lote). A margem a frio sobre 300 ms é pequena e o dublê não tem custo de rede nem de leitura de linhas: ver A2. Não é bug, não bloqueia.

## Bugs
Nenhum aberto.

## Achados
- A1 (recomendado) server/tests/tendencia-fluxo-real-l5.test.ts:98 · nenhum teste do lote cobre o modo mock explícito (M4 só cai na suíte, `api.sistemico-intensivo`); um caso com `modoMock` e sem carga, esperando 200, trava a guarda no lote.
- A2 (recomendado) server/src/modulos/metricas/servico.ts:275 · a primeira chamada com 18 mil cards mediu 268 a 290 ms (A1 = 300) sem Postgres; medir contra a base real na homologação e, se passar de 300, pré-calcular na carga (ADR 0019).
