import {
  CALENDARIO_PADRAO, dataIso, instanteDeIso, ordenarNeutro,
} from '@metricas-dspd/metricas/core';
import { derivarMarcos, direcaoDaTransicao, type ColunaDoPasso, type Passo } from '@metricas-dspd/metricas/businessmap';
import { CLASSES_SERVICO, TIPO_DA_CATEGORIA, type CategoriaTipoCard, type FaseDeteccao } from '@metricas-dspd/contratos';
import { COLUNAS_LISTA, VALOR_DESCONHECIDO } from './allow-list.js';
import { vigenteEm } from './referencia.js';

// F4 do plano 052 (K-182): normalizador do BusinessMap. Funções puras do registro do staging (já filtrado pela allow-list) e da
// referência vigente em cada instante (ADR 0016, U-1 e U-2) para a linha de `dim_card`, os fatos de transição e os eventos do card.
// Nada aqui lê banco, pessoa nem campo livre além do título; marcos e direção vêm só da biblioteca (T2.5). Responsável não passa por aqui.

/**
 * Suposição registrada (plano 052, F4): texto de data e hora sem fuso vindo do BusinessMap vale UTC, como o `Z` das datas do card.
 * A leitura real das transições confirma ou troca esta constante num lugar só.
 */
export const FUSO_PADRAO_BM = '+00:00';

