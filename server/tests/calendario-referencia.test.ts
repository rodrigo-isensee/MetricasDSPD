import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FERIADOS_NACIONAIS } from '@metricas-dspd/metricas/core';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import {
  ARQUIVO_CALENDARIO, ErroCalendario, METRICAS_CALENDARIO, analisarCalendario, lerCalendario, planejarCalendario, sincronizarCalendario,
  type EstadoCalendario,
} from '../src/modulos/referencia/calendario.js';
import { criarDublePg, type Chamada } from './duble-pg.js';

const S = montarEsquemas('');
const AGORA = new Date('2026-11-04T12:00:00Z');
const HOJE = '2026-11-04';

type Turno = { inicio: string; fim: string };
type Cal = { nome: string; dominio: string; offset_minutos: number; descricao?: string; turnos?: Turno[]; feriados: { data: string; escopo: string; descricao: string }[] };
const f = (data: string, escopo = 'nacional', descricao = 'Feriado'): { data: string; escopo: string; descricao: string } => ({ data, escopo, descricao });
const bruto = (cals: Cal[], aplicacoes: Record<string, string>[]): Record<string, unknown> => ({
  versao: 1, regra: 'regra', versao_criterio: { descricao: 'Calendário', motivo: 'Teste' }, calendarios: cals, aplicacoes,
});
const BM: Cal = { nome: 'cal-bm', dominio: 'businessmap', offset_minutos: -180, descricao: 'BM', feriados: [f('2026-11-02'), f('2026-11-15')] };
const AC: Cal = { nome: 'cal-ac', dominio: 'acelerato', offset_minutos: -180, feriados: [f('2026-11-02')] };
const T528: Turno[] = [{ inicio: '08:00', fim: '12:00' }, { inicio: '13:00', fim: '17:48' }];
const APL = [
  { dominio: 'businessmap', classe: 'fluxo', calendario: 'cal-bm' },
  { dominio: 'businessmap', classe: 'apontamento', calendario: 'cal-bm' },
  { dominio: 'acelerato', classe: 'sustentacao', calendario: 'cal-ac' },
];
const texto = (cals: Cal[] = [BM, AC], apl = APL): string => JSON.stringify(bruto(cals, apl));
const arquivo = (cals?: Cal[], apl?: typeof APL) => analisarCalendario(texto(cals, apl)).arquivo;
const vazio: EstadoCalendario = { calendarios: new Map(), feriados: new Map(), vigentes: new Map(), ultimas: new Map(), ultimaVersao: new Map() };

