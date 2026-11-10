---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l5-fluxo-real
commit: e751242b53f2aaac546ec2cd016d126fe8ea726e
parecer: aprovado
revisor: tech-lead
data: 2026-11-10
---
# Code review: 077 lote 5, TENDENCIA_FLUXO no mapa real (K-211, E2.2)

Diff lido: `8e2889ba...e751242b` (6 arquivos, 144 adições e 6 remoções, em 3 commits: `96569b15`, `2e737308` só formatação e `e751242b` A14). Comparado com `## Lote 5` de `docs/analises/077-desenho.md` e com A8, A9, A11, A12 e A14 de `docs/analises/077-desenho-revisao-tech-lead.md`.

## Parecer
**Aprovado.** O lote faz o que o Lote 5 pede, sem nada a mais.

- **Mapa real e simulação (A9):** `TENDENCIA_FLUXO` entrou em `METRICAS_ORIGEM_REAL` (`packages/contratos/src/origem.ts:33-34`) e continua em `METRICAS_SEM_SIMULACAO`. No `origem.test.ts`, o teste do 065 passou a conferir os ids, sem tamanho fixo (`:144`). O T-C1 afirma o id presente no mapa real e `podeSimular` falso para todo id real (`:179-182`). `TENDENCIA_SUST` continua fora do mapa real, o que está certo porque é do Lote 7.
- **Constante da virada (A8, P-077-3):** `VERSAO_CRITERIO_TENDENCIA_FLUXO_DADO_REAL` usa `afeta: ['TENDENCIA_FLUXO']` e está em `VERSOES_DA_BIBLIOTECA` (`packages/metricas/src/core/criterios.ts:138-157`). Segue o precedente do 065 e do 075 6a. A data é 2026-11-09 e se corrige no merge (A1).
- **Sem carga inicial (A14, T2.5):** o guarda em `server/src/modulos/metricas/servico.ts:275` devolve o mesmo `semDado()` do portão do 060 (`:268-269`). Não há cálculo novo, e o número sai pela biblioteca (ADR 0019). O modo mock explícito continua calculando.
- **Prova de rota (A11, A12):** `server/tests/tendencia-fluxo-real-l5.test.ts` usa `historicoDesde = 2026-07-01` e `dataReferencia = 2026-12-01`. Junho a agosto saem com `janelaIncompleta` e sem estatística, e setembro a novembro saem publicados, no mesmo resultado e validados pelo schema. A biblioteca e o serviço são os reais; só o pg é dublê. Isso atende à "base real-like" da A11.
- **Mínimo de 20 itens:** o tipo com 19 entregues sai `insuficiente` num mês publicado (`:89-94`).
- **BusinessMap e Acelerato sem mistura:** `dominioDe('TENDENCIA_FLUXO')` não carrega o Acelerato (`servico.ts:273`). O teste com chamado tem o mesmo corpo do teste sem chamado (A2).
- **Marca da virada em `criterios` (CA-12):** está provada no teste `:115-119`.
- **8a junto:** `contagemParcial` aparece no mês que começa antes do histórico e não aparece no mês que começa nele (`:102-107`).
- **`qa-f6-painel.test.ts`:** a única mudança é incluir o id na lista dos reais (`:98`).

## Ferramentas
- **CI do push em `e751242b`:** run 42818122127 `CI` `success` (rapida, testes, filtro, seguranca, build, openapi, imagem e banco verdes; e2e e perf pulados pela regra do workflow). Lint, tipos e cobertura de ramos de 100% vêm da CI e não foram refeitos.
- **Testes dos arquivos tocados:** `server` `tests/tendencia-fluxo-real-l5.test.ts` e `tests/qa-f6-painel.test.ts`, 12 verdes; `packages/contratos` `src/origem.test.ts`, 17 verdes.
- **Mutações refeitas, restauradas com `git checkout HEAD -- server/src` e árvore limpa conferida:** S1 e S2.

## Teto M14
150 linhas de código e teste (`origem.test.ts` 6+4, `origem.ts` 2+0, `criterios.ts` 10+0, `servico.ts` 4+1, `qa-f6-painel.test.ts` 1+1, `tendencia-fluxo-real-l5.test.ts` 121+0). O lote fica no limite e tem um comportamento só.

## Achados
- A1 (recomendado) packages/metricas/src/core/criterios.ts:140 · a data 2026-11-09 (e o id que a repete) é a da entrega. No merge, se o dia for outro, corrigir os dois (A8). A marca só aparece no mês fechado (R5).
- A2 (recomendado) server/tests/tendencia-fluxo-real-l5.test.ts:96 · para `TENDENCIA_FLUXO` o serviço nem lê o Acelerato (`servico.ts:273`). O teste vale como regressão, mas não prova que o dublê foi consultado.
- A3 (recomendado) server/src/modulos/metricas/servico.ts:275 · sem carga inicial, o motivo é o genérico "fonte real ainda não definida", que não descreve o caso (a fonte existe, falta a carga). Um texto próprio é decisão de UX e do dono, para um lote futuro.

## Sondas
- S1 · guarda da A14 removido em servico.ts:275 · espera: teste de rota reprova · obtido: "sem carga inicial com sucesso responde sem-dado-real" falha, expected undefined to be 'sem-dado-real' (1 de 6)
- S2 · `this.deps.modoMock !== true` removido do guarda · espera: algum teste reprova · obtido: "TENDENCIA_FLUXO: filtros válidos = 200 no schema, ETag estável e 304" e "TENDENCIA_FLUXO: resultado idêntico" falham (2 de 19 com -t TENDENCIA)
