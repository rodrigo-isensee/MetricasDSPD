---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l7-sust-real
commit: 9dc0c0ef1dae57e23aad6349a86c4351fc85fca3
parecer: aprovado
revisor: tech-lead
data: 2026-11-10
---
# Code review: 077 lote 7, TENDENCIA_SUST no mapa real (K-211, E2.2)

Diff lido: `origin/feature/077-l5-fluxo-real..9dc0c0ef` (1 commit, 5 arquivos, 103 adições e 6 remoções). Comparado com `## Lote 7` de `docs/analises/077-desenho.md` e com A8, A9 e A11 de `docs/analises/077-desenho-revisao-tech-lead.md`.

## Parecer
**Aprovado.** O lote faz o que o Lote 7 pede, sem nada a mais.

- **Mapa real e simulação (A9):** `TENDENCIA_SUST` entrou em `METRICAS_ORIGEM_REAL` (`packages/contratos/src/origem.ts:35-36`) e continua em `METRICAS_SEM_SIMULACAO` (`:132`). `origem.test.ts` confere por lista de ids, sem tamanho fixo (`:36`), tira o id do teste dos que seguem mock (`:75-76`) e o T-C1 afirma o id no mapa real com `podeSimular` falso (`:180-182`).
- **Constante da virada (A8, P-077-3):** `VERSAO_CRITERIO_TENDENCIA_SUST_DADO_REAL` com `afeta: ['TENDENCIA_SUST']`, em `VERSOES_DA_BIBLIOTECA` (`packages/metricas/src/core/criterios.ts:146-153`, `:167`), no molde do Lote 5. Data 2026-11-10, a corrigir no merge (A1).
- **P-077-6 = (a):** sem início de histórico no Acelerato, nenhum mês sai com `janelaIncompleta`, mesmo com carga inicial do BusinessMap na base (`server/tests/tendencia-sust-real-l7.test.ts:65-68`). O serviço não toca no código: `dominioDe('TENDENCIA_SUST')` é `acelerato`, `bm` fica nulo e o contexto do Acelerato nunca recebe `historicoDesde` (`server/src/modulos/metricas/servico.ts:270-271`, `:312`).
- **Mínimo de 20 itens:** P2 com 19 apuráveis sai `insuficiente` com `n: 19` e P3 publica, no mesmo mês, pelo schema (`:56-63`).
- **BusinessMap e Acelerato sem mistura:** o corpo com card do BusinessMap é igual ao corpo sem ele (`:70-74`).
- **Marca da virada em `criterios`** (`:76-80`) e **nota do S2 no resultado real** (CA-8 de ponta a ponta, `:82-84`).
- **Nenhum cálculo novo (T2.5, ADR 0019):** o diff não tem fórmula; o número sai pela biblioteca, com o serviço e a biblioteca reais e só o pg dublê.
- **`qa-f6-painel.test.ts`:** a única mudança inclui o id na lista dos reais (`:98`).
- Regras invioláveis: nenhuma visão individual, nada de credencial nem dado de pessoa no diff.

## Ferramentas
- **CI do push em `9dc0c0ef`:** run 42825587263 `CI` `success` (6m49s). Lint, tipos e cobertura de ramos vêm da CI e não foram refeitos.
- **Testes dos arquivos tocados:** `server` `tests/tendencia-sust-real-l7.test.ts` e `tests/qa-f6-painel.test.ts`, 11 verdes; `packages/contratos` `src/origem.test.ts`, 17 verdes.
- **Mutações refeitas** (S1 e S2), restauradas com `git checkout HEAD -- packages server/src`; árvore limpa conferida na ponta `9dc0c0ef`.

## Teto M14
109 linhas de código e teste (`origem.test.ts` 5+5, `origem.ts` 2+0, `criterios.ts` 10+0, `qa-f6-painel.test.ts` 1+1, `tendencia-sust-real-l7.test.ts` 85+0), um comportamento só.

## Sondas
- S1 · tirar `'TENDENCIA_SUST'` de `METRICAS_ORIGEM_REAL` (`origem.ts:36`) · espera: teste reprova · obtido: 7 reprovados (5 no server: os 4 de rota que leem o corpo e o qa-f6 `:98`; 2 em `origem.test.ts`)
- S2 · tirar a constante de `VERSOES_DA_BIBLIOTECA` (`criterios.ts:167`) · espera: teste reprova · obtido: 1 reprovado (`a marca da virada aparece em criterios`)

## Achados
- A1 (recomendado) packages/metricas/src/core/criterios.ts:148 · a data 2026-11-10 (e o id que a repete) é a da entrega; o PR sai depois do merge do Lote 5. Se o dia do merge for outro, corrigir os dois (A8). A marca só aparece no mês fechado (R5).
- A2 (recomendado) server/tests/tendencia-sust-real-l7.test.ts:65 · para `TENDENCIA_SUST` o serviço nem carrega o BusinessMap (`servico.ts:270`); os testes da janela e do card valem como regressão, sem provar que o dublê do BusinessMap foi consultado.
