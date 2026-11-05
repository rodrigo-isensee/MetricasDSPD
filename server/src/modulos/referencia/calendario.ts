import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import { emTransacao, type Consultavel, type PoolLike } from '../../plataforma/db/pool.js';
import { dataCivilValida, textoSeguro } from './dominio-acelerato.js';

/**
 * Carregador do calendário de referência (pedido 069, E5/L7-a; ADR 0027): grava `ref_calendario`, `ref_calendario_aplicacao`, `ref_feriado`
 * e uma versão de critério por domínio (T2.6) a partir do arquivo versionado `docs/architecture/fontes/calendario.json`. Um calendário por
 * domínio: BusinessMap e Acelerato nunca compartilham calendário nem versão. Só INSERT e `UPDATE (vigente_ate)`: feriado gravado nunca é
 * alterado nem removido, e a validação do arquivo inteiro vem antes de qualquer escrita (tudo ou nada, numa transação). Sem dado de pessoa.
 * Turnos (`ref_calendario_turno`) ficam fora: a leitura usa os turnos padrão. Escrita pelo papel de referência (`dspd_ref`).
 */
export const ARQUIVO_CALENDARIO = new URL('../../../../docs/architecture/fontes/calendario.json', import.meta.url);

export const DOMINIOS_CALENDARIO = ['businessmap', 'acelerato'] as const;
export type DominioCalendario = (typeof DOMINIOS_CALENDARIO)[number];
/** Classes de uso do calendário por domínio (conjunto fechado; classe fora daqui recusa o arquivo). */
export const CLASSES_CALENDARIO: Record<DominioCalendario, readonly string[]> = {
  businessmap: ['fluxo', 'apontamento'],
  acelerato: ['sustentacao'],
};
export const ESCOPOS_FERIADO = ['nacional', 'estadual', 'municipal', 'ponto_facultativo'] as const;

/**
 * Métricas que usam horas ou dias úteis da biblioteca (chamadas de `horasUteisEntre`, `diasUteis` e `diasUteisNoIntervalo`, direto ou por
 * `estado`, `blocos` e `relogios`; no Acelerato, pelo índice de horas úteis). Lista do código no L7-a; o QA confere.
 * `apontamento-capacidade` (dias úteis da aba) não está porque o id não existe no catálogo da aba; a versão chega à aba pelo feriado.
 */
export const METRICAS_CALENDARIO: Record<DominioCalendario, readonly string[]> = {
  businessmap: [
    'O1', 'O2', 'O3', 'O5', 'O6', 'O8', 'O9', 'O16', 'O19', 'O20', 'O21', 'O22', 'O24', 'O25', 'O26', 'E1', 'E6', 'E9',
    'T1', 'T2', 'T3', 'T7', 'T10', 'T13', 'EI_FL1', 'EI_FL2', 'EI_FL3', 'BLOQUEADOS',
  ],
  acelerato: ['S1', 'S4', 'S9', 'S10', 'EI_SUST'],
};

export class ErroCalendario extends Error {
  constructor(readonly tipo: 'arquivo' | 'vigencia', mensagem: string) {
    super(mensagem);
    this.name = 'ErroCalendario';
  }
}

const feriadoSchema = z.object({
  data: z.string().refine(dataCivilValida, 'data civil inválida'),
  escopo: z.enum(ESCOPOS_FERIADO),
  descricao: textoSeguro(200),
}).strict();
const calendarioSchema = z.object({
  nome: textoSeguro(80),
  dominio: z.enum(DOMINIOS_CALENDARIO),
  offset_minutos: z.number().int().min(-720).max(840),
  descricao: textoSeguro(300).optional(),
  feriados: z.array(feriadoSchema).max(5000),
}).strict();
const aplicacaoSchema = z.object({
  dominio: z.enum(DOMINIOS_CALENDARIO), classe: textoSeguro(60), calendario: textoSeguro(80),
}).strict();

