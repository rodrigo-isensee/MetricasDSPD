import { describe, expect, it } from 'vitest';
import { analisarArgumentosEliminacao, eliminarPessoa, lerUsuarioDaEntrada, type DepsEliminacao } from '../src/modulos/businessmap/apontamento/eliminacao.js';
import { hmacUsuario } from '../src/modulos/businessmap/apontamento/supressao.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { carregarConfigEliminacaoPessoa } from '../src/plataforma/config.js';
import { criarDublePg, type Chamada, type Resposta } from './duble-pg.js';

// Pedido 059, A4 (CA-AP-10): eliminação a pedido, sem banco. O SQL real, com o papel migrador, é provado em `apontamento-eliminacao.pg.test.ts`.
const S = montarEsquemas('');
const SAL = 'sal-de-teste-com-pelo-menos-32-bytes!!';
const USUARIO = '9400000001';
const AGORA = new Date('2026-11-04T02:00:00Z'); // 2026-11-03 em São Paulo

interface Estado { pessoaRef: string | null; jaNaLista?: boolean; horas?: number; travaOcupada?: boolean; falharEm?: string }
const banco = (e: Estado) => criarDublePg((c: Chamada): Resposta => {
  const t = c.texto;
  if (e.falharEm !== undefined && t.includes(e.falharEm)) return new Error('falha simulada');
  if (t.includes('pg_try_advisory_lock')) return [{ ok: e.travaOcupada !== true }];
  if (t.includes('FROM dspd_bm.dim_responsavel')) return e.pessoaRef === null ? [] : [{ pessoa_ref: e.pessoaRef }];
  if (t.includes('FROM dspd_bm.cfg_pessoa_eliminada')) return e.jaNaLista === true ? [{ '?column?': 1 }] : [];
  if (t.includes('count(*)')) return [{ n: String(e.horas ?? 0) }];
  return [];
});
const deps = (b: ReturnType<typeof banco>, extra: Partial<DepsEliminacao> = {}): DepsEliminacao => ({ pool: b.pool, S, sal: SAL, agora: () => AGORA, ...extra });
const sqls = (b: ReturnType<typeof banco>): string[] => b.chamadas.map((c) => c.texto);
const gravacoes = (b: ReturnType<typeof banco>): Chamada[] => b.chamadas.filter((c) => /^(INSERT|UPDATE|DELETE)/.test(c.texto));

describe('analisarArgumentosEliminacao', () => {
  it('só --usuario=<dígitos> e, opcional, --confirmar', () => {
    expect(analisarArgumentosEliminacao([`--usuario=${USUARIO}`])).toEqual({ usuarioId: USUARIO, confirmar: false });
    expect(analisarArgumentosEliminacao(['--confirmar', `--usuario=${USUARIO}`])).toEqual({ usuarioId: USUARIO, confirmar: true });
  });
  it('--usuario=- pede o id à entrada padrão (A2 da segurança da coleta): o id não passa pela linha de comando', () => {
    expect(analisarArgumentosEliminacao(['--usuario=-'])).toEqual({ usuarioId: null, confirmar: false });
    expect(analisarArgumentosEliminacao(['--confirmar', '--usuario=-'])).toEqual({ usuarioId: null, confirmar: true });
  });
  it('qualquer outra forma é recusada com a linha de uso, sem eco do valor', () => {
    for (const ruim of [[], ['--confirmar'], ['--usuario='], ['--usuario=abc'], ['--usuario=0'], ['--usuario=1234567890123'], ['--usuario=1', '--usuario=2'], ['--usuario=1', '--confirmar', '--confirmar'], ['--usuario=1', '--outra'], ['1'], ['--usuario=senha-secreta'], ['--usuario=--'], ['--usuario=-1'], ['--usuario=-', '--usuario=-']]) {
      const e = (() => { try { analisarArgumentosEliminacao(ruim); } catch (x) { return x as Error; } return undefined; })();
      expect(e, JSON.stringify(ruim)).toMatchObject({ codigo: 'uso' });
      expect(e!.message).toMatch(/^uso: bm:eliminar-pessoa --usuario=/);
      expect(e!.message).not.toContain('senha-secreta');
    }
  });
});

