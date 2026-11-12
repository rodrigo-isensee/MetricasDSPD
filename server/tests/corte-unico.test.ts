import { describe, expect, it } from 'vitest';
import { lerCards, lerChamados } from '../src/modulos/metricas/repositorio.js';
import { CORTE_CARDS, CORTE_CHAMADOS } from '../src/modulos/referencia/index.js';
import { lerPrioridadesAC, lerTiposBM } from '../src/modulos/referencia/repositorio.js';
import type { Consultavel } from '../src/plataforma/db/pool.js';

/** K-280: listas e opções de filtro usam a mesma condição de corte (uma só constante). */
const capturar = async (fn: (db: Consultavel) => Promise<unknown>): Promise<string> => {
  let texto = '';
  const db = { query: async (t: string) => { texto = t; return { rows: [] }; } } as unknown as Consultavel;
  await fn(db);
  return texto;
};

describe('corte único de cards e chamados (K-280)', () => {
  it('lerCards e lerTiposBM usam o mesmo corte', async () => {
    expect(await capturar((db) => lerCards(db))).toContain(`WHERE ${CORTE_CARDS}`);
    expect(await capturar((db) => lerTiposBM(db))).toContain(`WHERE ${CORTE_CARDS}`);
  });
  it('lerChamados e lerPrioridadesAC usam o mesmo corte', async () => {
    expect(await capturar((db) => lerChamados(db))).toContain(`WHERE ${CORTE_CHAMADOS}`);
    expect(await capturar((db) => lerPrioridadesAC(db))).toContain(`WHERE ${CORTE_CHAMADOS}`);
  });
});
