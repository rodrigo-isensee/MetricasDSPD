import { describe, expect, it } from 'vitest';
import { coletarAcelerato, ErroColeta, type DepsColeta, type ResultadoColeta } from '../src/modulos/acelerato/index.js';
import { COLUNAS_DA_LINHA } from '../src/modulos/acelerato/listas-fechadas.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { CONFIG, TLS, criarBancoMemoria, criarMysqlFalso, linha, sha256, type OpcoesMysql } from './acelerato-duble.js';
import { COLUNAS_BARRADAS, DOMINIO_FIXTURE, PROIBIDOS, linhaComColunaDesconhecida, linhaForaDoRecorte } from './fixtures/acelerato-linha-50-colunas.js';

const AGORA = new Date('2026-10-30T12:00:00Z');
const D = DOMINIO_FIXTURE;

type Banco = ReturnType<typeof criarBancoMemoria>;
type Mysql = ReturnType<typeof criarMysqlFalso>;
type Registro = { obj: Record<string, unknown>; msg: string };

function montar(banco: Banco, mysql: Mysql, extra: Partial<DepsColeta> = {}) {
  const logs: Registro[] = [];
  const log = { info: (obj: Record<string, unknown>, msg: string) => logs.push({ obj, msg }), error: (obj: Record<string, unknown>, msg: string) => logs.push({ obj, msg }) };
  const esperas: number[] = [];
  const deps: DepsColeta = {
    pool: banco.pool, config: CONFIG, tls: TLS, S: montarEsquemas(''), agora: () => AGORA, log, cliente: { conectar: mysql.conectar },
    dormir: (ms) => { esperas.push(ms); return Promise.resolve(); }, ...extra,
  };
  return { deps, logs, esperas };
}
const ok = (r: ResultadoColeta): Extract<ResultadoColeta, { estado: 'ok' }> => { if (r.estado !== 'ok') throw new Error('esperava ok'); return r; };
/** Busca cada item de PROIBIDOS no que o coletor gravou, logou e devolveu (varredura de vazamento do plano de testes). */
const vazamentos = (...partes: unknown[]): string[] => {
  const texto = JSON.stringify(partes, (_k, v: unknown) => (Buffer.isBuffer(v) ? v.toString('hex') : v));
  return [...PROIBIDOS, CONFIG.senha, CONFIG.host, CONFIG.usuario].filter((p) => texto.includes(p));
};
/** A linha como a Q1 a devolve (as 35 colunas e `com_agente`), para simular a origem devolvendo o que não devia. */
const projetada = (sobre: Record<string, unknown> = {}): Record<string, unknown> => {
  const base = Object.fromEntries(COLUNAS_DA_LINHA.map((c) => [c, c === 'com_agente' ? 1 : (linha() as Record<string, unknown>)[c]]));
  return { ...base, ...sobre };
};
/** Chamados de enchimento: a saída do recorte só passa de 5% de ausentes com poucos conhecidos, então os testes pequenos precisam de volume. */
const enchimento = (n = 60) => Array.from({ length: n }, (_, i) => linha({ ticket_key: 500 + i }));

