---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-o17-motivo-e-limite
commit: a84925e3d10a0393ae8d9eed6aaf85dbf5972f1d
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: O17 motivo definitivo da causa raiz (K-372) e fallback sem limite de frentes (K-375)

## Achados
- A1 (recomendado) web/src/features/complementares/notas.ts:113 · RESOLVIDO em a84925e3: notas.ts:109 e :113 e sustentacao.tsx:71 dizem texto livre e não contada; resta só o histórico em criterios.ts:160, que não se reescreve (T2.6).

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

## Revalidação (delta e046134d..a84925e3, escopo incremental)
- forge-check parecer delta listou só texto: docs/api/metricas.md, docs/contratos/metricas/O17.md, e2e o17-sistema-qa.spec.ts, schemas.ts, o17.ts, regras.ts (comentários), notas.ts, ramos.test.tsx, sustentacao.tsx. Nenhuma lógica mudou.
- Os testes acompanham os textos: ramos.test.tsx (linhas 411 e 445) e o e2e (linha 75) usam "A lista de causas é uma proposta do time."; grep de "Registro de Problemas" em web/, packages/*/src e e2e só acha o histórico de criterios.ts:160.
- ramos.test.tsx local: 31 passed (31).
- Mutante (texto antigo do Leia de volta em sustentacao.tsx): cai o teste O17 não diz mais frequente (1 failed, 30 passed). Morreu; revertido, árvore limpa.
- CI do push no head a84925e3 (run 43858233010): success em openapi, imagem, filtro, rapida, build, seguranca, testes, banco; perf e e2e skipped. O check bateria do PR fica para o PR.
- Parecer da UX versionado em docs/ux/105-revisao-o17-motivo.md; os achados dele (notas, Leia, O17.md, schemas, regras) foram atendidos.
- Sem bug novo; parecer segue aprovado.
