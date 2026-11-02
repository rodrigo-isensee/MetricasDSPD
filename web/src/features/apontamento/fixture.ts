import { MINIMO_AMOSTRA, type Taxa } from '@metricas-dspd/contratos'
import { PESSOA_OUTRA_AREA } from './types'
import type {
  CapacidadeApontamento,
  ConsultaApontamento,
  DiarioApontamento,
  FaixaDiario,
  FlagQualidade,
  FonteApontamento,
  LinhaDistribuicao,
  MatrizApontamento,
  NivelMatriz,
  Opcao,
  PctComPiso,
  PessoaApontamento,
  QualidadePorFlag,
  RespostaApontamento,
} from './types'

/**
 * Fixture tipada do contrato v1 (§3.9) com pessoas fictícias; hoje só os testes a usam (a aba lê a rota real, `api.ts`).
 * Os números abaixo fazem o papel do servidor: o front nunca os recalcula. Nada aqui é dado real.
 */

const H = 3600
const horas = (h: number): number => Math.round(h * H)

/** `parte` ÷ `total` em %, publicado só com `n` (base do percentual, em apontamentos) de 20 ou mais. */
const pctPiso = (total: number, parte: number, n: number): PctComPiso =>
  n >= MINIMO_AMOSTRA
    ? { status: 'ok', n, pct: (parte / total) * 100 }
    : { status: 'insuficiente', n, minimo: MINIMO_AMOSTRA }

const taxa = (k: number, n: number): Taxa =>
  n >= MINIMO_AMOSTRA
    ? { status: 'ok', k, n, pct: (k / n) * 100 }
    : { status: 'insuficiente', k, n, minimo: MINIMO_AMOSTRA }

interface PessoaBase {
  ref: string
  rotulo: string
  identificada: boolean
  apontamentos: number
  horas: number
  completos: number
  inicio: string
  diasUteis: number
}

/** Ordem alfabética do rótulo (o1); "Pessoa não identificada" fecha a lista (sem de-para). */
const PESSOAS: readonly PessoaBase[] = [
  {
    ref: 'p1',
    rotulo: 'Pessoa 1',
    identificada: true,
    apontamentos: 96,
    horas: 152,
    completos: 74,
    inicio: '2026-08-03',
    diasUteis: 63,
  },
  {
    ref: 'p2',
    rotulo: 'Pessoa 2',
    identificada: true,
    apontamentos: 88,
    horas: 141.5,
    completos: 66,
    inicio: '2026-08-03',
    diasUteis: 63,
  },
  {
    ref: 'p3',
    rotulo: 'Pessoa 3',
    identificada: true,
    apontamentos: 74,
    horas: 118,
    completos: 55,
    inicio: '2026-08-03',
    diasUteis: 63,
  },
  {
    ref: 'p4',
    rotulo: 'Pessoa 4',
    identificada: true,
    apontamentos: 61,
    horas: 97.5,
    completos: 47,
    inicio: '2026-08-10',
    diasUteis: 58,
  },
  {
    ref: 'p5',
    rotulo: 'Pessoa 5',
    identificada: true,
    apontamentos: 52,
    horas: 86,
    completos: 41,
    inicio: '2026-08-17',
    diasUteis: 53,
  },
  {
    ref: 'p6',
    rotulo: 'Pessoa 6',
    identificada: true,
    apontamentos: 33,
    horas: 52.5,
    completos: 24,
    inicio: '2026-09-14',
    diasUteis: 35,
  },
  {
    ref: 'p7',
    rotulo: 'Pessoa 7',
    identificada: true,
    apontamentos: 12,
    horas: 19,
    completos: 9,
    inicio: '2026-10-05',
    diasUteis: 20,
  },
  {
    ref: 'p8',
    rotulo: 'Pessoa não identificada',
    identificada: false,
    apontamentos: 5,
    horas: 7,
    completos: 3,
    inicio: '2026-10-19',
    diasUteis: 10,
  },
]