describe('primeira carga', () => {
  it('grava o chamado e as etapas só com a allow-list, sem nenhum marcador de pessoa, e registra o controle', async () => {
    const banco = criarBancoMemoria();
    const mysql = criarMysqlFalso([linha(), linhaForaDoRecorte()]);
    const { deps, logs } = montar(banco, mysql);
    const r = ok(await coletarAcelerato(deps, 'incremental'));
    expect(r.chamados).toEqual({ lidos: 1, inseridos: 1, jaExistentes: 0 });
    expect(r.etapas).toEqual({ lidos: 2, inseridos: 2, jaExistentes: 0 });
    const e = banco.estado;
    expect(e.stgChamado).toHaveLength(1);
    expect(Object.keys(e.stgChamado[0]!.payload)).toEqual([...COLUNAS_DA_LINHA, 'campos']);
    expect(e.stgChamado[0]!.payload).toMatchObject({ com_agente: true, status: D.status, prioridade: D.prioridade, campos: { reincidente_90d: 'sim' } });
    for (const barrada of COLUNAS_BARRADAS) expect(Object.keys(e.stgChamado[0]!.payload)).not.toContain(barrada);
    expect(e.stgEtapa.map((x) => x.id)).toEqual(['101', '102']);
    expect(e.stgEtapa[1]!.payload).toEqual({ descricao: 'Em diagnostico', descricao_workflow: 'Fluxo Ficticio', tempo_sla_segundos: 7200, quantidade_vezes: 2 });
    expect(vazamentos(e, logs, r)).toEqual([]);
    expect(e.ctl).toHaveLength(1);
    expect(e.ctl[0]).toMatchObject({ tarefa: 'coleta_incremental', status: 'sucesso' });
    expect(e.ctl[0]!.marcaAte?.toISOString()).toBe('2026-09-02T13:30:00.000Z');
    expect(r.marcaDagua).toBe('2026-09-02T13:30:00.000Z');
    expect(r.sincronizadoEmMax).toBe('2026-09-02 10:40:00');
    expect(e.contagens.map((c) => c.entidade)).toEqual(['chamado', 'etapa', 'fora_organizacoes_recorte']);
  });

  it('sem espera injetada (uso real) a primeira tentativa que dá certo não espera nada', async () => {
    const banco = criarBancoMemoria();
    const { deps } = montar(banco, criarMysqlFalso([linha()]), { dormir: undefined });
    expect(ok(await coletarAcelerato(deps, 'incremental')).chamados.inseridos).toBe(1);
  });

  it('CT-35: parametros guardam só hashes (sem host, banco, usuário nem senha), o SHA-256 do SQL e o maior sincronizado_em', async () => {
    const banco = criarBancoMemoria();
    const { deps } = montar(banco, criarMysqlFalso([linha()]));
    await coletarAcelerato(deps, 'incremental');
    const p = banco.estado.ctl[0]!.parametros!;
    expect(p).toMatchObject({
      host_sha256: sha256(CONFIG.host), banco_sha256: sha256(CONFIG.banco), tabela: 'ACELERATO_CHAMADOS', tls_sha256: CONFIG.tlsSha256,
      sincronizado_em_max: '2026-09-02 10:40:00',
    });
    for (const k of ['colunas_sha256', 'campos_sha256', 'sql_sha256']) expect(p[k]).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(p)).not.toContain(CONFIG.host);
    expect(JSON.stringify(p)).not.toContain(CONFIG.banco);
  });

  it('CT-33: informa só a contagem dos SSSC das equipes fora das organizações do recorte (sem id nem valor)', async () => {
    const banco = criarBancoMemoria();
    const fora = linha({ ticket_key: 900000005, organizacao_key: D.organizacaoKeyFora, organizacao: D.organizacaoFora });
    const { deps, logs } = montar(banco, criarMysqlFalso([linha(), fora]));
    const r = ok(await coletarAcelerato(deps, 'incremental'));
    expect(r.foraOrganizacoes).toBe(1);
    expect(r.chamados.lidos).toBe(1);
    expect(banco.estado.contagens.find((c) => c.entidade === 'fora_organizacoes_recorte')).toMatchObject({ lidos: 1 });
    expect(JSON.stringify([banco.estado, logs])).not.toContain('900000005');
    expect(JSON.stringify(banco.estado)).not.toContain(D.organizacaoFora);
  });

  it('a contagem fora das organizações só roda na primeira carga e na releitura', async () => {
    const banco = criarBancoMemoria();
    const { deps } = montar(banco, criarMysqlFalso([linha()]));
    expect(ok(await coletarAcelerato(deps, 'incremental')).foraOrganizacoes).toBe(0);
    expect(ok(await coletarAcelerato(deps, 'incremental')).foraOrganizacoes).toBeNull();
    expect(ok(await coletarAcelerato(deps, 'releitura')).foraOrganizacoes).toBe(0);
  });
});

