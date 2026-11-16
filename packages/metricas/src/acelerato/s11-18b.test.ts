import { describe, expect, it } from 'vitest'
import { MOTIVO_S11_CONVERSAO_SEM_DADO_REAL } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { CALENDARIO_PADRAO, instanteDeIso } from '../core/calendario'
import { EXTENSAO_AC_VAZIA } from './extensao'
import {
  ALVOS_PADRAO,
  calcularS11,
  criarContextoAC,
  type BaseAC,
  type Chamado,
  type EtapaChamado,
} from './index'

/** Pedido 105 (D6a): S11 pela Decisão 18b do dono (pedido 099), valendo o fluxo do chamado (L20 = a). */
const HOJE = '2026-10-09T18:00:00-03:00'
const t = (iso: string) => instanteDeIso(iso, CALENDARIO_PADRAO)
const F = { equipe: [], prioridade: [], periodo: { tipo: '12s' as const } }
const PROC = ['SSVO - INCIDENTE']
const FIM_CHAMADO = t('2026-09-15T17:00-03:00')

const chamado = (id: string, extra: Partial<Chamado> = {}): Chamado => ({
  chamado_id: id,
  organizacao: 'DSPD Sustentação',
  tipo_fila: 'DSPD - SSSC',
  equipe: 'SSSC TOTVS',
  natureza: 'incidente',
  categoria_sistema: 'Protheus - Financeiro',
  excluido: false,
  status: 'Concluído',
  impacto: 'Alto',
  urgencia: 'Alta',
  prioridade: 'P1',
  prioridade_ajustada_manualmente: false,
  justificativa_ajuste: null,
  aberto_em: t('2026-09-14T09:00-03:00'),
  primeiro_atendimento_em: t('2026-09-14T09:30-03:00'),
  restaurado_em: FIM_CHAMADO,
  data_finalizado: FIM_CHAMADO,
  status_sla_r: 'REALIZADO_NO_PRAZO',
  status_sla_pa: 'NO_PRAZO',
  motivo_escalacao: null,
  motivo_pendencia_atual: null,
  previsao_retorno: null,
  motivo_encerramento: null,
  avaliacao_problema: null,
  excecao_sla_registro_posterior: false,
  incidente_critico_coordenado: false,
  nivel_resolucao: 'N2',
  fluxo: 'SSVO - INCIDENTE',
  ...extra,
})
const etapa = (id: string, nome: string): EtapaChamado => ({
  chamado_id: id,
  etapa: nome as EtapaChamado['etapa'],
  entrada: FIM_CHAMADO - 3_600_000,
  saida: FIM_CHAMADO,
  motivo_pendencia: null,
})
const ctxDe = (chamados: Chamado[], etapas: EtapaChamado[] = [], fluxos?: readonly string[]) => {
  const b: BaseAC = {
    chamados,
    etapas,
    config: {
      ...(fluxos === undefined ? {} : { fluxos_proc: fluxos }),
      alvos: ALVOS_PADRAO,
      criterios: [],
    },
  }
  return criarContextoAC(b, HOJE, CALENDARIO_PADRAO)
}
const vinte = (prefixo: string, extra: (i: number) => Partial<Chamado>) =>
  Array.from({ length: 20 }, (_, i) => chamado(`${prefixo}${i}`, extra(i)))

describe('S11: contorno pelo de-para do motivo de encerramento (defeito do s11.ts:20)', () => {
  it('"Contorno Aplicado" (grafia real, caixa mista) entra no grupo Contorno e no escopo', () => {
    const xs = vinte('C', (i) => ({
      prioridade: 'P3',
      motivo_encerramento: 'Contorno Aplicado',
      avaliacao_problema: i < 5 ? 'Não aplicável e com justificativa' : null,
    }))
    const r = calcularS11(ctxDe(xs, [], PROC), F)
    const contorno = r.porGrupo.find((g) => g.grupo === 'Contorno')!.taxa
    expect(contorno).toMatchObject({ status: 'ok', k: 5, n: 20, pct: 25 })
    expect(r.escopo).toMatchObject({ status: 'ok', k: 5, n: 20 })
  })
  it('P3 sem contorno e "Outro" não entram no escopo', () => {
    const xs = [
      chamado('A', { prioridade: 'P3', motivo_encerramento: 'Resolução definitiva' }),
      chamado('B', {
        prioridade: 'P3',
        motivo_encerramento: 'Encerrado com Contorno e Plano de Ação',
      }),
    ]
    expect(calcularS11(ctxDe(xs, [], PROC), F).base.n).toBe(0)
  })
})

