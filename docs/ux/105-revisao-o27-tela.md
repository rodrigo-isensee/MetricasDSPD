# Revisão de interface: O27 Causa raiz dos bugs (E7.327)

Pedido 105-melhorias-15-11 · branch feature/105-cartao-causa-raiz-bug · head 7df9332e · autor E7.268.
Contra: `/home/rodrigoisensee/pedidos-assistente/o27-tela-detalhe.md`, decisões D1 B, D3 A, D4 A, D5 A, destaque de "Não é bug" A. Arquivo lido: `web/src/features/complementares/CartaoO27.tsx`.
Sem PR e sem execução: itens de acessibilidade abaixo são `lido` (código), nenhum `medido`. Não afirmo CI verde; o PQ do autor fica para o CI do PR.

parecer: aprovado com ressalvas (nenhum achado crítico ou alto; 1 médio e 3 baixos).

## Conformidade com a spec (lido)
| Item da spec | Resultado |
|---|---|
| Duas colunas independentes, sem total entre elas | Atende: `grid md:grid-cols-2`, uma `section` por tipo, nenhum total somado |
| D1 "Não é bug" como causa com n e % | Atende: entra na lista como qualquer causa (`c.rotulo`, `n (pct)`) |
| "Causa não informada" à parte, fora do denominador | Atende: linha própria e "Base dos percentuais: N com causa" |
| D3 abaixo de 20 com causa: só números e aviso, sem % | Atende: ramo sem `causas` mostra n, não informada, com causa e aviso; sem % nem barras |
| D4 causas na ordem do campo, 3 maiores destacadas sem reordenar, empate incluído | Atende: `tresMaiores` não reordena, inclui empatadas no corte, ignora n = 0; todos-zero não quebra |
| Nota "bug do BusinessMap, não incidente do Acelerato; não somar com O17 nem S3" | Atende (`o27-nota`) |
| D5 leia junto O27 aponta O15, O16, O17 | Atende no texto; só o O15 é link (desvio declarado, aceito) |
| Nenhuma pessoa; equipe só como filtro | Atende: nenhuma pessoa na tela |
| Marca do critério | Atende: "Critério desde <data>" quando a marca existe |
| Cabeçalho sem base (desvio declarado) | Aceito: `n` soma os dois tipos no cartão; o cabeçalho de cada coluna mostra o n do tipo |

## Achados

### Médio
1. Rótulo "3 maiores" falso com empate. Onde: `ListaDeCausas`, `o27-maior`. Por quê: com empate no 3º lugar, 4 ou mais linhas mostram "3 maiores", contradizendo o texto (Nielsen: correspondência com o mundo real). A regra de empate é da spec; o rótulo fixo não a acompanha. Correção: rótulo "Entre as 3 maiores" (ou "Maior causa") e, na decisão do dono, manter o destaque por empate.

### Baixo
2. Destaque percebido só pela barra e pelo texto "3 maiores": está bem (não depende só de cor), mas o leitor de tela lê "3 maiores" depois do percentual, sem relação clara com o rótulo. Correção: colocar o texto antes do número ou em `sr-only` "uma das 3 maiores causas" junto ao rótulo. `lido`.
3. "Critério desde ..." em `text-xs` com `text-texto-2`: texto pequeno e de contraste secundário; contraste de `--texto-2` e `--acento` sobre `--superficie` não medido (`lido`; o QA mede com @axe). Correção: `text-sm`, se o contraste medido ficar abaixo de 4.5:1.
4. Sem estado vazio explícito se `porTipo` vier vazio ou `criterios` ausente; o cartão renderizaria só a nota e "Por sistema". Correção: mensagem "Sem bugs no período" e teste; risco baixo se o contrato sempre devolve as duas colunas.

## O que está bem (lido)
- Barras `aria-hidden` com n e % também em texto: sem perda de informação.
- `section` com `aria-labelledby` e `h3`: boa navegação por leitor de tela.
- Layout mobile-first (uma coluna) até `md`; espaçamento em múltiplos de 4px.
- Sem cálculo próprio na tela: lê o resultado pronto.

## Verificações que ficam para o QA
Contraste de `--acento` e `--texto-2`; leitura do destaque no leitor de tela; caso de empate no 3º lugar; coluna abaixo de 20 sem %.
