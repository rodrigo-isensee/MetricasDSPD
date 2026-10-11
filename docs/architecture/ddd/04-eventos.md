# Eventos de domínio e da outbox

Propósito: catalogar os eventos que o sistema publica e consome, com produtor, consumidores, payload e garantias de entrega. Público: desenvolvedores do back-end, arquiteto e QA. Revisão: 2026-10-11.

Fontes no código: `server/src/plataforma/eventos/` (`outbox.ts`, `consumidores.ts`), `server/src/modulos/operacao/concluida.ts`, `server/src/modulos/businessmap/webhook.ts`, `server/src/entradas/worker.ts`. Tabela `dspd_core.outbox`: [`data-model.md`](../data-model.md) §5. Decisão: ADR 0014 (outbox com polling). Estados do evento: [05-ciclos-de-vida](05-ciclos-de-vida.md).

## Quais eventos existem hoje?
| Tipo | Fonte (`outbox.fonte`) | Produtor | Consumidores | Payload (alto nível) | Estado |
|---|---|---|---|---|---|
| `coleta.concluida` | `businessmap` ou `acelerato` (a fonte da coleta) | `fecharColeta` em `modulos/operacao/concluida.ts`, na mesma transação que fecha `ctl_coleta` | `consumidorColetaConcluida` (módulo `operacao`), registrado por fonte em `entradas/worker.ts`; `falha` e `parcial` viram log `warn` | `fonte`, `coletaId` (texto), `status` (`sucesso`, `parcial` ou `falha`) | Produtor e consumidor existem. O produtor só é chamado pelo coletor, que ainda não existe [planejado: WS2] (hoje só os testes o chamam). |
| `bm.webhook.recebido` | `businessmap` | `receberWebhook` em `modulos/businessmap/webhook.ts`, na mesma transação do `INSERT` em `stg_webhook_evento`, papel `dspd_webhook` | Nenhum registrado. O normalizador do coletor será o consumidor [planejado: WS2] | `webhookSk` (texto), `payloadSha256` (hex) | Produtor existe e é testado. Sem consumidor, o evento fica `pendente` e o dado bruto segue em `stg_webhook_evento`. |

Tipos futuros previstos pelo prefixo: `bm.*` (só `businessmap`) e `ac.*` (só `acelerato`) [planejado]; nenhum existe. `coleta.*` vale para as duas fontes.

Os payloads só têm identificadores técnicos; nenhum dado pessoal (regra de `data-model.md` §5, teste de LGPD). O campo `payload` é `jsonb` e, no código, `unknown` (`EventoNovo.payload` em `outbox.ts`): não há schema zod por tipo [planejado: `catalogo-eventos.ts`, em [`contratos-plano.md`](../../engineering/contratos-plano.md) §3].

## Qual a relação com os eventos do domínio?
- **Evento da outbox** é mensagem interna de integração entre módulos, publicada e consumida por polling; é operacional e pode ser apagada (retenção de 30 dias após `processado`).
- **Evento de ciclo de vida do card** (`evt_card`: criado, arquivado, desarquivado, exclusão detectada, restaurado; Siegard [`card-lifecycle-event`](../../especificacao/domain/flow/card-lifecycle-event.md)) é fato do domínio, gravado só com `INSERT` e nunca apagado. Não passa pela outbox.
- **Transição** (`fato_transicao`) é fato do domínio e também não passa pela outbox; o webhook entra como `fonte = 'webhook'` e a revision é a canônica (`data-model.md` §3.2).

## Quais garantias a outbox dá?
| Garantia | Como | Onde |
|---|---|---|
| Publicação atômica | `publicarEvento` recebe o cliente da transação do chamador: se ela desfaz, o evento some | `outbox.ts` (`publicarEvento`) |
| Pelo menos uma vez | reserva com `FOR UPDATE SKIP LOCKED`, confirma a reserva e só então chama o consumidor, fora da transação; consumidor deve ser idempotente pela chave `eventoId` | `outbox.ts` (`processarOutbox`) |
| Reserva expirada volta à fila | `reservado_ate` = agora + 5 min (`RESERVA_MS`) | `outbox.ts` |
| Reentrega com recuo | backoff 30 s x 2^(n-1), teto de 1 h; `ultimo_erro` guarda só o nome da classe do erro | `outbox.ts` (`backoffMs`) |
| Limite de tentativas | 8 (`MAX_TENTATIVAS`); depois, `falha` | `outbox.ts` |
| Sem consumidor, sem desgaste | o poller só reserva tipos registrados (`RegistroConsumidores.tipos(fonte)`); os demais ficam `pendente`, sem consumir tentativas | `consumidores.ts`, `outbox.ts` |
| Uma fonte por vez | o poller filtra por `fonte`; BM e AC nunca no mesmo lote; `RegistroConsumidores.registrar` recusa `bm.*` fora de `businessmap` e `ac.*` fora de `acelerato` | `consumidores.ts` |
| Exclusão entre execuções da fonte | `pg_try_advisory_lock` por fonte em torno das tarefas agendadas | `plataforma/db/trava.ts`, `plataforma/worker.ts` |
| Retenção | `processado` com mais de 30 dias é apagado ao fim de cada execução (`RETENCAO_DIAS`); única exceção à regra de não apagar | `outbox.ts` |
| Privilégio mínimo | `dspd_webhook` só insere em `outbox`; `dspd_coletor` lê e atualiza as colunas de estado; `dspd_api` não acessa | `plataforma/db/grants.ts`; `data-model.md` §8 |

## Como acrescentar um evento?
1. Escolher o tipo com o prefixo da fonte dona (`bm.`, `ac.`) ou `coleta.`.
2. Publicar com `publicarEvento` dentro da transação que muda o estado.
3. Registrar o consumidor com `RegistroConsumidores.registrar(fonte, tipo, consumidor)` na entrada do worker; consumidor idempotente.
4. Atualizar esta página e o payload no índice de contratos (`docs/api/README.md`, do `tech-lead`, [planejado] no [plano](00-plano.md) §4). O code review reprova mudança de evento sem tocar este arquivo.
