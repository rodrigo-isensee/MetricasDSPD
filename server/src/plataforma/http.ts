import { z } from 'zod';

/**
 * Cliente HTTP de saída do BusinessMap (S-22, ADR 0015, F0 do plano 052). A chave do dono pode alterar o quadro
 * (Q-5 = B): este cliente é a única barreira contra escrita, então só existe GET, em uma lista fechada de caminhos,
 * com consulta também fechada, no host fixo da configuração. Nada aqui lê o ambiente: quem chama passa a configuração.
 *
 * Controles: sem redirect (a chave não segue a outro host), erro sem corpo nem `cause`, chave só no cabeçalho `apikey`
 * (nunca em log, erro ou URL), limitador por janela móvel de 60 s e de 1 h (abaixo dos 600/h da conta), 429 respeita
 * `retry_after` até 120 s (acima disso a execução para), 401 e 403 interrompem a execução sem nova tentativa, teto de
 * páginas por execução e teto de 10 MB por resposta. O cliente só expõe `get` e `listarPaginas`.
 */

/** Padrões de caminho aceitos (`\d+` = id numérico). Acrescentar um caminho é decisão revista, não ajuste de passagem. */
export const CAMINHOS_PERMITIDOS: readonly RegExp[] = [
  /^\/(workspaces|boards|cardTypes|customFields|cards|users)$/,
  /^\/boards\/\d+$/,
  /^\/boards\/\d+\/(currentStructure|workflows|columns|lanes)$/,
  /^\/cards\/\d+$/,
  /^\/cards\/\d+\/(revisions|comments)$/,
];

const LISTA_IDS = /^\d{1,12}(,\d{1,12}){0,199}$/;
const DATA = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}Z?)?$/;

/** Parâmetros de consulta aceitos e o formato de cada valor. Qualquer outro nome é recusado antes da rede. */
export const CONSULTA_PERMITIDA: Readonly<Record<string, RegExp>> = {
  page: /^\d{1,5}$/,
  per_page: /^\d{1,3}$/,
  board_ids: LISTA_IDS,
  workflow_ids: LISTA_IDS,
  card_ids: LISTA_IDS,
  is_archived: /^[01]$/,
  is_discarded: /^[01]$/,
  archived_from: DATA,
  archived_to: DATA,
  discarded_from: DATA,
  discarded_to: DATA,
  last_modified_from: DATA,
  last_modified_to: DATA,
};

/** Só em `/cards` (listagem): estado do card e `expand` com valores de uma lista fechada (spike F1, plano 052). */
export const EXPAND_CARDS = /^(custom_fields|transitions|block_times|linked_cards)(,(custom_fields|transitions|block_times|linked_cards)){0,3}$/;
export const CONSULTA_CARDS: Readonly<Record<string, RegExp>> = {
  state: /^(active|archived|discarded)$/,
  expand: EXPAND_CARDS,
};

/** ADR 0020, revisão 3 (R3-1 e R3-4): `/users` aceita só estes dois parâmetros, e `fields` com exatamente este valor. */
export const CAMPOS_USERS = 'user_id,realname';
export const CONSULTA_USERS: Readonly<Record<string, RegExp>> = {
  fields: /^user_id,realname$/,
  user_ids: LISTA_IDS,
};

/** Tamanho máximo de `user_ids` por chamada (o mesmo limite de `LISTA_IDS`). */
export const LOTE_USER_IDS = 200;

/** Divide uma lista grande de ids de usuário em valores de `user_ids`, no máximo `LOTE_USER_IDS` ids cada. */
export function lotesDeUserIds(ids: readonly (number | string)[]): string[] {
  const lotes: string[] = [];
  for (let i = 0; i < ids.length; i += LOTE_USER_IDS) lotes.push(ids.slice(i, i + LOTE_USER_IDS).join(','));
  return lotes;
}

export type TipoErroHttp =
  | 'caminho'
  | 'consulta'
  | 'host'
  | 'configuracao'
  | 'redirect'
  | 'autenticacao'
  | 'indisponivel'
  | 'tempo-esgotado'
  | 'http'
  | 'formato'
  | 'limite-paginas'
  | 'limite-bytes'
  | 'limite-requisicoes';

/** Erro próprio: mensagem de texto fixo, sem corpo da resposta, sem cabeçalhos e sem `cause`. */
export class ErroBusinessMap extends Error {
  constructor(
    readonly tipo: TipoErroHttp,
    mensagem: string,
    readonly status?: number,
  ) {
    super(mensagem);
    this.name = 'ErroBusinessMap';
  }
}

