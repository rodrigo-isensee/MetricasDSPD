export type { FonteMetricas } from './FonteMetricas'
export { FonteMetricasProvider, useFonte } from './FonteMetricasProvider'
export {
  useMetrica,
  useOpcoesFiltro,
  useDataReferencia,
  useCriterios,
  useModoMock,
  useErroDePainelSimulado,
  type MetricaQuery,
  type EstadoMetrica,
} from './useMetrica'
export { MockFonteMetricas } from './mock/MockFonteMetricas'
export { lerModoMock, type ModoMock } from './simulacao'