export const esquemaCalendario = z.object({
  versao: z.literal(1),
  regra: textoSeguro(2000),
  versao_criterio: z.object({ descricao: textoSeguro(300), motivo: textoSeguro(500) }).strict(),
  calendarios: z.array(calendarioSchema).min(1).max(20),
  aplicacoes: z.array(aplicacaoSchema).min(1).max(40),
}).strict().superRefine((d, ctx) => {
  const porNome = new Map<string, z.infer<typeof calendarioSchema>>();
  for (const [i, c] of d.calendarios.entries()) {
    if (porNome.has(c.nome)) ctx.addIssue({ code: 'custom', path: ['calendarios', i, 'nome'], message: 'nome repetido' });
    porNome.set(c.nome, c);
    const datas = new Set<string>();
    for (const [j, f] of c.feriados.entries()) {
      if (datas.has(f.data)) ctx.addIssue({ code: 'custom', path: ['calendarios', i, 'feriados', j, 'data'], message: 'data repetida' });
      datas.add(f.data);
    }
  }
  const chaves = new Set<string>();
  for (const [i, a] of d.aplicacoes.entries()) {
    const cal = porNome.get(a.calendario);
    if (cal === undefined) ctx.addIssue({ code: 'custom', path: ['aplicacoes', i, 'calendario'], message: 'calendário inexistente' });
    else if (cal.dominio !== a.dominio) ctx.addIssue({ code: 'custom', path: ['aplicacoes', i, 'dominio'], message: 'calendário de outro domínio' });
    if (!CLASSES_CALENDARIO[a.dominio].includes(a.classe)) ctx.addIssue({ code: 'custom', path: ['aplicacoes', i, 'classe'], message: 'classe desconhecida' });
    const k = `${a.dominio}|${a.classe}`;
    if (chaves.has(k)) ctx.addIssue({ code: 'custom', path: ['aplicacoes', i, 'classe'], message: 'aplicação repetida' });
    chaves.add(k);
  }
});
export type ArquivoCalendario = z.infer<typeof esquemaCalendario>;
export interface CalendarioLido { arquivo: ArquivoCalendario; sha256: string }

/** Lê e valida o texto (nunca grava nada). O hash é o do texto exato do arquivo. */
export function analisarCalendario(texto: string): CalendarioLido {
  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    throw new ErroCalendario('arquivo', 'o arquivo de calendário não é um JSON válido');
  }
  const r = esquemaCalendario.safeParse(bruto);
  if (!r.success) {
    const onde = [...new Set(r.error.issues.map((i) => i.path.slice(0, 3).join('.') || 'raiz'))].join(', ');
    throw new ErroCalendario('arquivo', `o arquivo de calendário é inválido (${onde})`);
  }
  return { arquivo: r.data, sha256: createHash('sha256').update(texto, 'utf8').digest('hex') };
}
export const lerCalendario = (caminho: URL | string = ARQUIVO_CALENDARIO): CalendarioLido => analisarCalendario(readFileSync(caminho, 'utf8'));

export const referenciaDaVersaoCalendario = (dominio: DominioCalendario, sha256: string): string => `069:calendario:${dominio}:${sha256}`;

export interface EstadoCalendario {
  calendarios: ReadonlyMap<string, { id: string; offsetMinutos: number }>;
  /** Datas já gravadas por nome de calendário (AAAA-MM-DD) com escopo e descrição. */
  feriados: ReadonlyMap<string, ReadonlyMap<string, { escopo: string; descricao: string }>>;
  /** Aplicação vigente por `dominio|classe`. */
  vigentes: ReadonlyMap<string, { calendarioId: string; vigenteDe: string }>;
  /** Maior data (`vigente_de` ou `vigente_ate`) já registrada por `dominio|classe`. */
  ultimas: ReadonlyMap<string, string>;
  /** Maior `vigente_desde` das versões deste carregador por domínio. */
  ultimaVersao: ReadonlyMap<string, string>;
}
export interface PlanoDominioCalendario {
  dominio: DominioCalendario;
  calendariosNovos: string[];
  feriadosNovos: { calendario: string; data: string; escopo: string; descricao: string }[];
  abrir: { classe: string; calendario: string }[];
  fechar: string[];
  mudou: boolean;
}
export interface PlanoCalendario { dominios: PlanoDominioCalendario[]; feriadosDivergentes: number }

/**
 * Compara o arquivo com o que está gravado e devolve o que gravar, sem tocar no banco. Recusa (ErroCalendario) offset diferente de calendário
 * existente (a coluna não tem UPDATE) e data que seria anterior a uma vigência ou versão já registrada (sem períodos sobrepostos nem versão
 * com data passada). Feriado já gravado com outro escopo ou descrição fica como está e só é contado em `feriadosDivergentes`.
 */
