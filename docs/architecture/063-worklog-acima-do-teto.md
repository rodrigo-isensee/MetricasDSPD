---
tipo: plano-tecnico
contrato: 1
pedido: 063-worklog-cards-acima-do-teto
estado: proposta
ux: docs/ux/063-worklog-acima-do-teto/ (E1.2, em paralelo; texto e lugar do aviso)
adrs: [0025, 0020, 0015, 0022]
agentes: [node-backend, react-frontend, security-engineer, qa-engineer, tech-lead]
---

# 063: registro de horas dos cards acima do teto de 1000 (discovery E1.1, K-200)

Estado: proposta, à espera da validação do dono (E1.3). Data: 2026-11-03. Autor: software-architect.
Revisão E1.12 (2026-11-03, depois do spike E1.5): a API do `/loggedTime` **pagina**. O plano da coleta (C1) passa a **seguir as páginas de cada consulta antes de qualquer divisão por período**; a divisão por período sai do caminho principal e fica só como contingência (C1.9). Isso troca o caminho da DECISÃO DO DONO "B" e vira a pergunta D-5. Fontes a mais da revisão: `server/src/modulos/businessmap/spike-paginacao.ts`, `server/src/plataforma/http.ts` (`listarPaginas`, `envelopePaginado`, `CONSULTA_WORKLOG`, `TETO_WORKLOG`) e `docs/security/063-spike-paginacao.md`, na worktree `MetricasDSPD-052h`.
Fontes lidas: ADR 0025; `server/src/modulos/businessmap/apontamento/lotes.ts`, `coleta.ts`, `registro.ts`; `server/src/plataforma/http.ts`; `server/src/plataforma/db/grants.ts`; `server/src/modulos/apontamento/servico.ts` e `repositorio.ts`; `packages/metricas/src/core/frescor.ts`; `web/src/features/apontamento/useApontamento.ts`; a OpenAPI pública do BusinessMap (`https://demo.kanbanize.com/openapi/json`, lida em 2026-11-03). Nenhuma chamada à API do BusinessMap, nenhum `.env` lido, nada escrito no BusinessMap.

Conferência com a constituição: o projeto não tem `docs/constituicao.md`; conferido contra as regras invioláveis do `CLAUDE.md`: **conforme**. O aviso é por card, nunca por pessoa; nenhuma hora é estimada nem completada sem dado lido; a carga continua append-only; BusinessMap não se mistura com Acelerato; só GET.

## (a) Como a coleta registra hoje o card que parou no teto, e o que a API do projeto expõe disso

**Na coleta (código lido):**
1. `lerLote` (`lotes.ts`) pede `GET /loggedTime` com `card_ids` (até 200), `per_page=1000` e o filtro da passagem. Se vierem 1000 registros ou mais, o lote fica com `falha = 'lote_no_teto'` e é dividido ao meio **só por `card_ids`**. Quando sobra um card só, ele não divide mais: a folha volta com `completo: false`, `falha: 'lote_no_teto'` e **os 1000 itens recebidos** (`itens: falha === 'lote_no_teto' ? itens : []`).
2. `processarFolha` (`coleta.ts`) processa esses 1000 itens normalmente: eles passam pela allow-list e pela classificação, entram em `stg_apontamento` e são projetados em `fato_apontamento`. Na mesma transação, grava `ctl_coleta_falha` com `entidade = 'apontamento'`, `id_origem = card_id` (lote de um card só) e `erro = 'lote_no_teto'`. O código também entra em `x.falhas`.
3. Consequências que o código produz:
   - **Horas parciais na aba, sem aviso.** Os 1000 registros lidos estão em `fato_apontamento` e entram nas somas. O resto não está na base. A doc da API diz que a lista vem "in the order in which they were added", então os 1000 tendem a ser os registrados primeiro. Isso **não está confirmado** para esses cards.
   - **Sem exclusão falsa.** O card incompleto não entra em `x.completos`, então a varredura de presença não marca exclusão nele (ADR 0025 item 4). Isso está correto e tem de continuar assim.
   - **A carga inicial não fecha `sucesso`.** `lote_no_teto` é falha de execução: a coleta fecha `parcial` e `marca_dagua_ate` não é gravada (linhas 340 a 342). O checkpoint `lotes_concluidos` para no primeiro lote que falhou (condição `concluidos === i`).
   - **O incremental não roda.** `coletarApontamentos` no modo `incremental` lê `max(marca_dagua_ate)` só de coleta com status `sucesso` e recusa com `sem-marca` se não achar nenhuma (linhas 274 a 276). Se nenhuma coleta de apontamento fechou `sucesso` depois da carga de 2026-11-02 20:38 (coleta 8), a coleta diária do worklog está parada pelos 5 cards. **Isso é dedução do código, não leitura do banco**: falta conferir em `ctl_coleta` (pergunta D-4).
   - **Se o incremental rodar, todo domingo fecha `parcial`.** A varredura longa (`from_date` = 12 meses) relê os 5 cards inteiros, bate no teto de novo e fecha `parcial`, e a marca d'água não anda naquele dia. A varredura diária de 90 dias pode bater também, conforme o volume recente do card.

