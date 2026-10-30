import { z } from 'zod';

// Diagnóstico da estrutura do BusinessMap (WS1, K-185): só GET, lista fechada de caminhos, allow-list na saída.
// Não lê card nem pessoa; a chave vai só no cabeçalho `apikey` e nunca em saída, erro ou URL.

/** Conjunto fechado de caminhos (`{id}` = id numérico de quadro). Qualquer outro pedido é recusado antes da rede. */
export const CAMINHOS_PERMITIDOS = [
  '/workspaces',
  '/boards',
  '/boards/{id}/currentStructure',
  '/boards/{id}/workflows',
  '/cardTypes',
  '/customFields',
] as const;

const PADRAO_CAMINHO = /^\/(workspaces|boards|cardTypes|customFields)$|^\/boards\/\d+\/(currentStructure|workflows)$/;

export const CAMPOS_PERMITIDOS = [
  'workspace_id', 'board_id', 'workflow_id', 'column_id', 'lane_id', 'type_id', 'parent_column_id',
  'name', 'position', 'flow_type', 'section', 'limit', 'type', 'is_archived',
] as const;
export const CAMPOS_CAMPO_CUSTOMIZADO = ['field_id', 'name', 'type'] as const;
const CHAVES_FILHAS = ['workflows', 'columns', 'lanes'] as const;

export type TipoErro = 'autenticacao' | 'indisponivel' | 'tempo-esgotado' | 'http' | 'caminho' | 'formato';
export class ErroDiagnostico extends Error {
  constructor(
    readonly tipo: TipoErro,
    mensagem: string,
  ) {
    super(mensagem);
  }
}

export interface ConfigDiagnostico {
  urlBase: string;
  apikey: string;
  quadrosIds: number[] | undefined;
  limitePorMinuto: number;
  timeoutMs: number;
}

const OBRIGATORIAS = ['BUSINESSMAP_URL_BASE', 'BUSINESSMAP_APIKEY'] as const;

const vazioParaUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);
/** https sempre; http só em loopback (a chave vai no cabeçalho e não pode trafegar em claro). */
function urlSegura(valor: string): boolean {
  const u = URL.canParse(valor) ? new URL(valor) : undefined;
  if (!u) return false;
  if (u.protocol === 'https:') return true;
  return u.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(u.hostname);
}

const esquemaEnv = z.object({
  BUSINESSMAP_URL_BASE: z.string().url().refine(urlSegura),
  BUSINESSMAP_APIKEY: z.string().min(1),
  BUSINESSMAP_QUADROS_IDS: z.preprocess(vazioParaUndefined, z.string().regex(/^\d+(,\d+)*$/).optional()),
  BUSINESSMAP_LIMITE_POR_MINUTO: z.preprocess(vazioParaUndefined, z.coerce.number().int().min(1).max(1000).default(25)),
  BUSINESSMAP_TIMEOUT_MS: z.preprocess(vazioParaUndefined, z.coerce.number().int().min(100).max(600000).default(30000)),
});

/** Valida o ambiente; as mensagens nomeiam a variável e nunca mostram valor. */
export function lerConfig(env: Record<string, string | undefined>): ConfigDiagnostico {
  for (const nome of OBRIGATORIAS) {
    if (!env[nome]?.trim()) throw new ErroDiagnostico('formato', `variável obrigatória ausente: ${nome}`);
  }
  const r = esquemaEnv.safeParse(env);
  if (!r.success) {
    const nomes = [...new Set(r.error.issues.map((i) => String(i.path[0])))];
    throw new ErroDiagnostico('formato', `variável inválida: ${nomes.join(', ')}`);
  }
  const d = r.data;
  return {
    urlBase: d.BUSINESSMAP_URL_BASE.replace(/\/+$/, ''),
    apikey: d.BUSINESSMAP_APIKEY,
    quadrosIds: d.BUSINESSMAP_QUADROS_IDS?.split(',').map(Number),
    limitePorMinuto: d.BUSINESSMAP_LIMITE_POR_MINUTO,
    timeoutMs: d.BUSINESSMAP_TIMEOUT_MS,
  };
}

export interface DepsCliente {
  fetchImpl?: typeof fetch;
  dormir?: (ms: number) => Promise<void>;
  agora?: () => number;
}

