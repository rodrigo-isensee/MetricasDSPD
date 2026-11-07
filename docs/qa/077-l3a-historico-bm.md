---
tipo: qa
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l3a-historico-bm
commit: 4f8a5479c4d46a000c088c9910077c449d2f36b1
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---
# QA: 077 lote 3a, o servidor lê o início do histórico do BusinessMap (E2.3, K-211)

Código testado: `4f8a5479`. O HEAD `aa671887` só soma `docs/reviews/077-l3a-historico-bm.md`. Obrigação: `docs/analises/077-desenho.md` (§3 e "Lote 3a") e A13 e A14 de `docs/analises/077-desenho-revisao-tech-lead.md`. Este lote não toca tela nem contrato; não há E2E nem acessibilidade novos.

## Escopo
- Dentro: `lerHistoricoDesdeBM` (`repositorio.ts`), `Carga.historicoDesde` em `carregarBM` e o repasse ao contexto do BusinessMap em `servico.ts`.
- Fora: tendência do Acelerato (3b), `sem-dado-real` por falta de carga (Lote 5), tela (4a, 4b).
- Escopo conferido contra o diff `718d46be..4f8a5479`: `repositorio.ts`, `servico.ts` e os dois testes novos; `packages/`, `web/` e `server/migrations` sem diferença (`git diff --stat 718d46be HEAD` vazio nessas pastas); sem migração.

## Conferência contra o desenho
| Obrigação | Teste ou leitura | Fronteira protegida | Resultado |
|---|---|---|---|
| Duas cargas iniciais de cards com `inicio_carga` diferentes e apontamento mais antigo: vale a menor das cargas de cards | `.pg` "duas cargas iniciais..." (CI, job banco); no dublê, o `min` sobre duas válidas | min entre várias; apontamento fora | passou (CI) |
| Só falha ou só apontamento: `historicoDesde` ausente | `.pg` "só falha ou só apontamento"; no dublê, lista vazia | nenhuma carga válida | passou (CI) |
| `parametros` inválido ignorado; log só com a contagem | dublê (local) e `.pg`: contagem 2, conteúdo ausente do log | texto, objeto vazio e tipo errado | passou |
| `historicoDesde` nunca chega ao contexto de `TENDENCIA_SUST` | os dois arquivos, com início em 2099: a série de sustentação sem marca | fonte nunca misturada | passou (ver M3) |
| A14: nenhum ramo `sem-dado-real` novo no serviço | leitura do diff: só o repasse condicional e o aviso, ambos alcançáveis | n/a | passou |
| `Carga.inicio` intacto | `.pg` afirma `inicio` diferente de `historicoDesde`; diff mantém o cálculo | n/a | passou |
| A13: `min` em TS sobre as válidas, formato `YYYY-MM-DD` | leitura do diff e mutantes M1, M5, M6 | formato e ordenação | passou |

## Execução
- `server/tests/metricas.historico-bm.test.ts`, `--maxWorkers=2`, na worktree: 2 passaram, 0 falharam.
- `.pg` (`metricas.historico-bm.pg.test.ts`) não rodei aqui (sem base de teste local): CI do push, run 42358244710, `headSha` `4f8a5479c4d46a000c088c9910077c449d2f36b1`, `conclusion` `success` (`gh run view`); job `banco` success.
- Suíte completa não rodada local; vale a CI do push.

## Vermelho antes do verde
Cópia em `/tmp/claude-1000/qa-engineer-077-l3a/` (código e testes do head, `repositorio.ts` e `servico.ts` voltados à base `718d46be`; worktree intacta): 1 falha, 1 passa.
- Cai na base: "menor inicio_carga válido vai só à TENDENCIA_FLUXO; o inválido é ignorado com aviso sem conteúdo".
- Passa na base e no head, como guarda de regressão: "sem carga inicial válida: nada marcado e sem aviso" (o comportamento antigo já era esse).

## Mutação à mão (cópia descartável, cada mutante contra os 2 testes do dublê)
| Mutante | Resultado |
|---|---|
| M1 `max` no lugar do `min` | morto |
| M2 contagem de ignoradas sempre 0 | morto |
| M3 contexto do Acelerato recebe `historicoDesde` | sobrevive: equivalente, justificado abaixo |
| M4 log leva conteúdo cru | morto |
| M5 schema sem o formato `YYYY-MM-DD` | morto |
| M6 primeira linha no lugar do `min` | morto |
| M7 aviso emitido mesmo com 0 ignoradas | sobrevive: ver A1 |
| M8 repasse sempre, com data padrão sem carga | morto |

- M3 equivalente: o serviço só carrega a fonte que a métrica usa, e para `TENDENCIA_SUST` o `bm` é nulo; o valor não existe para vazar, então nenhum teste de contexto pode distinguir. O guarda real é o roteamento de fonte, coberto pelo restante da suíte.
- M7 sobrevive: nenhum teste afirma a ausência de aviso quando todas as cargas são válidas. O teste "sem carga inicial válida ... sem aviso" não injeta `log`, então não vê aviso algum. Efeito de um aviso espúrio: ruído de log, sem mudar resultado nem vazar dado; por isso recomendação, não bloqueio.

## Bugs
Nenhum aberto.

## Achados
- A1 (recomendado) server/tests/metricas.historico-bm.test.ts:34 · o segundo teste diz "sem aviso" mas não injeta `log`; um caso com cargas válidas e `log` espião afirmando zero chamadas mata o M7 (aviso com 0 ignoradas).
