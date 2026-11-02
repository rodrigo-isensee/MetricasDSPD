import type { QueryResultRow } from 'pg';
import { gerarBaseMock } from '@metricas-dspd/mock';
import { z } from 'zod';
import { esquemasDoAmbiente, type Esquemas } from './esquemas.js';
import { emTransacao, type Consultavel, type PoolLike } from './pool.js';
import { mapearAC, mapearBM, VERSAO_SEED, type Linha, type Tabela } from './seed.js';

/**
 * Limpeza do seed mock da base real (pedido 052, E2.96, decisão do dono de 2026-11-01).
 *
 * O seed (`seed.ts`) gravou `dim_card`, `fato_transicao`, `fato_bloqueio`, `ref_*` e duas linhas de `ctl_coleta` (versões `seed-mock` e
 * `seed-mock-coleta`) no mesmo esquema da carga real. Este comando tira SÓ isso, e nada mais:
 *  - as coletas do seed são identificadas pela VERSÃO em `ctl_coleta` (prefixo `seed-mock`), nunca por id fixo;
 *  - `dim_card`/`fato_transicao`/`fato_bloqueio` (e `dim_chamado`/`fato_etapa_chamado` no Acelerato) saem pela marca da coleta do seed;
 *  - os `ref_*` saem pelas chaves que o próprio mock gera de novo a partir dos `parametros` gravados na coleta `seed-mock`
 *    (determinístico), com a chave inteira (inclusive `vigente_de`) e, onde dá, o conteúdo igual; chave igual com conteúdo diferente
 *    é linha de outra origem e o comando para;
 *  - as versões de critério do seed em `dspd_core` (motivo `seed-mock`, referência `mock:%`, domínios businessmap e acelerato; pesquisa fica)
 *    saem com `ref_versao_criterio_metrica`, com falha fechada se alguma linha de outra tabela apontar para elas;
 *  - FALHA FECHADA: qualquer linha ligada à coleta do seed fora das tabelas que o comando remove, qualquer linha de outra coleta
 *    com card/chamado do seed, qualquer staging com card/chamado do seed (ADR 0022), aborta tudo antes de escrever.
 * Simulação por padrão (transação somente leitura, só contagens); escrita só com `aplicar`, numa transação única para os dois esquemas.
 * `fato_transicao` é append-only por gatilho (data-model §1): o gatilho é desligado só dentro da transação e religado antes do
 * COMMIT, com conferência do estado; exige o papel dono das tabelas (`dspd_migrador`). Saída só com contagens: nunca id, nome nem título.
 */
export class ErroLimpezaSeed extends Error {
  constructor(readonly codigo: 'uso' | 'sem-parametros' | 'ligada-a-dado-real' | 'contagem-divergente' | 'gatilho' | 'trava', mensagem: string) {
    super(mensagem);
    this.name = 'ErroLimpezaSeed';
  }
}

export type FonteLimpeza = 'businessmap' | 'acelerato';
export interface ResultadoFonteLimpeza {
  fonte: FonteLimpeza;
  /** Linhas de `ctl_coleta` do seed encontradas. */
  coletas: number;
  /** Linhas por tabela (a remover na simulação, removidas na aplicação). */
  tabelas: Record<string, number>;
}
export interface ResultadoLimpeza {
  modo: 'simulacao' | 'aplicado';
  fontes: ResultadoFonteLimpeza[];
  /** Versões de critério do seed em `dspd_core` (domínios businessmap e acelerato): linhas por tabela. */
  criterios: { tabelas: Record<string, number> };
}

export function analisarArgumentosLimpezaSeed(argv: readonly string[]): { aplicar: boolean } {
  const resto = argv.filter((a) => a !== '--aplicar');
  if (resto.length > 0) throw new ErroLimpezaSeed('uso', 'uso: limpar-seed [--aplicar] (sem opção, só simula)');
  return { aplicar: argv.includes('--aplicar') };
}

const PARAMETROS_SEED = z.object({ semente: z.number(), hoje: z.string(), escala: z.number(), mesesHistorico: z.number() });
const IDENT = /^[a-z][a-z0-9_]*$/;
const ident = (nome: string): string => {
  if (!IDENT.test(nome)) throw new Error('identificador inválido');
  return nome;
};

