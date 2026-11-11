Agente destino: forge:node-backend
Pedido: 088-forge-0455
Tipo: codigo
Branch: fix/k261-teste-hermetico   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: codigo   Cobre: E1.7

## Objetivo
Corrigir o BUG-088-QA1 (cartão K-261): no teste `server/tests/ref-sync-apontamento-entrada.test.ts`, o caso "sem configuração" (linha 53) depende do `.env` da raiz, que a entrada do comando carrega por `process.loadEnvFile`; em máquina com `.env` que define `PG_REF_URL`, o resultado vira "conexão" e o teste cai. No CI (sem `.env`) passa. Worktree `/home/rodrigoisensee/MetricasDSPD-056`, branch `fix/k261-teste-hermetico`, a partir da develop 129fc3d5.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-056/server/tests/ref-sync-apontamento-entrada.test.ts` (inteiro).
- A entrada do comando `bm:ref-sync-apontamento` que o teste executa (o caminho está no próprio teste) e o ponto onde ela chama `process.loadEnvFile`.
- `/home/rodrigoisensee/MetricasDSPD-056d/docs/qa/chore-forge-0455.md`: só o achado A1.

## Entregar
- "E1.7 (node-backend): correção do BUG-088-QA1 (K-261): o teste `server/tests/ref-sync-apontamento-entrada.test.ts` do caso sem configuração fica hermético (não depende do .env da máquina), na branch fix/k261-teste-hermetico a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-056." (E1.7)
- (E1.7) Tornar o caso hermético sem afrouxar a asserção (segue exigindo código 1 e exatamente `configuração: PG_REF_URL`): o processo filho do teste não pode herdar `PG_REF_URL` nem carregar o `.env` da raiz do repositório (por exemplo, rodar o filho com `cwd` numa pasta temporária sem `.env`, ou um mecanismo explícito e testado de não carregar o arquivo). Se a solução mudar a entrada de produção, a mudança é mínima, não muda o comportamento em produção (o `.env` continua sendo lido quando o comando roda normalmente) e ganha teste. Prova: o teste passa com um `.env` de mentira, criado pelo próprio teste numa pasta temporária, que define `PG_REF_URL`; nunca leia nem crie o `.env` real da raiz.
- (E1.7) Rodar só os testes afetados, com no máximo 2 workers, e o comando de pronto do projeto (`pnpm run pronto`, da raiz da worktree). Commit com `Cartão: K-261` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push -u origin HEAD:refs/heads/fix/k261-teste-hermetico` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: server/tests/ref-sync-apontamento-entrada.test.ts

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 088-forge-0455 até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/088-forge-0455.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (se a correção exigir outro arquivo, pare e relate antes), o `.env` real, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (dono): trocar o ref do marketplace do Forge de v0.45.2 para v0.45.5, atualizar o plugin e reiniciar a sessão." · etapa de outra delegação; continua no pedido
- "E1.2 (Jarvis, por ordem do dono, como no 084): `forge-upgrade` numa worktree limpa a partir da develop e envio da branch." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.4 (qa-engineer): QA (`pnpm run pronto`)." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop, depois do QA; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): review do K-261." · etapa de outra delegação; continua no pedido
- "E1.9 (qa-engineer): QA do K-261." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): PR do K-261 para a develop, depois do QA." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 log -1 --format=%B origin/fix/k261-teste-hermetico` · espera: contém 'Cartão: K-261'
- PQ-2 (cmd): `pnpm run pronto` (da raiz da worktree) · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