**Na API do projeto (o que chega à tela):**
- O papel `dspd_api_apontamento` lê de `ctl_coleta` só `coleta_id, tarefa, status, iniciado_em, finalizado_em` (`COLUNAS_API_APONTAMENTO`, `grants.ts`). Ele **não tem acesso a `ctl_coleta_falha`**.
- `GET /api/apontamento` (`servico.ts`, `montarApontamento`) devolve só `frescor: { selo, ultimaColetaOk }`. O selo vem de `seloFrescor`, que só tem quatro valores: `sem-coleta`, `falha`, `atrasado` e `atual`. Coleta `parcial` não tem selo próprio. Sem nenhuma coleta `sucesso`, o selo é `sem-coleta`.
- `useApontamento.ts` só repassa a resposta. **Hoje nenhum dado diz à tela quais cards estão incompletos.** O único registro dos 5 cards são as 5 linhas `lote_no_teto` da coleta 8 em `ctl_coleta_falha`.

## (b) A API do BusinessMap aceita filtrar um único card por faixa de datas?

**Sim, pela documentação.** Referência: OpenAPI pública `https://demo.kanbanize.com/openapi/json`, operação `GET /loggedTime` (operationId `getLoggedTimes`, resumo "Get a list of logged times"), lida em 2026-11-03. Os parâmetros, todos opcionais e combináveis, com o texto da doc:
- `card_ids`: "Filter logged time by card IDs." Um card só é a lista de um elemento.
- `from_date`: "The earliest date from which to retrieve results, based on the date the entry is created for, in `YYYY-MM-DD` format." É a data do apontamento, que o código grava como `data_apontamento`.
- `to_date`: "The latest date from which to retrieve results, based on the date the entry is created for, in `YYYY-MM-DD` format."
- `logged_from` / `logged_to`: data e hora em que o apontamento foi registrado (`YYYY-MM-DD HH:mm:ss`). Existem também `logged_from_date` e `logged_to_date`.
- `per_page`: "The default value is `200` and the maximum is `1000`."
- `page`: "Results are **always** paginated and returned in pages. This parameter controls which page is returned. Defaults to the **first** page if not specified."
- Resposta 200: `pagination { all_pages, current_page, results_per_page }` e `data` (lista de LoggedTime).

O que isso significa para o nosso código:
- `card_ids` + `from_date` + `to_date` já estão na lista fechada `CONSULTA_WORKLOG` (`http.ts`, linhas 75 a 84). **A coleta por período não precisa de caminho nem parâmetro novo no cliente.** O `to_date` só não é usado hoje.
- **A doc contradiz o spike E2.3 sobre paginação.** A ADR 0025 (Contexto) registra "resposta sem paginação (sem metadado de página)". A doc diz que a resposta é sempre paginada e documenta o `page`. O envelope que o cliente aceita (`{ data: { data, pagination? } }`) é compatível com as duas leituras. Sem chamar a API, a contradição fica **não confirmada**. Se a API paginar de verdade, o `lote_no_teto` é só a página 1 e bastaria pedir a página 2. O plano abaixo não depende dessa resposta (pergunta D-2).
- Fica não confirmado pela doc: se o filtro de data é inclusivo nas duas pontas. O texto ("earliest" e "latest") sugere que sim, mas o teste da E2.1 trata a ponta como inclusiva e a conferência de duplicatas usa `logged_time_id`, então uma sobreposição de um dia não duplica nada.

