---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: test/099-l5-guardas
commit: 061ed3164831be6c1134fe27a03bde9c4b7ad41c
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---

# QA: pedido 099, L5 (guardas G3 e G4 da ADR 0030)

Links: ADR `docs/architecture/adr/0030-sem-simulado-na-web.md` (D6, evidência, Leituras), pedido `docs/pedidos/099-nenhuma-metrica-simulada.md`.

## Veredito
**Aprovado** sobre o HEAD 061ed316 (base develop 96d9b69f). O diff é só teste e ADR: G3 (`e2e/tests-api/sem-dado-real-099.spec.ts`), G4 (`web/src/app/painel-sem-dado-real.test.tsx`), troca do selo no `perf-api.spec.ts`, spec `simulado-070-l3.spec.ts` apagado e uma linha de leitura na ADR. Cada guarda passa limpa e cai sob a mutação pedida. Nenhum bug. Um achado recomendado.

## Critério, teste, resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| ADR 0030 D6 G3: API sem dado real, nenhum número, selo ou "Simulado" nos 5 painéis | `sem-dado-real-099.spec.ts` (5 painéis) | cartão em outro estado; mínimo de 3 cartões (painel vazio) | 5 passam; com mock no ramo `api`, falham |
| G3: Resumo sem selo nem número | teste do Resumo (2 tendências) | n/a | passa; falha na mutação |
| G3 / G1: mock e Worker não baixados com fonte `api` | teste de rede (`/assets/nucleoMock\|mock-`, evento `worker`) | download do chunk | passa; falha na mutação |
| G4: todo cartão do catálogo termina em `sem-dado-real` com motivo, sem selo | `painel-sem-dado-real.test.tsx` (4 painéis) | catálogo completo (>= 8 cartões por painel, nenhum faltando) | 4 passam; cai com cartão de dado real |
| G4: Resumo com as duas tendências sem dado real | teste do Resumo | n/a | passa |
| D7: texto "fictíci" some no L4 | `it.fails` explícito | texto fictício nas notas | passa como falha esperada (ver abaixo) |
| Spec selo trocado no `perf-api.spec.ts:181` | C6 `/tatico` e Sustentação | tarefa longa < 200 ms | 2 passam |
| Spec apagado coberto pela G3 | T-E1, T-E2, T-E3, T-E5 (selo, botão "O que é simulado?") | n/a | sem objeto sem o selo; T-E3 (Resumo) e a ausência de selo ficam na G3; T-E6 (axe) ver A1 |

## Execução (sem base real nem `.env*`)
- Vitest, `VITEST_MAX_WORKERS=2`, `pnpm --filter web exec vitest run src/app/painel-sem-dado-real.test.tsx`: `Tests 5 passed | 1 expected fail (6)`.
- G3, contra o stub sem banco `server/tests/pg/api-stub-065.ts` na porta 3199: `E2E_API_URL=http://127.0.0.1:3199 pnpm exec playwright test --project=chromium-api sem-dado-real-099`: `7 passed (11.3s)`.
- Mutação da G3 (`web/src/app/App.tsx`, ramo `api` devolvendo `new MockFonteMetricas({ latenciaMs: 0 })`, revertida com `git checkout`): `7 failed`, inclusive o teste do chunk e do Resumo. A guarda cai quando deve.
- Mutação da G4 (cópia do teste com `obter` devolvendo a fonte de teste real só para `O12`, cópia apagada): `1 failed | 4 passed`, `O12 em /operacional?cadencia=semanal: expected 'erro' to be 'sem-dado-real'`. Cai com cartão que não vem da fonte sem dado real; o estado obtido foi `erro` e não `ok`, mas a asserção é a mesma (qualquer estado fora de `sem-dado-real`).
- `perf-api.spec.ts`, `--project=perf-api -g "C6 com cartão sem dado real"`: `2 passed`; `/tatico` n=10 mediana 0 ms de tarefa longa, até o estado mediana 275 ms; Sustentação mediana 0 ms, até o estado 1051 ms (C2 informativo).
- Vermelho antes do verde: o L5 não traz código novo de produção; a G3 e a G4 guardam regra já em vigor desde o L1 e o L2b. A prova de que cada uma cai é a mutação acima (equivale ao vermelho). O ADR já registra que a G3 nasce verde na `develop`; isso é honesto e a guarda continua útil contra a volta do simulador.
- `it.fails`: está explícito e comentado (`ESPERADO A FALHAR ATÉ O L4`); quando o L4 limpar "fictíci" ele passa a falhar no CI e obriga a trocar por `it`. Não é `skip`. A suíte inteira roda no CI do PR (cite o check-run `bateria` do mesmo sha; não rodei a suíte inteira local).
- Checagem local de `ls web/dist`/chunk (G1) é leitura da ADR; conferi só que o texto da leitura bate com o código (G3 sem chunk baixado, mock só no `dist`).
- Mutantes: o pedido não toca `bin/`, `hooks/`, `.githooks/` nem `tests/catraca.py`; `forge-mutante` não se aplica.

## Achados
- A1 (recomendado) e2e/tests-api/sem-dado-real-099.spec.ts:1 · o spec apagado `simulado-070-l3` tinha T-E6 (axe em Sustentação com cartões sem selo); a G3 não roda axe nos painéis sem dado real da API. Somar uma verificação axe em Sustentação à G3 ou conferir que outro spec a cobre.
