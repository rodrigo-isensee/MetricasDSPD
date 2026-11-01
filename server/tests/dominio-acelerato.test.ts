import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { carregarConfigRef } from '../src/plataforma/config.js';
import {
  ARQUIVO_DOMINIO, CAMPOS_DOMINIO, ErroDominio, analisarDominio, dataCivilValida, lerDominio, planejarDominio, referenciaDaVersao, sincronizarDominio,
  type ArquivoDominio, type LinhaVigente,
} from '../src/modulos/referencia/dominio-acelerato.js';
import { criarDublePg } from './duble-pg.js';

const S = montarEsquemas('');
const AGORA = new Date('2026-11-02T12:00:00Z');
const HOJE = '2026-11-02';

const base = (dominios: Record<string, { codigo: string; rotulo: string }[]>): Record<string, unknown> => ({
  versao: 1,
  versao_criterio: { dominio: 'acelerato', descricao: 'Listas do recorte', motivo: 'Decisão do dono', referencia: 'pedido 056' },
  schema: 'dspd_ac', tabela: 'ref_dominio', regra: 'regra', dominios,
});
const texto = (dominios: Record<string, { codigo: string; rotulo: string }[]>): string => JSON.stringify(base(dominios));
const arquivo = (dominios: Record<string, { codigo: string; rotulo: string }[]>): ArquivoDominio => analisarDominio(texto(dominios)).arquivo;
const vigente = (campo: string, codigo: string, rotulo: string, vigente_de = '2026-10-01'): LinhaVigente => ({ campo, codigo, rotulo, vigente_de });

describe('arquivo versionado do domínio do Acelerato (docs/architecture/fontes)', () => {
  it('o arquivo real é válido, o hash é o do texto e as listas já decididas estão nele (categoria 135, descrição do workflow 19)', () => {
    const lido = lerDominio();
    const bruto = readFileSync(ARQUIVO_DOMINIO, 'utf8');
    expect(lido.sha256).toBe(createHash('sha256').update(bruto, 'utf8').digest('hex'));
    expect(lido.arquivo.versao_criterio.dominio).toBe('acelerato');
    expect(lido.arquivo.dominios.categoria).toHaveLength(135);
    expect(lido.arquivo.dominios.descricao_workflow).toHaveLength(19);
    expect(lido.arquivo.dominios.categoria!.some((c) => c.rotulo === 'TESTADEV444')).toBe(false);
    for (const campo of Object.keys(lido.arquivo.dominios)) expect(CAMPOS_DOMINIO).toContain(campo);
  });
  it('lerDominio aceita um caminho de texto', () => {
    expect(lerDominio(new URL(ARQUIVO_DOMINIO).pathname).sha256).toBe(lerDominio().sha256);
  });
});

