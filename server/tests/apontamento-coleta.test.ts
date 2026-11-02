import { afterEach, describe, expect, it } from 'vitest';
import {
  coletarApontamentos, diaCivil, ehDomingo, menosDias, menosMeses, type DepsApontamento, type ModoApontamento,
} from '../src/modulos/businessmap/apontamento/coleta.js';
import { analisarArgumentosApontamento, executarApontamento } from '../src/modulos/businessmap/apontamento/comando.js';
import type { EntradaClassificacao, SaidaClassificacao } from '../src/modulos/businessmap/apontamento/registro.js';
import { hmacUsuario, usuariosSuprimidos } from '../src/modulos/businessmap/apontamento/supressao.js';
import { ErroColetaBm } from '../src/modulos/businessmap/coleta.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarClienteHttp } from '../src/plataforma/http.js';
import { cenarioWorklogVazio, registroWorklog, subirServidorWorklog, type CenarioWorklog, type Registro, type ServidorWorklog } from './apontamento-duble.js';
import { bancoApontamento, type FatoFalso, type OpcoesBancoAp } from './apontamento-banco-falso.js';
import { criarDublePg } from './duble-pg.js';

// Pedido 059, A3 (CT-36, 37, 47, 71 a 76, 79, 80, 85; CA-AP-2, 3, 8, 9, 10): orquestração da coleta do worklog contra o servidor falso
// (127.0.0.1, nenhuma chamada real) e um banco falso com estado. O SQL de verdade está em `apontamento.pg.test.ts`.
const S = montarEsquemas('');
const SAL = 'sal-de-teste-com-pelo-menos-32-bytes!!';
const QUARTA = new Date('2026-11-04T15:00:00Z'); // civil 2026-11-04
const DOMINGO = new Date('2026-11-02T01:30:00Z'); // civil 2026-11-01 (domingo) em Sao_Paulo, segunda em UTC
const MARCA = new Date('2026-11-03T10:00:00Z');
const servidores: ServidorWorklog[] = [];
afterEach(async () => { for (const s of servidores.splice(0)) await s.fechar(); });

const cards = (n: number, base = 9_100_000_000): { card_id: string; type_id: string | null }[] =>
  Array.from({ length: n }, (_, i) => ({ card_id: String(base + i), type_id: i % 2 === 0 ? '7' : null }));
const fato = (i: number, extra: Partial<FatoFalso> = {}): FatoFalso => ({
  logged_time_id: String(9_500_000_000 + i), card_id: '9100000000', parent_card_id: null, data_apontamento: '2026-10-20', registro_sha256: 'antigo', pessoa_ref: null,
  versoes: 1, excluido_em: null, flags_qualidade: 0, subgrupo_codigo: 'reuniao', iniciativa_card_id: null, ...extra,
});
const registroDoFato = (f: FatoFalso, extra: Registro = {}): Registro => registroWorklog({ logged_time_id: Number(f.logged_time_id), card_id: Number(f.card_id), ...extra });

const classificadorFalso = (chamadas: EntradaClassificacao[] = []) => (e: EntradaClassificacao): SaidaClassificacao => {
  chamadas.push(e);
  return { subgrupo: 'reuniao', flags: e.comentario === null ? 1 : 0, qtdPalavras: e.comentario === null ? 0 : e.comentario.split(/\s+/).length, versaoDicionario: 'dic-1' };
};

async function montar(opcoes: OpcoesBancoAp = {}, cenario: Partial<CenarioWorklog> = {}, extra: Partial<DepsApontamento> = {}, agora = QUARTA) {
  const servidor = await subirServidorWorklog({ ...cenarioWorklogVazio(), ...cenario });
  servidores.push(servidor);
  const banco = bancoApontamento({ escopo: cards(1), ...opcoes });
  const cliente = criarClienteHttp({ urlBase: servidor.url, apikey: 'chave-do-teste-0123456789', limitePorMinuto: 100_000, timeoutMs: 2000 }, { dormir: () => Promise.resolve() });
  const chamadasClassificador: EntradaClassificacao[] = [];
  const deps: DepsApontamento = {
    cliente, pool: banco.pool, S, classificar: classificadorFalso(chamadasClassificador), sal: SAL, hostBase: 'bm.exemplo.test', agora: () => agora, ...extra,
  };
  return { servidor, banco, deps, chamadasClassificador, e: banco.estado };
}
const incremental: ModoApontamento = { tipo: 'incremental' };
const carga = (inicio?: string): ModoApontamento => ({ tipo: 'carga_inicial', inicio });
const loggedTime = (s: ServidorWorklog) => s.pedidos.filter((p) => p.caminho === '/loggedTime');

describe('datas civis (America/Sao_Paulo)', () => {
  it('diaCivil usa o fuso de São Paulo, não UTC; domingo e aritmética de dias e meses', () => {
    expect(diaCivil(DOMINGO)).toBe('2026-11-01');
    expect(ehDomingo('2026-11-01')).toBe(true);
    expect(ehDomingo('2026-11-02')).toBe(false);
    expect(menosDias('2026-11-04', 90)).toBe('2026-08-06');
    expect(menosMeses('2026-11-04', 12)).toBe('2025-11-04');
    expect(menosMeses('2026-03-31', 1)).toBe('2026-03-03');
  });
});

describe('guardas de partida', () => {
  it('sal ausente ou curto: o coletor falha antes de tocar o banco (não há recoleta sem supressão)', async () => {
    for (const sal of ['', 'curto', 'x'.repeat(31)]) {
      const m = await montar({}, {}, { sal });
      await expect(coletarApontamentos(m.deps, carga())).rejects.toMatchObject({ codigo: 'configuracao' });
      expect(m.banco.chamadas).toHaveLength(0);
      expect(m.servidor.pedidos).toHaveLength(0);
    }
    const ok = await montar({}, {}, { sal: 'x'.repeat(32) });
    await expect(coletarApontamentos(ok.deps, carga())).resolves.toMatchObject({ estado: 'sucesso' });
  });
  it('a coleta de cards mais recente falhou: não roda (CT-36); sem marca d\'água, o incremental não roda', async () => {
    const m = await montar({ cardsStatus: 'falha', marca: MARCA });
    await expect(coletarApontamentos(m.deps, incremental)).rejects.toMatchObject({ codigo: 'cards-falhou' });
    expect(m.servidor.pedidos).toHaveLength(0);
    const sem = await montar({ marca: null });
    await expect(coletarApontamentos(sem.deps, incremental)).rejects.toMatchObject({ codigo: 'sem-marca' });
    expect(sem.e.abertas).toHaveLength(0);
    const parcial = await montar({ cardsStatus: 'parcial', marca: MARCA });
    await expect(coletarApontamentos(parcial.deps, incremental)).resolves.toMatchObject({ estado: 'sucesso' });
  });
  it('execução anterior interrompida é fechada como falha, sem apagar nada', async () => {
    const m = await montar({ interrompidas: ['5', '6'] });
    await coletarApontamentos(m.deps, carga());
    expect(m.e.fechamentos.slice(0, 2)).toEqual([
      { coletaId: '5', status: 'falha', erro: 'desconhecido: execução anterior interrompida' },
      { coletaId: '6', status: 'falha', erro: 'desconhecido: execução anterior interrompida' },
    ]);
  });
});

