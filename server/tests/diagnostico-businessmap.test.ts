import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CAMINHOS_PERMITIDOS, criarCliente, diagnosticar, ErroDiagnostico, lerConfig, linhas, listar, reduzir,
} from '../src/modulos/businessmap/diagnostico.js';

const KEY = 'chave-super-secreta-ABC123xyz';
const PESSOA = ['pessoa@exemplo.com', 'Fulano Realname', 'usuario.login', 'descricao-secreta', '987654', 'Valor Permitido Pessoa'];

interface Req { metodo: string; caminho: string; consulta: string; apikey: string | undefined }
type Resp = { status?: number; corpo?: unknown; bruto?: string; cabecalhos?: Record<string, string>; pendurar?: boolean };
type Rota = (caminho: string, consulta: string, n: number) => Resp;

const PREFIXO = '/api/v2';
const servidores: Server[] = [];

async function servir(rota: Rota) {
  const requisicoes: Req[] = [];
  const contagem = new Map<string, number>();
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    const caminho = url.pathname.slice(PREFIXO.length);
    requisicoes.push({ metodo: req.method ?? '', caminho, consulta: url.search, apikey: req.headers.apikey as string | undefined });
    const n = (contagem.get(caminho + url.search) ?? 0) + 1;
    contagem.set(caminho + url.search, n);
    const r = rota(caminho, url.search, n);
    if (r.pendurar) return;
    res.writeHead(r.status ?? 200, { 'content-type': 'application/json', ...r.cabecalhos });
    res.end(r.bruto ?? JSON.stringify(r.corpo ?? {}));
  });
  servidores.push(server);
  await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok));
  const porta = (server.address() as AddressInfo).port;
  return { requisicoes, urlBase: `http://127.0.0.1:${porta}${PREFIXO}`, porta, server };
}

afterEach(async () => {
  await Promise.all(
    servidores.splice(0).map(
      (s) => new Promise<void>((ok) => {
        s.closeAllConnections();
        s.close(() => ok());
      }),
    ),
  );
});

const PESSOAS_NO_CORPO = {
  email: 'pessoa@exemplo.com', realname: 'Fulano Realname', username: 'usuario.login', user_id: 987654,
  description: 'descricao-secreta', owner_user_id: 987654,
};

const estrutura: Rota = (caminho) => {
  switch (caminho) {
    case '/workspaces':
      return { corpo: { data: [{ workspace_id: 1, name: 'Area', type: 1, is_archived: 0, ...PESSOAS_NO_CORPO }] } };
    case '/boards':
      return {
        corpo: {
          data: {
            pagination: { all_pages: 1, current_page: 1, results_per_page: 100 },
            data: [
              { board_id: 10, name: 'Q10', workspace_id: 1, ...PESSOAS_NO_CORPO },
              { board_id: 11, name: 'Q11', workspace_id: 1 },
            ],
          },
        },
      };
    case '/boards/10/workflows':
    case '/boards/11/workflows':
      return { corpo: { data: [{ workflow_id: 100, name: 'WF', type: 0, position: 0, ...PESSOAS_NO_CORPO }] } };
    case '/boards/10/currentStructure':
    case '/boards/11/currentStructure':
      return {
        corpo: {
          data: {
            board_id: 10,
            ...PESSOAS_NO_CORPO,
            workflows: {
              '100': {
                workflow_id: 100,
                name: 'WF',
                columns: {
                  '1000': { column_id: 1000, name: 'Todo', section: 1, position: 0, limit: 3, flow_type: 0, parent_column_id: null, ...PESSOAS_NO_CORPO },
                },
                lanes: [{ lane_id: 5, name: 'Raia', ...PESSOAS_NO_CORPO }],
              },
            },
          },
        },
      };
    case '/cardTypes':
      return { corpo: { data: [{ type_id: 1, name: 'Story', ...PESSOAS_NO_CORPO }] } };
    case '/customFields':
      return {
        corpo: {
          data: [
            {
              field_id: 3, name: 'Sistema', type: 'dropdown', position: 4, is_archived: 0,
              allowedValues: [{ value_id: 1, value: 'Valor Permitido Pessoa' }], ...PESSOAS_NO_CORPO,
            },
          ],
        },
      };
    default:
      return { status: 404, corpo: {} };
  }
};

const env = (urlBase: string, extra: Record<string, string> = {}) => ({
  BUSINESSMAP_URL_BASE: urlBase,
  BUSINESSMAP_APIKEY: KEY,
  ...extra,
});
const dormirFalso = () => vi.fn(async (...args: [number]) => void args);
const semChaveNemPessoa = (texto: string) => {
  expect(texto).not.toContain(KEY);
  for (const p of PESSOA) expect(texto).not.toContain(p);
  expect(texto).not.toContain('allowedValues');
};

