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

export interface EntradaFolha { workflow: string; coluna: string; nomeNormalizado: string; secao: number | undefined; flowType: number | undefined }
export interface PapelDaFolha {
  papel: PapelColuna;
  tipo: TipoColuna;
  descarteNoArquivo: boolean;
  /** Exceção do arquivo que muda o tipo (fila ou execução) ou o papel (trabalho, pergunta 2 de 2026-10-31). */
  tipoNoArquivo: boolean;
  trabalhoNoArquivo: boolean;
}

/**
 * Função única de papel e tipo de uma folha (H-8 a H-11, H-26 e o arquivo de conferência), usada pela lista da F1 e pela carga da F2.
 * Ordem: descarte (nome ou arquivo, H-11) > exceção de trabalho do arquivo > seção. O tipo é o da exceção ou o do flow_type.
 */
export function papelDaFolha(f: EntradaFolha, conf: Conferencia): PapelDaFolha {
  const ehDela = (l: { workflow_id: string; coluna_id: string }): boolean => l.workflow_id === f.workflow && l.coluna_id === f.coluna;
  const descarteNoArquivo = conf.colunas_descartado.some(ehDela);
  const trabalhoNoArquivo = conf.excecoes_papel_trabalho.some(ehDela);
  const tipoArquivo = conf.excecoes_papel_coluna.find(ehDela)?.papel;
  const descarte = f.nomeNormalizado === 'descartado' || descarteNoArquivo;
  const papel = descarte ? 'descarte' : trabalhoNoArquivo ? 'trabalho' : papelDaSecao(f.secao, f.nomeNormalizado);
  return { papel, tipo: tipoArquivo ?? tipoDoFlow(f.flowType), descarteNoArquivo, tipoNoArquivo: tipoArquivo !== undefined, trabalhoNoArquivo };
}

