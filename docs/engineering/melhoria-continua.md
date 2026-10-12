# Melhoria contínua por entrega

Objetivo: a cada entrega o time (arquitetura, UX, back, front, QA, tech lead, Jarvis) gasta menos tokens, entrega mais e erra menos. Métricas são do processo, nunca de agente ou pessoa. Experimentos vão para `docs/kanban/melhorias.md` (próximo ID: M-014).

## a) Mecanismo (fim de cada entrega, 15 min no máximo)
1. **Registro por papel** (Jarvis pede no fechamento do PR; cada papel responde em até 3 linhas no relatório final do subagente): `custou caro` (tokens, tempo, releitura), `deu retrabalho` (o que voltou e por quê), `melhoria proposta` (mudança exata).
2. **Consolidação** (agile-coach): junta as respostas em `docs/retrospectivas/AAAA-MM-DD-<pedido>.md`, agrupa por causa e escolhe **no máximo 3 experimentos**, cada um com dono, métrica, linha de base e critério de sucesso (ex.: "tokens do QA -20% sem subir escapes").
3. **Reavaliação** na entrega seguinte: cada experimento termina em manter, ajustar ou reverter, anotado em `melhorias.md`. Uma mudança por vez por parte do processo. Mudança em `.claude/agents/` ou `CLAUDE.md` só entra após aprovação do usuário (seção e).
4. Retrospectiva sem dados não vale: se a métrica não foi coletada, o primeiro experimento é coletá-la.

## b) Métricas (planilha única `docs/kanban/entregas.md`, uma linha por entrega)
| Métrica | Como coletar | Quem |
|---|---|---|
| Tokens por agente por entrega | `subagent_tokens` do relatório de cada subagente, somado por papel | Jarvis anota ao receber |
| Rodadas de review e de QA | contar `docs/reviews/*-rN.md` e `docs/qa/` da entrega | agile-coach |
| Bugs por entrega e onde nasceram | pareceres por severidade; origem = fase (spec, arquitetura, código, teste, UX) | agile-coach |
| Tempo de ciclo | `historico.md` (valores brutos até 20 itens) | agile-coach |
| Falhas de CI por entrega | `gh run list --json conclusion` filtrado pela branch | tech-lead |
| Retrabalho | commits `fix:` na branch após o primeiro review; pais devolvidos | tech-lead |
| Escapes | bugs achados após o parecer do QA | qa-engineer |

## c) Linha de base (hoje, 2026-10-11)
- Commits: 258 em 3 dias (76, 156, 26). Por tipo: docs 118, feat 37, test 31, fix 30, chore 16, build 5, ci 4. `fix` = 12% do total; **docs = 46%**, ou seja, muito do custo é texto de processo e parecer (ordem de grandeza, não tokens).
- Pareceres: 37 em `docs/reviews/` (8 do pedido 002) e 17 arquivos em `docs/qa/`. Pedido 002: K-017 teve 3 rodadas, K-014 e K-033 duas.
- Pedido 001 (retro): 9h20 de calendário, ~22 cartões no review, 5 pais devolvidos (~23%), bugs 007 e 008 escaparam do QA (2), bug 008 com 3 voltas (alarme), fase A 14 bloqueantes contra 0 a 2 na fase B.
- CI (`gh run list`, últimos 40): 35 sucesso, 4 cancelados, 0 falhas declaradas. Falha por entrega: 0 (estimativa: runs cancelados por novo push, não são falhas).
- Leitura repetida: briefing 46 KB e proposta 99 KB são relidos por vários agentes (estimativa: ~36 mil tokens por leitura integral da proposta; não medido).
- **Tokens por agente: sem dados** (nunca registrados). Primeiro experimento: registrar.
- Tempo de ciclo: ver retro 001 (5 min a 4h40; amostra < 20, sem percentil).

## d) Backlog inicial de melhorias
Ganho: A alto, M médio, B baixo. Risco idem.

