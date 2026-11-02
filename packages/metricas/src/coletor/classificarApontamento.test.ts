import fc from 'fast-check'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  LIMITE_GENERICO_PALAVRAS,
  MASCARA_FLAG,
  MAX_PONTOS_DE_CODIGO,
  MAX_QTD_PALAVRAS,
  SUBGRUPO_EXECUCAO_TECNICA,
  SUBGRUPO_NAO_CLASSIFICADO,
  classificarApontamento,
  flagsDaMascara,
  mascaraDeFlags,
  normalizarTexto,
  palavrasDe,
  type DicionarioApontamento,
} from './index'

const AQUI = dirname(fileURLToPath(import.meta.url))
const fonte = (rel: string) => readFileSync(join(AQUI, rel), 'utf8')

const KAIZEN = '501' // ids sintéticos: o real só se conhece na carga do dicionário
const INCIDENTE = '502'
const TAREFA = '503'

/** As 12 linhas da seção 4 da especificação, na forma do `ref:sync` (docs/architecture/features/059-dicionario-apontamento.md). */
const DICIONARIO: DicionarioApontamento = {
  versao: 'teste-v1',
  termos: [
    { prioridade: 2, subgrupo: 'testes', termos: ['teste', 'homolog'] },
    {
      prioridade: 3,
      subgrupo: 'reunioes-comunicacao',
      termos: ['reuni', 'call', 'meet', 'alinhament'],
    },
    { prioridade: 4, subgrupo: 'analise-diagnostico', termos: ['analise', 'diagnostic'] },
    { prioridade: 5, subgrupo: 'gestao-mudanca', termos: ['rdm', 'gmud', 'mudanca'] },
    { prioridade: 6, subgrupo: 'documentacao', termos: ['document'] },
    {
      prioridade: 7,
      subgrupo: 'configuracao-infra',
      termos: ['configuracao', 'infraestrutura', 'ambiente'],
    },
    { prioridade: 8, subgrupo: 'apoio-areas', termos: ['apoio'] },
    {
      prioridade: 9,
      subgrupo: 'desenvolvimento-correcao',
      termos: [
        'desenvolv',
        'ajuste',
        'correcao',
        'debug',
        'implement',
        'criacao',
        'rotina',
        'fonte',
        'script',
      ],
    },
  ],
  regrasPorTipo: [
    { prioridade: 1, subgrupo: 'gestao-backlog-rituais', typeId: KAIZEN, condicao: 'sempre' },
    {
      prioridade: 10,
      subgrupo: 'incidente-sem-detalhe',
      typeId: INCIDENTE,
      condicao: 'sem-comentario',
    },
  ],
}

const classe = (comentario: string | null, typeId: string | null = TAREFA) =>
  classificarApontamento({ comentario, typeId }, DICIONARIO)
const sub = (comentario: string | null, typeId: string | null = TAREFA) =>
  classe(comentario, typeId).subgrupo

