import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { DicionarioApontamento, RegraPorTermo, RegraPorTipo } from '@metricas-dspd/metricas/coletor';
import { z } from 'zod';
import type { Esquemas } from '../../../plataforma/db/esquemas.js';
import { emTransacao, type Consultavel, type PoolLike } from '../../../plataforma/db/pool.js';
import { ErroColetaBm } from '../coleta.js';

// Pedido 059 (K-193), E2.19, plano §3.6 e G2: dicionário de subgrupo do apontamento, carregado por `ref:sync` do arquivo versionado
// `docs/architecture/fontes/apontamento-dicionario.json` (cópia do dicionário do discovery, como está; o dono confere e ajuste posterior é
// troca de arquivo). Escrito pelo papel `dspd_ref` (só INSERT em `ref_*`): a carga é ADITIVA (subgrupo, termo ou regra novos, com versão de
// critério T2.6); mudar ou tirar o que já foi carregado não cabe sem coluna de vigência e é recusado, nunca sobrescrito (carga incremental,
// histórico intocado). O coletor lê o dicionário vigente do banco (`carregarDicionario`) e o liga à função pura da biblioteca.

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
export interface DicionarioBanco { subgrupos: SubgrupoBanco[]; termos: TermoBanco[]; regras: RegraBanco[] }
export interface TipoDoCard { tipo_id: string; nome: string }
export interface PlanoDicionario { subgrupos: SubgrupoBanco[]; termos: TermoBanco[]; regras: RegraBanco[] }

/** Rótulo do tipo -> `type_id` da referência vigente. Sem adivinhar: rótulo que não existe ou que casa com dois ids recusa a carga. */
function resolverTipo(rotulo: string, tipos: readonly TipoDoCard[]): string {
  const ids = [...new Set(tipos.filter((t) => normalizar(t.nome) === normalizar(rotulo)).map((t) => t.tipo_id))];
  if (ids.length === 0) throw new ErroDicionario('tipo', `o tipo de card "${rotulo}" não existe em ref_tipo_card (a carga não adivinha o id)`);
  if (ids.length > 1) throw new ErroDicionario('tipo', `o tipo de card "${rotulo}" casa com mais de um id em ref_tipo_card`);
  return ids[0]!;
}

/**
 * Compara o arquivo com o que já está no banco. Só o que falta entra (carga aditiva). Recusa, sem gravar nada: subgrupo com rótulo ou
 * prioridade diferente, prioridade que já é de outro subgrupo, termo ou regra que o arquivo deixou de trazer, e regra que mudou de subgrupo.
 */
