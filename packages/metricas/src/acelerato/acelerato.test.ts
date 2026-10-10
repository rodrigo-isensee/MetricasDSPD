import { describe, expect, it } from 'vitest'
import { CALENDARIO_PADRAO } from '../core/calendario'
import { instanteDeIso } from '../core/calendario'
import {
  calcularEIAcelerato,
  calcularS1,
  calcularS2,
  calcularS4,
  calcularS5,
  calcularS7,
  criarContextoAC,
  ALVOS_PADRAO,
  type BaseAC,
  type Chamado,
  type EtapaChamado,
} from './index'
import { noIntervalo } from './comum'
import { totalizadorDaEtapa } from './totalizadores'

const HOJE = '2026-10-09T18:00:00-03:00'
const t = instanteDeIso
const F = { equipe: [], prioridade: [], periodo: { tipo: '12s' as const } }

function chamado(i: number, extra: Partial<Chamado> = {}): { c: Chamado; e: EtapaChamado[] } {
  const id = `T${i}`
  const aberto = t('2026-09-14T09:00-03:00', CALENDARIO_PADRAO)
  const c: Chamado = {
    chamado_id: id,
    organizacao: 'DSPD Sustentação',
    tipo_fila: 'DSPD - SSSC',
    equipe: 'SSSC TOTVS',
    natureza: 'incidente',
    categoria_sistema: 'Protheus - Financeiro',
    excluido: false,
    status: 'Concluído',
    impacto: 'Alto',
    urgencia: 'Baixa',
    prioridade: 'P3',
    prioridade_ajustada_manualmente: false,
    justificativa_ajuste: null,
    aberto_em: aberto,
    primeiro_atendimento_em: t('2026-09-14T09:30-03:00', CALENDARIO_PADRAO),
    restaurado_em: t('2026-09-15T17:00-03:00', CALENDARIO_PADRAO),
    data_finalizado: t('2026-09-15T17:00-03:00', CALENDARIO_PADRAO),
    status_sla_r: 'REALIZADO_NO_PRAZO',
    status_sla_pa: 'NO_PRAZO',
    motivo_escalacao: null,
    motivo_pendencia_atual: null,
    previsao_retorno: null,
    motivo_encerramento: 'Resolução definitiva',
    avaliacao_problema: null,
    excecao_sla_registro_posterior: false,
    incidente_critico_coordenado: false,
    nivel_resolucao: 'N1',
    ...extra,
  }
  const e = (
    etapa: EtapaChamado['etapa'],
    a: string,
    z: string | null,
    motivo: EtapaChamado['motivo_pendencia'] = null,
  ): EtapaChamado => ({
    chamado_id: id,
    etapa,
    entrada: t(a, CALENDARIO_PADRAO),
    saida: z ? t(z, CALENDARIO_PADRAO) : null,
    motivo_pendencia: motivo,
  })
  return {
    c,
    e: [
      e('Novo', '2026-09-14T09:00-03:00', '2026-09-14T09:30-03:00'),
      e('Em atendimento N1', '2026-09-14T09:30-03:00', '2026-09-14T12:00-03:00'),
      e('Pendente', '2026-09-14T12:00-03:00', '2026-09-15T09:00-03:00', 'Aguardando solicitante'),
      e('Em atendimento N1', '2026-09-15T09:00-03:00', '2026-09-15T16:00-03:00'),
      e('Aguardando validação', '2026-09-15T16:00-03:00', '2026-09-15T17:00-03:00'),
      e('Encerrado', '2026-09-15T17:00-03:00', null),
    ],
  }
}
const baseDe = (n: number, ajuste?: (i: number) => Partial<Chamado>): BaseAC => {
  const xs = Array.from({ length: n }, (_, i) => chamado(i, ajuste?.(i)))
  return {
    chamados: xs.map((x) => x.c),
    etapas: xs.flatMap((x) => x.e),
    config: { alvos: ALVOS_PADRAO, criterios: [] },
  }
}

