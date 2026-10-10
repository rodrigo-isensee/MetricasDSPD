import type { FastifyInstance } from 'fastify';
import type { OpenAPIV3_1 } from 'openapi-types';

/** Documento OpenAPI do app (precisa de `ready()`), tipado com `openapi-types`, em texto estável (versionado em docs/api). */
export async function gerarOpenapi(app: FastifyInstance): Promise<string> {
  await app.ready();
  const doc = app.swagger() as OpenAPIV3_1.Document;
  return `${JSON.stringify(doc, null, 2)}\n`;
}
