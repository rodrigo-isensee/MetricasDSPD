# API de fontes: estado de coleta, histórico e critérios

Servidor: Hono na Lambda `api` (local: `@hono/node-server`), entrada validada com `@hono/zod-validator` (ADR 0013). Base `/api/v1`. Uma fonte por chamada (`businessmap` ou `acelerato`): nenhuma resposta soma as duas. Tipos e schemas zod `.strict()` em `@metricas-dspd/contratos` (`packages/contratos/src/coletas.ts`); campo extra reprova a validação (nenhum campo de pessoa). Sem autenticação nesta etapa (D6). Erros: formato único de `docs/api/metricas.md`. `:dominio` fora de `businessmap|acelerato` -> 400 `VALIDATION_ERROR`.

Origem dos dados: `ctl_coleta` / `ctl_coleta_contagem` da fonte (tarefa `coleta_incremental`, sem `em_andamento`) e `ref_versao_criterio*` (`server/src/coletas/`). Selo, janelas de calibração e `metricasEmCalibracao` são calculados em `packages/metricas/core` (`montarEstadoColeta`), nunca na rota.

## GET /fontes/:dominio/estado
200 `EstadoColeta`:
```json
{ "dominio": "businessmap", "selo": "falha", "horasDesdeUltimaOk": 36, "proximaPrevista": "2026-10-10T06:00:00-03:00",
  "ultimaOk": { "id": "bm-41", "inicio": "2026-10-08T06:00:00-03:00", "fim": "2026-10-08T06:01:10-03:00", "duracaoMs": 70000,
    "resultado": "ok", "tipoErro": null, "efeito": "aplicada",
    "contagens": { "lidos": 14, "novos": 4, "atualizados": 10, "arquivadosPreservados": 120, "excluidosPreservados": 8 } },
  "ultimaTentativa": { "id": "bm-42", "resultado": "falha", "tipoErro": "tempo-esgotado", "efeito": "anteriores-mantidos", "contagens": null, "...": "..." },
  "falhasRecentes": [ "EventoColeta, 14 dias, resultado != ok" ],
  "calibracao": [ { "inicio": "2026-09-15", "fim": "2026-11-13", "origem": "inicio-coleta", "criterioId": null, "metricas": ["S1"] } ],
  "metricasEmCalibracao": ["S1"] }
```
- `selo`: `sem-coleta` > `falha` (última tentativa falhou) > `atrasado` (agora > próxima coleta prevista após a última ok + tolerância, provisória 0 h) > `atual`.
- Calibração: constante `DURACAO_CALIBRACAO_DIAS = 60`, intervalo fechado `[inicio, inicio + 59]`; só janelas vigentes. Provisória até o usuário confirmar.
- `tipoErro` é categoria (`indisponivel|autenticacao|tempo-esgotado|dados-invalidos|desconhecido`); mensagem, SQL, stack e credencial nunca saem (CA-15).
- Números: contagens, `duracaoMs` e `total` são inteiros >= 0; `horasDesdeUltimaOk` >= 0 ou `null`; `pagina` inteira >= 1. O schema rejeita negativo e fração.
- Cache: `Cache-Control: private, max-age=60`. Erros: 400, 500.

## GET /fontes/:dominio/coletas?pagina=1
200 `PaginaColetas`: `{ itens: EventoColeta[], pagina, porPagina: 20, total }`, mais recente primeiro (desempate por `id`). `pagina` inteira >= 1 (padrão 1; inválida -> 400); além da última devolve `itens: []`. Histórico nunca é apagado.

## GET /criterios
200 `VersaoCriterio[]` (`id`, `data`, `descricao`, `afeta`), as duas fontes cada uma com as suas versões (T2.6); a mesma forma de `FonteMetricas.criterios()`.

## Mudança de contrato
`X-Ultima-Coleta` foi removido de `GET /metricas/:id` (ver `docs/api/metricas.md`): o front lê o frescor de `/fontes/:dominio/estado` (`useEstadoColeta`).
