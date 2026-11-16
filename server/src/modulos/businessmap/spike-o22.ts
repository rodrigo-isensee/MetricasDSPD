import { lstatSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { ErroBusinessMap, CAMPOS_USERS, type ClienteHttp } from '../../plataforma/http.js';
import { instanteDoBm } from './normalizador.js';
import { chaveSegura, desembrulhar, linhasDeForma, somarForma, type Forma } from './spike-forma.js';
import { foraDoRepositorio } from './spike.js';

// Pedido 105, E7.104 (B5 do plano do O22): spike SÓ DE LEITURA (só GET, pelo cliente de lista fechada), nada gravado na base.
// Responde três perguntas com uma amostra pequena de cards: (1) forma de `/cards/{id}/revisions` e `/cards/comments` (lote), se há `user_id`
// por revisão e se a revisão registra edição fora dos campos listados; (2) levantamento das contas por `user_id` (ações, horários, cards,
// suspeitas de automação); (3) indícios de regra automática atribuída a quem a criou (D5).
//
// Privacidade: o texto do comentário nunca é extraído (só `card_id`, `created_at`, `type` e o autor como número); `user_id` e nome só existem em
// memória e no ARQUIVO DE SAÍDA, que o script recusa gravar dentro do repositório. O texto que vai à tela (`saida`) tem só contagens.

export const QUANTIDADE_PADRAO = 30;
export const QUANTIDADE_MAXIMA = 60;
const MAX_QUADROS_VISITADOS = 60;
const POR_QUADRO = 3;
const CARDS_POR_PAGINA = 10;
const MAX_PAGINAS_COMENTARIOS = 5;
const CAMPOS_AMOSTRA = 'card_id,board_id,revision,created_at,last_modified';
/** Campos da revisão que não contam como "mudança de conteúdo" ao comparar revisões consecutivas. */
const CAMPOS_DE_CONTROLE = new Set(['revision', 'created_at', 'replaced_at', 'user_id']);

/** Limiares das suspeitas de automação (heurística para o dono confirmar; nunca decide sozinha). */
export const LIMIARES = {
  /** Ações mínimas na amostra para a conta valer como "volume alto" (e ao menos 3 cards). */
  volumeAcoes: 20,
  /** Fração das ações entre 0h e 5h59 (horário de Brasília) para "madrugada", com no mínimo `madrugadaMinimo` ações. */
  madrugadaFracao: 0.5,
  madrugadaMinimo: 5,
  /** Ações da mesma conta no mesmo segundo, em cards diferentes, para "lote". */
  loteNoSegundo: 3,
} as const;

export interface Evento {
  /** `null` = sem autor (ausente, nulo ou 0) ou autor externo. */
  conta: number | null;
  externo: boolean;
  ms: number;
  card: string;
  fonte: 'revisao' | 'comentario';
  /** Primeira revisão do card (a criação). */
  criacao: boolean;
  /** Mais de um evento do mesmo card no mesmo segundo (cascata, indício de regra automática). */
  cascata?: boolean;
}

export interface CardAmostra { id: string; quadro: string; revisao: number | null; ultimaModificacaoMs: number | null }

const ehObjeto = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const inteiroPositivo = (v: unknown): number | null => (typeof v === 'number' && Number.isInteger(v) && v > 0 ? v : null);
const idDe = (v: unknown): string | null => {
  const n = inteiroPositivo(v);
  return n === null ? null : String(n);
};

/** Escolha em rodízio entre os quadros, até `n` cards, no máximo `POR_QUADRO` por quadro (times diferentes). */
export function escolherAmostra(porQuadro: ReadonlyMap<string, readonly CardAmostra[]>, n: number): CardAmostra[] {
  const filas = [...porQuadro.values()].map((l) => l.slice(0, POR_QUADRO));
  const saida: CardAmostra[] = [];
  for (let rodada = 0; rodada < POR_QUADRO && saida.length < n; rodada += 1) {
    for (const fila of filas) {
      const c = fila[rodada];
      if (c !== undefined && saida.length < n) saida.push(c);
    }
  }
  return saida;
}

/** Cards de uma página da listagem (`fields` fixo), mais revisados primeiro (a amostra tende a cards com edição). */
export function cardsDaListagem(corpo: unknown): CardAmostra[] {
  const lista: CardAmostra[] = [];
  for (const i of desembrulhar(corpo).itens) {
    if (!ehObjeto(i)) continue;
    const id = idDe(i.card_id);
    const quadro = idDe(i.board_id);
    if (id === null || quadro === null) continue;
    lista.push({ id, quadro, revisao: inteiroPositivo(i.revision), ultimaModificacaoMs: instanteDoBm(i.last_modified) });
  }
  return lista.sort((a, b) => (b.revisao ?? 0) - (a.revisao ?? 0));
}

/** Autor do comentário: só o número quando `internal`; `sender`/`author` externos viram `externo`; o resto, sem autor. */
export function autorDoComentario(c: Record<string, unknown>): { conta: number | null; externo: boolean } {
  for (const chave of ['author', 'sender'] as const) {
    const a = c[chave];
    if (!ehObjeto(a)) continue;
    if (a.type === 'external') return { conta: null, externo: true };
    if (a.type === 'internal') return { conta: inteiroPositivo(a.value), externo: false };
  }
  return { conta: null, externo: false };
}

export interface RevisoesAnalisadas {
  eventos: Evento[];
  forma: Forma;
  /** Revisões lidas, pares consecutivos, pares sem diferença nos campos visíveis e `user_id` ausente, nulo ou 0. */
  revisoes: number;
  pares: number;
  paresIguais: number;
  semUsuario: number;
  /** Cards cuja quantidade de revisões bate com `revision` da listagem. */
  cardsRevisaoBate: number;
  cardsComparados: number;
  /** Nome de cada campo (seguro) que mudou entre revisões consecutivas e em quantos pares. */
  camposQueMudam: Map<string, number>;
}

const canonico = (v: unknown): string => {
  if (Array.isArray(v)) return `[${v.map(canonico).join(',')}]`;
  if (ehObjeto(v)) return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonico(v[k])}`).join(',')}}`;
  return JSON.stringify(v) ?? 'undefined';
};

