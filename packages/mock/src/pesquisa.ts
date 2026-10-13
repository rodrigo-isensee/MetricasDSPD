import type { LinhaPesquisa } from '@metricas-dspd/contratos'
import type { BasePesquisa, CargaPesquisa } from '@metricas-dspd/metricas/pesquisa'
import type { ConfigMock } from './config'
import { inteiro, uniforme } from './distribuicoes'
import { derivar, type Prng } from './prng'

/**
 * Pesquisa trimestral de percepção (PV1), dados FICTÍCIOS. Função pura de `config` (só a semente), com
 * stream próprio de PRNG: não recebe nem consome a base de BusinessMap/Acelerato, logo os hashes delas
 * não mudam. A data de corte ("hoje") é aplicada pelo cálculo (carga recebida depois do corte não conta).
 * Plano lacuna-de-valor, seção 4: o cenário é fixo e exercita cada regra de publicação.
 */

const AREAS = [
  ['atendimento', 'Atendimento'],
  ['comercial', 'Comercial'],
  ['financeiro', 'Financeiro'],
  ['juridico', 'Jurídico'],
  ['logistica', 'Logística'],
  ['marketing', 'Marketing'],
  ['operacoes', 'Operações'],
  ['suprimentos', 'Suprimentos'],
] as const

// As 5 perguntas da decisão 22 (D-1), escala de 5 pontos. O texto de `informado` muda na v2 (marca T2.6).
const PERGUNTAS_V1 = [
  ['resolve', 'A sustentação resolve o que a minha área precisa.'],
  ['prazo', 'O prazo de atendimento é adequado à criticidade para a minha área.'],
  ['informado', 'Sou informado sobre o andamento dos meus pedidos.'],
  ['nao_volta', 'O problema não volta depois de resolvido.'],
  ['confianca', 'Confio na sustentação para o que é crítico.'],
] as const

interface Ciclo {
  trimestre: string
  recebidaEm: string
  versaoId: string
  /** Respondentes por área (o tamanho de cada grupo; a área que recebe cada tamanho é sorteada). */
  tamanhos: readonly number[]
  oQueMudou: string
  cargaId: number
  /** Reenvio: a carga anterior do mesmo trimestre fica guardada. */
  substituida?: { cargaId: number; recebidaEm: string; tamanhos: readonly number[] }
}

// Totais fixados (9, 11, 4, 14, 19, 24); o PRNG sorteia a área de cada tamanho e as contagens por faixa.
const CICLOS: readonly Ciclo[] = [
  {
    trimestre: '2025-T2',
    recebidaEm: '2025-07-10',
    versaoId: 'q-v1',
    tamanhos: [3, 2, 2, 1, 1],
    oQueMudou: 'Primeiro ciclo da pesquisa; combinamos o painel de acompanhamento com as áreas.',
    cargaId: 1,
  },
  {
    trimestre: '2025-T3',
    recebidaEm: '2025-10-08',
    versaoId: 'q-v1',
    tamanhos: [4, 3, 2, 1, 1],
    oQueMudou: 'Revisamos o aviso de andamento dos pedidos abertos.',
    cargaId: 2,
  },
  {
    trimestre: '2025-T4',
    recebidaEm: '2026-01-12',
    versaoId: 'q-v1',
    tamanhos: [2, 1, 1],
    oQueMudou: 'Sem mudanças no trimestre.',
    cargaId: 3,
  },
  {
    trimestre: '2026-T1',
    recebidaEm: '2026-04-09',
    versaoId: 'q-v1',
    tamanhos: [4, 3, 3, 3, 1],
    oQueMudou: 'Passamos a registrar a prioridade combinada na abertura do pedido.',
    cargaId: 4,
  },
  {
    trimestre: '2026-T2',
    recebidaEm: '2026-07-20',
    versaoId: 'q-v2',
    tamanhos: [5, 4, 3, 3, 2, 1, 1],
    oQueMudou: 'Ajustamos o texto da pergunta sobre informação e o ritmo dos avisos.',
    cargaId: 6,
    substituida: { cargaId: 5, recebidaEm: '2026-07-08', tamanhos: [5, 4, 3, 2, 2, 1] },
  },
  {
    trimestre: '2026-T3',
    recebidaEm: '2026-10-06',
    versaoId: 'q-v2',
    tamanhos: [5, 4, 4, 3, 3, 2, 2, 1],
    oQueMudou: 'Publicamos a agenda de manutenção com antecedência.',
    cargaId: 7,
  },
]