describe('incremental, histórico e idempotência', () => {
  it('CT-26/27: segunda coleta lê a partir da marca menos a margem de 24 h e não grava nada (hash igual ignora); sem novidade', async () => {
    const banco = criarBancoMemoria();
    const mysql = criarMysqlFalso([linha()]);
    const { deps } = montar(banco, mysql);
    await coletarAcelerato(deps, 'incremental');
    const antes = banco.estado.stgChamado.length + banco.estado.stgEtapa.length;
    const r = ok(await coletarAcelerato(deps, 'incremental'));
    expect(r.chamados).toEqual({ lidos: 1, inseridos: 0, jaExistentes: 1 });
    expect(r.semNovidade).toBe(true);
    expect(banco.estado.stgChamado.length + banco.estado.stgEtapa.length).toBe(antes);
    const q1 = mysql.reg.consultas.filter((c) => c.sql.startsWith('SELECT ticket_key, tipo_ticket_key'));
    const valores = q1.at(-1)!.valores;
    expect(valores.slice(3)).toEqual(['2026-09-01 10:30:00', '2026-09-01 10:30:00', '2026-09-01 10:30:00', 0]);
  });

  it('CT-28: status mudado vira versão nova encadeada e a antiga permanece; só o carimbo da cópia mudado não gera versão', async () => {
    const banco = criarBancoMemoria();
    const tabela = [linha()];
    const { deps } = montar(banco, criarMysqlFalso(tabela));
    await coletarAcelerato(deps, 'releitura');
    tabela[0] = linha({ sincronizado_em: '2026-09-09 09:09:09', estatisticas_em: '2026-09-09 09:09:09' });
    expect(ok(await coletarAcelerato(deps, 'releitura')).chamados.inseridos).toBe(0);
    tabela[0] = linha({ status: 'Aguardando atribuicao' });
    expect(ok(await coletarAcelerato(deps, 'releitura')).chamados.inseridos).toBe(1);
    const v = banco.estado.stgChamado;
    expect(v).toHaveLength(2);
    expect(v[1]!.anterior).toBe(v[0]!.sk);
    expect(v[0]!.payload.status).toBe(D.status);
    expect(v[1]!.payload.status).toBe('Aguardando atribuicao');
  });

  it('CT-26: 2.500 linhas são lidas em 3 páginas (1.000, 1.000, 500) sem perder nem repetir, com empate de data entre páginas', async () => {
    const banco = criarBancoMemoria();
    const tabela = Array.from({ length: 2500 }, (_, i) => linha({ ticket_key: 1000 + i, data_atualizacao: `2026-09-${String(1 + Math.floor(i / 500)).padStart(2, '0')} 10:00:00`, estatisticas: null }));
    const mysql = criarMysqlFalso(tabela);
    const { deps } = montar(banco, mysql);
    const r = ok(await coletarAcelerato(deps, 'incremental'));
    expect(r.chamados.inseridos).toBe(2500);
    expect(new Set(banco.estado.stgChamado.map((x) => x.id)).size).toBe(2500);
    expect(mysql.reg.consultas.filter((c) => c.sql.startsWith('SELECT ticket_key, tipo_ticket_key'))).toHaveLength(3);
    expect(r.contagens.chamado_sem_etapas).toBe(2500);
  });

  it('CT-26: página de exatamente 1.000 pede a seguinte e termina vazia; o cursor é a chave composta da última linha', async () => {
    const banco = criarBancoMemoria();
    const tabela = Array.from({ length: 1000 }, (_, i) => linha({ ticket_key: 5000 + i, data_atualizacao: '2026-09-05 10:00:00', estatisticas: null }));
    const mysql = criarMysqlFalso(tabela);
    await coletarAcelerato(montar(banco, mysql).deps, 'incremental');
    const q1 = mysql.reg.consultas.filter((c) => c.sql.startsWith('SELECT ticket_key, tipo_ticket_key'));
    expect(q1).toHaveLength(2);
    expect(q1[1]!.valores.slice(3)).toEqual(['1000-01-01 00:00:00', '2026-09-05 10:00:00', '2026-09-05 10:00:00', 5999]);
  });

  it('marca d\'água: sem linhas lidas, a marca anterior é mantida', async () => {
    const banco = criarBancoMemoria();
    const tabela = [linha()];
    const { deps } = montar(banco, criarMysqlFalso(tabela));
    await coletarAcelerato(deps, 'incremental');
    tabela.length = 0;
    const r = ok(await coletarAcelerato(deps, 'incremental'));
    expect(r.chamados.lidos).toBe(0);
    expect(r.marcaDagua).toBe('2026-09-02T13:30:00.000Z');
  });

  it('CT-23: chamado excluído (lixeira) e arquivado permanecem no staging', async () => {
    const banco = criarBancoMemoria();
    const { deps } = montar(banco, criarMysqlFalso([linha({ lixeira: 1, arquivado: 1 })]));
    await coletarAcelerato(deps, 'incremental');
    expect(banco.estado.stgChamado[0]!.payload).toMatchObject({ lixeira: true, arquivado: true });
  });
});

