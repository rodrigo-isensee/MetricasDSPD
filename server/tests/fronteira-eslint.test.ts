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
  // K-318 (ADR 0013 §9): a raiz de @metricas-dspd/metricas só entra em modulos/metricas.
  const recusa = async (arquivo: string, codigo: string) =>
    (await eslint.lintText(codigo, { filePath: `${raiz}/${arquivo}` })).flatMap((r) => r.messages).filter((m) => m.ruleId === 'no-restricted-imports');
  it.each([
    'src/app.ts',
    'src/plataforma/zz.ts',
    'src/plataforma/db/extensoes-mock.ts',
    'src/modulos/operacao/zz.ts',
    'src/modulos/businessmap/zz.ts',
  ])('%s recusa a raiz da biblioteca, inclusive import type', async (arquivo) => {
    expect(await recusa(arquivo, "import { slug } from '@metricas-dspd/metricas';\nexport { slug };\n")).toHaveLength(1);
    expect(await recusa(arquivo, "import type { X } from '@metricas-dspd/metricas';\nexport type Y = X;\n")).toHaveLength(1);
  });
  it('subcaminho /core segue liberado fora do módulo', async () => {
    expect(await recusa('src/modulos/operacao/zz.ts', "import { a } from '@metricas-dspd/metricas/core';\nexport { a };\n")).toHaveLength(0);
  });
  it('modulos/metricas pode importar a raiz', async () => {
    expect(await recusa('src/modulos/metricas/zz.ts', "import { slug } from '@metricas-dspd/metricas';\nexport { slug };\n")).toHaveLength(0);
  });
});
