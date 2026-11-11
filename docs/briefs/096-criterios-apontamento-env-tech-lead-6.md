## Objetivo
PR do K-271 para a develop: branch `fix/k271-criterios-robustez`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, head 343270ee (código 56763414; QA aprovado em d39c5624; review aprovado em 343270ee com A1 recomendado).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/reviews/096-k271-criterios-robustez.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/qa/096-k271-criterios-robustez.md`.

## Entregar
- "E2.4 (tech-lead): PR do K-271; o merge é do dono." (E2.4)
- (E3) (E2.4) Rodar da worktree `forge-check pr 096-criterios-apontamento-env --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref fix/k271-criterios-robustez --base develop` e confirmar `veredito: aprovado` (se não, pare e relate). Não atualizar a branch com a develop. Abrir o PR para a `develop` (squash) pelo gh, com o corpo escrito pela ferramenta Write num arquivo do scratchpad e passado por `--body-file`: o que muda, a troca da mensagem de falta do `.env` (A1 do review: de "Configuração inválida (variáveis: PG_MIGRADOR_URL)" para "bm:criterios-apontamento falhou: configuração: PG_MIGRADOR_URL"), os pareceres e `Cartão: K-271`. Esperar os checks até o fim e relatar cada um, dizendo no fim se o PR está todo verde. Não mesclar: o merge é do dono.
- (E1) (E2) Nada a entregar aqui: não nesta delegação.
- arquivos: nenhum

## Pronto quando
- PQ-1 (cmd): `gh pr list --head fix/k271-criterios-robustez --state all --json number` · espera: contém 'number'
