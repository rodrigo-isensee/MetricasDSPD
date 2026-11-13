import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { METRICA_IDS, MOTIVOS_BLOQUEIO, SEVERIDADES, type MotivoBloqueio } from '@metricas-dspd/contratos';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import { emTransacao, type PoolLike } from '../../plataforma/db/pool.js';
import { ErroDominio, planejarDominio, textoSeguro, type LinhaVigente } from '../referencia/index.js';
import { CAMPO_SETOR_QUADRO, CODIGO_QUADRO, rotuloDeSetorSeguro } from '../referencia/setor.js';
import { CAMPOS_CUSTOMIZADOS_FORA, COLUNAS_LISTA, VALOR_DESCONHECIDO } from './allow-list.js';

/**
 * Mapa `field_id` -> coluna de `dim_card` e domínios dos campos customizados do BusinessMap, carregados do arquivo versionado
 * `docs/architecture/fontes/businessmap-dominio.json` para `dspd_bm.ref_dominio` pela entrada `bm:ref-sync` (pedido 069, L2-a; modelo de
 * ameaças `docs/security/069-modelo-ameacas.md`). Fronteira de segurança: o que está no `ref_dominio` decide que campo sai da fonte.
 * Por isso (1) o esquema do arquivo é fechado (`strict`), com lista positiva de `type`, enum de colunas e texto seguro; (2) os fields 36 e 42
 * são recusados no arquivo e removidos de novo na leitura do banco; (3) nada de GRANT novo: o `dspd_ref` já escreve `ref_`.
 * Mensagens de erro trazem só caminho do esquema, nunca valor.
 */
export const ARQUIVO_DOMINIO_BM = new URL('../../../../docs/architecture/fontes/businessmap-dominio.json', import.meta.url);
export const TAMANHO_MAXIMO_ARQUIVO = 512 * 1024;
/** Valor de `ref_dominio.campo` da linha que liga `field_id` (codigo) à coluna (rotulo). */
export const CAMPO_CUSTOMIZADO = 'campo_customizado';
/** Valor de `ref_dominio.campo` do mapa `reason_id` (codigo) -> um dos 7 motivos do briefing (rotulo). O mapa é das pessoas (P-075-3). */
export const CAMPO_MOTIVO_BLOQUEIO = 'motivo_bloqueio';
/**
 * Valor de `ref_dominio.campo` do mapa `priority` do card (codigo, 1 a 4) -> severidade (rotulo, uma de `SEVERIDADES`) (099, C8a). Fato conferido na OpenAPI v2
 * do BusinessMap (`GET /cards`, parâmetro `priorities`): 1 Critical, 2 High, 3 Average, 4 Low; a escala é decrescente (1 é a mais grave). Valor fora do mapa
 * (acima de 4) o projetor recusa e conta; nunca aplica o "acima de 4 = Low" da ferramenta. `priority` nulo fica sem severidade ("Sem severidade" no O16):
 * Q-099-33, recomendação A (o valor não foi gravado; reversível trocando o arquivo, que é nova versão de critério).
 */
export const CAMPO_PRIORIDADE_SEVERIDADE = 'prioridade_severidade';

/**
 * Lista POSITIVA dos `type` de campo customizado aceitos (A3 do modelo de ameaças): só seleção única. Vazia até o diagnóstico (P-L2-1) mostrar os
 * tipos reais; o PR que preencher o arquivo preenche esta constante, com parecer de segurança. Vazia, toda carga com campo é recusada.
 */
export const TIPOS_SELECAO_UNICA: readonly string[] = [];

const ID_CAMPO = /^\d{1,10}$/;
// Mesma regra de `textoSeguro` para o código lido do banco: sem controle, invisível, separador de linha nem arroba.
const CODIGO_SEGURO = /^[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}@]{1,80}$/u;

const valorDominio = z.object({ codigo: textoSeguro(80), rotulo: textoSeguro(120) }).strict();
const criarCampo = (tipos: readonly string[]) =>
  z
  .object({
    field_id: z.string().regex(ID_CAMPO),
    type: z.string().max(40).refine((t) => tipos.includes(t), 'tipo não aceito'),
    coluna: z.enum(COLUNAS_LISTA),
    valores: z.array(valorDominio).min(1).max(500),
  })
  .strict();

