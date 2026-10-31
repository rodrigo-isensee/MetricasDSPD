import type { Consultavel } from '../../plataforma/db/pool.js';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { ListasRecorte } from './allow-list.js';
import { ErroColeta } from './erros.js';

/**
 * Lê as listas VIGENTES de `ref_dominio` (ADR 0023, item 5): `tipo_recorte`, `organizacao_recorte` e `equipe` (código =
 * a chave em texto decimal, rótulo = o nome), e os vocabulários `etapa`, `prioridade`, `categoria` e `descricao_workflow`. Nunca do `.env` e nunca com valor
 * inventado no código (M11). Lista de recorte vazia = a coleta não começa: um recorte vazio esconderia o erro.
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
  for (const [nome, lista] of [['tipo_recorte', listas.tipos], ['organizacao_recorte', listas.organizacoes], ['equipe', listas.equipes]] as const) {
    if (lista.size === 0) throw new ErroColeta('listas-vazias', { entidade: 'ref_dominio', coluna: nome });
  }
  return listas;
}
