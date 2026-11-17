# Revisão de interface: O27 Causa raiz dos bugs (E7.352, revalidação)

Pedido 105-melhorias-15-11 · branch feature/105-cartao-causa-raiz-bug · head c8496b13 (revalida o parecer do head 7df9332e, E7.327) · autor E7.268.
Contra: `/home/rodrigoisensee/pedidos-assistente/o27-tela-detalhe.md`, decisões D1 B, D2 A, D3 A, D4 A, D5 A e destaque de "Não é bug" A.
Arquivos lidos: `web/src/features/complementares/CartaoO27.tsx`, `LeiaJunto.tsx`, `comuns.tsx` (`LinkO15`), `o27.test.tsx` (trechos), `packages/contratos/src/cartoes.ts` e `cartoes.test.ts` (leia junto do catálogo).
Sem PR e sem execução: acessibilidade abaixo é `lido` (código), nenhum item `medido`. Não afirmo CI verde nem o resultado da suíte; o PQ do autor fica para o CI do PR. Escopo desta rodada: o rótulo dos maiores e o leia junto, lidos junto da tela; o merge com os 23 conflitos foi conferido no que toca ao cartão (o componente lido está coerente e sem marcas de conflito).

parecer: aprovado com ressalvas (nenhum achado crítico, alto ou médio; 3 baixos). O médio do parecer anterior (rótulo "3 maiores" falso com empate) está corrigido.

## Revalidação do rótulo dos maiores (lido)
`rotuloMaiores(k)` recebe `maiores.size`, o número real de linhas destacadas:
| Caso | Rótulo | Confere com a spec (D4: 3 maiores, empate incluído, sem reordenar) |
|---|---|---|
| 1 causa com n > 0 | "Maior causa" | Sim; não afirma "3" |
| 2 ou 3 destacadas | "2 maiores" / "3 maiores" | Sim; número igual ao de linhas marcadas |
| 4 ou mais (empate no 3º lugar) | "4 maiores (empate no 3º lugar)" | Sim; a contagem e a razão aparecem, o rótulo deixa de contradizer a lista |
| Nenhuma com n > 0 | sem destaque | Sim; `corte` indefinido devolve conjunto vazio |
`tresMaiores` não reordena, ignora n = 0 e inclui as empatadas no corte. O texto vem do mesmo valor que decide as linhas, então rótulo e destaque não divergem. Os testes `o27.test.tsx` cobrem empate (4 marcas com o texto longo), 3 sem empate, "Maior causa" e nenhum destaque; li os casos, não os executei.

## Conformidade com a spec (lido)
| Item da spec | Resultado |
|---|---|
| Duas colunas independentes, sem total entre elas | Atende: `grid md:grid-cols-2`, uma `section` por tipo, nenhum total somado; `semBase` tira a base do cabeçalho do cartão |
| D1 "Não é bug" como causa com n e % | Atende: entra na lista como qualquer causa |
| "Causa não informada" à parte, fora do denominador | Atende: linha própria e "Base dos percentuais: N com causa" |
| D3 abaixo de 20 com causa: só números e aviso, sem % | Atende: ramo sem `causas` mostra n, não informada, com causa e o aviso "Menos de 20 bugs com causa (x de 20 mínimos)"; sem % nem barras |
| D4 ordem do campo, 3 maiores sem reordenar, empate incluído | Atende (tabela acima) |
| Nota "bug do BusinessMap, não incidente do Acelerato; não somar com O17 nem S3" | Atende (`o27-nota`) |
| D5 leia junto do O27 aponta O15, O16 e O17 | Atende: O16 e O17 pelo `LeiaJunto id="o27"` (catálogo `o27: ['o15','o16','o17']`, O17 com "visão Sustentação, fonte Acelerato" no texto e no `aria-label`); O15 como link à parte em `Leia`/`LinkO15`. Desvio declarado (o O15 sai do LeiaJunto) aceito: o O15 é cartão do núcleo no mesmo painel, e o link some para texto simples se ele estiver oculto |
| O15 aponta para o O27 | Atende no catálogo (`o15: ['o13','o16','o27']`); o teste de leia junto cobre o link e o destino |
| Nenhuma pessoa; equipe só como filtro | Atende: nenhuma pessoa na tela |
| Marca do critério | Atende: "Critério desde <data>" quando a marca existe na série ou na janela |
| Cabeçalho do cartão sem base (desvio declarado) | Aceito: `base.n` soma os dois tipos, o que seria um total entre colunas; cada coluna mostra o n do seu tipo |
| `naoEBug` no schema (desvio declarado) | Sem efeito na tela; fica para o node-backend |

## Achados

### Baixo
1. Texto de destaque lido depois do percentual, sem relação com o rótulo (herdado do parecer anterior, não resolvido). Onde: `ListaDeCausas`, `o27-maior`. Por quê: o leitor de tela diz "9 (30%) 3 maiores" e "maiores" fica solto, sem dizer de quê. Correção: texto `sr-only` "uma das 3 maiores causas" junto do rótulo, ou o rótulo "3 maiores causas". `lido`.
2. Rótulo longo repetido em cada linha destacada no empate. Onde: `o27-maior` com "4 maiores (empate no 3º lugar)" em 4 linhas, que quebra a linha em telas estreitas (o contêiner já tem `flex-wrap`, então não corta). Por quê: ruído visual e leitura repetida. Correção opcional: manter "maiores" curto na linha e dar a explicação do empate uma única vez no cabeçalho da coluna ou numa nota. Não bloqueia.
3. "Critério desde ..." e demais textos secundários em `text-sm text-texto-2`, e o rótulo do destaque em `text-acento`: contraste de `--texto-2` e `--acento` sobre a superfície não medido (`lido`). O link `#o15` no `Leia` não usa a classe `alvo` dos links do LeiaJunto, então o alvo de toque pode ficar abaixo de 24×24px (`lido`). Correção: o QA mede o contraste com @axe; usar `alvo` no `LinkO15`.

Sem estado vazio explícito se `porTipo` vier vazio (baixo, do parecer anterior): segue em aberto e sem risco enquanto o contrato devolver sempre as duas colunas; o QA confirma.

## O que está bem (lido)
- Barras `aria-hidden` com n e % também em texto; destaque não depende só de cor (barra mais escura e rótulo em texto).
- `section` com `aria-labelledby` e `h3` por coluna.
- Mobile-first: uma coluna até `md`; espaçamento em múltiplos de 4px.
- Sem cálculo próprio na tela: lê o resultado pronto e só decide o destaque visual.
- O leia junto sai do catálogo (fonte única) e some quando o par está oculto.

## Verificações que ficam para o QA
Contraste de `--acento` e `--texto-2`; leitura do destaque no leitor de tela; caso de empate no 3º lugar em tela estreita; coluna abaixo de 20 sem %; link do O17 entre visões (Operacional para Sustentação) navegando e abrindo o cartão.
