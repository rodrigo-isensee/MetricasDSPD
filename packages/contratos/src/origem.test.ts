import { describe, expect, it } from 'vitest'
import { METRICA_IDS } from './comum'
import {
  AJUSTE_PRIORIDADE_COM_FONTE,
  BLOQUEIOS_COM_DADO_REAL,
  NOTA_SUSTENTACAO_IDS,
  notaSustentacaoIdSchema,
  TEXTO_NOTA_QUALQUER,
  corpoSemDadoReal,
  METRICAS_COM_PARTE_DE_BLOQUEIO,
  MOTIVO_BLOQUEIOS_NAO_COLETADOS,
  MOTIVO_O5_BLOQUEIOS_NAO_COLETADOS,
  ESTADO_SEM_DADO_REAL,
  METRICAS_ORIGEM_REAL,
  MOTIVO_FONTE_REAL_NAO_DEFINIDA,
  motivoDaOrigemMock,
  motivoSemDadoReal,
  METRICAS_SEM_SIMULACAO,
  podeSimular,
  semDadoRealSchema,
  NOTAS_FIXAS_DO_CARTAO,
  notaCartaoIdSchema,
  origemDaMetrica,
  TEXTO_NOTA_CARTAO,
} from './origem'
import { resultadoO1, resultadoO2, resultadoO3, resultadoO5 } from './schemas'

describe('origemDaMetrica (H-13)', () => {
  it('é real exatamente para as 11 do FL1 com dado no quadro, a Espera invisível do FL1, a PV1 (pedido 060) e as 5 da sustentação carregadas', () => {
    const reais = METRICA_IDS.filter((id) => origemDaMetrica(id) === 'real')
    expect([...reais].sort()).toEqual(
      [
        ...['O1', 'O2', 'O3', 'O4', 'O6', 'O7', 'O9', 'O10', 'O11', 'O13', 'EI_FL1'],
        ...['PV1'],
        ...['S2', 'S3', 'S4', 'S8', 'S10'],
        ...['TENDENCIA_FLUXO'], // pedido 077 (L5)
      ].sort(),
    )
  })

  it('sustentação: S1, S5, S6, S7, S9, S11, S12 e EI_SUST seguem mock, cada uma com o seu motivo', () => {
    expect(motivoDaOrigemMock('S1')).toBe('aguardando prazos de SLA por prioridade')
    for (const id of ['S5', 'S6', 'S7', 'S11'] as const) {
      expect(origemDaMetrica(id), id).toBe('mock')
      expect(motivoDaOrigemMock(id), id).toBe(
        'aguardando tipo e domínio do campo do chamado (P-DS-19)',
      )
    }
    expect(origemDaMetrica('S9')).toBe('mock')
    expect(motivoDaOrigemMock('S9')).toBe(
      'aguardando o motivo de pendência do chamado (tipo e domínio, P-DS-19)',
    )
    expect(origemDaMetrica('S12')).toBe('mock')
    expect(motivoDaOrigemMock('S12')).toBe(
      'aguardando fonte do registro posterior de exceção de SLA',
    )
    expect(origemDaMetrica('EI_SUST')).toBe('mock')
    expect(motivoDaOrigemMock('EI_SUST')).toBe('cálculo ainda não definido para o Acelerato')
  })

  it('métrica de sustentação real não tem motivo de dado fictício', () => {
    for (const id of ['S2', 'S3', 'S4', 'S8', 'S10'] as const) {
      expect(origemDaMetrica(id), id).toBe('real')
      expect(motivoDaOrigemMock(id), id).toBeNull()
    }
  })

  it('é mock, com o motivo, para O8, O12, O14, O15, O16, O17 e O18', () => {
    for (const id of ['O8', 'O12', 'O14', 'O15', 'O16', 'O17', 'O18'] as const) {
      expect(origemDaMetrica(id)).toBe('mock')
      expect(motivoDaOrigemMock(id)).toBe('aguardando campo no quadro')
    }
  })

  it('O19 a O26, FL2, FL3, a Visão geral e a tendência da sustentação seguem mock, sem motivo próprio', () => {
    for (const id of ['O19', 'O26', 'T1', 'E1', 'VISAO_GERAL', 'TENDENCIA_SUST'] as const) {
      expect(origemDaMetrica(id)).toBe('mock')
      expect(motivoDaOrigemMock(id)).toBeNull()
    }
  })

  it('métrica real não tem motivo de dado fictício', () => {
    expect(motivoDaOrigemMock('O1')).toBeNull()
  })
})

