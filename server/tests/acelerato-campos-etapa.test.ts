import { describe, expect, it } from 'vitest';
import { Contadores, camposEtapa, type DominiosEtapa } from '../src/modulos/acelerato/allow-list.js';
import { coletarAcelerato, type DepsColeta, type ResultadoColeta } from '../src/modulos/acelerato/index.js';
import { CHAVES_COMPARADAS, fluxoSha256, montarParametros } from '../src/modulos/acelerato/controle.js';
import { CAMPOS_ETAPA_F3, NOMES_CAMPO_FATIA_F1, NOMES_ETAPA_LISTA, NOMES_ETAPA_PREENCHIDO, campoDominioEtapa } from '../src/modulos/acelerato/listas-fechadas.js';
import { carregarDominiosEtapa, carregarOrdemFluxo } from '../src/modulos/acelerato/referencia.js';
import { CONSULTAS, Q6_CAMPOS_ETAPA_LISTA, Q7_CAMPOS_ETAPA_PREENCHIDO, sha256Texto } from '../src/modulos/acelerato/sql.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg } from './duble-pg.js';
import { CONFIG, LISTAS_BANCO, TLS, criarBancoMemoria, criarMysqlFalso, linha } from './acelerato-duble.js';
import { PROIBIDOS, linhaCompleta } from './fixtures/acelerato-linha-50-colunas.js';

/** L9-b do 069 (K-220): Q6 e Q7 dos campos de etapa até o staging. Casos de abuso CA-069-6 a CA-069-12 do modelo de ameaças. */
const AGORA = new Date('2026-11-04T12:00:00Z');
const S = montarEsquemas('');

/** Escrita à mão, não derivada da constante (B-1 da ADR 0020): é o que o código tem de ler e nada além. */
const NOMES_ESPERADOS_LISTA = [
  'Motivo da Escalação', 'Qual suporte foi acionado?', 'Motivo de Encerramento', 'Classifique o chamado no Tipo de Prioridade corretamente!',
  'Motivo de Pendência', 'Avaliação de Problema', 'Prioridade ajustada manualmente?',
];
const NOMES_ESPERADOS_PREENCHIDO = ['Se a prioridade foi ajustada, justifique', 'Previsão de retorno'];
const NOMES_PROIBIDOS = [
  'Acelerato - Atendente', 'Acelerato - Solicitante', 'Cargo', 'Bairro', 'Complemento do Problema', 'USUARIO_LOGIN', 'ACELERATO_LOGIN',
  'Campo Inventado Para O Teste', 'Categoria de solução', 'Número do ticket anterior',
];
const MARCADORES = ['MARCADOR-069-A', 'MARCADOR-069-B', 'MARCADOR-069-C', 'MARCADOR-069-D'];

const deps = (banco: ReturnType<typeof criarBancoMemoria>, mysql: ReturnType<typeof criarMysqlFalso>) => {
  const logs: unknown[] = [];
  const log = { info: (o: Record<string, unknown>, m: string) => logs.push([o, m]), error: (o: Record<string, unknown>, m: string) => logs.push([o, m]) };
  const d: DepsColeta = { pool: banco.pool, config: CONFIG, tls: TLS, S, agora: () => AGORA, log, cliente: { conectar: mysql.conectar }, dormir: () => Promise.resolve() };
  return { d, logs };
};
const etapa = (campos: { nome: string; tipo: string; valor: unknown }[]) =>
  linha({ campos_personalizados_etapa: JSON.stringify(campos.map((c) => ({ ...c, obrigatorio: false, kanbanStatusKey: 11 }))) });
const dominio = (chave: string, ...valores: string[]) => valores.map((v) => ({ campo: campoDominioEtapa(chave), codigo: v, rotulo: v }));
const lista = (nome: string, valor: string | null, tipo: string | null = 'lista', kanban_status_key: number | null = 1) => ({ ticket_key: 1, nome, tipo, valor, kanban_status_key });
const preench = (nome: string, preenchido: unknown) => ({ ticket_key: 1, nome, preenchido });
const ok = (r: ResultadoColeta): Extract<ResultadoColeta, { estado: 'ok' }> => { if (r.estado !== 'ok') throw new Error('esperava ok'); return r; };
const vazio: DominiosEtapa = new Map();

