---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k272-ap-tipo-categoria
commit: 59fd6ba9b36e029eb47750f04ff08a0232a119d1
parecer: reprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: K-272, AP-TIPO e filtro tipo por categoria (097, E6.2)

Intervalo: `eac38a64..59fd6ba9` (base develop eac38a64b0b580d7c920f4b2b501287f7fb56599). Arquivos: `server/src/modulos/apontamento/servico.ts` (+44 -8) e `server/tests/apontamento-rota.test.ts` (+25 -1); 78 linhas, dentro da orientação de 150. QA aprovado em `docs/qa/097-k272-ap-tipo.md` (ac47260b), lido e não refeito.

## Execução
- `npx vitest run tests/apontamento-rota.test.ts --maxWorkers=2` (R-TETO), em `server/` no HEAD ac47260b (código igual a 59fd6ba9): 1 arquivo, 72 testes passaram.
- Sonda S1 abaixo, por `npx tsx` sobre as funções exportadas, sem tocar a árvore.
- `docs/engineering/praticas.md` não marca regras "decidida por"; o review seguiu o checklist da skill sobre o diff.

## O que foi conferido
- **Fontes não se misturam:** a categoria vem de `COALESCE(c.tipo, p.tipo)` e o `type_id` de `fato_apontamento`, ambos no esquema `S.bm`; nada do Acelerato entra. Atende.
- **Comparação entre pessoas:** a mudança só reagrupa a dimensão tipo; não cria ranking, meta nem visão por pessoa. Atende.
- **"Sem tipo" fora das opções:** linha com `type_id` nulo ou categoria nula vai para `sem-tipo`, soma e não vira opção; o teste da moldura foi ajustado e a mudança está declarada no corpo do commit. Atende.
- **Agrupamento e filtro no banco:** `lerCardsIncompletos` usa só linhas do período, que está contido na janela de `lerLinhas` (menor/maior entre período e diário), então `typeIdsDoFiltro` conhece todos os `type_id` que a consulta pode achar. Atende.
- **Estabilidade do id (menor `type_id`):** não atende, ver A1. O mapa de categorias é montado das linhas lidas na janela (`categoriasDeTipo(brutas)`, linha 135), não do histórico. Com um `type_id` novo e maior entrando na categoria, o id não muda só enquanto o menor também aparecer na janela; quando a janela não tem o menor, a opção passa a ter outro id, e um link ou seleção guardada com o id antigo deixa de cobrir a categoria.

## Sondas
- S1 · janela A com type_id 9 e 12 da mesma categoria, janela B só com 12; `filtroPorCategoria(['9'], B)` · espera: tipo=9 cobre o 12 em B · obtido: id da opção 9 em A e 12 em B; filtro e banco `['9']` em B, sem hora da categoria

## Achados
- A1 (bloqueante) server/src/modulos/apontamento/servico.ts:135 · id da categoria depende da janela: tipo=9 (id dado numa janela com 9 e 12) zera a categoria numa janela só com 12 (S1), contra P-097-7. Sugestão: mapa tipo->type_id do histórico.
- A2 (recomendado) server/tests/apontamento-rota.test.ts:175 · falta teste do link guardado com o menor type_id numa janela onde ele não aparece (o caso de A1), e da linha "Sem tipo" em porTipo, como o QA observou.

## Veredito
**Reprovado** por A1: defeito provado contra a decisão do dono e contra o critério do brief (link guardado continua valendo). Correção de lógica volta ao autor (node-backend); a forma de ler o mapa do histórico (consulta própria em `dim_card`/`fato_apontamento`, sem filtro de data) é dele, com o teste de A2.
