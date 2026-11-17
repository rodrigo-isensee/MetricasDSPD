---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-barras-cor-por-serie
commit: 1a42330abb39cd5a1c5e16f297e4df99bd43399d
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: barras com cor e padrão presos à série (K-366, E7.453)

Diff lido: `d65624e7...1a42330a`, 3 arquivos, 16+/10- (`web/src/components/charts/Barras.tsx`, `web/src/components/charts/graficos-composicao.test.tsx`, fragmento em `changelog.d/`). Dentro do teto M14.

- **Faz o que o cartão pede.** Em `Barras.tsx` a cor (`corNaPosicao(i)`) e o padrão (`PADROES[i % n]`) saem do índice na lista completa `series`, e o filtro das séries sem valor vem depois; legenda, tabela alternativa e desenho continuam lendo o mesmo `cfg`. A mesma série tem a mesma cor e o mesmo padrão quando outra some.
- **Teste:** o caso "série vazia no meio" agora espera Beta em `pontos-3` e Gama em `hachura-4`. Rodei-o: 27 passam. Mutante: com o `Barras.tsx` da base (filtro antes da posição), o teste falha (1 falha, 26 passam).
- **Dependência de cor por posição filtrada:** procurei nos cartões que usam `<Barras` e nos testes (`web/src`, `e2e`) asserções de `--serie-n` ou de id de padrão; só `graficos.test.tsx` (funções `preenchimento`/`idPadrao`, sem filtro) e o próprio teste ajustado. Nenhum cartão depende da posição filtrada.
- **Efeito colateral aceito:** `semPadrao` passa a contar as séries vazias; com duas séries e uma vazia, a que sobra recebe padrão em vez de liso. É coerente com o objetivo (padrão estável por série) e não fere a A6.
- **Suíte:** sem PR para a branch; vale o PQ do autor (`pnpm run pronto` rc=0). Não afirmo CI verde.

## Achados
Nenhum.