const TOTAL_AP = PESSOAS.reduce((s, p) => s + p.apontamentos, 0)
const TOTAL_H = PESSOAS.reduce((s, p) => s + p.horas, 0)
const TOTAL_COMPLETOS = PESSOAS.reduce((s, p) => s + p.completos, 0)

const linha = (
  id: string,
  rotulo: string,
  h: number,
  ap: number,
  extra: { foraDoEscopo?: boolean } = {},
): LinhaDistribuicao => ({
  id,
  rotulo,
  segundos: horas(h),
  apontamentos: ap,
  participacao: pctPiso(TOTAL_H, h, ap),
  ...extra,
})

const FLAGS_GERAL: readonly [FlagQualidade, number][] = [
  ['sem-comentario', 84],
  ['generico', 41],
  ['sem-vinculo', 33],
  ['sem-iniciativa', 62],
  ['valor-atipico', 2],
]

const porFlag = (base: number, fator: number): QualidadePorFlag[] =>
  FLAGS_GERAL.map(([flag, n]) => {
    const ap = Math.round((n * fator) / TOTAL_AP)
    return { flag, apontamentos: ap, pct: pctPiso(base, ap, base) }
  })

const COLUNAS: Record<NivelMatriz, readonly (Opcao & { peso: number })[]> = {
  tipo: [
    { id: '3', rotulo: 'Tarefa', peso: 5 },
    { id: '5', rotulo: 'Correção', peso: 3 },
    { id: '7', rotulo: 'Melhoria', peso: 2 },
  ],
  subtarefa: [
    { id: 'direto-no-card', rotulo: 'Direto no card', peso: 6 },
    { id: 'em-subtarefa', rotulo: 'Em subtarefa', peso: 4 },
  ],
  subgrupo: [
    { id: 'desenvolvimento', rotulo: 'Desenvolvimento', peso: 4 },
    { id: 'reuniao', rotulo: 'Reunião', peso: 2 },
    { id: 'analise', rotulo: 'Análise e especificação', peso: 2 },
    { id: 'teste', rotulo: 'Testes', peso: 1 },
    { id: 'suporte', rotulo: 'Suporte a usuários', peso: 1 },
    { id: 'nao-classificado', rotulo: 'Não classificado', peso: 1 },
  ],
}

export function matrizDoNivel(nivel: NivelMatriz): MatrizApontamento {
  const colunas = COLUNAS[nivel]
  const somaPesos = colunas.reduce((s, c) => s + c.peso, 0)
  return {
    nivel,
    colunas: colunas.map(({ id, rotulo }) => ({ id, rotulo })),
    linhas: PESSOAS.map((p) => {
      const total = horas(p.horas)
      let restante = total
      return {
        pessoaRef: p.ref,
        segundos: total,
        apontamentos: p.apontamentos,
        celulas: colunas.map((c, i) => {
          const s = i === colunas.length - 1 ? restante : Math.round((total * c.peso) / somaPesos)
          restante -= s
          return { colunaId: c.id, segundos: s, participacao: pctPiso(total, s, p.apontamentos) }
        }),
      }
    }),
  }
}

/** Faixa de uma célula com apontamento (dia sem apontamento não tem célula: o front o lê como faixa `zero`). */
const faixaDe = (segundos: number): FaixaDiario =>
  segundos <= 4 * H ? 'ate-4h' : segundos <= 8 * H ? '4h-a-8h' : 'mais-de-8h'

const LIMITE_ATIPICO = 16 * H

