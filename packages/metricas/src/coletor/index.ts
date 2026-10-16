/**
 * Funções puras que recebem identidade opaca de pessoa e devolvem só inteiros (ADR 0020). Fica FORA dos pontos de
 * entrada públicos do pacote (`exports` do package.json e `src/index.ts`): só o coletor e o projetor a importam.
 */
export { faixaConcentracao } from './faixaConcentracao'
