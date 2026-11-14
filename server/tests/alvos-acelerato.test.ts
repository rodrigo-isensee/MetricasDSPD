import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ARQUIVO_ALVOS, ErroAlvos, METRICAS_ALVOS, analisarAlvos, lerArquivoAlvos, planejarAlvos, referenciaDaVersaoAlvos, unidadeDeExibicao,
  type EstadoAlvos, type UnidadeExibicaoAlvo,
} from '../src/modulos/referencia/alvos-acelerato.js';

// Pedido 099, D3 (Q-099-5a e Q-099-11): o arquivo versionado de alvos e o planejamento puro (sem banco). O `.pg` cobre a gravação.
type Celula = Record<string, unknown>;
type Doc = { versao: unknown; horas_por_dia_util?: unknown; versao_criterio?: unknown; alvos: { prioridade: unknown; primeiro_atendimento: Celula; restauracao: Celula; [k: string]: unknown }[] };
const bruto = (): Doc => JSON.parse(readFileSync(ARQUIVO_ALVOS, 'utf8'));
const texto = (mexer: (d: Doc) => void): string => { const d = bruto(); mexer(d); return JSON.stringify(d); };
const recusa = (t: string): string => { try { analisarAlvos(t); } catch (e) { expect(e).toBeInstanceOf(ErroAlvos); return (e as Error).message; } throw new Error('não recusou'); };

