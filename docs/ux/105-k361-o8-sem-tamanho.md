# 105 · K-361 · O8: tipo de demanda sem tamanho declarado

Especificação curta (E3.7, pedido 105). Sem dado novo e sem número inventado: só dizer, em texto, o que o painel já sabe.

## Comportamento atual (lido no código)
- `calcularO8` (`packages/metricas/src/businessmap/o8.ts:63`) decide a divisão por tamanho **por tipo**: se nenhum card entregue do tipo tem `tamanho_declarado`, o tipo fica com `porTamanho: null`. O texto fixo `motivoPorTamanho` só sai quando **nenhum** tipo publica a divisão (`o8.ts:87-93`).
- Quando um tipo publica a divisão e outro não, o gráfico "Mediana do tempo em execução por tipo e tamanho declarado" (`web/src/features/complementares/fluxo.tsx:189-206`) recebe, para o tipo sem tamanho, `valores` vazio (`(t.porTamanho ?? [])`). Ele aparece como um rótulo de categoria sem barra e sem explicação. Quem lê pode achar que o tempo é zero, que faltou dado por erro ou que o tipo foi esquecido.
- Contrato e estatística geral do tipo (tabela de cima) não mudam: o tipo continua com mediana, P85 e média quando tem 20 itens.

## Comportamento esperado
O tipo sem tamanho **não vira categoria vazia do gráfico**. Ele sai do gráfico e entra numa nota escrita logo abaixo dele.

Wireframe (só quando pelo menos um tipo publica a divisão e algum outro não):

```
Por tamanho declarado
[gráfico de barras: só os tipos que têm tamanho]

Sem divisão por tamanho: Bug, Melhoria.
Nenhum card concluído desses tipos, no período, tem tamanho declarado no quadro.
A mediana e o P85 deles estão na tabela acima.
```

Regras de texto:
1. A nota lista os nomes dos tipos, separados por vírgula, na mesma ordem da tabela. Um tipo só: "Sem divisão por tamanho: Bug." e "Nenhum card concluído desse tipo...".
2. A nota não traz número, porcentagem nem "0": ausência de tamanho não é medida.
3. A nota é texto visível, não depende de cor nem de tooltip, e fica fora do `svg` do gráfico, para que o leitor de tela a leia como parágrafo.
4. Se todos os tipos têm tamanho, não há nota. Se nenhum tem, vale o que já existe: `EstadoSemDadoReal` com `motivoPorTamanho` e sem gráfico.
5. A tabela de cima continua mostrando o tipo (mediana geral). A nota só diz que falta a divisão.

## Critérios de aceite
- CA-1 QUANDO pelo menos um tipo tem `porTamanho` e outro tem `porTamanho` nulo O SISTEMA DEVE desenhar o gráfico "por tipo e tamanho declarado" só com os tipos que têm `porTamanho`.
- CA-2 QUANDO pelo menos um tipo tem `porTamanho` nulo e outro publica a divisão O SISTEMA DEVE exibir abaixo do gráfico a frase "Sem divisão por tamanho: <tipos>." seguida de "Nenhum card concluído desses tipos, no período, tem tamanho declarado no quadro." (singular com um tipo só: "desse tipo ... tem").
- CA-3 O SISTEMA DEVE manter o tipo sem tamanho na tabela do O8 com a mediana, o P85 e a média que ele já tem, e a nota deve dizer onde estão ("A mediana e o P85 deles estão na tabela acima.").
- CA-4 A nota do CA-2 NÃO DEVE conter número, porcentagem nem a palavra "zero".
- CA-5 QUANDO nenhum tipo tem `porTamanho` O SISTEMA DEVE manter o comportamento atual: sem gráfico e com o `motivoPorTamanho` (sem a nota do CA-2).
- CA-6 QUANDO todos os tipos têm `porTamanho` O SISTEMA NÃO DEVE exibir a nota do CA-2.
- CA-7 O SISTEMA DEVE exibir a nota do CA-2 como parágrafo de texto fora do gráfico, legível por leitor de tela (`lido`; o QA mede).

## O que não deve mudar
- O cálculo (`o8.ts`), o contrato e o `motivoPorTamanho` fixo.
- A tabela do O8, a lista de tipos com menos de 20 itens e a regra de não publicar estatística abaixo de 20.
- A decisão L24 (a) e a Q-099-4: nunca pôr tudo em "Sem tamanho" para um tipo sem tamanho declarado.

## Fora desta especificação
Tipo que tem `porTamanho` mas com todas as medianas por tamanho nulas (menos de 20 itens em cada tamanho) também fica sem barra. É outro caso (há tamanho, falta amostra) e pede texto próprio sobre o mínimo de 20; vira pergunta ao tech-lead se o QA mostrar que acontece.

## Necessidades de dados
Nenhuma nova: o front usa `tipos[].porTamanho` (nulo ou lista) que o contrato já traz.

## Microcopy
- "Sem divisão por tamanho: Bug, Melhoria."
- "Nenhum card concluído desses tipos, no período, tem tamanho declarado no quadro. A mediana e o P85 deles estão na tabela acima."
Os nomes dos tipos são exemplos de formato; o texto usa os tipos reais devolvidos pelo contrato.