describe('classificarApontamento: as 12 regras da seção 4, na ordem', () => {
  const casos: [string, string | null, string, string][] = [
    [
      '1 tipo Kaizen, qualquer comentário',
      'planejamento da sprint',
      'gestao-backlog-rituais',
      KAIZEN,
    ],
    ['1 tipo Kaizen, comentário vazio', '', 'gestao-backlog-rituais', KAIZEN],
    ['2 teste', 'Rodei os testes integrados da fila', 'testes', TAREFA],
    ['2 homolog', 'homologação com a área', 'testes', TAREFA],
    ['3 reuni', 'reunião semanal', 'reunioes-comunicacao', TAREFA],
    ['3 call', 'call de status', 'reunioes-comunicacao', TAREFA],
    ['3 meet', 'meet com fornecedor', 'reunioes-comunicacao', TAREFA],
    ['3 alinhament', 'alinhamento de escopo', 'reunioes-comunicacao', TAREFA],
    ['4 analise', 'Análise do problema', 'analise-diagnostico', TAREFA],
    ['4 diagnostic', 'diagnóstico da lentidão', 'analise-diagnostico', TAREFA],
    ['5 rdm', 'abri a RDM', 'gestao-mudanca', TAREFA],
    ['5 gmud', 'GMUD de sábado', 'gestao-mudanca', TAREFA],
    ['5 mudanca', 'mudança aprovada', 'gestao-mudanca', TAREFA],
    ['6 document', 'documentação do fluxo', 'documentacao', TAREFA],
    ['7 configuracao', 'configuração do job', 'configuracao-infra', TAREFA],
    ['7 infraestrutura', 'infraestrutura nova', 'configuracao-infra', TAREFA],
    ['7 ambiente', 'subi o ambiente', 'configuracao-infra', TAREFA],
    ['8 apoio', 'apoio ao financeiro', 'apoio-areas', TAREFA],
    ['9 desenvolv', 'desenvolvimento da tela', 'desenvolvimento-correcao', TAREFA],
    ['9 ajuste', 'ajuste fino', 'desenvolvimento-correcao', TAREFA],
    ['9 correcao', 'correção do relatório', 'desenvolvimento-correcao', TAREFA],
    ['9 debug', 'debug da fila', 'desenvolvimento-correcao', TAREFA],
    ['9 implement', 'implementei o filtro', 'desenvolvimento-correcao', TAREFA],
    ['9 criacao', 'criação da rotina', 'desenvolvimento-correcao', TAREFA],
    ['9 rotina', 'rotina noturna', 'desenvolvimento-correcao', TAREFA],
    ['9 fonte', 'fontes atualizadas', 'desenvolvimento-correcao', TAREFA],
    ['9 script', 'script de carga', 'desenvolvimento-correcao', TAREFA],
    ['10 incidente sem comentário', '   ', 'incidente-sem-detalhe', INCIDENTE],
    ['11 comentário sem termo', 'trabalhei no item combinado', SUBGRUPO_EXECUCAO_TECNICA, TAREFA],
    [
      '11 incidente com comentário sem termo',
      'trabalhei no item',
      SUBGRUPO_EXECUCAO_TECNICA,
      INCIDENTE,
    ],
    ['12 sem comentário', '', SUBGRUPO_NAO_CLASSIFICADO, TAREFA],
  ]
  it.each(casos)('%s', (_nome, comentario, esperado, typeId) => {
    expect(sub(comentario, typeId)).toBe(esperado)
  })

  it('comentário nulo e tipo nulo contam como sem comentário e sem regra de tipo', () => {
    expect(sub(null, null)).toBe(SUBGRUPO_NAO_CLASSIFICADO)
    expect(
      classificarApontamento({ comentario: null, typeId: null, categoriaId: '9' }, DICIONARIO)
        .subgrupo,
    ).toBe(SUBGRUPO_NAO_CLASSIFICADO)
  })

  it('a ordem manda: dois grupos no mesmo comentário vão para o de menor prioridade numérica', () => {
    expect(sub('teste de desenvolvimento')).toBe('testes') // 2 antes de 9
    expect(sub('reunião de análise')).toBe('reunioes-comunicacao') // 3 antes de 4
    expect(sub('ajuste de ambiente')).toBe('configuracao-infra') // 7 antes de 9
    expect(sub('reunião de planejamento', KAIZEN)).toBe('gestao-backlog-rituais') // 1 antes de 3
  })

  it('a prioridade vem do dicionário, não da posição na lista (desempate pelo código)', () => {
    const invertido: DicionarioApontamento = {
      versao: 'v',
      termos: [...DICIONARIO.termos].reverse(),
      regrasPorTipo: [...DICIONARIO.regrasPorTipo].reverse(),
    }
    expect(
      classificarApontamento({ comentario: 'teste de desenvolvimento', typeId: TAREFA }, invertido)
        .subgrupo,
    ).toBe('testes')
    const empate: DicionarioApontamento = {
      versao: 'v',
      termos: [
        { prioridade: 1, subgrupo: 'b-grupo', termos: ['x'] },
        { prioridade: 1, subgrupo: 'a-grupo', termos: ['x'] },
      ],
      regrasPorTipo: [],
    }
    expect(classificarApontamento({ comentario: 'x', typeId: null }, empate).subgrupo).toBe(
      'a-grupo',
    )
  })

  it('dicionário vazio: só os residuais', () => {
    const vazio: DicionarioApontamento = { versao: 'v0', termos: [], regrasPorTipo: [] }
    expect(classificarApontamento({ comentario: 'teste', typeId: KAIZEN }, vazio).subgrupo).toBe(
      SUBGRUPO_EXECUCAO_TECNICA,
    )
    expect(classificarApontamento({ comentario: '', typeId: KAIZEN }, vazio).subgrupo).toBe(
      SUBGRUPO_NAO_CLASSIFICADO,
    )
  })
})