const ISO = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2})?)(?:\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;

/** Instante em epoch ms (pela função de calendário da biblioteca) ou `null` se o texto não tiver a forma de data e hora. */
export function instanteDoBm(texto: unknown): number | null {
  if (typeof texto !== 'string') return null;
  const m = ISO.exec(texto);
  if (m === null) return null;
  const fuso = m[3] === undefined ? FUSO_PADRAO_BM : m[3] === 'Z' ? '+00:00' : m[3]; // `Z` explícito é sempre UTC; a constante só vale sem fuso
  const [, dia, hora] = m as unknown as [string, string, string];
  const [mes, d] = [Number(dia.slice(5, 7)), Number(dia.slice(8, 10))];
  if (mes < 1 || mes > 12 || d < 1 || d > 31 || Number(hora.slice(0, 2)) > 23 || Number(hora.slice(3, 5)) > 59) return null;
  return instanteDeIso(`${dia}T${hora}${fuso}`, CALENDARIO_PADRAO);
}

// ADR 0024: `dim_card.tipo` guarda o rótulo do contrato (TIPO_DA_CATEGORIA), nunca o código da categoria.
/** Dia civil (AAAA-MM-DD) no fuso do calendário (-03:00): a resolução da vigência (ADR 0016). */
export const diaDe = (ms: number): string => dataIso(ms, CALENDARIO_PADRAO);

/* ---------- referência no tempo ---------- */

interface Versao { vigente_de: string; vigente_ate?: string | null; motivo?: string | null }
export type LinhaColuna = Versao & {
  quadro_id: string; coluna_id: string; workflow_id: string | null; section: number | null; eh_descarte: boolean; papel: string | null;
  tipo_coluna: string | null; ordem: number | null;
};
export type LinhaWorkflow = Versao & { quadro_id: string; workflow_id: string; nivel: string };
export type LinhaTimeWorkflow = Versao & { workflow_id: string; time_id: number | null; situacao: string };
export type LinhaTime = Versao & { time_id: number; nome: string };
export type LinhaTipo = Versao & { tipo_id: string; eh_item: boolean; categoria: string | null };

/** Régua de tamanho (105, E7.102): `faixas` = `<time_id>:<size>` -> faixa; `times` = os times que têm régua (um time fora dele é "sem régua"). */
export interface ReguaTamanho { faixas: ReadonlyMap<string, string>; times: ReadonlySet<string> }

/** A referência inteira, com todas as vigências, em memória (ADR 0016: sem JOIN por instante no SQL do caminho quente). */
export interface Referencia {
  colunas: ReadonlyMap<string, readonly LinhaColuna[]>;
  workflows: ReadonlyMap<string, readonly LinhaWorkflow[]>;
  timesDoWorkflow: ReadonlyMap<string, readonly LinhaTimeWorkflow[]>;
  times: ReadonlyMap<string, readonly LinhaTime[]>;
  tipos: ReadonlyMap<string, readonly LinhaTipo[]>;
  /** `field_id` -> coluna de lista de `dim_card` (L2-b, `ref_dominio campo = 'campo_customizado'`); vazio = nenhuma coluna de lista é preenchida. */
  camposLista: ReadonlyMap<string, string>;
  /** `priority` do card -> severidade (C8a, `ref_dominio campo = 'prioridade_severidade'`); ausente ou vazio = nenhuma severidade é projetada. */
  prioridades?: ReadonlyMap<string, string>;
  /** `coluna_id` -> fase de detecção do bug (105, `ref_dominio campo = 'fase_deteccao_coluna'`); vazio ou ausente = nenhum bug tem fase. Usado pela projeção da fase, depois dos cards. */
  fasesDeteccao?: ReadonlyMap<string, FaseDeteccao>;
  /** Régua de tamanho por time (105, E7.102, `ref_dominio campo = 'tamanho_regua'`); vazia ou ausente = nenhum card tem tamanho. */
  reguaTamanho?: ReguaTamanho;
}

export function agrupar<T>(linhas: readonly T[], chave: (l: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const l of linhas) m.set(chave(l), [...(m.get(chave(l)) ?? []), l]);
  return m;
}

/**
 * Versão vigente no dia (U-1: correção vale desde o início da versão que corrige). Dia anterior à primeira versão conhecida usa a
 * primeira (a referência mais antiga que existe; contada à parte em `referencia_anterior`): sem isso o card aberto há mais tempo que
 * a carga ficaria fora de todo cálculo.
 */
export function noDia<T extends Versao>(versoes: readonly T[] | undefined, dia: string, notas: string[]): T | undefined {
  if (versoes === undefined || versoes.length === 0) return undefined;
  const v = vigenteEm(versoes, dia);
  if (v !== undefined) return v;
  notas.push('referencia_anterior');
  return ordenarNeutro(versoes, (x) => [x.vigente_de])[0];
}

/* ---------- entrada e saída ---------- */

export interface TransicaoStg {
  /** Coluna de destino (`column_id`). */
  coluna: string;
  quadro: string | null;
  workflow: string | null;
  inicio: number;
}

export interface EntradaCard {
  id: string;
  /** Registro do `stg_card` (allow-list 4a). */
  card: Record<string, unknown>;
  coletadoEm: Date;
  excluidoDetectado: boolean;
  transicoes: readonly TransicaoStg[];
  /** `type_id` do pai quando o pai está no staging; ausente = pai não coletado. */
  tipoDoPai: (id: string) => string | undefined;
}

export interface LinhaDimCard {
  card_id: string; tipo: string | null; card_pai: string | null; criado_em: Date; comprometido_em: Date | null;
  iniciado_em: Date | null; concluido_em: Date | null; arquivado_em: Date | null; motivo_descarte: string | null;
  titulo: string | null; granularidade: string | null; equipe: string | null; quadro_id: string | null;
  coluna_atual_id: string | null; excluido_em: Date | null;
  classe_servico: string | null; sistema: string | null; area_solicitante: string | null; fornecedor: string | null; objetivo_estrategico: string | null;
  tamanho_declarado: string | null; responsabilidade_atraso: string | null; origem_demanda: string | null; fase_deteccao: string | null; severidade: string | null;
  /** Causa raiz do bug do fluxo (campo 48 do BusinessMap, dropdown; código do `ref_dominio`); nula sem o campo ou com valor fora da lista (pedido 105, E7.86). */
  causa_raiz: string | null;
  /** Prazo nativo do card (`deadline`), dia civil `AAAA-MM-DD`; nulo se ausente ou fora da forma (099-o12-deadline §2). */
  data_acordada: string | null;
  /** Entrega a que o bug pertence pelo vínculo do BusinessMap (pai e filho ou relacionado); nulo fora de bug ou sem vínculo com entrega (pedido 105, O18). */
  origem_bug: string | null;
}

/**
 * Pedido 105 (E7.3, ADR 0020 4i): classe de serviço pela chave `classes_tag` do staging (classes das etiquetas do card, já reduzidas na fronteira).
 * Sem a chave: nula (`classe_nao_lida`); lista vazia: nula (`classe_sem_tag`, nunca Padrão por omissão, Q-099-9); uma classe: ela; duas ou mais
 * classes diferentes: nula (`classe_tag_empate`), o sistema não escolhe. Nota = contagem, nunca o valor.
 */
export function classeDeServicoDasTags(card: Record<string, unknown>, notas: string[]): string | null {
  const v = card.classes_tag;
  if (!Array.isArray(v)) { notas.push('classe_nao_lida'); return null; }
  const classes = [...new Set(v.filter((c): c is string => typeof c === 'string' && (CLASSES_SERVICO as readonly string[]).includes(c)))];
  if (classes.length === 0) { notas.push('classe_sem_tag'); return null; }
  if (classes.length > 1) { notas.push('classe_tag_empate'); return null; }
  return classes[0]!;
}

const COLUNAS_LISTA_NULAS = Object.fromEntries(COLUNAS_LISTA.map((c) => [c, null])) as Record<(typeof COLUNAS_LISTA)[number], null>;

/**
 * L2-b: colunas de lista a partir de `custom_fields` do staging (`{ field_id, valor: código }`, já reduzido pela allow-list). Só preenche coluna do enum
 * e campo do mapa; `desconhecido` (ou valor que não é texto) vira `null` com a nota `campo_fora_do_dominio` (contagem, nunca o valor). Sem mapa, tudo nulo.
 */
export function colunasDeLista(card: Record<string, unknown>, mapa: ReadonlyMap<string, string>, notas: string[]): Record<(typeof COLUNAS_LISTA)[number], string | null> {
  const r: Record<(typeof COLUNAS_LISTA)[number], string | null> = { ...COLUNAS_LISTA_NULAS };
  if (mapa.size === 0 || !Array.isArray(card.custom_fields)) return r;
  for (const c of card.custom_fields as unknown[]) {
    const v = c as { field_id?: unknown; valor?: unknown } | null;
    if (v === null || typeof v !== 'object') continue;
    const id = texto(v.field_id);
    const coluna = id === null ? undefined : mapa.get(id);
    if (coluna === undefined || !(COLUNAS_LISTA as readonly string[]).includes(coluna)) continue;
    const valor = typeof v.valor === 'string' && v.valor !== '' && v.valor !== VALOR_DESCONHECIDO ? v.valor.slice(0, 80) : null;
    if (valor === null) notas.push('campo_fora_do_dominio');
    r[coluna as (typeof COLUNAS_LISTA)[number]] = valor;
  }
  return r;
}
export interface FatoTransicaoProjetado {
  card_id: string; quadro_id: string | null; coluna_origem_id: string | null; coluna_destino_id: string; tipo_coluna: 'fila' | 'execucao' | null;
  direcao: 'avanco' | 'retorno'; id_origem: string; ocorrido_em: Date;
}
export interface EventoCard { card_id: string; tipo: 'criado' | 'arquivado' | 'excluido_detectado'; ocorrido_em: Date }
export interface CardProjetado { dim: LinhaDimCard; transicoes: FatoTransicaoProjetado[]; eventos: EventoCard[]; notas: string[] }

const NIVEL_PARA_GRANULARIDADE: Record<string, string> = { projeto: 'projeto', feature: 'frente', story: 'story' };
const texto = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : typeof v === 'number' && Number.isFinite(v) ? String(v) : null);
/**
 * Fuso em que o instante do `deadline` vira dia civil. A Q-RO-6c mostrou que as 1639 stories com prazo trazem data e hora, e em qual dia
 * uma hora cai é regra. Decisão do dono de 2026-11-15 (L13, opção c): prazo com data e hora vira o dia de Brasília neste fuso, EXCETO
 * meia-noite UTC em ponto (`00:00:00Z`), que fica no dia gravado (o BusinessMap grava o prazo só-data como meia-noite UTC; converter
 * o recuaria um dia). Mudar o critério muda esta constante ou a exceção e vira versão de critério (T2.6).
 */
