# 0006 - Agendamento das coletas, webhook e automações externas
- Status: aceita (mecanismo de agendamento do host depende da pergunta I-1)
- Data: 2026-10-09
- Briefing: T2.2, T2.3, T2.4, T5.1, T4.3 · Orçamento: ADR 0003 (K1–K4, M3)

## Contexto
Coletas diárias (BM e AC), webhook de mudança de coluna em paralelo à API com reconciliação, projeção da camada analítica e automações do Acelerato que escrevem no chamado. Exigências: idempotência, retentativa, log com contagem e marca d'água, não travar a origem, nunca duas execuções da mesma coleta ao mesmo tempo, e não depender de fila externa sem necessidade.

## Decisão
**Três processos, um código** (`server/`, entradas distintas, mesma imagem):

| Processo | Entrada | Faz | Credenciais |
|---|---|---|---|
| `api` | `server/src/main-api.ts` | REST `/api/v1`, recepção do webhook em `/webhooks/businessmap` (só valida o segredo e grava no staging, < 1 s, K4) | MySQL `dspd_api` + `dspd_webhook` |
| `worker` | `server/src/main-worker.ts` | agenda e executa coletas BM e AC, processamento do webhook, projeções, reconciliação, aquecimento do cache | apikey BM, MySQL `dspd_coletor`, MySQL Acelerato leitura |
| `automacoes` | `server/src/main-automacoes.ts` | T4.3 (matriz de prioridade, crítico coordenado, alertas de aceite e de previsão de retorno, cadência) | Acelerato leitura + **API de escrita do Acelerato** (I-6), MySQL `dspd_automacao` |

**Agendamento:** cada tarefa é um comando idempotente (`coletar bm`, `coletar ac`, `projetar bm`, `reconciliar bm`...) chamável por CLI. O `worker` agenda com **croner** em processo (expressões cron em configuração, fuso `America/Sao_Paulo`) e protege cada tarefa com `GET_LOCK('dspd:<tarefa>', 0)` no MySQL. Se a infra preferir agendador externo (CronJob, cron do host), o mesmo comando roda sem o croner; nada muda no código.

| Tarefa | Frequência inicial | Observação |
|---|---|---|
| coleta BM incremental | diária 02:00 + a cada 2 h em horário útil | marca d'água com sobreposição de 24 h; limite de taxa respeitado (I-5) |
| varredura completa de ids BM | semanal | detecta excluídos (some da listagem) e arquivados |
| processar webhook BM | a cada 1 min | staging → `fato_transicao` (fonte `webhook`) |
| reconciliação webhook × revisions | diária, após a coleta | `ctl_reconciliacao`; meta < 1 % (T2.3) |
| coleta AC | diária 03:00 + a cada 1 h em horário útil | `MAX_EXECUTION_TIME` por consulta, lotes por chave, < 60 s total (M3) |
| automações AC | a cada 1 min | leitura incremental; escrita só pelas ações permitidas |

**Contrato de execução** (todas as tarefas): abre `ctl_coleta` (status `em_andamento`), lê da marca d'água anterior menos a sobreposição, grava com chave natural (`INSERT IGNORE` / hash de payload), conta por entidade, marca `sucesso`/`parcial`/`falha`, só avança a marca d'água em `sucesso`. Retentativa com backoff exponencial e jitter (3 tentativas por requisição; `429` respeita `Retry-After`); timeouts explícitos (10 s HTTP, 30 s por consulta AC). Falha de item vai para `ctl_coleta_falha` sem abortar o lote; falha da execução ou `parcial` dispara alerta (I-7).

**Webhook:** BusinessMap → proxy de borda (I-5) → `api`. Autenticação por segredo compartilhado (cabeçalho ou caminho, conforme o que a Business Rule permitir) + lista de IPs se houver; corpo limitado a 256 KB; grava `stg_webhook_evento` com hash único (reenvio não duplica) e responde 202. Nada é calculado na requisição.

**Automações (T4.3):** processo separado porque é o único que **escreve** em sistema de produção. Regras:
- Escrita só pela API oficial do Acelerato, nunca no MySQL (acesso é somente leitura).
- Cliente de escrita com lista fechada de ações tipadas: registrar comentário/nota, definir prioridade calculada (só quando `prioridade_ajustada_manualmente = não`; a reclassificação manual prevalece), marcar crítico coordenado em P1. Não existe método para mudar etapa, pausar, retomar ou alterar datas de SLA: "não tocar no relógio" é garantido por ausência de capacidade, não por convenção.
- Idempotência por `(chamado_id, regra, momento_gatilho)` em `dspd_ac.ctl_automacao`; toda ação gera registro no chamado e no log.
- `modo=simulacao` (padrão em homologação): calcula e loga sem escrever.
- Não usa a biblioteca de métricas para publicar estatística; usa só `core` (horas úteis) para prazos.

## Alternativas consideradas
- **Fila (BullMQ + Redis)**: retentativa e visibilidade prontas. Contras: Redis a mais para meia dúzia de tarefas por dia; `GET_LOCK` + `ctl_coleta` cobrem exclusão e log. Reavaliar se o webhook passar de dezenas de eventos por segundo.
- **GitHub Actions agendado**: sem servidor de agendamento. Contras: runner hospedado não alcança o MySQL do Acelerato nem a base; credenciais de produção no GitHub. Descartado.
- **Webhook processado na própria requisição**: menos peças. Contras: viola K4 e acopla a disponibilidade do BusinessMap à do banco. Descartado.
- **Automações dentro do `worker`**: um processo a menos. Contras: mistura leitura analítica com escrita em produção, mesmas credenciais, falha de um derruba o outro. Descartado.
- **Automações como ações de workflow do Acelerato**: nativas, mas o briefing (3.4) diz que gatilhos não leem campo personalizado nem prioridade. Só o que for nativo fica lá.

## Consequências
- Mais fácil: rodar qualquer coleta à mão (`npm run coletar -w server -- bm`) para reprocessar; trocar o agendador sem mexer em código; provar idempotência por teste (rodar duas vezes = mesmas contagens).
- Mais difícil: três processos para implantar e monitorar; o `worker` precisa de saúde própria (última execução por tarefa exposta em `/health` do worker).
- Riscos: limite de taxa do BusinessMap desconhecido (I-5) pode alongar K1; existência de API de escrita no Acelerato (I-6) bloqueia a T4.3; webhook depende de endpoint alcançável pelo SaaS.
