# 099 - Textos do O12 pelo prazo do card (lote C2c, E3.26)

Para o react-frontend aplicar no lote C2b. Base: `docs/analises/099-o12-deadline.md` §3 e §4; decisões do dono Q-099-4 = A (parte sem fonte sai nula com o motivo, nunca 0) e Q-099-23 = AAA (vale o prazo atual do card; card sem compromisso não conta; descartado antes do prazo sai da conta, depois do prazo conta como vencido). Nenhuma regra de negócio nova neste documento.

Os arquivos e as linhas vêm do §4 e do §1 do desenho (worktree da develop); o react-frontend confere pelo texto atual.

## Princípios dos textos

1. A data acordada é o **prazo do card no BusinessMap**, e vale o prazo **atual**: se o prazo for mudado depois do compromisso, o cartão usa o novo.
2. Só conta como acordo o card que passou pelo ponto de compromisso. Card no backlog com prazo não conta.
3. Descartado antes do prazo não entra; descartado depois do prazo conta como vencido.
4. "De quem foi o atraso" e "vencidos por causa interna" estão **sem dado real** até o campo de responsabilidade existir no quadro. Nunca 0, nunca "Nenhum".
5. Sem selo de status e sem "Meta: zero" avaliada enquanto a parte estiver sem dado.
6. Sem comparação entre times e sem pessoa. O texto fala de card, prazo e tipo de responsabilidade (Interno, Solicitante, Terceiro), nunca de quem.

## Motivo da parte sem dado (texto num lugar só, em `origem.ts`, como o do O17)

Constante nova no molde de `MOTIVO_O17_CAUSA_RAIZ_SEM_DADO_REAL`, que é frase em minúsculas sem ponto final, completada pelo componente:

- `MOTIVO_O12_RESPONSABILIDADE_SEM_DADO_REAL`: "aguardando o campo de responsabilidade do atraso no quadro do BusinessMap (o prazo do card diz quando venceu, não de quem foi o atraso)"

Quando o interruptor `RESPONSABILIDADE_ATRASO_COM_FONTE` virar `true`, a constante deixa de ser usada e os textos "sem dado real" abaixo somem; as frases das seções "Nota do cartão" e "Catálogo" que citam a espera pelo campo mudam no mesmo PR.

## Nota do cartão (`web/src/features/operacional/notas.ts`, O12, `:84-94`)

| Campo | Texto atual | Texto novo |
|---|---|---|
| oQueE | "Compromissos com data acordada, quantos venceram sem entrega e por responsabilidade de quem." | "Compromissos com prazo acordado, quantos venceram sem entrega e, quando o campo existir no quadro, de que tipo foi a responsabilidade do atraso." |
| comoSeCalcula | "Data acordada no mês contra a entrega; responsabilidade registrada no vencimento." | "O prazo é o prazo do card no BusinessMap, lido como está hoje: se o prazo for mudado depois do compromisso, vale o novo (o histórico fica guardado). Conta o card que passou pelo ponto de compromisso; card ainda no backlog, mesmo com prazo, não conta. Um card descartado antes do prazo sai da conta; descartado depois do prazo conta como vencido. Vence quando o prazo é anterior à entrega (ou a hoje, se ainda não foi entregue)." |
| comoLer | "A linha decrescente é o que se apresenta às áreas; a decomposição é a conversa interna." | "A linha decrescente é o que se apresenta às áreas. Enquanto o campo de responsabilidade não existir no quadro, as barras mostram acordos sem vencer e vencidos, sem a divisão por tipo de responsabilidade." |
| meta | "Zero vencidos por causa interna." | "Zero vencidos por causa interna. Não avaliada enquanto a responsabilidade do atraso estiver sem dado real." |
| cuidados | "A responsabilidade precisa ser preenchida no vencimento, nunca depois; "Não classificado" mostra o que ficou sem preencher." | "O prazo pode ser mudado depois do compromisso, e o cartão usa o prazo atual: um prazo empurrado reduz os vencidos sem que a entrega tenha melhorado. O BusinessMap não diz quando o prazo foi acordado; a base só sabe desde quando a coleta o viu. Quando o campo de responsabilidade existir, ele precisa ser preenchido no vencimento, nunca depois; "Não classificado" mostra o que ficou sem preencher. Não compara times nem avalia pessoas." |

Observação: "comoSeCalcula" é longo. Se o componente da nota limitar o tamanho, a ordem de corte é: manter a 1ª frase (o que é o prazo), a regra do compromisso e a do descartado; a última frase (vence quando) pode ir para o "Como ler" do catálogo.

## Catálogo (`web/src/content/catalogo-metricas.ts`, O12, `:106-115`)

