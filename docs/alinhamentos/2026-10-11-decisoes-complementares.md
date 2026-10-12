# Decisões do usuário — métricas complementares (2026-10-11)

| Métrica | Decisão |
|---|---|
| Ordem | Todas as 17 com dados mockados; ordem irrelevante. UX: A + B; D-3 sem alerta; D-4 restaurar abre a seção; D-5 "Em breve" só no catálogo (agora nenhuma); D-6 "Mais métricas deste painel". |
| O5 | Bloqueio dentro de coluna de execução **sai** do tempo de execução (não-execução = fila + bloqueio). |
| O17 | Lista de causas raiz do mock é a proposta do Jarvis; o campo "causa raiz" virá do Metabase na coleta real. "Módulo" = sistema do card (assumido). **Decidido (usuário, 2026-10-11): a O17 é da Sustentação (Acelerato, campo via Metabase), métrica de chamados agrupada por sistema.** |
| S8 | Reabertura = campo **"reincidente"** preenchido no Acelerato com o ticket anterior. Sem intervalo de dias nem "mesmo sintoma". |
| S12 | Chamado com "reincidente" já conta; sem limite K. Mostrar contagem e proporção por sistema, janela de 12 semanas. |
| T8 | Sprint = **card-template (card pai)** no BusinessMap; entregas são os cards filhos. Planejado = ligado ao card no início da sprint; o que entrou depois é "entrada não planejada". Sempre por sprint/agregado, sem comparar times. |
| O11 | "Em definição" = seção **Requested**; "pronto" = **In Progress** (comprometido). Mede o intervalo Requested → In Progress. Sem sexto papel de coluna. |
| Rótulo | "Dados fictícios" nos cartões sem fonte real. |
