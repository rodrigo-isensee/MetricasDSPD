import pg from 'pg';
import { migrar } from '../../src/plataforma/db/migrar.js';
import { prefixoDeTeste } from '../../src/plataforma/db/esquemas.js';

/** Contrato com os testes: injeta o prefixo desta execução e a URL do migrador (`inject`). */
declare module 'vitest' {
  export interface ProvidedContext {
    dspdPrefixo: string;
    dspdUrl: string;
  }
}

type Projeto = { provide: (chave: 'dspdPrefixo' | 'dspdUrl', valor: string) => void };

let prefixoAtual = '';
let urlAtual = '';

/** Sem PG_TESTE_URL (ex.: `pnpm run pronto` sem Docker) nada é criado e os testes ficam pulados. */
export async function setup(project: Projeto): Promise<void> {
  const url = process.env.PG_TESTE_URL;
  if (!url) return;
  urlAtual = url;
  prefixoAtual = prefixoDeTeste();
  project.provide('dspdPrefixo', prefixoAtual);
  project.provide('dspdUrl', url);
  await migrar(url, { prefixo: prefixoAtual });
}

/** `globalTeardown`: DROP SCHEMA ... CASCADE nos três (DSPD_TESTE_MANTER=1 preserva, para inspeção). */
export async function teardown(): Promise<void> {
  if (!urlAtual || process.env.DSPD_TESTE_MANTER === '1') return;
  const c = new pg.Client({ connectionString: urlAtual });
  await c.connect();
  try {
    for (const s of ['bm', 'ac', 'core']) await c.query(`DROP SCHEMA IF EXISTS ${prefixoAtual}dspd_${s} CASCADE`);
  } finally {
    await c.end();
  }
}
