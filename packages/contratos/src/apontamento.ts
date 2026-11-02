import { z } from 'zod'
import { MINIMO_AMOSTRA, marcacaoCriterioSchema, taxaSchema } from './comum'
import { seloFrescorSchema } from './coletas'

/**
 * Contrato de `GET /api/apontamento` (aba Apontamento, pedido 059, plano §3.9, versão 1).
 * Rota única e resposta agregada; nenhum campo traz `user_id`, `responsavel_id`, comentário, título de subtarefa ou
 * e-mail. Horas em segundos inteiros (o front só formata). Pessoa só por `pessoaRef` (chave opaca, ADR 0020 R4-4).
 * Cláusulas da exceção: o1 ordem neutra, o2 sem semáforo nem média por pessoa, o3 piso de 20 apontamentos para
 * percentual, o4 fora da exportação. Mudar a forma depois que o front começar é mudança de contrato
 * (`docs/contratos/politica-de-mudanca.md`).
 */
export const VERSAO_CONTRATO_APONTAMENTO = 1 as const

/** Janela máxima da consulta (12 meses) e do mapa diário (M-7 do UX), em dias corridos, inclusive nas duas pontas. */
export const JANELA_MAXIMA_DIAS = 366
export const JANELA_DIARIO_MAXIMA_DIAS = 62

// ---------- primitivos ----------
/** Dia do calendário (dias desde 1970-01-01) de um AAAA-MM-DD existente; `null` se a data não existe (ex.: 2026-02-30). */
function diaCivil(iso: string): number | null {
  const ms = Date.parse(`${iso}T00:00:00Z`)
  if (Number.isNaN(ms) || new Date(ms).toISOString().slice(0, 10) !== iso) return null
  return ms / 86_400_000
}

const dataCivil = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/) // AAAA-MM-DD, America/Sao_Paulo
  .refine((v) => diaCivil(v) !== null, { message: 'Data inexistente' })
const mesCivil = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/) // AAAA-MM
const instante = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?([+-]\d{2}:\d{2}|Z)$/)
const idNumerico = z.string().regex(/^\d{1,12}$/) // card_id, type_id do BusinessMap
const codigo = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .max(40) // códigos de lista fechada da referência
const segundos = z.number().int().nonnegative()
const contagem = z.number().int().nonnegative()

/**
 * Chave opaca de pessoa (`dim_responsavel.pessoa_ref`), nunca o `user_id` do BusinessMap (ADR 0020, R4-4). `outra-area` é a
 * entrada única que soma quem não é do time (decisão do dono, 2026-11-02): sem nome nem chave de pessoa.
 */
export const PESSOA_OUTRA_AREA = 'outra-area'
export const pessoaRefSchema = z.union([
  z.string().regex(/^p[1-9]\d{0,8}$/),
  z.literal(PESSOA_OUTRA_AREA),
])
export type PessoaRef = z.infer<typeof pessoaRefSchema>

/** Flags de qualidade (§3.4; não excludentes, M-11 do UX). "completo" = nenhuma flag. */
export const FLAGS_QUALIDADE = [
  'sem-comentario',
  'generico',
  'sem-vinculo',
  'sem-iniciativa',
  'valor-atipico',
] as const
export const flagQualidadeSchema = z.enum(FLAGS_QUALIDADE)
export type FlagQualidade = z.infer<typeof flagQualidadeSchema>
export const filtroQualidadeSchema = z.enum([...FLAGS_QUALIDADE, 'completo'])

export const NIVEIS_MATRIZ = ['tipo', 'subtarefa', 'subgrupo'] as const // um nível por vez (CA-5)
export type NivelMatriz = (typeof NIVEIS_MATRIZ)[number]
export const FAIXAS_DIARIO = ['zero', 'ate-4h', '4h-a-8h', 'mais-de-8h'] as const // faixas fixas (M-6 do UX)
export type FaixaDiario = (typeof FAIXAS_DIARIO)[number]

/** Percentual com piso de 20 (o3; P-1 do UX): abaixo do mínimo não há `pct`, só a contagem `n`. */
export const pctComPisoSchema = z.discriminatedUnion('status', [
  z
    .object({
      status: z.literal('ok'),
      n: z.number().int().min(MINIMO_AMOSTRA),
      pct: z.number().nonnegative(),
    })
    .strict(),
  z
    .object({
      status: z.literal('insuficiente'),
      n: z
        .number()
        .int()
        .nonnegative()
        .max(MINIMO_AMOSTRA - 1),
      minimo: z.literal(MINIMO_AMOSTRA),
    })
    .strict(),
])
export type PctComPiso = z.infer<typeof pctComPisoSchema>

