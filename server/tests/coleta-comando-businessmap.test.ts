import { afterEach, describe, expect, it } from 'vitest';
import { analisarArgumentos, etapaReferencia, executarColeta, type DepsComando } from '../src/modulos/businessmap/coleta-comando.js';
import { ErroColetaBm } from '../src/modulos/businessmap/coleta.js';
import { lerConferencia } from '../src/modulos/businessmap/conferencia.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarClienteHttp } from '../src/plataforma/http.js';
import { bancoFalso, subirServidorBm, type Cenario, type OpcoesBanco, type ServidorBm } from './businessmap-coleta-duble.js';
import { criarDublePg, type Chamada, type Resposta } from './duble-pg.js';

// F3 do plano 052: o comando manual. Servidor falso (nenhuma chamada ao BusinessMap real) e bancos falsos por papel.
const S = montarEsquemas('');
const AGORA = new Date('2026-11-02T12:00:00Z');
const conf = lerConferencia();
const abertos: ServidorBm[] = [];
afterEach(async () => {
  for (const s of abertos.splice(0)) await s.fechar();
});

describe('analisarArgumentos', () => {
  it('modo, início da carga e motivo global', () => {
    expect(analisarArgumentos(['incremental'])).toEqual({ modo: 'incremental' });
    expect(analisarArgumentos(['carga-inicial'])).toEqual({ modo: 'carga-inicial' });
    expect(analisarArgumentos(['carga-inicial', '--inicio=2024-11-02', '--motivo=processo'])).toEqual({ modo: 'carga-inicial', inicio: '2024-11-02', motivo: 'processo' });
  });

  it('motivo por chave (A2 do review da F2): `tabela:chave=motivo`, repetível', () => {
    const a = analisarArgumentos(['incremental', '--motivo-chave=ref_coluna:25|2532=processo', '--motivo-chave=ref_tipo_card:7=correcao']);
    expect(a.motivo).toEqual(new Map([['ref_coluna 25|2532', 'processo'], ['ref_tipo_card 7', 'correcao']]));
  });

  it.each([
    [[]], [['outro']], [['incremental', '--inicio=2024-11-02']], [['carga-inicial', '--inicio=2024-13-45']], [['carga-inicial', '--inicio=ontem']],
    [['carga-inicial', '--inicio=2024-11-02', '--inicio=2024-11-03']], [['incremental', '--motivo=talvez']], [['incremental', '--motivo=processo', '--motivo=correcao']],
    [['incremental', '--motivo-chave=ref_outra:1=processo']], [['incremental', '--motivo-chave=ref_coluna:1=talvez']], [['incremental', '--tudo']],
    [['incremental', '--motivo=processo', '--motivo-chave=ref_coluna:1=correcao']],
  ])('recusa %j com a linha de uso, sem eco do valor', (argv) => {
    expect(() => analisarArgumentos(argv)).toThrow(ErroColetaBm);
    try {
      analisarArgumentos(argv);
    } catch (e) {
      expect((e as ErroColetaBm).codigo).toBe('uso');
      expect((e as Error).message).toContain('uso: bm:coleta');
      expect((e as Error).message).not.toContain(argv.slice(1).join(' ') || '\0');
    }
  });
});

const estruturaDoQuadro35 = {
  data: {
    columns: {
      '3001': { name: 'Fazendo', section: 3, flow_type: 1, parent_column_id: 0, workflow_id: 300, limit: 0 },
      '3002': { name: 'Feito', section: 4, flow_type: 1, parent_column_id: 0, workflow_id: 300, limit: 0 },
    },
    child_columns: {},
    workflows: { '300': { name: 'WF', top_columns: [3001, 3002], bottom_columns: [3001, 3002] } },
  },
};
const corposRef = {
  '/boards/35/currentStructure': estruturaDoQuadro35,
  '/boards/35/workflows': { data: [{ workflow_id: 300, name: 'Projetos', type: 0 }] },
  '/cardTypes': { data: [{ type_id: 1, name: 'Story' }] },
};
const cenario = (extra: Partial<Cenario> = {}): Cenario => ({
  cards: { '35|active': [{ card_id: 1, title: 'Card 1', owner_user_id: 5, last_modified: '2026-10-30T10:00:00Z' }] },
  porPagina: 100, users: { '5': { user_id: 5, realname: 'NOME-MARCADOR', email: 'pessoa@exemplo.com' } }, status: {}, corpos: corposRef, ...extra,
});

