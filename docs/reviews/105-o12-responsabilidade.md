---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-o12-responsabilidade
commit: 27453898059c1d28bd99a6ff31088e1cbd46dfde
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: O12 pela responsabilidade do atraso, campo 51 pelo value_id, E7.214 (review E7.233)

Branch `feature/105-o12-responsabilidade`, head `27453898`, empilhada em `feature/105-campos-value-id` (merge `4cc170b4`). Revisado só o commit `27453898`; o empilhado tem parecer próprio em `docs/reviews/105-campos-value-id.md`. 15 arquivos; código e teste do commit: 163 linhas (`git diff --numstat 4cc170b4 HEAD`). Um comportamento só: ligar a divisão do O12 pela responsabilidade do atraso.

## Parecer
**Reprovado** no head `27453898` por A1. A lógica do O12 está correta: com o interruptor ligado e nenhum vencido classificado, as três partes saem `null` com o motivo da data de início, nunca 0, e a meta não é avaliada; com um vencido classificado a divisão é publicada e o vencido sem campo conta como não classificado. O campo 42 (pessoa) fica fora. A versão de critério da biblioteca `criterio-2026-11-16-o12-responsabilidade-dado-real` tem `afeta` O12 e VISAO_GERAL (T2.6). O defeito está na versão de critério do arquivo de domínio.

## Achados
- A1 (bloqueante) docs/architecture/fontes/businessmap-dominio.json:8 · `afeta` virou `[]` e apaga a marca O14 e O17 do E7.203, que entra pela mesma branch; o `bm:ref-sync` nunca a registra (T2.6). Mantenha `["O14","O17"]` (detalhe abaixo).
- A2 (recomendado) packages/metricas/src/businessmap/o12.ts:76 · Mutante sem `comResponsabilidade &&` sobrevive: nenhum teste chama `calcularO12(..., false)`. Acrescente o caso desligado com vencido classificado.

## Detalhe
- A1: o commit troca o bloco `versao_criterio` do arquivo. A versão do E7.203 (`afeta` `["O14","O17"]`, campos 48 e 49 pelo `value_id`) vira a do E7.214 com `afeta` `[]`, e o teste acompanha (server/tests/dominio-businessmap.test.ts:49). O E7.203 não está na `develop` (`git log origin/develop` não tem `ad04bc37`) e entra pela mesma branch. O `bm:ref-sync` registra só a versão do arquivo da ponta (chave `referencia`), então a marca de O14 e O17 nunca chega a `ref_versao_criterio_metrica`. Correção: na ponta, `afeta` `["O14","O17"]`, com `descricao` e `motivo` cobrindo E7.203 e E7.214; atualize o teste da linha 49 e o texto do teste pg ("sem métrica afetada").
- A2: com o teste do interruptor desligado reescrito, os 430 testes de `src/businessmap` passam com o mutante. Para o desligamento seguir protegido, o caso `false` deve esperar `null`, o motivo e `sem-referencia`.
- Tamanho: 163 linhas de código e teste, pouco acima da orientação de 150. O corpo do PR deve declarar `teto: excedido, 163 linhas, <motivo>` (M14).

## Verificações
- Regras de ferramenta: o pronto do autor está verde (histórico do pedido, 2026-11-16 12:28, "O12 entregue (27453898, pronto verde)"). No CI do push do head (run 43896506195, `completed:success`), passaram build, rapida, testes, banco (inclui o teste pg do domínio com os 3 campos e 402 linhas), openapi e seguranca. Nesse evento, e2e e perf ficaram `skipped`, e por isso o OP-17 e o B3-002 atualizados só rodam no CI do PR.
- Rodados aqui: `fixtures.cobertura.test.ts` (35 passaram); `dominio-businessmap.test.ts` e `allow-list.test.ts` (119 passaram). Mutante `> 0` para `>= 0` na linha 76 de `o12.ts`: morto (1 falha). Mutante sem `comResponsabilidade &&`: vivo (A2).
- Caminho `desconhecido`: o `value_id` fora do catálogo vira `null` no normalizador (`campo_fora_do_dominio`), então o cast sem checagem de `mapa.ts:21` nunca recebe código fora de `RESPONSABILIDADES_ATRASO` e o `porResponsabilidade` não chega a `NaN`.
- BusinessMap e Acelerato não se misturam: o diff não lê `dspd_ac`. Nenhuma métrica individual: o campo 42 continua proibido no arquivo e no teste.
- Revalidação: ler só o delta de A1 (e de A2, se entrar) e o CI do novo head.
