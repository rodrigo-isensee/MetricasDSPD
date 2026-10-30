# Dash atual do Acelerato (DSPD-SSSC): como cada métrica é montada

Entrada do dono no pedido 056 (2026-10-30), colada no chat e guardada aqui sem alteração de conteúdo, para o software-architect usar no plano `docs/architecture/features/056-acelerato-mysql.md`. Descreve o dash que o dono mantém hoje fora deste projeto. Não traz credenciais nem dado de chamado.

Aviso do Jarvis: o dash tem ranking, filtro e custo por agente (§2.3, §5.3, §5.4, §6). Isso fere a regra inviolável do `CLAUDE.md` (nenhuma métrica para avaliação individual) e não é reproduzido neste projeto.

---

## 0. Arquitetura

1. Três scripts Python (pymysql, somente leitura) consultam o MySQL e geram JSONs agregados.
2. `atualizar.py` roda os 3 scripts e injeta os JSONs no `_sla_template.html`, trocando placeholders `__XXX_JSON__` por `const X = [...]`. Também carimba `__STAMP__`. Gera `acelerato-sla-real.html`. Se sobrar placeholder, aborta.
3. Todo o cálculo de KPI, filtro e gráfico roda no navegador (JS puro, SVG desenhado à mão). Os dados vão embutidos no HTML (snapshot, não live).

| JSON | Placeholder / const JS | Grão | Gerado por |
|---|---|---|---|
| `_agg.json` | `AGG` | mês de fechamento × equipe × agente | `_extrai_agg.py` |
| `_abertos.json` | `ABERTOS` | 1 linha por ticket aberto | `_extrai_abertos.py` |
| `_metrics_month.json` | `MM` | mês de fechamento × equipe × agente × fila | `_extrai_metricas.py` |
| `_metrics_cat.json` | `MC` | categoria × equipe × fila | `_extrai_metricas.py` |
| `_metrics_top.json` | `MT` | top 20 piores aging / espera | `_extrai_metricas.py` |
| `_metrics_reinc_month.json` | `RM` | mês de criação × equipe | `_extrai_metricas.py` |
| `_metrics_reinc_cat.json` | `RC` | categoria × equipe | `_extrai_metricas.py` |
| `_metrics_reinc_tickets.json` | `RT` | tickets marcados SIM | `_extrai_metricas.py` |
| `_metrics_criados_month.json` | `CM` | mês de criação × equipe × agente | `_extrai_metricas.py` |

## 1. Fonte de dados

- Tabela única: `UNIFIQUE.ACELERATO_CHAMADOS` (uma linha por chamado, colunas tipadas, datas como DATETIME).
- Colunas usadas: `ticket_key`, `titulo`, `equipe`, `agente`, `categoria`, `prioridade`, `status`, `organizacao`, `tipo_ticket`, `lixeira`, `impedido`, `data_criacao`, `data_pronto`, `sla_r_status`, `sla_r_violado`, `sla_r_prazo_min`, `sla_r_saldo_min`, `sla_pa_status`, `sla_pa_violado`, e duas colunas JSON: `estatisticas` (tempo por etapa) e `campos_personalizados`.
- Sufixos do SLA: `r` = resolução, `pa` = primeiro atendimento.
- Todas as consultas rodam com `SET SESSION TRANSACTION READ ONLY` e terminam em `rollback()` (nunca commit).
- Datas: o MySQL devolve DATETIME sem fuso. O código formata como `YYYY-MM-DDTHH:MM:SS-03:00` (fuso fixo, BRT).
- Link do ticket no Acelerato: `https://unifique.acelerato.com/tickets/{ticket_key}`.

### População base (todas as abas, salvo indicação)

```
lixeira = 0
AND tipo_ticket = 'DSPD - SSSC'
AND equipe IN ('SSSC TOTVS','SSSC SENIOR','SSSC FLUIG')
```