export interface ConfigHttp {
  urlBase: string;
  apikey: string;
  limitePorMinuto: number;
  /** Requisições por janela móvel de 1 h; ao chegar, a execução para. Padrão 550 (a conta tem 600/h). */
  limitePorHora?: number;
  /** Bytes por resposta; acima disso, erro `limite-bytes`. Padrão 10 MB. */
  tetoBytes?: number;
  timeoutMs: number;
  paginaTamanho?: number;
  /** Páginas lidas por `listarPaginas` em toda a vida deste cliente (uma execução). */
  tetoPaginas?: number;
}

/** Evento de log sem chave, sem query e sem corpo: só o caminho validado e o status. */
export interface EventoHttp {
  evento: 'requisicao' | 'resposta' | 'espera-429' | 'nova-tentativa' | 'interrompido';
  caminho: string;
  status?: number;
  esperaMs?: number;
}

export interface DepsHttp {
  fetchImpl?: typeof fetch;
  dormir?: (ms: number) => Promise<void>;
  agora?: () => number;
  log?: (e: EventoHttp) => void;
}

const LOOPBACK = new Set(['127.0.0.1', 'localhost', '[::1]']);
const JANELA_MS = 60_000;
const HORA_MS = 3_600_000;
const LIMITE_HORA_PADRAO = 550;
const TETO_BYTES_PADRAO = 10 * 1024 * 1024;
const RETRY_AFTER_MAXIMO_S = 120;
const MAX_ESPERAS_429 = 5;
const MAX_TENTATIVAS = 3;
const TETO_PAGINAS_PADRAO = 500;

/** https sempre; http só em loopback (servidor falso dos testes). Sem usuário, senha, query ou fragmento. */
function baseSegura(valor: string): URL {
  const u = URL.canParse(valor) ? new URL(valor) : undefined;
  const ok =
    u !== undefined &&
    (u.protocol === 'https:' || (u.protocol === 'http:' && LOOPBACK.has(u.hostname))) &&
    u.username === '' &&
    u.password === '' &&
    u.search === '' &&
    u.hash === '';
  if (!ok) throw new ErroBusinessMap('configuracao', 'URL base inválida: exige https, sem credencial, consulta nem fragmento');
  return u;
}

const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

const envelopePaginado = z.object({
  data: z.union([
    z.array(z.unknown()),
    z.object({ data: z.array(z.unknown()), pagination: z.object({ all_pages: z.number().int().min(0) }).optional() }),
  ]),
});

