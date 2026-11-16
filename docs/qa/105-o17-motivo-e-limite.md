---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-o17-motivo-e-limite
commit: e046134d1131028f392d415a64074d41ee4828d3
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: O17 motivo definitivo da causa raiz (K-372) e fallback sem limite de frentes (K-375)

## Achados
- A1 (recomendado) web/src/features/complementares/notas.ts:113 · o texto de apoio ainda diz que a causa raiz "depende do Registro de Problemas com vínculo ao incidente" (também notas.ts:109 e sustentacao.tsx:71), contra a decisão do dono "texto livre". Alinhar em cartão.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| K-372: motivo da causa raiz do O17 diz "texto livre" e "não é contada" (contratos, metricas, server, web, e2e) | origem.test.ts, o17-qa.test.ts, complementares.test.ts, metricas.test.ts (server), ramos.test.tsx, o17-sistema-qa.spec.ts | texto exato do motivo | server passou (73/73) e contratos passou; os demais só no CI do PR |
| K-375: BASE_BM_VAZIA tem limite_frentes nulo e o T7 no fallback sai sem limite nem "acima do limite" | metricas.test.ts "K-375" (1º) | base vazia, nunca 0 | passou |
| K-375: pela API com base vazia, T7 responde 200 no schema, limite nulo | metricas.test.ts "K-375" (2º) | base vazia pela API | passou |

## Cenários e resultado real
- Ambiente: worktree desanexada em e046134d. `server/tests/metricas.test.ts`: 73 passed (73).
- Mutante 1 (limite_frentes: 0 no fallback de servico.ts): "K-375" cai com `expected +0 to be null`. Morreu.
- Mutante 2 (motivo antigo de volta em origem.ts): cai origem.test.ts (O17 ... motivo próprio) e o teste "fonte real" de metricas.test.ts. Morreu.
- Mutantes aplicados à mão e revertidos; árvore limpa.
- Vermelho antes do verde: os dois mutantes reproduzem o código anterior e derrubam os testes novos ou ajustados.
- Suíte inteira: não rodada aqui. Sem PR; o CI do push (run 43852650925) estava na fila ao parecer, então não afirmo CI verde. Vale o PQ do autor e o check `bateria` do PR.
- Sem teste de acessibilidade novo: só texto de motivo muda.