- **Fechado** = `data_pronto IS NOT NULL`. Não usa `encerrado`: chamados já resolvidos mas parados em etapa pós-resolução (ex.: "Causa Raiz") têm `encerrado=0` e mesmo assim contam como fechados.
- **Aberto** = `data_pronto IS NULL`.
- **Mês de fechamento** = `DATE_FORMAT(data_pronto,'%Y-%m')`. **Mês de criação** = `data_criacao[:7]`.
- Duas filas coexistem: `fila='nova'` se `organizacao = 'UNIFIQUE - DSPD SUSTENTAÇÃO E PEQUENAS MELHORIAS'`, senão `'antiga'` (organização antiga: `'UNIFIQUE - DSPD SUSTENTACAO (DPTO SISTEMA PD)'`).

---

## 2. Aba "SLA e Performance" (`AGG`)

### 2.1 Resultado do SLA por chamado

O resultado do SLA já vem calculado pelo Acelerato. O script só normaliza (função `res(p)`, p = `r` ou `pa`):

```
CASE WHEN sla_{p}_status LIKE 'REALIZADO%' THEN sla_{p}_status
     WHEN sla_{p}_violado = 1 THEN 'REALIZADO_APOS_VENCIMENTO'
     WHEN sla_{p}_violado = 0 THEN 'REALIZADO_NO_PRAZO' END
```

O `CASE` existe porque chamados resolvidos que ainda estão em etapa pós-resolução ficam com `sla_*_status = DENTRO_DO_PRAZO/VENCIDO`, mas o flag `*_violado` já reflete o resultado.

### 2.2 Agregação (`_extrai_agg.py`)

```
SELECT DATE_FORMAT(data_pronto,'%Y-%m') m, equipe e,
       COALESCE(NULLIF(agente,''),'(sem agente)') a,
       SUM(RES_R='REALIZADO_NO_PRAZO')         ri,   -- resolução dentro
       SUM(RES_R='REALIZADO_APOS_VENCIMENTO')  ro,   -- resolução fora
       SUM(RES_PA='REALIZADO_NO_PRAZO')        pi,   -- 1º atendimento dentro
       SUM(RES_PA='REALIZADO_APOS_VENCIMENTO') po,   -- 1º atendimento fora
       COUNT(*) t
FROM ACELERATO_CHAMADOS
WHERE <população base> AND data_pronto IS NOT NULL
  AND (RES_R) IS NOT NULL
  AND COALESCE(agente,'') NOT IN ('','Sem agente')
  AND mês > CORTE
GROUP BY m, e, a
```

- Chamados sem agente ficam fora do SLA.
- **Histórico congelado:** os meses até `CORTE='2026-08'` vêm de `_agg_historico.json`, gerado uma única vez por `_gera_historico_agg.py` a partir da tabela antiga `chamados` (bloco `ri/ro/pi/po/t` por `LEFT(data_finalizado,7)`, `status_sla_r IN (...)`, `excluido='false'`). Motivo: a tabela nova não traz SLA calculado para ~6% dos chamados antigos e mudou o status de outros, então não reproduz o histórico validado. O resultado final é `HIST.rows + linhas novas (mês > corte)`.
- Se você não tem o histórico antigo, rode só a consulta nova sem o corte.

### 2.3 Cálculo no navegador (`renderSLA`)

- Filtra `AGG` por equipe, agente e período (filtro global).
- Escolhe o tipo de SLA: `mode='r'` → `[ri, ro]`, `mode='pa'` → `[pi, po]`.
- Por mês: `i` = soma dos dentro, `o` = soma dos fora, `c = i + o`, `p = i / c × 100`.
- KPIs: **Fechados (recorte)** = Σc; **% dentro do SLA** = Σi / Σc; **% fora** = 100 − %dentro; **Meses ≥ meta** = nº de meses com `p ≥ target`; **Melhor / pior mês** = maior / menor `p`.
- Meta padrão `target = 85` (slider). Cor: `p ≥ target` bom; `p ≥ target−15` atenção; senão crítico.
- Gráfico mensal: barras empilhadas (dentro/fora) + linha tracejada da meta + linha do **% acumulado** (`Σi / Σc` até aquele mês). Rótulo com 2 casas decimais.
- **Ranking de agentes** (top 15 por volume): usa `AGG` filtrado só por equipe e período (não aplica o filtro de agente), `p = i/(i+o)`. Clicar numa linha seta o filtro global para aquele agente.