describe('carga inicial: manual, por lote de cards, retomável (CT-80)', () => {
  it('lê from_date = hoje − 12 meses sem logged_from, grava staging e fato com pessoa, e avança a marca d\'água', async () => {
    const regs = [registroWorklog({ logged_time_id: 9_000_000_001 }), registroWorklog({ logged_time_id: 9_000_000_002, user_id: 9_400_000_002 })];
    const m = await montar({}, { registros: regs, users: { '9400000001': { user_id: 9_400_000_001, realname: 'PESSOA-FICTICIA-A', email: 'a@exemplo.invalido' }, '9400000002': { user_id: 9_400_000_002, realname: 'PESSOA-FICTICIA-B' } } });
    const r = await coletarApontamentos(m.deps, carga());
    expect(r).toMatchObject({ estado: 'sucesso', modo: 'carga_inicial', desde: '2025-11-04', retomada: false, lidos: 2, inseridos: 2, jaExistentes: 0, invalidos: 0, excluidos: 0, lotesConcluidos: 1, falhas: {} });
    expect(r.usuarios).toEqual({ pedidos: 2, resolvidos: 2, naoResolvidos: 0 });
    const lt = loggedTime(m.servidor);
    expect(lt).toHaveLength(1);
    expect(lt[0]!.consulta.get('from_date')).toBe('2025-11-04');
    expect(lt[0]!.consulta.has('logged_from')).toBe(false);
    expect(lt[0]!.consulta.get('per_page')).toBe('1000');
    expect(lt[0]!.consulta.get('include_logged_time_for_subtasks')).toBe('1');
    expect([...m.e.stg.keys()]).toHaveLength(2);
    expect([...m.e.fatos.values()].map((f) => f.pessoa_ref).sort()).toEqual([1, 2]);
    expect(m.e.marca).toEqual({ coletaId: 77, ate: QUARTA });
    expect(m.e.fechamentos.at(-1)).toMatchObject({ status: 'sucesso', erro: null });
    expect(m.e.abertas[0]!.parametros).toMatchObject({ tipo: 'carga_inicial', inicio_carga: '2025-11-04', lotes_concluidos: 0 });
    expect(m.e.contagens.map((c) => c.entidade)).toEqual(['apontamento', 'apontamento_exclusao', 'apontamento_reaparecido', 'apontamento_usuario']);
    expect(m.e.hierarquiaChamadas).toBe(1);
  });
  it('--inicio muda o from_date; 450 cards viram 3 lotes de 200, 200 e 50, com checkpoint a cada lote concluído', async () => {
    const m = await montar({ escopo: cards(450) }, { registros: [registroWorklog({ logged_time_id: 9_000_000_003, card_id: 9_100_000_300 })] });
    const r = await coletarApontamentos(m.deps, carga('2025-06-01'));
    expect(r).toMatchObject({ desde: '2025-06-01', lotesConcluidos: 3, lidos: 1 });
    expect(loggedTime(m.servidor).map((p) => p.consulta.get('card_ids')!.split(',').length)).toEqual([200, 200, 50]);
    expect(m.e.checkpoints).toEqual([1, 2, 3]);
  });
  it('retomada: recomeça do primeiro lote não concluído, com o início e a hora da primeira tentativa', async () => {
    const parametros = { tipo: 'carga_inicial', inicio_carga: '2025-09-01', iniciada_em: '2026-11-03T08:00:00Z', lotes_concluidos: 2 };
    const m = await montar({ escopo: cards(450), ultimaCarga: { status: 'parcial', parametros } });
    const r = await coletarApontamentos(m.deps, carga());
    expect(r).toMatchObject({ retomada: true, desde: '2025-09-01', lotesConcluidos: 3 });
    expect(loggedTime(m.servidor).map((p) => p.consulta.get('card_ids')!.split(',').length)).toEqual([50]);
    expect(m.e.checkpoints).toEqual([3]);
    expect(m.e.marca).toEqual({ coletaId: 77, ate: new Date('2026-11-03T08:00:00Z') });
    const mesmoInicio = await montar({ escopo: cards(5), ultimaCarga: { status: 'falha', parametros } });
    expect(await coletarApontamentos(mesmoInicio.deps, carga('2025-09-01'))).toMatchObject({ retomada: true });
  });
  it('não retoma carga concluída, de outro início ou com parâmetros ilegíveis', async () => {
    const parametros = { tipo: 'carga_inicial', inicio_carga: '2025-09-01', iniciada_em: '2026-11-03T08:00:00Z', lotes_concluidos: 1 };
    for (const [ultima, modo] of [
      [{ status: 'sucesso', parametros }, carga()], [{ status: 'parcial', parametros }, carga('2025-10-01')], [{ status: 'parcial', parametros: { tipo: 'carga_inicial' } }, carga()],
    ] as const) {
      const m = await montar({ escopo: cards(250), ultimaCarga: ultima });
      const r = await coletarApontamentos(m.deps, modo);
      expect(r.retomada).toBe(false);
      expect(r.lotesConcluidos).toBe(2);
      expect(loggedTime(m.servidor)).toHaveLength(2);
    }
  });
  it('o checkpoint só avança em lotes concluídos sem falha, em ordem: lote 2 falha, o 1 fica concluído e o 3 não avança', async () => {
    const m = await montar({ escopo: cards(450) }, { registros: [registroWorklog({ logged_time_id: 9_000_000_004 })], statusPorLote: (c) => (c.includes('9100000200') ? 404 : undefined) });
    const r = await coletarApontamentos(m.deps, carga());
    expect(r).toMatchObject({ estado: 'parcial', lotesConcluidos: 1, falhas: { http: 1 } });
    expect(m.e.checkpoints).toEqual([1]);
    expect(m.e.marca).toBeUndefined();
    expect(m.e.falhas).toEqual([{ entidade: 'apontamento', idOrigem: null, erro: 'http' }]);
  });
  it('o escopo vazio não chama a API e fecha com sucesso', async () => {
    const m = await montar({ escopo: [] });
    expect(await coletarApontamentos(m.deps, carga())).toMatchObject({ estado: 'sucesso', lidos: 0, lotesConcluidos: 0 });
    expect(m.servidor.pedidos).toHaveLength(0);
  });
  it('todos os lotes falham sem nenhum registro lido: a execução fecha como falha', async () => {
    const m = await montar({ escopo: cards(3) }, { statusPorLote: () => 404 });
    expect(await coletarApontamentos(m.deps, carga())).toMatchObject({ estado: 'falha', lidos: 0 });
    expect(m.e.fechamentos.at(-1)).toMatchObject({ status: 'falha' });
  });
});

