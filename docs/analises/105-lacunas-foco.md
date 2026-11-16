# 105 · O que falta para Operacional, Sustentação e Apontamento ficarem prontos com dado real

Pedido 105, etapa E7.201. Autor: qa-engineer. Data: 2026-11-16. Base de leitura: `develop` em 2a4dc3b9 (inclui o PR 489).

## Como ler (limites desta leitura)

- Só leitura de código e documentos; **nada foi consultado na base nem na API**. O estado vem do mapa real (`packages/contratos/src/origem.ts`, comentários por métrica), de `docs/analises/064-lacunas-dado-real.md` (medição de 2026-11-04, a base de então), do pedido 105 e do `KANBAN.md`. Número de base citado é de quem o mediu (064 ou o assistente no histórico do 105), com a data; não foi reconferido aqui.
- Estados: **real** (está no mapa real e publica a partir da coleta; abaixo de 20 itens aparece "insuficiente", o que é regra do briefing e não lacuna); **parcial** (real, mas uma parte sai nula com motivo); **não publica** (fora do mapa real: a API responde `sem-dado-real` com o motivo); **em voo** (muda com PR ainda não mesclado na develop).
- **Fictício ou mock:** nas três abas nenhuma métrica chega ao usuário como número fictício. O mock só existe com `DSPD_MODO_MOCK=homologacao` (extensões e pesquisa), e o 064 não achou fixture no caminho de produção. Por isso a coluna "estado" não tem a linha "fictício".
- Quem: `dono` = decisão ou ação que só o dono faz; `pessoas` = configuração no BusinessMap ou Acelerato (WS1, WS4); `node-backend`, `react-frontend`, `devops`.

## 1. Operacional (FL1, BusinessMap)