### 2.4 Gráficos extras da aba (`drawSlaExtras`)

Todos respeitam o filtro global.

1. **Tempo sem atendimento por mês:** de `MM`, por mês, `Σ(stg['Novo Atendimento'] + stg['Backlog'] + stg['Novo'] + stg['Em triagem'] + stg['Pendente']) / Σn` (horas médias por chamado fechado).
2. **Agentes ativos por mês:** de `MM`, soma `n` por agente no mês. Conta agentes com `n > 5` (estritamente maior). Também mostra a média de tickets desses agentes: `Σn dos ativos / nº de ativos`.
3. **Abertos x fechados e relação:** abertos = chamados **criados** no mês (`CM`, população ampla, todos os status, `Σn` por `m`); fechados = `series[m].c` do gráfico de SLA; relação = `fechados / abertos × 100`. O dataset `CM` existe só para isso: `accC_m[(mês_criação, equipe, agente)] += 1` sobre todos os tickets da população base.

---

## 3. Aba "Abertos" (`ABERTOS`)

Consulta por ticket (`_extrai_abertos.py`): população base + `data_pronto IS NULL`, ordenada por `data_criacao`.

Campos: `k`=ticket_key, `t`=título, `e`=equipe, `a`=agente (`'(sem agente)'` se vazio), `pr`=prioridade, `st`=status (etapa atual), `c`=data_criacao (ISO -03:00), `statusr`=`sla_r_status`, `restante`=`sla_r_saldo_min` em "HH:MM" (negativo = vencido), `meta`=`sla_r_prazo_min` em "HH:MM", `imp`=impedido (0/1).

Conversão de minutos para texto:

```python
def hm(mins): sinal='-' if m<0 else ''; return f"{sinal}{abs(m)//60:02d}:{abs(m)%60:02d}"
```

Cálculo no navegador:

- `idade` = `floor((agora − c) / 86400000)` dias (calculada no navegador, por isso muda a cada abertura do HTML).
- `venc` = `statusr === 'VENCIDO'`. `restMin` = `parseHM(restante)` (com sinal).
- Filtros: equipe, agente, período (pela data de **criação**), SLA (todos/vencidos/no prazo) e busca textual em título + agente + ticket + prioridade + status.

| KPI | Cálculo |
|---|---|
| Abertos | nº de tickets no recorte |
| Sem agente | `a` casa com `/^\(?sem agente\)?$/i` |
| Em andamento | `st` ∈ `ABERTOS_ANDAMENTO_STAGES` (Novo Atendimento, Backlog, Em Análise, Novo, Em triagem, Pendente, Em Diagnóstico, Em Classificação, Em Investigação, Em Atendimento N1/N2/N3) |
| Aguardando | total − Em andamento |
| SLA vencido / no prazo | `venc` / total − `venc` (e % sobre o total) |
| +30 dias | `idade ≥ 30` |
| Impedidos | `imp = 1` |
| Idade média | média de `idade` em dias |

- **Projeção do SLA do mês** (`drawProj`): `curMonth` = último mês de `AGG`. Real = `ri / (ri+ro)` dos fechados no mês. Abertos simulados = abertos com `statusr` `VENCIDO` ou `DENTRO_DO_PRAZO`. Projeção = `(ri + abertos_dentro) / (ri + ro + nº_abertos)`. É uma simulação: assume que todos os abertos fecham hoje no estado atual do SLA.
- Cor da idade: ≥30d crítico, ≥8d atenção, senão bom. Cor do saldo: <0 crítico, <480 min atenção, senão bom.