describe('analisarDominio (valida antes de qualquer gravação)', () => {
  const recusa = (t: string): string => {
    try { analisarDominio(t); } catch (e) { expect(e).toBeInstanceOf(ErroDominio); return (e as Error).message; }
    throw new Error('esperava recusa');
  };
  it('JSON inválido', () => { expect(recusa('{nao')).toContain('não é um JSON'); });
  it('campo fora da lista fechada, chave extra, lista vazia e versão errada', () => {
    expect(recusa(texto({ agente: [{ codigo: '1', rotulo: 'x' }] }))).toContain('inválido');
    expect(recusa(texto({ equipe: [] }))).toContain('dominios.equipe');
    expect(recusa(JSON.stringify({ ...base({ equipe: [{ codigo: '1', rotulo: 'x' }] }), extra: 1 }))).toContain('inválido');
    expect(recusa(JSON.stringify({ ...base({ equipe: [{ codigo: '1', rotulo: 'x' }] }), versao: 2 }))).toContain('inválido');
  });
  it('código repetido, chave do recorte não numérica, e-mail e caractere de controle no valor', () => {
    expect(recusa(texto({ categoria: [{ codigo: '1', rotulo: 'a' }, { codigo: '1', rotulo: 'b' }] }))).toContain('dominios.categoria');
    expect(recusa(texto({ equipe: [{ codigo: 'x1', rotulo: 'a' }] }))).toContain('dominios.equipe');
    expect(recusa(texto({ categoria: [{ codigo: '1', rotulo: 'fulano@empresa.com' }] }))).toContain('dominios.categoria');
    expect(recusa(texto({ categoria: [{ codigo: '1', rotulo: 'a\nb' }] }))).toContain('dominios.categoria');
  });
  it('a chave da categoria é numérica (como a do recorte)', () => {
    expect(recusa(texto({ categoria: [{ codigo: 'abc', rotulo: 'a' }] }))).toContain('dominios.categoria');
    expect(arquivo({ categoria: [{ codigo: '288', rotulo: 'a' }] }).dominios.categoria).toHaveLength(1);
  });
  it('separador de linha e de parágrafo e caractere invisível (U+2028, U+2029, U+200B) são recusados no valor', () => {
    for (const c of ['\u2028', '\u2029', '\u200B', '\u202E']) {
      expect(recusa(texto({ categoria: [{ codigo: '1', rotulo: `a${c}b` }] }))).toContain('dominios.categoria');
    }
  });
  it('o mesmo filtro vale para descricao, motivo, referencia e regra', () => {
    const com = (campo: 'descricao' | 'motivo' | 'referencia' | 'regra', valor: string): string => {
      const b = base({ equipe: [{ codigo: '1', rotulo: 'x' }] }) as { versao_criterio: Record<string, string> } & Record<string, unknown>;
      if (campo === 'regra') b.regra = valor;
      else b.versao_criterio[campo] = valor;
      return JSON.stringify(b);
    };
    for (const campo of ['descricao', 'motivo', 'referencia', 'regra'] as const) {
      for (const ruim of ['a\u2028b', 'a\u2029b', 'a\u200Bb', 'a\nb', 'fulano@empresa.com']) {
        expect(recusa(com(campo, ruim))).toContain('inválido');
      }
      expect(() => analisarDominio(com(campo, 'texto de critério válido'))).not.toThrow();
    }
  });
  it('a mensagem não traz o valor recusado', () => {
    expect(recusa(texto({ categoria: [{ codigo: '1', rotulo: 'fulano@empresa.com' }] }))).not.toContain('fulano');
  });
  it('aceita só as listas que traz (campo ausente fica fora)', () => {
    expect(Object.keys(arquivo({ equipe: [{ codigo: '10', rotulo: 'SSSC TOTVS' }] }).dominios)).toEqual(['equipe']);
  });
});

describe('planejarDominio', () => {
  const lista = arquivo({ categoria: [{ codigo: '1', rotulo: 'A' }, { codigo: '2', rotulo: 'B' }] });
  it('primeira carga: abre todas, com a ordem da lista', () => {
    const p = planejarDominio(lista, [], HOJE);
    expect(p).toMatchObject({ fechar: [], campos: 1, inicial: true });
    expect(p.inserir).toEqual([{ campo: 'categoria', codigo: '1', rotulo: 'A', ordem: 0 }, { campo: 'categoria', codigo: '2', rotulo: 'B', ordem: 1 }]);
  });
  it('igual: nada a fazer; só a ordem diferente também não muda nada', () => {
    const vig = [vigente('categoria', '2', 'B'), vigente('categoria', '1', 'A')];
    expect(planejarDominio(lista, vig, HOJE)).toMatchObject({ inserir: [], fechar: [], inicial: false });
  });
  it('rótulo diferente fecha a vigência e abre a nova; código que saiu só fecha; código novo só abre', () => {
    const vig = [vigente('categoria', '1', 'A velho'), vigente('categoria', '9', 'Saiu')];
    const p = planejarDominio(lista, vig, HOJE);
    expect(p.fechar).toEqual([{ campo: 'categoria', codigo: '1' }, { campo: 'categoria', codigo: '9' }]);
    expect(p.inserir.map((i) => i.codigo)).toEqual(['1', '2']);
  });
  it('campo que o arquivo não traz não é tocado', () => {
    const p = planejarDominio(lista, [vigente('etapa', 'Novo', 'Novo'), vigente('categoria', '1', 'A'), vigente('categoria', '2', 'B')], HOJE);
    expect(p.fechar).toEqual([]);
  });
  it('vigência aberta hoje ou depois não é fechada no mesmo dia (nunca sobrescreve): erro de vigência', () => {
    const vig = [vigente('categoria', '1', 'A velho', HOJE)];
    expect(() => planejarDominio(lista, vig, HOJE)).toThrow(/vigência aberta em 2026-11-02/);
    expect(() => planejarDominio(lista, [vigente('categoria', '9', 'Saiu', '2026-12-01')], HOJE)).toThrow(ErroDominio);
  });
});

