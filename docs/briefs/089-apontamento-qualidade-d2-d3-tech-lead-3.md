Agente destino: forge:tech-lead
Pedido: 089-apontamento-qualidade-d2-d3
Tipo: review
Branch: feature/089-apontamento-d2-d3-web   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: review   Cobre: E1.5
Revisar-sha: dafb325a214bdb6bd7a9dc287e02faf846b11ea2

## Objetivo
Pedido 089, front-end (branch `feature/089-apontamento-d2-d3-web`, worktree `/home/rodrigoisensee/MetricasDSPD-052f`): entrega 7a9b5055 conferida e a volta da revisão de UX em dafb325a (M-1 a M-3, B-1 a B-3 e B-5; B-4 fora). O parecer de UX (`docs/ux/089-revisao-apontamento.md`, gravado pelo ux-designer, sem shell) está sem commit na worktree e precisa ir à branch antes do review, pela regra das Etapas do pedido (o tech-lead leva o parecer do papel sem shell).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff 129fc3d5ba918789e17d3dc1b663039795c4a9e6 dafb325a214bdb6bd7a9dc287e02faf846b11ea2`.
- `/home/rodrigoisensee/MetricasDSPD-052f/docs/ux/089-revisao-apontamento.md` (novo).

## Entregar
- "E1.5 (tech-lead): review" (E1.5) Nesta delegação, só a branch do front.
- (E1) (E2) (E1.5) Primeiro, commitar só `docs/ux/089-revisao-apontamento.md` sem mudar o conteúdo (`git add` explícito pelo caminho, mensagem por `git commit -F` de arquivo gravado por Write no scratchpad, `Cartão: K-213`) e enviar. Depois, review do front contra o plano (seções 4.2 e 6) e o parecer de UX (achados aplicados; B-4 fora, como melhoria). Grave `docs/reviews/089-apontamento-d2-d3-web.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 089-apontamento-qualidade-d2-d3`, `branch: feature/089-apontamento-d2-d3-web`, `commit: dafb325a214bdb6bd7a9dc287e02faf846b11ea2`, veredito e `## Achados`; commit só do parecer com `Cartão: K-213`. Push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/089-apontamento-d2-d3-web` (`github.com` em allowed_domains), commit e push em chamadas separadas; sem PR. Grave só na worktree.
- arquivos: docs/ux/089-revisao-apontamento.md, docs/reviews/089-apontamento-d2-d3-web.md

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
- "E1.6 (qa-engineer): QA; cada parecer (review, QA e revisão de UX) commitado e enviado na própria branch por quem o grava, ou pelo tech-lead quando o papel não tem shell;" · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): PR (o merge é do dono)." · etapa de outra delegação; continua no pedido
- "E1.8 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f log --oneline dafb325a214bdb6bd7a9dc287e02faf846b11ea2..origin/feature/089-apontamento-d2-d3-web` · espera: linhas=2
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
