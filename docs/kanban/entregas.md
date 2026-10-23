# Registro de entregas e custo (tokens)

Propósito: base de comparação da melhoria contínua (docs/engineering/melhoria-continua.md).
Público: Jarvis, agile-coach.
Revisão: 2026-10-12

O Jarvis acrescenta uma linha por agente a cada relatório recebido (`subagent_tokens` e duração). Coluna "Rodadas" = rodadas de review e QA da entrega.

| Data | Entrega | Agente | Tokens | Duração | Rodadas | Observação |
|---|---|---|---|---|---|---|
| 2026-10-13 | QA sistêmico intensivo da main (0af552a), 79edf17 em test/qa-intensivo-main | qa-engineer | 81.410 | 36 min | 1 | aprovado com ressalvas; IS-001 a IS-007 (4 médios, 3 baixos) |
| 2026-10-13 | Espera invisível nos painéis: conclusão + sust_ restaurado (cc9d999) | react-frontend | 67.966 | 39 min | 2 | pronto verde, cobertura 100%, E2E 23+105 verdes |
| 2026-10-13 | Revisão de UX espera invisível | ux-designer | 46.477 | 1 min | 1 | aprovado, 4 ajustes baixos |
| 2026-10-13 | Code review espera invisível | tech-lead | - | - | 1 | aprovado; R1, R2 recomendações |
| 2026-10-13 | Ajustes review+UX espera invisível | react-frontend | 62.993 | 10 min | 1 | pronto verde, cobertura 100%, E2E 24/24 |
| 2026-10-13 | Plano técnico Sustentação no Operacional + ADR 0019 proposta | software-architect | 181.338 | 8 min | 1 | 4 perguntas ao usuário (P1, P2, P4 bloqueiam partes) |
| 2026-10-13 | Discovery 010 compatibilidade mobile/tablet | ux-designer | - | - | 1 | matriz, 27 CAs, protótipo; D1 ao usuário |
| 2026-10-14 | K-069 lote de bugs IF/IS (front) | react-frontend | - | ~2h | 1 | 13 commits; web pronto verde 100%; E2E 312/312; server vermelho só no IS-002 |
| 2026-10-14 | K-072 Sustentação no Operacional back B1-B3 | node-backend | - | ~3h | 1 | 3 commits; pacotes 100%; web pronto com timeouts sob carga |
| 2026-10-21 | 036-estrategicas-pendentes | jarvis (principal) | 1608510352 | 11 delegações | - | calculado das transcricoes: ent=9362 sai=3198543 cache=1605302447; compactacoes=5; relancamentos=9; rodadas de brief: fonte=briefs (sessão inteira de 2026-10-20, não só o 036: M21) |
| 2026-10-21 | 036-estrategicas-pendentes | <agente> | 441171030 | - | - | calculado das transcricoes: ent=10128 sai=1120528 cache=440040374 (sessão inteira de 2026-10-20, não só o 036: M21) |
| 2026-10-21 | 036-estrategicas-pendentes | forge:agile-coach | 608880 | - | - | calculado das transcricoes: ent=38 sai=7156 cache=601686 (sessão inteira de 2026-10-20, não só o 036: M21) |
| 2026-10-21 | 036-estrategicas-pendentes | forge:conferente | 39341773 | - | - | calculado das transcricoes: ent=3058 sai=55737 cache=39282978 (sessão inteira de 2026-10-20, não só o 036: M21) |
| 2026-10-21 | 036-estrategicas-pendentes | forge:devops-engineer | 1950328 | - | - | calculado das transcricoes: ent=152 sai=3652 cache=1946524 (sessão inteira de 2026-10-20, não só o 036: M21) |
| 2026-10-21 | 036-estrategicas-pendentes | forge:node-backend | 291252983 | - | - | calculado das transcricoes: ent=5136 sai=43118 cache=291204729 (sessão inteira de 2026-10-20, não só o 036: M21) |
| 2026-10-21 | 036-estrategicas-pendentes | forge:qa-engineer | 180508391 | 5 delegações | - | calculado das transcricoes: ent=3988 sai=212553 cache=180291850 (sessão inteira de 2026-10-20, não só o 036: M21) |
| 2026-10-21 | 036-estrategicas-pendentes | forge:react-frontend | 193402696 | 1 delegações | - | calculado das transcricoes: ent=3552 sai=49040 cache=193350104 (sessão inteira de 2026-10-20, não só o 036: M21) |
| 2026-10-21 | 036-estrategicas-pendentes | forge:security-engineer | 8265248 | - | - | calculado das transcricoes: ent=292 sai=46260 cache=8218696 (sessão inteira de 2026-10-20, não só o 036: M21) |
| 2026-10-21 | 036-estrategicas-pendentes | forge:software-architect | 26955597 | - | - | calculado das transcricoes: ent=816 sai=366874 cache=26587907 (sessão inteira de 2026-10-20, não só o 036: M21) |
| 2026-10-21 | 036-estrategicas-pendentes | forge:tech-lead | 142607965 | 3 delegações | - | calculado das transcricoes: ent=5050 sai=403041 cache=142199874 (sessão inteira de 2026-10-20, não só o 036: M21) |
| 2026-10-21 | 036-estrategicas-pendentes | forge:ux-designer | 22142062 | 2 delegações | - | calculado das transcricoes: ent=646 sai=345556 cache=21795860 (sessão inteira de 2026-10-20, não só o 036: M21) |
| 2026-10-21 | 036-estrategicas-pendentes | general-purpose | 3101665 | - | - | calculado das transcricoes: ent=100 sai=12460 cache=3089105 (sessão inteira de 2026-10-20, não só o 036: M21) |
