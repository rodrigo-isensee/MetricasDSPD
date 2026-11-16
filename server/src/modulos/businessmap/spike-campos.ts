import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { criarClienteHttp, type ClienteHttp, type DepsHttp, type ErroBusinessMap } from '../../plataforma/http.js';
import { lerConfig } from './diagnostico.js';
import { foraDoRepositorio, prepararSaida } from './spike.js';
import { desembrulhar, linhasDeForma, somarForma, type Forma } from './spike-forma.js';

// Pedido 105, E7.172 (plano de campos, lote L0): spike SÓ de leitura (GET, cliente da F0 com a lista fechada de caminhos; nada é acrescentado a ela).
// (1) Para os campos 40 (Diretoria), 41 (Gerência), 49 e 50: a FORMA do valor e cada opção vista (value_id, rótulo, quantos cards) numa amostra
// de até 200 cards por quadro. As opções vistas aqui são só as da amostra.
// (1b) E7.179: o catálogo `/customFields/{id}` dos campos 40, 41, 48, 49 e 50 (value_id, rótulo, position), por lista de caminhos própria do spike.
// (2) Pelo `GET /tags`, as etiquetas cujo rótulo começa com "SISTEMA - " (tag_id, rótulo, quantos cards da amostra a usam).
// Privacidade: o relatório leva rótulo de opção e de etiqueta (texto escrito por pessoas, pode ter nome) e por isso vai SÓ para um arquivo 0600
// fora do clone, para o dono; o stdout leva apenas contagens e nunca rótulo. Nenhuma resposta bruta é gravada. Nada vai à base.

export const CAMPOS_SPIKE = ['40', '41', '49', '50'] as const;
/** Campos cujo catálogo de opções (`GET /customFields/{id}/allowedValues`) o spike lê (E7.179): os quatro acima e o 48 (Causa Raiz). */
export const CAMPOS_CATALOGO = ['40', '41', '48', '49', '50'] as const;
/** Lista de caminhos PRÓPRIA do spike (não entra na lista global do cliente): só esses cinco ids, sem consulta. */
export const CAMINHOS_CATALOGO: readonly RegExp[] = [/^\/customFields\/(40|41|48|49|50)\/allowedValues$/];
export const TETO_AMOSTRA = 200;
const POR_PAGINA = 100;
const TETO_PAGINAS_CATALOGO = 5;
const TETO_PAGINAS_TAGS = 50;
const FATAIS = new Set(['autenticacao', 'limite-requisicoes', 'limite-paginas', 'limite-bytes', 'configuracao']);

type Obj = Record<string, unknown>;
const ehObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const ehChave = (v: unknown): v is string | number => (typeof v === 'string' && v !== '') || (typeof v === 'number' && Number.isFinite(v));