describe('arquivo versionado do calendário (docs/architecture/fontes/calendario.json)', () => {
  it('o arquivo real é válido, o hash é o do texto e traz exatamente os feriados nacionais do código, sem data nova', () => {
    const lido = lerCalendario();
    expect(lido.sha256).toBe(createHash('sha256').update(readFileSync(ARQUIVO_CALENDARIO, 'utf8'), 'utf8').digest('hex'));
    expect(lido.arquivo.calendarios.map((c) => [c.nome, c.dominio, c.offset_minutos])).toEqual([
      ['dspd-businessmap', 'businessmap', -180], ['dspd-acelerato', 'acelerato', -180],
    ]);
    for (const c of lido.arquivo.calendarios) {
      expect(c.feriados.map((x) => x.data)).toEqual([...FERIADOS_NACIONAIS]);
      expect(new Set(c.feriados.map((x) => x.escopo))).toEqual(new Set(['nacional']));
    }
    // D3b (Decisão 13): só o calendário do Acelerato traz turnos (528 min); o do BusinessMap fica sem, nos turnos padrão do código.
    expect(lido.arquivo.calendarios.map((c) => [c.nome, c.turnos ?? null])).toEqual([['dspd-businessmap', null], ['dspd-acelerato', T528]]);
    expect(lido.arquivo.aplicacoes.map((a) => `${a.dominio}/${a.classe}/${a.calendario}`)).toEqual([
      'businessmap/fluxo/dspd-businessmap', 'businessmap/apontamento/dspd-businessmap', 'acelerato/sustentacao/dspd-acelerato',
    ]);
  });
  it('as métricas da versão de cada domínio não se misturam', () => {
    expect(METRICAS_CALENDARIO.businessmap.filter((m) => METRICAS_CALENDARIO.acelerato.includes(m))).toEqual([]);
    expect(METRICAS_CALENDARIO.acelerato.every((m) => m.startsWith('S') || m === 'EI_SUST')).toBe(true);
  });
  it.each([
    ['hora fora do formato', [{ inicio: '8:00', fim: '12:00' }]],
    ['hora inexistente', [{ inicio: '08:00', fim: '25:00' }]],
    ['fim igual ao início', [{ inicio: '08:00', fim: '08:00' }]],
    ['fim antes do início', [{ inicio: '13:00', fim: '12:00' }]],
    ['início em 24:00', [{ inicio: '24:00', fim: '24:00' }]],
    ['turnos sobrepostos', [{ inicio: '08:00', fim: '12:00' }, { inicio: '11:00', fim: '17:00' }]],
    ['lista vazia', []],
    ['campo a mais no turno', [{ inicio: '08:00', fim: '12:00', dia: 1 }]],
  ])('recusa o arquivo inteiro: turnos com %s', (_n, turnos) => {
    expect(() => analisarCalendario(texto([BM, { ...AC, turnos: turnos as Turno[] }]))).toThrow(/calendarios/);
  });
  it('aceita turno até 24:00 e turnos fora de ordem, sem sobreposição', () => {
    expect(() => analisarCalendario(texto([BM, { ...AC, turnos: [{ inicio: '13:00', fim: '24:00' }, { inicio: '08:00', fim: '12:00' }] }]))).not.toThrow();
  });
  it('JSON inválido e formato fora do esquema são recusados', () => {
    expect(() => analisarCalendario('{')).toThrow(ErroCalendario);
    expect(() => analisarCalendario('[]')).toThrow(/raiz/);
    expect(() => analisarCalendario(JSON.stringify({ ...bruto([BM], APL.slice(0, 1)), extra: 1 }))).toThrow(/inválido/);
  });
  it.each([
    ['data inexistente', [{ ...BM, feriados: [f('2026-02-30')] }, AC], APL, /feriados/],
    ['data fora do formato', [{ ...BM, feriados: [f('02/11/2026')] }, AC], APL, /feriados/],
    ['escopo fora do CHECK', [{ ...BM, feriados: [f('2026-11-02', 'regional')] }, AC], APL, /feriados/],
    ['data repetida no calendário', [{ ...BM, feriados: [f('2026-11-02'), f('2026-11-02')] }, AC], APL, /feriados/],
    ['nome de calendário repetido', [BM, { ...AC, nome: 'cal-bm' }], APL, /calendarios/],
    ['classe desconhecida', [BM, AC], [{ dominio: 'businessmap', classe: 'turno', calendario: 'cal-bm' }], /classe/],
    ['classe de outro domínio', [BM, AC], [{ dominio: 'acelerato', classe: 'fluxo', calendario: 'cal-ac' }], /classe/],
    ['calendário inexistente', [BM, AC], [{ dominio: 'businessmap', classe: 'fluxo', calendario: 'nao-existe' }], /calendario/],
    ['calendário de outro domínio', [BM, AC], [{ dominio: 'businessmap', classe: 'fluxo', calendario: 'cal-ac' }], /dominio/],
    ['aplicação repetida', [BM, AC], [APL[0]!, APL[0]!], /classe/],
    ['descrição com e-mail', [{ ...BM, feriados: [f('2026-11-02', 'nacional', 'a@b.com')] }, AC], APL, /feriados/],
  ])('recusa o arquivo inteiro: %s', (_n, cals, apl, onde) => {
    expect(() => analisarCalendario(JSON.stringify(bruto(cals as Cal[], apl as Record<string, string>[])))).toThrow(onde);
  });
});