describe('incremental: os novos e a varredura de presença (CT-36, CT-76)', () => {
  it('segunda a sábado: novos por logged_from = marca − 1 h e varredura curta por from_date = hoje − 90 dias, sem logged_from', async () => {
    const m = await montar({ marca: MARCA }, { registros: [registroWorklog({ logged_time_id: 9_000_000_010, logged_at: '2026-11-04T10:00:00Z' })] });
    const r = await coletarApontamentos(m.deps, incremental);
    expect(r).toMatchObject({ estado: 'sucesso', modo: 'incremental', desde: '2026-08-06', lidos: 2, inseridos: 1, jaExistentes: 1, lotesConcluidos: 0 });
    const lt = loggedTime(m.servidor);
    expect(lt).toHaveLength(2);
    expect(lt[0]!.consulta.get('logged_from')).toBe('2026-11-03T09:00:00Z');
    expect(lt[0]!.consulta.has('from_date')).toBe(false);
    expect(lt[1]!.consulta.get('from_date')).toBe('2026-08-06');
    expect(lt[1]!.consulta.has('logged_from')).toBe(false);
    expect(m.e.abertas[0]!.params[2]).toBe(3600);
    expect(m.e.abertas[0]!.params[1]).toEqual(MARCA);
    expect(m.e.checkpoints).toEqual([]);
    expect(m.e.marca).toEqual({ coletaId: 77, ate: QUARTA });
  });
  it('domingo (data civil de São Paulo): a varredura longa com from_date no início da carga (12 meses)', async () => {
    const m = await montar({ marca: MARCA }, {}, {}, DOMINGO);
    const r = await coletarApontamentos(m.deps, incremental);
    expect(r.desde).toBe('2025-11-01');
    expect(loggedTime(m.servidor).map((p) => p.consulta.get('from_date'))).toEqual([null, '2025-11-01']);
  });
  it('a mesma versão relida não duplica; edição vira versão nova e o fato acompanha (versoes + 1)', async () => {
    const reg = registroWorklog({ logged_time_id: 9_000_000_020 });
    const m = await montar({ marca: MARCA }, { registros: [reg] });
    expect(await coletarApontamentos(m.deps, incremental)).toMatchObject({ inseridos: 1, jaExistentes: 0 });
    expect(m.e.stg.size).toBe(1);
    const igual = await coletarApontamentos(m.deps, incremental);
    expect(igual).toMatchObject({ inseridos: 0, jaExistentes: 1 });
    expect(m.e.stg.size).toBe(1);
    m.servidor.cenario.registros[0] = { ...reg, time: 7200 };
    expect(await coletarApontamentos(m.deps, incremental)).toMatchObject({ inseridos: 1 });
    expect(m.e.stg.size).toBe(2);
    expect(m.e.fatos.get('9000000020')).toMatchObject({ versoes: 2 });
  });
  it('A2: a volta ao valor antigo é uma versão nova (A, B, A vira três linhas, fato A, versoes 3); A relido sobre A não grava (nunca dedup por hash em toda a história)', async () => {
    const a = registroWorklog({ logged_time_id: 9_000_000_021, time: 600 });
    const m = await montar({ marca: MARCA }, { registros: [a] });
    await coletarApontamentos(m.deps, incremental);
    m.servidor.cenario.registros[0] = { ...a, time: 1200 };
    expect(await coletarApontamentos(m.deps, incremental)).toMatchObject({ inseridos: 1 });
    m.servidor.cenario.registros[0] = { ...a, time: 600 };
    expect(await coletarApontamentos(m.deps, incremental)).toMatchObject({ inseridos: 1 });
    expect(m.e.stg.size).toBe(3);
    expect([...m.e.stg.values()].map((r) => [r.versao, r.segundos])).toEqual([[1, 600], [2, 1200], [3, 600]]);
    expect(m.e.fatos.get('9000000021')).toMatchObject({ versoes: 3 });
    expect(await coletarApontamentos(m.deps, incremental)).toMatchObject({ inseridos: 0, jaExistentes: 1 });
    expect(m.e.stg.size).toBe(3);
  });
  it('dois apontamentos iguais em data, card, pessoa e horas, com ids diferentes, contam ambos (nunca dedup por combinação)', async () => {
    const m = await montar({ marca: MARCA }, { registros: [registroWorklog({ logged_time_id: 9_000_000_030 }), registroWorklog({ logged_time_id: 9_000_000_031 })] });
    await coletarApontamentos(m.deps, incremental);
    expect(m.e.fatos.size).toBe(2);
  });
});

