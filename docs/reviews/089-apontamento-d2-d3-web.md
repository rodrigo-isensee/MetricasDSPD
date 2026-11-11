---
tipo: review
contrato: 1
pedido: 089-apontamento-qualidade-d2-d3
branch: feature/089-apontamento-d2-d3-web
commit: dafb325a214bdb6bd7a9dc287e02faf846b11ea2
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-10
---
# Review: 089-apontamento-qualidade-d2-d3 (front-end)

Escopo: diff `129fc3d5..dafb325a` (entrega 7a9b5055 mais a volta da revisão de UX), contra as seções 4.2 e 6 do plano e o parecer `docs/ux/089-revisao-apontamento.md`.

## Achados

- A1 (recomendado) web/src/features/apontamento/components/CartoesQualidade.tsx:47 · B-4 do parecer de UX (foco e anúncio do filtro ao acionar o atalho) ficou fora, como combinado; abrir cartão de melhoria, sem bloquear.

## Sondas

## Parecer

**Aprovado.** Sem bloqueante.

- Plano 4.2: o rótulo "Sem comentário" está no subgrupo, no achado, no atalho e nas fixtures (unit e E2E); a nota de execução técnica lê `distribuicao.porSubgrupo`, sem cálculo no front, e some quando o servidor não envia o subgrupo. Piso de 20 apontamentos respeitado (`contagem` mostra "percentual com 20 apontamentos ou mais" quando `participacao` não é `ok`).
- Parecer de UX: M-1 (explicação visível no cartão de subgrupo, `data-testid="explicacao-sem-comentario"`), M-2 (achado redigido com "e sem regra por tipo de card"), M-3 (texto do atalho em `textos.ts`, "Ver apontamentos do subgrupo Sem comentário"), B-1 (singular e "% das horas apontadas"), B-2 (título curto, contagem em parágrafo), B-3 (texto sem jargão solto) e B-5 (token `border-borda-controle`, `text-texto-2`) aplicados. `docs/ux/059-aba-apontamento-textos.md` atualizado na mesma entrega.
- Nada de texto fixo fora de `textos.ts`; sem resíduo das frases antigas (grep em `web/src`, `e2e`). Sem avaliação individual, meta ou comparação.
- Testes: cada ramo novo tem teste de comportamento (singular com 1, explicação à vista, nota ausente, atalho com o nome novo). Rodei `vitest run src/features/apontamento` (arquivos tocados): 11 arquivos, 168 testes, todos verdes. Suíte inteira e E2E ficam no CI.
- Tamanho: 179 inserções e 32 remoções em 10 arquivos, a maior parte em teste, fixture e texto; um comportamento só (rótulo e nota).
