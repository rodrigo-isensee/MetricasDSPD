#!/usr/bin/env node
// CHANGELOG por fragmentos (pedido 105, K-377): cada PR grava o próprio arquivo em changelog.d/<branch-sem-prefixo>.md e
// um comando junta os fragmentos no CHANGELOG.md na promoção, apagando-os. Assim dois PRs nunca editam a mesma linha.
// Só biblioteca padrão. Roda na raiz do repositório (ou com --raiz <pasta>).
//
//   node scripts/changelog.mjs novo <Adicionado|Alterado|Corrigido> "<texto>"  grava na pasta, com o nome da branch
//   node scripts/changelog.mjs conferir                                        formato de todos os fragmentos (rc 1 se errado)
//   node scripts/changelog.mjs juntar                                          funde os fragmentos em "[Não publicado]" e os apaga
//   node scripts/changelog.mjs juntar <versão> <AAAA-MM-DD>                    idem e fecha: "[Não publicado]" vira "[versão] - data"
//   node scripts/changelog.mjs conferir-release                                gate da promoção: sobrou fragmento? (rc 1 se sobrou)
//
// Fragmento: `### <tipo>` seguido de linhas `- texto` (continuação com recuo de espaço). Não reescreve o histórico: só mexe
// na seção "[Não publicado]".
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const TIPOS = ['Adicionado', 'Alterado', 'Corrigido']
export const PASTA = 'changelog.d'
const PROTEGIDAS = new Set(['main', 'homolog', 'develop', 'HEAD'])
const CABECALHO = '## [Não publicado]'

/** Nome do fragmento de uma branch: o que vem depois do primeiro `/`, só com letras, dígitos, `.`, `_` e `-`. */
export function slugDaBranch(branch) {
  const resto = branch.includes('/') ? branch.slice(branch.indexOf('/') + 1) : branch
  return resto.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^[-.]+|[-.]+$/g, '')
}

/** {tipo: [entrada]} (entrada = linha `- texto` com as continuações); lança Error se o formato não é o esperado. */
export function lerFragmento(texto, nome) {
  const secoes = {}
  let atual = null
  for (const linha of texto.split('\n')) {
    if (!linha.trim()) continue
    const m = /^### (\w+)\s*$/.exec(linha)
    if (m) {
      if (!TIPOS.includes(m[1])) throw new Error(`${nome}: tipo '${m[1]}' inválido (use ${TIPOS.join(', ')}).`)
      atual = secoes[m[1]] ??= []
    } else if (atual && /^- \S/.test(linha)) {
      atual.push(linha)
    } else if (atual && atual.length && linha.startsWith(' ')) {
      atual[atual.length - 1] += `\n${linha}`
    } else {
      throw new Error(`${nome}: formato inválido; esperado '### <tipo>' seguido de linhas '- texto'.`)
    }
  }
  if (!Object.values(secoes).some((v) => v.length)) throw new Error(`${nome}: fragmento sem nenhuma linha.`)
  return secoes
}

export function escreverFragmento(secoes) {
  return TIPOS.filter((t) => secoes[t]?.length)
    .map((t) => `### ${t}\n\n${secoes[t].join('\n')}\n`)
    .join('\n')
}

export function listarFragmentos(raiz) {
  const pasta = join(raiz, PASTA)
  if (!existsSync(pasta)) return []
  return readdirSync(pasta)
    .filter((n) => n.endsWith('.md') && n.toLowerCase() !== 'readme.md')
    .sort()
}

/**
 * Funde as entradas no topo de cada subseção da seção "[Não publicado]" (cria a que faltar); o resto do arquivo, do
 * histórico das versões fechadas em diante, fica byte a byte igual. Com `fechar`, a seção vira "[versão] - data" e abre-se
 * uma "[Não publicado]" vazia acima dela.
 */
export function fundirNoChangelog(texto, entradasPorTipo, fechar) {
  const ini = texto.indexOf(CABECALHO)
  if (ini < 0) throw new Error('CHANGELOG.md sem a seção "## [Não publicado]".')
  const fimDoCab = texto.indexOf('\n', ini) + 1
  const prox = texto.indexOf('\n## ', fimDoCab)
  const fim = prox < 0 ? texto.length : prox + 1
  const corpo = texto.slice(fimDoCab, fim)

  // Inserção mínima: as entradas novas entram no topo da primeira subseção do tipo (as já existentes não são reordenadas
  // nem fundidas); o tipo que ainda não tem subseção ganha uma no fim da seção. Nada mais do corpo muda.
  let novoCorpo = corpo
  for (const t of TIPOS) {
    const novas = entradasPorTipo[t] ?? []
    if (!novas.length) continue
    const m = new RegExp(`^### ${t}[ \\t]*\\n\\n?`, 'm').exec(novoCorpo)
    if (m) {
      const pos = m.index + m[0].length
      novoCorpo = `${novoCorpo.slice(0, pos)}${novas.join('\n')}\n${/^\n|^-/.test(novoCorpo.slice(pos)) ? '' : '\n'}${novoCorpo.slice(pos)}`
    } else {
      novoCorpo = `${novoCorpo.replace(/\n*$/, '\n')}\n### ${t}\n\n${novas.join('\n')}\n`
    }
  }
  novoCorpo = novoCorpo.replace(/^\n*/, '\n').replace(/\n*$/, '\n')
  const secao = fechar
    ? `${CABECALHO}\n\n## [${fechar.versao}] - ${fechar.data}\n${novoCorpo}`
    : `${CABECALHO}\n${novoCorpo}`
  const resto = texto.slice(fim)
  return `${texto.slice(0, ini)}${secao}${resto ? `\n${resto}` : ''}`
}

