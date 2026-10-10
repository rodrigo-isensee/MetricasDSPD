import { describe, expect, it } from 'vitest'
import { EQUIPES, equipeDoSistema, tituloFicticio } from './catalogos'

describe('catálogos fictícios do BusinessMap', () => {
  it('equipeDoSistema devolve a equipe dona do sistema e a primeira equipe para sistema desconhecido', () => {
    const equipe = EQUIPES[1] as (typeof EQUIPES)[number]
    const sistema = equipe.sistemas[0] as string
    expect(equipeDoSistema(sistema)).toBe(equipe.nome)
    expect(equipeDoSistema('Sistema inexistente')).toBe(EQUIPES[0].nome)
  })

  it('tituloFicticio monta títulos por tipo e usa um objeto genérico para sistema desconhecido', () => {
    expect(tituloFicticio(0, 'Protheus', 'Projeto')).toMatch(/^Programa .+ \(Protheus\)$/)
    expect(tituloFicticio(1, 'Protheus', 'Frente')).toMatch(/^Frente: .+ \(Protheus\)$/)
    expect(tituloFicticio(2, 'Protheus', 'Incidente')).toMatch(/^Falha em .+ \(Protheus\)$/)
    expect(tituloFicticio(3, 'Sistema inexistente', 'Projeto')).toBe(
      'Programa rotina (Sistema inexistente)',
    )
  })
})
