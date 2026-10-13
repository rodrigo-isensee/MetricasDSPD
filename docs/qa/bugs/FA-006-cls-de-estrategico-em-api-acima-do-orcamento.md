# FA-006 - CLS de /estrategico em VITE_FONTE=api fica em 0,113 (limite F2 da ADR 0003: 0,1)
- Severidade: média (orçamento de performance estourado; sem efeito funcional; só em `api`)
- Responsável sugerido: react-frontend
- Ambiente: feature/front-via-api (bb45253), Chromium headless 1366x768, API local com mock semeado

## Passos para reproduzir
1. `flock /tmp/metricas-pesado.lock bash scripts/com-api-mock.sh bash -c 'cd e2e && E2E_API_URL=$API_URL pnpm run test:perf:api'`.
2. Teste "F2 CLS e C6 tarefa longa em /estrategico".

## Resultado esperado
CLS < 0,1 (ADR 0003, F2). Em `api` a execução anterior (2026-10-12) ficou entre 0,003 e 0,086.

## Resultado obtido
CLS = 0,113 em 3 de 3 execuções (determinístico). Em modo mock (`--project=perf`, mesma branch) o mesmo teste dá 0,001. As demais rotas: `/` 0,001, `/operacional` 0,009 a 0,067, `/tatico` 0,029 a 0,084 (oscilam, perto do limite).

## Causa provável (não confirmada)
Em `api` os cartões resolvem em instantes diferentes (rede real) e o conteúdo muda a altura em relação ao esqueleto de carregamento; no mock a resposta é imediata e o deslocamento não aparece. Verificar a altura reservada pelos esqueletos dos cartões de /estrategico e se o aviso novo do O2 (R5) ou outro bloco de texto entra depois do carregamento.

## Evidência
Falha "F2 CLS: expected < 0.1, received 0.1128" em `e2e/perf/perf.spec.ts:88`, nas 3 execuções; log do perf-api (scratchpad da sessão).

## Correção (react-frontend, 2026-10-13)
- Causa: a faixa "Pede atenção" de `/estrategico` reservava 88 px em desktop enquanto carrega, mas pronta (com itens) mede 98 px; os 10 px empurravam todo o painel abaixo dela. Em `api` o conteúdo chega depois do primeiro quadro e o deslocamento aparece; no mock a resposta é imediata.
- Correção na origem: `reserva.desktop` de 88 para 98 em `web/src/features/estrategico/EstrategicoPage.tsx` (dimensão final, sem esconder conteúdo). Teste unitário da reserva em `estrategico.test.tsx`.
- Resultado: CLS de `/estrategico` em `perf-api` = 0,021 em 5 de 5 execuções (antes 0,113). Mock não alterado (a mudança só vale enquanto carrega).
- Observação: o 0,113 não reapareceu após a correção, mas a causa exata do valor alto (frente aos 10 px) não foi isolada com instrumentação própria; se voltar, reabrir.
- Status: corrigido e verificado pelo QA (2026-10-13, 0,021 em 3 de 3 execuções do `perf-api` após o merge da develop).
