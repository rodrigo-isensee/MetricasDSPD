import { describe, expect, it } from 'vitest';
import { PASSOS, PROXIMO_PASSO, estadoDasMigracoes, executarPassos, nomesDeMigracao, recusaDeBackup } from '../src/plataforma/db/vm-preparar.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';

const S = montarEsquemas('');
// 2026-11-16 15:00 UTC = 12:00 em Brasília; 2026-11-17 01:00 UTC ainda é dia 16 em Brasília.
const agora = new Date('2026-11-16T15:00:00Z');

describe('vm:preparar, ordem e conteúdo dos passos', () => {
  it('migra primeiro, calendário antes dos alvos, critérios por último; sem primeira carga nem classe de serviço', () => {
    const nomes = PASSOS.map((p) => p.nome);
    expect(nomes[0]).toBe('migrar');
    expect(nomes.indexOf('ref:sync-calendario')).toBeLessThan(nomes.indexOf('ac:ref-sync'));
    expect(nomes.indexOf('ac:reprojetar-fluxo')).toBeLessThan(nomes.indexOf('ac:criterios'));
    expect(nomes.indexOf('bm:ref-sync-sle')).toBe(nomes.indexOf('bm:ref-sync') + 1);
    expect(nomes.at(-1)).toBe('ac:criterios');
    expect(nomes.join(' ')).not.toMatch(/coleta|carga|classe-servico/);
    expect(PASSOS.filter((p) => p.opcional).map((p) => p.nome)).toEqual(['ac:reprojetar-escala']);
    expect(PROXIMO_PASSO).toContain('primeira carga');
  });
});

describe('nomesDeMigracao', () => {
  it('tira a extensão e ignora oculto e json', () => {
    expect(nomesDeMigracao(['0001_b.ts', '.gitkeep', 'checksums.json', '0000_a.ts'])).toEqual(['0000_a', '0001_b']);
  });
});

describe('estadoDasMigracoes', () => {
  const dublê = (existe: boolean, feitas: string[]) => ({
    query: async (texto: string) => {
      if (texto.includes('to_regclass')) return { rows: [{ existe }], rowCount: 1 };
      return { rows: feitas.map((name) => ({ name })), rowCount: feitas.length };
    },
  });
  it('base virgem: nenhuma aplicada, todas pendentes', async () => {
    expect(await estadoDasMigracoes(dublê(false, []) as never, S, ['0000_a', '0001_b'])).toEqual({ aplicadas: 0, pendentes: ['0000_a', '0001_b'] });
  });
  it('base migrada: só a que falta fica pendente', async () => {
    expect(await estadoDasMigracoes(dublê(true, ['0000_a']) as never, S, ['0000_a', '0001_b'])).toEqual({ aplicadas: 1, pendentes: ['0001_b'] });
  });
});

describe('recusaDeBackup (A1 do review)', () => {
  it('sem pendência: segue', () => {
    expect(recusaDeBackup({ aplicadas: 39, pendentes: [], confirmacao: undefined, agora })).toBeNull();
  });
  it('base virgem: segue sem backup', () => {
    expect(recusaDeBackup({ aplicadas: 0, pendentes: ['0000_a'], confirmacao: undefined, agora })).toBeNull();
  });
  it('pendente sobre base com dados e sem confirmação: recusa e diz o que fazer', () => {
    const m = recusaDeBackup({ aplicadas: 39, pendentes: ['0040_x'], confirmacao: undefined, agora });
    expect(m).toContain('0040_x');
    expect(m).toContain('DSPD_BACKUP_CONFIRMADO=2026-11-16');
  });
  it('confirmação de outro dia: recusa', () => {
    expect(recusaDeBackup({ aplicadas: 39, pendentes: ['0040_x'], confirmacao: '2026-11-15', agora })).not.toBeNull();
  });
  it('confirmação de hoje em Brasília (mesmo com UTC já no dia seguinte): segue', () => {
    const tarde = new Date('2026-11-17T01:00:00Z');
    expect(recusaDeBackup({ aplicadas: 39, pendentes: ['0040_x'], confirmacao: '2026-11-16\n', agora: tarde })).toBeNull();
  });
});

describe('executarPassos', () => {
  const tres = [{ nome: 'a', entrada: 'a' }, { nome: 'b', entrada: 'b' }, { nome: 'c', entrada: 'c' }];
  it('roda todos em ordem quando tudo dá 0', async () => {
    const vistos: string[] = [];
    const r = await executarPassos(tres, async (p, i, t) => { vistos.push(`${i}/${t}${p.nome}`); return 0; });
    expect(r).toEqual({ ok: true, feitos: ['a', 'b', 'c'] });
    expect(vistos).toEqual(['1/3a', '2/3b', '3/3c']);
  });
  it('para no primeiro erro, nomeia o passo e não roda os seguintes', async () => {
    const vistos: string[] = [];
    const r = await executarPassos(tres, async (p) => { vistos.push(p.nome); return p.nome === 'b' ? 4 : 0; });
    expect(r).toEqual({ ok: false, feitos: ['a'], falhou: 'b', codigo: 4 });
    expect(vistos).toEqual(['a', 'b']);
  });
});
