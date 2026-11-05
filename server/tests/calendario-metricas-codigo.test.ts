import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import { METRICAS_CALENDARIO } from '../src/modulos/referencia/calendario.js';

/**
 * Liga `METRICAS_CALENDARIO` ao código (pedido 069, L7-a, A2 do QA): lê o fonte da biblioteca de métricas, segue as referências por nome a
 * partir de cada entrada do despacho (`calcular.ts`) e marca como "usa o calendário" a métrica que alcança `horasUteisEntre`, `diasUteis` ou
 * `diasUteisNoIntervalo`. Métrica nova com tempo em dias úteis, fora da lista, reprova aqui.
 */
const RAIZ = new URL('../../packages/metricas/src/', import.meta.url).pathname;
/**
 * No Acelerato, `construir` (acelerato/indice.ts) chama `horasUteisEntre` uma vez e guarda o resultado nestes campos do índice; as
 * métricas leem o campo, não a função. Um teste abaixo confere que `construir` ainda alcança a biblioteca e que os campos existem.
 */
const CAMPOS_DO_INDICE_AC = ['primeiroAtendimentoHU', 'restauracaoHU', 'vidaHU', 'porTotalizador', 'porEtapa'];
const SEMENTES = ['horasUteisEntre', 'diasUteis', 'diasUteisNoIntervalo', ...CAMPOS_DO_INDICE_AC];
/** Séries e visões que não são métrica do catálogo da versão de critério (nem O17, que fica fora do calendário por não aparecer na lista). */
const IGNORADAS_FORA_DO_FLUXO = new Set(['PV1', 'VISAO_GERAL', 'TENDENCIA_FLUXO', 'TENDENCIA_SUST']);

function arquivos(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return arquivos(p);
    return p.endsWith('.ts') && !p.endsWith('.test.ts') ? [p] : [];
  });
}
/** Nomes citados: identificadores e textos literais (S1 passa o campo do índice como texto). */
const ids = (no: ts.Node): string[] => {
  const r: string[] = [];
  const v = (n: ts.Node): void => { if (ts.isIdentifier(n) || ts.isStringLiteral(n)) r.push(n.text); ts.forEachChild(n, v); };
  v(no);
  return r;
};
function declaracoes(fonte: ts.SourceFile): Map<string, string[]> {
  const m = new Map<string, string[]>();
  const somar = (nome: string, no: ts.Node): void => { m.set(nome, [...(m.get(nome) ?? []), ...ids(no)]); };
  for (const s of fonte.statements) {
    if (ts.isFunctionDeclaration(s) && s.name) somar(s.name.text, s);
    else if (ts.isVariableStatement(s)) for (const d of s.declarationList.declarations) if (ts.isIdentifier(d.name)) somar(d.name.text, d);
  }
  return m;
}
function grafo(): Map<string, Set<string>> {
  const g = new Map<string, Set<string>>();
  for (const a of arquivos(RAIZ)) {
    if (a.endsWith('/calcular.ts')) continue;
    for (const [nome, refs] of declaracoes(ts.createSourceFile(a, readFileSync(a, 'utf8'), ts.ScriptTarget.Latest, true))) {
      const s = g.get(nome) ?? new Set<string>();
      refs.forEach((r) => s.add(r));
      g.set(nome, s);
    }
  }
  return g;
}
function alcanca(g: Map<string, Set<string>>, inicio: string): boolean {
  const visto = new Set<string>();
  const fila = [inicio];
  while (fila.length > 0) {
    const n = fila.pop()!;
    if (SEMENTES.includes(n)) return true;
    if (visto.has(n)) continue;
    visto.add(n);
    fila.push(...(g.get(n) ?? []));
  }
  return false;
}
/** Entradas do despacho: id da métrica -> função de entrada (`BM.calcularX` ou `AC.calcularX`) e domínio. */
function entradas(): { id: string; funcao: string; dominio: 'businessmap' | 'acelerato' }[] {
  const a = join(RAIZ, 'calcular.ts');
  const fonte = ts.createSourceFile(a, readFileSync(a, 'utf8'), ts.ScriptTarget.Latest, true);
  const r: { id: string; funcao: string; dominio: 'businessmap' | 'acelerato' }[] = [];
  const v = (n: ts.Node): void => {
    if (ts.isPropertyAssignment(n) && ts.isIdentifier(n.name) && /^(BM|AC)\.calcular/.test(n.initializer.getText(fonte).replace(/^\([^)]*\)\s*=>\s*/, ''))) {
      const m = /(BM|AC)\.(calcular\w+)/.exec(n.initializer.getText(fonte))!;
      r.push({ id: n.name.text, funcao: m[2]!, dominio: m[1] === 'BM' ? 'businessmap' : 'acelerato' });
    }
    ts.forEachChild(n, v);
  };
  v(fonte);
  return r;
}

describe('METRICAS_CALENDARIO x código da biblioteca', () => {
  const g = grafo();
  const todas = entradas();
  it('o despacho tem entradas dos dois domínios (a leitura do fonte funciona)', () => {
    expect(todas.length).toBeGreaterThan(50);
    expect(todas.filter((e) => e.dominio === 'acelerato').length).toBeGreaterThan(10);
    expect(todas.some((e) => IGNORADAS_FORA_DO_FLUXO.has(e.id))).toBe(true);
  });
  it('o índice do Acelerato ainda calcula os campos de horas por horasUteisEntre', () => {
    const refs = g.get('construir')!;
    expect(refs.has('horasUteisEntre')).toBe(true);
    for (const c of CAMPOS_DO_INDICE_AC) expect(refs.has(c)).toBe(true);
  });
  it.each(['businessmap', 'acelerato'] as const)('a lista de %s é exatamente o conjunto de métricas que alcançam horas ou dias úteis', (dominio) => {
    const derivada = todas.filter((e) => e.dominio === dominio && !IGNORADAS_FORA_DO_FLUXO.has(e.id) && alcanca(g, e.funcao)).map((e) => e.id).sort();
    expect([...METRICAS_CALENDARIO[dominio]].sort()).toEqual(derivada);
  });
});
