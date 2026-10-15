# SNO-001 - Cabeçalho global estoura a largura com fonte a 200% em 375 px (todas as telas)
- Severidade: média (pré-existente, não introduzido pela demanda)
- Responsável sugerido: react-frontend (`web/src/app/AppShell.tsx` e `NavegacaoGlobal.tsx`)
- Ambiente: worktree `/home/rodrigoisensee/MetricasDSPD-sust`, branch `feature/sustentacao-no-operacional`, HEAD 67624ba, Chromium (Playwright), build de produção
- Critério: WCAG 1.4.4 (Redimensionar texto) e 1.4.10 (Refluxo). Citado em CT-32 do plano (seletor "também com fonte ampliada").

## Passos para reproduzir
1. Abrir qualquer rota a 375 x 812 (`/`, `/tatico`, `/operacional?cadencia=semanal`, `/operacional?cadencia=sustentacao`).
2. Ampliar só o texto para 200% (equivale a `html { font-size: 200% }`, o tamanho de fonte padrão duplicado no navegador).
3. Medir `document.documentElement.scrollWidth - clientWidth`.

## Resultado esperado
Sem rolagem horizontal da página: o cabeçalho quebra linha e o conteúdo cabe em 375 px.

## Resultado obtido
`scrollWidth = 640` contra `clientWidth = 375` em todas as rotas. O primeiro a estourar é o `HEADER` (`div.mx-auto.flex.max-w-[1440px].flex-wrap`), cujo botão `abrir-menu` termina em x = 538. O restante da página herda a largura de 640 px. Na Sustentação, o seletor "Visão" ainda se organiza em 2 linhas (3 + 1) com alvos de 44 px; o problema não é o seletor.

## Evidência
- Sonda de QA (descartada) nas 4 rotas: `sw=640 cw=375`, elemento de maior `right`: `HEADER.z-40` (r = 640).
- Captura: `e2e/test-results/sustentacao-no-operacional-153a7-px-e-sem-rolagem-horizontal-chromium/test-failed-1.png` (execução de 2026-10-14; o teste foi reduzido ao que a demanda controla, sem a asserção da página inteira).
- Origem: o diff da demanda não altera o layout do cabeçalho (`AppShell.tsx` só ganha título e anúncio); o defeito existe em `origin/develop`.

## Decisão de QA
Não bloqueia esta entrega (fora do escopo e pré-existente), mas o parecer leva `aceite_usuario: sim`. Reabrir como cartão próprio no quadro.
