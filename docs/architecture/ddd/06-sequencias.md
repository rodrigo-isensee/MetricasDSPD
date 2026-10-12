# Sequências: coleta, webhook, cálculo e publicação, exportação

Propósito: mostrar a ordem das chamadas nos quatro fluxos principais, marcando o que já existe no código e o que é [planejado]. Público: desenvolvedores, arquiteto e QA. Revisão: 2026-10-11.

Esta página recebe a sequência "Da coleta ao cartão" que estava em [`overview.md`](../overview.md) §4 (o overview passa a apontar para cá). Estados citados: [05-ciclos-de-vida](05-ciclos-de-vida.md). Eventos: [04-eventos](04-eventos.md). Componentes: [07-componentes](07-componentes.md).

Convenção das legendas: nome do participante entre aspas é um serviço ou módulo; "[planejado]" na mensagem indica que o passo depende do coletor (WS2) ou do módulo `acelerato`, que não existem em `server/src/modulos/`. Uma seta sólida é chamada que espera resposta; a tracejada é resposta ou envio sem espera.

## Como roda a coleta do BusinessMap?

### Coleta diária do BusinessMap
```mermaid
sequenceDiagram
  autonumber
  participant AG as agenda e worker (existe)
  participant CO as coletor BM [planejado]
  participant BM as BusinessMap (externo)
  participant DB as PostgreSQL dspd_bm
  participant OB as outbox dspd_core
  participant OP as operacao (existe)
  AG->>DB: pg_try_advisory_lock da fonte (existe: comTravaDaFonte)
  AG->>CO: tarefa devida, diária ou semanal (existe: devida)
  CO->>DB: abre ctl_coleta e lê a marca d'água [planejado]
  CO->>BM: cards, revisions, children, customFields, columns, bloqueios [planejado]
  CO->>DB: stg_* com hash contra a última versão [planejado, e gravarStgCard existe só para card]
  CO->>DB: evt_*, versões e projeções por entidade [planejado]
  CO->>DB: fecharColeta: status em ctl_coleta (existe)
  DB-->>OB: coleta.concluida, mesma transação (existe)
  AG->>OP: poller entrega o evento ao consumidor (existe)
  OP-->>AG: falha ou parcial vira log warn (existe)
```

Legenda: participantes na ordem da esquerda para a direita são a agenda, o coletor, a ferramenta externa, o banco do schema `dspd_bm`, a outbox e o módulo `operacao`. Fontes: `server/src/plataforma/worker.ts` (`criarWorker`), `agenda.ts`, `db/trava.ts`, `modulos/businessmap/staging.ts`, `modulos/operacao/concluida.ts`; contrato da coleta na ADR 0006 e `data-model.md` §3, §6.

<details open>
<summary>Alternativa em lista: quem conversa com quem</summary>

- agenda -> banco: trava por fonte; sem a trava, a tarefa fica para o próximo ciclo (a cada `WORKER_INTERVALO_MS`, 15 s).
- agenda -> coletor: executa a tarefa devida [planejado: `tarefas` está vazio em `entradas/worker.ts`].
- coletor -> banco: abre `ctl_coleta`, lê `vw_marca_dagua`, grava staging, eventos e projeções, só com `INSERT` no staging e nos eventos.
- coletor -> BusinessMap: leitura incremental a partir da marca d'água menos a sobreposição.
- coletor -> banco: `fecharColeta` fecha `ctl_coleta` e publica `coleta.concluida` na mesma transação.
- agenda -> operacao: o poller reserva o evento e chama o consumidor.
</details>

## Como roda a coleta do Acelerato?

