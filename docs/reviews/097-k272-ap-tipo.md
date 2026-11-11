---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k272-ap-tipo-categoria
commit: 1d691f4e1a0d147f65d0041849395f2c0b593562
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: K-272, AP-TIPO e filtro tipo por categoria (097, E6.2), revalidação da volta 1

Base develop eac38a64b0b580d7c920f4b2b501287f7fb56599. Rodada anterior: reprovado em 59fd6ba9 (parecer d4f4037f, A1 bloqueante, A2 recomendado). Delta lido: `59fd6ba9..1d691f4e`, só código e teste: `server/src/modulos/apontamento/repositorio.ts` (+17), `servico.ts` (+4 -4), `server/tests/apontamento-rota.test.ts` (+32). Total do item contra a base: 129 linhas de código e teste, dentro da orientação de 150. QA aprovado de novo em `docs/qa/097-k272-ap-tipo.md` (d7702b7b), lido e não refeito.

## Execução
- `npx vitest run tests/apontamento-rota.test.ts --maxWorkers=2` (R-TETO), em `server/` no HEAD d7702b7b (código igual a 1d691f4e; o delta d7702b7b só toca o parecer do QA): 1 arquivo, 74 testes passaram.
- `docs/engineering/praticas.md` não marca regras "decidida por"; o review seguiu o checklist da skill sobre o delta.

## O que foi conferido
- **A1 resolvido:** `categoriasDeTipo` passa a receber `lerTiposDoHistorico` (pares distintos `type_id` x categoria de todo o histórico ativo), não as linhas da janela. O id da categoria (menor `type_id`) e o conjunto que um `tipo=` cobre deixam de depender da janela; o caso da sonda S1 (link com 9 numa janela só com 12) agora cobre a categoria.
- **A2 resolvido:** teste "K-272 (A1)" com janela só com 12 e histórico com 9 e 12: opção com id 9, `tipo=9` soma a hora do 12 e o banco recebe `['9','12']`; a consulta do histórico não tem `data_apontamento`. Teste "K-272 (A2)": linha "Sem tipo" única em `porTipo`, 900 s, fora das opções.
- **Sem coluna de pessoa:** a consulta nova lê só `card_id`, `parent_card_id`, `excluido_em`, `type_id` de `fato_apontamento` e `tipo` de `dim_card`; as mesmas colunas que `lerLinhas` já lê com o papel `dspd_api_apontamento`, sem GRANT novo. Nenhum `pessoa_ref`, nome nem título.
- **Fontes não se misturam:** tudo no esquema `S.bm`; nada do Acelerato. Expressão da categoria (`COALESCE(c.tipo, p.tipo)`) igual à de `lerLinhas`, então o mapa é coerente com as linhas.
- **Custo:** a consulta varre o `fato_apontamento` ativo inteiro (worklog de 12 meses na carga inicial) com dois joins por chave em `dim_card` e `DISTINCT`, uma vez por requisição. Não precisa de índice agora: o `DISTINCT` sobre todas as linhas ativas lê a tabela toda de qualquer forma, e um índice parcial só daria varredura só-de-índice, ganho marginal neste volume. Revisar com `EXPLAIN` se o histórico passar de algumas centenas de milhares de linhas ou se a rota sair do orçamento da ADR 0003.
- **Comparação entre pessoas:** nada novo; a mudança só reagrupa a dimensão tipo.

## Achados
- A3 (recomendado) server/src/modulos/apontamento/servico.ts:96 · `idDaCategoria.get(l.typeId) as string`: lerLinhas e lerTiposDoHistorico são leituras separadas; exclusão ou troca de tipo entre elas deixa o id indefinido. Sugestão: `?? l.typeId` ou mesma transação.

## Veredito
**Aprovado** em 1d691f4e1a0d147f65d0041849395f2c0b593562: A1 e A2 resolvidos, sem bloqueante. A3 é janela de corrida estreita (coleta concorrente entre duas consultas da mesma requisição), sem gatilho provado; fica como recomendação ao autor, fora deste PR se o dono preferir.
