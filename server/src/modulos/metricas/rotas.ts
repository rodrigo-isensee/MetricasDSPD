import { createHash } from 'node:crypto';
import { METRICA_IDS, fonteDaMetrica, type MetricaId, type ResultadoO2 } from '@metricas-dspd/contratos';
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { ZodType } from 'zod';
import { AppError, erroSchema } from '../../plataforma/erros.js';
import {
  paramsIdSchema, queryFluxoSchema, queryPesquisaSchema, querySustentacaoSchema, queryVisaoGeralSchema, resultadoO2PaginadoSchema,
  type ConsultaCalculo,
} from './schemas.js';
import type { FiltrosMetrica, ServicoMetricas } from './servico.js';

export type DepsRotasMetricas = { servico: ServicoMetricas; agora: () => Date };

const CACHE = 'private, max-age=60';
export const PAGINA_PADRAO = 50;
export const PAGINA_MAXIMA = 200;

const QUERY_POR_FONTE = { ambos: queryVisaoGeralSchema, pesquisa: queryPesquisaSchema, acelerato: querySustentacaoSchema, businessmap: queryFluxoSchema } as const;
const queryDe = (id: MetricaId): ZodType => QUERY_POR_FONTE[fonteDaMetrica(id)];

/** Itens do O2 ordenados por idade decrescente (desempate `cardId`); `tipos`, referências e contagens ficam do conjunto completo. */
export function paginarO2(r: ResultadoO2, page = 1, pageSize?: number): ResultadoO2 & { itensMeta: { page: number; pageSize: number; total: number } } {
  const tamanho = pageSize ?? (page === 1 ? PAGINA_MAXIMA : PAGINA_PADRAO);
  const ordenados = [...r.itens].sort((a, b) => b.idadeDiasUteis - a.idadeDiasUteis || (a.cardId < b.cardId ? -1 : a.cardId > b.cardId ? 1 : 0));
  return { ...r, itens: ordenados.slice((page - 1) * tamanho, page * tamanho), itensMeta: { page, pageSize: tamanho, total: ordenados.length } };
}

/**
 * `GET /api/v1/metricas/:id`: uma rota por métrica (o schema de entrada é do domínio da métrica: fluxo, sustentação ou visão
 * geral; o de saída é o DTO do contrato). Id desconhecido cai na rota genérica (404 METRICA_NAO_ENCONTRADA).
 */
export async function rotasMetricas(app: FastifyInstance, deps: DepsRotasMetricas): Promise<void> {
  for (const id of METRICA_IDS) {
    const saida: ZodType = id === 'O2' ? resultadoO2PaginadoSchema : SCHEMAS_RESULTADO[id];
    app.get(`/metricas/${id}`, {
      schema: {
        tags: ['metricas'], summary: `Métrica ${id}`, querystring: queryDe(id),
        response: { 200: saida, 400: erroSchema, 422: erroSchema, 500: erroSchema, 503: erroSchema },
      },
    }, async (req: FastifyRequest, resposta: FastifyReply) => {
      const q = req.query as ConsultaCalculo<FiltrosMetrica>;
      const c = await deps.servico.calcular(id, q.filtros, q.dataReferencia === undefined ? {} : { dataReferencia: q.dataReferencia }, deps.agora());
      const pagina = id === 'O2' ? { page: q.page ?? 1, pageSize: q.pageSize } : null;
      const etag = `W/"${createHash('sha1').update(`${c.chave}|${JSON.stringify(pagina)}`).digest('hex').slice(0, 20)}"`;
      void resposta.header('cache-control', CACHE).header('etag', etag).header('x-data-referencia', c.dataReferencia)
        .header('x-versao-criterio', c.versaoCriterio);
      if (req.headers['if-none-match'] === etag) return resposta.code(304).send();
      return pagina === null ? c.resultado : paginarO2(c.resultado as ResultadoO2, pagina.page, pagina.pageSize);
    });
  }
  app.get('/metricas/:id', { schema: { tags: ['metricas'], summary: 'Métrica inexistente (404)', params: paramsIdSchema, response: { 404: erroSchema } } }, () => {
    throw new AppError('METRICA_NAO_ENCONTRADA', 'Métrica não encontrada.', 404);
  });
}
