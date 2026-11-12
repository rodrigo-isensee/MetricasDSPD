---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l3-apontamento-equipe-web
commit: 662612e73fd79008dbe71cc1bd016cd0ee945666
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---
# QA: 097 L3, Equipe no lugar de Pessoa no Apontamento (web), volta 2

**Veredito: aprovado pelo delta, com o e2e do PR 345 verde no head 662612e7.** A volta (e6d98fb8 → 662612e7) só muda o texto esperado pelo CT-08 do e2e (`e2e/tests/apontamento-qa.spec.ts:193`), de `em: pessoa, Tipo, Agrupar por.` para `em: Tipo, pessoa, Agrupar por.`. Nenhum código de produção mudou; CA-7, CA-8, CA-9, "Sem equipe", a nota junto da capacidade e o mapa diário seguem como provados nos pareceres anteriores (tabela critério → teste → resultado inalterada).

## Delta
- A nova ordem confere com a produção: em `web/src/features/apontamento/filtros.ts` o laço dos filtros de lista (Tipo) roda antes de `pessoa` (linha 83) e de `nivelMatriz` ("Agrupar por", linha 93), logo o aviso sai `Tipo, pessoa, Agrupar por`, a ordem da barra. A expectativa antiga estava errada, não o código.
- O que precisa quebrar para o teste falhar: trocar a ordem em que `lerFiltros` empurra `invalidos`, ou reintroduzir `pessoa` como filtro ativo.
- CI do PR 345 no head 662612e7 (run 43152300722): `e2e-parte (1/2)` pass (12m50s), `e2e-parte (2/2)` pass (16m17s), `e2e` (agregador) pass, `testes`, `rapida`, `build`, `filtro`, `imagem`, `openapi`, `seguranca` pass. O CT-10 (filtro Pessoa ausente; nome real fora de URL, rota e storage), pendente na volta 1, roda nesse e2e e passou.

## Bugs (fora do bloco de achados)
- Nenhum aberto. B1 da rodada 1 segue fechado.

## Achados
