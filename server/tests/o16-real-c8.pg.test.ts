import { gerarBaseMock } from '@metricas-dspd/mock';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { semear } from '../src/plataforma/db/seed.js';
import { poolDe, url } from './pg/ctx.js';

// Pedido 099, lote C8 (E3.237): portão do O16 Estoque e idade de bugs com dado real. A base "real" daqui é o seed mínimo em schemas próprios
// lido pelo papel `dspd_api` (grants por coluna); nenhuma coleta nem projeção real. Os bugs entram no formato que a coleta grava: `tipo` da
// `ref_tipo_card` (Bug interno) e `severidade` do de-para da criticidade (C8a), nula enquanto o `bm:ref-sync` com reprojeção não rodou.
// Nenhuma severidade é presumida: o bug sem severidade aparece como "Sem severidade" e nunca some do estoque.
const d = describe.skipIf(!url);
const AGORA = new Date('2026-10-10T15:00:00Z');
const SEM = 'Sem severidade';
type O16 = {
  base: { n: number };
  meses: { mes: string; entrada: number; correcao: number; estoqueFim: number; densidade: number | null }[];
  abertosPorSeveridade: { severidade: string; n: number }[];
  maisAntigos: { cardId: string; tipo: string; severidade: string; idadeDiasUteis: number }[];
};