describe('exclusão por presença (CT-72, CT-73, CT-74, CT-75)', () => {
  const ativos = (n: number): FatoFalso[] => Array.from({ length: n }, (_, i) => fato(i));
  const doServidor = (fs: FatoFalso[]): Registro[] => fs.map((f) => registroDoFato(f));
  it('ausente de lote completo vira excluido_detectado (origem varredura, chave = data civil) e sai das somas; nada é apagado', async () => {
    const fs = ativos(5);
    const m = await montar({ marca: MARCA, fatos: fs }, { registros: doServidor(fs.slice(1)) });
    const r = await coletarApontamentos(m.deps, incremental);
    expect(r).toMatchObject({ estado: 'sucesso', excluidos: 1 });
    expect([...m.e.eventos.values()]).toEqual([{ id: '9500000000', tipo: 'excluido_detectado', chave: '2026-11-04', card: '9100000000' }]);
    expect(m.e.fatos.get('9500000000')!.excluido_em).toEqual(QUARTA);
    expect(m.e.fatos.size).toBe(5);
    expect(m.e.ativosPedidos[0]).toMatchObject({ desde: '2026-08-06', cards: ['9100000000'] });
  });
  it('duas execuções no mesmo dia com o mesmo apontamento ausente geram UM evento; no dia seguinte, outro só se o estado mudou', async () => {
    const fs = ativos(5);
    const m = await montar({ marca: MARCA, fatos: fs }, { registros: doServidor(fs.slice(1)) });
    await coletarApontamentos(m.deps, incremental);
    await coletarApontamentos(m.deps, incremental);
    expect(m.e.eventos.size).toBe(1);
  });
  it('guarda de massa: 20 de 100 gravam; 21 de 100 não gravam nenhum evento, registram exclusao_em_massa e a coleta fecha parcial', async () => {
    const fs = ativos(100);
    const vinte = await montar({ marca: MARCA, fatos: fs.map((f) => ({ ...f })) }, { registros: doServidor(fs.slice(20)) });
    expect(await coletarApontamentos(vinte.deps, incremental)).toMatchObject({ estado: 'sucesso', excluidos: 20 });
    const vinteUm = await montar({ marca: MARCA, fatos: fs.map((f) => ({ ...f })) }, { registros: doServidor(fs.slice(21)) });
    const r = await coletarApontamentos(vinteUm.deps, incremental);
    expect(r).toMatchObject({ estado: 'parcial', excluidos: 0, falhas: { exclusao_em_massa: 1 } });
    expect(vinteUm.e.eventos.size).toBe(0);
    expect([...vinteUm.e.fatos.values()].every((f) => f.excluido_em === null)).toBe(true);
    expect(vinteUm.e.falhas).toEqual([{ entidade: 'apontamento', idOrigem: null, erro: 'exclusao_em_massa' }]);
    expect(vinteUm.e.marca).toBeUndefined();
  });
  it('o limiar é parâmetro: com 50 por cento, 21 de 100 passam; 1 de 1 dispara a guarda; 0 ativos não divide por zero', async () => {
    const fs = ativos(100);
    const m = await montar({ marca: MARCA, fatos: fs }, { registros: doServidor(fs.slice(21)) }, { limiteMassaPercentual: 50 });
    expect(await coletarApontamentos(m.deps, incremental)).toMatchObject({ estado: 'sucesso', excluidos: 21 });
    const um = await montar({ marca: MARCA, fatos: [fato(1)] });
    expect(await coletarApontamentos(um.deps, incremental)).toMatchObject({ estado: 'falha', excluidos: 0, falhas: { exclusao_em_massa: 1 } });
    const zero = await montar({ marca: MARCA, fatos: [] });
    expect(await coletarApontamentos(zero.deps, incremental)).toMatchObject({ estado: 'sucesso', excluidos: 0 });
  });
  it('lote incompleto nunca gera exclusão: 404 no lote, recusa com id inválido no lote e lote no teto', async () => {
    const f = fato(1);
    // a recusa não fecha parcial (A7), então só a falha de lote e o teto exigem estado diferente de sucesso
    for (const [cenario, parcial] of [
      [{ statusPorLote: () => 404 } as Partial<CenarioWorklog>, true],
      [{ registros: [registroWorklog({ logged_time_id: 'abc' })] }, false],
      [{ registros: Array.from({ length: 1000 }, () => registroWorklog()) }, true],
    ] as const) {
      const m = await montar({ marca: MARCA, fatos: [f, fato(2)] }, cenario);
      const r = await coletarApontamentos(m.deps, incremental);
      expect(r.excluidos, JSON.stringify(Object.keys(cenario))).toBe(0);
      if (parcial) expect(r.estado).not.toBe('sucesso');
      expect(m.e.eventos.size).toBe(0);
    }
  });
  it('erro fatal (401) interrompe: nada é excluído, a falha é só o código e a execução fecha parcial ou falha', async () => {
    const m = await montar({ marca: MARCA, fatos: [fato(1)] }, { status: { '/loggedTime': 401 } });
    const r = await coletarApontamentos(m.deps, incremental);
    expect(r).toMatchObject({ estado: 'falha', excluidos: 0, falhas: { autenticacao: 1 } });
    expect(m.e.falhas).toEqual([{ entidade: 'apontamento', idOrigem: null, erro: 'autenticacao' }]);
    expect(m.e.eventos.size).toBe(0);
  });
  it('subtarefa (card fora do escopo, pai no escopo): conta se o lote do pai é completo; não conta se o pai está num lote incompleto', async () => {
    const sub = fato(1, { card_id: '9999999991', parent_card_id: '9100000000' });
    const m = await montar({ marca: MARCA, fatos: [sub, fato(2), fato(3), fato(4), fato(5), fato(6)] }, { registros: [] });
    // 1 de 6 ausentes seria 16% (< 20%): os 6 estão ausentes e a guarda dispara; a regra de candidato é provada com 50%
    const r = await coletarApontamentos({ ...m.deps, limiteMassaPercentual: 100 }, incremental);
    expect(r.excluidos).toBe(6);
    expect(m.e.eventos.get('9500000001|excluido_detectado|2026-11-04')).toMatchObject({ card: '9999999991' });
    const incompleto = await montar({ marca: MARCA, fatos: [sub] }, { statusPorLote: () => 404 }, { limiteMassaPercentual: 100 });
    expect(await coletarApontamentos(incompleto.deps, incremental)).toMatchObject({ excluidos: 0 });
    // pai e card no escopo, os dois em lotes diferentes: só vale se os dois lotes forem completos
    const dois = await montar({ escopo: [{ card_id: '9100000000', type_id: null }, ...cards(200, 9_200_000_000).slice(0, 200)], marca: MARCA, fatos: [fato(1, { card_id: '9200000000', parent_card_id: '9100000000' })] },
      { statusPorLote: (c) => (c.includes('9100000000') ? 404 : undefined) }, { limiteMassaPercentual: 100 });
    expect(await coletarApontamentos(dois.deps, incremental)).toMatchObject({ excluidos: 0 });
  });
  it('reaparecido: o excluído que volta num lote gera o evento, volta às somas e os eventos antigos ficam; mesmo dia não duplica', async () => {
    const f = fato(1, { excluido_em: new Date('2026-11-01T00:00:00Z') });
    const m = await montar({ marca: MARCA, fatos: [f] }, { registros: [registroDoFato(f)] });
    const r = await coletarApontamentos(m.deps, incremental);
    expect(r).toMatchObject({ reaparecidos: 1, excluidos: 0 });
    expect([...m.e.eventos.values()]).toEqual([{ id: '9500000001', tipo: 'reaparecido', chave: '2026-11-04', card: '9100000000' }]);
    expect(m.e.fatos.get('9500000001')!.excluido_em).toBeNull();
    m.e.fatos.get('9500000001')!.excluido_em = new Date('2026-11-04T16:00:00Z');
    const outra = await coletarApontamentos(m.deps, incremental);
    expect(outra.reaparecidos).toBe(0);
    expect(m.e.eventos.size).toBe(1);
  });
});

