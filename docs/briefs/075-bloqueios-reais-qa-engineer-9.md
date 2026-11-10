Agente destino: forge:qa-engineer
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l5a-tela   Base: develop   Base-sha: da61dbc2318e23db7e848c8702591522a6700aad
Etapa: qa   Cobre: E1.8

## Objetivo
Volta do QA do lote 5a do pedido 075 (K-204): a conferência da entrega (qa-engineer-7) achou dois pontos do Entregar sem cumprir: o axe dos componentes tocados não rodou e o contraste foi medido pela fórmula, não pela ferramenta de acessibilidade do projeto. Só esses dois pontos; o resto do parecer `docs/qa/075-l5a-tela.md` (head 7391e715) fica. Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `feature/075-l5a-tela`, código em 6d4a392cf75ecf6c9f3c9c5589fc5ac878335991.

## Ler
- Na worktree: o seu parecer `docs/qa/075-l5a-tela.md` e `e2e/package.json` (o axe do projeto é `@axe-core/playwright`, no E2E).
- Do pedido, a linha do `## Histórico` da conferência do QA do 5a (17:13) e a correção de 17:15.

## Entregar
- "E1.8 (qa-engineer): QA por lote." (E1.8)
- (E1) (E1.8) Rodar o axe do projeto (`@axe-core/playwright`) sobre BLOQUEADOS, o O2 e o O19 com o motivo "não classificado" na tela: a massa do E2E não traz o motivo, então acrescentar em `e2e/` um caso que simula a resposta da API com o motivo (interceptação de rota do Playwright, sem tocar no servidor nem no `web/src`), com o axe nos três cartões, incluindo a regra de contraste; Chromium com no máximo 2 workers, só esse arquivo, sem outra suíte pesada rodando (conferir `uptime` antes: load abaixo de 4).
- (E1) (E1.8) Atualizar o parecer `docs/qa/075-l5a-tela.md` pela ferramenta Edit: seções de axe e de contraste com o resultado da ferramenta (violações por regra, ou zero), o veredito revisto e `commit: 6d4a392cf75ecf6c9f3c9c5589fc5ac878335991` mantido; commit do caso E2E e do parecer com `Cartão: K-204` (mensagem gravada por Write num arquivo de caminho literal e `git commit -F`, `git add` explícito por caminho); antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin feature/075-l5a-tela`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052c rev-parse --abbrev-ref HEAD` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/075-l5a-tela`, em primeiro plano, com o comando puro (sem pipe nem variável); se o push sair com rc diferente de 0, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate; esperar a CI do push e relatar; sem PR.
- (E4) Nada a entregar aqui: não nesta delegação.
- (E2) Nada a entregar aqui: não nesta delegação.
- (E3) Nada a entregar aqui: não nesta delegação.
- (E5) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 17:15: DECISÃO TÉCNICA (Jarvis), corrige a de 17:13: o axe do projeto só existe no E2E (@axe-core/playwright em e2e/package.json; o web não tem axe), então o axe dos componentes tocados do 5a roda num caso E2E novo com a resposta da API simulada contendo o motivo não classificado, e o contraste sai da regra do axe nesse caso.
- 2026-11-06 14:20: DECISÃO TÉCNICA (Jarvis): opção B do E3.5: a distribuição por motivo sai do O2 e fica só no O19 (docs/analises/075-o2-distribuicao.md).
- 2026-11-06 15:22: DECISÃO TÉCNICA (Jarvis): na leitura do O19, o "não classificado" é citado pelo valor publicado (dias), sem percentual calculado na tela (T2.5).
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-3): motivo sem mapa para os 7 do briefing aparece como "não classificado" na tela (o mapa dos motivos fica para quando as pessoas o definirem). DECISÃO DO DONO: "A" (P-075-3b): trocar de motivo sem desbloquear é o mesmo bloqueio.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-8): O19, T10 e T12 entram no mapa real neste pedido.
- 2026-11-06 11:28: DECISÃO DO DONO: "B" (P-075-11, pela recomendação): o T10 espera o campo fornecedor no mapa de campos (WS1); o lote 7 sai deste pedido.
- 2026-11-06 11:28: DECISÃO DO DONO: "B" (P-075-12, pela recomendação): o T12 espera a WS1 preencher a área solicitante; o lote 8 sai deste pedido. ESCOPO- (dono): o T10 e o T12 da E4 (P-075-8) ficam para depois da WS1; o O19 continua.
- ADR 0020 (citada no pedido): proteção de pessoa; aqui vale que a tela não mostra nenhum campo de pessoa (CA-5).
- ADR 0022 (citada no pedido): não se aplica a este lote de tela.
- ADR 0029 (citada no pedido): derivação de bloqueio por comparação (lote 2a); não se aplica a este lote de tela.
- Recursos: no máximo 2 workers de teste (DECISÃO TÉCNICA do Jarvis, 075, 14:40); no máximo 2 pushes ao mesmo tempo e até 5 agentes em paralelo (DECISÃO DO DONO, 075, 15:08, registrada no KANBAN.md).
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. R-VERIFY: nunca `--no-verify` nem `--force`; recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`.
- NÃO tocar: `web/src`, `server/`, os testes do lote em `web/`, o `Barras` compartilhado, os outros pareceres, `KANBAN.md`, os pedidos, outras worktrees, `develop`, `homolog` e `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." · etapa de outra delegação; continua no pedido
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): desenho da distribuição por motivo do O2 (agregado no contrato num lote novo ou não), em docs/analises/075-o2-distribuicao.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.6 (ux-designer): ajuste da especificação do O2 em docs/ux/075-bloqueios-reais.md se o agregado não vier, sem commit." · etapa de outra delegação; continua no pedido
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `grep -i '@axe-core/playwright' /home/rodrigoisensee/MetricasDSPD-052c/docs/qa/075-l5a-tela.md` · espera: linhas>=1
- PQ-2 (cmd): `grep -c '^commit: 6d4a392cf75ecf6c9f3c9c5589fc5ac878335991' /home/rodrigoisensee/MetricasDSPD-052c/docs/qa/075-l5a-tela.md` · espera: igual '1'
- PQ-3 (push): `git ls-remote origin refs/heads/feature/075-l5a-tela` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-052c rev-parse HEAD`)
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c diff --name-only 7391e7153dca7b90fb78cca02fb42545eda06dc2 -- web/src server packages` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