describe('planejarCalendario (puro)', () => {
  it('carga inicial: tudo novo, por domínio, sem misturar calendários', () => {
    const p = planejarCalendario(arquivo(), vazio, HOJE);
    expect(p.dominios.map((d) => [d.dominio, d.calendariosNovos, d.feriadosNovos.length, d.abrir.map((a) => a.classe), d.fechar, d.mudou])).toEqual([
      ['businessmap', ['cal-bm'], 2, ['fluxo', 'apontamento'], [], true], ['acelerato', ['cal-ac'], 1, ['sustentacao'], [], true],
    ]);
    expect(new Set(p.dominios[0]!.feriadosNovos.map((x) => x.calendario))).toEqual(new Set(['cal-bm']));
    expect(p.feriadosDivergentes).toBe(0);
  });
  it('domínio sem calendário no arquivo não é tocado', () => {
    const p = planejarCalendario(arquivo([BM], APL.slice(0, 2)), vazio, HOJE);
    expect(p.dominios.map((d) => d.dominio)).toEqual(['businessmap']);
  });
  const gravado = (extra: Partial<EstadoCalendario> = {}): EstadoCalendario => ({
    calendarios: new Map([['cal-bm', { id: '1', offsetMinutos: -180 }], ['cal-ac', { id: '2', offsetMinutos: -180 }]]),
    feriados: new Map([
      ['cal-bm', new Map([['2026-11-02', { escopo: 'nacional', descricao: 'Feriado' }], ['2026-11-15', { escopo: 'nacional', descricao: 'Feriado' }]])],
      ['cal-ac', new Map([['2026-11-02', { escopo: 'nacional', descricao: 'Feriado' }]])],
    ]),
    vigentes: new Map([
      ['businessmap|fluxo', { calendarioId: '1', vigenteDe: '2026-11-03' }], ['businessmap|apontamento', { calendarioId: '1', vigenteDe: '2026-11-03' }],
      ['acelerato|sustentacao', { calendarioId: '2', vigenteDe: '2026-11-03' }],
    ]),
    ultimas: new Map([['businessmap|fluxo', '2026-11-03']]), ultimaVersao: new Map([['businessmap', '2026-11-03']]), ...extra,
  });
  it('idempotente: nada a gravar quando o arquivo já está gravado', () => {
    expect(planejarCalendario(arquivo(), gravado(), HOJE).dominios.every((d) => !d.mudou)).toBe(true);
  });
  it('feriado novo só entra o novo; o gravado com outro escopo ou descrição fica e é contado', () => {
    const cals = [{ ...BM, feriados: [f('2026-11-02', 'estadual', 'Outro nome'), f('2026-11-15'), f('2026-12-25')] }, AC];
    const p = planejarCalendario(arquivo(cals), gravado(), HOJE);
    expect(p.dominios[0]).toMatchObject({ feriadosNovos: [{ calendario: 'cal-bm', data: '2026-12-25' }], abrir: [], fechar: [], mudou: true });
    expect(p.dominios[1]!.mudou).toBe(false);
    expect(p.feriadosDivergentes).toBe(1);
  });
  it('aplicação para outro calendário fecha a vigente e abre a nova', () => {
    const outro = { ...BM, nome: 'cal-bm2' };
    const p = planejarCalendario(arquivo([outro, AC], [{ ...APL[0]!, calendario: 'cal-bm2' }, APL[2]!]), gravado(), HOJE);
    expect(p.dominios[0]).toMatchObject({ calendariosNovos: ['cal-bm2'], fechar: ['fluxo'], abrir: [{ classe: 'fluxo', calendario: 'cal-bm2' }] });
  });
  it('deslocamento diferente de calendário gravado é recusado', () => {
    expect(() => planejarCalendario(arquivo([{ ...BM, offset_minutos: -120 }, AC]), gravado(), HOJE)).toThrow(/deslocamento/);
  });
  it('data que não é posterior à última vigência da aplicação é recusada (só quando a aplicação muda)', () => {
    const outro = { ...BM, nome: 'cal-bm2' };
    const apl = [{ ...APL[0]!, calendario: 'cal-bm2' }, APL[2]!];
    expect(() => planejarCalendario(arquivo([outro, AC], apl), gravado(), '2026-11-03')).toThrow(/última vigência/);
    expect(planejarCalendario(arquivo(), gravado(), '2026-11-03').dominios.every((d) => !d.mudou)).toBe(true);
  });
  it('data anterior à última versão do calendário é recusada quando há mudança', () => {
    const cals = [{ ...BM, feriados: [f('2026-12-25')] }, AC];
    expect(() => planejarCalendario(arquivo(cals), gravado({ ultimas: new Map() }), '2026-11-02')).toThrow(/anterior à última versão/);
    expect(planejarCalendario(arquivo(cals), gravado({ ultimas: new Map() }), '2026-11-03').dominios[0]!.mudou).toBe(true);
  });
});