### b.1 Resultado do spike de paginação (E1.5, 2026-11-03 15:56, máquina do dono)
Comando: `pnpm run bm:spike-paginacao 10318` (sem `--`: com `--` o script recusa com "informe um único id de card"). Uma chamada: `GET /loggedTime?card_ids=10318&page=2`, **sem** `per_page`, `fields`, `include_logged_time_for_subtasks` nem filtro de data (`spike-paginacao.ts`, linha 56).

| Medida | Valor |
|---|---|
| status HTTP | 200 |
| registros devolvidos | 200 |
| envelope | `pagination` e `data` |
| `all_pages` | 3 |
| `current_page` | 2 |
| `results_per_page` | 200 (o padrão da doc, porque o spike não mandou `per_page`) |

**Conclusão: a API do `/loggedTime` pagina.** Isso contradiz o spike E2.3 registrado na ADR 0025 ("sem paginação") e confirma a doc ("Results are always paginated"). A contradição D-2 está resolvida.

O que o spike **não** diz (não inferir daqui):
- O volume do card na consulta da coleta. O spike não mandou `include_logged_time_for_subtasks=1` nem `from_date`, que a coleta manda, então `all_pages=3` com 200 por página (de 401 a 600 registros naquela consulta) não é o volume que a coleta lê. A coleta recebeu 1000 ou mais nesse card, com subtarefas e 12 meses.
- Por que o spike E2.3 registrou "sem metadado de página". A forma lida em E2.3 não está guardada ao lado da ADR, e o texto não diz se o metadado foi procurado em `data.pagination`. Fica registrado como divergência, sem causa atribuída.

### b.2 Por que a carga 8 parou no teto, se a API pagina (confirmado no código)
Não é hipótese de regra de negócio. É leitura do código (`MetricasDSPD-052h`):
1. `lerLote` (`lotes.ts`, linhas 44 a 46) faz **um único** `GET /loggedTime` por lote, com `per_page=1000` e **sem `page`**. A API devolve a página 1.
2. `itensDoWorklog` (`lotes.ts`, linhas 28 a 33) pega só `data.data` e **descarta `pagination`**. O `all_pages` nunca é lido.
3. `if (itens.length >= TETO_WORKLOG) falha = 'lote_no_teto'` (linha 48): uma página cheia de 1000 é lida como "possivelmente truncado". O lote é dividido por cards até sobrar um card, que continua com a página 1 cheia e fica `lote_no_teto`.
4. O cliente nem deixaria pedir a página 2: `CONSULTA_WORKLOG` (`http.ts`, linhas 71 a 84) não tem `page` ("Sem `page` (não há paginação)"), então o pedido com `page` seria recusado pela lista fechada da ADR 0015.
5. Que a API respeita `per_page=1000` também sai do código: `lote_no_teto` só acontece com 1000 ou mais itens numa resposta. Se a API limitasse a 200, a carga 8 nunca teria batido no teto.

Logo, os 1000 registros gravados de cada um dos 5 cards são a **página 1** da consulta, e o resto está nas páginas 2 em diante, que o código nunca pediu. A premissa "a API não pagina" do item 4 da ADR 0025 é a causa: o teto de 1000 era o tamanho da página, não um limite da consulta.

O cliente já tem um leitor de páginas (`listarPaginas`, `http.ts`, linhas 375 a 399), usado nas outras rotas: segue `page=1..all_pages` pelo `envelopePaginado` e respeita o teto de páginas por execução (`limite-paginas`). O worklog não usa esse leitor porque a ADR 0025 decidiu que não havia páginas.