describe('pessoa: supressão antes do /users (CT-85, CA-AP-10, CA-AP-3)', () => {
  const users = { '9400000001': { user_id: 9_400_000_001, realname: 'PESSOA-FICTICIA-A' }, '9400000002': { user_id: 9_400_000_002, realname: 'PESSOA-FICTICIA-B' } };
  it('o user_id eliminado não é pedido a /users, não vira pessoa_ref e o apontamento fica no agregado do time; o outro segue resolvido', async () => {
    const regs = [registroWorklog({ logged_time_id: 9_000_000_040, user_id: 9_400_000_001 }), registroWorklog({ logged_time_id: 9_000_000_041, user_id: 9_400_000_002 })];
    const m = await montar({ suprimidos: [hmacUsuario(SAL, '9400000001')] }, { registros: regs, users });
    const r = await coletarApontamentos(m.deps, carga());
    expect(m.servidor.usuariosPedidos.has('9400000001')).toBe(false);
    expect(m.servidor.usuariosPedidos.get('9400000002')).toBe(1);
    expect(m.e.dim.has('9400000001')).toBe(false);
    expect(m.e.fatos.get('9000000040')!.pessoa_ref).toBeNull();
    expect(m.e.fatos.get('9000000041')!.pessoa_ref).toBe(1);
    expect(r.usuarios).toEqual({ pedidos: 1, resolvidos: 1, naoResolvidos: 0 });
    expect(m.e.sqlSuprimido.join('\n')).not.toContain('9400000001');
  });
  it('todos eliminados: /users nunca é chamado; sal trocado ou id de mesmo prefixo não casam', async () => {
    const regs = [registroWorklog({ logged_time_id: 9_000_000_042, user_id: 9_400_000_001 })];
    const todos = await montar({ suprimidos: [hmacUsuario(SAL, '9400000001')] }, { registros: regs, users });
    await coletarApontamentos(todos.deps, carga());
    expect(todos.servidor.pedidos.some((p) => p.caminho === '/users')).toBe(false);
    for (const hash of [hmacUsuario('outro-sal-de-teste-com-32-bytes-no-minimo!', '9400000001'), hmacUsuario(SAL, '940000000')]) {
      const m = await montar({ suprimidos: [hash] }, { registros: regs, users });
      await coletarApontamentos(m.deps, carga());
      expect(m.servidor.usuariosPedidos.get('9400000001')).toBe(1);
    }
  });
  it('apontamento sem user_id não pede /users e fica sem pessoa', async () => {
    const m = await montar({}, { registros: [registroWorklog({ logged_time_id: 9_000_000_043, user_id: null })] });
    await coletarApontamentos(m.deps, carga());
    expect(m.servidor.pedidos.some((p) => p.caminho === '/users')).toBe(false);
    expect(m.e.fatos.get('9000000043')!.pessoa_ref).toBeNull();
  });
  it('falha de /users: vai a ctl_coleta_falha com o logged_time_id (nunca o user_id) e não derruba a coleta', async () => {
    const regs = [registroWorklog({ logged_time_id: 9_000_000_044, user_id: 9_400_000_001 }), registroWorklog({ logged_time_id: 9_000_000_045, user_id: null })];
    const m = await montar({}, { registros: regs, users, status: { '/users': 404 } });
    const r = await coletarApontamentos(m.deps, carga());
    expect(r.estado).toBe('sucesso');
    expect(m.e.falhas).toEqual([{ entidade: 'apontamento_usuario', idOrigem: '9000000044', erro: 'http' }]);
    expect(JSON.stringify(m.e.falhas)).not.toContain('9400000001');
    expect(r.usuarios).toMatchObject({ pedidos: 1, resolvidos: 0 });
    expect(m.e.fatos.get('9000000044')!.pessoa_ref).toBeNull();
  });
  it('um id que o /users não devolve fica sem pessoa e sem falha (pessoa removida do BusinessMap)', async () => {
    const m = await montar({}, { registros: [registroWorklog({ logged_time_id: 9_000_000_046, user_id: 9_400_000_077 })], users });
    const r = await coletarApontamentos(m.deps, carga());
    expect(r.usuarios).toEqual({ pedidos: 1, resolvidos: 0, naoResolvidos: 1 });
    expect(m.e.falhas).toEqual([]);
    expect(m.e.fatos.get('9000000046')!.pessoa_ref).toBeNull();
  });
  it('usuariosSuprimidos: sem ids não consulta o banco; consulta só o HMAC (nunca o user_id)', async () => {
    const banco = criarDublePg((c) => (c.texto.includes('cfg_pessoa_eliminada') ? [{ hash: hmacUsuario(SAL, '15') }] : []));
    expect(await usuariosSuprimidos(banco.pool, S, SAL, [])).toEqual(new Set());
    expect(banco.chamadas).toHaveLength(0);
    expect(await usuariosSuprimidos(banco.pool, S, SAL, ['15', '16'])).toEqual(new Set(['15']));
    expect(JSON.stringify(banco.chamadas[0]!.valores)).not.toMatch(/"15"|"16"/);
    expect(hmacUsuario(SAL, '15')).toMatch(/^[0-9a-f]{64}$/);
    expect(hmacUsuario(SAL, '15')).not.toBe(hmacUsuario(SAL, '16'));
  });
});

