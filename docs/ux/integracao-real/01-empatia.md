# Integração real: empatia

Demanda: substituir o mock por dados reais (BusinessMap, Acelerato). Base: `docs/ux/dashboard-metricas/especificacao.md` (rev. 3), briefing 7.4 e 6.
Status: discovery adiantado (pedido 006). Tudo o que não está nos documentos é **hipótese (H)** até o usuário confirmar.

## Personas (as mesmas do painel; o que muda é a confiança no número)
| Persona | Objetivo com dado real | Dor nova com dado real |
|---|---|---|
| Time / líder técnico (diária) | Ver o item mais velho parado hoje | Não saber se o painel está atrasado: "esse card já andou?" |
| Coordenador (quinzenal) | Publicar e cumprir SLE | Medo de cobrar/publicar em base suja (briefing 7.4) |
| Gerente (mensal) | Panorama | Ler número de calibração como resultado e cobrar o time |
| Líder da sustentação | Prazos por prioridade | Total do Acelerato parado/defasado sem aviso |
| Mantenedor do coletor (H: DSPD/Rodrigo) | Saber se a coleta rodou | Falha silenciosa: painel com dado velho parecendo atual |

## Mapa de empatia (gerente e coordenador, o caso crítico)
- **Pensa:** "esse número é confiável? já posso usar?"
- **Sente:** insegurança; receio de expor o time a cobrança injusta.
- **Vê:** gráficos bonitos sem sinal de que a base ainda está sendo limpa.
- **Ouve:** do time "isso ainda está errado, não é para cobrar".
- **Faz:** exporta/projeta em reunião; compara com a memória.
- **Dores:** dado velho parecendo atual; calibração invisível; série que "quebra" sem explicação (mudança de critério); erro genérico "não foi possível carregar".
- **Ganhos:** saber de relance a idade do dado, o grau de maturidade e o motivo de cada lacuna.

## Jornada atual (mock) e atritos esperados com dado real
1. Abre painel: hoje "Dados até DD/MM" fixo e fictício. **Atrito:** com coleta real, a data varia por fonte; BusinessMap e Acelerato podem ter datas diferentes (nunca se misturam).
2. Lê gráfico durante calibração (30 a 60 dias após mudança de configuração, 7.4). **Atrito:** nada diz "não cobrar"; amostra < 20 já cobre parte, mas não toda a calibração.
3. Série cruza mudança de critério (T2.6). **Atrito:** já há marcador no mock; falta saber quem registra e de onde vem.
4. Coleta falha. **Atrito:** hoje só há erro de cartão (6.4), que não distingue "falha de leitura da base" de "coleta atrasada".

## Hipóteses e perguntas abertas (ao usuário)
- H1: a coleta é incremental e diária (a confirmar com o arquiteto/pedido 002). Qual a cadência real? Uma tela de operação para o mantenedor é desejada, ou só um indicador no painel?
- H2: "calibração" é um período por fonte, com data de início e fim registradas por pessoa (WS1/WS4), não derivado dos dados.
- H3: durante a calibração os painéis continuam visíveis, com selo, em vez de ocultos. **Decisão de produto, do usuário.**
- H4: cada fonte tem frescor próprio; nunca há um "Dados até" único.
- Pergunta: quem pode ver o painel durante calibração (todos, ou só o time)?