describe('normalização e casamento por início de palavra (C-6)', () => {
  it('normalizarTexto: minúsculas, sem acento, espaços colapsados e aparados', () => {
    expect(normalizarTexto('  ANÁLISE   da   Configuração\t\nÇ  ')).toBe(
      'analise da configuracao c',
    )
    expect(normalizarTexto('')).toBe('')
  })

  it('caixa e acento não mudam o resultado', () => {
    expect(sub('Análise')).toBe('analise-diagnostico')
    expect(sub('ANALISE')).toBe('analise-diagnostico')
    expect(sub('analise')).toBe('analise-diagnostico')
    expect(sub('configuracao sem acento')).toBe('configuracao-infra')
  })

  it('casa no início de palavra, inclusive depois de pontuação, e não no meio', () => {
    expect(sub('reunioes')).toBe('reunioes-comunicacao')
    expect(sub('(reunião)')).toBe('reunioes-comunicacao')
    expect(sub('daily/call')).toBe('reunioes-comunicacao')
    expect(sub('coreuniao')).toBe(SUBGRUPO_EXECUCAO_TECNICA)
    expect(sub('contestei o valor')).toBe(SUBGRUPO_EXECUCAO_TECNICA) // "teste" dentro de "contestei"
    expect(sub('recall do lote')).toBe(SUBGRUPO_EXECUCAO_TECNICA) // "call" dentro de "recall"
    expect(sub('3teste')).toBe(SUBGRUPO_EXECUCAO_TECNICA) // dígito antes também é palavra
  })

  it('termo com metacaractere nunca vira expressão regular: não lança e não casa (o ref:sync o recusa)', () => {
    const d: DicionarioApontamento = {
      versao: 'v',
      termos: [{ prioridade: 1, subgrupo: 'g', termos: ['a.b', 'c+', '(d', '[', '\\'] }],
      regrasPorTipo: [],
    }
    const c = (t: string) => classificarApontamento({ comentario: t, typeId: null }, d).subgrupo
    for (const t of ['a.b', 'axb', 'c+ ok', '(d', '[ ]', '\\'])
      expect(c(t)).toBe(SUBGRUPO_EXECUCAO_TECNICA)
  })

  it('A1: letra fora de a-z e 0-9 antes do termo é parte da palavra (øteste não casa teste)', () => {
    for (const t of ['øteste', 'ßteste', 'łteste', 'θteste', 'яteste', 'ᴀteste'])
      expect(sub(t)).toBe(SUBGRUPO_EXECUCAO_TECNICA)
    expect(sub('teste')).toBe('testes')
    expect(sub('øteste teste')).toBe('testes')
  })

  it('A2: controle, formato e direção no meio do termo não o escondem', () => {
    for (const c of ['\u200b', '\u202e', '\u0000', '\u00ad', '\u200d', '\ufeff', '\u0085'])
      expect(sub(`re${c}uniao`)).toBe('reunioes-comunicacao')
    expect(normalizarTexto('re\u202euniao\u0000')).toBe('reuniao')
  })

  it('A2: surrogate isolado é removido e par válido (emoji) vira separador', () => {
    expect(normalizarTexto('re\ud800uniao')).toBe('reuniao')
    expect(normalizarTexto('re\udc00uniao')).toBe('reuniao')
    expect(sub('re\ud83d\ude00uniao')).toBe(SUBGRUPO_EXECUCAO_TECNICA) // emoji separa: "re" e "uniao"
    expect(sub('\ud83d\ude00 reuniao')).toBe('reunioes-comunicacao')
    expect(sub('\ud83d reuniao')).toBe('reunioes-comunicacao') // alto sem baixo
    expect(sub('\ude00 reuniao')).toBe('reunioes-comunicacao') // baixo sem alto
  })

  it('A2: palavras são sequências de letra e dígito, não de espaço', () => {
    expect(classe('- - -').qtdPalavras).toBe(0)
    expect(classe('teste,carga,geral,ok').qtdPalavras).toBe(4)
    expect(nomesDe('teste,carga,geral,ok')).not.toContain('generico')
    expect(classe('a_b c-d').qtdPalavras).toBe(4)
    expect(classe('RDM 1234').qtdPalavras).toBe(2)
    // marca de quem só tem pontuação: fica como antes até a decisão do dono (pergunta de 06:30)
    expect(nomesDe('- - -')).toEqual(['generico', 'sem-vinculo'])
    expect(nomesDe('\u200b\u0000')).toEqual(['sem-comentario', 'sem-vinculo'])
  })

  it('termo vazio (o ref:sync o recusa) casa só quando há alguma palavra', () => {
    const d: DicionarioApontamento = {
      versao: 'v',
      termos: [{ prioridade: 1, subgrupo: 'g', termos: [''] }],
      regrasPorTipo: [],
    }
    const c = (t: string) => classificarApontamento({ comentario: t, typeId: null }, d).subgrupo
    expect(c('qualquer')).toBe('g')
    expect(c('')).toBe(SUBGRUPO_NAO_CLASSIFICADO)
    expect(c('- -')).toBe(SUBGRUPO_EXECUCAO_TECNICA)
  })
})

