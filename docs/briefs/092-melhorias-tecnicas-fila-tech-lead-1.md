Agente destino: forge:tech-lead
Pedido: 092-melhorias-tecnicas-fila
Tipo: codigo
Branch: docs/k121-frontmatter   Base: develop   Base-sha: 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13
Etapa: codigo   Cobre: E1.1

## Objetivo
K-121: os documentos antigos de docs/qa e docs/architecture sem frontmatter (ADR 0004) fazem o `forge-check docs` listar erros antigos que escondem achado novo. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `docs/k121-frontmatter` (a partir da develop 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/adr/0004-documentacao-e-frontmatter.md` ou o ADR 0004 da pasta `docs/adr/` (o que define o frontmatter).
- A saída de `forge-check docs` rodada da raiz da worktree (a lista dos documentos sem frontmatter).

## Entregar
- "E1.1 (tech-lead): K-121, na branch docs/k121-frontmatter, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." (E1.1)
- (E1) (E1.1) Acrescentar o frontmatter exigido pelo ADR 0004 aos documentos antigos de `docs/qa/` e `docs/architecture/` que o `forge-check docs` acusa por falta dele, sem mudar o corpo de nenhum (os valores vêm do próprio documento: pedido, data, papel; o que não der para saber vai como o ADR manda para campo desconhecido). Não corrigir outros erros que o `forge-check docs` acuse (vão ao relatório). Rodar `forge-check docs` e `pnpm run docs:check` da raiz da worktree antes e depois. Commit com `Cartão: K-121` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelos caminhos); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/docs/k121-frontmatter` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. No relatório, a lista exata dos arquivos alterados.
- (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: os documentos de docs/qa/ e docs/architecture/ que o forge-check docs acusa por falta de frontmatter (só o frontmatter)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 092-melhorias-tecnicas-fila até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/092-melhorias-tecnicas-fila.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E2.1 (tech-lead): K-172, na branch docs/k172-pronto-praticas, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): K-174, na branch fix/k174-docs-contratos-carga, worktree /home/rodrigoisensee/MetricasDSPD-052g. - E1.2, E2.2 e" · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review de cada branch." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA do K-174 (E1 e E2 são só documentação, classe T). - E1.3, E2.3 e" · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR de cada branch para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log -1 --format=%B origin/docs/k121-frontmatter` · espera: contém 'Cartão: K-121'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
