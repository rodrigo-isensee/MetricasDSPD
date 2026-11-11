## Objetivo
Revisão de interface do lote 9a dos bloqueios reais (K-204): a web deixa de mostrar o texto "Sem dado real" de bloqueio no O1 e no O2 e passa a mostrar o dado real. Branch `feature/075-9a`, código no primeiro commit da branch (worktree `/home/rodrigoisensee/MetricasDSPD-056`), já com QA e review aprovados.

## Ler
- O diff na worktree `/home/rodrigoisensee/MetricasDSPD-056`: `web/src/features/operacional/components/CartaoO1.tsx`, `web/src/features/operacional/components/CartaoO2.tsx` e `web/src/features/complementares/CartaoComplementar.tsx`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/075-bloqueios-reais.md` (a especificação de tela do 075).

## Entregar
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." (E1.10) Nesta delegação, o lote 9a.
- (E1) (E1.10) Conferir pela leitura do código que O1, O2 e a coluna "Bloqueado" seguem a especificação do 075 sem o ramo "sem dado real" de bloqueio (textos, legenda, estado nulo do O1, acessibilidade), e que nada sobra do texto antigo. Revisão `docs/ux/075-revisao-l9a.md` (novo), pela ferramenta Write, no repositório principal, com veredito e achados numerados. Sem commit.
- (E2) (E3) (E4) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/ux/075-revisao-l9a.md

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/075-revisao-l9a.md` · espera: existe e tem o veredito
