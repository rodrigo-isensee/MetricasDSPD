import { readFileSync } from 'node:fs';
import { gerarBaseMock } from '@metricas-dspd/mock';
import { describe, expect, it } from 'vitest';
import { checksumDe } from '../src/plataforma/db/checksums.js';
import { ATRIBUTOS_CHAMADO } from '../src/plataforma/db/ddl.js';
import { montarEsquemas, S_PADRAO } from '../src/plataforma/db/esquemas.js';
import { colunaDePessoa, COLUNAS_PESSOA, violaLgpd } from '../src/plataforma/db/lgpd.js';
import { arquivosDeMigracao, MIGRACOES } from './migracoes.js';

const nomes = Object.keys(MIGRACOES);
const ddls = nomes.map((n) => ({ n, ...MIGRACOES[n]!.ddl(S_PADRAO) }));
const todoSql = ddls.flatMap((d) => d.up);

/** Extrai (tabela, coluna, definição) de cada CREATE TABLE (e ALTER TABLE ... ADD/DROP COLUMN): separa por vírgula de nível 0 e ignora restrições. */
function todasColunas(sqls: string[]): { tabela: string; coluna: string; def: string }[] {
  const out: { tabela: string; coluna: string; def: string }[] = [];
  for (const s of sqls) {
    const queda = /^ALTER TABLE\s+(\S+)\s+DROP COLUMN(?: IF EXISTS)?\s+(\w+)$/.exec(s);
    if (queda) { const i = out.findIndex((c) => c.tabela === queda[1] && c.coluna === queda[2]); if (i >= 0) out.splice(i, 1); continue; }
    const alt = /^ALTER TABLE\s+(\S+)\s+ADD COLUMN(?: IF NOT EXISTS)?\s+(\w+)\s+(.*)$/.exec(s);
    if (alt) { out.push({ tabela: alt[1]!, coluna: alt[2]!, def: `${alt[2]} ${alt[3]}` }); continue; }
    const m = /^CREATE TABLE\s+(\S+)\s*\(/.exec(s);
    if (!m) continue;
    const corpo = s.slice(m.index + m[0].length, s.lastIndexOf(')'));
    let nivel = 0, atual = '';
    const defs: string[] = [];
    for (const ch of corpo) {
      if (ch === '(') nivel++;
      if (ch === ')') nivel--;
      if (ch === ',' && nivel === 0) { defs.push(atual); atual = ''; } else atual += ch;
    }
    defs.push(atual);
    for (const d of defs) {
      const nome = /^\s*([A-Za-z_]\w*)/.exec(d)?.[1];
      if (nome && !/^(PRIMARY|UNIQUE|CONSTRAINT|FOREIGN|CHECK)$/i.test(nome)) out.push({ tabela: m[1]!, coluna: nome, def: d.trim() });
    }
  }
  return out;
}
const colunas = todasColunas(todoSql);
const tipoDe = (t: string, c: string): string => colunas.find((x) => x.tabela === t && x.coluna === c)!.def;
/** Contagem explícita: mudou o esquema, atualize aqui conscientemente. */
const COLUNAS_FORA_STG_ESPERADAS = 396;

describe('migrações e singleTransaction', () => {
  it('nenhuma migração usa CONCURRENTLY (incompatível com o `up` em transação única)', () => {
    expect(todoSql.filter((q) => /CONCURRENTLY/i.test(q))).toEqual([]);
  });
});

describe('migrações (análise estática, sem banco)', () => {
  it('nomes NNNN_descricao, sequenciais, ordenados e iguais aos arquivos do diretório', () => {
    const numeros = nomes.map((n) => Number(n.slice(0, 4)));
    numeros.forEach((x, i) => expect(x, nomes[i]).toBe(i + 1));
    expect([...nomes].sort()).toEqual(nomes);
    expect(arquivosDeMigracao()).toEqual(nomes);
  });
  it('toda migração tem up e down não vazios e exporta up/down do node-pg-migrate', () => {
    for (const d of ddls) {
      expect(d.up.length, d.n).toBeGreaterThan(0);
      expect(d.down.length, d.n).toBeGreaterThan(0);
      expect(typeof MIGRACOES[d.n]!.up).toBe('function');
      expect(typeof MIGRACOES[d.n]!.down).toBe('function');
    }
  });
  it('down desfaz tudo que o up cria (tabelas, views, função e schemas)', () => {
    for (const { n, up, down } of ddls) {
      const criados = up.flatMap((s) => [...s.matchAll(/^CREATE (?:TABLE|VIEW|FUNCTION|SCHEMA IF NOT EXISTS) ([\w.]+)/g)].map((m) => m[1]!));
      for (const c of criados.filter((x) => x !== S_PADRAO.core)) expect(down.join('\n'), `${n}: ${c}`).toContain(c);
    }
  });
  it('proíbe INSERT, TRUNCATE, ON CONFLICT e SELECT * nas migrações (ADR 0014)', () => {
    expect(todoSql.join('\n')).not.toMatch(/INSERT\s+INTO|TRUNCATE\s+TABLE|ON\s+CONFLICT|SELECT\s+\*|\w\.\*/i);
  });
  it('só tabelas stg_ têm colunas de pessoa, e só as permitidas (LGPD, data-model §9): varre TODAS as colunas', () => {
    const fora = colunas.filter((c) => !/\.stg_/.test(c.tabela));
    expect(fora.length).toBe(COLUNAS_FORA_STG_ESPERADAS);
    expect(fora.filter((c) => violaLgpd(c.tabela, c.coluna)).map((c) => `${c.tabela}.${c.coluna}`)).toEqual([]);
    const permitidas = fora.filter((c) => colunaDePessoa(c.coluna)).map((c) => `${c.tabela}.${c.coluna}`);
    for (const p of COLUNAS_PESSOA) expect(permitidas, p).toContain(p);
    expect(colunas.filter((c) => /\.stg_/.test(c.tabela) && colunaDePessoa(c.coluna))).toEqual([]);
  });
  it('sanidade do parser: dim_chamado_versao tem organizacao e tipo e ignora restrições', () => {
    const cols = colunas.filter((c) => c.tabela === `${S_PADRAO.ac}.dim_chamado_versao`).map((c) => c.coluna);
    expect(cols).toEqual(expect.arrayContaining(['organizacao', 'tipo']));
    expect(cols.some((c) => /^(primary|unique|constraint|foreign|check)$/i.test(c))).toBe(false);
  });
  it('negativo: coluna de pessoa fora de stg_ é detectada e a regra aceita só permitidas e exceções', () => {
    const fx = ['CREATE TABLE dspd_bm.dim_x (\n id bigint NOT NULL, criado timestamptz(3) NULL, ultimo_usuario text NULL,\n PRIMARY KEY (id)\n)'];
    expect(todasColunas(fx).filter((c) => violaLgpd(c.tabela, c.coluna)).map((c) => c.coluna)).toEqual(['ultimo_usuario']);
    expect(todasColunas(['INSERT INTO x'])).toEqual([]);
    expect(colunaDePessoa('card_responsavel')).toBe(true);
    expect(violaLgpd('dspd_bm.dim_card', 'area_solicitante')).toBe(false);
    expect(violaLgpd('dspd_ac.dim_chamado', 'area_solicitante')).toBe(true);
    expect(violaLgpd('dspd_bm.dim_card', 'responsaveis')).toBe(false);
    expect(violaLgpd('dspd_bm.fato_bloqueio', 'responsaveis')).toBe(true);
  });
  it('staging versionado: cadeia UNIQUE NULLS NOT DISTINCT nomeada uq_<tabela>, anterior_sk nulo na primeira', () => {
    const stg = todoSql.filter((s) => /^CREATE TABLE \S+\.stg_(card|vinculo|custom_field|coluna|bloqueio|chamado|etapa) /.test(s));
    expect(stg).toHaveLength(7);
    for (const s of stg) {
      const t = /\.(stg_\w+) /.exec(s)![1]!;
      expect(s).toMatch(/anterior_sk bigint NULL/);
      expect(s).toMatch(new RegExp(`CONSTRAINT uq_${t} UNIQUE NULLS NOT DISTINCT \\(.*anterior_sk\\)`));
    }
  });
  it('gatilho de imutabilidade (UPDATE/DELETE e TRUNCATE) em toda tabela append-only', () => {
    const appendOnly = colunas.map((c) => c.tabela.split('.')[1]!).filter((t, i, a) => a.indexOf(t) === i)
      .filter((t) => /^(stg_|evt_|rec_)|_versao$|^fato_transicao$/.test(t));
    expect(appendOnly.length).toBeGreaterThanOrEqual(17);
    for (const t of appendOnly) {
      expect(todoSql.some((s) => s.startsWith(`CREATE TRIGGER tg_${t}_imutavel BEFORE UPDATE OR DELETE ON`)), t).toBe(true);
      expect(todoSql.some((s) => s.startsWith(`CREATE TRIGGER tg_${t}_sem_truncate BEFORE TRUNCATE ON`)), t).toBe(true);
    }
    for (const t of ['dim_card', 'dim_chamado', 'ctl_coleta', 'outbox']) expect(todoSql.join('\n')).not.toContain(`tg_${t}_imutavel`);
  });
  it('toda view é security_invoker e lista colunas (C-views, data-model §2)', () => {
    const views = todoSql.filter((s) => s.startsWith('CREATE VIEW'));
    expect(views).toHaveLength(7);
    for (const v of views) expect(v).toMatch(/^CREATE VIEW \S+ WITH \(security_invoker = true\) AS/);
  });
  it('C1: origem_demanda e demais códigos de ref_dominio têm o tipo de ref_dominio.codigo (varchar(80))', () => {
    expect(tipoDe(`${S_PADRAO.bm}.ref_dominio`, 'codigo')).toMatch(/codigo varchar\(80\)/);
    expect(tipoDe(`${S_PADRAO.ac}.ref_dominio`, 'codigo')).toMatch(/codigo varchar\(80\)/);
    for (const t of ['dim_card', 'dim_card_versao'])
      for (const c of ['tipo', 'classe_servico', 'sistema', 'area_solicitante', 'fornecedor', 'objetivo_estrategico', 'motivo_descarte',
        'tamanho_declarado', 'responsabilidade_atraso', 'origem_demanda', 'fase_deteccao', 'severidade', 'causa_raiz'])
        expect(tipoDe(`${S_PADRAO.bm}.${t}`, c), `${t}.${c}`).toMatch(/varchar\(80\)/);
    for (const [t, c] of [['fato_bloqueio', 'motivo'], ['fato_bloqueio', 'fornecedor'], ['evt_bloqueio', 'motivo_codigo'], ['evt_bloqueio', 'fornecedor_codigo']] as const)
      expect(tipoDe(`${S_PADRAO.bm}.${t}`, c), `${t}.${c}`).toMatch(/varchar\(80\)/);
  });
  it('C2: status_sla_r é varchar(32) com CHECK dos dois valores do briefing 3.2', () => {
    for (const t of ['dim_chamado', 'dim_chamado_versao'])
      expect(tipoDe(`${S_PADRAO.ac}.${t}`, 'status_sla_r')).toMatch(
        /status_sla_r varchar\(32\) NULL CHECK \(status_sla_r IN \('REALIZADO_NO_PRAZO','REALIZADO_APOS_VENCIMENTO'\)\)/);
  });
  it('C3: vw_fechados_sla usa REALIZADO_NO_PRAZO/REALIZADO_APOS_VENCIMENTO, nulo fica nulo e a exceção é coluna explícita', () => {
    const v = todoSql.find((s) => s.startsWith(`CREATE VIEW ${S_PADRAO.ac}.vw_fechados_sla`))!;
    expect(v).toContain("WHEN 'REALIZADO_NO_PRAZO' THEN true WHEN 'REALIZADO_APOS_VENCIMENTO' THEN false END AS dentro_sla");
    expect(v).not.toContain("'dentro'");
    expect(v).toContain('p.excecao_sla_registro_posterior');
    expect(v).not.toMatch(/WHERE[^]*excecao_sla_registro_posterior/);
  });
  it('C5: dim_chamado tem os campos de Chamado da biblioteca (paridade de colunas), sem justificativa_ajuste', () => {
    const chamado = Object.keys(gerarBaseMock({ escala: 0.05 }).ac.chamados[0]!)
      .filter((k) => k !== 'justificativa_ajuste').map((k) => (k === 'tipo_fila' ? 'tipo' : k));
    chamado.push('etapa'); // etapa atual: extensão do data-model §4, fora da interface Chamado
    chamado.push('justificativa_informada'); // 0014 (FA-003): só o indicador, fora de ATRIBUTOS_CHAMADO (0008/0009 imutáveis)
    chamado.sort();
    const cols = colunas.filter((c) => c.tabela === `${S_PADRAO.ac}.dim_chamado`).map((c) => c.coluna);
    expect(cols.filter((c) => !['chamado_id', 'coletado_em', 'atualizado_por_coleta_id', 'sistema_origem'].includes(c)).sort()).toEqual(
      chamado.filter((c) => c !== 'chamado_id'));
    expect(ATRIBUTOS_CHAMADO.map(([n]) => n).sort()).toEqual(chamado.filter((c) => c !== 'chamado_id' && c !== 'justificativa_informada'));
    expect(cols).not.toContain('justificativa_ajuste');
    expect(colunas.filter((c) => c.tabela === `${S_PADRAO.ac}.stg_chamado`).map((c) => c.coluna)).toContain('ausente_na_extracao');
  });
  it('ref_ com vigência têm índice parcial único da vigente (BM, AC e core)', () => {
    for (const t of ['ref_quadro', 'ref_coluna', 'ref_dominio', 'ref_sle', 'ref_alocacao_acordada', 'ref_limite_frentes', 'ref_ficha_resultado'])
      expect(todoSql.some((s) => s.startsWith(`CREATE UNIQUE INDEX uq_${t}_vigente ON ${S_PADRAO.bm}.${t} `) && s.endsWith('WHERE vigente_ate IS NULL')), t).toBe(true);
    for (const t of ['ref_calendario_turno', 'ref_calendario_aplicacao'])
      expect(todoSql.some((s) => s.startsWith(`CREATE UNIQUE INDEX uq_${t}_vigente ON ${S_PADRAO.core}.${t} `)), t).toBe(true);
  });
  it('tipos: instante timestamptz(3), hash bytea de 32 bytes, identidade GENERATED ALWAYS, sem enum nem json', () => {
    const j = todoSql.join('\n');
    expect(j).not.toMatch(/\b(timestamp(?!tz)|datetime|enum|json(?!b)|serial)\b/i);
    expect(j).toContain('payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32)');
    expect(j).toContain('bigint GENERATED ALWAYS AS IDENTITY');
    expect(j).toContain('responsaveis text[] NOT NULL DEFAULT');
  });
  it('nenhuma FK cruza dspd_bm x dspd_ac nem aponta para projeção', () => {
    for (const s of todoSql) {
      const t = /^CREATE TABLE (\S+)/.exec(s)?.[1] ?? '';
      for (const a of [...s.matchAll(/REFERENCES (\S+)/g)].map((m) => m[1]!)) {
        expect(a.split('.')[0], `${t} -> ${a}`).toBe(t.split('.')[0]);
        expect(a).not.toMatch(/\.(dim_card|dim_chamado|fato_bloqueio|fato_etapa_chamado)$/);
      }
    }
  });
  it('sistema_origem: BM só em dspd_bm, AC só em dspd_ac', () => {
    for (const s of todoSql.filter((x) => x.startsWith('CREATE TABLE') && x.includes('sistema_origem'))) {
      const schema = /^CREATE TABLE (\S+?)\./.exec(s)![1];
      expect(s).toContain(schema === S_PADRAO.bm ? "DEFAULT 'businessmap'" : "DEFAULT 'acelerato'");
    }
  });
  it('outbox: fonte fechada, status com falha, índices parciais e sem gatilho de imutabilidade', () => {
    const o = todoSql.find((s) => s.startsWith(`CREATE TABLE ${S_PADRAO.core}.outbox`))!;
    expect(o).toContain("fonte text NOT NULL CHECK (fonte IN ('businessmap','acelerato'))");
    expect(o).toContain("status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','processando','processado','falha'))");
    expect(o).toContain('evento_id uuid NOT NULL DEFAULT gen_random_uuid()');
    expect(todoSql.some((s) => s.startsWith('CREATE INDEX ix_outbox_fila') && s.includes("WHERE status IN ('pendente','processando')"))).toBe(true);
  });
});

describe('prefixo de schemas (testes por schema)', () => {
  const P = montarEsquemas('tabc123_');
  it('com prefixo vazio o SQL é o revisado; com prefixo, só os nomes de schema mudam', () => {
    for (const n of nomes) {
      const base = JSON.stringify(MIGRACOES[n]!.ddl(S_PADRAO));
      const pref = JSON.stringify(MIGRACOES[n]!.ddl(P));
      expect(pref.replaceAll('tabc123_', '')).toBe(base);
      expect(base).not.toContain('tabc123_');
      expect(pref).not.toMatch(/(?<!tabc123_)dspd_(bm|ac|core)/);
    }
  });
  it('prefixo inválido é recusado (identificador nunca vem de entrada sem validação)', () => {
    expect(() => montarEsquemas('x; DROP')).toThrow('DSPD_SCHEMA_PREFIXO inválido');
    expect(() => montarEsquemas('1abc')).toThrow();
  });
});

describe('checksums das migrações', () => {
  it('migração registrada não muda: SHA-256 de ddl(S_PADRAO) bate com checksums.json', () => {
    const gravado = JSON.parse(readFileSync(new URL('../migrations/checksums.json', import.meta.url), 'utf8')) as Record<string, string>;
    expect(Object.keys(gravado)).toEqual(nomes);
    for (const n of nomes) expect(checksumDe(MIGRACOES[n]!.ddl), n).toBe(gravado[n]);
  });
});
