## Objetivo
K-172: `docs/engineering/praticas.md`, seção 9, item "Autores", diz "`pnpm run pronto` verde antes de **cada** commit", o que contradiz a decisão do dono de 2026-10-21 (pedido 026: "durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final") e já reprovou 4 briefs. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, branch `docs/k172-pronto-praticas` (a partir da develop 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/engineering/praticas.md`, seção 9.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/026-front-do-011-lote3.md`, linhas 40 e 143 (a decisão do dono e a leitura dela para commits só de parecer).

## Entregar
- "E2.1 (tech-lead): K-172, na branch docs/k172-pronto-praticas, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." (E2.1)
- (E2) (E2.1) Trocar só a frase do item "Autores" pelo texto da decisão (testes e typecheck do pacote alterado durante o desenvolvimento; `pnpm run pronto` completo uma vez, antes do commit final da branch; commit só de parecer não é o commit final), citando a decisão do dono de 2026-10-21; procurar a mesma regra em outros pontos de `praticas.md` e alinhar só se disser o mesmo. Não afrouxar: o pronto completo continua obrigatório antes do commit final. Rodar `pnpm run docs:check` da raiz da worktree. Commit com `Cartão: K-172` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/docs/k172-pronto-praticas` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/engineering/praticas.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b log -1 --format=%B origin/docs/k172-pronto-praticas` · espera: contém 'Cartão: K-172'
