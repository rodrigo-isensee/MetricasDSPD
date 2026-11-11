Agente destino: forge:qa-engineer
Pedido: 089-apontamento-qualidade-d2-d3
Tipo: qa
Branch: feature/089-apontamento-d2-d3   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: qa   Cobre: E1.6
Revisar-sha: 2ea9c636e2f584d97ce20b0fb27a1736b24a2b8e

## Objetivo
Pedido 089, back-end (servidor e biblioteca): entrega conferida em 2ea9c636e2f584d97ce20b0fb27a1736b24a2b8e (classe N: review e QA no mesmo head). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/089-apontamento-d2-d3`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff 129fc3d5ba918789e17d3dc1b663039795c4a9e6 2ea9c636e2f584d97ce20b0fb27a1736b24a2b8e`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/089-plano-apontamento-d2-d3.md`.

## Entregar
- "E1.6 (qa-engineer): QA" (E1.6) Nesta delegação, só a branch do back-end (servidor e biblioteca).
- (E1) (E2) (E1.6) Rodar com no máximo 2 workers os testes do classificador e do apontamento (metricas e server); uma mutação (devolver `execucao-tecnica` ao `sem-vinculo`) que os testes pegam; se houver banco de teste (PG_TESTE_URL), escrever e rodar o teste da releitura no Postgres (staging append-only, versão nova com a máscara nova, bits 8 e 16 preservados) em `server/tests/apontamento.pg.test.ts`; sem banco, registrar a lacuna. Grave `docs/qa/089-apontamento-d2-d3.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 089-apontamento-qualidade-d2-d3`, `branch: feature/089-apontamento-d2-d3`, `commit: 2ea9c636e2f584d97ce20b0fb27a1736b24a2b8e`, veredito, contagem de bugs e `## Achados`; commit só do parecer com `Cartão: K-213` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho). Commit depois do commit do parecer de review (espere por chamadas curtas de `git log`); o teste novo, se escrito, num commit próprio antes do parecer. push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/feature/089-apontamento-d2-d3` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Grave só na worktree.
- arquivos: docs/qa/089-apontamento-d2-d3.md, server/tests/apontamento.pg.test.ts

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
- "E1.5 (tech-lead): review;" · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): PR (o merge é do dono)." · etapa de outra delegação; continua no pedido
- "E1.8 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/feature/089-apontamento-d2-d3:docs/qa/089-apontamento-d2-d3.md` · espera: contém 'commit: 2ea9c636e2f584d97ce20b0fb27a1736b24a2b8e'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