describe('Acelerato', () => {
  it('S5 (F2): a base é todo chamado escalado e o sem motivo vira "Não informado"', () => {
    const ctx = criarContextoAC(
      baseDe(24, (i) => ({
        nivel_resolucao: i < 20 ? 'N2' : i < 22 ? 'Fornecedor' : 'N1',
        motivo_escalacao: i < 18 ? 'Sem conhecimento técnico no N1' : null,
      })),
      HOJE,
      CALENDARIO_PADRAO,
    )
    const r = calcularS5(ctx, F)
    expect(r.base.n).toBe(22)
    expect(r.naoInformado).toBe(4)
    expect(r.motivos.reduce((a, m) => a + m.n, 0)).toBe(18)
  })

  it('S1 desconta as pendências do relógio de resolução e mede em horas úteis', () => {
    const ctx = criarContextoAC(baseDe(25), HOJE, CALENDARIO_PADRAO)
    const r = calcularS1(ctx, F)
    const p3 = r.prioridades.find((p) => p.prioridade === 'P3')
    expect(p3?.restauracao.estatistica.status).toBe('ok')
    // 14/09 09:00 -> 15/09 17:00 = 15 h úteis; pausas: 5 h (pendente) + 1 h (validação); relógio = 9 h
    if (p3?.restauracao.estatistica.status === 'ok')
      expect(p3.restauracao.estatistica.valor.p50).toBeCloseTo(9, 6)
    if (p3?.primeiroAtendimento.estatistica.status === 'ok')
      expect(p3.primeiroAtendimento.estatistica.valor.p50).toBeCloseTo(0.5, 6)
  })

  it('exceções de registro posterior ficam fora e a prioridade com menos de 20 chamados é insuficiente (nunca agregada)', () => {
    const ctx = criarContextoAC(
      baseDe(25, (i) => ({ excecao_sla_registro_posterior: i < 6 })),
      HOJE,
      CALENDARIO_PADRAO,
    )
    const r = calcularS1(ctx, F)
    expect(r.excecoesForaDaApuracao).toBe(6)
    const p3 = r.prioridades.find((p) => p.prioridade === 'P3')
    expect(p3?.restauracao.n).toBe(19)
    expect(p3?.restauracao.estatistica.status).toBe('insuficiente')
    expect(r.prioridades.map((p) => p.prioridade)).toEqual(['P1', 'P2', 'P3', 'P4', 'P5'])
  })

  it('S2 separa primeiro atendimento de restauração e mostra k de n abaixo de 20', () => {
    const ctx = criarContextoAC(
      baseDe(22, (i) => ({
        status_sla_r: i < 4 ? 'REALIZADO_APOS_VENCIMENTO' : 'REALIZADO_NO_PRAZO',
      })),
      HOJE,
      CALENDARIO_PADRAO,
    )
    const p3 = calcularS2(ctx, F).prioridades.find((p) => p.prioridade === 'P3')
    expect(p3?.restauracao.taxa).toMatchObject({ status: 'ok', k: 18, n: 22 })
    expect(p3?.restauracao.statusMeta).toBe('fora') // 81,8% < 90%
    expect(p3?.primeiroAtendimento.taxa).toMatchObject({ k: 22, n: 22 })
    expect(
      calcularS2(ctx, F).prioridades.find((p) => p.prioridade === 'P1')?.restauracao.taxa.status,
    ).toBe('insuficiente')
  })

  it('S7 mantém ajuste de prioridade e reclassificação de tipo em blocos separados', () => {
    const ctx = criarContextoAC(
      baseDe(22, (i) => ({
        prioridade_ajustada_manualmente: i < 3,
        justificativa_ajuste: i < 2 ? 'x' : null,
        motivo_encerramento: i >= 20 ? 'Reclassificado, não é incidente' : 'Resolução definitiva',
      })),
      HOJE,
      CALENDARIO_PADRAO,
    )
    const r = calcularS7(ctx, F)
    expect(r.ajusteDePrioridade.totais.ocorrencias).toBe(3)
    expect(r.ajusteDePrioridade.justificados).toEqual({ k: 2, n: 3 })
    expect(r.reclassificacaoDeTipo.totais.ocorrencias).toBe(2)
  })

  it('espera invisível da sustentação usa os totalizadores: cliente = vida; time = em atendimento', () => {
    const ctx = criarContextoAC(baseDe(25), HOJE, CALENDARIO_PADRAO)
    const r = calcularEIAcelerato(ctx, F)
    expect(r.fonte).toBe('Acelerato')
    expect(r.segmentoPor).toBe('prioridade')
    expect(r.segmentos.map((x) => x.rotulo)).toEqual(['P1', 'P2', 'P3', 'P4', 'P5'])
    const p3 = r.segmentos.find((x) => x.chave === 'p3')?.estatistica
    expect(p3?.status).toBe('ok')
    if (p3?.status === 'ok') {
      expect(p3.valor.cliente).toBeCloseTo(15, 6)
      expect(p3.valor.time).toBeCloseTo(2.5 + 6, 6)
    }
  })

  it('espera invisível da sustentação é segmentada por prioridade: cada uma com a sua mediana e a regra de 20', () => {
    const feitos = [
      ...Array.from({ length: 20 }, (_, i) => chamado(i)),
      ...Array.from({ length: 12 }, (_, i) =>
        chamado(100 + i, { prioridade: 'P2', impacto: 'Alto', urgencia: 'Alta' }),
      ),
    ]
    const base = baseDe(0)
    const ctx = criarContextoAC(
      { ...base, chamados: feitos.map((x) => x.c), etapas: feitos.flatMap((x) => x.e) },
      HOJE,
      CALENDARIO_PADRAO,
    )
    const r = calcularEIAcelerato(ctx, F)
    const st = Object.fromEntries(r.segmentos.map((x) => [x.chave, x.estatistica.status]))
    expect(st['p3']).toBe('ok')
    expect(st['p2']).toBe('insuficiente')
    expect(r.segmentos.find((x) => x.chave === 'p3')?.n).toBe(20)
  })

  it('S4 é por prioridade e, dentro dela, por nível; célula ou prioridade com menos de 20 não publica (nunca agregada)', () => {
    const feitos = [
      ...Array.from({ length: 20 }, (_, i) => chamado(i)),
      ...Array.from({ length: 12 }, (_, i) =>
        chamado(100 + i, { prioridade: 'P2', impacto: 'Alto', urgencia: 'Alta' }),
      ),
    ]
    const base = baseDe(0)
    const ctx = criarContextoAC(
      { ...base, chamados: feitos.map((x) => x.c), etapas: feitos.flatMap((x) => x.e) },
      HOJE,
      CALENDARIO_PADRAO,
    )
    const r = calcularS4(ctx, F)
    expect(r.prioridades.map((p) => p.prioridade)).toEqual(['P1', 'P2', 'P3', 'P4', 'P5'])
    const p3 = r.prioridades.find((p) => p.prioridade === 'P3')
    const p2 = r.prioridades.find((p) => p.prioridade === 'P2')
    expect([p3?.n, p2?.n]).toEqual([20, 12])
    const n1p3 = p3?.niveis.find((x) => x.nivel === 'N1')
    expect(n1p3?.pct).toBe(100)
    expect(n1p3?.tempoEtapa?.status).toBe('ok')
    const n1p2 = p2?.niveis.find((x) => x.nivel === 'N1')
    expect(n1p2?.n).toBe(12)
    expect(n1p2?.pct).toBeNull()
    expect(n1p2?.tempoEtapa?.status).toBe('insuficiente')
  })

  it('mapeia etapas e motivos de pendência aos cinco totalizadores', () => {
    expect(totalizadorDaEtapa('Novo', null)).toBe('sem-atendimento')
    expect(totalizadorDaEtapa('Em atendimento N3', null)).toBe('em-atendimento')
    expect(totalizadorDaEtapa('Pendente', 'Aguardando janela de mudança')).toBe('espera-combinada')
    expect(totalizadorDaEtapa('Pendente', 'Aguardando fornecedor')).toBe('espera-outros-times')
    expect(totalizadorDaEtapa('Aguardando validação', null)).toBe('espera-solicitante')
    expect(totalizadorDaEtapa('Encerrado', null)).toBeNull()
  })

  it('S1 marca "fora" quando a mediana passa do alvo e devolve só as prioridades filtradas', () => {
    const ctx = criarContextoAC(
      baseDe(25, () => ({ prioridade: 'P1' })),
      HOJE,
      CALENDARIO_PADRAO,
    )
    const r = calcularS1(ctx, { ...F, prioridade: ['P1'] })
    expect(r.prioridades.map((p) => p.prioridade)).toEqual(['P1'])
    // restauração de 9 h úteis contra o alvo de 4 h do P1
    expect(r.prioridades[0]?.restauracao.statusMeta).toBe('fora')
    expect(r.prioridades[0]?.primeiroAtendimento.statusMeta).toBe('fora')
  })

  it('pausa depois da restauração não entra no relógio de restauração (S1)', () => {
    const base = baseDe(25)
    const extras: EtapaChamado[] = base.chamados.map((c) => ({
      chamado_id: c.chamado_id,
      etapa: 'Pendente',
      entrada: t('2026-09-16T09:00-03:00', CALENDARIO_PADRAO),
      saida: t('2026-09-16T12:00-03:00', CALENDARIO_PADRAO),
      motivo_pendencia: 'Aguardando solicitante',
    }))
    const ctx = criarContextoAC(
      { ...base, etapas: [...base.etapas, ...extras] },
      HOJE,
      CALENDARIO_PADRAO,
    )
    const p3 = calcularS1(ctx, F).prioridades.find((p) => p.prioridade === 'P3')
    expect(p3?.restauracao.estatistica.status).toBe('ok')
    if (p3?.restauracao.estatistica.status === 'ok')
      expect(p3.restauracao.estatistica.valor.p50).toBeCloseTo(9, 6)
  })

  it('chamado sem etapas registradas entra com tempo zero em cada etapa (S4)', () => {
    const base = baseDe(22, () => ({ nivel_resolucao: 'N2' }))
    const ctx = criarContextoAC({ ...base, etapas: [] }, HOJE, CALENDARIO_PADRAO)
    const p3 = calcularS4(ctx, F).prioridades.find((p) => p.prioridade === 'P3')
    const n2 = p3?.niveis.find((x) => x.nivel === 'N2')
    expect(n2?.tempoEtapa?.status).toBe('ok')
    if (n2?.tempoEtapa?.status === 'ok') expect(n2.tempoEtapa.valor.p50).toBe(0)
  })

  it('noIntervalo: instante nulo está fora; datas na borda estão dentro', () => {
    const ctx = criarContextoAC(baseDe(1), HOJE, CALENDARIO_PADRAO)
    const j = { inicio: '2026-09-14', fim: '2026-09-15' }
    expect(noIntervalo(ctx, null, j)).toBe(false)
    expect(noIntervalo(ctx, t('2026-09-15T23:00-03:00', CALENDARIO_PADRAO), j)).toBe(true)
    expect(noIntervalo(ctx, t('2026-09-16T00:30-03:00', CALENDARIO_PADRAO), j)).toBe(false)
  })
})
