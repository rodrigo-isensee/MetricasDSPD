Agente destino: forge:tech-lead
Pedido: 089-apontamento-qualidade-d2-d3
Tipo: codigo
Branch: feature/089-apontamento-d2-d3-web   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: codigo   Cobre: E1.7

## Objetivo
PR do front-end do pedido 089: a `feature/089-apontamento-d2-d3-web` (head e2140735; código em dafb325a214bdb6bd7a9dc287e02faf846b11ea2 conferido; parecer de UX e6e6446c, review 1b1ecee8 e QA e2140735 aprovados) vai para a develop por squash com a CI verde. Worktree `/home/rodrigoisensee/MetricasDSPD-052f`. O PR do back-end é o 293 (rascunho, CI verde).

## Ler
- Na worktree: `docs/reviews/089-apontamento-d2-d3-web.md` (novo), `docs/qa/089-apontamento-d2-d3-web.md` (novo) e `docs/ux/089-revisao-apontamento.md` (novo).

## Entregar
- "E1.7 (tech-lead): PR (o merge é do dono)." (E1) (E2) (E1.7) Nesta delegação, só a branch do front: abrir o PR para a develop (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`, em chamada separada; `Cartão: K-213`; a dependência do PR 293 do back-end, que entra antes; o achado A1 do QA (fixture do E2E sem o subgrupo execucao-tecnica) como pendência registrada; PR pelo nome da branch, a partir da worktree) e esperar a CI verde. Não mesclar. Sem commit nem push nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 089-apontamento-qualidade-d2-d3 até c8ba5ae298f104e197574e24a3c4e4838f8caa430d813b615eb4bff1c018067d (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/089-apontamento-qualidade-d2-d3.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum commit nem push; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): plano curto: onde a flag é calculada e gravada, como a versão de critério entra (ref_versao_criterio, T2.6), o que acontece com os apontamentos já gravados (nunca sobrescrever histórico), o impacto na tela e no achado; sem commit, parecer em docs/analises/." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação de E1 e da parte de E2 no servidor e na biblioteca de métricas, pelo plano." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): parte de tela de E1 e E2, pelo plano." · etapa de outra delegação; continua no pedido
- "E1.4 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): review;" · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA; cada parecer (review, QA e revisão de UX) commitado e enviado na própria branch por quem o grava, ou pelo tech-lead quando o papel não tem shell;" · etapa de outra delegação; continua no pedido
- "E1.8 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/089-apontamento-d2-d3-web --base develop --json number --jq .[].number` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
