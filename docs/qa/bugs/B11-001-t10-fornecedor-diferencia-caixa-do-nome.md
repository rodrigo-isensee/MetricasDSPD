# B11-001 - T10 divide o mesmo fornecedor em linhas separadas quando o nome difere só na caixa
- Severidade: baixa (pergunta ao usuário; a especificação é omissa, então não conta como defeito aberto no parecer)
- Responsável sugerido: `node-backend` (depois da decisão do usuário sobre a regra; não se resolve por inferência)
- Ambiente: `feature/011-metricas-tambem-back` a212d12 (mais testes do QA), biblioteca `packages/metricas`, sem navegador

## Passos para reproduzir
1. Montar uma base com três bloqueios encerrados no mesmo período, de um card de story, com fornecedor `"Totvs"`, `"TOTVS"` e `"totvs "` (a última com espaço no fim).
2. Chamar `calcularT10(ctx, filtros 12s)`.

## Resultado esperado
A especificação diz "uma linha por fornecedor" (CA-24, CA-11) e não define normalização de caixa. O esperado depende de decisão do usuário: ou o nome é comparado sem diferença de caixa, ou a caixa é regra de preenchimento do campo no BusinessMap.

## Resultado obtido
Três linhas (`TOTVS`, `Totvs`, `totvs`, cada uma com 1 bloqueio). O espaço nas pontas é aparado (`trim`), a caixa não. Como o P50/P85 exige 20 bloqueios por fornecedor, a divisão por caixa pode esconder a estatística de um fornecedor que, somado, passaria de 20.

## Evidência
Execução da biblioteca em 2026-10-15: `[["TOTVS",1],["Totvs",1],["totvs",1]]`. O teste `T10-7` de `packages/metricas/src/qa011-fase1.test.ts` cobre o que está decidido (nome só de espaços fica fora, espaços nas pontas não dividem) e não afirma a caixa, justamente porque a regra não está definida.

## Pergunta ao usuário (R-DECISAO)
O campo `fornecedor` do BusinessMap é lista fechada ou texto livre? Se for texto livre, "Totvs" e "TOTVS" são o mesmo fornecedor no T10? Até a resposta, nada muda no código.