describe('lerUsuarioDaEntrada (A2 da segurança da coleta)', () => {
  async function* partes(...p: (string | Uint8Array)[]): AsyncGenerator<string | Uint8Array> { for (const x of p) yield x; }
  it('lê uma linha só com dígitos, com ou sem quebra de linha, em pedaços de texto ou bytes', async () => {
    expect(await lerUsuarioDaEntrada(partes(`${USUARIO}\n`))).toBe(USUARIO);
    expect(await lerUsuarioDaEntrada(partes(`${USUARIO}\r\n`))).toBe(USUARIO);
    expect(await lerUsuarioDaEntrada(partes(USUARIO))).toBe(USUARIO);
    expect(await lerUsuarioDaEntrada(partes(Buffer.from(USUARIO.slice(0, 2)), Buffer.from(`${USUARIO.slice(2)}\n`)))).toBe(USUARIO);
    expect(await lerUsuarioDaEntrada(partes(`  ${USUARIO}  \nresto ignorado\n`))).toBe(USUARIO);
  });
  it('vazia, fora do formato ou grande demais: recusa com a linha de uso, sem eco', async () => {
    for (const ruim of ['', '\n', 'senha-secreta\n', '0\n', '12 34\n', '1234567890123\n', `${'9'.repeat(100)}\n`, '9'.repeat(100)]) {
      const e = await lerUsuarioDaEntrada(partes(ruim)).then(() => undefined, (x: unknown) => x as Error);
      expect(e, JSON.stringify(ruim)).toMatchObject({ codigo: 'uso' });
      expect(e!.message).not.toMatch(/senha-secreta|9999/);
    }
  });
  it('para de ler ao passar do teto (entrada sem fim não é consumida)', async () => {
    let lidos = 0;
    async function* infinita(): AsyncGenerator<string> { for (;;) { lidos += 1; yield '9'.repeat(40); } }
    await expect(lerUsuarioDaEntrada(infinita())).rejects.toMatchObject({ codigo: 'uso' });
    expect(lidos).toBeLessThanOrEqual(3);
  });
});

