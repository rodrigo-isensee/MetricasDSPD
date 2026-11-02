---
tipo: review
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-aba-front
commit: d355a91c10732821d15d05b88f6d615d6ff674b2
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-02
---
# Code review: front da aba Apontamento, carimbo renovado sobre a ponta com a UX r4 (pedido 059, E2.65, K-193)

**Ponta revisada:** `d355a91` (sobre `9eb48bc`, aprovado na E2.62, somam-se só documentos: `eb6d491` UX r3, `d08d785` este parecer, `4387726` QA do front, `d355a91` UX r4).
**Veredito: aprovado.** O delta desde a ponta aprovada não toca código nem teste; o código revisado é o mesmo de `9eb48bc`. Nenhum achado novo.

## Delta lido
Saída de `forge-check delta --parecer docs/reviews/059-delta.md`: intervalo `9eb48bc..d355a91`, com `docs/ux/059-revisao-delta-r3.md` (+31) e `docs/ux/059-revisao-delta-r4.md` (+30). Pelo `git diff --stat` do mesmo intervalo, entram também `docs/qa/059-delta.md` (parecer de outro papel) e este parecer. Nenhum arquivo de `web/`, `server/`, `packages/` nem `e2e/`.
Lida a UX r4: aprovada, sem achado crítico, alto ou médio; R4-1 e R4-2 baixos, sem bloqueio. Aceita as 3 linhas do seletor em 375 px, também a 200%, condição que o parecer anterior deixava para o UX.
**Já lido (fora do delta, não relido):** todo o código e os testes da branch como revisados em `9eb48bc` (E2.62) e em `60194ef`.

## Conferência dos achados
- **A1 e A2 do QA:** seguem resolvidos (nada mudou em código desde `9eb48bc`).
- **Pendência de UX do parecer anterior (aceite das 3 linhas do seletor):** fechada pela UX r4.

## Resto
- Sem regra inviolável tocada; sem dado de pessoa novo.
- Teto M14: o PR do front passa do teto; segue com a linha `teto: excedido, <n> linhas, <motivo>` no corpo, pela decisão do dono de 2026-11-02 (um PR por branch da aba).

## Ferramentas (citadas, não refeitas)
- CI: run 41449874843 sobre `9eb48bc`, sucesso (o delta só soma documentos).
- QA: `docs/qa/059-delta.md`, aprovado em `d08d785` (pronto rc 0, test:e2e 795 verdes).
- Segurança: `docs/security/059-delta.md`, aprovado em `7509a63`, não renovado pela DECISÃO TÉCNICA de 23:35 (volta só de CSS e testes). UX: `docs/ux/059-revisao-delta-r3.md` e `docs/ux/059-revisao-delta-r4.md`, aprovadas.

## Achados
- A1 (bloqueante) e2e/tests/sustentacao-no-operacional.spec.ts:39 · achado do QA resolvido em 9eb48bc: CA-2 com cinco opções e CT-32 com até 3 linhas em 375 px, também a 200% de fonte. Sem pendência.
- A2 (bloqueante) web/src/components/ui/CartaoMetrica.tsx:313 · achado do QA resolvido em 9eb48bc: quebra de palavra longa na leitura e na frase do achado (CartaoAchados.tsx:78), com teste. Sem pendência.

## Parecer
**Aprovado.** Sem achado aberto. Condições do PR para a `develop`: linha de teto no corpo, merge depois dos PRs 194, 195 e 196 (e do PR da exceção), CI verde na ponta.
