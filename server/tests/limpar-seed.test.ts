import { describe, expect, it } from 'vitest';
import { analisarArgumentosLimpezaSeed, ErroLimpezaSeed, limparSeed } from '../src/plataforma/db/limpar-seed.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg, type Chamada, type Resposta } from './duble-pg.js';

const E = montarEsquemas('x_');
const PARAMETROS = { semente: 3, hoje: '2026-10-09T18:00:00-03:00', escala: 0.05, mesesHistorico: 18 };
const SEED = [{ coleta_id: '1', versao_coletor: 'seed-mock', parametros: PARAMETROS }, { coleta_id: '2', versao_coletor: 'seed-mock-coleta', parametros: null }];

type Ajuste = (c: Chamada) => Resposta | undefined;
/** Banco falso com seed nos dois esquemas: toda contagem dá 2 e todo DELETE remove 2 (as 2 coletas), salvo ajuste. */
const banco = (ajuste: Ajuste = () => undefined, coletas: (schema: string) => unknown[] = () => SEED) =>
  criarDublePg((c) => {
    const a = ajuste(c);
    if (a !== undefined) return a;
    if (c.texto.includes('starts_with')) return coletas(c.texto.includes(E.ac) ? E.ac : E.bm);
    if (c.texto.includes('AS k FROM')) return [{ k: 'c1' }, { k: 'c2' }];
    if (c.texto.includes('FROM pg_attribute')) {
      return c.valores[0] === E.ac
        ? [{ tabela: 'dim_chamado_versao', coluna: 'chamado_id' }, { tabela: 'dim_chamado', coluna: 'chamado_id' }, { tabela: 'ref_dominio', coluna: 'coleta_id' }]
        : [{ tabela: 'stg_revision', coluna: 'coleta_id' }, { tabela: 'dim_card_versao', coluna: 'card_id' }, { tabela: 'dim_card', coluna: 'card_id' },
          { tabela: 'ref_ficha_resultado', coluna: 'card_id' }];
    }
    if (c.texto.includes('count(*)')) return [{ n: c.texto.includes('stg_revision') || c.texto.includes('dim_card_versao') || c.texto.includes('dim_chamado_versao') || c.texto.includes('stg_card') || c.texto.includes('stg_chamado') || c.texto.includes('rec_transicao_par') || c.texto.includes('<> ALL') || c.texto.includes('pg_trigger') ? '0' : '2' }];
    if (c.texto.startsWith('DELETE')) return { rows: [], rowCount: 2 };
    return [];
  });
const textos = (cs: Chamada[]): string[] => cs.map((c) => c.texto);