/** Rótulo para o relatório: sem quebra de linha, barra vertical nem crase (não quebra a tabela), no máximo 80 caracteres. */
export const rotuloSeguro = (t: string): string => t.replace(/[\r\n|`]+/g, ' ').trim().slice(0, 80);

const forma = (t: string): string => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
/** Rótulo que começa com "SISTEMA - ", tolerante a caixa, acento, espaço e tipo de travessão. */
export const ehEtiquetaDeSistema = (rotulo: unknown): boolean => typeof rotulo === 'string' && /^sistema ?[-–—] ?\S/.test(forma(rotulo));

const idDeTag = (v: unknown): string | null =>
  typeof v === 'number' && Number.isInteger(v) && v > 0 ? String(v) : typeof v === 'string' && /^\d{1,10}$/.test(v) ? String(Number(v)) : null;

interface Opcao { rotulo: string; cards: Set<string> }
export interface AcumuloCampo {
  forma: Forma;
  /** Cards da amostra com o campo na lista `custom_fields`. */
  comEntrada: Set<string>;
  /** Cards da amostra com ao menos uma seleção. */
  preenchidos: Set<string>;
  opcoes: Map<string, Opcao>;
}
export interface AcumuloSpike {
  campos: Map<string, AcumuloCampo>;
  cardsLidos: Set<string>;
  cardsComEtiqueta: Set<string>;
  /** `tag_id` -> cards da amostra que o usam (todas as etiquetas; só as de sistema saem no relatório). */
  cardsPorTag: Map<string, Set<string>>;
}

export const novoAcumulo = (): AcumuloSpike => ({
  campos: new Map(CAMPOS_SPIKE.map((id) => [id, { forma: new Map(), comEntrada: new Set(), preenchidos: new Set(), opcoes: new Map() }])),
  cardsLidos: new Set(),
  cardsComEtiqueta: new Set(),
  cardsPorTag: new Map(),
});

/** Seleções de uma entrada de `custom_fields`: `values[]` (value_id e value) ou `value` escalar (id `(escalar)`). */
function selecoes(entrada: Obj): { id: string; rotulo: string }[] {
  const saida: { id: string; rotulo: string }[] = [];
  if (Array.isArray(entrada.values)) {
    for (const v of entrada.values) {
      if (ehObj(v)) {
        if (ehChave(v.value_id)) saida.push({ id: String(v.value_id), rotulo: typeof v.value === 'string' ? v.value : '' });
      } else if (ehChave(v)) saida.push({ id: '(item sem value_id)', rotulo: String(v) });
    }
  }
  if (ehChave(entrada.value)) saida.push({ id: '(escalar)', rotulo: String(entrada.value) });
  return saida;
}

/** Soma um card da amostra (deduplicado por `card_id`). Sem `card_id` inteiro o card é ignorado. */
export function somarCard(ac: AcumuloSpike, card: unknown): void {
  if (!ehObj(card) || typeof card.card_id !== 'number' || !Number.isInteger(card.card_id)) return;
  const id = String(card.card_id);
  if (ac.cardsLidos.has(id)) return;
  ac.cardsLidos.add(id);
  if (Array.isArray(card.custom_fields)) {
    for (const c of card.custom_fields) {
      if (!ehObj(c) || !ehChave(c.field_id)) continue;
      const campo = ac.campos.get(String(c.field_id));
      if (campo === undefined) continue;
      campo.comEntrada.add(id);
      somarForma(c, campo.forma);
      const sel = selecoes(c);
      if (sel.length > 0) campo.preenchidos.add(id);
      for (const s of sel) {
        const o = campo.opcoes.get(s.id) ?? { rotulo: s.rotulo, cards: new Set<string>() };
        if (o.rotulo === '' && s.rotulo !== '') o.rotulo = s.rotulo;
        o.cards.add(id);
        campo.opcoes.set(s.id, o);
      }
    }
  }
  if (Array.isArray(card.tag_ids) && card.tag_ids.length > 0) {
    ac.cardsComEtiqueta.add(id);
    for (const t of card.tag_ids) {
      const tid = idDeTag(ehObj(t) ? t.tag_id : t);
      if (tid === null) continue;
      const set = ac.cardsPorTag.get(tid) ?? new Set<string>();
      set.add(id);
      ac.cardsPorTag.set(tid, set);
    }
  }
}

export interface OpcaoCatalogo { valueId: string; rotulo: string; position: string }

const PROFUNDIDADE_CATALOGO = 4;

/** Primeira lista (busca em largura, até 4 níveis a partir do corpo) com algum objeto que tenha `value_id`. */
function listaComValueId(corpo: unknown): unknown[] | undefined {
  let nivel: unknown[] = [corpo];
  for (let prof = 0; prof <= PROFUNDIDADE_CATALOGO && nivel.length > 0; prof += 1) {
    const prox: unknown[] = [];
    for (const no of nivel) {
      if (Array.isArray(no)) {
        if (no.some((o) => ehObj(o) && ehChave(o.value_id))) return no;
        for (const filho of no) prox.push(filho);
      } else if (ehObj(no)) {
        for (const filho of Object.values(no)) prox.push(filho);
      }
    }
    nivel = prox;
  }
  return undefined;
}

/** Opções de `GET /customFields/{id}`: a lista com `value_id` em qualquer profundidade (até 4 níveis), seja qual for o envelope. */
export function opcoesDoCatalogo(corpo: unknown): OpcaoCatalogo[] {
  const lista = listaComValueId(corpo);
  if (lista === undefined) return [];
  const saida: OpcaoCatalogo[] = [];
  for (const o of lista) {
    if (!ehObj(o) || !ehChave(o.value_id)) continue;
    const rotulo = typeof o.value === 'string' ? o.value : typeof o.label === 'string' ? o.label : typeof o.name === 'string' ? o.name : '';
    saida.push({ valueId: String(o.value_id), rotulo, position: ehChave(o.position) ? String(o.position) : '' });
  }
  return saida;
}

/** Forma da resposta do catálogo de um campo (só chaves, tipos e contagens; nenhum valor), para o stdout. */
export function linhasFormaCatalogo(id: string, corpo: unknown): string[] {
  return [`Forma da resposta do campo ${id}:`, ...linhasDeForma(somarForma(corpo))];
}

export interface EtiquetaSistema { tagId: string; rotulo: string; cards: number }

/** Etiquetas de sistema do catálogo, com o número de cards da amostra que as usam, ordenadas por rótulo. */
export function etiquetasDeSistema(catalogo: readonly unknown[], ac: AcumuloSpike): EtiquetaSistema[] {
  const vistas = new Set<string>();
  const saida: EtiquetaSistema[] = [];
  for (const t of catalogo) {
    if (!ehObj(t)) continue;
    const tagId = idDeTag(t.tag_id);
    if (tagId === null || vistas.has(tagId) || !ehEtiquetaDeSistema(t.label)) continue;
    vistas.add(tagId);
    saida.push({ tagId, rotulo: rotuloSeguro(String(t.label)), cards: ac.cardsPorTag.get(tagId)?.size ?? 0 });
  }
  return saida.sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt') || Number(a.tagId) - Number(b.tagId));
}

const NOME_CAMPO: Record<string, string> = { '40': 'Diretoria', '41': 'Gerência', '49': 'Origem da Demanda', '50': 'Objetivo Estratégico' };

/** Relatório completo, COM rótulo (só para o dono, arquivo fora do clone). */
export function renderizarRelatorio(ac: AcumuloSpike, etiquetas: readonly EtiquetaSistema[], quadros: readonly number[], geradoEm: string, avisos: readonly string[], catalogos: ReadonlyMap<string, readonly OpcaoCatalogo[]> = new Map()): string {
  const linhas: string[] = [
    '# Spike dos campos 40, 41, 49 e 50 e das etiquetas SISTEMA (E7.172, L0)',
    '',
    `Gerado em ${geradoEm}. Quadros: ${quadros.join(', ')}. Amostra: até ${TETO_AMOSTRA} cards ativos por quadro; cards distintos lidos: ${ac.cardsLidos.size}. Só para o dono: tem rótulo escrito por pessoas, nunca vai à base nem ao repositório.`,
    '',
  ];
  for (const id of CAMPOS_SPIKE) {
    const c = ac.campos.get(id)!;
    linhas.push(`## Campo ${id} (${NOME_CAMPO[id]})`, '', `Cards com o campo na lista: ${c.comEntrada.size}. Com seleção: ${c.preenchidos.size}. Opções distintas: ${c.opcoes.size}.`, '', 'Forma do valor (só chaves, tipos e contagens):', '');
    linhas.push(...(c.forma.size > 0 ? linhasDeForma(c.forma) : ['(campo não apareceu em nenhum card da amostra)']), '', '| value_id | Rótulo | Cards |', '|---|---|---|');
    const ops = [...c.opcoes.entries()].sort((a, b) => b[1].cards.size - a[1].cards.size || a[0].localeCompare(b[0], 'en', { numeric: true }));
    linhas.push(...ops.map(([vid, o]) => `| ${rotuloSeguro(vid)} | ${rotuloSeguro(o.rotulo)} | ${o.cards.size} |`), '');
  }
  linhas.push('## Catálogo de opções dos campos (GET /customFields/{id}/allowedValues, E7.179)', '');
  for (const id of CAMPOS_CATALOGO) {
    const ops = catalogos.get(id);
    linhas.push(`### Campo ${id}`, '');
    if (ops === undefined) linhas.push('(catálogo não lido; ver avisos)', '');
    else linhas.push(`Opções: ${ops.length}.`, '', '| value_id | Rótulo | position |', '|---|---|---|', ...ops.map((o) => `| ${rotuloSeguro(o.valueId)} | ${rotuloSeguro(o.rotulo)} | ${rotuloSeguro(o.position)} |`), '');
  }
  linhas.push(
    '## Etiquetas SISTEMA - (GET /tags)', '',
    `Cards da amostra com alguma etiqueta: ${ac.cardsComEtiqueta.size}. Etiquetas de sistema no catálogo: ${etiquetas.length}.`, '',
    '| tag_id | Rótulo | Cards |', '|---|---|---|',
    ...etiquetas.map((e) => `| ${e.tagId} | ${e.rotulo} | ${e.cards} |`), '',
    '## Avisos', '', ...(avisos.length > 0 ? avisos.map((a) => `- ${a}`) : ['(nenhum)']), '',
  );
  return linhas.join('\n');
}