describe('arquivo acelerato-alvos.json (PROC 30.000.010 v002)', () => {
  const { arquivo, sha256 } = lerArquivoAlvos();
  it('traz os 10 prazos em horas, já com a unidade da Q-099-11 por célula: P1 (os dois) e o primeiro atendimento de P2 em tempo corrido', () => {
    expect(arquivo.fonte).toBe('PROC 30.000.010 v002');
    expect(arquivo.alvos.map((a) => [a.prioridade, a.primeiro_atendimento.horas, a.primeiro_atendimento.unidade, a.restauracao.horas, a.restauracao.unidade])).toEqual([
      ['P1', 0.25, 'corrido', 4, 'corrido'], ['P2', 0.5, 'corrido', 8, 'util'], ['P3', 2, 'util', 17.6, 'util'], ['P4', 4, 'util', 44, 'util'], ['P5', 8.8, 'util', 88, 'util'],
    ]);
    expect(sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(referenciaDaVersaoAlvos(sha256)).toBe(`099:alvos:${sha256}`);
    expect(arquivo.versao_criterio.motivo).toContain('Q-099-11');
    expect(arquivo.versao_criterio.motivo).toContain('Decisão 13');
    expect(arquivo.versao).toBe(2);
    expect(arquivo.horas_por_dia_util).toBe(8.8);
  });
  it('a versão de critério afeta a S1 e a Visão geral, que lê calcularS1 (A1 do QA; T2.6)', () => {
    expect(METRICAS_ALVOS).toEqual(['S1', 'VISAO_GERAL']);
  });
  it('o texto do PROC ao lado confere com as horas (dia útil = 8,8 h, Decisão 13; tabela fixa, não leitura do texto em produção)', () => {
    const horasDoTexto = (t: string): number => {
      const n = Number(/(\d+)/.exec(t)![1]);
      return /dia/.test(t) ? Math.round(n * 8.8 * 100) / 100 : /minuto/.test(t) ? n / 60 : n;
    };
    for (const a of arquivo.alvos) for (const c of [a.primeiro_atendimento, a.restauracao]) {
      expect(c.horas, `${a.prioridade} ${c.texto_proc}`).toBe(horasDoTexto(c.texto_proc));
      expect(c.unidade, `${a.prioridade} ${c.texto_proc}`).toBe(/út(eis|il)/.test(c.texto_proc) ? 'util' : 'corrido');
    }
  });
});

/** Unidade de exibição de cada prazo do arquivo de hoje (K-314, Q-099-11), pelo texto do PROC. */
const EXIBICAO: Record<string, [UnidadeExibicaoAlvo, UnidadeExibicaoAlvo]> = { P1: ['min', 'h'], P2: ['min', 'h'], P3: ['h', 'dia'], P4: ['h', 'dia'], P5: ['dia', 'dia'] };

describe('unidadeDeExibicao (K-314): expressão fechada sobre o texto do PROC, com a quantidade conferida contra as horas', () => {
  it('os 10 textos do arquivo de hoje dão a unidade do PROC', () => {
    const { arquivo } = lerArquivoAlvos();
    const got = arquivo.alvos.map((a) => [a.prioridade, ...[a.primeiro_atendimento, a.restauracao].map((c) => unidadeDeExibicao(c.texto_proc, c.horas, arquivo.horas_por_dia_util, c.unidade))]);
    expect(got).toEqual(Object.entries(EXIBICAO).map(([p, [a, b]]) => [p, a, b]));
  });
  it.each<[string, string, number, 'corrido' | 'util', UnidadeExibicaoAlvo]>([
    ['Até 15 minutos', 'minutos', 0.25, 'corrido', 'min'],
    ['Até 1 minuto', 'minuto', 0.02, 'corrido', 'min'],
    ['até 1 hora', 'hora', 1, 'util', 'h'],
    ['  ATÉ   4   HORAS  ', 'espaços e caixa', 4, 'corrido', 'h'],
    ['Até 1 dia útil', 'dia', 8.8, 'util', 'dia'],
    ['Até 10 dias úteis', 'dias', 88, 'util', 'dia'],
    ['Até 2 dias', 'dias sem a palavra útil', 17.6, 'util', 'dia'],
    ['Até 2 horas úteis', 'horas úteis', 2, 'util', 'h'],
    ['Ate\u0301 2 horas', 'acento decomposto (NFC)', 2, 'util', 'h'],
  ])('%s (%s) = %s h, relógio %s -> %s', (t, _n, h, r, esperado) => {
    expect(unidadeDeExibicao(t, h, 8.8, r)).toBe(esperado);
  });
  it.each<[string, number, 'corrido' | 'util', RegExp]>([
    ['Até 1 semana', 40, 'util', /não segue/],
    ['Em até 2 horas', 2, 'util', /não segue/],
    ['Até 2,5 horas', 2.5, 'util', /não segue/],
    ['Até 2 horas corridas', 2, 'corrido', /não segue/],
    ['Até 1 dia corrido', 24, 'corrido', /não segue/],
    ['Até 2 horas e 30 minutos', 2.5, 'util', /não segue/],
    ['', 1, 'util', /não segue/],
    ['Até 16 minutos', 0.25, 'corrido', /não bate/],
    ['Até 3 horas', 2, 'util', /não bate/],
    ['Até 2 dias úteis', 16, 'util', /não bate/],
    ['Até 1 dia útil', 8, 'util', /não bate/],
    ['Até 2 dias úteis', 17.6, 'corrido', /dias com relógio corrido/],
  ])('recusa "%s" (%s h, %s)', (t, h, r, msg) => {
    expect(() => unidadeDeExibicao(t, h, 8.8, r)).toThrow(msg);
    expect(() => unidadeDeExibicao(t, h, 8.8, r)).toThrow(ErroAlvos);
  });
  it('a conta do dia usa as horas do dia útil do arquivo, não uma constante', () => {
    expect(unidadeDeExibicao('Até 2 dias úteis', 16, 8, 'util')).toBe('dia');
    expect(() => unidadeDeExibicao('Até 2 dias úteis', 16, 8.8, 'util')).toThrow(/não bate/);
  });
  it('o arquivo inteiro é recusado, dizendo a célula, quando um texto sai da expressão, a quantidade diverge ou há dia corrido', () => {
    const m1 = recusa(texto((d) => { d.alvos[2]!.restauracao.texto_proc = 'Até 1 semana'; }));
    expect(m1).toContain('alvos.2.restauracao');
    expect(m1).toContain('unidade de exibição');
    expect(recusa(texto((d) => { d.alvos[0]!.primeiro_atendimento.texto_proc = 'Até 16 minutos'; }))).toMatch(/alvos\.0\.primeiro_atendimento.*não bate/);
    expect(recusa(texto((d) => { d.alvos[3]!.restauracao.unidade = 'corrido'; }))).toMatch(/alvos\.3\.restauracao.*dias com relógio corrido/);
  });
  it('a palavra útil não é conferida contra o relógio: trocar só a unidade no arquivo segue válido (caminho da Q-099-11 reaberta)', () => {
    const l = analisarAlvos(texto((d) => { d.alvos[0]!.primeiro_atendimento.unidade = 'util'; }));
    expect(l.arquivo.alvos[0]!.primeiro_atendimento.unidade).toBe('util');
  });
});

describe('analisarAlvos: arquivo inválido é recusado inteiro, com mensagem sem o conteúdo', () => {
  it.each<[string, (d: Doc) => void]>([
    ['prioridade repetida', (d) => { d.alvos[1]!.prioridade = 'P1'; }],
    ['prioridade fora de P1 a P5', (d) => { d.alvos[4]!.prioridade = 'P6'; }],
    ['prioridade faltando', (d) => { d.alvos.pop(); }],
    ['unidade fora de corrido e util', (d) => { d.alvos[2]!.restauracao.unidade = 'dias'; }],
    ['horas zero', (d) => { d.alvos[2]!.restauracao.horas = 0; }],
    ['horas negativas', (d) => { d.alvos[2]!.primeiro_atendimento.horas = -1; }],
    ['horas com mais de duas casas', (d) => { d.alvos[2]!.primeiro_atendimento.horas = 0.125; }],
    ['horas além de numeric(8,2)', (d) => { d.alvos[2]!.restauracao.horas = 1_000_000; }],
    ['horas em texto', (d) => { d.alvos[2]!.restauracao.horas = '4'; }],
    ['campo a mais', (d) => { d.alvos[0]!.extra = 1; }],
    ['campo a mais na célula', (d) => { d.alvos[0]!.restauracao.nome = 'x'; }],
    ['versão diferente de 2', (d) => { d.versao = 1; }],
    ['sem horas por dia útil', (d) => { delete d.horas_por_dia_util; }],
    ['horas por dia útil zero', (d) => { d.horas_por_dia_util = 0; }],
    ['horas por dia útil acima de 24', (d) => { d.horas_por_dia_util = 25; }],
    ['horas por dia útil com mais de duas casas', (d) => { d.horas_por_dia_util = 8.123; }],
    ['texto do PROC com arroba', (d) => { d.alvos[0]!.restauracao.texto_proc = 'a@b.c'; }],
    ['sem versão de critério', (d) => { delete d.versao_criterio; }],
  ])('%s', (_nome, mexer) => {
    expect(recusa(texto(mexer))).toMatch(/o arquivo de alvos é inválido/);
  });
  it('JSON quebrado', () => {
    expect(recusa('{')).toBe('o arquivo de alvos não é um JSON válido');
  });
  it('o hash é o do texto exato (espaço a mais muda o hash)', () => {
    const t = readFileSync(ARQUIVO_ALVOS, 'utf8');
    expect(analisarAlvos(t).sha256).not.toBe(analisarAlvos(`${t} `).sha256);
  });
});

describe('planejarAlvos (puro)', () => {
  const { arquivo } = lerArquivoAlvos();
  const vig = (p: string, pa: number, upa: 'corrido' | 'util', r: number, ur: 'corrido' | 'util', de = '2026-01-01', exibir: [UnidadeExibicaoAlvo | null, UnidadeExibicaoAlvo | null] = EXIBICAO[p] ?? [null, null]) =>
    ({ prioridade: p, vigenteDe: de, paHoras: pa, unidadePa: upa, rHoras: r, unidadeR: ur, exibirPa: exibir[0], exibirR: exibir[1] });
  const iguais: EstadoAlvos = {
    vigentes: new Map(arquivo.alvos.map((a) => [a.prioridade, vig(a.prioridade, a.primeiro_atendimento.horas, a.primeiro_atendimento.unidade, a.restauracao.horas, a.restauracao.unidade)])),
    ultimas: new Map(arquivo.alvos.map((a) => [a.prioridade, '2026-01-01'])),
    ultimaVersao: undefined,
  };
  const vazio: EstadoAlvos = { vigentes: new Map(), ultimas: new Map(), ultimaVersao: undefined };

  it('sem nada gravado: insere as 5 prioridades, nenhuma a fechar, e há versão de critério a registrar', () => {
    const p = planejarAlvos(arquivo, vazio, '2026-11-12');
    expect(p.inserir.map((x) => x.prioridade)).toEqual(['P1', 'P2', 'P3', 'P4', 'P5']);
    expect(p.inserir[0]).toEqual({ prioridade: 'P1', paHoras: 0.25, unidadePa: 'corrido', rHoras: 4, unidadeR: 'corrido', exibirPa: 'min', exibirR: 'h' });
    expect(p.inserir.map((x) => [x.exibirPa, x.exibirR])).toEqual(Object.values(EXIBICAO));
    expect(p.mudouCriterio).toBe(true);
    expect(p.mudouExibicao).toBe(false);
    expect(p.fechar).toEqual([]);
    expect(p.mudou).toBe(true);
  });
  it('vigente igual (valor, relógio e exibição): nada a fazer, e repetir não registra versão', () => {
    expect(planejarAlvos(arquivo, iguais, '2026-11-12')).toEqual({ inserir: [], fechar: [], mudou: false, mudouCriterio: false, mudouExibicao: false });
  });
  it('só o relógio difere (valor igual): fecha a vigente e abre a nova, só dessa prioridade, e é mudança de critério', () => {
    const e: EstadoAlvos = { ...iguais, vigentes: new Map(iguais.vigentes).set('P2', vig('P2', 0.5, 'util', 8, 'util')) };
    const p = planejarAlvos(arquivo, e, '2026-11-12');
    expect(p.fechar).toEqual(['P2']);
    expect(p.inserir.map((x) => [x.prioridade, x.unidadePa])).toEqual([['P2', 'corrido']]);
    expect(p.mudou).toBe(true);
    expect([p.mudouCriterio, p.mudouExibicao]).toEqual([true, false]);
  });
  it('só a unidade de exibição difere: fecha e abre só dessa prioridade, sem mudança de critério (nenhum número muda)', () => {
    const e: EstadoAlvos = { ...iguais, vigentes: new Map(iguais.vigentes).set('P3', vig('P3', 2, 'util', 17.6, 'util', '2026-01-01', ['h', 'h'])) };
    const p = planejarAlvos(arquivo, e, '2026-11-12');
    expect(p.fechar).toEqual(['P3']);
    expect(p.inserir.map((x) => [x.prioridade, x.exibirPa, x.exibirR])).toEqual([['P3', 'h', 'dia']]);
    expect([p.mudou, p.mudouCriterio, p.mudouExibicao]).toEqual([true, false, true]);
  });
  it('vigente com exibição nula (anterior ao K-314): fecha e abre as 5 com a unidade, sem mudança de critério e sem UPDATE da coluna nova', () => {
    const e: EstadoAlvos = { ...iguais, vigentes: new Map(arquivo.alvos.map((a) => [a.prioridade, vig(a.prioridade, a.primeiro_atendimento.horas, a.primeiro_atendimento.unidade, a.restauracao.horas, a.restauracao.unidade, '2026-01-01', [null, null])])) };
    const p = planejarAlvos(arquivo, e, '2026-11-12');
    expect(p.fechar).toEqual(['P1', 'P2', 'P3', 'P4', 'P5']);
    expect(p.inserir).toHaveLength(5);
    expect([p.mudouCriterio, p.mudouExibicao]).toEqual([false, true]);
  });
  it('exibição e critério mudando juntos (em prioridades diferentes): conta como mudança de critério', () => {
    const vigentes = new Map(iguais.vigentes).set('P3', vig('P3', 2, 'util', 17.6, 'util', '2026-01-01', ['h', 'h'])).set('P5', vig('P5', 8, 'util', 88, 'util'));
    const p = planejarAlvos(arquivo, { ...iguais, vigentes }, '2026-11-12');
    expect([p.mudouCriterio, p.mudouExibicao]).toEqual([true, true]);
  });
  it('só o valor difere: fecha e abre a nova', () => {
    const e: EstadoAlvos = { ...iguais, vigentes: new Map(iguais.vigentes).set('P5', vig('P5', 8, 'util', 70, 'util')) };
    expect(planejarAlvos(arquivo, e, '2026-11-12').fechar).toEqual(['P5']);
  });
  it('mudança com data que não é posterior à última vigência é recusada, sem gravar nada', () => {
    const e: EstadoAlvos = { ...iguais, vigentes: new Map(iguais.vigentes).set('P2', vig('P2', 0.5, 'util', 8, 'util', '2026-11-12')), ultimas: new Map(iguais.ultimas).set('P2', '2026-11-12') };
    expect(() => planejarAlvos(arquivo, e, '2026-11-12')).toThrow(/P2.*não é posterior à última vigência/);
    expect(() => planejarAlvos(arquivo, e, '2026-11-11')).toThrow(ErroAlvos);
    expect(planejarAlvos(arquivo, e, '2026-11-13').fechar).toEqual(['P2']);
  });
  it('prioridade sem vigente mas com vigência encerrada: a data nova tem de ser posterior ao fim', () => {
    const e: EstadoAlvos = { vigentes: new Map(), ultimas: new Map([['P1', '2026-11-12']]), ultimaVersao: undefined };
    expect(() => planejarAlvos(arquivo, e, '2026-11-12')).toThrow(ErroAlvos);
  });
  it('versão de critério com data posterior à de hoje: recusa (não se registra versão com data passada)', () => {
    expect(() => planejarAlvos(arquivo, { ...vazio, ultimaVersao: '2026-12-01' }, '2026-11-12')).toThrow(/anterior à última versão de critério/);
    expect(() => planejarAlvos(arquivo, { ...iguais, ultimaVersao: '2026-12-01' }, '2026-11-12')).not.toThrow();
  });
  it('só exibição mudou: a guarda de data da versão de critério não vale (não há versão a registrar), mas a de vigência continua', () => {
    const nulas = new Map(arquivo.alvos.map((a) => [a.prioridade, vig(a.prioridade, a.primeiro_atendimento.horas, a.primeiro_atendimento.unidade, a.restauracao.horas, a.restauracao.unidade, '2026-01-01', [null, null])]));
    const e: EstadoAlvos = { ...iguais, vigentes: nulas, ultimaVersao: '2026-12-01' };
    expect(() => planejarAlvos(arquivo, e, '2026-11-12')).not.toThrow();
    expect(() => planejarAlvos(arquivo, { ...e, ultimas: new Map(iguais.ultimas).set('P1', '2026-11-12') }, '2026-11-12')).toThrow(/P1.*não é posterior/);
  });
});
