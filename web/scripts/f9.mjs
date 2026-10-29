// Cálculo do F9 (ADR 0003) pelo maior caminho baixado, sem somar caminhos excludentes.
// Regra: ADR 0021 §8 (2026-10-29, K-127). Funções puras, testáveis sem build real.

// ADR 0021 §8, item 1: raízes dos dois caminhos alternativos do mock. Se o build renomear, o F9 cai no fallback (item 5).
export const RAIZ_WORKER = /^nucleoMock\.worker-[^.]+\.js$/
export const RAIZ_PROCESSO = /^nucleoMock-[^.]+\.js$/

// ADR 0021 §8, item 2: imports estáticos e dinâmicos para arquivos do mesmo diretório.
const IMPORTS = /(?:\bfrom\s*|\bimport\s*\(?\s*)["']\.\/([^"']+\.js)["']/g

/** Fecho (raiz inclusa) por imports estáticos e dinâmicos entre os arquivos conhecidos. */
export function fecho(raiz, conhecidos, lerCodigo) {
  const visto = new Set()
  const fila = [raiz]
  while (fila.length > 0) {
    const atual = fila.shift()
    if (visto.has(atual)) continue
    visto.add(atual)
    for (const m of lerCodigo(atual).matchAll(IMPORTS)) {
      if (conhecidos.has(m[1]) && !visto.has(m[1])) fila.push(m[1])
    }
  }
  return [...visto]
}

/**
 * @param {{ linhas: { f: string, tipo: string, gz: number }[], iniciais: Set<string>, lerCodigo: (f: string) => string }} entrada
 */
export function calcularF9({ linhas, iniciais, lerCodigo }) {
  const porNome = new Map(linhas.map((l) => [l.f, l]))
  const conhecidos = new Set(porNome.keys())
  const mocks = linhas.filter((l) => l.tipo === 'mock')
  const somaTodos = mocks.reduce((s, l) => s + l.gz, 0)
  const raizWorker = linhas.find((l) => RAIZ_WORKER.test(l.f))?.f
  const raizProcesso = linhas.find((l) => RAIZ_PROCESSO.test(l.f))?.f
  const avisos = []
  if (!raizWorker)
    avisos.push('F9 aviso: raiz worker não encontrada; medindo pela soma (conservador)')
  if (!raizProcesso)
    avisos.push('F9 aviso: raiz processo não encontrada; medindo pela soma (conservador)')
  const falhaInicial =
    mocks.some((l) => iniciais.has(l.f)) ||
    linhas.some((l) => iniciais.has(l.f) && (RAIZ_WORKER.test(l.f) || RAIZ_PROCESSO.test(l.f))) ||
    [raizWorker, raizProcesso].some((r) => r !== undefined && iniciais.has(r))
  const base = { avisos, falhaInicial, somaTodos, worker: null, processo: null }
  if (avisos.length > 0) return { ...base, max: somaTodos, caminho: 'soma' }

  const fechos = {
    worker: fecho(raizWorker, conhecidos, lerCodigo),
    processo: fecho(raizProcesso, conhecidos, lerCodigo),
  }
  const emAlgum = new Set([...fechos.worker, ...fechos.processo])
  const orfaos = mocks.filter((l) => !emAlgum.has(l.f) && !iniciais.has(l.f)).map((l) => l.f)
  const montar = (nomes) => {
    const chunks = [...new Set([...nomes, ...orfaos])].filter((n) => !iniciais.has(n))
    const soma = chunks.reduce((s, n) => s + porNome.get(n).gz, 0)
    const rotulos = chunks.map((n) => {
      const tipo = porNome.get(n).tipo
      return tipo === 'mock' ? n : `${n} (${tipo})`
    })
    return { chunks: rotulos, soma }
  }
  const worker = montar(fechos.worker)
  const processo = montar(fechos.processo)
  const caminho = worker.soma >= processo.soma ? 'worker' : 'processo'
  return { ...base, worker, processo, max: Math.max(worker.soma, processo.soma), caminho }
}
