Agente destino: forge:node-backend
Pedido: 077-tendencias-dado-real
Tipo: codigo
Branch: feature/077-l7-sust-real   Base: develop   Base-sha: 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc
Etapa: codigo   Cobre: E2.1

## Objetivo
Preparar o Lote 7 das tendências com dado real (K-211, pedido 077) para o PR: trazer a develop atual (`origin/develop`, com o Lote 5 por squash, PR 279). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/077-l7-sust-real` (head 8e47e4e367648c001f51814a458c423f53bce9cc, review e QA aprovados).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f log --oneline origin/develop..HEAD`.

## Entregar
- "E2.1 (node-backend): implementação por lote." (E2.1) Nesta delegação, só a preparação do Lote 7 para o PR.
- (E2) (E2.1) Na worktree, conferir `rev-parse --abbrev-ref HEAD` = `feature/077-l7-sust-real` e `status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-052f fetch origin develop`; `git -C /home/rodrigoisensee/MetricasDSPD-052f merge --no-ff origin/develop` (mensagem `merge: develop em feature/077-l7-sust-real` por `git commit -F`). Conflito só em arquivo que o Lote 5 tocou (o Lote 5 entrou na develop por squash com o mesmo conteúdo que a branch já tem): resolva ficando com a versão da branch do Lote 7 (`git checkout --ours` e `git add` do caminho) e confira depois que `git -C /home/rodrigoisensee/MetricasDSPD-052f diff --name-only origin/develop HEAD` lista só os arquivos do Lote 7 e os pareceres dele; conflito em outro arquivo: `git merge --abort`, pare e relate. Rodar com no máximo 2 workers `server/tests/tendencia-sust-real-l7.test.ts`, `server/tests/tendencia-fluxo-real-l5.test.ts`, `server/tests/qa-f6-painel.test.ts` e `packages/contratos/src/origem.test.ts`; tsc limpo. Push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/077-l7-sust-real` (`github.com` em allowed_domains); esperar a CI do push (`api.github.com` em allowed_domains); sem PR.
- (E1) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 077-tendencias-dado-real até e96111b3af39d71d503ae474c5b277cbe26a59291bdae143f65697ce5d4d3708 (15 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/077-tendencias-dado-real.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0019
- ADR 0019 (citada no pedido): cálculo das tendências pela biblioteca; nada muda nesta etapa.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): revisão do desenho docs/analises/077-desenho.md (lotes, contrato, testes, teto, ordem), parecer curto em docs/analises/077-desenho-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.0 (ux-designer): especificação curta da janela incompleta (P-077-1) e da ressalva do S2 na tendência de SLA (P-077-2), com acessibilidade e critérios de aceite, em docs/ux/077-tendencias.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido
- "E2.7 (devops-engineer): diagnóstico do pre-push preso no eslint . dentro do sandbox (só leitura, sem commit), para destravar os pushes da E2.4." · etapa de outra delegação; continua no pedido
- "Mudar o cálculo de O3, O4, S2 e S3" · fora do escopo do pedido; nada nesta delegação

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f merge-base --is-ancestor origin/develop origin/feature/077-l7-sust-real` · espera: rc=0
- PQ-2 (cmd): `gh run list --repo rodrigo-isensee/MetricasDSPD --branch feature/077-l7-sust-real --event push --limit 1 --json conclusion` · espera: contém '"success"'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