### Coleta diária do Acelerato [planejado]
```mermaid
sequenceDiagram
  autonumber
  participant AG as agenda e worker (existe)
  participant CO as coletor AC [planejado]
  participant MB as Metabase (externo)
  participant DB as PostgreSQL dspd_ac
  participant OB as outbox dspd_core
  AG->>DB: pg_try_advisory_lock da fonte acelerato (existe)
  AG->>CO: tarefa devida, em outro horário que a do BM [planejado]
  CO->>DB: abre ctl_coleta e registra id e SHA-256 do SQL da pergunta [planejado]
  CO->>MB: POST /api/card/:id/query/json, só leitura [planejado]
  CO->>DB: stg_chamado com hash, ausência vira nova versão marcada [planejado]
  CO->>DB: versões e projeções dim_chamado, fato_etapa_chamado [planejado]
  CO->>DB: fecharColeta (existe, fonte acelerato)
  DB-->>OB: coleta.concluida (existe)
```

Legenda: mesma notação da coleta do BusinessMap; o schema e a fonte são outros e nenhum participante é compartilhado com ela, exceto a agenda e a trava, que filtram por fonte. Fonte do desenho: `data-model.md` §4 (ausência, `ctl_coleta.parametros`), ADR 0013 §4. O módulo `acelerato` não existe em `server/src/modulos/`.

<details open>
<summary>Alternativa em lista: quem conversa com quem</summary>

- agenda -> banco: trava `dspd:fonte:acelerato`, independente da trava do BusinessMap.
- agenda -> coletor: tarefa diária, em horário distinto [planejado].
- coletor -> banco: abre `ctl_coleta` no schema `dspd_ac`.
- coletor -> Metabase: leitura da tabela inteira a cada coleta (a tabela não tem coluna de atualização); o staging deduplica por hash.
- coletor -> banco: staging com `ausente_na_extracao`, versões e projeções.
- coletor -> banco: `fecharColeta` e `coleta.concluida` com `fonte = 'acelerato'`.
</details>

## Como o webhook do BusinessMap é recebido?

### Webhook do BusinessMap (recebe e antecipa)
```mermaid
sequenceDiagram
  autonumber
  participant BM as BusinessMap (externo)
  participant API as api, rota do webhook (existe)
  participant DB as dspd_bm e dspd_core
  participant PL as poller do worker (existe)
  participant CN as consumidor bm.webhook.recebido [planejado]
  BM->>API: POST /webhooks/businessmap com cabeçalho do segredo
  API->>API: confere o segredo em tempo constante, antes de ler o corpo
  API->>DB: INSERT stg_webhook_evento ON CONFLICT DO NOTHING
  API->>DB: INSERT outbox bm.webhook.recebido, mesma transação
  API-->>BM: 202 recebido
  PL->>DB: só reserva tipos com consumidor registrado
  PL->>CN: normaliza a entrega em fato_transicao [planejado]
```

Legenda: a resposta 202 não depende do processamento; o normalizador roda depois, no worker. Fonte: `server/src/modulos/businessmap/webhook.ts` (`rotasWebhook`, `receberWebhook`, `segredoConfere`), `plataforma/eventos/outbox.ts`. Enquanto o sistema roda só local, o webhook não alcança a máquina (`overview.md` §1); a rota existe e é testada.

<details open>
<summary>Alternativa em lista: quem conversa com quem</summary>

- BusinessMap -> api: `POST /webhooks/businessmap`; corpo JSON objeto até 256 KB, senão 413 ou 400.
- api -> api: segredo inválido ou ausente = 401, sem consumir corpo nem banco.
- api -> banco: grava a entrega bruta e o evento na mesma transação; entrega idêntica (mesmo SHA-256) não duplica nada.
- api -> BusinessMap: 202.
- poller -> banco: sem consumidor registrado, o evento fica `pendente` e o dado bruto segue em `stg_webhook_evento`.
- poller -> consumidor: normalizador do coletor [planejado]; ao registrá-lo, o backlog é processado.
</details>

## Como o cartão chega ao navegador?