---

## 4. Aba "Reincidência" (`RM`, `RC`, `RT`)

- Fonte: coluna JSON `campos_personalizados` (lista de `{nomeCampo, valor}`).
- Regra: procura o campo cujo `nomeCampo` contém `'90 dias'` (pergunta "Este problema já ocorreu nos últimos 90 dias?") com `valor` preenchido. `SIM` → 1; `NÃO`/`NAO` → 0.
- **População ampla** (abertos + fechados), porque reincidência é característica do ticket e não do fechamento.
- Agregação por **mês de criação × equipe**: `n` = total de tickets criados, `rresp` = tickets que responderam, `rsim` = respostas SIM.
- **Taxa exibida = `rsim / n × 100`**, ou seja, SIM sobre TODOS os chamados criados no mês (não só os que responderam, decisão do usuário). Isso subestima a taxa real, porque quem não respondeu conta como não reincidente. A amostra é minúscula (poucos tickets respondem o campo).
- KPIs: total criados no recorte, nº SIM, % reincidência.
- O filtro de agente não se aplica aos KPIs/gráfico (`RM` não tem agente). Só se aplica à tabela de tickets (`RT`).
- Tabela `RT`: todos os tickets com SIM (mesmos campos da aba Abertos, ordenados por criação desc). A idade usa `df` (fechamento) se existir, senão agora.

---

## 5. Aba "Aging": como o tempo por etapa é obtido

### 5.1 Etapas por ticket

Coluna JSON `estatisticas` → `workflow.etapas[]`, com `descricao` (nome da etapa do kanban) e `tempoSla` (**segundos** no estágio, tempo de relógio do SLA e não wall-clock puro). Só os tickets **fechados** da população base entram. Etapas em `FINAL_STAGES` (`Concluído`, `Encerramento`, `Causa Raiz`, `Revisão`, `Encerrado`) são ignoradas, pois são tempo residual pós-resolução.

Por ticket, em `_extrai_metricas.py`:

- `stg[etapa]` = horas por etapa, para cada etapa de `STAGE_ORDER` (20 etapas, ordem do fluxo kanban, fluxo antigo e novo).
- `ha` = horas "atuando" = soma das etapas **não finais e fora de `WAITING_STAGES`**.
- `hg` = horas "aguardando" = soma das etapas em `WAITING_STAGES` (fila e esperas). A lista inclui `Novo Atendimento`, `Backlog`, `Aguardando Solicitante`, `Aguardando Suporte Terceiros`, `Aguardando Equipe Interna`, `Data Acordada`, `Aguardando Aprovação`, `Aguardando Janela de Mudança (Deploy Produção)`, `Pronto para Desenvolver`, `Solicitar RDM`, `Nova Demanda`, `Novo Mudança`, `Retorno`, `Testes Integrados (Usuários)`, `Novo`, `Em triagem`, `Pendente`, `Aguardando Validação`, `Aguardando Validação de Prioridade`, `Aguardando Atribuição`, `Aguardando Fornecedor`.
- `agsol` = dias em `Aguardando Solicitante` (segundos / 86400).
- `h1a` = horas em `Novo Atendimento` + `Novo` (1º atendimento).
- `aging` = `(data_pronto − data_criacao)` em **dias corridos** (2 casas).
- `agingLiq` = `max(0, aging − agsol)` é calculado e exportado, mas **não é exibido**.
- `tipo` = pelo prefixo da categoria: `SSSC-R...` → requisição, `SSSC-I...` → incidente, senão outro.
- `bkt` = horas por bucket (seção 5.2).

Os `MM`/`MC` somam esses valores (round 1 casa) por grão: `n` (tickets), `ha`, `hg`, `aging`, `agsol`, `h1a`, `stg{}`, `bkt{}`, `rsim`, `rresp`. **Médias são sempre `soma / n` calculadas no navegador.**