describe('comentário só em memória e validação na fronteira (CA-AP-2, CA-AP-9)', () => {
  it('o comentário vai só à classificação (com o tipo do card, ou o do pai) e nunca à base, ao controle nem ao resultado', async () => {
    const regs = [
      registroWorklog({ logged_time_id: 9_000_000_050, comment: 'MARCADOR-COMENTARIO-059 um dois três', card_id: 9_100_000_000, reporter: 'PESSOA-FICTICIA-A', email: 'marcador059@exemplo.invalido', campo_novo_059: 'x' }),
      registroWorklog({ logged_time_id: 9_000_000_051, comment: null, card_id: 9_999_999_999, parent_card_id: 9_100_000_000 }),
      registroWorklog({ logged_time_id: 9_000_000_052, comment: 'sem tipo', card_id: 9_100_000_001, parent_card_id: null }),
    ];
    for (const ignorarFields of [false, true]) {
      const m = await montar({ escopo: [{ card_id: '9100000000', type_id: '7' }, { card_id: '9100000001', type_id: null }] }, { registros: regs, ignorarFields, users: {} });
      const r = await coletarApontamentos(m.deps, carga());
      expect(m.chamadasClassificador.map((c) => [c.comentario?.slice(0, 8) ?? null, c.typeId, c.categoriaId])).toEqual([['MARCADOR', '7', null], [null, '7', null], ['sem tipo', null, null]]);
      const tudo = JSON.stringify([[...m.e.stg.values()], [...m.e.fatos.values()], m.e.falhas, m.e.contagens, m.e.fechamentos, r]);
      for (const proibido of ['MARCADOR-COMENTARIO-059', 'PESSOA-FICTICIA-A', 'marcador059', 'campo_novo_059', 'um dois']) expect(tudo, proibido).not.toContain(proibido);
      expect(r).toMatchObject({ estado: 'sucesso', lidos: 3, inseridos: 3 });
    }
  });
  it('registro recusado (data futura, horas, id): vai a ctl_coleta_falha e à contagem, mas não segura a marca d\'água (A7); o resto entra', async () => {
    const regs = [
      registroWorklog({ logged_time_id: 9_000_000_060 }), registroWorklog({ logged_time_id: 9_000_000_061, date: '2026-11-05' }),
      registroWorklog({ logged_time_id: 9_000_000_062, time: 86_401 }), registroWorklog({ logged_time_id: 'abc' }), registroWorklog({ logged_time_id: 9_000_000_063, user_id: 'x' }),
    ];
    const m = await montar({}, { registros: regs });
    const r = await coletarApontamentos(m.deps, carga());
    expect(r).toMatchObject({
      estado: 'sucesso', lidos: 5, inseridos: 1, invalidos: 4, falhas: {}, recusados: { 'data-futura': 1, 'tempo-invalido': 1, 'id-invalido': 2 },
    });
    expect(m.e.falhas.map((f) => [f.entidade, f.idOrigem, f.erro])).toEqual([
      ['apontamento', '9000000061', 'data-futura'], ['apontamento', '9000000062', 'tempo-invalido'], ['apontamento', null, 'id-invalido'], ['apontamento', '9000000063', 'id-invalido'],
    ]);
    expect(m.e.contagens.find((c) => c.entidade === 'apontamento')).toMatchObject({ lidos: 5, inseridos: 1, falhas: 4 });
    expect([...m.e.fatos.keys()]).toEqual(['9000000060']);
    expect(m.e.marca).toEqual({ coletaId: 77, ate: QUARTA });
    expect(m.e.fechamentos.at(-1)).toMatchObject({ status: 'sucesso', erro: null });
  });
  it('os cinco códigos de recusa de registro são da lista fechada e nenhum vira falha de execução', async () => {
    const regs = [
      registroWorklog({ logged_time_id: 'x1' }), registroWorklog({ logged_time_id: 9_000_000_080, date: '2026-13-45' }), registroWorklog({ logged_time_id: 9_000_000_081, date: '2026-11-05' }),
      registroWorklog({ logged_time_id: 9_000_000_082, time: 0 }), registroWorklog({ logged_time_id: 9_000_000_083, logged_at: 'nao-e-data' }),
    ];
    const m = await montar({}, { registros: regs });
    const r = await coletarApontamentos(m.deps, carga());
    expect(Object.keys(r.recusados).sort()).toEqual(['campo-invalido', 'data-futura', 'data-invalida', 'id-invalido', 'tempo-invalido']);
    expect(r).toMatchObject({ estado: 'sucesso', falhas: {}, inseridos: 0 });
  });
  it('carga inicial com um registro recusado de vez: lote só de recusas conta como concluído, a carga fecha sucesso, grava a marca e o incremental seguinte roda (A7)', async () => {
    const m = await montar({ escopo: cards(450) }, { registros: [registroWorklog({ logged_time_id: 9_000_000_090, card_id: 9_100_000_005, time: 0 })] });
    const r = await coletarApontamentos(m.deps, carga());
    expect(r).toMatchObject({ estado: 'sucesso', lotesConcluidos: 3, inseridos: 0, recusados: { 'tempo-invalido': 1 } });
    expect(m.e.checkpoints).toEqual([1, 2, 3]);
    expect(m.e.marca).toEqual({ coletaId: 77, ate: QUARTA });
    const seguinte = await montar({ marca: QUARTA }, { registros: [registroWorklog({ logged_time_id: 9_000_000_090, time: 0 })] });
    expect(await coletarApontamentos(seguinte.deps, incremental)).toMatchObject({ estado: 'sucesso', recusados: { 'tempo-invalido': 1 } });
  });
  it('a varredura grava a mesma recusa uma vez por execução; o registro corrigido na origem entra como versão nova', async () => {
    const m = await montar({ marca: MARCA }, { registros: [registroWorklog({ logged_time_id: 9_000_000_091, time: 0 })] });
    await coletarApontamentos(m.deps, incremental);
    // dois passes (novos e varredura) leem o mesmo registro: uma linha de falha por leitura, nunca valor
    expect(m.e.falhas.every((f) => f.erro === 'tempo-invalido' && f.idOrigem === '9000000091')).toBe(true);
    m.servidor.cenario.registros[0] = registroWorklog({ logged_time_id: 9_000_000_091, time: 600 });
    expect(await coletarApontamentos(m.deps, incremental)).toMatchObject({ estado: 'sucesso', inseridos: 1, recusados: {} });
    expect(m.e.fatos.get('9000000091')).toMatchObject({ versoes: 1 });
  });
  it('recusa com logged_time_id válido não tira o lote de completo e não gera exclusão falsa; o ausente de verdade segue sendo excluído', async () => {
    const fs = Array.from({ length: 100 }, (_, i) => fato(i));
    // o apontamento 5 passa a vir com horas inválidas (recusa com id válido): continua presente na origem, então não é excluído
    const doServidor = fs.slice(1).map((f) => (f.logged_time_id === fs[5]!.logged_time_id ? registroDoFato(f, { time: 0 }) : registroDoFato(f)));
    const m = await montar({ marca: MARCA, fatos: fs }, { registros: doServidor });
    const r = await coletarApontamentos(m.deps, incremental);
    expect(r).toMatchObject({ estado: 'sucesso', excluidos: 1 });
    expect([...m.e.eventos.values()].map((x) => x.id)).toEqual([fs[0]!.logged_time_id]);
    expect(m.e.fatos.get(fs[5]!.logged_time_id)!.excluido_em).toBeNull();
  });
  it('recusa com logged_time_id inválido tira o lote de completo naquela execução: nenhuma exclusão, e o estado segue sucesso', async () => {
    const fs = Array.from({ length: 100 }, (_, i) => fato(i));
    const m = await montar({ marca: MARCA, fatos: fs }, { registros: [...fs.slice(1).map((f) => registroDoFato(f)), registroWorklog({ logged_time_id: 'sem-id' })] });
    const r = await coletarApontamentos(m.deps, incremental);
    expect(r).toMatchObject({ estado: 'sucesso', excluidos: 0, recusados: { 'id-invalido': 1 } });
    expect(m.e.eventos.size).toBe(0);
  });
  it('guarda recusa_em_massa: mais de 5 por cento dos lidos com pelo menos 10 recusas fecha parcial e a marca não anda', async () => {
    const boas = Array.from({ length: 150 }, (_, i) => registroWorklog({ logged_time_id: 9_000_001_000 + i }));
    const ruins = (n: number): Registro[] => Array.from({ length: n }, (_, i) => registroWorklog({ logged_time_id: 9_000_002_000 + i, time: 0 }));
    // 10 de 160 = 6,25 por cento: dispara
    const m = await montar({}, { registros: [...boas, ...ruins(10)] });
    const r = await coletarApontamentos(m.deps, carga());
    expect(r).toMatchObject({ estado: 'parcial', falhas: { recusa_em_massa: 1 }, recusados: { 'tempo-invalido': 10 }, inseridos: 150 });
    expect(m.e.marca).toBeUndefined();
    expect(m.e.falhas.filter((f) => f.erro === 'recusa_em_massa')).toEqual([{ entidade: 'apontamento', idOrigem: null, erro: 'recusa_em_massa' }]);
    expect(m.e.fechamentos.at(-1)).toMatchObject({ status: 'parcial' });
    // o checkpoint da carga não anda sobre a guarda armada
    expect(m.e.checkpoints).toEqual([]);
  });
  it('guarda recusa_em_massa: exatamente 5 por cento, ou menos de 10 recusas, não dispara; os parâmetros são ajustáveis', async () => {
    const boas = (n: number): Registro[] => Array.from({ length: n }, (_, i) => registroWorklog({ logged_time_id: 9_000_003_000 + i }));
    const ruins = (n: number): Registro[] => Array.from({ length: n }, (_, i) => registroWorklog({ logged_time_id: 9_000_004_000 + i, time: 0 }));
    const cinco = await montar({}, { registros: [...boas(190), ...ruins(10)] }); // 10 de 200 = 5 por cento
    expect(await coletarApontamentos(cinco.deps, carga())).toMatchObject({ estado: 'sucesso', falhas: {} });
    const poucas = await montar({}, { registros: [...boas(20), ...ruins(9)] }); // 9 de 29 = 31 por cento, mas abaixo de 10 recusas
    expect(await coletarApontamentos(poucas.deps, carga())).toMatchObject({ estado: 'sucesso', falhas: {} });
    const ajustado = await montar({}, { registros: [...boas(20), ...ruins(3)] }, { minimoRecusasMassa: 3, limiteRecusaPercentual: 10 });
    expect(await coletarApontamentos(ajustado.deps, carga())).toMatchObject({ estado: 'parcial', falhas: { recusa_em_massa: 1 } });
    const folgado = await montar({}, { registros: [...boas(20), ...ruins(10)] }, { limiteRecusaPercentual: 50 });
    expect(await coletarApontamentos(folgado.deps, carga())).toMatchObject({ estado: 'sucesso' });
  });
  it('soma diária alta não é recusada: 115 h num dia entra (valor_atipico é da projeção pela biblioteca)', async () => {
    const m = await montar({}, { registros: [registroWorklog({ logged_time_id: 9_000_000_064, time: 86_400 }), ...Array.from({ length: 30 }, (_, i) => registroWorklog({ logged_time_id: 9_000_000_100 + i, time: 13_800 }))] });
    expect(await coletarApontamentos(m.deps, carga())).toMatchObject({ estado: 'sucesso', inseridos: 31, invalidos: 0 });
  });
  it('classificação que lança ou devolve fora da lista fechada: falha só com código e id_origem, sem derrubar o resto', async () => {
    const regs = [registroWorklog({ logged_time_id: 9_000_000_070, comment: 'lança' }), registroWorklog({ logged_time_id: 9_000_000_071, comment: 'inválida' }), registroWorklog({ logged_time_id: 9_000_000_072, comment: 'boa' })];
    const classificar = (e: EntradaClassificacao): SaidaClassificacao => {
      if (e.comentario === 'lança') throw new Error('COMENTARIO-NA-MENSAGEM');
      return e.comentario === 'inválida' ? ({ subgrupo: 'Texto Livre', flags: 0, qtdPalavras: 1, versaoDicionario: 'v' } as SaidaClassificacao) : { subgrupo: 'ok', flags: 0, qtdPalavras: 1, versaoDicionario: 'v' };
    };
    const m = await montar({}, { registros: regs }, { classificar });
    const r = await coletarApontamentos(m.deps, carga());
    expect(r).toMatchObject({ estado: 'parcial', inseridos: 1, falhas: { 'classificacao-falhou': 2 } });
    expect(m.e.falhas.map((f) => [f.idOrigem, f.erro])).toEqual([['9000000070', 'classificacao-falhou'], ['9000000071', 'classificacao-falhou']]);
    expect(JSON.stringify(m.e.falhas)).not.toContain('COMENTARIO-NA-MENSAGEM');
  });
});