/** Resumo para o stdout: só contagens, sem rótulo, sem value_id e sem tag_id. */
export function renderizarResumo(ac: AcumuloSpike, etiquetas: readonly EtiquetaSistema[], avisos: readonly string[], catalogos: ReadonlyMap<string, readonly OpcaoCatalogo[]> = new Map()): string {
  return [
    `Cards distintos lidos: ${ac.cardsLidos.size}.`,
    ...CAMPOS_SPIKE.map((id) => {
      const c = ac.campos.get(id)!;
      return `Campo ${id}: ${c.comEntrada.size} cards com o campo, ${c.preenchidos.size} com seleção, ${c.opcoes.size} opções distintas.`;
    }),
    `Cards com alguma etiqueta: ${ac.cardsComEtiqueta.size}. Etiquetas SISTEMA - no catálogo: ${etiquetas.length}, usadas na amostra: ${etiquetas.filter((e) => e.cards > 0).length}.`,
    ...CAMPOS_CATALOGO.map((id) => `Catálogo do campo ${id}: ${catalogos.get(id)?.length ?? 'não lido'} opções.`),
    `Avisos: ${avisos.length}.`,
  ].join('\n');
}

export interface DepsSpikeCampos extends DepsHttp {
  env: Record<string, string | undefined>;
  /** Diretório do usuário (fora do clone) onde fica o relatório com rótulo. */
  dirSaida: string;
  raizRepositorio: string;
}
export interface ResultadoSpikeCampos { codigo: number; saida: string; erro: string }

