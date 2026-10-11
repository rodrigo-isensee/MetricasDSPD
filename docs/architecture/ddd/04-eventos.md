# Eventos de domínio e da outbox

Propósito: explicar a relação entre a outbox e os eventos de domínio e como acrescentar um evento; o catálogo (produtor, consumidores, payload, garantias) está em `docs/contratos/eventos.md`. Público: desenvolvedores do back-end, arquiteto e QA. Revisão: 2026-10-11.

Fontes no código: `server/src/plataforma/eventos/` (`catalogo.ts`, `outbox.ts`, `consumidores.ts`), `server/src/modulos/operacao/concluida.ts`, `server/src/modulos/businessmap/webhook.ts`, `server/src/entradas/worker.ts`. Tabela `dspd_core.outbox`: [`data-model.md`](../data-model.md) §5. Decisão: ADR 0014 (outbox com polling). Estados do evento: [05-ciclos-de-vida](05-ciclos-de-vida.md).

## Quais eventos existem hoje?
O catálogo (tipo, fonte, produtor, consumidores, payload e garantias) vive em **um só lugar**: [`docs/contratos/eventos.md`](../../contratos/eventos.md), ao lado da fotografia do schema. Hoje são dois tipos, `coleta.concluida` e `bm.webhook.recebido`. O schema Zod de cada tipo existe em `server/src/plataforma/eventos/catalogo.ts` e é validado em `publicarEvento`; tipo fora do catálogo é recusado.

Esta página trata só do que é de domínio: a relação entre a outbox e os fatos do domínio, e como acrescentar um evento. O prefixo do tipo diz a fonte: `bm.*` só `businessmap` (hoje existe `bm.webhook.recebido`) e `ac.*` só `acelerato` (nenhum tipo `ac.*` existe ainda [planejado: WS5]). `coleta.*` vale para as duas fontes. O produtor de `coleta.concluida` só é chamado pelo coletor, que ainda não existe [planejado: WS2]. Os payloads só têm identificadores técnicos; nenhum dado pessoal (regra de `data-model.md` §5, teste de LGPD).

## Qual a relação com os eventos do domínio?
- **Evento da outbox** é mensagem interna de integração entre módulos, publicada e consumida por polling; é operacional e pode ser apagada (retenção de 30 dias após `processado`).
- **Evento de ciclo de vida do card** (`evt_card`: criado, arquivado, desarquivado, exclusão detectada, restaurado; Siegard [`card-lifecycle-event`](../../especificacao/domain/flow/card-lifecycle-event.md)) é fato do domínio, gravado só com `INSERT` e nunca apagado. Não passa pela outbox.
- **Transição** (`fato_transicao`) é fato do domínio e também não passa pela outbox; o webhook entra como `fonte = 'webhook'` e a revision é a canônica (`data-model.md` §3.2).

## Quais garantias a outbox dá?
| Garantia | Como | Onde |
|---|---|---|
| Publicação atômica | `publicarEvento` recebe o cliente da transação do chamador: se ela desfaz, o evento some | `outbox.ts` (`publicarEvento`) |
| Pelo menos uma vez | reserva com `FOR UPDATE SKIP LOCKED`, confirma a reserva e só então chama o consumidor, fora da transação; consumidor deve ser idempotente pela chave `eventoId` | `outbox.ts` (`processarOutbox`) |
| Reserva expirada é reservada de novo | `reservado_ate` = agora + 5 min (`RESERVA_MS`); vencida, o evento segue `processando` e o poller o reserva outra vez (não volta a `pendente`) | `outbox.ts` |
| Reentrega com recuo | backoff 30 s x 2^(n-1), teto de 1 h; `ultimo_erro` guarda só o nome da classe do erro | `outbox.ts` (`backoffMs`) |
| Limite de tentativas | 8 (`MAX_TENTATIVAS`); depois, `falha` | `outbox.ts` |
| Sem consumidor, sem desgaste | o poller só reserva tipos registrados (`RegistroConsumidores.tipos(fonte)`); os demais ficam `pendente`, sem consumir tentativas | `consumidores.ts`, `outbox.ts` |
| Fonte conferida ao publicar | `publicarEvento` recusa tipo `bm.*`/`ac.*` de outra fonte e `payload.fonte` diferente da coluna `fonte` (detalhe em [`contratos/eventos.md`](../../contratos/eventos.md)) | `outbox.ts` (`publicarEvento`), `catalogo.ts` (`conferirFonte`) |
| Uma fonte por vez | o poller filtra por `fonte`; BM e AC nunca no mesmo lote; `RegistroConsumidores.registrar` recusa `bm.*` fora de `businessmap` e `ac.*` fora de `acelerato` | `consumidores.ts` |
| Exclusão entre execuções da fonte | `pg_try_advisory_lock` por fonte em torno das tarefas agendadas | `plataforma/db/trava.ts`, `plataforma/worker.ts` |
| Retenção | `processado` com mais de 30 dias é apagado ao fim de cada execução (`RETENCAO_DIAS`); única exceção à regra de não apagar | `outbox.ts` |
| Privilégio mínimo | `dspd_webhook` só insere em `outbox`; `dspd_coletor` lê e atualiza as colunas de estado; `dspd_api` não acessa | `plataforma/db/grants.ts`; `data-model.md` §8 |

## Como acrescentar um evento?
1. Escolher o tipo com o prefixo da fonte dona (`bm.`, `ac.`) ou `coleta.`.
2. Declarar o schema Zod `.strict()` e um exemplo em `server/src/plataforma/eventos/catalogo.ts`.
3. Publicar com `publicarEvento` dentro da transação que muda o estado.
4. Registrar o consumidor com `RegistroConsumidores.registrar(fonte, tipo, consumidor)` na entrada do worker; consumidor idempotente.
5. Gerar a fotografia (`pnpm run docs:fotografar`) e acrescentar a linha em [`contratos/eventos.md`](../../contratos/eventos.md); o índice de contratos é [`docs/api/README.md`](../../api/README.md). O code review reprova mudança de evento sem tocar o catálogo.