describe('falhas de lote e de banco', () => {
  it('lote de um card que falha: id_origem é o card; lote de vários: sem id; a coleta fecha parcial e a marca não avança', async () => {
    const m = await montar({ escopo: cards(2) }, { registros: [registroWorklog({ logged_time_id: 9_000_000_080, card_id: 9_100_000_001 })], statusPorLote: (c) => (c.length === 1 && c[0] === '9100000000' ? 404 : undefined), falharCards: [] });
    // 2 cards: o lote de 2 volta ok; para o lote de um card, escopo de 1
    const um = await montar({ escopo: cards(1) }, { statusPorLote: () => 404 });
    await coletarApontamentos(um.deps, carga());
    expect(um.e.falhas).toEqual([{ entidade: 'apontamento', idOrigem: '9100000000', erro: 'http' }]);
    const varios = await montar({ escopo: cards(3) }, { statusPorLote: () => 404 });
    await coletarApontamentos(varios.deps, carga());
    expect(varios.e.falhas).toEqual([{ entidade: 'apontamento', idOrigem: null, erro: 'http' }]);
    expect(m.e.falhas).toEqual([]);
  });
  it('lote no teto de um card: entrega os registros, falha lote_no_teto com o card, parcial', async () => {
    const regs = Array.from({ length: 1000 }, () => registroWorklog());
    const m = await montar({}, { registros: regs });
    const r = await coletarApontamentos(m.deps, carga());
    expect(r).toMatchObject({ estado: 'parcial', lidos: 1000, falhas: { lote_no_teto: 1 } });
    expect(m.e.falhas).toEqual([{ entidade: 'apontamento', idOrigem: '9100000000', erro: 'lote_no_teto' }]);
    expect(m.e.fechamentos.at(-1)!.erro).toBe('1 falha(s) do worklog (lote_no_teto)');
  });
  it('erro de banco: fecha como falha (erro-interno, sem a mensagem) e repassa; a transação é desfeita (nada na staging)', async () => {
    const m = await montar({ marca: MARCA, falharEm: ['INSERT INTO dspd_bm.stg_apontamento'] }, { registros: [registroWorklog()] });
    await expect(coletarApontamentos(m.deps, incremental)).rejects.toThrow('falha simulada do banco');
    expect(m.e.stg.size).toBe(0);
    expect(m.e.fechamentos.at(-1)).toEqual({ coletaId: 77, status: 'falha', erro: 'desconhecido: erro-interno' });
    expect(m.e.marca).toBeUndefined();
    const duplo = await montar({ falharEm: ['INSERT INTO dspd_bm.stg_apontamento', 'SET status = $2, finalizado_em'] }, { registros: [registroWorklog()] });
    await expect(coletarApontamentos(duplo.deps, carga())).rejects.toThrow('falha simulada do banco');
  });
  it('falha entre a staging e a projeção desfaz a transação e a marca não avança (CT-79)', async () => {
    const m = await montar({ falharEm: ['INSERT INTO dspd_bm.fato_apontamento'] }, { registros: [registroWorklog()] });
    await expect(coletarApontamentos(m.deps, carga())).rejects.toThrow();
    expect(m.e.stg.size).toBe(0);
    expect(m.e.marca).toBeUndefined();
  });
});