describe('S11: regra pelo fluxo do chamado (Decisão 18b)', () => {
  it('no fluxo do PROC conta o campo nativo preenchido (os dois valores do domínio); a etapa Causa Raiz não conta', () => {
    const xs = vinte('P', (i) => ({
      avaliacao_problema: i < 4 ? 'Aberto' : i < 8 ? 'Não aplicável e com justificativa' : null,
    }))
    const etapas = [etapa('P10', 'Causa Raiz')]
    const r = calcularS11(ctxDe(xs, etapas, PROC), F)
    expect(r.escopo).toMatchObject({ status: 'ok', k: 8, n: 20, pct: 40 })
    expect(r.semFluxo).toBe(0)
  })
  it('nos fluxos antigo e intermediário conta a passagem pela etapa "Causa Raiz" (qualquer caixa); o campo nativo não conta', () => {
    const xs = vinte('V', () => ({ fluxo: 'SSSC - INCIDENTE', avaliacao_problema: 'Aberto' }))
    const etapas = [
      etapa('V0', 'Causa Raiz'),
      etapa('V1', ' causa raiz '),
      etapa('V2', 'Em triagem'),
    ]
    const r = calcularS11(ctxDe(xs, etapas, PROC), F)
    expect(r.escopo).toMatchObject({ status: 'ok', k: 2, n: 20, pct: 10 })
    expect(r.porGrupo.find((g) => g.grupo === 'P1')!.taxa).toMatchObject({ k: 2, n: 20 })
  })
  it('sem fluxo ou com fluxo múltiplo fica fora do cálculo e é contado em semFluxo (P-S11-1)', () => {
    const xs = [
      ...vinte('P', (i) => ({ avaliacao_problema: i < 10 ? 'Aberto' : null })),
      chamado('N1', { fluxo: null, avaliacao_problema: 'Aberto' }),
      chamado('N2', { fluxo: null, prioridade: 'P2' }),
      chamado('N3', { fluxo: null, prioridade: 'P4' }), // fora do escopo: não conta
    ]
    const r = calcularS11(ctxDe(xs, [etapa('N2', 'Causa Raiz')], PROC), F)
    expect(r.semFluxo).toBe(2)
    expect(r.base.n).toBe(20)
    expect(r.escopo).toMatchObject({ status: 'ok', k: 10, n: 20 })
    expect(r.porGrupo.find((g) => g.grupo === 'P2')!.taxa.n).toBe(0)
  })
  it('sem a lista do PROC na base (mock e testes) todos vão pelo campo nativo e ninguém fica fora', () => {
    const xs = [
      ...vinte('P', (i) => ({
        fluxo: 'SSSC - INCIDENTE',
        avaliacao_problema: i < 3 ? 'Aberto' : null,
      })),
      chamado('N1', { fluxo: null, avaliacao_problema: 'Aberto' }),
    ]
    const r = calcularS11(ctxDe(xs, [etapa('P5', 'Causa Raiz')]), F)
    expect(r.semFluxo).toBe(0)
    expect(r.escopo).toMatchObject({ k: 4, n: 21 })
  })
  it('menos de 20 no escopo é insuficiente, nunca um percentual', () => {
    const xs = Array.from({ length: 19 }, (_, i) =>
      chamado(`P${i}`, { avaliacao_problema: 'Aberto' }),
    )
    const r = calcularS11(ctxDe(xs, [], PROC), F)
    expect(r.escopo.status).toBe('insuficiente')
    expect(r.escopo).not.toHaveProperty('pct')
  })
})

describe('S11: conversão em Registro de Problema', () => {
  it('sem extensão (base real): campoDisponivel true, conversão nula com o motivo próprio, nunca 0 de 0; valida no contrato', () => {
    const r = calcularS11(
      ctxDe(
        vinte('P', () => ({ avaliacao_problema: 'Aberto' })),
        [],
        PROC,
      ),
      F,
    )
    expect(r.campoDisponivel).toBe(true)
    expect(r.conversao).toBeNull()
    expect(r.motivoConversao).toBe(MOTIVO_S11_CONVERSAO_SEM_DADO_REAL)
    expect(SCHEMAS_RESULTADO.S11.safeParse(r).success).toBe(true)
  })
  it('com extensão: conversão sobre os avaliados pela regra do fluxo, sem motivo', () => {
    const xs = [
      ...vinte('P', (i) => ({ avaliacao_problema: i < 10 ? 'Aberto' : null })),
      ...vinte('V', () => ({ fluxo: 'SSSC - INCIDENTE', avaliacao_problema: 'Aberto' })),
    ]
    const etapas = Array.from({ length: 10 }, (_, i) => etapa(`V${i}`, 'Causa Raiz'))
    const registroProblema = Object.fromEntries(
      ['P0', 'P1', 'P2', 'P15', 'V0', 'V15'].map((id) => [id, true]),
    )
    const r = calcularS11(ctxDe(xs, etapas, PROC), F, { ...EXTENSAO_AC_VAZIA, registroProblema })
    expect(r.motivoConversao).toBeNull()
    expect(r.conversao).toMatchObject({ status: 'ok', k: 4, n: 20, pct: 20 })
  })
})
