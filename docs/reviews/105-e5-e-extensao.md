---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-e5-e-extensao
commit: 5446bd39a69aa58d9de952d5186be90bde36c372
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: E5 conta frente adicionada pela regra do T9 (105, K-376, E7.190)

Diff contra a develop (`origin/develop...5446bd39`): `fc27ecae` (código e teste) e o merge `5446bd39` (develop, sem conflito no domínio). 5 arquivos, +59/-7: `CHANGELOG.md`, `businessmap.test.ts`, `comum.ts`, `e5.ts`, `t9.ts`. Dentro do teto de 150 linhas (M14).

## O que foi conferido
- **Regra do dono (D-T9 "T9 A").** `frenteAdicionadaAposInicio` em `comum.ts:118` é a fonte única: `criado_em` da frente estritamente depois do `iniciado_em` do projeto; projeto sem início não tem frente adicionada. O T9 (`t9.ts:50`) e o E5 (`e5.ts:44`) chamam a mesma função; nenhuma métrica com regra própria.
- **T9 sem mudança de comportamento.** O T9 já sai antes quando `inicioProjeto === null`; a troca de `m.card.criado_em > inicioProjeto` pela função é equivalente. `t9.test.ts` verde.
- **E5.** Deixa de ler `adicionado_apos_inicio_pai` (coluna que a base real nunca grava), o que resolve o A2 do parecer `105-t9-real.md`. Monte Carlo segue pela biblioteca (`preverTermino`), sem mudança na previsão.
- **Regras invioláveis.** Só BusinessMap, só frentes contra projeto pai, sem pessoa, leitura pura sem tocar histórico.
- **Testes.** O teste do T9 em `businessmap.test.ts` passa a conferir o E5 no mesmo cenário (F3 criada depois do início: 1 adicionada; F2 criada antes: original). Caso novo: projeto sem início com `adicionado_apos_inicio_pai = true` na frente dá 0 adicionadas, o que prova que o campo não é lido.
- **Mutantes rodados no head:** (1) `comum.ts:121` sem a guarda `inicioProjeto !== null` (`criado_em > (inicioProjeto ?? 0)`): o caso novo falha, morto; (2) `e5.ts:44` voltando a ler `adicionado_apos_inicio_pai`: dois testes falham, morto. Restaurado depois.
- **Rodei** `src/businessmap/businessmap.test.ts` e `src/businessmap/t9.test.ts` no head `5446bd39`: 2 arquivos, 29 de 29 verdes.
- **Suíte inteira:** sem PR para a branch neste passo; fica para o CI do PR. Este parecer não afirma CI verde.
- **CHANGELOG.** Linha em `### Corrigido` com o pedido e o cartão; registra que o K-374 não foi feito e por quê.

## Achados
- A1 (recomendado) packages/metricas/src/core/criterios.ts:280 · a contagem de frentes adicionadas do E5 muda de critério e a versão do T9 tem `afeta: ['T9']`. Hoje o E5 está fora do mapa de origem real, então não há série publicada que mude; quando entrar no dado real, registrar a versão de critério com o E5 (T2.6).
- A2 (recomendado) packages/metricas/src/businessmap/businessmap.test.ts:483 · o nome do caso novo cita "a criada antes e ligada depois é original", mas o cenário só prova o projeto sem início; o "criada antes" está coberto no teste anterior (F2). Ajustar o nome numa próxima passada.

## Sem teste
Nada a justificar.