describe('releitura semanal e saída do recorte', () => {
  async function comUmMilCarregados(extra: Partial<DepsColeta> = {}, opcoes: OpcoesMysql = {}) {
    const banco = criarBancoMemoria();
    const tabela = Array.from({ length: 1000 }, (_, i) => linha({ ticket_key: 7000 + i, data_atualizacao: '2026-09-05 10:00:00' }));
    const mysql = criarMysqlFalso(tabela, opcoes);
    const m = montar(banco, mysql, extra);
    await coletarAcelerato(m.deps, 'releitura');
    return { banco, tabela, mysql, ...m };
  }

  it('CT-31: presente fora do recorte vira versão com fora_do_recorte, ausente da tabela vira ausente_na_extracao (com as etapas), mesmo payload; reaparecer volta a false', async () => {
    const banco = criarBancoMemoria();
    const tabela = [linha({ ticket_key: 11 }), linha({ ticket_key: 12 }), linha({ ticket_key: 13 }), ...enchimento()];
    const { deps } = montar(banco, criarMysqlFalso(tabela));
    await coletarAcelerato(deps, 'releitura');
    const saiu = { ...tabela[0]!, organizacao_key: D.organizacaoKeyFora };
    tabela.splice(0, 2, saiu); // 11 sai do recorte (continua na tabela), 12 some
    const r = ok(await coletarAcelerato(deps, 'releitura'));
    expect(r).toMatchObject({ foraDoRecorte: 1, ausentes: 1 });
    const v = (id: string) => banco.estado.stgChamado.filter((x) => x.id === id);
    expect(v('11')).toHaveLength(2);
    expect(v('11')[1]).toMatchObject({ fora: true, ausente: false, anterior: v('11')[0]!.sk });
    expect(v('11')[1]!.payload).toEqual(v('11')[0]!.payload);
    expect(v('12')[1]).toMatchObject({ ausente: true, fora: false });
    expect(banco.estado.stgEtapa.filter((x) => x.chamado === '12' && x.ausente)).toHaveLength(2);
    expect(banco.estado.stgEtapa.filter((x) => x.chamado === '11' && x.ausente)).toHaveLength(0);
    expect(v('13')).toHaveLength(1);
    // reaparecer: o 12 volta ao recorte
    tabela.push(linha({ ticket_key: 12 }));
    await coletarAcelerato(deps, 'releitura');
    expect(v('12').at(-1)).toMatchObject({ ausente: false, fora: false });
    expect(v('12')).toHaveLength(3);
    expect(banco.estado.contagens.some((c) => c.entidade === 'chamado_ausente' && c.inseridos === 1)).toBe(true);
  });

  it('CT-31: a consulta de saída pede só as 6 colunas, por placeholder, em lotes', async () => {
    const banco = criarBancoMemoria();
    const tabela = [linha({ ticket_key: 21 }), linha({ ticket_key: 22 }), ...enchimento()];
    const mysql = criarMysqlFalso(tabela);
    const { deps } = montar(banco, mysql);
    await coletarAcelerato(deps, 'releitura');
    tabela.splice(0, 1);
    await coletarAcelerato(deps, 'releitura');
    const q5 = mysql.reg.consultas.find((c) => c.sql.startsWith('SELECT ticket_key, tipo_ticket_key, organizacao_key'))!;
    expect(q5.sql).toContain('SELECT ticket_key, tipo_ticket_key, organizacao_key, equipe_key, lixeira, data_atualizacao');
    expect(q5.sql).toMatch(/WHERE ticket_key IN \(\?\)$/);
    expect(q5.valores).toEqual([21]);
  });

  it('CT-32: 50 de 1.000 ausentes (5,0%) passa; 51 (5,1%) para a coleta, sem gravar as ausências', async () => {
    const a = await comUmMilCarregados();
    a.tabela.splice(0, 50);
    expect(ok(await coletarAcelerato(a.deps, 'releitura')).ausentes).toBe(50);

    const b = await comUmMilCarregados();
    const antes = b.banco.estado.stgChamado.length;
    b.tabela.splice(0, 51);
    await expect(coletarAcelerato(b.deps, 'releitura')).rejects.toMatchObject({ codigo: 'recarga-suspeita' });
    expect(b.banco.estado.stgChamado).toHaveLength(antes);
    expect(b.banco.estado.ctl.at(-1)).toMatchObject({ status: 'falha', erro: 'recarga-suspeita' });
    expect(b.logs.at(-1)!.msg).toBe('coleta do Acelerato falhou');
  });

  it('CT-32: recarga com todos ausentes para a coleta', async () => {
    const c = await comUmMilCarregados();
    c.tabela.length = 0;
    await expect(coletarAcelerato(c.deps, 'releitura')).rejects.toMatchObject({ codigo: 'recarga-suspeita' });
  });

  it('presente na saída mas dentro do recorte (corrida entre as duas leituras) é contado e não marcado', async () => {
    const banco = criarBancoMemoria();
    const tabela = [linha({ ticket_key: 31 }), linha({ ticket_key: 32 })];
    const { deps } = montar(banco, criarMysqlFalso(tabela));
    expect(ok(await coletarAcelerato(deps, 'releitura')).chamados.inseridos).toBe(2);
    const escondendo = criarMysqlFalso(tabela, { adulterarQ1: (ls) => ls.filter((l) => l.ticket_key !== 32) });
    const r = ok(await coletarAcelerato({ ...deps, cliente: { conectar: escondendo.conectar } }, 'releitura'));
    expect(r.contagens.saida_inconsistente).toBe(1);
    expect(r).toMatchObject({ foraDoRecorte: 0, ausentes: 0 });
  });
});