describe('planejarDominio: data retroativa', () => {
  const lista = arquivo({ categoria: [{ codigo: '1', rotulo: 'A novo' }] });
  const vig = [vigente('categoria', '1', 'A')];
  it('data menor que a última vigência do campo (de ou até) é recusada quando o campo muda', () => {
    expect(() => planejarDominio(lista, vig, '2026-10-15', new Map([['categoria', '2026-11-01']]))).toThrow(/anterior à última vigência/);
    expect(() => planejarDominio(lista, vig, '2026-10-15', new Map([['categoria', '2026-11-01']]))).toThrow(ErroDominio);
  });
  it('data igual ou posterior é aceita; sem mudança a data retroativa não grava nada e não é recusada', () => {
    expect(planejarDominio(lista, vig, '2026-11-01', new Map([['categoria', '2026-11-01']])).inserir).toHaveLength(1);
    expect(planejarDominio(lista, vig, '2026-11-02', new Map([['categoria', '2026-11-01']])).inserir).toHaveLength(1);
    const igual = arquivo({ categoria: [{ codigo: '1', rotulo: 'A' }] });
    expect(planejarDominio(igual, vig, '2026-10-15', new Map([['categoria', '2026-11-01']]))).toMatchObject({ inserir: [], fechar: [] });
  });
  it('só a última vigência do próprio campo conta', () => {
    expect(planejarDominio(lista, vig, '2026-10-15', new Map([['etapa', '2026-11-01']])).inserir).toHaveLength(1);
  });
});

describe('dataCivilValida (argumento do ac:ref-sync)', () => {
  it('aceita data existente e recusa inexistente, fora do formato e bissexto errado', () => {
    expect(dataCivilValida('2026-11-02')).toBe(true);
    expect(dataCivilValida('2028-02-29')).toBe(true);
    for (const ruim of ['2026-02-30', '2027-02-29', '2026-13-01', '2026-00-10', '2026-04-31', '2026-1-1', '', 'ontem']) expect(dataCivilValida(ruim)).toBe(false);
  });
});

