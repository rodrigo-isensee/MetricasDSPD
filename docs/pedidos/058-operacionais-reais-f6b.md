# Pedido 058: operacionais com dado real (F6b, O19 a O26, e os campos de O8, O12 e O14 a O18)

- **Modo:** implementar (discovery primeiro; código só depois do desenho validado)
- **Objetivo:** "Quero todas as operacionais e do acelerado com dados reais" (dono, 2026-11-01), com a opção "A": segunda sai como planejado no 052, e a F6b abre já em paralelo.
- **Clareza:** 3 confirmados; 1 suposição; 0 perguntas
- **Depende de:** pedido 052 (F6 mesclada, PR 188; a sustentação real é a E2.115 do 052, não deste pedido)

## Escopo
- E1. O19 a O26 com dado real do BusinessMap (F6b do plano 052: revisão de modelagem do que usam, revisão 4 da ADR 0020 com as allow-lists da F3b, coleta de bloqueios, vínculos e responsáveis no tempo, projeção e cálculo pela biblioteca T2.5) · `confirmado` (dono, "A", 2026-11-01)
- E2. Lista dos campos do quadro para O8, O12 e O14 a O18 (briefing §4.4: tamanho_declarado, data_acordada, responsabilidade_atraso, area_solicitante, fase_deteccao, severidade, causa_raiz, origem_bug) entregue ao dono para a governança criar · `confirmado` (entregue na conversa de 2026-11-01)
- E3. Depois que a governança criar os campos: coletor trazendo esses campos pela allow-list, projeção e cálculo de O8, O12 e O14 a O18 com dado real, e o mapa de origem passando a `real` · `confirmado` (decisão "A": seguem fictícios até os campos existirem)

## Etapas
- E1.1 (software-architect): revisão de modelagem da F6b (o que O19 a O26 usam; a E2.71 do 052) e plano das fatias F3b, F4b e F6b, com o que depende de campo novo do quadro, sem commit.
- E1.2 (security-engineer): modelo de ameaças da coleta nova (bloqueios, vínculos, responsáveis no tempo, comentários do O22) e revisão 4 da ADR 0020 junto com o arquiteto, em paralelo à E1.1, sem commit.
- E1.3 (ux-designer): conferir se os cartões O19 a O26 mudam com dado real (selo, notas, mínimo de 20), em paralelo à E1.1, sem commit.
- E1.4 (dono): validar o plano (ponto de compromisso).
- E2.1 (a definir depois da E1.4): implementação por fatia, segurança, code review, QA, revisão de UX e PR.

## Fora do escopo
- A entrega de segunda do 052 (FL1, sustentação, limpeza do mock) · `confirmado`
- Criar os campos no BusinessMap (configuração da WS1, feita por pessoas) · `confirmado` (CLAUDE.md, o que é código e o que não é)
- FL2, FL3 e as complementares T e E com dado real · `confirmado` (recorte do dono: tático e estratégico depois)

DECISÃO DO DONO (2026-11-01): "A" (operacionais todas reais): segunda sai como planejado e a F6b abre já em paralelo num pedido próprio; O8, O12 e O14 a O18 seguem fictícios até a governança criar os campos no quadro.

## Suposições
- O pedido começa pelo discovery, que é análise; a implementação só entra depois do plano validado pelo dono · base: R-DISCOVERY.

## Perguntas na fila
- RESPONDIDA (2026-11-01): O17 (causa raiz) — a decisão do dono de 2026-10-11 põe a causa raiz na sustentação, vinda do Acelerato; se vale, o campo `causa_raiz` não precisa existir no quadro do BusinessMap. Perguntar ao dono quando a E1.1 chegar nesse ponto.

## Histórico
- 2026-11-01 16:45: pedido aberto a partir do 052 com a decisão "A" do dono; lista de campos entregue na conversa. DECISÃO TÉCNICA (Jarvis): discovery (E1.1 a E1.3) dispara depois que as entregas de segunda do 052 estiverem com PR, para não disputar a máquina com as suítes de teste.
- 2026-11-01 16:55: DECISÃO DO DONO (causa raiz, O17), literal: "Caixa raiz é um campo para bug interno. Bug interno é um erro pego em tempo de desenvolvimento. No acelerado estará os incedentes em produção" — o campo `causa_raiz` existe no quadro do BusinessMap para o bug interno (pego no desenvolvimento) e entra no O17 operacional; a causa raiz dos incidentes em produção vem do Acelerato, na sustentação; os dois nunca se misturam.
- 2026-11-01 17:00: o dono informa, literal: "Mas ok o campo causa raiz ainda não existe vou criar semana que vem" — o campo causa_raiz do bug interno será criado no quadro na semana de 2026-11-02; O17 segue fictício até lá.