describe('limparSeed (dublê de banco)', () => {
  it('simulação: transação somente leitura, só SELECT, contagens por tabela dos dois esquemas', async () => {
    const { pool, chamadas } = banco();
    const r = await limparSeed(pool, { aplicar: false, S: E });
    expect(r.modo).toBe('simulacao');
    expect(r.fontes.map((f) => f.fonte)).toEqual(['businessmap', 'acelerato']);
    expect(r.fontes[0]!.coletas).toBe(2);
    expect(Object.keys(r.fontes[0]!.tabelas)).toEqual(expect.arrayContaining(['fato_transicao', 'fato_bloqueio', 'dim_card', 'ref_quadro', 'ref_coluna', 'ref_ficha_resultado', 'ctl_coleta']));
    expect(Object.keys(r.fontes[1]!.tabelas)).toEqual(expect.arrayContaining(['fato_etapa_chamado', 'dim_chamado', 'ref_alvo_prioridade', 'ctl_coleta']));
    const t = textos(chamadas);
    expect(t[1]).toBe('SET TRANSACTION READ ONLY');
    expect(t.filter((x) => /^(DELETE|ALTER|INSERT|UPDATE|TRUNCATE)/.test(x))).toEqual([]);
    expect(t.at(-1)).toBe('COMMIT');
  });

  it('aplicação: ordem de remoção, gatilho desligado e religado só em fato_transicao, ctl_coleta por último, nada de nome na saída', async () => {
    const { pool, chamadas } = banco();
    const r = await limparSeed(pool, { aplicar: true, S: E });
    expect(r.modo).toBe('aplicado');
    const t = textos(chamadas);
    expect(t).not.toContain('SET TRANSACTION READ ONLY');
    const alteres = t.filter((x) => x.startsWith('ALTER'));
    expect(alteres).toEqual([
      `ALTER TABLE ${E.bm}.fato_transicao DISABLE TRIGGER tg_fato_transicao_imutavel`,
      `ALTER TABLE ${E.bm}.fato_transicao ENABLE TRIGGER tg_fato_transicao_imutavel`,
    ]);
    const apagadas = t.filter((x) => x.startsWith('DELETE')).map((x) => x.split(' WHERE')[0]!.replace('DELETE FROM ', ''));
    expect(apagadas.filter((x) => x.startsWith(`${E.bm}.`))).toEqual([
      `${E.bm}.fato_transicao`, `${E.bm}.fato_bloqueio`, `${E.bm}.dim_card`,
      ...apagadas.filter((x) => x.startsWith(`${E.bm}.ref_`)), `${E.bm}.ctl_coleta`]);
    expect(apagadas.at(-1)).toBe(`${E.ac}.ctl_coleta`);
    expect(t.indexOf(alteres[0]!)).toBeLessThan(t.findIndex((x) => x.startsWith(`DELETE FROM ${E.bm}.fato_transicao`)));
    expect(t.findIndex((x) => x.startsWith(`DELETE FROM ${E.bm}.fato_transicao`))).toBeLessThan(t.indexOf(alteres[1]!));
    expect(t.at(-1)).toBe('COMMIT');
    expect(JSON.stringify(r)).not.toMatch(/titulo|nome|email/i);
  });

  it('sem seed em nenhum esquema: nada a fazer, nenhuma escrita', async () => {
    const { pool, chamadas } = banco(() => undefined, () => []);
    const r = await limparSeed(pool, { aplicar: true, S: E });
    expect(r.fontes).toEqual([{ fonte: 'businessmap', coletas: 0, tabelas: {} }, { fonte: 'acelerato', coletas: 0, tabelas: {} }]);
    expect(textos(chamadas).some((x) => /^(DELETE|ALTER)/.test(x))).toBe(false);
  });

  it('seed só no Acelerato: o BusinessMap não é tocado', async () => {
    const { pool, chamadas } = banco(() => undefined, (s) => (s === E.ac ? SEED : []));
    const r = await limparSeed(pool, { aplicar: true, S: E });
    expect(r.fontes[0]!.coletas).toBe(0);
    expect(textos(chamadas).filter((x) => x.startsWith('DELETE')).every((x) => x.includes(`${E.ac}.`))).toBe(true);
    expect(textos(chamadas).some((x) => x.startsWith('ALTER'))).toBe(false);
  });

  it('usa o esquema do ambiente quando não recebe um', async () => {
    const { pool, chamadas } = banco(() => undefined, () => []);
    await limparSeed(pool, { aplicar: false });
    expect(chamadas.some((c) => c.texto.includes('dspd_bm.ctl_coleta'))).toBe(true);
  });

  it('só a coleta seed-mock-coleta (sem parâmetros do seed): recusa antes de escrever', async () => {
    const { pool, chamadas } = banco(() => undefined, () => [SEED[1]]);
    await expect(limparSeed(pool, { aplicar: true, S: E })).rejects.toMatchObject({ codigo: 'sem-parametros' });
    expect(textos(chamadas).some((x) => /^(DELETE|ALTER)/.test(x))).toBe(false);
    expect(textos(chamadas).at(-1)).toBe('ROLLBACK');
  });

  it('parâmetros do seed inválidos: recusa', async () => {
    const { pool } = banco(() => undefined, () => [{ ...SEED[0]!, parametros: { semente: 'x' } }]);
    await expect(limparSeed(pool, { aplicar: false, S: E })).rejects.toBeInstanceOf(ErroLimpezaSeed);
  });

  const recusa = (nome: string, ajuste: Ajuste, trecho: RegExp) => it(`falha fechada: ${nome}`, async () => {
    const { pool, chamadas } = banco(ajuste);
    const e = await limparSeed(pool, { aplicar: true, S: E }).catch((x: unknown) => x);
    expect(e).toMatchObject({ codigo: 'ligada-a-dado-real' });
    expect((e as Error).message).toMatch(trecho);
    expect((e as Error).message).toMatch(/nada foi removido/);
    expect(textos(chamadas).some((x) => /^(DELETE|ALTER)/.test(x))).toBe(false);
    expect(textos(chamadas).at(-1)).toBe('ROLLBACK');
  });
  recusa('tabela com a marca da coleta do seed fora das removidas', (c) => (c.texto.includes('FROM x_dspd_bm.stg_revision WHERE') ? [{ n: '3' }] : undefined), /stg_revision: 3/);
  recusa('tabela com card do seed fora das removidas', (c) => (c.texto.includes('FROM x_dspd_bm.dim_card_versao WHERE') ? [{ n: '1' }] : undefined), /dim_card_versao: 1/);
  recusa('staging com card do seed', (c) => (c.texto.includes('FROM x_dspd_bm.stg_card WHERE') ? [{ n: '4' }] : undefined), /stg_card: 4/);
  recusa('staging com chamado do seed', (c) => (c.texto.includes('FROM x_dspd_ac.stg_chamado WHERE') ? [{ n: '4' }] : undefined), /stg_chamado: 4/);
  recusa('linha de coleta real com card do seed', (c) => (c.texto.includes('<> ALL') && c.texto.includes('fato_transicao') ? [{ n: '5' }] : undefined), /fato_transicao: 5/);
  recusa('par de transições que aponta para transição do seed', (c) => (c.texto.includes('FROM x_dspd_bm.rec_transicao_par') ? [{ n: '6' }] : undefined), /rec_transicao_par: 6/);
  recusa('ref_quadro com a chave do seed e conteúdo diferente', (c) => (c.texto.includes('FROM x_dspd_bm.ref_quadro') && c.texto.includes('equipe::text') ? [{ n: '1' }] : undefined), /ref_quadro: 1/);
  recusa('ref_coluna real com a chave do seed (assinatura do seed ausente)', (c) => (c.texto.includes('FROM x_dspd_bm.ref_coluna') && c.texto.includes('workflow_id IS NULL') ? [{ n: '1' }] : undefined), /ref_coluna: 1/);

  it('nome de tabela fora do padrão vindo do catálogo: recusa sem montar SQL', async () => {
    const { pool, chamadas } = banco((c) => (c.texto.includes('FROM pg_attribute') ? [{ tabela: 'Tabela; DROP', coluna: 'coleta_id' }] : undefined));
    await expect(limparSeed(pool, { aplicar: false, S: E })).rejects.toThrow('identificador inválido');
    expect(textos(chamadas).some((x) => x.includes('DROP'))).toBe(false);
  });

  it('contagem removida diferente da prevista: desfaz tudo', async () => {
    const { pool, chamadas } = banco((c) => (c.texto.startsWith(`DELETE FROM ${E.bm}.dim_card`) ? { rows: [], rowCount: 1 } : undefined));
    await expect(limparSeed(pool, { aplicar: true, S: E })).rejects.toMatchObject({ codigo: 'contagem-divergente' });
    expect(textos(chamadas).at(-1)).toBe('ROLLBACK');
  });

  it('DELETE sem contagem: também desfaz', async () => {
    const { pool } = banco((c) => (c.texto.startsWith(`DELETE FROM ${E.bm}.fato_transicao`) ? { rows: [], rowCount: undefined as unknown as number } : undefined));
    await expect(limparSeed(pool, { aplicar: true, S: E })).rejects.toThrow(/removidas 0 de 2/);
  });

  it('gatilho que não voltou ao estado ativo: desfaz tudo', async () => {
    const { pool, chamadas } = banco((c) => (c.texto.includes('FROM pg_trigger') ? [{ n: '1' }] : undefined));
    await expect(limparSeed(pool, { aplicar: true, S: E })).rejects.toMatchObject({ codigo: 'gatilho' });
    expect(textos(chamadas).at(-1)).toBe('ROLLBACK');
  });
});

describe('analisarArgumentosLimpezaSeed', () => {
  it('sem argumento simula; --aplicar escreve; qualquer outra coisa é erro de uso', () => {
    expect(analisarArgumentosLimpezaSeed([])).toEqual({ aplicar: false });
    expect(analisarArgumentosLimpezaSeed(['--aplicar'])).toEqual({ aplicar: true });
    expect(() => analisarArgumentosLimpezaSeed(['--aplicr'])).toThrow(/uso/);
    expect(() => analisarArgumentosLimpezaSeed(['--aplicar', 'x'])).toThrow(ErroLimpezaSeed);
  });
});
