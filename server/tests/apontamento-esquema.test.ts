import { describe, expect, it } from 'vitest';
import { COLUNAS_PESSOA, colunaDePessoa } from '../src/plataforma/db/lgpd.js';
import { gerarGrants, TABELAS_FORA_DA_API } from '../src/plataforma/db/grants.js';
import { montarEsquemas, S_PADRAO } from '../src/plataforma/db/esquemas.js';
import { MIGRACOES } from './migracoes.js';

// Pedido 059, A1 (CA-AP-1, CA-AP-13): o esquema do apontamento, lido das migrações sem banco. Coluna nova derruba o teste até ser
// justificada (lista fechada); nada de texto livre, de pessoa na staging nem de payload.
const todoSql = Object.values(MIGRACOES).flatMap((m) => m.ddl(S_PADRAO).up);
const tabela = (nome: string): string => todoSql.find((s) => s.startsWith(`CREATE TABLE ${S_PADRAO.bm}.${nome} `))!;

function colunasDe(sql: string): { nome: string; def: string }[] {
  const corpo = sql.slice(sql.indexOf('(') + 1, sql.lastIndexOf(')'));
  let nivel = 0;
  let atual = '';
  const partes: string[] = [];
  for (const ch of corpo) {
    if (ch === '(') nivel += 1;
    if (ch === ')') nivel -= 1;
    if (ch === ',' && nivel === 0) { partes.push(atual); atual = ''; } else atual += ch;
  }
  partes.push(atual);
  return partes.map((p) => p.trim()).filter((p) => !/^(PRIMARY|UNIQUE|CONSTRAINT|FOREIGN|CHECK)\b/i.test(p))
    .map((p) => ({ nome: /^(\w+)/.exec(p)![1]!, def: p }));
}
const nomes = (t: string): string[] => colunasDe(tabela(t)).map((c) => c.nome);
/** Lista fechada escrita à mão (independente do código): coluna nova derruba o teste até ser justificada. */
const REGISTRO = [
  'logged_time_id', 'card_id', 'parent_card_id', 'subtask_id', 'lane_id', 'column_id', 'category_id', 'data_apontamento', 'segundos', 'registrado_em',
  'subgrupo_codigo', 'flags_qualidade', 'qtd_palavras', 'versao_dicionario', 'registro_sha256',
];