describe('constante de nomes (A1)', () => {
  it('traz exatamente os nove nomes da fatia F3, cada um com o tratamento fixo, sem Categoria de solução nem Número do ticket anterior', () => {
    expect([...NOMES_ETAPA_LISTA]).toEqual(NOMES_ESPERADOS_LISTA);
    expect([...NOMES_ETAPA_PREENCHIDO]).toEqual(NOMES_ESPERADOS_PREENCHIDO);
    expect(CAMPOS_ETAPA_F3).toHaveLength(9);
    for (const n of NOMES_PROIBIDOS) expect([...NOMES_ETAPA_LISTA, ...NOMES_ETAPA_PREENCHIDO]).not.toContain(n);
    expect(new Set(CAMPOS_ETAPA_F3.map((c) => c.chave)).size).toBe(9);
    for (const c of CAMPOS_ETAPA_F3) expect(campoDominioEtapa(c.chave).length).toBeLessThanOrEqual(40); // ref_dominio.campo é varchar(40)
  });
  it('o hash dos nomes inclui o tratamento: trocar lista por preenchido muda campos_sha256', () => {
    const base = montarParametros(CONFIG, null, new Map()).campos_sha256;
    expect(base).not.toBe(sha256Texto(NOMES_CAMPO_FATIA_F1.join('\n')));
    expect(base).toBe(sha256Texto([...NOMES_CAMPO_FATIA_F1, ...CAMPOS_ETAPA_F3.map((c) => `${c.nome}|${c.tratamento}`)].join('\n')));
  });
});

describe('estrutura das consultas Q6 e Q7', () => {
  it('só SELECT, sem ponto e vírgula, sem LIKE, sem asterisco, sem nome no texto; a coluna json só dentro de JSON_TABLE', () => {
    for (const q of [Q6_CAMPOS_ETAPA_LISTA, Q7_CAMPOS_ETAPA_PREENCHIDO]) {
      expect(q.startsWith('SELECT')).toBe(true);
      expect(q).not.toMatch(/;|\bLIKE\b|SELECT\s+\*|\w\.\*|\bREGEXP\b|\bUNION\b/i);
      expect(q).toContain('f.nome IN (<nomes>)');
      expect(q).toContain('c.ticket_key IN (<chaves>)');
      expect(q).toContain("JSON_TABLE(c.campos_personalizados_etapa, '$[*]'");
      expect(q.split('campos_personalizados_etapa')).toHaveLength(2);
      for (const n of [...NOMES_ESPERADOS_LISTA, ...NOMES_ESPERADOS_PREENCHIDO]) expect(q).not.toContain(n);
    }
    expect(CONSULTAS).toContain(Q6_CAMPOS_ETAPA_LISTA);
    expect(CONSULTAS).toContain(Q7_CAMPOS_ETAPA_PREENCHIDO);
  });
  it('L9-c: a Q6 projeta só o inteiro kanban_status_key a mais, ordena de forma repetível e não projeta obrigatorio nem a coluna json inteira', () => {
    const projecao = Q6_CAMPOS_ETAPA_LISTA.slice('SELECT '.length, Q6_CAMPOS_ETAPA_LISTA.indexOf('\nFROM'));
    expect(projecao).toBe('c.ticket_key, f.nome, f.tipo, f.valor, f.kanban_status_key');
    expect(Q6_CAMPOS_ETAPA_LISTA).toContain("kanban_status_key BIGINT PATH '$.kanbanStatusKey' NULL ON EMPTY NULL ON ERROR");
    expect(Q6_CAMPOS_ETAPA_LISTA.endsWith('\nORDER BY c.ticket_key, f.nome, f.kanban_status_key')).toBe(true);
    expect(Q6_CAMPOS_ETAPA_LISTA).not.toMatch(/obrigatorio|ORDINALITY|\bjson\b/i);
    expect(Q7_CAMPOS_ETAPA_PREENCHIDO).not.toMatch(/kanban|ORDER BY/);
  });
  it('L9-c: fluxo_sha256 é o hash de codigo|ordem ordenado por codigo; muda com a lista e não com a ordem de chegada; a lista vazia tem hash estável', () => {
    expect(fluxoSha256(new Map([[20, 2], [10, 1]]))).toBe(sha256Texto('10|1\n20|2'));
    expect(fluxoSha256(new Map([[20, 2], [10, 1]]))).toBe(fluxoSha256(new Map([[10, 1], [20, 2]])));
    expect(fluxoSha256(new Map([[10, 1], [20, 3]]))).not.toBe(fluxoSha256(new Map([[10, 1], [20, 2]])));
    expect(fluxoSha256(new Map())).toBe(sha256Texto(''));
    expect(montarParametros(CONFIG, null, new Map([[10, 1]])).fluxo_sha256).toBe(fluxoSha256(new Map([[10, 1]])));
    expect(CHAVES_COMPARADAS).toContain('fluxo_sha256');
  });
  it('A2: a Q7 (nomes preenchido) não projeta valor: só o booleano; a Q6 projeta valor em VARCHAR(80)', () => {
    const projecaoQ7 = Q7_CAMPOS_ETAPA_PREENCHIDO.slice('SELECT '.length, Q7_CAMPOS_ETAPA_PREENCHIDO.indexOf('\nFROM'));
    expect(projecaoQ7).toBe('c.ticket_key, f.nome, (f.valor IS NOT NULL AND CHAR_LENGTH(TRIM(f.valor)) > 0) AS preenchido');
    expect(Q7_CAMPOS_ETAPA_PREENCHIDO).not.toMatch(/\btipo\b/);
    expect(Q6_CAMPOS_ETAPA_LISTA).toContain("valor VARCHAR(80) PATH '$.valor'");
  });
});

