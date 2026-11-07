import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { gerarGrants } from '../src/plataforma/db/grants.js';

const ENTRADA = new URL('../src/entradas/ref-sync-businessmap.ts', import.meta.url).pathname;
const rodar = (args: string[], env: Record<string, string> = {}): SpawnSyncReturns<string> =>
  spawnSync(process.execPath, ['--import', 'tsx', ENTRADA, ...args], { encoding: 'utf8', env: { PATH: process.env.PATH ?? '', ...env }, timeout: 60_000 });

describe('entrada bm:ref-sync', () => {
  it.each(['2026-02-30', '2026-13-01', 'ontem'])('data %s é recusada com a mensagem de uso e código 2, antes de ler a configuração', (data) => {
    const r = rodar([data]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('uso: bm:ref-sync [AAAA-MM-DD]');
    expect(r.stdout).toBe('');
  });

  it('argumento a mais (caminho de arquivo) é recusado: o caminho do arquivo é constante', () => {
    const r = rodar(['2026-11-04', '/etc/passwd']);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('uso:');
  });

  it('URL inválida com senha marcador: mensagem fixa, marcador ausente da saída', () => {
    const r = rodar(['2026-11-04'], { PG_REF_URL: 'postgres://dspd_ref:SENHA-MARCADOR-069@host-invalido:porta-ruim/db' });
    expect(r.status).toBe(1);
    expect(r.stderr).toBe('bm:ref-sync falhou: outro\n');
    expect(`${r.stdout}${r.stderr}`).not.toContain('SENHA-MARCADOR-069');
  });

  it('o arquivo real nasce vazio de campos e a entrada não tem credencial nem chamada de API do BusinessMap', () => {
    const fonte = readFileSync(ENTRADA, 'utf8');
    expect(fonte).not.toMatch(/BM_APIKEY|criarClienteHttp|fetch\(|http\.js/i);
  });

  it('GRANT: o lote não cria permissão sobre ref_dominio além da que já existe (coletor só lê, ref só insere e fecha vigência)', () => {
    const S = montarEsquemas('');
    const grants = gerarGrants(S, { bm: { ref_dominio: ['campo', 'codigo', 'vigente_de', 'vigente_ate', 'rotulo', 'ordem'], stg_card: ['custom_fields'] }, ac: {}, core: {} }).join('\n');
    expect(grants).toMatch(/GRANT SELECT, INSERT ON dspd_bm\.ref_dominio TO dspd_ref/);
    expect(grants).toMatch(/GRANT UPDATE \(vigente_ate\) ON dspd_bm\.ref_dominio TO dspd_ref/);
    expect(grants).not.toMatch(/(INSERT|UPDATE|DELETE)[^\n]*ON dspd_bm\.ref_dominio TO dspd_(coletor|api)\b/);
    expect(grants).not.toMatch(/ON dspd_bm\.stg_\w+ TO dspd_api\b/);
  });
});