type Json = unknown;
const ehObjeto = (v: Json): v is Record<string, Json> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Cliente só GET, no conjunto fechado de caminhos; espaça as chamadas pelo limite por minuto. */
export function criarCliente(cfg: ConfigDiagnostico, deps: DepsCliente = {}) {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const dormir = deps.dormir ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const agora = deps.agora ?? Date.now;
  const intervalo = Math.ceil(60000 / cfg.limitePorMinuto);
  let ultima: number | undefined;
  const limpar = (t: string) => t.split(cfg.apikey).join('[redigido]');

  const espacar = async () => {
    if (ultima !== undefined) {
      const falta = intervalo - (agora() - ultima);
      if (falta > 0) await dormir(falta);
    }
    ultima = agora();
  };

  const tentarUma = async (caminho: string) => {
    const resp = await fetchImpl(cfg.urlBase + caminho, {
      method: 'GET',
      headers: { apikey: cfg.apikey, accept: 'application/json' },
      redirect: 'error',
      signal: AbortSignal.timeout(cfg.timeoutMs),
    });
    return { status: resp.status, retryHeader: resp.headers.get('retry-after'), texto: await resp.text() };
  };

  const segundos429 = (texto: string, header: string | null): number => {
    let corpo: Json;
    try {
      corpo = JSON.parse(texto);
    } catch {
      corpo = undefined;
    }
    const doCorpo = ehObjeto(corpo) ? Number(corpo.retry_after) : NaN;
    const valor = Number.isFinite(doCorpo) ? doCorpo : header === null ? NaN : Number(header);
    return Math.min(Math.max(Number.isFinite(valor) ? valor : 60, 1), 120);
  };

  /** GET de um caminho da lista; devolve o JSON ou lança ErroDiagnostico (mensagem sem cabeçalhos nem chave). */
  async function get(caminho: string, consulta = ''): Promise<Json> {
    if (!PADRAO_CAMINHO.test(caminho)) throw new ErroDiagnostico('caminho', `caminho fora da lista fechada: ${caminho}`);
    const alvo = caminho + consulta;
    let falhas = 0;
    let esperas = 0;
    let limite429 = false;
    for (;;) {
      await espacar();
      let falha: { tipo: 'indisponivel' | 'tempo-esgotado'; detalhe: string };
      try {
        const r = await tentarUma(alvo);
        if (r.status === 401 || r.status === 403) {
          throw new ErroDiagnostico('autenticacao', `GET ${caminho} respondeu ${r.status}`);
        }
        if (r.status === 429 && esperas < 5) {
          esperas += 1;
          await dormir(segundos429(r.texto, r.retryHeader) * 1000);
          continue;
        }
        if (r.status === 429 || r.status >= 500) {
          limite429 = r.status === 429;
          falha = { tipo: 'indisponivel', detalhe: `HTTP ${r.status}` };
        } else if (r.status >= 400) {
          throw new ErroDiagnostico('http', `GET ${caminho} respondeu ${r.status}`);
        } else {
          try {
            return JSON.parse(r.texto) as Json;
          } catch {
            return undefined;
          }
        }
      } catch (e) {
        if (e instanceof ErroDiagnostico) throw e;
        const nome = (e as { name?: string }).name;
        const codigo = String((e as { cause?: { code?: string } }).cause?.code ?? '');
        const esgotou = nome === 'TimeoutError' || nome === 'AbortError';
        falha = {
          tipo: esgotou ? 'tempo-esgotado' : 'indisponivel',
          detalhe: esgotou ? 'tempo esgotado' : /^[A-Z_]{3,30}$/.test(codigo) ? `erro de rede ${codigo}` : 'erro de rede',
        };
      }
      falhas += 1;
      if (falhas >= 3) throw new ErroDiagnostico(falha.tipo, limpar(`GET ${caminho}: ${falha.detalhe} (${limite429 ? 'limite de 429 esgotado' : '3 tentativas'})`));
      await dormir(falhas === 1 ? 1000 : 4000);
    }
  }
  return { get, intervalo };
}

export type Cliente = ReturnType<typeof criarCliente>;

type Escalar = string | number | boolean | null;
export interface No {
  campos: Record<string, Escalar>;
  filhos: Record<string, No[]>;
}

/** Reduz um objeto da resposta à allow-list: só escalares dos campos permitidos e os filhos de estrutura. */
export function reduzir(valor: Json, permitidos: readonly string[], chave?: string): No | null {
  if (!ehObjeto(valor)) return null;
  const campos: Record<string, Escalar> = {};
  if (chave !== undefined && /^\d+$/.test(chave)) campos.chave = Number(chave);
  for (const nome of permitidos) {
    const v = valor[nome];
    if (v === null || ['string', 'number', 'boolean'].includes(typeof v)) campos[nome] = v as Escalar;
  }
  const filhos: Record<string, No[]> = {};
  for (const nome of CHAVES_FILHAS) {
    const bruto = valor[nome];
    const entradas: [string | undefined, Json][] = Array.isArray(bruto)
      ? bruto.map((v) => [undefined, v])
      : ehObjeto(bruto)
        ? Object.entries(bruto)
        : [];
    const nos = entradas.map(([k, v]) => reduzir(v, permitidos, k)).filter((n): n is No => n !== null);
    if (nos.length > 0) filhos[nome] = nos;
  }
  return { campos, filhos };
}

const chavesTopo = (corpo: Json): string =>
  (ehObjeto(corpo) ? Object.keys(corpo).filter((k) => /^\w{1,40}$/.test(k)).slice(0, 10).join(', ') : '') || '(sem chaves)';