describe('fronteira pela coleta (CA-069-6, 7, 8, 11)', () => {
  it('A1: linha a mais em ref_dominio com nome proibido não entra no IN; os parâmetros são só os nomes da constante', async () => {
    const extra = NOMES_PROIBIDOS.map((n) => ({ campo: 'campo_personalizado', codigo: 'x', rotulo: n }));
    const banco = criarBancoMemoria({ listas: [...LISTAS_BANCO, ...extra, { campo: 'campo_personalizado', codigo: 'Acelerato - Atendente', rotulo: 'Acelerato - Atendente' }] });
    const mysql = criarMysqlFalso([linha()]);
    await coletarAcelerato(deps(banco, mysql).d, 'incremental');
    const q6 = mysql.reg.consultas.filter((c) => c.sql === Q6_CAMPOS_ETAPA_LISTA.replace('<chaves>', '?').replace('<nomes>', NOMES_ESPERADOS_LISTA.map(() => '?').join(', ')));
    const q7 = mysql.reg.consultas.filter((c) => c.sql.includes('AS preenchido'));
    expect(q6).toHaveLength(1);
    expect(q7).toHaveLength(1);
    expect(q6[0]!.valores.slice(1)).toEqual(NOMES_ESPERADOS_LISTA);
    expect(q7[0]!.valores.slice(1)).toEqual(NOMES_ESPERADOS_PREENCHIDO);
    for (const c of [...q6, ...q7]) for (const n of NOMES_PROIBIDOS) expect(c.valores).not.toContain(n);
  });

  it('A1: fixture com nomes proibidos e marcadores: nenhum sai da consulta; marcadores ausentes do staging, do log e das ctl_', async () => {
    const proibidos = NOMES_PROIBIDOS.map((nome, i) => ({ nome, tipo: i % 2 === 0 ? 'lista' : 'texto', valor: `MARCADOR-069-${i}` }));
    const banco = criarBancoMemoria();
    const mysql = criarMysqlFalso([etapa(proibidos)]);
    const { d, logs } = deps(banco, mysql);
    const r = ok(await coletarAcelerato(d, 'incremental'));
    const texto = JSON.stringify([banco.estado, logs, r], (_k, v: unknown) => (Buffer.isBuffer(v) ? v.toString('hex') : v));
    for (let i = 0; i < NOMES_PROIBIDOS.length; i++) expect(texto).not.toContain(`MARCADOR-069-${i}`);
    const campos = (banco.estado.stgChamado[0]!.payload.campos) as Record<string, unknown>;
    expect(Object.keys(campos).sort()).toEqual(['reincidente_90d', ...CAMPOS_ETAPA_F3.map((c) => c.chave)].sort());
  });

  it('a fixture completa de 50 colunas: nenhum marcador de PROIBIDOS no staging, log nem controle; booleanos só do que veio preenchido', async () => {
    const banco = criarBancoMemoria();
    const mysql = criarMysqlFalso([linha()]);
    const { d, logs } = deps(banco, mysql);
    const r = ok(await coletarAcelerato(d, 'incremental'));
    const texto = JSON.stringify([banco.estado, logs, r], (_k, v: unknown) => (Buffer.isBuffer(v) ? v.toString('hex') : v));
    expect(PROIBIDOS.filter((p) => texto.includes(p))).toEqual([]);
    expect(banco.estado.stgChamado[0]!.payload.campos).toMatchObject({ justificativa_informada: true, previsao_retorno_informada: true, motivo_escalacao: null });
    expect(linhaCompleta()).toBeDefined();
  });

  it('A2 (CA-069-7): justificativa com texto marcador e tipo lista: só o booleano; o texto não chega ao staging', async () => {
    const banco = criarBancoMemoria();
    const mysql = criarMysqlFalso([etapa([
      { nome: 'Se a prioridade foi ajustada, justifique', tipo: 'lista', valor: MARCADORES[0] },
      { nome: 'Previsão de retorno', tipo: 'data', valor: MARCADORES[1] },
    ])]);
    const { d, logs } = deps(banco, mysql);
    await coletarAcelerato(d, 'incremental');
    expect(banco.estado.stgChamado[0]!.payload.campos).toMatchObject({ justificativa_informada: true, previsao_retorno_informada: true });
    const texto = JSON.stringify([banco.estado, logs]);
    for (const m of MARCADORES) expect(texto).not.toContain(m);
  });

  it('A2 (CA-069-8): Motivo de Encerramento com tipo texto e valor marcador: nulo com contagem, mesmo se o valor estivesse no domínio', async () => {
    const banco = criarBancoMemoria({ listas: [...LISTAS_BANCO, ...dominio('motivo_encerramento', MARCADORES[2]!)] });
    const mysql = criarMysqlFalso([etapa([{ nome: 'Motivo de Encerramento', tipo: 'texto', valor: MARCADORES[2] }])]);
    const { d, logs } = deps(banco, mysql);
    const r = ok(await coletarAcelerato(d, 'incremental'));
    expect(banco.estado.stgChamado[0]!.payload.campos).toMatchObject({ motivo_encerramento: null });
    expect(r.contagens.tipo_texto_motivo_encerramento).toBe(1);
    expect(JSON.stringify([banco.estado, logs, r])).not.toContain(MARCADORES[2]);
  });

  it('CA-069-10: no domínio grava o valor; fora do domínio e domínio vazio ficam nulos com fora_dominio_<campo>, sem o valor', async () => {
    const banco = criarBancoMemoria({ listas: [...LISTAS_BANCO, ...dominio('motivo_escalacao', 'Hardware', 'Software')] });
    const mysql = criarMysqlFalso([etapa([
      { nome: 'Motivo da Escalação', tipo: 'lista', valor: 'Hardware' },
      { nome: 'Motivo de Pendência', tipo: 'lista', valor: MARCADORES[3] },
      { nome: 'Avaliação de Problema', tipo: 'lista', valor: 'Qualquer' },
    ])]);
    const { d, logs } = deps(banco, mysql);
    const r = ok(await coletarAcelerato(d, 'incremental'));
    expect(banco.estado.stgChamado[0]!.payload.campos).toMatchObject({ motivo_escalacao: 'Hardware', motivo_pendencia: null, avaliacao_problema: null });
    expect(r.contagens).toMatchObject({ fora_dominio_motivo_pendencia: 1, fora_dominio_avaliacao_problema: 1 });
    expect(r.contagens.fora_dominio_motivo_escalacao).toBeUndefined();
    expect(JSON.stringify([banco.estado, logs, r])).not.toContain(MARCADORES[3]);
  });
});

