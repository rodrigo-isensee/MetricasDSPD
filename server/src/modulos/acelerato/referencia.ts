import type { Consultavel } from '../../plataforma/db/pool.js';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { DominiosEtapa, ListasRecorte } from './allow-list.js';
import { ErroColeta } from './erros.js';
import { CAMPOS_ETAPA_F3, campoDominioEtapa } from './listas-fechadas.js';

/**
 * Lê as listas VIGENTES de `ref_dominio` (ADR 0023, item 5): `tipo_recorte`, `organizacao_recorte` e `equipe` (código =
 * a chave em texto decimal, rótulo = o nome), e os vocabulários `etapa`, `prioridade`, `categoria` e `descricao_workflow`. Nunca do `.env` e nunca com valor
 * inventado no código (M11). Lista de recorte ou de vocabulário vazia = a coleta não começa: uma lista vazia esconderia o erro (todo valor cairia fora do domínio).
 */
type LinhaDominio = { campo: string; codigo: string; rotulo: string };

function paraChaves(linhas: LinhaDominio[], campo: string): Map<number, string> {
  const m = new Map<number, string>();
  for (const l of linhas.filter((x) => x.campo === campo)) {
    if (!/^\d{1,15}$/.test(l.codigo)) throw new ErroColeta('dados-invalidos', { entidade: 'ref_dominio', coluna: campo });
    m.set(Number(l.codigo), l.rotulo);
  }
  return m;
}

export async function carregarListas(db: Consultavel, S: Esquemas): Promise<ListasRecorte> {
  const r = await db.query<LinhaDominio>(
    `SELECT campo, codigo, rotulo FROM ${S.ac}.ref_dominio
      WHERE vigente_ate IS NULL AND campo IN ('tipo_recorte', 'organizacao_recorte', 'equipe', 'etapa', 'prioridade', 'categoria', 'descricao_workflow')
      ORDER BY campo, ordem, codigo`);
  const vocabulario = (campo: string): Set<string> =>
    new Set(r.rows.filter((x) => x.campo === campo).flatMap((x) => [x.codigo, x.rotulo]));
  const listas: ListasRecorte = {
    tipos: paraChaves(r.rows, 'tipo_recorte'), organizacoes: paraChaves(r.rows, 'organizacao_recorte'),
    equipes: paraChaves(r.rows, 'equipe'), etapas: vocabulario('etapa'), prioridades: vocabulario('prioridade'),
    categorias: vocabulario('categoria'), workflows: vocabulario('descricao_workflow'),
  };
  // Vocabulário vazio também falha fechado: com ele a allow-list anularia status, prioridade, etapa, categoria ou workflow de TODOS
  // os chamados em silêncio (causa da E4.39). Lista de recorte vazia esconderia o erro do mesmo jeito.
  const todas: [string, { size: number }][] = [
    ['tipo_recorte', listas.tipos], ['organizacao_recorte', listas.organizacoes], ['equipe', listas.equipes],
    ['etapa', listas.etapas], ['prioridade', listas.prioridades], ['categoria', listas.categorias], ['descricao_workflow', listas.workflows],
  ];
  for (const [nome, lista] of todas) {
    if (lista.size === 0) throw new ErroColeta('listas-vazias', { entidade: 'ref_dominio', coluna: nome });
  }
  return listas;
}

/**
 * Valores permitidos dos campos de etapa de tratamento `lista` (F3), de `ref_dominio` vigente. Os NOMES dos campos são constante do código
 * (`CAMPOS_ETAPA_F3`); aqui só se leem valores, e o `campo` consultado também vem da constante. Sem linha, o domínio fica vazio e o
 * campo sai nulo com contagem (P-DS-19 ainda não carregada): não é erro.
 */
export async function carregarDominiosEtapa(db: Consultavel, S: Esquemas): Promise<DominiosEtapa> {
  const campos = CAMPOS_ETAPA_F3.filter((f) => f.tratamento === 'lista').map((f) => ({ chave: f.chave as string, campo: campoDominioEtapa(f.chave) }));
  const r = await db.query<LinhaDominio>(
    `SELECT campo, codigo, rotulo FROM ${S.ac}.ref_dominio WHERE vigente_ate IS NULL AND campo IN (${campos.map((_c, i) => `$${i + 1}`).join(', ')}) ORDER BY campo, ordem, codigo`,
    campos.map((c) => c.campo));
  return new Map(campos.map(({ chave, campo }) => [
    chave, new Set(r.rows.filter((x) => x.campo === campo).flatMap((x) => [x.codigo, x.rotulo])) as ReadonlySet<string>,
  ]));
}