describe('projeção: contagens do driver e esquema padrão', () => {
  it('rowCount nulo do driver vale zero e a hierarquia é refeita sempre', async () => {
    const m = await montar({ rowCountNulo: true, cards: [{ card_id: '9100000000', card_pai: null, granularidade: 'projeto' }] }, { registros: [registroWorklog({ logged_time_id: 9_000_000_090 })] });
    expect(await coletarApontamentos(m.deps, carga())).toMatchObject({ estado: 'sucesso', inseridos: 1 });
    expect(m.e.raizes.length).toBeGreaterThan(0);
  });
  it('sem esquema informado, usa o do ambiente (schemas sem prefixo)', async () => {
    const m = await montar({}, {}, { S: undefined });
    expect(await coletarApontamentos(m.deps, carga())).toMatchObject({ estado: 'sucesso' });
  });
});

describe('comando manual', () => {
  it('analisarArgumentosApontamento: só carga-inicial, com --inicio opcional; o resto é recusado sem eco', () => {
    expect(analisarArgumentosApontamento(['carga-inicial'])).toEqual({ tipo: 'carga_inicial' });
    expect(analisarArgumentosApontamento(['carga-inicial', '--inicio=2025-06-01'])).toEqual({ tipo: 'carga_inicial', inicio: '2025-06-01' });
    for (const argv of [[], ['incremental'], ['carga-inicial', '--inicio=ontem'], ['carga-inicial', '--inicio=2025-13-45'], ['carga-inicial', '--tudo'], ['carga-inicial', '--inicio=2025-06-01', '--inicio=2025-06-02']]) {
      expect(() => analisarArgumentosApontamento(argv), JSON.stringify(argv)).toThrow(ErroColetaBm);
    }
    try {
      analisarArgumentosApontamento(['carga-inicial', '--inicio=SEGREDO']);
    } catch (e) {
      expect((e as ErroColetaBm).codigo).toBe('uso');
      expect((e as Error).message).not.toContain('SEGREDO');
    }
  });
  it('executarApontamento roda sob a trava da fonte e recusa se outra coleta do BusinessMap a segura', async () => {
    const m = await montar({});
    expect(await executarApontamento(m.deps, carga())).toMatchObject({ estado: 'sucesso' });
    expect(m.banco.chamadas.some((c) => c.texto.includes('pg_try_advisory_lock'))).toBe(true);
    const ocupada = await montar({ travaOcupada: true });
    await expect(executarApontamento(ocupada.deps, carga())).rejects.toMatchObject({ codigo: 'trava' });
    expect(ocupada.servidor.pedidos).toHaveLength(0);
  });
});

describe('tipo do card no fato (E2.19, filtro por tipo)', () => {
  const tipoDe = (m: Awaited<ReturnType<typeof montar>>, id: number): string | null | undefined => m.e.fatos.get(String(id))!.type_id;
  it('o fato recebe o type_id do card, ou o do pai na subtarefa; id que não são dígitos ou ausência de tipo viram nulo, nunca texto', async () => {
    const regs = [
      registroWorklog({ logged_time_id: 9_000_000_060, card_id: 9_100_000_000 }),
      registroWorklog({ logged_time_id: 9_000_000_061, card_id: 9_999_999_999, parent_card_id: 9_100_000_000 }),
      registroWorklog({ logged_time_id: 9_000_000_062, card_id: 9_100_000_001 }),
      registroWorklog({ logged_time_id: 9_000_000_063, card_id: 9_100_000_002 }),
    ];
    const m = await montar({ escopo: [{ card_id: '9100000000', type_id: '7' }, { card_id: '9100000001', type_id: null }, { card_id: '9100000002', type_id: 'texto livre' }] }, { registros: regs, users: {} });
    await coletarApontamentos(m.deps, carga());
    expect([60, 61, 62, 63].map((i) => tipoDe(m, 9_000_000_000 + i))).toEqual(['7', '7', null, null]);
    // a classificação também recebe só dígitos ou nulo
    expect(m.chamadasClassificador.map((c) => c.typeId)).toEqual(['7', '7', null, null]);
  });
  it('a releitura preenche o tipo do fato antigo (mesmo hash, sem tipo) e não o apaga quando o card some do escopo', async () => {
    const antigo = fato(1);
    const m = await montar({ marca: MARCA, fatos: [antigo], escopo: [{ card_id: '9100000000', type_id: '12' }] }, { registros: [registroDoFato(antigo)] });
    await coletarApontamentos(m.deps, incremental);
    expect(m.e.fatos.get(antigo.logged_time_id)!.type_id).toBe('12');
    const sem = await montar({ marca: MARCA, fatos: [{ ...antigo, type_id: '12', registro_sha256: 'x' }], escopo: [{ card_id: '9100000000', type_id: null }] }, { registros: [registroDoFato(antigo)] });
    await coletarApontamentos(sem.deps, incremental);
    expect(sem.e.fatos.get(antigo.logged_time_id)!.type_id).toBe('12');
  });
});
