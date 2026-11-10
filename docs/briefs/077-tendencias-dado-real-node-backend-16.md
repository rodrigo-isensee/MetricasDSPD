Agente destino: forge:node-backend
Pedido: 077-tendencias-dado-real
Tipo: codigo
Branch: feature/077-l5-fluxo-real   Base: develop   Base-sha: 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc
Etapa: codigo   Cobre: E2.1

## Objetivo
Preparar o Lote 5 das tendências com dado real (K-211, pedido 077) para o PR: trazer a develop atual (com o 6b e o 8b, PRs 276 e 278) e corrigir a data da constante da virada do BusinessMap para o dia da abertura do PR, 2026-11-10 (A8 da revisão do desenho; A1 do review do lote). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/077-l5-fluxo-real` (head 93b46be641ec7751b1425004e417d3ac19237f57, review e QA aprovados).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052g/packages/metricas/src/core/criterios.ts`, só a constante `VERSAO_CRITERIO_TENDENCIA_FLUXO_DADO_REAL` e os testes que citam o id dela (`grep -rn "criterio-2026-11-09-tendencia-fluxo-dado-real"` na worktree).

## Entregar
- "E2.1 (node-backend): implementação por lote." (E2.1) Nesta delegação, só a preparação do Lote 5 para o PR.
- (E2) (E2.1) Na worktree, conferir `rev-parse --abbrev-ref HEAD` = `feature/077-l5-fluxo-real` e `status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-052g fetch origin develop`; `git -C /home/rodrigoisensee/MetricasDSPD-052g merge --no-ff origin/develop` (mensagem `merge: develop em feature/077-l5-fluxo-real` por `git commit -F`); conflito: `git merge --abort`, pare e relate.
- (E2) (E2.1) Na constante `VERSAO_CRITERIO_TENDENCIA_FLUXO_DADO_REAL`, trocar `data` para `2026-11-10` e o `id` para `criterio-2026-11-10-tendencia-fluxo-dado-real`, e atualizar só os testes que citam o id ou a data dela; nada mais muda. Rodar `pnpm run docs:gerar`, `pnpm run docs:fotografar` e `pnpm --filter @metricas-dspd/server run openapi:gerar` e commitar à parte o que mudar; `pnpm run docs:check` verde. eslint dos arquivos tocados, tsc e os testes de `packages/metricas`, `packages/contratos` e `server/tests/tendencia-fluxo-real-l5.test.ts` com no máximo 2 workers verdes; commit com `Cartão: K-211` (mensagem por `git commit -F` de arquivo gravado por Write no scratchpad), `git add` explícito por caminho; push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/077-l5-fluxo-real` (`github.com` em allowed_domains); esperar a CI do push com `gh run watch <id literal> --exit-status` (`api.github.com` em allowed_domains); sem PR.
- (E1) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 077-tendencias-dado-real até eb87204102afbb5c5d965f9a825dd1371c5ce9ab6a7e3ac1ff1888d6d4740cd7 (14 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/077-tendencias-dado-real.md; valem todas, leia-as nas fontes)
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

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g merge-base --is-ancestor origin/develop origin/feature/077-l5-fluxo-real` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/feature/077-l5-fluxo-real:packages/metricas/src/core/criterios.ts` · espera: contém 'criterio-2026-11-10-tendencia-fluxo-dado-real'
- PQ-3 (cmd): `gh run list --repo rodrigo-isensee/MetricasDSPD --branch feature/077-l5-fluxo-real --event push --limit 1 --json conclusion` · espera: contém '"success"'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
