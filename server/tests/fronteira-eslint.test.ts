import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

// E3.1 (K-225): a regra de fronteira de importação vale para toda pasta de src fora de modulos/; pasta nova que escape quebra aqui.
const raiz = fileURLToPath(new URL('..', import.meta.url));
const eslint = new ESLint({ cwd: raiz });
const pastas = readdirSync(new URL('../src', import.meta.url), { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== 'modulos')
  .map((d) => d.name);

const regras = async (arquivo: string) => {
  const config = (await eslint.calculateConfigForFile(`${raiz}/${arquivo}`)) as { rules?: Record<string, unknown[]> };
  return config.rules?.['no-restricted-imports'];
};

describe('fronteira de importação do eslint', () => {
  it('há pastas fora de modulos para cobrir', () => {
    expect(pastas.length).toBeGreaterThan(0);
  });
  it.each(pastas)('src/%s traz no-restricted-imports ativo', async (pasta) => {
    const r = await regras(`src/${pasta}/zz-cobertura.ts`);
    expect(r?.[0]).toBeOneOf(['error', 2]);
    expect(JSON.stringify(r)).toContain('modulos/[^/]+/');
  });
  it('src/*.ts (raiz de src) também', async () => {
    const r = await regras('src/zz-cobertura.ts');
    expect(r?.[0]).toBeOneOf(['error', 2]);
  });
});
