---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-o26-motivo-data
commit: 97d972c2fc1bc993844b91488a014e093c4ff62f
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: O26 sem dado real com motivo próprio e a data (pedido 105, E7.57)

Diff conferido: `ffc59d8a..97d972c2`, 1 commit, 4 arquivos (`origem.ts`, `origem.test.ts` de contratos, `origem.test.tsx` do web, CHANGELOG). Depois do 97d972c2 a branch só ganhou o parecer do review (c2b90094, 5a094278), sem código. Obrigação: decisão 2 do dono de 16/11 ("A, mostra a partir de qual data ele vai ter dado real e o motivo"); histórico de responsáveis desde 2026-11-09, 12 semanas = 2027-02-01 (conta conferida: 09/11 + 84 dias = 01/02/2027). Sem especificação de UX nova com CA-n: o texto é da revisão E7.58.

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| D2-1: O26 segue sem dado real (não entra no mapa real) | contratos `origem.test.ts` (O26 `sem-dado`; lista exata dos reais); mutante M4 | O26 fora de `METRICAS_ORIGEM_REAL`; sem número inventado | passou |
| D2-2: motivo próprio, não o genérico | `origem.test.ts` (`motivoDaOrigemSemDado`, `corpoSemDadoReal`); web `origem.test.tsx` (`origemDoCartao('O26','api')`); mutante M2 | volta ao genérico "fonte real ainda não definida" | passou |
| D2-3: diz a partir de que data tem dado real (01/02/2027) | `origem.test.ts` (frase inteira literal); mutante M1 | data errada (ex.: 08/02) | passou |
| D2-4: diz desde quando a base guarda o histórico (09/11/2026) | idem; mutante M3 | início errado (10/11) | passou |
| Os demais sem motivo próprio seguem sem (T1, E1, Visão geral) | `origem.test.ts` | O26 saiu da lista de ausência, os três ficam | passou |
| O cartão do O26 aparece sem pessoa, ranking ou comparação | e2e `operacional-lote3.spec.ts` L3-02, L3-01 (axe AA a 1280 e 375), `complementares.spec.ts` (O26 no painel e no Leia junto) | sem ranking, sem coluna de pessoa; sem violação crítica ou séria | passou |
| O26 não mistura com outro cartão na origem | leitura de `cartoes.ts:208` (cartão do O26 tem só a métrica O26) e `origemDoCartao` | motivo do cartão não vem de outra métrica | passou |

## Cenários e resultado real
Local, no sha 97d972c2 (worktree limpa, sem tocar o código):
- `packages/contratos`: `vitest run src/origem.test.ts`: 26 de 26.
- `web`: `vitest run src/features/coleta/origem.test.tsx`: 18 de 18.
- e2e, projeto chromium, `operacional-lote3.spec.ts` e `complementares.spec.ts` (os que mostram o cartão do O26): 40 passed (1.6m).
- CI: run 43830480047 (PR 480) e 43830333247 (push), sha 97d972c2fc1bc993844b91488a014e093c4ff62f, success (testes, rapida, e2e, banco, seguranca, build, openapi, imagem); citado, não rerrodado.

Vermelho antes do verde (teste novo de regra): `origem.ts` da base ffc59d8a com o `origem.test.ts` do head, em cópia descartável:
```
FAIL  src/origem.test.ts > origemDaMetrica (H-13) > O26 segue sem dado real, com motivo próprio que diz a data (pedido 105, E7.55)
AssertionError: expected null to be undefined
Tests  1 failed | 25 passed (26)
```
O `forge-testes --vermelho` não existe neste projeto; a forma é a do projeto, o teste contra o código anterior. Com o código do head, 26 de 26.

Mutação à mão no diff (cópia descartável, `packages/contratos/src/origem.ts`, uma por vez, restaurado a cada uma; o teste do web usa a mesma constante, então a prova é no contratos):
- M1 `O26_DATA_DADO_REAL` de 01/02/2027 para 08/02/2027: morreu (1 falha, teste do O26).
- M2 remover `O26: MOTIVO_O26_HISTORICO_RESPONSAVEIS` de `MOTIVO_ORIGEM_MOCK` (volta ao genérico): morreu (1 falha).
- M3 `O26_INICIO_HISTORICO_RESPONSAVEIS` de 09/11/2026 para 10/11/2026: morreu (1 falha).
- M4 O26 em `METRICAS_ORIGEM_REAL`: morreu (2 falhas: lista exata dos reais e teste do O26).
- Sobreviventes: nenhum.

Limites desta passada: o texto do motivo na tela com a API real (`VITE_FONTE=api`) não tem e2e; o e2e de integração real exige banco e API no ar, fora deste ambiente. O que protege o texto é o teste de unidade da frase inteira e o `origemDoCartao` do web; o componente que o exibe (`CartaoMetrica`) é o mesmo dos outros motivos (O14, S11) já cobertos. Contraste e leitor de tela do texto novo ficam com a revisão de UX (E7.58); axe AA do cartão passou no e2e. Risco já citado pelo review e aceito: a data é fixa e vence em 01/02/2027 se o O26 não entrar no mapa real (pedido próprio).