describe('CAMINHOS_PERMITIDOS e o cliente só GET', () => {
  it('é a lista fechada de estrutura', () => {
    expect([...CAMINHOS_PERMITIDOS]).toEqual([
      '/workspaces', '/boards', '/boards/{id}/currentStructure', '/boards/{id}/workflows', '/cardTypes', '/customFields',
    ]);
  });

  it('recusa caminho fora da lista antes da rede', async () => {
    const s = await servir(estrutura);
    const cliente = criarCliente(lerConfig(env(s.urlBase)), { dormir: dormirFalso() });
    for (const c of ['/cards', '/users', '/boards/10/cards', '/boards/x/workflows', '/customFields/3/allowedValues', '/boards/10', '/apiLimits', '']) {
      await expect(cliente.get(c)).rejects.toMatchObject({ tipo: 'caminho' });
    }
    expect(s.requisicoes).toHaveLength(0);
  });

  it('só GET, só caminhos da lista, cabeçalho apikey, chave fora de URL, saída e erro; campos de pessoa descartados', async () => {
    const s = await servir(estrutura);
    const r = await diagnosticar({ env: env(s.urlBase + '/'), dormir: dormirFalso() });
    expect(r.codigo).toBe(0);
    expect(r.erro).toBe('');
    const padroes = CAMINHOS_PERMITIDOS.map((c) => new RegExp(`^${c.replace('{id}', '\\d+')}$`));
    expect(s.requisicoes.length).toBe(1 + 1 + 2 * 2 + 1 + 1);
    for (const q of s.requisicoes) {
      expect(q.metodo).toBe('GET');
      expect(padroes.some((p) => p.test(q.caminho))).toBe(true);
      expect(q.apikey).toBe(KEY);
      expect(q.caminho + q.consulta).not.toContain(KEY);
    }
    semChaveNemPessoa(r.saida);
    expect(r.saida).toContain('# Diagnóstico da estrutura do BusinessMap');
    expect(r.saida).toContain('## Quadro 10: estrutura (colunas e raias)');
    expect(r.saida).toContain('- chave=1000 · column_id=1000 · parent_column_id=null · name=Todo · position=0 · flow_type=0 · section=1 · limit=3');
    expect(r.saida).toContain('lane_id=5 · name=Raia');
    expect(r.saida).toContain('- field_id=3 · name=Sistema · type=dropdown');
    expect(r.saida).not.toContain('position=4');
    expect(r.saida).toContain('workspace_id=1 · name=Area · type=1 · is_archived=0');
  });

  it('usa fetch, dormir e relógio reais (limite alto) e produz o relatório', async () => {
    const s = await servir(estrutura);
    const r = await diagnosticar({ env: env(s.urlBase, { BUSINESSMAP_LIMITE_POR_MINUTO: '1000', BUSINESSMAP_QUADROS_IDS: '10' }) });
    expect(r.codigo).toBe(0);
    expect(s.requisicoes.length).toBe(1 + 1 + 2 + 1 + 1);
  });

  it('não espera quando o intervalo já passou e espera o intervalo quando não passou', async () => {
    const s = await servir(estrutura);
    const dormir = dormirFalso();
    let t = 0;
    await diagnosticar({ env: env(s.urlBase, { BUSINESSMAP_QUADROS_IDS: '10' }), dormir, agora: () => (t += 100000) });
    expect(dormir).not.toHaveBeenCalled();
    await diagnosticar({ env: env(s.urlBase, { BUSINESSMAP_QUADROS_IDS: '10' }), dormir, agora: () => 5 });
    expect(dormir).toHaveBeenCalledWith(Math.ceil(60000 / 25));
  });
});

