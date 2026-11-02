import fc from 'fast-check'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  LIMITE_GENERICO_PALAVRAS,
  MASCARA_FLAG,
  MAX_QTD_PALAVRAS,
  SUBGRUPO_EXECUCAO_TECNICA,
  SUBGRUPO_NAO_CLASSIFICADO,
  classificarApontamento,
  flagsDaMascara,
  mascaraDeFlags,
  normalizarTexto,
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

  it('termo com caractere especial é tratado como texto, não como expressão regular', () => {
    const d: DicionarioApontamento = {
      versao: 'v',
      termos: [{ prioridade: 1, subgrupo: 'g', termos: ['a.b', 'c+', '(d'] }],
      regrasPorTipo: [],
    }
    const c = (t: string) => classificarApontamento({ comentario: t, typeId: null }, d).subgrupo
    expect(c('a.b')).toBe('g')
    expect(c('axb')).toBe(SUBGRUPO_EXECUCAO_TECNICA)
    expect(c('c+ ok')).toBe('g')
    expect(c('(d')).toBe('g')
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
      expect(nomes(c)).toEqual(['sem-comentario', 'generico', 'sem-vinculo'])
      expect(classe(c).qtdPalavras).toBe(0)
    }
    // regra por tipo que dá subgrupo com vínculo não traz a flag de vínculo
    expect(nomes('', KAIZEN)).toEqual(['sem-comentario', 'generico'])
    expect(nomes('', INCIDENTE)).toEqual(['sem-comentario', 'generico'])
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

  it('a contagem de palavras tem teto de smallint e a versão do dicionário acompanha o resultado', () => {
    const longo = Array.from({ length: MAX_QTD_PALAVRAS + 10 }, () => 'a').join(' ')
    expect(classe(longo).qtdPalavras).toBe(MAX_QTD_PALAVRAS)
    expect(classe('x').versaoDicionario).toBe('teste-v1')
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

  it('genérico se e só se o comentário normalizado tem até 3 palavras', () => {
    fc.assert(
      fc.property(comentario, (c) => {
        const palavras = normalizarTexto(c).split(' ').filter(Boolean).length
        expect(nomesDe(c).includes('generico')).toBe(palavras <= 3)
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
    // ADR 0020, item 3: o único caminho é o subcaminho `./coletor`, importado só pelo coletor do servidor (lint do server); nada mais a cita.
    expect(
      readFileSync(join(AQUI, '../../package.json'), 'utf8').replace(
        '"./coletor": "./src/coletor/index.ts",',
        '',
      ),
    ).not.toMatch(/coletor/)
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
