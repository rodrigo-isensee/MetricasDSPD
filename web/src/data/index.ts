export type { FonteMetricas, OpcoesObter } from './FonteMetricas'
export { FonteMetricasProvider, useFonte } from './FonteMetricasProvider'
export {
  useMetrica,
  useOpcoesFiltro,
  useDataReferencia,
  useCriterios,
  useEstadoColeta,
  useHistoricoColetas,
  useMetricasEmCalibracao,
  useModoMock,
  useErroDePainelSimulado,
  type MetricaQuery,
  type EstadoMetrica,
} from './useMetrica'
export { MockFonteMetricas } from './mock/MockFonteMetricas'
export { lerModoMock, type ModoMock } from './simulacao'
export { HttpFonteMetricas, PAGINA_O2 } from './http/HttpFonteMetricas'
export { ErroApi } from './http/ErroApi'
export { filtrosParaQuery } from './http/filtrosParaQuery'