export function planejarDicionario(arquivo: ArquivoDicionario, banco: DicionarioBanco, tipos: readonly TipoDoCard[]): PlanoDicionario {
  const recusa = (msg: string): never => { throw new ErroDicionario('mudanca', `${msg}: mudar ou retirar o que já foi carregado exige coluna de vigência (nova migração)`); };
  const plano: PlanoDicionario = { subgrupos: [], termos: [], regras: [] };

  const noBancoPorCodigo = new Map(banco.subgrupos.map((s) => [s.codigo, s]));
  const doArquivo = new Set(arquivo.subgrupos.map((s) => s.codigo));
  for (const s of banco.subgrupos) if (!doArquivo.has(s.codigo)) recusa(`o subgrupo ${s.codigo} saiu do arquivo`);
  for (const s of arquivo.subgrupos) {
    const atual = noBancoPorCodigo.get(s.codigo);
    if (atual === undefined) {
      if (banco.subgrupos.some((b) => b.prioridade === s.prioridade)) recusa(`a prioridade ${s.prioridade} do subgrupo ${s.codigo} já é de outro subgrupo`);
      plano.subgrupos.push({ codigo: s.codigo, rotulo: s.rotulo, prioridade: s.prioridade });
    } else if (atual.rotulo !== s.rotulo || atual.prioridade !== s.prioridade) recusa(`o subgrupo ${s.codigo} mudou de rótulo ou de prioridade`);
  }

  const termosDoArquivo = arquivo.termos.flatMap((t) => t.termos.map((termo) => ({ subgrupo_codigo: t.subgrupo, termo_normalizado: termo })));
  const chaveTermo = (t: TermoBanco): string => `${t.termo_normalizado}|${t.subgrupo_codigo}`;
  const termosNoBanco = new Set(banco.termos.map(chaveTermo));
  const termosNoArquivo = new Set(termosDoArquivo.map(chaveTermo));
  for (const t of banco.termos) if (!termosNoArquivo.has(chaveTermo(t))) recusa(`o termo ${t.termo_normalizado} saiu do subgrupo ${t.subgrupo_codigo}`);
  plano.termos = termosDoArquivo.filter((t) => !termosNoBanco.has(chaveTermo(t)));

  const regrasDoArquivo = arquivo.regrasPorTipo.map((r) => ({
    type_id: resolverTipo(r.tipoRotulo, tipos), condicao: CONDICAO_NO_BANCO[r.condicao], subgrupo_codigo: r.subgrupo,
  }));
  const chaveRegra = (r: RegraBanco): string => `${r.type_id}|${r.condicao}`;
  const regrasNoBanco = new Map(banco.regras.map((r) => [chaveRegra(r), r]));
  const regrasNoArquivo = new Set(regrasDoArquivo.map(chaveRegra));
  for (const r of banco.regras) if (!regrasNoArquivo.has(chaveRegra(r))) recusa(`a regra do tipo ${r.type_id} (${r.condicao}) saiu do arquivo`);
  for (const r of regrasDoArquivo) {
    const atual = regrasNoBanco.get(chaveRegra(r));
    if (atual === undefined) plano.regras.push(r);
    else if (atual.subgrupo_codigo !== r.subgrupo_codigo) recusa(`a regra do tipo ${r.type_id} (${r.condicao}) mudou de subgrupo`);
  }
  return plano;
}

/* ---------- carga (dspd_ref) ---------- */

export interface ResultadoDicionario {
  sha256: string;
  versao: string;
  subgrupos: number;
  termos: number;
  regras: number;
  versaoRegistrada: boolean;
}

export const referenciaDaVersao = (versao: string, sha256: string): string => `${PREFIXO_REFERENCIA}${versao}:${sha256}`;

/**
 * Lê o banco, planeja e grava numa transação só (tudo ou nada). Sem diferença nada é gravado (idempotente); com diferença registra a versão de
 * critério (T2.6, domínio `businessmap`, referência com o hash do arquivo) e grava as linhas novas com `incluido_por_versao_id`. A versão não
 * marca métrica: o dicionário não entra em métrica do painel; a marca nos gráficos da aba é decisão posterior.
 */