describe('carregarDominiosEtapa', () => {
  it('lê só os campos da constante, por placeholder, e devolve um conjunto vazio por campo sem linha', async () => {
    const banco = criarBancoMemoria({ listas: [...LISTAS_BANCO, ...dominio('motivo_escalacao', 'A', 'B')] });
    const m = await carregarDominiosEtapa(banco.pool, S);
    expect([...m.keys()].sort()).toEqual(CAMPOS_ETAPA_F3.filter((c) => c.tratamento === 'lista').map((c) => c.chave).sort());
    expect([...m.get('motivo_escalacao')!]).toEqual(['A', 'B']);
    expect(m.get('motivo_pendencia')!.size).toBe(0);
    expect(m.has('justificativa_informada')).toBe(false);
  });
});

describe('zod strict (CA-069-9)', () => {
  const dom: DominiosEtapa = new Map([['motivo_escalacao', new Set(['A'])]]);
  const falha = (l: unknown[], p: unknown[] = []) => {
    try { camposEtapa(l, p, dom, new Map(), new Contadores()); } catch (e) { return e as { codigo?: string; coluna?: string; message: string }; }
    return undefined;
  };
  it('linha válida passa; sem linha, lista nula e preenchido falso', () => {
    const c = new Contadores();
    expect(camposEtapa([lista('Motivo da Escalação', 'A')], [preench('Previsão de retorno', 1), preench('Se a prioridade foi ajustada, justifique', 0)], dom, new Map(), c)).toMatchObject({ motivo_escalacao: 'A', previsao_retorno_informada: true, justificativa_informada: false });
    expect(camposEtapa([], [], dom, new Map(), c)).toMatchObject({ motivo_escalacao: null, justificativa_informada: false });
  });
  it.each([
    ['chave extra na lista', [{ ...lista('Motivo da Escalação', 'A'), extra: 'MARCADOR-069-X' }], [], 'extra'],
    ['nome fora da constante na lista', [lista('Acelerato - Atendente', 'MARCADOR-069-X')], [], 'nome'],
    ['nome de preenchido na Q6', [lista('Previsão de retorno', 'A')], [], 'nome'],
    ['valor de 81 caracteres', [lista('Motivo da Escalação', 'x'.repeat(81))], [], 'valor'],
    ['booleano em campo de lista', [{ ticket_key: 1, nome: 'Motivo da Escalação', tipo: 'lista', valor: true, kanban_status_key: 1 }], [], 'valor'],
    ['coluna valor na Q7', [], [{ ticket_key: 1, nome: 'Previsão de retorno', preenchido: 1, valor: 'MARCADOR-069-X' }], 'valor'],
    ['texto no lugar do booleano na Q7', [], [preench('Previsão de retorno', 'MARCADOR-069-X')], 'preenchido'],
    ['nome de lista na Q7', [], [preench('Motivo da Escalação', 1)], 'nome'],
    ['kanban_status_key texto (L9-c)', [lista('Motivo da Escalação', 'A', 'lista', 'MARCADOR-069-X' as never)], [], 'kanban_status_key'],
    ['kanban_status_key decimal', [lista('Motivo da Escalação', 'A', 'lista', 1.5)], [], 'kanban_status_key'],
    ['kanban_status_key negativo', [lista('Motivo da Escalação', 'A', 'lista', -3)], [], 'kanban_status_key'],
    ['kanban_status_key ausente da linha', [{ ticket_key: 1, nome: 'Motivo da Escalação', tipo: 'lista', valor: 'A' }], [], 'kanban_status_key'],
  ])('%s: falha fechado dados-invalidos, erro sem o valor', (_n, l, p, coluna) => {
    const e = falha(l, p);
    expect(e).toMatchObject({ codigo: 'dados-invalidos', coluna });
    expect(JSON.stringify(e)).not.toContain('MARCADOR-069-X');
    expect(e!.message).not.toContain('MARCADOR-069-X');
  });
  it('tipo ausente não recusa (só o domínio decide); valor vazio ou nulo é sem resposta, sem contagem', () => {
    const c = new Contadores();
    expect(camposEtapa([lista('Motivo da Escalação', 'A', null)], [], dom, new Map(), c)).toMatchObject({ motivo_escalacao: 'A' });
    expect(camposEtapa([lista('Motivo da Escalação', '')], [], dom, new Map(), c)).toMatchObject({ motivo_escalacao: null });
    expect(camposEtapa([lista('Motivo da Escalação', null)], [], dom, new Map(), c)).toMatchObject({ motivo_escalacao: null });
    expect(c.entradas()).toEqual([]);
  });
  it('vazio e fora do mapa de domínios: nada passa sem domínio', () => {
    const c = new Contadores();
    expect(camposEtapa([lista('Motivo da Escalação', 'A')], [], vazio, new Map(), c)).toMatchObject({ motivo_escalacao: null });
    expect(c.obter('fora_dominio_motivo_escalacao')).toBe(1);
  });
});

