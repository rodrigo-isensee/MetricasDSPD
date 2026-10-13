import { TIPO_ID, type TipoFiltro } from '@metricas-dspd/contratos'

/**
 * Serializa os filtros do contrato para a query da API: listas em CSV, vazio = "Todos" (omitido),
 * `de`/`ate` só com `custom`. O servidor é `.strict()`: só saem parâmetros do domínio da métrica.
 */
export function filtrosParaQuery(filtros: object, extra: Record<string, string> = {}): string {
  const f = filtros as Record<string, unknown>
  const q = new URLSearchParams()
  const lista = (chave: string, valores: unknown, mapa: (v: string) => string = (v) => v) => {
    if (Array.isArray(valores) && valores.length > 0) q.set(chave, valores.map(mapa).join(','))
  }
  lista('equipe', f.equipe)
  lista('tipo', f.tipo, (t) => TIPO_ID[t as TipoFiltro])
  lista('sistema', f.sistema)
  lista('prioridade', f.prioridade)
  const p = f.periodo as { tipo: string; de?: string; ate?: string } | undefined
  if (p) {
    q.set('periodo', p.tipo)
    if (p.tipo === 'custom') {
      q.set('de', p.de as string)
      q.set('ate', p.ate as string)
    }
  }
  for (const [k, v] of Object.entries(extra)) q.set(k, v)
  return q.toString()
}
