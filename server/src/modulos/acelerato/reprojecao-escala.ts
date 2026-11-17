import type { Esquemas } from '../../plataforma/db/esquemas.js';
import { emTransacao, type PoolLike } from '../../plataforma/db/pool.js';
import { registrarContagens, type Contagem } from './controle.js';
import { exigirEsquemaSemSeed } from './erros.js';
import { escalaPDaPrioridade } from './normalizador.js';
import { TAMANHO_LOTE } from './projetor.js';
import { ultimasDeChamados } from './staging.js';

/**
 * Preenchimento da `escala_p` (0040) dos chamados já projetados (pedido 105, E7.238; S1 B do dono). A projeção só trata versões do staging
 * ainda sem versão na dimensão e a migração 0040 criou `dim_chamado.escala_p` sem preencher o passado: este comando reaplica a regra que
 * já existe (`escalaPDaPrioridade`, a mesma do projetor) ao texto da prioridade da última versão do staging, SÓ nos chamados com prioridade
 * e `escala_p` nula. Uma transação só (tudo ou nada), lotes de `TAMANHO_LOTE`, credencial do migrador. O `UPDATE` só toca linha com
 * `escala_p IS NULL` e só grava resultado não nulo; repetir não muda nenhuma tabela de dados e, sem linha preenchida, não grava nem `ctl_coleta`
 * (K-398: a linha de `projecao` moveria a marca d'água de carga que a API lê). Do staging só sai o booleano derivado do texto da prioridade (escala da matriz ou não): nada de pessoa nem de texto livre.
 */
export const VERSAO_REPROJECAO_ESCALA = 'acelerato-f2/2-reprojecao-escala';

export type ResultadoReprojecaoEscala = { coletaId: number | null; lidos: number; escalaP: number; outrasEscalas: number; semEscala: number };

export async function reprojetarEscalaAcelerato(pool: PoolLike, S: Esquemas, agora: () => Date): Promise<ResultadoReprojecaoEscala> {
  return emTransacao(pool, async (db) => {
    await exigirEsquemaSemSeed(db, S);
    const inicio = agora();
    let lidos = 0, escalaP = 0, outrasEscalas = 0, preenchidos = 0;
    let cursor = '';
    for (;;) {
      const lote = await db.query<{ chamado_id: string }>(
        `SELECT chamado_id FROM ${S.ac}.dim_chamado WHERE escala_p IS NULL AND prioridade IS NOT NULL AND chamado_id > $1 ORDER BY chamado_id LIMIT ${TAMANHO_LOTE}`, [cursor]);
      if (lote.rows.length === 0) break;
      const ids = lote.rows.map((x) => x.chamado_id);
      const staging = await ultimasDeChamados(db, S, ids);
      const novos = ids
        .map((id) => {
          const p = staging.get(id)?.payload.prioridade;
          return { id, escala: escalaPDaPrioridade(typeof p === 'string' ? p : null) };
        })
        .filter((x): x is { id: string; escala: boolean } => x.escala !== null);
      if (novos.length > 0) {
        const r = await db.query(
          `UPDATE ${S.ac}.dim_chamado d SET escala_p = v.escala FROM unnest($1::text[], $2::boolean[]) AS v(chamado_id, escala) WHERE d.chamado_id = v.chamado_id AND d.escala_p IS NULL`,
          [novos.map((x) => x.id), novos.map((x) => x.escala)]);
        preenchidos += Number(r.rowCount);
        escalaP += novos.filter((x) => x.escala).length;
        outrasEscalas += novos.filter((x) => !x.escala).length;
      }
      lidos += ids.length;
      cursor = ids[ids.length - 1]!;
    }
    const semEscala = lidos - escalaP - outrasEscalas;
    // Sem linha preenchida, nada é gravado: a linha de projecao em ctl_coleta moveria a marca d'água de carga que a API lê (K-398, completa o K-397).
    if (preenchidos === 0) return { coletaId: null, lidos, escalaP, outrasEscalas, semEscala };
    const ctl = await db.query<{ coleta_id: string }>(
      `INSERT INTO ${S.ac}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor) VALUES ('projecao', $1, 'em_andamento', $2) RETURNING coleta_id`, [inicio, VERSAO_REPROJECAO_ESCALA]);
    const coletaId = Number(ctl.rows[0]!.coleta_id);
    const contagens: Contagem[] = [
      { entidade: 'reprojecao_escala_chamado', lidos, inseridos: escalaP + outrasEscalas, jaExistentes: 0, falhas: 0 },
      { entidade: 'reprojecao_escala_outras', lidos: outrasEscalas, inseridos: 0, jaExistentes: 0, falhas: 0 },
      { entidade: 'reprojecao_escala_sem_escala', lidos: semEscala, inseridos: 0, jaExistentes: 0, falhas: 0 },
    ];
    await registrarContagens(db, S, coletaId, contagens);
    await db.query(`UPDATE ${S.ac}.ctl_coleta SET status = 'sucesso', finalizado_em = $2 WHERE coleta_id = $1`, [coletaId, agora()]);
    return { coletaId, lidos, escalaP, outrasEscalas, semEscala };
  });
}
