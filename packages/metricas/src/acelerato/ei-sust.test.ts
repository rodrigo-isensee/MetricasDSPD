import { describe, expect, it } from 'vitest'
import { CALENDARIO_PADRAO, instanteDeIso } from '../core/calendario'
import {
  ALVOS_PADRAO,
  calcularEIAcelerato,
  criarContextoAC,
  type BaseAC,
  type Chamado,
  type EtapaChamado,
} from './index'
import { classeDaEtapaEI } from './totalizadores'

// Pedido 105, E7.243: EI_SUST pelo tempo por etapa (P-EI-1 B, P-EI-2 A, P-EI-3). Dados fictícios, nomes de etapa do domínio real.
const HOJE = '2026-10-09T18:00:00-03:00'
const t = (iso: string) => instanteDeIso(iso, CALENDARIO_PADRAO)
const F = { equipe: [], prioridade: [], periodo: { tipo: '12s' as const } }

function chamado(i: number, prioridade: Chamado['prioridade'], etapas: [string, number][]) {
  const id = `E${i}`
  const c = {
    chamado_id: id,
    organizacao: 'DSPD Sustentação',
    tipo_fila: 'DSPD - SSSC',
    equipe: 'SSSC TOTVS',
    natureza: 'incidente',
    categoria_sistema: 'Protheus - Financeiro',
    excluido: false,
    status: 'Concluído',
    prioridade,
    aberto_em: t('2026-09-14T09:00-03:00'),
    primeiro_atendimento_em: null,
    restaurado_em: null,
    data_finalizado: t('2026-09-14T17:00-03:00'),
    excecao_sla_registro_posterior: false,
  } as unknown as Chamado
  let hora = 9
  const e: EtapaChamado[] = etapas.map(([etapa, h]) => {
    const a = hora
    hora += h
    const hh = (n: number) => `${String(n).padStart(2, '0')}:00`
    return {
      chamado_id: id,
      etapa: etapa as EtapaChamado['etapa'],
      entrada: t(`2026-09-14T${hh(a)}-03:00`),
      saida: t(`2026-09-14T${hh(hora)}-03:00`),
      motivo_pendencia: null,
    }
  })
  return { c, e }
}

const ETAPAS: [string, number][] = [
  ['Novo', 1],
  ['Em Análise', 1],
  ['Aguardando Equipe Interna', 1],
  ['Aguardando Fornecedor', 2], // 12h a 14h: a hora do almoço não conta, vale 1 h útil
  ['Concluído', 2],
]

const ctxDe = (xs: { c: Chamado; e: EtapaChamado[] }[]) => {
  const base: BaseAC = {
    chamados: xs.map((x) => x.c),
    etapas: xs.flatMap((x) => x.e),
    config: { alvos: ALVOS_PADRAO, criterios: [] },
  }
  return criarContextoAC(base, HOJE, CALENDARIO_PADRAO)
}

