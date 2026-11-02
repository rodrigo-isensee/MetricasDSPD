import { describe, expect, it } from 'vitest';
import { CAMPOS_APONTAMENTO, CAMPOS_CLASSIFICACAO } from '../src/modulos/businessmap/allow-list.js';
import {
  classificar, COLUNA_DO_CAMPO, COLUNAS_REGISTRO, conferirClassificacao, DEFINICAO_REGISTRO, idDoBm, lerApontamento, TIPOS_DAS_COLUNAS,
  type LinhaApontamento, type SaidaClassificacao,
} from '../src/modulos/businessmap/apontamento/registro.js';
import { registroWorklog } from './apontamento-duble.js';

// Pedido 059, A2 (CA-AP-2, CA-AP-9, CA-AP-13 e CT-78): leitura de um apontamento na fronteira. O comentário e o `user_id` saem separados
// e só em memória; o que sobra é a allow-list. Valor inválido é recusado SEM eco (só código e `id_origem`).
const HOJE = '2026-11-02';
const ok = (extra: Record<string, unknown> = {}) => lerApontamento(registroWorklog(extra), HOJE);
const SAIDA: SaidaClassificacao = { subgrupo: 'reuniao', flags: 0, qtdPalavras: 3, versaoDicionario: 'dic-1' };

describe('lerApontamento: allow-list e extração em memória', () => {
  it('reduz às chaves da allow-list, com os nomes das colunas, e separa o user_id e o comentário', () => {
    const l = lerApontamento({
      ...registroWorklog({ logged_time_id: 9_000_000_777, comment: 'MARCADOR-COMENTARIO-059 texto', user_id: 9_400_000_005 }),
      reporter: 'PESSOA-FICTICIA-A', email: 'marcador059@exemplo.invalido', campo_novo_059: 'x', title: 'TITULO-MARCADOR',
    }, HOJE);
    expect(l.ok).toBe(true);
    if (!l.ok) return;
    expect(Object.keys(l.linha).sort()).toEqual(CAMPOS_APONTAMENTO.map((c) => COLUNA_DO_CAMPO[c]).sort());
    expect(l.linha).toEqual({
      logged_time_id: '9000000777', card_id: '9100000000', parent_card_id: null, subtask_id: null, lane_id: '9200000001', column_id: '9300000001',
      category_id: null, data_apontamento: '2026-10-20', segundos: 3600, registrado_em: '2026-10-20T14:00:00.000Z',
    });
    expect(l.userId).toBe('9400000005');
    expect(l.comentario).toBe('MARCADOR-COMENTARIO-059 texto');
    const json = JSON.stringify(l.linha);
    for (const proibido of ['MARCADOR-COMENTARIO-059', 'PESSOA-FICTICIA-A', 'marcador059', 'campo_novo_059', 'TITULO-MARCADOR', '9400000005']) expect(json).not.toContain(proibido);
  });
  it('ids opcionais ausentes, nulos ou presentes; comentário e user_id ausentes; logged_at ausente', () => {
    const l = lerApontamento({ logged_time_id: '5', card_id: 7, parent_card_id: 8, subtask_id: '9', lane_id: undefined, date: '2026-11-02', time: 1 }, HOJE);
    expect(l).toEqual({
      ok: true, userId: null, comentario: null,
      linha: { logged_time_id: '5', card_id: '7', parent_card_id: '8', subtask_id: '9', lane_id: null, column_id: null, category_id: null, data_apontamento: '2026-11-02', segundos: 1, registrado_em: null },
    });
    const sem = lerApontamento({ logged_time_id: 5, card_id: 7, date: '2026-11-02', time: 1, logged_at: null, comment: 12 }, HOJE);
    expect(sem.ok && sem.comentario).toBe(null);
  });
  it('logged_at sem fuso usa FUSO_PADRAO_BM (a mesma função dos cards); com fuso, converte', () => {
    const l = ok({ logged_at: '2026-10-20T14:00:00' });
    expect(l.ok && l.linha.registrado_em).toBe('2026-10-20T14:00:00.000Z');
    const com = ok({ logged_at: '2026-10-20T14:00:00-03:00' });
    expect(com.ok && com.linha.registrado_em).toBe('2026-10-20T17:00:00.000Z');
  });
});

