import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { chmodSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { analisarConferencia } from '../src/modulos/businessmap/conferencia.js';
import { CAMINHOS_PERMITIDOS, criarClienteHttp } from '../src/plataforma/http.js';
import { executarSpike, foraDoRepositorio, veredictoFiltro, veredictoPaginacao, type DepsSpike } from '../src/modulos/businessmap/spike.js';
import { caminhosComNome, chaveSegura, desembrulhar, linhasDeForma, linhasDeVinculos, somarForma } from '../src/modulos/businessmap/spike-forma.js';
import { excecoesSemColuna, montarLista, papelDaSecao, renderizarLista, tipoDoFlow } from '../src/modulos/businessmap/spike-lista.js';

// Servidor falso local: nenhuma chamada ao BusinessMap real, e o `.env` nunca é lido. Cada servidor guarda o que recebeu.
const KEY = 'chave-spike-de-teste-0123456789';
const MARCADORES = ['TITULO-MARCADOR', 'DESCRICAO-MARCADOR', 'VALOR-MARCADOR', 'NOME-MARCADOR', 'pessoa@exemplo.com', 'COMENTARIO-MARCADOR', 'EMAIL-MARCADOR'];
const AGORA = Date.parse('2026-10-30T12:00:00Z');

type Pedido = { metodo: string; caminho: string; consulta: URLSearchParams; apikey: string | undefined; url: string };
interface Opcoes {
  /** 'normal': a página 2 vem vazia; 'pagina': a página 2 traz outros ids; 'ignora': repete a 1; 'falha': 404 nas duas; 'falha2': 404 só na 2. */
  customFields?: 'normal' | 'pagina' | 'ignora' | 'falha' | 'falha2';
  filtroDeData?: boolean;
  rejeitaDataSimples?: boolean;
  rejeitaDatas?: boolean;
  semDonos?: boolean;
  cardsSemId?: boolean;
  semPagina?: boolean;
  users?: 'normal' | 'extras' | 'vazio';
  comentarios?: 'primeiro' | 'segundo' | 'nenhum';
  status?: Record<string, number>;
}

const pessoa = { owner_user_id: 5, co_owner_ids: [6], email: 'pessoa@exemplo.com' };
const colunas = (cs: Record<string, unknown>[]) => Object.fromEntries(cs.map((c) => [String(c.column_id), c]));
const estruturaDe = (quadro: number): unknown => ({
  data: {
    board_id: quadro,
    ...pessoa,
    workflows:
      quadro === 10
        ? {
            '100': {
              workflow_id: 100,
              name: 'WF',
              columns: colunas([
                { column_id: 1001, name: 'Backlog', section: 1, flow_type: 2, parent_column_id: null, ...pessoa },
                { column_id: 1002, name: 'Comprometido', section: 2, flow_type: 2, parent_column_id: null },
                { column_id: 1003, name: 'Pronto (Dev)', section: 3, flow_type: 1, parent_column_id: null },
                { column_id: 1004, name: 'Aguardando Revisão', section: 3, flow_type: 1, parent_column_id: null },
                { column_id: 1005, name: 'Em Homologação', section: 3, flow_type: 1, parent_column_id: null },
                { column_id: 1006, name: 'Encerrado', section: 4, flow_type: 1, parent_column_id: null },
                { column_id: 1007, name: 'Concluído', section: 4, flow_type: 1, parent_column_id: 1006 },
                { column_id: 1008, name: 'Descartado', section: 4, flow_type: 1, parent_column_id: null },
              ]),
              lanes: [{ lane_id: 5, name: 'Raia' }],
            },
          }
        : {
            '101': {
              workflow_id: 101,
              name: 'WF2',
              columns: [
                { column_id: 2001, name: 'Descartado', section: 4, flow_type: 1, parent_column_id: null },
                { column_id: 2002, name: 'Pre-Release', section: 4, flow_type: 1, parent_column_id: null },
                { column_id: 2003, name: 'Sem seção', flow_type: 1, parent_column_id: null },
                { column_id: 2004, name: 'Trabalho sem tipo', section: 3, flow_type: 0, parent_column_id: null },
                { column_id: 2005, name: 'Publicado', section: 5, flow_type: 1, parent_column_id: null },
                { column_id: 2006, section: 1, flow_type: 2, parent_column_id: null },
                { column_id: 2007, name: 'Filha sem seção', flow_type: 2, parent_column_id: 2006 },
              ],
            },
          },
  },
});
const card = (id: number, semDonos: boolean, semId = false): unknown => ({
  ...(semId ? {} : { card_id: id }),
  title: 'TITULO-MARCADOR',
  description: 'DESCRICAO-MARCADOR',
  state: 'active',
  ...(semDonos ? {} : pessoa),
  custom_fields: [{ field_id: 1, value: 'VALOR-MARCADOR', contributor: { realname: 'NOME-MARCADOR' } }],
  transitions: [{ column_id: 1001, start: '2026-01-01T00:00:00Z', end: null }],
  block_times: [{ reason_id: 1, start: '2026-01-01T00:00:00Z' }],
  linked_cards: [
    { card_id: 1, link_type: 'parent' },
    { card_id: 2, link_type: 'parent' },
  ],
  'Nome Livre Com Espaço': 1,
  '123': 'x',
});

const responder = (o: Opcoes, p: Pedido): { status: number; corpo: unknown } => {
  const forcado = o.status?.[p.caminho];
  if (forcado !== undefined) return { status: forcado, corpo: {} };
  const q = p.consulta;
  let m: RegExpMatchArray | null;
  if ((m = /^\/boards\/(\d+)\/currentStructure$/.exec(p.caminho))) return { status: 200, corpo: estruturaDe(Number(m[1])) };
  if (/^\/boards\/\d+\/workflows$/.test(p.caminho)) {
    return { status: 200, corpo: { data: [{ workflow_id: 100, name: 'WF', type: 0, card_type_ids: [1, 2], ...pessoa }] } };
  }
  if (p.caminho === '/cardTypes') return { status: 200, corpo: { data: [{ type_id: 1, name: 'Story' }] } };
  if (p.caminho === '/customFields') {
    const pagina = q.get('page');
    const modo = o.customFields ?? 'normal';
    const item = (id: number) => ({ field_id: id, name: 'Campo', type: 'text' });
    if (modo === 'falha' || (modo === 'falha2' && pagina === '2')) return { status: 404, corpo: {} };
    const dados =
      pagina === '2' && modo === 'normal' ? [] : pagina === '2' && modo === 'pagina' ? [item(3)] : [item(1), item(2)];
    return { status: 200, corpo: { data: dados } };
  }
  if (p.caminho === '/cards') {
    const datas = ['archived_from', 'discarded_from'].map((k) => q.get(k)).filter((v): v is string => v !== null);
    const state = q.get('state');
    if (datas.length > 0 && (o.rejeitaDatas || (o.rejeitaDataSimples && !datas[0]!.includes('T')))) return { status: 400, corpo: {} };
    if (q.get('per_page') === '25' && o.semPagina) return { status: 404, corpo: {} };
    if (q.get('per_page') === '25') {
      const base = Number(q.get('board_ids')) * 100;
      return { status: 200, corpo: { data: { data: [card(base + 1, o.semDonos === true, o.cardsSemId), card(base + 2, o.semDonos === true, o.cardsSemId)], pagination: { all_pages: 1, current_page: 1 } } } };
    }
    const futuro = datas.length > 0 && o.filtroDeData !== false && datas[0]!.slice(0, 10) > '2026-10-30';
    const antigo = datas.length > 0 && o.filtroDeData !== false && !futuro;
    const total = state === 'active' ? 7 : futuro ? 0 : antigo ? 3 : 5;
    return { status: 200, corpo: { data: { data: total === 0 ? [] : [card(1, true)], pagination: { all_pages: total } } } };
  }
  if ((m = /^\/cards\/(\d+)\/revisions$/.exec(p.caminho))) {
    return { status: 200, corpo: { data: [{ revision: 1, owner_user_id: 5, changed_at: 'VALOR-MARCADOR', column_id: 1 }] } };
  }
  if ((m = /^\/cards\/(\d+)\/comments$/.exec(p.caminho))) {
    const tem = (o.comentarios === 'primeiro' && m[1] === '1001') || (o.comentarios === 'segundo' && m[1] === '1101');
    return { status: 200, corpo: { data: tem ? [{ comment_id: 1, text: 'COMENTARIO-MARCADOR', author_user_id: 5 }] : [] } };
  }
  if (p.caminho === '/users') {
    if (o.users === 'vazio') return { status: 200, corpo: { data: [] } };
    return { status: 200, corpo: { data: [{ user_id: 5, realname: 'NOME-MARCADOR', ...(o.users === 'extras' ? { email: 'EMAIL-MARCADOR' } : {}) }] } };
  }
  return { status: 404, corpo: {} };
};

interface Falso {
  server: Server;
  pedidos: Pedido[];
  url: string;
}
let falsos: Falso[] = [];
let tmp: string;
let raiz: string;
beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'spike-bm-'));
  raiz = join(tmp, 'clone');
  mkdirSync(raiz);
});
afterEach(async () => {
  for (const f of falsos) {
    f.server.closeAllConnections();
    await new Promise<void>((ok) => f.server.close(() => ok()));
  }
  falsos = [];
  rmSync(tmp, { recursive: true, force: true });
});

