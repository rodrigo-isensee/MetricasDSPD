/**
 * Funções puras que recebem identidade opaca de pessoa e devolvem só inteiros (ADR 0020). Fica FORA dos pontos de
 * entrada públicos do pacote (`src/index.ts` e os demais `exports`). O único caminho é `@metricas-dspd/metricas/coletor` (ADR 0020, item 3),
 * importado só por `server/src/modulos/businessmap/**` (regra de lint do servidor) e nunca pelo `web/` (lint da raiz e teste de bundle).
 */
export { contarPassagens, houveTroca } from './houveTroca'
export { faixaConcentracao } from './faixaConcentracao'
export {
  LIMITE_GENERICO_PALAVRAS,
  MASCARA_FLAG,
  MAX_PONTOS_DE_CODIGO,
  MAX_QTD_PALAVRAS,
  SUBGRUPO_EXECUCAO_TECNICA,
  SUBGRUPO_NAO_CLASSIFICADO,
  classificarApontamento,
  flagsDaMascara,
  mascaraDeFlags,
  normalizarTexto,
  palavrasDe,
  type DicionarioApontamento,
  type EntradaApontamento,
  type RegraPorTermo,
  type RegraPorTipo,
  type ResultadoApontamento,
} from './classificarApontamento'