/** Analisa as revisões de um card (em memória): eventos, forma e as contagens da pergunta (1). Não guarda valor de campo. */
export function analisarRevisoes(card: CardAmostra, corpo: unknown, acc: RevisoesAnalisadas): void {
  const itens = desembrulhar(corpo).itens.filter(ehObjeto);
  somarForma(itens, acc.forma);
  const ordenadas = [...itens].sort((a, b) => Number(a.revision ?? 0) - Number(b.revision ?? 0));
  acc.revisoes += ordenadas.length;
  if (card.revisao !== null) {
    acc.cardsComparados += 1;
    if (ordenadas.length === card.revisao) acc.cardsRevisaoBate += 1;
  }
  const primeira = ordenadas[0];
  const porSegundo = new Map<number, number>();
  const base: Evento[] = [];
  for (const r of ordenadas) {
    const ms = instanteDoBm(r.created_at);
    if (ms === null) continue;
    const conta = inteiroPositivo(r.user_id);
    if (conta === null) acc.semUsuario += 1;
    base.push({ conta, externo: false, ms, card: card.id, fonte: 'revisao', criacao: r === primeira });
    const s = Math.floor(ms / 1000);
    porSegundo.set(s, (porSegundo.get(s) ?? 0) + 1);
  }
  for (const e of base) e.cascata = (porSegundo.get(Math.floor(e.ms / 1000)) ?? 0) > 1;
  acc.eventos.push(...base);
  for (let i = 1; i < ordenadas.length; i += 1) {
    const [a, b] = [ordenadas[i - 1]!, ordenadas[i]!];
    const chaves = new Set([...Object.keys(a), ...Object.keys(b)].filter((k) => !CAMPOS_DE_CONTROLE.has(k)));
    const mudaram = [...chaves].filter((k) => canonico(a[k]) !== canonico(b[k]));
    acc.pares += 1;
    if (mudaram.length === 0) acc.paresIguais += 1;
    for (const k of mudaram) acc.camposQueMudam.set(chaveSegura(k), (acc.camposQueMudam.get(chaveSegura(k)) ?? 0) + 1);
  }
}

export const novoAcumuloRevisoes = (): RevisoesAnalisadas => ({
  eventos: [], forma: new Map(), revisoes: 0, pares: 0, paresIguais: 0, semUsuario: 0, cardsRevisaoBate: 0, cardsComparados: 0, camposQueMudam: new Map(),
});