| Campo | Texto atual | Texto novo |
|---|---|---|
| nome | "Acordos e vencidos" | sem mudança |
| pergunta | "Dos prazos que combinamos, quantos vencemos, e de quem foi o atraso?" | "Dos prazos que combinamos, quantos vencemos? E de quem foi o atraso, quando o campo existir no quadro?" |
| meta | "Zero vencidos por causa interna" | sem mudança (a meta continua a mesma; a nota do cartão diz que não é avaliada sem dado) |

A coluna "Dados" do catálogo continua derivada do mapa de origem (regra do `099-textos-sem-simulado.md`): enquanto o O12 não entrar em `METRICAS_ORIGEM_REAL` (lote C3), mostra "Sem dado real"; depois do C3, mostra "Real" para o O12, e a parte de responsabilidade aparece "sem dado real" só dentro do cartão. Nenhum terceiro estado ("parcial") no catálogo.

## Número grande do cartão (`CartaoO12.tsx`, `:27-32`)

Com o interruptor desligado, `vencidosCausaInterna` chega nulo. O número grande **não mostra 0**; usa o estado sem dado real do `NumeroGrande` (o do K-285: traço no lugar do número, motivo a 14 px e faixa/texto "Sem dado real", sem selo de meta):

| Parte | Texto |
|---|---|
| rótulo | "vencidos por causa interna no período" (sem mudança) |
| valor | estado sem dado real do componente (nunca "0") |
| estado | "Sem dado real" |
| motivo | "Aguardando o campo de responsabilidade do atraso no quadro do BusinessMap. O prazo do card diz quando venceu, não de quem foi o atraso." |
| textoCompleto (leitor de tela) | "Vencidos por causa interna no período: sem dado real. Aguardando o campo de responsabilidade do atraso no quadro do BusinessMap." |

Com o interruptor ligado (futuro), volta ao número, ao rótulo e ao `textoCompleto` atuais.

Acessibilidade: a situação é dita por palavra ("Sem dado real"), não só por cor ou traço (`lido`, não medido).

## Leitura do cartão (`CartaoO12.tsx`, `:14-17`, a frase lida por leitor de tela e mostrada junto do cartão)

| Situação | Texto |
|---|---|
| Parte de responsabilidade sem dado real (interruptor desligado) | "Vencidos por causa interna: sem dado real, aguardando o campo de responsabilidade do atraso no quadro. 12 de 40 acordos venceram (30%)." |
| Mesma situação, abaixo de 20 acordos | "Vencidos por causa interna: sem dado real, aguardando o campo de responsabilidade do atraso no quadro. 3 de 9 acordos venceram." |
| Com o campo (futuro) | texto atual, sem mudança: "Vencidos por causa interna: N. k de n acordos venceram (taxa)." |

Os números 12, 40 e 3, 9 são exemplos de forma; o componente usa os da API. A frase de `% vencidos` segue a regra de sempre: percentual só com 20 acordos ou mais no mês, abaixo disso "k de n".

Barras e gráfico: sem a divisão por responsabilidade, a legenda mostra só "Acordos sem vencer" e "Vencidos" (uma série); as séries "Interno", "Solicitante", "Terceiro" e "Não classificado" não aparecem e não são desenhadas com valor 0. Rótulo da série única: "Vencidos". Descrição do gráfico: "Acordos por mês, com os vencidos. A divisão por responsabilidade do atraso está sem dado real." A lista "Vencidos por mês, k de n" não muda.

Faixa curta acima das barras (uma frase, mesma posição da faixa do K-285): "Divisão por responsabilidade do atraso: sem dado real. Aguardando o campo no quadro do BusinessMap."

Para o gráfico exibir "vencidos" sem a divisão, o back-end precisa entregar o total de vencidos por mês (`m.vencidos`) já existente; nenhum dado novo.

## Resumo do Operacional (`resumo/modelo.ts`, `numeroVencidosInternos`, `:124-137`)

| Campo | Texto |
|---|---|
| rótulo | "Vencidos por causa interna" (sem mudança) |
| valor | estado sem dado real (nunca "0") |
| unidade | omitida |
| base | "{n} acordos" (sem mudança: o número de acordos é dado real) |
| meta | "Meta: zero. Não avaliada sem dado real." |
| status | nenhum (já omitido quando `statusMeta === 'sem-referencia'`) |
| motivo | "Aguardando o campo de responsabilidade do atraso no quadro." |

O link do número leva ao cartão `#o12`, como hoje.

## "Pede atenção na semana" (`atencao.ts`, `:69-75`)

- Com o interruptor desligado (`vencidosCausaInterna` nulo): **não gera item** de vencido interno. Sumir não pode ser lido como "não há vencido interno"; por isso o painel tem de dizer a lacuna, no lugar do item, na linha de lacunas do bloco (se o bloco já tiver a linha "Sem dado real" dos outros cartões, usar a mesma; senão, acrescentar):
  - "O12: vencidos por causa interna sem dado real (aguardando o campo de responsabilidade do atraso)."
