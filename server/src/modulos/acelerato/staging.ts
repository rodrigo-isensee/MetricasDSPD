import { createHash } from 'node:crypto';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';

/**
 * Staging do Acelerato (ADR 0023, item 6; data-model §1 e §4): só INSERT, nada é apagado nem atualizado. Hash igual à
 * ÚLTIMA versão ignora; hash diferente vira versão nova encadeada por `anterior_sk` (SCD2). O hash cobre o registro
 * filtrado e as marcas `ausente_na_extracao` e `fora_do_recorte` (mudança só em coluna barrada não gera versão, porque a
 * coluna nem chega aqui). `sincronizado_em` e `estatisticas_em` ficam no `payload`, mas FORA do hash: são carimbos da
 * cópia, mudam a cada ciclo dela e, dentro do hash, criariam uma versão por linha a cada releitura.
 * O `payload` recebido já passou pela allow-list (`allow-list.ts`); este arquivo não conhece coluna de pessoa.
 */
export type Registro = Record<string, unknown>;
export type MarcasStaging = { ausente: boolean; fora: boolean };
export type VersaoAtual = { sk: string; sha: Buffer; payload: Registro } & MarcasStaging;
export type ResultadoVersao = { resultado: 'inserido' | 'ja_existente'; versao: VersaoAtual };

const FORA_DO_HASH = ['sincronizado_em', 'estatisticas_em'] as const;

export const serializar = (registro: Registro): string => JSON.stringify(registro);

export function hashDe(payload: Registro, marcas: MarcasStaging): Buffer {
  const base: Registro = { ...payload };
  for (const k of FORA_DO_HASH) delete base[k];
  return createHash('sha256').update(JSON.stringify({ p: base, a: marcas.ausente, f: marcas.fora })).digest();
}

type LinhaUltima = { stg_sk: string; payload_sha256: Buffer; payload: Registro; ausente_na_extracao: boolean; fora_do_recorte?: boolean };
const daLinha = (l: LinhaUltima): VersaoAtual => ({
  sk: String(l.stg_sk), sha: l.payload_sha256, payload: l.payload, ausente: l.ausente_na_extracao, fora: l.fora_do_recorte ?? false,
});

/** Última versão (maior `stg_sk`) de cada chamado, em lote. */
export async function ultimasDeChamados(db: Consultavel, S: Esquemas, ids: readonly string[]): Promise<Map<string, VersaoAtual>> {
  const r = await db.query<LinhaUltima & { id_origem: string }>(
    `SELECT DISTINCT ON (id_origem) id_origem, stg_sk, payload_sha256, payload, ausente_na_extracao, fora_do_recorte
       FROM ${S.ac}.stg_chamado WHERE id_origem = ANY($1::text[]) ORDER BY id_origem, stg_sk DESC`, [[...ids]]);
  return new Map(r.rows.map((l) => [l.id_origem, daLinha(l)]));
}

/** Todos os chamados conhecidos, com a marca da última versão (para a saída do recorte). */
export async function chamadosConhecidos(db: Consultavel, S: Esquemas): Promise<Map<string, MarcasStaging>> {
  const r = await db.query<{ id_origem: string; ausente_na_extracao: boolean; fora_do_recorte: boolean }>(
    `SELECT DISTINCT ON (id_origem) id_origem, ausente_na_extracao, fora_do_recorte
       FROM ${S.ac}.stg_chamado ORDER BY id_origem, stg_sk DESC`);
  return new Map(r.rows.map((l) => [l.id_origem, { ausente: l.ausente_na_extracao, fora: l.fora_do_recorte }]));
}

/** Última versão de cada etapa (por `id_origem`) dos chamados dados. A chave do mapa é `chamado_id|id_origem`. */
export async function ultimasDeEtapas(db: Consultavel, S: Esquemas, chamadoIds: readonly string[]): Promise<Map<string, VersaoAtual & { chamadoId: string; idOrigem: string }>> {
  const r = await db.query<LinhaUltima & { chamado_id: string; id_origem: string }>(
    `SELECT DISTINCT ON (chamado_id, id_origem) chamado_id, id_origem, stg_sk, payload_sha256, payload, ausente_na_extracao
       FROM ${S.ac}.stg_etapa WHERE chamado_id = ANY($1::text[]) ORDER BY chamado_id, id_origem, stg_sk DESC`, [[...chamadoIds]]);
  return new Map(r.rows.map((l) => [`${l.chamado_id}|${l.id_origem}`, { ...daLinha(l), chamadoId: l.chamado_id, idOrigem: l.id_origem }]));
}