## (c) Plano do aviso e da coleta por período, e o que muda na ADR 0025

### C1-R. Coleta seguindo as páginas (revisão E1.12; substitui C1 como caminho principal, se o dono aceitar a D-5)
**Ordem:** primeiro seguir as páginas de cada consulta (`page=1..all_pages`); só depois, e só nos casos da C1-R.6, dividir por período.

1. **Onde.** Em `lerLote`: cada consulta (lote de até 200 cards, mesmo filtro da passagem) pede `per_page=1000` e `page=1`, lê `pagination.all_pages` e pede `page=2..all_pages` com os mesmos parâmetros. O teste "1000 itens = truncado" sai: quem diz se há mais registros é o `all_pages`, não o tamanho da página.
2. **Cliente (ADR 0015).** `page` entra em `CONSULTA_WORKLOG`, com valor inteiro positivo e limitado (por exemplo `^[1-9]\d{0,3}$`). O caminho e o método não mudam (`GET /loggedTime`). Cabe ao back-end decidir se reaproveita `listarPaginas`, que já conta páginas no teto da execução, ou se lê página a página dentro de `lerLote`, para processar cada página sem juntar milhares de registros em memória. Recomendação: página a página, processando cada uma ao chegar, com o mesmo teto de páginas por execução.
3. **Completude por consulta, não por página (risco de correção, herdado da C1.4).** Um card só entra em `x.completos` quando **todas** as páginas da consulta voltaram 2xx e no formato esperado. Se uma página falhar, os cards do lote ficam incompletos naquela execução: os registros já lidos são gravados (append-only), mas nenhum card do lote vira fonte de exclusão. O `qa-engineer` cobre isso com um teste próprio.
4. **Consistência entre páginas.** A lista vem na ordem de inclusão. Um registro excluído na origem enquanto as páginas são lidas pode deslocar um registro de uma página para a anterior, já lida, e esse registro não seria visto. Na varredura, isso viraria exclusão falsa. Mitigação, sem regra nova de negócio: (a) se `all_pages` mudar entre a página 1 e a última, a consulta é tratada como incompleta (código técnico, por exemplo `paginacao_instavel`, a definir pelo back-end) e não gera exclusão; (b) a guarda de massa (item 6 da ADR 0025) continua valendo; (c) um registro dado como excluído por engano volta como `reaparecido` na leitura seguinte. Inclusão no fim da lista não desloca páginas já lidas.
5. **Divisão por cards.** Continua só para `limite-bytes` (resposta grande demais). Deixa de ser a resposta ao teto, porque o teto deixa de existir para uma consulta paginada.
6. **Divisão por período: ainda é necessária? Só como contingência.** Com as páginas, um card de qualquer volume se lê inteiro, sem dividir por data, e o custo é o mesmo ou menor (uma chamada por 1000 registros, contra várias consultas sobrepostas no período). A divisão por período da C1 só volta a ser útil se um destes fatos for observado:
   - a resposta vier **sem** `pagination` e com 1000 itens (o caminho antigo; o código mantém a guarda `lote_no_teto` para esse caso, em vez de supor que não há mais páginas);
   - a API tiver um limite de páginas por consulta que corte o card (nada na doc nem no spike indica isso);
   - o teto de páginas por execução (`limite-paginas`) for atingido por um único card.
   Nesses casos o card continua `lote_no_teto` e o aviso aparece (C2). A divisão por período não entra na E2.1. Volta como item próprio só se um desses fatos aparecer em `ctl_coleta_falha`.