export interface ComentariosAnalisados {
  eventos: Evento[];
  forma: Forma;
  total: number;
  porTipo: Map<string, number>;
  externos: number;
  semAutor: number;
  /** Comentários criados depois do `last_modified` da listagem (o comentário não atualiza o card?). */
  depoisDaUltimaModificacao: number;
  comparados: number;
  paginasLidas: number;
}

export const novoAcumuloComentarios = (): ComentariosAnalisados => ({
  eventos: [], forma: new Map(), total: 0, porTipo: new Map(), externos: 0, semAutor: 0, depoisDaUltimaModificacao: 0, comparados: 0, paginasLidas: 0,
});

/** Analisa uma página de `/cards/comments`. O texto do comentário nunca é lido: só `card_id`, `created_at`, `type` e o autor. */
export function analisarComentarios(cards: ReadonlyMap<string, CardAmostra>, corpo: unknown, acc: ComentariosAnalisados): void {
  const itens = desembrulhar(corpo).itens.filter(ehObjeto);
  somarForma(itens, acc.forma);
  for (const c of itens) {
    const id = idDe(c.card_id);
    const ms = instanteDoBm(c.created_at);
    acc.total += 1;
    const tipo = typeof c.type === 'string' ? chaveSegura(c.type) : '(ausente)';
    acc.porTipo.set(tipo, (acc.porTipo.get(tipo) ?? 0) + 1);
    const { conta, externo } = autorDoComentario(c);
    if (externo) acc.externos += 1;
    else if (conta === null) acc.semAutor += 1;
    if (id === null || ms === null) continue;
    const modificado = cards.get(id)?.ultimaModificacaoMs ?? null;
    if (modificado !== null) {
      acc.comparados += 1;
      if (ms > modificado) acc.depoisDaUltimaModificacao += 1;
    }
    acc.eventos.push({ conta, externo, ms, card: id, fonte: 'comentario', criacao: false });
  }
}

export interface ContaLevantada {
  conta: number;
  acoes: number;
  criacoes: number;
  revisoes: number;
  comentarios: number;
  cards: number;
  /** Ações por hora do dia (0 a 23, horário de Brasília). */
  porHora: number[];
  madrugada: number;
  maiorLoteNoSegundo: number;
  emCascata: number;
  suspeitas: string[];
}

const horaBrasilia = (ms: number): number => new Date(ms - 3 * 3_600_000).getUTCHours();

/** Levantamento por conta (eventos de pessoa identificada). A criação (revisão 1) conta à parte e fora das ações. */
export function levantarContas(eventos: readonly Evento[]): ContaLevantada[] {
  const porConta = new Map<number, Evento[]>();
  for (const e of eventos) if (e.conta !== null) porConta.set(e.conta, [...(porConta.get(e.conta) ?? []), e]);
  const contas: ContaLevantada[] = [];
  for (const [conta, todos] of porConta) {
    const acoesEv = todos.filter((e) => !e.criacao);
    const porHora = Array<number>(24).fill(0);
    for (const e of acoesEv) porHora[horaBrasilia(e.ms)]! += 1;
    const madrugada = porHora.slice(0, 6).reduce((s, n) => s + n, 0);
    const cardsPorSegundo = new Map<number, Set<string>>();
    const nPorSegundo = new Map<number, number>();
    for (const e of acoesEv) {
      const s = Math.floor(e.ms / 1000);
      cardsPorSegundo.set(s, (cardsPorSegundo.get(s) ?? new Set()).add(e.card));
      nPorSegundo.set(s, (nPorSegundo.get(s) ?? 0) + 1);
    }
    let maiorLote = 0;
    for (const [s, n] of nPorSegundo) if ((cardsPorSegundo.get(s)?.size ?? 0) >= 2) maiorLote = Math.max(maiorLote, n);
    const cards = new Set(acoesEv.map((e) => e.card)).size;
    const suspeitas: string[] = [];
    if (acoesEv.length >= LIMIARES.volumeAcoes && cards >= 3) suspeitas.push('volume alto');
    if (acoesEv.length >= LIMIARES.madrugadaMinimo && madrugada / acoesEv.length >= LIMIARES.madrugadaFracao) suspeitas.push('madrugada');
    if (maiorLote >= LIMIARES.loteNoSegundo) suspeitas.push('lote no mesmo segundo');
    contas.push({
      conta, acoes: acoesEv.length, criacoes: todos.length - acoesEv.length, revisoes: acoesEv.filter((e) => e.fonte === 'revisao').length,
      comentarios: acoesEv.filter((e) => e.fonte === 'comentario').length, cards, porHora, madrugada, maiorLoteNoSegundo: maiorLote,
      emCascata: acoesEv.filter((e) => e.cascata === true).length, suspeitas,
    });
  }
  return contas.sort((a, b) => b.acoes - a.acoes || a.conta - b.conta);
}

