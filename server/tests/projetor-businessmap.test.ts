import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ErroColetaBm } from '../src/modulos/businessmap/coleta.js';
import { instanteDoBm } from '../src/modulos/businessmap/normalizador.js';
import {
  analisarArgumentosProjetor, executarProjetor, projetarBusinessMap, TABELAS_LIMPAS_NA_RECONSTRUCAO, TAMANHO_LOTE,
} from '../src/modulos/businessmap/projetor.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg, type Chamada, type Resposta } from './duble-pg.js';

// F4 do plano 052: o projetor contra um banco falso (sem PostgreSQL); o comportamento real fica em projetor-businessmap.pg.test.ts.
const S = montarEsquemas('');
const AGORA = new Date('2026-11-02T12:00:00Z');
const V = { vigente_de: '2020-01-01', vigente_ate: null, motivo: null };
const REF_LINHAS: Record<string, unknown[]> = {
  ref_coluna: [
    { ...V, quadro_id: 'Q', coluna_id: '2', workflow_id: 'W', section: 2, eh_descarte: false, papel: 'compromisso', tipo_coluna: 'fila', ordem: 2 },
    { ...V, quadro_id: 'Q', coluna_id: '3', workflow_id: 'W', section: 3, eh_descarte: false, papel: 'trabalho', tipo_coluna: 'execucao', ordem: 3 },
  ],
  ref_workflow: [{ ...V, quadro_id: 'Q', workflow_id: 'W', nivel: 'story' }],
  ref_time_workflow: [{ ...V, workflow_id: 'W', time_id: 1, situacao: 'time' }],
  ref_time: [{ ...V, time_id: 1, nome: 'Time A' }],
  ref_tipo_card: [{ ...V, tipo_id: '10', eh_item: true, categoria: 'bug_interno' }, { ...V, tipo_id: '12', eh_item: false, categoria: null }],
};
const stg = (id: string, payload: Record<string, unknown> = {}, sk = Number(id) * 10) => ({
  stg_sk: String(sk), id_origem: id, excluido_detectado: false, coletado_em: new Date('2026-11-01T09:00:00Z'),
  payload: { card_id: Number(id), type_id: 10, created_at: '2026-10-01T10:00:00Z', board_id: 'Q', workflow_id: 'W', column_id: 3, title: 'T', ...payload },
});
const rev = (card: string, coluna: number, start: unknown, end: string | null = null): { card_id: string; payload: Record<string, unknown> } => ({ card_id: card, payload: { board_id: 'Q', workflow_id: 'W', column_id: coluna, start, end } });

