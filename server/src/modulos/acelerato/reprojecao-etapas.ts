import { acelerato } from '@metricas-dspd/metricas';
import { FERIADOS_NACIONAIS } from '@metricas-dspd/metricas/core';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import { emTransacao, type PoolLike } from '../../plataforma/db/pool.js';
import { lerCalendarioVigente, lerTurnosVigentes } from '../referencia/repositorio.js';
import { registrarCriterioD7528 } from '../referencia/criterios-acelerato.js';
import { exigirEsquemaSemSeed } from './erros.js';
import { etapasDoStaging, regravarIntervalos, TAMANHO_LOTE } from './projetor.js';

/**
 * Reprojeção dos intervalos por etapa (D-7) com o dia útil de 8 h 48 (K-308; ADR 0027, item 7.4; Decisão 25a do dono, pedido 099). Uma transação
 * só (tudo ou nada), com a credencial do migrador: registra a versão `099:D-7-528` e refaz SÓ `fato_etapa_chamado` dos chamados fechados, a
 * partir das etapas da última versão do staging. Nada coletado é tocado (`stg_*`, `dim_chamado_versao`, `dim_chamado`, versões de critério
 * existentes, BusinessMap). Repetir é seguro. Sem dado de pessoa: o staging não tem coluna de pessoa (ADR 0020).
 */
export const VERSAO_REPROJECAO_D7 = 'acelerato-f2/2-reprojecao-d7';

/** Recusa antes de qualquer escrita (a mensagem lista só o que diverge; código de saída 4 na entrada). */
export class ErroReprojecao extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroReprojecao';
  }
}

export type ResultadoReprojecao = { vigenteDesde: string; versaoNova: boolean; coletaId: number; chamados: number; etapas: number; semIntervalo: number };

const minutos = (t: { inicioMin: number; fimMin: number }): string => `${t.inicioMin}-${t.fimMin}`;

/**
 * Pré-condição: o calendário vigente da referência para `acelerato/sustentacao` é igual ao `CALENDARIO_SUSTENTACAO_PADRAO` (turnos, feriados e
 * deslocamento). Sem turnos gravados, a medição usa os turnos da Sustentação (como `calendarioDaReferencia` das métricas). Devolve as divergências.
 */
async function divergencias(db: Parameters<typeof lerCalendarioVigente>[0], S: Esquemas): Promise<string[]> {
  const ref = await lerCalendarioVigente(db, S, 'acelerato', 'sustentacao');
  if (ref === null) throw new ErroReprojecao('o calendário da Sustentação não está na referência: rode ref:sync-calendario antes');
  const padrao = acelerato.CALENDARIO_SUSTENTACAO_PADRAO;
  const gravados = await lerTurnosVigentes(db, S, 'acelerato', 'sustentacao');
  const turnos = gravados.length > 0 ? gravados : acelerato.TURNOS_SUSTENTACAO;
  const lista: string[] = [];
  if (turnos.map(minutos).join(';') !== padrao.turnos.map(minutos).join(';')) lista.push(`turnos: referência ${turnos.map(minutos).join(';')}, código ${padrao.turnos.map(minutos).join(';')}`);
  if (ref.offsetMinutos !== padrao.offsetMinutos) lista.push(`deslocamento: referência ${ref.offsetMinutos}, código ${padrao.offsetMinutos}`);
  const naRef = new Set(ref.feriados);
  const noCodigo = new Set<string>(FERIADOS_NACIONAIS);
  for (const f of [...naRef].sort()) if (!noCodigo.has(f)) lista.push(`feriado a mais na referência: ${f}`);
  for (const f of [...noCodigo].sort()) if (!naRef.has(f)) lista.push(`feriado a menos na referência: ${f}`);
  return lista;
}

/** Data civil (-03:00) do instante, AAAA-MM-DD. */
const dataCivilBrasilia = (d: Date): string => new Date(d.getTime() - 3 * 3_600_000).toISOString().slice(0, 10);

export async function reprojetarEtapasAcelerato(pool: PoolLike, S: Esquemas, agora: () => Date): Promise<ResultadoReprojecao> {
  return emTransacao(pool, async (db) => {
    await exigirEsquemaSemSeed(db, S);
    const diverge = await divergencias(db, S);
    if (diverge.length > 0) throw new ErroReprojecao(`o calendário da referência difere do da montagem (CALENDARIO_SUSTENTACAO_PADRAO): ${diverge.join('; ')}`);
    const inicio = agora();
    const vigenteDesde = dataCivilBrasilia(inicio);
    const ctl = await db.query<{ coleta_id: string }>(
      `INSERT INTO ${S.ac}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor) VALUES ('projecao', $1, 'em_andamento', $2) RETURNING coleta_id`, [inicio, VERSAO_REPROJECAO_D7]);
    const coletaId = Number(ctl.rows[0]!.coleta_id);
    const versaoNova = await registrarCriterioD7528(db, S, vigenteDesde, inicio);
    let chamados = 0, etapas = 0, semIntervalo = 0;
    let cursor = '';
    for (;;) {
      const lote = await db.query<{ chamado_id: string; data_finalizado: Date; excluido: boolean; fora_do_recorte: boolean }>(
        `SELECT chamado_id, data_finalizado, excluido, fora_do_recorte FROM ${S.ac}.dim_chamado
          WHERE data_finalizado IS NOT NULL AND NOT excluido AND NOT fora_do_recorte AND chamado_id > $1
          ORDER BY chamado_id LIMIT ${TAMANHO_LOTE}`, [cursor]);
      if (lote.rows.length === 0) break;
      const r = await regravarIntervalos(db, S, lote.rows, await etapasDoStaging(db, S, lote.rows.map((x) => x.chamado_id)), acelerato.CALENDARIO_SUSTENTACAO_PADRAO, coletaId, inicio);
      chamados += lote.rows.length; etapas += r.etapas; semIntervalo += r.semIntervalo;
      cursor = lote.rows[lote.rows.length - 1]!.chamado_id;
    }
    await db.query(`UPDATE ${S.ac}.ctl_coleta SET status = 'sucesso', finalizado_em = $2 WHERE coleta_id = $1`, [coletaId, agora()]);
    return { vigenteDesde, versaoNova, coletaId, chamados, etapas, semIntervalo };
  });
}
