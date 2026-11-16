import { describe, expect, it } from 'vitest'
import { CALENDARIO_PADRAO, instanteDeIso } from '../core/calendario'
import {
  ALVOS_PADRAO,
  calcularS5,
  calcularS6,
  calcularS7,
  criarContextoAC,
  motivoEncerramentoDe,
  motivoEscalacaoDe,
  type BaseAC,
  type Chamado,
} from './index'

/** Pedido 105 (D2): P1 = B (cinco fluxos do PROC), P2 = A (de-para só dos pares óbvios), P3 = A (faixa Outro separada de Não informado). */
const HOJE = '2026-10-09T18:00:00-03:00'
const t = (iso: string) => instanteDeIso(iso, CALENDARIO_PADRAO)
const F = { equipe: [], prioridade: [], periodo: { tipo: '12s' as const } }
const PROC = ['SSVO - INCIDENTE', 'DSPD SSVO MELHORIAS/PROJETOS']

const chamado = (i: number, extra: Partial<Chamado> = {}): Chamado => ({
  chamado_id: `T${i}`,
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
  aberto_em: t('2026-09-14T09:00-03:00'),
  primeiro_atendimento_em: t('2026-09-14T09:30-03:00'),
  restaurado_em: t('2026-09-15T17:00-03:00'),
  data_finalizado: t('2026-09-15T17:00-03:00'),
  status_sla_r: 'REALIZADO_NO_PRAZO',
  status_sla_pa: 'NO_PRAZO',
  motivo_escalacao: null,
  motivo_pendencia_atual: null,
  previsao_retorno: null,
  motivo_encerramento: 'Resolução definitiva',
  avaliacao_problema: null,
  excecao_sla_registro_posterior: false,
  incidente_critico_coordenado: false,
  nivel_resolucao: 'N2',
  fluxo: 'SSVO - INCIDENTE',
  ...extra,
})
const base = (
  n: number,
  ajuste: (i: number) => Partial<Chamado>,
  fluxos?: readonly string[],
): BaseAC => ({
  chamados: Array.from({ length: n }, (_, i) => chamado(i, ajuste(i))),
  etapas: [],
  config: {
    ...(fluxos === undefined ? {} : { fluxos_proc: fluxos }),
    alvos: ALVOS_PADRAO,
    criterios: [],
  },
})
const ctxDe = (b: BaseAC) => criarContextoAC(b, HOJE, CALENDARIO_PADRAO)

describe('D2: de-para dos motivos (P2 = A)', () => {
  it('junta só caixa e vírgula; o resto preenchido é Outro e o vazio é null', () => {
    expect(motivoEncerramentoDe('Contorno Aplicado')).toBe('Contorno aplicado')
    expect(motivoEncerramentoDe('Reclassificado não é incidente')).toBe(
      'Reclassificado, não é incidente',
    )
    expect(motivoEncerramentoDe('Resolução definitiva')).toBe('Resolução definitiva')
    expect(motivoEncerramentoDe('Encerrado sem retorno')).toBe('Encerrado sem retorno')
    expect(motivoEncerramentoDe('Duplicado')).toBe('Duplicado')
    for (const v of [
      'Solução Definitiva Validada',
      'Solução definitiva validada',
      'Encerrado com Contorno e Plano de Ação',
      'Não é Problema',
      'Não é problema',
      'qualquer coisa nova',
    ]) {
      expect(motivoEncerramentoDe(v), v).toBe('Outro')
    }
    expect(motivoEncerramentoDe(null)).toBeNull()
    expect(motivoEncerramentoDe('   ')).toBeNull()
    expect(motivoEscalacaoDe('necessidade de atuação especializada')).toBe(
      'Necessidade de atuação especializada',
    )
    expect(motivoEscalacaoDe('Sem conhecimento técnico, no N1')).toBe(
      'Sem conhecimento técnico no N1',
    )
    expect(motivoEscalacaoDe('Outro motivo qualquer')).toBe('Outro')
    expect(motivoEscalacaoDe(null)).toBeNull()
  })
})

