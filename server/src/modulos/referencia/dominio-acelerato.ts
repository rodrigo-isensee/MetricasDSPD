import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import { emTransacao, type PoolLike } from '../../plataforma/db/pool.js';

/**
 * Sincronização do `ref_dominio` do `dspd_ac` a partir do arquivo versionado `docs/architecture/fontes/acelerato-dominio.json`
 * (pedido 056, E4.28; ADR 0023, item 5). Só INSERT de vigência nova e UPDATE de `vigente_ate`: nada é apagado nem sobrescrito.
 * Cada mudança de lista registra uma versão de critério (T2.6) com o hash do arquivo. Nenhum dado de pessoa passa por aqui:
 * o arquivo só traz chaves e nomes de domínio, e a lista de campos é fechada. Escrita pelo papel de referência (`dspd_ref`).
 */
export const ARQUIVO_DOMINIO = new URL('../../../../docs/architecture/fontes/acelerato-dominio.json', import.meta.url);

/** Campos de `ref_dominio` que o arquivo pode trazer (conjunto fechado). */
export const CAMPOS_DOMINIO = [
  'tipo_recorte', 'organizacao_recorte', 'equipe', 'etapa', 'prioridade', 'categoria', 'descricao_workflow', 'natureza_prefixo', 'campo_personalizado',
] as const;
/** Listas de chave: o código é a chave numérica em texto decimal (recorte e `categoria_key`). */
export const CAMPOS_DE_CHAVE: readonly string[] = ['tipo_recorte', 'organizacao_recorte', 'equipe', 'categoria'];

/** Data civil existente no formato AAAA-MM-DD (2026-02-30 não passa). */
export function dataCivilValida(texto: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const d = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === texto;
}
export class ErroDominio extends Error {
  constructor(readonly tipo: 'arquivo' | 'vigencia', mensagem: string) {
    super(mensagem);
    this.name = 'ErroDominio';
  }
}

// Sem controle, sem formatação invisível (U+200B, bidi), sem separador de linha ou parágrafo (U+2028, U+2029) e sem arroba
// (um e-mail nunca entra como valor de domínio). Vale para os valores das listas e para os textos da versão de critério.
const textoSeguro = (max: number): z.ZodString => z.string().min(1).max(max).regex(/^[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}@]+$/u, 'caractere não aceito');
const itemDominio = z.object({ codigo: textoSeguro(80), rotulo: textoSeguro(120) }).strict();

export type Item = { codigo: string; rotulo: string };
const listasDe = (dominios: Partial<Record<string, Item[]>>): [string, Item[]][] =>
  Object.entries(dominios).filter((e): e is [string, Item[]] => e[1] !== undefined);

export const esquemaDominio = z
  .object({
    versao: z.literal(1),
    versao_criterio: z
      .object({
        dominio: z.literal('acelerato'),
        descricao: textoSeguro(300),
        motivo: textoSeguro(500),
        referencia: textoSeguro(300),
      })
      .strict(),
    schema: z.literal('dspd_ac'),
    tabela: z.literal('ref_dominio'),
    regra: textoSeguro(2000),
    dominios: z.partialRecord(z.enum(CAMPOS_DOMINIO), z.array(itemDominio).min(1).max(32_000)),
  })
  .strict()
  .superRefine((d, ctx) => {
    for (const [campo, itens] of listasDe(d.dominios)) {
      const vistos = new Set<string>();
      for (const [i, item] of itens.entries()) {
        if (vistos.has(item.codigo)) ctx.addIssue({ code: 'custom', path: ['dominios', campo, i, 'codigo'], message: 'código repetido' });
        vistos.add(item.codigo);
        if (CAMPOS_DE_CHAVE.includes(campo) && !/^\d{1,15}$/.test(item.codigo)) {
          ctx.addIssue({ code: 'custom', path: ['dominios', campo, i, 'codigo'], message: 'a chave do recorte é numérica' });
        }
      }
    }
  });
export type ArquivoDominio = z.infer<typeof esquemaDominio>;

export interface DominioLido { arquivo: ArquivoDominio; sha256: string }

/** Lê e valida o texto (nunca grava nada). O hash é o do texto exato do arquivo. */
export function analisarDominio(texto: string): DominioLido {
  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    throw new ErroDominio('arquivo', 'o arquivo de domínio do Acelerato não é um JSON válido');
  }
  const r = esquemaDominio.safeParse(bruto);
  if (!r.success) {
    const onde = [...new Set(r.error.issues.map((i) => i.path.slice(0, 2).join('.') || 'raiz'))].join(', ');
    throw new ErroDominio('arquivo', `o arquivo de domínio do Acelerato é inválido (${onde})`);
  }
  return { arquivo: r.data, sha256: createHash('sha256').update(texto, 'utf8').digest('hex') };
}

export const lerDominio = (caminho: URL | string = ARQUIVO_DOMINIO): DominioLido => analisarDominio(readFileSync(caminho, 'utf8'));

export interface LinhaVigente { campo: string; codigo: string; rotulo: string; vigente_de: string }
export interface Insercao { campo: string; codigo: string; rotulo: string; ordem: number }
export interface Fechamento { campo: string; codigo: string }
/** Última data de vigência já registrada por campo (a maior entre `vigente_de` e `vigente_ate`). */
export type UltimaVigencia = ReadonlyMap<string, string>;
export interface PlanoDominio { inserir: Insercao[]; fechar: Fechamento[]; campos: number; inicial: boolean }