describe('falhas fecham sem gravar pela metade', () => {
  it('CT-01: coluna desconhecida falha fechado, nada no staging, sem marcador, controle só com o código e o nome da coluna', async () => {
    const banco = criarBancoMemoria();
    const mysql = criarMysqlFalso([linha()], { adulterarQ1: () => [{ ...projetada(), coluna_nova_do_time: linhaComColunaDesconhecida().coluna_nova_do_time }] });
    const { deps, logs } = montar(banco, mysql);
    const e = await coletarAcelerato(deps, 'incremental').catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ErroColeta);
    expect(e).toMatchObject({ codigo: 'dados-invalidos', entidade: 'chamado', coluna: 'coluna_nova_do_time' });
    expect(banco.estado.stgChamado).toHaveLength(0);
    expect(banco.estado.stgEtapa).toHaveLength(0);
    expect(banco.estado.ctl).toHaveLength(1);
    expect(banco.estado.ctl[0]).toMatchObject({ status: 'falha', marcaAte: null });
    expect(vazamentos(banco.estado, logs, (e as Error).message, (e as Error).stack, JSON.stringify(e))).toEqual([]);
  });

  it('CT-22: linha fora do recorte (tipo, organização ou equipe, cada um sozinho) falha fechado e nada é gravado', async () => {
    const casos = [
      { tipo_ticket_key: D.tipoTicketKeyFora }, { organizacao_key: D.organizacaoKeyFora }, { equipe_key: D.equipeKeyFora }, { equipe: 'Outro nome' },
    ];
    for (const sobre of casos) {
      const banco = criarBancoMemoria();
      const mysql = criarMysqlFalso([linha()], { adulterarQ1: () => [projetada(sobre)] });
      const { deps, logs } = montar(banco, mysql);
      await expect(coletarAcelerato(deps, 'incremental')).rejects.toMatchObject({ codigo: 'fora-do-recorte', idOrigem: '900000001' });
      expect(banco.estado.stgChamado).toHaveLength(0);
      expect(vazamentos(banco.estado, logs)).toEqual([]);
    }
  });

  it('CT-25: com a fonte em uso por outra execução, não abre conexão nem grava', async () => {
    const banco = criarBancoMemoria({ trava: false });
    const mysql = criarMysqlFalso([linha()]);
    const r = await coletarAcelerato(montar(banco, mysql).deps, 'incremental');
    expect(r).toEqual({ estado: 'em-uso' });
    expect(mysql.reg.conexoes).toBe(0);
    expect(banco.estado.ctl).toHaveLength(0);
  });

  it('listas de recorte vazias em ref_dominio: a coleta não começa', async () => {
    const banco = criarBancoMemoria({ listas: [] });
    const mysql = criarMysqlFalso([linha()]);
    await expect(coletarAcelerato(montar(banco, mysql).deps, 'incremental')).rejects.toMatchObject({ codigo: 'listas-vazias' });
    expect(mysql.reg.conexoes).toBe(0);
  });

  it('erro que não é do domínio (do banco) vira erro-interno, sem a mensagem original', async () => {
    const banco = criarBancoMemoria({ falharEm: (t) => (t.includes('.stg_chamado') && t.includes('INSERT') ? new Error('boom SENHA-DE-TESTE-056') : undefined) });
    const { deps, logs } = montar(banco, criarMysqlFalso([linha()]));
    const e = await coletarAcelerato(deps, 'incremental').catch((x: unknown) => x);
    expect(e).toMatchObject({ codigo: 'erro-interno' });
    expect(vazamentos(logs, (e as Error).message, (e as Error).stack)).toEqual([]);
    expect(banco.estado.stgChamado).toHaveLength(0); // ROLLBACK da transação
    expect(banco.estado.ctl.at(-1)).toMatchObject({ status: 'falha', erro: 'erro-interno' });
  });

  it('se nem a falha pode ser registrada, o código vai ao log e o erro original é relançado', async () => {
    const banco = criarBancoMemoria({ falharEm: (t) => (t.includes('INSERT INTO dspd_ac.ctl_coleta (') && t.includes("'falha'") ? new Error('sem gravar') : undefined) });
    const mysql = criarMysqlFalso([linha()], { falharConexao: () => Object.assign(new Error('x'), { code: 'ER_ACCESS_DENIED_ERROR' }) });
    const { deps, logs } = montar(banco, mysql);
    await expect(coletarAcelerato(deps, 'incremental')).rejects.toMatchObject({ codigo: 'autenticacao' });
    expect(logs.at(-1)).toEqual({ obj: { codigo: 'autenticacao' }, msg: 'falha da coleta não pôde ser registrada em ctl_coleta' });
  });
});