// ---------- consulta ----------
const lista = <T extends z.ZodType>(item: T, max: number) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? (v === '' ? [] : v.split(',')) : v),
    z.array(item).max(max),
  )

/** Dois limites juntos ou nenhum, `de <= ate` e janela de até `maximoDias` dias (inclusive). Sem eco do valor recebido. */
function conferirJanela(
  de: string | undefined,
  ate: string | undefined,
  maximoDias: number,
  nomes: readonly [string, string],
  ctx: z.RefinementCtx,
): void {
  if (de === undefined && ate === undefined) return
  if (de === undefined || ate === undefined) {
    ctx.addIssue({
      code: 'custom',
      path: [de === undefined ? nomes[0] : nomes[1]],
      message: 'Informe os dois limites do período ou nenhum',
    })
    return
  }
  const d0 = diaCivil(de) as number // as datas já passaram por `dataCivil`
  const d1 = diaCivil(ate) as number
  if (d1 < d0) ctx.addIssue({ code: 'custom', path: [nomes[1]], message: 'Fim anterior ao início' })
  else if (d1 - d0 + 1 > maximoDias)
    ctx.addIssue({
      code: 'custom',
      path: [nomes[1]],
      message: `Período acima do máximo de ${String(maximoDias)} dias`,
    })
}

/**
 * Consulta de `GET /api/apontamento`. Sem `de`/`ate`, o servidor usa o período padrão do painel
 * (P-3 do UX: 12 semanas); janela máxima de 12 meses (366 dias). `diarioDe`/`diarioAte`: janela do mapa diário
 * (M-7 do UX, padrão 4 semanas, máximo 62 dias). Consulta estrita: chave desconhecida = 400 (CA-AP-6). Quem responde
 * 400 devolve só `path` e código dos problemas, nunca `message` nem o valor recebido (B-4).
 */
export const consultaApontamentoSchema = z
  .object({
    de: dataCivil.optional(),
    ate: dataCivil.optional(),
    pessoa: lista(pessoaRefSchema, 200).optional(),
    projeto: lista(idNumerico, 200).optional(), // card_id da raiz (dim_card_raiz)
    tipo: lista(idNumerico, 50).optional(), // type_id
    subtarefa: lista(codigo, 50).optional(),
    subgrupo: lista(codigo, 50).optional(),
    qualidade: lista(filtroQualidadeSchema, 6).optional(),
    nivelMatriz: z.enum(NIVEIS_MATRIZ).default('tipo'),
    diarioDe: dataCivil.optional(),
    diarioAte: dataCivil.optional(),
    // P-5 da segurança e M-5 do UX: marcar e manter; ocultar é escolha de quem lê
    anomalos: z.enum(['incluir', 'ocultar']).default('incluir'),
  })
  .strict()
  .superRefine((c, ctx) => {
    conferirJanela(c.de, c.ate, JANELA_MAXIMA_DIAS, ['de', 'ate'], ctx)
    conferirJanela(
      c.diarioDe,
      c.diarioAte,
      JANELA_DIARIO_MAXIMA_DIAS,
      ['diarioDe', 'diarioAte'],
      ctx,
    )
  })
export type ConsultaApontamento = z.infer<typeof consultaApontamentoSchema>

// ---------- blocos da resposta ----------
/** Teto dos rótulos vindos da origem (título de card raiz, tipo, subgrupo); o mesmo de `rotuloRef` e do rótulo de pessoa. */
export const MAX_ROTULO = 200
const opcaoSchema = z.object({ id: z.string(), rotulo: z.string().max(MAX_ROTULO) }).strict()

/** Rótulos fixos de pessoa com `nomesReais: false` (A5 do parecer 059-alfa): nada além disso é aceito. */
export const ROTULO_PESSOA_NAO_IDENTIFICADA = 'Pessoa não identificada'
export const ROTULO_OUTRA_AREA = 'Outra área'
export const rotuloFixoDePessoa = (rotulo: string): boolean =>
  /^Pessoa [1-9]\d{0,8}$/.test(rotulo) ||
  rotulo === ROTULO_PESSOA_NAO_IDENTIFICADA ||
  rotulo === ROTULO_OUTRA_AREA

export const pessoaApontamentoSchema = z
  .object({
    pessoaRef: pessoaRefSchema,
    /** Nome real só com `APONTAMENTO_NOMES` ligado (R4-5); senão "Pessoa n". Sem de-para: "Pessoa não identificada" (CA-10). */
    rotulo: z.string().min(1).max(MAX_ROTULO),
    identificada: z.boolean(),
  })
  .strict()
