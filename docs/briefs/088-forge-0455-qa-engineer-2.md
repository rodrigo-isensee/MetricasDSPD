Agente destino: forge:qa-engineer
Pedido: 088-forge-0455
Tipo: codigo
Branch: fix/k261-teste-hermetico   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: codigo   Cobre: E1.9

## Objetivo
QA do K-261 (BUG-088-QA1, achado A1 do QA do 088): branch `fix/k261-teste-hermetico`, worktree `/home/rodrigoisensee/MetricasDSPD-056`, commit 0c16aeb52601a49cf7404bb5bfb65a3cec37492b (entrega conferida), em paralelo ao review no mesmo head.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056 diff 129fc3d5ba918789e17d3dc1b663039795c4a9e6 0c16aeb52601a49cf7404bb5bfb65a3cec37492b`.
- `/home/rodrigoisensee/MetricasDSPD-056d/docs/qa/chore-forge-0455.md`: só o achado A1.

## Entregar
- "E1.9 (qa-engineer): QA do K-261." (E1.9)
- (E1.9) Rodar só `server/tests/ref-sync-apontamento-entrada.test.ts` com no máximo 2 workers, da raiz da worktree, e conferir que o caso "sem configuração" passa com um `.env` de mentira que define `PG_REF_URL` (o do próprio teste, em pasta temporária; nunca o `.env` real); uma mutação (tirar o módulo `--import` do filho) que o teste novo pega, restaurada antes do commit. Não rodar `pnpm run pronto` (suíte pesada na fila de outra worktree); a suíte completa fica com o CI do PR. Grave `docs/qa/088-k261-teste-hermetico.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 088-forge-0455`, `branch: fix/k261-teste-hermetico`, `commit: 0c16aeb52601a49cf7404bb5bfb65a3cec37492b`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado; commit só do parecer com `Cartão: K-261` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/fix/k261-teste-hermetico` (`github.com` em allowed_domains); commit e push em chamadas separadas; se o push for recusado por o review ter chegado antes, `git pull --no-rebase` da branch e novo push; sem PR.
- arquivos: docs/qa/088-k261-teste-hermetico.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 088-forge-0455 até 80faea8e93bd74c8642a8b15c879cde3e9d6be9fb4fd0c141a199c072007273d (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/088-forge-0455.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (dono): trocar o ref do marketplace do Forge de v0.45.2 para v0.45.5, atualizar o plugin e reiniciar a sessão." · etapa de outra delegação; continua no pedido
- "E1.2 (Jarvis, por ordem do dono, como no 084): `forge-upgrade` numa worktree limpa a partir da develop e envio da branch." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.4 (qa-engineer): QA (`pnpm run pronto`)." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop, depois do QA; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E1.7 (node-backend): correção do BUG-088-QA1 (K-261): o teste `server/tests/ref-sync-apontamento-entrada.test.ts` do caso sem configuração fica hermético (não depende do .env da máquina), na branch fix/k261-teste-hermetico a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-056." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): review do K-261." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): PR do K-261 para a develop, depois do QA." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 show origin/fix/k261-teste-hermetico:docs/qa/088-k261-teste-hermetico.md` · espera: contém 'commit: 0c16aeb52601a49cf7404bb5bfb65a3cec37492b'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
