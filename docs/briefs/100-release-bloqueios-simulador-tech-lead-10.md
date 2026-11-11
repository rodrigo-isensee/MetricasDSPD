## Objetivo
A volta da release 100 está com os quatro pareceres revalidados na branch da volta (worktree `/home/rodrigoisensee/MetricasDSPD-052h`, head 2b85b70e: review d5d9d40b, segurança 0c43e495, QA b2c8e252, devops 2b85b70e, todos com `commit: 27ac9064fc4ffad4e7f3bf18241aa1979912c009`), mas o `forge-check entrega` recusa os três reescritos (review, segurança, QA) como "fora do declarado no brief", e sem a linha "entrega conferida" o `forge-check pr` não libera o PR. No seu diagnóstico do K-272 você mostrou que o caminho previsto pelo Forge para parecer reescrito com remoção depois de uma conferência é o pedido `<X>-REV` (`reescrito_por_portao`).

## Ler
- A saída do `forge-check entrega` do pedido 100-release-bloqueios-simulador para a branch da volta (worktree 052h, etapa codigo, `--sem-gravar`), rodado de `/home/rodrigoisensee/Metricas/MetricasDSPD`.
- No forge-check do plugin, `reescrito_por_portao` e `pedido_da_revalidacao`.

## Entregar
- "E1.4 (tech-lead): PR da docs/100-release para a develop, CI verde; o merge é do dono." (E1.4) Nesta delegação, o caminho de conformidade da volta e o PR.
- (E1) (E1.4) Dizer, com a regra citada, qual é o caminho que o Forge aceita para esta volta sem contornar nada (por exemplo, registrar a revalidação sob o pedido `100-release-bloqueios-simulador-REV`, com os briefs no formato que a função procura, e quem grava cada coisa). Se o caminho for só registro do Jarvis (pedido, briefs, selo), relate os arquivos e o conteúdo exatos e pare. Se não houver caminho sem refazer os portões, diga quais refazer. Sem mudar parecer, sem push e sem PR nesta delegação.
- arquivos: nenhum

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h status --short` · espera: rc=0