describe('notas de cartão', () => {
  it('O6 e o SLE (T2) levam a nota de classe; todo id de nota tem texto', () => {
    expect(NOTAS_FIXAS_DO_CARTAO.O6).toEqual(['sem-classe'])
    expect(NOTAS_FIXAS_DO_CARTAO.T2).toEqual(['sem-classe'])
    expect(TEXTO_NOTA_CARTAO['sem-classe']).toContain('Sem separação por classe')
    expect(TEXTO_NOTA_CARTAO['sle-nao-definido']).toBe('SLE não definido.')
    expect(notaCartaoIdSchema.safeParse('outra').success).toBe(false)
  })

  it('o resultado do O3 aceita `notas` opcional e só com ids do contrato', () => {
    const forma = resultadoO3.shape.notas
    expect(forma.safeParse(undefined).success).toBe(true)
    expect(forma.safeParse(['sle-nao-definido']).success).toBe(true)
    expect(forma.safeParse(['qualquer']).success).toBe(false)
  })
})

describe('estado sem dado real (pedido 060, P3)', () => {
  it('toda métrica fora do mapa real tem motivo não vazio, o do mapa ou o genérico', () => {
    const fora = METRICA_IDS.filter((id) => !METRICAS_ORIGEM_REAL.has(id))
    expect(fora.length).toBeGreaterThan(0)
    for (const id of fora) {
      expect(motivoSemDadoReal(id).length, id).toBeGreaterThan(0)
      expect(semDadoRealSchema.safeParse(corpoSemDadoReal(id)).success, id).toBe(true)
    }
    expect(motivoSemDadoReal('O8')).toBe('aguardando campo no quadro')
    expect(motivoSemDadoReal('VISAO_GERAL')).toBe(MOTIVO_FONTE_REAL_NAO_DEFINIDA)
    expect(motivoSemDadoReal('T1')).toBe(MOTIVO_FONTE_REAL_NAO_DEFINIDA)
  })

  it('o corpo não carrega número nem campo fora de estado, métrica e motivo', () => {
    const corpo = corpoSemDadoReal('S1')
    expect(Object.keys(corpo).sort()).toEqual(['estado', 'metrica', 'motivo', 'simulavel'])
    expect(corpo.estado).toBe(ESTADO_SEM_DADO_REAL)
    expect(semDadoRealSchema.safeParse({ ...corpo, valor: 1 }).success).toBe(false)
    expect(semDadoRealSchema.safeParse({ ...corpo, motivo: '' }).success).toBe(false)
  })

  it('T-C2: o schema aceita o corpo com e sem simulavel e segue strict', () => {
    const base = {
      estado: ESTADO_SEM_DADO_REAL,
      metrica: 'O12',
      motivo: 'aguardando campo no quadro',
    }
    expect(semDadoRealSchema.safeParse(base).success).toBe(true)
    expect(semDadoRealSchema.safeParse({ ...base, simulavel: true }).success).toBe(true)
    expect(semDadoRealSchema.safeParse({ ...base, simulavel: false }).success).toBe(true)
    expect(semDadoRealSchema.safeParse({ ...base, simulavel: 'sim' }).success).toBe(false)
    expect(semDadoRealSchema.safeParse({ ...base, simulavel: true, valor: 1 }).success).toBe(false)
  })

  it('PV1 não tem motivo de dado fictício', () => {
    expect(motivoDaOrigemMock('PV1')).toBeNull()
  })

  it('C1/C2 (pedido 065): BLOQUEADOS e O5 são mock, o mapa real não os tem e os motivos são próprios, não o genérico', () => {
    expect(origemDaMetrica('BLOQUEADOS')).toBe('mock')
    expect(METRICAS_ORIGEM_REAL.has('BLOQUEADOS') || METRICAS_ORIGEM_REAL.has('O5')).toBe(false) // lista por id, nunca tamanho fixo (077, A9)
    expect(motivoSemDadoReal('BLOQUEADOS')).toBe(MOTIVO_BLOQUEIOS_NAO_COLETADOS)
    expect(origemDaMetrica('O5')).toBe('mock')
    expect(motivoSemDadoReal('O5')).toBe(MOTIVO_O5_BLOQUEIOS_NAO_COLETADOS)
    expect(motivoSemDadoReal('BLOQUEADOS')).not.toBe(MOTIVO_FONTE_REAL_NAO_DEFINIDA)
    expect(corpoSemDadoReal('BLOQUEADOS').motivo).toBe(MOTIVO_BLOQUEIOS_NAO_COLETADOS)
  })

  it('C3 (pedido 065): O1 e O2 aceitam a nota de bloqueio, recusam id fora do contrato; O1 aceita null na parte de bloqueio; O5 segue no contrato anterior', () => {
    expect(notaCartaoIdSchema.safeParse('bloqueio-sem-dado-real').success).toBe(true)
    expect(TEXTO_NOTA_CARTAO['bloqueio-sem-dado-real']).toContain(MOTIVO_BLOQUEIOS_NAO_COLETADOS)
    expect(METRICAS_COM_PARTE_DE_BLOQUEIO).toEqual(['O1', 'O2'])
    expect(BLOQUEIOS_COM_DADO_REAL).toBe(false)
    for (const r of [resultadoO1, resultadoO2]) {
      const campo = r.shape.notas
      expect(campo.safeParse(['bloqueio-sem-dado-real']).success).toBe(true)
      expect(campo.safeParse(['id-inexistente']).success).toBe(false)
    }
    const o1 = resultadoO1.shape
    expect(o1.hoje.shape.bloqueados.safeParse(null).success).toBe(true)
    expect(o1.serie.element.shape.bloqueados.safeParse(null).success).toBe(true)
    expect(o1.porTipoColuna.element.shape.bloqueados.safeParse(null).success).toBe(true)
    expect(o1.porColuna.unwrap().element.shape.bloqueados.safeParse(null).success).toBe(true)
    expect(resultadoO5.shape).not.toHaveProperty('notas') // O5 inteiro sai do mapa real (decisão B): contrato anterior, sem nota nem null
  })
})