// Só as 4 severidades do contrato; `priority` do BusinessMap é inteiro positivo sem zeros à esquerda (código de 1 a 3 dígitos; o mapa usa 1 a 4).
const valorPrioridade = z.object({ codigo: z.string().regex(/^[1-9]\d{0,2}$/), rotulo: z.enum(SEVERIDADES) }).strict();

// Só os 7 do briefing: nunca texto livre nem "não classificado" (que é a ausência de mapa). Vários `reason_id` podem levar ao mesmo motivo.
const valorMotivo = z.object({ codigo: z.string().regex(ID_CAMPO), rotulo: z.enum(MOTIVOS_BLOQUEIO) }).strict();

// L10a do 097 (E7): quadro (codigo, só dígitos) -> setor (rotulo, sem sobrenome do responsável). Rótulo com o padrão de sobrenome é recusado.
const valorSetor = z
  .object({ codigo: z.string().regex(CODIGO_QUADRO), rotulo: textoSeguro(80).refine(rotuloDeSetorSeguro, 'rótulo com sobrenome') })
  .strict();

export const criarEsquemaDominioBm = (tipos: readonly string[] = TIPOS_SELECAO_UNICA) => z
  .object({
    versao: z.literal(1),
    versao_criterio: z
      .object({
        dominio: z.literal('businessmap'), descricao: textoSeguro(300), motivo: textoSeguro(500), referencia: textoSeguro(300),
        // Métricas que a mudança afeta (T2.6): vão para `ref_versao_criterio_metrica` e marcam os gráficos. Omitido = nenhuma.
        afeta: z.array(z.enum(METRICA_IDS)).max(40).default([]),
      })
      .strict(),
    schema: z.literal('dspd_bm'),
    tabela: z.literal('ref_dominio'),
    regra: textoSeguro(2000),
    campos: z.array(criarCampo(tipos)).max(40),
    motivo_bloqueio: z.array(valorMotivo).max(500).default([]),
    setores: z.array(valorSetor).max(50).default([]),
    prioridade_severidade: z.array(valorPrioridade).max(20).default([]),
  })
  .strict()
  .superRefine((d, ctx) => {
    const prioridades = new Set<string>();
    for (const [i, p] of d.prioridade_severidade.entries()) {
      if (prioridades.has(p.codigo)) ctx.addIssue({ code: 'custom', path: ['prioridade_severidade', i, 'codigo'], message: 'priority repetido' });
      prioridades.add(p.codigo);
    }
    const reasons = new Set<string>();
    for (const [i, m] of d.motivo_bloqueio.entries()) {
      if (reasons.has(String(Number(m.codigo)))) ctx.addIssue({ code: 'custom', path: ['motivo_bloqueio', i, 'codigo'], message: 'reason_id repetido' });
      reasons.add(String(Number(m.codigo)));
    }
    const quadros = new Set<string>();
    const nomes = new Set<string>();
    for (const [i, v] of d.setores.entries()) {
      const q = String(Number(v.codigo));
      if (quadros.has(q)) ctx.addIssue({ code: 'custom', path: ['setores', i, 'codigo'], message: 'quadro repetido' });
      if (nomes.has(v.rotulo)) ctx.addIssue({ code: 'custom', path: ['setores', i, 'rotulo'], message: 'rótulo repetido' });
      quadros.add(q);
      nomes.add(v.rotulo);
    }
    const ids = new Set<string>();
    const colunas = new Set<string>();
    for (const [i, c] of d.campos.entries()) {
      // `Number` normaliza "042" e "0042": o coletor casa por `String(field_id)`, mas a recusa não depende dessa sorte.
      if ((CAMPOS_CUSTOMIZADOS_FORA as readonly string[]).includes(String(Number(c.field_id)))) {
        ctx.addIssue({ code: 'custom', path: ['campos', i, 'field_id'], message: 'field proibido' });
      }
      if (ids.has(c.field_id)) ctx.addIssue({ code: 'custom', path: ['campos', i, 'field_id'], message: 'field_id repetido' });
      if (colunas.has(c.coluna)) ctx.addIssue({ code: 'custom', path: ['campos', i, 'coluna'], message: 'coluna repetida' });
      ids.add(c.field_id);
      colunas.add(c.coluna);
      const codigos = new Set<string>();
      const rotulos = new Set<string>();
      for (const [j, v] of c.valores.entries()) {
        // `desconhecido` é o código reservado do valor fora do domínio.
        if (codigos.has(v.codigo) || v.codigo === VALOR_DESCONHECIDO) ctx.addIssue({ code: 'custom', path: ['campos', i, 'valores', j, 'codigo'], message: 'código repetido ou reservado' });
        if (rotulos.has(v.rotulo)) ctx.addIssue({ code: 'custom', path: ['campos', i, 'valores', j, 'rotulo'], message: 'rótulo repetido' });
        codigos.add(v.codigo);
        rotulos.add(v.rotulo);
      }
    }
  });