describe('EI_SUST pelo tempo por etapa (pedido 105, E7.243)', () => {
  it('cliente = etapas sem as finais; time = cliente menos esperas da D5a e fila inicial; contagens na composição', () => {
    const r = calcularEIAcelerato(
      ctxDe(Array.from({ length: 22 }, (_, i) => chamado(i, 'P3', ETAPAS))),
      F,
    )
    const p3 = r.segmentos.find((s) => s.chave === 'p3')
    expect(p3?.n).toBe(22)
    expect(p3?.estatistica.status).toBe('ok')
    if (p3?.estatistica.status === 'ok') {
      expect(p3.estatistica.valor.cliente).toBeCloseTo(4, 6)
      expect(p3.estatistica.valor.time).toBeCloseTo(2, 6)
      expect(p3.estatistica.valor.indicePct).toBeCloseTo(50, 6)
    }
    expect(r.composicao).toEqual({
      chamados: 22,
      semEtapas: 0,
      filaInicial: { chamados: 22, horasUteis: 22 },
      finais: { chamados: 22, horasUteis: 44 },
      naoDecididas: {
        chamados: 22,
        horasUteis: 22,
        etapas: [{ etapa: 'Aguardando Equipe Interna', chamados: 22, horasUteis: 22 }],
      },
    })
    expect(r.fonte).toBe('Acelerato')
    expect(r.criterios).toBeDefined()
  })

  it('abaixo de 20 chamados na prioridade não publica, mas a composição conta todos', () => {
    const xs = [
      ...Array.from({ length: 20 }, (_, i) => chamado(i, 'P3', ETAPAS)),
      ...Array.from({ length: 12 }, (_, i) => chamado(100 + i, 'P2', ETAPAS)),
    ]
    const r = calcularEIAcelerato(ctxDe(xs), F)
    expect(r.segmentos.find((s) => s.chave === 'p2')?.estatistica.status).toBe('insuficiente')
    expect(r.segmentos.find((s) => s.chave === 'p3')?.estatistica.status).toBe('ok')
    expect(r.composicao?.chamados).toBe(32)
  })

  it('chamado fechado sem tempo por etapa fica fora da estatística e é contado, nunca zero em silêncio', () => {
    const xs = [
      ...Array.from({ length: 20 }, (_, i) => chamado(i, 'P3', ETAPAS)),
      chamado(500, 'P3', []),
      chamado(501, 'P3', [['Concluído', 2]]),
    ]
    const r = calcularEIAcelerato(ctxDe(xs), F)
    expect(r.segmentos.find((s) => s.chave === 'p3')?.n).toBe(20)
    expect(r.composicao?.semEtapas).toBe(2)
  })

  it('etapas não decididas diferentes entre chamados: cada uma com os seus chamados e horas, em ordem estável', () => {
    const xs = [
      ...Array.from({ length: 20 }, (_, i) => chamado(i, 'P3', ETAPAS)),
      chamado(300, 'P3', [
        ['Em Análise', 1],
        ['Data Acordada', 1],
        ['Concluído', 1],
      ]),
      chamado(301, 'P3', [
        ['Em Análise', 1],
        ['Data Acordada', 1],
        ['Concluído', 1],
      ]),
    ]
    const r = calcularEIAcelerato(ctxDe(xs), F)
    expect(r.composicao?.naoDecididas).toEqual({
      chamados: 22,
      horasUteis: 22,
      etapas: [
        { etapa: 'Aguardando Equipe Interna', chamados: 20, horasUteis: 20 },
        { etapa: 'Data Acordada', chamados: 2, horasUteis: 2 },
      ],
    })
  })

  it('classe da etapa: sem diferença de caixa; Pendente e esperas da D5a; fila inicial; não decididas; finais; o resto é do time', () => {
    expect(classeDaEtapaEI('AGUARDANDO SOLICITANTE')).toBe('espera')
    expect(classeDaEtapaEI('Pendente')).toBe('espera')
    expect(classeDaEtapaEI('Aguardando Suporte Terceiros')).toBe('espera')
    expect(classeDaEtapaEI('Aguardando Janela de Mudança (Deploy Produção)')).toBe('espera')
    expect(classeDaEtapaEI('Aguardando Validação')).toBe('espera')
    expect(classeDaEtapaEI(' novo atendimento ')).toBe('fila-inicial')
    expect(classeDaEtapaEI('Em triagem')).toBe('fila-inicial')
    expect(classeDaEtapaEI('Aguardando Atribuição')).toBe('fila-inicial')
    expect(classeDaEtapaEI('Aguardando Aprovação')).toBe('nao-decidida')
    expect(classeDaEtapaEI('Data Acordada')).toBe('nao-decidida')
    expect(classeDaEtapaEI('Causa Raiz')).toBe('final')
    expect(classeDaEtapaEI('Revisão')).toBe('final')
    expect(classeDaEtapaEI('Em Andamento')).toBe('time')
  })
})
