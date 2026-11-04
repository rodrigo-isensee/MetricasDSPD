import type { Esquemas } from './esquemas.js';
import { contarColetasReais } from './guarda-seed.js';
import type { Consultavel } from './pool.js';

/**
 * Guarda do modo mock na partida da API (revisão de segurança 627e55f, A1; pedido 060): o modo demonstração serve dado fictício e nunca
 * pode subir sobre base com coleta real. Reusa a contagem da guarda do seed (`contarColetasReais`), só leitura de `ctl_coleta`,
 * sem permissão nova no banco. A mensagem leva só nome de tabela e contagem, nunca valor de configuração.
 */
export async function exigirMockSemColetaReal(db: Consultavel, S: Pick<Esquemas, 'bm' | 'ac'>): Promise<void> {
  const achados: string[] = [];
  for (const esquema of [S.bm, S.ac]) {
    const n = await contarColetasReais(db, esquema);
    if (n > 0) achados.push(`${esquema}.ctl_coleta: ${n} linha(s) de coleta real`);
  }
  if (achados.length > 0) {
    throw new Error(`O modo demonstração não sobe sobre base com coleta real (${achados.join('; ')}); use a base de homologação, só com seed`);
  }
}
