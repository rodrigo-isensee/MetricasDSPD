import { describe, expect, it } from 'vitest'
import { CALENDARIO_PADRAO, instanteDeIso } from './core/calendario'
import {
  ALVOS_PADRAO,
  criarContextoAC,
  type BaseAC,
  type Chamado,
  type EtapaChamado,
} from './acelerato'
import { criarContextoBM } from './businessmap'
import { HOJE_TESTE, umaBase } from './businessmap/testing'
import { calcularVisaoGeral } from './visaoGeral'

const t = (iso: string) => instanteDeIso(iso, CALENDARIO_PADRAO)

/** Chamado P1 fechado: abre 14/09 09:00, restaura 15/09 17:00 (15 h úteis, alvo de 4 h). */
function chamadoP1(i: number): { c: Chamado; e: EtapaChamado[] } {
  const id = `P${i}`
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
    urgencia: 'Alta',
    prioridade: 'P1',
    prioridade_ajustada_manualmente: false,
    justificativa_ajuste: null,
    aberto_em: t('2026-09-14T09:00-03:00'),
    primeiro_atendimento_em: t('2026-09-14T10:00-03:00'),
    restaurado_em: t('2026-09-15T17:00-03:00'),
    data_finalizado: t('2026-09-15T17:00-03:00'),
    status_sla_r: 'REALIZADO_APOS_VENCIMENTO',
    status_sla_pa: 'NO_PRAZO',
    motivo_escalacao: null,
    motivo_pendencia_atual: null,
    previsao_retorno: null,
    motivo_encerramento: 'Resolução definitiva',
    avaliacao_problema: null,
    excecao_sla_registro_posterior: false,
    incidente_critico_coordenado: false,
    nivel_resolucao: 'N1',
  }
  const etapa = (nome: EtapaChamado['etapa'], a: string, z: string | null): EtapaChamado => ({
    chamado_id: id,
    etapa: nome,
    entrada: t(a),
    saida: z ? t(z) : null,
    motivo_pendencia: null,
  })
  return {
    c,
    e: [
      etapa('Em atendimento N1', '2026-09-14T09:00-03:00', '2026-09-15T17:00-03:00'),
      etapa('Encerrado', '2026-09-15T17:00-03:00', null),
    ],
  }
}

describe('visão geral: alertas dos dois domínios, em blocos separados', () => {
  const xs = Array.from({ length: 25 }, (_, i) => chamadoP1(i))
  const baseAC: BaseAC = {
    chamados: xs.map((x) => x.c),
    etapas: xs.flatMap((x) => x.e),
    config: { alvos: ALVOS_PADRAO, criterios: [] },
  }
  const baseBM = umaBase(
    Array.from({ length: 3 }, (_, i) => ({
      id: `W${i}`,
      criado: '2026-07-20T08:00-03:00',
      trilha: [
        ['Aguardando priorização', '2026-07-20T08:00-03:00'],
        ['Em desenvolvimento', '2026-07-20T09:00-03:00'],
      ] as [string, string][],
    })),
  )
  baseBM.config.limite_wip_fluxo = { 'Equipe A': 1 }
  const r = calcularVisaoGeral(
    criarContextoBM(baseBM, HOJE_TESTE, CALENDARIO_PADRAO),
    criarContextoAC(baseAC, HOJE_TESTE, CALENDARIO_PADRAO),
  )

  it('WIP acima do limite em quase todos os dias gera o alerta do O1 com o k de n', () => {
    const a = r.alertas.find((x) => x.codigo === 'O1_WIP_ACIMA_LIMITE')
    expect(a).toBeDefined()
    expect(a?.de).toBeGreaterThanOrEqual(20)
    expect(a?.valor).toBeLessThan(a?.de as number)
  })

  it('mediana de restauração acima do alvo gera o alerta do S1', () => {
    const a = r.alertas.find((x) => x.codigo === 'S1_MEDIANA_ACIMA_ALVO')
    expect(a).toMatchObject({ nivel: 'sustentacao', valor: 1, de: 1 })
  })

  it('com 20 chamados P1 ou mais, o indicador de P1 publica o percentual', () => {
    const sust = r.niveis.find((n) => n.nivel === 'sustentacao')
    const p1 = sust?.indicadores.find((i) => i.codigo === 'S2_P1')
    expect(p1?.base.n).toBe(25)
    expect(p1?.valor).not.toBeNull()
    expect(p1?.amostra).toBeNull()
  })

  it('os recortes declaram a janela de cada domínio', () => {
    expect(r.recortes.fluxo.fim).toBe('2026-10-09')
    expect(r.recortes.sustentacao.fim).toBe('2026-10-09')
    expect(r.recortes.estrategico.fim).toBe('2026-10-09')
  })
})
