import { slug } from '@metricas-dspd/metricas/core'

/**
 * Cadastro de membros por time, SIMULADO (pedido 048, K-112; ADR 0020, revisão 2; desenho `048-t14-mock.md`, seção 1).
 * Só o gerador da extensão lê esta lista, para decidir `outrosPublicavel` (Q-T14-10 = B: pessoa = membro cadastrado).
 * Nada daqui sai da extensão: o contrato, o `postMessage` do worker e o armazenamento do navegador só recebem o booleano
 * (C3 e C4 do parecer 048-t14-ameacas). `membroRef` é opaco e sintético (`sim-NNN`): sem nome, e-mail, id do BusinessMap
 * nem valor derivado de dado real. Cada membro simulado pertence a UM só time (a fase 3 pode ter pessoa em dois times).
 */
export interface MembroSimulado {
  /** Id opaco e sintético, padrão `^sim-\d{3}$`. */
  readonly membroRef: string
  /** Slug de uma equipe da base. */
  readonly equipe: string
}

export const PADRAO_MEMBRO_REF = /^sim-\d{3}$/

/** De 3 a 8 membros, por posição da equipe (ciclo fixo, sem sorteio: o cadastro é o mesmo para qualquer semente). */
export const CICLO_MEMBROS = [5, 4, 6, 3, 7, 8] as const

/**
 * Distribuição fixa e determinística: cada equipe recebe de 3 a 8 membros, EXCETO a penúltima da lista, com exatamente 1
 * membro (existe "outros times" oculto por cadastro), e a antepenúltima, com 0 (equipe sem cadastro: conta zero, o lado
 * seguro). Com menos de 3 equipes não há exceção. Os ids seguem a ordem das equipes.
 */
export function gerarMembrosSimulados(nomesEquipe: readonly string[]): MembroSimulado[] {
  const n = nomesEquipe.length
  const membros: MembroSimulado[] = []
  let proximo = 1
  nomesEquipe.forEach((nome, i) => {
    const quantos =
      n >= 3 && i === n - 3
        ? 0
        : n >= 3 && i === n - 2
          ? 1
          : (CICLO_MEMBROS[i % CICLO_MEMBROS.length] as number)
    for (let m = 0; m < quantos; m++)
      membros.push({ membroRef: `sim-${String(proximo++).padStart(3, '0')}`, equipe: slug(nome) })
  })
  return membros
}

/**
 * Pessoas distintas (por `membroRef`) nas equipes dadas (slugs). Um membro em duas equipes conta uma vez (ADR 0020,
 * revisão 2); equipe sem cadastro conta zero. Saída é inteiro e fica no gerador: nunca chega à extensão (C2, C4).
 */
export function pessoasDistintas(
  membros: readonly MembroSimulado[],
  equipes: ReadonlySet<string>,
): number {
  const refs = new Set<string>()
  for (const m of membros) if (equipes.has(m.equipe)) refs.add(m.membroRef)
  return refs.size
}

/** Passo 3 do desenho: "outros times" é publicável com 2 ou mais pessoas; sem equipe de outros times, falso (Q-T14-10 = B). */
export const outrosPublicavelPorCadastro = (
  membros: readonly MembroSimulado[],
  equipesDeOutros: ReadonlySet<string>,
): boolean => pessoasDistintas(membros, equipesDeOutros) >= 2
