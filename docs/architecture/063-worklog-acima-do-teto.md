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

## (c) Plano do aviso e da coleta por período, e o que muda na ADR 0025

### C1. Coleta por período (E2.1, node-backend, depois de E1.3)
1. **Onde.** Em `lerLote`: quando a folha é de **um card só**, a falha é `lote_no_teto` e a passagem filtra por data do apontamento (`from_date`, ou seja, carga inicial e varreduras), o intervalo `[from_date, to_date ?? hoje]` é dividido ao meio por data e cada metade é repedida com `card_ids=<card>`, `from_date` e `to_date`. A divisão continua até cada pedaço voltar abaixo de 1000.
2. **Piso.** Um pedaço de **um dia** que ainda volta com 1000 ou mais continua `lote_no_teto`, com o mesmo registro de hoje. O card segue incompleto e o aviso continua (item C2). Nada é estimado.
3. **Teto de chamadas por card.** Um parâmetro técnico em configuração, como as guardas de massa, por exemplo 64 chamadas por card por execução. Se passar disso, o card fica `lote_no_teto` (o código exato é decisão do back-end). Motivo: a cota é de 30 por minuto e 600 por hora, compartilhada com os cards. Doze meses divididos ao meio chegam a um dia em cerca de 9 níveis. Com 5 cards de alguns milhares de registros cada, a estimativa é de dezenas de chamadas, dentro do limitador.
4. **Completude por card, não por folha (risco de correção).** Hoje `processarFolha` põe os cards da folha em `x.completos` folha a folha. Com a divisão por período, um card terá várias folhas. Se uma delas vier completa e outra no teto, o card **não pode** entrar em `completos`: senão a varredura marcaria como excluídos os apontamentos do período que não foi lido. Regra: um card só é completo naquela passagem quando **todas** as suas folhas por período forem completas. O `qa-engineer` cobre isso com um teste próprio.
5. **Passagem dos novos (`logged_from`).** Fica como está. São os registrados na última hora mais o intervalo desde a marca d'água, e 1000 num card só, nesse intervalo, não é realista. Se acontecer, continua `lote_no_teto`.
6. **Nada muda em:** caminho e método (`GET /loggedTime`); `fields`; a allow-list; a supressão antes do `/users`; a staging append-only com `versao` e `ON CONFLICT DO NOTHING`. Os 1000 registros já gravados, relidos, não duplicam: mesmo hash, nenhuma versão nova.
7. **Retomada da carga.** Com a E2.1 mesclada, o dono roda de novo o comando manual da carga inicial (ADR 0022 item 4). Ele retoma do lote parado (`lotes_concluidos`), completa os 5 cards por período, fecha `sucesso` e grava a marca d'água, o que destrava o incremental (pergunta D-3).
8. **Alternativa por página** (só se D-2 confirmar paginação real): para um card no teto, pedir `page=2..all_pages`. Isso exige incluir `page` em `CONSULTA_WORKLOG` (ADR 0015) e mudar o item 4 da ADR 0025 de "a API não pagina" para "pagina". O período continua sendo o plano principal: funciona com ou sem paginação e não precisa de parâmetro novo.

### C2. Aviso de registro de horas incompleto (sinal do coletor até a tela)
Caminho do sinal: **coletor → tabela de estado por card → papel da aba (GRANT por coluna) → `GET /api/apontamento` → `useApontamento` → componente definido pela UX (E1.2)**.

1. **Registro (coletor).** Uma tabela append-only nova, de eventos por card, sem pessoa: `bm.ctl_apontamento_cobertura`, com `card_id`, `estado` (lista fechada `incompleto` ou `completo`), `coleta_id`, `detectado_em` e `UNIQUE (card_id, estado, coleta_id)` + `ON CONFLICT DO NOTHING`. O estado atual é o último evento do card. Os nomes finais são do back-end.
   - Grava `incompleto` quando uma passagem por data (carga ou varredura) termina com o card em `lote_no_teto`. Isso vale mesmo depois da C1, para o piso de um dia ou o teto de chamadas.
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

