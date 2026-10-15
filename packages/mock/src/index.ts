import type { BaseAC } from '@metricas-dspd/metricas/acelerato'
import type { BaseBM } from '@metricas-dspd/metricas/businessmap'
import { gerarBaseAcelerato } from './acelerato'
import { gerarBaseBusinessMap } from './businessmap'
import { CONFIG_PADRAO, type ConfigMock } from './config'

export interface BaseMock {
  bm: BaseBM
  ac: BaseAC
  config: ConfigMock
}

/** Gera a base fictícia completa. Domínios independentes: cada um usa a sua semente derivada. */
export function gerarBaseMock(parcial: Partial<ConfigMock> = {}): BaseMock {
  const config = { ...CONFIG_PADRAO, ...parcial }
  return { bm: gerarBaseBusinessMap(config), ac: gerarBaseAcelerato(config), config }
}

export { derivar, hashJson, type Prng } from './prng'
export { PASSOS_TAMBEM, PARAMETROS_TAMBEM, type PassoTambem } from './businessmap/tambem'
export { LATENCIA_MAX_MS, LATENCIA_MIN_MS, sortearLatencia } from './latencia'
export { CONFIG_PADRAO, type ConfigMock }
export { gerarColetasMock, type ColetasMock } from './coletas'
export { gerarExtensoesMock } from './complementares'
export { gerarPesquisaMock } from './pesquisa'
export { gerarBaseBusinessMap } from './businessmap'