describe('lerApontamento: recusas sem eco do valor (CA-AP-9, F-IDS-RUINS, F-LIMITES-HORA, F-FUTURA)', () => {
  const recusa = (extra: Record<string, unknown>, codigo: string, idOrigem: string | null) => {
    const r = ok(extra);
    expect(r).toEqual({ ok: false, codigo, idOrigem });
    expect(JSON.stringify(r)).not.toMatch(/abc|SEGREDO/);
  };
  it.each([['abc'], [''], ['1234567890123'], [0], ['0'], ['01'], ['1 2'], [-3], [1.5], [null], [undefined]])('logged_time_id %j é recusado e não tem id de origem', (v) => {
    recusa({ logged_time_id: v }, 'id-invalido', null);
  });
  it('card_id, ids opcionais e user_id inválidos: id-invalido com o logged_time_id como origem', () => {
    for (const campo of ['card_id', 'parent_card_id', 'subtask_id', 'lane_id', 'column_id', 'category_id', 'user_id']) {
      const r = lerApontamento({ ...registroWorklog({ logged_time_id: 9_000_000_900, [campo]: 'abc' }) }, HOJE);
      expect(r, campo).toEqual({ ok: false, codigo: 'id-invalido', idOrigem: '9000000900' });
    }
    expect(ok({ card_id: null }).ok).toBe(false);
  });
  it.each([['2026-02-30'], ['2026-13-01'], ['02/11/2026'], [''], [null], [20261102], ['2026-11-2']])('date %j é recusada (data-invalida)', (v) => {
    expect(ok({ date: v })).toMatchObject({ ok: false, codigo: 'data-invalida' });
  });
  it('data futura: hoje passa, amanhã é recusada', () => {
    expect(ok({ date: HOJE }).ok).toBe(true);
    expect(ok({ date: '2026-11-03' })).toMatchObject({ ok: false, codigo: 'data-futura' });
  });
  it.each([[0], [-1], [86_401], [1.5], ['3600'], [null], [undefined], [Number.NaN]])('time %j é recusado (tempo-invalido)', (v) => {
    expect(ok({ time: v })).toMatchObject({ ok: false, codigo: 'tempo-invalido' });
  });
  it('limites de time: 1 e 86 400 passam (soma diária alta NÃO é recusada)', () => {
    expect(ok({ time: 1 }).ok).toBe(true);
    expect(ok({ time: 86_400 }).ok).toBe(true);
  });
  it('logged_at presente e ilegível: campo-invalido', () => {
    expect(ok({ logged_at: 'ontem' })).toMatchObject({ ok: false, codigo: 'campo-invalido' });
    expect(ok({ logged_at: 20 })).toMatchObject({ ok: false, codigo: 'campo-invalido' });
  });
  it('objeto que não é objeto: id-invalido', () => {
    for (const v of [null, 'x', 3, [], undefined]) expect(lerApontamento(v, HOJE)).toEqual({ ok: false, codigo: 'id-invalido', idOrigem: null });
  });
});

describe('idDoBm', () => {
  it('número seguro ou texto de 1 a 12 dígitos sem zero à esquerda', () => {
    expect(idDoBm(12)).toBe('12');
    expect(idDoBm('123456789012')).toBe('123456789012');
    for (const v of [Number.MAX_SAFE_INTEGER, 1e21, true, {}, [], '١٢']) expect(idDoBm(v)).toBeNull();
  });
});

describe('conferirClassificacao: lista fechada e inteiros', () => {
  it('aceita a saída válida (a mesma referência)', () => {
    expect(conferirClassificacao(SAIDA)).toBe(SAIDA);
    expect(conferirClassificacao({ ...SAIDA, flags: 7, qtdPalavras: 0 })).not.toBeNull();
    expect(conferirClassificacao({ ...SAIDA, qtdPalavras: 32_767 })).not.toBeNull();
  });
  it.each([
    [null], ['x'], [[]], [{}],
    [{ ...SAIDA, subgrupo: 'Reuniao' }], [{ ...SAIDA, subgrupo: '' }], [{ ...SAIDA, subgrupo: 'a'.repeat(81) }], [{ ...SAIDA, subgrupo: 3 }], [{ ...SAIDA, subgrupo: 'a--b' }],
    [{ ...SAIDA, flags: -1 }], [{ ...SAIDA, flags: 8 }], [{ ...SAIDA, flags: 1.5 }], [{ ...SAIDA, flags: '1' }],
    [{ ...SAIDA, qtdPalavras: -1 }], [{ ...SAIDA, qtdPalavras: 32_768 }], [{ ...SAIDA, qtdPalavras: 0.5 }],
    [{ ...SAIDA, versaoDicionario: '' }], [{ ...SAIDA, versaoDicionario: 'v'.repeat(41) }], [{ ...SAIDA, versaoDicionario: 1 }],
  ])('recusa %j', (v) => {
    expect(conferirClassificacao(v)).toBeNull();
  });
});

