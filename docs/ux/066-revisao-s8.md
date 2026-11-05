# Revisão de interface: cartão do S8 com os textos novos

pedido: 066-s8-so-com-resposta
branch: feature/066-s8
commit: 69168ac3f0484a8fe5ddc772f64a2863e8070ceb

Escopo: `CartaoS8` (sustentacao.tsx) e nota do S8 (notas.ts). Revisão por leitura do código, contra a especificação do pedido, Nielsen e WCAG 2.2 AA. Sem execução em navegador.

## Veredito

Aprovado com ressalvas. Nenhum achado crítico ou alto. Dois achados médios e dois baixos, nenhum bloqueia o review e o QA.

## O que está bem

- Quando não publica, o cartão diz a causa e a ação: falta preencher o campo "Este problema já ocorreu nos últimos 90 dias?" no Acelerato, e a taxa volta com 20 incidentes com resposta. Leitura só aparece quando publica (sem número estimado).
- Cobertura "Com resposta em n de N incidentes" aparece só quando há lacuna, em texto, sem depender só de cor.
- A coluna "Com resposta" tem a legenda da tabela explicando que é o denominador da taxa.
- Nota coerente com o cartão: como se calcula e cuidados dizem o mesmo (sim ÷ com resposta, mínimo 20, sem resposta fora). O "O que é" segue válido.
- Tabela de dados acompanha o gráfico, com descrição textual, dando alternativa de leitura acessível.

## Achados

1. Médio. Terminologia mista: o comentário e a nota usam "reabertura" (comoLer: "Reabertura alta sugere correção que não resolveu") enquanto o título, o gráfico e o texto usam "reincidência". Correção: trocar "Reabertura" por "Reincidência" em comoLer.
2. Médio. Quando não publica, o gráfico e a tabela mensal continuam visíveis, e o aviso fica no fim do cartão. Quem lê o gráfico antes pode não ver por que ele está vazio. Correção: colocar a mensagem de dados insuficientes antes do gráfico, ou indicar no gráfico que os meses sem taxa não publicam.
3. Baixo. A cobertura usa a classe text-atencao: confirmar contraste mínimo 4.5:1 sobre o fundo do cartão (não verificado em navegador).
4. Baixo. A cobertura só aparece com resposta parcial. Com zero respostas, o texto "Com resposta em 0 de N" convém aparecer junto do aviso, para quantificar a lacuna. Confirmar que aparece nesse caso (n < total, então aparece; sem achado se o teste do caso 9 cobre).
