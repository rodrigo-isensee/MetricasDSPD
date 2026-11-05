Agente destino: forge:tech-lead
Pedido: 072-limpar-branches
Tipo: codigo
Branch: develop   Base: develop   Base-sha: 39b761d4d04e14457690a547ba1f39d65ff2e8d7
Etapa: merge-integracao   Cobre: E1.1

## Objetivo
Limpar as branches e worktrees de trabalho já mescladas na develop e esquecidas, e classificar as não mescladas, para o repositório ficar só com o que está vivo (pedido 072, E1.1, K-223). Comandos com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD` e `gh`; nenhuma branch nova.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD branch -r`, `git -C /home/rodrigoisensee/Metricas/MetricasDSPD branch -vv` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree list`.
- Para cada branch: `gh pr list --repo rodrigo-isensee/MetricasDSPD --head <branch> --state all --json number,state,baseRefName,headRefOid,mergedAt`.
- A seção "Depois do merge" de R-FLUXO e a exceção de R-VERIFY, nos arquivos `R-FLUXO.md` e `R-VERIFY.md` de `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.32.0/docs/regras/`.

## Entregar
- "E1.1 (tech-lead): levantar cada branch com `gh pr list --state all --head`, apagar as que cumprem a regra do E1 (remota, local e worktree) e relatar a lista das que não cumprem, com o motivo de cada uma; na mesma levantada, classificar cada branch não mesclada em pronta (trabalho terminado, sem conflito relevante com a develop, com ou sem pareceres) ou não, com a evidência; as prontas viram cartão próprio e sobem pelo fluxo normal depois da promoção da release 071 (a develop está parada até lá)." (E1.1)
- (E1) (E1.1) Apagar, por branch de trabalho cujo PR está MERGED com base `develop` e cujo head remoto e local é igual ao `headRefOid` do PR: a worktree (`git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree remove <caminho>`, só se estiver limpa; com mudança local, não remova e ponha na lista), a branch remota (`git -C /home/rodrigoisensee/Metricas/MetricasDSPD push origin --delete <branch>`) e a local (`git -C /home/rodrigoisensee/Metricas/MetricasDSPD branch -d <branch>`; se o `-d` recusar, não use `-D`: ponha na lista). Branch só local sem remota, com upstream `[gone]` e PR MERGED com head igual: apaga a local. Ao fim, `git -C /home/rodrigoisensee/Metricas/MetricasDSPD fetch --prune origin` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree prune`.
- (E2) (E1.1) Para cada branch que não cumpre a regra (sem PR, PR aberto ou fechado sem merge, head diferente do `headRefOid`, commit local a mais, worktree com mudança): uma linha na lista com branch, PR e estado, o motivo e a classificação pronta ou não, com a evidência (por exemplo `git log --oneline origin/develop..<branch>` vazio ou não, `git diff --stat origin/develop...<branch>`, pareceres em docs/reviews e docs/qa com o nome do pedido); não apagar nem subir nada dessa lista.
- Relatório com três blocos: apagadas (branch, PR, sha), lista ao dono (uma linha por branch, como acima) e o comando final de contagem.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-05): "limpe as branchs" (resposta ao recibo: "vou fazer: apagar a branch remota, a local e a worktree de cada branch de trabalho com PR já mesclado na develop e sem nada além do que entrou; as sem PR, com PR não mesclado ou com commit local a mais vêm numa lista ao dono; não vou fazer: mexer em main, develop e homolog, nas branches em uso (L9-c, release 071 na worktree 052f, quadro do Jarvis), apagar o que não foi mesclado sem confirmação; é isso?"): limpeza confirmada com esse escopo. Completou, literal: "que ja foram apra develop" (só as que já entraram na develop).
### Do Histórico deste pedido, docs/pedidos/072-limpar-branches.md (DECISÃO TÉCNICA do Jarvis; contexto)
- O tech-lead faz a limpeza pela exceção de R-VERIFY (PR mesclado e head igual ao headRefOid sai sem nova confirmação); o resto vira lista ao dono; o dono acrescentou "caso alguma esteja pronta e tenha sido esquecida suba": cada branch pronta vira cartão e sobe com review, QA e segurança quando houver gatilho, depois da promoção da release 071; nada sobe sem PR.
### Restrições
- NÃO tocar: `main`, `develop`, `homolog`, `feature/069-l9c-projecao` e a worktree `/home/rodrigoisensee/MetricasDSPD-052c` (L9-c em volta), `docs/071-release` e a worktree `/home/rodrigoisensee/MetricasDSPD-052f` (release 071 em curso), `docs/jarvis-2026-10-23` e a worktree principal `/home/rodrigoisensee/Metricas/MetricasDSPD` (quadro do Jarvis, com mudanças locais: não fazer checkout, reset, stash nem clean nela), os arquivos `.env*`.
- R-VERIFY: nunca `--force`, `-D`, `--no-verify` nem `--admin`. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`.
- Comandos com caminho e nome literais (o hook recusa variável com ação crítica): uma chamada por branch, ou um laço com nomes literais; chamadas abaixo de 2 minutos.
- Recursos: tarefa leve (só git e gh).

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (dono): decidir, uma a uma ou em bloco, o destino das branches da lista." · etapa de outra delegação; continua no pedido
- Subir qualquer branch pronta (PR, review, QA): cartão próprio depois da promoção da release 071.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD ls-remote --heads origin develop homolog main feature/069-l9c-projecao docs/071-release` · espera: linhas=5
- PQ-2 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree list` · espera: contém 'MetricasDSPD-052f'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo; depois a lista ao dono. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
