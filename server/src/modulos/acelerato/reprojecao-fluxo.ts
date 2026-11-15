import type { Esquemas } from '../../plataforma/db/esquemas.js';
import { emTransacao, type PoolLike } from '../../plataforma/db/pool.js';
import { Contadores } from './allow-list.js';
import { registrarContagens, type Contagem } from './controle.js';
import { exigirEsquemaSemSeed } from './erros.js';
import { fluxoDoChamado } from './normalizador.js';
import { etapasDoStaging, TAMANHO_LOTE } from './projetor.js';

/**
 * Preenchimento do `fluxo` (D2) dos chamados já projetados (pedido 105, E6.16). A projeção só trata versões do staging ainda sem versão
 * na dimensão e a migração 0038 criou `dim_chamado.fluxo` sem preencher o passado: este comando reaplica a regra que já existe
 * (`etapasDoStaging` + `fluxoDoChamado`, sem regra nova) às etapas da última versão do staging, SÓ nos chamados com `fluxo` nulo. Uma
 * transação só (tudo ou nada), lotes de `TAMANHO_LOTE`, credencial do migrador. Preencher coluna nula nunca apaga valor: o `UPDATE` só
 * toca linha com `fluxo IS NULL` e só grava resultado não nulo (fluxo múltiplo e "sem fluxo" seguem nulos). `dim_chamado_versao` não tem
 * a coluna, e o staging e os intervalos não são tocados. Repetir não muda nenhuma tabela de dados (só soma uma linha de execução em
 * `ctl_coleta`). Do staging só saem a descrição do workflow das etapas: nada de pessoa nem de texto livre.
 */
export const VERSAO_REPROJECAO_FLUXO = 'acelerato-f2/2-reprojecao-fluxo';

export type ResultadoReprojecaoFluxo = { coletaId: number; lidos: number; preenchidos: number; fluxoMultiplo: number; semFluxo: number };

export async function reprojetarFluxoAcelerato(pool: PoolLike, S: Esquemas, agora: () => Date): Promise<ResultadoReprojecaoFluxo> {
  return emTransacao(pool, async (db) => {
    await exigirEsquemaSemSeed(db, S);
    const inicio = agora();
    const ctl = await db.query<{ coleta_id: string }>(
      `INSERT INTO ${S.ac}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor) VALUES ('projecao', $1, 'em_andamento', $2) RETURNING coleta_id`, [inicio, VERSAO_REPROJECAO_FLUXO]);
    const coletaId = Number(ctl.rows[0]!.coleta_id);
    const c = new Contadores();
    let lidos = 0, preenchidos = 0;
    let cursor = '';
    for (;;) {
      const lote = await db.query<{ chamado_id: string }>(
        `SELECT chamado_id FROM ${S.ac}.dim_chamado WHERE fluxo IS NULL AND chamado_id > $1 ORDER BY chamado_id LIMIT ${TAMANHO_LOTE}`, [cursor]);
      if (lote.rows.length === 0) break;
      const ids = lote.rows.map((x) => x.chamado_id);
      const etapasDe = await etapasDoStaging(db, S, ids);
      const novos = ids.map((id) => ({ id, fluxo: fluxoDoChamado(etapasDe.get(id) ?? [], c) })).filter((x): x is { id: string; fluxo: string } => x.fluxo !== null);
      if (novos.length > 0) {
        const r = await db.query(
          `UPDATE ${S.ac}.dim_chamado d SET fluxo = v.fluxo FROM unnest($1::text[], $2::text[]) AS v(chamado_id, fluxo) WHERE d.chamado_id = v.chamado_id AND d.fluxo IS NULL`,
          [novos.map((x) => x.id), novos.map((x) => x.fluxo)]);
        preenchidos += Number(r.rowCount);
      }
      lidos += ids.length;
      cursor = ids[ids.length - 1]!;
    }
    const fluxoMultiplo = c.obter('fluxo_multiplo');
    const semFluxo = lidos - preenchidos - fluxoMultiplo;
    const contagens: Contagem[] = [
      { entidade: 'reprojecao_fluxo_chamado', lidos, inseridos: preenchidos, jaExistentes: 0, falhas: 0 },
      { entidade: 'reprojecao_fluxo_multiplo', lidos: fluxoMultiplo, inseridos: 0, jaExistentes: 0, falhas: 0 },
      { entidade: 'reprojecao_fluxo_sem_fluxo', lidos: semFluxo, inseridos: 0, jaExistentes: 0, falhas: 0 },
    ];
    await registrarContagens(db, S, coletaId, contagens);
    await db.query(`UPDATE ${S.ac}.ctl_coleta SET status = 'sucesso', finalizado_em = $2 WHERE coleta_id = $1`, [coletaId, agora()]);
    return { coletaId, lidos, preenchidos, fluxoMultiplo, semFluxo };
  });
}
