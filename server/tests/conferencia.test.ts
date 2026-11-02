import { describe, expect, it } from 'vitest';
import { analisarConferencia, ErroConferencia, lerConferencia } from '../src/modulos/businessmap/conferencia.js';
import { DEMAIS_TIMES, FORA_DE_TODO_CALCULO, FORA_DO_OPERACIONAL, TIMES, TIMES_PROPRIOS } from '../migrations/0019_bm_carga_inicial_times.js';

const real = lerConferencia();
const texto = (mudar: (c: Record<string, unknown>) => void): string => {
  const c = structuredClone(real) as unknown as Record<string, unknown>;
  mudar(c);
  return JSON.stringify(c);
};

describe('arquivo de conferência do BusinessMap (docs/architecture/fontes)', () => {
  it('o arquivo versionado é válido e traz as exceções e o mapa de tipos aceitos pelo dono', () => {
    expect(real.versao_criterio.dominio).toBe('businessmap');
    expect(real.excecoes_papel_coluna.map((c) => c.coluna_id)).toEqual(['1998', '2001', '2006', '2008', '1989', '2163', '2166', '2281', '2283', '2286']);
    expect(real.excecoes_papel_coluna.every((c) => c.papel === 'fila')).toBe(true);
    expect(real.excecoes_papel_trabalho.map((c) => `${c.workflow_id}/${c.coluna_id}`)).toEqual(['191/2532', '212/2027', '242/2314', '248/2326', '250/2346', '202/1721']);
    expect(real.excecoes_papel_trabalho.every((c) => c.papel === 'trabalho' && c.base.includes('2026-10-31'))).toBe(true);
    expect(real.colunas_descartado).toHaveLength(15);
    const mapa = new Map(real.mapa_tipos.tipos.map((t) => [t.nome, t]));
    expect(mapa.get('Sprint')).toEqual({ nome: 'Sprint', eh_item: false, categoria: null });
    expect(mapa.get('Bug de Equipe')?.categoria).toBe('bug_interno');
    expect(mapa.get('Incidente de Produção')?.categoria).toBe('defeito_producao');
    expect(mapa.get('Chamado')?.categoria).toBe('requisicao');
    expect(mapa.get('Débito técnico')?.categoria).toBe('divida_tecnica');
    expect(['Kaizen', 'Processos', 'Otimização processo'].map((n) => mapa.get(n)?.categoria)).toEqual(['melhoria', 'melhoria', 'melhoria']);
    expect(real.mapa_tipos.padrao).toEqual({ eh_item: true, categoria: 'produto' });
  });

  it('as colunas descartado dos workflows fora de cálculo correspondem à lista da carga inicial', () => {
    const foraDeCalculo = new Set(FORA_DE_TODO_CALCULO.map(([w]) => w));
    expect(real.colunas_descartado.filter((c) => foraDeCalculo.has(c.workflow_id)).map((c) => c.coluna_id)).toEqual(['3068']);
  });

  it('recusa arquivo sem versão de critério (e a mensagem não repete valor)', () => {
    expect(() => analisarConferencia(texto((c) => { delete c.versao_criterio; }))).toThrow(/sem versão de critério/);
    expect(() => analisarConferencia('[]')).toThrow(ErroConferencia);
  });

  it('recusa JSON inválido, raiz nula, campo desconhecido, papel fora da lista, coluna repetida e tipo incoerente', () => {
    expect(() => analisarConferencia('{')).toThrow('não é JSON');
    expect(() => analisarConferencia('null')).toThrow(/\(raiz\)/);
    expect(() => analisarConferencia(texto((c) => { c.extra = 1; }))).toThrow(ErroConferencia);
    expect(() => analisarConferencia(texto((c) => { (c.excecoes_papel_coluna as { papel: string }[])[0]!.papel = 'homologacao'; }))).toThrow(/excecoes_papel_coluna\.0\.papel/);
    expect(() => analisarConferencia(texto((c) => { (c.colunas_descartado as unknown[]).push((c.colunas_descartado as unknown[])[0]); }))).toThrow(ErroConferencia);
    expect(() => analisarConferencia(texto((c) => { (c.mapa_tipos as { tipos: { categoria: string | null }[] }).tipos[10]!.categoria = 'produto'; }))).toThrow(ErroConferencia);
    expect(() => analisarConferencia(texto((c) => { const t = (c.mapa_tipos as { tipos: unknown[] }).tipos; t.push(t[0]); }))).toThrow(ErroConferencia);
  });

  it('o arquivo não traz dado de pessoa (e-mail, nome de usuário)', () => {
    expect(JSON.stringify(real)).not.toMatch(/@|realname|e-mail|email/i);
  });
});

describe('carga inicial dos times (constantes da migração 0017, plano 052 F0)', () => {
  it('63 workflows: 3 próprios, 47 demais, 6 fora de todo cálculo, 7 fora do operacional (6 do 057 E3 + 323)', () => {
    expect(TIMES_PROPRIOS.map(([w]) => w)).toEqual(['224', '265', '229']);
    expect(DEMAIS_TIMES).toHaveLength(47);
    expect(FORA_DE_TODO_CALCULO.map(([w]) => w)).toEqual(['257', '201', '321', '215', '216', '196']);
    expect(FORA_DO_OPERACIONAL.map(([w]) => w)).toEqual(['200', '207', '198', '313', '203', '234', '323']);
    const todos = [...TIMES.map((t) => t.workflow), ...FORA_DE_TODO_CALCULO.map(([w]) => w), ...FORA_DO_OPERACIONAL.map(([w]) => w)];
    expect(todos).toHaveLength(63);
    expect(new Set(todos).size).toBe(63);
    expect(TIMES).toHaveLength(50);
    expect(new Set(TIMES.map((t) => t.id)).size).toBe(50);
  });

  it('nenhum nome de time é nome de pessoa: só os 3 próprios e "Workflow <id>"', () => {
    const nomes = TIMES.map((t) => t.nome);
    expect(nomes.slice(0, 3)).toEqual(['Equipe de processos', 'Arquitetura', 'Auditoria PwC - ITGC']);
    expect(nomes.slice(3).every((n) => /^Workflow \d+$/.test(n))).toBe(true);
  });
});