### 5.2 Os 5 buckets (aba Aging "nova")

Mapa etapa → bucket **depende do tipo** (requisição × incidente). Os totais somam os dois tipos nos mesmos 5 baldes.

| Bucket | Rótulo | Requisição | Incidente |
|---|---|---|---|
| `atend0` | Sem atendimento | Novo, Novo Atendimento, Backlog, Retorno, Pronto para Desenvolver, Nova Demanda, Novo Mudança, Solicitar RDM, Em Planejamento, Planejamento | Em triagem, Retorno, Novo Atendimento, Novo, Backlog, Aguardando Validação de Prioridade, Aguardando Atribuição, Em Classificação, Novo Mudança, Em Planejamento |
| `atend1` | Em atendimento | Em Análise, Em Andamento | Em Atendimento N1/N2/N3, Em Diagnóstico, Em Análise, Em Investigação |
| `esperaComb` | Espera combinada | Data Acordada, Aguardando Janela de Mudança (Deploy Produção) | Data Acordada |
| `esperaUser` | Espera do solicitante | Aguardando Solicitante, Testes Integrados (Usuários), Em Validação | Em Validação, Aguardando Solicitante, Aguardando Validação, Pendente |
| `esperaTimes` | Espera de outros times | Aguardando Suporte Terceiros, Aguardando Equipe Interna, Aguardando Fornecedor, Aguardando Aprovação, Em Aprovação, Encaminhar para Desenvolvimento, Encaminhar para Projeto | Aguardando Equipe Interna, Aguardando Suporte Terceiros, Aguardando Fornecedor |

O mapeamento foi validado contra o levantamento real de etapas por tipo (arquivos `_etapas_por_tipo.txt`, `_status_por_tipo.txt`). A cobertura do tempo não-final ficou em 100%.

### 5.3 Aba "Aging" (fila nova): `renderAging`

Sem filtro por fila, usa todo o `MM` (equipe/agente/período). KPIs:

- **Chamados (recorte)** = Σn.
- **Aging médio** = Σaging / Σn, em dias (abertura → fechamento).
- Cards por bucket, três visões: total em horas (Σbkt), média por ticket (Σbkt / n) e % do tempo (bucket / soma dos 5).
- Gráficos mensais (média por ticket, por mês de fechamento): aging (dias), `atend0` (horas, "sem atendimento"), `atend1` (horas, "em atendimento") e as 3 esperas somadas (horas).
- Rankings por agente (aging médio e `atend0` médio), sem mínimo de tickets (a fila nova ainda tem volume pequeno).

### 5.4 Aba "Aging legado" (fila antiga): `renderAgingCore('antiga', ...)`

Filtra `MM` por `fila === 'antiga'`. Usa `stg` por etapa em vez de buckets. Etapas: Novo Atendimento, Backlog, Em Análise, Aguardando Solicitante, Retorno, Aguardando Suporte Terceiros, Aguardando Equipe Interna, Data Acordada.

- **1º atendimento médio** = Σ `stg['Novo Atendimento']` / n (horas).
- **Backlog médio** = Σ `stg['Backlog']` / n.
- **Fila de entrada média** = 1º atendimento + backlog, média por ticket.
- **Aguardando solicitante** = Σagsol / n (dias).
- Cards por etapa: total (h), média por ticket, % do tempo total das etapas listadas.
- 4 gráficos mensais (aging, 1º atendimento, backlog, 1º atendimento + backlog).
- Rankings por agente exigem ≥ 5 tickets no recorte (`g.n ≥ 5`).

---

## 6. Aba "Custo operacional" (`MM`, `MC`, `MT`)

Todas as métricas são calculadas no navegador, sobre `MM` (e `MC` para categoria).

