estado: nenhum PR para feature/077-l5-fluxo-real
estado: origin/develop 0 commits à frente do Base-sha
jarvis-recorrente: decisao em 103 briefs codigo (30 dias) · confira: grave a decisão no pedido antes do brief; o `brief gerar` copia as linhas de decisão do dono (R-BRIEF)
jarvis-recorrente: escopo em 57 briefs codigo (30 dias) · confira: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
jarvis-recorrente: forma em 47 briefs codigo (30 dias) · confira: envie a saída de `forge-check brief mensagem` (cabeçalho, caminho e hash; R-BRIEF)
Agente destino: forge:node-backend
Pedido: 077-tendencias-dado-real
Tipo: codigo
Branch: feature/077-l5-fluxo-real   Base: develop   Base-sha: 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc
Etapa: codigo   Cobre: E2.1

## Objetivo
Lote 5 das tendências com dado real (K-211, pedido 077, E2.1): TENDENCIA_FLUXO entra no mapa real (`origem.ts`), com a constante da virada do BusinessMap em `VERSOES_DA_BIBLIOTECA` e o teste de rota ponta a ponta da janela incompleta. Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch nova `feature/077-l5-fluxo-real` a partir da develop 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc (já com o 8a).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md`: as seções "4. Contrato", "Lote 5", "Lote 8" e "5. Ordem, teto e conflito com o 075".
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho-revisao-tech-lead.md`: só A8, A9 e A11.