export type PessoaApontamento = z.infer<typeof pessoaApontamentoSchema>

/** Linha de distribuição (projeto, tipo, subgrupo). `participacao` = parte das horas do bloco. */
const linhaDistribuicaoSchema = z
  .object({
    id: z.string(),
    rotulo: z.string().max(MAX_ROTULO),
    segundos,
    apontamentos: contagem,
    participacao: pctComPisoSchema,
    /** Só em projeto: raiz fora dos quadros coletados (Q-A7). */
    foraDoEscopo: z.boolean().optional(),
  })
  .strict()

const blocoBaseSchema = z.object({ n: contagem, unidade: z.literal('apontamentos') }).strict()

export const kpisApontamentoSchema = z
  .object({
    segundos,
    apontamentos: contagem,
    pessoasAtivas: contagem,
    completos: taxaSchema, // k de n apontamentos sem flag; % só com n >= 20
    atipicos: contagem, // apontamentos com valor-atipico no recorte (CA-7)
  })
  .strict()

export const distribuicaoApontamentoSchema = z
  .object({
    base: blocoBaseSchema,
    porProjeto: z.array(linhaDistribuicaoSchema),
    porTipo: z.array(linhaDistribuicaoSchema),
    porSubgrupo: z.array(linhaDistribuicaoSchema),
  })
  .strict()

const qualidadePorFlagSchema = z
  .object({ flag: flagQualidadeSchema, apontamentos: contagem, pct: pctComPisoSchema })
  .strict()

export const qualidadeApontamentoSchema = z
  .object({
    geral: z.object({ completos: taxaSchema, porFlag: z.array(qualidadePorFlagSchema) }).strict(),
    /** o3: percentuais por pessoa só com 20 apontamentos ou mais; abaixo, só contagem. */
    porPessoa: z.array(
      z
        .object({
          pessoaRef: pessoaRefSchema,
          apontamentos: contagem,
          completos: taxaSchema,
          porFlag: z.array(qualidadePorFlagSchema),
        })
        .strict(),
    ),
    /** Flags não excludentes: a soma dos percentuais passa de 100% (M-11). */
    flagsNaoExcludentes: z.literal(true),
  })
  .strict()

export const matrizApontamentoSchema = z
  .object({
    nivel: z.enum(NIVEIS_MATRIZ),
    colunas: z.array(opcaoSchema),
    linhas: z.array(
      z
        .object({
          pessoaRef: pessoaRefSchema,
          segundos, // soma da linha
          apontamentos: contagem,
          celulas: z.array(
            z.object({ colunaId: z.string(), segundos, participacao: pctComPisoSchema }).strict(),
          ),
        })
        .strict(),
    ),
  })
  .strict()

/** Utilização = realizadas ÷ capacidade, sem teto (pode passar de 1), leitura relativa (M-4 do UX); piso de 20 (o3). */
const utilizacaoSchema = pctComPisoSchema

export const capacidadeApontamentoSchema = z
  .object({
    horasPorDiaSegundos: segundos, // do calendário (8 h hoje)
    mensal: z.array(
      z
        .object({
          mes: mesCivil,
          capacidadeSegundos: segundos, // soma por pessoa-dia útil ativa (C-8, Q-A9)
          realizadoSegundos: segundos,
          apontamentos: contagem,
          utilizacao: utilizacaoSchema,
          /** Mês corrente cortado na última coleta ok (C-7). */
          parcialAte: dataCivil.nullable(),
        })
        .strict(),
    ),
    porPessoa: z.array(
      z
        .object({
          pessoaRef: pessoaRefSchema,
          inicio: dataCivil, // primeiro apontamento no período (Q-A4, regra da especificação)
          fim: dataCivil, // último apontamento no período
          diasUteis: contagem, // com feriados (C-10)
          capacidadeSegundos: segundos,
          realizadoSegundos: segundos,
          apontamentos: contagem,
          utilizacao: utilizacaoSchema,
        })
        .strict(),
    ),
    leituraRelativa: z.literal(true), // selo fixo "comparação relativa; não é jornada total"
  })
  .strict()

export const diarioApontamentoSchema = z
  .object({
    de: dataCivil,
    ate: dataCivil,
    limiteAtipicoSegundos: segundos, // 16 h por pessoa e dia (P-4 do UX), configurável
    dias: z.array(z.object({ data: dataCivil, util: z.boolean(), feriado: z.boolean() }).strict()), // M-8
    linhas: z.array(
      z
        .object({
          pessoaRef: pessoaRefSchema,
          segundos,
          celulas: z.array(
            z
              .object({
                data: dataCivil,
                segundos,
                faixa: z.enum(FAIXAS_DIARIO),
                atipico: z.boolean(),
              })
              .strict(),
          ),
        })
        .strict(),
    ),
  })
  .strict()

