/**
 * Funções puras que recebem identidade opaca de pessoa e devolvem só inteiros (ADR 0020). Fica FORA dos pontos de
 * entrada públicos do pacote (`exports` do package.json e `src/index.ts`): só o coletor e o projetor a importam.
 */
export { contarPassagens, houveTroca } from './houveTroca'
export { faixaConcentracao } from './faixaConcentracao'
export {
  LIMITE_GENERICO_PALAVRAS,
  MASCARA_FLAG,
  MAX_QTD_PALAVRAS,
  SUBGRUPO_EXECUCAO_TECNICA,
  SUBGRUPO_NAO_CLASSIFICADO,
  classificarApontamento,
  flagsDaMascara,
  mascaraDeFlags,
  normalizarTexto,
  type DicionarioApontamento,
  type EntradaApontamento,
  type RegraPorTermo,
  type RegraPorTipo,
  type ResultadoApontamento,
} from './classificarApontamento'