export type ArquivoDominioBm = z.infer<ReturnType<typeof criarEsquemaDominioBm>>;
export interface DominioBmLido { arquivo: ArquivoDominioBm; sha256: string }

/** Lê e valida o texto (nunca grava nada). O hash é o do texto exato do arquivo. */
export function analisarDominioBm(texto: string, tipos: readonly string[] = TIPOS_SELECAO_UNICA): DominioBmLido {
  if (texto.length > TAMANHO_MAXIMO_ARQUIVO) throw new ErroDominio('arquivo', 'o arquivo de domínio do BusinessMap passa do tamanho máximo');
  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    throw new ErroDominio('arquivo', 'o arquivo de domínio do BusinessMap não é um JSON válido');
  }
  const r = criarEsquemaDominioBm(tipos).safeParse(bruto);
  if (!r.success) {
    const onde = [...new Set(r.error.issues.map((i) => i.path.slice(0, 3).map((p) => (typeof p === 'number' ? '#' : 'item')).join('.') || 'raiz'))].join(', ');
    throw new ErroDominio('arquivo', `o arquivo de domínio do BusinessMap é inválido (${onde})`);
  }
  return { arquivo: r.data, sha256: createHash('sha256').update(texto, 'utf8').digest('hex') };
}

/** Caminho constante (sem argumento); o tamanho máximo é conferido em `analisarDominioBm`, antes do JSON. */
export function lerDominioBm(): DominioBmLido {
  return analisarDominioBm(readFileSync(ARQUIVO_DOMINIO_BM, 'utf8'));
}

/** O arquivo como listas de `ref_dominio`: `campo_customizado` (field_id -> coluna) e, por coluna, os valores. Sempre traz `campo_customizado`, mesmo vazio, para fechar o que saiu. */
export function listasDoArquivo(a: ArquivoDominioBm): Record<string, { codigo: string; rotulo: string }[]> {
  const listas: Record<string, { codigo: string; rotulo: string }[]> = {
    [CAMPO_CUSTOMIZADO]: a.campos.map((c) => ({ codigo: c.field_id, rotulo: c.coluna })),
  };
  for (const c of a.campos) listas[c.coluna] = c.valores;
  listas[CAMPO_MOTIVO_BLOQUEIO] = a.motivo_bloqueio;
  listas[CAMPO_SETOR_QUADRO] = a.setores;
  listas[CAMPO_PRIORIDADE_SEVERIDADE] = a.prioridade_severidade;
  return listas;
}

export const referenciaDaVersaoBm = (sha256: string): string => `069:ref-bm-campos:${sha256}`;

export interface ResultadoDominioBm { sha256: string; campos: number; inseridas: number; fechadas: number; versaoRegistrada: boolean }

/**
 * Lê as vigentes, planeja e grava numa transação só (tudo ou nada); só INSERT de vigência nova e UPDATE de `vigente_ate`. Sem diferença nada é
 * gravado; com diferença registra a versão de critério (T2.6, domínio `businessmap`) com o hash do arquivo, uma vez por hash. As métricas afetadas
 * são as de `versao_criterio.afeta` do arquivo (decisão de negócio, escrita no PR que muda o arquivo); sem `afeta` a versão não marca métrica.
 */