describe('eliminarPessoa', () => {
  it('confirmado: grava o HMAC (nunca o id), apaga a linha da pessoa e anula pessoa_ref no fato, nessa ordem de efeito, numa transação, sob a trava', async () => {
    const b = banco({ pessoaRef: '17', horas: 4 });
    const r = await eliminarPessoa(deps(b), { usuarioId: USUARIO, confirmar: true });
    expect(r).toEqual({ confirmado: true, jaSuprimida: false, linhaDePessoa: true, apontamentosDesvinculados: 4 });
    const g = gravacoes(b);
    expect(g.map((c) => /^(\w+)( INTO| FROM)? (\S+)/.exec(c.texto)!.filter((_, i) => i === 1 || i === 3).join(' '))).toEqual(['INSERT dspd_bm.cfg_pessoa_eliminada', 'DELETE dspd_bm.dim_responsavel', 'UPDATE dspd_bm.fato_apontamento']);
    expect(g[0]!.valores).toEqual([hmacUsuario(SAL, USUARIO), '2026-11-03']);
    expect(g[0]!.texto).toContain('ON CONFLICT ON CONSTRAINT cfg_pessoa_eliminada_pkey DO NOTHING');
    expect(g[1]!.valores).toEqual([USUARIO]);
    expect(g[2]!.texto).toBe('UPDATE dspd_bm.fato_apontamento SET pessoa_ref = NULL WHERE pessoa_ref = $1');
    expect(g[2]!.valores).toEqual(['17']);
    const todos = sqls(b);
    expect(todos).toContain('BEGIN');
    expect(todos).toContain('COMMIT');
    // o user_id nunca vai ao banco em claro na lista de supressão; as horas do fato não são tocadas (nenhum DELETE no fato, nenhum UPDATE de segundos)
    expect(g[0]!.valores).not.toContain(USUARIO);
    expect(todos.join('\n')).not.toMatch(/DELETE FROM \S*fato_apontamento|segundos|TRUNCATE/);
    expect(b.estado.liberados).toBeGreaterThan(0);
  });
  it('sem --confirmar: só descreve o que seria feito, sem nenhuma gravação', async () => {
    const b = banco({ pessoaRef: '17', horas: 4 });
    expect(await eliminarPessoa(deps(b), { usuarioId: USUARIO, confirmar: false })).toEqual({ confirmado: false, jaSuprimida: false, linhaDePessoa: true, apontamentosDesvinculados: 4 });
    expect(gravacoes(b)).toEqual([]);
  });
  it('pessoa sem linha em dim_responsavel (nunca coletada): só entra na lista de supressão; repetir o procedimento é inofensivo', async () => {
    const b = banco({ pessoaRef: null });
    expect(await eliminarPessoa(deps(b), { usuarioId: USUARIO, confirmar: true })).toEqual({ confirmado: true, jaSuprimida: false, linhaDePessoa: false, apontamentosDesvinculados: 0 });
    expect(gravacoes(b).map((c) => c.texto.split(' ')[0])).toEqual(['INSERT']);
    expect(sqls(b).some((t) => t.includes('count(*)'))).toBe(false);
    const de = banco({ pessoaRef: null, jaNaLista: true });
    expect(await eliminarPessoa(deps(de), { usuarioId: USUARIO, confirmar: true })).toMatchObject({ jaSuprimida: true, linhaDePessoa: false });
  });
  it('sal ausente ou curto: falha antes de tocar o banco', async () => {
    for (const sal of ['', 'curto', 'x'.repeat(31)]) {
      const b = banco({ pessoaRef: '1' });
      await expect(eliminarPessoa(deps(b, { sal }), { usuarioId: USUARIO, confirmar: true })).rejects.toMatchObject({ codigo: 'configuracao' });
      expect(b.chamadas).toHaveLength(0);
    }
  });
  it('coleta em andamento (trava da fonte ocupada): recusa sem gravar', async () => {
    const b = banco({ pessoaRef: '1', travaOcupada: true });
    await expect(eliminarPessoa(deps(b), { usuarioId: USUARIO, confirmar: true })).rejects.toMatchObject({ codigo: 'trava' });
    expect(gravacoes(b)).toEqual([]);
  });
  it('falha no meio: a transação é desfeita e o erro sobe', async () => {
    const b = banco({ pessoaRef: '1', falharEm: 'UPDATE dspd_bm.fato_apontamento' });
    await expect(eliminarPessoa(deps(b), { usuarioId: USUARIO, confirmar: true })).rejects.toThrow('falha simulada');
    expect(sqls(b)).toContain('ROLLBACK');
    expect(sqls(b)).not.toContain('COMMIT');
  });
  it('usa o esquema do ambiente quando não vem esquema nas dependências', async () => {
    const b = banco({ pessoaRef: null });
    await eliminarPessoa({ pool: b.pool, sal: SAL, agora: () => AGORA }, { usuarioId: USUARIO, confirmar: false });
    expect(sqls(b).some((t) => t.includes('dspd_bm.dim_responsavel'))).toBe(true);
  });
});

describe('config da eliminação', () => {
  const migrador = 'postgres://dspd_migrador:migrador_dev@127.0.0.1:5432/metricas';
  it('exige o banco do migrador e o sal (32 caracteres ou mais); a mensagem cita só nomes', () => {
    expect(carregarConfigEliminacaoPessoa({ PG_MIGRADOR_URL: migrador, PESSOA_ELIMINADA_SAL: SAL })).toMatchObject({ PG_MIGRADOR_URL: migrador, PESSOA_ELIMINADA_SAL: SAL, DSPD_SCHEMA_PREFIXO: '' });
    expect(() => carregarConfigEliminacaoPessoa({ PG_MIGRADOR_URL: migrador })).toThrow(/^Configuração inválida \(variáveis: PESSOA_ELIMINADA_SAL\)$/);
    expect(() => carregarConfigEliminacaoPessoa({ PG_MIGRADOR_URL: migrador, PESSOA_ELIMINADA_SAL: 'curto' })).toThrow(/PESSOA_ELIMINADA_SAL/);
    expect(() => carregarConfigEliminacaoPessoa({ PESSOA_ELIMINADA_SAL: SAL })).toThrow(/^Configuração inválida \(variáveis: PG_MIGRADOR_URL\)$/);
    expect(() => carregarConfigEliminacaoPessoa({ PG_MIGRADOR_URL: 'senha-secreta', PESSOA_ELIMINADA_SAL: SAL })).not.toThrow(/senha-secreta/);
  });
});
