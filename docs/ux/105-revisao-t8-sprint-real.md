# Revisão de UX do cartão T8 com dado real (E7.531, head 453348a2)

parecer: aprovado com ressalvas (nenhum crítico ou alto; 1 médio e 3 baixos)

Escopo: `web/src/features/complementares/previsao.tsx` (`CartaoT8`, `notaForaDaContaT8`). Leitura só pelo código; nenhum item foi medido. Sem PR: não afirmo CI verde.

## Achados

### Médio
- **M1 Frase de menos de 20 sprints convive com gráfico e tabela por sprint** (lido, previsao.tsx:149-162 e 164-204). Com `sprintsNoRecorte < 20` a leitura diz "não se publica estatística", mas o corpo ainda desenha as barras e a tabela com `textoTaxa` por sprint. Se o back-end devolver o percentual por sprint nesse caso, a tela contradiz a própria frase. Correção: confirmar com o back-end que abaixo de 20 os percentuais vêm `insuficiente` e a tabela mostra só contagens; se vierem valores, não renderizar as barras e exibir só a frase. Pedir teste cobrindo esse estado.

### Baixo
- **B1 Legenda da tabela mistura a regra** (lido, linha 183). "abaixo de 20 itens só k de n" é a regra do dado fictício (itens); no dado real a regra conta sprints (linha 147). Correção: "abaixo de 20 sprints no recorte nada é publicado".
- **B2 A frase não diz o que fazer** (lido, linha 158). Sugestão: "Só 12 sprints no recorte: abaixo de 20 não se publica estatística. Amplie o período para ver a taxa." (ajuste só se o filtro de período existir nesse cartão).
- **B3 Nota "Fora da conta" com peso visual baixo** (lido, `Leia` = text-sm text-texto-2; contraste do token não medido). Aceitável por ser nota; não depende só de cor. Se a contagem for alta, avaliar destaque. Termo "execução" na nota é claro; mantenha.

## Pontos conferidos e bons
- Plural correto (1 sprint / 2 sprints) e a nota some sem contagem ou com soma zero (não polui o dado fictício).
- A nota aparece também no estado vazio (`complementoVazio`), com prefixo "Fora da conta:" legível; no corpo, "Ficaram fora desta conta:".
- Sem alvo de 100%, leitura junto da entrada não planejada, "sem comparar times": respeita as regras invioláveis (sem ranking individual).
- Barras com séries distintas por padrão (liso/hachura), não só por cor; tabela de dados como alternativa textual (WCAG 1.4.1, lido).

## Verificações de heurística
Visibilidade do status (nota e frase explicam por que não há número) atendida; prevenção de erro de leitura atendida, exceto M1.
