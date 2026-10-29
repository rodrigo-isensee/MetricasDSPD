import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { slug } from '@metricas-dspd/metricas/core'
import { gerarBaseMock, gerarExtensaoTambemMock } from '.'
import {
  CICLO_MEMBROS,
  PADRAO_MEMBRO_REF,
  gerarMembrosSimulados,
  outrosPublicavelPorCadastro,
  pessoasDistintas,
  type MembroSimulado,
} from './businessmap/membrosSimulados'

/**
 * K-112 (pedido 048): cadastro de membros por time, simulado. Cobre C3 (membros sintéticos, sem nome nem e-mail), C4 (o
 * cadastro não sai do gerador: nem na extensão que vai ao worker, nem ao armazenamento do navegador) e o item (5) das
 * propriedades do desenho (`outrosPublicavel` vem do cadastro). C1, C5 e C6 e os CA-5 a CA-7 dependem da tabela do
 * cadastro (fase 3): ficam sem objeto no mock.
 */
const AQUI = dirname(fileURLToPath(import.meta.url))
const RAIZ = join(AQUI, '..', '..', '..')
const base = gerarBaseMock()
const ext = gerarExtensaoTambemMock(base)
const nomes = base.bm.config.equipes.map((e) => e.nome)
const membros = gerarMembrosSimulados(nomes)
const porEquipe = (ms: readonly MembroSimulado[]) => {
  const m = new Map<string, number>()
  for (const x of ms) m.set(x.equipe, (m.get(x.equipe) ?? 0) + 1)
  return m
}

function arquivos(dir: string, acc: string[] = []): string[] {
  for (const nome of readdirSync(dir)) {
    if (nome === 'node_modules' || nome === 'dist') continue
    const caminho = join(dir, nome)
    if (statSync(caminho).isDirectory()) arquivos(caminho, acc)
    else if (/\.(ts|tsx)$/.test(nome)) acc.push(caminho)
  }
  return acc
}