## Entregar
- "E2.1 (node-backend): implementação por lote." (E2.1) Nesta delegação, só o Lote 5; os outros lotes vêm em delegações seguintes da mesma etapa.
- (E2) (E2.1) Preparar a worktree: conferir `git -C /home/rodrigoisensee/MetricasDSPD-052g status --short` vazio (a worktree está na branch do 075 6a, já mesclada), `git -C /home/rodrigoisensee/MetricasDSPD-052g fetch origin develop`, depois `git -C /home/rodrigoisensee/MetricasDSPD-052g switch -c feature/077-l5-fluxo-real 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc` e `pnpm install --frozen-lockfile` nela (não apagar a branch antiga).
- (E2) (E2.1) Implementar o Lote 5 como o desenho descreve: id `TENDENCIA_FLUXO` em `METRICAS_ORIGEM_REAL`, mantido em `METRICAS_SEM_SIMULACAO`; `origem.test.ts` afirma o id presente e "id do mapa real nunca simulável" (A9); constante da virada do BusinessMap em `VERSOES_DA_BIBLIOTECA` (`core/criterios.ts`), `afeta: ['TENDENCIA_FLUXO']`, data = dia de hoje (a do PR; corrigida no merge se escorregar, A8). Testes de rota sobre a base de teste, sem mock (A11): `historicoDesde = 2026-01-01` e `dataReferencia = 2026-12-01` → fevereiro com `janelaIncompleta` e abril em diante publicados no mesmo resultado; tipo com 19 entregues sai `insuficiente`; dado do Acelerato não altera o resultado; marca da virada em `criterios`; o mês anterior ao histórico sai com `contagemParcial` (8a). Nenhum cálculo novo: tempo, percentil e série passam pela biblioteca compartilhada (T2.5).
- (E2) (E2.1) Artefatos gerados: antes do push, rodar `pnpm run docs:gerar`, `pnpm run docs:fotografar` e `pnpm --filter @metricas-dspd/server run openapi:gerar` e commitar à parte os que mudarem, entre `docs/contratos/metricas/TENDENCIA_FLUXO.md` e `docs/contratos/metricas/TENDENCIA_SUST.md`, as fotografias novas em `docs/contratos/snapshots/resultados/` e `docs/api/openapi.json` (DECISÃO TÉCNICA de 2026-11-06 17:22); `pnpm run docs:check` verde; sem entrada em `aceitas.json` (se o `docs:check` acusar mudança incompatível, pare e relate: volta ao arquiteto).
- (E2) (E2.1) eslint, tsc e os testes dos pacotes tocados com no máximo 2 workers verdes, com a cobertura dos arquivos tocados (a CI exige 100%); teto de 150 linhas de código e teste contado pela saída literal de `git diff --numstat --no-renames 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc...HEAD` (adições e remoções); `forge-check sobreposicao` contra os PRs abertos do 075 e relatar; commits com `Cartão: K-211` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-nb-077-l5.txt` e `git commit -F` com esse caminho literal), `git add` explícito por caminho; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052g rev-parse --abbrev-ref HEAD` = feature/077-l5-fluxo-real e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/077-l5-fluxo-real` em primeiro plano, com timeout de 600 s na ferramenta (o pre-push só roda lint e typecheck do alterado, cerca de 15 s); se o rc não for 0, conferir `git ls-remote` antes de repetir; esperar a CI do push com `gh run watch <id literal> --exit-status` e relatar; sem PR.
- (E1) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- - 2026-11-06 11:11: DECISÃO DO DONO: "A" (K-211, registrada no pedido 073): as tendências do Resumo entram no mapa real, como pedido novo (077).
- - 2026-11-06 12:06: DECISÃO DO DONO (literal "Faca suas recomendacoes", resposta às P-077-1 a P-077-3): as três recomendações do Jarvis.
- - 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-1, pela recomendação): ponto cuja janela de 12 semanas começa antes da primeira carga não publica e mostra janela incompleta.
- - 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-2, pela recomendação): a tendência de SLA leva a ressalva do S2 (lote L3: notas no contrato e na tela, com o ux-designer).
- - 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-3, pela recomendação): a passagem para dado real vira marca de critério (T2.6) no eixo das tendências.
- - 2026-11-06 14:54: DECISÃO DO DONO: "A" (P-077-4, pela recomendação): a primeira carga é a data em que o histórico carregado começa (inicio_carga da carga inicial), não o dia em que a carga rodou. Destrava o Lote 3. PERGUNTA: P-077-5 vai ao dono; na fila: tabela P-E10-2, P-E10-5 e P-E10-6 (073).
- - 2026-11-07 12:56: DECISÃO DO DONO (literal): "Isso a 1" (merge agrupado, leitura 1): cada lote segue com review, QA e conferência próprios e entra numa branch de integração; só ela vira um PR único para a develop. DECISÃO TÉCNICA (Jarvis): branch `integracao/2026-11-07` criada pelo tech-lead a partir da develop atual; cada lote, depois do QA conferido, entra nela por merge (--no-ff) feito pelo tech-lead, com o forge-check pr do lote limpo; no fim, um PR único integracao/2026-11-07 → develop (merge commit), com a lista de lotes e pareceres; os PRs 256 e 266 ficam abertos até lá e fecham com o PR único. O dono faz um update-branch e um merge só.
- - 2026-11-07 19:15: DECISÃO DO DONO (literal): "A" (P-077-5, pela recomendação): mês anterior ao início do histórico não mostra a contagem (concluídos e volume); fica marcado janela incompleta com o motivo. DECISÃO TÉCNICA (Jarvis): molde aditivo do desenho (Lote 8: 8a node-backend, 8b react-frontend), antes do Lote 5, como o desenho manda. PERGUNTA: (Jarvis) 3 de 4: P-077-6.
- - 2026-11-07 19:16: DECISÃO DO DONO (literal): "A" (P-077-6, opção (a), pela recomendação): o Acelerato não tem início de histórico; nenhum ponto da tendência de SLA sai janela incompleta por isso. Destrava os Lotes 3b e 7. PERGUNTA: (Jarvis) 4 de 4: QA do PR 256 (pedido 082).
- - 2026-11-07 21:55: DECISÃO DO DONO (literal): "Sim foi A" (confirmação da P-077-6: o "A" é a opção (a), o Acelerato não tem início de histórico). O 3b deixa de estar segurado. PERGUNTA: (Jarvis) ao dono: confirmação da P-077-5 (contagem parcial na API com marca e escondida só na tela, ou fora da API).
- - 2026-11-07 21:56: DECISÃO DO DONO (literal): "A" (confirmação da P-077-5, pergunta "O que me recomenda para 2?" respondida com a recomendação: o número parcial continua no resultado da API, marcado como contagem parcial, e só a tela o esconde; molde aditivo, Lotes 8a e 8b). O 8a deixa de estar segurado. PERGUNTA: (Jarvis) ao dono: como fechar o merge agrupado.
- - 2026-11-07 21:57: DECISÃO DO DONO (literal): "A" (como fechar o merge agrupado: voltar a um PR por lote para a develop; a branch integracao/2026-11-07 é descartada). Revoga, para o que falta, a leitura 1 de 12:56. DECISÃO TÉCNICA (Jarvis): o tech-lead atualiza cada branch com a develop, abre os PRs do 4c e do 6a (075) e do 4b e do 6b (077, com os pareceres de interface commitados antes) e deixa cada um pronto pelo forge-fechar; o dono mescla, um por vez, com update-branch quando ficarem BEHIND. MELHORIA (cartão Forge): forge-check pr reconhecer os pareceres dos lotes mesclados numa branch de integração.
- - 2026-11-07 22:46: DECISÃO DO DONO (literal): "A" (o dono pausa o guarda de lint enquanto o time envia). Fila: PRs do 075 (tech-lead-35) agora; depois os PRs do 4b e do 6b (tech-lead-23); o push do 3b sai com o node-backend depois do 8a.
- - 2026-11-08 20:01: DECISÃO DO DONO (literal): "A" (pre-push só com os arquivos alterados): vira o pedido 083.
- ADR 0019 (citada no pedido): o cálculo das tendências já existe por ela (uma fonte por tendência, mínimo de 20); este lote não muda o cálculo de O3, O4, S2 e S3 (Fora do escopo do pedido).
- Recursos: vitest com no máximo 2 workers (DECISÃO TÉCNICA do Jarvis, 075, 14:40); regra da noite do dono (075, 2026-11-07 00:07): até 3 agentes e 1 git push por vez, escalonados pelo Jarvis.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. GitHub: `github.com` e `api.github.com` em `allowed_domains`; npm: `registry.npmjs.org`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: a web (Lote 8b), o id `TENDENCIA_SUST` no mapa real (Lote 7), `docs/contratos/snapshots/aceitas.json`, `server/migrations`, GRANTs, o desenho, a especificação, o pedido, `KANBAN.md`, outras worktrees, a `develop`, a `homolog` e a `main`.

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