export async function sincronizarDominioBm(pool: PoolLike, S: Esquemas, lido: DominioBmLido, hoje: string, agora: Date): Promise<ResultadoDominioBm> {
  const listas = listasDoArquivo(lido.arquivo);
  return emTransacao(pool, async (db) => {
    const campos = Object.keys(listas);
    const vigentes = (await db.query<LinhaVigente>(
      `SELECT campo, codigo, rotulo, vigente_de FROM ${S.bm}.ref_dominio WHERE vigente_ate IS NULL AND campo = ANY($1::text[])`, [campos])).rows;
    const ultimas = (await db.query<{ campo: string; ultima: string }>(
      `SELECT campo, max(greatest(vigente_de, coalesce(vigente_ate, vigente_de)))::text AS ultima FROM ${S.bm}.ref_dominio WHERE campo = ANY($1::text[]) GROUP BY campo`, [campos])).rows;
    const plano = planejarDominio({ dominios: listas }, vigentes, hoje, new Map(ultimas.map((u) => [u.campo, u.ultima])));
    for (const f of plano.fechar) {
      await db.query(`UPDATE ${S.bm}.ref_dominio SET vigente_ate = $1 WHERE vigente_ate IS NULL AND campo = $2 AND codigo = $3`, [hoje, f.campo, f.codigo]);
    }
    for (const i of plano.inserir) {
      await db.query(
        `INSERT INTO ${S.bm}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ($1, $2, $3, $4, $5)`, [i.campo, i.codigo, hoje, i.rotulo, i.ordem]);
    }
    let versaoRegistrada = false;
    if (plano.inserir.length + plano.fechar.length > 0) {
      const referencia = referenciaDaVersaoBm(lido.sha256);
      const existe = await db.query(`SELECT 1 FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = $1`, [referencia]);
      if (existe.rows.length === 0) {
        const v = lido.arquivo.versao_criterio;
        const nova = await db.query<{ versao_id: string }>(
          `INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
           VALUES ($1, 'businessmap', $2, $3, $4, $5) RETURNING versao_id`, [hoje, v.descricao, v.motivo, referencia, agora.toISOString()]);
        for (const m of new Set(v.afeta)) {
          await db.query(`INSERT INTO ${S.core}.ref_versao_criterio_metrica (versao_id, metrica_id) VALUES ($1, $2)`, [nova.rows[0]!.versao_id, m]);
        }
        versaoRegistrada = true;
      }
    }
    return { sha256: lido.sha256, campos: lido.arquivo.campos.length, inseridas: plano.inserir.length, fechadas: plano.fechar.length, versaoRegistrada };
  });
}

export interface LinhaRefDominio { campo: string; codigo: string; rotulo: string }

/**
 * Lado do coletor (A4 do modelo de ameaças): monta `field_id` -> (valor recebido -> código) do `ref_dominio` vigente, desconfiando do banco.
 * Ignora linha `campo_customizado` com `field_id` não numérico, coluna fora do enum, field 36 ou 42 (depois da leitura, mesmo que o arquivo os
 * recuse) e `field_id` ligado a duas colunas; ignora valor com código inseguro ou reservado e rótulo que leva a dois códigos. Campo sem valor não entra.
 */
/**
 * `field_id` -> coluna de `dim_card` das linhas `campo_customizado` do `ref_dominio`, com a mesma desconfiança do coletor (A4): ignora `field_id` não
 * numérico, coluna fora do enum, field 36 e 42 e `field_id` ligado a duas colunas. Usada pelo coletor e pelo projetor (pedido 069, L2-b).
 */