/** Quatro semanas de dias úteis (12/10 é feriado); fins de semana ficam sem célula. */
function diario(): DiarioApontamento {
  const dias: DiarioApontamento['dias'] = []
  for (let d = 5; d <= 30; d++) {
    const data = `2026-10-${String(d).padStart(2, '0')}`
    const dow = new Date(`${data}T00:00:00Z`).getUTCDay()
    const feriado = d === 12
    dias.push({ data, util: dow !== 0 && dow !== 6 && !feriado, feriado })
  }
  const linhas = PESSOAS.map((p, i) => {
    const celulas: DiarioApontamento['linhas'][number]['celulas'] = []
    dias.forEach((dia, j) => {
      if (!dia.util) return
      const h = (((i + 1) * 3 + j * 5) % 11) * 0.9
      if (h === 0) return
      const segundos =
        p.ref === 'p2' && dia.data === '2026-10-14' ? horas(17) : horas(Math.min(h, 9.5))
      celulas.push({
        data: dia.data,
        segundos,
        faixa: faixaDe(segundos),
        atipico: segundos > LIMITE_ATIPICO,
      })
    })
    return { pessoaRef: p.ref, segundos: celulas.reduce((s, c) => s + c.segundos, 0), celulas }
  })
  return {
    de: '2026-10-05',
    ate: '2026-10-30',
    limiteAtipicoSegundos: LIMITE_ATIPICO,
    dias,
    linhas,
  }
}

function capacidade(): CapacidadeApontamento {
  const mes = (m: string, real: number, ap: number, parcialAte: string | null) => ({
    mes: m,
    capacidadeSegundos: horas(1344),
    realizadoSegundos: horas(real),
    apontamentos: ap,
    utilizacao: pctPiso(1344, real, ap),
    parcialAte,
  })
  return {
    horasPorDiaSegundos: 8 * H,
    mensal: [
      mes('2026-08', 190, 118, null),
      mes('2026-09', 255, 160, null),
      mes('2026-10', 228.5, 143, '2026-10-30'),
    ],
    porPessoa: PESSOAS.map((p) => ({
      pessoaRef: p.ref,
      inicio: p.inicio,
      fim: '2026-10-30',
      diasUteis: p.diasUteis,
      capacidadeSegundos: horas(p.diasUteis * 8),
      realizadoSegundos: horas(p.horas),
      apontamentos: p.apontamentos,
      utilizacao: pctPiso(p.diasUteis * 8, p.horas, p.apontamentos),
    })),
    leituraRelativa: true,
  }
}

const pessoasOpcao: PessoaApontamento[] = PESSOAS.map((p) => ({
  pessoaRef: p.ref,
  rotulo: p.rotulo,
  identificada: p.identificada,
}))

