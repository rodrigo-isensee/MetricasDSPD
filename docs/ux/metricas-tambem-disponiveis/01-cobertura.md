# Métricas "Também disponíveis" (pedido 011) · 01 Cobertura

Cruzamento das 17 métricas das tabelas "Também disponíveis neste nível" da proposta (`docs/proposta-metricas-ageis.md`, linhas 242, 342 e 399) com o que já existe no catálogo (`web/src/content/catalogo-metricas.ts`, `packages/contratos/src/cartoes.ts`) e no modelo analítico (`packages/metricas/src/businessmap/modelo.ts`, `.../acelerato/modelo.ts`).

Legenda: **Total** = a pergunta já é respondida por métricas existentes, sai do escopo e vira nota no catálogo. **Parcial** = existe algo próximo, mas a pergunta não é respondida; fica, reaproveitando o que existe. **Não** = nada responde; fica.

Códigos novos (O19 a O26, T10 a T13, E6 a E9) são **provisórios**: o arquiteto confirma ao incluir em `METRICA_IDS`.

## Resumo
| | Total | Parcial | Não | Ficam |
|---|---|---|---|---|
| Operacional (8) | 0 | 5 | 3 | 8 |
| Tático (5) | 1 | 2 | 2 | 4 |
| Estratégico (4) | 0 | 3 | 1 | 4 |
| **Total (17)** | **1** | **10** | **6** | **16** |

Das 16 que ficam, 15 viram cartão complementar novo e 1 (Estoque parado dentro do WIP) vira um bloco dentro do cartão O2, que já calcula "sem mover há" por item.

## Operacional (FL1, BusinessMap)

| # | Métrica da proposta | Cobertura | O que já existe | O que falta | Destino |
|---|---|---|---|---|---|
| 1 | Bloqueios por causa | Parcial | BLOQUEADOS lista os bloqueados **agora**, com motivo e fornecedor; O2 marca o item bloqueado. | Histórico: quantos bloqueios por motivo e **quantos dias úteis** cada motivo custou na janela. `fato_bloqueio` já tem motivo, início, fim e duração. | **O19** Bloqueios por causa |
| 2 | Diagrama de fluxo cumulativo | Parcial | O1 tem a série diária de WIP; O7 tem entrada × saída mensal por tipo. | Acúmulo **por etapa** ao longo do tempo (as faixas que alargam mostram onde o trabalho se acumula). | **O20** Fluxo cumulativo |
| 3 | Matriz de transição e fluxo reverso | Não | Nenhum cartão usa `fato_transicao.direcao`. O5 mede fila × execução, não retorno. | Contagem de retornos por par origem → destino e o peso no tempo de ciclo. | **O21** Fluxo reverso |
| 4 | Tempo até o primeiro toque | Parcial | S1 mede o primeiro atendimento **no Acelerato** (não pode ser reaproveitado: fontes não se misturam). O9 mede entrada → compromisso, que não é reação. | No BusinessMap, o tempo entre a chegada do pedido e a primeira reação registrada. | **O22** Primeiro toque |
| 5 | Estoque parado dentro do WIP | Parcial | O2 já calcula `semMoverHaDiasUteis` por item e ordena a lista por "Sem mover há". | O número agregado: quantos e que parcela do "em andamento" não se move há mais de uma semana. | Bloco **O23** dentro do O2 |
| 6 | Aderência à ordem de chegada | Não | O10 mostra a idade do backlog, não a ordem em que os itens começaram. | Quantos inícios passaram na frente de um pedido mais antigo e quanto isso atrasou os ultrapassados. | **O24** Ordem de chegada |
| 7 | Taxa e custo do descarte | Não | A regra existe (briefing 4.2: "descartado entra na taxa de descarte com o tempo já consumido") e `descartado()` existe na biblioteca, mas nenhum cartão a publica. | Taxa de descarte e tempo já consumido pelos descartados. | **O25** Descarte |
| 8 | Passagens de mão por demanda | Não | Nenhum. `dim_card.responsaveis` guarda só o estado atual e é dado de pessoa. | Contagem de trocas de responsável por demanda, sem guardar quem. | **O26** Passagens de mão |

## Tático (FL2, BusinessMap)