const subir = async (o: Opcoes): Promise<Falso> => {
  const pedidos: Pedido[] = [];
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const u = new URL(req.url ?? '', 'http://x');
    const p: Pedido = { metodo: req.method ?? '', caminho: u.pathname, consulta: u.searchParams, apikey: req.headers.apikey as string | undefined, url: req.url ?? '' };
    pedidos.push(p);
    const r = responder(o, p);
    res.writeHead(r.status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(r.corpo));
  });
  await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok));
  const f = { server, pedidos, url: `http://127.0.0.1:${(server.address() as AddressInfo).port}` };
  falsos.push(f);
  return f;
};

const CONFERENCIA = JSON.stringify({
  versao: 1,
  versao_criterio: { dominio: 'businessmap', descricao: 'teste', motivo: 'teste', referencia: 'teste' },
  excecoes_papel_coluna: [
    { workflow_id: '100', coluna_id: '1003', nome: 'Pronto (Dev)', papel: 'fila', base: 'H-8' },
    { workflow_id: '100', coluna_id: '1999', nome: 'Sumiu', papel: 'fila', base: 'H-8' },
  ],
  excecoes_compromisso: [],
  excecoes_entrega: [],
  colunas_descartado: [{ workflow_id: '100', coluna_id: '1008' }],
  mapa_tipos: { padrao: { eh_item: true, categoria: 'produto' }, tipos: [] },
  notas: [],
});

const rodar = async (f: Falso, o: Partial<DepsSpike> = {}, env: Record<string, string> = {}) =>
  executarSpike({
    env: { BUSINESSMAP_URL_BASE: f.url, BUSINESSMAP_APIKEY: KEY, BUSINESSMAP_QUADROS_IDS: '10,11', BUSINESSMAP_LIMITE_POR_MINUTO: '1000', ...env },
    dirSaida: join(tmp, 'saida'),
    raizRepositorio: raiz,
    textoConferencia: CONFERENCIA,
    agora: () => AGORA,
    dormir: async () => undefined,
    ...o,
  });