/** Linhas da lista a partir das respostas de `currentStructure` (uma por quadro lido). */
export function montarLista(estruturas: ReadonlyMap<number, unknown>, conf: Conferencia): LinhaConferencia[] {
  const linhas: LinhaConferencia[] = [];
  for (const [quadro, corpo] of estruturas) {
    for (const estrutura of desembrulhar(corpo).itens) {
      // Forma real de `currentStructure`: `columns` é mapa por id; `child_columns` é mapa de id do pai para lista de ids;
      // `workflows[id].bottom_columns` traz os ids das folhas do workflow (as chaves dos mapas são os ids).
      const raiz = ehObj(estrutura) ? estrutura : {};
      const mapaColunas = ehObj(raiz.columns) ? raiz.columns : {};
      const mapaFilhas = ehObj(raiz.child_columns) ? raiz.child_columns : {};
      for (const [chave, wf] of Object.entries(ehObj(raiz.workflows) ? raiz.workflows : {})) {
        if (!ehObj(wf)) continue;
        const workflow = /^\d+$/.test(chave) ? chave : '<chave>';
        const doWorkflow: LinhaConferencia[] = [];
        for (const idBruto of Array.isArray(wf.bottom_columns) ? wf.bottom_columns : []) {
          const coluna = idTexto(idBruto) ?? '<id?>';
          if (coluna !== '<id?>' && Array.isArray(mapaFilhas[coluna]) && mapaFilhas[coluna].length > 0) continue; // só folhas
          const achada = coluna === '<id?>' ? undefined : mapaColunas[coluna];
          const c: Obj = ehObj(achada) ? achada : {};
          const paiBruto = inteiro(c.parent_column_id);
          const paiAchado = paiBruto === undefined ? undefined : mapaColunas[String(paiBruto)];
          const pai: Obj | undefined = ehObj(paiAchado) ? paiAchado : undefined;
          const nome = String(c.name ?? '').replace(/[\r\n|`]+/g, ' ').slice(0, 80);
          const norm = normalizar(nome);
          const secao = inteiro(c.section) ?? inteiro(pai?.section);
          const flowType = inteiro(c.flow_type);
          const r = papelDaFolha({ workflow, coluna, nomeNormalizado: norm, secao, flowType }, conf);
          const { papel, tipo } = r;
          const noArquivo = r.descarteNoArquivo;
          const descarte = papel === 'descarte';
          const tipoExcecao = r.tipoNoArquivo ? tipo : undefined;
          const marcas: string[] = [];
          if (tipoExcecao !== undefined) marcas.push('exceção do arquivo (H-8)');
          if (r.trabalhoNoArquivo) marcas.push('exceção do arquivo: trabalho (pergunta 2, 2026-10-31)');
          if (descarte) {
            marcas.push(
              !noArquivo
                ? 'CANDIDATA: Descartado fora do arquivo (H-11)'
                : norm === 'descartado'
                  ? 'Descartado do arquivo (H-11)'
                  : 'Descartado do arquivo com nome diferente de Descartado (H-11)',
            );
          }
          if (!descarte && papel === 'trabalho' && flowType === 1 && tipoExcecao === undefined && ESPERA.test(norm)) {
            marcas.push('CANDIDATA: nome de espera com flow_type 1 (H-8)');
          }
          if ((secao === 2 || secao === 4) && MARCO.test(norm) && !r.trabalhoNoArquivo) marcas.push('CANDIDATA: exceção de marco (H-9 ou H-10)');
          if (pai !== undefined && normalizar(String(pai.name ?? '')) === 'encerrado') marcas.push('CANDIDATA: filha de Encerrado (H-10)');
          if (papel === 'sem_papel') marcas.push('CONFERIR: folha sem seção');
          if (papel === 'homologacao') marcas.push('regra H-26: Homologação no nome da folha da seção 3');
          if ((papel === 'trabalho' || papel === 'homologacao') && tipoDoFlow(flowType) === 'sem_tipo') marcas.push('CONFERIR: flow_type fora de 1 e 2 na seção 3');
          if (coluna === '<id?>') marcas.push('CONFERIR: coluna sem id inteiro');
          doWorkflow.push({
            quadro, workflow, coluna, nome, secao, flowType, papel,
            tipo,
            marca: marcas.join('; '),
          });
        }
        // H-23: sem folha na seção 2 ou na 4, o marco de todo card cai na entrada da seção seguinte.
        const faltam = [2, 4].filter((n) => !doWorkflow.some((l) => l.secao === n && l.papel !== 'descarte' && !(n === 4 && l.papel === 'trabalho')));
        const primeira = doWorkflow[0];
        if (primeira !== undefined && faltam.length > 0) {
          const aviso = `CONFERIR: workflow sem folha na seção ${faltam.join(' nem na ')}, o marco cai na seção seguinte (H-23)`;
          primeira.marca = primeira.marca === '' ? aviso : `${primeira.marca}; ${aviso}`;
        }
        linhas.push(...doWorkflow);
      }
    }
  }
  const num = (a: string, b: string): number => a.localeCompare(b, 'en', { numeric: true });
  return linhas.sort((a, b) => a.quadro - b.quadro || num(a.workflow, b.workflow) || num(a.coluna, b.coluna));
}

/** Quantas colunas (objetos do mapa `columns`) as estruturas lidas trazem, para avisar quando há colunas e nenhuma folha. */
export function contarColunas(estruturas: ReadonlyMap<number, unknown>): number {
  let total = 0;
  for (const corpo of estruturas.values()) {
    for (const estrutura of desembrulhar(corpo).itens) {
      if (ehObj(estrutura) && ehObj(estrutura.columns)) total += Object.values(estrutura.columns).filter(ehObj).length;
    }
  }
  return total;
}

/** Exceções do arquivo cujo workflow foi lido, mas cuja coluna não está entre as folhas lidas. */
export function excecoesSemColuna(linhas: readonly LinhaConferencia[], conf: Conferencia): string[] {
  const workflows = new Set(linhas.map((l) => l.workflow));
  const folhas = new Set(linhas.map((l) => `${l.workflow}/${l.coluna}`));
  return [...conf.excecoes_papel_coluna, ...conf.excecoes_papel_trabalho]
    .filter((e) => workflows.has(e.workflow_id) && !folhas.has(`${e.workflow_id}/${e.coluna_id}`))
    .map((e) => `${e.workflow_id}/${e.coluna_id}`);
}

/** Tabela Markdown da lista, com o resumo por papel e as candidatas no topo. */
export function renderizarLista(linhas: readonly LinhaConferencia[], conf: Conferencia, quadrosLidos: readonly number[]): string {
  const candidatas = linhas.filter((l) => l.marca.includes('CANDIDATA') || l.marca.includes('CONFERIR') || l.marca.includes('H-26'));
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
    `Quadros lidos: ${quadrosLidos.join(', ')}. Regra: seção 1 backlog, 2 compromisso, 3 trabalho (com "Homologação" no nome, homologacao, H-26), 4 e 5 entrega; workflow sem folha na seção 2 ou 4 é marcado, o marco cai na seção seguinte (H-23); tipo pelo flow_type (2 fila, 1 execução); coluna "Descartado" é descarte (H-11). Proposta para o dono conferir: nada aqui está em vigor.`,
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
