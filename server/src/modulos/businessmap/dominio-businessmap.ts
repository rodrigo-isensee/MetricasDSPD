import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { FASES_DETECCAO, METRICA_IDS, MOTIVOS_BLOQUEIO, SEVERIDADES, TAMANHOS_REGUA, type FaseDeteccao, type MotivoBloqueio } from '@metricas-dspd/contratos';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import { emTransacao, type PoolLike } from '../../plataforma/db/pool.js';
import { CAMPO_SETOR_QUADRO, CODIGO_QUADRO, ErroDominio, planejarDominio, rotuloDeSetorSeguro, textoSeguro, type LinhaVigente } from '../referencia/index.js';
import { CAMPOS_CUSTOMIZADOS_FORA, COLUNAS_LISTA, VALOR_DESCONHECIDO } from './allow-list.js';
import type { ReguaTamanho } from './normalizador.js';

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
 * Valor de `ref_dominio.campo` da tabela coluna -> fase de detecção do bug (pedido 105, E7.5): `codigo` = `coluna_id` (a folha, nunca o nome, que os quadros repetem e
 * renomeiam), `rotulo` = uma das cinco fases de `FASES_DETECCAO`. Coluna fora da tabela não tem fase. A primeira carga e cada troca de linha são versão de critério; a versão da E7.5 marca o O15 (`afeta = ['O15']`) e a próxima troca desta tabela volta a marcá-lo. A versão do campo 48 (E7.86) tem `afeta` vazio: só coleta, nenhuma métrica muda.
 */
export const CAMPO_FASE_DETECCAO_COLUNA = 'fase_deteccao_coluna';
/**
 * Pedido 105 (E7.203): prefixo do valor de `ref_dominio.campo` que guarda os `value_id` de uma coluna de lista (`valor_id_<coluna>`): `codigo` = `value_id` (só dígitos),
 * `rotulo` = código do domínio da opção. Sem coluna nova nem GRANT novo; `varchar(40)` comporta o prefixo mais a maior coluna.
 */
export const PREFIXO_VALOR_ID = 'valor_id_';
/**
 * Valor de `ref_dominio.campo` da régua de tamanho por time (pedido 105, E7.102): `codigo` = `<time_id>:<size>` (o id do time da carga inicial dos times, nunca o nome; o `size` nativo do card, com
 * ponto para meio ponto, sem zero à esquerda nem à direita), `rotulo` = uma das seis faixas de `TAMANHOS_REGUA`. Valor de size fora da régua, card sem size e time sem régua ficam sem
 * tamanho, contados, nunca M por omissão. A primeira carga e cada troca de linha são versão de critério (`afeta = ['O8']`) e pedem nova aprovação do dono.
 */
export const CAMPO_TAMANHO_REGUA = 'tamanho_regua';
/** `<time_id>:<size>`: id de 1 a 10 dígitos sem zero à esquerda; size inteiro sem zero à esquerda (ou 0) com fração opcional de até 3 casas sem zero à direita. */
export const CODIGO_TAMANHO_REGUA = /^[1-9]\d{0,9}:(?:0|[1-9]\d{0,3})(?:\.\d{0,2}[1-9])?$/;

/**
 * Lista POSITIVA dos `type` de campo customizado aceitos (A3 do modelo de ameaças): só seleção única. Pedido 105 (E7.86): o diagnóstico (`bm:diagnostico`, 2026-11-16) mostrou o
 * campo 48 "Causa Raiz" como `dropdown`; só esse tipo é aceito, com parecer de segurança. Campo de outro tipo é recusado na carga do arquivo.
 */
export const TIPOS_SELECAO_UNICA: readonly string[] = ['dropdown'];

const ID_CAMPO = /^\d{1,10}$/;
// Mesma regra de `textoSeguro` para o código lido do banco: sem controle, invisível, separador de linha nem arroba.
const CODIGO_SEGURO = /^[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}@]{1,80}$/u;

// E7.203: `value_id` (só dígitos) é a chave do casamento nos cards, que a API manda só com `values[].value_id`, sem rótulo. Opcional: campo sem `value_id` casa pelo rótulo.
const valorDominio = z.object({ codigo: textoSeguro(80), rotulo: textoSeguro(120), value_id: z.string().regex(ID_CAMPO).optional() }).strict();
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

// Só os motivos do BusinessMap (decisão B, 2026-11-16): nunca texto livre nem "não classificado" (que é a ausência de mapa). Vários `reason_id` podem levar ao mesmo motivo.
const valorMotivo = z.object({ codigo: z.string().regex(ID_CAMPO), rotulo: z.enum(MOTIVOS_BLOQUEIO) }).strict();

