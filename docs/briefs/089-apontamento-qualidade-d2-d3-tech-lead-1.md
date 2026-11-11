Agente destino: forge:tech-lead
Pedido: 089-apontamento-qualidade-d2-d3
Tipo: review
Branch: feature/089-apontamento-d2-d3   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: review   Cobre: E1.5
Revisar-sha: 2ea9c636e2f584d97ce20b0fb27a1736b24a2b8e

## Objetivo
Pedido 089, back-end (servidor e biblioteca): entrega conferida em 2ea9c636e2f584d97ce20b0fb27a1736b24a2b8e (classe N: review e QA no mesmo head). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/089-apontamento-d2-d3`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff 129fc3d5ba918789e17d3dc1b663039795c4a9e6 2ea9c636e2f584d97ce20b0fb27a1736b24a2b8e`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/089-plano-apontamento-d2-d3.md`.

## Entregar
- "E1.5 (tech-lead): review" (E1.5) Nesta delegação, só a branch do back-end (servidor e biblioteca).
- (E1) (E2) (E1.5) Review contra o plano e as regras do CLAUDE.md (nunca sobrescrever histórico; mudança de critério registrada com data, T2.6; GRANT por coluna). Revisar também os dois desvios do plano por GRANT (rótulo vigente por DISTINCT ON e família do critério pela métrica `apontamento-dicionario`) e se a versão de critério com data de entrada e a ordem de implantação (`ref:sync`, `criterios-apontamento <data>`, coleta de 12 meses) estão claras. Grave `docs/reviews/089-apontamento-d2-d3.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 089-apontamento-qualidade-d2-d3`, `branch: feature/089-apontamento-d2-d3`, `commit: 2ea9c636e2f584d97ce20b0fb27a1736b24a2b8e`, veredito e `## Achados`; commit só do parecer com `Cartão: K-213` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho). Commit do parecer primeiro (o QA espera por ele). push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/feature/089-apontamento-d2-d3` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Grave só na worktree.
- arquivos: docs/reviews/089-apontamento-d2-d3.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 089-apontamento-qualidade-d2-d3 até f41b6b2d55fc20ad4885a765956393cb17dd2f5bbfc4c919a2f78c5b175bf5e6 (1 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/089-apontamento-qualidade-d2-d3.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): plano curto: onde a flag é calculada e gravada, como a versão de critério entra (ref_versao_criterio, T2.6), o que acontece com os apontamentos já gravados (nunca sobrescrever histórico), o impacto na tela e no achado; sem commit, parecer em docs/analises/." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação de E1 e da parte de E2 no servidor e na biblioteca de métricas, pelo plano." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): parte de tela de E1 e E2, pelo plano." · etapa de outra delegação; continua no pedido
- "E1.4 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA;" · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): PR (o merge é do dono)." · etapa de outra delegação; continua no pedido
- "E1.8 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/feature/089-apontamento-d2-d3:docs/reviews/089-apontamento-d2-d3.md` · espera: contém 'commit: 2ea9c636e2f584d97ce20b0fb27a1736b24a2b8e'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
