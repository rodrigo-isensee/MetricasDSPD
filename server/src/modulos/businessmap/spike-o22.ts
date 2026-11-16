import { lstatSync } from 'node:fs';
import { dirname, join } from 'node:path';
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

const MARCA_GIT = ['', 'git'].join('.');
export const QUANTIDADE_PADRAO = 60;
export const QUANTIDADE_MAXIMA = 60;
const MAX_QUADROS_VISITADOS = 60;
const CARDS_POR_PAGINA = 100;
const MAX_PAGINAS_LISTAGEM = 3;
const JANELA_MS = 12 * 7 * 86_400_000;
const MAX_PAGINAS_COMENTARIOS = 5;
const CAMPOS_AMOSTRA = 'card_id,board_id,revision,created_at,last_modified';
/** Campos da revisão que não contam como "mudança de conteúdo" ao comparar revisões consecutivas (a lista da API traz só estes: a comparação costuma ficar sem o que comparar, e a tela diz isso). */
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

export interface CardAmostra { id: string; quadro: string; revisao: number | null; ultimaModificacaoMs: number | null; criadoMs?: number | null }

const ehObjeto = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const inteiroPositivo = (v: unknown): number | null => (typeof v === 'number' && Number.isInteger(v) && v > 0 ? v : null);
const idDe = (v: unknown): string | null => {
  const n = inteiroPositivo(v);
  return n === null ? null : String(n);
};

/** Sorteio simples (Fisher-Yates) de até `n` candidatos; `aleatorio` injetável para teste. Não altera a lista de entrada. */
export function sortearAmostra<T>(candidatos: readonly T[], n: number, aleatorio: () => number = Math.random): T[] {
  const v = [...candidatos];
  for (let i = v.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.floor(aleatorio() * (i + 1)));
    [v[i], v[j]] = [v[j]!, v[i]!];
  }
  return v.slice(0, n);
}

/** Candidatos criados dentro da janela (`created_at` lido e >= agora - 12 semanas). */
export const criadoNaJanela = (c: CardAmostra, agoraMs: number): boolean => c.criadoMs !== undefined && c.criadoMs !== null && c.criadoMs >= agoraMs - JANELA_MS && c.criadoMs <= agoraMs;

