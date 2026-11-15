import { describe, expect, it, vi } from 'vitest'
import { CALENDARIO_PADRAO } from './core/calendario'
import { ALVOS_PADRAO, criarContextoAC } from './acelerato'
import { criarContextoBM } from './businessmap'
import { HOJE_TESTE, trilhaSimples, umaBase } from './businessmap/testing'
import { calcularVisaoGeral } from './visaoGeral'

// Interruptor ligado (futuro, Q-099-4): o campo de responsabilidade do atraso passa a existir no quadro.
vi.mock('@metricas-dspd/contratos', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@metricas-dspd/contratos')>()),
  RESPONSABILIDADE_ATRASO_COM_FONTE: true,
}))

describe('099: Visão geral com a responsabilidade do atraso disponível', () => {
  it('vencido de causa interna gera o alerta O12_VENCIDOS_INTERNOS', () => {
    const dia = (d: string, h: string) => `2026-09-${d}T${h}-03:00`
    const base = umaBase([
      {
        id: 'V1',
        criado: dia('14', '09:00'),
        trilha: trilhaSimples(
          dia('14', '09:00'),
          dia('14', '09:30'),
          dia('14', '10:00'),
          dia('16', '10:00'),
        ),
        dataAcordada: dia('15', '12:00'),
      },
    ])
    const comInterno = {
      ...base,
      cards: base.cards.map((c) => ({ ...c, responsabilidade_atraso: 'Interno' as const })),
    }
    const r = calcularVisaoGeral(
      criarContextoBM(comInterno, HOJE_TESTE, CALENDARIO_PADRAO),
      criarContextoAC(
        { chamados: [], etapas: [], config: { alvos: ALVOS_PADRAO, criterios: [] } },
        HOJE_TESTE,
        CALENDARIO_PADRAO,
      ),
    )
    expect(r.alertas.find((x) => x.codigo === 'O12_VENCIDOS_INTERNOS')).toMatchObject({
      metrica: 'O12',
      valor: 1,
    })
  })
})