| Métrica | Estado | Falta | Quem |
|---|---|---|---|
| O1 WIP e aderência | real | Limite de WIP em 3 de 50 times (064, M2): o resto sai sem aderência. Configuração, não código | pessoas (WS1) |
| O2 Idade do trabalho | real | Motivo do bloqueio aberto vem "não classificado" (ver BLOQUEADOS). Filtro por equipe no id numérico do quadro: conferir se L3 do 064 já foi corrigido | node-backend |
| BLOQUEADOS | real, motivo pobre | A base tem 198 bloqueios, todos "não classificado" (assistente, 07:46): o mapa `motivo_bloqueio` está vazio de propósito (P-075-3). O dono decidiu (09:13) mostrar os motivos do catálogo `/blockReasons`. Falta o PR dos motivos (E7.184, branch `feature/105-motivos-bm`, sem PR), o motivo 14 (Aguardando fornecedor) no mapa, `ref-sync` e reprojetar o passado com versão de critério datada | node-backend, depois dono roda ref-sync |
| O3 Tempo de ciclo e SLE | real | `ref_sle` sem carregador (064, L5): sai a nota "SLE não definido". Pessoas definem o SLE (T6.2) | pessoas, depois node-backend |
| O4 Vazão | real | nada | n/a |
| O5 Eficiência de fluxo | real | Depende de `fato_bloqueio`; ligado no 075. Sem pendência própria; ganha com a reclassificação dos motivos só se o cálculo usar o motivo (não usa) | n/a |
| O6 Previsibilidade por classe | real; em voo | Classe pelas etiquetas (decisão 15/11): card sem etiqueta fica fora, e o dono ainda deveria criar as etiquetas de classe no BusinessMap (pendência do 22:38 de 15/11). O PR 490 troca por prioridade nativa; está com CI vermelho e volta única em curso (E7.177) | dono/pessoas (etiquetas), node-backend (490) |
| O7 Entrada × saída | real | nada | n/a |
| O8 Tamanho das demandas | real o tempo; divisão por tamanho em voo | Divisão por tamanho segue "sem dado real" na develop (`MOTIVO_O8_POR_TAMANHO_SEM_DADO_REAL`: nenhum card tem tamanho). PR 486 (régua do tamanho) aprovado em review, QA, segurança e UX no 7ce58754, reintegrado em 67ddb776; falta só o merge, na frente da fila | tech-lead (merge) |
| O9 Três relógios | real | nada | n/a |
| O10 Envelhecimento do backlog | real | Visão "do cliente" depende de área solicitante (campo Gerência, plano de campos) | node-backend (plano-campos) |
| O11 Composição do backlog | real | Papéis de coluna: 155 de 999 colunas sem papel (064, M3) | pessoas (WS1) |
| O12 Acordos × vencidos | parcial | Acordos e vencidos reais pelo prazo nativo. `porResponsabilidade` e `vencidosCausaInterna` saem nulos: o interruptor `RESPONSABILIDADE_ATRASO_COM_FONTE` está `false`. O campo no BusinessMap não existia às 08:45 (diagnóstico); às 08:52 o dono disse "campos criados", a conferir. Falta: campo conferido, coleta ligada, PR de critério com `afeta = ['O12','VISAO_GERAL']` | dono/pessoas (campo), node-backend |
| O13 Vazão de defeitos | real | nada | n/a |
| O14 Origem da demanda | não publica | Motivo "aguardando campo no quadro". Campo Origem da Demanda (id 49) criado, mas só 9 cards com seleção no spike (09:02); a leitura das opções falhou duas vezes (catálogo sem opções; E7.196 troca para `/customFields/{id}/allowedValues`). Falta spike aprovado pela segurança, coleta e projeção de `origem_demanda`, e preenchimento do campo pelos times | node-backend, pessoas (preencher) |
| O15 Contenção de bugs | real | Só bugs com pai na base; fase pela coluna do pai na abertura (tabela aprovada). Sem pendência | n/a |
| O16 Estoque e idade de bugs | real | Bug sem severidade aparece como "Sem severidade" até o `bm:ref-sync` com a reprojeção C8a | dono roda ref-sync |
| O17 Causa raiz (por sistema) | parcial | Por sistema é real (categoria do Acelerato). A parte por causa raiz do incidente é definitiva sem dado: texto livre, ADR 0020, motivo do PR 489 (mesclado). A causa raiz dos bugs do BusinessMap (campo 48, PR 484 mesclado) está com a carga parada: nos cards a API manda só `value_id` e `position`, sem rótulo, e a carga viraria tudo "desconhecido" até o catálogo de rótulos (mesmo spike do O14) | node-backend |
| O18 Vazão com e sem bug | real | Pelos vínculos pai-filho e relacionado; sem pendência | n/a |
| O19 Bloqueios por causa | real, sem separação | Mesma causa do BLOQUEADOS: 198 bloqueios em um motivo só. É a métrica que mais ganha com o PR dos motivos | node-backend |
| O20 Fluxo cumulativo | real | nada | n/a |
| O21 Fluxo reverso | real | nada | n/a |
| O22 Primeiro toque | não publica | Entrou no escopo (decisão 16/11 05:54): primeira atualização por pessoa depois da chegada, sem nome nem texto. B7a (coleta, fronteira) aprovado em review, QA e segurança no 6a8adeea, sem PR próprio; B7b (base e carga, `feature/105-o22-base`) começou. Falta B7b, B7c e a carga do passado de 12 semanas (~7 h de API em uma ou duas noites, decisão do dono). Automação sob conta de pessoa não se separa (decisão do dono) | node-backend, dono (janela da carga) |
| O24 Ordem de chegada | real; em voo | Classe pelas etiquetas (mesmo ponto do O6); PR 490 troca por prioridade nativa | ver O6 |
| O25 Descarte | real | nada | n/a |
| O26 Passagens de mão | não publica, com data | Decisão do dono: sem dado real até 12 semanas de histórico de responsáveis, a partir de 01/02/2027 (histórico desde 09/11/2026). Só espera | ninguém (tempo) |
| O27 Causa raiz dos bugs | não existe | Só o plano (E7.136): Bug interno e Defeito em produção lado a lado; 5 perguntas D1 a D5 ao dono sem resposta. Sem `MetricaId` no contrato. Fica atrás do campo 48 (ver O17) | dono (D1 a D5), arquiteto, node-backend |
| EI_FL1 Espera invisível | real | nada | n/a |
| TENDENCIA_FLUXO | real | nada | n/a |

Filtros do Operacional: `ref_dominio` do BusinessMap estava vazio em 04/11 (064, M6), então sistema, objetivo e área não tinham opções. O plano de campos (E7.171, lotes L0 a L4, perguntas P1 a P7 ao dono) é o caminho; a leitura das etiquetas `SISTEMA - ` exige mudar a fronteira (allow-list), com parecer de segurança.

## 2. Sustentação (Acelerato)

