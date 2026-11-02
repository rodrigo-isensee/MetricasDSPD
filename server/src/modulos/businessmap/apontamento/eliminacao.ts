import type { Esquemas } from '../../../plataforma/db/esquemas.js';
import { esquemasDoAmbiente } from '../../../plataforma/db/esquemas.js';
import { emTransacao, type PoolLike } from '../../../plataforma/db/pool.js';
import { comTravaDaFonte } from '../../../plataforma/db/trava.js';
import { ErroColetaBm } from '../coleta.js';
import { diaCivil } from './coleta.js';
import { hmacUsuario, SAL_MINIMO_BYTES } from './supressao.js';

// Pedido 059 (K-193), A4 (CA-AP-10), ADR 0020 revisão 4 R4-6: eliminação a pedido do titular. Procedimento do `dspd_migrador` (dono; o
// `dspd_coletor` segue sem DELETE e sem UPDATE de pessoa), manual e numa transação: (1) grava o HMAC do `user_id` na lista de supressão,
// (2) apaga a linha de `dim_responsavel` (o nome e o `user_id`), (3) anula `pessoa_ref` nas linhas de `fato_apontamento`. As horas ficam como
// agregado do time (nenhuma linha do fato é apagada nem tem valor de hora alterado). A coleta seguinte não recria a pessoa: a supressão é
// consultada antes de `/users`. Roda sob a trava da fonte do BusinessMap, para não correr junto com uma coleta. Não há prazo nem expurgo
// automático aqui (o prazo é do DPO, decisão do dono). O `user_id` só existe em memória e na linha de comando; a saída traz só contagens.

const USO = 'uso: bm:eliminar-pessoa --usuario=<id do usuário no BusinessMap> [--confirmar]';

export interface ArgsEliminacao { usuarioId: string; confirmar: boolean }

/** Argumentos do comando; formato fora do esperado é recusado com a linha de uso (sem eco do valor recebido). */
export function analisarArgumentosEliminacao(argv: readonly string[]): ArgsEliminacao {
  const usuario = argv.filter((a) => a.startsWith('--usuario='));
  const confirmar = argv.filter((a) => a === '--confirmar');
  const m = usuario.length === 1 ? /^--usuario=([1-9]\d{0,11})$/.exec(usuario[0]!) : null;
  if (m === null || confirmar.length > 1 || usuario.length + confirmar.length !== argv.length) throw new ErroColetaBm('uso', USO);
  return { usuarioId: m[1]!, confirmar: confirmar.length === 1 };
}

export interface DepsEliminacao {
  /** Papel `dspd_migrador`. */
  pool: PoolLike;
  S?: Esquemas;
  /** `PESSOA_ELIMINADA_SAL` (pelo menos 32 bytes): o mesmo que a coleta usa para consultar a lista. */
  sal: string;
  agora: () => Date;
}

/** O que havia antes do procedimento (sem `--confirmar`, nada é gravado e o resultado só descreve o que seria feito). */
export interface ResultadoEliminacao {
  confirmado: boolean;
  /** O `user_id` já estava na lista de supressão. */
  jaSuprimida: boolean;
  /** Havia linha em `dim_responsavel` (nome da pessoa). */
  linhaDePessoa: boolean;
  /** Apontamentos do fato que ligavam horas à pessoa; passam a ficar sem vínculo (as horas permanecem no agregado do time). */
  apontamentosDesvinculados: number;
}

export async function eliminarPessoa(d: DepsEliminacao, args: ArgsEliminacao): Promise<ResultadoEliminacao> {
  if (Buffer.byteLength(d.sal) < SAL_MINIMO_BYTES) throw new ErroColetaBm('configuracao', `PESSOA_ELIMINADA_SAL ausente ou com menos de ${SAL_MINIMO_BYTES} bytes`);
  const S = d.S ?? esquemasDoAmbiente();
  const hash = hmacUsuario(d.sal, args.usuarioId);
  const r = await comTravaDaFonte(d.pool, 'businessmap', () => emTransacao(d.pool, async (db) => {
    const pessoa = await db.query<{ pessoa_ref: string }>(`SELECT pessoa_ref FROM ${S.bm}.dim_responsavel WHERE responsavel_id = $1 FOR UPDATE`, [args.usuarioId]);
    const ref = pessoa.rows[0]?.pessoa_ref ?? null;
    const lista = await db.query(`SELECT 1 FROM ${S.bm}.cfg_pessoa_eliminada WHERE hash_usuario = decode($1, 'hex')`, [hash]);
    const horas = ref === null ? { rows: [{ n: '0' }] } : await db.query<{ n: string }>(`SELECT count(*) AS n FROM ${S.bm}.fato_apontamento WHERE pessoa_ref = $1`, [ref]);
    const feito: ResultadoEliminacao = {
      confirmado: args.confirmar, jaSuprimida: lista.rows.length > 0, linhaDePessoa: ref !== null, apontamentosDesvinculados: Number(horas.rows[0]!.n),
    };
    if (!args.confirmar) return feito;
    await db.query(
      `INSERT INTO ${S.bm}.cfg_pessoa_eliminada (hash_usuario, eliminada_em) VALUES (decode($1, 'hex'), $2::date) ON CONFLICT ON CONSTRAINT cfg_pessoa_eliminada_pkey DO NOTHING`,
      [hash, diaCivil(d.agora())]);
    if (ref !== null) {
      await db.query(`DELETE FROM ${S.bm}.dim_responsavel WHERE responsavel_id = $1`, [args.usuarioId]);
      await db.query(`UPDATE ${S.bm}.fato_apontamento SET pessoa_ref = NULL WHERE pessoa_ref = $1`, [ref]);
    }
    return feito;
  }));
  if (!r.executou) throw new ErroColetaBm('trava', 'outra coleta do BusinessMap em andamento');
  return r.valor;
}