export interface Tempos { chamadas: number; totalMs: number; maxMs: number }

export interface DadosSpikeO22 {
  quadrosVisitados: number;
  amostra: readonly CardAmostra[];
  revisoes: RevisoesAnalisadas;
  comentarios: ComentariosAnalisados;
  contas: readonly ContaLevantada[];
  nomes: ReadonlyMap<number, string>;
  nomesLidos: boolean;
  temposRevisoes: Tempos;
  temposComentarios: Tempos;
}

const pct = (n: number, d: number): string => (d === 0 ? 'n/d' : `${Math.round((100 * n) / d)}%`);
const mediaMs = (t: Tempos): string => (t.chamadas === 0 ? 'n/d' : `${Math.round(t.totalMs / t.chamadas)} ms (máx. ${Math.round(t.maxMs)} ms, ${t.chamadas} chamadas)`);
const tabelaMapa = (m: ReadonlyMap<string, number>): string[] => ([...m].sort((a, b) => b[1] - a[1]).map(([k, n]) => `- \`${k}\`: ${n}`));

/** Seção do D5: indícios (nunca conclusão) de regra automática atribuída a uma conta que parece pessoa. */
function linhasD5(contas: readonly ContaLevantada[]): string[] {
  const comCascata = contas.filter((c) => c.emCascata > 0);
  const l = ['Indício usado: revisão do mesmo card no mesmo segundo que outra (a regra age junto da ação que a disparou). A API não lista regras: isto é indicativo, a confirmação é do dono.'];
  if (comCascata.length === 0) return [...l, '- Nenhuma conta com revisões em cascata na amostra.'];
  for (const c of comCascata) {
    l.push(`- conta ${c.conta}: ${c.emCascata} de ${c.acoes} ações em cascata (${pct(c.emCascata, c.acoes)})${c.suspeitas.length > 0 ? '; já suspeita de automação' : '; NÃO marcada como automação'}`);
  }
  return l;
}

/** Relatório COMPLETO (com `user_id` e nome da conta): só vai ao arquivo de saída, fora do repositório. */
export function relatorioDoDono(d: DadosSpikeO22): string {
  const r = d.revisoes;
  const c = d.comentarios;
  const nome = (id: number): string => d.nomes.get(id) ?? '(nome não lido)';
  return [
    '# Spike do O22 (B5): resultado completo, SÓ PARA O DONO (contém nome de conta; não versionar)',
    '',
    `Amostra: ${d.amostra.length} cards de ${new Set(d.amostra.map((x) => x.quadro)).size} quadros (${d.quadrosVisitados} quadros visitados).`,
    '',
    '## 1a. Revisões (`/cards/{id}/revisions`)',
    `- revisões lidas: ${r.revisoes}; sem \`user_id\` (ausente, nulo ou 0): ${r.semUsuario}`,
    `- cards em que a quantidade de revisões bate com \`revision\` da listagem: ${r.cardsRevisaoBate} de ${r.cardsComparados}`,
    `- pares de revisões consecutivas: ${r.pares}; sem diferença nos campos visíveis (edição fora da lista gera revisão): ${r.paresIguais} (${pct(r.paresIguais, r.pares)})`,
    `- tempo por chamada: ${mediaMs(d.temposRevisoes)}`,
    '',
    'Campos que mudam entre revisões consecutivas (pares):',
    ...(r.camposQueMudam.size > 0 ? tabelaMapa(r.camposQueMudam) : ['- (nenhum)']),
    '',
    'Forma da resposta (só nomes e tipos):',
    ...linhasDeForma(r.forma),
    '',
    '## 1b. Comentários em lote (`/cards/comments`)',
    `- comentários: ${c.total} em ${c.paginasLidas} página(s); externos: ${c.externos}; sem autor: ${c.semAutor}`,
    `- criados depois do \`last_modified\` da listagem: ${c.depoisDaUltimaModificacao} de ${c.comparados} comparados`,
    `- tempo por chamada: ${mediaMs(d.temposComentarios)}`,
    '',
    'Por `type`:',
    ...(c.porTipo.size > 0 ? tabelaMapa(c.porTipo) : ['- (nenhum)']),
    '',
    'Forma da resposta (só nomes e tipos):',
    ...linhasDeForma(c.forma),
    '',
    '## 2. Contas (por `user_id`)',
    `Suspeita de automação: volume alto (${LIMIARES.volumeAcoes} ações ou mais em 3 cards ou mais), madrugada (${LIMIARES.madrugadaFracao * 100}% ou mais das ações entre 0h e 5h59, horário de Brasília, mínimo ${LIMIARES.madrugadaMinimo}), lote (${LIMIARES.loteNoSegundo} ou mais ações no mesmo segundo em cards diferentes). A marca é indício, a decisão é sua.`,
    d.nomesLidos ? '' : 'Os nomes não puderam ser lidos (`/users`): só os ids aparecem.',
    '',
    '| conta | nome | ações | revisões | comentários | cards | criações | madrugada | maior lote/s | em cascata | suspeitas |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    ...d.contas.map((x) => `| ${x.conta} | ${nome(x.conta)} | ${x.acoes} | ${x.revisoes} | ${x.comentarios} | ${x.cards} | ${x.criacoes} | ${x.madrugada} | ${x.maiorLoteNoSegundo} | ${x.emCascata} | ${x.suspeitas.join('; ') || '-'} |`),
    '',
    'Ações por hora (0 a 23, Brasília):',
    ...d.contas.map((x) => `- ${x.conta}: ${x.porHora.join(' ')}`),
    '',
    '## 3. D5: regra automática com o `user_id` de quem a criou',
    ...linhasD5(d.contas),
    '',
  ].join('\n');
}

