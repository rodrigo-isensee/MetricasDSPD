---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k272-teste-pg
commit: 6a285daa27889d150e36bdee95b4a7aa4ac05c16
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: K-272, teste .pg do filtro por tipo ao agrupamento por categoria (097, E6.2)

Classe T (só teste). Diff lido: `git diff 443c99cf 6a285daa`, um arquivo, `server/tests/apontamento-rota.pg.test.ts` (+17 −9).

## O que foi conferido
- **Prova o decidido ("Agrupar", P-097-7 opção a):** dois `type_id` (12 e 34) da mesma categoria (`Melhoria`, card FILHO) viram uma opção só, id `12` (menor `type_id`); `tipo=12` e `tipo=34` cobrem os dois (10800 s, 2 apontamentos); "Sem tipo" (SOLTO, `type_id` nulo) entra na soma e não é opção. Bate com `categoriasDeTipo`, `filtroPorCategoria` e `typeIdsDoFiltro` em `server/src/modulos/apontamento/servico.ts:65-88`.
- **Não afrouxa:** o caso antigo provava que o filtro separa `type_id`; o novo prova que separa categoria (card OUTRO, `Defeito`, `type_id` 56: `tipo=56` dá 900 s e 1 apontamento; `tipo=12&tipo=56` soma as duas; `tipo=999` dá 0). As asserções de ids em dígitos e de total foram mantidas; o número de asserções do caso subiu de 6 para 8.
- **Somas batem com a massa de maio:** 3600 (12) + 7200 (34) + 1800 (SOLTO, sem tipo) + 900 (56) = 13500 = `MELHORIA + 900 + 1800`.
- **Massa sem vazamento:** OUTRO (`FAIXA + 6`, livre na faixa) entra em `dim_card` e `dim_card_raiz` no `beforeAll` e sai das duas no `afterAll`; o fato dele entra em `logged` e sai pelo `DELETE` de `fato_apontamento`. O fato fica só em maio, janela que nenhum outro caso do arquivo consulta; `lerCardsIncompletos` filtra por data e OUTRO não está em `ctl_apontamento_cobertura`. Os `.pg` rodam sem paralelismo de arquivo (`server/vitest.config.ts:18`), e nenhum outro `.pg` grava `fato_apontamento` com o `type_id` 56.
- **Ferramentas:** `eslint` e `tsc --noEmit` do `server` sem saída; `vitest run tests/apontamento-rota.pg.test.ts` local deu "11 skipped" (sem PostgreSQL de teste). A prova é o CI em 6a285daa (run 43081584812): `success`, com o job `banco` em `success`.

## Achados
- A1 (recomendado) server/tests/apontamento-rota.pg.test.ts:221 · o caso confere só os ids das opções; afirmar também os rótulos (`Melhoria` e `Defeito`) amarra a opção à categoria e não só ao menor `type_id`.
- A2 (recomendado) server/tests/apontamento-rota.pg.test.ts:208 · a lista de textos proibidos no corpo não inclui o título novo `Card outro tipo`; acrescentar mantém a prova de que título de card não vaza, agora que há mais um card na massa.

## Veredito
**Aprovado** em 6a285daa27889d150e36bdee95b4a7aa4ac05c16: o teste prova o agrupamento decidido, não afrouxa a prova do filtro ponta a ponta, a massa nova entra e sai sem vazar e as somas batem; CI verde com `banco` em `success`. Sem bloqueante.
