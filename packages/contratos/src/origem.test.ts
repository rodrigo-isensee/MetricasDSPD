import { describe, expect, it } from 'vitest'
import { METRICA_IDS } from './comum'
import {
  AJUSTE_PRIORIDADE_COM_FONTE,
  MOTIVO_O12_RESPONSABILIDADE_SEM_DADO_REAL,
  RESPONSABILIDADE_ATRASO_COM_FONTE,
  BLOQUEIOS_COM_DADO_REAL,
  NOTA_S12_IDS,
  NOTA_MOTIVOS_IDS,
  NOTA_S1_IDS,
  NOTA_SUSTENTACAO_IDS,
  notaS12IdSchema,
  notaS1IdSchema,
  notaSustentacaoIdSchema,
  TEXTO_NOTA_QUALQUER,
  corpoSemDadoReal,
  ESTADO_SEM_DADO_REAL,
  METRICAS_ORIGEM_REAL,
  MOTIVO_O17_CAUSA_RAIZ_SEM_DADO_REAL,
  MOTIVO_O8_POR_TAMANHO_SEM_DADO_REAL,
  MOTIVO_FONTE_REAL_NAO_DEFINIDA,
  MOTIVO_O26_HISTORICO_RESPONSAVEIS,
  MOTIVO_ORIGEM_MOCK,
  MOTIVO_FLUXOS_PROC_NAO_CARREGADOS,
  MOTIVO_S11_CONVERSAO_SEM_DADO_REAL,
  motivoDaOrigemSemDado,
  motivoSemDadoReal,
  semDadoRealSchema,
  NOTAS_FIXAS_DO_CARTAO,
  notaCartaoIdSchema,
  notaMotivosIdSchema,
  origemDaMetrica,
  TEXTO_NOTA_CARTAO,
} from './origem'
import {
  resultadoO1,
  resultadoO2,
  resultadoO3,
  resultadoO12,
  resultadoO5,
  resultadoS1,
  resultadoS12,
} from './schemas'