describe('planejarCalendario com turnos (D3b, Decisão 13)', () => {
  const ACT: Cal = { ...AC, turnos: T528 };
  const base = (): EstadoCalendario => ({
    calendarios: new Map([['cal-bm', { id: '1', offsetMinutos: -180 }], ['cal-ac', { id: '2', offsetMinutos: -180 }]]),
    feriados: new Map([
      ['cal-bm', new Map([['2026-11-02', { escopo: 'nacional', descricao: 'Feriado' }], ['2026-11-15', { escopo: 'nacional', descricao: 'Feriado' }]])],
      ['cal-ac', new Map([['2026-11-02', { escopo: 'nacional', descricao: 'Feriado' }]])],
    ]),
    vigentes: new Map([
      ['businessmap|fluxo', { calendarioId: '1', vigenteDe: '2026-11-03' }], ['businessmap|apontamento', { calendarioId: '1', vigenteDe: '2026-11-03' }],
      ['acelerato|sustentacao', { calendarioId: '2', vigenteDe: '2026-11-03' }],
    ]),
    ultimas: new Map(), ultimaVersao: new Map(),
  });
  const gravados = (turnos: [number, number][], dias = [1, 2, 3, 4, 5]) => dias.flatMap((d) => turnos.map(([i, f]) => ({ diaSemana: d, inicioMin: i, fimMin: f })));
  const T528G = gravados([[480, 720], [780, 1068]]);

  it('sem turnos gravados: abre os turnos do calendário que os declara, e só dele (o BusinessMap sem `turnos` não é tocado)', () => {
    const p = planejarCalendario(arquivo([BM, ACT]), base(), HOJE);
    expect(p.dominios[0]!.turnos).toEqual([]);
    expect(p.dominios[0]!.mudou).toBe(false);
    expect(p.dominios[1]).toMatchObject({ turnos: [{ calendario: 'cal-ac', fechar: false, inserir: [{ inicioMin: 480, fimMin: 720 }, { inicioMin: 780, fimMin: 1068 }] }], mudou: true });
  });
  it('turnos iguais aos vigentes: nada a gravar (idempotente)', () => {
    const e = { ...base(), turnos: new Map([['cal-ac', T528G]]), ultimasTurnos: new Map([['cal-ac', '2026-11-03']]) };
    expect(planejarCalendario(arquivo([BM, ACT]), e, '2026-11-03').dominios.every((d) => !d.mudou)).toBe(true);
  });
  it('turnos diferentes (fim do dia 17:00): fecha os vigentes e abre os novos', () => {
    const e = { ...base(), turnos: new Map([['cal-ac', gravados([[480, 720], [780, 1020]])]]), ultimasTurnos: new Map([['cal-ac', '2026-11-03']]) };
    const p = planejarCalendario(arquivo([BM, ACT]), e, HOJE);
    expect(p.dominios[1]).toMatchObject({ turnos: [{ calendario: 'cal-ac', fechar: true }], mudou: true });
  });
  it('turnos vigentes só em parte dos dias, ou com dia a mais (sábado): são trocados, não aceitos como iguais', () => {
    for (const g of [gravados([[480, 720], [780, 1068]], [1, 2, 3]), [...T528G, { diaSemana: 6, inicioMin: 480, fimMin: 720 }]]) {
      const e = { ...base(), turnos: new Map([['cal-ac', g]]) };
      expect(planejarCalendario(arquivo([BM, ACT]), e, HOJE).dominios[1]!.turnos).toHaveLength(1);
    }
  });
  it('data que não é posterior à última vigência dos turnos é recusada', () => {
    const e = { ...base(), turnos: new Map([['cal-ac', gravados([[480, 720], [780, 1020]])]]), ultimasTurnos: new Map([['cal-ac', HOJE]]) };
    expect(() => planejarCalendario(arquivo([BM, ACT]), e, HOJE)).toThrow(/turnos de cal-ac.*não é posterior à última vigência/);
  });
});

