export { rotasReferencia, type DepsReferencia } from './rotas.js';
export { lerEquipesBM, lerTimesAtivos, lerSistemasBM, lerInicioAC, lerInicioBM, lerVersaoCriterioVigente, lerCalendarioVigente, lerTurnosVigentes, type CalendarioDaReferencia, type TurnoDaReferencia } from './repositorio.js';
export { dataCivil } from './servico.js';
export { CRITERIOS_ACELERATO, CRITERIO_D7_528, REFERENCIA_D7_528, registrarCriterioD7528, registrarCriteriosAcelerato } from './criterios-acelerato.js';
export { CRITERIOS_APONTAMENTO, METRICA_ACHADOS_APONTAMENTO, METRICA_DICIONARIO_APONTAMENTO, registrarCriteriosApontamento } from './criterios-apontamento.js';
export {
  ARQUIVO_DOMINIO, CAMPOS_DOMINIO, ErroDominio, analisarDominio, dataCivilValida, lerDominio, planejarDominio, sincronizarDominio, textoSeguro,
  type LinhaVigente, type ResultadoDominio,
} from './dominio-acelerato.js';
export {
  ARQUIVO_CALENDARIO, CLASSES_CALENDARIO, ErroCalendario, METRICAS_CALENDARIO, analisarCalendario, lerCalendario, planejarCalendario, sincronizarCalendario,
  type ResultadoCalendario,
} from './calendario.js';
export {
  ARQUIVO_ALVOS, ErroAlvos, METRICAS_ALVOS, analisarAlvos, lerArquivoAlvos, planejarAlvos, sincronizarAlvos, type ResultadoAlvos,
} from './alvos-acelerato.js';
export { CORTE_CARDS, CORTE_CHAMADOS } from './cortes.js';
