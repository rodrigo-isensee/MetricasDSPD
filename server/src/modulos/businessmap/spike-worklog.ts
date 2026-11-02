import { criarClienteHttp, CAMPOS_WORKLOG, type ClienteHttp, type DepsHttp, type ErroBusinessMap } from '../../plataforma/http.js';
import { lerConfig } from './diagnostico.js';
import { desembrulhar, linhasDeForma, somarForma, type Forma } from './spike-forma.js';

// Pedido 059, E2.3 (K-193): spike de leitura da FORMA do worklog do BusinessMap (`/loggedTime`, `/loggedTime/history`,
// `/loggedTimeCategories`). CLI manual, nunca agendada, só GET pelo cliente do 052 (lista fechada de caminhos e de
// parâmetros). NÃO grava a resposta bruta em lugar nenhum: tudo fica em memória e só sai (stdout) forma (nomes de campo e
// tipos) e contagens. Valor de nome, id de pessoa, comentário e título não saem, nem em arquivo, nem em saída, nem em log.

const LOTE_CARDS = 20;
const JANELA_MODIFICADO_DIAS = 90;
const POR_PAGINA = 200;
const FATAIS = new Set(['autenticacao', 'limite-requisicoes', 'limite-paginas', 'limite-bytes', 'configuracao']);
/** Tipos de evento do histórico documentados na API; qualquer outro valor sai como `(outro)`, nunca como texto lido. */
const TIPOS_EVENTO = new Set([
  'logged_time_created',
  'logged_time_updated',
  'logged_time_deleted',
  'logged_time_transferred_to_card_after_subtask_deleted',
  'logged_time_updated_after_subtask_converted_to_card',
]);
const CAMPOS_ESPERADOS = CAMPOS_WORKLOG.split(',');

export interface DepsSpikeWorklog extends DepsHttp {
  env: Record<string, string | undefined>;
}

export interface ResultadoSpikeWorklog {
  codigo: number;
  saida: string;
  erro: string;
}

const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const ehTextoNaoVazio = (v: unknown): boolean => typeof v === 'string' && v.trim() !== '';
const dia = (d: Date): string => d.toISOString().slice(0, 10);

export interface ContagensApontamento {
  apontamentos: number;
  cardsDistintos: number;
  pessoasDistintas: number;
  comCategoria: number;
  comComentario: number;
  comSubtarefa: number;
  comCardPai: number;
  dataNoFormato: number;
  registradoEmNoFormato: number;
  tempoInteiro: number;
  tempoMinimo: number | undefined;
  tempoMaximo: number | undefined;
  camposAusentes: string[];
  camposExtras: string[];
}

/** Contagens do worklog: só números e nomes de campo; o valor de pessoa e de comentário é lido para contar e descartado. */
export function contarApontamentos(itens: readonly unknown[]): ContagensApontamento {
  const cards = new Set<unknown>();
  const pessoas = new Set<unknown>();
  const chaves = new Set<string>();
  const c: ContagensApontamento = {
    apontamentos: itens.length, cardsDistintos: 0, pessoasDistintas: 0, comCategoria: 0, comComentario: 0, comSubtarefa: 0, comCardPai: 0,
    dataNoFormato: 0, registradoEmNoFormato: 0, tempoInteiro: 0, tempoMinimo: undefined, tempoMaximo: undefined, camposAusentes: [], camposExtras: [],
  };
  for (const item of itens) {
    if (!ehObjeto(item)) continue;
    for (const k of Object.keys(item)) chaves.add(k);
    cards.add(item.card_id);
    if (item.user_id !== undefined && item.user_id !== null) pessoas.add(item.user_id);
    if (item.category_id !== undefined && item.category_id !== null) c.comCategoria += 1;
    if (ehTextoNaoVazio(item.comment)) c.comComentario += 1;
    if (item.subtask_id !== undefined && item.subtask_id !== null) c.comSubtarefa += 1;
    if (item.parent_card_id !== undefined && item.parent_card_id !== null) c.comCardPai += 1;
    if (typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date)) c.dataNoFormato += 1;
    if (typeof item.logged_at === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(item.logged_at)) c.registradoEmNoFormato += 1;
    if (typeof item.time === 'number' && Number.isInteger(item.time)) {
      c.tempoInteiro += 1;
      c.tempoMinimo = c.tempoMinimo === undefined ? item.time : Math.min(c.tempoMinimo, item.time);
      c.tempoMaximo = c.tempoMaximo === undefined ? item.time : Math.max(c.tempoMaximo, item.time);
    }
  }
  c.cardsDistintos = cards.size;
  c.pessoasDistintas = pessoas.size;
  c.camposAusentes = CAMPOS_ESPERADOS.filter((k) => !chaves.has(k));
  c.camposExtras = [...chaves].filter((k) => !CAMPOS_ESPERADOS.includes(k) && /^[A-Za-z_][A-Za-z0-9_]{0,39}$/.test(k)).sort();
  return c;
}

