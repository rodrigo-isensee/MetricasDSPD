---
pedido: 026-front-do-011-lote3
cartao: K-111 (etapa E1.2)
branch: feature/026-lote3-operacionais (head revisado 78c6fcb)
revisor: ux-designer
data: 2026-10-27
parecer: aprovado com ressalvas
---

# Revisão de UX · front do lote 3 do pedido 011 (Operacional: O19, O20, O21, O22, O24, O25, O26 e o O23 no O2)

Base: `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (fichas O19 a O26), `web/src/features/complementares/operacionais.tsx`, `notas.ts`, `CartaoComplementar.tsx`, `web/src/features/operacional/components/CartaoO2.tsx` (bloco O23), `catalogo-metricas.ts`, os "leia junto" de `packages/contratos/src/cartoes.ts` e o review `docs/reviews/026-lote3-operacionais.md`. Revisão por leitura do código; a interface não foi executada no navegador por este revisor (o parecer de QA do E1.3 é quem prova o que aparece na tela).

## Parecer: aprovado com ressalvas

Nenhum achado bloqueante. As regras transversais estão cumpridas: nenhum cartão nomeia, filtra ou ordena por pessoa (O22 e O26 guardam só instante e inteiro); percentual e percentil só com 20 itens, com "k de n" abaixo; uma distribuição de tempo por tipo, um por vez; fonte única BusinessMap; sem alerta e sem meta. Os achados abaixo são recomendados ou baixos. Quatro decisões do review (A7, A9, A10, A11) estão na seção 3.

## 1. Fidelidade à ficha

| Cartão | Texto (leitura, notas, rótulos) | Estados (carregando, vazio, < 20, erro) | Selos e "Leia junto" | Resultado |
|---|---|---|---|---|
| O19 | Leitura e nota "ainda abertos não entram" batem; "no período" no lugar de "12 semanas" (o período é filtro) | Vazio e erro vêm do molde. P50/P85 e % só com 20 bloqueios na causa, com "— amostra insuficiente" e "— menos de 20 bloqueios"; soma e contagem sempre | Selo fictício do molde. BLOQUEADOS e O5, como na ficha; "Bloqueados agora" citado no aviso | Fiel (O19-1) |
| O20 | Leitura segue a regra da frase (Backlog nunca é destaque; "Nenhuma etapa acumulou trabalho no período.") | Sem transição: "Nenhuma transição de coluna no período." Censo, sem estatística | O1 e O7 | Fiel, com desvio na linha tracejada (R1) |
| O21 | Destaque, leitura e reabertura batem | n < 20: "k de n" sem percentual. Par com × sem: aviso do grupo abaixo e AmostraInsuficiente; sem retorno e sem tipo têm aviso próprio | O13 e O5 | Fiel (A11 em 3.4) |
| O22 | Leitura e bloco "Ainda sem toque" batem; janela de 12 semanas vem da constante | < 20 tocados: "só N pedidos foram tocados" e AmostraInsuficiente, e o bloco "Ainda sem toque" continua (é retrato, não estatística) | O9 e O10 | Fiel (R3, R4) |
| O23 no O2 | Destaque exato, acima de "Itens para olhar primeiro"; "Ver os parados" só com k > 0 | < 20 em andamento: "k de n ... (percentual não publicado, menos de 20)" | O1 (par do O2) | Fiel (R6) |
| O24 | Destaque, leitura, custo "depois de ultrapassados" e nota fixa batem; nunca "dias a mais" | < 20 inícios: "k de n" sem percentual. < 20 ultrapassados: AmostraInsuficiente | O10 e T2 | Fiel (R7) |
| O25 | Destaque, leitura e nota "Descartar cedo é saudável" batem; antes × depois do início separados; aviso de preenchimento e instante aproximado presentes | < 20 encerrados: "k de n". < 20 após o início: soma e contagem, sem P50/P85. Sem divisão por motivo enquanto `porMotivo` vem nulo | O4 e O7 | Fiel (R2) |
| O26 | Selo "Conta trocas, nunca quem." no topo do gráfico; "Não existe filtro nem abertura por pessoa"; entregas sem contagem à parte | Histograma sempre; % e P85 por faixa só com 20, senão "— menos de 20" e "— amostra insuficiente" | O5 e O3 | Fiel, com desvio na leitura (A10 em 3.2) |

## 2. Achados

Severidade: bloqueante, recomendado, baixo. Nenhum bloqueante.

### Recomendado

- **R1** · `operacionais.tsx:218-231` · O20 sem a linha vertical tracejada da mudança de critério (T2.6, ficha); só a lista "⚑ data" abaixo. Quem enxerga o gráfico não vê onde o critério mudou. Pedir marca em `AreaEmpilhada` ou aceitar a lista como texto equivalente (decisão do tech-lead).
- **R2** · `operacionais.tsx:683-687` · No O25, mês com menos de 20 encerrados vem sem taxa: barra vazia e "—" na tabela, sem dizer por quê. Acrescentar abaixo do gráfico: "Meses com menos de 20 encerrados não mostram a taxa."
- **R3** · `operacionais.tsx:32` · `dias()` usa singular só com 1: sai "0,8 dias úteis" onde a ficha diz "0,8 dia útil" (pt-BR: abaixo de 2 é singular). Trocar por singular para `0 < n < 2`, só neste arquivo.

### Baixo

- **R4** · `operacionais.tsx:465` · O22 com 1 pedido tocado diz "só 1 pedidos". Usar `plural(n, 'pedido foi tocado', 'pedidos foram tocados')`.
- **R5** · `operacionais.tsx:343` · O24 sem tipo com ultrapassados não mostra nada onde ficaria o custo. Acrescentar "Nenhum pedido ultrapassado no período." (como o `o21-sem-par`).
- **R6** · `CartaoO2.tsx:234-256` · O23: a barra por etapa é `aria-hidden` e a lista abaixo não tem a cor de cada segmento, nem rótulo sobre ele (ficha: "com rótulos"). A informação está nos números, mas a barra não se liga a ela. Pôr um quadrado de cor antes de cada item da lista, ou tirar a barra. Com n = 0, esconder o bloco ou dizer "Nenhum item em andamento".
- **R7** · `operacionais.tsx:128-139` · O19: o rótulo "motivo · N bloqueios" fica à esquerda e os dias úteis vão como valor da barra; a ficha põe "64 d úteis · 12 bloqueios" à direita. A informação é a mesma e a tabela cobre. Aceito.
- **R8** · `operacionais.tsx:259` · O21: "A volta mais comum" pode apontar a reabertura (origem "Entregue"), que a ficha separa em linha própria. Sugestão: excluir as células reabertas dessa frase. Muda o que a frase afirma, então só com ciência do dono.
- **R9** · `notas.ts:231,260` · O22 e O26 trazem "Dado fictício até a coleta real" fixo no texto; o selo do molde já sai sozinho e some quando o status deixar de ser `mock`. Tirar a frase das duas notas para não ficar velha.
- **R10** · `operacionais.tsx:194` · O20: "o acúmulo está aí" é vago. Usar "o acúmulo está nessa etapa".

### A verificar no navegador (não executado aqui)

Contraste do texto sobre o nível 5 da rampa da matriz do O21 (80% da cor da série); foco visível da região rolável da matriz; contraste do selo do O26. O QA (E1.3) tem axe AA e reflow a 360 px.

## 3. Decisões sobre os recomendados do review

### 3.1 A9 · ligar O13 ou O5 ao O21

**Decisão: mantém a exceção** do O21 em `cartoes.test.ts:145`. O O21 já aparece pela seção "Onde se perde esforço?" (CA-1) e pela página Métricas (CA-15), e o próprio O21 liga a O13 e O5 (ficha). Ligar O13 ou O5 de volta mudaria a ficha e os "leia junto" de dois cartões já entregues, depois do code review e do QA, sem ganho de achabilidade (o cartão está na seção, não escondido). Se o dono preferir o link de volta, o par natural é O5 -> O21 (mesmo tema, retrabalho × eficiência de fluxo), com a exceção retirada no mesmo commit.

### 3.2 A10 · frase de leitura do O26

**Decisão: manter a leitura pela faixa mais comum, sem somar faixas na tela, com redação corrigida.** Motivos: o "x% com 2 ou mais" soma faixas na tela (painel não agrega) e o "P85 de 3 ou mais contra até 1" não sai das faixas (percentil de grupos reunidos exige os itens, não os P85 por faixa); só viria do contrato. Texto exato (troca de `operacionais.tsx:773`):

`Em ${tipo}, ${entregas} entregas; o mais comum é ${rotulo}: ${itens} ${plural(itens, 'entrega', 'entregas')}${pct}.`

onde `rotulo` é: faixa "0" = `nenhuma passagem de mão`; "1" = `1 passagem de mão`; "4+" = `4 ou mais passagens de mão`; as demais = `N passagens de mão`; e `pct` continua ` (41%)` só quando publicado. Exemplo: "Em Melhoria, 87 entregas; o mais comum é 2 passagens de mão: 36 entregas (41%)." Corrige o "4+ passagens" e a contagem sem unidade. Em caso de empate, vale a faixa de menor número (ordem do contrato). **Divergência com a ficha:** a ficha diz "41% com 2 ou mais ... P85 de 19 contra 7". Duas opções para o dono (R-DECISAO): (A, recomendada) ajustar a ficha à frase da tela, que não exige campo novo; (B) pedir ao contrato "2 ou mais" e o P85 agrupado, o que é um item novo de back. Até a resposta vale a opção A.

### 3.3 A11 · singular com 'ambos' ou nulo

**Decisão: trocar o texto, nos dois cartões** (`operacionais.tsx:34-38 e 345-347`; `taticas.tsx:463` e o mapa que o T13 usa). Fragmentos exatos, que entram depois de "Comparação não exibida em {tipo}:":

- `com`: `o grupo com retorno tem menos de 20 itens no tipo.`
- `sem`: `o grupo sem retorno tem menos de 20 itens no tipo.`
- `ambos` (e nulo): `os dois grupos, com e sem retorno, têm menos de 20 itens no tipo.`

O mapa passa a guardar a oração inteira ("o grupo com retorno tem", "os dois grupos, com e sem retorno, têm"), para não concordar à mão. Se o T13 usa palavras diferentes de "retorno" para os grupos, manter as dele e só trocar o 'ambos'. Os testes que afirmam o texto antigo mudam junto.

### 3.4 A7 · nota do O25 em `notas.ts:251`

**Decisão: dar redação neutra à nota** (a frase da tela em `operacionais.tsx:755` já está condicionada a `porMotivo` nulo ou vazio, então só a nota ficaria velha quando a integração ler o catálogo). Texto exato do campo `cuidados`:

`A divisão por motivo só aparece quando a integração lê o catálogo de motivos do BusinessMap; sem ela, o cartão mostra a taxa e o tempo consumido.`

Continua verdadeira antes e depois da integração, sem precisar de nova edição. Mantém a frase da tela como está.

## 4. Regras transversais (§3 da especificação)

- Sem pessoa nem time (item 8): O22 guarda só o instante, O26 só o inteiro e o selo; O24 "não aponta quem escolheu o que começar"; nenhum filtro ou ordem por pessoa. Cumprido.
- Ordenação neutra: O19 por dias somados (motivo, não pessoa); O21 e O26 por faixa/ordem do contrato. Cumprido.
- Mínimo de 20 e "k de n": O21, O22, O23, O24, O25 e O26 cumprem; O19 publica soma e contagem sempre. Cumprido.
- Uma granularidade por vez e um tipo por vez: seletor local (`PorTipo`) em O21, O22, O24, O25 e O26. Cumprido.
- BusinessMap e Acelerato separados: lote só de BusinessMap. Cumprido.
- Limite "mais de uma semana" do O23 = 5 dias úteis: segue a decisão U-11 (`04-decisoes.md:143`), vinda do contrato (`limiteDiasUteis`); a confirmação com o dono continua na lista da validação.

## 5. Microcopy e acessibilidade (WCAG 2.2 AA)

- Português claro, sem culpar. Avisos com ícone e texto, não só cor. Matriz do O21 com número escrito em cada célula e a reabertura com o texto "(reaberto)" além do fundo; barras mensais do O24 com padrão por série e o mês corrente com listras.
- Tabelas alternativas em O19, O26, O21 (par) e nos gráficos de barras; matriz do O21 como região rolável nomeada e com `tabIndex`. Seletores de tipo por teclado, com anúncio.
- Pendências de verificação no navegador estão na seção 2.

## 6. Veredito

Aprovado com ressalvas. O PR pode abrir depois do QA. As decisões A7, A10 (opção A) e A11 mudam texto e voltam ao `react-frontend` numa volta curta (junto com R2 a R6 e R9 se couberem); A9 não muda código. A divergência da ficha do O26 (A10) aguarda a ciência do dono.