export const FUSO_DO_PRAZO = 'America/Sao_Paulo';
const diaCivilNoFuso = new Intl.DateTimeFormat('en-CA', { timeZone: FUSO_DO_PRAZO, year: 'numeric', month: '2-digit', day: '2-digit' });
const SO_DATA = /^\d{4}-\d{2}-\d{2}$/;
// Data e hora ISO 8601 com deslocamento explícito (Z ou ±HH:MM). Sem deslocamento o instante é ambíguo e não se supõe um.
const DATA_E_HORA = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,9})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;
/**
 * Parse estrito do `deadline` (099-o12-deadline §2): `AAAA-MM-DD` (o dia é gravado como está, data civil) ou data e hora ISO com
 * deslocamento explícito (o instante vira o dia civil em `FUSO_DO_PRAZO`, exceto `00:00:00Z` em ponto, que fica no dia gravado). Ano >= 0001 (o PostgreSQL não tem ano 0), mês e dia válidos.
 * Texto, número, data e hora sem deslocamento ou data impossível viram `null` com a nota `deadline_fora_da_forma` (contagem; o valor nunca vai a log nem a tabela).
 */
export function dataAcordada(valor: unknown, notas: string[]): string | null {
  if (valor === undefined || valor === null) return null;
  if (typeof valor === 'string') {
    const dia = SO_DATA.test(valor) ? valor : (DATA_E_HORA.exec(valor)?.[1] ?? null);
    // Ano 0000: o Date do JS aceita, o `date` do PostgreSQL não (abortaria o INSERT do lote inteiro); exige ano >= 1.
    const base = dia === null ? null : new Date(`${dia}T00:00:00Z`);
    const valido = dia !== null && base !== null && !Number.isNaN(base.getTime()) && !dia.startsWith('0000') && base.toISOString().slice(0, 10) === dia;
    if (valido && dia === valor) return valor;
    if (valido) {
      const instante = new Date(valor);
      // L13 (c): meia-noite UTC em ponto (sufixo Z, hora zero, fração zero) é prazo só-data gravado como instante; fica no dia gravado.
      if (valor.endsWith('Z') && instante.getTime() % 86_400_000 === 0) return dia;
      // O regex e a data civil já garantem um instante válido (ano 0001 a 9999, deslocamento até 23:59), então `format` não lança.
      // Ano 0001 com deslocamento negativo cairia no ano 0 e o limite superior no ano 10000: o Intl os escreve sem os quatro dígitos
      // ("1-12-31", "10000-01-01"), e o `date` do PostgreSQL não os guarda; a forma AAAA-MM-DD de quatro dígitos é a guarda.
      const civil = diaCivilNoFuso.format(instante);
      if (SO_DATA.test(civil)) return civil;
    }
  }
  notas.push('deadline_fora_da_forma');
  return null;
}
/**
 * C8a: severidade pelo `priority` nativo e o mapa versionado (1 Critical a 4 Low, decrescente). Sem mapa: `undefined` (a coluna fica como a lista a deixou).
 * `priority` nulo ou ausente: `null` (Sem severidade, Q-099-33 recomendação A: o valor não foi gravado; não se supõe Average). Valor fora do mapa
 * (por exemplo acima de 4): `null` com a nota `priority_fora_do_mapa` (contagem; o valor nunca vai a log nem a tabela); a regra "acima de 4 = Low" da ferramenta não se aplica.
 */
