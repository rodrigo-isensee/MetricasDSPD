import { esquemasDoAmbiente, type Esquemas } from '../../plataforma/db/esquemas.js';
import { emTransacao, type PoolLike } from '../../plataforma/db/pool.js';
import { comTravaDaFonte } from '../../plataforma/db/trava.js';
import type { ClienteHttp } from '../../plataforma/http.js';
import { coletarCards, ErroColetaBm, inicioDaCarga, type ModoColeta, type ResultadoColeta } from './coleta.js';
import type { Conferencia } from './conferencia.js';
import { projetarBusinessMap, type ResultadoProjecao } from './projetor.js';
import {
  lerReferenciaReal, registrarFolhasSemConferencia, sincronizarReferencia, type Motivo, type MotivosPorChave, type Resultado,
} from './referencia.js';

// Comando manual da coleta do BusinessMap (F3, plano 052; sem registro na agenda, H-20 = C): `bm:coleta carga-inicial|incremental`.
// Orquestra a trava da fonte, a carga da referência da F2 (A2 da segurança e A2 do review da F2) e a coleta dos cards.

export interface ArgsColeta {
  modo: 'carga-inicial' | 'incremental';
  inicio?: string;
  motivo?: Motivo | MotivosPorChave;
  /** Projeta o staging logo depois da coleta, na mesma execução: é o que leva os responsáveis lidos em memória ao projetor (I-2). */
  projetar?: boolean;
}

const TABELAS_REF = 'ref_quadro|ref_workflow|ref_coluna|ref_tipo_card';
const MOTIVO_CHAVE = new RegExp(`^--motivo-chave=(${TABELAS_REF}):([0-9A-Za-z|_-]{1,64})=(processo|correcao)$`);
const USO = 'uso: bm:coleta carga-inicial|incremental [--inicio=AAAA-MM-DD (só carga-inicial)] [--motivo=processo|correcao | --motivo-chave=tabela:chave=processo|correcao ...] [--projetar]';

/** Argumentos do comando. Qualquer coisa fora do formato é recusada com a linha de uso (sem eco do valor recebido). */
export function analisarArgumentos(argv: readonly string[]): ArgsColeta {
  const [modo, ...opcoes] = argv;
  if (modo !== 'carga-inicial' && modo !== 'incremental') throw new ErroColetaBm('uso', USO);
  let inicio: string | undefined;
  let global: Motivo | undefined;
  let projetar = false;
  const porChave = new Map<string, Motivo>();
  for (const o of opcoes) {
    const i = /^--inicio=(\d{4}-\d{2}-\d{2})$/.exec(o);
    const g = /^--motivo=(processo|correcao)$/.exec(o);
    const k = MOTIVO_CHAVE.exec(o);
    if (o === '--projetar' && !projetar) projetar = true;
    else if (i !== null && modo === 'carga-inicial' && inicio === undefined && !Number.isNaN(Date.parse(i[1]!))) inicio = i[1]!;
    else if (g !== null && global === undefined) global = g[1] as Motivo;
    else if (k !== null) porChave.set(`${k[1]} ${k[2]}`, k[3] as Motivo);
    else throw new ErroColetaBm('uso', USO);
  }
  if (global !== undefined && porChave.size > 0) throw new ErroColetaBm('uso', `${USO} (use --motivo ou --motivo-chave, não os dois)`);
  return {
    modo, ...(inicio === undefined ? {} : { inicio }), ...(global !== undefined ? { motivo: global } : porChave.size > 0 ? { motivo: porChave } : {}),
    ...(projetar ? { projetar } : {}),
  };
}

export interface DepsComando {
  cliente: Pick<ClienteHttp, 'get'>;
  /** Papel `dspd_coletor`: cards, controle, `dim_responsavel` e a contagem da referência. */
  poolColetor: PoolLike;
  /** Papel `dspd_ref`: só a transação da carga da referência. */
  poolRef: PoolLike;
  conf: Conferencia;
  quadros: readonly number[];
  hostBase: string;
  agora: () => Date;
  paginaTamanho?: number;
  S?: Esquemas;
}

/**
 * A2 da segurança da F2: a carga da referência roda em UMA transação com o papel de referência (rollback sem linha nova nem fechada
 * se algo falhar); o `dspd_coletor` só escreve a contagem de folhas sem conferência; a estrutura lida não é logada em lugar nenhum.
 */
export function etapaReferencia(
  d: DepsComando, hoje: string, inicioCarga: string, motivo: ArgsColeta['motivo'],
): (coletaId: number, ctx?: { inicioCarga: string | null }) => Promise<Resultado> {
  const S = d.S ?? esquemasDoAmbiente();
  // A6 do review da F3: na retomada, a referência recebe o início da carga retomada (`ctx`), não o de hoje
  return async (coletaId, ctx) => {
    const lida = await lerReferenciaReal(d.cliente, d.quadros);
    const r = await emTransacao(d.poolRef, (db) => sincronizarReferencia(db, lida, d.conf, { hoje, inicioCarga: ctx?.inicioCarga ?? inicioCarga, motivo, agora: d.agora() }, S));
    await registrarFolhasSemConferencia(d.poolColetor, coletaId, r.semConferencia, S);
    return r;
  };
}

/** Executa a coleta sob a trava da fonte; sem a trava, recusa (outra coleta do BusinessMap está rodando). */
export type ResultadoComando = ResultadoColeta & { projecao: ResultadoProjecao | null };

export async function executarColeta(d: DepsComando, args: ArgsColeta): Promise<ResultadoComando> {
  if (d.quadros.length === 0) throw new ErroColetaBm('configuracao', 'BUSINESSMAP_QUADROS_IDS vazio');
  const agora = d.agora();
  const modo: ModoColeta = args.modo === 'carga-inicial' ? { tipo: 'carga_inicial', inicio: args.inicio } : { tipo: 'incremental' };
  const responsaveis = new Map<string, string[]>();
  const r = await comTravaDaFonte(d.poolColetor, 'businessmap', async () => {
    const coleta = await coletarCards({
      cliente: d.cliente, pool: d.poolColetor, ...(d.S === undefined ? {} : { S: d.S }), quadros: d.quadros, hostBase: d.hostBase, agora: d.agora,
      ...(d.paginaTamanho === undefined ? {} : { paginaTamanho: d.paginaTamanho }),
      etapaReferencia: etapaReferencia(d, agora.toISOString().slice(0, 10), args.inicio ?? inicioDaCarga(agora), args.motivo),
      ...(args.projetar === true ? { responsaveis } : {}),
    }, modo);
    // F4: com a coleta que gravou staging (sucesso ou parcial), projeta na mesma execução e sob a mesma trava
    const projecao = args.projetar === true && coleta.estado !== 'falha'
      ? await projetarBusinessMap({ pool: d.poolColetor, ...(d.S === undefined ? {} : { S: d.S }), agora: d.agora, responsaveis })
      : null;
    return { ...coleta, projecao };
  });
  if (!r.executou) throw new ErroColetaBm('trava', 'outra coleta do BusinessMap em andamento');
  return r.valor;
}