7. **Custo (item 11 da ADR 0025).** Por consulta: `all_pages` chamadas em vez de 1. Para os 5 cards, algumas chamadas a mais por passagem por data. As divisões por cards do teto deixam de existir, e isso compensa. O critério de reversão de 300 chamadas por execução continua lido em `ctl_coleta`. O contador de páginas lidas do worklog entra em `ctl_coleta_contagem`.
8. **Nada muda em:** caminho e método, `fields`, a allow-list, a supressão antes do `/users`, a staging append-only com `versao` e `ON CONFLICT DO NOTHING`. Os 1000 registros já gravados de cada card voltam na página 1 com o mesmo hash e não geram versão nova.
9. **Retomada da carga (D-3, sem mudança).** Com a E2.1 mesclada, o dono roda de novo o comando manual da carga inicial. Ele retoma do lote parado (`lotes_concluidos`), lê as páginas que faltam dos 5 cards, fecha `sucesso` e grava a marca d'água, o que destrava o incremental.
10. **Passagem dos novos (`logged_from`) e varreduras.** Seguem as páginas do mesmo jeito. A varredura longa de domingo deixa de fechar `parcial` por causa dos 5 cards.

### C1. Coleta por período (plano original da E1.1; passa a contingência pela C1-R.6, se o dono aceitar a D-5)
1. **Onde.** Em `lerLote`: quando a folha é de **um card só**, a falha é `lote_no_teto` e a passagem filtra por data do apontamento (`from_date`, ou seja, carga inicial e varreduras), o intervalo `[from_date, to_date ?? hoje]` é dividido ao meio por data e cada metade é repedida com `card_ids=<card>`, `from_date` e `to_date`. A divisão continua até cada pedaço voltar abaixo de 1000.
2. **Piso.** Um pedaço de **um dia** que ainda volta com 1000 ou mais continua `lote_no_teto`, com o mesmo registro de hoje. O card segue incompleto e o aviso continua (item C2). Nada é estimado.
3. **Teto de chamadas por card.** Um parâmetro técnico em configuração, como as guardas de massa, por exemplo 64 chamadas por card por execução. Se passar disso, o card fica `lote_no_teto` (o código exato é decisão do back-end). Motivo: a cota é de 30 por minuto e 600 por hora, compartilhada com os cards. Doze meses divididos ao meio chegam a um dia em cerca de 9 níveis. Com 5 cards de alguns milhares de registros cada, a estimativa é de dezenas de chamadas, dentro do limitador.
4. **Completude por card, não por folha (risco de correção).** Hoje `processarFolha` põe os cards da folha em `x.completos` folha a folha. Com a divisão por período, um card terá várias folhas. Se uma delas vier completa e outra no teto, o card **não pode** entrar em `completos`: senão a varredura marcaria como excluídos os apontamentos do período que não foi lido. Regra: um card só é completo naquela passagem quando **todas** as suas folhas por período forem completas. O `qa-engineer` cobre isso com um teste próprio.
5. **Passagem dos novos (`logged_from`).** Fica como está. São os registrados na última hora mais o intervalo desde a marca d'água, e 1000 num card só, nesse intervalo, não é realista. Se acontecer, continua `lote_no_teto`.
6. **Nada muda em:** caminho e método (`GET /loggedTime`); `fields`; a allow-list; a supressão antes do `/users`; a staging append-only com `versao` e `ON CONFLICT DO NOTHING`. Os 1000 registros já gravados, relidos, não duplicam: mesmo hash, nenhuma versão nova.
7. **Retomada da carga.** Com a E2.1 mesclada, o dono roda de novo o comando manual da carga inicial (ADR 0022 item 4). Ele retoma do lote parado (`lotes_concluidos`), completa os 5 cards por período, fecha `sucesso` e grava a marca d'água, o que destrava o incremental (pergunta D-3).
8. **Alternativa por página** (só se D-2 confirmar paginação real): para um card no teto, pedir `page=2..all_pages`. ~~O período continua sendo o plano principal.~~ **Revisto na E1.12:** a D-2 confirmou a paginação (b.1), e a leitura das páginas passou a ser o plano principal (C1-R).

### C2. Aviso de registro de horas incompleto (sinal do coletor até a tela)
Caminho do sinal: **coletor → tabela de estado por card → papel da aba (GRANT por coluna) → `GET /api/apontamento` → `useApontamento` → componente definido pela UX (E1.2)**.

