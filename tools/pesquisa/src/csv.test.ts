import { describe, expect, it } from 'vitest'
import { validarCsv, validarOQueMudou, MAX_LINHAS, type ReferenciaCarga } from './csv.ts'

const REF: ReferenciaCarga = { areas: ['comercial', 'financeiro'], perguntas: ['p1', 'p2'] }
const CAB = 'trimestre,area,pergunta,f1,f2,f3,f4,f5,convidados'
const T = '2026-T3'
const csv = (...linhas: string[]): string => [CAB, ...linhas].join('\n')
const BOM = [
  `${T},comercial,p1,0,1,2,3,4,12`,
  `${T},comercial,p2,1,1,2,3,3,12`,
  `${T},financeiro,p1,0,0,1,1,1,5`,
  `${T},financeiro,p2,0,0,0,2,1,5`,
]
const regras = (texto: string): string[] => {
  const r = validarCsv(texto, T, REF)
  return r.ok ? [] : r.erros.map((e) => `${e.linha ?? '-'}:${e.coluna ?? '-'}:${e.regra}`)
}

describe('validarCsv', () => {
  it('aceita o arquivo correto (CRLF, BOM e linha final vazia incluídos)', () => {
    const r = validarCsv('﻿' + [CAB, ...BOM].join('\r\n') + '\r\n', T, REF)
    expect(r.ok && r.linhas).toHaveLength(4)
    expect(r.ok && r.linhas[0]).toEqual({
      trimestre: T,
      area: 'comercial',
      pergunta: 'p1',
      f1: 0,
      f2: 1,
      f3: 2,
      f4: 3,
      f5: 4,
      convidados: 12,
    })
  })

  it('recusa cabeçalho diferente, coluna extra (citando o nome) e coluna ausente; e a ordem trocada', () => {
    expect(regras(csv(...BOM).replace(CAB, `${CAB},email`))).toEqual(['1:email:coluna-extra'])
    expect(regras(csv(...BOM).replace(CAB, `${CAB},comentario`))).toEqual([
      '1:comentario:coluna-extra',
    ])
    expect(regras(csv(...BOM).replace(',convidados', ''))).toEqual(['1:convidados:coluna-ausente'])
    expect(regras(csv(...BOM).replace('area,pergunta', 'pergunta,area'))).toEqual([
      '1:-:cabecalho-diferente',
    ])
  })

  it('o nome de uma coluna extra com e-mail ou texto livre não vaza para o erro', () => {
    const erros = regras(csv(...BOM).replace(CAB, `${CAB},joao@empresa.com,um texto livre`))
    expect(erros).toEqual(['1:(nome inválido):coluna-extra', '1:(nome inválido):coluna-extra'])
    expect(erros.join()).not.toMatch(/joao|livre/)
  })

  it('recusa aspas, arquivo vazio, só cabeçalho e arquivo grande', () => {
    expect(regras(csv(`${T},"comercial",p1,0,0,0,0,0,0`))).toEqual(['-:-:aspas-nao-suportadas'])
    expect(regras('')).toEqual(['-:-:arquivo-vazio'])
    expect(regras(CAB)).toEqual(['-:-:sem-linhas'])
    expect(regras(csv(...Array(MAX_LINHAS + 1).fill(BOM[0])))).toEqual(['-:-:arquivo-grande'])
  })

  it('recusa linha com número de colunas errado e número inválido (sem repetir o conteúdo)', () => {
    expect(regras(csv(`${T},comercial,p1,0,0,0,0,0`))).toEqual(['2:-:numero-de-colunas'])
    expect(regras(csv(`${T},comercial,p1,0,x,0,-1,1.5,3`))).toEqual([
      '2:f2:numero-invalido',
      '2:f4:numero-invalido',
      '2:f5:numero-invalido',
    ])
  })

  it('recusa pelo schema da linha: trimestre malformado, texto com @, respondentes acima dos convidados', () => {
    expect(regras(csv(`2026-3,comercial,p1,0,0,0,0,0,0`))).toEqual([
      '2:trimestre:schema:invalid_format',
    ])
    expect(regras(csv(`${T},joao@x.com,p1,0,0,0,0,0,0`))).toEqual(['2:area:schema:custom'])
    expect(regras(csv(`${T},comercial,p1,5,5,0,0,0,4`))).toEqual(['2:-:schema:custom'])
  })

  it('recusa trimestre diferente do argumento, área fora da lista e pergunta fora do questionário', () => {
    const outro = csv(...BOM.map((l) => l.replace(T, '2026-T2')))
    expect(regras(outro)).toEqual(
      Array(4)
        .fill(null)
        .map((_, i) => `${i + 2}:trimestre:trimestre-diferente-do-argumento`),
    )
    expect(regras(csv(...BOM, `${T},rh,p1,0,0,0,0,0,0`))).toContain('6:area:area-fora-da-lista')
    expect(regras(csv(...BOM, `${T},financeiro,p9,0,0,0,0,0,5`))).toContain(
      '6:pergunta:pergunta-fora-do-questionario',
    )
  })

  it('recusa área e pergunta repetidas, pergunta ausente, soma e convidados divergentes', () => {
    expect(regras(csv(...BOM, BOM[0]!))).toEqual(['6:-:area-e-pergunta-repetidas'])
    expect(regras(csv(BOM[0]!, BOM[2]!, BOM[3]!))).toEqual(['2:pergunta:pergunta-ausente-na-area'])
    expect(regras(csv(BOM[0]!, `${T},comercial,p2,1,1,2,3,2,12`, BOM[2]!, BOM[3]!))).toEqual([
      '3:-:soma-das-faixas-diverge-na-area',
    ])
    expect(regras(csv(BOM[0]!, `${T},comercial,p2,1,1,2,3,3,13`, BOM[2]!, BOM[3]!))).toEqual([
      '3:convidados:convidados-diverge-na-area',
    ])
  })

  it('o erro nunca carrega o conteúdo das células', () => {
    const r = validarCsv(
      csv(`${T},segredo@x.com,p1,0,0,0,0,0,0`, `${T},comercial,p1,7,x,0,0,0,9`),
      T,
      REF,
    )
    expect(JSON.stringify(r)).not.toMatch(/segredo|x\.com/)
  })
})

describe('validarOQueMudou', () => {
  it('aceita texto simples e normaliza as quebras de linha', () => {
    expect(validarOQueMudou('  Passamos a avisar o andamento.\r\nObrigado.  ')).toEqual({
      ok: true,
      texto: 'Passamos a avisar o andamento.\nObrigado.',
    })
    expect(validarOQueMudou('x'.repeat(500)).ok).toBe(true)
  })
  it.each([
    ['', 'vazio'],
    ['x'.repeat(501), 'mais-de-500-caracteres'],
    ['fale com ana@empresa.com', 'contem-email'],
    ['veja https://exemplo.com', 'contem-url'],
    ['veja WWW.exemplo.com', 'contem-url'],
    ['tem\u0007controle', 'caractere-de-controle'],
  ])('recusa %j (%s)', (texto, regra) => {
    const r = validarOQueMudou(texto)
    expect(!r.ok && r.erros.map((e) => e.regra)).toContain(regra)
  })
})
