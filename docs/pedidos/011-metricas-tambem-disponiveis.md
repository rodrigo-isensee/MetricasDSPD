# Pedido 011 — Métricas "Também disponíveis" da proposta original

- **Data:** 2026-10-14
- **Pedido do usuário:** "senti falta de várias métricas estratégicas que estavam no levantamento inicial". Decisão: opção B, discovery das 17 de uma vez.
- **Contexto:** o briefing (fonte da verdade) ficou só com o catálogo principal. As tabelas "Também disponíveis neste nível" da proposta (`docs/proposta-metricas-ageis.md`, linhas ~242, ~342 e ~399) nunca entraram no catálogo e não foram implementadas, com exceção da Percepção de valor (PV1).
- **Escopo (17):**
  - **Operacional (8):** bloqueios por causa; diagrama de fluxo cumulativo; matriz de transição e fluxo reverso; tempo até o primeiro toque; estoque parado dentro do WIP; aderência à ordem de chegada; taxa e custo do descarte; passagens de mão por demanda.
  - **Tático (5):** SLA real de terceiros por fornecedor; retrabalho e reincidência; sazonalidade da chegada; qualidade da entrada por área; densidade de dependências entre quadros.
  - **Estratégico (4):** previsibilidade do portfólio; custo por demanda e por sistema; concentração de conhecimento; envelhecimento de iniciativas paradas.
- **Restrições:**
  - Regras invioláveis do CLAUDE.md. Concentração de conhecimento e passagens de mão nunca identificam pessoa; só contagem agregada.
  - BusinessMap × Acelerato nunca misturados.
  - Cálculo pela biblioteca compartilhada.
  - Mock primeiro, como as demais.
- **Fluxo:** discovery (ux-designer + software-architect) → validação do usuário → desenvolvimento. Primeiro conferir quais já estão cobertas em parte por métricas existentes.
- **Responsáveis:** ux-designer e software-architect, um agente por vez, por pedido do usuário.

## Decisões do usuário
- 2026-10-14 — **D-8 = A**: "ida e volta" na qualidade da entrada (T12) = bloqueio "Falta de informação no chamado" antes do início, ou retorno do card da coluna de compromisso para o backlog.
- 2026-10-14 — **D-5' = B**: passagem de mão (O26) conta só quando alguém sai e outro entra, ou o conjunto de responsáveis é substituído; incluir co-responsável sem ninguém sair não conta.
- 2026-10-14 — **D-6' = A**: ordem de chegada (O24) comparada dentro da fila de cada equipe (quadro), só classe Padrão e mesmo tipo.
- 2026-10-14 — **R-1 = A**: custo da ultrapassagem (O24) = dias úteis entre o início do primeiro item que passou na frente e o início do ultrapassado; texto "esperaram, depois de ultrapassados, X dias úteis até começar".
- 2026-10-14 — **D-1' = A** (usuário: "das duas faça suas recomendações"): custo de capacidade = custo total do DSPD no período, rateado pela participação por sistema (entregas, D-2); "por demanda" = custo do sistema ÷ entregas do sistema; aviso "Rateio do custo total do DSPD, não esforço medido"; valor e periodicidade como configuração versionada (T2.6). Horas apontadas não entram (regra 7.1 mantida; a proposta do usuário de usar horas apontadas foi sinalizada e não adotada).
- 2026-10-14 — **T14 nova = A** (usuário): visão por time "quanto deste projeto não é do meu time", métrica nova e separada no Tático, ao lado do T13 (o T13 segue por vínculos, P:348). Medida pela quantidade de cards do projeto com o meu time no campo de time responsável; os outros times sempre somados em "outros times", nunca listados nem ordenados (regra de comparação entre times). Motivo: o time é cobrado por entregas de projetos com pouca atuação. O escopo do pedido 011 passa a 17 métricas. Pendente: D-14' e R-4 do T13.
- 2026-10-14 — **T14, triagem do Jarvis (R-DECISAO):**
  - Q-T14-1, fonte do time: o usuário já disse que "os cards têm campo de time responsável", o que aponta para um campo customizado (opção B). Falta o nome exato e se é de escolha única ou múltipla. É uma pergunta de fato, feita ao usuário.
  - Suposições do time, cada uma com a recomendação do arquiteto e a base no plano §9:
    - Q-T14-2: story por padrão, com seletor para frente;
    - Q-T14-3: entram os cards não descartados;
    - Q-T14-4: o projeto inteiro, com o período escolhendo os projetos;
    - Q-T14-7: o card sem time entra no n como "sem time informado";
    - Q-T14-8: vale o time na entrega;
    - Q-T14-9: se houver múltiplos times, conta se o meu estiver entre eles.
  - Decisões com o usuário, uma por vez, depois da D-14':
    - Q-T14-5: quais projetos aparecem;
    - Q-T14-6: publicar "outros times" quando há um único outro time.
  - D-15 a D-17 do UX coincidem com Q-T14-3/4, Q-T14-7 e o filtro "meu time". Ficam conciliadas com as suposições acima.