describe('simulado por cartão (pedido 070, ADR 0028)', () => {
  it('T-C1: id do mapa real nunca simulável (TENDENCIA_FLUXO) e podeSimular é falso para todo id real e para os quatro excluídos', () => {
    expect([...METRICAS_SEM_SIMULACAO].sort()).toEqual([
      'EI_SUST',
      'TENDENCIA_FLUXO',
      'TENDENCIA_SUST',
      'VISAO_GERAL',
    ])
    expect(METRICAS_ORIGEM_REAL.has('TENDENCIA_FLUXO')).toBe(true) // pedido 077 (L5): id do mapa real nunca simulável, mesmo na lista de exclusão
    expect(METRICAS_ORIGEM_REAL.has('TENDENCIA_SUST')).toBe(false)
    for (const id of METRICAS_ORIGEM_REAL) expect(podeSimular(id), id).toBe(false)
    for (const id of METRICAS_SEM_SIMULACAO) expect(podeSimular(id), id).toBe(false)
  })

  it('podeSimular é verdadeiro exatamente para o que está fora do mapa real e fora da exclusão, e o corpo copia o valor', () => {
    for (const id of METRICA_IDS) {
      const esperado = !METRICAS_ORIGEM_REAL.has(id) && !METRICAS_SEM_SIMULACAO.has(id)
      expect(podeSimular(id), id).toBe(esperado)
      if (!METRICAS_ORIGEM_REAL.has(id)) expect(corpoSemDadoReal(id).simulavel, id).toBe(esperado)
    }
    expect(podeSimular('O12')).toBe(true)
    expect(podeSimular('S1')).toBe(true)
  })
})

describe('notas só da sustentação (pedido 069, L9-a)', () => {
  it('enum à parte: os ids novos não entram no enum de O1 a O3 e todo id tem texto', () => {
    for (const id of NOTA_SUSTENTACAO_IDS) {
      expect(notaCartaoIdSchema.safeParse(id).success).toBe(false)
      expect(notaSustentacaoIdSchema.safeParse(id).success).toBe(true)
      expect(TEXTO_NOTA_QUALQUER[id].length).toBeGreaterThan(0)
    }
    expect(notaSustentacaoIdSchema.safeParse('bloqueio-sem-dado-real').success).toBe(false)
    expect(AJUSTE_PRIORIDADE_COM_FONTE).toBe(false)
  })
})
