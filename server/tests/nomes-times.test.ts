import { slug } from '@metricas-dspd/metricas/core';
import { describe, expect, it } from 'vitest';
import { INATIVOS, JA_NOMEADOS, NOMES_NOVOS, UNIFICADOS, ddl, validarNomes } from '../migrations/0043_bm_nomes_times.js';
import { TIMES, TIMES_PROPRIOS } from '../migrations/0019_bm_carga_inicial_times.js';
import { S_PADRAO } from '../src/plataforma/db/esquemas.js';

type Nome = (typeof NOMES_NOVOS)[number];
const com = (id: number, nome: string): Nome[] => NOMES_NOVOS.map((n): Nome => (n[0] === id ? [n[0], n[1], nome] : n));
const mensagem = (f: () => void): string => { try { f(); } catch (e) { return (e as Error).message; } return ''; };

/** Pedido 098, E4 (lote B1): a lista fechada e as validações da migração 0043, sem banco. */
describe('0043: lista fechada dos nomes dos times', () => {
  it('cobre os 47 time_id de 4 a 50, cada um uma vez, com o workflow da carga inicial (0019)', () => {
    const ids = [...NOMES_NOVOS.map((n) => n[0]), ...INATIVOS.map((n) => n[0])].sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 47 }, (_, i) => i + 4));
    for (const [id, wf] of [...NOMES_NOVOS.map((n) => [n[0], n[1]] as const), ...INATIVOS]) {
      const t = TIMES.find((x) => x.id === id)!;
      expect(t.workflow, `time ${id}`).toBe(wf);
      expect(t.nome, `time ${id}`).toBe(`Workflow ${wf}`);
    }
  });
  it('os times 1 a 3 são os da 0019; os nomes da decisão (7 a 9): Falcon por quadro, ATO, EXA Books, 24 e 25 inativos', () => {
    expect(JA_NOMEADOS.map(([i, n]) => [i, n])).toEqual(TIMES_PROPRIOS.map(([, , n], i) => [i + 1, n]));
    const nome = (id: number): string | undefined => NOMES_NOVOS.find((n) => n[0] === id)?.[2];
    expect([nome(17), nome(49), nome(22), nome(23)]).toEqual(['Falcon (Escritório de Projetos)', 'Falcon (Marketing e Vendas)', 'ATO', 'EXA Books']);
    expect(NOMES_NOVOS).toHaveLength(45);
    expect(INATIVOS.map((i) => i[0])).toEqual([24, 25]);
    expect(nome(24)).toBeUndefined();
    expect(nome(25)).toBeUndefined();
  });
  it('unificação (decisão 7a): o workflow 127 vai para o time 20 e o 220 para o 10, no quadro em que já estavam', () => {
    expect(UNIFICADOS).toEqual([['127', '24', 20], ['220', '24', 10]]);
    for (const [w, q] of UNIFICADOS) expect(TIMES.find((t) => t.workflow === w)!.quadro).toBe(q);
    expect(NOMES_NOVOS.find((n) => n[0] === 20)![1]).toBe('105');
    expect(NOMES_NOVOS.find((n) => n[0] === 10)![1]).toBe('221');
  });
  it('a lista real passa nas validações: nenhum nome vazio, longo, [revisar] ou provisório, e slug único entre os 48 ativos', () => {
    expect(() => validarNomes()).not.toThrow();
    const slugs = [...JA_NOMEADOS.map((n) => n[1]), ...NOMES_NOVOS.map((n) => n[2])].map(slug);
    expect(new Set(slugs).size).toBe(48);
    expect(NOMES_NOVOS.every((n) => n[2].length <= 80 && !/\[revisar\]/i.test(n[2]))).toBe(true);
  });
});

