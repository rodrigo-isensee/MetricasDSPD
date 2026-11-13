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

## Regravação de 2026-11-12 (pedido 099, D3, volta 3)

| | antes | agora |
|---|---|---|
| hashBase | 68a67741 | de6a8953 |
| hashBusinessMap | 4540bc56 | 4540bc56 (intacto) |
| hashAcelerato | 0113e077 | 20541e9d |

Motivo: o D3 (Q-099-11) acrescenta a unidade de cada prazo (`unidade_primeiro_atendimento`, `unidade_restauracao`) a `AlvoPrioridade`; o gerador do Acelerato copia `ALVOS_PADRAO` em `config.alvos`, então a config do mock ganha os dois campos. Chamados e BusinessMap não mudam (cards 5792 e chamados 6062 iguais). Consequência legítima do D3.

Hashes da escala 0,2 (só nos testes do mock, fora da linha de base): base 824092e4 para 345c5682; `ac` 39b4b005 para 34151797. Mesmo motivo (unidade dos prazos em `config.alvos`).

## Regravação de 2026-11-13 (pedido 099, D3b, E3.100)

| | antes | agora |
|---|---|---|
| hashBase | de6a8953 | dd6787b1 |
| hashBusinessMap | 4540bc56 | 4540bc56 (intacto) |
| hashAcelerato | 20541e9d | b047a163 |

Motivo: o D3b (Decisão 13) passa o dia útil da Sustentação a 528 min (08:00-12:00 e 13:00-17:48) e os alvos em dias a dias x 8,8 h; o mock do Acelerato mede pelo calendário novo. BusinessMap, cards (5792) e chamados (6062) não mudam. Regravada por `npm run hash-base -- --salvar` (e2e), como no D3 do PR 364. Consequência legítima do D3b (achado A1 do QA).