export function severidadeDaPrioridade(valor: unknown, mapa: ReadonlyMap<string, string> | undefined, notas: string[]): string | null | undefined {
  if (mapa === undefined || mapa.size === 0) return undefined;
  if (valor === undefined || valor === null) return null;
  const chave = typeof valor === 'number' && Number.isInteger(valor) ? String(valor) : typeof valor === 'string' && /^[1-9]\d{0,2}$/.test(valor) ? valor : null;
  const sev = chave === null ? undefined : mapa.get(chave);
  if (sev === undefined) notas.push('priority_fora_do_mapa');
  return sev ?? null;
}
/**
 * Pedido 105 (E7.102): tamanho do card = faixa (PP, P, M, G, GG, XG) da régua do time do card para o `size` nativo. O `size` vem do staging (já na allow-list); o time é o
 * do workflow do card no dia do evento (a mesma resolução da equipe). Sem `size` (nulo, vazio ou 0), `size` fora da régua e time sem régua: `null` (sem tamanho) com a nota respectiva (`size_sem_valor`,
 * `size_fora_da_regua`, `time_sem_regua`; só contagem, nunca o valor); nunca M por omissão. Régua vazia ou ausente: `null` sem nota (nada foi aprovado ainda).
 * O `size` vale só se for número finito não negativo (ou texto numérico na mesma forma); `1.50` e `1.5` são a mesma chave.
 */
