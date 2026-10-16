# Nota da referência do hash da base mock

Referência regravada em 2026-10-16 (pedido 011, B11a), por `npm run hash-base -- --salvar ...`, conforme `docs/qa/gate-do-autor.md` (mudança intencional do hash).

| | antes (fase A) | agora (B11a) |
|---|---|---|
| hashBase | 924448d4 | 68a67741 |
| hashBusinessMap | f780e90f | 4540bc56 |
| hashAcelerato | 0113e077 | 0113e077 (intacto) |
| cards | 5788 | 5792 |
| chamados | 6062 | 6062 |

Motivo: o B11a (alvos por métrica no pós-processamento `businessmap/tambem`: O24 com `criado_em` permutado, O23 com início recuado, retornos do O21) muda só o BusinessMap. Os 4 cards a mais vêm do passo `projetos` (E9), que soma 4 projetos aprovados e não iniciados (idades 95, 140, 200 e 255 dias úteis). Decisão do tech-lead; QA aprovou.
