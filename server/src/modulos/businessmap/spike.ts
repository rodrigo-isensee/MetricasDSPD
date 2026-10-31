import { mkdir, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { criarClienteHttp, CAMPOS_USERS, type ClienteHttp, type DepsHttp, type ErroBusinessMap } from '../../plataforma/http.js';
import { analisarConferencia, type Conferencia } from './conferencia.js';
import { lerConfig } from './diagnostico.js';
import { caminhosComNome, desembrulhar, linhasDeForma, somarForma, type Forma } from './spike-forma.js';
import { montarLista, renderizarLista } from './spike-lista.js';

// F1 do plano 052 (K-182, ADR 0022): spike de leitura da FORMA do quadro real. CLI manual, nunca agendada, só GET pelo
// cliente da F0 (lista fechada de caminhos e de parâmetros). A saída bruta (com o que o quadro devolve, inclusive
// pessoa) vai só para um diretório do usuário FORA do clone; o relatório e a lista de conferência não têm valor de
// campo nem de pessoa: só nomes de campo, tipos, contagens, ids de estrutura e nomes de coluna. Não grava staging.

export const EXPAND_F1 = 'custom_fields,transitions,block_times,linked_cards';
const POR_PAGINA = 25;
const REVISOES_DE = 3;
const FATAIS = new Set(['autenticacao', 'limite-requisicoes', 'limite-paginas', 'limite-bytes', 'configuracao']);
const CHAVE_PESSOA = /owner|user|assignee|contributor|responsible|member|author|creator|reporter/i;

/** O diretório da saída bruta não pode estar dentro do clone (nem ser o clone). */
export function foraDoRepositorio(dir: string, raiz: string): string {
  const alvo = resolve(dir);
  const rel = relative(resolve(raiz), alvo);
  if (rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))) throw new Error('diretório da saída bruta dentro do repositório recusado');
  return alvo;
}

const dia = (d: Date): string => d.toISOString().slice(0, 10);
const doisFormatos = (d: Date): string[] => [dia(d), `${dia(d)}T00:00:00Z`];

export type VeredictoFiltro = 'filtra' | 'nao-filtra' | 'indeterminado';

/** O filtro de data com `state` funciona se, em todo quadro com cards no estado, a data futura zera a contagem. */
export function veredictoFiltro(linhas: readonly { total: number | undefined; futuro: number | undefined }[]): VeredictoFiltro {
  const comDado = linhas.filter((l) => l.total !== undefined && l.total > 0 && l.futuro !== undefined);
  if (comDado.length === 0) return 'indeterminado';
  return comDado.every((l) => l.futuro === 0) ? 'filtra' : 'nao-filtra';
}

/** Resposta sobre a paginação de /customFields a partir do tamanho das páginas 1 e 2 e de a 2 repetir a 1. */
export function veredictoPaginacao(n1: number | undefined, n2: number | undefined, repete: boolean): string {
  if (n1 === undefined || n2 === undefined || n1 === 0) return 'indeterminado';
  if (n2 === 0) return `não há segunda página (${n1} definições no total)`;
  return repete ? 'o parâmetro page é ignorado (a página 2 repete a 1)' : 'sim, /customFields pagina';
}

export interface DepsSpike extends DepsHttp {
  env: Record<string, string | undefined>;
  /** Diretório do usuário onde fica a saída bruta (fora do clone). */
  dirSaida: string;
  raizRepositorio: string;
  /** Texto do arquivo de conferência versionado. */
  textoConferencia: string;
}

export interface ResultadoSpike {
  codigo: number;
  saida: string;
  erro: string;
}

interface Contagens {
  quadro: number;
  abertos: number | undefined;
  arquivados12m: number | undefined;
  descartados12m: number | undefined;
  arquivadosTotal: number | undefined;
  descartadosTotal: number | undefined;
  arquivadosFuturo: number | undefined;
  descartadosFuturo: number | undefined;
}

const n = (v: number | undefined): string => (v === undefined ? 'n/d' : String(v));
const nomeSeguro = (t: string): string => t.replace(/[^a-z0-9_-]/gi, '_').slice(0, 60);