describe('C3: membros simulados são sintéticos (sem nome, e-mail nem dado real)', () => {
  it('cada membro é só { membroRef, equipe }, com membroRef no padrão sim-NNN e equipe de uma equipe da base', () => {
    expect(membros.length).toBeGreaterThan(0)
    const slugs = new Set(nomes.map(slug))
    for (const m of membros) {
      expect(Object.keys(m).sort()).toEqual(['equipe', 'membroRef'])
      expect(m.membroRef).toMatch(PADRAO_MEMBRO_REF)
      expect(slugs.has(m.equipe)).toBe(true)
    }
    expect(new Set(membros.map((m) => m.membroRef)).size).toBe(membros.length)
    expect(membros.map((m) => m.membroRef)[0]).toBe('sim-001')
  })

  it('o cadastro não contém nome nem e-mail: nenhum valor da base de pessoas, nenhum "@", nenhum campo de pessoa', () => {
    const pessoas = new Set<string>()
    for (const c of base.bm.cards) for (const r of c.responsaveis) pessoas.add(r)
    expect(pessoas.size).toBeGreaterThan(3)
    const txt = JSON.stringify(membros)
    expect(txt).not.toContain('@')
    for (const p of pessoas) expect(txt, p).not.toContain(p)
    for (const chave of ['nome', 'email', 'e-mail', 'mail', 'usuario', 'login'])
      expect(txt.toLowerCase(), chave).not.toContain(`"${chave}"`)
    // só `sim-NNN` e o slug da equipe: nada mais é texto livre
    for (const m of membros) expect(m.membroRef.replace(/[0-9]/g, '#')).toBe('sim-###')
  })

  it('o código do cadastro não lê pessoa da base nem aceita valor de fora', () => {
    const codigo = readFileSync(join(AQUI, 'businessmap/membrosSimulados.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
    expect(codigo).not.toMatch(/responsaveis|usuario|pseudonimo|Math\.random|process\.env/)
  })
})

describe('K-112: distribuição fixa e determinística', () => {
  it('de 3 a 8 membros por equipe, exceto uma com exatamente 1 membro e uma com 0', () => {
    const qtd = porEquipe(membros)
    const contagens = nomes.map((n) => qtd.get(slug(n)) ?? 0)
    expect(contagens.filter((c) => c === 1)).toHaveLength(1)
    expect(contagens.filter((c) => c === 0)).toHaveLength(1)
    for (const c of contagens.filter((c) => c > 1)) {
      expect(c).toBeGreaterThanOrEqual(3)
      expect(c).toBeLessThanOrEqual(8)
    }
    expect(Math.min(...CICLO_MEMBROS)).toBeGreaterThanOrEqual(3)
    expect(Math.max(...CICLO_MEMBROS)).toBeLessThanOrEqual(8)
  })

  it('é o mesmo para qualquer semente e cada membro pertence a um só time', () => {
    const outra = gerarMembrosSimulados(
      gerarBaseMock({ semente: 7, escala: 0.2 }).bm.config.equipes.map((e) => e.nome),
    )
    expect(outra).toEqual(membros)
    expect(gerarMembrosSimulados(nomes)).toEqual(membros)
    const porRef = new Map<string, string>()
    for (const m of membros) {
      expect(porRef.has(m.membroRef)).toBe(false)
      porRef.set(m.membroRef, m.equipe)
    }
  })

  it('com 0, 1 ou 2 equipes não há exceção de 0 e 1 membro, e o padrão do id se mantém', () => {
    expect(gerarMembrosSimulados([])).toEqual([])
    for (const lista of [['A'], ['A', 'B']]) {
      const qtd = [...porEquipe(gerarMembrosSimulados(lista)).values()]
      expect(qtd).toHaveLength(lista.length)
      for (const c of qtd) expect(c).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('propriedade (5): outrosPublicavel vem do cadastro (Q-T14-10 = B, passos 1 a 5 do desenho)', () => {
  const m = (membroRef: string, equipe: string): MembroSimulado => ({ membroRef, equipe })

  it('equipe com 1 membro e equipe com 0 não publicam; duas equipes com 1 membro cada, sim', () => {
    const cadastro = [m('sim-001', 'a'), m('sim-002', 'b'), m('sim-003', 'c'), m('sim-004', 'c')]
    expect(outrosPublicavelPorCadastro(cadastro, new Set(['a']))).toBe(false) // 1 membro
    expect(outrosPublicavelPorCadastro(cadastro, new Set(['zero']))).toBe(false) // sem cadastro: 0
    expect(outrosPublicavelPorCadastro(cadastro, new Set(['a', 'zero']))).toBe(false) // 1 + 0
    expect(outrosPublicavelPorCadastro(cadastro, new Set(['a', 'b']))).toBe(true) // 1 + 1
    expect(outrosPublicavelPorCadastro(cadastro, new Set(['c']))).toBe(true) // 2 no mesmo time
    expect(outrosPublicavelPorCadastro(cadastro, new Set())).toBe(false) // nenhum card de outro time
  })

  it('o mesmo membro em dois times conta uma vez (ADR 0020, revisão 2)', () => {
    const cadastro = [m('sim-001', 'a'), m('sim-001', 'b')]
    expect(pessoasDistintas(cadastro, new Set(['a', 'b']))).toBe(1)
    expect(outrosPublicavelPorCadastro(cadastro, new Set(['a', 'b']))).toBe(false)
  })

  it('na base do mock, cada chave é pessoas distintas >= 2 nas equipes de outros times com card no projeto e no nível', () => {
    const porId = new Map(base.bm.cards.map((c) => [c.card_id, c]))
    const projetoDe = (c: (typeof base.bm.cards)[number]): string | null => {
      let atual: (typeof base.bm.cards)[number] | undefined = c
      for (let i = 0; i < 4 && atual; i++) {
        if (atual.granularidade === 'projeto') return atual.card_id
        atual = atual.card_pai ? porId.get(atual.card_pai) : undefined
      }
      return null
    }
    const ativa = (c: (typeof base.bm.cards)[number]) =>
      !c.eh_subtarefa && c.excluido_em === null && c.motivo_descarte === null
    let verdadeiras = 0
    let falsas = 0
    for (const [chave, valor] of Object.entries(ext.outrosPublicavel)) {
      const [projeto, meu, g] = chave.split('|') as [string, string, string]
      const equipes = new Set<string>()
      for (const c of base.bm.cards) {
        if (c.granularidade !== g || !ativa(c) || projetoDe(c) !== projeto) continue
        const v = ext.equipeResponsavel[c.card_id]
        if (typeof v === 'string' && slug(v) !== meu) equipes.add(slug(v))
      }
      expect(valor, chave).toBe(pessoasDistintas(membros, equipes) >= 2)
      if (valor) verdadeiras++
      else falsas++
    }
    expect(verdadeiras).toBeGreaterThan(0)
    expect(falsas).toBeGreaterThan(0)
  })

  it('não há sorteio: a extensão é a mesma duas vezes e o booleano só muda se os cards ou o cadastro mudarem', () => {
    expect(gerarExtensaoTambemMock(base).outrosPublicavel).toEqual(ext.outrosPublicavel)
  })
})

describe('C4: o cadastro não chega ao worker nem ao armazenamento do navegador como pessoa', () => {
  it('a extensão (o que atravessa o postMessage) não tem membro, membroRef, sim-NNN nem contagem de pessoas', () => {
    const txt = JSON.stringify(ext)
    expect(txt).not.toMatch(/sim-\d{3}/)
    expect(txt).not.toMatch(/membro|pessoas/i)
    expect(Object.keys(ext).join(' ')).not.toMatch(/membro|pessoa/i)
    for (const v of Object.values(ext.outrosPublicavel)) expect(typeof v).toBe('boolean')
  })

  it('o cadastro não é exportado pelo pacote e só o gerador da extensão o importa; o front não o referencia', () => {
    const indices = ['index.ts', 'businessmap/index.ts'].map((f) =>
      readFileSync(join(AQUI, f), 'utf8'),
    )
    for (const i of indices) expect(i).not.toMatch(/membrosSimulados|MembroSimulado/)
    const importadores = arquivos(join(RAIZ, 'packages'))
      .concat(arquivos(join(RAIZ, 'server', 'src')), arquivos(join(RAIZ, 'web', 'src')))
      .filter(
        (f) => !/\.test\.tsx?$/.test(f) && f !== join(AQUI, 'businessmap/membrosSimulados.ts'),
      )
      .filter((f) => /membrosSimulados|gerarMembrosSimulados/.test(readFileSync(f, 'utf8')))
      .map((f) => relative(RAIZ, f))
    expect(importadores).toEqual(['packages/mock/src/businessmap/extensaoTambemFase2.ts'])
  })

  it('nenhum id de membro no código do front nem do servidor (logo, nada vai a localStorage, sessionStorage nem IndexedDB)', () => {
    const fontes = arquivos(join(RAIZ, 'web', 'src')).concat(arquivos(join(RAIZ, 'server', 'src')))
    for (const f of fontes.filter((x) => !/\.test\.tsx?$/.test(x))) {
      const t = readFileSync(f, 'utf8')
      expect(t, relative(RAIZ, f)).not.toMatch(/membroRef|sim-\d{3}/)
    }
  })
})