describe('CT-09/19: tentativas e segredo em erro', () => {
  const rede = () => Object.assign(new Error('connect ECONNRESET host-de-teste.invalido SENHA-DE-TESTE-056 usuario_de_teste'), { code: 'ECONNRESET' });

  it('rede caída: até 3 tentativas com espera de 1 s e 4 s, depois falha com categoria rede e tentativas registradas; sem segredo em lugar nenhum', async () => {
    const banco = criarBancoMemoria();
    const mysql = criarMysqlFalso([linha()], { falharConexao: rede });
    const { deps, logs, esperas } = montar(banco, mysql);
    const e = await coletarAcelerato(deps, 'incremental').catch((x: unknown) => x);
    expect(e).toMatchObject({ codigo: 'rede' });
    expect(mysql.reg.conexoes).toBe(3);
    expect(esperas).toEqual([1000, 4000]);
    expect(banco.estado.falhas[0]).toMatchObject({ tentativas: 3, erro: 'rede', entidade: 'coleta' });
    expect(vazamentos(banco.estado, logs, (e as Error).message, (e as Error).stack, JSON.stringify(e))).toEqual([]);
    expect('cause' in (e as object)).toBe(false);
  });

  it('falha de rede passageira: a segunda tentativa recomeça do zero e conclui', async () => {
    const banco = criarBancoMemoria();
    const mysql = criarMysqlFalso([linha()], { falharConexao: (n) => (n === 1 ? rede() : undefined) });
    const { deps } = montar(banco, mysql);
    expect(ok(await coletarAcelerato(deps, 'incremental')).chamados.inseridos).toBe(1);
    expect(mysql.reg.conexoes).toBe(2);
  });

  it('acesso negado: uma tentativa só, categoria autenticacao', async () => {
    const banco = criarBancoMemoria();
    const mysql = criarMysqlFalso([linha()], { falharConexao: () => Object.assign(new Error('Access denied for user usuario_de_teste using password YES'), { code: 'ER_ACCESS_DENIED_ERROR', errno: 1045 }) });
    const { deps, esperas } = montar(banco, mysql);
    await expect(coletarAcelerato(deps, 'incremental')).rejects.toMatchObject({ codigo: 'autenticacao' });
    expect(mysql.reg.conexoes).toBe(1);
    expect(esperas).toEqual([]);
    expect(banco.estado.falhas[0]).toMatchObject({ tentativas: 1 });
  });

  it('falha de TLS não tem nova tentativa', async () => {
    const mysql = criarMysqlFalso([linha()], { falharConexao: () => Object.assign(new Error('self signed'), { code: 'DEPTH_ZERO_SELF_SIGNED_CERT' }) });
    await expect(coletarAcelerato(montar(criarBancoMemoria(), mysql).deps, 'incremental')).rejects.toMatchObject({ codigo: 'tls' });
    expect(mysql.reg.conexoes).toBe(1);
  });

  it('consulta que nunca responde: tempo do cliente estoura, a conexão é destruída e há até 3 tentativas', async () => {
    const mysql = criarMysqlFalso([linha()], { travarEm: (s) => s.startsWith('SELECT ticket_key, tipo_ticket_key') });
    const banco = criarBancoMemoria();
    const m = montar(banco, mysql, { config: { ...CONFIG, maxExecMs: 1000 }, cliente: { conectar: mysql.conectar, folgaMs: 20 } });
    await expect(coletarAcelerato(m.deps, 'incremental')).rejects.toMatchObject({ codigo: 'tempo-esgotado' });
    expect(mysql.reg.conexoes).toBe(3);
    expect(mysql.reg.destruidas).toBeGreaterThanOrEqual(3);
    expect(banco.estado.ctl.at(-1)).toMatchObject({ status: 'falha', erro: 'tempo-esgotado' });
  }, 15000);
});

