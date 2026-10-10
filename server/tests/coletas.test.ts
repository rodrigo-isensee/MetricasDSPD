import { estadoColetaSchema, paginaColetasSchema } from '@metricas-dspd/contratos';
import { DummyDriver, Kysely, MysqlAdapter, MysqlIntrospector, MysqlQueryCompiler, type CompiledQuery, type DatabaseConnection, type QueryResult } from 'kysely';
import { describe, expect, it } from 'vitest';
import { agregarContagens, classificarErro, eventoDeLinhas, type LinhaColeta } from '../src/coletas/eventos.js';
import { lerEventos, lerVersoes } from '../src/coletas/repositorio.js';
import { estadoColeta, historicoColetas } from '../src/coletas/servico.js';

/** Banco falso: devolve as linhas da fila, na ordem das consultas, e registra o SQL compilado. */
function bancoFalso(respostas: unknown[][]) {
  const consultas: CompiledQuery[] = [];
  const conexao: DatabaseConnection = {
    async executeQuery<R>(q: CompiledQuery): Promise<QueryResult<R>> {
      consultas.push(q);
      return { rows: (respostas.shift() ?? []) as R[] };
    },
    // eslint-disable-next-line require-yield
    async *streamQuery() { throw new Error('sem stream'); },
  };
  const driver = new (class extends DummyDriver { override async acquireConnection() { return conexao; } })();
  const db = new Kysely<unknown>({
    dialect: { createAdapter: () => new MysqlAdapter(), createDriver: () => driver,
      createIntrospector: (k) => new MysqlIntrospector(k), createQueryCompiler: () => new MysqlQueryCompiler() },
  });
  return { db, consultas };
}

const d = (iso: string): Date => new Date(iso);
const linha = (status: LinhaColeta['status'], erro: string | null = null): LinhaColeta => ({
  coletaId: 7, iniciadoEm: d('2026-10-09T09:00:00Z'), finalizadoEm: d('2026-10-09T09:01:00Z'), status, erroResumo: erro,
});

describe('classificarErro: só categoria, nunca o texto', () => {
  it('categorias conhecidas, desconhecidas e nulo', () => {
    expect(classificarErro('tempo-esgotado: GET https://x?apikey=SEGREDO')).toBe('tempo-esgotado');
    expect(classificarErro('SELECT * FROM t -- senha=1')).toBe('desconhecido');
    expect(classificarErro(null)).toBe('desconhecido');
  });
});

describe('eventoDeLinhas', () => {
  const cont = [
    { coletaId: 7, entidade: 'card', lidos: '10', inseridos: '3', jaExistentes: '7' },
    { coletaId: 7, entidade: 'arquivado_preservado', lidos: 5, inseridos: 0, jaExistentes: 0 },
    { coletaId: 7, entidade: 'excluido_preservado', lidos: 2, inseridos: 0, jaExistentes: 0 },
  ];
  it('sucesso, parcial e falha', () => {
    const ok = eventoDeLinhas('bm', linha('sucesso'), cont);
    expect(ok).toMatchObject({ id: 'bm-7', inicio: '2026-10-09T06:00:00-03:00', fim: '2026-10-09T06:01:00-03:00', duracaoMs: 60000,
      resultado: 'ok', tipoErro: null, efeito: 'aplicada',
      contagens: { lidos: 10, novos: 3, atualizados: 7, arquivadosPreservados: 5, excluidosPreservados: 2 } });
    expect(eventoDeLinhas('ac', linha('parcial', 'dados-invalidos: x'), cont)).toMatchObject({ resultado: 'parcial', tipoErro: 'dados-invalidos', efeito: 'parcial-aplicada' });
    expect(eventoDeLinhas('bm', linha('falha', 'boom'), cont)).toMatchObject({ resultado: 'falha', tipoErro: 'desconhecido', efeito: 'anteriores-mantidos', contagens: null });
    expect(agregarContagens([])).toEqual({ lidos: 0, novos: 0, atualizados: 0, arquivadosPreservados: 0, excluidosPreservados: 0 });
  });
});

const rowsColeta = [
  { coleta_id: '2', iniciado_em: d('2026-10-09T09:00:00Z'), finalizado_em: d('2026-10-09T09:01:00Z'), status: 'falha', erro_resumo: 'tempo-esgotado: x' },
  { coleta_id: '1', iniciado_em: d('2026-10-08T09:00:00Z'), finalizado_em: d('2026-10-08T09:01:00Z'), status: 'sucesso', erro_resumo: null },
];
const rowsContagem = [{ coleta_id: '1', entidade: 'card', lidos: '4', inseridos: '1', ja_existentes: '3' }];

describe('repositório e serviço (SQL compilado, sem MySQL)', () => {
  it('lerEventos usa só o schema da fonte, sem valores interpolados', async () => {
    const { db, consultas } = bancoFalso([rowsColeta, rowsContagem]);
    const ev = await lerEventos(db, 'acelerato');
    expect(ev.map((e) => e.id)).toEqual(['ac-2', 'ac-1']);
    expect(ev[1]?.contagens?.lidos).toBe(4);
    expect(ev[0]?.contagens).toBeNull();
    for (const q of consultas) { expect(q.sql).toContain('dspd_ac.'); expect(q.sql).not.toContain('dspd_bm'); expect(q.parameters).toEqual([]); }
  });
  it('lerVersoes agrupa métricas, ignora ids desconhecidos e parametriza o domínio', async () => {
    const { db, consultas } = bancoFalso([[
      { versao_id: '1', vigente_desde: d('2026-03-02'), descricao: 'a', metrica_id: 'O7' },
      { versao_id: '1', vigente_desde: d('2026-03-02'), descricao: 'a', metrica_id: 'O9' },
      { versao_id: '1', vigente_desde: d('2026-03-02'), descricao: 'a', metrica_id: 'XX' },
      { versao_id: '2', vigente_desde: d('2026-06-01'), descricao: 'b', metrica_id: null },
    ]]);
    expect(await lerVersoes(db, 'businessmap')).toEqual([
      { id: '1', data: '2026-03-02', descricao: 'a', afeta: ['O7', 'O9'] },
      { id: '2', data: '2026-06-01', descricao: 'b', afeta: [] },
    ]);
    expect(consultas[0]?.parameters).toEqual(['businessmap']);
  });
  it('estadoColeta e historicoColetas devolvem DTOs válidos, uma fonte por vez', async () => {
    const a = bancoFalso([rowsColeta, rowsContagem, []]);
    const e = estadoColetaSchema.parse(await estadoColeta(a.db, 'businessmap', d('2026-10-09T21:00:00Z')));
    expect(e).toMatchObject({ dominio: 'businessmap', selo: 'falha' });
    expect(e.ultimaOk?.id).toBe('bm-1');
    const b = bancoFalso([rowsColeta, rowsContagem]);
    const p = paginaColetasSchema.parse(await historicoColetas(b.db, 'businessmap', 1));
    expect(p).toMatchObject({ total: 2, pagina: 1 });
  });
});
