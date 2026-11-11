Agente destino: forge:node-backend
Pedido: 094-lote-testes-e-guia
Tipo: codigo
Branch: fix/k266-seed-tmpdir   Base: develop   Base-sha: 18701297fd058a6cf420c6361c08a264871dfc87
Etapa: codigo   Cobre: E2.1

## Objetivo
K-266: `server/tests/seed-recusa-real.pg.test.ts`, linha 108, roda o processo filho (`pnpm exec tsx`) só com `PATH` e `HOME`, sem a pasta temporária; no sandbox dos agentes o `tsx` falha por ENOENT, o mesmo padrão corrigido no K-264, que criou um ajudante comum na branch dele (ajuda-cli-filho, novo, ainda fora da develop). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `fix/k266-seed-tmpdir` (a partir da develop 18701297fd058a6cf420c6361c08a264871dfc87, que ainda não tem o K-264).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/server/tests/seed-recusa-real.pg.test.ts`.
- O ajudante do K-264, que só existe na branch dele (`fix/k264-cli-tmpdir`, PR em aberto): ler com `git show` sobre essa branch, arquivo ajuda-cli-filho na pasta server/tests.

## Entregar
- "E2.1 (node-backend): K-266, na branch fix/k266-seed-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052d." (E2.1)
- (E2) (E2.1) Passar ao filho a pasta temporária do processo do teste (`TMPDIR`, quando definida), sem herdar mais nada e sem mudar asserção; como o ajudante do K-264 ainda não está na develop, fazer o ajuste local no próprio arquivo, do mesmo jeito do ajudante (o PR que entrar depois junta os dois). O teste é `.pg` (precisa de banco): não rodá-lo; provar com `pnpm --dir server exec tsc --noEmit` e o lint do arquivo, e deixar a execução ao check com banco do CI do PR. Commit com `Cartão: K-266` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/fix/k266-seed-tmpdir` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: server/tests/seed-recusa-real.pg.test.ts

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 094-lote-testes-e-guia até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/094-lote-testes-e-guia.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): K-265, na branch docs/k265-guia-pronto, worktree /home/rodrigoisensee/MetricasDSPD-052c." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review do K-265." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR do K-265; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review do K-266." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA do K-266." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR do K-266; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): K-267, na branch fix/k267-regex-pessoa, worktree /home/rodrigoisensee/MetricasDSPD-052f." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review do K-267." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA do K-267." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR do K-267; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d log -1 --format=%B origin/fix/k266-seed-tmpdir` · espera: contém 'Cartão: K-266'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
