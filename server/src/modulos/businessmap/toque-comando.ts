import { comTravaDaFonte } from '../../plataforma/db/trava.js';
import { ErroColetaBm } from './coleta.js';
import { AMOSTRA_PADRAO, coletarToque, JANELA_PADRAO_MIN, type DepsToque, type ModoToque, type ResumoToque } from './toque-coleta.js';

// Pedido 105 (O22, B7b; ADR 0020 R6-8): comando manual `bm:carga-toque [--janela=<min>] | --amostra[=<N>]`. Sem argumento é a carga do passado (janela de 60 min,
// retomável por card: relê só os não lidos e os `leitura_incompleta`); `--amostra` é o portão de carga (N cards sorteados, metade arquivada ou descartada, padrão 50).
// Nunca agendado, sob a MESMA trava da fonte da coleta de cards (carga e coleta diária nunca rodam juntas). A saída é o resumo de contagens e códigos.

const USO = 'uso: bm:carga-toque [--janela=<minutos de 1 a 600>] | --amostra[=<N par de 2 a 200>]';

/** Argumentos do comando; qualquer coisa fora do formato é recusada com a linha de uso (sem eco do valor recebido). */
export function analisarArgumentosToque(argv: readonly string[]): ModoToque {
  if (argv.length === 0) return { tipo: 'carga', janelaMin: JANELA_PADRAO_MIN };
  if (argv.length > 1) throw new ErroColetaBm('uso', USO);
  const janela = /^--janela=(\d{1,3})$/.exec(argv[0]!);
  if (janela !== null && Number(janela[1]) >= 1 && Number(janela[1]) <= 600) return { tipo: 'carga', janelaMin: Number(janela[1]) };
  const amostra = /^--amostra(?:=(\d{1,3}))?$/.exec(argv[0]!);
  if (amostra === null) throw new ErroColetaBm('uso', USO);
  const n = amostra[1] === undefined ? AMOSTRA_PADRAO : Number(amostra[1]);
  if (n < 2 || n > 200 || n % 2 !== 0) throw new ErroColetaBm('uso', USO);
  return { tipo: 'portao', amostra: n };
}

/** Executa a carga ou o portão sob a trava da fonte; sem a trava, recusa (outra coleta do BusinessMap está rodando). */
export async function executarCargaToque(d: DepsToque, modo: ModoToque): Promise<ResumoToque> {
  const r = await comTravaDaFonte(d.pool, 'businessmap', () => coletarToque(d, modo));
  if (!r.executou) throw new ErroColetaBm('trava', 'outra coleta do BusinessMap em andamento');
  return r.valor;
}