| # | Métrica da proposta | Cobertura | O que já existe | O que falta | Destino |
|---|---|---|---|---|---|
| 9 | SLA real de terceiros por fornecedor | Parcial | BLOQUEADOS mostra o fornecedor do bloqueio atual; O12 separa atraso por responsabilidade "Terceiro"; S9 mede pendência "Aguardando fornecedor" **no Acelerato** (não reaproveitável). | No BusinessMap, o tempo praticado por cada fornecedor (bloqueios "Aguardando fornecedor"), comparado ao prazo contratado, se houver. | **T10** Tempo de terceiros |
| 10 | Retrabalho e reincidência | **Total** | O13 (defeitos em produção e seu peso na vazão: "quanto da capacidade corrige o que já entregamos"), T5 (demanda originada por "erro em entrega anterior"), S8 (reabertura no Acelerato) e S12 (recorrentes por sistema). A reabertura de card entregue no BusinessMap aparece no O21 (retorno a partir de "Entregue"). | Nada que justifique cartão próprio. | **Fora do escopo**: nota no catálogo (abaixo) |
| 11 | Sazonalidade da chegada | Parcial | O7 (entrada mensal) e T4 (chegada semanal) mostram a série recente, dentro do período filtrado. | Comparar o mesmo mês entre anos para ver o padrão que se repete (exige 24 meses de histórico). | **T11** Sazonalidade |
| 12 | Qualidade da entrada por área | Não | O14 mostra volume por área; O11 mostra itens em definição × prontos, sem área. | Por área solicitante, quantas demandas precisaram de ida e volta antes de poderem ser executadas. | **T12** Qualidade da entrada |
| 13 | Densidade de dependências entre quadros | Parcial | BLOQUEADOS e O19 trazem o motivo "Dependência de outra demanda". | Os vínculos entre cards de quadros diferentes e o peso deles no lead time. Exige extrair vínculos. | **T13** Dependências |

## Estratégico (FL3, BusinessMap)

| # | Métrica da proposta | Cobertura | O que já existe | O que falta | Destino |
|---|---|---|---|---|---|
| 14 | Previsibilidade do portfólio | Parcial | O12 mede datas acordadas de **demandas**; E5 projeta datas; O6 (nome parecido) é P85 ÷ P50, outra coisa. | Para **projetos**: a data comprometida se confirmou? Quanto deslizou e quantas vezes foi replanejada? | **E6** Datas do portfólio (nome trocado para não confundir com O6) |
| 15 | Custo por demanda e por sistema | Parcial | T3 (alocação por natureza), O14 e S12 (volume por sistema). | Participação de cada sistema na capacidade entregue. Custo em R$ depende de decisão (04, D-1): a forma da proposta "custo de capacidade" não pode virar horas apontadas (7.1). | **E7** Capacidade por sistema |
| 16 | Concentração de conhecimento | Não | Nenhum. Só o BusinessMap pode responder: no Acelerato os ids de pessoa não chegam à base (allow-list). | Quantos sistemas tiveram entregas feitas por uma única pessoa na janela. Só contagem agregada. | **E8** Concentração de conhecimento |
| 17 | Envelhecimento de iniciativas paradas | Parcial | E1 decompõe o tempo antes do início, mas só de projetos **concluídos**; O10 envelhece o backlog de **demandas**. | Projetos aprovados que ainda não começaram e há quanto tempo esperam. | **E9** Projetos aguardando início |

## Nota de catálogo para a coberta (Retrabalho e reincidência)
Entrada na página "Métricas" (`/metricas`), sem cartão, com status "Coberta por outras métricas":

> **Retrabalho e reincidência.** Esta pergunta já é respondida por quatro métricas: O13 Vazão de defeitos (quanto da vazão é correção do que já entregamos), T5 Demanda de falha (o que chega porque algo antes falhou), O21 Fluxo reverso (cards que voltam depois de entregues) e, na sustentação, S8 Taxa de reabertura e S12 Volume por sistema. As duas fontes não se somam.

Os links levam a cada cartão. Nenhum número é calculado nesta entrada.

## Riscos de regra identificados na cobertura
- **Pessoa:** O26 e E8 dependem de quem foi responsável. O cálculo tem de virar contagem antes de chegar à API (o papel `dspd_api` não lê colunas de pessoa). Ver 02, "Necessidades de dados".
- **Métrica proibida:** "custo por demanda" não pode ser horas apontadas × custo-hora (7.1). Ver 04, D-1.
- **Mistura de fontes:** T10, T11 e E7 têm "gêmeos" naturais no Acelerato (S9, S3, S12). Nenhum cartão novo soma as duas fontes; o gêmeo de sazonalidade na Sustentação é decisão de escopo (04, D-11).
- **Nome:** "Previsibilidade do portfólio" colide com O6 "Previsibilidade". Renomeado para "Datas do portfólio" (decisão de UX).