describe('F1: execução completa contra o servidor falso', () => {
  it('só GET, só caminhos e parâmetros da lista, chave só no cabeçalho, nenhum valor de pessoa na saída', async () => {
    const f = await subir({ comentarios: 'segundo' });
    const r = await rodar(f);
    expect(r.erro).toBe('');
    expect(r.codigo).toBe(0);
    expect(f.pedidos.length).toBeGreaterThan(20);
    for (const p of f.pedidos) {
      expect(p.metodo).toBe('GET');
      expect(CAMINHOS_PERMITIDOS.some((c) => c.test(p.caminho)), p.caminho).toBe(true);
      expect(p.apikey).toBe(KEY);
      expect(p.url).not.toContain(KEY);
      if (p.consulta.has('expand')) {
        expect(p.caminho).toBe('/cards');
        expect(p.consulta.get('expand')).toBe('custom_fields,transitions,block_times,linked_cards');
      }
    }
    const users = f.pedidos.filter((p) => p.caminho === '/users');
    expect(users).toHaveLength(1);
    expect([...users[0]!.consulta.keys()].sort()).toEqual(['fields', 'user_ids']);
    expect(users[0]!.consulta.get('fields')).toBe('user_id,realname');
    expect(users[0]!.consulta.get('user_ids')).toBe('5,6');
    // os pedidos esperados: uma página de cards por quadro com o expand, revisões de poucos cards, comentários de um card
    expect(f.pedidos.filter((p) => p.caminho === '/cards' && p.consulta.get('per_page') === '25')).toHaveLength(2);
    expect(f.pedidos.filter((p) => /revisions$/.test(p.caminho)).map((p) => p.caminho)).toEqual(['/cards/1001/revisions', '/cards/1101/revisions']);
    expect(f.pedidos.filter((p) => /comments$/.test(p.caminho)).map((p) => p.caminho)).toEqual(['/cards/1001/comments', '/cards/1101/comments']);

    const relatorio = readFileSync(join(tmp, 'saida', 'relatorio-forma.md'), 'utf8');
    const lista = readFileSync(join(tmp, 'saida', 'lista-conferencia-colunas.md'), 'utf8');
    expect(r.saida).toContain(relatorio);
    expect(r.saida).toContain(lista);
    for (const texto of [r.saida, r.erro, relatorio, lista]) {
      for (const marcador of [...MARCADORES, KEY]) expect(texto, marcador).not.toContain(marcador);
      expect(texto).not.toMatch(/@/);
    }
    // a saída bruta fica fora do clone e guarda o que o quadro devolveu (inclusive pessoa)
    const arquivos = readdirSync(join(tmp, 'saida'));
    expect(arquivos).toContain('users.json');
    expect(arquivos).toContain('quadro-10-cards-abertos.json');
    expect(readFileSync(join(tmp, 'saida', 'users.json'), 'utf8')).toContain('NOME-MARCADOR');
    expect(readdirSync(raiz)).toEqual([]);
    // só a forma: chaves de campo, tipos e contagens; chave com espaço e id viram marcadores
    expect(relatorio).toContain('`$.transitions[]`: object (4x)');
    expect(relatorio).toContain('`$.linked_cards`: array (4x, tamanho 2 a 2)');
    expect(relatorio).toContain('<chave>');
    expect(relatorio).toContain('<id>');
    expect(relatorio).toContain('Paginação de /customFields: não há segunda página (2 definições no total)');
    expect(relatorio).toContain('Campos de estado no card: state: presente; is_archived: ausente');
    expect(relatorio).toContain('GET /users com fields=user_id,realname: sim, só user_id e realname');
    expect(relatorio).toContain('chaves de nome parecido com pessoa nas revisões: $.data[].owner_user_id');
    expect(relatorio).toContain('| 10 | 7 | 3 | 3 | 5 | 5 | 0 | 0 |');
    expect(relatorio).toContain('Filtros archived_from e discarded_from com state: filtra');
    expect(relatorio).toContain('Formato de data aceito nos filtros de arquivamento e descarte: AAAA-MM-DD');
    expect(relatorio).toContain('card_type_ids');
  });

  it('paginação de /customFields: as cinco respostas possíveis', async () => {
    const casos: [NonNullable<Opcoes['customFields']>, string][] = [
      ['pagina', 'sim, /customFields pagina'],
      ['ignora', 'o parâmetro page é ignorado'],
      ['falha', 'indeterminado'],
      ['falha2', 'indeterminado'],
    ];
    for (const [modo, esperado] of casos) {
      const f = await subir({ customFields: modo });
      const r = await rodar(f, { dirSaida: join(tmp, `saida-${modo}`) });
      expect(r.codigo).toBe(0);
      expect(r.saida, modo).toContain(`Paginação de /customFields: ${esperado}`);
      if (modo === 'falha') expect(r.saida).toContain('customFields-p1: http');
    }
  });

  it('filtro de data com state: não filtra quando o servidor ignora a data; recusa da data simples cai para data com hora', async () => {
    const ignora = await rodar(await subir({ filtroDeData: false }), { dirSaida: join(tmp, 'a') });
    expect(ignora.saida).toContain('Filtros archived_from e discarded_from com state: nao-filtra');
    const hora = await subir({ rejeitaDataSimples: true });
    const rh = await rodar(hora, { dirSaida: join(tmp, 'b') });
    expect(rh.saida).toContain('Formato de data aceito nos filtros de arquivamento e descarte: AAAA-MM-DDTHH:mm:ssZ');
    expect(rh.saida).toContain('Filtros archived_from e discarded_from com state: filtra');
    const nenhuma = await rodar(await subir({ rejeitaDatas: true }), { dirSaida: join(tmp, 'c') });
    expect(nenhuma.saida).toContain('Formato de data aceito nos filtros de arquivamento e descarte: nenhum aceito');
    expect(nenhuma.saida).toContain('Filtros archived_from e discarded_from com state: indeterminado');
    expect(nenhuma.saida).toContain('| 10 | 7 | n/d | n/d | 5 | 5 | n/d | n/d |');
  });

  it('/users: sem ids na amostra, com campos extras e com resposta vazia', async () => {
    const fSem = await subir({ semDonos: true });
    const sem = await rodar(fSem, { dirSaida: join(tmp, 'a') });
    expect(fSem.pedidos.filter((p) => p.caminho === '/users')).toEqual([]);
    expect(sem.saida).toContain('indeterminado (sem ids de usuário na amostra)');
    const extras = await rodar(await subir({ users: 'extras' }), { dirSaida: join(tmp, 'b') });
    expect(extras.saida).toContain('não: campos extras email');
    expect(extras.saida).not.toContain('EMAIL-MARCADOR');
    const vazio = await rodar(await subir({ users: 'vazio' }), { dirSaida: join(tmp, 'c') });
    expect(vazio.saida).toContain('indeterminado (resposta sem itens)');
    const falha = await rodar(await subir({ status: { '/users': 404 } }), { dirSaida: join(tmp, 'd') });
    expect(falha.saida).toContain('users: http: GET /users respondeu 404');
    expect(falha.saida).toContain('indeterminado (sem resposta de /users)');
  });

  it('comentários: primeiro card com comentário e nenhum card com comentário', async () => {
    const f1 = await subir({ comentarios: 'primeiro' });
    const r1 = await rodar(f1, { dirSaida: join(tmp, 'a') });
    expect(f1.pedidos.filter((p) => /comments$/.test(p.caminho))).toHaveLength(1);
    expect(r1.saida).toContain('## Forma dos comentários (O22)');
    expect(r1.saida).toContain('`$.data[].comment_id`');
    const f0 = await subir({ comentarios: 'nenhum' });
    const r0 = await rodar(f0, { dirSaida: join(tmp, 'b') });
    expect(f0.pedidos.filter((p) => /comments$/.test(p.caminho))).toHaveLength(2);
    expect(r0.saida).not.toContain('comment_id');
  });

  it('401 interrompe a execução sem nova tentativa e sem a chave na mensagem', async () => {
    const f = await subir({ status: { '/boards/10/currentStructure': 401 } });
    const r = await rodar(f);
    expect(r.codigo).toBe(1);
    expect(r.erro).toContain('autenticacao');
    expect(r.erro).not.toContain(KEY);
    expect(r.saida).toBe('');
    expect(f.pedidos).toHaveLength(1);
  });

  it('falha não fatal vira aviso no relatório e a execução segue', async () => {
    const f = await subir({ status: { '/boards/11/workflows': 404, '/cardTypes': 404 } });
    const r = await rodar(f);
    expect(r.codigo).toBe(0);
    expect(r.saida).toContain('quadro-11-workflows: http: GET /boards/11/workflows respondeu 404');
    expect(r.saida).toContain('cardTypes: http');
    expect(r.saida).toContain('## Forma de /cardTypes\n\n(sem dados)');
  });

  it('falha de gravação fora da rede (saída bruta ou relatório) encerra com código 1 sem vazar a chave', async () => {
    // O item aparece na pasta durante a execução (depois da checagem inicial): o flag wx recusa e não sobrescreve.
    const ocupar = (f: Falso, caminho: string, pasta: string, nome: string) =>
      f.server.on('request', (req: IncomingMessage) => {
        if (req.url?.startsWith(caminho)) mkdirSync(join(tmp, pasta, nome), { recursive: true });
      });
    const f1 = await subir({});
    ocupar(f1, '/users', 'saida', 'relatorio-forma.md');
    const r = await rodar(f1);
    expect(r.codigo).toBe(1);
    expect(r.erro).toMatch(/^erro: /);
    expect(r.erro).not.toContain(KEY);
    const f2 = await subir({});
    ocupar(f2, '/cardTypes', 'saida2', 'cardTypes.json');
    const r2 = await rodar(f2, { dirSaida: join(tmp, 'saida2') });
    expect(r2.codigo).toBe(1);
  });

  it('falhas de leitura não fatais em cada etapa viram aviso e o relatório diz que não há dado', async () => {
    const a = await rodar(
      await subir({ cardsSemId: true, status: { '/boards/10/currentStructure': 404, '/boards/10/workflows': 404, '/boards/11/workflows': 404 } }),
      { dirSaida: join(tmp, 'a') },
    );
    expect(a.codigo).toBe(0);
    expect(a.saida).toContain('caminhos com tipo na resposta de /workflows): (nenhum)');
    expect(a.saida).toContain('quadro-10-currentStructure: http');
    expect(a.saida).not.toContain('/revisions');
    const b = await rodar(await subir({ status: { '/cards/1001/revisions': 404, '/cards/1101/revisions': 404 } }), { dirSaida: join(tmp, 'b') });
    expect(b.saida).toContain('chaves de nome parecido com pessoa nas revisões: (nenhuma)');
    expect(b.saida).toContain('card-1001-revisions: http');
    const c = await rodar(await subir({ semPagina: true }), { dirSaida: join(tmp, 'c') });
    expect(c.codigo).toBe(0);
    expect(c.saida).toContain('quadro-10-cards-abertos: http');
  });

  it('sem relógio injetado usa o relógio real', async () => {
    const r = await rodar(await subir({}), { agora: undefined, dirSaida: join(tmp, 'a') });
    expect(r.codigo).toBe(0);
    expect(r.saida).toMatch(/Gerado em 20\d\d-/);
  });

  it('configuração inválida: nada vai à rede', async () => {
    const f = await subir({});
    const env = (resto: Record<string, string | undefined>) => ({ BUSINESSMAP_URL_BASE: f.url, BUSINESSMAP_APIKEY: KEY, BUSINESSMAP_QUADROS_IDS: '10', ...resto });
    const sem = await executarSpike({ env: env({ BUSINESSMAP_QUADROS_IDS: undefined }), dirSaida: join(tmp, 's'), raizRepositorio: raiz, textoConferencia: CONFERENCIA });
    expect(sem).toEqual({ codigo: 2, saida: '', erro: 'variável obrigatória ausente: BUSINESSMAP_QUADROS_IDS' });
    const chave = await executarSpike({ env: env({ BUSINESSMAP_APIKEY: undefined }), dirSaida: join(tmp, 's'), raizRepositorio: raiz, textoConferencia: CONFERENCIA });
    expect(chave.codigo).toBe(2);
    expect(chave.erro).toContain('BUSINESSMAP_APIKEY');
    const dentro = await executarSpike({ env: env({}), dirSaida: join(raiz, 'saida'), raizRepositorio: raiz, textoConferencia: CONFERENCIA });
    expect(dentro).toEqual({ codigo: 2, saida: '', erro: 'diretório da saída bruta dentro do repositório recusado' });
    const ruim = await executarSpike({ env: env({}), dirSaida: join(tmp, 's'), raizRepositorio: raiz, textoConferencia: '{}' });
    expect(ruim.codigo).toBe(2);
    expect(f.pedidos).toHaveLength(0);
    expect(readdirSync(raiz)).toEqual([]);
  });

  it('o cliente da F1 recusa caminho e parâmetro fora da lista antes da rede', async () => {
    const f = await subir({});
    const c = criarClienteHttp({ urlBase: f.url, apikey: KEY, limitePorMinuto: 1000, timeoutMs: 2000 });
    const ruins: [string, Record<string, string>][] = [
      ['/boards/10/cards', {}], ['/cards/1/delete', {}], ['/webhooks', {}], ['/cards', { expand: 'subtasks' }], ['/cards', { state: 'deleted' }],
      ['/boards', { expand: 'custom_fields' }], ['/users', {}], ['/users', { fields: 'user_id,realname,email', user_ids: '5' }],
    ];
    for (const [caminho, consulta] of ruins) await expect(c.get(caminho, { consulta }), caminho).rejects.toMatchObject({ name: 'ErroBusinessMap' });
    expect(f.pedidos).toEqual([]);
  });

  it('saída por link simbólico que aponta para dentro do clone é recusada: sem rede e sem arquivo no clone', async () => {
    const f = await subir({});
    mkdirSync(join(raiz, 'dentro'));
    symlinkSync(join(raiz, 'dentro'), join(tmp, 'atalho'));
    const a = await rodar(f, { dirSaida: join(tmp, 'atalho', 'saida') });
    expect(a).toEqual({ codigo: 2, saida: '', erro: 'diretório da saída bruta dentro do repositório recusado' });
    const b = await rodar(f, { dirSaida: join(tmp, 'atalho') });
    expect(b.codigo).toBe(2);
    expect(f.pedidos).toHaveLength(0);
    expect(readdirSync(join(raiz, 'dentro'))).toEqual([]);
    expect(readdirSync(raiz)).toEqual(['dentro']);
  });

  it('saída que já existe e é link (mesmo para fora do clone ou quebrado) é recusada', async () => {
    const f = await subir({});
    mkdirSync(join(tmp, 'fora'));
    symlinkSync(join(tmp, 'fora'), join(tmp, 'link-fora'));
    symlinkSync(join(tmp, 'nao-existe'), join(tmp, 'link-quebrado'));
    const a = await rodar(f, { dirSaida: join(tmp, 'link-fora') });
    expect(a.codigo).toBe(2);
    expect(a.erro).toContain('link simbólico');
    const b = await rodar(f, { dirSaida: join(tmp, 'link-quebrado') });
    expect(b.codigo).toBe(2);
    expect(b.erro).toContain('link simbólico');
    const c = await rodar(f, { dirSaida: join(tmp, 'link-quebrado', 'sub') });
    expect(c.codigo).toBe(2);
    expect(f.pedidos).toHaveLength(0);
    expect(readdirSync(join(tmp, 'fora'))).toEqual([]);
  });

  it('clone alcançado por link: a saída dentro dele continua recusada', () => {
    symlinkSync(raiz, join(tmp, 'clone-link'));
    expect(() => foraDoRepositorio(join(raiz, 'saida'), join(tmp, 'clone-link'))).toThrow('dentro do repositório');
    expect(() => foraDoRepositorio(join(tmp, 'clone-link', 'x', 'y'), raiz)).toThrow('dentro do repositório');
    expect(foraDoRepositorio(join(tmp, 'novo', 'a'), join(tmp, 'clone-link'))).toBe(join(tmp, 'novo', 'a'));
  });

  it('modos: pasta nova em 0700 e arquivos em 0600; pasta existente vazia vira 0700; não vazia é recusada', async () => {
    const f = await subir({});
    const novo = join(tmp, 'novo', 'saida');
    const a = await rodar(f, { dirSaida: novo });
    expect(a.codigo).toBe(0);
    expect(statSync(novo).mode & 0o777).toBe(0o700);
    const arquivos = readdirSync(novo);
    expect(arquivos.length).toBeGreaterThan(5);
    for (const nome of arquivos) expect(statSync(join(novo, nome)).mode & 0o777, nome).toBe(0o600);
    const aberta = join(tmp, 'aberta');
    mkdirSync(aberta, { mode: 0o755 });
    chmodSync(aberta, 0o755);
    const b = await rodar(f, { dirSaida: aberta });
    expect(b.codigo).toBe(0);
    expect(statSync(aberta).mode & 0o777).toBe(0o700);
    const antes = f.pedidos.length;
    const c = await rodar(f, { dirSaida: aberta });
    expect(c).toEqual({ codigo: 2, saida: '', erro: 'diretório da saída bruta já existe e não está vazio: recusado' });
    expect(f.pedidos).toHaveLength(antes);
  });

  it('saída que não é pasta ou que não pode ser criada: código 2 com mensagem limpa, sem rede', async () => {
    const f = await subir({});
    writeFileSync(join(tmp, 'arquivo'), 'x');
    const a = await rodar(f, { dirSaida: join(tmp, 'arquivo') });
    expect(a).toEqual({ codigo: 2, saida: '', erro: 'diretório da saída bruta existe e não é pasta: recusado' });
    const b = await rodar(f, { dirSaida: join(tmp, 'arquivo', 'sub') });
    expect(b.codigo).toBe(2);
    expect(b.erro).toMatch(/^diretório da saída bruta inacessível \(ENOTDIR\)$/);
    if (process.getuid?.() !== 0) {
      mkdirSync(join(tmp, 'travada'), { mode: 0o500 });
      chmodSync(join(tmp, 'travada'), 0o500);
      const c = await rodar(f, { dirSaida: join(tmp, 'travada', 'sub') });
      chmodSync(join(tmp, 'travada'), 0o700);
      expect(c).toEqual({ codigo: 2, saida: '', erro: 'não foi possível preparar o diretório da saída bruta (EACCES)' });
    }
    expect(f.pedidos).toHaveLength(0);
  });

  it('linked_cards: conta por card os valores de link_type', async () => {
    const r = await rodar(await subir({}));
    expect(r.saida).toContain('Vínculos por tipo (link_type), contados por card:');
    expect(r.saida).toContain('- link_type `parent`: 4 cards com o tipo; 2 a 2 vínculos por card; 4 cards com mais de um');
  });

  it('a lista gerada aplica a regra da H-8 a H-11 e marca as candidatas', async () => {
    const r = await rodar(await subir({}));
    const lista = readFileSync(join(tmp, 'saida', 'lista-conferencia-colunas.md'), 'utf8');
    const linha = (coluna: string) => lista.split('\n').filter((l) => l.startsWith(`| `) && l.split(' | ')[2] === coluna).pop() ?? '';
    expect(r.codigo).toBe(0);
    expect(linha('1001')).toContain('| backlog | fila |  |');
    expect(linha('1002')).toContain('| compromisso | fila |  |');
    expect(linha('1003')).toContain('| trabalho | fila | exceção do arquivo (H-8) |');
    expect(linha('1004')).toContain('| trabalho | execucao | CANDIDATA: nome de espera com flow_type 1 (H-8) |');
    expect(linha('1005')).toContain('| homologacao | execucao |');
    expect(lista).not.toMatch(/\| 1006 \|/); // pai de 1007: não é folha
    expect(linha('1007')).toContain('| entrega | execucao | CANDIDATA: filha de Encerrado (H-10) |');
    expect(linha('1008')).toContain('| descarte | execucao | Descartado do arquivo (H-11) |');
    expect(linha('2001')).toContain('CANDIDATA: Descartado fora do arquivo (H-11)');
    expect(linha('2002')).toContain('CANDIDATA: exceção de marco (H-9 ou H-10)');
    expect(linha('2003')).toContain('| sem_papel | execucao | CONFERIR: folha sem seção |');
    expect(linha('2004')).toContain('| trabalho | sem_tipo | CONFERIR: flow_type fora de 1 e 2 na seção 3 |');
    expect(linha('2005')).toContain('| entrega | execucao |  |');
    expect(linha('2007')).toContain('| 1 | 2 | backlog | fila |  |');
    expect(lista).toContain('Exceções do arquivo sem folha correspondente na estrutura lida (workflow/coluna): 100/1999.');
    expect(lista).not.toContain('Raia');
  });
});