interface Ref { pk: string[]; igual?: string[]; assinatura?: string }
/** Chave de cada `ref_*` que o seed grava. `igual`: colunas de texto/inteiro comparadas além da chave; `assinatura`: colunas que só o seed deixa nulas. */
const REFS: Record<string, Ref> = {
  ref_quadro: { pk: ['quadro_id', 'vigente_de'], igual: ['equipe'] },
  ref_coluna: { pk: ['quadro_id', 'coluna_id', 'vigente_de'], igual: ['nome'], assinatura: 'workflow_id IS NULL AND motivo IS NULL' },
  ref_dominio: { pk: ['campo', 'codigo', 'vigente_de'], igual: ['rotulo'] },
  ref_limite_wip_fluxo: { pk: ['equipe', 'vigente_de'], igual: ['limite'] },
  ref_limite_frentes: { pk: ['equipe', 'vigente_de'], igual: ['limite'] },
  ref_sle: { pk: ['equipe', 'classe_servico', 'percentil', 'vigente_de'] },
  ref_alocacao_acordada: { pk: ['equipe', 'classe_servico', 'vigente_de'] },
  ref_ficha_resultado: { pk: ['card_id', 'vigente_de'] },
  ref_alvo_prioridade: { pk: ['prioridade', 'vigente_de'] },
};

interface Projecao { tabela: string; marcador: string; gatilho?: string }
interface Alvo {
  fonte: FonteLimpeza;
  schema: string;
  /** Coluna do card/chamado nas tabelas ligadas ao item. */
  chave: string;
  /** Staging do item (`id_origem`): nunca pode ter item do seed. */
  staging: string;
  /** Na ordem de remoção; a primeira é a tabela do item. */
  projecoes: Projecao[];
  /** Consultas `count(*)` com `$1` = ids das coletas do seed: linhas de outra tabela que apontam para o que sai. */
  dependentes: { rotulo: string; sql: string }[];
  mapear: (b: ReturnType<typeof gerarBaseMock>, c: number, S: Esquemas) => Tabela[];
}

const alvos = (S: Esquemas): Alvo[] => [
  {
    fonte: 'businessmap', schema: S.bm, chave: 'card_id', staging: 'stg_card', mapear: mapearBM,
    projecoes: [
      { tabela: 'fato_transicao', marcador: 'coleta_id', gatilho: 'tg_fato_transicao_imutavel' },
      { tabela: 'fato_bloqueio', marcador: 'atualizado_por_coleta_id' },
      { tabela: 'dim_card', marcador: 'atualizado_por_coleta_id' },
    ],
    dependentes: [{
      rotulo: 'rec_transicao_par',
      sql: `SELECT count(*) AS n FROM ${S.bm}.rec_transicao_par WHERE transicao_webhook_sk IN (SELECT transicao_sk FROM ${S.bm}.fato_transicao WHERE coleta_id = ANY($1::bigint[]))
        OR transicao_revision_sk IN (SELECT transicao_sk FROM ${S.bm}.fato_transicao WHERE coleta_id = ANY($1::bigint[]))`,
    }],
  },
  {
    fonte: 'acelerato', schema: S.ac, chave: 'chamado_id', staging: 'stg_chamado', mapear: mapearAC, dependentes: [],
    projecoes: [
      { tabela: 'fato_etapa_chamado', marcador: 'atualizado_por_coleta_id' },
      { tabela: 'dim_chamado', marcador: 'atualizado_por_coleta_id' },
    ],
  },
];

const linhas = async <T extends QueryResultRow>(c: Consultavel, texto: string, valores: unknown[] = []): Promise<T[]> => (await c.query<T>(texto, valores)).rows;
const contar = async (c: Consultavel, texto: string, valores: unknown[]): Promise<number> =>
  Number((await linhas<{ n: string }>(c, texto, valores))[0]!.n);
const recusar = (mensagem: string): never => { throw new ErroLimpezaSeed('ligada-a-dado-real', `${mensagem}; nada foi removido`); };

const predicadoRef = (cols: string[], assinatura?: string): string =>
  `(${cols.map((c) => `${ident(c)}::text`).join(', ')}) IN (SELECT ${cols.map((_, i) => `k${i}`).join(', ')} FROM unnest(${cols.map((_, i) => `$${i + 1}::text[]`).join(', ')}) AS u(${cols.map((_, i) => `k${i}`).join(', ')}))${assinatura ? ` AND ${assinatura}` : ''}`;
const valoresRef = (cols: string[], ls: Linha[]): string[][] => cols.map((c) => ls.map((l) => String(l[c])));

interface PlanoFonte { resultado: ResultadoFonteLimpeza; escrever: () => Promise<void> }

