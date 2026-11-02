import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  SUBGRUPO_EXECUCAO_TECNICA, SUBGRUPO_NAO_CLASSIFICADO, type DicionarioApontamento, type RegraPorTermo, type RegraPorTipo,
} from '@metricas-dspd/metricas/coletor';
import { z } from 'zod';
import type { Esquemas } from '../../../plataforma/db/esquemas.js';
import { emTransacao, type Consultavel, type PoolLike } from '../../../plataforma/db/pool.js';
import { ErroColetaBm } from '../coleta.js';

// Pedido 059 (K-193), E2.19 e E2.27, plano §3.6 e G2: dicionário de subgrupo do apontamento, carregado por `ref:sync` do arquivo versionado
// `docs/architecture/fontes/apontamento-dicionario.json` (cópia do dicionário do discovery, como está; o dono confere e ajuste posterior é
// troca de arquivo). Escrito pelo papel `dspd_ref` (INSERT e `UPDATE (vigente_ate)` em `ref_*`). A carga compara o arquivo com o VIGENTE
// (`vigente_ate IS NULL`): termo novo abre vigência, termo mudado fecha a linha antiga e abre a nova, termo retirado só fecha. Nada é apagado
// nem sobrescrito (migração 0030). O coletor lê só o vigente (`carregarDicionario`) e o liga à função pura da biblioteca.

export const ARQUIVO_DICIONARIO = new URL('../../../../../docs/architecture/fontes/apontamento-dicionario.json', import.meta.url);
/** Prefixo de `ref_versao_criterio.referencia` desta carga: `059:ref-apontamento:<versao do arquivo>:<sha256 do arquivo>`. */
export const PREFIXO_REFERENCIA = '059:ref-apontamento:';
export const MAX_TERMOS = 500;
/** `condicao` do arquivo (a da biblioteca, com hífen) e a gravada em `ref_apontamento_regra_tipo.condicao` (`^[a-z0-9_]+$`). */
const CONDICAO_NO_BANCO = { sempre: 'sempre', 'sem-comentario': 'sem_comentario' } as const;
type Condicao = keyof typeof CONDICAO_NO_BANCO;
const CONDICAO_DA_BIBLIOTECA: Readonly<Record<string, Condicao>> = { sempre: 'sempre', sem_comentario: 'sem-comentario' };

export class ErroDicionario extends Error {
  constructor(readonly tipo: 'arquivo' | 'tipo' | 'mudanca' | 'vigencia', mensagem: string) {
    super(mensagem);
    this.name = 'ErroDicionario';
  }
}

/** Minúsculas e sem acento: a comparação do rótulo do tipo de card com `ref_tipo_card.nome` (mesma regra da referência do 052). */
export const normalizar = (t: string): string => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();