- **Horas atuando** = Σha. **Horas aguardando** = Σhg. Ambos também por ticket (÷ n).
- **% do tempo em espera** = Σhg / (Σha + Σhg). Alerta se > 50%.
- **Tempo operacional médio** = (Σha + Σhg) / n.
- **Custo monetário** (taxas configuráveis na tela, ficam só no `localStorage` da chave `acelerato_costRates_v1`): 1 input R$/h por etapa de `STAGE_ORDER` + 1 campo "manuseio" (R$ por ticket, `_handling`). Padrões: `Em Análise` = R$ 100/h; manuseio = R$ 10/ticket. O padrão só vale se a etapa nunca foi configurada (teste `s in r`, para distinguir 0 explícito de "nunca configurado"). `custo_etapa[s] = Σ(stg[s] × taxa[s])` e `custo_total = Σ_etapas custo_etapa + taxa_manuseio × n`. Custo médio por ticket = `custo_total / n`. Rankings: custo por agente e por categoria somam `taxa_manuseio × n + Σ(stg × taxa)`. Barras de horas atuando × aguardando por agente (top 10), por categoria (top 10) e por mês. `recomputeCusto()` só recalcula números. `renderCusto()` monta os inputs uma vez (se recriar os inputs a cada tecla, o foco se perde).
- **Top ofensores (`MT`):** os 20 tickets com maior `aging` e os 20 com maior `hg`. Filtrados no navegador por equipe, agente e mês de fechamento.
- **Atenção a dois vocabulários diferentes no mesmo arquivo:** `WAITING_STAGES` (Python, define `ha`/`hg`) trata `Novo Atendimento`/`Backlog` como espera; `ABERTOS_ANDAMENTO_STAGES` (aba Abertos) trata essas mesmas etapas como "em andamento" (definição do usuário). Não unifique sem confirmar com quem usa o dashboard.
- `ATU_STAGES` (JS) só serve para destacar visualmente os cards de etapas de atuação.

---

## 7. Filtro global (`mountGlobalFilter`)

Um único estado `st = {eq:Set, ag:Set, pStart, pEnd, yr:Set, mo:Set}` usado por TODAS as abas.

- `inEq(e)`: vazio = todas as equipes. `inAg(a)`: vazio = todos os agentes (multi-seleção com busca).
- `inTime(m)`: `pStart ≤ m ≤ pEnd`, e se houver ano(s)/mês(es) selecionados, também precisa pertencer a eles.
- Padrão ao abrir: período do 1º mês do ano mais recente até o último mês (preset "Ano atual").
- Universo de meses/equipes = `AGG ∪ MM ∪ RM`. Universo de agentes = `AGG ∪ MM ∪ ABERTOS ∪ RT`.
- Qualquer mudança chama `renderAll()`, que re-renderiza todas as abas.
- **A semântica do mês muda por aba:** SLA, Aging e Custo filtram pelo mês de **fechamento**; Reincidência e Abertos filtram pelo mês de **criação**.

---

## 8. Armadilhas

1. A tabela nova não reproduz o histórico de SLA antigo, daí o congelamento até 2026-08 (seção 2.2).
2. `_extrai_abertos.py`: o docstring diz "encerrado=0", mas o WHERE usa `data_pronto IS NULL`. Vale o WHERE.
3. Os campos de SLA são HH:MM como texto; o saldo negativo significa vencido.
4. Nunca use `encerrado` para definir fechamento (seção 1).
5. Os textos vêm em UTF-8 (`charset=utf8mb4`). O console do Windows mostra mojibake; grave em arquivo UTF-8.
6. O `_sla_template.html` não fecha `</body>`/`</html>`. Para injetar script de teste, faça append no fim do arquivo.
7. A API REST do Acelerato limita a 10 resultados por chamada. Por isso o dashboard lê do banco.
8. As etapas de `STAGE_ORDER` ficam duplicadas em Python e JS (`_extrai_metricas.py` e o template). Se mudar uma, mude a outra.
9. Para validar o filtro sem navegador interativo, use `msedge.exe --headless=new --dump-dom`, injete um script que dispare os eventos e grave o resultado em `document.title`.