/** Espera máxima pela trava do ALTER TABLE (SHARE ROW EXCLUSIVE): na fila ela seguraria as leituras da API sobre a tabela. */
const LOCK_TIMEOUT_PADRAO_MS = 3000;
const DOMINIOS_DO_SEED = ['businessmap', 'acelerato'];
const COLUNAS_DE_VERSAO = ['versao_id', 'incluido_por_versao_id'];

/**
 * Versões de critério do seed (`dspd_core.ref_versao_criterio`, motivo `seed-mock`, referência `mock:%`, domínios businessmap e
 * acelerato; o domínio pesquisa fica) e as linhas de `ref_versao_criterio_metrica`. FALHA FECHADA: qualquer tabela dos três esquemas
 * (por chave estrangeira ou por coluna de versão) com linha apontando para elas aborta antes de escrever.
 */
async function planejarCriterios(trx: Consultavel, S: Esquemas): Promise<{ tabelas: Record<string, number>; escrever: () => Promise<void> }> {
  const core = S.core;
  const ids = (await linhas<{ versao: string }>(trx,
    `SELECT versao_id::text AS versao FROM ${core}.ref_versao_criterio WHERE motivo = $1 AND dominio = ANY($2::text[]) AND referencia LIKE 'mock:%' ORDER BY versao_id`,
    [VERSAO_SEED, DOMINIOS_DO_SEED])).map((l) => Number(l.versao));
  if (ids.length === 0) return { tabelas: {}, escrever: () => Promise.resolve() };

  const porFk = await linhas<{ esquema: string; tabela: string; coluna: string }>(trx,
    `SELECT n.nspname AS esquema, k.relname AS tabela, a.attname AS coluna FROM pg_constraint c
     JOIN pg_class k ON k.oid = c.conrelid JOIN pg_namespace n ON n.oid = k.relnamespace JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
     WHERE c.contype = 'f' AND c.confrelid = $1::regclass AND c.conrelid <> $2::regclass`, [`${core}.ref_versao_criterio`, `${core}.ref_versao_criterio_metrica`]);
  const porNome = await linhas<{ esquema: string; tabela: string; coluna: string }>(trx,
    `SELECT col.table_schema AS esquema, col.table_name AS tabela, col.column_name AS coluna FROM information_schema.columns col
     JOIN information_schema.tables t ON t.table_schema = col.table_schema AND t.table_name = col.table_name AND t.table_type = 'BASE TABLE'
     WHERE col.table_schema = ANY($1::text[]) AND col.column_name = ANY($2::text[])
       AND NOT (col.table_schema = $3 AND col.table_name IN ('ref_versao_criterio', 'ref_versao_criterio_metrica'))`, [[S.bm, S.ac, core], COLUNAS_DE_VERSAO, core]);
  const donos = new Map([...porFk, ...porNome].map((d) => [`${d.esquema}.${d.tabela}.${d.coluna}`, d]));
  for (const { esquema, tabela, coluna } of donos.values()) {
    const n = await contar(trx, `SELECT count(*) AS n FROM ${ident(esquema)}.${ident(tabela)} WHERE ${ident(coluna)} = ANY($1::bigint[])`, [ids]);
    if (n > 0) recusar(`${tabela}: ${n} linha(s) apontam para versões de critério do seed`);
  }

  const previsto: Record<string, number> = {
    ref_versao_criterio_metrica: await contar(trx, `SELECT count(*) AS n FROM ${core}.ref_versao_criterio_metrica WHERE versao_id = ANY($1::bigint[])`, [ids]),
    ref_versao_criterio: ids.length,
  };
  const escrever = async (): Promise<void> => {
    for (const tabela of ['ref_versao_criterio_metrica', 'ref_versao_criterio']) {
      const r = await trx.query(`DELETE FROM ${core}.${tabela} WHERE versao_id = ANY($1::bigint[])`, [ids]);
      if (r.rowCount !== previsto[tabela]) throw new ErroLimpezaSeed('contagem-divergente', `${tabela}: removidas ${r.rowCount ?? 0} de ${previsto[tabela]!} previstas; nada foi gravado`);
    }
  };
  return { tabelas: previsto, escrever };
}

