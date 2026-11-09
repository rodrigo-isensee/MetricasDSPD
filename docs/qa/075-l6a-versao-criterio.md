---
tipo: qa
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l6a-versao-criterio
commit: 9e3078c17f4586afb3308108059755e2ebe6dc85
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---
# QA: 075-bloqueios-reais, lote 6a (versão de critério e corte da série do O1, K-204)

Contrato: plano `docs/analises/075-plano.md` (Lote 6a e item QA da seção 7). Review aprovado (conferido em `e284ddfb`); sem gatilho de segurança. Os commits depois de `9e3078c1` só trazem o parecer do review; nenhum teste foi criado ou mudado por este parecer.

## Achados
- A1 (recomendado) server/src/modulos/metricas/servico.ts:322 · mutante que tira a chamada de comCorteDaSerieO1 sobrevive: com o interruptor desligado a resposta é a mesma e nenhum teste passa pelo ServicoMetricas; o 6b deve provar o O1 real ligado.
- A2 (recomendado) server/tests/corte-serie-o1-075.test.ts:17 · o caso da data pendente passa a falhar quando o 6b trocar a data (2099-12-31 por real); reescrever no 6b e somar a marcação da versão no O1 e no O5 com a data dentro do período.

## Conferência do lote contra o plano
- Diff `54f02c42..9e3078c1`: 4 arquivos, 60 inserções e 1 remoção (`criterios.ts`, `parte-sem-dado.ts`, `servico.ts`, teste novo). `servico.ts` (+3 -1) é a chamada da função atrás do interruptor, que o plano exige ("ligada só com o interruptor").
- `git diff --stat` sobre `server/src/modulos/businessmap`, `packages/contratos`, `server/migrations` e `web`: vazio.
- Série do O1: função pura `comCorteDaSerieO1`; `bloqueados: null` (nunca 0) com `data < DATA_BLOQUEIO_COM_DADO_REAL`, numérico da data em diante, `hoje` e o resto intactos; só O1 e só ligado.
- Código escuro: `BLOQUEIOS_COM_DADO_REAL = false` (`packages/contratos/src/origem.ts:51`); desligado, a função devolve a mesma referência. Ligar antes da data real deixa a série inteira `null` (lacuna, falha para o lado seguro).
- Versão nova em `VERSOES_DA_BIBLIOTECA`, `afeta` `['O1','O2','O5','O19','BLOQUEADOS']`, descrição começa por "histórico parcial de bloqueios" e traz "instante da coleta".
- Data pendente num ponto só: `grep` por `2099-12-31` em `packages`, `server`, `web`, `e2e` acha só `criterios.ts:127` (a outra ocorrência, `regras.property.test.ts:830`, é dado de teste antigo de outro assunto). Id, `data` da versão e padrão do corte derivam da constante.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-7: série nula antes da data e numérica depois | "ligado: antes da data a série fica null..." | limite da data (ponto no dia da versão fica numérico) | passou |
| Plano: interruptor desligado não muda a resposta | "desligado, ou outra métrica" (mesma referência) | interruptor desligado; outra métrica | passou |
| Plano: data pendente não corta nada visível e não marca período | "com a data pendente (futura)..." | data futura | passou |
| Plano: versão na lista, `afeta` das cinco e descrição | "a versão está na lista da biblioteca..." | lista e texto | passou |
| Plano: data num ponto só | `grep` de `2099-12-31` | n/a | uma ocorrência |
| Plano: sem diff nas áreas fora do lote | `git diff --stat` | n/a | vazio |
| Prova do plano: CI do push verde | `gh run view 42421899712` | n/a | `success`, `headSha` `9e3078c1...` |

## Execução (no máximo 2 workers)
- `vitest run tests/corte-serie-o1-075.test.ts` em `server`: `Tests 4 passed (4)`.
- `packages/metricas`: `regras.test.ts`, `src/core`, `bloqueios.test.ts`, `tendencia.test.ts` (importam `criterios.ts`): `Test Files 9 passed`, `Tests 205 passed`.
- `server`: rodei os testes unitários da pasta inteira além do arquivo tocado: `Test Files 97 passed | 40 skipped`, `Tests 1901 passed | 268 skipped` (os pulados são os `.pg`, que ficam com a CI). Suíte completa do repositório e E2E não rodados (o brief limita aos arquivos tocados).

## Vermelho antes do verde (base 54f02c42, cópia em `/tmp/claude-1000/qa-engineer-075-l6a/`)
Teste de `9e3078c1` sobre a base: `Tests 3 failed | 1 passed (4)`. Os três que usam `comCorteDaSerieO1` caem com `TypeError: comCorteDaSerieO1 is not a function`. O quarto ("a versão está na lista...") passou na base, o que não esperava, pois `VERSAO_CRITERIO_BLOQUEIO_COM_DADO_REAL` é `undefined` ali (conferi por teste auxiliar na cópia); não achei a causa na cópia. Ele fica provado pela mutação abaixo (M3, M4 e M5 o derrubam no head).

## Mutação à mão sobre o head (cópia em `/tmp/claude-1000/qa-engineer-075-l6a-head/`)
| Mutante | Resultado dos 4 testes |
|---|---|
| M1: `<` vira `>=` na comparação de data | 2 falharam |
| M1b: `<` vira `<=` (ponto do dia da versão cortado) | 1 falhou |
| M2: ignorar o interruptor (`!ligado` removido) | 1 falhou |
| M2b: ignorar o id da métrica (corta qualquer métrica) | 1 falhou |
| M3: versão fora de `VERSOES_DA_BIBLIOTECA` | 1 falhou |
| M4: `afeta` sem O19 | 1 falhou |
| M5: descrição sem "histórico parcial de bloqueios" | 1 falhou |
| M6: corte devolve 0 em vez de `null` | 2 falharam |
| M7: `servico.ts` sem a chamada de `comCorteDaSerieO1` | sobreviveu (A1) |
Todos os ramos de `parte-sem-dado.ts` e `criterios.ts` morrem. M7 sobrevive porque, no estado escuro, a chamada é inobservável na resposta; vira A1 recomendado para o 6b, que liga o interruptor, e não bloqueia o lote.

## Regras invioláveis
Nenhum cálculo fora da biblioteca (o corte é publicação, como a H-24); lacuna `null`, nunca zero; versão de critério marcada pelo mecanismo existente; sem dado de pessoa, sem leitura nova, sem mistura de BusinessMap e Acelerato.

## Bugs
Nenhum aberto (críticos 0, altos 0, médios 0, baixos 0). Os dois achados são recomendados.
