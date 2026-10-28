# 048-01 - Índice fixo cobre o título da seção e destaca a seção anterior
- Severidade: média
- Responsável sugerido: forge:react-frontend
- Ambiente: feature/048-usabilidade, c984b0f5dc621751d488456d6dda19f4ee0d06e7, Chromium 1280x800, build de produção (mock)

## Passos para reproduzir
1. Abrir `/tatico` a 1280x800.
2. No índice "Ir para", clicar em "Fila".

## Resultado esperado
A página leva ao título da seção "Fila", que recebe o foco e fica inteiro à vista abaixo do índice fixo; o link "Fila" passa a `aria-current="location"` (P3: "destaca a seção em vista").

## Resultado obtido
O título (`#fila h2`) fica em y=159..187 e o índice fixo termina em y=176: o título fica parcialmente sob o índice (`elementFromPoint` no centro do título devolve o `indice-secoes`). O destaque permanece em "Publicado" (a cauda da seção anterior, bottom=143, ainda cai na faixa do `IntersectionObserver`); só passa para "Fila" depois de rolar cerca de 200 px.

## Evidência
Medição por `page.evaluate` depois do clique: `{"y":2632,"atual":["Publicado"],"pubBottom":143,"filaTop":159,"indiceBottom":176}` e `{"top":159,"bottom":187,"coberto":true,"quem":"indice-secoes"}`. Teste: `e2e/tests/usabilidade-048.spec.ts`, USAB-05b (marcado `test.fail` até a correção).
Mesma causa, a 375 px: `e2e/tests/sustentacao-no-operacional-qa.spec.ts:423` (CT-31, WCAG 2.4.11 foco não encoberto) cai com `encoberto por A.alvo ... font-bold text-texto` (o link do índice fixo); passa na base.
Causa provável: `scroll-padding-top` global (`web/src/styles/tokens.css:116`) soma cabeçalho e filtros, mas não a altura do próprio índice (`IndiceDeSecoes.tsx` `irPara`, `scrollIntoView`); e a faixa do observador (`rootMargin`) usa `topo + 56`, sem a altura medida do índice.