/** Roda o spike dos campos e das etiquetas de sistema. Só GET; o relatório com rótulo vai ao arquivo, o resumo sem rótulo ao stdout. */
export async function executarSpikeCampos(deps: DepsSpikeCampos): Promise<ResultadoSpikeCampos> {
  let dir: string;
  let quadros: number[];
  let cliente: ClienteHttp;
  let apikey: string;
  try {
    const cfg = lerConfig(deps.env);
    if (cfg.quadrosIds === undefined) throw new Error('variável obrigatória ausente: BUSINESSMAP_QUADROS_IDS');
    quadros = [...new Set(cfg.quadrosIds)];
    apikey = cfg.apikey;
    dir = foraDoRepositorio(deps.dirSaida, deps.raizRepositorio);
    await prepararSaida(dir);
    cliente = criarClienteHttp({ urlBase: cfg.urlBase, apikey, limitePorMinuto: cfg.limitePorMinuto, timeoutMs: cfg.timeoutMs, caminhosExtras: CAMINHOS_CATALOGO }, deps);
  } catch (e) {
    return { codigo: 2, saida: '', erro: (e as Error).message };
  }
  const limpar = (t: string): string => t.split(apikey).join('[redigido]');
  const avisos: string[] = [];
  const ac = novoAcumulo();

  const ler = async (rotulo: string, caminho: string, consulta: Record<string, string | number>): Promise<unknown> => {
    try {
      return await cliente.get(caminho, { consulta });
    } catch (e) {
      const erro = e as ErroBusinessMap;
      if (FATAIS.has(erro.tipo)) throw erro;
      avisos.push(limpar(`${rotulo}: ${erro.tipo}: ${erro.message}`));
      return undefined;
    }
  };

  try {
    for (const q of quadros) {
      let lidos = 0;
      let paginas = 1;
      for (let pagina = 1; pagina <= paginas && lidos < TETO_AMOSTRA; pagina += 1) {
        const corpo = await ler(`quadro-${q}-cards-p${pagina}`, '/cards', {
          board_ids: String(q), state: 'active', per_page: POR_PAGINA, page: pagina, expand: 'custom_fields,tag_ids',
        });
        if (corpo === undefined) break;
        const d = desembrulhar(corpo);
        paginas = d.paginas ?? 1;
        for (const card of d.itens) {
          if (lidos >= TETO_AMOSTRA) break;
          lidos += 1;
          somarCard(ac, card);
        }
        if (d.itens.length === 0) break;
      }
    }
    const catalogo: unknown[] = [];
    let total = 1;
    for (let pagina = 1; pagina <= total && pagina <= TETO_PAGINAS_TAGS; pagina += 1) {
      const corpo = await ler(`tags-p${pagina}`, '/tags', pagina === 1 ? {} : { page: pagina });
      if (corpo === undefined) break;
      const d = desembrulhar(corpo);
      for (const item of d.itens) catalogo.push(item);
      total = d.paginas ?? 1;
    }
    if (total > TETO_PAGINAS_TAGS) avisos.push(`tags: a API declara ${total} páginas; lidas ${TETO_PAGINAS_TAGS}`);
    const catalogos = new Map<string, OpcaoCatalogo[]>();
    const formas: string[] = [];
    for (const id of CAMPOS_CATALOGO) {
      const caminho = `/customFields/${id}/allowedValues`;
      const corpo = await ler(`catalogo-campo-${id}`, caminho, {});
      if (corpo === undefined) continue;
      const ops = opcoesDoCatalogo(corpo);
      const paginasCampo = desembrulhar(corpo).paginas ?? 1;
      for (let pagina = 2; pagina <= paginasCampo && pagina <= TETO_PAGINAS_CATALOGO; pagina += 1) {
        const mais = await ler(`catalogo-campo-${id}-p${pagina}`, caminho, { page: pagina });
        if (mais === undefined) break;
        for (const o of opcoesDoCatalogo(mais)) ops.push(o);
      }
      if (paginasCampo > TETO_PAGINAS_CATALOGO) avisos.push(`catalogo-campo-${id}: a API declara ${paginasCampo} páginas; lidas ${TETO_PAGINAS_CATALOGO}`);
      catalogos.set(id, ops);
      for (const l of linhasFormaCatalogo(id, corpo)) formas.push(l);
    }
    const etiquetas = etiquetasDeSistema(catalogo, ac);
    const agora = new Date((deps.agora ?? Date.now)()).toISOString();
    const arquivo = join(dir, 'relatorio-campos-sistemas.md');
    await writeFile(arquivo, renderizarRelatorio(ac, etiquetas, quadros, agora, avisos, catalogos), { flag: 'wx', mode: 0o600 });
    return { codigo: 0, saida: `${renderizarResumo(ac, etiquetas, avisos, catalogos)}\n${formas.join('\n')}\nRelatório (com rótulo, só para o dono) em: ${arquivo}`, erro: '' };
  } catch (e) {
    const erro = e as ErroBusinessMap;
    return { codigo: 1, saida: '', erro: limpar(`${erro.tipo ?? 'erro'}: ${erro.message}`) };
  }
}
