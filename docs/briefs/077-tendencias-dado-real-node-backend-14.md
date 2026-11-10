Agente destino: forge:node-backend
Pedido: 077-tendencias-dado-real
Tipo: codigo
Branch: feature/077-l5-fluxo-real   Base: develop   Base-sha: 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc
Etapa: codigo   Cobre: E2.1

## Objetivo
Volta do Lote 5 para a A14 (sem carga inicial → sem-dado-real). Lote 5 das tendências com dado real (K-211, pedido 077, E2.1): TENDENCIA_FLUXO entra no mapa real (`origem.ts`), com a constante da virada do BusinessMap em `VERSOES_DA_BIBLIOTECA` e o teste de rota ponta a ponta da janela incompleta. Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch nova `feature/077-l5-fluxo-real` a partir da develop 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc (já com o 8a).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md`: as seções "4. Contrato", "Lote 5", "Lote 8" e "5. Ordem, teto e conflito com o 075".
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho-revisao-tech-lead.md`: só A8, A9, A11, A12 e A14 (a A14 põe no Lote 5 o sem-dado-real por falta de carga).

## Entregar
- "E2.1 (node-backend): implementação por lote." (E2.1) Nesta delegação, só o Lote 5; os outros lotes vêm em delegações seguintes da mesma etapa.
- (E2) (E2.1) Volta do Lote 5 (DECISÃO TÉCNICA do Histórico de 2026-11-10 09:28): a worktree `/home/rodrigoisensee/MetricasDSPD-052g` já está na branch `feature/077-l5-fluxo-real` com o lote enviado (2e7373087f593913b90acb951126c4850a82d311, CI verde); conferir `branch --show-current` e `status --short` vazio antes de editar.
- (E2) (E2.1) Completar o Lote 5 com a A14 da revisão do desenho: com `TENDENCIA_FLUXO` no mapa real, sem carga inicial com sucesso do BusinessMap (`historicoDesde` ausente no contexto), a rota responde `sem-dado-real` em vez de publicar a série, decidido no serviço ou numa função pura testada direto (nenhum cálculo novo; T2.5). Teste de rota sobre a base de teste, sem mock: sem carga inicial com sucesso → `sem-dado-real`; com carga → o resultado de hoje não muda. A data da constante da virada fica como está (corrigida no merge, A8). Todo ramo novo com teste (a CI exige 100% de ramos no server).
- (E2) (E2.1) Artefatos gerados: antes do push, rodar `pnpm run docs:gerar`, `pnpm run docs:fotografar` e `pnpm --filter @metricas-dspd/server run openapi:gerar` e commitar à parte os que mudarem, entre `docs/contratos/metricas/TENDENCIA_FLUXO.md` e `docs/contratos/metricas/TENDENCIA_SUST.md`, as fotografias novas em `docs/contratos/snapshots/resultados/` e `docs/api/openapi.json` (DECISÃO TÉCNICA de 2026-11-06 17:22); `pnpm run docs:check` verde; sem entrada em `aceitas.json` (se o `docs:check` acusar mudança incompatível, pare e relate: volta ao arquiteto).
- (E2) (E2.1) eslint, tsc e os testes dos pacotes tocados com no máximo 2 workers verdes, com a cobertura dos arquivos tocados (a CI exige 100%); teto de 150 linhas de código e teste contado pela saída literal de `git diff --numstat --no-renames 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc...HEAD` (adições e remoções); `forge-check sobreposicao` contra os PRs abertos do 075 e relatar; commits com `Cartão: K-211` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-nb-077-l5.txt` e `git commit -F` com esse caminho literal), `git add` explícito por caminho; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052g rev-parse --abbrev-ref HEAD` = feature/077-l5-fluxo-real e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/077-l5-fluxo-real` em primeiro plano, com timeout de 600 s na ferramenta (o pre-push só roda lint e typecheck do alterado, cerca de 15 s); se o rc não for 0, conferir `git ls-remote` antes de repetir; esperar a CI do push com `gh run watch <id literal> --exit-status` e relatar; sem PR.
- (E1) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 077-tendencias-dado-real até eb87204102afbb5c5d965f9a825dd1371c5ce9ab6a7e3ac1ff1888d6d4740cd7 (14 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/077-tendencias-dado-real.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0019
- ADR 0019 (citada no pedido): o cálculo das tendências já existe por ela (uma fonte por tendência, mínimo de 20); este lote não muda o cálculo de O3, O4, S2 e S3 (Fora do escopo do pedido).
- Recursos: vitest com no máximo 2 workers (DECISÃO TÉCNICA do Jarvis, 075, 14:40); regra da noite do dono (075, 2026-11-07 00:07): até 3 agentes e 1 git push por vez, escalonados pelo Jarvis.
- 2026-11-10 09:28: Lote 5 (node-backend-13) enviado: 2e737308, CI verde; ajuste em server/tests/qa-f6-painel.test.ts (lista de ids reais). Faltou a parte da A14 que a revisão do desenho põe no Lote 5 (TENDENCIA_FLUXO sem carga inicial com sucesso → sem-dado-real, com teste de rota), que o brief -13 não pediu (falha do brief, não do agente). DECISÃO TÉCNICA (Jarvis): volta ao node-backend (node-backend-14) só para a A14, na mesma branch, dentro do teto do lote.
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