/** Desembrulha `{data:[...]}`, `{data:{data:[...],pagination}}` ou `{data:{...}}`. */
function desembrulhar(corpo: Json): { itens: Json[]; paginas: number } {
  const d = ehObjeto(corpo) ? corpo.data : undefined;
  if (Array.isArray(d)) return { itens: d, paginas: 1 };
  if (ehObjeto(d) && Array.isArray(d.data)) {
    const pag = ehObjeto(d.pagination) ? Number(d.pagination.all_pages) : 1;
    return { itens: d.data, paginas: Number.isFinite(pag) ? Math.min(Math.max(pag, 1), 50) : 1 };
  }
  if (ehObjeto(d)) return { itens: [d], paginas: 1 };
  throw new ErroDiagnostico('formato', `formato não reconhecido: ${chavesTopo(corpo)}`);
}

export async function listar(
  cliente: Cliente,
  caminho: string,
  permitidos: readonly string[] = CAMPOS_PERMITIDOS,
): Promise<No[]> {
  const primeira = desembrulhar(await cliente.get(caminho));
  let itens = primeira.itens;
  for (let p = 2; p <= primeira.paginas; p += 1) {
    itens = itens.concat(desembrulhar(await cliente.get(caminho, `?page=${p}`)).itens);
  }
  return itens.map((i) => reduzir(i, permitidos)).filter((n): n is No => n !== null);
}

const texto = (v: Escalar): string => (typeof v === 'string' ? v.replace(/[\r\n|`]+/g, ' ').slice(0, 120) : String(v));
export function linhas(no: No, nivel = 0): string[] {
  const pad = '  '.repeat(nivel);
  const cab = Object.entries(no.campos).map(([k, v]) => `${k}=${texto(v)}`).join(' · ');
  const saida = [`${pad}- ${cab || '(sem campos permitidos)'}`];
  for (const [nome, nos] of Object.entries(no.filhos)) {
    saida.push(`${pad}  - ${nome}:`);
    for (const n of nos) saida.push(...linhas(n, nivel + 2));
  }
  return saida;
}

interface Secao {
  titulo: string;
  nos?: No[];
  aviso?: string;
}

export interface ResultadoDiagnostico {
  codigo: number;
  saida: string;
  erro: string;
}

export interface DepsDiagnostico extends DepsCliente {
  env: Record<string, string | undefined>;
}

const idDe = (no: No): number | undefined => {
  const id = no.campos.board_id;
  return typeof id === 'number' && Number.isInteger(id) && id > 0 ? id : undefined;
};

/** Roda o diagnóstico e devolve o relatório em Markdown (stdout) ou a mensagem de erro (stderr) e o código de saída. */
export async function diagnosticar(deps: DepsDiagnostico): Promise<ResultadoDiagnostico> {
  let cfg: ConfigDiagnostico;
  try {
    cfg = lerConfig(deps.env);
  } catch (e) {
    return { codigo: 2, saida: '', erro: (e as Error).message };
  }
  const cliente = criarCliente(cfg, deps);
  const limpar = (t: string) => t.split(cfg.apikey).join('[redigido]');
  const secao = async (titulo: string, caminho: string, permitidos?: readonly string[]): Promise<Secao> => {
    try {
      return { titulo, nos: await listar(cliente, caminho, permitidos) };
    } catch (e) {
      const erro = e as ErroDiagnostico;
      if (erro.tipo === 'autenticacao') throw erro;
      return { titulo, aviso: limpar(`${erro.tipo}: ${erro.message}`) };
    }
  };
  try {
    const secoes: Secao[] = [await secao('Espaços de trabalho', '/workspaces')];
    const quadros = await secao('Quadros', '/boards');
    if (quadros.nos && cfg.quadrosIds) {
      const filtro = cfg.quadrosIds;
      quadros.nos = quadros.nos.filter((n) => filtro.includes(idDe(n) ?? -1));
    }
    secoes.push(quadros);
    for (const quadro of quadros.nos ?? []) {
      const id = idDe(quadro);
      if (id === undefined) continue;
      secoes.push(await secao(`Quadro ${id}: workflows`, `/boards/${id}/workflows`));
      secoes.push(await secao(`Quadro ${id}: estrutura (colunas e raias)`, `/boards/${id}/currentStructure`));
    }
    secoes.push(await secao('Tipos de card', '/cardTypes'));
    secoes.push(await secao('Campos customizados (id, nome e tipo)', '/customFields', CAMPOS_CAMPO_CUSTOMIZADO));
    const partes = [
      '# Diagnóstico da estrutura do BusinessMap',
      '',
      `Gerado em ${new Date((deps.agora ?? Date.now)()).toISOString()}. Só leitura: sem cards, sem campos de pessoa, sem valores de campos; confira os nomes de quadro, coluna e raia antes de colar.`,
    ];
    for (const s of secoes) {
      partes.push('', `## ${s.titulo}`, '');
      if (s.aviso) partes.push(`> ${s.aviso}`);
      else if (s.nos?.length) for (const n of s.nos) partes.push(...linhas(n));
      else partes.push('(vazio)');
    }
    return { codigo: 0, saida: partes.join('\n') + '\n', erro: '' };
  } catch (e) {
    return { codigo: 1, saida: '', erro: limpar(`${(e as ErroDiagnostico).tipo}: ${(e as Error).message}`) };
  }
}