/** Resumo da tela: SÓ contagens (nenhum id de conta, nome, título ou texto). */
export function resumoDaTela(d: DadosSpikeO22, caminhoSaida: string): string {
  const r = d.revisoes;
  const c = d.comentarios;
  return [
    `amostra: ${d.amostra.length} cards em ${new Set(d.amostra.map((x) => x.quadro)).size} quadros`,
    `revisões: ${r.revisoes}; sem user_id: ${r.semUsuario}; pares iguais nos campos visíveis: ${r.paresIguais} de ${r.pares}`,
    `comentários: ${c.total}; externos: ${c.externos}; sem autor: ${c.semAutor}`,
    `contas distintas: ${d.contas.length}; com suspeita de automação: ${d.contas.filter((x) => x.suspeitas.length > 0).length}`,
    `relatório completo (só para o dono): ${caminhoSaida}`,
  ].join('\n');
}

export interface DepsSpikeO22 {
  cliente: Pick<ClienteHttp, 'get'>;
  /** Quadros da configuração; vazio = lista os quadros da conta. */
  quadros: readonly number[];
  caminhoSaida: string;
  raizRepositorio: string;
  quantidade?: number;
  /** Relógio monotônico em ms (tempo por chamada). */
  relogio?: () => number;
  escrever?: (caminho: string, texto: string) => Promise<void>;
}

/** Valida o caminho do arquivo de saída ANTES de qualquer chamada: absoluto, fora do repositório, sem link simbólico e sem sobrescrever. */
export function validarSaida(caminho: string, raiz: string): string {
  if (!caminho.startsWith('/')) throw new Error('caminho de saída precisa ser absoluto');
  const real = foraDoRepositorio(caminho, raiz);
  try {
    lstatSync(real);
  } catch (e) {
    if (Object(e).code === 'ENOENT') return real;
    throw new Error('caminho de saída inacessível');
  }
  throw new Error('arquivo de saída já existe: recusado (não sobrescreve)');
}

const cronometrar = async <T>(t: Tempos, relogio: () => number, f: () => Promise<T>): Promise<T> => {
  const ini = relogio();
  try {
    return await f();
  } finally {
    const d = relogio() - ini;
    t.chamadas += 1;
    t.totalMs += d;
    t.maxMs = Math.max(t.maxMs, d);
  }
};

async function listarQuadros(cliente: Pick<ClienteHttp, 'get'>, configurados: readonly number[]): Promise<string[]> {
  if (configurados.length > 0) return configurados.slice(0, MAX_QUADROS_VISITADOS).map(String);
  const corpo = await cliente.get('/boards', { consulta: { is_archived: 0, per_page: 100, page: 1 } });
  return desembrulhar(corpo).itens.map((b) => (ehObjeto(b) ? idDe(b.board_id) : null)).filter((id): id is string => id !== null).slice(0, MAX_QUADROS_VISITADOS);
}

