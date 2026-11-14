---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l4a-tela-janela-fluxo
commit: 06c8dd90261efde8e5270f646805fe909a628c5d
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---
# Code review: 077 lote 4a, volta 2 (K-211, E2.2)

Revalidação incremental do parecer anterior (aprovado em 68d5e1ee). Delta lido: `06c8dd90` (`git show`), só `e2e/tests/sustentacao-no-operacional.spec.ts` (+1/-1), a correção do CA-27 que a CI do PR 261 reprovou no head 5503c792 (run 42370410024). Já lido no parecer anterior e sem mudança: todo o `web/` do lote. Os pareceres do QA (d960e48d) e da interface (f14a5829) já estão na branch; o merge da develop feito pelo dono (5503c792) não é do lote e não foi relido.

## Parecer
**Aprovado.** A correção só alinha a expectativa do E2E ao texto que a tela já mostra.

- **CA-27 contra o CA-3:** a lista `tendencia-fluxo-p85-sem-valor` escreve `{mês} · {texto}` (`SerieMensal.tsx:148-151`), e o texto do mês de poucos itens vem de `modelo.ts:233`, "Poucos itens (n=N). Estatística não publicada.", a frase do CA-3. A expectativa nova, `jun/2026 · Poucos itens (n=14). Estatística não publicada.`, é exatamente essa saída.
- **Texto antigo em `e2e/`:** `grep -rni "poucos itens" e2e/` só acha o título do teste CA-27 (linha 418, descrição, não expectativa) e a linha corrigida; nenhuma outra expectativa com o texto antigo.
- **Fora do diff, como pedido:** `git diff 5503c792 06c8dd90 -- web server packages docs/contratos` vazio; o único arquivo do delta é o spec.
- **Escopo:** um comportamento só (o mesmo do lote); nada além do que a DECISÃO TÉCNICA de 09:35 pede.

## Ferramentas
- CI no head `06c8dd90`: run 42373794626 (`pull_request`) e run 42373789038 (`push`), `CI`, `completed`, `success` (`gh run list --commit`); no PR 261, `e2e-parte (1/2)` e `(2/2)` SUCCESS, head do PR igual a `06c8dd90`.
- Ponta remota da branch: `06c8dd90` (`git ls-remote`).
- Spec E2E local: 40 verdes, relatado na entrega (histórico de 10:04) e coberto pela CI; não refeito.

## Teto M14
`git diff --numstat --no-renames origin/develop...06c8dd90`: `web/` 133+17 = 150 (o mesmo do parecer anterior) e `e2e/` 1+1 = 2. As 2 linhas de `e2e/` passam do teto pela exceção da DECISÃO TÉCNICA de 2026-11-07 09:35 do pedido, aceita neste review. O corpo do PR 261 ainda diz "teto: 150 linhas ... dentro do limite" e não traz a linha da exceção (A3).

## Achados
- A1 (recomendado) web/src/features/operacional/resumo/modelo.ts:308 · segue do parecer anterior: a frase da SLA na sustentação fica sem ponto final; alinhar o texto do ponto de SLA no Lote 4b.
- A2 (recomendado) web/src/features/operacional/resumo/SerieMensal.tsx:59 · segue do parecer anterior: a sustentação deve passar o texto próprio de `vazioJanela` no Lote 4b.
- A3 (recomendado) PR#261:1 · corpo do PR 261, seção Teto: falta a linha "teto: 150 em web + 2 em e2e (DECISÃO TÉCNICA de 09:35)"; é pré-condição do merge (E2.4), não da entrega do autor (M14).
