import { describe, expect, it } from 'vitest'

/**
 * Guarda do pedido 060 (P5): a aba Apontamento lê só `GET /api/apontamento` (base real) e nunca passa por `FonteMetricas`,
 * pelo mock nem pelas consultas de métrica. Quem importar qualquer um deles na aba quebra a suíte.
 */
const arquivos = import.meta.glob<string>('./**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const dosTestes = /\.test\.tsx?$|\/fixture\.ts$|\/rota-falsa\.ts$/

const PROIBIDO =
  /\b(FonteMetricas|FonteMetricasProvider|MockFonteMetricas|HttpFonteMetricas|useFonte|useMetrica)\b|from\s*['"]@\/data['"]|from\s*['"]@\/data\/(mock|useMetrica|FonteMetricas)[^'"]*['"]|@metricas-dspd\/(mock|metricas)/

describe('aba Apontamento fora da fonte de métricas e do mock (pedido 060)', () => {
  const producao = Object.entries(arquivos).filter(([nome]) => !dosTestes.test(nome))

  it('há código de produção da aba para conferir', () => {
    expect(producao.length).toBeGreaterThan(5)
  })

  it('nenhum arquivo de produção da aba usa FonteMetricas, o mock ou o hook de métrica', () => {
    const usam = producao.filter(([, texto]) => PROIBIDO.test(texto)).map(([nome]) => nome)
    expect(usam).toEqual([])
  })
})
