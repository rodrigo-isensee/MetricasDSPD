import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const RAIZ = new URL('../src', import.meta.url).pathname;
const arquivos = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? arquivos(join(dir, e.name)) : e.name.endsWith('.ts') ? [join(dir, e.name)] : []));

describe('tabela de times: só filtro, nunca comparação entre times (regra inviolável do CLAUDE.md; data-model §9)', () => {
  it('nenhuma rota, serviço ou repositório da API toca ref_time nem ref_time_workflow; só o projetor do coletor (F4) lê, para gravar a equipe', () => {
    const usam = arquivos(RAIZ).filter((a) => /ref_time/.test(readFileSync(a, 'utf8'))).map((a) => a.slice(RAIZ.length + 1));
    // `db/grants.ts` só lista `registrado_por` em COLUNAS_FORA_DA_API. F4 do plano 052: o projetor (papel `dspd_coletor`, fora da API) lê
    // as duas tabelas só para gravar `dim_card.equipe`, que continua filtro, no instante do evento (U-2).
    expect(usam).toEqual(['modulos/businessmap/projetor.ts', 'plataforma/db/grants.ts']);
  });
  it('o projetor não agrupa, conta nem compara por time: só resolve o nome do time do workflow no dia do evento', () => {
    const fonte = readFileSync(join(RAIZ, 'modulos/businessmap/projetor.ts'), 'utf8');
    expect(fonte).not.toMatch(/GROUP BY|count\(|avg\(|sum\(|RANK|ORDER BY .*equipe/i);
  });
  it('o normalizador (A2 da segurança da F4) também não agrupa, conta nem ordena por time ou equipe: só resolve o nome vigente no dia', () => {
    const fonte = readFileSync(join(RAIZ, 'modulos/businessmap/normalizador.ts'), 'utf8');
    expect(fonte).not.toMatch(/GROUP BY|count\(|avg\(|sum\(|RANK|ORDER BY .*equipe/i);
    expect(fonte).not.toMatch(/\.sort\([^)]*(time|equipe)|ordenarNeutro\([^)]*(time|equipe)|\.reduce\([^)]*(time|equipe)/i);
    expect(fonte).not.toMatch(/Map<[^>]*equipe|\[equipe\]/);
  });
  it('nenhuma view de migração seleciona as tabelas de times', () => {
    const migracoes = new URL('../migrations', import.meta.url).pathname;
    const views = readdirSync(migracoes).filter((n) => n.endsWith('.ts')).map((n) => readFileSync(join(migracoes, n), 'utf8'))
      .flatMap((t) => t.split('CREATE VIEW').slice(1).map((v) => v.split('`')[0]!));
    expect(views.length).toBeGreaterThan(0);
    for (const v of views) expect(v).not.toMatch(/ref_time/);
  });
});
