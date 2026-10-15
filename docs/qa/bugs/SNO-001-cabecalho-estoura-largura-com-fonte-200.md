# SNO-001 - Cabeçalho global estoura a largura com fonte a 200% em 375 px (todas as telas)
- Status: **fechado** em d76947b (2026-10-15), corrigido por 26ad55b e verificado pelo QA.
- Severidade: média (pré-existente, não introduzido pela demanda)
- Responsável sugerido: react-frontend (`web/src/app/AppShell.tsx` e `NavegacaoGlobal.tsx`)
- Ambiente: worktree `/home/rodrigoisensee/MetricasDSPD-sust`, branch `feature/sustentacao-no-operacional`, aberto em 67624ba, Chromium (Playwright), build de produção
- Critério: WCAG 1.4.4 (Redimensionar texto) e 1.4.10 (Refluxo). Citado em CT-32 do plano (seletor "também com fonte ampliada").

## Passos para reproduzir
1. Abrir qualquer rota a 375 x 812 (`/`, `/tatico`, `/operacional?cadencia=semanal`, `/operacional?cadencia=sustentacao`).
2. Ampliar só o texto para 200% (equivale a `html { font-size: 200% }`, o tamanho de fonte padrão duplicado no navegador).
3. Medir `document.documentElement.scrollWidth - clientWidth`.

## Resultado esperado
Sem rolagem horizontal da página: o cabeçalho quebra linha e o conteúdo cabe em 375 px.

## Resultado obtido (na abertura)
`scrollWidth = 640` contra `clientWidth = 375` em todas as rotas. O primeiro a estourar é o `HEADER`, cujo botão `abrir-menu` termina em x = 538. Causa raiz: `min-width: 20rem` virava 640 px com a fonte a 200%.

## Evidência da abertura
- Sonda de QA (descartada) nas 4 rotas: `sw=640 cw=375`, elemento de maior `right`: `HEADER.z-40` (r = 640).
- Origem: o defeito existia em `origin/develop`; o diff da demanda não alterava o layout do cabeçalho.

## Verificação do fechamento (QA, HEAD d76947b)
- Correção: 26ad55b (piso `min(20rem, 320px)` em `tokens.css`, `flex-wrap` e `min-w-0` nos cartões, grade 2x2 do `SeletorCadencia` abaixo de 400 px). Teste novo: `e2e/tests/cabecalho-fonte-200.spec.ts` (4 rotas, também confirma Menu, tema e selo visíveis).
- **Vermelho antes do verde:** os 9 arquivos de `web/src` de 26ad55b voltaram ao estado de 26ad55b^ (`git checkout 26ad55b^ -- <arquivos>`), build de produção e `playwright test tests/cabecalho-fonte-200.spec.ts --project=chromium`: **4 de 4 falharam**. Arquivos restaurados com `git checkout HEAD --`; árvore limpa.
- **Verde:** no HEAD, o mesmo spec passou 4 de 4 dentro da suíte E2E completa (677 de 677, 0 falhas), junto com RESP-01 (320 px), CT-32 (200% de zoom e reflow a 320 px) e CA-19/CA-20 (axe e rolagem a 375 e 1280 px). Zero violações sérias ou críticas.
- Revisão de UX do efeito a 375 px (seção 8 de `06-revisao-implementada.md`, f8b09f1): aprovada.