1. **Registro (coletor).** Uma tabela append-only nova, de eventos por card, sem pessoa: `bm.ctl_apontamento_cobertura`, com `card_id`, `estado` (lista fechada `incompleto` ou `completo`), `coleta_id`, `detectado_em` e `UNIQUE (card_id, estado, coleta_id)` + `ON CONFLICT DO NOTHING`. O estado atual é o último evento do card. Os nomes finais são do back-end.
   - Grava `incompleto` quando uma passagem por data (carga ou varredura) termina com o card em `lote_no_teto`. Isso vale mesmo depois da C1, para o piso de um dia ou o teto de chamadas. Com a C1-R, `lote_no_teto` só sobra nos casos da C1-R.6 (resposta sem `pagination`, limite de páginas). Falha transitória de uma página (rede, 5xx, `paginacao_instavel`) **não** grava `incompleto`: o lote fica fora de `completos` naquela execução e é relido na seguinte, sem acender o aviso em 200 cards por um erro de rede.
   - Grava `completo` quando uma passagem que cobre **toda a janela da carga** (a carga inicial, a retomada ou a varredura longa de domingo) termina com todas as folhas do card completas. A varredura de 90 dias não serve como prova de completude, porque não relê o período antigo.
   - **Carga do estado atual a partir do registro que já existe.** Uma migração ou comando copia as 5 linhas `lote_no_teto` (`entidade = 'apontamento'`, `id_origem` = card) de `ctl_coleta_falha` como eventos `incompleto`. É cópia de dado gravado, não inferência. Assim o aviso aparece já, antes da E2.1, conforme o "B" do dono.
2. **Acesso.** `dspd_api_apontamento` ganha GRANT por coluna em `card_id, estado, detectado_em`. É revisão do item R4-5 da ADR 0020 (`COLUNAS_API_APONTAMENTO`), com leitura do `security-engineer`. Nada de `ctl_coleta_falha`.
3. **Contrato (alto nível; o detalhe é do back-end).** É um campo **aditivo** na resposta da aba: a lista dos cards incompletos dentro do recorte, com o id e o título do card (`dim_card.titulo`, que o papel já lê), mais uma marca de "há horas incompletas no recorte". **Sem número de horas faltantes e sem estimativa.** Por ser aditivo, `versaoContrato` continua 1 se o back-end confirmar que nenhum consumidor quebra. Depois de calculado, o filtro de pessoa não altera a lista de cards incompletos. O aviso nunca é por pessoa.
4. **Tela.** Texto e lugar são da UX (E1.2). Restrição de arquitetura: o aviso some sozinho quando o último evento do card vira `completo`, sem nenhum código no front para isso.
5. **Selo de frescor.** Não muda: `parcial` continua sem selo próprio. Se a UX quiser indicar `parcial`, isso entra na E1.2 como pedido próprio.

**Por que o existente não basta (mecanismo novo: tabela e GRANT):**
- `ctl_coleta_falha` já registra o card no teto. Mas ela registra **falhas por execução** e não tem como registrar a resolução: a ausência de falha numa execução seguinte não prova que o card ficou completo, porque a passagem dos novos não relê o histórico e a de 90 dias só cobre 90 dias. Ela também mistura falhas de todo tipo (`id_origem` às vezes é `logged_time_id`), e dar GRANT nela abriria ao papel da aba um controle que hoje ele não lê (ADR 0020 R4-5).
- O selo de frescor (`seloFrescor`) já existe, mas é por coleta, não por card. Ele não diz qual card está incompleto e não tem valor para `parcial`.
- Evidência de execução: a carga de 2026-11-02 20:38 (coleta 8) gravou 5 `lote_no_teto` em `ctl_coleta_falha`, e a resposta de `GET /api/apontamento` (`servico.ts`, linhas 134 a 149) só tem `frescor` como sinal de coleta. Hoje os 5 cards aparecem com horas parciais e nada na tela avisa.
- Alternativa mais leve, considerada: uma view `security_invoker` sobre `ctl_coleta_falha` + `ctl_coleta`, com GRANT só na view. Não foi escolhida porque o critério de "completo" (passagem de janela cheia sem teto) não está gravado em lugar nenhum hoje, e reconstruí-lo na view repetiria lógica da coleta.

