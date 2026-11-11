## Objetivo
PR do lote 9b dos bloqueios reais (K-204) para a develop: branch `feature/075-9b`, worktree `/home/rodrigoisensee/MetricasDSPD-056`, head 39906ef0 (código e4eaa56c; QA aprovado em 8c3d905c; review aprovado em 39906ef0). A develop andou depois da base (tem o PR 321 do K-272, com o check `banco` vermelho por um teste `.pg` que está sendo corrigido em outra branch).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-056/docs/reviews/075-l9b-contrato.md` (A1: o corpo do PR traz as entradas do aceite e a linha §6) e `/home/rodrigoisensee/MetricasDSPD-056/docs/qa/075-l9b-contrato.md`.

## Entregar
- "E1.9 (tech-lead): PR por lote, depois do QA." (E1.9) Nesta delegação, o PR do lote 9b.
- (E1) (E1.9) Rodar da worktree `forge-check pr 075-bloqueios-reais --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref feature/075-9b --base develop` e confirmar `veredito: aprovado` (se não, pare e relate). Não atualizar a branch com a develop (R-FLUXO: só na hora do merge). Abrir o PR para a `develop` (squash) pelo gh, com corpo curto: o que muda, a linha do checklist §6 (`contrato: incompatível (valor de enum removido em notas de O1, O2 e O3; aceite em aceitas.json, fotografado e removido no mesmo PR)`) e os hashes dos aceites do relatório do autor, os pareceres e `Cartão: K-204`. Se o hook recusar, pare e relate a mensagem literal. Esperar os checks e relatar cada um; se o `banco` falhar só pelo teste do K-272 que veio da develop, diga isso. Não mesclar: o merge é do dono.
- (E2) (E3) (E4) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: nenhum

## Pronto quando
- PQ-1 (cmd): `gh pr list --head feature/075-9b --state all --json number` · espera: contém 'number'