export function planejarCalendario(arquivo: ArquivoCalendario, estado: EstadoCalendario, hoje: string): PlanoCalendario {
  let feriadosDivergentes = 0;
  const dominios: PlanoDominioCalendario[] = [];
  for (const dominio of DOMINIOS_CALENDARIO) {
    const cals = arquivo.calendarios.filter((c) => c.dominio === dominio);
    if (cals.length === 0) continue;
    const plano: PlanoDominioCalendario = { dominio, calendariosNovos: [], feriadosNovos: [], abrir: [], fechar: [], mudou: false };
    for (const c of cals) {
      const atual = estado.calendarios.get(c.nome);
      if (atual === undefined) plano.calendariosNovos.push(c.nome);
      else if (atual.offsetMinutos !== c.offset_minutos) {
        throw new ErroCalendario('arquivo', `calendário ${c.nome}: o deslocamento gravado (${atual.offsetMinutos}) difere do arquivo (${c.offset_minutos}); não se altera calendário gravado`);
      }
      const gravados = estado.feriados.get(c.nome) ?? new Map();
      for (const f of c.feriados) {
        const g = gravados.get(f.data);
        if (g === undefined) plano.feriadosNovos.push({ calendario: c.nome, ...f });
        else if (g.escopo !== f.escopo || g.descricao !== f.descricao) feriadosDivergentes += 1;
      }
    }
    for (const a of arquivo.aplicacoes.filter((x) => x.dominio === dominio)) {
      const chave = `${a.dominio}|${a.classe}`;
      const vigente = estado.vigentes.get(chave);
      const alvo = estado.calendarios.get(a.calendario);
      if (vigente !== undefined && alvo !== undefined && vigente.calendarioId === alvo.id) continue;
      const ultima = estado.ultimas.get(chave);
      if (ultima !== undefined && hoje <= ultima) {
        throw new ErroCalendario('vigencia', `aplicação ${chave}: a data ${hoje} não é posterior à última vigência (${ultima}); use uma data posterior`);
      }
      if (vigente !== undefined) plano.fechar.push(a.classe);
      plano.abrir.push({ classe: a.classe, calendario: a.calendario });
    }
    plano.mudou = plano.calendariosNovos.length + plano.feriadosNovos.length + plano.abrir.length > 0;
    const ultimaVersao = estado.ultimaVersao.get(dominio);
    if (plano.mudou && ultimaVersao !== undefined && hoje < ultimaVersao) {
      throw new ErroCalendario('vigencia', `calendário ${dominio}: a data ${hoje} é anterior à última versão de critério do calendário (${ultimaVersao}); use essa data ou uma posterior`);
    }
    dominios.push(plano);
  }
  return { dominios, feriadosDivergentes };
}

async function lerEstado(db: Consultavel, S: Esquemas, arquivo: ArquivoCalendario): Promise<EstadoCalendario> {
  const nomes = arquivo.calendarios.map((c) => c.nome);
  const cals = (await db.query<{ calendario_id: string; nome: string; offset_minutos: number }>(
    `SELECT calendario_id, nome, offset_minutos FROM ${S.core}.ref_calendario WHERE nome = ANY($1::text[])`, [nomes])).rows;
  const calendarios = new Map(cals.map((c) => [c.nome, { id: String(c.calendario_id), offsetMinutos: Number(c.offset_minutos) }]));
  const ids = cals.map((c) => Number(c.calendario_id));
  const fer = (await db.query<{ nome: string; data: string; escopo: string; descricao: string }>(
    `SELECT c.nome, f.data::text AS data, f.escopo, f.descricao FROM ${S.core}.ref_feriado f
     JOIN ${S.core}.ref_calendario c ON c.calendario_id = f.calendario_id WHERE f.calendario_id = ANY($1::smallint[])`, [ids])).rows;
  const feriados = new Map<string, Map<string, { escopo: string; descricao: string }>>();
  for (const f of fer) {
    const m = feriados.get(f.nome) ?? new Map();
    m.set(f.data, { escopo: f.escopo, descricao: f.descricao });
    feriados.set(f.nome, m);
  }
  const apl = (await db.query<{ dominio: string; classe: string; calendario_id: string; vigente_de: string; vigente_ate: string | null }>(
    `SELECT dominio, classe, calendario_id, vigente_de::text AS vigente_de, vigente_ate::text AS vigente_ate FROM ${S.core}.ref_calendario_aplicacao
     WHERE dominio = ANY($1::text[]) AND classe = ANY($2::text[])`,
    [DOMINIOS_CALENDARIO, [...new Set(arquivo.aplicacoes.map((a) => a.classe))]])).rows;
  const vigentes = new Map<string, { calendarioId: string; vigenteDe: string }>();
  const ultimas = new Map<string, string>();
  for (const a of apl) {
    const k = `${a.dominio}|${a.classe}`;
    if (a.vigente_ate === null) vigentes.set(k, { calendarioId: String(a.calendario_id), vigenteDe: a.vigente_de });
    const fim = a.vigente_ate !== null && a.vigente_ate > a.vigente_de ? a.vigente_ate : a.vigente_de;
    if (fim > (ultimas.get(k) ?? '')) ultimas.set(k, fim);
  }
  const vers = (await db.query<{ dominio: string; ultima: string }>(
    `SELECT dominio, max(vigente_desde)::text AS ultima FROM ${S.core}.ref_versao_criterio WHERE referencia LIKE '069:calendario:%' GROUP BY dominio`)).rows;
  return { calendarios, feriados, vigentes, ultimas, ultimaVersao: new Map(vers.map((v) => [v.dominio, v.ultima])) };
}