describe('carregarOrdemFluxo (L9-c): lista etapa_fluxo de ref_dominio', () => {
  const fluxo = (...itens: [string, number][]) => itens.map(([codigo, ordem]) => ({ campo: 'etapa_fluxo', codigo, rotulo: `Etapa ${codigo}`, ordem }));
  it('lê só o campo etapa_fluxo vigente, por placeholder: codigo vira número e ordem a posição', async () => {
    const d = criarDublePg(() => [...fluxo(['10', 0], ['20', 1]), { campo: 'etapa', codigo: '999', rotulo: 'x', ordem: 7 }]);
    const m = await carregarOrdemFluxo(d.pool, S);
    expect([...m]).toEqual([[10, 0], [20, 1]]);
    expect(d.chamadas[0]!.texto).toContain('vigente_ate IS NULL');
    expect(d.chamadas[0]!.texto).toContain('ref_dominio');
    expect(d.chamadas[0]!.texto).not.toContain('etapa_fluxo');
    expect(d.chamadas[0]!.valores).toEqual(['etapa_fluxo']);
  });
  it('sem linha: mapa vazio, não é erro', async () => {
    expect((await carregarOrdemFluxo(criarDublePg(() => []).pool, S)).size).toBe(0);
  });
  it.each([
    ['codigo que não é número', fluxo(['abc', 0])],
    ['codigo com sinal', fluxo(['-1', 0])],
    ['ordem negativa', fluxo(['10', -1])],
    ['ordem decimal', fluxo(['10', 1.5])],
  ])('%s: falha fechado dados-invalidos citando só o campo', async (_n, linhas) => {
    await expect(carregarOrdemFluxo(criarDublePg(() => linhas).pool, S)).rejects.toMatchObject({ codigo: 'dados-invalidos', entidade: 'ref_dominio', coluna: 'etapa_fluxo' });
  });
});