/** Sorteia as 5 faixas de `n` respostas, com viés para o lado positivo (Concordo). */
function distribuir(rng: Prng, n: number): [number, number, number, number, number] {
  const f: [number, number, number, number, number] = [0, 0, 0, 0, 0]
  const pesos = [0.05, 0.1, 0.2, 0.4, 0.25]
  for (let i = 0; i < n; i++) {
    let x = rng()
    let k = 0
    while (k < 4 && x >= (pesos[k] as number)) {
      x -= pesos[k] as number
      k++
    }
    f[k] = (f[k] as number) + 1
  }
  return f
}

function embaralhar<T>(rng: Prng, xs: readonly T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = inteiro(rng, 0, i)
    ;[a[i], a[j]] = [a[j] as T, a[i] as T]
  }
  return a
}

function linhasDe(
  rng: Prng,
  trimestre: string,
  tamanhos: readonly number[],
  perguntas: readonly string[],
) {
  const areas = embaralhar(rng, AREAS).slice(0, tamanhos.length)
  const linhas: LinhaPesquisa[] = []
  tamanhos.forEach((n, i) => {
    const area = areas[i] as (typeof AREAS)[number]
    // Convidados com taxa de resposta de 60% a 85%, nunca menos que os respondentes.
    const convidados = Math.max(n, Math.ceil(n / uniforme(rng, 0.6, 0.85)))
    for (const pergunta of perguntas) {
      const [f1, f2, f3, f4, f5] = distribuir(rng, n)
      linhas.push({ trimestre, area: area[0], pergunta, f1, f2, f3, f4, f5, convidados })
    }
  })
  return linhas
}

export function gerarPesquisaMock(config: ConfigMock): BasePesquisa {
  const rng = derivar(config.semente, 'pesquisa')
  const v1 = PERGUNTAS_V1.map(([codigo, texto], i) => ({ codigo, ordem: i + 1, texto }))
  const v2 = v1.map((p) =>
    p.codigo === 'informado'
      ? { ...p, texto: 'Recebo avisos claros e no tempo certo sobre o andamento dos meus pedidos.' }
      : p,
  )
  const codigos = v1.map((p) => p.codigo)
  const cargas: CargaPesquisa[] = []
  for (const c of CICLOS) {
    const base = { trimestre: c.trimestre, versaoId: c.versaoId }
    if (c.substituida)
      cargas.push({
        ...base,
        cargaId: c.substituida.cargaId,
        recebidaEm: c.substituida.recebidaEm,
        oQueMudou: null,
        linhas: linhasDe(rng, c.trimestre, c.substituida.tamanhos, codigos),
      })
    cargas.push({
      ...base,
      cargaId: c.cargaId,
      recebidaEm: c.recebidaEm,
      oQueMudou: c.oQueMudou,
      linhas: linhasDe(rng, c.trimestre, c.tamanhos, codigos),
    })
  }
  return {
    areas: AREAS.map(([codigo, rotulo]) => ({ codigo, rotulo })),
    versoes: [
      { id: 'q-v1', vigenteDesde: '2025-04-01', perguntas: v1 },
      { id: 'q-v2', vigenteDesde: '2026-04-01', perguntas: v2 },
    ],
    cargas,
    criterios: [
      {
        id: 'pesquisa-q-v2',
        data: '2026-04-01',
        descricao: 'Questionário v2: texto da pergunta sobre informação ajustado.',
        afeta: ['PV1'],
      },
    ],
  }
}
