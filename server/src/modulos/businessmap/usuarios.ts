import { esquemasDoAmbiente, type Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import { CAMPOS_USERS, ErroBusinessMap, lotesDeUserIds, type ClienteHttp } from '../../plataforma/http.js';
import { desembrulhar } from './spike-forma.js';

// F3 do plano 052 (K-182), Q-8 = B e ADR 0020 (revisão 3): nome do responsável por `GET /users`, gravado só em `dim_responsavel`
// (colunas de `COLUNAS_PESSOA`, fora do GRANT da API). A resposta é projetada em `user_id` e `realname` ANTES de qualquer uso
// (A4 da segurança da F1: a API devolve `attributes` e outros campos mesmo com `fields`). Nada aqui é logado nem devolvido ao
// chamador além de contagens e do código do erro: nem id, nem nome.

/** DT-2: um id visto na execução cuja linha tem mais de 30 dias é pedido de novo a `/users`. */
export const PRAZO_RELEITURA_DIAS = 30;
const DIA_MS = 86_400_000;
const ID_USUARIO = /^\d{1,12}$/;
const NOME_MAXIMO = 200;

export interface UsuarioProjetado { id: string; nome: string }

/**
 * A4: do corpo de `/users` sai só `{ id, nome }`. Qualquer outro campo (`attributes`, e-mail, nome de usuário, avatar) é descartado
 * aqui, item por item; item sem id numérico ou sem nome utilizável é ignorado. Controles e quebras de linha saem do nome.
 */
export function projetarUsuarios(corpo: unknown): UsuarioProjetado[] {
  const saida: UsuarioProjetado[] = [];
  for (const item of desembrulhar(corpo).itens) {
    if (typeof item !== 'object' || item === null) continue;
    const { user_id: bruto, realname } = item as Record<string, unknown>;
    const id = typeof bruto === 'number' && Number.isInteger(bruto) && bruto > 0 ? String(bruto) : typeof bruto === 'string' ? bruto : '';
    const nome = typeof realname === 'string' ? realname.replace(/\p{Cc}+/gu, ' ').trim() : '';
    if (ID_USUARIO.test(id) && nome !== '' && nome.length <= NOME_MAXIMO) saida.push({ id, nome });
  }
  return saida;
}

export interface ResultadoUsuarios {
  /** Ids pedidos a `/users` (sem linha, ou com linha de mais de 30 dias). */
  pedidos: number;
  resolvidos: number;
  /** Pedidos que a API não devolveu: a linha existente fica como está (pessoa removida do BusinessMap). */
  naoResolvidos: number;
  /** Código do erro de `/users` (nunca mensagem); `null` se tudo correu bem. A coleta dos cards não para por isso. */
  falha: string | null;
}

/**
 * Resolve os nomes dos ids vistos na execução. Só pede os ids sem linha ou com `atualizado_em` mais antigo que 30 dias, em lotes.
 * UPSERT com `atualizado_em = agora`. Erro de `/users` interrompe só esta etapa (os ids ficam para a próxima execução);
 * erro de banco sobe ao chamador.
 */
export async function resolverResponsaveis(
  db: Consultavel, cliente: Pick<ClienteHttp, 'get'>, vistos: Iterable<string>, agora: Date, S: Esquemas = esquemasDoAmbiente(),
): Promise<ResultadoUsuarios> {
  const ids = [...new Set([...vistos].filter((i) => ID_USUARIO.test(i)))].sort();
  if (ids.length === 0) return { pedidos: 0, resolvidos: 0, naoResolvidos: 0, falha: null };
  const limite = new Date(agora.getTime() - PRAZO_RELEITURA_DIAS * DIA_MS);
  const recentes = await db.query<{ responsavel_id: string }>(
    `SELECT responsavel_id FROM ${S.bm}.dim_responsavel WHERE responsavel_id = ANY($1::text[]) AND atualizado_em >= $2`, [ids, limite]);
  const frescos = new Set(recentes.rows.map((r) => r.responsavel_id));
  const pedir = ids.filter((i) => !frescos.has(i));
  let resolvidos = 0;
  let falha: string | null = null;
  for (const lote of lotesDeUserIds(pedir)) {
    const pedidosDoLote = new Set(lote.split(','));
    let corpo: unknown;
    try {
      corpo = await cliente.get('/users', { consulta: { fields: CAMPOS_USERS, user_ids: lote } });
    } catch (e) {
      if (!(e instanceof ErroBusinessMap)) throw e;
      falha = e.tipo;
      break;
    }
    // só o que foi pedido: id que a API devolver a mais não entra
    const unicos = new Map(projetarUsuarios(corpo).filter((u) => pedidosDoLote.has(u.id)).map((u) => [u.id, u.nome]));
    if (unicos.size === 0) continue;
    // UPSERT em dois passos (o projeto proíbe DO UPDATE fora das projeções do staging): atualiza o que existe e insere o que falta
    const valores = [[...unicos.keys()], [...unicos.values()], agora];
    await db.query(
      `UPDATE ${S.bm}.dim_responsavel AS r SET responsavel_nome = u.nome, atualizado_em = $3
       FROM unnest($1::text[], $2::text[]) AS u(id, nome) WHERE r.responsavel_id = u.id`, valores);
    await db.query(
      `INSERT INTO ${S.bm}.dim_responsavel (responsavel_id, responsavel_nome, atualizado_em)
       SELECT u.id, u.nome, $3 FROM unnest($1::text[], $2::text[]) AS u(id, nome)
       ON CONFLICT ON CONSTRAINT dim_responsavel_pkey DO NOTHING`, valores);
    resolvidos += unicos.size;
  }
  return { pedidos: pedir.length, resolvidos, naoResolvidos: falha === null ? pedir.length - resolvidos : 0, falha };
}
