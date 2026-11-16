---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-o17-motivo-e-limite
commit: e046134d1131028f392d415a64074d41ee4828d3
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: K-372 (motivo da causa raiz do O17) e K-375 (T7 sem limite no fallback) (E7.149)

Branch `fix/105-o17-motivo-e-limite` contra `develop` (base `2c56d33b`), commit `e046134d` (9 arquivos; código e teste: 32 linhas, abaixo do teto de 150). Um commit só, sem guarda nova nem mudada (só a constante do motivo, o `export` de `BASE_BM_VAZIA` e testes), então sem mutante declarado a exigir.

## Parecer
**Reprovado.** O texto novo do motivo está certo e os testes que ele toca foram ajustados, mas a entrega deixou dois pontos que a mudança do motivo alcança: o documento gerado do contrato ficou desatualizado (o `docs:check` falha, e ele faz parte do pronto e do CI) e a nota do próprio cartão O17 continua dizendo que a causa raiz depende de uma virada, o que contraria a decisão do dono de 16/11 ("sem data de virada").

## Achados
- A1 (bloqueante) docs/contratos/metricas/O17.md:163 · documento gerado com o motivo antigo; `pnpm run docs:check` sai com 1 ("O17.md: desatualizada"). Rode `pnpm run docs:gerar` e commite.
- A2 (bloqueante) web/src/features/complementares/notas.ts:109 · nota do O17 diz "sem dado real até o Registro de Problemas ter vínculo" (e :113 "depende do Registro de Problemas"); a decisão de 16/11 é motivo definitivo, sem virada. Alinhe as duas frases.
- A3 (recomendado) web/src/features/complementares/sustentacao.tsx:71 · o Leia "A causa raiz vem do Registro de Problemas" (só com porCausa, mock) cita fonte que a decisão descartou; rever com o A2.
- A4 (recomendado) packages/contratos/src/schemas.ts:1043 · comentário de contrato ainda diz "até o Registro de Problemas"; idem regras.ts:515 e o17.ts:12.

## Detalhe dos achados
- A1: o `docs:check` faz parte do pronto e do CI; o JSON de exemplo em `O17.md` ainda traz "aguardando o Registro de Problemas com vínculo ao incidente (a causa aparente não é a causa raiz)".
- A2: requisito pela decisão do dono (pedido, 2026-11-16 06:51): "registrada em texto livre no Acelerato, não contabilizada", "sem data de virada". No painel real (porCausa nulo) o cartão mostra o motivo novo e, na nota ao lado, a promessa de virada. Tirar "até" e "ainda" e, se houver teste das notas, ajustar o texto esperado.
- A3: testes ligados em ramos.test.tsx:411 e :445 e e2e o17-sistema-qa.spec.ts:75.

## O que conferi
- Texto: `MOTIVO_O17_CAUSA_RAIZ_SEM_DADO_REAL` = "A causa raiz do incidente é registrada em texto livre no Acelerato e por isso não é contada.", igual ao do brief; o comentário JSDoc cita K-372, a decisão de 16/11 e a ADR 0020 (o texto livre não entra na base). Nada de texto livre passa a ser lido: só a constante muda, sem coluna nem coletor.
- Testes ajustados de "causa aparente"/"Registro de Problemas" para "texto livre" em contratos (origem.test.ts:135), métricas (o17-qa.test.ts:85, complementares.test.ts:88), server (metricas.test.ts:246), web (ramos.test.tsx:431 e :439) e e2e (o17-sistema-qa.spec.ts:9 e :59). Nenhum outro texto de teste ficou com o motivo antigo como valor esperado do `motivoCausaRaiz`.
- K-375: `BASE_BM_VAZIA` já tinha `limite_frentes: null` na develop; o diff só a exporta (com JSDoc) e acrescenta dois testes: T7 no fallback com `limiteFrentes` e `acimaDoLimite` nulos, e pela API com base vazia (200, schema T7 válido, `limiteFrentes` nulo). Executei: `vitest run tests/metricas.test.ts -t 'K-375'` → 2 passed. O primeiro teste falha com `limite_frentes: 0` (o `toBeNull` da config).
- Nada mais mudou: os 9 arquivos são os do brief mais o CHANGELOG (duas linhas em "Corrigido", K-372 e K-375).
- `packages/metricas/src/core/criterios.ts:160` (registro de critério de 12/11) mantém o texto da época: é histórico (T2.6) e fica como está; a troca do motivo não muda cálculo, então não pede versão nova de critério.
- Suíte: sem PR para a branch; o CI do head (`gh run list`, run 43852650925) estava `queued` na leitura e o review não o cita como verde nem rerrodou a suíte. O `docs:check` foi rodado só para provar o A1.
