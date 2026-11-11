## Objetivo
PR do lote 9a dos bloqueios reais (K-204) para a develop: branch `feature/075-9a`, worktree `/home/rodrigoisensee/MetricasDSPD-056`, head 130a4c47 (código f79685e8; QA aprovado em 7a19ce61; review aprovado em 130a4c47; revisão de UX aprovada com ressalvas, achado 1 fica para o 9b por decisão técnica e os baixos no K-276), base develop eac38a64b0b580d7c920f4b2b501287f7fb56599.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-056/docs/reviews/075-l9a-web.md` e `/home/rodrigoisensee/MetricasDSPD-056/docs/qa/075-l9a-web.md`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/075-revisao-l9a.md`.

## Entregar
- "E1.9 (tech-lead): PR por lote, depois do QA." (E1.9) Nesta delegação, o PR do lote 9a.
- (E1) (E1.9) Antes, rodar da worktree `forge-check pr 075-bloqueios-reais --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD`; pendência: pare e relate. Abrir o PR da branch para a `develop` (squash) pelo gh, com título e corpo curtos: o que mudou, os pareceres de QA e review e a revisão de UX (caminho do repositório principal), a linha `teto: excedido, 173 linhas` com o motivo (remoção do teste do 065; A2 do review), e `Cartão: K-204`. Se a branch estiver atrás da develop, atualizar só por merge da develop na branch (sem rebase nem force) e relatar o novo head. Esperar os checks e relatar cada um (falha: nome e linha do erro; a falha de DNS do apt nos jobs com navegador é conhecida, pedido 095). Não mesclar: o merge é do dono.
- (E2) (E3) (E4) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: web/src/features/operacional/, web/src/features/complementares/, docs/reviews/075-l9a-web.md

## Pronto quando
- PQ-1 (cmd): `gh pr list --head feature/075-9a --state open --json number` · espera: contém 'number'