describe('autenticação e falhas', () => {
  it.each([401, 403])('HTTP %i para e diz autenticacao, sem a chave', async (status) => {
    const s = await servir(() => ({ status, corpo: { error: 'x ' + KEY } }));
    const r = await diagnosticar({ env: env(s.urlBase), dormir: dormirFalso() });
    expect(r.codigo).toBe(1);
    expect(r.saida).toBe('');
    expect(r.erro).toContain('autenticacao');
    expect(r.erro).toContain(`GET /workspaces respondeu ${status}`);
    semChaveNemPessoa(r.erro);
    expect(s.requisicoes).toHaveLength(1);
  });

  it('HTTP 500: 3 tentativas com backoff, depois a seção diz indisponivel, sem a chave', async () => {
    const s = await servir((c) => (c === '/workspaces' ? { status: 500, corpo: { m: KEY } } : estrutura(c, '', 1)));
    const dormir = dormirFalso();
    const r = await diagnosticar({ env: env(s.urlBase), dormir });
    expect(r.codigo).toBe(0);
    expect(r.saida).toContain('> indisponivel: GET /workspaces: HTTP 500 (3 tentativas)');
    expect(s.requisicoes.filter((q) => q.caminho === '/workspaces')).toHaveLength(3);
    expect(dormir).toHaveBeenCalledWith(1000);
    expect(dormir).toHaveBeenCalledWith(4000);
    semChaveNemPessoa(r.saida);
    semChaveNemPessoa(r.erro);
  });

  it('erro de rede (porta fechada): indisponivel com o código, sem a chave', async () => {
    const s = await servir(estrutura);
    const { urlBase } = s;
    await new Promise<void>((ok) => s.server.close(() => ok()));
    const r = await diagnosticar({ env: env(urlBase), dormir: dormirFalso() });
    expect(r.codigo).toBe(0);
    expect(r.saida).toContain('> indisponivel: GET /workspaces: erro de rede ECONNREFUSED (3 tentativas)');
    semChaveNemPessoa(r.saida);
    semChaveNemPessoa(r.erro);
  });

  it('erro de rede sem código reconhecível e mensagem com a chave: não vaza', async () => {
    const falhas = [
      Object.assign(new Error('falha ' + KEY), { cause: { code: 'weird-code' } }),
      Object.assign(new Error('falha ' + KEY), { cause: {} }),
      new Error('falha ' + KEY),
    ];
    let i = 0;
    const fetchImpl = (async () => {
      throw falhas[i++ % 3];
    }) as unknown as typeof fetch;
    const r = await diagnosticar({ env: env('http://127.0.0.1:9' + PREFIXO), fetchImpl, dormir: dormirFalso() });
    expect(r.saida).toContain('> indisponivel: GET /workspaces: erro de rede (3 tentativas)');
    semChaveNemPessoa(r.saida);
  });

  it.each(['TimeoutError', 'AbortError'])('%s vira tempo-esgotado', async (nome) => {
    const fetchImpl = (async () => {
      throw Object.assign(new Error('x ' + KEY), { name: nome });
    }) as unknown as typeof fetch;
    const r = await diagnosticar({ env: env('http://127.0.0.1:9' + PREFIXO), fetchImpl, dormir: dormirFalso() });
    expect(r.saida).toContain('> tempo-esgotado: GET /workspaces: tempo esgotado (3 tentativas)');
    semChaveNemPessoa(r.saida);
  });

  it('timeout real: servidor que não responde', async () => {
    const s = await servir(() => ({ pendurar: true }));
    const r = await diagnosticar({ env: env(s.urlBase, { BUSINESSMAP_TIMEOUT_MS: '100' }), dormir: dormirFalso() });
    expect(r.saida).toContain('tempo-esgotado: GET /workspaces');
    expect(r.saida).toContain('tempo-esgotado: GET /customFields');
  });

  it('HTTP 404 não repete e a seção diz http', async () => {
    const s = await servir((c) => (c === '/cardTypes' ? { status: 404 } : estrutura(c, '', 1)));
    const r = await diagnosticar({ env: env(s.urlBase), dormir: dormirFalso() });
    expect(r.saida).toContain('> http: GET /cardTypes respondeu 404');
    expect(s.requisicoes.filter((q) => q.caminho === '/cardTypes')).toHaveLength(1);
  });
});

