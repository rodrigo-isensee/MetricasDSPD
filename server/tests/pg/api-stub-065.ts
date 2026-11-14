/**
 * API de teste do E2E do pedido 065 (sem banco): serve o contrato /api/v1 com o núcleo do mock (biblioteca única) e aplica
 * as MESMAS regras de publicação do servidor na base real: métrica fora do mapa real responde `sem-dado-real`. Desde o pedido 075
 * (lote 6b) BLOQUEADOS, O5 e O19 estão no mapa real e a parte de bloqueio do O1 e do O2 sai calculada, sem nota (como o servidor).
 * Uso: PORT=3199 pnpm exec tsx tests/pg/api-stub-065.ts. Só desenvolvimento.
 */
import http from 'node:http'
import { corpoSemDadoReal, fonteDaMetrica, origemDaMetrica, type MetricaId } from '../../../packages/contratos/src/index.ts'
import { NucleoMock, paginarO2 } from '../../../web/src/data/mock/nucleoMock.ts'

const nucleo = new NucleoMock({})
const ehSust = (id: MetricaId) => fonteDaMetrica(id) === 'acelerato'
const porta = Number(process.env.PORT ?? 3199)

const json = (res: http.ServerResponse, corpo: unknown, cab: Record<string, string> = {}) => {
  res.writeHead(200, { 'content-type': 'application/json', ...cab })
  res.end(JSON.stringify(corpo))
}

http
  .createServer(async (req, res) => {
    try {
      const u = new URL(req.url ?? '/', 'http://x')
      const p = u.pathname.replace(/^\/api\/v1/, '')
      let m: RegExpMatchArray | null
      if ((m = p.match(/^\/metricas\/([A-Za-z0-9_]+)$/))) {
        const id = m[1] as MetricaId
        if (origemDaMetrica(id) === 'sem-dado') return json(res, corpoSemDadoReal(id), { 'x-estado-dado': 'sem-dado-real' })
        const periodo = u.searchParams.get('periodo') ?? (ehSust(id) ? '6m' : '12s')
        const filtros = ehSust(id)
          ? { equipe: [], prioridade: [], periodo: { tipo: periodo } }
          : { equipe: [], tipo: [], sistema: [], periodo: { tipo: periodo } }
        let r: unknown = await nucleo.obter(id, filtros as never)
        if (id === 'O2') r = paginarO2(r as never)
        return json(res, r)
      }
      if ((m = p.match(/^\/filtros\/(businessmap|acelerato)$/))) return json(res, await nucleo.opcoesFiltro(m[1] as never))
      if (p === '/criterios') return json(res, await nucleo.criterios())
      if (p === '/referencia') return json(res, { dataReferencia: await nucleo.dataReferencia() })
      if ((m = p.match(/^\/fontes\/(businessmap|acelerato)\/estado$/))) return json(res, await nucleo.estadoColeta(m[1] as never))
      if ((m = p.match(/^\/fontes\/(businessmap|acelerato)\/coletas$/)))
        return json(res, await nucleo.historicoColetas(m[1] as never, Number(u.searchParams.get('pagina') ?? 1)))
      res.writeHead(404, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: { code: 'NAO_ENCONTRADO' } }))
    } catch (e) {
      res.writeHead(500, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: { code: 'STUB', mensagem: String(e) } }))
    }
  })
  .listen(porta, '127.0.0.1', () => console.log(`API_PRONTA ${porta}`))