describe('D2: S5 pelos fluxos do PROC e a faixa Outro (P1 = B, P3 = A)', () => {
  it('os de fora não entram e são contados; Outro e Não informado ficam separados; Risco de estouro sai com n = 0', () => {
    const r = calcularS5(
      ctxDe(
        base(
          30,
          (i) => ({
            fluxo: i < 24 ? PROC[i % 2]! : i < 27 ? 'SSSC - INCIDENTE' : null,
            motivo_escalacao:
              i % 6 === 0
                ? 'Necessidade de atuação especializada'
                : i % 6 === 1
                  ? 'novo valor'
                  : i % 6 === 2
                    ? null
                    : 'Múltiplos sistemas ou dependências',
          }),
          PROC,
        ),
      ),
      F,
    )
    expect(r.base.n).toBe(24)
    expect(r.foraDoFluxo).toBe(6)
    const por = Object.fromEntries(r.motivos.map((m) => [m.motivo, m.n]))
    expect(por['Outro']).toBe(4)
    expect(r.naoInformado).toBe(4)
    expect(por['Risco de estouro de SLA']).toBe(0)
    expect(r.motivos.reduce((a, m) => a + m.n, 0) + r.naoInformado).toBe(24)
    expect(r.motivos.at(-1)?.motivo).toBe('Risco de estouro de SLA')
  })

  it('abaixo de 20 não publica percentual', () => {
    const r = calcularS5(ctxDe(base(10, () => ({ motivo_escalacao: 'novo' }), PROC)), F)
    expect(r.base.n).toBe(10)
    expect(r.motivos.every((m) => m.pct === null)).toBe(true)
  })

  it('sem a lista na base (mock) todos entram e nada fica de fora', () => {
    const r = calcularS5(ctxDe(base(22, () => ({ fluxo: null }))), F)
    expect(r.base.n).toBe(22)
    expect(r.foraDoFluxo).toBe(0)
  })
})

describe('D2: S6 e S7 pelos fluxos do PROC', () => {
  it('S6: Outro separado de Não informado; contorno pelo de-para; fora contado', () => {
    const r = calcularS6(
      ctxDe(
        base(
          30,
          (i) => ({
            fluxo: i < 25 ? 'DSPD SSVO MELHORIAS/PROJETOS' : null,
            motivo_encerramento:
              i % 5 === 0
                ? 'Contorno Aplicado'
                : i % 5 === 1
                  ? 'Solução Definitiva Validada'
                  : i % 5 === 2
                    ? null
                    : 'Duplicado',
          }),
          PROC,
        ),
      ),
      F,
    )
    expect(r.base.n).toBe(25)
    expect(r.foraDoFluxo).toBe(5)
    const por = Object.fromEntries(r.motivos.map((m) => [m.motivo, m.n]))
    expect(por['Contorno aplicado']).toBe(5)
    expect(por['Outro']).toBe(5)
    expect(r.naoInformado).toBe(5)
    expect(r.taxaContorno).toMatchObject({ status: 'ok', k: 5, n: 25 })
  })

  it('S7: reclassificação pelo de-para (sem vírgula), ajuste só com Sim, fora do fluxo contado sem repetir chamado', () => {
    const r = calcularS7(
      ctxDe(
        base(
          30,
          (i) => ({
            fluxo: i < 22 ? 'SSVO - INCIDENTE' : 'SSSC - INCIDENTE',
            motivo_encerramento:
              i % 2 === 0 ? 'Reclassificado não é incidente' : 'Resolução definitiva',
            prioridade_ajustada_manualmente: i % 3 === 0,
          }),
          PROC,
        ),
      ),
      F,
    )
    expect(r.foraDoFluxo).toBe(8)
    expect(r.reclassificacaoDeTipo.totais).toEqual({ total: 22, ocorrencias: 11 })
    expect(r.ajusteDePrioridade.totais).toEqual({ total: 22, ocorrencias: 8 })
  })
})
