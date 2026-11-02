import { comTravaDaFonte } from '../../../plataforma/db/trava.js';
import { ErroColetaBm } from '../coleta.js';
import { coletarApontamentos, type DepsApontamento, type ModoApontamento, type ResultadoApontamento } from './coleta.js';

// Pedido 059 (K-193), A3: comando manual `bm:apontamento carga-inicial [--inicio=AAAA-MM-DD]` (ADR 0025 item 9): nunca agendado, na
// máquina do dono e com ele presente, retomável por lote de cards, sob a MESMA trava da fonte da coleta de cards (exclusão mútua).
// O incremental roda como etapa do comando de coleta dos cards (`etapaApontamento`), depois dela e sob a mesma trava.

const USO = 'uso: bm:apontamento carga-inicial [--inicio=AAAA-MM-DD]';

/** Argumentos do comando; qualquer coisa fora do formato é recusada com a linha de uso (sem eco do valor recebido). */
export function analisarArgumentosApontamento(argv: readonly string[]): ModoApontamento {
  const [modo, ...opcoes] = argv;
  if (modo !== 'carga-inicial' || opcoes.length > 1) throw new ErroColetaBm('uso', USO);
  if (opcoes.length === 0) return { tipo: 'carga_inicial' };
  const m = /^--inicio=(\d{4}-\d{2}-\d{2})$/.exec(opcoes[0]!);
  if (m === null || Number.isNaN(Date.parse(m[1]!))) throw new ErroColetaBm('uso', USO);
  return { tipo: 'carga_inicial', inicio: m[1]! };
}

/** Executa a coleta do worklog sob a trava da fonte; sem a trava, recusa (outra coleta do BusinessMap está rodando). */
export async function executarApontamento(d: DepsApontamento, modo: ModoApontamento): Promise<ResultadoApontamento> {
  const r = await comTravaDaFonte(d.pool, 'businessmap', () => coletarApontamentos(d, modo));
  if (!r.executou) throw new ErroColetaBm('trava', 'outra coleta do BusinessMap em andamento');
  return r.valor;
}