describe('sincronizarCalendario (dublê de PostgreSQL)', () => {
  type Banco = {
    calendarios?: { calendario_id: string; nome: string; offset_minutos: number }[];
    feriados?: { nome: string; data: string; escopo: string; descricao: string }[];
    aplicacoes?: { dominio: string; classe: string; calendario_id: string; vigente_de: string; vigente_ate: string | null }[];
    turnos?: { calendario_id: string; dia_semana: number; inicio_min: number; fim_min: number; vigente_de: string; vigente_ate: string | null }[];
    versoes?: { dominio: string; ultima: string }[];
    versaoExistente?: boolean;
  };
  let proximo = 100;
  const montar = (b: Banco = {}) => criarDublePg((q) => {
    const t = q.texto;
    if (t.includes('FROM dspd_core.ref_calendario WHERE nome = ANY')) return b.calendarios ?? [];
    if (t.includes('FROM dspd_core.ref_calendario WHERE nome = $1')) return (b.calendarios ?? []).filter((c) => c.nome === q.valores[0]);
    if (t.includes('FROM dspd_core.ref_calendario_turno')) return b.turnos ?? [];
    if (t.includes('FROM dspd_core.ref_feriado')) return b.feriados ?? [];
    if (t.includes('FROM dspd_core.ref_calendario_aplicacao')) return b.aplicacoes ?? [];
    if (t.includes('max(vigente_desde)')) return b.versoes ?? [];
    if (t.includes('SELECT versao_id FROM')) return b.versaoExistente === true ? [{ versao_id: '7' }] : [];
    if (t.startsWith('INSERT INTO dspd_core.ref_calendario (')) return [{ calendario_id: String(proximo++) }];
    if (t.includes('RETURNING versao_id')) return [{ versao_id: '9' }];
    return [];
  });
  const gravacoes = (d: ReturnType<typeof montar>): Chamada[] => d.chamadas.filter((c) => /^(INSERT|UPDATE)/.test(c.texto));
  const alvo = (c: Chamada): string => c.texto.split(' (')[0]!.replace(/\s+SET.*/s, '');
  const lido = analisarCalendario(texto());

  it('carga inicial: calendários, versão por domínio com métricas, feriados e aplicações, numa transação, sem DELETE', async () => {
    const d = montar();
    const r = await sincronizarCalendario(d.pool, S, lido, HOJE, AGORA);
    expect(r.dominios).toEqual([
      { dominio: 'businessmap', calendariosNovos: 1, feriadosNovos: 2, aplicacoesAbertas: 2, aplicacoesFechadas: 0, turnosAbertos: 0, turnosFechados: 0, versaoRegistrada: true },
      { dominio: 'acelerato', calendariosNovos: 1, feriadosNovos: 1, aplicacoesAbertas: 1, aplicacoesFechadas: 0, turnosAbertos: 0, turnosFechados: 0, versaoRegistrada: true },
    ]);
    const g = gravacoes(d);
    const versoes = g.filter((c) => c.texto.includes('ref_versao_criterio ('));
    expect(versoes.map((c) => [c.valores[0], c.valores[1], c.valores[4]])).toEqual([
      [HOJE, 'businessmap', `069:calendario:businessmap:${lido.sha256}`], [HOJE, 'acelerato', `069:calendario:acelerato:${lido.sha256}`],
    ]);
    const metricas = g.filter((c) => c.texto.includes('ref_versao_criterio_metrica'));
    expect(metricas).toHaveLength(METRICAS_CALENDARIO.businessmap.length + METRICAS_CALENDARIO.acelerato.length);
    const feriadosBm = g.find((c) => c.texto.includes('ref_feriado') && c.valores[0] === '100')!;
    expect(feriadosBm.valores).toEqual(['100', ['2026-11-02', '2026-11-15'], ['nacional', 'nacional'], ['Feriado', 'Feriado'], '9']);
    expect(g.filter((c) => c.texto.includes('ref_calendario_aplicacao')).map((c) => c.valores)).toEqual([
      ['businessmap', 'fluxo', HOJE, '100'], ['businessmap', 'apontamento', HOJE, '100'], ['acelerato', 'sustentacao', HOJE, '101'],
    ]);
    expect(g.filter((c) => alvo(c) === 'INSERT INTO dspd_core.ref_calendario').map((c) => c.valores)).toEqual([['cal-bm', -180, 'BM'], ['cal-ac', -180, null]]);
    expect(d.chamadas[0]!.texto).toBe('BEGIN');
    expect(d.chamadas.at(-1)!.texto).toBe('COMMIT');
    expect(d.chamadas.some((c) => /DELETE|TRUNCATE|UPDATE dspd_core.ref_feriado/.test(c.texto))).toBe(false);
  });
  it('idempotente: com tudo gravado nada é escrito e nenhuma versão é registrada', async () => {
    const d = montar({
      calendarios: [{ calendario_id: '1', nome: 'cal-bm', offset_minutos: -180 }, { calendario_id: '2', nome: 'cal-ac', offset_minutos: -180 }],
      feriados: [
        { nome: 'cal-bm', data: '2026-11-02', escopo: 'nacional', descricao: 'Feriado' }, { nome: 'cal-bm', data: '2026-11-15', escopo: 'nacional', descricao: 'Feriado' },
        { nome: 'cal-ac', data: '2026-11-02', escopo: 'nacional', descricao: 'Feriado' },
      ],
      aplicacoes: [
        { dominio: 'businessmap', classe: 'fluxo', calendario_id: '1', vigente_de: '2026-11-01', vigente_ate: null },
        { dominio: 'businessmap', classe: 'apontamento', calendario_id: '1', vigente_de: '2026-11-01', vigente_ate: null },
        { dominio: 'acelerato', classe: 'sustentacao', calendario_id: '2', vigente_de: '2026-11-01', vigente_ate: null },
      ],
    });
    const r = await sincronizarCalendario(d.pool, S, lido, HOJE, AGORA);
    expect(r.dominios.every((x) => !x.versaoRegistrada && x.feriadosNovos === 0 && x.aplicacoesAbertas === 0)).toBe(true);
    expect(gravacoes(d)).toEqual([]);
  });
  it('segunda carga com feriado novo: só insere o novo, com versão nova, e não toca nas aplicações', async () => {
    const novo = analisarCalendario(texto([{ ...BM, feriados: [...BM.feriados, f('2027-01-01')] }, AC]));
    const d = montar({
      calendarios: [{ calendario_id: '1', nome: 'cal-bm', offset_minutos: -180 }, { calendario_id: '2', nome: 'cal-ac', offset_minutos: -180 }],
      feriados: [
        { nome: 'cal-bm', data: '2026-11-02', escopo: 'nacional', descricao: 'Feriado' }, { nome: 'cal-bm', data: '2026-11-15', escopo: 'nacional', descricao: 'Feriado' },
        { nome: 'cal-ac', data: '2026-11-02', escopo: 'nacional', descricao: 'Feriado' },
      ],
      aplicacoes: [
        { dominio: 'businessmap', classe: 'fluxo', calendario_id: '1', vigente_de: '2026-10-01', vigente_ate: '2026-10-20' },
        { dominio: 'businessmap', classe: 'fluxo', calendario_id: '1', vigente_de: '2026-10-20', vigente_ate: null },
        { dominio: 'businessmap', classe: 'apontamento', calendario_id: '1', vigente_de: '2026-11-01', vigente_ate: null },
        { dominio: 'acelerato', classe: 'sustentacao', calendario_id: '2', vigente_de: '2026-11-01', vigente_ate: null },
      ],
      versoes: [{ dominio: 'businessmap', ultima: '2026-11-01' }],
    });
    const r = await sincronizarCalendario(d.pool, S, novo, HOJE, AGORA);
    expect(r.dominios.map((x) => [x.dominio, x.feriadosNovos, x.versaoRegistrada])).toEqual([['businessmap', 1, true], ['acelerato', 0, false]]);
    const g = gravacoes(d);
    expect(g.filter((c) => c.texto.includes('ref_feriado')).map((c) => c.valores[1])).toEqual([['2027-01-01']]);
    expect(g.some((c) => c.texto.includes('ref_calendario_aplicacao'))).toBe(false);
    expect(g.filter((c) => c.texto.includes('ref_versao_criterio (')).map((c) => c.valores[1])).toEqual(['businessmap']);
  });
  it('troca de calendário da classe: UPDATE só de vigente_ate e INSERT da nova; a versão do mesmo hash não se repete', async () => {
    const outro = { ...BM, nome: 'cal-bm2', feriados: BM.feriados };
    const novo = analisarCalendario(texto([outro, AC], [{ ...APL[0]!, calendario: 'cal-bm2' }, APL[2]!]));
    const d = montar({
      calendarios: [{ calendario_id: '1', nome: 'cal-bm', offset_minutos: -180 }, { calendario_id: '2', nome: 'cal-ac', offset_minutos: -180 }],
      feriados: [{ nome: 'cal-ac', data: '2026-11-02', escopo: 'nacional', descricao: 'Feriado' }],
      aplicacoes: [
        { dominio: 'businessmap', classe: 'fluxo', calendario_id: '1', vigente_de: '2026-10-01', vigente_ate: null },
        { dominio: 'acelerato', classe: 'sustentacao', calendario_id: '2', vigente_de: '2026-10-01', vigente_ate: null },
      ],
      versaoExistente: true,
    });
    const r = await sincronizarCalendario(d.pool, S, novo, HOJE, AGORA);
    expect(r.dominios[0]).toMatchObject({ aplicacoesFechadas: 1, aplicacoesAbertas: 1, versaoRegistrada: false });
    const g = gravacoes(d);
    const up = g.find((c) => c.texto.startsWith('UPDATE'))!;
    expect(up.texto).toMatch(/^UPDATE dspd_core\.ref_calendario_aplicacao SET vigente_ate = \$1 WHERE vigente_ate IS NULL/);
    expect(up.valores).toEqual([HOJE, 'businessmap', 'fluxo']);
    expect(g.some((c) => c.texto.includes('ref_versao_criterio'))).toBe(false);
  });
  it('D3b: calendário com turnos grava 5 dias x turnos na transação (sem fechar na carga inicial), só dele e sem UPDATE de valor', async () => {
    const d = montar();
    const r = await sincronizarCalendario(d.pool, S, analisarCalendario(texto([BM, { ...AC, turnos: T528 }])), HOJE, AGORA);
    expect(r.dominios.map((x) => [x.dominio, x.turnosAbertos, x.turnosFechados])).toEqual([['businessmap', 0, 0], ['acelerato', 10, 0]]);
    const g = gravacoes(d).filter((c) => c.texto.includes('ref_calendario_turno'));
    expect(g).toHaveLength(1);
    expect(g[0]!.texto).toMatch(/^INSERT INTO dspd_core\.ref_calendario_turno/);
    expect(g[0]!.valores.slice(1)).toEqual([[1, 1, 2, 2, 3, 3, 4, 4, 5, 5], [480, 780, 480, 780, 480, 780, 480, 780, 480, 780], [720, 1068, 720, 1068, 720, 1068, 720, 1068, 720, 1068], HOJE]);
    expect(typeof g[0]!.valores[0]).toBe('string');
    expect(d.chamadas.at(-1)!.texto).toBe('COMMIT');
  });
  it('D3b: turnos diferentes dos vigentes fecham os vigentes antes de inserir os novos; turnos iguais não escrevem nada', async () => {
    const cals = [{ calendario_id: '1', nome: 'cal-bm', offset_minutos: -180 }, { calendario_id: '2', nome: 'cal-ac', offset_minutos: -180 }];
    const feriados = [
      { nome: 'cal-bm', data: '2026-11-02', escopo: 'nacional', descricao: 'Feriado' }, { nome: 'cal-bm', data: '2026-11-15', escopo: 'nacional', descricao: 'Feriado' },
      { nome: 'cal-ac', data: '2026-11-02', escopo: 'nacional', descricao: 'Feriado' },
    ];
    const aplicacoes = [
      { dominio: 'businessmap', classe: 'fluxo', calendario_id: '1', vigente_de: '2026-11-01', vigente_ate: null },
      { dominio: 'businessmap', classe: 'apontamento', calendario_id: '1', vigente_de: '2026-11-01', vigente_ate: null },
      { dominio: 'acelerato', classe: 'sustentacao', calendario_id: '2', vigente_de: '2026-11-01', vigente_ate: null },
    ];
    const linha = (dia: number, i: number, f: number) => ({ calendario_id: '2', dia_semana: dia, inicio_min: i, fim_min: f, vigente_de: '2026-11-01', vigente_ate: null });
    const turnos480 = [1, 2, 3, 4, 5].flatMap((d) => [linha(d, 480, 720), linha(d, 780, 1020)]);
    // vigências antigas já fechadas contam só para a data (a última, inclusive a fechada no próprio dia em que abriu); não são turnos vigentes
    const fechadas = [{ ...linha(1, 480, 720), vigente_de: '2026-10-01', vigente_ate: '2026-10-15' }, { ...linha(1, 480, 700), vigente_de: '2026-10-15', vigente_ate: '2026-10-15' }];
    const novo = analisarCalendario(texto([BM, { ...AC, turnos: T528 }]));
    const d = montar({ calendarios: cals, feriados, aplicacoes, turnos: [...fechadas, ...turnos480], versoes: [{ dominio: 'acelerato', ultima: '2026-11-01' }] });
    const r = await sincronizarCalendario(d.pool, S, novo, HOJE, AGORA);
    expect(r.dominios[1]).toMatchObject({ turnosAbertos: 10, turnosFechados: 1, versaoRegistrada: true });
    const g = gravacoes(d).filter((c) => c.texto.includes('ref_calendario_turno'));
    expect(g.map((c) => c.texto.split(' ')[0])).toEqual(['UPDATE', 'INSERT']);
    expect(g[0]!.texto).toMatch(/SET vigente_ate = \$1 WHERE vigente_ate IS NULL AND calendario_id = \$2::smallint$/);
    expect(g[0]!.valores).toEqual([HOJE, '2']);
    const igual = montar({ calendarios: cals, feriados, aplicacoes, turnos: [1, 2, 3, 4, 5].flatMap((x) => [linha(x, 480, 720), linha(x, 780, 1068)]) });
    await sincronizarCalendario(igual.pool, S, novo, HOJE, AGORA);
    expect(gravacoes(igual)).toEqual([]);
  });
  it('arquivo recusado ou vigência recusada: ROLLBACK e nada gravado', async () => {
    const d = montar({
      calendarios: [{ calendario_id: '1', nome: 'cal-bm', offset_minutos: -120 }],
    });
    await expect(sincronizarCalendario(d.pool, S, lido, HOJE, AGORA)).rejects.toBeInstanceOf(ErroCalendario);
    expect(gravacoes(d)).toEqual([]);
    expect(d.chamadas.at(-1)!.texto).toBe('ROLLBACK');
  });
});
