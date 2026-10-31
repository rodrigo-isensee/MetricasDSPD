import type { Conferencia } from './conferencia.js';
import { desembrulhar } from './spike-forma.js';

// Spike F1 (plano 052): lista de conferência das colunas folha. Aplica a regra das H-8 a H-11 (e a H-26, homologação)
// à estrutura lida e marca as candidatas a exceção. É proposta para o dono conferir: não grava nada, não decide
// vigência (F2) e não tem nome de pessoa (só id e nome de coluna; quadro e workflow pelo id).

export type PapelColuna = 'backlog' | 'compromisso' | 'trabalho' | 'homologacao' | 'entrega' | 'descarte' | 'sem_papel';
export type TipoColuna = 'fila' | 'execucao' | 'sem_tipo';

export interface LinhaConferencia {
  quadro: number;
  workflow: string;
  coluna: string;
  nome: string;
  secao: number | undefined;
  flowType: number | undefined;
  papel: PapelColuna;
  tipo: TipoColuna;
  /** Vazio quando a regra basta; senão, exceção do arquivo, candidata nova ou conferir. */
  marca: string;
}

type Obj = Record<string, unknown>;
const ehObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const emLista = (v: unknown): Obj[] => (Array.isArray(v) ? v : ehObj(v) ? Object.values(v) : []).filter(ehObj);
const inteiro = (v: unknown): number | undefined => (typeof v === 'number' && Number.isInteger(v) ? v : undefined);
const idTexto = (v: unknown): string | undefined => (inteiro(v) === undefined ? undefined : String(v));
const normalizar = (t: string): string => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const ESPERA = /(^|[^a-z])(pronto|aguardando|espera)([^a-z]|$)/;
const MARCO = /pre-?release|loja|publicacao/;

/** Papel proposto pela seção da folha (H-8 a H-10) e, na seção 3 com "Homologação" no nome, pela H-26. */
export function papelDaSecao(secao: number | undefined, nomeNormalizado: string): PapelColuna {
  if (secao === 1) return 'backlog';
  if (secao === 2) return 'compromisso';
  if (secao === 3) return nomeNormalizado.includes('homologacao') ? 'homologacao' : 'trabalho';
  return secao === 4 || secao === 5 ? 'entrega' : 'sem_papel';
}

/** `flow_type` 2 = fila, 1 = execução (H-8); qualquer outro valor fica sem tipo. */
export const tipoDoFlow = (flowType: number | undefined): TipoColuna => (flowType === 2 ? 'fila' : flowType === 1 ? 'execucao' : 'sem_tipo');

