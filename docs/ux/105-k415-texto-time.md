# K-415 - Texto da nota do T15 sem prometer um time só (E7.592)

## Objetivo
A nota do T15 diz "para o time escolhido", o que promete um time só. A decisão do dono vale: com nenhum time ou mais de um no filtro, as sprints dos times se somam; para ver um time, filtra-se por ele. Times nunca lado a lado.

## Texto atual
`web/src/features/complementares/notas.ts:137`, campo `oQueE` do T15:

> Quantos dias úteis dura uma sprint, do começo ao fim, para o time escolhido.

## Texto novo
> Quantos dias úteis dura uma sprint, do começo ao fim, nas sprints do recorte do filtro de time.

Alternativa mais curta, se o dono preferir: "Quantos dias úteis dura uma sprint, do começo ao fim, no recorte do filtro de time."

## Motivo
- "para o time escolhido" pressupõe um time selecionado; com nenhum ou vários, a frase fica falsa.
- O novo texto mantém a pergunta do catálogo ("Quantos dias úteis dura uma sprint?", `catalogo-metricas.ts:537`) como início e não repete a regra da soma, que já está na nota (`notas.ts:144`, campo `cuidados`) e no cartão (`previsao.tsx:277`).
- A expressão "recorte do filtro de time" é a mesma do comentário do cartão (`previsao.tsx:224`) e de "no recorte" em `notas.ts:141`.
- Não cria comparação entre times (regra inviolável) e não altera cálculo.

## Onde mais aparece a mesma promessa
Busca por "time escolhido" e "times escolhidos" na worktree inteira (excluindo `node_modules`): só `notas.ts:137`. Nenhuma outra ocorrência no código, nos testes ou no catálogo.
O teste `t15-tamanho-sprints.test.tsx` não afirma o `oQueE` do T15 (sem ocorrência de `oQueE` nem da frase); só as linhas 46 e 48, que seguem iguais.

## Critério de aceite
- CA-1 QUANDO a nota do T15 é aberta O SISTEMA DEVE exibir em "O que é" o texto "Quantos dias úteis dura uma sprint, do começo ao fim, nas sprints do recorte do filtro de time." e não conter a expressão "time escolhido".