export function criarClienteHttp(cfg: ConfigHttp, deps: DepsHttp = {}) {
  const base = baseSegura(cfg.urlBase);
  const prefixo = base.pathname.replace(/\/+$/, '');
  const fetchImpl = deps.fetchImpl ?? fetch;
  const dormir = deps.dormir ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const agora = deps.agora ?? Date.now;
  const log = deps.log ?? (() => undefined);
  const teto = cfg.tetoPaginas ?? TETO_PAGINAS_PADRAO;
  const limiteHora = cfg.limitePorHora ?? LIMITE_HORA_PADRAO;
  const tetoBytes = cfg.tetoBytes ?? TETO_BYTES_PADRAO;
  const janela: number[] = [];
  const horaria: number[] = [];
  /** Erro que parou a execução (autenticação ou limite de requisições); as chamadas seguintes repetem o mesmo erro. */
  let parada: ErroBusinessMap | undefined;
  let paginasLidas = 0;

  function interromper(erro: ErroBusinessMap): never {
    parada = erro;
    throw erro;
  }

  /**
   * Janelas móveis de 60 s (`limitePorMinuto`, espera) e de 1 h (`limitePorHora`, interrompe a execução: a carga é
   * retomável). Contam toda requisição, inclusive novas tentativas e esperas de 429.
   */
  async function esperarVaga(): Promise<void> {
    for (;;) {
      const t = agora();
      while (janela.length > 0 && t - janela[0]! >= JANELA_MS) janela.shift();
      while (horaria.length > 0 && t - horaria[0]! >= HORA_MS) horaria.shift();
      if (horaria.length >= limiteHora) {
        interromper(new ErroBusinessMap('limite-requisicoes', `limite de ${limiteHora} requisições por hora atingido; execução interrompida`));
      }
      if (janela.length < cfg.limitePorMinuto) {
        janela.push(t);
        horaria.push(t);
        return;
      }
      await dormir(janela[0]! + JANELA_MS - t);
    }
  }

  function montarAlvo(caminho: string, consulta: Readonly<Record<string, string | number>>): string {
    if (/^[a-z][a-z0-9+.-]*:|^\/\//i.test(caminho)) throw new ErroBusinessMap('host', 'caminho com host próprio recusado');
    if (!CAMINHOS_PERMITIDOS.some((p) => p.test(caminho))) throw new ErroBusinessMap('caminho', `caminho fora da lista fechada: ${caminho.slice(0, 60)}`);
    // `/users` só devolve id e nome (ADR 0020 rev. 3): exige `fields` e `user_ids` e recusa qualquer outro parâmetro.
    const ehUsers = caminho === '/users';
    const permitida = ehUsers ? CONSULTA_USERS : caminho === '/cards' ? { ...CONSULTA_PERMITIDA, ...CONSULTA_CARDS } : CONSULTA_PERMITIDA;
    const params = new URLSearchParams();
    for (const [nome, bruto] of Object.entries(consulta)) {
      const valor = String(bruto);
      if (!Object.hasOwn(permitida, nome) || !permitida[nome]!.test(valor)) {
        throw new ErroBusinessMap('consulta', `parâmetro de consulta recusado: ${nome.slice(0, 30)}`);
      }
      params.set(nome, valor);
    }
    if (ehUsers && !(params.has('fields') && params.has('user_ids'))) {
      throw new ErroBusinessMap('consulta', `/users exige fields=${CAMPOS_USERS} e user_ids`);
    }
    const q = params.toString();
    return `${base.origin}${prefixo}${caminho}${q === '' ? '' : `?${q}`}`;
  }

  /** Segundos pedidos pelo 429 (mínimo 1; sem valor, 60). Acima de `RETRY_AFTER_MAXIMO_S` quem chama interrompe. */
  const segundos429 = (texto: string, header: string | null): number => {
    let corpo: unknown;
    try {
      corpo = JSON.parse(texto);
    } catch {
      corpo = undefined;
    }
    const doCorpo = ehObjeto(corpo) ? Number(corpo.retry_after) : NaN;
    const valor = Number.isFinite(doCorpo) ? doCorpo : header === null ? NaN : Number(header);
    return Math.max(Number.isFinite(valor) ? valor : 60, 1);
  };

  /** Lê o corpo com teto de bytes (cabeçalho `content-length` e leitura em blocos); acima do teto, erro e descarte. */
  async function lerCorpo(resp: Response, caminho: string): Promise<string> {
    const excedeu = (): ErroBusinessMap => new ErroBusinessMap('limite-bytes', `GET ${caminho}: resposta acima de ${tetoBytes} bytes`, resp.status);
    if (Number(resp.headers.get('content-length')) > tetoBytes) {
      await resp.body?.cancel();
      throw excedeu();
    }
    const partes: Uint8Array[] = [];
    let total = 0;
    // sair do laço pelo `throw` fecha e cancela o fluxo (o fluxo está bloqueado pelo iterador, então não há cancel manual)
    for await (const parte of resp.body ?? []) {
      total += parte.byteLength;
      if (total > tetoBytes) throw excedeu();
      partes.push(parte);
    }
    return Buffer.concat(partes).toString('utf8');
  }

  /** Única porta de saída da rede, interna e só GET. O caminho é validado antes de qualquer log ou chamada. */
  async function requisitar(caminho: string, consulta: Readonly<Record<string, string | number>> = {}): Promise<unknown> {
    const alvo = montarAlvo(caminho, consulta);
    if (parada !== undefined) {
      log({ evento: 'interrompido', caminho });
      throw parada;
    }
    let falhas = 0;
    let esperas = 0;
    for (;;) {
      await esperarVaga();
      log({ evento: 'requisicao', caminho });
      let motivo: { tipo: 'indisponivel' | 'tempo-esgotado'; texto: string };
      try {
        const resp = await fetchImpl(alvo, {
          method: 'GET',
          headers: { apikey: cfg.apikey, accept: 'application/json' },
          redirect: 'manual',
          signal: AbortSignal.timeout(cfg.timeoutMs),
        });
        const status = resp.status;
        log({ evento: 'resposta', caminho, status });
        if (status >= 300 && status < 400) {
          await resp.body?.cancel();
          throw new ErroBusinessMap('redirect', `GET ${caminho} respondeu redirecionamento ${status}; não seguido`, status);
        }
        if (status === 401 || status === 403) {
          await resp.body?.cancel();
          interromper(new ErroBusinessMap('autenticacao', `GET ${caminho} respondeu ${status}`, status));
        }
        if (status === 429) {
          const segundos = segundos429(await lerCorpo(resp, caminho), resp.headers.get('retry-after'));
          if (segundos > RETRY_AFTER_MAXIMO_S) {
            interromper(new ErroBusinessMap('limite-requisicoes', `GET ${caminho}: retry_after acima de ${RETRY_AFTER_MAXIMO_S} s; execução interrompida`, 429));
          }
          const espera = segundos * 1000;
          if (esperas >= MAX_ESPERAS_429) throw new ErroBusinessMap('indisponivel', `GET ${caminho}: limite de 429 esgotado`, 429);
          esperas += 1;
          log({ evento: 'espera-429', caminho, status, esperaMs: espera });
          await dormir(espera);
          continue;
        }
        if (status >= 500) {
          await resp.body?.cancel();
          motivo = { tipo: 'indisponivel', texto: `HTTP ${status}` };
        } else if (status >= 400) {
          await resp.body?.cancel();
          throw new ErroBusinessMap('http', `GET ${caminho} respondeu ${status}`, status);
        } else {
          const texto = await lerCorpo(resp, caminho);
          try {
            return JSON.parse(texto) as unknown;
          } catch {
            throw new ErroBusinessMap('formato', `GET ${caminho}: resposta não é JSON`, status);
          }
        }
      } catch (e) {
        if (e instanceof ErroBusinessMap) throw e;
        const nome = (e as { name?: string }).name;
        const codigo = String((e as { cause?: { code?: string } }).cause?.code ?? '');
        const esgotou = nome === 'TimeoutError' || nome === 'AbortError';
        motivo = {
          tipo: esgotou ? 'tempo-esgotado' : 'indisponivel',
          texto: esgotou ? 'tempo esgotado' : /^[A-Z_]{3,30}$/.test(codigo) ? `erro de rede ${codigo}` : 'erro de rede',
        };
      }
      falhas += 1;
      if (falhas >= MAX_TENTATIVAS) throw new ErroBusinessMap(motivo.tipo, `GET ${caminho}: ${motivo.texto} (${MAX_TENTATIVAS} tentativas)`);
      log({ evento: 'nova-tentativa', caminho });
      await dormir(falhas === 1 ? 1000 : 4000);
    }
  }

  /** GET de um caminho da lista; a resposta passa pelo schema zod do chamador (sem ele, devolve `unknown`). */
  async function get<T = unknown>(
    caminho: string,
    opcoes: { consulta?: Readonly<Record<string, string | number>>; esquema?: z.ZodType<T> } = {},
  ): Promise<T> {
    const corpo = await requisitar(caminho, opcoes.consulta);
    if (!opcoes.esquema) return corpo as T;
    const r = opcoes.esquema.safeParse(corpo);
    if (!r.success) throw new ErroBusinessMap('formato', `GET ${caminho}: resposta fora do formato esperado`);
    return r.data;
  }

  /** Lê todas as páginas (`page`, `per_page`), respeitando o teto de páginas da execução. */
  async function listarPaginas<T = unknown>(
    caminho: string,
    opcoes: { consulta?: Readonly<Record<string, string | number>>; esquemaItem?: z.ZodType<T> } = {},
  ): Promise<T[]> {
    const itens: unknown[] = [];
    let todas = 1;
    for (let pagina = 1; pagina <= todas; pagina += 1) {
      if (paginasLidas >= teto) throw new ErroBusinessMap('limite-paginas', `GET ${caminho}: teto de ${teto} páginas por execução atingido`);
      paginasLidas += 1;
      const consulta = { per_page: cfg.paginaTamanho ?? 100, ...opcoes.consulta, page: pagina };
      const env = envelopePaginado.safeParse(await requisitar(caminho, consulta));
      if (!env.success) throw new ErroBusinessMap('formato', `GET ${caminho}: envelope de página fora do formato esperado`);
      const d = env.data.data;
      if (Array.isArray(d)) {
        itens.push(...d);
        break;
      }
      itens.push(...d.data);
      todas = d.pagination?.all_pages ?? 1;
    }
    if (!opcoes.esquemaItem) return itens as T[];
    const r = z.array(opcoes.esquemaItem).safeParse(itens);
    if (!r.success) throw new ErroBusinessMap('formato', `GET ${caminho}: itens fora do formato esperado`);
    return r.data;
  }

  return { get, listarPaginas };
}

export type ClienteHttp = ReturnType<typeof criarClienteHttp>;