/** Cards de uma página da listagem (`fields` fixo). */
export function cardsDaListagem(corpo: unknown): CardAmostra[] {
  const lista: CardAmostra[] = [];
  for (const i of desembrulhar(corpo).itens) {
    if (!ehObjeto(i)) continue;
    const id = idDe(i.card_id);
    const quadro = idDe(i.board_id);
    if (id === null || quadro === null) continue;
    lista.push({ id, quadro, revisao: inteiroPositivo(i.revision), ultimaModificacaoMs: instanteDoBm(i.last_modified), criadoMs: instanteDoBm(i.created_at) });
  }
  return lista;
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
  /** Revisões lidas (denominador de tudo abaixo), pares consecutivos, pares com ao menos um campo comparável, pares sem diferença neles e `user_id` ausente, nulo ou 0 (contado ANTES de qualquer descarte). */
  revisoes: number;
  cardsLidos: number;
  /** Cards cuja lista de revisões voltou vazia (todo card tem ao menos a revisão 1: indício de forma diferente ou resposta vazia). */
  cardsSemRevisao: number;
  pares: number;
  paresComparaveis: number;
  paresIguais: number;
  semUsuario: number;
  /** Contas distintas pelo `user_id` das revisões (só o conjunto em memória; a tela mostra a quantidade). */
  contasRevisao: Set<number>;
  /** Instante pelo `replaced_at` da revisão anterior (ou `created_at` do card na revisão 1) e revisões sem instante algum. */
  instanteDaAnterior: number;
  semInstante: number;
  /** Revisões que trazem `created_at` próprio, e quantas delas coincidem com o instante derivado. */
  comCriadoProprio: number;
  criadoProprioBate: number;
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

/** Analisa as revisões de um card (em memória): eventos, forma e as contagens da pergunta (1). Não guarda valor de campo.
 * Instante da revisão n (n >= 2) = `replaced_at` da revisão n - 1; da revisão 1, o `created_at` do card; se a revisão trouxer
 * `created_at` próprio, vale ele e se confere com o derivado. O `user_id` é contado antes de qualquer descarte por falta de instante. */
export function analisarRevisoes(card: CardAmostra, corpo: unknown, acc: RevisoesAnalisadas): void {
  const itens = desembrulhar(corpo).itens.filter(ehObjeto);
  somarForma(itens, acc.forma);
  const ordenadas = [...itens].sort((a, b) => Number(a.revision ?? 0) - Number(b.revision ?? 0));
  acc.cardsLidos += 1;
  if (ordenadas.length === 0) acc.cardsSemRevisao += 1;
  acc.revisoes += ordenadas.length;
  if (card.revisao !== null) {
    acc.cardsComparados += 1;
    if (ordenadas.length === card.revisao) acc.cardsRevisaoBate += 1;
  }
  const primeira = ordenadas[0];
  const instantes = ordenadas.map((r, i) => {
    const derivado = i === 0 ? (card.criadoMs ?? null) : instanteDoBm(ordenadas[i - 1]!.replaced_at);
    const proprio = instanteDoBm(r.created_at);
    if (proprio !== null) {
      acc.comCriadoProprio += 1;
      if (derivado !== null && Math.abs(proprio - derivado) < 1000) acc.criadoProprioBate += 1;
    }
    const ms = proprio ?? derivado;
    if (ms === null) acc.semInstante += 1;
    else if (proprio === null) acc.instanteDaAnterior += 1;
    return ms;
  });
  const porSegundo = new Map<number, number>();
  const base: Evento[] = [];
  ordenadas.forEach((r, i) => {
    const conta = inteiroPositivo(r.user_id);
    if (conta === null) acc.semUsuario += 1;
    else acc.contasRevisao.add(conta);
    const ms = instantes[i]!;
    if (ms === null) return;
    base.push({ conta, externo: false, ms, card: card.id, fonte: 'revisao', criacao: r === primeira });
    const s = Math.floor(ms / 1000);
    porSegundo.set(s, (porSegundo.get(s) ?? 0) + 1);
  });
  for (const e of base) e.cascata = (porSegundo.get(Math.floor(e.ms / 1000)) ?? 0) > 1;
  acc.eventos.push(...base);
  for (let i = 1; i < ordenadas.length; i += 1) {
    const [a, b] = [ordenadas[i - 1]!, ordenadas[i]!];
    const chaves = new Set([...Object.keys(a), ...Object.keys(b)].filter((k) => !CAMPOS_DE_CONTROLE.has(k)));
    const mudaram = [...chaves].filter((k) => canonico(a[k]) !== canonico(b[k]));
    acc.pares += 1;
    if (chaves.size > 0) acc.paresComparaveis += 1;
    if (chaves.size > 0 && mudaram.length === 0) acc.paresIguais += 1;
    for (const k of mudaram) acc.camposQueMudam.set(chaveSegura(k), (acc.camposQueMudam.get(chaveSegura(k)) ?? 0) + 1);
  }
}

export const novoAcumuloRevisoes = (): RevisoesAnalisadas => ({
  eventos: [], forma: new Map(), revisoes: 0, cardsLidos: 0, cardsSemRevisao: 0, pares: 0, paresComparaveis: 0, paresIguais: 0, semUsuario: 0,
  contasRevisao: new Set(), instanteDaAnterior: 0, semInstante: 0, comCriadoProprio: 0, criadoProprioBate: 0, cardsRevisaoBate: 0, cardsComparados: 0, camposQueMudam: new Map(),
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
  /** Contas distintas pelo autor interno dos comentários (só o conjunto em memória). */
  contas: Set<number>;
}

export const novoAcumuloComentarios = (): ComentariosAnalisados => ({
  eventos: [], forma: new Map(), total: 0, porTipo: new Map(), externos: 0, semAutor: 0, depoisDaUltimaModificacao: 0, comparados: 0, paginasLidas: 0, contas: new Set(),
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
    else acc.contas.add(conta);
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
  /** Cards criados na janela de 12 semanas dos quais a amostra foi sorteada. */
  candidatos: number;
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
    `- pares de revisões consecutivas: ${r.pares}; com campo comparável: ${r.paresComparaveis}; sem diferença nesses campos: ${r.paresIguais} de ${r.paresComparaveis} (${pct(r.paresIguais, r.paresComparaveis)})`,
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
    `amostra: ${d.amostra.length} cards sorteados de ${d.candidatos} criados nas últimas 12 semanas, em ${new Set(d.amostra.map((x) => x.quadro)).size} quadros`,
    `revisões: ${r.revisoes} lidas em ${r.cardsLidos} cards; cards que voltaram sem nenhuma revisão: ${r.cardsSemRevisao} de ${r.cardsLidos}`,
    `cards com a quantidade de revisões igual a revision da listagem: ${r.cardsRevisaoBate} de ${r.cardsComparados}`,
    `sem user_id (ausente, nulo ou 0): ${r.semUsuario} de ${r.revisoes} revisões`,
    `instante: pelo replaced_at da anterior ou pela criação do card: ${r.instanteDaAnterior} de ${r.revisoes}; created_at próprio da revisão: ${r.comCriadoProprio} de ${r.revisoes} (coincide com o derivado em ${r.criadoProprioBate}); sem instante: ${r.semInstante} de ${r.revisoes}`,
    `pares iguais nos campos comparáveis: ${r.paresIguais} de ${r.paresComparaveis} com campo comparável (${r.pares} pares no total)`,
    `contas distintas pelas revisões: ${r.contasRevisao.size} (de ${r.revisoes - r.semUsuario} revisões com user_id); pelos comentários: ${c.contas.size} (de ${c.total - c.externos - c.semAutor} comentários com autor interno); no total: ${new Set([...r.contasRevisao, ...c.contas]).size}`,
    `comentários: ${c.total} em ${d.amostra.length} cards; externos: ${c.externos} de ${c.total}; sem autor: ${c.semAutor} de ${c.total}`,
    `com suspeita de automação: ${d.contas.filter((x) => x.suspeitas.length > 0).length} de ${d.contas.length} contas com instante`,
    'forma da resposta das revisões (só nomes de campo):',
    ...linhasDeForma(r.forma),
    'forma da resposta dos comentários (só nomes de campo):',
    ...linhasDeForma(c.forma),
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
  /** Relógio de calendário em ms (janela de 12 semanas) e sorteio; injetáveis para teste. */
  agora?: () => number;
  aleatorio?: () => number;
  /** Relógio monotônico em ms (tempo por chamada). */
  relogio?: () => number;
  escrever?: (caminho: string, texto: string) => Promise<void>;
}

/** Valida o caminho do arquivo de saída ANTES de qualquer chamada: absoluto, fora do repositório, sem link simbólico e sem sobrescrever. */
export function validarSaida(caminho: string, raiz: string): string {
  if (!caminho.startsWith('/')) throw new Error('caminho de saída precisa ser absoluto');
  const real = foraDoRepositorio(caminho, raiz);
  // A2: outro clone ou worktree (pasta ou arquivo de controle do git em algum diretório acima) também recusa; o arquivo com nomes não pode cair num repositório.
  for (let d = dirname(real); ; d = dirname(d)) {
    let achou = true;
    try {
      lstatSync(join(d, MARCA_GIT));
    } catch (e) {
      if (Object(e).code !== 'ENOENT' && Object(e).code !== 'ENOTDIR') throw new Error('caminho de saída inacessível');
      achou = false;
    }
    if (achou) throw new Error('caminho de saída dentro de outro repositório git: recusado');
    if (dirname(d) === d) break;
  }
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

type Etapa = 'quadros' | 'listagem de cards' | 'revisões' | 'comentários' | 'usuários';

/**
 * Texto do erro que vai à tela quando uma chamada falha por HTTP: etapa, código HTTP e caminho SEM consulta (`/cards/12/revisions`; a consulta pode
 * levar ids de lote) e sem credencial; nunca o corpo da resposta (o cliente não o guarda). Outros tipos de erro seguem só com o código fechado.
 */
export function descreverErro(e: unknown, etapa: Etapa, caminho: string): string {
  if (!(e instanceof ErroBusinessMap)) return 'erro-interno';
  if (e.tipo !== 'http') return `${e.tipo} (etapa: ${etapa}, GET ${caminho})`;
  return `http (etapa: ${etapa}, HTTP ${e.status ?? '?'}, GET ${caminho})`;
}

/** Marca a etapa corrente para o erro dizer onde falhou. */
class EtapaFalhou extends Error {
  constructor(readonly causa: unknown, readonly etapa: Etapa, readonly caminho: string) {
    super('etapa falhou');
  }
}
async function naEtapa<T>(etapa: Etapa, caminho: string, f: () => Promise<T>): Promise<T> {
  try {
    return await f();
  } catch (e) {
    throw new EtapaFalhou(e, etapa, caminho);
  }
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
    const quadros = await naEtapa('quadros', '/boards', () => listarQuadros(cliente, deps.quadros));
    const agoraMs = (deps.agora ?? Date.now)();
    // A API recusa filtro de data pura (400, E2.83): `last_modified_from` leva dia e hora em UTC, como a coleta.
    const desde = `${new Date(agoraMs - 12 * 7 * 86_400_000).toISOString().slice(0, 10)}T00:00:00Z`;
    const candidatos: CardAmostra[] = [];
    for (const q of quadros) {
      for (let pagina = 1, total = 1; pagina <= Math.min(total, MAX_PAGINAS_LISTAGEM); pagina += 1) {
        const corpo = await naEtapa('listagem de cards', '/cards', () => cliente.get('/cards', { consulta: { board_ids: q, state: 'active', last_modified_from: desde, fields: CAMPOS_AMOSTRA, per_page: CARDS_POR_PAGINA, page: pagina } }));
        total = desembrulhar(corpo).paginas ?? 1;
        candidatos.push(...cardsDaListagem(corpo).filter((c) => criadoNaJanela(c, agoraMs)));
      }
    }
    const amostra = sortearAmostra(candidatos, n, deps.aleatorio);

    const revisoes = novoAcumuloRevisoes();
    const temposRevisoes: Tempos = { chamadas: 0, totalMs: 0, maxMs: 0 };
    for (const card of amostra) {
      const corpo = await naEtapa('revisões', `/cards/${card.id}/revisions`, () => cronometrar(temposRevisoes, relogio, () => cliente.get(`/cards/${card.id}/revisions`)));
      analisarRevisoes(card, corpo, revisoes);
    }

    const comentarios = novoAcumuloComentarios();
    const temposComentarios: Tempos = { chamadas: 0, totalMs: 0, maxMs: 0 };
    const porId = new Map(amostra.map((c) => [c.id, c]));
    if (amostra.length > 0) {
      const ids = amostra.map((c) => c.id).join(',');
      for (let pagina = 1, total = 1; pagina <= Math.min(total, MAX_PAGINAS_COMENTARIOS); pagina += 1) {
        const corpo = await naEtapa('comentários', '/cards/comments', () => cronometrar(temposComentarios, relogio, () => cliente.get('/cards/comments', { consulta: { card_ids: ids, page: pagina } })));
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
          const corpo = await naEtapa('usuários', '/users', () => cliente.get('/users', { consulta: { fields: CAMPOS_USERS, user_ids: lote } }));
          for (const u of desembrulhar(corpo).itens) {
            const id = ehObjeto(u) ? inteiroPositivo(u.user_id) : null;
            if (id !== null && ehObjeto(u) && typeof u.realname === 'string') nomes.set(id, u.realname.replace(/[|\r\n]/g, ' '));
          }
        }
        nomesLidos = true;
      } catch (e) {
        const causa = e instanceof EtapaFalhou ? e.causa : e;
        if (causa instanceof ErroBusinessMap && ['autenticacao', 'limite-requisicoes', 'configuracao'].includes(causa.tipo)) throw e;
      }
    }
    const dados: DadosSpikeO22 = { quadrosVisitados: quadros.length, amostra, candidatos: candidatos.length, revisoes, comentarios, contas, nomes, nomesLidos, temposRevisoes, temposComentarios };
    try {
      await escrever(caminho, relatorioDoDono(dados));
    } catch (e) {
      return { saida: '', erro: `saida: não foi possível gravar o arquivo (${String(Object(e).code)})` };
    }
    return { saida: `${resumoDaTela(dados, caminho)}\n`, erro: null };
  } catch (e) {
    if (e instanceof EtapaFalhou) return { saida: '', erro: descreverErro(e.causa, e.etapa, e.caminho) };
    return { saida: '', erro: e instanceof ErroBusinessMap ? e.tipo : 'erro-interno' };
  }
}
