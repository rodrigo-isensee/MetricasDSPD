import { describe, expect, it } from 'vitest';
import { MIGRACOES } from '../src/db/migracoes.js';
import { gerarGrants } from '../src/db/grants.js';

const nomes = Object.keys(MIGRACOES);
const todoSql = nomes.flatMap((n) => MIGRACOES[n]!.ddl.up);

describe('migrações (análise estática, sem banco)', () => {
  it('nomes NNNN_descricao, sequenciais e ordenados', () => {
    nomes.forEach((n, i) => expect(n.startsWith(String(i + 1).padStart(4, '0') + '_')).toBe(true));
    expect([...nomes].sort()).toEqual(nomes);
  });
  it('toda migração tem up e down não vazios', () => {
    for (const n of nomes) {
      expect(MIGRACOES[n]!.ddl.up.length, n).toBeGreaterThan(0);
      expect(MIGRACOES[n]!.ddl.down.length, n).toBeGreaterThan(0);
    }
  });
  it('down desfaz tudo que o up cria (tabelas, views e bancos)', () => {
    for (const n of nomes) {
      const { up, down } = MIGRACOES[n]!.ddl;
      const criados = up.flatMap((s) => [...s.matchAll(/CREATE (?:TABLE|VIEW|DATABASE(?: IF NOT EXISTS)?) (?:IF NOT EXISTS )?([\w.]+)/g)].map((m) => m[1]!));
      for (const c of criados.filter((x) => x !== 'dspd_core')) expect(down.join('\n'), `${n}: ${c}`).toContain(c);
    }
  });
  it('proíbe INSERT IGNORE, ON DUPLICATE KEY, REPLACE e TRUNCATE (ADR 0004)', () => {
    expect(todoSql.join('\n')).not.toMatch(/INSERT\s+IGNORE|ON\s+DUPLICATE\s+KEY|REPLACE\s+INTO|TRUNCATE/i);
  });
  it('só tabelas stg_ têm colunas de pessoa (LGPD, data-model §9)', () => {
    const pessoa = /\b(pessoa|responsav\w*|usuario|user\w*|agente|atendente|solicitante|autor|criador|email|login|assignee)\w*\s+(VARCHAR|INT|BIGINT|JSON|TEXT)/i;
    for (const s of todoSql) {
      const t = /CREATE TABLE (\S+)/.exec(s)?.[1] ?? '';
      if (t && !/\.stg_/.test(t)) expect(s, t).not.toMatch(pessoa);
    }
  });
  it('staging versionado tem cadeia UNIQUE e anterior_sk NOT NULL', () => {
    const stg = todoSql.filter((s) => /CREATE TABLE \S+\.stg_(card|vinculo|custom_field|coluna|bloqueio|chamado|etapa) /.test(s));
    expect(stg).toHaveLength(7);
    for (const s of stg) {
      expect(s).toMatch(/anterior_sk BIGINT UNSIGNED NOT NULL/);
      expect(s).toMatch(/UNIQUE KEY uq_\w+_cadeia \(.*anterior_sk\)/);
    }
  });
  it('nenhuma FK cruza dspd_bm x dspd_ac nem aponta para projeção', () => {
    for (const s of todoSql) {
      const t = /CREATE TABLE (\S+)/.exec(s)?.[1] ?? '';
      const alvos = [...s.matchAll(/REFERENCES (\S+)/g)].map((m) => m[1]!);
      for (const a of alvos) {
        expect(a.split('.')[0], `${t} -> ${a}`).toBe(t.split('.')[0]);
        expect(a).not.toMatch(/\.(dim_card|dim_chamado|fato_bloqueio|fato_etapa_chamado) /);
      }
    }
  });
});

describe('grants por papel', () => {
  const g = gerarGrants({
    bm: ['stg_card', 'dim_card', 'ref_quadro', 'ctl_coleta', 'stg_webhook_evento'],
    ac: ['stg_chamado', 'dim_chamado', 'ctl_automacao'], core: ['ref_calendario'],
  });
  it('dspd_api nunca lê stg_', () => {
    expect(g.filter((x) => x.includes("'dspd_api'") && x.includes('.stg_'))).toEqual([]);
  });
  it('staging é só INSERT/SELECT para o coletor', () => {
    const s = g.filter((x) => x.includes('.stg_card ') && x.includes('dspd_coletor'));
    expect(s).toEqual(["GRANT SELECT, INSERT ON dspd_bm.stg_card TO 'dspd_coletor'@'%'"]);
  });
  it('webhook só insere em stg_webhook_evento; ref só fecha vigência por coluna', () => {
    expect(g.filter((x) => x.includes("'dspd_webhook'"))).toHaveLength(1);
    expect(g).toContain("GRANT UPDATE (vigente_ate) ON dspd_bm.ref_quadro TO 'dspd_ref'@'%'");
    expect(g.filter((x) => /UPDATE(?! \()/.test(x) && x.includes('dspd_ref'))).toEqual([]);
  });
});