/** Linhas da lista a partir das respostas de `currentStructure` (uma por quadro lido). */
export function montarLista(estruturas: ReadonlyMap<number, unknown>, conf: Conferencia): LinhaConferencia[] {
  const excecoes = new Map(conf.excecoes_papel_coluna.map((e) => [`${e.workflow_id}/${e.coluna_id}`, e.papel]));
  const descartadas = new Set(conf.colunas_descartado.map((c) => `${c.workflow_id}/${c.coluna_id}`));
  const linhas: LinhaConferencia[] = [];
  for (const [quadro, corpo] of estruturas) {
    for (const estrutura of desembrulhar(corpo).itens) {
      for (const [chave, wf] of Object.entries(ehObj(estrutura) && ehObj(estrutura.workflows) ? estrutura.workflows : {})) {
        if (!ehObj(wf)) continue;
        const workflow = idTexto(wf.workflow_id) ?? chave;
        const colunas = emLista(wf.columns);
        const porId = new Map(colunas.map((c) => [String(c.column_id), c]));
        const pais = new Set(colunas.map((c) => String(c.parent_column_id)));
        for (const c of colunas) {
          const coluna = String(c.column_id);
          if (pais.has(coluna)) continue; // só folhas
          const pai = porId.get(String(c.parent_column_id));
          const nome = String(c.name ?? '').replace(/[\r\n|`]+/g, ' ').slice(0, 80);
          const norm = normalizar(nome);
          const secao = inteiro(c.section) ?? inteiro(pai?.section);
          const flowType = inteiro(c.flow_type);
          const ref = `${workflow}/${coluna}`;
          const descarte = norm === 'descartado';
          const papel = descarte ? 'descarte' : papelDaSecao(secao, norm);
          const tipoExcecao = excecoes.get(ref);
          const marcas: string[] = [];
          if (tipoExcecao !== undefined) marcas.push('exceção do arquivo (H-8)');
          if (descarte) marcas.push(descartadas.has(ref) ? 'Descartado do arquivo (H-11)' : 'CANDIDATA: Descartado fora do arquivo (H-11)');
          if (!descarte && papel === 'trabalho' && flowType === 1 && tipoExcecao === undefined && ESPERA.test(norm)) {
            marcas.push('CANDIDATA: nome de espera com flow_type 1 (H-8)');
          }
          if ((secao === 2 || secao === 4) && MARCO.test(norm)) marcas.push('CANDIDATA: exceção de marco (H-9 ou H-10)');
          if (pai !== undefined && normalizar(String(pai.name ?? '')) === 'encerrado') marcas.push('CANDIDATA: filha de Encerrado (H-10)');
          if (papel === 'sem_papel') marcas.push('CONFERIR: folha sem seção');
          if (papel === 'trabalho' && tipoDoFlow(flowType) === 'sem_tipo') marcas.push('CONFERIR: flow_type fora de 1 e 2 na seção 3');
          linhas.push({
            quadro, workflow, coluna, nome, secao, flowType, papel,
            tipo: tipoExcecao ?? tipoDoFlow(flowType),
            marca: marcas.join('; '),
          });
        }
      }
    }
  }
  return linhas.sort((a, b) => a.quadro - b.quadro || Number(a.workflow) - Number(b.workflow) || Number(a.coluna) - Number(b.coluna));
}

/** Exceções do arquivo cujo workflow foi lido, mas cuja coluna não está entre as folhas lidas. */
export function excecoesSemColuna(linhas: readonly LinhaConferencia[], conf: Conferencia): string[] {
  const workflows = new Set(linhas.map((l) => l.workflow));
  const folhas = new Set(linhas.map((l) => `${l.workflow}/${l.coluna}`));
  return conf.excecoes_papel_coluna
    .filter((e) => workflows.has(e.workflow_id) && !folhas.has(`${e.workflow_id}/${e.coluna_id}`))
    .map((e) => `${e.workflow_id}/${e.coluna_id}`);
}

/** Tabela Markdown da lista, com o resumo por papel e as candidatas no topo. */
export function renderizarLista(linhas: readonly LinhaConferencia[], conf: Conferencia, quadrosLidos: readonly number[]): string {
  const candidatas = linhas.filter((l) => l.marca.includes('CANDIDATA') || l.marca.includes('CONFERIR'));
  const porPapel = new Map<string, number>();
  for (const l of linhas) porPapel.set(l.papel, (porPapel.get(l.papel) ?? 0) + 1);
  const sem = excecoesSemColuna(linhas, conf);
  const celula = (l: LinhaConferencia): string =>
    `| ${l.quadro} | ${l.workflow} | ${l.coluna} | ${l.nome} | ${l.secao ?? '-'} | ${l.flowType ?? '-'} | ${l.papel} | ${l.tipo} | ${l.marca} |`;
  const tabela = (ls: readonly LinhaConferencia[]): string[] => [
    '| Quadro | Workflow | Coluna | Nome | Seção | flow_type | Papel | Tipo | Marca |',
    '|---|---|---|---|---|---|---|---|---|',
    ...ls.map(celula),
  ];
  return [
    '# Lista de conferência das colunas folha (proposta)',
    '',
    `Quadros lidos: ${quadrosLidos.join(', ')}. Regra: seção 1 backlog, 2 compromisso, 3 trabalho (com "Homologação" no nome, homologacao), 4 e 5 entrega; tipo pelo flow_type (2 fila, 1 execução); coluna "Descartado" é descarte (H-11). Proposta para o dono conferir: nada aqui está em vigor.`,
    '',
    `Folhas: ${linhas.length}. ${[...porPapel.entries()].sort().map(([p, n]) => `${p}: ${n}`).join(', ')}. Candidatas e itens a conferir: ${candidatas.length}.`,
    ...(sem.length > 0 ? ['', `Exceções do arquivo sem folha correspondente na estrutura lida (workflow/coluna): ${sem.join(', ')}.`] : []),
    '',
    '## Candidatas a exceção e itens a conferir',
    '',
    ...(candidatas.length > 0 ? tabela(candidatas) : ['Nenhuma.']),
    '',
    '## Todas as folhas',
    '',
    ...tabela(linhas),
    '',
  ].join('\n');
}