export function tamanhoPelaRegua(size: unknown, timeId: number | null, regua: ReguaTamanho | undefined, notas: string[]): string | null {
  if (regua === undefined || regua.faixas.size === 0) return null;
  const numero = typeof size === 'number' ? size : typeof size === 'string' && /^\d{1,4}(\.\d{1,3})?$/.test(size) ? Number(size) : NaN;
  if (size === null || size === undefined || size === '' || numero === 0) { notas.push('size_sem_valor'); return null; }
  if (timeId === null || !regua.times.has(String(timeId))) { notas.push('time_sem_regua'); return null; }
  const faixa = Number.isFinite(numero) && numero >= 0 ? regua.faixas.get(`${timeId}:${numero}`) : undefined;
  if (faixa === undefined) notas.push('size_fora_da_regua');
  return faixa ?? null;
}
const data = (ms: number | null): Date | null => (ms === null ? null : new Date(ms));

function colunaDoPasso(ref: Referencia, quadro: string | null, coluna: string, dia: string, notas: string[]): { passo: ColunaDoPasso; tipo: 'fila' | 'execucao' | null } | undefined {
  const c = quadro === null ? undefined : noDia(ref.colunas.get(`${quadro}|${coluna}`), dia, notas);
  if (c === undefined) return undefined;
  const tipo = c.tipo_coluna === 'fila' || c.tipo_coluna === 'execucao' ? c.tipo_coluna : null;
  return {
    tipo,
    passo: {
      section: c.section, papel: (c.papel as ColunaDoPasso['papel']) ?? null, tipo_coluna: tipo, eh_descarte: c.eh_descarte, ordem: c.ordem,
      workflow: c.workflow_id,
    },
  };
}

/** Vínculos que ligam um bug à entrega (decisão do dono, O18 = c): pai e filho (a entrega é o pai do bug) e relacionado (`relative`). */
const VINCULOS_BUG_ENTREGA: readonly string[] = ['parent', 'relative'];
const CATEGORIAS_DE_BUG: readonly string[] = ['bug_interno', 'defeito_producao'];

/**
 * Pedido 105 (O18): entrega do bug pelos vínculos do próprio bug. Só card de tipo bug tem origem; vale vínculo `parent` ou `relative` com um card
 * item que não seja bug (vínculo de bug com bug não liga a entrega; card ligado fora do staging ou de tipo sem referência não vale, sem palpite).
 * Várias entregas: a de menor id, contada em `varias_entregas_bug`; bug sem entrega ligada: nulo, contado em `bug_sem_entrega`. Só o id do card, nunca texto.
 */
function origemDoBug(e: EntradaCard, tipoRef: LinhaTipo | undefined, ref: Referencia, criado: number, notas: string[]): string | null {
  if (tipoRef?.eh_item !== true || !CATEGORIAS_DE_BUG.includes(tipoRef.categoria ?? '')) return null;
  const candidatas = Array.isArray(e.card.linked_cards)
    ? [...new Set((e.card.linked_cards as unknown[]).flatMap((l) => {
      const v = l as { card_id?: unknown; link_type?: unknown } | null;
      const id = v !== null && typeof v === 'object' && typeof v.link_type === 'string' && VINCULOS_BUG_ENTREGA.includes(v.link_type) ? texto(v.card_id) : null;
      if (id === null || id === e.id) return [];
      const tipo = e.tipoDoPai(id);
      const t = tipo === undefined ? undefined : noDia(ref.tipos.get(tipo), diaDe(criado), notas);
      return t?.eh_item === true && !CATEGORIAS_DE_BUG.includes(t.categoria ?? '') ? [id] : [];
    }))].sort((a, b) => Number(a) - Number(b))
    : [];
  if (candidatas.length > 1) notas.push('varias_entregas_bug');
  if (candidatas.length === 0) notas.push('bug_sem_entrega');
  return candidatas[0] ?? null;
}