/** Roda o spike e devolve o relatório de forma e a lista de conferência (stdout) ou o erro (stderr) e o código de saída. */
export async function executarSpike(deps: DepsSpike): Promise<ResultadoSpike> {
  let conf: Conferencia;
  let dir: string;
  let quadros: number[];
  let cliente: ClienteHttp;
  let apikey: string;
  try {
    const cfg = lerConfig(deps.env);
    if (cfg.quadrosIds === undefined) throw new Error('variável obrigatória ausente: BUSINESSMAP_QUADROS_IDS');
    quadros = cfg.quadrosIds;
    apikey = cfg.apikey;
    dir = foraDoRepositorio(deps.dirSaida, deps.raizRepositorio);
    conf = analisarConferencia(deps.textoConferencia);
    cliente = criarClienteHttp(
      { urlBase: cfg.urlBase, apikey, limitePorMinuto: cfg.limitePorMinuto, timeoutMs: cfg.timeoutMs },
      deps,
    );
  } catch (e) {
    return { codigo: 2, saida: '', erro: (e as Error).message };
  }
  const limpar = (t: string): string => t.split(apikey).join('[redigido]');
  const agora = new Date((deps.agora ?? Date.now)());
  const avisos: string[] = [];

  await mkdir(dir, { recursive: true, mode: 0o700 });
  /** GET com a resposta bruta gravada fora do clone; falha não fatal vira aviso e `undefined`. */
  const ler = async (rotulo: string, caminho: string, consulta: Record<string, string | number> = {}): Promise<unknown> => {
    let corpo: unknown;
    try {
      corpo = await cliente.get(caminho, { consulta });
    } catch (e) {
      const erro = e as ErroBusinessMap;
      if (FATAIS.has(erro.tipo)) throw erro;
      avisos.push(limpar(`${rotulo}: ${erro.tipo}: ${erro.message}`));
      return undefined;
    }
    await writeFile(join(dir, `${nomeSeguro(rotulo)}.json`), JSON.stringify(corpo, null, 2), { mode: 0o600 });
    return corpo;
  };
  /** Contagem exata pelo truque de `per_page=1` (as páginas são os cards); `undefined` se a resposta não disser. */
  const contar = async (rotulo: string, consulta: Record<string, string | number>): Promise<number | undefined> => {
    const corpo = await ler(rotulo, '/cards', { per_page: 1, page: 1, ...consulta });
    if (corpo === undefined) return undefined;
    const d = desembrulhar(corpo);
    return d.itens.length === 0 ? 0 : d.paginas;
  };

  try {
    // 1. Estrutura: uma vez por quadro (colunas, raias, workflows) e os tipos de card.
    const estruturas = new Map<number, unknown>();
    const formaWorkflows: Forma = new Map();
    const formaEstrutura: Forma = new Map();
    for (const q of quadros) {
      const est = await ler(`quadro-${q}-currentStructure`, `/boards/${q}/currentStructure`);
      if (est !== undefined) {
        estruturas.set(q, est);
        somarForma(est, formaEstrutura);
      }
      const wf = await ler(`quadro-${q}-workflows`, `/boards/${q}/workflows`);
      if (wf !== undefined) somarForma(wf, formaWorkflows);
    }
    const tipos = await ler('cardTypes', '/cardTypes');
    const formaTipos = tipos === undefined ? new Map() : somarForma(tipos);

    // 2. /customFields: pagina? Duas páginas e comparação dos ids (a comparação fica aqui; só o veredito sai).
    const cf1 = await ler('customFields-p1', '/customFields', { page: 1 });
    const cf2 = await ler('customFields-p2', '/customFields', { page: 2 });
    const ids = (c: unknown): string[] => desembrulhar(c).itens.map((i) => String(Object(i).field_id));
    const n1 = cf1 === undefined ? undefined : ids(cf1).length;
    const n2 = cf2 === undefined ? undefined : ids(cf2).length;
    const pagina = veredictoPaginacao(n1, n2, ids(cf1).join() === ids(cf2).join());
    const chavesPaginacao = cf1 === undefined ? [] : desembrulhar(cf1).chavesPaginacao;

    // 3. Uma página de /cards por quadro com o expand da F1 (estado aberto) e as contagens do recorte.
    const formaCards: Forma = new Map();
    const exemplos: { quadro: number; id: number; donos: number[] }[] = [];
    const contagens: Contagens[] = [];
    const inicio12m = new Date(agora);
    inicio12m.setUTCFullYear(inicio12m.getUTCFullYear() - 1);
    const amanha = new Date(agora.getTime() + 86_400_000);
    let formato: string | undefined;
    /** Contagem de arquivados/descartados com data; tenta a data simples e, se recusada, a data com hora. */
    const comData = async (rotulo: string, state: 'archived' | 'discarded', campo: string, d: Date, q: number): Promise<number | undefined> => {
      const formatos = doisFormatos(d);
      const tentativas = formato === undefined ? formatos : [formatos[formato === 'AAAA-MM-DD' ? 0 : 1]!];
      for (const valor of tentativas) {
        const antes = avisos.length;
        const r = await contar(rotulo, { board_ids: String(q), state, [campo]: valor });
        if (avisos.length === antes) {
          formato = valor.includes('T') ? 'AAAA-MM-DDTHH:mm:ssZ' : 'AAAA-MM-DD';
          return r;
        }
      }
      return undefined;
    };
    for (const q of quadros) {
      const pagina1 = await ler(`quadro-${q}-cards-abertos`, '/cards', {
        board_ids: String(q), state: 'active', per_page: POR_PAGINA, page: 1, expand: EXPAND_F1,
      });
      if (pagina1 !== undefined) {
        for (const card of desembrulhar(pagina1).itens) {
          somarForma(card, formaCards);
          const c = Object(card) as { card_id?: unknown; owner_user_id?: unknown; co_owner_ids?: unknown };
          if (typeof c.card_id === 'number') {
            const donos = [c.owner_user_id, ...(Array.isArray(c.co_owner_ids) ? c.co_owner_ids : [])].filter((x): x is number => typeof x === 'number');
            exemplos.push({ quadro: q, id: c.card_id, donos });
          }
        }
      }
      contagens.push({
        quadro: q,
        abertos: await contar(`quadro-${q}-contagem-abertos`, { board_ids: String(q), state: 'active' }),
        arquivados12m: await comData(`quadro-${q}-contagem-arquivados-12m`, 'archived', 'archived_from', inicio12m, q),
        descartados12m: await comData(`quadro-${q}-contagem-descartados-12m`, 'discarded', 'discarded_from', inicio12m, q),
        arquivadosTotal: await contar(`quadro-${q}-contagem-arquivados`, { board_ids: String(q), state: 'archived' }),
        descartadosTotal: await contar(`quadro-${q}-contagem-descartados`, { board_ids: String(q), state: 'discarded' }),
        arquivadosFuturo: await comData(`quadro-${q}-contagem-arquivados-futuro`, 'archived', 'archived_from', amanha, q),
        descartadosFuturo: await comData(`quadro-${q}-contagem-descartados-futuro`, 'discarded', 'discarded_from', amanha, q),
      });
    }

    // 4. Revisões de poucos cards (um por quadro, até 3) e comentários (primeiro card com comentário).
    const formaRevisoes: Forma = new Map();
    const formaComentarios: Forma = new Map();
    const escolhidos = quadros.flatMap((q) => exemplos.filter((e) => e.quadro === q).slice(0, 1)).slice(0, REVISOES_DE);
    for (const e of escolhidos) {
      const rev = await ler(`card-${e.id}-revisions`, `/cards/${e.id}/revisions`);
      if (rev !== undefined) somarForma(rev, formaRevisoes);
    }
    for (const e of escolhidos) {
      const com = await ler(`card-${e.id}-comments`, `/cards/${e.id}/comments`);
      if (com !== undefined && desembrulhar(com).itens.length > 0) {
        somarForma(com, formaComentarios);
        break;
      }
    }

    // 5. /users: só `fields=user_id,realname` e `user_ids`; só a forma (nunca o nome) entra no relatório.
    const donos = [...new Set(exemplos.flatMap((e) => e.donos))].slice(0, 3);
    const formaUsers: Forma = new Map();
    let usersRestringe = donos.length === 0 ? 'indeterminado (sem ids de usuário na amostra)' : 'indeterminado (sem resposta de /users)';
    if (donos.length > 0) {
      const u = await ler('users', '/users', { fields: CAMPOS_USERS, user_ids: donos.join(',') });
      if (u !== undefined) {
        somarForma(u, formaUsers);
        const campos = [...formaUsers.keys()].filter((c) => /\[\]\.[^.[]+$/.test(c)).map((c) => c.split('.').pop()!);
        const extras = campos.filter((c) => c !== 'user_id' && c !== 'realname');
        usersRestringe = campos.length === 0 ? 'indeterminado (resposta sem itens)' : extras.length === 0 ? 'sim, só user_id e realname' : `não: campos extras ${extras.join(', ')}`;
      }
    }

    // Relatório de forma (sem valor de pessoa) e lista de conferência.
    const veredicto = veredictoFiltro(
      contagens.flatMap((c) => [
        { total: c.arquivadosTotal, futuro: c.arquivadosFuturo },
        { total: c.descartadosTotal, futuro: c.descartadosFuturo },
      ]),
    );
    const secao = (titulo: string, forma: Forma, filtro?: (c: string) => boolean): string[] => {
      const l = linhasDeForma(forma, filtro);
      return ['', `## ${titulo}`, '', ...(l.length > 0 ? l : ['(sem dados)'])];
    };
    const estado = ['state', 'is_archived', 'is_discarded', 'archived_at', 'discarded_at'].map((k) => `${k}: ${formaCards.has(`$.${k}`) ? 'presente' : 'ausente'}`);
    const revPessoa = caminhosComNome(formaRevisoes, CHAVE_PESSOA);
    const relatorio = [
      '# Relatório de forma do quadro real (F1, spike)',
      '',
      `Gerado em ${agora.toISOString()}. Quadros: ${quadros.join(', ')}. Só nomes de campo, tipos e contagens: nenhum valor de campo, texto ou pessoa. Saída bruta fora do repositório.`,
      '',
      '## Perguntas do plano',
      '',
      `- Paginação de /customFields: ${pagina}. Itens na página 1: ${n(n1)}; na página 2: ${n(n2)}. Chaves de paginação: ${chavesPaginacao.join(', ') || '(nenhuma)'}.`,
      `- Tipos de card por workflow (caminhos com tipo na resposta de /workflows): ${caminhosComNome(formaWorkflows, /type/i).join(', ') || '(nenhum)'}.`,
      `- Campos de estado no card: ${estado.join('; ')}.`,
      `- Formato de data aceito nos filtros de arquivamento e descarte: ${formato ?? 'nenhum aceito'}.`,
      `- Filtros archived_from e discarded_from com state: ${veredicto} (controle: data de amanhã deve zerar a contagem).`,
      `- GET /users com fields=${CAMPOS_USERS}: ${usersRestringe}.`,
      `- Troca de responsável nas revisões (P-T1): chaves de nome parecido com pessoa nas revisões: ${revPessoa.join(', ') || '(nenhuma)'}.`,
      '',
      '## Contagem de cards por quadro (recorte da carga inicial, Q-2b)',
      '',
      '| Quadro | Abertos | Arquivados 12 meses | Descartados 12 meses | Arquivados total | Descartados total | Arquivados após amanhã | Descartados após amanhã |',
      '|---|---|---|---|---|---|---|---|',
      ...contagens.map((c) => `| ${c.quadro} | ${n(c.abertos)} | ${n(c.arquivados12m)} | ${n(c.descartados12m)} | ${n(c.arquivadosTotal)} | ${n(c.descartadosTotal)} | ${n(c.arquivadosFuturo)} | ${n(c.descartadosFuturo)} |`),
      ...secao('Forma do card (estado aberto, expand custom_fields, transitions, block_times, linked_cards)', formaCards),
      ...secao('Forma de transitions', formaCards, (c) => c.includes('.transitions')),
      ...secao('Forma de block_times', formaCards, (c) => c.includes('.block_times')),
      ...secao('Forma de linked_cards (tamanho da lista = vínculos por card)', formaCards, (c) => c.includes('.linked_cards')),
      ...secao('Forma de /boards/{id}/workflows', formaWorkflows),
      ...secao('Forma de /boards/{id}/currentStructure', formaEstrutura),
      ...secao('Forma de /cardTypes', formaTipos),
      ...secao('Forma das revisões de poucos cards', formaRevisoes),
      ...secao('Forma dos comentários (O22)', formaComentarios),
      ...secao('Forma de GET /users', formaUsers),
      '',
      '## Avisos',
      '',
      ...(avisos.length > 0 ? avisos.map((a) => `- ${a}`) : ['(nenhum)']),
      '',
    ].join('\n');
    const lista = renderizarLista(montarLista(estruturas, conf), conf, quadros);
    await writeFile(join(dir, 'relatorio-forma.md'), relatorio, { mode: 0o600 });
    await writeFile(join(dir, 'lista-conferencia-colunas.md'), lista, { mode: 0o600 });
    return { codigo: 0, saida: `${relatorio}\n---\n\n${lista}`, erro: '' };
  } catch (e) {
    const erro = e as ErroBusinessMap;
    return { codigo: 1, saida: '', erro: limpar(`${erro.tipo ?? 'erro'}: ${erro.message}`) };
  }
}