### C3. O que muda na ADR 0025 (revisão proposta; a ADR **não** foi editada)
- **Contexto:** registrar a contradição "doc diz paginada × spike diz sem paginação" e a leitura da doc de 2026-11-03.
- **Item 4:** depois da divisão por `card_ids`, um card sozinho no teto, numa passagem por data, é dividido por período (`from_date`/`to_date`) até ficar abaixo de 1000. O piso é um dia, e há um teto de chamadas por card em configuração. Um card só é completo na passagem quando todas as suas folhas forem completas. Só o piso ou o teto de chamadas ainda gera `lote_no_teto`.
- **Item novo (cobertura por card):** a tabela de eventos `incompleto`/`completo`, a regra de "completo" (passagem de janela cheia), a carga inicial a partir de `ctl_coleta_falha` e o GRANT para o papel da aba (com a revisão R4-5 da ADR 0020).
- **Item 11 (custo):** somar as chamadas da divisão por período, limitadas pelo teto por card.
- **Critério de reversão:** trocar "um lote de um card bater no teto de 1000" por "um card bater no teto num pedaço de um dia, ou estourar o teto de chamadas por card em duas execuções seguidas", lido em `ctl_coleta_falha`. Somar "D-2 confirmar paginação real", que reabre o item 4.
- **Leituras:** uma linha com esta discovery (2026-11-03): ajustar.
- Fora da 0025: ADR 0020 R4-5 (GRANT da coluna nova) e, só se D-2 levar à página, ADR 0015 (`page` em `CONSULTA_WORKLOG`).

### C4. Riscos, segurança e testes
- `gatilhos_seguranca`: banco (migração, tabela nova, GRANT por coluna novo); integração externa (uso novo de `to_date`, mesmo caminho). Sem dependência nova, sem webhook, sem dado de pessoa novo. Os registros a mais trazem mais `user_id`, que seguem a supressão antes do `/users` (ADR 0025 item 8).
- R-1, exclusão falsa por completude parcial (C1.4). Mitigação: teste dedicado e guarda de massa, que continua valendo.
- R-2, cota. Mitigação: teto de chamadas por card e o limitador de 25 por minuto; o custo é lido em `ctl_coleta` (critério de reversão atual de 300 chamadas por execução).
- R-3, a contradição da paginação. Se a API paginar, a divisão por período também resolve (cada pedaço fica abaixo de 1000, logo numa página só).
- Observabilidade: a contagem de chamadas de divisão e de cards incompletos entra em `ctl_coleta_contagem` (entidade nova, por exemplo `apontamento_cobertura`), sem id de pessoa.

### C5. Divisão de tarefas (só depois da validação do dono, E1.3)
1. Em paralelo: a UX fecha texto e lugar (E1.2); o `security-engineer` lê a revisão da ADR 0025 e da R4-5 da ADR 0020; o `qa-engineer` prepara os cenários no servidor falso (card com 2500 registros em 12 meses; card com 1000 num dia só; completude parcial sem exclusão falsa; aviso que some no `completo`; as 5 linhas copiadas de `ctl_coleta_falha`).
2. O `node-backend` faz a migração da tabela, o GRANT e a cópia das 5 linhas, depois a divisão por período em `lerLote` e a completude por card em `coleta.ts`, depois o campo aditivo em `GET /api/apontamento`. O aviso pode ir antes da divisão por período: são PRs separados, o aviso primeiro, conforme o "B".
3. O `react-frontend` faz o aviso conforme a E1.2, sobre o campo aditivo. Pode começar em paralelo com a rota falsa (`rota-falsa.ts`).
4. O `tech-lead` faz o review. O `qa-engineer` dá o parecer em `docs/qa/`. A UX revisa a tela.
5. O dono roda a retomada da carga inicial na máquina dele (D-3).

## (d) Perguntas ao dono
- **D-1. Escopo do aviso.** O aviso deve aparecer só quando um card incompleto tem horas **no período filtrado** da aba, ou sempre que existir algum card incompleto na base?
- **D-2. Spike de paginação.** Você autoriza um spike de **uma** chamada GET na sua máquina (`/loggedTime` com `card_ids` = um dos 5 cards e `page=2`, contando só os registros e lendo `pagination.all_pages`) para resolver a contradição entre a doc (sempre paginada) e o spike E2.3 (sem paginação)? Sem ele, o plano segue só por período, que funciona nos dois casos.
- **D-3. Retomada da carga.** Depois de mesclada a E2.1, você roda o comando manual da carga inicial (retomada) na sua máquina, com presença, para completar os 5 cards e fechar a carga com `sucesso`?
- **D-4. Estado da coleta diária.** Pelo código, a carga parcial de 2026-11-02 deixa o incremental do worklog parado (`sem-marca`) até alguma coleta fechar `sucesso`. Você confirma, olhando `ctl_coleta` ou o log das 06:00 de hoje, se a coleta diária do worklog rodou depois da coleta 8? Se não rodou, a aba fica com o selo `sem-coleta` até a retomada (D-3).