export interface ResultadoDominioCalendario {
  dominio: DominioCalendario;
  calendariosNovos: number;
  feriadosNovos: number;
  aplicacoesAbertas: number;
  aplicacoesFechadas: number;
  versaoRegistrada: boolean;
}
export interface ResultadoCalendario { sha256: string; dominios: ResultadoDominioCalendario[]; feriadosDivergentes: number }

/**
 * Lê o estado, planeja e grava numa transação só (tudo ou nada). Sem diferença nada é gravado (idempotente); com diferença registra a versão
 * de critério do domínio (uma por domínio e hash) com as métricas que usam horas ou dias úteis, e grava só o que falta.
 */
export async function sincronizarCalendario(pool: PoolLike, S: Esquemas, lido: CalendarioLido, hoje: string, agora: Date): Promise<ResultadoCalendario> {
  return emTransacao(pool, async (db) => {
    const { arquivo } = lido;
    const plano = planejarCalendario(arquivo, await lerEstado(db, S, arquivo), hoje);
    const ids = new Map<string, string>();
    for (const c of arquivo.calendarios) {
      const existente = await db.query<{ calendario_id: string }>(`SELECT calendario_id FROM ${S.core}.ref_calendario WHERE nome = $1`, [c.nome]);
      if (existente.rows[0] !== undefined) {
        ids.set(c.nome, String(existente.rows[0].calendario_id));
        continue;
      }
      const novo = await db.query<{ calendario_id: string }>(
        `INSERT INTO ${S.core}.ref_calendario (nome, offset_minutos, descricao) VALUES ($1, $2, $3) RETURNING calendario_id`, [c.nome, c.offset_minutos, c.descricao ?? null]);
      ids.set(c.nome, String(novo.rows[0]!.calendario_id));
    }
    const dominios: ResultadoDominioCalendario[] = [];
    for (const p of plano.dominios) {
      let versaoRegistrada = false;
      if (p.mudou) {
        const referencia = referenciaDaVersaoCalendario(p.dominio, lido.sha256);
        const v = arquivo.versao_criterio;
        const existe = await db.query<{ versao_id: string }>(`SELECT versao_id FROM ${S.core}.ref_versao_criterio WHERE dominio = $1 AND referencia = $2`, [p.dominio, referencia]);
        let versaoId = existe.rows[0]?.versao_id;
        if (versaoId === undefined) {
          const r = await db.query<{ versao_id: string }>(
            `INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING versao_id`, [hoje, p.dominio, v.descricao, v.motivo, referencia, agora.toISOString()]);
          versaoId = r.rows[0]!.versao_id;
          for (const m of METRICAS_CALENDARIO[p.dominio]) await db.query(`INSERT INTO ${S.core}.ref_versao_criterio_metrica (versao_id, metrica_id) VALUES ($1, $2)`, [versaoId, m]);
          versaoRegistrada = true;
        }
        for (const nome of new Set(p.feriadosNovos.map((f) => f.calendario))) {
          const fs = p.feriadosNovos.filter((f) => f.calendario === nome);
          await db.query(
            `INSERT INTO ${S.core}.ref_feriado (calendario_id, data, escopo, descricao, incluido_por_versao_id)
             SELECT $1::smallint, x.d, x.e, x.t, $5::bigint FROM unnest($2::date[], $3::text[], $4::text[]) AS x(d, e, t)
             ON CONFLICT ON CONSTRAINT ref_feriado_pkey DO NOTHING`,
            [ids.get(nome), fs.map((f) => f.data), fs.map((f) => f.escopo), fs.map((f) => f.descricao), versaoId]);
        }
        for (const classe of p.fechar) {
          await db.query(`UPDATE ${S.core}.ref_calendario_aplicacao SET vigente_ate = $1 WHERE vigente_ate IS NULL AND dominio = $2 AND classe = $3`, [hoje, p.dominio, classe]);
        }
        for (const a of p.abrir) {
          await db.query(
            `INSERT INTO ${S.core}.ref_calendario_aplicacao (dominio, classe, vigente_de, calendario_id) VALUES ($1, $2, $3, $4::smallint)`, [p.dominio, a.classe, hoje, ids.get(a.calendario)]);
        }
      }
      dominios.push({
        dominio: p.dominio, calendariosNovos: p.calendariosNovos.length, feriadosNovos: p.feriadosNovos.length,
        aplicacoesAbertas: p.abrir.length, aplicacoesFechadas: p.fechar.length, versaoRegistrada,
      });
    }
    return { sha256: lido.sha256, dominios, feriadosDivergentes: plano.feriadosDivergentes };
  });
}