describe('esquema do apontamento: lista fechada de colunas (CA-AP-13)', () => {
  it('stg_apontamento: só a allow-list, a classificação, o hash e o controle; sem pessoa, comentário, payload nem JSON', () => {
    expect(nomes('stg_apontamento').sort()).toEqual(['stg_sk', ...REGISTRO, 'coletado_em', 'coleta_id', 'sistema_origem'].sort());
    expect(nomes('stg_apontamento').filter((c) => colunaDePessoa(c))).toEqual([]);
    for (const c of ['comment', 'comentario', 'payload', 'user_id', 'reporter', 'email', 'titulo', 'descricao']) expect(nomes('stg_apontamento')).not.toContain(c);
    expect(tabela('stg_apontamento')).not.toMatch(/jsonb|varchar\(\d{3,}\)|\btext\[\]/);
  });
  it('stg_apontamento: ids só em dígitos, horas de 1 a 86 400, hash de 32 bytes, UNIQUE (logged_time_id, registro_sha256) e gatilho de imutabilidade', () => {
    const t = tabela('stg_apontamento');
    for (const c of ['logged_time_id', 'card_id']) expect(t).toContain(`${c} text NOT NULL CHECK (${c} ~ '^[0-9]{1,12}$')`);
    for (const c of ['parent_card_id', 'subtask_id', 'lane_id', 'column_id', 'category_id']) expect(t).toContain(`${c} text NULL CHECK (${c} ~ '^[0-9]{1,12}$')`);
    expect(t).toContain('segundos integer NOT NULL CHECK (segundos BETWEEN 1 AND 86400)');
    expect(t).toContain('qtd_palavras smallint NOT NULL CHECK (qtd_palavras >= 0)');
    expect(t).toContain('flags_qualidade smallint NOT NULL CHECK (flags_qualidade BETWEEN 0 AND 31)');
    expect(t).toContain('registro_sha256 bytea NOT NULL CHECK (octet_length(registro_sha256) = 32)');
    expect(t).toContain('CONSTRAINT uq_stg_apontamento UNIQUE (logged_time_id, registro_sha256)');
    expect(todoSql.some((s) => s.startsWith('CREATE TRIGGER tg_stg_apontamento_imutavel BEFORE UPDATE OR DELETE ON'))).toBe(true);
    expect(todoSql.some((s) => s.startsWith('CREATE TRIGGER tg_stg_apontamento_sem_truncate BEFORE TRUNCATE ON'))).toBe(true);
  });
  it('evt_apontamento: só as colunas da lista fechada (sem payload, autor, user_id, valores nem comentário), tipo só da varredura e chave natural', () => {
    expect(nomes('evt_apontamento').sort()).toEqual(['evento_sk', 'logged_time_id', 'card_id', 'tipo', 'origem', 'chave_ocorrencia', 'ocorrido_em', 'detectado_em', 'coleta_id', 'sistema_origem'].sort());
    const t = tabela('evt_apontamento');
    expect(t).toContain("tipo text NOT NULL CHECK (tipo IN ('excluido_detectado','reaparecido'))");
    expect(t).not.toMatch(/excluido_origem|transferido/);
    expect(t).toContain('CONSTRAINT uq_evt_apontamento UNIQUE (logged_time_id, tipo, chave_ocorrencia)');
    expect(todoSql.some((s) => s.startsWith('CREATE TRIGGER tg_evt_apontamento_imutavel BEFORE UPDATE OR DELETE ON'))).toBe(true);
  });
  it('cfg_pessoa_eliminada: só o HMAC e a data (nunca o user_id), sem rastro de origem', () => {
    expect(nomes('cfg_pessoa_eliminada')).toEqual(['hash_usuario', 'eliminada_em']);
    expect(tabela('cfg_pessoa_eliminada')).toContain('hash_usuario bytea NOT NULL PRIMARY KEY CHECK (octet_length(hash_usuario) = 32)');
    expect(COLUNAS_PESSOA).toContain('dspd_bm.cfg_pessoa_eliminada.hash_usuario');
  });
  it('fato_apontamento: pessoa só como pessoa_ref (pseudônimo, em COLUNAS_PESSOA), sem comentário nem texto livre, fora do gatilho', () => {
    expect(nomes('fato_apontamento').sort()).toEqual([...REGISTRO, 'iniciativa_card_id', 'pessoa_ref', 'versoes', 'excluido_em', 'atualizado_em', 'atualizado_por_coleta_id', 'sistema_origem'].sort());
    expect(nomes('fato_apontamento').filter((c) => colunaDePessoa(c))).toEqual(['pessoa_ref']);
    expect(COLUNAS_PESSOA).toEqual(expect.arrayContaining(['dspd_bm.fato_apontamento.pessoa_ref', 'dspd_bm.dim_responsavel.pessoa_ref']));
    expect(tabela('fato_apontamento')).not.toMatch(/jsonb|payload|comment|user_id/);
    expect(todoSql.some((s) => s.includes('tg_fato_apontamento'))).toBe(false);
  });
  it('type_id do fato (0029): só dígitos, anulável, coluna nova por migração própria (nunca editando a 0028)', () => {
    expect(todoSql).toContain(`ALTER TABLE ${S_PADRAO.bm}.fato_apontamento ADD COLUMN type_id text NULL CHECK (type_id ~ '^[0-9]{1,12}$')`);
    expect(tabela('fato_apontamento')).not.toContain('type_id');
    expect(colunaDePessoa('type_id')).toBe(false);
  });
  it('índices parciais com excluido_em nulo (A5), índice da raiz (A8) e CHECK de profundidade e raiz própria', () => {
    for (const i of ['ix_fato_apontamento_data', 'ix_fato_apontamento_pessoa', 'ix_fato_apontamento_iniciativa']) {
      expect(todoSql.some((s) => s.startsWith(`CREATE INDEX ${i} ON ${S_PADRAO.bm}.fato_apontamento `) && s.endsWith('WHERE excluido_em IS NULL')), i).toBe(true);
    }
    expect(todoSql.some((s) => s.startsWith(`CREATE INDEX ix_dim_card_raiz_raiz ON ${S_PADRAO.bm}.dim_card_raiz (raiz_card_id)`))).toBe(true);
    expect(tabela('dim_card_raiz')).toContain('profundidade smallint NOT NULL CHECK (profundidade BETWEEN 0 AND 10)');
    expect(tabela('dim_card_raiz')).toContain('CHECK ((profundidade = 0) = (raiz_card_id = card_id))');
  });
  it('pessoa_ref é identidade GENERATED ALWAYS e única; ctl_coleta aceita a tarefa apontamento', () => {
    expect(todoSql).toContain(`ALTER TABLE ${S_PADRAO.bm}.dim_responsavel ADD COLUMN pessoa_ref bigint GENERATED ALWAYS AS IDENTITY UNIQUE`);
    expect(todoSql.some((s) => /ctl_coleta_tarefa_check CHECK \(tarefa IN \(.*'apontamento'\)\)$/.test(s))).toBe(true);
  });
  it('ref_apontamento_*: UNIQUE (termo, subgrupo) e prioridade única (A9), termo de uma palavra normalizada, versão que incluiu', () => {
    expect(tabela('ref_apontamento_subgrupo')).toContain('CONSTRAINT uq_ref_apontamento_subgrupo_prioridade UNIQUE (prioridade)');
    expect(tabela('ref_apontamento_termo')).toContain('PRIMARY KEY (termo_normalizado, subgrupo_codigo)');
    expect(tabela('ref_apontamento_termo')).toContain("CHECK (termo_normalizado ~ '^[a-z0-9]{2,40}$')");
    for (const t of ['ref_apontamento_subgrupo', 'ref_apontamento_termo', 'ref_apontamento_regra_tipo']) expect(nomes(t)).toContain('incluido_por_versao_id');
  });
});