/** Confere tudo (falha fechada) e devolve o plano; nada é escrito até `escrever` ser chamado, depois de TODAS as fontes conferidas. */
async function planejarFonte(trx: Consultavel, a: Alvo, lockTimeoutMs: number): Promise<PlanoFonte> {
  const { schema, chave } = a;
  const coletas = await linhas<{ coleta_id: string; versao_coletor: string; parametros: unknown }>(trx,
    `SELECT coleta_id, versao_coletor, parametros FROM ${schema}.ctl_coleta WHERE starts_with(versao_coletor, $1) ORDER BY coleta_id`, [VERSAO_SEED]);
  if (coletas.length === 0) return { resultado: { fonte: a.fonte, coletas: 0, tabelas: {} }, escrever: () => Promise.resolve() };
  const ids = coletas.map((c) => Number(c.coleta_id));
  const itemDoSeed = a.projecoes.at(-1)!;
  const itens = (await linhas<{ k: string }>(trx,
    `SELECT ${chave}::text AS k FROM ${schema}.${itemDoSeed.tabela} WHERE ${itemDoSeed.marcador} = ANY($1::bigint[])`, [ids])).map((l) => l.k);

  // Falha fechada 1: tabela que guarda a marca da coleta (ou o item) e que o comando não remove.
  const removiveis = new Set([...a.projecoes.map((p) => p.tabela), 'ctl_coleta']);
  const colunas = await linhas<{ tabela: string; coluna: string }>(trx,
    `SELECT c.relname AS tabela, a.attname AS coluna FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = $1 AND c.relkind IN ('r', 'p') AND a.attnum > 0 AND NOT a.attisdropped AND a.attname IN ('coleta_id', 'atualizado_por_coleta_id', $2)
     ORDER BY c.relname, a.attname`, [schema, chave]);
  for (const { tabela, coluna } of colunas) {
    if (removiveis.has(tabela) || tabela.startsWith('ref_')) continue;
    const n = await contar(trx,
      coluna === chave
        ? `SELECT count(*) AS n FROM ${schema}.${ident(tabela)} WHERE ${ident(coluna)}::text = ANY($1::text[])`
        : `SELECT count(*) AS n FROM ${schema}.${ident(tabela)} WHERE ${ident(coluna)} = ANY($1::bigint[])`, [coluna === chave ? itens : ids]);
    if (n > 0) recusar(`${tabela}: ${n} linha(s) ligadas ao seed fora do que o comando remove`);
  }
  // Falha fechada 2: staging com item do seed, linha de outra coleta com item do seed, e quem aponta para o que sai.
  const nStg = await contar(trx, `SELECT count(*) AS n FROM ${schema}.${a.staging} WHERE id_origem = ANY($1::text[])`, [itens]);
  if (nStg > 0) recusar(`${a.staging}: ${nStg} linha(s) de staging com item do seed`);
  for (const p of a.projecoes) {
    const n = await contar(trx,
      `SELECT count(*) AS n FROM ${schema}.${p.tabela} WHERE ${chave}::text = ANY($1::text[]) AND ${p.marcador} <> ALL($2::bigint[])`, [itens, ids]);
    if (n > 0) recusar(`${p.tabela}: ${n} linha(s) de coleta real com item do seed`);
  }
  for (const d of a.dependentes) {
    const n = await contar(trx, d.sql, [ids]);
    if (n > 0) recusar(`${d.rotulo}: ${n} linha(s) apontam para o que seria removido`);
  }

  // Referência: as chaves do seed saem do mock regerado com os parâmetros gravados (nunca de um id fixo).
  const params = PARAMETROS_SEED.safeParse(coletas.find((c) => c.versao_coletor === VERSAO_SEED)?.parametros);
  if (!params.success) throw new ErroLimpezaSeed('sem-parametros', `${schema}: coleta ${VERSAO_SEED} sem parâmetros utilizáveis; nada foi removido`);
  const prefixo = `${schema}.`;
  const refs = a.mapear(gerarBaseMock(params.data), 0, { bm: schema, ac: schema, core: schema })
    .filter((t) => t.tabela.startsWith(`${prefixo}ref_`))
    .map((t) => ({ nome: t.tabela.slice(prefixo.length), ls: t.linhas, ...REFS[t.tabela.slice(prefixo.length)]! }));
  const completas = (r: (typeof refs)[number]): string[] => [...r.pk, ...(r.igual ?? [])];
  for (const r of refs) {
    const so = await contar(trx, `SELECT count(*) AS n FROM ${schema}.${r.nome} WHERE ${predicadoRef(r.pk)}`, valoresRef(r.pk, r.ls));
    const todas = await contar(trx, `SELECT count(*) AS n FROM ${schema}.${r.nome} WHERE ${predicadoRef(completas(r), r.assinatura)}`, valoresRef(completas(r), r.ls));
    if (so !== todas) recusar(`${r.nome}: ${so - todas} linha(s) com a chave do seed e conteúdo de outra origem`);
  }

  const previsto: Record<string, number> = {};
  for (const p of a.projecoes)
    previsto[p.tabela] = await contar(trx, `SELECT count(*) AS n FROM ${schema}.${p.tabela} WHERE ${p.marcador} = ANY($1::bigint[])`, [ids]);
  for (const r of refs)
    previsto[r.nome] = await contar(trx, `SELECT count(*) AS n FROM ${schema}.${r.nome} WHERE ${predicadoRef(completas(r), r.assinatura)}`, valoresRef(completas(r), r.ls));
  previsto.ctl_coleta = ids.length;
  const resultado: ResultadoFonteLimpeza = { fonte: a.fonte, coletas: ids.length, tabelas: previsto };

  const apagar = async (tabela: string, onde: string, valores: unknown[]): Promise<void> => {
    const r = await trx.query(`DELETE FROM ${schema}.${tabela} WHERE ${onde}`, valores);
    if (r.rowCount !== previsto[tabela]) throw new ErroLimpezaSeed('contagem-divergente', `${tabela}: removidas ${r.rowCount ?? 0} de ${previsto[tabela]!} previstas; nada foi gravado`);
  };
  const escrever = async (): Promise<void> => {
    for (const p of a.projecoes) {
      if (p.gatilho) {
        // trava curta: na fila, o ALTER seguraria as leituras da API; sem a trava, falha fechada e ROLLBACK
        await trx.query(`SET LOCAL lock_timeout = ${Math.trunc(lockTimeoutMs)}`);
        try {
          await trx.query(`ALTER TABLE ${schema}.${p.tabela} DISABLE TRIGGER ${ident(p.gatilho)}`);
        } catch (e) {
          if ((e as { code?: string }).code === '55P03') throw new ErroLimpezaSeed('trava', `${p.tabela}: a trava da tabela não veio em ${lockTimeoutMs} ms (há leitura ou escrita em andamento); nada foi gravado`);
          throw e;
        }
      }
      await apagar(p.tabela, `${p.marcador} = ANY($1::bigint[])`, [ids]);
      if (p.gatilho) {
        await trx.query(`ALTER TABLE ${schema}.${p.tabela} ENABLE TRIGGER ${ident(p.gatilho)}`);
        const fora = await contar(trx,
          `SELECT count(*) AS n FROM pg_trigger WHERE tgrelid = '${schema}.${p.tabela}'::regclass AND NOT tgisinternal AND tgenabled <> 'O'`, []);
        if (fora > 0) throw new ErroLimpezaSeed('gatilho', `${p.tabela}: gatilho de imutabilidade não voltou ao estado ativo; nada foi gravado`);
      }
    }
    for (const r of refs) await apagar(r.nome, predicadoRef(completas(r), r.assinatura), valoresRef(completas(r), r.ls));
    await apagar('ctl_coleta', 'coleta_id = ANY($1::bigint[])', [ids]);
  };
  return { resultado, escrever };
}

/**
 * Pool do `dspd_migrador` (dono das tabelas). Simulação: transação somente leitura. Aplicação: uma transação para os dois esquemas,
 * com a mesma trava do seed (`dspd:seed`) para não correr junto de um seed.
 */
export async function limparSeed(pool: PoolLike, opcoes: { aplicar: boolean; S?: Esquemas; lockTimeoutMs?: number }): Promise<ResultadoLimpeza> {
  const S = opcoes.S ?? esquemasDoAmbiente();
  return emTransacao(pool, async (trx) => {
    if (!opcoes.aplicar) await trx.query('SET TRANSACTION READ ONLY');
    await trx.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['dspd:seed']);
    const criterios = await planejarCriterios(trx, S);
    const planos: PlanoFonte[] = [];
    for (const a of alvos(S)) planos.push(await planejarFonte(trx, a, opcoes.lockTimeoutMs ?? LOCK_TIMEOUT_PADRAO_MS));
    if (opcoes.aplicar) {
      await criterios.escrever();
      for (const p of planos) await p.escrever();
    }
    return { modo: opcoes.aplicar ? 'aplicado' : 'simulacao', fontes: planos.map((p) => p.resultado), criterios: { tabelas: criterios.tabelas } };
  });
}
