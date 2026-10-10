export interface ConfigMock {
  semente: number
  /** Data de corte ("hoje" do mock), ISO com fuso. Sempre parâmetro: nada de relógio do sistema. */
  hoje: string
  mesesHistorico: number
  /** Multiplicador de volume (testes usam < 1 para ficar rápidos). */
  escala: number
}

export const CONFIG_PADRAO: ConfigMock = {
  semente: 20261009,
  hoje: '2026-10-09T18:00:00-03:00',
  mesesHistorico: 18,
  escala: 1,
}
