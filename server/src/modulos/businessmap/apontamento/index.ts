export { analisarArgumentosApontamento, executarApontamento } from './comando.js';
export {
  coletarApontamentos, diaCivil, JANELA_VARREDURA_DIAS, LIMITE_MASSA_PERCENTUAL, MESES_CARGA_APONTAMENTO, VERSAO_COLETOR_APONTAMENTO,
  type DepsApontamento, type ModoApontamento, type ResultadoApontamento,
} from './coleta.js';
export { calcularRaizes, PROFUNDIDADE_MAXIMA, type NoCard, type RaizDoCard } from './hierarquia.js';
export { lerLote, LOTE_CARDS, type Folha } from './lotes.js';
export {
  classificadorDoDicionario, classificar, conferirClassificacao, FLAGS, lerApontamento, MASCARA_DA_CLASSIFICACAO,
  type ClassificarApontamento, type EntradaClassificacao, type SaidaClassificacao,
} from './registro.js';
export { hmacUsuario, SAL_MINIMO_BYTES } from './supressao.js';
export {
  analisarDicionario, carregarDicionario, ErroDicionario, lerDicionario, planejarDicionario, sincronizarDicionario, ARQUIVO_DICIONARIO,
  type ResultadoDicionario,
} from './dicionario.js';
export { analisarArgumentosEliminacao, eliminarPessoa, lerUsuarioDaEntrada, type ArgsEliminacao, type ArgsEliminacaoCli, type DepsEliminacao, type ResultadoEliminacao } from './eliminacao.js';
export { montarDepsApontamento, type EntradaMontagem } from './montagem.js';
