---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-o17-motivo-e-limite
commit: a84925e3d10a0393ae8d9eed6aaf85dbf5972f1d
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: K-372 (motivo da causa raiz do O17) e K-375 (T7 sem limite no fallback) (E7.149, revalidação E7.167)

Branch `fix/105-o17-motivo-e-limite` contra `develop` (base `2c56d33b`). Primeira rodada no commit `e046134d` (reprovado, A1 a A4); esta revalidação lê só o delta até `a84925e3` (volta 1 do autor, E7.155). Sem guarda nova nem mudada no delta (só textos, comentários e a condição de render já existente), então sem mutante declarado a exigir.

## Parecer
**Aprovado.** Os quatro achados da primeira rodada foram resolvidos no delta: o documento gerado do contrato está atualizado, a nota e o Leia do cartão não prometem mais virada pelo Registro de Problemas, e os comentários de contrato seguem a decisão do dono de 16/11.

## Achados

## Achados da primeira rodada, resolvidos
Commit `e046134d`; todos resolvidos em `a84925e3`:
- A1 (bloqueante) docs/contratos/metricas/O17.md:163 · resolvido: `docs:gerar` aplicado; exemplo traz o motivo novo; `pnpm run docs:check` sai com 0.
- A2 (bloqueante) web/src/features/complementares/notas.ts:109 · resolvido: "comoSeCalcula" e "cuidados" dizem que a causa raiz não é contada por ser texto livre, sem "até" nem "ainda".
- A3 (recomendado) web/src/features/complementares/sustentacao.tsx:69 · resolvido: o Leia (só com `porCausa`, mock) ficou "A lista de causas é uma proposta do time.", texto da revisão da UX (`docs/ux/105-revisao-o17-motivo.md`).
- A4 (recomendado) packages/contratos/src/schemas.ts:1043 · resolvido, idem regras.ts:515 e o17.ts:10.

## Delta lido
`forge-check parecer delta docs/reviews/105-o17-motivo-e-limite.md`: intervalo `e046134d..a84925e3`, domínio código e testes; no domínio: `docs/api/metricas.md`, `docs/contratos/metricas/O17.md`, `e2e/tests-api/o17-sistema-qa.spec.ts`, `packages/contratos/src/schemas.ts`, `packages/metricas/src/acelerato/o17.ts`, `packages/metricas/src/core/regras.ts`, `web/src/features/complementares/notas.ts`, `web/src/features/complementares/ramos.test.tsx`, `web/src/features/complementares/sustentacao.tsx`. Fora do domínio: os pareceres do QA e da UX.

## O que conferi
- Testes que seguem o Leia: ramos.test.tsx:411 (mock, presente) e :445 (base real, ausente) e e2e o17-sistema-qa.spec.ts:75 trocados para o texto novo; o ramo negativo continua provando que, com `porCausa` nulo, o Leia não aparece. Executei `vitest run src/features/complementares/ramos.test.tsx -t O17` → 4 passed.
- `docs/api/metricas.md`: só a frase do O17 mudou (causa raiz em texto livre, K-372, ADR 0020); o resto do parágrafo é igual.
- Busca por resto do motivo antigo no código do O17: só `packages/metricas/src/core/criterios.ts:160`, registro de critério de 12/11, que é histórico (T2.6) e fica como está; as outras ocorrências de "sem dado real até" são de O8 e O26, fora deste cartão.
- `pnpm run docs:check` (rodado só para fechar o A1): "docs:check: ok (1606 páginas Markdown, 69 métricas, 2 eventos)".
- Suíte: sem PR para a branch; a suíte inteira fica para o CI do PR, e este parecer cita o `pnpm run pronto` verde declarado pelo autor na volta 1, sem rerrodar. Para registro, a run de push do head (`gh run view 43858233010`) terminou `completed success`; não substitui o CI do PR.
