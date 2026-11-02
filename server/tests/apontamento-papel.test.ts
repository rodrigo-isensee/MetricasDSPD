import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { montarEsquemas, S_PADRAO } from '../src/plataforma/db/esquemas.js';
import { COLUNAS_API_APONTAMENTO, gerarGrants, PAPEIS, type Catalogo } from '../src/plataforma/db/grants.js';
import { COLUNAS_PESSOA } from '../src/plataforma/db/lgpd.js';
import { MIGRACOES } from './migracoes.js';

// Pedido 059, B4 (ADR 0020 revisão 4, R4-5; CA-AP-1): o papel `dspd_api_apontamento` lê só as colunas da aba. Catálogo lido das migrações, sem banco
// (o privilégio de verdade é provado em `apontamento-rota.pg.test.ts`).
const ddlDe = (S: typeof S_PADRAO): string[] => Object.values(MIGRACOES).flatMap((m) => m.ddl(S).up);

function corpoDe(s: string): string[] {
  const corpo = s.slice(s.indexOf('(') + 1, s.lastIndexOf(')'));
  let nivel = 0, atual = '';
  const partes: string[] = [];
  for (const ch of corpo) {
    if (ch === '(') nivel += 1;
    if (ch === ')') nivel -= 1;
    if (ch === ',' && nivel === 0) { partes.push(atual); atual = ''; } else atual += ch;
  }
  partes.push(atual);
  return partes.map((p) => p.trim()).filter((p) => !/^(PRIMARY|UNIQUE|CONSTRAINT|FOREIGN|CHECK)\b/i.test(p));
}
const catalogo = (S = S_PADRAO): Catalogo => {
  const cat: Catalogo = { bm: {}, ac: {}, core: {} };
  const chave = new Map<string, keyof Catalogo>([[S.bm, 'bm'], [S.ac, 'ac'], [S.core, 'core']]);
  for (const s of ddlDe(S)) {
    const c = /^CREATE TABLE (\w+)\.(\w+) /.exec(s);
    if (c !== null) cat[chave.get(c[1]!)!][c[2]!] = corpoDe(s).map((p) => /^(\w+)/.exec(p)![1]!);
    // a view do time (E2.21) lista as duas colunas que entrega; o catalogo real e provado em `apontamento-rota.pg.test.ts`
    const v = /^CREATE VIEW (\w+)\.apt_pessoa_time /.exec(s);
    if (v !== null) cat[chave.get(v[1]!)!].apt_pessoa_time = ['pessoa_ref', 'vigencia_ate'];
    const a = /^ALTER TABLE (\w+)\.(\w+) ADD COLUMN (\w+)/.exec(s);
    if (a !== null) cat[chave.get(a[1]!)!][a[2]!]?.push(a[3]!);
  }
  return cat;
};

const grants = gerarGrants(S_PADRAO, catalogo());
const doPapel = grants.filter((g) => g.endsWith(' TO dspd_api_apontamento'));

