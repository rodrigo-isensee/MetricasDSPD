Agente destino: forge:qa-engineer
Pedido: 094-lote-testes-e-guia
Tipo: codigo
Branch: fix/k266-seed-tmpdir   Base: develop   Base-sha: 18701297fd058a6cf420c6361c08a264871dfc87
Etapa: codigo   Cobre: E2.3

## Objetivo
QA do K-266: branch `fix/k266-seed-tmpdir`, worktree `/home/rodrigoisensee/MetricasDSPD-052d`, código em 1d7c4291 (1 linha em `server/tests/seed-recusa-real.pg.test.ts`), review aprovado (52427ad2), base develop 18701297fd058a6cf420c6361c08a264871dfc87. O teste é `.pg` (precisa de PostgreSQL): local ele é pulado; a execução real é o check com banco do CI do PR.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff 18701297fd058a6cf420c6361c08a264871dfc87 1d7c4291`.
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/reviews/094-k266-seed-tmpdir.md` (novo).

## Entregar
- "E2.3 (qa-engineer): QA do K-266." (E2.3)
- (E2) (E2.3) Conferir pelo diff que o filho recebe só a pasta temporária a mais (quando definida) e que nenhuma asserção mudou; rodar o arquivo com no máximo 2 workers (R-TETO) e registrar que os casos são pulados sem banco; o typecheck do server. Registrar no parecer que a prova de execução é o check com banco do CI do PR. Grave `docs/qa/094-k266-seed-tmpdir.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 094-lote-testes-e-guia`, `branch: fix/k266-seed-tmpdir`, `commit:` o sha40 de 1d7c4291, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado (vazio se não houver); `forge-check docs` sem erro nele. Commit só do parecer com `Cartão: K-266` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/fix/k266-seed-tmpdir` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/094-k266-seed-tmpdir.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 094-lote-testes-e-guia até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/094-lote-testes-e-guia.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): K-265, na branch docs/k265-guia-pronto, worktree /home/rodrigoisensee/MetricasDSPD-052c." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review do K-265." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR do K-265; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): K-266, na branch fix/k266-seed-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review do K-266." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR do K-266; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): K-267, na branch fix/k267-regex-pessoa, worktree /home/rodrigoisensee/MetricasDSPD-052f." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review do K-267." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA do K-267." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR do K-267; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/fix/k266-seed-tmpdir:docs/qa/094-k266-seed-tmpdir.md` · espera: contém 'branch: fix/k266-seed-tmpdir'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