Todas leem só o Acelerato. A lista de "SDR" do 064 (S1, S5, S6, S7, S9, S11, S12, O17) está vencida: todas entraram no mapa real nos pedidos 099 e 105.

| Métrica | Estado | Falta | Quem |
|---|---|---|---|
| S1 MTTA e MTTR | real, com portão | Sem `ref_alvo_prioridade` a API responde 503. O dono precisa ter rodado `ac:ref-sync` dos alvos e as consultas Q-RO-11 e Q-RO-12 (ADR 0026 P3). Primeiro atendimento = primeiro comentário, inclui resposta automática (nota fixa) | dono (ref-sync), conferir na base |
| S2 Aderência ao SLA | real | Exceção de SLA por registro posterior sem fonte (nota fixa; nenhum chamado sai por esse motivo). P1 abaixo de 20 em 04/11 | sem ação (limite da fonte) |
| S3 Volume por prioridade | real | Ajustes manuais: só "Sim" conta, "Não" e vazio não se separam (nota). P1 com 9 em 04/11 | sem ação |
| S4 Resolução por nível | real | `nivel_resolucao` vazio em 70% dos fechados e nenhuma célula chega a 20 (064, M4); tempo por etapa vem de intervalos sintéticos (D-7). O número publica mas quase sempre "insuficiente" | pessoas (WS4, preencher o nível) |
| S5 Motivos da escalação | real, só PROC | Valem só os cinco fluxos do PROC; precisa `ac:ref-sync` com `fluxo_proc` (sem ele, "sem dado real" com motivo). A faixa "Risco de estouro de SLA" sai com zero, sem fonte (nota). Mês e volume por motivo dependem do preenchimento do campo | dono (ref-sync), pessoas |
| S6 Motivos de encerramento | real, só PROC | Idem S5; motivo sem par vira "Outro" (decisões P2 e P3) | dono (ref-sync) |
| S7 Reclassificação | real, só PROC | Idem S5 | dono (ref-sync) |
| S8 Taxa de reabertura | real, resultado frágil | 95,4% dos incidentes "sem resposta" no campo e taxa 0% por D-10 (064, M5). A pergunta ao dono (esse 0% é o desejado?) não aparece respondida nos documentos lidos | dono (decisão), pessoas (WS4) |
| S9 Tempo em pendência | parcial | Motivos decididos para Solicitante, Suporte Terceiros, Fornecedor e Janela de Mudança; previsão de retorno sem data na base (n = 0). Falta o D5b (motivo da Pendente), em E6 do pedido | node-backend |
| S10 Fila de atribuição | real, quase sempre insuficiente | 9 chamados em 04/11 (abaixo de 20) e saída da etapa sintética (L10) | sem correção planejada |
| S11 Avaliação de Problema | real, só PROC | Conversão em Registro de Problema pelo campo "Avaliação de Problema" (E7.101, PR 485 mesclado); chamado sem fluxo fica fora, contado. Falta o K-374 (retirar a extensão que lia `registroProblema`) | node-backend |
| S12 Volume por sistema | parcial | Volume real; reincidência e exceção de SLA por registro posterior nulas, com nota | sem ação (limite da fonte) |
| O17 por sistema | real | Parte por causa raiz do incidente é definitiva sem dado (K-372, PR 489 mesclado) | n/a |
| EI_SUST Espera invisível | não publica | "Cálculo ainda não definido para o Acelerato": a regra não está no plano 056; o pedido 105 deixa como "cálculo a definir com o dono" | dono (regra), depois arquiteto e node-backend |
| TENDENCIA_SUST | real | nada | n/a |

Texto fixo do recorte (organização, tipo e equipes escritos no componente, L8 do 064): coincidia com a base em 04/11; risco latente se o `ref_dominio` mudar.

## 3. Apontamento (BusinessMap, rota própria)

Todo o cálculo é de `calcularApontamento` (exceção à regra de métrica individual aprovada pelo dono em 01/11/2026). Todas as seis seções estão em código e, em 04/11, havia 15826 apontamentos ativos em 84 dias. A tabela abaixo trata do que o 064 deixou aberto; **não verifiquei na base se algum item já foi resolvido depois de 04/11**.

