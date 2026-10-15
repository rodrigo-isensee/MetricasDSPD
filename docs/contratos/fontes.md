# Contratos de fonte: BusinessMap e Acelerato

- **Propósito:** dizer o que cada fonte entrega ao sistema, o que o código aceita hoje e o que ainda é planejado.
- **Público:** node-backend (coletor, WS2), arquiteto, QA.
- **Revisão:** 2026-10-11.
- **Documentos de origem:** `docs/integracao/` **não existe** neste repositório; as referências são `docs/architecture/data-model.md` §3.1, §4 e §6, ADR 0006 e ADR 0013 §4 (parcialmente substituídas pela ADR 0014), `docs/architecture/features/integracao-real.md` e `docs/especificacao/domain/collection/`.
- Regra de ouro: BusinessMap e Acelerato **nunca se misturam** (schemas separados, coletas separadas, uma fonte por rota). O coletor (WS2) ainda não existe: tudo abaixo que depende dele é [planejado].

## 1. BusinessMap (projetos, fluxo)

| Tema | Contrato | Estado |
|---|---|---|
| Entrada por API | coleta incremental diária e varredura semanal, com apikey no `.env` (nunca no código) | [planejado]: lista de tarefas do worker está vazia (`server/src/entradas/worker.ts:16-18`) |
| Entrada por webhook | `POST /webhooks/businessmap`: cabeçalho `x-webhook-secret`, corpo JSON objeto até 256 KB; `202 { "status": "recebido" }`; entrega idêntica não duplica | implementado (`server/src/modulos/businessmap/webhook.ts`) |
| Staging | `stg_card`, `stg_revision`, `stg_bloqueio`, `stg_webhook_evento` etc., com payload reduzido à allow-list (ADR 0020), SHA-256 e cadeia `anterior_sk` (`data-model.md` §3.1); gravação em `server/src/modulos/businessmap/staging.ts:18-36` | `gravarStgCard` implementado; demais tabelas conforme `data-model.md` |
| Formato real do payload do webhook | desconhecido até o coletor; só o registro da allow-list (ADR 0020, 4f) é gravado em `stg_webhook_evento`; o `payload_sha256` é o do corpo bruto; tipo fora de `TIPOS_WEBHOOK_BM_GRAVADOS` recebe 202 e não grava; só o hash e o `webhookSk` seguem para a outbox | **a confirmar** (WS2) |
| Normalização do evento | consumidor de `bm.webhook.recebido` | [planejado] (ver [eventos.md](eventos.md)) |
| Instante canônico de transição | revision é canônica; webhook só antecipa; tolerância de casamento 120 s | pergunta N-3 aberta (`data-model.md` §12) |

### Allow-list de campos
**[implementado] para `stg_card`, `stg_revision` e `stg_webhook_evento`:** `server/src/modulos/businessmap/allow-list.ts` (ADR 0020). Cada entidade tem uma constante de campos permitidos e o registro gravado é montado só a partir dela; campo fora da lista é descartado antes do INSERT. O hash de deduplicação é o do registro filtrado, serializado com chaves em ordem canônica. Responsáveis não passam pela staging: vão da memória do coletor só para `dim_card` e `dim_card_versao` (`COLUNAS_PESSOA`, que `dspd_api` não lê). Campo novo exige alterar a ADR 0020.

**[planejado] para `stg_bloqueio`, `stg_custom_field`, `stg_vinculo` e `stg_coluna`:** ainda não há lista; a escrita nessas tabelas fica negada até haver (parecer de segurança K-084, B-K3). A lista deve ser registrada aqui e passar pela revisão de modelagem.

## 2. Acelerato (sustentação)

| Tema | Contrato | Fonte |
|---|---|---|
| Origem | **tabela no Metabase**, somente leitura, lida uma vez ao dia; a fonte é somente leitura e a API do Acelerato não tem permissão de ler as colunas de pessoa (CLAUDE.md) | ADR 0013 §4; CLAUDE.md |
| Acesso | API do Metabase com chave de API (`x-api-key`) de usuário só de leitura, no `.env`; consulta de uma pergunta salva com exportação JSON | ADR 0013 §4 |
| Staging | `stg_chamado` (linha da tabela, validada por Zod antes de gravar) e `stg_etapa` (só se a tabela tiver histórico de etapas: pergunta P6) | `data-model.md` §4 |
| Ausência | chamado que some da extração do dia vira nova versão com `ausente_na_extracao = true`; nada é apagado nem inferido como exclusão | `data-model.md` §4 |
| Parâmetros registrados | `ctl_coleta.parametros` guarda o id da pergunta do Metabase e o SHA-256 do SQL versionado; mudança = nova `ref_versao_criterio` (T2.6) | `data-model.md` §4 |
| Colunas reais da tabela do Metabase | **a confirmar** (WS2); o arquivo `docs/architecture/fontes/acelerato-metabase.sql`, citado no `data-model.md`, não existe neste ramo | [planejado] |
| Colunas de pessoa (solicitante, agente, e-mail) | só no staging; fora do analítico | `dados.md` §2 |

Allow-list de campos do Acelerato: [planejado], pelas mesmas razões do BusinessMap.

## 3. O que a API do sistema devolve sobre as fontes
Estado, histórico e critérios de cada fonte são servidos por `GET /api/v1/fontes/{dominio}/estado`, `.../coletas` e `GET /api/v1/criterios` (ver [http.md](http.md) §1). O estado traz selo (`sem-coleta`, `falha`, `atrasado`, `atual`), janelas de calibração (60 dias, provisório) e `tipoErro` só como categoria: mensagem, SQL, stack e credencial nunca saem (`docs/api/fontes.md`; schemas `.strict()` em `packages/contratos/src/coletas.ts`).

## 4. Pendências que dependem do usuário ou da WS2
1. Formato real do webhook do BusinessMap.
2. Colunas e tipos da tabela do Metabase; existência de histórico de etapas (P6).
3. Allow-list de campos de cada fonte.
4. Endereço público para o webhook em uso real (I-5).
