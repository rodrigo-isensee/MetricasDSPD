## Objetivo
PR da correção do teste `.pg` do K-272 para a develop, que hoje está vermelha no check `banco`: branch `fix/k272-teste-pg`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, head 2f74f725 (código 6a285daa, classe T; review aprovado em 2f74f725; o CI do push em 6a285daa teve o `banco` verde).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/reviews/097-k272-teste-pg.md`.

## Entregar
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono." (E6.4) Nesta delegação, o PR da correção do teste.
- (E6) (E6.4) Rodar da worktree `forge-check pr 097-resumo-filtro-time --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref fix/k272-teste-pg --base develop` e confirmar `veredito: aprovado` (se não, pare e relate). Abrir o PR para a `develop` (squash) pelo gh, com corpo curto: a develop está vermelha no `banco` desde o PR 321 porque o teste esperava um type_id por opção; este PR ajusta o teste ao "Agrupar" e acrescenta uma categoria para provar a separação; o review; `Cartão: K-272`. Escrever o corpo com a ferramenta Write num arquivo do scratchpad e passar por `--body-file` (o hook recusa heredoc na mesma chamada do gh). Esperar os checks e relatar cada um, em especial o `banco`. Não mesclar: o merge é do dono.
- (E1) (E2) (E3) (E4) (E5) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: nenhum

## Pronto quando
- PQ-1 (cmd): `gh pr list --head fix/k272-teste-pg --state all --json number` · espera: contém 'number'
