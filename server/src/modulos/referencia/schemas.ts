import { z } from 'zod';

export const dominioParamsSchema = z.object({ dominio: z.enum(['businessmap', 'acelerato']) }).strict();
/** Sem parâmetros: qualquer um (inclusive `?responsavel=`) reprova a validação. */
export const semQuerySchema = z.object({}).strict();

/** Schemas de resposta vivem em `@metricas-dspd/contratos` (o front os usa para validar a API); re-exportados aqui. */
export {
  opcoesFiltroFluxoSchema,
  opcoesFiltroSustentacaoSchema,
  opcoesFiltroSchema,
  referenciaSchema,
  type OpcoesFiltroDto,
  type ReferenciaDto,
} from '@metricas-dspd/contratos';