export const RESPOSTA_FICTICIA: RespostaApontamento = {
  versaoContrato: 1,
  dominio: 'businessmap',
  periodo: { de: '2026-08-03', ate: '2026-10-30' },
  frescor: { selo: 'atual', ultimaColetaOk: '2026-10-30T06:10:00-03:00' },
  nomesReais: false,
  opcoes: {
    pessoas: pessoasOpcao,
    projetos: [
      { id: '1042', rotulo: 'Iniciativa Portal do Cliente', foraDoEscopo: false },
      { id: '1077', rotulo: 'Iniciativa Integração Financeira', foraDoEscopo: false },
      { id: '1103', rotulo: 'Iniciativa Migração de Relatórios', foraDoEscopo: false },
      { id: '1190', rotulo: 'Iniciativa Apoio ao Fiscal', foraDoEscopo: true },
      { id: '1201', rotulo: 'Iniciativa Piloto', foraDoEscopo: false },
      { id: '1250', rotulo: 'Iniciativa Estudo', foraDoEscopo: false },
    ],
    tipos: [
      { id: '3', rotulo: 'Tarefa' },
      { id: '5', rotulo: 'Correção' },
      { id: '7', rotulo: 'Melhoria' },
    ],
    subtarefas: [
      { id: 'direto-no-card', rotulo: 'Direto no card' },
      { id: 'em-subtarefa', rotulo: 'Em subtarefa' },
    ],
    subgrupos: COLUNAS.subgrupo.map(({ id, rotulo }) => ({ id, rotulo })),
    historico: { inicio: '2026-01-05', fim: '2026-10-30' },
  },
  kpis: {
    segundos: horas(TOTAL_H),
    apontamentos: TOTAL_AP,
    pessoasAtivas: PESSOAS.length,
    completos: taxa(TOTAL_COMPLETOS, TOTAL_AP),
    atipicos: 2,
  },
  distribuicao: {
    base: { n: TOTAL_AP, unidade: 'apontamentos' },
    porProjeto: [
      linha('1042', 'Iniciativa Portal do Cliente', 215, 128),
      linha('1077', 'Iniciativa Integração Financeira', 180, 119),
      linha('1103', 'Iniciativa Migração de Relatórios', 130, 84),
      linha('1190', 'Iniciativa Apoio ao Fiscal', 110, 62, { foraDoEscopo: true }),
      linha('1201', 'Iniciativa Piloto', 28, 19),
      linha('1250', 'Iniciativa Estudo', 10.5, 9),
    ],
    porTipo: [
      linha('3', 'Tarefa', 330, 205),
      linha('5', 'Correção', 210, 140),
      linha('7', 'Melhoria', 133.5, 76),
    ],
    porSubgrupo: [
      linha('desenvolvimento', 'Desenvolvimento', 300, 170),
      linha('analise', 'Análise e especificação', 110, 66),
      linha('reuniao', 'Reunião', 90, 80),
      linha('teste', 'Testes', 70, 45),
      linha('nao-classificado', 'Não classificado', 60, 29),
      linha('suporte', 'Suporte a usuários', 43.5, 31),
    ],
  },
  qualidade: {
    geral: { completos: taxa(TOTAL_COMPLETOS, TOTAL_AP), porFlag: porFlag(TOTAL_AP, TOTAL_AP) },
    porPessoa: PESSOAS.map((p) => ({
      pessoaRef: p.ref,
      apontamentos: p.apontamentos,
      completos: taxa(p.completos, p.apontamentos),
      porFlag: porFlag(p.apontamentos, p.apontamentos),
    })),
    flagsNaoExcludentes: true,
  },
  matriz: matrizDoNivel('tipo'),
  capacidade: capacidade(),
  diario: diario(),
  achados: [
    { codigo: 'nao-classificado-alto', valores: { pct: 9, n: 29 }, rotuloRef: null },
    { codigo: 'sem-comentario-alto', valores: { pct: 20, n: 84 }, rotuloRef: null },
    {
      codigo: 'concentracao-em-projeto',
      valores: { pct: 32 },
      rotuloRef: 'Iniciativa Portal do Cliente',
    },
    { codigo: 'dias-atipicos', valores: { n: 2, limite: 16 }, rotuloRef: null },
    {
      codigo: 'utilizacao-mensal-variou',
      valores: { pctAnterior: 14, pct: 19, mesAnterior: '2026-08', mes: '2026-09' },
      rotuloRef: null,
    },
  ],
  criterios: [
    { id: 'calendario-v1', data: '2026-08-20', descricao: 'Calendário com feriados nacionais' },
    { id: 'dicionario-v2', data: '2026-09-15', descricao: 'Dicionário de subgrupos, revisão 2' },
  ],
}

/** Recorte sem nenhum apontamento (CA-2): 200 com listas vazias e `kpis.apontamentos = 0`. */
export function respostaVazia(base: RespostaApontamento = RESPOSTA_FICTICIA): RespostaApontamento {
  return {
    ...base,
    kpis: {
      ...base.kpis,
      segundos: 0,
      apontamentos: 0,
      pessoasAtivas: 0,
      completos: taxa(0, 0),
      atipicos: 0,
    },
    distribuicao: {
      base: { n: 0, unidade: 'apontamentos' },
      porProjeto: [],
      porTipo: [],
      porSubgrupo: [],
    },
    qualidade: { ...base.qualidade, geral: { completos: taxa(0, 0), porFlag: [] }, porPessoa: [] },
    matriz: { ...base.matriz, linhas: [] },
    capacidade: { ...base.capacidade, mensal: [], porPessoa: [] },
    diario: { ...base.diario, linhas: [] },
    achados: [],
  }
}

