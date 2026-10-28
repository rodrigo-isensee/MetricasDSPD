# Pedido 046: resumo dos problemas para o Forge

- **Modo:** analisar
- **Objetivo:** "depois quero um resumo de todos os problemas que tivemos para passar pro Jarvis que desenvolve a forge para colocar melhorias"
- **Clareza:** 3 confirmado (recibo aceito: "Isso"), 1 suposição; 0 perguntas feitas
- **Depende de:** nenhum

## Escopo
- E1. Um documento único, em `docs/retrospectivas/2026-10-28-problemas-para-o-forge.md`, com todos os problemas de processo e de ferramenta do Forge que o time viveu neste projeto, cada um com a evidência (pedido, cartão, PR ou retro), o custo observado e a melhoria proposta, pronto para colar na sessão do Jarvis do Forge · `confirmado`
- E2. Fonte: as linhas `MELHORIA:` das retrospectivas, os cartões `[forge]` do KANBAN.md (K-147, K-156 a K-159, K-164 a K-168, K-170), `docs/kanban/conferencias.md`, `docs/kanban/escapes.md` e o Histórico dos pedidos · `confirmado` (recibo)
- E3. Agrupado por tema (hooks e conferência, brief e conferente, autoria de parecer, suíte e teto, fluxo de merge), com o que já tem PR ou cartão no Forge marcado · `confirmado` (recibo)

## Etapas
- E1.1 (forge:agile-coach): levantar e escrever o resumo (E1, E2, E3).
- E1.2 (forge:tech-lead): commit do documento numa branch de docs e PR para a develop, depois do review e do QA de documentação.

## Fora do escopo
- Abrir PR no Forge ou editar ~/Forge: o dono leva o resumo ao Jarvis do Forge · `confirmado`
- Problemas do produto (métricas, regras de negócio) · `suposição` (base: "melhorias" do Forge)

## Suposições
- "depois": começa quando houver agente livre, sem parar o que está em andamento; base: o dono pediu para depois.

## Histórico
- 2026-10-28 13:49: pedido registrado; recibo enviado ao dono. Cartão K-171.
- 2026-10-28 13:49: o K-164 citado no E2 é o cartão já decidido (opção B, pedido 041); o resumo o lista como proposta em curso.
- 2026-10-28 13:53: DECISÃO DO DONO (2026-10-28): recibo do 046 aceito ("Isso").
- 2026-10-28 14:00: brief agile-coach-1 (E1.1) enviado ao conferente.
- 2026-10-28 14:00: brief agile-coach-1 aprovado pelo conferente na rodada 1 (sha256 00fef0ea647bef43d4472c82a3109df79ec2878365820fb938de706025e5d73d) e delegado ao forge:agile-coach.
- 2026-10-28 14:05: E1.1 entregue pelo agile-coach (31 problemas em 5 temas; PQ-1 rc=0, PQ-2 = 8 seções; sem dado de pessoa, conferido com grep). Aceito pelo Jarvis (K-147). Próximo: E1.2 (tech-lead, review, QA de documentação e PR).
