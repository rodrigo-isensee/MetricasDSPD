# Integração real: ideação

## Alternativas
**A. Selos por cartão + faixa global mínima.** Cabeçalho do painel: "Dados até DD/MM HH:mm · Fonte: BusinessMap" (substitui o "Dados fictícios") com estado (Atual / Atrasado / Falha). Faixa de calibração no topo do painel enquanto a fonte estiver em calibração; selo "Calibração" em cada cartão afetado. Marcador T2.6 como hoje.
- Prós: reaproveita 6.4, `MarcadorCriterio` e o selo de fonte; pouco desenho novo; o aviso está onde o número está.
- Contras: muitos selos se a calibração cobrir tudo (ruído); sem visão do mantenedor.
- Esforço: baixo a médio.

**B. Página "Saúde dos dados" (`/dados`) + indicador discreto nos painéis.** Uma tela com última coleta por fonte, histórico de eventos (ok, atraso, falha, mudança de critério, calibração) e cobertura; os painéis só mostram um ponto de status no cabeçalho com link.
- Prós: limpa os painéis; serve ao mantenedor e dá transparência.
- Contras: quem lê o cartão não vê o "não cobrar" no momento; exige novo destino de navegação e modelo de eventos mais rico.
- Esforço: médio a alto.

**C. Modo calibração global (alternância).** Enquanto houver calibração, os painéis ficam em "modo calibração": marca-d'água/cor, todos os cartões com selo e sem metas/status "Dentro/Fora da meta".
- Prós: impossível ignorar; evita cobrança por construção (sem status de meta).
- Contras: pesado e binário (a calibração é por fonte e por métrica); tira valor de painéis já confiáveis; risco de ser ignorado por excesso de aviso.
- Esforço: médio.

## Matriz impacto x esforço
| Alt. | Impacto | Esforço |
|---|---|---|
| A | Alto | Baixo/médio |
| B | Médio (transparência) | Médio/alto |
| C | Médio/alto | Médio |

## Escolhida: A, com dois empréstimos
- De C: **durante calibração, o status "Dentro/Fora da meta" e a faixa "Pede atenção" do cartão afetado viram "Em calibração"**, sem juízo de meta (impede cobrança por construção).
- De B (fase posterior, opcional): `/dados` somente leitura, cortada do escopo inicial; o cabeçalho já traz o link para a Ajuda (`#dados`).
- Porquê: maior impacto com mínimo de mudança na spec rev. 3; mantém fontes separadas; a calibração é por fonte e é decisão humana (H2).
