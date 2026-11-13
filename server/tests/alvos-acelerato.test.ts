import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ARQUIVO_ALVOS, ErroAlvos, METRICAS_ALVOS, analisarAlvos, lerArquivoAlvos, planejarAlvos, referenciaDaVersaoAlvos,
  type EstadoAlvos,
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
  const vig = (p: string, pa: number, upa: 'corrido' | 'util', r: number, ur: 'corrido' | 'util', de = '2026-01-01') => ({ prioridade: p, vigenteDe: de, paHoras: pa, unidadePa: upa, rHoras: r, unidadeR: ur });
  const iguais: EstadoAlvos = {
    vigentes: new Map(arquivo.alvos.map((a) => [a.prioridade, vig(a.prioridade, a.primeiro_atendimento.horas, a.primeiro_atendimento.unidade, a.restauracao.horas, a.restauracao.unidade)])),
    ultimas: new Map(arquivo.alvos.map((a) => [a.prioridade, '2026-01-01'])),
    ultimaVersao: undefined,
  };
  const vazio: EstadoAlvos = { vigentes: new Map(), ultimas: new Map(), ultimaVersao: undefined };

  it('sem nada gravado: insere as 5 prioridades, nenhuma a fechar, e há versão de critério a registrar', () => {
    const p = planejarAlvos(arquivo, vazio, '2026-11-12');
    expect(p.inserir.map((x) => x.prioridade)).toEqual(['P1', 'P2', 'P3', 'P4', 'P5']);
    expect(p.inserir[0]).toEqual({ prioridade: 'P1', paHoras: 0.25, unidadePa: 'corrido', rHoras: 4, unidadeR: 'corrido' });
    expect(p.fechar).toEqual([]);
    expect(p.mudou).toBe(true);
  });
  it('vigente igual (valor e unidade): nada a fazer, e repetir não registra versão', () => {
    expect(planejarAlvos(arquivo, iguais, '2026-11-12')).toEqual({ inserir: [], fechar: [], mudou: false });
  });
  it('só a unidade difere (valor igual): fecha a vigente e abre a nova, só dessa prioridade', () => {
    const e: EstadoAlvos = { ...iguais, vigentes: new Map(iguais.vigentes).set('P2', vig('P2', 0.5, 'util', 8, 'util')) };
    const p = planejarAlvos(arquivo, e, '2026-11-12');
    expect(p.fechar).toEqual(['P2']);
    expect(p.inserir.map((x) => [x.prioridade, x.unidadePa])).toEqual([['P2', 'corrido']]);
    expect(p.mudou).toBe(true);
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
});