type Contexto = { db: Consultavel; S: Esquemas; coletaId: number; agora: Date };

/**
 * Grava uma versão com dedup contra a ÚLTIMA: `INSERT ... ON CONFLICT ON CONSTRAINT uq_<tabela> DO NOTHING RETURNING`.
 * Zero linhas devolvidas = outra escrita sobre a mesma anterior: relê e reavalia (até 5 vezes). Como ON CONFLICT não gera
 * erro, a transação do chamador não é abortada.
 */
async function gravar(
  ultimaConhecida: VersaoAtual | undefined, payload: Registro, marcas: MarcasStaging,
  reler: () => Promise<VersaoAtual | undefined>,
  inserir: (anteriorSk: string | null, sha: Buffer, json: string) => Promise<string | undefined>,
): Promise<ResultadoVersao> {
  const sha = hashDe(payload, marcas);
  const json = serializar(payload);
  let resultado: ResultadoVersao | undefined;
  for (let tentativa = 0; resultado === undefined && tentativa < 5; tentativa++) {
    const ultima = tentativa === 0 ? ultimaConhecida : await reler();
    if (ultima !== undefined && Buffer.compare(ultima.sha, sha) === 0) {
      resultado = { resultado: 'ja_existente', versao: ultima };
    } else {
      const sk = await inserir(ultima === undefined ? null : ultima.sk, sha, json);
      if (sk !== undefined) resultado = { resultado: 'inserido', versao: { sk, sha, payload, ...marcas } };
    }
  }
  if (resultado === undefined) throw new Error('conflito persistente na cadeia do staging');
  return resultado;
}

export function gravarChamado(
  ctx: Contexto, idOrigem: string, ultima: VersaoAtual | undefined, payload: Registro, marcas: MarcasStaging,
): Promise<ResultadoVersao> {
  const { db, S, coletaId, agora } = ctx;
  return gravar(
    ultima, payload, marcas,
    async () => (await ultimasDeChamados(db, S, [idOrigem])).get(idOrigem),
    async (anterior, sha, json) => {
      const r = await db.query<{ stg_sk: string }>(
        `INSERT INTO ${S.ac}.stg_chamado
           (id_origem, anterior_sk, payload_sha256, payload, ausente_na_extracao, fora_do_recorte, coletado_em, coleta_id)
         VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8)
         ON CONFLICT ON CONSTRAINT uq_stg_chamado DO NOTHING RETURNING stg_sk`,
        [idOrigem, anterior, sha, json, marcas.ausente, marcas.fora, agora, coletaId]);
      return r.rows[0] === undefined ? undefined : String(r.rows[0].stg_sk);
    },
  );
}

export function gravarEtapa(
  ctx: Contexto, chamadoId: string, idOrigem: string, ultima: VersaoAtual | undefined, payload: Registro, ausente: boolean,
): Promise<ResultadoVersao> {
  const { db, S, coletaId, agora } = ctx;
  return gravar(
    ultima, payload, { ausente, fora: false },
    async () => (await ultimasDeEtapas(db, S, [chamadoId])).get(`${chamadoId}|${idOrigem}`),
    async (anterior, sha, json) => {
      const r = await db.query<{ stg_sk: string }>(
        `INSERT INTO ${S.ac}.stg_etapa
           (chamado_id, id_origem, anterior_sk, payload_sha256, payload, ausente_na_extracao, coletado_em, coleta_id)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8)
         ON CONFLICT ON CONSTRAINT uq_stg_etapa DO NOTHING RETURNING stg_sk`,
        [chamadoId, idOrigem, anterior, sha, json, ausente, agora, coletaId]);
      return r.rows[0] === undefined ? undefined : String(r.rows[0].stg_sk);
    },
  );
}