/** Roda o spike: só GET; devolve o texto da tela, o código de saída e o arquivo gravado. Erro vira código fechado, sem mensagem de valor. */
export async function executarSpikeO22(deps: DepsSpikeO22): Promise<{ saida: string; erro: string | null }> {
  let caminho: string;
  try {
    caminho = validarSaida(deps.caminhoSaida, deps.raizRepositorio);
  } catch (e) {
    return { saida: '', erro: `saida: ${(e as Error).message}` };
  }
  const relogio = deps.relogio ?? (() => performance.now());
  const escrever = deps.escrever ?? ((c: string, t: string) => writeFile(c, t, { flag: 'wx', mode: 0o600 }));
  const n = Math.min(Math.max(deps.quantidade ?? QUANTIDADE_PADRAO, 1), QUANTIDADE_MAXIMA);
  const cliente = deps.cliente;
  try {
    const quadros = await listarQuadros(cliente, deps.quadros);
    const porQuadro = new Map<string, CardAmostra[]>();
    for (const q of quadros) {
      const corpo = await cliente.get('/cards', { consulta: { board_ids: q, state: 'active', fields: CAMPOS_AMOSTRA, per_page: CARDS_POR_PAGINA, page: 1 } });
      const cards = cardsDaListagem(corpo);
      if (cards.length > 0) porQuadro.set(q, cards);
    }
    const amostra = escolherAmostra(porQuadro, n);

    const revisoes = novoAcumuloRevisoes();
    const temposRevisoes: Tempos = { chamadas: 0, totalMs: 0, maxMs: 0 };
    for (const card of amostra) {
      const corpo = await cronometrar(temposRevisoes, relogio, () => cliente.get(`/cards/${card.id}/revisions`));
      analisarRevisoes(card, corpo, revisoes);
    }

    const comentarios = novoAcumuloComentarios();
    const temposComentarios: Tempos = { chamadas: 0, totalMs: 0, maxMs: 0 };
    const porId = new Map(amostra.map((c) => [c.id, c]));
    if (amostra.length > 0) {
      const ids = amostra.map((c) => c.id).join(',');
      for (let pagina = 1, total = 1; pagina <= Math.min(total, MAX_PAGINAS_COMENTARIOS); pagina += 1) {
        const corpo = await cronometrar(temposComentarios, relogio, () => cliente.get('/cards/comments', { consulta: { card_ids: ids, page: pagina } }));
        total = desembrulhar(corpo).paginas ?? 1;
        comentarios.paginasLidas += 1;
        analisarComentarios(porId, corpo, comentarios);
      }
    }

    const todos = [...revisoes.eventos, ...comentarios.eventos];
    const contas = levantarContas(todos);
    const nomes = new Map<number, string>();
    let nomesLidos = contas.length === 0;
    if (contas.length > 0) {
      try {
        for (let i = 0; i < contas.length; i += 200) {
          const lote = contas.slice(i, i + 200).map((x) => x.conta).join(',');
          const corpo = await cliente.get('/users', { consulta: { fields: CAMPOS_USERS, user_ids: lote } });
          for (const u of desembrulhar(corpo).itens) {
            const id = ehObjeto(u) ? inteiroPositivo(u.user_id) : null;
            if (id !== null && ehObjeto(u) && typeof u.realname === 'string') nomes.set(id, u.realname.replace(/[|\r\n]/g, ' '));
          }
        }
        nomesLidos = true;
      } catch (e) {
        if (e instanceof ErroBusinessMap && ['autenticacao', 'limite-requisicoes', 'configuracao'].includes(e.tipo)) throw e;
      }
    }
    const dados: DadosSpikeO22 = { quadrosVisitados: quadros.length, amostra, revisoes, comentarios, contas, nomes, nomesLidos, temposRevisoes, temposComentarios };
    try {
      await escrever(caminho, relatorioDoDono(dados));
    } catch (e) {
      return { saida: '', erro: `saida: não foi possível gravar o arquivo (${String(Object(e).code)})` };
    }
    return { saida: `${resumoDaTela(dados, caminho)}\n`, erro: null };
  } catch (e) {
    return { saida: '', erro: e instanceof ErroBusinessMap ? e.tipo : 'erro-interno' };
  }
}