/** Achados gerados por regra (M-1 do UX, CA-11): código + números; o front monta a frase. Nunca nome ou `pessoaRef`. */
export const CODIGOS_ACHADO = [
  'nao-classificado-alto',
  'sem-comentario-alto',
  'concentracao-em-projeto',
  'dias-atipicos',
  'utilizacao-mensal-variou',
] as const
export type CodigoAchado = (typeof CODIGOS_ACHADO)[number]

const rotuloRef = z.string().max(MAX_ROTULO).nullable() // rótulo de projeto/tipo/subgrupo citado, nunca de pessoa
const achado = <C extends CodigoAchado, V extends z.ZodRawShape>(cod: C, valores: V) =>
  z.object({ codigo: z.literal(cod), valores: z.object(valores).strict(), rotuloRef }).strict()

/**
 * `valores` é uma união discriminada por `codigo`, com as chaves propostas em `docs/ux/059-aba-apontamento-textos.md`
 * (DECISÃO TÉCNICA do Jarvis, 2026-11-01 22:20): evita divergência silenciosa entre front e back.
 * Unidades: `pct` e `pctAnterior` em pontos percentuais (12,5 = 12,5%); `n` em apontamentos (dias, em `dias-atipicos`);
 * `limite` em horas por pessoa e dia (o front formata; é o `limiteAtipicoSegundos` do diário dividido por 3600).
 */
export const achadoApontamentoSchema = z.discriminatedUnion('codigo', [
  achado('nao-classificado-alto', { pct: z.number().nonnegative(), n: contagem }),
  achado('sem-comentario-alto', { pct: z.number().nonnegative(), n: contagem }),
  achado('concentracao-em-projeto', { pct: z.number().nonnegative() }), // rótulo do projeto em `rotuloRef`
  achado('dias-atipicos', { n: contagem, limite: z.number().positive() }),
  achado('utilizacao-mensal-variou', {
    pctAnterior: z.number().nonnegative(),
    pct: z.number().nonnegative(),
    mesAnterior: mesCivil,
    mes: mesCivil,
  }),
])
export type AchadoApontamento = z.infer<typeof achadoApontamentoSchema>

export const opcoesApontamentoSchema = z
  .object({
    pessoas: z.array(pessoaApontamentoSchema), // mesma ordem neutra (o1)
    projetos: z.array(opcaoSchema.extend({ foraDoEscopo: z.boolean() }).strict()),
    tipos: z.array(opcaoSchema),
    subtarefas: z.array(opcaoSchema),
    subgrupos: z.array(opcaoSchema),
    historico: z.object({ inicio: dataCivil, fim: dataCivil }).strict(), // limites do período personalizado
  })
  .strict()

// ---------- resposta ----------
export const respostaApontamentoSchema = z
  .object({
    versaoContrato: z.literal(VERSAO_CONTRATO_APONTAMENTO),
    dominio: z.literal('businessmap'), // nunca Acelerato
    periodo: z.object({ de: dataCivil, ate: dataCivil }).strict(),
    frescor: z.object({ selo: seloFrescorSchema, ultimaColetaOk: instante.nullable() }).strict(), // CA-1
    nomesReais: z.boolean(), // true só com APONTAMENTO_NOMES ligado; o front mostra o aviso de nome real
    opcoes: opcoesApontamentoSchema,
    kpis: kpisApontamentoSchema,
    distribuicao: distribuicaoApontamentoSchema,
    qualidade: qualidadeApontamentoSchema,
    matriz: matrizApontamentoSchema,
    capacidade: capacidadeApontamentoSchema,
    diario: diarioApontamentoSchema,
    achados: z.array(achadoApontamentoSchema),
    /** Mudanças de critério com data (T2.6): versões do dicionário de subgrupo/qualidade e do calendário. */
    criterios: z.array(marcacaoCriterioSchema),
  })
  .strict()
  .superRefine((r, ctx) => {
    // A5: com o interruptor desligado, o front recusa nome vazado (critério de reversão da R4 da ADR 0020).
    if (r.nomesReais) return
    r.opcoes.pessoas.forEach((p, i) => {
      if (!rotuloFixoDePessoa(p.rotulo))
        ctx.addIssue({
          code: 'custom',
          path: ['opcoes', 'pessoas', i, 'rotulo'],
          message: 'com nomesReais falso só valem os rótulos fixos de pessoa',
        })
    })
  })
export type RespostaApontamento = z.infer<typeof respostaApontamentoSchema>