describe('flags de qualidade (seção 5)', () => {
  const nomes = (c: string | null, t: string | null = TAREFA) => flagsDaMascara(classe(c, t).flags)

  it('completo = nenhuma flag: comentário com mais de 3 palavras e vínculo', () => {
    expect(classe('analise do problema de lentidao no job').flags).toBe(0)
    expect(nomes('analise do problema de lentidao')).toEqual([])
  })

  it('genérico: 3 palavras ou menos; 4 palavras já não é', () => {
    expect(LIMITE_GENERICO_PALAVRAS).toBe(3)
    expect(nomes('teste de carga')).toEqual(['generico'])
    expect(nomes('teste de carga  geral')).toEqual([])
    expect(classe('teste de carga').qtdPalavras).toBe(3)
  })

  it('sem vínculo: subgrupo execução técnica ou não classificado', () => {
    expect(nomes('trabalhei no item combinado ontem')).toEqual(['sem-vinculo'])
    expect(nomes('item')).toEqual(['generico', 'sem-vinculo'])
  })

  it('sem comentário: vazio, nulo ou só espaços; a contagem de palavras é 0', () => {
    for (const c of ['', '   ', null]) {
      expect(nomes(c)).toEqual(['sem-comentario', 'sem-vinculo'])
      expect(classe(c).qtdPalavras).toBe(0)
    }
    // regra por tipo que dá subgrupo com vínculo não traz a flag de vínculo
    expect(nomes('', KAIZEN)).toEqual(['sem-comentario'])
    expect(nomes('', INCIDENTE)).toEqual(['sem-comentario'])
  })

  it('flags não excludentes e máscara de lista fechada na ordem do contrato', () => {
    expect(MASCARA_FLAG).toEqual({
      'sem-comentario': 1,
      generico: 2,
      'sem-vinculo': 4,
      'sem-iniciativa': 8,
      'valor-atipico': 16,
    })
    expect(mascaraDeFlags([])).toBe(0)
    expect(mascaraDeFlags(['generico', 'sem-vinculo'])).toBe(6)
    expect(flagsDaMascara(31)).toEqual([
      'sem-comentario',
      'generico',
      'sem-vinculo',
      'sem-iniciativa',
      'valor-atipico',
    ])
    expect(flagsDaMascara(0)).toEqual([])
    expect(Object.isFrozen(MASCARA_FLAG)).toBe(true)
  })

  it('a classificação nunca liga as flags da projeção (sem-iniciativa, valor-atipico)', () => {
    expect(
      classe('').flags & (MASCARA_FLAG['sem-iniciativa'] | MASCARA_FLAG['valor-atipico']),
    ).toBe(0)
  })

  it('a entrada é truncada em 2000 pontos de código e a versão do dicionário acompanha o resultado (A4)', () => {
    const longo = Array.from({ length: MAX_QTD_PALAVRAS + 10 }, () => 'a').join(' ')
    expect(classe(longo).qtdPalavras).toBe(MAX_PONTOS_DE_CODIGO / 2) // "a a a ..." em 2000 pontos = 1000 palavras
    expect(classe('x').versaoDicionario).toBe('teste-v1')
  })

  it('A4: o que passa de 2000 pontos de código não conta nem casa; emoji conta como um ponto', () => {
    const base = 'x'.repeat(MAX_PONTOS_DE_CODIGO - 1)
    expect(sub(`${base} reuniao`)).toBe(SUBGRUPO_EXECUCAO_TECNICA) // o espaço é o ponto 2000, o termo cai fora
    expect(classe(`${base} reuniao`).qtdPalavras).toBe(1)
    expect(sub(`${'😀'.repeat(MAX_PONTOS_DE_CODIGO - 8)} reuniao`)).toBe('reunioes-comunicacao') // cabe: 1992 + espaço + 7
    expect(classe(`${'😀'.repeat(MAX_PONTOS_DE_CODIGO)}z`).qtdPalavras).toBe(0) // truncou antes do z
    expect(classe('x'.repeat(MAX_PONTOS_DE_CODIGO + 500)).qtdPalavras).toBe(1)
    expect(classe('y '.repeat(MAX_PONTOS_DE_CODIGO)).qtdPalavras).toBe(MAX_PONTOS_DE_CODIGO / 2)
  })
})

// ---------- propriedades ----------
const VOCABULARIO = [
  'Análise', 'REUNIÃO', 'teste', 'Configuração', 'ajuste', 'Apoio', 'RDM', 'documentação', 'trabalho',
  'item', 'ontem', 'fila', 'Mudança', 'script', 'planejamento', 'coreuniao', 'contestei', 'xyz',
] // prettier-ignore
const comentario = fc
  .array(fc.constantFrom(...VOCABULARIO), { maxLength: 8 })
  .map((p) => p.join(' '))
const tipo = fc.constantFrom(KAIZEN, INCIDENTE, TAREFA, null)
const OPCOES = { numRuns: 400, seed: 20261101 }