describe('CT-34: mudança de origem, lista ou SQL', () => {
  it('host diferente do registrado na última coleta bem-sucedida: recusa na partida, sem abrir conexão; reconhecida, segue', async () => {
    const banco = criarBancoMemoria();
    const mysql = criarMysqlFalso([linha()]);
    await coletarAcelerato(montar(banco, mysql).deps, 'incremental');
    const antes = mysql.reg.conexoes;
    const outra = montar(banco, mysql, { config: { ...CONFIG, host: 'outro-host.invalido' } }).deps;
    await expect(coletarAcelerato(outra, 'incremental')).rejects.toMatchObject({ codigo: 'parametros-mudaram', coluna: 'host_sha256' });
    expect(mysql.reg.conexoes).toBe(antes);
    expect(ok(await coletarAcelerato({ ...outra, reconhecerMudanca: true }, 'incremental')).estado).toBe('ok');
  });

  it.each([
    ['banco', { banco: 'outro_banco' }, 'banco_sha256'],
    ['impressão TLS', { tlsSha256: 'cd'.repeat(32) }, 'tls_sha256'],
  ])('%s diferente: recusa a coleta', async (_n, mudanca, chave) => {
    const banco = criarBancoMemoria();
    const mysql = criarMysqlFalso([linha()]);
    await coletarAcelerato(montar(banco, mysql).deps, 'incremental');
    const outra = montar(banco, mysql, { config: { ...CONFIG, ...mudanca } }).deps;
    await expect(coletarAcelerato(outra, 'incremental')).rejects.toMatchObject({ codigo: 'parametros-mudaram', coluna: chave });
  });

  it('hash da lista de colunas, da lista de nomes ou do SQL diferente do registrado: recusa (o registrado é adulterado)', async () => {
    for (const chave of ['colunas_sha256', 'campos_sha256', 'sql_sha256', 'tabela']) {
      const banco = criarBancoMemoria();
      const mysql = criarMysqlFalso([linha()]);
      const m = montar(banco, mysql);
      await coletarAcelerato(m.deps, 'incremental');
      banco.estado.ctl[0]!.parametros![chave] = 'adulterado';
      await expect(coletarAcelerato(m.deps, 'incremental')).rejects.toMatchObject({ codigo: 'parametros-mudaram', coluna: chave });
    }
  });
});