export function colunasDosCampos(linhas: readonly LinhaRefDominio[]): Map<string, string> {
  const colunas = COLUNAS_LISTA as readonly string[];
  const fora = CAMPOS_CUSTOMIZADOS_FORA as readonly string[];
  const colunaDe = new Map<string, string | null>();
  for (const l of linhas) {
    if (l.campo !== CAMPO_CUSTOMIZADO || !ID_CAMPO.test(l.codigo) || !colunas.includes(l.rotulo)) continue;
    if (fora.includes(l.codigo) || fora.includes(String(Number(l.codigo)))) continue;
    colunaDe.set(l.codigo, colunaDe.has(l.codigo) && colunaDe.get(l.codigo) !== l.rotulo ? null : l.rotulo);
  }
  const mapa = new Map<string, string>();
  for (const [id, coluna] of colunaDe) if (coluna !== null) mapa.set(id, coluna);
  return mapa;
}

export function dominiosDeLinhas(linhas: readonly LinhaRefDominio[]): Map<string, Map<string, string>> {
  const colunas = COLUNAS_LISTA as readonly string[];
  const colunaDe = colunasDosCampos(linhas);
  const porColuna = new Map<string, Map<string, string | null>>();
  for (const l of linhas) {
    if (l.campo === CAMPO_CUSTOMIZADO || !colunas.includes(l.campo)) continue;
    if (!CODIGO_SEGURO.test(l.codigo) || l.codigo === VALOR_DESCONHECIDO || l.rotulo.length === 0) continue;
    const m = porColuna.get(l.campo) ?? new Map<string, string | null>();
    m.set(l.rotulo, m.has(l.rotulo) && m.get(l.rotulo) !== l.codigo ? null : l.codigo);
    porColuna.set(l.campo, m);
  }
  const mapa = new Map<string, Map<string, string>>();
  for (const [id, coluna] of colunaDe) {
    const dominio = new Map<string, string>();
    for (const [rotulo, codigo] of porColuna.get(coluna) ?? []) if (codigo !== null) dominio.set(rotulo, codigo);
    if (dominio.size > 0) mapa.set(id, dominio);
  }
  return mapa;
}

/**
 * Leitura do mapa para o projetor (lote 4b), com a desconfiança do banco: só `reason_id` numérico e rótulo entre os 7 do briefing; `reason_id` ligado a
 * dois motivos é ignorado. Sem entrada, o motivo fica sem mapa e a tela mostra "não classificado". Nenhuma tradução no código: o mapa só vem do arquivo.
 */
export function motivosDeLinhas(linhas: readonly LinhaRefDominio[]): Map<string, MotivoBloqueio> {
  const validos = MOTIVOS_BLOQUEIO as readonly string[];
  const por = new Map<string, MotivoBloqueio | null>();
  for (const l of linhas) {
    if (l.campo !== CAMPO_MOTIVO_BLOQUEIO || !ID_CAMPO.test(l.codigo) || !validos.includes(l.rotulo)) continue;
    const id = String(Number(l.codigo));
    por.set(id, por.has(id) && por.get(id) !== l.rotulo ? null : (l.rotulo as MotivoBloqueio));
  }
  const mapa = new Map<string, MotivoBloqueio>();
  for (const [id, m] of por) if (m !== null) mapa.set(id, m);
  return mapa;
}

/**
 * Leitura do mapa `priority` -> severidade para o projetor (C8a), com a desconfiança do banco: só código de 1 a 3 dígitos sem zero à esquerda e rótulo entre
 * as 4 severidades; código ligado a duas severidades é ignorado. Sem entrada, nenhuma severidade é projetada.
 */
export function prioridadesDeLinhas(linhas: readonly LinhaRefDominio[]): Map<string, string> {
  const validos = SEVERIDADES as readonly string[];
  const por = new Map<string, string | null>();
  for (const l of linhas) {
    if (l.campo !== CAMPO_PRIORIDADE_SEVERIDADE || !/^[1-9]\d{0,2}$/.test(l.codigo) || !validos.includes(l.rotulo)) continue;
    por.set(l.codigo, por.has(l.codigo) && por.get(l.codigo) !== l.rotulo ? null : l.rotulo);
  }
  const mapa = new Map<string, string>();
  for (const [codigo, rotulo] of por) if (rotulo !== null) mapa.set(codigo, rotulo);
  return mapa;
}
