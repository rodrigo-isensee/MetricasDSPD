import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const RAIZ = new URL('../src', import.meta.url).pathname;
const arquivos = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? arquivos(join(dir, e.name)) : e.name.endsWith('.ts') ? [join(dir, e.name)] : []));

describe('tabela de times: só filtro, nunca comparação entre times (regra inviolável do CLAUDE.md; data-model §9)', () => {
  it('nenhuma rota, serviço ou repositório da API toca ref_time nem ref_time_workflow na F0', () => {
    const usam = arquivos(RAIZ).filter((a) => /ref_time/.test(readFileSync(a, 'utf8'))).map((a) => a.slice(RAIZ.length + 1));
    // `db/grants.ts` só lista `registrado_por` em COLUNAS_FORA_DA_API.
    expect(usam).toEqual(['plataforma/db/grants.ts']);
  });
  it('nenhuma view de migração seleciona as tabelas de times', () => {
    const migracoes = new URL('../migrations', import.meta.url).pathname;
    const views = readdirSync(migracoes).filter((n) => n.endsWith('.ts')).map((n) => readFileSync(join(migracoes, n), 'utf8'))
      .flatMap((t) => t.split('CREATE VIEW').slice(1).map((v) => v.split('`')[0]!));
    expect(views.length).toBeGreaterThan(0);
    for (const v of views) expect(v).not.toMatch(/ref_time/);
  });
});
