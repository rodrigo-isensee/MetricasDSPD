import { CAMPOS_WORKLOG, ErroBusinessMap, TETO_WORKLOG, type ClienteHttp } from '../../../plataforma/http.js';
import { desembrulhar } from '../spike-forma.js';
import { itensDoWorklog, LOTE_CARDS } from './lotes.js';

// Pedido 087, K-330 (decisão 4a do dono): antes de ler as horas "não classificadas" do apontamento como retrato, confirmar na fonte se o
// BusinessMap entrega o comentário dos lançamentos. Só leitura e só contagem: UMA página de `/loggedTime` (pelo mesmo cliente, só GET), de
// uma página de `/cards` que serve apenas para dar o `card_ids` que o cliente exige (só `card_id`). Nada vai ao banco. Do worklog sobra
// três números; nome, id de usuário, texto do comentário e qualquer outro campo morrem aqui, em memória.

export interface ContagemComentario {
  comComentario: number;
  semChave: number;
  comentarioVazio: number;
  total: number;
}

type Classe = 'comComentario' | 'semChave' | 'comentarioVazio';

// semChave: `comment` ausente ou nulo (e item que nem objeto é). comentarioVazio: chave presente, mas vazia, só espaços ou não texto.
const classificar = (item: unknown): Classe => {
  const c = typeof item === 'object' && item !== null ? (item as Record<string, unknown>).comment : undefined;
  if (c === undefined || c === null) return 'semChave';
  return typeof c === 'string' && c.trim() !== '' ? 'comComentario' : 'comentarioVazio';
};

const idDoCard = (card: unknown): string | null => {
  const id = typeof card === 'object' && card !== null ? (card as Record<string, unknown>).card_id : undefined;
  return typeof id === 'number' && Number.isInteger(id) && id > 0 ? String(id) : null;
};

/** Conta, em uma página de worklogs: com texto, sem a chave `comment` (ausente ou nula) e com a chave mas vazia. */
export function contarComentarios(itens: readonly unknown[]): ContagemComentario {
  const n = { comComentario: 0, semChave: 0, comentarioVazio: 0 };
  for (const i of itens) n[classificar(i)] += 1;
  return { ...n, total: itens.length };
}

/** Lê uma página de cards (só `card_id`), depois UMA página de worklogs desses cards, e devolve só as contagens. */
export async function lerContagemComentario(cliente: Pick<ClienteHttp, 'get'>): Promise<ContagemComentario> {
  const cards = await cliente.get('/cards', { consulta: { state: 'active', fields: 'card_id', per_page: LOTE_CARDS, page: 1 } });
  const ids = desembrulhar(cards).itens.map(idDoCard).filter((id): id is string => id !== null).slice(0, LOTE_CARDS);
  if (ids.length === 0) return contarComentarios([]);
  const corpo = await cliente.get('/loggedTime', {
    consulta: { card_ids: ids.join(','), include_logged_time_for_subtasks: 1, fields: CAMPOS_WORKLOG, per_page: TETO_WORKLOG, page: 1 },
  });
  return contarComentarios(itensDoWorklog(corpo));
}

/** Saída fechada do comando: uma linha JSON com as três contagens, ou o código do erro (nunca a mensagem, que pode trazer valor). */
export async function executarD1(cliente: Pick<ClienteHttp, 'get'>): Promise<{ saida: string; erro: string | null }> {
  try {
    return { saida: `${JSON.stringify(await lerContagemComentario(cliente))}\n`, erro: null };
  } catch (e) {
    return { saida: '', erro: e instanceof ErroBusinessMap ? e.tipo : 'erro-interno' };
  }
}