describe('coleta com a ordem do fluxo (L9-c)', () => {
  const comChaves = (campos: { nome: string; tipo: string; valor: unknown; kanbanStatusKey: unknown }[]) =>
    linha({ campos_personalizados_etapa: JSON.stringify(campos.map((c) => ({ ...c, obrigatorio: false }))) });
  const etapaFluxo = (...itens: [string, number][]) => itens.map(([codigo, ordem]) => ({ campo: 'etapa_fluxo', codigo, rotulo: `Etapa ${codigo}`, ordem }));
  const repetido = [
    { nome: 'Motivo da Escalação', tipo: 'lista', valor: 'Software', kanbanStatusKey: 30 },
    { nome: 'Motivo da Escalação', tipo: 'lista', valor: 'Hardware', kanbanStatusKey: 10 },
    { nome: 'Motivo da Escalação', tipo: 'lista', valor: null, kanbanStatusKey: 40 },
  ];
  it('com a lista carregada, vale o valor da etapa de maior posição e nada de chave de etapa chega ao staging', async () => {
    const banco = criarBancoMemoria({ listas: [...LISTAS_BANCO, ...dominio('motivo_escalacao', 'Hardware', 'Software'), ...etapaFluxo(['10', 0], ['30', 2], ['40', 3])] });
    const { d, logs } = deps(banco, criarMysqlFalso([comChaves(repetido)]));
    const r = ok(await coletarAcelerato(d, 'incremental'));
    expect(banco.estado.stgChamado[0]!.payload.campos).toMatchObject({ motivo_escalacao: 'Software' });
    expect(r.contagens.etapa_fora_do_fluxo_motivo_escalacao).toBeUndefined();
    expect(JSON.stringify([banco.estado.stgChamado, logs, r])).not.toMatch(/kanban/i);
    expect(banco.estado.ctl[0]!.parametros).toMatchObject({ fluxo_sha256: fluxoSha256(new Map([[10, 0], [30, 2], [40, 3]])) });
  });
  it('lista vazia: campo com valores diferentes fica nulo com contagem, sem o valor, e a coleta termina', async () => {
    const banco = criarBancoMemoria({ listas: [...LISTAS_BANCO, ...dominio('motivo_escalacao', 'Hardware', 'Software')] });
    const { d } = deps(banco, criarMysqlFalso([comChaves(repetido)]));
    const r = ok(await coletarAcelerato(d, 'incremental'));
    expect(banco.estado.stgChamado[0]!.payload.campos).toMatchObject({ motivo_escalacao: null });
    expect(r.contagens.etapa_fora_do_fluxo_motivo_escalacao).toBe(1);
  });
  it('chave de etapa em texto na origem vira nula no MySQL: valores iguais seguem; diferentes ficam nulos com contagem', async () => {
    const banco = criarBancoMemoria({ listas: [...LISTAS_BANCO, ...dominio('motivo_escalacao', 'Hardware', 'Software'), ...etapaFluxo(['10', 0])] });
    const igual = comChaves([{ nome: 'Motivo da Escalação', tipo: 'lista', valor: 'Hardware', kanbanStatusKey: 'MARCADOR-069-A' }, { nome: 'Motivo da Escalação', tipo: 'lista', valor: 'Hardware', kanbanStatusKey: 10 }]);
    const { d, logs } = deps(banco, criarMysqlFalso([igual]));
    expect(ok(await coletarAcelerato(d, 'incremental')).contagens.etapa_fora_do_fluxo_motivo_escalacao).toBeUndefined();
    expect(banco.estado.stgChamado[0]!.payload.campos).toMatchObject({ motivo_escalacao: 'Hardware' });
    const diferente = comChaves([{ nome: 'Motivo da Escalação', tipo: 'lista', valor: 'Software', kanbanStatusKey: 'MARCADOR-069-A' }, { nome: 'Motivo da Escalação', tipo: 'lista', valor: 'Hardware', kanbanStatusKey: 10 }]);
    const b2 = criarBancoMemoria({ listas: [...LISTAS_BANCO, ...dominio('motivo_escalacao', 'Hardware', 'Software'), ...etapaFluxo(['10', 0])] });
    const m2 = deps(b2, criarMysqlFalso([diferente]));
    expect(ok(await coletarAcelerato(m2.d, 'incremental')).contagens.etapa_fora_do_fluxo_motivo_escalacao).toBe(1);
    expect(JSON.stringify([banco.estado, b2.estado, logs, m2.logs])).not.toContain('MARCADOR-069-A');
  });
  it('trocar a lista etapa_fluxo muda fluxo_sha256 e recusa a coleta sem reconhecimento (CA-8)', async () => {
    const banco = criarBancoMemoria({ listas: [...LISTAS_BANCO, ...etapaFluxo(['10', 0])] });
    const mysql = criarMysqlFalso([linha()]);
    await coletarAcelerato(deps(banco, mysql).d, 'incremental');
    const outro = criarBancoMemoria({ listas: [...LISTAS_BANCO, ...etapaFluxo(['10', 1])] });
    outro.estado.ctl.push(...banco.estado.ctl);
    await expect(coletarAcelerato(deps(outro, mysql).d, 'incremental')).rejects.toMatchObject({ codigo: 'parametros-mudaram', coluna: 'fluxo_sha256' });
  });
});