const insuf = (n: number): PctComPiso => ({ status: 'insuficiente', n, minimo: MINIMO_AMOSTRA })

/** Recorte de 1 a 19 apontamentos (CA-3): soma e contagem ficam; percentual e utilização viram amostra insuficiente. */
export function respostaInsuficiente(
  base: RespostaApontamento = RESPOSTA_FICTICIA,
): RespostaApontamento {
  const n = 12
  const pessoas = base.opcoes.pessoas.slice(0, 3)
  const refs = new Set(pessoas.map((p) => p.pessoaRef))
  const linhasInsuf = (ls: LinhaDistribuicao[]) =>
    ls.slice(0, 3).map((l) => ({ ...l, apontamentos: 4, participacao: insuf(n) }))
  return {
    ...base,
    opcoes: { ...base.opcoes, pessoas },
    kpis: {
      segundos: horas(19.5),
      apontamentos: n,
      pessoasAtivas: 3,
      completos: { status: 'insuficiente', k: 9, n, minimo: MINIMO_AMOSTRA },
      atipicos: 0,
    },
    distribuicao: {
      base: { n, unidade: 'apontamentos' },
      porProjeto: linhasInsuf(base.distribuicao.porProjeto),
      porTipo: linhasInsuf(base.distribuicao.porTipo),
      porSubgrupo: linhasInsuf(base.distribuicao.porSubgrupo),
    },
    qualidade: {
      ...base.qualidade,
      geral: {
        completos: { status: 'insuficiente', k: 9, n, minimo: MINIMO_AMOSTRA },
        porFlag: base.qualidade.geral.porFlag.map((f) => ({
          ...f,
          apontamentos: 2,
          pct: insuf(n),
        })),
      },
      porPessoa: base.qualidade.porPessoa
        .filter((p) => refs.has(p.pessoaRef))
        .map((p) => ({
          ...p,
          apontamentos: 4,
          completos: { status: 'insuficiente', k: 3, n: 4, minimo: MINIMO_AMOSTRA },
          porFlag: p.porFlag.map((f) => ({ ...f, apontamentos: 1, pct: insuf(4) })),
        })),
    },
    matriz: {
      ...base.matriz,
      linhas: base.matriz.linhas
        .filter((l) => refs.has(l.pessoaRef))
        .map((l) => ({
          ...l,
          apontamentos: 4,
          celulas: l.celulas.map((c) => ({ ...c, participacao: insuf(4) })),
        })),
    },
    capacidade: {
      ...base.capacidade,
      mensal: base.capacidade.mensal.map((m) => ({ ...m, apontamentos: 4, utilizacao: insuf(4) })),
      porPessoa: base.capacidade.porPessoa
        .filter((p) => refs.has(p.pessoaRef))
        .map((p) => ({ ...p, apontamentos: 4, utilizacao: insuf(4) })),
    },
    diario: { ...base.diario, linhas: base.diario.linhas.filter((l) => refs.has(l.pessoaRef)) },
    achados: [],
  }
}

/** Última coleta há mais de um dia: o selo vira "Atrasado" e o dado velho continua na tela. */
export function respostaDefasada(
  base: RespostaApontamento = RESPOSTA_FICTICIA,
): RespostaApontamento {
  return { ...base, frescor: { selo: 'atrasado', ultimaColetaOk: '2026-10-28T06:10:00-03:00' } }
}

/** Ambiente com `APONTAMENTO_NOMES` ligado: rótulos de nome e o aviso de nome real. Nomes claramente fictícios. */
export function respostaComNomesReais(
  base: RespostaApontamento = RESPOSTA_FICTICIA,
): RespostaApontamento {
  const nomes: Record<string, string> = {
    p1: 'Ana Exemplo',
    p2: 'Bruno Exemplo',
    p3: 'Carla Exemplo',
    p4: 'Diego Exemplo',
    p5: 'Elisa Exemplo',
    p6: 'Fábio Exemplo',
    p7: 'Gabriela Exemplo',
  }
  return {
    ...base,
    nomesReais: true,
    opcoes: {
      ...base.opcoes,
      pessoas: base.opcoes.pessoas.map((p) => ({ ...p, rotulo: nomes[p.pessoaRef] ?? p.rotulo })),
    },
  }
}