describe('sincronizarDominio (dublê de PostgreSQL)', () => {
  const lido = analisarDominio(texto({ equipe: [{ codigo: '10', rotulo: 'SSSC TOTVS' }, { codigo: '11', rotulo: 'SSSC SENIOR' }] }));
  const executar = (vigentes: LinhaVigente[], versaoExiste = false) => {
    const d = criarDublePg((q) => {
      if (q.texto.includes('max(greatest')) return [];
      if (q.texto.includes('FROM dspd_ac.ref_dominio')) return vigentes;
      if (q.texto.startsWith('SELECT 1')) return versaoExiste ? [{ x: 1 }] : [];
      return [];
    });
    return d;
  };
  const gravacoes = (d: ReturnType<typeof executar>) => d.chamadas.filter((c) => /^(INSERT|UPDATE)/.test(c.texto));

  it('grava as vigências e a versão de critério (hash do arquivo) numa transação, só em dspd_ac e dspd_core', async () => {
    const d = executar([]);
    const r = await sincronizarDominio(d.pool, S, lido, HOJE, AGORA);
    expect(r).toEqual({ sha256: lido.sha256, campos: 1, inseridas: 2, fechadas: 0, versaoRegistrada: true });
    const g = gravacoes(d);
    expect(g.map((c) => c.texto.split(' (')[0])).toEqual(['INSERT INTO dspd_ac.ref_dominio', 'INSERT INTO dspd_ac.ref_dominio', 'INSERT INTO dspd_core.ref_versao_criterio']);
    expect(g[0]!.valores).toEqual(['equipe', '10', HOJE, 'SSSC TOTVS', 0]);
    expect(g[2]!.valores[3]).toBe(referenciaDaVersao(lido.sha256));
    expect(g[2]!.valores[0]).toBe(HOJE);
    expect(d.chamadas[0]!.texto).toBe('BEGIN');
    expect(d.chamadas.at(-1)!.texto).toBe('COMMIT');
    expect(d.chamadas.some((c) => /DELETE|TRUNCATE/.test(c.texto))).toBe(false);
  });
  it('idempotente: com as listas já vigentes não grava nada, nem versão', async () => {
    const d = executar([vigente('equipe', '10', 'SSSC TOTVS'), vigente('equipe', '11', 'SSSC SENIOR')]);
    expect(await sincronizarDominio(d.pool, S, lido, HOJE, AGORA)).toMatchObject({ inseridas: 0, fechadas: 0, versaoRegistrada: false });
    expect(gravacoes(d)).toEqual([]);
  });
  it('mudança de rótulo: UPDATE só de vigente_ate e INSERT da nova', async () => {
    const d = executar([vigente('equipe', '10', 'Antigo'), vigente('equipe', '11', 'SSSC SENIOR')]);
    const r = await sincronizarDominio(d.pool, S, lido, HOJE, AGORA);
    expect(r).toMatchObject({ inseridas: 1, fechadas: 1, versaoRegistrada: true });
    const g = gravacoes(d);
    expect(g[0]!.texto).toMatch(/^UPDATE dspd_ac\.ref_dominio SET vigente_ate = \$1 WHERE/);
    expect(g[0]!.valores).toEqual([HOJE, 'equipe', '10']);
  });
  it('a versão do mesmo hash não é registrada duas vezes', async () => {
    const d = executar([], true);
    expect(await sincronizarDominio(d.pool, S, lido, HOJE, AGORA)).toMatchObject({ inseridas: 2, versaoRegistrada: false });
    expect(gravacoes(d).some((c) => c.texto.includes('ref_versao_criterio'))).toBe(false);
  });
  it('data anterior à última vigência do campo (lida do banco): desfaz e não grava nada', async () => {
    const d = criarDublePg((q) => {
      if (q.texto.includes('max(greatest')) return [{ campo: 'equipe', ultima: '2026-12-01' }];
      return [];
    });
    await expect(sincronizarDominio(d.pool, S, lido, HOJE, AGORA)).rejects.toThrow(/anterior à última vigência/);
    expect(gravacoes(d)).toEqual([]);
    expect(d.chamadas.at(-1)!.texto).toBe('ROLLBACK');
  });
  it('erro de vigência: desfaz (ROLLBACK) e não grava nada', async () => {
    const d = executar([vigente('equipe', '10', 'Antigo', HOJE)]);
    await expect(sincronizarDominio(d.pool, S, lido, HOJE, AGORA)).rejects.toBeInstanceOf(ErroDominio);
    expect(gravacoes(d)).toEqual([]);
    expect(d.chamadas.at(-1)!.texto).toBe('ROLLBACK');
  });
});

describe('configuração do papel de referência', () => {
  it('exige PG_REF_URL e a mensagem cita só o nome da variável', () => {
    expect(carregarConfigRef({ PG_REF_URL: 'postgres://dspd_ref:x@h:5432/b' }).PG_REF_URL).toContain('dspd_ref');
    expect(() => carregarConfigRef({})).toThrow(/PG_REF_URL/);
    expect(() => carregarConfigRef({ PG_REF_URL: 'mysql://u:SEGREDO@h/b' })).toThrow('Configuração inválida (variáveis: PG_REF_URL)');
  });
});