/**
 * Compara o arquivo com as linhas vigentes dos campos que o arquivo traz. Campo ausente do arquivo não é tocado.
 * Código novo abre vigência; rótulo diferente fecha a anterior e abre a nova; código que saiu da lista só fecha.
 * Só a ordem diferente não muda nada (a posição não altera o significado da lista).
 * Data menor que a última vigência do campo é recusada quando o campo muda: sem períodos sobrepostos nem versão T2.6 com data passada.
 */
export function planejarDominio(
  arquivo: ArquivoDominio, vigentes: readonly LinhaVigente[], hoje: string, ultima: UltimaVigencia = new Map(),
): PlanoDominio {
  const inserir: Insercao[] = [];
  const fechar: Fechamento[] = [];
  const campos = listasDe(arquivo.dominios);
  for (const [campo, itens] of campos) {
    const antes = inserir.length + fechar.length;
    const atuais = new Map(vigentes.filter((v) => v.campo === campo).map((v) => [v.codigo, v]));
    const desejados = new Set<string>();
    for (const [ordem, item] of itens.entries()) {
      desejados.add(item.codigo);
      const atual = atuais.get(item.codigo);
      if (atual?.rotulo === item.rotulo) continue;
      if (atual !== undefined) fechar.push({ campo, codigo: item.codigo });
      inserir.push({ campo, codigo: item.codigo, rotulo: item.rotulo, ordem });
    }
    for (const codigo of atuais.keys()) if (!desejados.has(codigo)) fechar.push({ campo, codigo });
    const ultimo = ultima.get(campo);
    if (ultimo !== undefined && hoje < ultimo && inserir.length + fechar.length > antes) {
      throw new ErroDominio('vigencia', `ref_dominio ${campo}: a data ${hoje} é anterior à última vigência do campo (${ultimo}); use essa data ou uma posterior`);
    }
  }
  for (const f of fechar) {
    const atual = vigentes.find((v) => v.campo === f.campo && v.codigo === f.codigo)!;
    if (atual.vigente_de >= hoje) {
      throw new ErroDominio('vigencia', `ref_dominio ${f.campo}: já existe vigência aberta em ${hoje} para o mesmo código; repita depois dessa data`);
    }
  }
  return { inserir, fechar, campos: campos.length, inicial: vigentes.length === 0 };
}

export interface ResultadoDominio {
  sha256: string;
  campos: number;
  inseridas: number;
  fechadas: number;
  versaoRegistrada: boolean;
}

export const referenciaDaVersao = (sha256: string): string => `056:ref-dominio:${sha256}`;

/**
 * Lê as vigentes, planeja e grava numa transação só (tudo ou nada). Sem diferença nada é gravado (idempotente); com diferença
 * grava a vigência e registra a versão de critério (T2.6) com o hash do arquivo, uma vez por hash. A versão não marca métrica:
 * quais métricas a mudança afeta é decisão de negócio e não se infere aqui.
 */
export async function sincronizarDominio(
  pool: PoolLike, S: Esquemas, lido: DominioLido, hoje: string, agora: Date,
): Promise<ResultadoDominio> {
  return emTransacao(pool, async (db) => {
    const campos = Object.keys(lido.arquivo.dominios);
    const vigentes = (await db.query<LinhaVigente>(
      `SELECT campo, codigo, rotulo, vigente_de FROM ${S.ac}.ref_dominio WHERE vigente_ate IS NULL AND campo = ANY($1::text[])`, [campos])).rows;
    const ultimas = (await db.query<{ campo: string; ultima: string }>(
      `SELECT campo, max(greatest(vigente_de, coalesce(vigente_ate, vigente_de)))::text AS ultima FROM ${S.ac}.ref_dominio WHERE campo = ANY($1::text[]) GROUP BY campo`, [campos])).rows;
    const plano = planejarDominio(lido.arquivo, vigentes, hoje, new Map(ultimas.map((u) => [u.campo, u.ultima])));
    for (const f of plano.fechar) {
      await db.query(`UPDATE ${S.ac}.ref_dominio SET vigente_ate = $1 WHERE vigente_ate IS NULL AND campo = $2 AND codigo = $3`, [hoje, f.campo, f.codigo]);
    }
    for (const i of plano.inserir) {
      await db.query(
        `INSERT INTO ${S.ac}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ($1, $2, $3, $4, $5)`, [i.campo, i.codigo, hoje, i.rotulo, i.ordem]);
    }
    const mudou = plano.inserir.length + plano.fechar.length > 0;
    let versaoRegistrada = false;
    if (mudou) {
      const referencia = referenciaDaVersao(lido.sha256);
      const existe = await db.query(`SELECT 1 FROM ${S.core}.ref_versao_criterio WHERE dominio = 'acelerato' AND referencia = $1`, [referencia]);
      if (existe.rows.length === 0) {
        const v = lido.arquivo.versao_criterio;
        await db.query(
          `INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
           VALUES ($1, 'acelerato', $2, $3, $4, $5)`, [hoje, v.descricao, v.motivo, referencia, agora.toISOString()]);
        versaoRegistrada = true;
      }
    }
    return { sha256: lido.sha256, campos: plano.campos, inseridas: plano.inserir.length, fechadas: plano.fechar.length, versaoRegistrada };
  });
}
