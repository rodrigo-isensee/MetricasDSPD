Agente destino: forge:tech-lead
Pedido: 092-melhorias-tecnicas-fila
Tipo: codigo
Branch: docs/k172-pronto-praticas   Base: develop   Base-sha: 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13
Etapa: codigo   Cobre: E2.1

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

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 092-melhorias-tecnicas-fila até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/092-melhorias-tecnicas-fila.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): K-121, na branch docs/k121-frontmatter, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): K-174, na branch fix/k174-docs-contratos-carga, worktree /home/rodrigoisensee/MetricasDSPD-052g. - E1.2, E2.2 e" · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review de cada branch." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA do K-174 (E1 e E2 são só documentação, classe T). - E1.3, E2.3 e" · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR de cada branch para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b log -1 --format=%B origin/docs/k172-pronto-praticas` · espera: contém 'Cartão: K-172'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