describe('vigência do dicionário (0030, E2.27)', () => {
  const sql030 = MIGRACOES['0030_bm_ref_apontamento_vigencia']!.ddl(S_PADRAO);
  const up = sql030.up.join('\n');
  const tabelas = ['ref_apontamento_subgrupo', 'ref_apontamento_termo', 'ref_apontamento_regra_tipo'];
  it('cada ref_apontamento_* ganha vigente_de (obrigatória, preenchida pela versão que incluiu) e vigente_ate, com a ordem das datas garantida', () => {
    for (const t of tabelas) {
      expect(up, t).toContain(`ALTER TABLE ${S_PADRAO.bm}.${t} ADD COLUMN vigente_de date NULL, ADD COLUMN vigente_ate date NULL`);
      expect(up, t).toContain(`ALTER TABLE ${S_PADRAO.bm}.${t} ALTER COLUMN vigente_de SET NOT NULL`);
      expect(up, t).toContain(`CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_de)`);
      expect(up, t).toContain(`ALTER TABLE ${S_PADRAO.bm}.${t} ADD COLUMN vigencia_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY`);
    }
    expect(up.match(/ref_versao_criterio v WHERE v\.versao_id = x\.incluido_por_versao_id/g)).toHaveLength(3);
  });
  it('a chave natural passa a valer só entre as linhas vigentes (índice único parcial), inclusive a prioridade do subgrupo', () => {
    for (const [i, t, c] of [
      ['uq_ref_apontamento_subgrupo_vigente', 'ref_apontamento_subgrupo', 'codigo'],
      ['uq_ref_apontamento_subgrupo_prioridade_vigente', 'ref_apontamento_subgrupo', 'prioridade'],
      ['uq_ref_apontamento_termo_vigente', 'ref_apontamento_termo', 'termo_normalizado, subgrupo_codigo'],
      ['uq_ref_apontamento_regra_tipo_vigente', 'ref_apontamento_regra_tipo', 'type_id, condicao'],
    ] as const) expect(sql030.up, i).toContain(`CREATE UNIQUE INDEX ${i} ON ${S_PADRAO.bm}.${t} (${c}) WHERE vigente_ate IS NULL`);
    expect(up).toContain('DROP CONSTRAINT uq_ref_apontamento_subgrupo_prioridade');
  });
  it('nada é apagado nem reaberto: gatilho de vigência (UPDATE, DELETE e TRUNCATE) em cada tabela', () => {
    for (const t of tabelas) {
      expect(up, t).toContain(`CREATE TRIGGER tg_${t}_vigencia BEFORE UPDATE OR DELETE ON ${S_PADRAO.bm}.${t} FOR EACH ROW EXECUTE FUNCTION ${S_PADRAO.core}.proibir_alteracao_vigencia()`);
      expect(up, t).toContain(`CREATE TRIGGER tg_${t}_sem_truncate BEFORE TRUNCATE ON ${S_PADRAO.bm}.${t} FOR EACH STATEMENT`);
    }
  });
  it('o dspd_ref ganha só UPDATE (vigente_ate) nas tabelas que têm a coluna; o coletor continua só lendo; a API nada', () => {
    const S = montarEsquemas('');
    const cat = { bm: Object.fromEntries(tabelas.map((t) => [t, [...nomes(t), 'vigente_de', 'vigente_ate', 'vigencia_id']])), ac: {}, core: {} };
    const grants = gerarGrants(S, cat);
    for (const t of tabelas) {
      expect(grants, t).toContain(`GRANT UPDATE (vigente_ate) ON ${S.bm}.${t} TO dspd_ref`);
      expect(grants, t).toContain(`GRANT SELECT, INSERT ON ${S.bm}.${t} TO dspd_ref`);
      expect(grants.filter((g) => g.includes(`.${t} `) && /TO dspd_(api|coletor)$/.test(g)), t).toEqual([`GRANT SELECT ON ${S.bm}.${t} TO dspd_coletor`]);
    }
    expect(grants.filter((g) => /TO dspd_ref$/.test(g) && /UPDATE/.test(g) && !/UPDATE \(vigente_ate\)/.test(g))).toEqual([]);
  });
});