export function conferir(raiz) {
  const erros = []
  for (const n of listarFragmentos(raiz)) {
    try {
      lerFragmento(readFileSync(join(raiz, PASTA, n), 'utf8'), `${PASTA}/${n}`)
    } catch (e) {
      erros.push(e.message)
    }
  }
  return erros
}

export function juntar(raiz, fechar) {
  const erros = conferir(raiz)
  if (erros.length) throw new Error(erros.join('\n'))
  const nomes = listarFragmentos(raiz)
  const acumulado = {}
  for (const n of nomes) {
    const s = lerFragmento(readFileSync(join(raiz, PASTA, n), 'utf8'), n)
    for (const t of TIPOS) if (s[t]) (acumulado[t] ??= []).push(...s[t])
  }
  const arq = join(raiz, 'CHANGELOG.md')
  const texto = readFileSync(arq, 'utf8')
  if (fechar && texto.includes(`## [${fechar.versao}]`)) throw new Error(`CHANGELOG.md já tem a versão ${fechar.versao}.`)
  writeFileSync(arq, fundirNoChangelog(texto, acumulado, fechar))
  for (const n of nomes) unlinkSync(join(raiz, PASTA, n))
  return nomes
}

function principal(argv) {
  const args = [...argv]
  let raiz = process.cwd()
  const i = args.indexOf('--raiz')
  if (i >= 0) raiz = args.splice(i, 2)[1]
  const [cmd, ...r] = args
  try {
    if (cmd === 'novo') {
      const [tipo, texto] = r
      if (!TIPOS.includes(tipo) || !texto?.trim() || texto.includes('\n'))
        throw new Error(`uso: novo <${TIPOS.join('|')}> "<texto de uma linha>"`)
      const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: raiz, encoding: 'utf8' }).trim()
      if (PROTEGIDAS.has(branch)) throw new Error(`Branch '${branch}': rode numa branch de trabalho.`)
      const slug = slugDaBranch(branch)
      if (!slug) throw new Error(`Sem nome de arquivo a partir da branch '${branch}'.`)
      const arq = join(raiz, PASTA, `${slug}.md`)
      const secoes = existsSync(arq) ? lerFragmento(readFileSync(arq, 'utf8'), arq) : {}
      ;(secoes[tipo] ??= []).push(`- ${texto.trim()}`)
      mkdirSync(join(raiz, PASTA), { recursive: true })
      writeFileSync(arq, escreverFragmento(secoes))
      console.log(`gravado em ${PASTA}/${slug}.md`)
    } else if (cmd === 'conferir') {
      const erros = conferir(raiz)
      if (erros.length) {
        console.error(erros.join('\n'))
        return 1
      }
      console.log(`changelog: ${listarFragmentos(raiz).length} fragmento(s) válido(s).`)
    } else if (cmd === 'juntar') {
      const [versao, data] = r
      if (versao && (!/^\d+\.\d+\.\d+$/.test(versao) || !/^\d{4}-\d{2}-\d{2}$/.test(data ?? '')))
        throw new Error('uso: juntar [<X.Y.Z> <AAAA-MM-DD>]')
      const nomes = juntar(raiz, versao ? { versao, data } : null)
      console.log(
        `changelog: ${nomes.length} fragmento(s) juntado(s) e apagado(s)${versao ? `; versão ${versao} fechada` : ''}.`,
      )
    } else if (cmd === 'conferir-release') {
      const sobras = listarFragmentos(raiz)
      if (sobras.length) {
        console.error(`sobrou fragmento em ${PASTA}/: ${sobras.join(', ')} (rode "juntar <versão> <data>").`)
        return 1
      }
      console.log('changelog: nenhum fragmento pendente.')
    } else {
      console.error('uso: changelog.mjs novo|conferir|juntar|conferir-release (veja o cabeçalho do arquivo)')
      return 2
    }
    return 0
  } catch (e) {
    console.error(e.message)
    return 1
  }
}

if (import.meta.url === `file://${process.argv[1]}`) process.exit(principal(process.argv.slice(2)))