describe('429 e limite por minuto', () => {
  it('espera o retry_after do corpo e repete', async () => {
    const s = await servir((c, q, n) => (c === '/workspaces' && n === 1 ? { status: 429, corpo: { retry_after: 3 } } : estrutura(c, q, n)));
    const dormir = dormirFalso();
    const r = await diagnosticar({ env: env(s.urlBase), dormir });
    expect(r.codigo).toBe(0);
    expect(dormir).toHaveBeenCalledWith(3000);
    expect(s.requisicoes.filter((q) => q.caminho === '/workspaces')).toHaveLength(2);
    expect(r.saida).toContain('workspace_id=1');
  });

  it('sem retry_after no corpo usa o cabeçalho; sem nada, 60 s; limita entre 1 e 120 s', async () => {
    const respostas: Resp[] = [
      { status: 429, bruto: 'nao-json', cabecalhos: { 'retry-after': '7' } },
      { status: 429, corpo: { retry_after: 'x' } },
      { status: 429, corpo: { retry_after: 99999 } },
      { status: 429, corpo: { retry_after: 0 } },
      { status: 429, corpo: [] },
    ];
    const s = await servir((c, q, n) => (c === '/cardTypes' && n <= respostas.length ? (respostas[n - 1] as Resp) : estrutura(c, q, n)));
    const dormir = dormirFalso();
    await diagnosticar({ env: env(s.urlBase), dormir });
    const esperas = dormir.mock.calls.map((c) => c[0]);
    expect(esperas).toEqual(expect.arrayContaining([7000, 60000, 120000, 1000]));
    expect(esperas.filter((ms) => ms === 60000)).toHaveLength(2);
  });

  it('429 sem fim: após 5 esperas a seção diz indisponivel', async () => {
    const s = await servir((c, q, n) => (c === '/cardTypes' ? { status: 429, corpo: { retry_after: 1 } } : estrutura(c, q, n)));
    const r = await diagnosticar({ env: env(s.urlBase), dormir: dormirFalso() });
    expect(r.saida).toContain('> indisponivel: GET /cardTypes: HTTP 429 (3 tentativas)');
  });
});

describe('configuração', () => {
  it.each(['BUSINESSMAP_URL_BASE', 'BUSINESSMAP_APIKEY'])('falta %s: código 2 e mensagem com o nome, sem valor', async (nome) => {
    const e = env('http://127.0.0.1:1' + PREFIXO) as Record<string, string | undefined>;
    delete e[nome];
    const r = await diagnosticar({ env: e });
    expect(r.codigo).toBe(2);
    expect(r.erro).toBe(`variável obrigatória ausente: ${nome}`);
    expect(r.saida).toBe('');
    expect(r.erro).not.toContain(KEY);
  });

  it('valor inválido: nomeia só a variável', async () => {
    const r = await diagnosticar({ env: env('nao-e-url', { BUSINESSMAP_QUADROS_IDS: 'a,b', BUSINESSMAP_TIMEOUT_MS: '1' }) });
    expect(r.codigo).toBe(2);
    expect(r.erro).toBe('variável inválida: BUSINESSMAP_URL_BASE, BUSINESSMAP_QUADROS_IDS, BUSINESSMAP_TIMEOUT_MS');
    expect(r.erro).not.toContain('nao-e-url');
  });

  it('padrões e valores vazios', () => {
    const c = lerConfig(env('https://x.exemplo/api/v2//', { BUSINESSMAP_QUADROS_IDS: ' ', BUSINESSMAP_LIMITE_POR_MINUTO: '' }));
    expect(c).toEqual({ urlBase: 'https://x.exemplo/api/v2', apikey: KEY, quadrosIds: undefined, limitePorMinuto: 25, timeoutMs: 30000 });
    expect(lerConfig(env('https://x.exemplo', { BUSINESSMAP_QUADROS_IDS: '3,4', BUSINESSMAP_LIMITE_POR_MINUTO: '10', BUSINESSMAP_TIMEOUT_MS: '500' })))
      .toMatchObject({ quadrosIds: [3, 4], limitePorMinuto: 10, timeoutMs: 500 });
  });

  it('BUSINESSMAP_QUADROS_IDS limita os quadros', async () => {
    const s = await servir(estrutura);
    const r = await diagnosticar({ env: env(s.urlBase, { BUSINESSMAP_QUADROS_IDS: '11,99' }), dormir: dormirFalso() });
    expect(r.saida).toContain('## Quadro 11: workflows');
    expect(r.saida).not.toContain('## Quadro 10');
    expect(s.requisicoes.some((q) => q.caminho.startsWith('/boards/10/'))).toBe(false);
  });
});