describe('forma: só nomes de campo, tipos e contagens', () => {
  it('chaveSegura', () => {
    expect(chaveSegura('12')).toBe('<id>');
    expect(chaveSegura('card_id')).toBe('card_id');
    expect(chaveSegura('João Silva')).toBe('<chave>');
    expect(chaveSegura('a'.repeat(41))).toBe('<chave>');
  });

  it('acumula várias respostas e nunca imprime valor', () => {
    const f = somarForma({ a: 'SEGREDO-1', lista: [1, 2, 3], n: null });
    somarForma({ a: 5, lista: [], extra: { x: true } }, f);
    const linhas = linhasDeForma(f);
    expect(linhas.join('\n')).not.toContain('SEGREDO');
    expect(linhas).toContain('- `$.a`: number | string (2x)');
    expect(linhas).toContain('- `$.lista`: array (2x, tamanho 0 a 3)');
    expect(linhas).toContain('- `$.lista[]`: number (3x)');
    expect(linhas).toContain('- `$.n`: null (1x)');
    expect(linhas).toContain('- `$.extra.x`: boolean (1x)');
    expect(linhasDeForma(f, (c) => c.startsWith('$.extra'))).toEqual(['- `$.extra`: object (1x)', '- `$.extra.x`: boolean (1x)']);
    expect(caminhosComNome(f, /^ex/)).toEqual(['$.extra']);
    expect(caminhosComNome(f, /^zzz/)).toEqual([]);
  });

  it('linhasDeVinculos: conta por card o link_type, sem valor fora do padrão', () => {
    expect(linhasDeVinculos([])).toEqual(['(sem vínculos)']);
    expect(linhasDeVinculos([undefined, null, 'x', []])).toEqual(['(sem vínculos)']);
    const l = linhasDeVinculos([
      [{ link_type: 'parent' }, { link_type: 'parent' }, { link_type: 'child' }],
      [{ link_type: 'parent' }, {}, { link_type: 'Nome Livre | x' }],
      [{ link_type: 'parent' }],
    ]);
    expect(l).toEqual([
      '- link_type `(ausente)`: 1 cards com o tipo; 1 a 1 vínculos por card; 0 cards com mais de um',
      '- link_type `<chave>`: 1 cards com o tipo; 1 a 1 vínculos por card; 0 cards com mais de um',
      '- link_type `child`: 1 cards com o tipo; 1 a 1 vínculos por card; 0 cards com mais de um',
      '- link_type `parent`: 3 cards com o tipo; 1 a 2 vínculos por card; 1 cards com mais de um',
    ]);
  });

  it('desembrulhar: as formas de envelope', () => {
    expect(desembrulhar({ data: [1, 2] })).toEqual({ itens: [1, 2], paginas: undefined, chavesPaginacao: [] });
    expect(desembrulhar({ data: { data: [1], pagination: { all_pages: 4, current_page: 1, 'x y': 1 } } })).toEqual({
      itens: [1], paginas: 4, chavesPaginacao: ['<chave>', 'all_pages', 'current_page'],
    });
    expect(desembrulhar({ data: { data: [1], pagination: 'x' } })).toEqual({ itens: [1], paginas: undefined, chavesPaginacao: [] });
    expect(desembrulhar({ data: { board_id: 1 } }).itens).toEqual([{ board_id: 1 }]);
    expect(desembrulhar({ data: 'x' }).itens).toEqual([]);
    expect(desembrulhar(null).itens).toEqual([]);
    expect(desembrulhar({ data: { data: [], pagination: { all_pages: 'x' } } }).paginas).toBeUndefined();
  });

  it('veredictos', () => {
    expect(veredictoPaginacao(undefined, 0, false)).toBe('indeterminado');
    expect(veredictoPaginacao(2, undefined, false)).toBe('indeterminado');
    expect(veredictoPaginacao(0, 0, true)).toBe('indeterminado');
    expect(veredictoPaginacao(20, 0, false)).toContain('não há segunda página (20');
    expect(veredictoPaginacao(20, 20, true)).toContain('ignorado');
    expect(veredictoPaginacao(20, 3, false)).toContain('sim');
    expect(veredictoFiltro([])).toBe('indeterminado');
    expect(veredictoFiltro([{ total: 0, futuro: 0 }, { total: 4, futuro: undefined }, { total: undefined, futuro: 0 }])).toBe('indeterminado');
    expect(veredictoFiltro([{ total: 4, futuro: 0 }, { total: 0, futuro: 0 }])).toBe('filtra');
    expect(veredictoFiltro([{ total: 4, futuro: 0 }, { total: 2, futuro: 2 }])).toBe('nao-filtra');
  });

  it('foraDoRepositorio: dentro, o próprio clone e fora', () => {
    expect(() => foraDoRepositorio('/a/clone/saida', '/a/clone')).toThrow('dentro do repositório');
    expect(() => foraDoRepositorio('/a/clone', '/a/clone')).toThrow('dentro do repositório');
    expect(foraDoRepositorio('/a/clone2/saida', '/a/clone')).toBe('/a/clone2/saida');
    expect(foraDoRepositorio('/outro', '/a/clone')).toBe('/outro');
    expect(() => foraDoRepositorio('/a/clone/../clone/x', '/a/clone')).toThrow();
  });
});