/** Banco do papel de referência: sem vigências abertas; falha se `falharEm` aparecer no SQL. */
const bancoRef = (vigentes: Record<string, unknown[]> = {}, falharEm?: string) =>
  criarDublePg((c: Chamada): Resposta => {
    if (falharEm !== undefined && c.texto.includes(falharEm)) return new Error('falha simulada: Fazendo e Feito não podem aparecer na saída');
    const t = /FROM \S*\.(ref_\w+) WHERE vigente_ate IS NULL/.exec(c.texto)?.[1];
    if (t !== undefined) return (vigentes[t] ?? []) as unknown[];
    if (/ref_versao_criterio WHERE/.test(c.texto)) return [];
    if (/INSERT INTO \S*ref_versao_criterio \(/.test(c.texto)) return [{ versao_id: '7' }];
    return [];
  });

async function montar(c: Cenario, banco: OpcoesBanco = {}, ref = bancoRef(), quadros = [35]) {
  const servidor = await subirServidorBm(c);
  abertos.push(servidor);
  const coletor = bancoFalso(banco);
  const cliente = criarClienteHttp({ urlBase: servidor.url, apikey: 'chave-f3-de-teste-0123456789', limitePorMinuto: 1000, timeoutMs: 2000 }, { dormir: () => Promise.resolve() });
  const deps: DepsComando = { cliente, poolColetor: coletor.pool, poolRef: ref.pool, conf, quadros, hostBase: 'bm.exemplo.test', agora: () => AGORA, S };
  return { servidor, coletor, ref, deps };
}
const comandos = (cs: Chamada[]): string[] => cs.map((c) => c.texto).filter((t) => /^(BEGIN|COMMIT|ROLLBACK)$/.test(t));
const insertsRef = (cs: Chamada[]): Chamada[] => cs.filter((c) => /^INSERT INTO dspd_bm\.ref_/.test(c.texto));

describe('executarColeta: trava, referência em transação do papel de referência, cards', () => {
  it('carga inicial completa: referência numa transação do dspd_ref; o dspd_coletor só escreve a contagem; cards no staging', async () => {
    const m = await montar(cenario());
    const r = await executarColeta(m.deps, { modo: 'carga-inicial' });
    expect(r).toMatchObject({ estado: 'sucesso', modo: 'carga_inicial', inicioCarga: '2025-11-02' });
    expect(comandos(m.ref.chamadas)).toEqual(['BEGIN', 'COMMIT']);
    expect(insertsRef(m.ref.chamadas).map((c) => c.texto.split(' ')[2])).toEqual(['dspd_bm.ref_quadro', 'dspd_bm.ref_workflow', 'dspd_bm.ref_coluna', 'dspd_bm.ref_coluna', 'dspd_bm.ref_tipo_card']);
    expect(insertsRef(m.coletor.chamadas)).toEqual([]);
    expect(m.coletor.chamadas.some((c) => /ref_versao_criterio/.test(c.texto))).toBe(false);
    expect(m.coletor.estado.contagens.find((c) => c.entidade === 'folha_sem_conferencia')).toMatchObject({ lidos: 0 });
    expect(m.coletor.chamadas.some((c) => c.texto.includes('pg_try_advisory_lock'))).toBe(true);
    expect(m.coletor.estado.stg.map((s) => s.idOrigem)).toEqual(['1']);
    expect(r.referencia).toMatchObject({ fechadas: 0, marca: false, semConferencia: 0 });
    expect(m.servidor.pedidos.every((p) => p.metodo === 'GET')).toBe(true);
    expect(m.servidor.pedidos.slice(0, 3).map((p) => p.caminho)).toEqual(['/boards/35/currentStructure', '/boards/35/workflows', '/cardTypes']);
  });

  it('a estrutura lida não é logada nem sai no resultado: nenhum nome de coluna na saída', async () => {
    const m = await montar(cenario());
    const r = await executarColeta(m.deps, { modo: 'carga-inicial' });
    const saida = JSON.stringify(r);
    for (const n of ['Fazendo', 'Feito', 'Projetos', 'currentStructure']) expect(saida).not.toContain(n);
    expect(m.coletor.estado.falhas).toEqual([]);
  });

  it('A2 da segurança: se um INSERT da referência falha, a transação do dspd_ref é desfeita (ROLLBACK, sem COMMIT) e os cards seguem, com só o código da falha', async () => {
    const m = await montar(cenario(), {}, bancoRef({}, 'INSERT INTO dspd_bm.ref_coluna'));
    const r = await executarColeta(m.deps, { modo: 'carga-inicial' });
    expect(comandos(m.ref.chamadas)).toEqual(['BEGIN', 'ROLLBACK']);
    expect(r).toMatchObject({ estado: 'parcial', referencia: null, falhas: { 'erro-interno': 1 } });
    expect(m.coletor.estado.falhas).toEqual([{ entidade: 'referencia', idOrigem: null, erro: 'erro-interno' }]);
    expect(m.coletor.estado.contagens.some((c) => c.entidade === 'folha_sem_conferencia')).toBe(false);
    expect(m.coletor.estado.stg).toHaveLength(1);
    const saida = JSON.stringify([r, m.coletor.estado]);
    expect(saida).not.toMatch(/Fazendo|Feito|falha simulada/);
  });

  it('mudança de significado: sem motivo nada é gravado; --motivo vale para todas; --motivo-chave vale só para a chave dita', async () => {
    const vigentes = { ref_tipo_card: [{ tipo_id: '1', nome: 'Story', eh_item: true, categoria: 'bug_interno', vigente_de: '2025-11-02', vigente_ate: null, motivo: null }] };
    const sem = await montar(cenario(), {}, bancoRef(vigentes));
    const rSem = await executarColeta(sem.deps, { modo: 'carga-inicial' });
    expect(rSem.falhas).toEqual({ 'referencia-motivo': 1 });
    // A1 do review da F3: a chave pendente sai no resultado, no formato do --motivo-chave, e a linha de volta é aceita pelo analisador
    expect(rSem.motivosPendentes).toEqual(['ref_tipo_card:1']);
    expect(analisarArgumentos(['carga-inicial', `--motivo-chave=${rSem.motivosPendentes[0]}=processo`]).motivo).toEqual(new Map([['ref_tipo_card 1', 'processo']]));
    expect(JSON.stringify(rSem)).not.toMatch(/Story|NOME-MARCADOR|pessoa@exemplo.com/);
    expect(insertsRef(sem.ref.chamadas)).toEqual([]);
    expect(comandos(sem.ref.chamadas)).toEqual(['BEGIN', 'ROLLBACK']);

    const global = await montar(cenario(), {}, bancoRef(vigentes));
    const rg = await executarColeta(global.deps, { modo: 'carga-inicial', motivo: 'correcao' });
    expect(rg.falhas).toEqual({});
    expect(rg.motivosPendentes).toEqual([]);
    expect(rg.referencia).toMatchObject({ fechadas: 1, marca: false });

    const chave = await montar(cenario(), {}, bancoRef(vigentes));
    const rc = await executarColeta(chave.deps, { modo: 'carga-inicial', motivo: new Map([['ref_tipo_card 1', 'processo']]) });
    expect(rc.falhas).toEqual({});
    expect(rc.referencia).toMatchObject({ fechadas: 1, marca: true });

    const outra = await montar(cenario(), {}, bancoRef(vigentes));
    const ro = await executarColeta(outra.deps, { modo: 'carga-inicial', motivo: new Map([['ref_tipo_card 99', 'processo']]) });
    expect(ro.falhas).toEqual({ 'referencia-motivo': 1 });
    expect(ro.motivosPendentes).toEqual(['ref_tipo_card:1']);
  });

  it('a etapa devolve o resultado e conta as folhas sem conferência só pelo dspd_coletor', async () => {
    const m = await montar(cenario());
    const r = await etapaReferencia(m.deps, '2026-11-02', '2025-11-02', undefined)(77);
    expect(r.inseridas).toBeGreaterThan(0);
    expect(comandos(m.ref.chamadas)).toEqual(['BEGIN', 'COMMIT']);
  });

  it('trava da fonte ocupada: recusa sem abrir coleta nem chamar o BusinessMap', async () => {
    const m = await montar(cenario(), { travaOcupada: true });
    await expect(executarColeta(m.deps, { modo: 'carga-inicial' })).rejects.toMatchObject({ name: 'ErroColetaBm', codigo: 'trava' });
    expect(m.coletor.estado.aberta).toBeUndefined();
    expect(m.servidor.pedidos).toEqual([]);
  });

  it('sem quadros configurados: recusa antes de qualquer coisa', async () => {
    const m = await montar(cenario(), {}, bancoRef(), []);
    await expect(executarColeta(m.deps, { modo: 'incremental' })).rejects.toMatchObject({ codigo: 'configuracao' });
    expect(m.coletor.chamadas).toEqual([]);
    expect(m.servidor.pedidos).toEqual([]);
  });

  it('incremental com marca: usa a data de hoje na referência, o tamanho de página e o esquema configurados', async () => {
    const m = await montar(cenario(), { marca: new Date('2026-11-01T06:00:00Z') });
    m.deps.paginaTamanho = 50;
    delete (m.deps as { S?: unknown }).S;
    const r = await executarColeta(m.deps, { modo: 'incremental', motivo: 'processo' });
    expect(r.estado).toBe('sucesso');
    expect(m.servidor.pedidos.find((p) => p.caminho === '/cards')!.consulta.get('per_page')).toBe('50');
  });
});
