import {
  EQUIPES_SUSTENTACAO_ID, PERIODOS_PADRAO, PRIORIDADES, TIPO_ID, resultadoO2, versaoCriterioSchema, type FiltrosFluxo,
  type FiltrosSustentacao, type TipoFiltro,
} from '@metricas-dspd/contratos';
import { z } from 'zod';

/** Listas em CSV (`equipe=a,b`); ausente ou vazia = "Todos". */
const csv = z.string().transform((s) => s.split(',').map((x) => x.trim()).filter((x) => x !== ''));
const lista = <O>(item: z.ZodType<O, string>) => csv.pipe(z.array(item)).optional();
const idSlug = z.string().regex(/^[a-z0-9][a-z0-9-]{0,59}$/);
const data = z.iso.date();
const NOME_POR_ID = new Map(Object.entries(TIPO_ID).map(([nome, id]) => [id, nome as TipoFiltro]));

const comumQuery = {
  periodo: z.enum([...PERIODOS_PADRAO, 'custom']).default('12s'),
  de: data.optional(),
  ate: data.optional(),
  dataReferencia: data.optional(),
};

export type ConsultaCalculo<F> = { filtros: F; dataReferencia?: string; page?: number; pageSize?: number };

/** `custom` exige `de` e `ate`; qualquer outro período os proíbe. */
function periodoDe(q: { periodo: string; de?: string | undefined; ate?: string | undefined }, ctx: z.RefinementCtx): FiltrosFluxo['periodo'] {
  if (q.periodo === 'custom') {
    if (q.de === undefined || q.ate === undefined) {
      ctx.addIssue({ code: 'custom', path: ['periodo'], message: 'O período personalizado exige de e ate.' });
      return z.NEVER;
    }
    return { tipo: 'custom', de: q.de, ate: q.ate };
  }
  if (q.de !== undefined || q.ate !== undefined) {
    ctx.addIssue({ code: 'custom', path: ['de'], message: 'de e ate só valem com periodo=custom.' });
    return z.NEVER;
  }
  return { tipo: q.periodo as '4s' | '12s' | '6m' | '12m' };
}

/** Fluxo (BusinessMap). Parâmetro desconhecido (inclusive qualquer filtro de pessoa ou de sustentação) reprova (400). */
export const queryFluxoSchema = z.object({
  equipe: lista(idSlug),
  tipo: lista(z.string().refine((id) => NOME_POR_ID.has(id), 'tipo desconhecido')),
  sistema: lista(idSlug),
  ...comumQuery,
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
}).strict().transform((q, ctx): ConsultaCalculo<FiltrosFluxo> => {
  const periodo = periodoDe(q, ctx);
  const r: ConsultaCalculo<FiltrosFluxo> = {
    filtros: { equipe: q.equipe ?? [], tipo: (q.tipo ?? []).map((id) => NOME_POR_ID.get(id) as TipoFiltro), sistema: q.sistema ?? [], periodo },
  };
  if (q.dataReferencia !== undefined) r.dataReferencia = q.dataReferencia;
  if (q.page !== undefined) r.page = q.page;
  if (q.pageSize !== undefined) r.pageSize = q.pageSize;
  return r;
});

/** Sustentação (Acelerato): equipe (`totvs,senior,fluig`) e prioridade (`P1..P5`, aceita minúscula). */
export const querySustentacaoSchema = z.object({
  equipe: lista(z.enum(EQUIPES_SUSTENTACAO_ID)),
  prioridade: lista(z.string().transform((p) => p.toUpperCase()).pipe(z.enum(PRIORIDADES))),
  ...comumQuery,
}).strict().transform((q, ctx): ConsultaCalculo<FiltrosSustentacao> => {
  const r: ConsultaCalculo<FiltrosSustentacao> = {
    filtros: { equipe: q.equipe ?? [], prioridade: q.prioridade ?? [], periodo: periodoDe(q, ctx) },
  };
  if (q.dataReferencia !== undefined) r.dataReferencia = q.dataReferencia;
  return r;
});

/** Visão geral: sem filtros (padrões de cada painel); só a data de referência. */
export const queryVisaoGeralSchema = z.object({ dataReferencia: data.optional() }).strict()
  .transform((q): ConsultaCalculo<Record<string, never>> => (q.dataReferencia === undefined ? { filtros: {} } : { filtros: {}, dataReferencia: q.dataReferencia }));

/** Pesquisa de percepção (PV1): só a data de referência; equipe, prioridade e período não se aplicam. */
export const queryPesquisaSchema = z.object({ dataReferencia: data.optional() }).strict()
  .transform((q): ConsultaCalculo<Record<string, never>> => (q.dataReferencia === undefined ? { filtros: {} } : { filtros: {}, dataReferencia: q.dataReferencia }));

export const paramsIdSchema = z.object({ id: z.string() }).strict();
export const itensMetaSchema = z.object({ page: z.number().int().min(1), pageSize: z.number().int().min(1), total: z.number().int().min(0) }).strict();
/** O2 paginado: o DTO do contrato mais `itensMeta` (docs/api/metricas.md). */
export const resultadoO2PaginadoSchema = resultadoO2.extend({ itensMeta: itensMetaSchema });
export const criteriosRespostaSchema = z.array(versaoCriterioSchema);
