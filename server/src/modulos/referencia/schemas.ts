import { z } from 'zod';

/** Datas AAAA-MM-DD (America/Sao_Paulo). */
const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const opcao = z.object({ id: z.string().min(1), nome: z.string().min(1) }).strict();
const historico = z.object({ inicio: data, fim: data }).strict();

export const dominioParamsSchema = z.object({ dominio: z.enum(['businessmap', 'acelerato']) }).strict();
/** Sem parâmetros: qualquer um (inclusive `?responsavel=`) reprova a validação. */
export const semQuerySchema = z.object({}).strict();

export const opcoesFiltroFluxoSchema = z
  .object({
    dominio: z.literal('businessmap'),
    equipes: z.array(opcao),
    tipos: z.array(opcao),
    sistemas: z.array(opcao),
    historico,
  })
  .strict();
export const opcoesFiltroSustentacaoSchema = z
  .object({ dominio: z.literal('acelerato'), equipes: z.array(opcao), prioridades: z.array(opcao), historico })
  .strict();
export const opcoesFiltroSchema = z.discriminatedUnion('dominio', [opcoesFiltroFluxoSchema, opcoesFiltroSustentacaoSchema]);

const instante = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
export const referenciaSchema = z
  .object({
    dataReferencia: data,
    ultimaColeta: z.object({ businessmap: instante.nullable(), acelerato: instante.nullable() }).strict(),
    versaoCriterio: z.string(),
  })
  .strict();
export type OpcoesFiltroDto = z.infer<typeof opcoesFiltroSchema>;
export type ReferenciaDto = z.infer<typeof referenciaSchema>;