- Com o campo (futuro): texto atual, sem mudança: "{n} vencido(s) por causa interna".
- Fica **fora** do "Pede atenção", por regra de dado real: qualquer item "vencidos" sem a divisão por responsabilidade. Total de vencidos não é a meta (a meta é por causa interna) e não vira alerta.

Quem aplica confere se o bloco "Pede atenção na semana" tem lugar para a linha de lacunas; se não tiver, o react-frontend avisa o ux-designer antes de inventar um componente (pergunta de desenho, não de regra).

## Visão geral

O alerta `O12_VENCIDOS_INTERNOS` não é gerado com `null` (decisão do §3 do desenho). Sem texto novo de UX: a Visão geral não mostra a linha, e a lacuna fica no cartão e no Resumo.

## Exportar

O arquivo exportado do O12 com a parte sem dado real: colunas "Interno", "Solicitante", "Terceiro" e "Vencidos por causa interna" saem **vazias** (não 0), e a linha de cabeçalho/nota do arquivo inclui: "Responsabilidade do atraso: sem dado real (aguardando o campo no quadro do BusinessMap)." Mesma regra dos outros cartões com parte sem fonte.

## Marca de versão de critério no gráfico (T2.6)

Sem texto novo de UX: a marca vem do `criterios` do DTO. Descrição que ela mostra (do §5 do desenho): "O12 usa como data acordada o prazo nativo (deadline) do card do BusinessMap, que pode mudar depois do compromisso; a responsabilidade do atraso segue sem dado real".

## Estados do cartão

| Estado | Comportamento |
|---|---|
| carregando | sem mudança |
| erro | sem mudança |
| vazio / insuficiente | sem mudança (menos de 20 acordos: "k de n", sem percentual); com 0 acordos no período, "Nenhum acordo com prazo no período" (sem mudança de regra) |
| sem dado real (parte de responsabilidade) | número grande e faixa pelos textos acima; acordos, vencidos e % seguem com dado |
| sem dado real (todo o O12, antes do C3) | como os demais cartões do mapa de origem: "Sem dado real" e o motivo do `origem.ts`; o motivo do O12 deixa de ser "aguardando campo no quadro" (data acordada) e passa a ser o da constante acima só depois do C3 |

## Critérios de aceite (para o C2b e a revisão do UX)

- `CA-O12-1` ENQUANTO `RESPONSABILIDADE_ATRASO_COM_FONTE` for falso O SISTEMA DEVE mostrar o número grande do O12 como "Sem dado real" com o motivo, e nunca o dígito "0".
- `CA-O12-2` ENQUANTO `RESPONSABILIDADE_ATRASO_COM_FONTE` for falso O SISTEMA DEVE ocultar a série de responsabilidade do gráfico (Interno, Solicitante, Terceiro, Não classificado) sem desenhá-la com 0.
- `CA-O12-3` ENQUANTO `RESPONSABILIDADE_ATRASO_COM_FONTE` for falso O SISTEMA DEVE omitir o selo de status da meta no cartão e no Resumo e mostrar "Meta: zero. Não avaliada sem dado real." no Resumo.
- `CA-O12-4` ENQUANTO `vencidosCausaInterna` for nulo O SISTEMA DEVE deixar de gerar o item de vencido interno em "Pede atenção na semana" e mostrar a linha de lacuna do O12.
- `CA-O12-5` O SISTEMA DEVE dizer na nota do cartão que a data acordada é o prazo do card no BusinessMap, que vale o prazo atual, que card sem compromisso não conta e como o descartado é contado.
- `CA-O12-6` QUANDO o cartão mostra acordos e vencidos com a responsabilidade sem dado real O SISTEMA DEVE manter acordos, vencidos e percentual (ou "k de n" abaixo de 20) com dado real.
- `CA-O12-7` O SISTEMA DEVE não conter nos textos do O12 nome de pessoa, nome de outro time nem comparação entre times.
- `CA-O12-8` QUANDO o O12 é exportado com a responsabilidade sem dado real O SISTEMA DEVE deixar as colunas de responsabilidade vazias e incluir a nota de "sem dado real".

## Perguntas ao dono

Nenhuma regra nova. Uma dúvida de desenho, sem decisão do dono necessária: o número "vencidos por causa interna" com a parte sem dado real usa o estado do K-285 (traço, motivo a 14 px). Se o react-frontend achar que o `NumeroGrande` não aceita valor nulo sem mudança de componente, avisa o ux-designer antes de improvisar.

## Nota de mudança

- 2026-11-12 (E3.26): documento criado pela Q-099-23 = AAA e Q-099-4 = A.