// Sem controle, sem formatação invisível, sem separador de linha e sem arroba (um e-mail nunca entra como texto do dicionário).
const texto = (max: number): z.ZodString => z.string().min(1).max(max).regex(/^[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}@]+$/u, 'caractere não aceito');
const codigo = z.string().min(1).max(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

export const esquemaDicionario = z
  .object({
    versao: z.string().regex(/^[A-Za-z0-9._-]{1,40}$/),
    subgrupos: z.array(z.object({ codigo, rotulo: texto(120), prioridade: z.number().int().min(1).max(32_000) }).strict()).min(1).max(100),
    termos: z.array(z.object({ subgrupo: codigo, termos: z.array(z.string().regex(/^[a-z0-9]{2,40}$/)).min(1).max(MAX_TERMOS) }).strict()).max(100),
    regrasPorTipo: z.array(z.object({ tipoRotulo: texto(80), condicao: z.enum(['sempre', 'sem-comentario']), subgrupo: codigo }).strict()).max(100),
    subtarefa: z.array(z.object({ codigo, rotulo: texto(120) }).strict()).min(1).max(20),
  })
  .strict()
  .superRefine((d, ctx) => {
    const erro = (path: (string | number)[], message: string): void => { ctx.addIssue({ code: 'custom', path, message }); };
    const repetido = <T>(itens: readonly T[], chave: (i: T) => string, caminho: string, msg: string): void => {
      const vistos = new Set<string>();
      for (const [i, item] of itens.entries()) {
        if (vistos.has(chave(item))) erro([caminho, i], msg);
        vistos.add(chave(item));
      }
    };
    repetido(d.subgrupos, (s) => s.codigo, 'subgrupos', 'código de subgrupo repetido');
    repetido(d.subgrupos, (s) => String(s.prioridade), 'subgrupos', 'prioridade repetida');
    repetido(d.subtarefa, (s) => s.codigo, 'subtarefa', 'código de subtarefa repetido');
    repetido(d.termos, (t) => t.subgrupo, 'termos', 'subgrupo com mais de uma lista de termos');
    repetido(d.regrasPorTipo, (r) => `${normalizar(r.tipoRotulo)}|${r.condicao}`, 'regrasPorTipo', 'regra repetida para o mesmo tipo e condição');
    const codigos = new Set(d.subgrupos.map((s) => s.codigo));
    for (const [i, t] of d.termos.entries()) if (!codigos.has(t.subgrupo)) erro(['termos', i, 'subgrupo'], 'subgrupo inexistente');
    for (const [i, r] of d.regrasPorTipo.entries()) if (!codigos.has(r.subgrupo)) erro(['regrasPorTipo', i, 'subgrupo'], 'subgrupo inexistente');
    // um termo só pertence a um subgrupo (casamento por início de palavra; o empate já é a prioridade entre subgrupos)
    const todos = d.termos.flatMap((t) => t.termos);
    if (todos.length > MAX_TERMOS) erro(['termos'], `mais de ${MAX_TERMOS} termos no total`);
    if (new Set(todos).size !== todos.length) erro(['termos'], 'termo repetido entre subgrupos');
  });
export type ArquivoDicionario = z.infer<typeof esquemaDicionario>;
export interface DicionarioLido { arquivo: ArquivoDicionario; sha256: string }

/** Lê e valida o texto (nunca grava). O hash é o do texto exato do arquivo. A mensagem cita só onde está o erro, nunca o valor. */
export function analisarDicionario(conteudo: string): DicionarioLido {
  let bruto: unknown;
  try {
    bruto = JSON.parse(conteudo);
  } catch {
    throw new ErroDicionario('arquivo', 'o arquivo do dicionário do apontamento não é um JSON válido');
  }
  const r = esquemaDicionario.safeParse(bruto);
  if (!r.success) {
    const onde = [...new Set(r.error.issues.map((i) => i.path.slice(0, 2).join('.') || 'raiz'))].join(', ');
    throw new ErroDicionario('arquivo', `o arquivo do dicionário do apontamento é inválido (${onde})`);
  }
  return { arquivo: r.data, sha256: createHash('sha256').update(conteudo, 'utf8').digest('hex') };
}
export const lerDicionario = (caminho: URL | string = ARQUIVO_DICIONARIO): DicionarioLido => analisarDicionario(readFileSync(caminho, 'utf8'));

/* ---------- plano (puro) ---------- */

export interface SubgrupoBanco { codigo: string; rotulo: string; prioridade: number }
export interface TermoBanco { subgrupo_codigo: string; termo_normalizado: string }
export interface RegraBanco { type_id: string; condicao: string; subgrupo_codigo: string }
/** O que está vigente no banco (`vigente_ate IS NULL`). */
export interface DicionarioBanco { subgrupos: SubgrupoBanco[]; termos: TermoBanco[]; regras: RegraBanco[] }
export interface TipoDoCard { tipo_id: string; nome: string }
/** `fechar` = linhas vigentes que ganham `vigente_ate`; `abrir` = linhas novas com `vigente_de`. Mudar uma linha é fechar a antiga e abrir a nova. */
export interface Mudanca<T> { abrir: T[]; fechar: T[] }
export interface PlanoDicionario { subgrupos: Mudanca<SubgrupoBanco>; termos: Mudanca<TermoBanco>; regras: Mudanca<RegraBanco> }

/** Subgrupos que a função da biblioteca devolve por conta própria (sem regra que case): não podem sair do dicionário. */
export const SUBGRUPOS_RESERVADOS: readonly string[] = [SUBGRUPO_EXECUCAO_TECNICA, SUBGRUPO_NAO_CLASSIFICADO];

/** Rótulo do tipo -> `type_id` da referência vigente. Sem adivinhar: rótulo que não existe ou que casa com dois ids recusa a carga. */
function resolverTipo(rotulo: string, tipos: readonly TipoDoCard[]): string {
  const ids = [...new Set(tipos.filter((t) => normalizar(t.nome) === normalizar(rotulo)).map((t) => t.tipo_id))];
  if (ids.length === 0) throw new ErroDicionario('tipo', `o tipo de card "${rotulo}" não existe em ref_tipo_card (a carga não adivinha o id)`);
  if (ids.length > 1) throw new ErroDicionario('tipo', `o tipo de card "${rotulo}" casa com mais de um id em ref_tipo_card`);
  return ids[0]!;
}

/** Diferença entre duas listas por chave: o que só o arquivo tem abre, o que só o banco tem fecha, e o que mudou de valor fecha e abre. */
function comparar<T>(noArquivo: readonly T[], noBanco: readonly T[], chave: (i: T) => string, igual: (a: T, b: T) => boolean): Mudanca<T> {
  const doBanco = new Map(noBanco.map((i) => [chave(i), i]));
  const doArquivo = new Map(noArquivo.map((i) => [chave(i), i]));
  const m: Mudanca<T> = { abrir: [], fechar: [] };
  for (const b of noBanco) if (!doArquivo.has(chave(b))) m.fechar.push(b);
  for (const a of noArquivo) {
    const b = doBanco.get(chave(a));
    if (b === undefined) m.abrir.push(a);
    else if (!igual(a, b)) { m.fechar.push(b); m.abrir.push(a); }
  }
  return m;
}

/**
 * Compara o arquivo com o dicionário vigente (E2.27, item 4 da decisão do dono de 2026-11-02): termo, regra ou subgrupo novo abre; mudado
 * (rótulo ou prioridade do subgrupo, subgrupo da regra, termo que trocou de subgrupo) fecha o antigo e abre o novo; retirado só fecha. Recusa,
 * sem gravar nada, só o que deixaria a classificação sem saída: tirar do arquivo `execucao-tecnica` ou `nao-classificado`, que a função da
 * biblioteca devolve sozinha. A vigência do termo e da regra segue o `codigo` do subgrupo: trocar rótulo ou prioridade não reabre os termos.
 */
export function planejarDicionario(arquivo: ArquivoDicionario, banco: DicionarioBanco, tipos: readonly TipoDoCard[]): PlanoDicionario {
  const doArquivo = new Set(arquivo.subgrupos.map((s) => s.codigo));
  for (const s of banco.subgrupos) {
    if (!doArquivo.has(s.codigo) && SUBGRUPOS_RESERVADOS.includes(s.codigo)) {
      throw new ErroDicionario('mudanca', `o subgrupo ${s.codigo} não pode sair do arquivo: a classificação o devolve quando nenhuma regra casa`);
    }
  }
  const subgrupos = comparar<SubgrupoBanco>(
    arquivo.subgrupos.map((s) => ({ codigo: s.codigo, rotulo: s.rotulo, prioridade: s.prioridade })), banco.subgrupos,
    (s) => s.codigo, (a, b) => a.rotulo === b.rotulo && a.prioridade === b.prioridade);

  const termosDoArquivo = arquivo.termos.flatMap((t) => t.termos.map((termo) => ({ subgrupo_codigo: t.subgrupo, termo_normalizado: termo })));
  const termos = comparar<TermoBanco>(termosDoArquivo, banco.termos, (t) => `${t.termo_normalizado}|${t.subgrupo_codigo}`, () => true);

  const regrasDoArquivo = arquivo.regrasPorTipo.map((r) => ({
    type_id: resolverTipo(r.tipoRotulo, tipos), condicao: CONDICAO_NO_BANCO[r.condicao], subgrupo_codigo: r.subgrupo,
  }));
  const regras = comparar<RegraBanco>(regrasDoArquivo, banco.regras, (r) => `${r.type_id}|${r.condicao}`, (a, b) => a.subgrupo_codigo === b.subgrupo_codigo);
  return { subgrupos, termos, regras };
}

/* ---------- carga (dspd_ref) ---------- */

export interface Contagem { subgrupos: number; termos: number; regras: number }
/** `subgrupos`, `termos` e `regras` são as linhas abertas (vigências novas); `fechados` são as que ganharam `vigente_ate`. */
export interface ResultadoDicionario extends Contagem {
  sha256: string;
  versao: string;
  fechados: Contagem;
  versaoRegistrada: boolean;
}

export const referenciaDaVersao = (versao: string, sha256: string): string => `${PREFIXO_REFERENCIA}${versao}:${sha256}`;

const VIGENTE = 'vigente_ate IS NULL';

/**
 * Lê o vigente, planeja e grava numa transação só (tudo ou nada): primeiro fecha (`UPDATE vigente_ate`, a única alteração que o `dspd_ref` faz),
 * depois abre (`INSERT` com `vigente_de`). Sem diferença nada é gravado (idempotente); com diferença registra SEMPRE uma versão de critério nova
 * (T2.6, domínio `businessmap`, data da carga, referência com a versão e o hash do arquivo), porque cada mudança tem a sua data e o coletor
 * grava a versão do arquivo em `versao_dicionario`. A versão não marca métrica: o dicionário não entra em métrica do painel; a marca nos
 * gráficos da aba é decisão posterior.
 */
export async function sincronizarDicionario(pool: PoolLike, S: Esquemas, lido: DicionarioLido, hoje: string, agora: Date): Promise<ResultadoDicionario> {
  return emTransacao(pool, async (db) => {
    const banco: DicionarioBanco = {
      subgrupos: (await db.query<SubgrupoBanco>(`SELECT codigo, rotulo, prioridade FROM ${S.bm}.ref_apontamento_subgrupo WHERE ${VIGENTE}`)).rows,
      termos: (await db.query<TermoBanco>(`SELECT subgrupo_codigo, termo_normalizado FROM ${S.bm}.ref_apontamento_termo WHERE ${VIGENTE}`)).rows,
      regras: (await db.query<RegraBanco>(`SELECT type_id, condicao, subgrupo_codigo FROM ${S.bm}.ref_apontamento_regra_tipo WHERE ${VIGENTE}`)).rows,
    };
    const tipos = (await db.query<TipoDoCard>(`SELECT tipo_id, nome FROM ${S.bm}.ref_tipo_card WHERE vigente_ate IS NULL`)).rows;
    const plano = planejarDicionario(lido.arquivo, banco, tipos);
    const abertos: Contagem = { subgrupos: plano.subgrupos.abrir.length, termos: plano.termos.abrir.length, regras: plano.regras.abrir.length };
    const fechados: Contagem = { subgrupos: plano.subgrupos.fechar.length, termos: plano.termos.fechar.length, regras: plano.regras.fechar.length };
    const base = { sha256: lido.sha256, versao: lido.arquivo.versao };
    if (Object.values(abertos).concat(Object.values(fechados)).every((n) => n === 0)) {
      return { ...base, subgrupos: 0, termos: 0, regras: 0, fechados: { subgrupos: 0, termos: 0, regras: 0 }, versaoRegistrada: false };
    }

    // A vigência nunca volta no tempo: a data não pode ser anterior à da última versão do dicionário nem a de uma linha já fechada ou aberta.
    const ultima = (await db.query<{ ultima: string | null }>(
      `SELECT max(vigente_desde)::text AS ultima FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia LIKE $1`, [`${PREFIXO_REFERENCIA}%`])).rows[0]!.ultima;
    if (ultima !== null && hoje < ultima) {
      throw new ErroDicionario('vigencia', `a data ${hoje} é anterior à última versão do dicionário (${ultima}); use essa data ou uma posterior`);
    }
    const referencia = referenciaDaVersao(lido.arquivo.versao, lido.sha256);
    const nova = await db.query<{ versao_id: string }>(
      `INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
       VALUES ($1, 'businessmap', $2, $3, $4, $5) RETURNING versao_id`,
      [hoje, `Dicionário de classificação do apontamento (aba Apontamento), versão ${lido.arquivo.versao}`,
        'Carga do dicionário de subgrupo do apontamento por ref:sync (pedido 059); critério da classificação do comentário, versionado com vigência: vale a partir da data e a varredura seguinte reclassifica a janela que reler (90 dias; 12 meses aos domingos) com o dicionário vigente.', referencia, agora.toISOString()]);
    const versaoId = nova.rows[0]!.versao_id;

    for (const s of plano.subgrupos.fechar) await db.query(`UPDATE ${S.bm}.ref_apontamento_subgrupo SET vigente_ate = $1 WHERE ${VIGENTE} AND codigo = $2`, [hoje, s.codigo]);
    for (const t of plano.termos.fechar) {
      await db.query(`UPDATE ${S.bm}.ref_apontamento_termo SET vigente_ate = $1 WHERE ${VIGENTE} AND termo_normalizado = $2 AND subgrupo_codigo = $3`, [hoje, t.termo_normalizado, t.subgrupo_codigo]);
    }
    for (const r of plano.regras.fechar) await db.query(`UPDATE ${S.bm}.ref_apontamento_regra_tipo SET vigente_ate = $1 WHERE ${VIGENTE} AND type_id = $2 AND condicao = $3`, [hoje, r.type_id, r.condicao]);
    for (const s of plano.subgrupos.abrir) {
      await db.query(`INSERT INTO ${S.bm}.ref_apontamento_subgrupo (codigo, rotulo, prioridade, incluido_por_versao_id, vigente_de) VALUES ($1, $2, $3, $4, $5)`, [s.codigo, s.rotulo, s.prioridade, versaoId, hoje]);
    }
    for (const t of plano.termos.abrir) {
      await db.query(`INSERT INTO ${S.bm}.ref_apontamento_termo (subgrupo_codigo, termo_normalizado, incluido_por_versao_id, vigente_de) VALUES ($1, $2, $3, $4)`, [t.subgrupo_codigo, t.termo_normalizado, versaoId, hoje]);
    }
    for (const r of plano.regras.abrir) {
      await db.query(`INSERT INTO ${S.bm}.ref_apontamento_regra_tipo (type_id, condicao, subgrupo_codigo, incluido_por_versao_id, vigente_de) VALUES ($1, $2, $3, $4, $5)`, [r.type_id, r.condicao, r.subgrupo_codigo, versaoId, hoje]);
    }
    return { ...base, ...abertos, fechados, versaoRegistrada: true };
  });
}

/* ---------- leitura pelo coletor ---------- */

const REFERENCIA_VALIDA = new RegExp(`^${PREFIXO_REFERENCIA.replaceAll('.', '\\.')}([A-Za-z0-9._-]{1,40}):[0-9a-f]{64}$`);

/**
 * Dicionário vigente (`ref_apontamento_*`) na forma da função pura da biblioteca. `versao` é a do arquivo da última carga (vai para
 * `versao_dicionario` no fato); `prioridade` de termo e de regra é a do subgrupo. Sem carga, a coleta não roda: classificar com dicionário
 * vazio mandaria tudo para "execução técnica" sem aviso.
 */
export async function carregarDicionario(db: Consultavel, S: Esquemas): Promise<DicionarioApontamento> {
  const versao = await db.query<{ referencia: string }>(
    `SELECT referencia FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia LIKE $1 ORDER BY versao_id DESC LIMIT 1`, [`${PREFIXO_REFERENCIA}%`]);
  const subgrupos = (await db.query<SubgrupoBanco>(`SELECT codigo, rotulo, prioridade FROM ${S.bm}.ref_apontamento_subgrupo WHERE ${VIGENTE}`)).rows;
  const lida = REFERENCIA_VALIDA.exec(versao.rows[0]?.referencia ?? '');
  if (lida === null || subgrupos.length === 0) throw new ErroColetaBm('dicionario', 'dicionário do apontamento não carregado: rode bm:ref-sync-apontamento antes da coleta');
  const prioridade = new Map(subgrupos.map((s) => [s.codigo, s.prioridade]));
  const termos = (await db.query<TermoBanco>(`SELECT subgrupo_codigo, termo_normalizado FROM ${S.bm}.ref_apontamento_termo WHERE ${VIGENTE} ORDER BY termo_normalizado`)).rows;
  const regras = (await db.query<RegraBanco>(`SELECT type_id, condicao, subgrupo_codigo FROM ${S.bm}.ref_apontamento_regra_tipo WHERE ${VIGENTE} ORDER BY type_id, condicao`)).rows;
  const porSubgrupo = new Map<string, string[]>();
  for (const t of termos) porSubgrupo.set(t.subgrupo_codigo, [...(porSubgrupo.get(t.subgrupo_codigo) ?? []), t.termo_normalizado]);
  const regrasDeTermo: RegraPorTermo[] = [...porSubgrupo].map(([subgrupo, lista]) => ({ prioridade: prioridade.get(subgrupo)!, subgrupo, termos: lista }));
  const regrasDeTipo: RegraPorTipo[] = regras.map((r) => ({
    prioridade: prioridade.get(r.subgrupo_codigo)!, subgrupo: r.subgrupo_codigo, typeId: r.type_id, condicao: CONDICAO_DA_BIBLIOTECA[r.condicao]!,
  }));
  return { versao: lida[1]!, termos: regrasDeTermo, regrasPorTipo: regrasDeTipo };
}