describe('origemDaMetrica (H-13)', () => {
  it('é real exatamente para as 11 do FL1 com dado no quadro, a Espera invisível do FL1, BLOQUEADOS, O5 e O19 (pedido 075, 6b), a PV1 (pedido 060) e as 5 da sustentação carregadas', () => {
    const reais = METRICA_IDS.filter((id) => origemDaMetrica(id) === 'real')
    expect([...reais].sort()).toEqual(
      [
        ...['O1', 'O2', 'O3', 'O4', 'O6', 'O7', 'O9', 'O10', 'O11', 'O13', 'EI_FL1'],
        ...['BLOQUEADOS', 'O5', 'O19'], // pedido 075 (lote 6b)
        ...['O20'], // pedido 099 (lote A2)
        ...['O25'], // pedido 099 (lote A3)
        ...['O24'], // pedido 105 (E7.100): fila da prioridade Média do BusinessMap
        ...['T1', 'T2', 'T4', 'T6'], // pedido 105 (E7.100, P-7): separação pela prioridade nativa do BusinessMap
        ...['O21'], // pedido 099 (lote A1)
        ...['PV1'],
        ...['S2', 'S3', 'S4', 'S8', 'S10', 'S12'], // S12 só com o volume (pedido 099, D9)
        ...['S9'], // pedido 099 (D5a)
        ...['TENDENCIA_FLUXO', 'TENDENCIA_SUST'], // pedido 077 (L5, L7)
        ...['O17'], // pedido 099 (E3.20)
        ...['S1'], // pedido 099 (D4, Q-099-5b = A)
        ...['O8'], // pedido 099 (A4, Q-099-4): tempo real; divisão por tamanho sem dado real
        ...['O16'], // pedido 099 (lote C8)
        ...['S5', 'S6', 'S7'], // pedido 105 (D2): só os cinco fluxos do PROC
        ...['O12'], // pedido 099 (E3.223)
        ...['O15'], // pedido 105 (E7.5)
        ...['O18'], // pedido 105 (E7.4)
        ...['S11'], // pedido 105 (D6a, Decisão 18b do 099)
        ...['T10'], // pedido 105 (E7.77): tempo total esperando fornecedores
        ...['T9'], // pedido 105 (E7.68, D-T9 "T9 A")
        ...['T11'], // pedido 105 (E7.64, D-T11 "A")
      ].sort(),
    )
  })

  it('sustentação: EI_SUST segue sem dado real com o seu motivo; S1 (D4), S9 (D5a), S5, S6 e S7 (pedido 105, D2) e S11 (pedido 105, D6a) são reais', () => {
    expect(origemDaMetrica('S1')).toBe('real')
    expect(motivoDaOrigemSemDado('S1')).toBeNull()
    for (const id of ['S5', 'S6', 'S7'] as const) {
      expect(origemDaMetrica(id), id).toBe('real')
      expect(motivoDaOrigemSemDado(id), id).toBeNull()
    }
    // Pedido 105 (D6a): S11 real pela Decisão 18b; só a conversão fica sem fonte, com motivo próprio no resultado (não no mapa).
    expect(origemDaMetrica('S11')).toBe('real')
    expect(motivoDaOrigemSemDado('S11')).toBeNull()
    expect(MOTIVO_ORIGEM_MOCK).not.toHaveProperty('S11')
    expect(MOTIVO_S11_CONVERSAO_SEM_DADO_REAL).toMatch(/^[A-ZÀ-Ý].*\.$/)
    expect(MOTIVO_S11_CONVERSAO_SEM_DADO_REAL).not.toMatch(/fict|mock|simulad/i)
    // Pedido 099 (D5a): S9 é real pelas esperas decididas; sem motivo de dado fictício.
    expect(origemDaMetrica('S9')).toBe('real')
    expect(motivoDaOrigemSemDado('S9')).toBeNull()
    // Pedido 099 (D9): S12 é real só com o volume; sem motivo de dado fictício.
    expect(origemDaMetrica('S12')).toBe('real')
    expect(motivoDaOrigemSemDado('S12')).toBeNull()
    expect(origemDaMetrica('EI_SUST')).toBe('sem-dado')
    expect(motivoDaOrigemSemDado('EI_SUST')).toBe('cálculo ainda não definido para o Acelerato')
  })

  it('métrica de sustentação real não tem motivo de dado fictício', () => {
    for (const id of ['S2', 'S3', 'S4', 'S8', 'S10'] as const) {
      expect(origemDaMetrica(id), id).toBe('real')
      expect(motivoDaOrigemSemDado(id), id).toBeNull()
    }
  })

  it('O15 é real pela fase de detecção (pedido 105, E7.5), sem motivo de mock', () => {
    expect(METRICAS_ORIGEM_REAL.has('O15')).toBe(true)
    expect(origemDaMetrica('O15')).toBe('real')
    expect(motivoDaOrigemSemDado('O15')).toBeNull()
  })

  it('é sem dado, com o motivo, para O14', () => {
    for (const id of ['O14'] as const) {
      expect(origemDaMetrica(id)).toBe('sem-dado')
      expect(motivoDaOrigemSemDado(id)).toBe('aguardando campo no quadro')
    }
  })

  it('O18 é real pelos vínculos do BusinessMap (pedido 105, E7.4), sem motivo de dado fictício', () => {
    expect(origemDaMetrica('O18')).toBe('real')
    expect(motivoDaOrigemSemDado('O18')).toBeNull()
  })

  it('O12 é real pelo prazo do card (pedido 099, E3.223); a parte de responsabilidade tem motivo próprio no DTO', () => {
    expect(origemDaMetrica('O12')).toBe('real')
    expect(motivoDaOrigemSemDado('O12')).toBeNull()
  })

  it('O8 é real no tempo em execução (pedido 099, A4, Q-099-4) e a divisão por tamanho tem motivo próprio', () => {
    expect(origemDaMetrica('O8')).toBe('real')
    expect(motivoDaOrigemSemDado('O8')).toBeNull()
    expect(MOTIVO_O8_POR_TAMANHO_SEM_DADO_REAL).toContain('tamanho')
  })

  it('O17 é real por sistema (pedido 099, B da Q-099-7) e a causa raiz tem motivo próprio', () => {
    expect(origemDaMetrica('O17')).toBe('real')
    expect(motivoDaOrigemSemDado('O17')).toBeNull()
    expect(MOTIVO_O17_CAUSA_RAIZ_SEM_DADO_REAL).toContain('texto livre')
  })

  it('O26 segue sem dado real, com motivo próprio que diz a data (pedido 105, E7.55)', () => {
    expect(origemDaMetrica('O26')).toBe('sem-dado')
    expect(motivoDaOrigemSemDado('O26')).toBe(MOTIVO_O26_HISTORICO_RESPONSAVEIS)
    expect(motivoSemDadoReal('O26')).toBe(
      'A base guarda a troca de responsável dos cards desde 09/11/2026; a métrica precisa de 12 semanas de histórico e passa a ter dado real a partir de 01/02/2027.',
    )
    expect(corpoSemDadoReal('O26').motivo).toBe(MOTIVO_O26_HISTORICO_RESPONSAVEIS)
  })

  it('FL2, FL3 e a Visão geral seguem mock, sem motivo próprio', () => {
    for (const id of ['T3', 'E1', 'VISAO_GERAL'] as const) {
      expect(origemDaMetrica(id)).toBe('sem-dado')
      expect(motivoDaOrigemSemDado(id)).toBeNull()
    }
  })

  it('métrica real não tem motivo de dado fictício', () => {
    expect(motivoDaOrigemSemDado('O1')).toBeNull()
  })
})

