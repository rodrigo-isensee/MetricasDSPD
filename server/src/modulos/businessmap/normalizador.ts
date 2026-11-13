import {
  CALENDARIO_PADRAO, dataIso, instanteDeIso, ordenarNeutro,
} from '@metricas-dspd/metricas/core';
import { derivarMarcos, direcaoDaTransicao, type ColunaDoPasso, type Passo } from '@metricas-dspd/metricas/businessmap';
import { TIPO_DA_CATEGORIA, type CategoriaTipoCard } from '@metricas-dspd/contratos';
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
  /** Prazo nativo do card (`deadline`), dia civil `AAAA-MM-DD`; nulo se ausente ou fora da forma (099-o12-deadline §2). */
  data_acordada: string | null;
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
 * Parse estrito do `deadline` (099-o12-deadline §2): só `AAAA-MM-DD` com ano >= 0001 (o PostgreSQL não tem ano 0), mês e dia válidos; o dia é gravado como está (data civil, sem fuso).
 * Data e hora, texto ou número viram `null` com a nota `deadline_fora_da_forma` (contagem; o valor nunca vai a log nem a tabela). Nada se converte.
 */
export function dataAcordada(valor: unknown, notas: string[]): string | null {
  if (valor === undefined || valor === null) return null;
  if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const d = new Date(`${valor}T00:00:00Z`);
    // Ano 0000: o Date do JS aceita, o `date` do PostgreSQL não (abortaria o INSERT do lote inteiro); exige ano >= 1.
    if (!Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === valor && !valor.startsWith('0000')) return valor;
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

  const severidade = severidadeDaPrioridade(e.card.priority, ref.prioridades, notas);
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
      excluido_em: e.excluidoDetectado ? e.coletadoEm : null, data_acordada: dataAcordada(e.card.deadline, notas), ...colunasDeLista(e.card, ref.camposLista, notas),
      ...(severidade === undefined ? {} : { severidade }),
    },
    transicoes, eventos, notas,
  };
}
