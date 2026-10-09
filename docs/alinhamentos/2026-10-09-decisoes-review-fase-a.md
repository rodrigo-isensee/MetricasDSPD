# Decisões do time sobre as perguntas do code review da fase A (001)

Registrado pelo Jarvis em 2026-10-09 20:27. Pelo pedido 005, dúvidas que iriam ao usuário no 001 são decididas pelo time com a melhor recomendação, registradas e listadas no resumo final. Todas são **provisórias** e reversíveis.

Origem: `docs/reviews/001-fase-a.md` (perguntas Q1–Q6).

| # | Pergunta | Decisão provisória | Fundamento |
|---|---|---|---|
| Q1 | O que a Visão geral mostra da Espera invisível depois da segmentação por tipo/prioridade? | Decisão de UX, a tomar pelo `ux-designer` no cartão K-026 (Visão geral). Provisório: mostrar a classe com maior índice de espera, nomeada, com link para o painel EI — nunca uma mediana misturada | Briefing 4.2 (segmentação sempre por tipo) |
| Q2 | Separar incidente de requisição na sustentação (EI-SUST, S1, S2, S4)? | Não nesta etapa: a segmentação da sustentação é por prioridade (P1–P5), como já fazem S1 e S2. Registrado para o usuário | Briefing seção 06 (S* por prioridade); spec de UX |
| Q3 | No tático, a classe de serviço substitui o tipo (T1, T2, T4)? | Sim: T1, T2 e T4 são por classe de serviço, uma classe por vez, conforme a spec | Spec de UX (T1/T2/T4 sempre por classe) |
| Q4 | Iniciativa e Melhoria juntas no EI-FL3 e no E1? | Não: segmentar por tipo também no nível de projeto. Com isso E1 e EI-FL3 ficam em "amostra insuficiente" no mock, o que é o comportamento correto | Briefing 4.2 e regra "segmentação sempre por tipo" (CLAUDE.md) |
| Q5 | E2: "evolução" conta só Melhoria? | Seguir o briefing: evolução inclui Melhoria, Iniciativa e Dívida técnica | Briefing (texto do E2) |
| Q6 | Descarte = card com `motivo_descarte` preenchido? | Sim. Arquivado **não** é descartado: entregue e depois arquivado é o normal e permanece nos cálculos | Briefing 4.2 (descartado), 4.5 (`motivo_descarte`), 7.3 |

## Complemento (2026-10-09 20:59) — pendências da matriz de regras (`docs/architecture/regras-metricas.md`)
| # | Pergunta | Decisão provisória | Fundamento |
|---|---|---|---|
| P1 | Card arquivado **sem** ter sido entregue e **sem** `motivo_descarte` conta como aberto? | Não conta como trabalho aberto (sai de O1, O2, Bloqueados, O10, backlog do T4, T7, T9-denominador), mas **permanece na base** e é contado à parte como "arquivado sem desfecho" para higiene (T6.4). Nunca é tratado como descartado | Briefing 4.2, 7.3, T6.4; CLAUDE.md (arquivados permanecem) |
| P2 | T7: ordem decrescente (spec) × `ordem: 'neutra'` (matriz)? | Vale a spec: frentes ordenadas por idade decrescente é ordem **temporal** (aging), não ranking de áreas ou pessoas → na matriz, T7 `ordem: 'temporal'` | Spec de UX (T7); regra anti-ranking aplica-se a áreas/pessoas |