/** Eventos do histórico por tipo (só valores da lista fechada) e quantos eventos trazem o campo de tipo. */
export function contarEventos(itens: readonly unknown[]): { porTipo: Map<string, number>; semTipo: number; campoTipo: string | undefined } {
  const porTipo = new Map<string, number>();
  let semTipo = 0;
  let campoTipo: string | undefined;
  for (const item of itens) {
    const o = ehObjeto(item) ? item : {};
    const k = ['event_type', 'type', 'event'].find((n) => typeof o[n] === 'string');
    if (k === undefined) {
      semTipo += 1;
      continue;
    }
    campoTipo ??= k;
    const v = o[k] as string;
    const rotulo = TIPOS_EVENTO.has(v) ? v : '(outro)';
    porTipo.set(rotulo, (porTipo.get(rotulo) ?? 0) + 1);
  }
  return { porTipo, semTipo, campoTipo };
}

const n = (v: number | undefined): string => (v === undefined ? 'n/d' : String(v));

/** Roda o spike do worklog e devolve o relatório (stdout) ou o erro (stderr) e o código de saída. Não grava nada. */
export async function executarSpikeWorklog(deps: DepsSpikeWorklog): Promise<ResultadoSpikeWorklog> {
  let novoCliente: () => ClienteHttp;
  let quadros: number[];
  let apikey: string;
  try {
    const cfg = lerConfig(deps.env);
    if (cfg.quadrosIds === undefined) throw new Error('variável obrigatória ausente: BUSINESSMAP_QUADROS_IDS');
    quadros = [...new Set(cfg.quadrosIds)];
    apikey = cfg.apikey;
    const cfgHttp = { urlBase: cfg.urlBase, apikey, limitePorMinuto: cfg.limitePorMinuto, timeoutMs: cfg.timeoutMs };
    criarClienteHttp(cfgHttp, deps); // valida a configuração antes de qualquer rede
    novoCliente = () => criarClienteHttp(cfgHttp, deps);
  } catch (e) {
    return { codigo: 2, saida: '', erro: (e as Error).message };
  }
  const limpar = (t: string): string => t.split(apikey).join('[redigido]');
  const agora = new Date((deps.agora ?? Date.now)());
  const avisos: string[] = [];

  /** GET; falha não fatal vira aviso (só tipo e texto fixo do cliente) e `undefined`; a resposta fica só em memória. */
  const cliente = novoCliente();
  /**
   * `isolado`: cliente próprio (o 401/403 do cliente para a execução toda); a falta de permissão em um caminho do
   * worklog vira aviso e não impede os outros, porque o spike precisa saber exatamente qual deles a chave alcança.
   */
  const ler = async (rotulo: string, caminho: string, consulta: Record<string, string | number>, isolado = false): Promise<unknown> => {
    try {
      return await (isolado ? novoCliente() : cliente).get(caminho, { consulta });
    } catch (e) {
      const erro = e as ErroBusinessMap;
      if (FATAIS.has(erro.tipo) && !(isolado && erro.tipo === 'autenticacao')) throw erro;
      avisos.push(limpar(`${rotulo}: ${erro.tipo}: ${erro.message}`));
      return undefined;
    }
  };

  try {
    // 1. Lote pequeno de cards já coletados (mesmos quadros da coleta): só `card_id`, até LOTE_CARDS.
    const desde = new Date(agora.getTime() - JANELA_MODIFICADO_DIAS * 86_400_000);
    const ids: number[] = [];
    for (const q of quadros) {
      if (ids.length >= LOTE_CARDS) break;
      const corpo = await ler(`cards-quadro-${q}`, '/cards', {
        board_ids: String(q), state: 'active', fields: 'card_id', last_modified_from: `${dia(desde)}T00:00:00Z`, per_page: LOTE_CARDS, page: 1,
      });
      if (corpo === undefined) continue;
      for (const card of desembrulhar(corpo).itens) {
        const id = Object(card).card_id;
        if (typeof id === 'number' && Number.isInteger(id) && id > 0 && !ids.includes(id) && ids.length < LOTE_CARDS) ids.push(id);
      }
    }
    if (ids.length === 0) {
      return { codigo: 3, saida: '', erro: `nenhum card ativo modificado nos últimos ${JANELA_MODIFICADO_DIAS} dias nos quadros configurados${avisos.length > 0 ? `; avisos: ${avisos.join(' | ')}` : ''}` };
    }
    const lista = ids.join(',');

    // 2. Os três caminhos do worklog, só GET, só em memória.
    const formaApontamento: Forma = new Map();
    const formaHistorico: Forma = new Map();
    const formaCategorias: Forma = new Map();

    const brutoAp = await ler('loggedTime', '/loggedTime', {
      card_ids: lista, include_logged_time_for_subtasks: 1, fields: CAMPOS_WORKLOG, per_page: POR_PAGINA, page: 1,
    }, true);
    const dAp = desembrulhar(brutoAp); // sem resposta (aviso já registrado): lista vazia
    for (const i of dAp.itens) somarForma(i, formaApontamento);
    const cont = contarApontamentos(dAp.itens);

    const brutoHist = await ler('loggedTime/history', '/loggedTime/history', { card_ids: lista, per_page: POR_PAGINA, page: 1 }, true);
    const dHist = desembrulhar(brutoHist);
    for (const i of dHist.itens) somarForma(i, formaHistorico);
    const ev = contarEventos(dHist.itens);

    const brutoCat = await ler('loggedTimeCategories', '/loggedTimeCategories', { per_page: POR_PAGINA, page: 1 }, true);
    const dCat = desembrulhar(brutoCat);
    for (const i of dCat.itens) somarForma(i, formaCategorias);

    const secao = (titulo: string, forma: Forma): string[] => {
      const l = linhasDeForma(forma);
      return ['', `## ${titulo}`, '', ...(l.length > 0 ? l : ['(sem dados)'])];
    };
    const relatorio = [
      '# Relatório de forma do worklog (E2.3, spike)',
      '',
      `Gerado em ${agora.toISOString()}. Só nomes de campo, tipos e contagens: nenhum valor de nome, id de pessoa, comentário ou título. Nada gravado em arquivo.`,
      '',
      `Lote: ${ids.length} cards ativos já coletados (modificados nos últimos ${JANELA_MODIFICADO_DIAS} dias), em ${quadros.length} quadro(s).`,
      '',
      '## Contagens de /loggedTime (uma página de até 200, include_logged_time_for_subtasks=1)',
      '',
      `- apontamentos: ${cont.apontamentos}; cards distintos com apontamento: ${cont.cardsDistintos}; pessoas distintas (só a contagem): ${cont.pessoasDistintas}`,
      `- com categoria: ${cont.comCategoria}; com comentário não vazio: ${cont.comComentario}; com subtarefa: ${cont.comSubtarefa}; com card pai: ${cont.comCardPai}`,
      `- date no formato AAAA-MM-DD: ${cont.dataNoFormato}; logged_at em ISO 8601: ${cont.registradoEmNoFormato}`,
      `- time inteiro: ${cont.tempoInteiro}; menor e maior (segundos): ${n(cont.tempoMinimo)} e ${n(cont.tempoMaximo)}`,
      `- campos pedidos ausentes na resposta: ${cont.camposAusentes.join(', ') || '(nenhum)'}; campos a mais que o pedido: ${cont.camposExtras.join(', ') || '(nenhum)'}`,
      `- páginas informadas pela API: ${n(dAp.paginas)}; chaves de paginação: ${dAp.chavesPaginacao.join(', ') || '(nenhuma)'}`,
      '',
      '## Contagens de /loggedTime/history (uma página de até 200)',
      '',
      `- eventos: ${dHist.itens.length}; campo do tipo do evento: ${ev.campoTipo ?? '(não achado)'}; eventos sem tipo textual: ${ev.semTipo}`,
      ...[...ev.porTipo.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([t, q]) => `- ${t}: ${q}`),
      `- páginas informadas pela API: ${n(dHist.paginas)}; chaves de paginação: ${dHist.chavesPaginacao.join(', ') || '(nenhuma)'}`,
      '',
      '## Contagens de /loggedTimeCategories',
      '',
      `- categorias: ${dCat.itens.length}`,
      ...secao('Forma de /loggedTime (por apontamento)', formaApontamento),
      ...secao('Forma de /loggedTime/history (por evento)', formaHistorico),
      ...secao('Forma de /loggedTimeCategories (por categoria)', formaCategorias),
      '',
      '## Avisos',
      '',
      ...(avisos.length > 0 ? avisos.map((a) => `- ${a}`) : ['(nenhum)']),
      '',
    ].join('\n');
    return { codigo: 0, saida: relatorio, erro: '' };
  } catch (e) {
    const erro = e as ErroBusinessMap;
    return { codigo: 1, saida: '', erro: limpar(`${erro.tipo ?? 'erro'}: ${erro.message}`) };
  }
}