### Cálculo e publicação de uma métrica
```mermaid
sequenceDiagram
  autonumber
  participant UI as web (SPA)
  participant API as api, módulo metricas (existe)
  participant DB as PostgreSQL, papel dspd_api
  participant LIB as @metricas-dspd/metricas (existe)
  UI->>API: GET /api/v1/metricas/O3 com filtros
  API->>API: valida a entrada com zod (strict)
  API->>DB: marca d'água da fonte e versão de critério (relidas a cada 60 s)
  alt cache vazio ou versão de carga nova
    API->>DB: lê projeções e ref_* com colunas explícitas, sem pessoa
    API->>LIB: criarContexto e calcularMetrica (n < 20 = insuficiente)
    LIB-->>API: resultado
  end
  API-->>UI: DTO validado por zod + X-Versao-Criterio, X-Data-Referencia, ETag
```

Legenda: cada requisição trata uma só fonte (a Visão geral justapõe blocos e só o cálculo dentro da biblioteca lê as duas). Fontes: `server/src/modulos/metricas/rotas.ts` (`rotasMetricas`, cabeçalhos), `servico.ts` (`ServicoMetricas.calcular`, `marca`, `carga`), `mapa.ts`, `repositorio.ts`. Cache: `Cache-Control: private, max-age=60`; resultado guardado por métrica, versões de carga, versão de critério, data e filtros normalizados; máximo de 500 resultados por domínio (`MAX_RESULTADOS`).

<details open>
<summary>Alternativa em lista: quem conversa com quem</summary>

- web -> api: `GET /api/v1/metricas/:id` (uma rota por métrica) com `If-None-Match` opcional; ETag igual devolve 304.
- api -> banco: marca d'água (`coletaId`) e última versão de critério; juntas formam a versão de carga.
- api -> banco: se a versão mudou, descarta o cache do domínio e recarrega `BaseBM` ou `BaseAC` (consultas separadas por fonte).
- api -> biblioteca: `calcularMetrica`; nenhuma estatística é calculada em SQL ou no módulo.
- api -> web: DTO conforme o schema da métrica; fora do schema, o erro é 500 (contrato).
- Erros: data futura 400; período fora do histórico 422; referência ausente 503 (`REFERENCIA_AUSENTE`).
</details>

## Como a exportação em PDF funciona?

### Exportação em PDF (no navegador, sem recalcular)
```mermaid
sequenceDiagram
  autonumber
  participant U as pessoa usuária
  participant DLG as DialogoExportar (existe)
  participant FM as FonteMetricas e cache (existe)
  participant MOD as modelo.ts, BlocoExportacao (existe)
  participant PDF as desenhista.ts, jsPDF (existe)
  U->>DLG: escolhe escopo e métricas visíveis, até 12
  DLG->>FM: obter(id, filtros) por métrica, mesma chave do cartão
  FM-->>DLG: DTO com base e critérios
  DLG->>MOD: construirBloco e montarConteudo (separa BM e AC)
  DLG->>PDF: import() dinâmico só ao gerar, depois gerarPdf
  PDF-->>U: arquivo metricas-dspd_escopo_data.pdf
```

Legenda: tudo acontece no navegador; nada vai ao servidor e nada é registrado (decisão D-5 do pedido 008). Fontes: `web/src/features/exportar/` (`DialogoExportar.tsx`, `gerar.ts`, `modelo.ts`, `carregarPdf.ts`, `desenhista.ts`) e o plano [`features/exportar-metricas.md`](../features/exportar-metricas.md). O spike E-1 deixou o gráfico como tabela de pontos do DTO, sem svg2pdf (plano §1).

<details open>
<summary>Alternativa em lista: quem conversa com quem</summary>

- pessoa -> diálogo: seleciona o escopo; métrica oculta pelas preferências não aparece.
- diálogo -> FonteMetricas: `obter`, reaproveitando o cache do React Query; nada é recalculado.
- diálogo -> modelo: DTOs viram blocos de texto e tabela, em seções por fonte (BusinessMap, depois Acelerato), nunca somadas.
- diálogo -> desenhista: o chunk com o jsPDF carrega sob demanda; gera o `Blob`.
- desenhista -> pessoa: download do PDF; em mock, rodapé "Dados fictícios" e sufixo `_ficticio`.
- Limites no código: `LIMITE_METRICAS = 12`, 20 linhas e 8 colunas por tabela (`modelo.ts`).
</details>