describe('papel dspd_api_apontamento (R4-5)', () => {
  it('está em PAPEIS (REVOKE geral, verificação de papéis na migração) e tem o init, o reparo e a senha nos pontos de configuração', () => {
    expect(PAPEIS).toContain('dspd_api_apontamento');
    const raiz = (c: string): string => readFileSync(fileURLToPath(new URL(`../../${c}`, import.meta.url)), 'utf8');
    expect(raiz('docker/postgres/init/01-databases-papeis.sh')).toMatch(/CREATE ROLE dspd_api_apontamento LOGIN PASSWORD :'pwd_apontamento'/);
    expect(raiz('docker/postgres/init/01-databases-papeis.sh')).toMatch(/GRANT CONNECT ON DATABASE \$banco TO [^;]*dspd_api_apontamento/);
    expect(raiz('docker/postgres/reparar-papeis.sh')).toContain('${DSPD_PWD_APONTAMENTO:?');
    expect(grants.filter((g) => g.startsWith('REVOKE ALL ON SCHEMA') && g.includes('dspd_api_apontamento'))).toHaveLength(3);
  });
  it('só tem USAGE no BusinessMap e na referência (core), nunca no Acelerato', () => {
    const usage = doPapel.filter((g) => g.startsWith('GRANT USAGE'));
    expect(usage).toEqual([`GRANT USAGE ON SCHEMA ${S_PADRAO.bm}, ${S_PADRAO.core} TO dspd_api_apontamento`]);
  });
  it('só SELECT por coluna, em lista fechada de tabelas: nada de stg_, evt_, cfg_, outra ctl_ nem Acelerato; nunca INSERT, UPDATE ou DELETE', () => {
    const selects = doPapel.filter((g) => !g.startsWith('GRANT USAGE'));
    for (const g of selects) expect(g, g).toMatch(/^GRANT SELECT \([a-z_, ]+\) ON \w+\.\w+ TO dspd_api_apontamento$/);
    expect(selects.map((g) => /ON \w+\.(\w+) TO/.exec(g)![1]).sort()).toEqual([
      'apt_pessoa_time', 'ctl_coleta', 'dim_card', 'dim_card_raiz', 'dim_responsavel', 'fato_apontamento', 'ref_apontamento_regra_tipo', 'ref_apontamento_subgrupo',
      'ref_apontamento_termo', 'ref_calendario', 'ref_calendario_aplicacao', 'ref_feriado', 'ref_versao_criterio',
      'ref_versao_criterio_metrica',
    ]);
    expect(doPapel.join('\n')).not.toMatch(/INSERT|UPDATE|DELETE|TRUNCATE|stg_|evt_|cfg_|dspd_ac\./);
  });
  it('de dim_responsavel só `pessoa_ref` e o nome; nunca `responsavel_id`, `logged_time_id`, hash, comentário ou categoria', () => {
    expect(doPapel).toContain(`GRANT SELECT (pessoa_ref, responsavel_nome) ON ${S_PADRAO.bm}.dim_responsavel TO dspd_api_apontamento`);
    const colunas = doPapel.filter((g) => g.startsWith('GRANT SELECT')).flatMap((g) => /\(([^)]+)\)/.exec(g)![1]!.split(', '));
    for (const proibida of ['responsavel_id', 'logged_time_id', 'registro_sha256', 'user_id', 'comment', 'comentario', 'category_id', 'qtd_palavras', 'versao_dicionario', 'hash_usuario'])
      expect(colunas, proibida).not.toContain(proibida);
    // as únicas colunas de pessoa que o papel lê são as duas da aba (COLUNAS_PESSOA com pessoa_ref e o nome)
    const pessoa = doPapel.filter((g) => g.startsWith('GRANT SELECT')).flatMap((g) => {
      const tabela = /ON \w+\.(\w+) TO/.exec(g)![1]!;
      return /\(([^)]+)\)/.exec(g)![1]!.split(', ').map((c) => `${tabela}.${c}`).filter((id) => COLUNAS_PESSOA.some((p) => p.endsWith(`.${id}`)));
    });
    expect(pessoa.sort()).toEqual(['apt_pessoa_time.pessoa_ref', 'dim_responsavel.pessoa_ref', 'dim_responsavel.responsavel_nome', 'fato_apontamento.pessoa_ref']);
  });
  it('toda coluna concedida existe no catálogo das migrações (nome errado não pode ser descartado em silêncio)', () => {
    const cat = catalogo();
    for (const [chave, colunas] of Object.entries(COLUNAS_API_APONTAMENTO)) {
      const [esquema, tabela] = chave.split('.') as ['bm' | 'core', string];
      expect(cat[esquema][tabela], chave).toBeDefined();
      for (const c of colunas) expect(cat[esquema][tabela], `${chave}.${c}`).toContain(c);
    }
  });
  it('tabela ou coluna ausente do catálogo é pulada (catálogo antigo), e o prefixo de teste vai ao nome do schema', () => {
    expect(gerarGrants(S_PADRAO, { bm: {}, ac: {}, core: {} }).filter((g) => /SELECT \(/.test(g) && g.endsWith('dspd_api_apontamento'))).toEqual([]);
    const T = montarEsquemas('t_');
    expect(gerarGrants(T, catalogo(T)).filter((g) => g.endsWith('dspd_api_apontamento') && g.includes('ON t_dspd_bm.fato_apontamento'))).toHaveLength(1);
  });
  it('tabela presente sem nenhuma das colunas listadas não gera GRANT vazio', () => {
    const cat = catalogo();
    const g = gerarGrants(S_PADRAO, { ...cat, bm: { ...cat.bm, dim_card_raiz: ['coluna_nova'] } });
    expect(g.filter((x) => x.endsWith('dspd_api_apontamento') && x.includes('dim_card_raiz'))).toEqual([]);
  });
  it('o dspd_api continua sem nenhuma tabela da aba nem coluna de pessoa (K-085 inalterado)', () => {
    const api = grants.filter((g) => g.endsWith(' TO dspd_api'));
    expect(api.join('\n')).not.toMatch(/fato_apontamento|dim_card_raiz|dim_responsavel|ref_apontamento|cfg_pessoa|stg_apontamento|evt_apontamento|pessoa_ref|responsavel_nome/);
  });
});