/**
 * Resposta com a entrada "Outra área" (decisão do dono, 2026-11-02): quem não é do time vem somado numa linha só, com a
 * chave fixa `outra-area`, sempre por último, sem nome mesmo com `nomesReais` ligado. As linhas copiam as de `p7`.
 */
export function respostaComOutraArea(
  base: RespostaApontamento = RESPOSTA_FICTICIA,
): RespostaApontamento {
  const deOutra = <T extends { pessoaRef: string }>(ls: T[]): T[] => {
    const modelo = ls.find((l) => l.pessoaRef === 'p7')
    return modelo ? [...ls, { ...modelo, pessoaRef: PESSOA_OUTRA_AREA }] : ls
  }
  return {
    ...base,
    opcoes: {
      ...base.opcoes,
      pessoas: [
        ...base.opcoes.pessoas,
        { pessoaRef: PESSOA_OUTRA_AREA, rotulo: 'Outra área', identificada: true },
      ],
    },
    qualidade: { ...base.qualidade, porPessoa: deOutra(base.qualidade.porPessoa) },
    matriz: { ...base.matriz, linhas: deOutra(base.matriz.linhas) },
    capacidade: { ...base.capacidade, porPessoa: deOutra(base.capacidade.porPessoa) },
    diario: { ...base.diario, linhas: deOutra(base.diario.linhas) },
  }
}

/**
 * Fonte fictícia: aplica só o filtro de pessoa (os blocos por pessoa e o mapa diário) e a escolha do nível da
 * matriz. Filtro cujo valor não existe nas opções devolve o recorte vazio. A agregação de verdade é do servidor.
 */
export function respostaFicticia(
  consulta: ConsultaApontamento,
  base: RespostaApontamento = RESPOSTA_FICTICIA,
): RespostaApontamento {
  const o = base.opcoes
  const existe = (ids: string[] | undefined, lista: readonly { id: string }[]) =>
    !ids || ids.every((id) => lista.some((x) => x.id === id))
  const valido =
    existe(
      consulta.pessoa,
      o.pessoas.map((p) => ({ id: p.pessoaRef })),
    ) &&
    existe(consulta.projeto, o.projetos) &&
    existe(consulta.tipo, o.tipos) &&
    existe(consulta.subtarefa, o.subtarefas) &&
    existe(consulta.subgrupo, o.subgrupos)
  const periodo =
    consulta.de && consulta.ate ? { de: consulta.de, ate: consulta.ate } : base.periodo
  if (!valido) return { ...respostaVazia(base), periodo }
  const resposta: RespostaApontamento = {
    ...base,
    periodo,
    matriz: consulta.nivelMatriz === 'tipo' ? base.matriz : matrizDoNivel(consulta.nivelMatriz),
  }
  if (!consulta.pessoa) return resposta
  const refs = new Set(consulta.pessoa)
  const doRecorte = <T extends { pessoaRef: string }>(ls: T[]): T[] =>
    ls.filter((l) => refs.has(l.pessoaRef))
  return {
    ...resposta,
    qualidade: { ...resposta.qualidade, porPessoa: doRecorte(resposta.qualidade.porPessoa) },
    matriz: { ...resposta.matriz, linhas: doRecorte(resposta.matriz.linhas) },
    capacidade: { ...resposta.capacidade, porPessoa: doRecorte(resposta.capacidade.porPessoa) },
    diario: { ...resposta.diario, linhas: doRecorte(resposta.diario.linhas) },
  }
}

export const fonteFicticia: FonteApontamento = {
  buscar: (consulta) => Promise.resolve(respostaFicticia(consulta)),
  filtroTipoDisponivel: () => Promise.resolve(true),
}