// Pedido 105 (E7.5): `coluna_id` (só dígitos) -> uma das 5 fases do briefing 4.4; nunca texto livre.
const valorFaseColuna = z.object({ codigo: z.string().regex(ID_CAMPO), rotulo: z.enum(FASES_DETECCAO) }).strict();

// Pedido 105 (E7.102): `<time_id>:<size>` -> uma das 6 faixas; nunca texto livre.
const valorTamanhoRegua = z.object({ codigo: z.string().regex(CODIGO_TAMANHO_REGUA), rotulo: z.enum(TAMANHOS_REGUA) }).strict();

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
    regra: textoSeguro(3000),
    campos: z.array(criarCampo(tipos)).max(40),
    motivo_bloqueio: z.array(valorMotivo).max(500).default([]),
    setores: z.array(valorSetor).max(50).default([]),
    prioridade_severidade: z.array(valorPrioridade).max(20).default([]),
    fase_deteccao_coluna: z.array(valorFaseColuna).max(2000).default([]),
    tamanho_regua: z.array(valorTamanhoRegua).max(1000).default([]),
  })
  .strict()
  .superRefine((d, ctx) => {
    const chavesDaRegua = new Set<string>();
    for (const [i, t] of d.tamanho_regua.entries()) {
      if (chavesDaRegua.has(t.codigo)) ctx.addIssue({ code: 'custom', path: ['tamanho_regua', i, 'codigo'], message: 'chave repetida' });
      chavesDaRegua.add(t.codigo);
    }
    const prioridades = new Set<string>();
    for (const [i, p] of d.prioridade_severidade.entries()) {
      if (prioridades.has(p.codigo)) ctx.addIssue({ code: 'custom', path: ['prioridade_severidade', i, 'codigo'], message: 'priority repetido' });
      prioridades.add(p.codigo);
    }
    const colunasDaFase = new Set<string>();
    for (const [i, c] of d.fase_deteccao_coluna.entries()) {
      if (colunasDaFase.has(String(Number(c.codigo)))) ctx.addIssue({ code: 'custom', path: ['fase_deteccao_coluna', i, 'codigo'], message: 'coluna repetida' });
      colunasDaFase.add(String(Number(c.codigo)));
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
      const valueIds = new Set<string>();
      for (const [j, v] of c.valores.entries()) {
        if (v.value_id !== undefined) {
          if (valueIds.has(String(Number(v.value_id)))) ctx.addIssue({ code: 'custom', path: ['campos', i, 'valores', j, 'value_id'], message: 'value_id repetido' });
          valueIds.add(String(Number(v.value_id)));
        }
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
  for (const c of a.campos) {
    listas[c.coluna] = c.valores.map((v) => ({ codigo: v.codigo, rotulo: v.rotulo }));
    // E7.203: uma lista `valor_id_<coluna>` por campo (mesmo vazia, para fechar o que saiu): value_id -> código do domínio.
    listas[`${PREFIXO_VALOR_ID}${c.coluna}`] = c.valores.flatMap((v) => (v.value_id === undefined ? [] : [{ codigo: String(Number(v.value_id)), rotulo: v.codigo }]));
  }
  listas[CAMPO_MOTIVO_BLOQUEIO] = a.motivo_bloqueio;
  listas[CAMPO_SETOR_QUADRO] = a.setores;
  listas[CAMPO_PRIORIDADE_SEVERIDADE] = a.prioridade_severidade;
  listas[CAMPO_FASE_DETECCAO_COLUNA] = a.fase_deteccao_coluna;
  listas[CAMPO_TAMANHO_REGUA] = a.tamanho_regua;
  return listas;
}

export const referenciaDaVersaoBm = (sha256: string): string => `069:ref-bm-campos:${sha256}`;

/** `recusados`: campos que mudaram e foram recusados, por data anterior à última vigência ou por vigência já aberta na data (K-383); só o nome do campo e a mensagem fixa, nunca valor. */
export interface ResultadoDominioBm { sha256: string; campos: number; inseridas: number; fechadas: number; versaoRegistrada: boolean; recusados: { campo: string; mensagem: string }[] }

/**
 * Lê as vigentes, planeja e grava numa transação só, por campo (K-383): campo igual fica como está; campo novo ou mudado grava; campo mudado recusado sozinho, por data anterior à última vigência do campo ou por vigência já aberta na data (mesma mensagem, listado em `recusados`) e os outros gravam; só INSERT de vigência nova e UPDATE de `vigente_ate`. Sem diferença nada é
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
    const plano = planejarDominio({ dominios: listas }, vigentes, hoje, new Map(ultimas.map((u) => [u.campo, u.ultima])), { porCampo: true });
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
    return { sha256: lido.sha256, campos: lido.arquivo.campos.length, inseridas: plano.inserir.length, fechadas: plano.fechar.length, versaoRegistrada, recusados: plano.recusados };
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
  const idsPorColuna = new Map<string, Map<string, string | null>>();
  for (const l of linhas) {
    // E7.203: `valor_id_<coluna>`: só `value_id` numérico e código seguro, nunca o reservado; `value_id` ligado a dois códigos é ignorado.
    if (l.campo.startsWith(PREFIXO_VALOR_ID) && colunas.includes(l.campo.slice(PREFIXO_VALOR_ID.length))) {
      if (!ID_CAMPO.test(l.codigo) || !CODIGO_SEGURO.test(l.rotulo) || l.rotulo === VALOR_DESCONHECIDO) continue;
      const col = l.campo.slice(PREFIXO_VALOR_ID.length);
      const id = String(Number(l.codigo));
      const m = idsPorColuna.get(col) ?? new Map<string, string | null>();
      m.set(id, m.has(id) && m.get(id) !== l.rotulo ? null : l.rotulo);
      idsPorColuna.set(col, m);
      continue;
    }
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
    // E7.203: o `value_id` só vale se o código existe na lista da coluna e não colide com um rótulo já no mapa.
    const codigos = new Set(dominio.values());
    for (const [valueId, codigo] of idsPorColuna.get(coluna) ?? []) if (codigo !== null && codigos.has(codigo) && !dominio.has(valueId)) dominio.set(valueId, codigo);
    if (dominio.size > 0) mapa.set(id, dominio);
  }
  return mapa;
}

/**
 * Leitura do mapa para o projetor (lote 4b), com a desconfiança do banco: só `reason_id` numérico e rótulo entre os motivos do BusinessMap; `reason_id` ligado a
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

/**
 * Leitura da tabela coluna -> fase para o projetor (pedido 105, E7.5), com a desconfiança do banco: só `coluna_id` numérico e rótulo entre as 5 fases; `coluna_id`
 * ligado a duas fases é ignorado (sem fase, nunca uma das duas). Sem entrada, nenhum bug tem fase. Nenhuma tradução no código: a tabela só vem do arquivo.
 */
export function fasesDeLinhas(linhas: readonly LinhaRefDominio[]): Map<string, FaseDeteccao> {
  const validos = FASES_DETECCAO as readonly string[];
  const por = new Map<string, FaseDeteccao | null>();
  for (const l of linhas) {
    if (l.campo !== CAMPO_FASE_DETECCAO_COLUNA || !ID_CAMPO.test(l.codigo) || !validos.includes(l.rotulo)) continue;
    const id = String(Number(l.codigo));
    por.set(id, por.has(id) && por.get(id) !== l.rotulo ? null : (l.rotulo as FaseDeteccao));
  }
  const mapa = new Map<string, FaseDeteccao>();
  for (const [id, f] of por) if (f !== null) mapa.set(id, f);
  return mapa;
}

/**
 * Leitura da régua de tamanho para o projetor (pedido 105, E7.102), com a desconfiança do banco: só código `<time_id>:<size>` na forma canônica e rótulo entre as 6 faixas;
 * chave ligada a duas faixas é ignorada (sem tamanho, nunca uma das duas). `times` é o conjunto de times que têm ao menos uma linha válida: time fora dele é "sem régua". Sem entrada
 * nenhum card tem tamanho. Nenhuma tradução no código: a régua só vem do arquivo.
 */
export function reguaDeLinhas(linhas: readonly LinhaRefDominio[]): ReguaTamanho {
  const validos = TAMANHOS_REGUA as readonly string[];
  const por = new Map<string, string | null>();
  for (const l of linhas) {
    if (l.campo !== CAMPO_TAMANHO_REGUA || !CODIGO_TAMANHO_REGUA.test(l.codigo) || !validos.includes(l.rotulo)) continue;
    por.set(l.codigo, por.has(l.codigo) && por.get(l.codigo) !== l.rotulo ? null : l.rotulo);
  }
  const faixas = new Map<string, string>();
  const times = new Set<string>();
  for (const [chave, faixa] of por) {
    if (faixa === null) continue;
    faixas.set(chave, faixa);
    times.add(chave.slice(0, chave.indexOf(':')));
  }
  return { faixas, times };
}
