---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-c8a-criticidade
commit: 8c77eeffeafb79837ff245d37d163c9f0dd80e51
parecer: reprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Code review: C8a do 099, `priority` do BusinessMap em `dim_card.severidade` (E3.67)

Diff lido: `git diff 3c34a63b...8c77eeff` (7 arquivos, 1 commit: `8c77eeff`), comparado com o desenho `docs/analises/099-d3b-c8a.md` (parte 2) e com a Q-099-33 (recomendação A).

## Ferramentas (citadas, não refeitas)
- Testes dos arquivos tocados, sem banco: `server` `vitest run tests/dominio-businessmap.test.ts tests/normalizador-businessmap.test.ts`: 2 arquivos, 99 testes, todos passaram.
- O `.pg` (`dominio-businessmap.pg.test.ts`) não rodou aqui: é do CI do PR. Lido.
- Cobertura de 100% e typecheck: do `pnpm run pronto` do autor e do CI.

## Conferência contra o desenho
- **De-para (fato, não inferência):** 1 Crítica, 2 Alta, 3 Média, 4 Baixa, escala decrescente, como a parte 2.2 do desenho (OpenAPI v2). O mapa vive no arquivo versionado de `docs/architecture/fontes/`, carregado pelo `bm:ref-sync`; o teste escreve o mapa à mão, sem importar do código (B-1 da ADR 0020).
- **Q-099-33 (A):** `priority` nulo ou ausente fica sem severidade e sem nota; valor fora do mapa (0, 5, 2.5, `'02'`, texto, booleano, objeto, NaN) fica sem severidade com a nota `priority_fora_do_mapa`, contada pelo laço genérico do projetor (`projetor.ts:214` e `:314`), nunca vira Baixa. O valor não vai a log nem a tabela.
- **Desconfiança do banco:** `prioridadesDeLinhas` revalida código e rótulo e descarta código ligado a duas severidades, no molde de `motivosDeLinhas`.
- **T2.6:** `versao_criterio.afeta` novo no arquivo, validado contra `METRICA_IDS`, gravado em `ref_versao_criterio_metrica` uma vez por hash, só em `dspd_core` (o `dspd_ref` já tem `INSERT` lá, `grants.ts:124`). `afeta = ['O16']` basta: o desenho pede `VISAO_GERAL` só se ela ler o O16, e a única regra que segmenta por severidade é o O16 (`packages/metricas/src/core/regras.ts:504`). O QA confere.
- **Regras invioláveis:** nada de pessoa; só BusinessMap; nenhum cálculo novo fora da biblioteca; a coluna e a allow-list já existiam (gatilho de segurança: não, como o desenho diz).
- **Histórico:** o `ref-sync` só faz `INSERT` e `UPDATE (vigente_ate)`; `dim_card` é projeção, reprojetada da staging.
- **Tamanho (M14):** 206 linhas (175 de código e teste, 31 do arquivo de fontes), acima das 150. Não pede corte: é um comportamento só (priority em severidade), e o `afeta` é a parte do T2.6 que esse mesmo comportamento exige; 98 das linhas são teste. O PR deve trazer `teto: excedido, 206 linhas, de-para + marcação T2.6 do O16 indivisíveis, metade é teste`.

## Achados
- A1 (bloqueante) docs/architecture/data-model.md:116 · Documentação afetada não atualizada (praticas.md §8, item 10: falta de doc bloqueia). A linha diz que `severidade` "fica nula no dado real até a WS1 criar os campos"; com o C8a ela vem do `priority` nativo pelo mapa `prioridade_severidade`. Escrever, no molde da linha de `data_acordada`: origem (`priority`, de-para 1 a 4 decrescente, arquivo versionado), nulo = sem severidade (Q-099-33 A), fora do mapa = nulo com a nota `priority_fora_do_mapa`, precedência sobre campo customizado ligado à coluna `severidade` quando há mapa, e que o O16 segue fora do dado real até o C8.
- A2 (bloqueante) docs/architecture/data-model.md:136 · A lista de domínios de `ref_dominio` não traz `prioridade_severidade` (mesmo motivo do A1). Acrescentar o campo com codigo = `priority` e rotulo = uma das 4 severidades.
- A3 (recomendado) server/tests/normalizador-businessmap.test.ts:339 · Falta o caso de `priority` nulo com mapa carregado e campo customizado ligado a `severidade`: hoje o nulo apaga o valor do campo customizado (`normalizador.ts:263`). O comportamento parece o pretendido (o `priority` é a fonte), mas fica sem prova; um caso a mais fixa a decisão.
- A4 (recomendado) server/src/modulos/businessmap/dominio-businessmap.ts:53 · O comentário diz "inteiro de 1 a 4", e a regex aceita de 1 a 999 (como a `regra` do arquivo diz). Alinhar o comentário: o formato aceita até 3 dígitos; o que vale é o mapa.