describe('formato da resposta', () => {
  it('formato não reconhecido mostra só as chaves de topo', async () => {
    const respostas: Record<string, Resp> = {
      '/workspaces': { corpo: { erro: 'descricao-secreta', outra: 1, 'chave estranha': 2 } },
      '/boards': { bruto: 'nao e json' },
      '/cardTypes': { corpo: { data: 'texto descricao-secreta' } },
      '/customFields': { corpo: [1, 2] },
    };
    const s = await servir((c) => respostas[c] ?? { status: 404 });
    const r = await diagnosticar({ env: env(s.urlBase), dormir: dormirFalso() });
    expect(r.saida).toContain('> formato: formato não reconhecido: erro, outra');
    expect(r.saida.match(/formato não reconhecido: \(sem chaves\)/g)).toHaveLength(2);
    expect(r.saida).toContain('formato não reconhecido: data\n');
    semChaveNemPessoa(r.saida);
  });

  it('pagina listas com all_pages maior que 1 (limitado) e tolera all_pages inválido', async () => {
    const s = await servir((c, q) => {
      if (c === '/workspaces') {
        return { corpo: { data: { pagination: { all_pages: 2 }, data: [{ workspace_id: q === '?page=2' ? 2 : 1 }] } } };
      }
      if (c === '/cardTypes') return { corpo: { data: { pagination: { all_pages: 'x' }, data: [{ type_id: 1 }] } } };
      if (c === '/customFields') return { corpo: { data: { data: [{ field_id: 1 }] } } };
      return { corpo: { data: [] } };
    });
    const r = await diagnosticar({ env: env(s.urlBase), dormir: dormirFalso() });
    expect(r.saida).toContain('workspace_id=1');
    expect(r.saida).toContain('workspace_id=2');
    expect(r.saida).toContain('type_id=1');
    expect(r.saida).toContain('field_id=1');
    expect(r.saida).toContain('## Quadros\n\n(vazio)');
    const q = await servir(() => ({ corpo: { data: { pagination: { all_pages: 99999 }, data: [] } } }));
    const cliente = criarCliente(lerConfig(env(q.urlBase)), { dormir: dormirFalso() });
    await listar(cliente, '/workspaces');
    expect(q.requisicoes).toHaveLength(50);
    const z = await servir(() => ({ corpo: { data: { pagination: { all_pages: 0 }, data: [] } } }));
    await listar(criarCliente(lerConfig(env(z.urlBase)), { dormir: dormirFalso() }), '/workspaces');
    expect(z.requisicoes).toHaveLength(1);
  });

  it('quadro sem board_id válido é ignorado; falha em /boards não derruba o relatório', async () => {
    const s = await servir((c) =>
      c === '/boards' ? { corpo: { data: [{ board_id: 'x' }, { board_id: 0 }, { name: 'sem id' }, 5] } } : estrutura(c, '', 1),
    );
    const r = await diagnosticar({ env: env(s.urlBase), dormir: dormirFalso() });
    expect(r.saida).not.toMatch(/## Quadro \d/);
    const filtrado = await diagnosticar({ env: env(s.urlBase, { BUSINESSMAP_QUADROS_IDS: '10' }), dormir: dormirFalso() });
    expect(filtrado.saida).not.toMatch(/## Quadro \d/);
    const f = await servir((c) => (c === '/boards' ? { status: 500 } : estrutura(c, '', 1)));
    const r2 = await diagnosticar({ env: env(f.urlBase, { BUSINESSMAP_QUADROS_IDS: '10' }), dormir: dormirFalso() });
    expect(r2.saida).toContain('> indisponivel: GET /boards');
    expect(r2.saida).not.toMatch(/## Quadro \d/);
  });
});

describe('reduzir e linhas', () => {
  it('só escalares permitidos; filhos em mapa ou lista; descarta o resto', () => {
    const no = reduzir(
      { name: 'a|b`c\nd', position: 1, limit: true, section: null, email: 'x', type: { aninhado: 1 }, columns: [{ column_id: 1 }, 7], lanes: { abc: { lane_id: 2 }, '5': { lane_id: 3 } }, workflows: 'x' },
      ['name', 'position', 'limit', 'section', 'type'],
    );
    expect(no).toEqual({
      campos: { name: 'a|b`c\nd', position: 1, limit: true, section: null },
      filhos: { columns: [{ campos: {}, filhos: {} }], lanes: [{ campos: { chave: 5 }, filhos: {} }, { campos: {}, filhos: {} }] },
    });
    expect(reduzir('x', [])).toBeNull();
    expect(reduzir([], [])).toBeNull();
  });

  it('formata linhas, saneia texto, trunca e indica nó sem campos', () => {
    const l = linhas({
      campos: { name: 'a|b`c\nd' + 'x'.repeat(200), position: 2 },
      filhos: { columns: [{ campos: {}, filhos: { lanes: [{ campos: { lane_id: 1 }, filhos: {} }] } }] },
    });
    expect(l[0]?.startsWith('- name=a b c d')).toBe(true);
    expect(l[0]?.length).toBeLessThan(160);
    expect(l.slice(1)).toEqual(['  - columns:', '    - (sem campos permitidos)', '      - lanes:', '        - lane_id=1']);
  });

  it('ErroDiagnostico guarda o tipo', () => {
    expect(new ErroDiagnostico('http', 'm')).toMatchObject({ tipo: 'http', message: 'm' });
  });
});