/**
 * Normaliza um card. `null` = o card não tem data de criação utilizável (nada é inventado: fica só no staging, contado em quem chama).
 * Decisões H aplicadas aqui: granularidade e equipe pelo instante do evento medido (H-1, U-2), Sprint e tipo sem referência fora (H-2),
 * workflow fora (H-7) sem granularidade nem equipe, marcos pela biblioteca (H-9, H-10, H-11, H-23), categoria pelo tipo (H-17), pai pelo
 * vínculo pai e filho nativo (pai Sprint não vale, H-2).
 */
export function projetarCard(e: EntradaCard, ref: Referencia): CardProjetado | null {
  const criado = instanteDoBm(e.card.created_at);
  if (criado === null) return null;
  const notas: string[] = [];
  const quadro = texto(e.card.board_id);
  const ordenadas = ordenarNeutro(e.transicoes, (t) => [t.inicio, t.coluna]);

  const contextos = ordenadas.map((t) => colunaDoPasso(ref, t.quadro ?? quadro, t.coluna, diaDe(t.inicio), notas));
  const passos: Passo[] = ordenadas.map((t, i) => ({ ocorrido_em: t.inicio, coluna: contextos[i]?.passo }));
  const marcos = derivarMarcos(passos);

  const transicoes = ordenadas.map((t, i): FatoTransicaoProjetado => ({
    card_id: e.id, quadro_id: t.quadro ?? quadro, coluna_origem_id: i === 0 ? null : ordenadas[i - 1]!.coluna, coluna_destino_id: t.coluna,
    tipo_coluna: contextos[i]?.tipo ?? null, direcao: direcaoDaTransicao(i === 0 ? undefined : contextos[i - 1]?.passo, contextos[i]?.passo),
    id_origem: `${e.id}:${t.coluna}:${t.inicio}`, ocorrido_em: new Date(t.inicio),
  }));

  // descarte: o instante do descarte nativo ou da entrada em "Descartado" (H-11); a biblioteca lê descarte como motivo mais arquivamento
  const nativo = instanteDoBm(e.card.discarded_at);
  const porColuna = marcos.descartado_em;
  const descartadoEm = nativo !== null && (porColuna === null || nativo <= porColuna) ? nativo : porColuna;
  const motivo = descartadoEm === null ? null : descartadoEm === nativo ? 'descarte_nativo' : 'coluna_descartado';
  const arquivadoNativo = instanteDoBm(e.card.archived_at);

  // instante do evento medido (U-2): a entrega; sem entrega, a última entrada; sem transição, a criação
  const instante = marcos.concluido_em ?? ordenadas[ordenadas.length - 1]?.inicio ?? criado;
  const passoDoEvento = ordenadas.find((t) => t.inicio === instante);
  const workflow = passoDoEvento?.workflow ?? texto(e.card.workflow_id);
  const quadroDoEvento = passoDoEvento?.quadro ?? quadro;
  const dia = diaDe(instante);

  const tipoRef = noDia(ref.tipos.get(texto(e.card.type_id) ?? ''), dia, notas);
  if (tipoRef === undefined) notas.push('tipo_sem_referencia');
  const eItem = tipoRef?.eh_item === true;
  if (tipoRef !== undefined && !eItem) notas.push('nao_item');

  const nivel = workflow === null || quadroDoEvento === null ? undefined : noDia(ref.workflows.get(`${quadroDoEvento}|${workflow}`), dia, notas)?.nivel;
  const time = workflow === null ? undefined : noDia(ref.timesDoWorkflow.get(workflow), dia, notas);
  const equipe = time?.situacao === 'time' && time.time_id !== null ? noDia(ref.times.get(String(time.time_id)), dia, notas)?.nome ?? null : null;
  if (time === undefined) notas.push('workflow_sem_time');
  if (time?.situacao === 'fora') notas.push('workflow_fora');
  const granularidade = nivel === undefined ? null : (NIVEL_PARA_GRANULARIDADE[nivel] ?? null);
  if (nivel === undefined) notas.push('workflow_sem_nivel');
  // H-1: só o nível story exige equipe; frente e projeto (workflow de iniciativa, quadro 35) não têm time na 0019; `fora` (H-7) segue fora
  const dentro = eItem && granularidade !== null && time?.situacao !== 'fora' && (granularidade !== 'story' || equipe !== null);

  // pai pelo vínculo nativo (`link_type` = parent no card filho); vários pais: o de menor id (contado); pai Sprint não vale (H-2)
  const pais = Array.isArray(e.card.linked_cards)
    ? [...new Set((e.card.linked_cards as unknown[]).flatMap((l) => {
      const v = l as { card_id?: unknown; link_type?: unknown } | null;
      return v !== null && typeof v === 'object' && v.link_type === 'parent' && texto(v.card_id) !== null ? [texto(v.card_id)!] : [];
    }))].sort((a, b) => Number(a) - Number(b))
    : [];
  if (pais.length > 1) notas.push('varios_pais');
  const tipoPai = pais[0] === undefined ? undefined : e.tipoDoPai(pais[0]);
  const paiTipo = tipoPai === undefined ? undefined : noDia(ref.tipos.get(tipoPai), diaDe(criado), notas);
  const pai = pais[0] === undefined || (paiTipo !== undefined && !paiTipo.eh_item) ? null : pais[0];
  if (pais[0] !== undefined && pai === null) notas.push('pai_sprint');

  const origemBug = origemDoBug(e, tipoRef, ref, criado, notas);
  const severidade = severidadeDaPrioridade(e.card.priority, ref.prioridades, notas);
  // 105 (E7.102): o time só vale quando o workflow é de time (`situacao = 'time'`); card de workflow `fora` ou sem time fica "sem régua"
  const tamanho = tamanhoPelaRegua(e.card.size, time?.situacao === 'time' ? time.time_id : null, ref.reguaTamanho, notas);
  const titulo = texto(e.card.title);
  const eventos: EventoCard[] = [{ card_id: e.id, tipo: 'criado', ocorrido_em: new Date(criado) }];
  if (arquivadoNativo !== null) eventos.push({ card_id: e.id, tipo: 'arquivado', ocorrido_em: new Date(arquivadoNativo) });
  if (e.excluidoDetectado) eventos.push({ card_id: e.id, tipo: 'excluido_detectado', ocorrido_em: e.coletadoEm });

  return {
    dim: {
      card_id: e.id, tipo: tipoRef?.eh_item === true ? TIPO_DA_CATEGORIA[tipoRef.categoria as CategoriaTipoCard] : null, card_pai: pai, criado_em: new Date(criado),
      comprometido_em: data(marcos.comprometido_em), iniciado_em: data(marcos.iniciado_em), concluido_em: data(marcos.concluido_em),
      arquivado_em: data(descartadoEm ?? arquivadoNativo), motivo_descarte: motivo, titulo: titulo === null ? null : titulo.slice(0, 500),
      granularidade: dentro ? granularidade : null, equipe: dentro ? equipe : null, quadro_id: quadro, coluna_atual_id: texto(e.card.column_id),
      excluido_em: e.excluidoDetectado ? e.coletadoEm : null, data_acordada: dataAcordada(e.card.deadline, notas), origem_bug: origemBug, ...colunasDeLista(e.card, ref.camposLista, notas), classe_servico: classeDeServicoDasTags(e.card, notas),
      // 105: a fase de detecção não vem do card; é projetada depois, pela coluna do pai do bug (`projetarFasesDeteccao`). O projetor preserva o valor já gravado.
      fase_deteccao: null,
      tamanho_declarado: tamanho,
      ...(severidade === undefined ? {} : { severidade }),
    },
    transicoes, eventos, notas,
  };
}