d('O16 Estoque e idade de bugs com dado real (099, lote C8): PostgreSQL, papel dspd_api', () => {
  const base = gerarBaseMock({ escala: 0.15 });
  const p = prefixoDeTeste();
  const R = montarEsquemas(p);
  let mig: pg.Pool;
  let api: pg.Pool;
  const app = () => buildApp({ db: api, S: R, agora: () => AGORA, nivelLog: 'silent' });
  const o16 = async (consulta: string): Promise<{ status: number; corpo: O16; texto: string }> => {
    const r = await (await app()).inject(`/api/v1/metricas/O16?${consulta}`);
    return { status: r.statusCode, corpo: r.json() as O16, texto: r.body };
  };
  const n = (c: O16, sev: string) => c.abertosPorSeveridade.find((x) => x.severidade === sev)?.n ?? 0;
  let cardsDeBug: string[] = [];

  beforeAll(async () => {
    mig = poolDe();
    await migrar(url!, { prefixo: p });
    await semear(mig, base, R);
    api = poolDe('dspd_api');
    // Cards abertos viram bugs no formato real: 3 com severidade do de-para (Crítica, Alta, Baixa) e o resto sem severidade (campo nulo).
    cardsDeBug = (await mig.query<{ card_id: string }>(
      `SELECT card_id FROM ${R.bm}.dim_card
        WHERE granularidade = 'story' AND concluido_em IS NULL AND arquivado_em IS NULL AND excluido_em IS NULL
          AND eh_subtarefa IS NOT TRUE AND tipo IN ('Melhoria', 'Requisição') AND criado_em < '2026-09-01'
        ORDER BY card_id LIMIT 8`)).rows.map((x) => x.card_id);
    await mig.query(`UPDATE ${R.bm}.dim_card SET tipo = 'Bug interno', severidade = NULL WHERE card_id = ANY($1::text[])`, [cardsDeBug]);
    const comSev: [string, string][] = [['Crítica', cardsDeBug[0]!], ['Alta', cardsDeBug[1]!], ['Baixa', cardsDeBug[2]!]];
    for (const [sev, id] of comSev) await mig.query(`UPDATE ${R.bm}.dim_card SET severidade = $1 WHERE card_id = $2`, [sev, id]);
  }, 180_000);
  afterAll(async () => {
    for (const s of [R.bm, R.ac, R.core]) await mig.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    await api.end();
    await mig.end();
  });

  it('(a) com bugs gravados no formato real, o O16 responde 200 com número e a severidade nula aparece como "Sem severidade", sem sumir do estoque', async () => {
    expect(cardsDeBug.length).toBeGreaterThanOrEqual(5);
    const r = await o16('periodo=12m');
    expect(r.status).toBe(200);
    expect(r.corpo).not.toHaveProperty('estado'); // não é o corpo "sem dado real"
    expect(r.corpo.base.n).toBeGreaterThanOrEqual(cardsDeBug.length);
    expect(n(r.corpo, 'Crítica')).toBeGreaterThanOrEqual(1);
    expect(n(r.corpo, 'Alta')).toBeGreaterThanOrEqual(1);
    expect(n(r.corpo, 'Baixa')).toBeGreaterThanOrEqual(1);
    expect(n(r.corpo, SEM)).toBeGreaterThanOrEqual(cardsDeBug.length - 3);
    // Nada some: a soma por severidade (com "Sem severidade") é o estoque aberto inteiro.
    expect(r.corpo.abertosPorSeveridade.map((x) => x.severidade)).toContain(SEM);
    expect(r.corpo.abertosPorSeveridade.reduce((s, x) => s + x.n, 0)).toBe(r.corpo.base.n);
    // Nenhuma severidade presumida: os 3 bugs com severidade gravada e os nulos mantêm o que a base tem.
    const doTeste = new Set(cardsDeBug);
    const sevDoTeste = r.corpo.maisAntigos.filter((m) => doTeste.has(m.cardId));
    // O laço não pode passar vazio: os bugs do teste são os mais antigos do estoque (criados antes de 2026-09-01, de-para da semente).
    expect(sevDoTeste.length).toBeGreaterThan(0);
    for (const m of sevDoTeste) expect(['Crítica', 'Alta', 'Baixa', SEM]).toContain(m.severidade);
    // Nenhuma severidade presumida: o bug do teste sem severidade gravada sai como "Sem severidade" e o com severidade mantém a sua.
    const gravadas = new Map<string, string>([[cardsDeBug[0]!, 'Crítica'], [cardsDeBug[1]!, 'Alta'], [cardsDeBug[2]!, 'Baixa']]);
    for (const m of sevDoTeste) expect(m.severidade).toBe(gravadas.get(m.cardId) ?? SEM);
    expect(r.corpo.maisAntigos.length).toBeLessThanOrEqual(10);
    expect(r.corpo.meses.length).toBeGreaterThan(0);
  }, 60_000);

  it('(a2) o bug sem severidade segue contado depois que a severidade chega pela reprojeção: sai de "Sem severidade" sem sair do estoque', async () => {
    expect(cardsDeBug.length).toBeGreaterThanOrEqual(5); // dependência do seed, como no caso (a)
    const antes = await o16('periodo=12m');
    const semAntes = n(antes.corpo, SEM);
    const alvo = cardsDeBug[cardsDeBug.length - 1]!;
    await mig.query(`UPDATE ${R.bm}.dim_card SET severidade = 'Média' WHERE card_id = $1`, [alvo]);
    const depois = await o16('periodo=12m');
    expect(n(depois.corpo, SEM)).toBe(semAntes - 1);
    expect(n(depois.corpo, 'Média')).toBe(n(antes.corpo, 'Média') + 1);
    expect(depois.corpo.base.n).toBe(antes.corpo.base.n);
  }, 60_000);

  it('(b) abaixo de 20 entregas a densidade é nula (insuficiente), nunca um número', async () => {
    expect(cardsDeBug.length).toBeGreaterThanOrEqual(5); // dependência do seed, como no caso (a)
    const r = await o16('periodo=custom&de=2026-09-20&ate=2026-09-20');
    expect(r.status).toBe(200);
    // Sem entregas na janela a lista de meses pode ser vazia (esperado); o laço só prova a densidade nula onde houver mês.
    for (const m of r.corpo.meses) expect(m.densidade).toBeNull();
  }, 60_000);

  it('(c) nenhum campo de pessoa na resposta, só o id do card na lista dos mais antigos', async () => {
    expect(cardsDeBug.length).toBeGreaterThanOrEqual(5); // dependência do seed, como no caso (a)
    for (const q of ['periodo=12m', 'periodo=custom&de=2026-09-20&ate=2026-09-20']) {
      const r = await o16(q);
      expect(r.status, q).toBe(200);
      expect(r.texto, q).not.toMatch(/responsave|usuario|assignee|email|realname|owner/i);
      expect(r.texto, q).not.toMatch(/Pessoa \d+/);
      for (const m of r.corpo.maisAntigos) expect(Object.keys(m).sort()).toEqual(['cardId', 'idadeDiasUteis', 'severidade', 'tipo']);
    }
  }, 60_000);
});
