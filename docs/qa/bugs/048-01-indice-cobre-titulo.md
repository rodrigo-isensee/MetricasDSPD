# 048-01 - Índice fixo cobre o título da seção e destaca a seção anterior
- Estado: ABERTO, só em parte corrigido (reteste em 3db78a9, 2026-10-29). O título deixou de ficar coberto (CT-31 verde; `#fila h2` em y=98, índice termina em y=82). O destaque continua errado.
- Severidade: média
- Responsável sugerido: forge:react-frontend
- Ambiente: feature/048-usabilidade, 3db78a933da28d41cc4acca3998f7fd0b1f52e62, Chromium 1280x800, build de produção (mock)

## Passos para reproduzir
1. Abrir `/tatico` a 1280x800.
2. No índice "Ir para", clicar em "Fila".

## Resultado esperado
A página leva ao título da seção "Fila", que recebe o foco e fica inteiro à vista abaixo do índice fixo; o link "Fila" passa a `aria-current="location"` (P3: "destaca a seção em vista"; CA-C da 048-03).

## Resultado obtido (em 3db78a9)
O título está livre, mas o destaque permanece em "Publicado": `{"y":2693,"h":[0,49],"idx":[49,82],"pub":[-2153,82],"fila":[98,1296],"filah2":[98,126],"atual":["Publicado"]}`. `#publicado` termina em y=82, exatamente a borda de cima da faixa do observador (`rootMargin: -82px 0 -60% 0`), e uma interseção de área zero conta como visível, então `ordem.find` devolve "Publicado" antes de "Fila".

## Evidência
`e2e/tests/usabilidade-048.spec.ts`, USAB-05b (sem `test.fail`): `Expected: "location"  Received: ""` no link "Fila", em 2 execuções. Em c984b0f o defeito era o título coberto (y=159..187 sob o índice até y=176).
Causa provável: `IndiceDeSecoes.tsx:72` escolhe a primeira seção "vista" na ordem; a seção anterior que só encosta na faixa deveria ser descartada (por exemplo `intersectionRatio > 0` ou margem de 1 px).