describe('CT-36 e releitura sem marca', () => {
  it('releitura não grava marca d\'água e usa a tarefa varredura; lê o recorte inteiro', async () => {
    const banco = criarBancoMemoria();
    const mysql = criarMysqlFalso([linha()]);
    const { deps } = montar(banco, mysql);
    await coletarAcelerato(deps, 'incremental');
    await coletarAcelerato(deps, 'releitura');
    expect(banco.estado.ctl[1]).toMatchObject({ tarefa: 'varredura', marcaAte: null });
    const q1 = mysql.reg.consultas.filter((c) => c.sql.startsWith('SELECT ticket_key, tipo_ticket_key'));
    expect(q1.at(-2)!.valores[3]).toBe('1000-01-01 00:00:00');
  });

  it('data_atualizacao que não é data válida: falha fechado na marca d\'água', async () => {
    const banco = criarBancoMemoria();
    const mysql = criarMysqlFalso([linha()], { adulterarQ1: () => [projetada({ data_atualizacao: '0000-00-00 00:00:00' })] });
    await expect(coletarAcelerato(montar(banco, mysql).deps, 'incremental')).rejects.toMatchObject({ codigo: 'dados-invalidos', coluna: 'data_atualizacao' });
    expect(banco.estado.stgChamado).toHaveLength(0);
  });

  it('cursor que não avança falha em vez de repetir para sempre', async () => {
    const tabela = Array.from({ length: 1000 }, (_, i) => linha({ ticket_key: 100 + i, data_atualizacao: '2026-09-05 10:00:00' }));
    const mysql = criarMysqlFalso(tabela, { adulterarQ1: (ls) => ls.map((l) => ({ ...l, ticket_key: 7, data_atualizacao: '2026-09-05 10:00:00' })) });
    const banco = criarBancoMemoria();
    await expect(coletarAcelerato(montar(banco, mysql).deps, 'incremental')).rejects.toMatchObject({ codigo: 'erro-origem', entidade: 'chamado' });
    expect(banco.estado.stgChamado).toHaveLength(0);
  });
});
