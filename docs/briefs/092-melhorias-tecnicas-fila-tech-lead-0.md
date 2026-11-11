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

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log -1 --format=%B origin/docs/k121-frontmatter` · espera: contém 'Cartão: K-121'
