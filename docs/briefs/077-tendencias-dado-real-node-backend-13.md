Agente destino: forge:node-backend
Pedido: 077-tendencias-dado-real
Tipo: codigo
Branch: feature/077-l5-fluxo-real   Base: develop   Base-sha: 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc
Etapa: codigo   Cobre: E2.1

## Objetivo
Retomada do Lote 5 (a sessão reiniciou com o trabalho sem commit). Lote 5 das tendências com dado real (K-211, pedido 077, E2.1): TENDENCIA_FLUXO entra no mapa real (`origem.ts`), com a constante da virada do BusinessMap em `VERSOES_DA_BIBLIOTECA` e o teste de rota ponta a ponta da janela incompleta. Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch nova `feature/077-l5-fluxo-real` a partir da develop 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc (já com o 8a).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md`: as seções "4. Contrato", "Lote 5", "Lote 8" e "5. Ordem, teto e conflito com o 075".
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho-revisao-tech-lead.md`: só A8, A9, A11 e A12 (a A12 corrige o exemplo de prova do Lote 5 que está no desenho).

## Entregar
- "E2.1 (node-backend): implementação por lote." (E2.1) Nesta delegação, só o Lote 5; os outros lotes vêm em delegações seguintes da mesma etapa.
- (E2) (E2.1) Retomada (DECISÃO TÉCNICA do Histórico de 2026-11-10 08:56): a delegação anterior (node-backend-12) parou com a sessão; a worktree `/home/rodrigoisensee/MetricasDSPD-052g` já está na branch `feature/077-l5-fluxo-real` (criada em 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc), sem commit, com `packages/contratos/src/origem.ts`, `packages/contratos/src/origem.test.ts` e `packages/metricas/src/core/criterios.ts` alterados e `server/tests/tendencia-fluxo-real-l5.test.ts` novo. Não refazer a preparação da worktree: ler o que já está feito, conferir contra o desenho e completar o lote pelo item seguinte (sem `pnpm install` se `node_modules` já existir).
- (E2) (E2.1) Implementar o Lote 5 como o desenho descreve: id `TENDENCIA_FLUXO` em `METRICAS_ORIGEM_REAL`, mantido em `METRICAS_SEM_SIMULACAO`; `origem.test.ts` afirma o id presente e "id do mapa real nunca simulável" (A9); constante da virada do BusinessMap em `VERSOES_DA_BIBLIOTECA` (`core/criterios.ts`), `afeta: ['TENDENCIA_FLUXO']`, data = dia de hoje (a do PR; corrigida no merge se escorregar, A8). Testes de rota sobre a base de teste, sem mock (A11): `historicoDesde = 2026-07-01` e `dataReferencia = 2026-12-01` → junho, julho e agosto com `janelaIncompleta` e setembro, outubro e novembro publicados no mesmo resultado (A12 da revisão do desenho, que corrige o exemplo do desenho); tipo com 19 entregues sai `insuficiente`; dado do Acelerato não altera o resultado; marca da virada em `criterios`; o mês anterior ao histórico sai com `contagemParcial` (8a). Nenhum cálculo novo: tempo, percentil e série passam pela biblioteca compartilhada (T2.5).
- (E2) (E2.1) Artefatos gerados: antes do push, rodar `pnpm run docs:gerar`, `pnpm run docs:fotografar` e `pnpm --filter @metricas-dspd/server run openapi:gerar` e commitar à parte os que mudarem, entre `docs/contratos/metricas/TENDENCIA_FLUXO.md` e `docs/contratos/metricas/TENDENCIA_SUST.md`, as fotografias novas em `docs/contratos/snapshots/resultados/` e `docs/api/openapi.json` (DECISÃO TÉCNICA de 2026-11-06 17:22); `pnpm run docs:check` verde; sem entrada em `aceitas.json` (se o `docs:check` acusar mudança incompatível, pare e relate: volta ao arquiteto).
- (E2) (E2.1) eslint, tsc e os testes dos pacotes tocados com no máximo 2 workers verdes, com a cobertura dos arquivos tocados (a CI exige 100%); teto de 150 linhas de código e teste contado pela saída literal de `git diff --numstat --no-renames 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc...HEAD` (adições e remoções); `forge-check sobreposicao` contra os PRs abertos do 075 e relatar; commits com `Cartão: K-211` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-nb-077-l5.txt` e `git commit -F` com esse caminho literal), `git add` explícito por caminho; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052g rev-parse --abbrev-ref HEAD` = feature/077-l5-fluxo-real e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/077-l5-fluxo-real` em primeiro plano, com timeout de 600 s na ferramenta (o pre-push só roda lint e typecheck do alterado, cerca de 15 s); se o rc não for 0, conferir `git ls-remote` antes de repetir; esperar a CI do push com `gh run watch <id literal> --exit-status` e relatar; sem PR.
- (E1) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 077-tendencias-dado-real até eb87204102afbb5c5d965f9a825dd1371c5ce9ab6a7e3ac1ff1888d6d4740cd7 (14 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/077-tendencias-dado-real.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0019
- ADR 0019 (citada no pedido): o cálculo das tendências já existe por ela (uma fonte por tendência, mínimo de 20); este lote não muda o cálculo de O3, O4, S2 e S3 (Fora do escopo do pedido).
- Recursos: vitest com no máximo 2 workers (DECISÃO TÉCNICA do Jarvis, 075, 14:40); regra da noite do dono (075, 2026-11-07 00:07): até 3 agentes e 1 git push por vez, escalonados pelo Jarvis.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. GitHub: `github.com` e `api.github.com` em `allowed_domains`; npm: `registry.npmjs.org`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: a web (Lote 8b), o id `TENDENCIA_SUST` no mapa real (Lote 7), `docs/contratos/snapshots/aceitas.json`, `server/migrations`, GRANTs, o desenho, a especificação, o pedido, `KANBAN.md`, outras worktrees, a `develop`, a `homolog` e a `main`.
- forge-check: use `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.45.0/bin/forge-check` (o `forge-check` do PATH aponta para a cópia do Windows, quebrada; DECISÃO TÉCNICA do Histórico de 2026-11-10 08:56).

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
- PQ-1 (cmd): `gh run list --repo rodrigo-isensee/MetricasDSPD --branch feature/077-l5-fluxo-real --event push --limit 1 --json conclusion` · espera: contém '"success"'
- PQ-2 (push): `git ls-remote origin refs/heads/feature/077-l5-fluxo-real` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-052g rev-parse HEAD`)
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g diff --name-only 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc -- web server/migrations docs/contratos/snapshots/aceitas.json` · espera: linhas=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