describe('notas de cartão', () => {
  it('O6 e o SLE (T2) levam a nota de classe; todo id de nota tem texto', () => {
    expect(NOTAS_FIXAS_DO_CARTAO.O6).toEqual(['sem-classe'])
    expect(NOTAS_FIXAS_DO_CARTAO.T2).toEqual(['sem-classe'])
    expect(TEXTO_NOTA_CARTAO['sem-classe']).toContain(
      'Cartões sem prioridade ficam fora da separação',
    )
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
    expect(motivoSemDadoReal('O14')).toBe('aguardando campo no quadro')
    expect(motivoSemDadoReal('VISAO_GERAL')).toBe(MOTIVO_FONTE_REAL_NAO_DEFINIDA)
    expect(motivoSemDadoReal('T3')).toBe(MOTIVO_FONTE_REAL_NAO_DEFINIDA)
  })

  it('o corpo não carrega número nem campo fora de estado, métrica e motivo', () => {
    const corpo = corpoSemDadoReal('S1')
    expect(Object.keys(corpo).sort()).toEqual(['estado', 'metrica', 'motivo'])
    expect(corpo.estado).toBe(ESTADO_SEM_DADO_REAL)
    expect(semDadoRealSchema.safeParse({ ...corpo, valor: 1 }).success).toBe(false)
    expect(semDadoRealSchema.safeParse({ ...corpo, motivo: '' }).success).toBe(false)
  })

  it('T-C2: o schema é strict e recusa simulavel', () => {
    const base = {
      estado: ESTADO_SEM_DADO_REAL,
      metrica: 'O12',
      motivo: 'aguardando campo no quadro',
    }
    expect(semDadoRealSchema.safeParse(base).success).toBe(true)
    expect(semDadoRealSchema.safeParse({ ...base, simulavel: true }).success).toBe(false)
    expect(semDadoRealSchema.safeParse({ ...base, valor: 1 }).success).toBe(false)
  })

  it('PV1 não tem motivo de dado fictício', () => {
    expect(motivoDaOrigemSemDado('PV1')).toBeNull()
  })

  it('C1/C2 (pedido 075, 6b): BLOQUEADOS, O5 e O19 são reais e sem motivo de mock; T12 segue fora do mapa real (o T10 entrou no pedido 105, E7.77), com o motivo genérico (SEG-A5)', () => {
    for (const id of ['BLOQUEADOS', 'O5', 'O19'] as const) {
      expect(METRICAS_ORIGEM_REAL.has(id), id).toBe(true)
      expect(origemDaMetrica(id), id).toBe('real')
      expect(motivoDaOrigemSemDado(id), id).toBeNull()
      expect(MOTIVO_ORIGEM_MOCK[id], id).toBeUndefined()
    }
    // T12 lê a mesma `fato_bloqueio`, mas espera a WS1 (P-075-12, "B"): nada muda para ele. O T10 virou real no pedido 105 (E7.77, opção A).
    expect(METRICAS_ORIGEM_REAL.has('T10')).toBe(true)
    expect(origemDaMetrica('T10')).toBe('real')
    expect(motivoDaOrigemSemDado('T10')).toBeNull()
    for (const id of ['T12'] as const) {
      expect(METRICAS_ORIGEM_REAL.has(id), id).toBe(false)
      expect(origemDaMetrica(id), id).toBe('sem-dado')
      expect(MOTIVO_ORIGEM_MOCK[id], id).toBeUndefined()
      expect(motivoSemDadoReal(id), id).toBe(MOTIVO_FONTE_REAL_NAO_DEFINIDA)
    }
  })

  it('C3 (pedido 075, 9b): O1 e O2 recusam a nota de bloqueio e id fora do contrato; O1 aceita null na parte de bloqueio; O5 segue no contrato anterior', () => {
    expect(notaCartaoIdSchema.safeParse('bloqueio-sem-dado-real').success).toBe(false)
    expect(Object.keys(TEXTO_NOTA_CARTAO)).toEqual(['sem-classe', 'sle-nao-definido'])
    expect(BLOQUEIOS_COM_DADO_REAL).toBe(true)
    for (const r of [resultadoO1, resultadoO2]) {
      const campo = r.shape.notas
      expect(campo.safeParse(['bloqueio-sem-dado-real']).success).toBe(false)
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

describe('notas do S5 e do S7 (pedido 105, D2)', () => {
  it('enum à parte, com texto próprio; o enum da sustentação e o do S1 não crescem', () => {
    for (const id of NOTA_MOTIVOS_IDS) {
      expect(TEXTO_NOTA_QUALQUER[id].length).toBeGreaterThan(0)
      expect(notaMotivosIdSchema.safeParse(id).success).toBe(true)
      expect(notaSustentacaoIdSchema.safeParse(id).success).toBe(false)
      expect(notaCartaoIdSchema.safeParse(id).success).toBe(false)
    }
    expect(MOTIVO_FLUXOS_PROC_NAO_CARREGADOS.length).toBeGreaterThan(0)
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
    // Pedido 105 (D2): o interruptor ligou com a versão de critério afeta S3 e S7; o campo já está projetado.
    expect(AJUSTE_PRIORIDADE_COM_FONTE).toBe(true)
  })

  it('pedido 099 (D9): a nota do S12 tem enum e texto próprios; o enum da sustentação não cresce', () => {
    expect(notaS12IdSchema.safeParse('excecao-sla-s12-sem-fonte').success).toBe(true)
    expect(notaSustentacaoIdSchema.safeParse('excecao-sla-s12-sem-fonte').success).toBe(false)
    expect(notaCartaoIdSchema.safeParse('excecao-sla-s12-sem-fonte').success).toBe(false)
    for (const id of NOTA_S12_IDS) expect(TEXTO_NOTA_QUALQUER[id].length).toBeGreaterThan(0)
    expect(resultadoS12.shape.notas.safeParse(['excecao-sla-s12-sem-fonte']).success).toBe(true)
    expect(resultadoS12.shape.excecaoSla.safeParse(null).success).toBe(true)
  })

  it('pedido 099 (D4): a nota do S1 tem enum e texto próprios; o enum da sustentação e o do S12 não crescem', () => {
    expect(notaS1IdSchema.safeParse('primeiro-atendimento-inclui-automatica').success).toBe(true)
    expect(
      notaSustentacaoIdSchema.safeParse('primeiro-atendimento-inclui-automatica').success,
    ).toBe(false)
    expect(notaS12IdSchema.safeParse('primeiro-atendimento-inclui-automatica').success).toBe(false)
    expect(notaCartaoIdSchema.safeParse('primeiro-atendimento-inclui-automatica').success).toBe(
      false,
    )
    for (const id of NOTA_S1_IDS) expect(TEXTO_NOTA_QUALQUER[id].length).toBeGreaterThan(0)
    expect(
      resultadoS1.shape.notas.safeParse(['primeiro-atendimento-inclui-automatica']).success,
    ).toBe(true)
    expect(resultadoS1.shape.notas.safeParse(['excecao-sla-sem-fonte']).success).toBe(false)
  })
})

describe('pedido 099 (O12): responsabilidade do atraso sem fonte', () => {
  it('o interruptor nasce desligado e o motivo diz que o prazo não diz de quem foi o atraso', () => {
    expect(RESPONSABILIDADE_ATRASO_COM_FONTE).toBe(false)
    expect(MOTIVO_O12_RESPONSABILIDADE_SEM_DADO_REAL).toContain('não de quem foi o atraso')
  })

  it('motivoResponsabilidade recusa texto vazio e aceita texto ou nulo', () => {
    const shape = resultadoO12.shape.motivoResponsabilidade
    expect(shape.safeParse('').success).toBe(false)
    expect(shape.safeParse(null).success).toBe(true)
    expect(shape.safeParse(MOTIVO_O12_RESPONSABILIDADE_SEM_DADO_REAL).success).toBe(true)
  })
})