### C3-R. O que mudou na ADR 0025 (revisão E1.12, gravada na ADR em 2026-11-03)
A ADR 0025 foi editada nesta etapa (Contexto, item 4, item 6 da varredura longa, item 11, alternativas, critério de reversão e leituras), com o spike do 063 e a Decisão revista: **o worklog segue as páginas de cada consulta; o teto de 1000 deixa de ser sinal de truncamento quando a resposta traz `pagination`; a divisão por período fica como contingência**. A ADR continua `proposta` até a validação do dono (D-5) e a leitura do `security-engineer` (uso novo de `page` na lista fechada da ADR 0015). A cobertura por card (C2) segue como estava no C3 abaixo. A ADR 0020 R4-5 não muda por causa da paginação: só muda pelo GRANT do aviso (C2.2), como já estava no plano.

### C3. O que muda na ADR 0025 (revisão proposta pela E1.1; substituída pela C3-R nos itens de paginação)
- **Contexto:** registrar a contradição "doc diz paginada × spike diz sem paginação" e a leitura da doc de 2026-11-03.
- **Item 4:** depois da divisão por `card_ids`, um card sozinho no teto, numa passagem por data, é dividido por período (`from_date`/`to_date`) até ficar abaixo de 1000. O piso é um dia, e há um teto de chamadas por card em configuração. Um card só é completo na passagem quando todas as suas folhas forem completas. Só o piso ou o teto de chamadas ainda gera `lote_no_teto`.
- **Item novo (cobertura por card):** a tabela de eventos `incompleto`/`completo`, a regra de "completo" (passagem de janela cheia), a carga inicial a partir de `ctl_coleta_falha` e o GRANT para o papel da aba (com a revisão R4-5 da ADR 0020).
- **Item 11 (custo):** somar as chamadas da divisão por período, limitadas pelo teto por card.
- **Critério de reversão:** trocar "um lote de um card bater no teto de 1000" por "um card bater no teto num pedaço de um dia, ou estourar o teto de chamadas por card em duas execuções seguidas", lido em `ctl_coleta_falha`. Somar "D-2 confirmar paginação real", que reabre o item 4.
- **Leituras:** uma linha com esta discovery (2026-11-03): ajustar.
- Fora da 0025: ADR 0020 R4-5 (GRANT da coluna nova) e, só se D-2 levar à página, ADR 0015 (`page` em `CONSULTA_WORKLOG`).

### C4. Riscos, segurança e testes
- `gatilhos_seguranca`: banco (migração, tabela nova, GRANT por coluna novo); integração externa (parâmetro novo `page` na lista fechada `CONSULTA_WORKLOG`, ADR 0015, mesmo caminho e método; `to_date` só na contingência da C1-R.6). Sem dependência nova, sem webhook, sem dado de pessoa novo. Os registros a mais trazem mais `user_id`, que seguem a supressão antes do `/users` (ADR 0025 item 8).
- R-4 (revisão E1.12), exclusão falsa por deslocamento entre páginas (C1-R.4). Mitigação: `all_pages` estável como condição de consulta completa, a guarda de massa e o `reaparecido`. Teste dedicado no servidor falso.
- R-5 (revisão E1.12), página com falha no meio de um lote de 200 cards. Mitigação: o lote inteiro fica fora de `completos` (C1-R.3); os registros já lidos ficam na staging; o lote é relido na execução seguinte.
- R-1, exclusão falsa por completude parcial (C1.4). Mitigação: teste dedicado e guarda de massa, que continua valendo.
- R-2, cota. Mitigação: teto de chamadas por card e o limitador de 25 por minuto; o custo é lido em `ctl_coleta` (critério de reversão atual de 300 chamadas por execução).
- R-3, a contradição da paginação. **Resolvida pelo spike E1.5 (b.1): a API pagina.** O plano passou a seguir as páginas (C1-R).
- Observabilidade: a contagem de chamadas de divisão e de cards incompletos entra em `ctl_coleta_contagem` (entidade nova, por exemplo `apontamento_cobertura`), sem id de pessoa.