describe('propriedades da classificação', () => {
  it('caixa, acento e espaços repetidos não mudam o resultado', () => {
    fc.assert(
      fc.property(comentario, tipo, fc.integer({ min: 1, max: 4 }), (c, t, n) => {
        const base = classe(c, t)
        expect(classe(c.toUpperCase(), t)).toEqual(base)
        expect(classe(c.normalize('NFD').replace(/\p{M}/gu, ''), t)).toEqual(base)
        expect(classe(c.split(' ').join(' '.repeat(n)), t)).toEqual(base)
        expect(classe(` ${c} `, t)).toEqual(base)
      }),
      OPCOES,
    )
  })

  it('é pura: mesma entrada, mesmo resultado, e o dicionário não é alterado', () => {
    const copia = JSON.stringify(DICIONARIO)
    fc.assert(
      fc.property(comentario, tipo, (c, t) => {
        expect(classe(c, t)).toEqual(classe(c, t))
      }),
      OPCOES,
    )
    expect(JSON.stringify(DICIONARIO)).toBe(copia)
  })

  it('o resultado só tem os quatro campos, de lista fechada, e nunca repete o comentário', () => {
    const fechados = new Set([
      ...DICIONARIO.termos.map((r) => r.subgrupo),
      ...DICIONARIO.regrasPorTipo.map((r) => r.subgrupo),
      SUBGRUPO_EXECUCAO_TECNICA,
      SUBGRUPO_NAO_CLASSIFICADO,
    ])
    fc.assert(
      fc.property(fc.stringMatching(/^[A-Z]{8,12}$/), comentario, tipo, (marcador, c, t) => {
        const r = classe(`${marcador} ${c}`, t)
        expect(Object.keys(r).sort()).toEqual([
          'flags',
          'qtdPalavras',
          'subgrupo',
          'versaoDicionario',
        ])
        expect(fechados.has(r.subgrupo)).toBe(true)
        expect(Number.isInteger(r.flags)).toBe(true)
        expect(r.flags).toBeGreaterThanOrEqual(0)
        expect(r.flags).toBeLessThan(32)
        const saida = JSON.stringify(r)
        expect(saida).not.toContain(marcador)
        expect(saida.toLowerCase()).not.toContain(marcador.toLowerCase())
      }),
      OPCOES,
    )
  })

  it('subgrupo é o de menor prioridade entre os que casam; sem casar, só os residuais', () => {
    const regras = [
      ...DICIONARIO.termos.map((r) => ({
        p: r.prioridade,
        s: r.subgrupo,
        t: r.termos,
      })),
    ]
    fc.assert(
      fc.property(comentario, (c) => {
        const palavras = normalizarTexto(c).split(' ').filter(Boolean)
        const candidatos = regras
          .filter((r) => r.t.some((t) => palavras.some((w) => w.startsWith(t))))
          .sort((a, b) => a.p - b.p)
        const esperado =
          candidatos[0]?.s ??
          (palavras.length === 0 ? SUBGRUPO_NAO_CLASSIFICADO : SUBGRUPO_EXECUCAO_TECNICA)
        expect(sub(c)).toBe(esperado)
      }),
      OPCOES,
    )
  })

  it('prefixo de letra antes do termo impede o casamento (início de palavra)', () => {
    const termos = DICIONARIO.termos.flatMap((r) => r.termos)
    fc.assert(
      fc.property(
        fc.constantFrom(...termos),
        fc.constantFrom('x', 'k', 'z', 'q'),
        (termo, letra) => {
          expect(sub(termo)).not.toBe(SUBGRUPO_EXECUCAO_TECNICA)
          expect(sub(letra + termo)).toBe(SUBGRUPO_EXECUCAO_TECNICA)
        },
      ),
      OPCOES,
    )
  })

  it('genérico se e só se o comentário escrito normalizado tem de 1 a 3 palavras', () => {
    fc.assert(
      fc.property(comentario, (c) => {
        const palavras = normalizarTexto(c).split(' ').filter(Boolean).length
        expect(nomesDe(c).includes('generico')).toBe(palavras >= 1 && palavras <= 3)
        expect(classe(c).qtdPalavras).toBe(palavras)
      }),
      OPCOES,
    )
  })
})

const nomesDe = (c: string) => flagsDaMascara(classe(c).flags)

