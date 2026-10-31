// Spike F1 (plano 052, K-182): resumo da FORMA de uma resposta do BusinessMap. Só nomes de campo, tipos e contagens:
// nenhum valor (texto, número, nome ou e-mail) sai daqui. Nome de campo fora do padrão de identificador vira `<chave>`
// e chave numérica vira `<id>`, para que um dicionário indexado por texto livre não vaze texto.

interface Acumulo {
  tipos: Set<string>;
  n: number;
  tamMin: number;
  tamMax: number;
}

export type Forma = Map<string, Acumulo>;

const tipoDe = (v: unknown): string => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);

/** Nome de chave seguro para o relatório. */
export function chaveSegura(k: string): string {
  if (/^\d+$/.test(k)) return '<id>';
  return /^[A-Za-z_][A-Za-z0-9_]{0,39}$/.test(k) ? k : '<chave>';
}

/** Soma a forma de `valor` (e dos seus filhos) em `acc`, sob o caminho `base`. Aceita várias respostas no mesmo acumulador. */
export function somarForma(valor: unknown, acc: Forma = new Map(), base = '$'): Forma {
  const a = acc.get(base) ?? { tipos: new Set<string>(), n: 0, tamMin: Infinity, tamMax: 0 };
  acc.set(base, a);
  a.n += 1;
  a.tipos.add(tipoDe(valor));
  if (Array.isArray(valor)) {
    a.tamMin = Math.min(a.tamMin, valor.length);
    a.tamMax = Math.max(a.tamMax, valor.length);
    for (const item of valor) somarForma(item, acc, `${base}[]`);
  } else if (typeof valor === 'object' && valor !== null) {
    for (const [k, v] of Object.entries(valor)) somarForma(v, acc, `${base}.${chaveSegura(k)}`);
  }
  return acc;
}

/** Linhas Markdown da forma: caminho, tipos vistos, ocorrências e, para listas, o menor e o maior tamanho. */
export function linhasDeForma(forma: Forma, filtro?: (caminho: string) => boolean): string[] {
  const linhas: string[] = [];
  for (const [caminho, a] of [...forma.entries()].sort((x, y) => (x[0] < y[0] ? -1 : 1))) {
    if (filtro && !filtro(caminho)) continue;
    const tam = Number.isFinite(a.tamMin) ? `, tamanho ${a.tamMin} a ${a.tamMax}` : '';
    linhas.push(`- \`${caminho}\`: ${[...a.tipos].sort().join(' | ')} (${a.n}x${tam})`);
  }
  return linhas;
}

/** Caminhos cujo nome de campo casa com o padrão (só o último trecho do caminho). */
export function caminhosComNome(forma: Forma, padrao: RegExp): string[] {
  return [...forma.keys()].filter((c) => padrao.test(c.split('.').pop()!)).sort();
}

/** Desembrulha `{data:[...]}`, `{data:{data:[...],pagination}}` ou `{data:{...}}`; sem `data`, `itens` vazio. */
export function desembrulhar(corpo: unknown): { itens: unknown[]; paginas: number | undefined; chavesPaginacao: string[] } {
  const d = typeof corpo === 'object' && corpo !== null ? (corpo as Record<string, unknown>).data : undefined;
  if (Array.isArray(d)) return { itens: d, paginas: undefined, chavesPaginacao: [] };
  if (typeof d === 'object' && d !== null) {
    const o = d as Record<string, unknown>;
    const pag = typeof o.pagination === 'object' && o.pagination !== null ? (o.pagination as Record<string, unknown>) : undefined;
    const todas = pag?.all_pages;
    return {
      itens: Array.isArray(o.data) ? o.data : [d],
      paginas: typeof todas === 'number' ? todas : undefined,
      chavesPaginacao: Object.keys(pag ?? {}).map(chaveSegura).sort(),
    };
  }
  return { itens: [], paginas: undefined, chavesPaginacao: [] };
}