describe('lista de conferência: regra e entradas fora do padrão', () => {
  const conf = analisarConferencia(CONFERENCIA);
  it('papel pela seção e tipo pelo flow_type', () => {
    expect([1, 2, 3, 4, 5, 6, undefined].map((s) => papelDaSecao(s, 'x'))).toEqual(['backlog', 'compromisso', 'trabalho', 'entrega', 'entrega', 'sem_papel', 'sem_papel']);
    expect(papelDaSecao(3, 'em homologacao')).toBe('homologacao');
    expect(papelDaSecao(2, 'homologacao')).toBe('compromisso');
    expect([2, 1, 0, undefined].map(tipoDoFlow)).toEqual(['fila', 'execucao', 'sem_tipo', 'sem_tipo']);
  });

  it('estrutura fora do formato não derruba a lista; id de workflow cai para a chave', () => {
    const l = montarLista(
      new Map<number, unknown>([
        [3, { data: { workflows: { '77': { name: 'sem id', columns: [{ column_id: 1, name: 'Fila', section: 3, flow_type: 2 }, { column_id: 3 }] }, '78': 'lixo' } } }],
        [2, { data: { workflows: [] } }],
        [1, { data: 'x' }],
        [6, { data: [1] }],
        [4, { data: { workflows: { '80': { workflow_id: 80, columns: 'x' } } } }],
        [5, { data: { workflows: { '81': { workflow_id: 81, columns: [{ column_id: 9, name: 'Espera', section: 3, flow_type: 1 }, { column_id: 8, name: 'Aguardando', section: 3, flow_type: 1 }] } } } }],
      ]),
      conf,
    );
    expect(l.map((x) => [x.quadro, x.workflow, x.coluna])).toEqual([[3, '<id>', '1'], [3, '<id>', '3'], [5, '81', '8'], [5, '81', '9']]);
    expect(l[0]).toMatchObject({ papel: 'trabalho', tipo: 'fila' });
    expect(l[0]!.marca).toBe('CONFERIR: workflow sem folha na seção 2 nem na 4, o marco cai na seção seguinte (H-23)');
    expect(l[1]).toMatchObject({ nome: '', secao: undefined, flowType: undefined, papel: 'sem_papel', tipo: 'sem_tipo', marca: 'CONFERIR: folha sem seção' });
    expect(l[2]!.marca).toContain('CANDIDATA');
    expect(l[3]!.marca).toContain('(H-23)');
    expect(renderizarLista(l, conf, [3, 5])).toContain('|  | - | - | sem_papel | sem_tipo | CONFERIR: folha sem seção |');
    expect(excecoesSemColuna(l, conf)).toEqual([]);
    expect(l[0]!.coluna).toBe('1');
    expect(renderizarLista([], conf, [3])).toContain('Nenhuma.');
    expect(renderizarLista([], conf, [3])).toContain('Folhas: 0.');
  });

  it('A3 da segurança: workflow sem workflow_id e coluna sem column_id inteiro não levam texto da resposta para a lista', () => {
    const l = montarLista(
      new Map<number, unknown>([[1, { data: { workflows: { 'a|b`c': { columns: [{ column_id: 'x|y', name: 'Fila', section: 3, flow_type: 2 }] } } } }]]),
      conf,
    );
    expect(l[0]).toMatchObject({ workflow: '<chave>', coluna: '<id?>' });
    expect(l[0]!.marca).toContain('CONFERIR: coluna sem id inteiro');
    expect(renderizarLista(l, conf, [1])).not.toMatch(/a\|b|x\|y/);
  });

  it('H-11: coluna listada em colunas_descartado é descarte mesmo com outro nome, com marca; fora do arquivo só o nome marca', () => {
    const l = montarLista(
      new Map<number, unknown>([
        [1, { data: { workflows: { '100': { workflow_id: 100, columns: [
          { column_id: 1, name: 'Compromisso', section: 2, flow_type: 2 },
          { column_id: 1008, name: 'Descartados', section: 4, flow_type: 1 },
          { column_id: 1009, name: 'Concluído', section: 4, flow_type: 1 },
        ] } } } }],
      ]),
      conf,
    );
    const por = (c: string) => l.find((x) => x.coluna === c)!;
    expect(por('1008')).toMatchObject({ papel: 'descarte' });
    expect(por('1008').marca).toBe('Descartado do arquivo com nome diferente de Descartado (H-11)');
    expect(por('1009')).toMatchObject({ papel: 'entrega', marca: '' });
  });

  it('H-23: marca o workflow sem folha na seção 2 ou na 4 (só Descartado na 4 não vale), e não marca o completo', () => {
    const wf = (id: number, colunas: Record<string, unknown>[]) => ({ [String(id)]: { workflow_id: id, columns: colunas } });
    const l = montarLista(
      new Map<number, unknown>([
        [1, { data: { workflows: {
          ...wf(300, [{ column_id: 1, name: 'A', section: 2, flow_type: 2 }, { column_id: 2, name: 'B', section: 4, flow_type: 1 }]),
          ...wf(301, [{ column_id: 3, name: 'A', section: 2, flow_type: 2 }, { column_id: 4, name: 'Descartado', section: 4, flow_type: 1 }]),
          ...wf(302, [{ column_id: 5, name: 'A', section: 1, flow_type: 2 }, { column_id: 6, name: 'B', section: 4, flow_type: 1 }]),
        } } }],
      ]),
      conf,
    );
    const marcaDe = (w: string) => l.filter((x) => x.workflow === w).map((x) => x.marca).filter((m) => m.includes('H-23'));
    expect(marcaDe('300')).toEqual([]);
    expect(marcaDe('301')).toEqual(['CONFERIR: workflow sem folha na seção 4, o marco cai na seção seguinte (H-23)']);
    expect(marcaDe('302')).toEqual(['CONFERIR: workflow sem folha na seção 2, o marco cai na seção seguinte (H-23)']);
    const texto = renderizarLista(l, conf, [1]);
    expect(texto).toContain('(H-23)');
    expect(texto.split('## Todas as folhas')[0]).toContain('workflow sem folha na seção 2');
  });

  it('H-26: folha de homologação ganha a marca, entra nos itens a conferir e confere o flow_type', () => {
    const l = montarLista(
      new Map<number, unknown>([
        [1, { data: { workflows: { '400': { workflow_id: 400, columns: [
          { column_id: 1, name: 'Em Homologação', section: 3, flow_type: 1 },
          { column_id: 2, name: 'Homologação 2', section: 3, flow_type: 0 },
        ] } } } }],
      ]),
      conf,
    );
    expect(l[0]).toMatchObject({ papel: 'homologacao' });
    expect(l[0]!.marca).toContain('regra H-26');
    expect(l[1]!.marca).toContain('regra H-26');
    expect(l[1]!.marca).toContain('CONFERIR: flow_type fora de 1 e 2 na seção 3');
    expect(renderizarLista(l, conf, [1]).split('## Todas as folhas')[0]).toContain('regra H-26');
  });
});
