Agente destino: forge:node-backend
Pedido: 077-tendencias-dado-real
Tipo: codigo
Branch: feature/077-l1a-janela   Base: develop   Base-sha: 78cf396ce11acbe4a1caa2babf6306407690dd80
Etapa: codigo   Cobre: E2.1

## Objetivo
Lote 1a das tendências com dado real (cartão K-211, pedido 077, E2.1): a função única da janela incompleta na biblioteca e o campo opcional no contrato das duas tendências, sem ligar nada ao servidor ainda. Worktree `/home/rodrigoisensee/MetricasDSPD-052e` (livre: o lote 1b do 075 já está na develop), branch nova `feature/077-l1a-janela` a partir da develop.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md`: as seções "3. Regras técnicas fixadas" (só a regra da janela, A4), "4. Contrato" e "Lote 1a".
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/077-tendencias.md`: só os critérios CA-1, CA-3, CA-4 e CA-15.

## Entregar
- "E2.1 (node-backend): implementação por lote." (E2.1) Nesta delegação, só o Lote 1a; os outros lotes vêm em delegações seguintes da mesma etapa.
- (E2) (E2.1) Preparar a worktree: conferir `git -C /home/rodrigoisensee/MetricasDSPD-052e status --short` vazio, `git -C /home/rodrigoisensee/MetricasDSPD-052e fetch origin develop`, depois `git -C /home/rodrigoisensee/MetricasDSPD-052e switch -c feature/077-l1a-janela 78cf396ce11acbe4a1caa2babf6306407690dd80` e `pnpm install --frozen-lockfile` nela (não apagar a branch antiga).
- (E2) (E2.1) Implementar o Lote 1a como o desenho descreve: `janelaIncompleta(janela: Intervalo, historicoDesde?: string): boolean` em `packages/metricas/src/core/series.ts`, que recebe a janela já calculada por `janelaMovelDia` (nunca reimplementa as 12 semanas); `janelaIncompleta: { historicoDesde }` opcional por item de `meses` em `resultadoTendenciaFluxo` e `resultadoTendenciaSust` e o refine (mês com `janelaIncompleta` não traz estatística), mudança aditiva pela política; os testes da seção "Lote 1a" (fronteira, ausente, refine recusa e aceita, campo extra de pessoa some no parse, sem `.strict()`); `docs:fotografar` e `docs:check` verdes; nenhuma entrada em `aceitas.json` (se o `docs:check` acusar mudança incompatível, pare e relate).
- (E2) (E2.1) eslint, tsc e os testes dos pacotes tocados com no máximo 2 workers verdes; teto de 150 linhas de código e teste; commits com `Cartão: K-211` (mensagem gravada por Write num arquivo de caminho literal e `git commit -F`), `git add` explícito por caminho; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052e rev-parse --abbrev-ref HEAD` = feature/077-l1a-janela e enviar em primeiro plano com `git -C /home/rodrigoisensee/MetricasDSPD-052e push origin HEAD:refs/heads/feature/077-l1a-janela`; se o push sair com rc diferente de 0, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate; esperar a CI do push com `gh run watch <id> --exit-status` em primeiro plano (até 25 minutos) e relatar; sem PR.
- (E1) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (K-211, registrada no pedido 073): as tendências do Resumo entram no mapa real, como pedido novo (077).
- 2026-11-06 12:06: DECISÃO DO DONO (literal "Faca suas recomendacoes", resposta às P-077-1 a P-077-3): as três recomendações do Jarvis.
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-1, pela recomendação): ponto cuja janela de 12 semanas começa antes da primeira carga não publica e mostra janela incompleta.
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-2, pela recomendação): a tendência de SLA leva a ressalva do S2 (lote L3: notas no contrato e na tela, com o ux-designer).
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-3, pela recomendação): a passagem para dado real vira marca de critério (T2.6) no eixo das tendências.
- 2026-11-06 14:54: DECISÃO DO DONO: "A" (P-077-4, pela recomendação): a primeira carga é a data em que o histórico carregado começa (inicio_carga da carga inicial), não o dia em que a carga rodou. Destrava o Lote 3. PERGUNTA: P-077-5 vai ao dono; na fila: tabela P-E10-2, P-E10-5 e P-E10-6 (073).
- ADR 0019 (citada no pedido): o cálculo das tendências já existe por ela (uma fonte por tendência, mínimo de 20); este lote não muda o cálculo de O3, O4, S2 e S3 (Fora do escopo do pedido).
- 2026-11-06 15:38: DECISÃO TÉCNICA (Jarvis): o Lote 1a não depende das P-077-5 e P-077-6, abertas com o dono; o tech-lead confirma a revisão 3 do desenho em paralelo.
- Recursos: vitest com no máximo 2 workers (DECISÃO TÉCNICA do Jarvis, 075, 14:40); no máximo 2 pushes ao mesmo tempo (DECISÃO DO DONO, 075, 15:08), escalonados pelo Jarvis.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. GitHub: `github.com` e `api.github.com` em `allowed_domains`; npm: `registry.npmjs.org`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `server/`, a web, `origem.ts`, o mapa real, `docs/contratos/snapshots/aceitas.json`, o desenho, a especificação, o pedido, `KANBAN.md`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; feita
- "E1.2 (tech-lead): revisão do desenho docs/analises/077-desenho.md (lotes, contrato, testes, teto, ordem), parecer curto em docs/analises/077-desenho-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.0 (ux-designer): especificação curta da janela incompleta (P-077-1) e da ressalva do S2 na tendência de SLA (P-077-2), com acessibilidade e critérios de aceite, em docs/ux/077-tendencias.md, sem commit." · etapa de outra delegação; feita
- "E2.2 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh run list --repo rodrigo-isensee/MetricasDSPD --branch feature/077-l1a-janela --event push --limit 1 --json conclusion` · espera: contém '"success"'
- PQ-2 (push): `git ls-remote origin refs/heads/feature/077-l1a-janela` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-052e rev-parse HEAD`)
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052e diff --name-only 78cf396ce11acbe4a1caa2babf6306407690dd80 -- server web docs/contratos/snapshots/aceitas.json` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
