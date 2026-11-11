## Objetivo
Deixar o PR 323 (lote 9b) verde para o merge do dono. A branch `feature/075-9b` está agora em 632f8be8 (alguém atualizou a branch com a develop pelo GitHub quando a develop ainda estava vermelha no `banco`, antes do PR 324). Os checks desse head falharam: `banco` (o teste do K-272 que o PR 324 já corrigiu na develop) e `e2e-parte (1/2)` e `(2/2)` (causa não lida). A develop agora está verde (run 43084376256).

## Ler
- `gh pr checks 323` e o log das falhas dos runs 43083957242 e 43083950096 (`gh run view <id> --log-failed`, com `api.github.com`, `*.actions.githubusercontent.com` e `*.blob.core.windows.net` em allowed_domains).

## Entregar
- "E1.9 (tech-lead): PR por lote, depois do QA." (E1.9) Nesta delegação, deixar o PR 323 verde.
- (E1) (E1.9) Na worktree `/home/rodrigoisensee/MetricasDSPD-056`: `git fetch origin`, trazer a branch para 632f8be8 (`git merge --ff-only origin/feature/075-9b`) e atualizar com a develop só por merge (sem rebase nem force); se houver conflito, pare e relate. Ler a causa das falhas do e2e: se for da mudança do 9b, pare e relate o teste e a linha do erro; se for da develop antiga ou do runner, siga. Rodar `forge-check pr 075-bloqueios-reais --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref feature/075-9b --base develop` e, aprovado, enviar com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/feature/075-9b` (`github.com` em allowed_domains). Esperar os checks do novo head até o fim e relatar cada um, dizendo no fim se o PR está todo verde. Não mesclar: o merge é do dono.
- (E2) (E3) (E4) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: nenhum

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo
## Pronto quando
- PQ-1 (cmd): `gh pr view 323 --json state` · espera: contém 'state'
## Relatório
