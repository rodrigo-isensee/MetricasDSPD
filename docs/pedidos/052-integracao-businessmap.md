# Pedido 052: integracao-businessmap

- **Modo:** implementar (a confirmar no recibo; começa pelo discovery)
- **Objetivo:** "depois disso vamos trabalhar na integracao com o business map"
- **Clareza:** 0 confirmado, 4 suposição, 2 técnico; recibo enviado, aguardando o dono
- **Depende de:** pedido 050 (a release v0.2.0 sai antes; o discovery pode correr em paralelo)

## Escopo
- E1. Discovery da integração real: especificação da API do BusinessMap e mapa de campos contra o quadro real (T2.1), spike do campo "Time responsável" (K-087), modelo de ameaças da apikey e da allow-list · `suposição` · base: briefing §WS2 (T2.1) e cartão K-087
- E2. Coleta incremental agendada pela API do BusinessMap, só leitura, apikey só no `.env`, allow-list na fronteira, histórico nunca sobrescrito (T2.2) · `suposição` · base: briefing T2.2; hoje o módulo `server/src/modulos/businessmap` tem webhook, staging e allow-list, sem coleta agendada
- E3. Webhook de transições (T2.3) ligado ao quadro real · `suposição` · base: `server/src/modulos/businessmap/webhook.ts` já existe
- E4. Painéis do fluxo (FL1, FL2, FL3) lendo os dados reais do BusinessMap no lugar do mock · `suposição` · base: decisão de 2026-10-28 ("integração com dados reais por último") e o que está em mock
- E5. Itens de segurança da ADR 0020 ligados à integração: K-086 (erro e log sem payload), K-088 (lint do coletor), K-089 (teste da allow-list) · `técnico` · base: cartões abertos no pedido 011 "junto com a integração"
- E6. Ordem obrigatória do CLAUDE.md: configuração (WS1) → coleta (WS2) → painéis (WS3) · `técnico`

## Etapas
- E1.1 (software-architect): T2.1 e plano técnico da coleta (fonte, agendamento, incremental, base analítica).
- E1.2 (security-engineer): modelo de ameaças da integração (apikey, allow-list, webhook).
- E1.3 (ux-designer): o que muda nos painéis com dado real (estados vazio, abaixo de 20 itens, atraso da coleta).
- E1.4 (dono): apikey do BusinessMap no `.env` e confirmação da WS1.

## Fora do escopo
- Acelerato e painéis de sustentação (WS5): o dono citou só o BusinessMap · `suposição` · base: frase do dono
- Configuração do BusinessMap (WS1): feita por pessoas, o time só apoia · `técnico` · base: CLAUDE.md
- Resto da lista do 048 em mock: segue em espera · `suposição` · base: frase do dono põe a integração logo depois da release

## Suposições
- A integração passa à frente do que falta do 048 em mock (a decisão de 2026-10-28 a punha por último) · base: "depois disso vamos trabalhar na integracao"

## Critério de pronto
- PQ-1 coleta real do BusinessMap gravando na base sem sobrescrever histórico, com a allow-list · prova: merge · `suposição`

## Decisões do usuário (registro literal)
DECISÃO DO DONO (2026-10-29): "depois disso vamos trabalhar na integracao com o business map"

## Histórico
- 2026-10-29 16:04: pedido aberto; recibo enviado ao dono. PERGUNTA: recibo (modo e escopo E1 a E6). Fila: 1 pergunta (WS1 pronta e apikey no `.env`).
