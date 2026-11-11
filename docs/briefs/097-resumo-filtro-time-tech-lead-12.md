## Objetivo
Destravar o PR do K-272 sem contornar nenhum portão. Branch `fix/k272-ap-tipo-categoria`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, head b93e012a (código 1d691f4e; merge da develop em dbd120a4; QA e review revalidados no head dbd120a4, ambos aprovados, pareceres gravados pela ferramenta Write pelos papéis). O `forge-check entrega` do pedido 097 recusa: com o brief mais novo de QA, o parecer de review aparece "fora do declarado no brief"; com o brief de PR do tech-lead, o de QA aparece "fora do declarado" (o parecer reescrito com remoção só passa se declarado no brief da entrega ou se reescrito por um portão de um pedido `<X>-REV`, função `reescrito_por_portao` do forge-check). Sem a linha "entrega conferida" do head, o `forge-check pr` não libera o PR.

## Ler
- A saída de `forge-check entrega --pedido 097-resumo-filtro-time --worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041 --branch fix/k272-ap-tipo-categoria --etapa codigo --sem-gravar`, rodado da raiz `/home/rodrigoisensee/Metricas/MetricasDSPD`.
- No forge-check do plugin (`/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.45.5/bin/forge-check`), as funções `reescrito_por_portao`, `pedido_da_revalidacao` e o trecho da conferência de escopo (linhas 2370 a 2420), e a skill do Forge sobre revalidação de parecer, se houver.

## Entregar
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono." (E6.4) Nesta delegação, o diagnóstico de como a revalidação depois do merge da develop deve ser feita para a ferramenta aceitar, e a proposta.
- (E6) (E6.4) Relatar ao Jarvis, sem mudar arquivos: (a) o caminho previsto pelo Forge para revalidar pareceres depois de atualizar a branch com a develop (por exemplo, o pedido `<X>-REV` e o formato dos briefs dele), com a citação da função ou da regra; (b) os passos concretos para o K-272 e para o L1 do pedido 099 (branch `fix/099-l1-sem-simulador`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, que tem a mesma situação); (c) se a regra do Forge tem um defeito (o `forge-check parecer delta` diz "nenhum arquivo do domínio mudou" e mesmo assim o `pr` pede revalidação), a proposta de correção para o Forge. Nenhum push, nenhum PR e nenhuma edição de parecer nesta delegação.
- (E1) (E2) (E3) (E4) (E5) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: nenhum

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 status --short` · espera: rc=0