| # | Papel | Melhoria | Ganho / Risco |
|---|---|---|---|
| 1 | Jarvis | Prompt de delegação padrão: insumos fixos (cartão, caminhos exatos, seções a ler com linhas), critério de pronto, formato de retorno em até 15 linhas. Hoje cada agente reabre briefing e proposta inteiros | A / B |
| 2 | Jarvis | Modelo mais barato (haiku/sonnet) para tarefas mecânicas: atualizar quadro, histórico, atas, renomeações; modelo forte só para arquitetura, review e bugs de regra | A / M (qualidade; medir escapes) |
| 3 | Jarvis | Paralelizar o independente (back + front + QA preparando testes) e checar atividade antes de relançar (evita duplicação de 20:16 do 001) | M / B |
| 4 | Arquitetura | Extrair do briefing um `docs/architecture/contratos.md` curto (regras de cálculo, tipos, formas da API) e referenciar por seção em vez de reler os 46 KB | A / B (desatualiza; dono: arquiteto) |
| 5 | Arquitetura | ADR curto (até 40 linhas) com decisão, alternativas e consequências; planos reaproveitam o plano anterior e descrevem só o delta | M / B |
| 6 | UX | Reusar molde aprovado (O4) e checklist de UX por cartão no gate; validar com Lighthouse/axe em vez de revisão visual completa | A / B |
| 7 | UX | Shift-left de acessibilidade: tokens de contraste, alvo de toque e 320/375 px definidos na spec, não achados no QA | A / B |
| 8 | Back | Contratos compartilhados (tipos/schemas em `packages/`) usados por server, web e e2e; teste de contrato quebra o CI se divergir | A / M |
| 9 | Back | Testes de propriedade para a matriz `REGRAS_METRICA` (percentis, dias úteis, janela 12 semanas) para pegar bugs de regra cedo (ex.: saldo acumulado O7) | A / B |
| 10 | Front | Gate local `npm run pronto` com CLS a 375 px, rolagem horizontal 320/375, typecheck do e2e (retro 001, ação 1) | A / B (tempo do gate) |
| 11 | Front | Ler só o arquivo e o trecho alterado; evitar reabrir arquivos grandes já lidos; reaproveitar componentes do molde | M / B |
| 12 | QA | Checklist de pronto do autor entregue ao QA (gate verde, evidências, regras tocadas) e QA só reexecuta o que mudou na rodada; suíte completa apenas na final | A / M |
| 13 | QA | Cobertura como gate no CI (já existe estratégia 100%), com relatório por arquivo para não ler logs inteiros | M / B |
| 14 | Tech lead | Review em duas passadas: automática (lint, tipos, spec-check, cobertura) primeiro; humano só no que a máquina não cobre, citando arquivo e linha | A / B |
| 15 | Tech lead | CI mais rápido: cache de pnpm e Playwright, jobs paralelos (lint, unit, e2e), `concurrency` cancelando runs antigos, E2E só se `web/` ou `e2e/` mudou | M / B |
| 16 | Tech lead | Commits de docs agrupados por entrega (118 de 258 commits são docs) e pareceres sem repetir o texto da spec | B / B |
| 17 | Agile-coach | Planilha `entregas.md` e script que soma `subagent_tokens` e conta pareceres/`fix` por branch | M / B |

## e) Propostas que dependem do usuário (não aplicadas)
Textos exatos a aprovar:
1. **`.claude/agents/jarvis.md`**: acrescentar "Ao delegar, usar o modelo de prompt de `docs/engineering/melhoria-continua.md` (insumos, trechos a ler, critério de pronto, retorno em até 15 linhas). Tarefas mecânicas (quadro, histórico, atas) usam o modelo mais barato disponível. Ao receber cada relatório, anotar `subagent_tokens` em `docs/kanban/entregas.md`."
2. **Todos os agentes** (`.claude/agents/*.md`): acrescentar "Termine o relatório com `Custou caro / Deu retrabalho / Melhoria proposta`, uma linha cada; leia apenas as seções indicadas na delegação e consulte `docs/architecture/contratos.md` antes dos documentos de origem."
3. **`.claude/agents/qa-engineer.md`**: "Exigir o checklist de pronto do autor; na rodada de correção reexecutar só o afetado e a suíte completa apenas na rodada final."
4. **`.claude/agents/tech-lead.md`**: "Review em duas passadas (automática, depois humana); registrar falhas de CI e commits `fix` da branch em `entregas.md`."
5. **`CLAUDE.md`**: acrescentar no fluxo "Ao fim de cada entrega: retrospectiva curta (até 3 experimentos) e reavaliação na seguinte" e `docs/architecture/contratos.md` na lista de fontes de consulta rápida (a fonte da verdade continua o briefing).
