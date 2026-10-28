# 048-02 - Aviso reservado do "Copiar link" estoura a largura da página (fonte a 200%, 375 px)
- Severidade: alta
- Responsável sugerido: forge:react-frontend
- Ambiente: feature/048-usabilidade, c984b0f5dc621751d488456d6dda19f4ee0d06e7, Chromium 375x812, build de produção (mock)

## Passos para reproduzir
1. Abrir `/` (também `/tatico`, `/operacional?cadencia=semanal` e `?cadencia=sustentacao`) a 375x812.
2. Aplicar `html { font-size: 200% }` (WCAG 1.4.4).
3. Medir `document.documentElement.scrollWidth`.

## Resultado esperado
Sem rolagem horizontal: `scrollWidth <= 375` (WCAG 1.4.10). Na base (4137981e) o teste SNO-001 passa nas 4 rotas.

## Resultado obtido
`scrollWidth = 437` nas 4 rotas. Os elementos que passam da borda são os dois `span` de `BotaoCopiarLink.tsx`: o contêiner `relative inline-flex items-center gap-2` e o aviso `inline-block min-w-[7rem]` (espaço reservado da correção A4), ambos com borda direita em 437 px. O contêiner não quebra linha e o aviso reservado soma 7 rem (14 rem a 200%) à largura do botão.

## Evidência
`e2e/tests/cabecalho-fonte-200.spec.ts` (SNO-001), 4 falhas: `Expected: <= 375, Received: 437`. Medição por `page.evaluate`: `[["SPAN",null,"relative inline-flex items-center gap-2",437],["SPAN",null,"inline-block min-w-[7rem] text-sm ",437]]`. Dá para conferir o ganho do A4 (sem CLS) e a correção juntos: reservar a largura só de `sm:` para cima, ou deixar o contêiner quebrar (`flex-wrap`), mantendo o aviso `role="status"`.