| Seção | Estado | Falta | Quem |
|---|---|---|---|
| Cabeçalho, frescor e período | real, dependente de ambiente | A rota só existe com `PG_APONTAMENTO_URL` (L12); sem ela a aba mostra erro. Em 04/11 a tarefa `apontamento` tinha 1 falha e 1 parcial, 0 sucesso (M1): conferir se há coleta com sucesso e se o selo aceita `parcial` | devops (variável), node-backend (selo) |
| Aviso "Registro incompleto" | real, dependente de migração | Precisa da migração 0034 (`ctl_apontamento_cobertura`), que não estava aplicada em 04/11 (M8) | devops (migrar antes da API) |
| Quanto foi apontado (KPIs) | real | Dia atípico = constante de código de 16 h (`LIMITE_ATIPICO_SEGUNDOS_PADRAO`); em 04/11, 10 dias de pessoa acima disso. Valor é pergunta ao dono, comentada no código | dono (valor), node-backend |
| Onde o esforço foi gasto | real | 40% "não classificado" e 8,3% sem tipo em 04/11 (M7): pode ser o retrato real ou regra de subgrupo a revisar | arquiteto (conferir regra), dono |
| Qualidade (geral, por pessoa, matriz) | real | 95,8% com alguma flag de qualidade (M7); significado de cada bit a conferir antes de o dono ler a tela | arquiteto |
| Capacidade (mensal e por pessoa) | real, calendário a conferir | Em 04/11 não havia calendário nem feriado na base (L7): feriado contava como dia útil. Desde então existe a entrada `ref:sync-calendario` (ADR 0027, lê `docs/architecture/fontes/calendario.json`); falta confirmar que o dono a rodou e que o arquivo cobre os feriados do período | dono (rodar), pessoas (feriados) |
| Achados gerados | real, limiares provisórios | `LIMIARES_ACHADO_PADRAO` é proposta técnica, marcada como pergunta ao dono; o serviço não lê limiar da base | dono (valores), node-backend |
| Dia a dia (mapa diário) | real | Herda a constante de 16 h e o calendário | idem acima |

## 4. O que destrava mais métricas por menos trabalho

Em ordem de custo contra efeito. As quatro primeiras já têm entrega aprovada ou ação curta.

1. **Mesclar o PR 486 (O8 por tamanho).** Quatro portões aprovados, só falta o merge na fila. Destrava a divisão do O8, hoje o único trecho do cartão sem dado real. Custo: um merge (tech-lead).
2. **Motivos de bloqueio (E7.184) com o id 14 no mapa, `ref-sync` e reprojeção.** Muda BLOQUEADOS, O2 e O19 de "tudo não classificado" para as causas reais do time, e libera o T10 (FL2) depois. Três métricas por um PR; sem PR aberto ainda.
3. **Rodar `ac:ref-sync` e conferir a carga dos fluxos do PROC e dos alvos de prioridade.** Sem isso S1 responde 503 e S5, S6, S7 e S11 ficam "sem dado real". Cinco métricas da Sustentação por uma ação do dono, sem código novo (conferir antes na base o que já foi carregado).
4. **Fechar o PR 490 (prioridade nativa em O6 e O24).** Já existe; falta a volta única (CI, A4 do T4, faixa "Sem prioridade") e o hash da base mock, que é do QA. Duas métricas do fluxo.
5. **Spike dos campos pelo `/customFields/{id}/allowedValues` (E7.196).** Um conserto destrava dois consumidores: o rótulo da causa raiz (campo 48, hoje com carga parada, que também sustenta o O27) e as opções de Origem da Demanda, Gerência e Diretoria (O14, área solicitante, filtros). Hoje é o gargalo de O14, O17 por causa raiz, O27 e do filtro por área.
6. **Apontamento, só ambiente e decisão:** confirmar `PG_APONTAMENTO_URL`, migração 0034 e coleta com sucesso; rodar `ref:sync-calendario`; o dono decide as 16 h e os limiares dos achados. Sem código novo, tira a aba de "depende de ambiente" e de "feriado conta como dia útil".
7. **Decisões do dono que bloqueiam sem custo técnico:** regra do EI_SUST; o 0% do S8; D1 a D5 do O27; P1 a P7 do plano de campos; interruptor da responsabilidade do atraso no O12 depois de conferido o campo.
8. **O22 (B7b e carga) e O26 (01/02/2027)** são os mais caros e os que dependem de tempo: o O22 pede carga de ~7 h de API; o O26 só espera.

Fora do foco por ordem do dono (09:51): táticas (FL2). T9 e T11 já estão reais.