interface Cenario {
  ids?: string[];
  stg?: ReturnType<typeof stg>[];
  revisoes?: ReturnType<typeof rev>[];
  pais?: { id_origem: string; tipo: string | null }[];
  versoes?: Record<string, unknown>[];
  dimCard?: { card_id: string; responsaveis: string[] }[];
  versaoDoResponsavel?: { vigente_de: Date; responsaveis: string[] | null };
  trava?: boolean;
}
function montar(c: Cenario) {
  const ids = c.ids ?? (c.stg ?? []).map((x) => x.id_origem);
  const responder = (q: Chamada): Resposta => {
    const t = q.texto;
    const n = (t.match(/\(\$/g) ?? []).length;
    if (t.includes('pg_try_advisory_lock')) return [{ ok: c.trava !== false }];
    if (t.includes("'projecao'")) return [{ coleta_id: '88' }];
    for (const [tabela, linhas] of Object.entries(REF_LINHAS)) if (t.includes(`FROM dspd_bm.${tabela}`)) return linhas as never[];
    if (t.startsWith('SELECT DISTINCT id_origem')) return ids.filter((i) => i > (q.valores[0] as string)).slice(0, TAMANHO_LOTE).map((id_origem) => ({ id_origem }));
    if (t.includes('SELECT DISTINCT ON (id_origem) stg_sk')) return (c.stg ?? []).filter((x) => (q.valores[0] as string[]).includes(x.id_origem));
    if (t.includes('FROM dspd_bm.stg_revision')) return c.revisoes ?? [];
    if (t.includes("payload ->> 'type_id' AS tipo")) return c.pais ?? [];
    if (t.includes('SELECT DISTINCT ON (card_id) card_id, vigente_de')) return c.versoes ?? [];
    if (t.includes('SELECT card_id, responsaveis FROM dspd_bm.dim_card WHERE')) return c.dimCard ?? [];
    if (t.includes('SELECT vigente_de, responsaveis FROM dspd_bm.dim_card_versao')) return c.versaoDoResponsavel === undefined ? [] : [c.versaoDoResponsavel];
    if (t.startsWith('INSERT INTO dspd_bm.evt_card') || t.startsWith('INSERT INTO dspd_bm.fato_transicao') || t.startsWith('INSERT INTO dspd_bm.dim_card_versao')) return { rows: [], rowCount: n };
    return [];
  };
  return criarDublePg(responder);
}
const com = (d: ReturnType<typeof montar>, trecho: string): Chamada[] => d.chamadas.filter((x) => x.texto.includes(trecho));
const proj = (d: ReturnType<typeof montar>, extra: Record<string, unknown> = {}) => projetarBusinessMap({ pool: d.pool, S, agora: () => AGORA, ...extra });

describe('projetarBusinessMap (F4)', () => {
  it('projeta fatos, versão e projeção numa transação, registra a execução e as contagens (só números) e conta o que ficou de fora', async () => {
    const d = montar({
      stg: [
        stg('1', { linked_cards: [{ card_id: 9, link_type: 'parent' }, { card_id: 'x', link_type: 'parent' }, null] }),
        stg('2', { created_at: 'sem data' }),
        stg('3', { type_id: 12 }),
      ],
      revisoes: [rev('1', 2, '2026-10-02 10:00:00'), rev('1', 3, '2026-10-03 10:00:00'), rev('1', 3, '2026-10-03 10:00:00', '2026-10-04 10:00:00'), rev('1', 3, 'sem data'), rev('1', 3, '2026-10-05 10:00:00'), { card_id: '1', payload: { start: '2026-10-06 10:00:00' } }, { card_id: '1', payload: { column_id: {}, start: '2026-10-06 10:00:00' } }],
      pais: [{ id_origem: '9', tipo: '12' }, { id_origem: '8', tipo: null }],
    });
    const r = await proj(d);
    expect(r).toMatchObject({
      coletaId: 88, cards: 3, semCriacao: 1, versoes: 2, eventos: { lidos: 2, inseridos: 2 }, transicoes: { lidas: 3, inseridas: 3, semInstante: 3 }, responsaveisGravados: 0,
    });
    expect(r.notas).toMatchObject({ pai_sprint: 1, nao_item: 1 });
    expect(d.chamadas[0]!.texto).toBe('BEGIN');
    expect(d.chamadas.at(-1)!.texto).toBe('COMMIT');
    expect(com(d, 'INSERT INTO dspd_bm.evt_card')[0]!.texto).toContain('ON CONFLICT ON CONSTRAINT uq_evt_card DO NOTHING');
    const fato = com(d, 'INSERT INTO dspd_bm.fato_transicao')[0]!;
    expect(fato.texto).toContain('ON CONFLICT ON CONSTRAINT uq_fato_transicao DO NOTHING');
    expect(fato.valores).toContain('revision');
    expect(com(d, 'INSERT INTO dspd_bm.dim_card_versao')[0]!.texto).toContain('ON CONFLICT ON CONSTRAINT uq_dim_card_versao DO NOTHING');
    expect(com(d, 'DELETE FROM dspd_bm.dim_card WHERE')[0]!.valores).toEqual([['1', '3']]);
    expect(com(d, 'INSERT INTO dspd_bm.dim_card ')[0]!.texto).toContain('::text[]');
    expect(com(d, 'UPDATE dspd_bm.ctl_coleta')[0]!.valores[0]).toBe(88);
    const entidades = com(d, 'INSERT INTO dspd_bm.ctl_coleta_contagem').map((x) => x.valores[1]);
    expect(entidades).toEqual(expect.arrayContaining(['projecao_card', 'projecao_transicao', 'projecao_evento', 'projecao_versao', 'nota_pai_sprint']));
    // nenhuma contagem leva id de card, de coluna ou nome: as entidades são nomes fixos
    expect(entidades.every((e) => /^[a-z_]+$/.test(String(e)))).toBe(true);
  });

  it('pagina a staging por id: lê lotes até acabar', async () => {
    const ids = Array.from({ length: TAMANHO_LOTE + 1 }, (_, i) => String(1000 + i));
    const d = montar({ ids });
    const r = await proj(d);
    expect(r.cards).toBe(0);
    expect(com(d, 'SELECT DISTINCT id_origem')).toHaveLength(3);
    expect(com(d, 'SELECT DISTINCT id_origem')[1]!.valores).toEqual([ids[TAMANHO_LOTE - 1]]);
  });

  it('SCD2: versão igual não gera versão; atributo mudado gera uma, com vigente_de depois da anterior; o conjunto de responsáveis é copiado', async () => {
    const atual = (id: string, titulo: string, vigente: string) => ({
      card_id: id, vigente_de: new Date(vigente), responsaveis: ['7'], titulo, tipo: 'Bug interno', granularidade: 'story', equipe: 'Time A', quadro_id: 'Q', coluna_atual_id: '3', card_pai: null,
      motivo_descarte: null,
    });
    const d = montar({
      stg: [stg('1'), stg('2')],
      versoes: [atual('1', 'T', '2026-10-01T00:00:00Z'), atual('2', 'Outro título', '2026-11-05T00:00:00Z')],
      dimCard: [{ card_id: '1', responsaveis: ['7'] }],
    });
    const r = await proj(d);
    expect(r.versoes).toBe(1);
    const v = com(d, 'INSERT INTO dspd_bm.dim_card_versao')[0]!;
    expect(v.valores[0]).toBe('2');
    expect((v.valores[1] as Date).toISOString()).toBe('2026-11-05T00:00:00.001Z');
    expect(v.valores).toContainEqual(['7']);
    // dim_card refeita com o conjunto que já estava gravado, não com o do staging (que não tem responsável)
    expect(com(d, 'INSERT INTO dspd_bm.dim_card ')[0]!.valores).toContainEqual(['7']);
  });

  it('I-2: o conjunto lido pela coleta da mesma execução entra por gravarResponsaveis; null e card sem entrada não mudam nada', async () => {
    const d = montar({ stg: [stg('1'), stg('2'), stg('3')], versaoDoResponsavel: { vigente_de: new Date('2026-10-01T00:00:00Z'), responsaveis: ['5'] } });
    const r = await proj(d, { responsaveis: new Map<string, readonly string[] | null>([['1', ['5', '6']], ['2', null]]) });
    expect(r.responsaveisGravados).toBe(0);
    expect(com(d, 'SELECT vigente_de, responsaveis FROM dspd_bm.dim_card_versao').map((x) => x.valores[0])).toEqual(['1']);
    expect(com(d, 'INSERT INTO dspd_bm.dim_card ')[0]!.valores).toContainEqual(['5', '6']);
  });

  it('I-2: responsáveis gravados contam quando a projeção os altera (dim_card ou versão)', async () => {
    const d = criarDublePg((q) => {
      const t = q.texto;
      const n = (t.match(/\(\$/g) ?? []).length;
      if (t.includes("'projecao'")) return [{ coleta_id: '88' }];
      if (t.startsWith('SELECT DISTINCT id_origem')) return (q.valores[0] as string) < '1' ? [{ id_origem: '1' }] : [];
      if (t.includes('SELECT DISTINCT ON (id_origem) stg_sk')) return [stg('1')];
      if (t.includes('SELECT vigente_de, responsaveis FROM dspd_bm.dim_card_versao')) return [{ vigente_de: new Date('2026-10-01T00:00:00Z'), responsaveis: ['5'] }];
      if (t.startsWith('UPDATE dspd_bm.dim_card SET responsaveis')) return { rows: [], rowCount: 1 };
      if (t.startsWith('INSERT INTO')) return { rows: [], rowCount: n };
      return [];
    });
    const r = await projetarBusinessMap({ pool: d.pool, S, agora: () => AGORA, responsaveis: new Map([['1', ['9']]]) });
    expect(r.responsaveisGravados).toBe(1);
  });

  it('reconstrução limpa só a lista explícita (dim_card), nunca dim_responsavel, e não tem como chamar o BusinessMap', async () => {
    const d = montar({ stg: [stg('1')] });
    await proj(d, { reconstruir: true });
    const apagou = d.chamadas.filter((x) => /^DELETE|^TRUNCATE|^DROP/.test(x.texto)).map((x) => x.texto);
    expect(apagou).toEqual(['DELETE FROM dspd_bm.dim_card', 'DELETE FROM dspd_bm.dim_card WHERE card_id = ANY($1::text[])']);
    expect([...TABELAS_LIMPAS_NA_RECONSTRUCAO]).toEqual(['dim_card']);
    expect(d.chamadas.map((x) => x.texto).join('\n')).not.toContain('dim_responsavel');
    // estrutural: o módulo do projetor não importa cliente HTTP nem a leitura de /users
    const fonte = readFileSync(new URL('../src/modulos/businessmap/projetor.ts', import.meta.url), 'utf8');
    const importa = (t: string): string => t.split('\n').filter((l) => l.startsWith('import ')).join('\n');
    expect(importa(fonte)).not.toMatch(/http|usuarios|nodemailer/);
    expect(fonte).not.toMatch(/resolverResponsaveis|fetch\(/);
    const norm = readFileSync(new URL('../src/modulos/businessmap/normalizador.ts', import.meta.url), 'utf8');
    expect(importa(norm)).not.toMatch(/http|usuarios|plataforma/);
    expect(norm).not.toMatch(/realname|fetch\(/);
  });

  it('sem reconstruir nada é apagado além da projeção do lote', async () => {
    const d = montar({ stg: [stg('1')] });
    await proj(d);
    expect(d.chamadas.filter((x) => /^DELETE/.test(x.texto)).map((x) => x.texto)).toEqual(['DELETE FROM dspd_bm.dim_card WHERE card_id = ANY($1::text[])']);
  });

  it('nenhum card com criação utilizável: fatos e dim_card não são tocados', async () => {
    const d = montar({ stg: [stg('1', { created_at: 'x' })] });
    const r = await proj(d);
    expect(r).toMatchObject({ cards: 1, semCriacao: 1, versoes: 0 });
    expect(com(d, 'INSERT INTO dspd_bm.dim_card')).toHaveLength(0);
    expect(com(d, 'DELETE FROM dspd_bm.dim_card WHERE')).toHaveLength(0);
  });
});

describe('projetarBusinessMap: bordas do banco', () => {
  it('rowCount nulo conta zero; transição sem quadro nem workflow no registro vale o do card; sem esquema informado usa o do ambiente', async () => {
    const d = criarDublePg((q) => {
      const t = q.texto;
      if (t.includes("'projecao'")) return [{ coleta_id: '88' }];
      if (t.startsWith('SELECT DISTINCT id_origem')) return (q.valores[0] as string) < '1' ? [{ id_origem: '1' }] : [];
      if (t.includes('SELECT DISTINCT ON (id_origem) stg_sk')) return [stg('1')];
      if (t.includes('FROM dspd_bm.stg_revision')) return [{ card_id: '1', payload: { column_id: 3, start: '2026-10-07 10:00:00' } }];
      if (t.startsWith('INSERT INTO dspd_bm.evt_card')) return { rows: [], rowCount: null } as unknown as Resposta;
      return [];
    });
    const r = await projetarBusinessMap({ pool: d.pool, agora: () => AGORA });
    expect(r).toMatchObject({ cards: 1, eventos: { lidos: 1, inseridos: 0 }, transicoes: { lidas: 1 } });
    expect(com(d, 'INSERT INTO dspd_bm.fato_transicao')[0]!.valores).toContain('3');
  });
});

describe('comando bm:projetar', () => {
  it('argumentos: nenhum ou --reconstruir; o resto é recusado só com a linha de uso', () => {
    expect(analisarArgumentosProjetor([])).toEqual({ reconstruir: false });
    expect(analisarArgumentosProjetor(['--reconstruir'])).toEqual({ reconstruir: true });
    for (const ruim of [['x'], ['--reconstruir', '--reconstruir'], ['--reconstruir=1']]) {
      expect(() => analisarArgumentosProjetor(ruim)).toThrow(ErroColetaBm);
      expect(() => analisarArgumentosProjetor(ruim)).toThrow(/^uso: bm:projetar \[--reconstruir\]$/);
    }
  });

  it('roda sob a trava da fonte e recusa quando outra coleta ou projeção a segura', async () => {
    const livre = montar({ stg: [stg('1')] });
    expect((await executarProjetor({ pool: livre.pool, S, agora: () => AGORA })).cards).toBe(1);
    expect(livre.chamadas.some((x) => x.texto.includes('pg_advisory_unlock'))).toBe(true);
    const ocupada = montar({ stg: [stg('1')], trava: false });
    await expect(executarProjetor({ pool: ocupada.pool, S, agora: () => AGORA })).rejects.toMatchObject({ codigo: 'trava' });
    expect(ocupada.chamadas.some((x) => x.texto.includes('INSERT INTO dspd_bm.ctl_coleta '))).toBe(false);
  });
});

describe('instante usado nos testes', () => {
  it('a forma com espaço da transição vale UTC', () => {
    expect(instanteDoBm('2026-10-02 10:00:00')).toBe(Date.parse('2026-10-02T10:00:00Z'));
  });
});