describe('ADR 0020: o comentário não sai nem é público', () => {
  it('nem o índice do pacote, nem o de businessmap, nem o de core, nem o `exports` a expõem', () => {
    for (const i of ['../index.ts', '../businessmap/index.ts', '../core/index.ts']) {
      expect(fonte(i), i).not.toMatch(/classificarApontamento|coletor/)
    }
    expect(readFileSync(join(AQUI, '../../package.json'), 'utf8')).not.toMatch(/coletor/)
  })

  it('o web/ não importa a classificação (nada de comentário no bundle da interface)', () => {
    const raiz = join(AQUI, '../../../../web/src')
    const achados: string[] = []
    const varrer = (dir: string) => {
      for (const nome of readdirSync(dir)) {
        const caminho = join(dir, nome)
        if (statSync(caminho).isDirectory()) varrer(caminho)
        else if (
          /\.(ts|tsx)$/.test(nome) &&
          /classificarApontamento|metricas\/coletor/.test(readFileSync(caminho, 'utf8'))
        )
          achados.push(caminho)
      }
    }
    varrer(raiz)
    expect(achados).toEqual([])
  })

  it('a função não loga, não serializa nem guarda o comentário', () => {
    const txt = fonte('./classificarApontamento.ts').replace(/\/\*[\s\S]*?\*\//g, '')
    expect(txt).not.toMatch(
      /console\.|logger|JSON\.stringify|localStorage|createHash|sha256|process\.env/,
    )
  })
})

describe('A1: sem expressão regular montada do dicionário', () => {
  it('o código do classificador não constrói RegExp a partir de dado', () => {
    const txt = fonte('./classificarApontamento.ts').replace(/\/\*[\s\S]*?\*\//g, '')
    expect(txt).not.toMatch(/new RegExp|RegExp\(/)
  })
})

// ---------- matriz do plano §3.4 (dimensões 1, 2, 3 e 5), corpus e orçamento (A3) ----------
/** Contagem de palavras do plano §3.4 por máquina de estados, escrita à parte da implementação (oráculo). */
function palavrasOraculo(texto: string): string[] {
  const pontos = Array.from(texto).slice(0, MAX_PONTOS_DE_CODIGO)
  const baixo = pontos.join('').toLowerCase().normalize('NFD')
  const palavras: string[] = []
  let atual = ''
  const fecha = () => {
    if (atual !== '') palavras.push(atual)
    atual = ''
  }
  for (const p of baixo) {
    if (/\s/u.test(p)) fecha()
    else if (/^[\p{M}\p{Cc}\p{Cf}]$/u.test(p) || /^[\ud800-\udfff]$/.test(p)) continue
    else if (/^[\p{L}\p{N}]$/u.test(p)) atual += p
    else fecha()
  }
  fecha()
  return palavras
}

// Dimensão 2 (codificação) e 1 (tamanho, via repetição) nos pedaços; dimensão 3 (posição) nos separadores.
const PEDACOS = [
  'reuniao', 'Reunião', 'Reuníao', 'REUNIAO', 'teste', 'TESTE', 'Análise', 'Análise', 'ß', 'İ',
  'İTESTE', '😀', '\ud800', '\udc00', '\u0000', '‮', '​', '­', '\u0085', 'x', 'ø', 'coreuniao',
  '1234', 'RDM', 'contestei', '\n', '\t',
] // prettier-ignore
const SEPARADORES = ['', ' ', '  ', ',', '.', '-', '1', '\n', '/', '😀']
const textoGerado = fc
  .array(fc.tuple(fc.constantFrom(...PEDACOS), fc.constantFrom(...SEPARADORES)), { maxLength: 40 })
  .chain((partes) =>
    fc.constantFrom(1, 1, 1, 60, 400).map((rep) =>
      partes
        .map(([p, s]) => p + s)
        .join('')
        .repeat(rep),
    ),
  )
const tamanhos = fc.constantFrom(0, 1, 3, 4, 1999, 2000, 2001, 2002, 2500, 5000)
const textoDeTamanho = fc
  .tuple(textoGerado, tamanhos)
  .map(([t, n]) => (t + 'x ').repeat(n).slice(0, n || 0))
const comentarioGeral = fc.oneof(textoGerado, textoDeTamanho, fc.constantFrom('', ' ', '\n\t '))

// Dimensão 5 (dicionário): vazio, um termo, prefixos entre termos, empate de prioridade.
const TERMOS = [
  'reuni',
  'reuniao',
  'reun',
  'teste',
  'analise',
  'rdm',
  'ana',
  'x',
  'ss',
  'itest',
  '1234',
  'co',
]
const dicionarioGerado: fc.Arbitrary<DicionarioApontamento> = fc
  .array(
    fc.record({
      prioridade: fc.integer({ min: 1, max: 4 }),
      termos: fc.uniqueArray(fc.constantFrom(...TERMOS), { minLength: 1, maxLength: 4 }),
    }),
    { maxLength: 6 },
  )
  .map((regras) => ({
    versao: 'gerado',
    termos: regras.map((r, i) => ({ ...r, subgrupo: `g${i}` })),
    regrasPorTipo: [],
  }))

function subgrupoOraculo(texto: string, d: DicionarioApontamento): string {
  const palavras = palavrasOraculo(texto)
  const regras = [...d.termos].sort(
    (a, b) => a.prioridade - b.prioridade || (a.subgrupo < b.subgrupo ? -1 : 1),
  )
  const achou = regras.find((r) => r.termos.some((t) => palavras.some((p) => p.startsWith(t))))
  return (
    achou?.subgrupo ??
    (palavras.length === 0 && !/\S/u.test(texto.replace(/[\p{Cc}\p{Cf}\ud800-\udfff]/gu, ''))
      ? SUBGRUPO_NAO_CLASSIFICADO
      : SUBGRUPO_EXECUCAO_TECNICA)
  )
}

describe('A3: matriz do plano §3.4 (dimensões 1, 2, 3 e 5)', () => {
  const OPCOES_MATRIZ = { numRuns: 600, seed: 20261102 }

  it('nunca lança, a saída é de lista fechada e qtdPalavras é a contagem do texto normalizado e truncado', () => {
    fc.assert(
      fc.property(comentarioGeral, dicionarioGerado, (c, d) => {
        const r = classificarApontamento({ comentario: c, typeId: null }, d)
        const fechado = [
          ...d.termos.map((t) => t.subgrupo),
          SUBGRUPO_EXECUCAO_TECNICA,
          SUBGRUPO_NAO_CLASSIFICADO,
        ]
        expect(fechado).toContain(r.subgrupo)
        expect(r.qtdPalavras).toBe(palavrasOraculo(c).length)
        expect(r.qtdPalavras).toBeLessThanOrEqual(MAX_PONTOS_DE_CODIGO)
        expect(r.versaoDicionario).toBe('gerado')
        expect(r.flags).toBeGreaterThanOrEqual(0)
      }),
      OPCOES_MATRIZ,
    )
  })

  it('o subgrupo é o do oráculo por palavras e startsWith, com a prioridade do dicionário', () => {
    fc.assert(
      fc.property(comentarioGeral, dicionarioGerado, (c, d) => {
        const r = classificarApontamento({ comentario: c, typeId: null }, d)
        const esperado = subgrupoOraculo(c, d)
        // O oráculo só distingue "vazio" de "texto sem termo" quando nada casa; o resto é igual.
        if (esperado === SUBGRUPO_NAO_CLASSIFICADO) expect(r.qtdPalavras).toBe(0)
        else expect(r.subgrupo).toBe(esperado)
      }),
      OPCOES_MATRIZ,
    )
  })

  it('é determinista e o dicionário não é alterado', () => {
    fc.assert(
      fc.property(comentarioGeral, dicionarioGerado, (c, d) => {
        const antes = JSON.stringify(d)
        const a = classificarApontamento({ comentario: c, typeId: null }, d)
        expect(classificarApontamento({ comentario: c, typeId: null }, d)).toEqual(a)
        expect(JSON.stringify(d)).toBe(antes)
      }),
      OPCOES_MATRIZ,
    )
  })

  it('dimensão 1: tamanhos de borda (vazio, só espaços, 1, 3, 4 palavras, 2000 e acima de 2000 pontos)', () => {
    expect(classe('').qtdPalavras).toBe(0)
    expect(classe('   ').qtdPalavras).toBe(0)
    expect(nomesDe('')).toContain('sem-comentario')
    expect(nomesDe('   ')).toContain('sem-comentario')
    expect(classe('um').qtdPalavras).toBe(1)
    expect(nomesDe('um')).toContain('generico')
    expect(nomesDe('um dois tres')).toContain('generico')
    expect(nomesDe('um dois tres quatro')).not.toContain('generico')
    expect(classe('um dois tres quatro').qtdPalavras).toBe(4)
    const exato = `${'a'.repeat(1998)} b`
    expect(Array.from(exato)).toHaveLength(2000)
    expect(classe(exato).qtdPalavras).toBe(2)
    expect(classe(`${exato}c`).qtdPalavras).toBe(2) // 2001 pontos: o "c" cai fora e o "b" continua
    expect(classe(`${exato} c`).qtdPalavras).toBe(2)
  })

  it('dimensão 2: codificação (pré-composto e decomposto, caixa mista, ß, İ, emoji, controle e direção)', () => {
    expect(sub('Análise')).toBe('analise-diagnostico')
    expect(sub('Análise')).toBe('analise-diagnostico')
    expect(sub('AnÁlIsE')).toBe('analise-diagnostico')
    expect(normalizarTexto('İSTANBUL')).toBe('istanbul') // İ minúsculo = i + ponto combinante, que sai
    expect(normalizarTexto('ß')).toBe('ß')
    expect(palavrasDe(normalizarTexto('straße 😀 ok'))).toEqual(['straße', 'ok'])
    expect(sub('‮reuniao')).toBe('reunioes-comunicacao')
    expect(sub('\u0000reuniao\u0000')).toBe('reunioes-comunicacao')
  })

  it('dimensão 3: posição do termo (início, meio, fim, colado, depois de pontuação, número e quebra de linha)', () => {
    expect(sub('reuniao de status')).toBe('reunioes-comunicacao') // início
    expect(sub('status da reuniao de hoje')).toBe('reunioes-comunicacao') // meio
    expect(sub('status da reuniao')).toBe('reunioes-comunicacao') // fim
    expect(sub('xreuniao')).toBe(SUBGRUPO_EXECUCAO_TECNICA) // colado depois de outra palavra
    expect(sub('status;reuniao')).toBe('reunioes-comunicacao') // depois de pontuação
    expect(sub('item 12 reuniao')).toBe('reunioes-comunicacao') // depois de número
    expect(sub('12reuniao')).toBe(SUBGRUPO_EXECUCAO_TECNICA) // dígito colado é parte da palavra
    expect(sub('status\nreuniao')).toBe('reunioes-comunicacao') // depois de quebra de linha
    expect(sub('status\r\n\treuniao')).toBe('reunioes-comunicacao')
  })

  it('dimensão 5: dicionário vazio, um termo, termos prefixo um do outro e empate de prioridade', () => {
    const rodar = (d: DicionarioApontamento, c: string) =>
      classificarApontamento({ comentario: c, typeId: null }, d).subgrupo
    const vazio: DicionarioApontamento = { versao: 'v', termos: [], regrasPorTipo: [] }
    expect(rodar(vazio, 'reuniao')).toBe(SUBGRUPO_EXECUCAO_TECNICA)
    const um: DicionarioApontamento = {
      versao: 'v',
      termos: [{ prioridade: 1, subgrupo: 'a', termos: ['reuni'] }],
      regrasPorTipo: [],
    }
    expect(rodar(um, 'reuniao')).toBe('a')
    const prefixos: DicionarioApontamento = {
      versao: 'v',
      termos: [
        { prioridade: 2, subgrupo: 'longo', termos: ['reuniao'] },
        { prioridade: 1, subgrupo: 'curto', termos: ['reun'] },
      ],
      regrasPorTipo: [],
    }
    expect(rodar(prefixos, 'reuniao')).toBe('curto') // os dois casam; vale a prioridade
    expect(rodar(prefixos, 'reunir')).toBe('curto')
    const empate: DicionarioApontamento = {
      versao: 'v',
      termos: [
        { prioridade: 1, subgrupo: 'b', termos: ['reun'] },
        { prioridade: 1, subgrupo: 'a', termos: ['reun'] },
      ],
      regrasPorTipo: [],
    }
    expect(rodar(empate, 'reuniao')).toBe('a') // empate: pelo código do subgrupo
  })
})

describe('A3: corpus de comentários legítimos', () => {
  const corpus: [string, string | null, string, string, string[]][] = [
    ['com acento', 'Análise do erro', TAREFA, 'analise-diagnostico', ['generico']],
    ['sem acento', 'reuniao de alinhamento', TAREFA, 'reunioes-comunicacao', ['generico']],
    ['sigla e número', 'RDM 1234', TAREFA, 'gestao-mudanca', ['generico']],
    ['sigla só', 'GMUD', TAREFA, 'gestao-mudanca', ['generico']],
    [
      'número de chamado',
      'Chamado 2026-004512',
      TAREFA,
      SUBGRUPO_EXECUCAO_TECNICA,
      ['generico', 'sem-vinculo'],
    ],
    [
      'quebra de linha',
      'Análise do log\nreuniao com a equipe\najuste final',
      TAREFA,
      'reunioes-comunicacao',
      [],
    ],
    ['só número', '4512', TAREFA, SUBGRUPO_EXECUCAO_TECNICA, ['generico', 'sem-vinculo']],
    ['Kaizen sem comentário', '', KAIZEN, 'gestao-backlog-rituais', ['sem-comentario']],
    ['Kaizen sem comentário (nulo)', null, KAIZEN, 'gestao-backlog-rituais', ['sem-comentario']],
    ['Incidente sem comentário', '', INCIDENTE, 'incidente-sem-detalhe', ['sem-comentario']],
    [
      'comentário longo escrito',
      'Ajuste da rotina de carga para tratar o campo novo do cadastro',
      TAREFA,
      'desenvolvimento-correcao',
      [],
    ],
  ]
  it.each(corpus)('%s', (_n, c, t, esperado, flags) => {
    const r = classe(c, t)
    expect(r.subgrupo).toBe(esperado)
    expect(flagsDaMascara(r.flags).includes('sem-vinculo')).toBe(
      esperado === SUBGRUPO_EXECUCAO_TECNICA || esperado === SUBGRUPO_NAO_CLASSIFICADO,
    )
    expect(flagsDaMascara(r.flags).includes('generico')).toBe(flags.includes('generico'))
    expect(flagsDaMascara(r.flags).includes('sem-comentario')).toBe(
      flags.includes('sem-comentario'),
    )
  })
})

describe('A3: orçamento de tempo (plano §3.4)', () => {
  // Dicionário no teto: 500 termos em 50 regras; nenhum casa, então toda regra é avaliada.
  const termos500 = Array.from({ length: 500 }, (_, i) => `z${i}q`)
  const dTeto: DicionarioApontamento = {
    versao: 'teto',
    termos: Array.from({ length: 50 }, (_, r) => ({
      prioridade: r + 1,
      subgrupo: `g${r}`,
      termos: termos500.slice(r * 10, r * 10 + 10),
    })),
    regrasPorTipo: [],
  }
  // Pior caso: palavras distintas que começam como os termos (mesma letra), sem casar; 2000 pontos de código.
  const pior = Array.from({ length: 600 }, (_, i) => `z${i}`)
    .join(' ')
    .slice(0, MAX_PONTOS_DE_CODIGO)
  const tipico = 'Análise do erro no ajuste da rotina de carga com a equipe '
    .repeat(40)
    .slice(0, 2000)

  it('o dicionário do teste tem 500 termos e os comentários, 2000 pontos de código', () => {
    expect(dTeto.termos.flatMap((t) => t.termos)).toHaveLength(500)
    expect(Array.from(pior)).toHaveLength(2000)
    expect(Array.from(tipico)).toHaveLength(2000)
    expect(classificarApontamento({ comentario: pior, typeId: null }, dTeto).subgrupo).toBe(
      SUBGRUPO_EXECUCAO_TECNICA,
    )
  })

  it('10 000 comentários de 2000 pontos de código contra 500 termos em até 5 s', () => {
    const comentarios = Array.from({ length: 10000 }, (_, i) =>
      i % 2 === 0 ? pior : `${tipico}${i}`,
    )
    const t0 = performance.now()
    for (const c of comentarios) classificarApontamento({ comentario: c, typeId: null }, dTeto)
    expect(performance.now() - t0).toBeLessThan(5000)
  })

  it('um comentário de 2000 pontos de código com 500 termos em menos de 5 ms (melhor de 7 medidas, já aquecido)', () => {
    classificarApontamento({ comentario: pior, typeId: null }, dTeto)
    const medidas = Array.from({ length: 7 }, () => {
      const t0 = performance.now()
      classificarApontamento({ comentario: pior, typeId: null }, dTeto)
      return performance.now() - t0
    })
    expect(Math.min(...medidas)).toBeLessThan(5)
  })

  it('A4: um comentário de 1 MB custa o mesmo que o de 2000 pontos (truncado antes de normalizar)', () => {
    const enorme = 'z1 reuniao '.repeat(100_000)
    const t0 = performance.now()
    const r = classificarApontamento({ comentario: enorme, typeId: null }, dTeto)
    expect(performance.now() - t0).toBeLessThan(50)
    expect(r.qtdPalavras).toBe(palavrasOraculo(enorme).length)
  })
})