describe('classificar: registro_sha256 só sobre o registro gravável (CT-78)', () => {
  const base = (): LinhaApontamento => {
    const l = ok({ logged_time_id: 9_000_000_101 });
    if (!l.ok) throw new Error('fixture');
    return l.linha;
  };
  it('duas leituras do mesmo registro dão o mesmo hash, em hexadecimal de 64 caracteres, e a linha leva a classificação', () => {
    const a = classificar(base(), SAIDA);
    expect(a.registro_sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(classificar(base(), SAIDA).registro_sha256).toBe(a.registro_sha256);
    expect(a).toMatchObject({ subgrupo_codigo: 'reuniao', flags_qualidade: 0, qtd_palavras: 3, versao_dicionario: 'dic-1' });
  });
  it('muda com horas, data ou classificação; não muda com a ordem das chaves', () => {
    const h = classificar(base(), SAIDA).registro_sha256;
    expect(classificar({ ...base(), segundos: 7200 }, SAIDA).registro_sha256).not.toBe(h);
    expect(classificar({ ...base(), data_apontamento: '2026-10-21' }, SAIDA).registro_sha256).not.toBe(h);
    expect(classificar(base(), { ...SAIDA, subgrupo: 'outro' }).registro_sha256).not.toBe(h);
    expect(classificar(base(), { ...SAIDA, versaoDicionario: 'dic-2' }).registro_sha256).not.toBe(h);
    const invertida = Object.fromEntries(Object.entries(base()).reverse()) as unknown as LinhaApontamento;
    expect(classificar(invertida, SAIDA).registro_sha256).toBe(h);
  });
  it('não depende do comentário nem do user_id: dois comentários e dois usuários com a mesma saída têm o mesmo hash', () => {
    const a = lerApontamento(registroWorklog({ logged_time_id: 9_000_000_102, comment: 'texto um', user_id: 9_400_000_001 }), HOJE);
    const b = lerApontamento(registroWorklog({ logged_time_id: 9_000_000_102, comment: 'texto dois', user_id: 9_400_000_002 }), HOJE);
    if (!a.ok || !b.ok) throw new Error('fixture');
    expect(classificar(a.linha, SAIDA).registro_sha256).toBe(classificar(b.linha, SAIDA).registro_sha256);
  });
});

describe('estrutura do registro (CA-AP-13)', () => {
  it('as colunas do INSERT são a allow-list mais a classificação e o hash, e todas têm tipo', () => {
    expect(COLUNAS_REGISTRO).toEqual([...CAMPOS_APONTAMENTO.map((c) => COLUNA_DO_CAMPO[c]), ...CAMPOS_CLASSIFICACAO, 'registro_sha256']);
    for (const c of COLUNAS_REGISTRO) expect(TIPOS_DAS_COLUNAS[c], c).toBeTypeOf('string');
    expect(Object.keys(TIPOS_DAS_COLUNAS).sort()).toEqual([...COLUNAS_REGISTRO].sort());
    expect(DEFINICAO_REGISTRO).toContain('registro_sha256 text');
  });
  it('nenhuma coluna gravável é de comentário, de pessoa ou de texto livre', () => {
    for (const proibido of ['comment', 'comentario', 'user_id', 'reporter', 'email', 'title', 'titulo', 'realname', 'nome']) {
      expect(COLUNAS_REGISTRO.some((c) => c.includes(proibido)), proibido).toBe(false);
      expect((CAMPOS_APONTAMENTO as readonly string[]).includes(proibido), proibido).toBe(false);
    }
  });
});