export async function sincronizarDicionario(pool: PoolLike, S: Esquemas, lido: DicionarioLido, hoje: string, agora: Date): Promise<ResultadoDicionario> {
  return emTransacao(pool, async (db) => {
    const banco: DicionarioBanco = {
      subgrupos: (await db.query<SubgrupoBanco>(`SELECT codigo, rotulo, prioridade FROM ${S.bm}.ref_apontamento_subgrupo`)).rows,
      termos: (await db.query<TermoBanco>(`SELECT subgrupo_codigo, termo_normalizado FROM ${S.bm}.ref_apontamento_termo`)).rows,
      regras: (await db.query<RegraBanco>(`SELECT type_id, condicao, subgrupo_codigo FROM ${S.bm}.ref_apontamento_regra_tipo`)).rows,
    };
    const tipos = (await db.query<TipoDoCard>(`SELECT tipo_id, nome FROM ${S.bm}.ref_tipo_card WHERE vigente_ate IS NULL`)).rows;
    const plano = planejarDicionario(lido.arquivo, banco, tipos);
    const base = { sha256: lido.sha256, versao: lido.arquivo.versao };
    const total = plano.subgrupos.length + plano.termos.length + plano.regras.length;
    if (total === 0) return { ...base, subgrupos: 0, termos: 0, regras: 0, versaoRegistrada: false };

    const ultima = (await db.query<{ ultima: string | null }>(
      `SELECT max(vigente_desde)::text AS ultima FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia LIKE $1`, [`${PREFIXO_REFERENCIA}%`])).rows[0]!.ultima;
    if (ultima !== null && hoje < ultima) {
      throw new ErroDicionario('vigencia', `a data ${hoje} é anterior à última versão do dicionário (${ultima}); use essa data ou uma posterior`);
    }
    const referencia = referenciaDaVersao(lido.arquivo.versao, lido.sha256);
    const existente = await db.query<{ versao_id: string }>(`SELECT versao_id FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = $1`, [referencia]);
    let versaoId = existente.rows[0]?.versao_id;
    const versaoRegistrada = versaoId === undefined;
    if (versaoId === undefined) {
      const nova = await db.query<{ versao_id: string }>(
        `INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
         VALUES ($1, 'businessmap', $2, $3, $4, $5) RETURNING versao_id`,
        [hoje, `Dicionário de classificação do apontamento (aba Apontamento), versão ${lido.arquivo.versao}`,
          'Carga do dicionário de subgrupo do apontamento por ref:sync (pedido 059); critério da classificação do comentário, versionado e sem reclassificar o passado.', referencia, agora.toISOString()]);
      versaoId = nova.rows[0]!.versao_id;
    }
    for (const s of plano.subgrupos) {
      await db.query(`INSERT INTO ${S.bm}.ref_apontamento_subgrupo (codigo, rotulo, prioridade, incluido_por_versao_id) VALUES ($1, $2, $3, $4)`, [s.codigo, s.rotulo, s.prioridade, versaoId]);
    }
    for (const t of plano.termos) {
      await db.query(`INSERT INTO ${S.bm}.ref_apontamento_termo (subgrupo_codigo, termo_normalizado, incluido_por_versao_id) VALUES ($1, $2, $3)`, [t.subgrupo_codigo, t.termo_normalizado, versaoId]);
    }
    for (const r of plano.regras) {
      await db.query(`INSERT INTO ${S.bm}.ref_apontamento_regra_tipo (type_id, condicao, subgrupo_codigo, incluido_por_versao_id) VALUES ($1, $2, $3, $4)`, [r.type_id, r.condicao, r.subgrupo_codigo, versaoId]);
    }
    return { ...base, subgrupos: plano.subgrupos.length, termos: plano.termos.length, regras: plano.regras.length, versaoRegistrada };
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
  const subgrupos = (await db.query<SubgrupoBanco>(`SELECT codigo, rotulo, prioridade FROM ${S.bm}.ref_apontamento_subgrupo`)).rows;
  const lida = REFERENCIA_VALIDA.exec(versao.rows[0]?.referencia ?? '');
  if (lida === null || subgrupos.length === 0) throw new ErroColetaBm('dicionario', 'dicionário do apontamento não carregado: rode bm:ref-sync-apontamento antes da coleta');
  const prioridade = new Map(subgrupos.map((s) => [s.codigo, s.prioridade]));
  const termos = (await db.query<TermoBanco>(`SELECT subgrupo_codigo, termo_normalizado FROM ${S.bm}.ref_apontamento_termo ORDER BY termo_normalizado`)).rows;
  const regras = (await db.query<RegraBanco>(`SELECT type_id, condicao, subgrupo_codigo FROM ${S.bm}.ref_apontamento_regra_tipo ORDER BY type_id, condicao`)).rows;
  const porSubgrupo = new Map<string, string[]>();
  for (const t of termos) porSubgrupo.set(t.subgrupo_codigo, [...(porSubgrupo.get(t.subgrupo_codigo) ?? []), t.termo_normalizado]);
  const regrasDeTermo: RegraPorTermo[] = [...porSubgrupo].map(([subgrupo, lista]) => ({ prioridade: prioridade.get(subgrupo)!, subgrupo, termos: lista }));
  const regrasDeTipo: RegraPorTipo[] = regras.map((r) => ({
    prioridade: prioridade.get(r.subgrupo_codigo)!, subgrupo: r.subgrupo_codigo, typeId: r.type_id, condicao: CONDICAO_DA_BIBLIOTECA[r.condicao]!,
  }));
  return { versao: lida[1]!, termos: regrasDeTermo, regrasPorTipo: regrasDeTipo };
}