describe('grants do apontamento (CA-AP-1)', () => {
  const S = montarEsquemas('');
  const tabs = ['stg_apontamento', 'evt_apontamento', 'fato_apontamento', 'dim_card_raiz', 'cfg_pessoa_eliminada', 'ref_apontamento_subgrupo', 'ref_apontamento_termo', 'ref_apontamento_regra_tipo', 'dim_responsavel', 'dim_card', 'ctl_coleta'];
  const colunas = (t: string): string[] => (/^(stg_|evt_)/.test(t) ? ['a'] : nomes(t).length > 0 ? nomes(t) : ['a']);
  const grants = gerarGrants(S, { bm: Object.fromEntries(tabs.map((t) => [t, colunas(t)])), ac: {}, core: {} });
  const de = (papel: string, t: string): string[] => grants.filter((g) => g.endsWith(` TO ${papel}`) && g.includes(`.${t} `) || g.includes(`.${t} TO ${papel}`)).filter((g) => g.endsWith(` TO ${papel}`));
  it('o dspd_api não recebe nenhuma tabela do apontamento, nem do dicionário, nem a lista de supressão', () => {
    for (const t of ['stg_apontamento', 'evt_apontamento', 'fato_apontamento', 'dim_card_raiz', 'cfg_pessoa_eliminada', 'ref_apontamento_subgrupo', 'ref_apontamento_termo', 'ref_apontamento_regra_tipo', 'dim_responsavel']) {
      expect(de('dspd_api', t), t).toEqual([]);
    }
    expect(TABELAS_FORA_DA_API).toEqual(expect.arrayContaining(['dspd_bm.ref_apontamento_subgrupo', 'dspd_bm.ref_apontamento_termo', 'dspd_bm.ref_apontamento_regra_tipo']));
  });
  it('o dspd_coletor insere em staging e eventos sem UPDATE nem DELETE, atualiza as projeções sem DELETE e só lê a lista de supressão', () => {
    expect(de('dspd_coletor', 'stg_apontamento')).toEqual([`GRANT SELECT, INSERT ON ${S.bm}.stg_apontamento TO dspd_coletor`]);
    expect(de('dspd_coletor', 'evt_apontamento')).toEqual([`GRANT SELECT, INSERT ON ${S.bm}.evt_apontamento TO dspd_coletor`]);
    expect(de('dspd_coletor', 'fato_apontamento')).toEqual([`GRANT SELECT, INSERT, UPDATE ON ${S.bm}.fato_apontamento TO dspd_coletor`]);
    expect(de('dspd_coletor', 'dim_card_raiz')).toEqual([`GRANT SELECT, INSERT, UPDATE ON ${S.bm}.dim_card_raiz TO dspd_coletor`]);
    expect(de('dspd_coletor', 'cfg_pessoa_eliminada')).toEqual([`GRANT SELECT ON ${S.bm}.cfg_pessoa_eliminada TO dspd_coletor`]);
    expect(de('dspd_coletor', 'ref_apontamento_termo')).toEqual([`GRANT SELECT ON ${S.bm}.ref_apontamento_termo TO dspd_coletor`]);
    expect(grants.filter((g) => /DELETE/.test(g) && /apontamento|dim_card_raiz|cfg_pessoa/.test(g))).toEqual([]);
  });
  it('nenhum papel além do coletor e do dspd_ref (carga do dicionário) toca as tabelas novas', () => {
    for (const papel of ['dspd_webhook', 'dspd_automacao', 'dspd_pesquisa']) {
      for (const t of tabs.filter((x) => x !== 'dim_card' && x !== 'ctl_coleta' && x !== 'dim_responsavel')) expect(de(papel, t), `${papel} ${t}`).toEqual([]);
    }
    expect(de('dspd_ref', 'ref_apontamento_subgrupo')).toEqual([`GRANT SELECT, INSERT ON ${S.bm}.ref_apontamento_subgrupo TO dspd_ref`]);
  });
});
