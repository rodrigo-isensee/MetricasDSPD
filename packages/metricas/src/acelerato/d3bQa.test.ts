import { describe, expect, it } from 'vitest'
import { CALENDARIO_PADRAO, horasUteisEntre, instanteDeIso as t } from '../core/calendario'
import {
  ALVOS_PADRAO,
  CALENDARIO_SUSTENTACAO_PADRAO,
  calcularS1,
  calcularS9,
  criarContextoAC,
  type BaseAC,
  type Chamado,
  type EtapaChamado,
} from './index'

// QA do D3b (Decisão 13, dia útil da Sustentação de 528 min): o efeito numérico do calendário nas métricas
// que medem horas úteis (S1 e S9). Falha se TURNOS_SUSTENTACAO voltar a 480 min ou se a S1/S9 ignorarem o calendário do contexto.
const HOJE = '2026-10-09T18:00:00-03:00'
const F = { equipe: [], prioridade: [], periodo: { tipo: '12s' as const } }
const iso = (s: string) => t(s, CALENDARIO_PADRAO)

function par(i: number): { c: Chamado; e: EtapaChamado[] } {
  const c: Chamado = {
    chamado_id: `Q${i}`,
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
    aberto_em: iso('2026-09-14T09:00-03:00'),
    primeiro_atendimento_em: iso('2026-09-14T17:00-03:00'),
    restaurado_em: iso('2026-09-15T17:30-03:00'),
    data_finalizado: iso('2026-09-15T17:30-03:00'),
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
  } as Chamado
  const e = (
    etapa: EtapaChamado['etapa'],
    a: string,
    z: string | null,
    m: EtapaChamado['motivo_pendencia'] = null,
  ): EtapaChamado => ({
    chamado_id: c.chamado_id,
    etapa,
    entrada: iso(a),
    saida: z ? iso(z) : null,
    motivo_pendencia: m,
  })
  return {
    c,
    e: [
      e('Em atendimento N1', '2026-09-14T09:00-03:00', '2026-09-14T12:00-03:00'),
      e('Pendente', '2026-09-14T12:00-03:00', '2026-09-15T09:00-03:00', 'Aguardando solicitante'),
      e('Em atendimento N1', '2026-09-15T09:00-03:00', '2026-09-15T17:30-03:00'),
      e('Encerrado', '2026-09-15T17:30-03:00', null),
    ],
  }
}
const base = (n: number): BaseAC => {
  const xs = Array.from({ length: n }, (_, i) => par(i))
  return {
    chamados: xs.map((x) => x.c),
    etapas: xs.flatMap((x) => x.e),
    config: { alvos: ALVOS_PADRAO, criterios: [] },
  }
}

describe('D3b (QA): o calendário de 528 min muda as horas úteis medidas', () => {
  it('fronteira do fim do dia: 17:00 a 17:48 conta na Sustentação (0,8 h) e não no calendário padrão (0 h); 17:48 a 08:00 do dia seguinte é 0', () => {
    expect(
      horasUteisEntre(
        iso('2026-09-14T17:00-03:00'),
        iso('2026-09-14T18:00-03:00'),
        CALENDARIO_SUSTENTACAO_PADRAO,
      ),
    ).toBeCloseTo(0.8, 6)
    expect(
      horasUteisEntre(
        iso('2026-09-14T17:00-03:00'),
        iso('2026-09-14T18:00-03:00'),
        CALENDARIO_PADRAO,
      ),
    ).toBe(0)
    expect(
      horasUteisEntre(
        iso('2026-09-14T17:48-03:00'),
        iso('2026-09-15T08:00-03:00'),
        CALENDARIO_SUSTENTACAO_PADRAO,
      ),
    ).toBe(0)
  })

  it('S1 restauração: 14/09 09:00 a 15/09 17:30 = 16,3 h úteis (528) contra 15 h (480); pendência de 5,8 h descontada no mesmo relógio', () => {
    const p = (cal: typeof CALENDARIO_PADRAO) => {
      const r = calcularS1(criarContextoAC(base(25), HOJE, cal), F).prioridades.find(
        (x) => x.prioridade === 'P3',
      )!.restauracao.estatistica
      if (r.status !== 'ok') throw new Error('amostra insuficiente')
      return r.valor.p50
    }
    // 528: 7,8 + 8,5 = 16,3 menos pendente (4,8 + 1) = 10,5 | 480: 15 menos 5 = 10
    expect(p(CALENDARIO_SUSTENTACAO_PADRAO)).toBeCloseTo(10.5, 6)
    expect(p(CALENDARIO_PADRAO)).toBeCloseTo(10, 6)
  })

  it('S9 (pendência em horas úteis): 12:00 a 09:00 do dia seguinte = 5,8 h com 528 min e 5 h com 480', () => {
    const p = (cal: typeof CALENDARIO_PADRAO) => {
      const m = calcularS9(criarContextoAC(base(25), HOJE, cal), F).porMotivo.find(
        (x) => x.motivo === 'Aguardando solicitante',
      )!.estatistica
      if (m.status !== 'ok') throw new Error('amostra insuficiente')
      return m.valor.p50
    }
    expect(p(CALENDARIO_SUSTENTACAO_PADRAO)).toBeCloseTo(5.8, 6)
    expect(p(CALENDARIO_PADRAO)).toBeCloseTo(5, 6)
  })
})
