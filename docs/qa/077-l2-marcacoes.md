---
tipo: qa
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l2-marcacoes
commit: 0d28bb1678b0880cb645188831c58e143ecfaee4
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---

# QA: 077 lote 2, a tendência herda as marcações de critério (K-211, E2.3)

Links: desenho `docs/analises/077-desenho.md` (seção "Lote 2"), especificação `docs/ux/077-tendencias.md` (CA-12), review `docs/reviews/077-l2-marcacoes.md` (aprovado em 346969b9). Diff lido: `78cf396c...0d28bb16` (3 arquivos).

## Veredito
**Aprovado** sobre o commit `0d28bb16`. Nenhum bug aberto. Lote só de back-end (biblioteca de métricas), sem interface nova: sem E2E nem acessibilidade neste lote.

## Conferência contra o desenho
- Versão com `afeta` O3 ou O4 marca `TENDENCIA_FLUXO`; S2 ou S3 marca `TENDENCIA_SUST`: confirmado em `criterios.ts` (`ORIGEM_DA_TENDENCIA`) e no teste.
- Nunca cruzado: O3 não marca `TENDENCIA_SUST` e S2 não marca `TENDENCIA_FLUXO` (duas asserções).
- Métrica fora da tabela não muda (`?? []`).
- A versão aparece em `criterios` com `id`, `data` e `descricao` (sem `afeta`), em `serie` e em `janela`.
- `docs/contratos/metricas/TENDENCIA_SUST.md` mudou só dentro das marcas de gerado e na data de revisão. `docs:check` rodado na worktree: `docs:check: ok (1045 páginas Markdown, 69 métricas, 2 eventos)`.
- Sem mudança de schema, de migração nem de `aceitas.json`; `server/` e `web/` sem diferença contra `78cf396c`.
- A versão real da virada não entra (A8): nenhuma constante nova em `VERSOES_DA_BIBLIOTECA`.

## Tabela critério, teste, resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-12 (base: `criterios` preenchido com a versão de fixture) | `core.test.ts` "a tendência herda as marcações das métricas de origem, nunca cruzado (P-077-3)", última asserção (`criteriosDe` traz `serie`) | versão que afeta só a origem, não a tendência | passou |
| Lote 2 herança fluxo (O3, O4) | mesmo teste, 2 asserções | cada origem da tabela | passou |
| Lote 2 herança sustentação (S2, S3) | mesmo teste, 2 asserções | cada origem da tabela | passou |
| Lote 2 nunca cruzado | mesmo teste, 2 asserções | BusinessMap e Acelerato separados | passou |
| Lote 2 forma da marca (`id`, `data`, `descricao`) | mesmo teste, `toEqual` | n/a | passou |

A ponta a ponta de CA-12 (marca da virada real) é dos Lotes 5 e 7, fora deste lote.

## Execução
- `packages/metricas/src/core/core.test.ts`, 2 workers: 25 de 25 verdes.
- Suíte: CI do push no head `0d28bb16`, run 42286081180: `{"conclusion":"success","headSha":"0d28bb1678b0880cb645188831c58e143ecfaee4"}`.

## Vermelho antes do verde
Cópia em `$TMPDIR/qa-engineer-077-l2/` (head com `criterios.ts` da base `78cf396c`), worktree intocada:
```
× a tendência herda as marcações das métricas de origem, nunca cruzado (P-077-3)
AssertionError: expected [] to have a length of 1 but got +0
Tests  1 failed | 24 passed (25)
```
Só o teste novo cai; os 24 existentes seguem verdes.

## Mutação à mão (o vermelho prova só a ausência do código)
Sobre o `criterios.ts` do head, na cópia:
- `TENDENCIA_SUST: ['S2', 'S3', 'O3']` (cruzamento): `Tests 1 failed | 24 passed`, o teste novo mata.
- `TENDENCIA_FLUXO: ['O3']` (O4 perdido): `Tests 1 failed | 24 passed`, o teste novo mata.
Nenhum sobrevivente.

## Achados