### C5. Divisão de tarefas (só depois da validação do dono, E1.3)
1. Em paralelo: a UX fecha texto e lugar (E1.2); o `security-engineer` lê a revisão da ADR 0025 (com `page` em `CONSULTA_WORKLOG`, ADR 0015) e da R4-5 da ADR 0020; o `qa-engineer` prepara os cenários no servidor falso (revisados na E1.12: card com 2500 registros em 3 páginas de 1000; página do meio com 5xx, sem exclusão falsa; `all_pages` que muda entre páginas; resposta sem `pagination` com 1000 itens, que continua `lote_no_teto`; aviso que some no `completo`; as 5 linhas copiadas de `ctl_coleta_falha`).
2. O `node-backend` faz a migração da tabela, o GRANT e a cópia das 5 linhas, depois a leitura das páginas em `lerLote` (C1-R) e a completude por consulta em `coleta.ts`, depois o campo aditivo em `GET /api/apontamento`. O aviso pode ir antes da leitura das páginas: são PRs separados, o aviso primeiro, conforme o "B". A divisão por período (C1) não entra na E2.1 (C1-R.6).
3. O `react-frontend` faz o aviso conforme a E1.2, sobre o campo aditivo. Pode começar em paralelo com a rota falsa (`rota-falsa.ts`).
4. O `tech-lead` faz o review. O `qa-engineer` dá o parecer em `docs/qa/`. A UX revisa a tela.
5. O dono roda a retomada da carga inicial na máquina dele (D-3).

## (d) Perguntas ao dono
- **D-1. Escopo do aviso.** O aviso deve aparecer só quando um card incompleto tem horas **no período filtrado** da aba, ou sempre que existir algum card incompleto na base?
- **D-2. Spike de paginação.** *Respondida (DECISÃO DO DONO "A" de 2026-11-03; spike rodado pelo dono às 15:56): a API pagina (b.1).* Texto original: você autoriza um spike de **uma** chamada GET na sua máquina (`/loggedTime` com `card_ids` = um dos 5 cards e `page=2`, contando só os registros e lendo `pagination.all_pages`) para resolver a contradição entre a doc (sempre paginada) e o spike E2.3 (sem paginação)? Sem ele, o plano segue só por período, que funciona nos dois casos.
- **D-3. Retomada da carga.** Depois de mesclada a E2.1, você roda o comando manual da carga inicial (retomada) na sua máquina, com presença, para completar os 5 cards e fechar a carga com `sucesso`?
- **D-4. Estado da coleta diária.** Pelo código, a carga parcial de 2026-11-02 deixa o incremental do worklog parado (`sem-marca`) até alguma coleta fechar `sucesso`. Você confirma, olhando `ctl_coleta` ou o log das 06:00 de hoje, se a coleta diária do worklog rodou depois da coleta 8? Se não rodou, a aba fica com o selo `sem-coleta` até a retomada (D-3).
- **D-5. Ler as páginas em vez de dividir por período (revisão E1.12, 2026-11-03).** Na decisão "B" você escolheu: "a coleta divide por período até caber nas 1000". O spike mostrou que a API pagina, e o código mostra que a carga 8 parou no teto porque só lia a página 1 (b.2). **Recomendação: trocar a divisão por período pela leitura de todas as páginas de cada consulta (C1-R).** Lê o card inteiro com menos chamadas e menos código, e não depende de o registro de horas caber em faixas de datas. A divisão por período fica guardada como contingência, só se a resposta vier sem paginação ou se aparecer um limite de páginas (C1-R.6). O resto do "B" não muda: o pedido novo para buscar o restante, o aviso de registro de horas incompleto nos cards enquanto isso, nenhuma hora estimada, só GET. Você aceita a troca? Se não aceitar, a E2.1 segue a C1 (por período), que também funciona com a paginação.
