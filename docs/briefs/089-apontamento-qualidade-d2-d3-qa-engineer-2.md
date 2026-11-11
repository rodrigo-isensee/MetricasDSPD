Agente destino: forge:qa-engineer
Pedido: 089-apontamento-qualidade-d2-d3
Tipo: qa
Branch: feature/089-apontamento-d2-d3   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: qa   Cobre: E1.6
Revisar-sha: 2ea9c636e2f584d97ce20b0fb27a1736b24a2b8e

## Objetivo
Volta de forma do parecer de QA do back-end do pedido 089 (`docs/qa/089-apontamento-d2-d3.md` (novo), commit 3dda6189 na `feature/089-apontamento-d2-d3`): a ferramenta recusa a linha "Nenhum achado bloqueante. Bugs: 0 crítico, 0 alto, 0 médio, 0 baixo." dentro do bloco `## Achados` (só linhas de achado no formato cabem ali). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h show 3dda6189:docs/qa/089-apontamento-d2-d3.md` (novo), na worktree.

## Entregar
- "E1.6 (qa-engineer): QA; cada parecer (review, QA e revisão de UX) commitado e enviado na própria branch por quem o grava" (E1.6) Nesta delegação, só a forma do parecer.
- (E1) (E2) (E1.6) Regravar `docs/qa/089-apontamento-d2-d3.md` inteiro pela ferramenta Write, uma vez só, com o mesmo conteúdo, só movendo a frase de contagem de bugs para fora do bloco `## Achados` (antes dele, por exemplo no resumo); `commit:` continua 2ea9c636e2f584d97ce20b0fb27a1736b24a2b8e. Commit só do parecer com `Cartão: K-213` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/feature/089-apontamento-d2-d3` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/qa/089-apontamento-d2-d3.md

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
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h log --oneline 3dda6189..origin/feature/089-apontamento-d2-d3 -- docs/qa/089-apontamento-d2-d3.md` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