describe('0043: validações que falham antes de gravar (a mensagem cita só o time_id)', () => {
  it('nome com mais de 80 caracteres', () => {
    const m = mensagem(() => validarNomes(com(6, 'x'.repeat(81))));
    expect(m).toMatch(/time 6: nome com mais de 80 caracteres/);
    expect(m).not.toContain('xxx');
  });
  it('nome com [revisar], vazio, provisório ou sem letra', () => {
    expect(mensagem(() => validarNomes(com(7, 'Fluxo [revisar]')))).toMatch(/time 7: .*\[revisar\]/);
    expect(mensagem(() => validarNomes(com(7, '  ')))).toMatch(/time 7: nome vazio/);
    expect(mensagem(() => validarNomes(com(7, 'Workflow 222')))).toMatch(/time 7: nome continua provisório/);
    expect(mensagem(() => validarNomes(com(7, '---')))).toMatch(/time 7: nome sem letra/);
  });
  it('slug repetido entre os ativos, inclusive com um dos times 1 a 3 (acento e caixa não distinguem)', () => {
    expect(mensagem(() => validarNomes(com(6, 'ARQUITETURA')))).toMatch(/times 2 e 6: mesmo slug/);
    expect(mensagem(() => validarNomes(com(6, 'Sustentação')))).toMatch(/times 6 e 36: mesmo slug|times 36 e 6: mesmo slug/);
  });
  it('lista incompleta, com time_id repetido ou fora de 4 a 50', () => {
    expect(mensagem(() => validarNomes(NOMES_NOVOS.slice(1)))).toMatch(/46 times; esperados 47/);
    expect(mensagem(() => validarNomes([...NOMES_NOVOS.slice(1), NOMES_NOVOS[1]!]))).toMatch(/time_id repetido na lista: 5/);
    expect(mensagem(() => validarNomes([...NOMES_NOVOS.slice(1), [51, '999', 'Outro'] as const]))).toMatch(/fora de 4 a 50: 51/);
  });
});

describe('0043: SQL gerado', () => {
  const { up, down } = ddl(S_PADRAO);
  const todo = (l: string[]): string => l.join('\n');
  it('a conferência de estado é a primeira instrução, antes de qualquer escrita, e só cita time_id', () => {
    expect(up[0]).toMatch(/^DO \$\$/);
    expect(up[0]).not.toMatch(/INSERT|UPDATE|DELETE/);
    expect(up[0]).toMatch(/RAISE EXCEPTION 'times fora do estado esperado .*%', ruins/);
    expect(up.findIndex((s) => /^(INSERT|UPDATE)/.test(s))).toBeGreaterThan(0);
  });
  it('grava só INSERT e o fechamento da vigência (vigente_ate); nada é apagado nem reescrito no up', () => {
    expect(todo(up)).not.toMatch(/DELETE|TRUNCATE|ALTER TABLE|SET nome|SET ativo/i);
    expect(up.filter((s) => /^UPDATE/.test(s)).every((s) => /SET vigente_ate = current_date WHERE vigente_ate IS NULL/.test(s))).toBe(true);
  });
  it('correção sem métrica: motivo correcao nas vigências, versão de critério sem linha de métrica', () => {
    expect(todo(up)).toContain("'correcao'");
    expect(todo(up)).not.toMatch(/ref_versao_criterio_metrica/);
    expect(todo(up)).not.toMatch(/'processo'/);
  });
  it('o slug não está no SQL (calculado em TypeScript) e a lista gravada é exatamente a da tabela', () => {
    expect(todo(up)).not.toMatch(/slug|regexp_replace|unaccent/i);
    const inserts = up.find((s) => /^INSERT INTO \S+\.ref_time \(/.test(s))!;
    expect((inserts.match(/\n?\s*\(\d+, current_date, /g) ?? []).length).toBe(47);
    for (const [id, , nome] of NOMES_NOVOS) expect(inserts).toContain(`(${id}, current_date, '${nome.replaceAll("'", "''")}', true,`);
    for (const [id, w] of INATIVOS) expect(inserts).toContain(`(${id}, current_date, 'Workflow ${w}', false,`);
  });
  it('down: recusa vigência posterior, liga e desliga o gatilho só dentro da transação e reabre as vigências da 0019', () => {
    expect(down[0]).toMatch(/vigências posteriores/);
    const i = down.findIndex((s) => /DISABLE TRIGGER/.test(s));
    const j = down.findIndex((s) => /ENABLE TRIGGER/.test(s));
    expect(i).toBeGreaterThan(0);
    expect(j).toBeGreaterThan(i);
    expect(down.slice(i, j).some((s) => /^UPDATE \S+ SET vigente_ate = NULL/.test(s))).toBe(true);
    expect(down.filter((s) => /DISABLE TRIGGER/.test(s))).toHaveLength(2);
    expect(down.filter((s) => /ENABLE TRIGGER/.test(s))).toHaveLength(2);
  });
});
