import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { analisarConferencia, lerConferencia } from '../src/modulos/businessmap/conferencia.js';
import {
  contextoDoEvento, ENTIDADE_SEM_CONFERENCIA, ErroReferencia, folhasDoMarco, lerReferenciaReal, linhasColuna, linhasTipoCard, linhasWorkflow,
  nivelDoWorkflow, planejar, registrarFolhasSemConferencia, sincronizarReferencia, vigenteEm, type Plano, type ReferenciaLida, type Vigentes,
} from '../src/modulos/businessmap/referencia.js';
import { excecoesSemColuna, montarLista } from '../src/modulos/businessmap/spike-lista.js';
import { colunasDe, nomesDeColuna } from '../src/modulos/metricas/mapa.js';
import { criarClienteHttp } from '../src/plataforma/http.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg, type Chamada } from './duble-pg.js';

// Servidor falso local: nenhuma chamada ao BusinessMap real, e o `.env` nunca é lido. Ids, nomes e limites inventados.
const conf = lerConferencia();
const S = montarEsquemas('');
const HOJE = '2026-11-02';
const INICIO = '2025-11-02';

interface Col { id: number; nome: string; secao: number; flow: number; pai?: number; limite?: number }
const estrutura = (wfs: Record<number, Col[]>): unknown => {
  const columns: Record<string, unknown> = {};
  const child_columns: Record<string, number[]> = {};
  const workflows: Record<string, unknown> = {};
  for (const [wid, cs] of Object.entries(wfs)) {
    for (const c of cs) {
      columns[String(c.id)] = { name: c.nome, section: c.secao, flow_type: c.flow, parent_column_id: c.pai ?? 0, workflow_id: Number(wid), limit: c.limite ?? 0 };
      if (c.pai !== undefined) (child_columns[String(c.pai)] ??= []).push(c.id);
    }
    const folhas = cs.filter((c) => !cs.some((o) => o.pai === c.id)).map((c) => c.id);
    workflows[wid] = { name: 'WF', top_columns: cs.filter((c) => c.pai === undefined).map((c) => c.id), bottom_columns: folhas };
  }
  return { data: { columns, child_columns, workflows } };
};

// Workflow 191 (type 1, quadro 25) tem a coluna 2532 da exceção da pergunta 2; 192 (type 0) repete "Backlog"; quadro 35 é o dos projetos.
const WF191: Col[] = [
  { id: 2530, nome: 'Backlog', secao: 1, flow: 2 },
  { id: 2531, nome: 'Comprometido', secao: 2, flow: 2 },
  { id: 2533, nome: 'Em Homologação', secao: 3, flow: 1, limite: 4 },
  { id: 2532, nome: 'Aguardando Publicação', secao: 4, flow: 2 },
  { id: 2534, nome: 'Concluído', secao: 4, flow: 1 },
  { id: 2535, nome: 'Descartado', secao: 4, flow: 1 },
];
const WF192: Col[] = [
  { id: 2540, nome: 'Backlog', secao: 1, flow: 2 },
  { id: 2541, nome: 'Fazendo', secao: 3, flow: 1 },
  { id: 2542, nome: 'Pronto', secao: 4, flow: 1 },
];
const WF300: Col[] = [{ id: 3001, nome: 'Fazendo', secao: 3, flow: 1 }, { id: 3002, nome: 'Feito', secao: 4, flow: 1 }];

const TIPOS = [
  { type_id: 1, name: 'Story' }, { type_id: 2, name: 'Sprint' }, { type_id: 3, name: 'Bug de Produção' }, { type_id: 4, name: 'Chamado' },
  { type_id: 5, name: 'Tipo Novo' },
];

const corpos = (): Record<string, unknown> => ({
  '/boards/25/currentStructure': estrutura({ 191: WF191, 192: WF192 }),
  '/boards/25/workflows': { data: [{ workflow_id: 191, name: 'Iniciativas', type: 1 }, { workflow_id: 192, name: 'Time A', type: 0 }, { workflow_id: 193, name: 'Linha', type: 2 }, { workflow_id: 194, name: 'Estranho', type: 7 }] },
  '/boards/35/currentStructure': estrutura({ 300: WF300 }),
  '/boards/35/workflows': { data: [{ workflow_id: 300, name: 'Projetos', type: 0 }] },
  '/cardTypes': { data: TIPOS },
});

const falsos: Server[] = [];
afterEach(async () => {
  for (const s of falsos.splice(0)) {
    s.closeAllConnections();
    await new Promise<void>((ok) => s.close(() => ok()));
  }
});

async function ler(modificar: (c: Record<string, unknown>) => void = () => undefined): Promise<{ lida: ReferenciaLida; pedidos: { metodo: string; caminho: string; consulta: string }[] }> {
  const dados = corpos();
  modificar(dados);
  const pedidos: { metodo: string; caminho: string; consulta: string }[] = [];
  const server = createServer((req, res) => {
    const u = new URL(req.url ?? '', 'http://x');
    pedidos.push({ metodo: req.method ?? '', caminho: u.pathname, consulta: u.search });
    const corpo = dados[u.pathname];
    res.writeHead(corpo === undefined ? 404 : 200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(corpo ?? {}));
  });
  falsos.push(server);
  await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok));
  const cliente = criarClienteHttp({ urlBase: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, apikey: 'chave-f2-de-teste-0123456789', limitePorMinuto: 1000, timeoutMs: 2000 });
  return { lida: await lerReferenciaReal(cliente, [25, 35]), pedidos };
}

const vazio: Vigentes = { ref_quadro: [], ref_workflow: [], ref_coluna: [], ref_tipo_card: [] };
/** O que a carga gravaria, relido como linhas vigentes (como o banco devolveria). */
const comoVigentes = (p: Plano): Vigentes => {
  const v: Vigentes = { ref_quadro: [], ref_workflow: [], ref_coluna: [], ref_tipo_card: [] };
  for (const op of p.operacoes) v[op.esp.tabela].push({ ...op.linha, vigente_de: op.vigenteDe, vigente_ate: null, motivo: op.motivo });
  return v;
};
const opts = { hoje: HOJE, inicioCarga: INICIO };
const dubleCom = (v: Vigentes) =>
  criarDublePg((c: Chamada) => {
    const t = /FROM \S*\.(ref_\w+) WHERE vigente_ate IS NULL/.exec(c.texto)?.[1] as keyof Vigentes | undefined;
    if (t !== undefined) return v[t];
    if (/ref_versao_criterio WHERE/.test(c.texto)) return [];
    if (/INSERT INTO \S*ref_versao_criterio \(/.test(c.texto)) return [{ versao_id: '7' }];
    return [];
  });
const escritas = (cs: Chamada[]): Chamada[] => cs.filter((c) => /^(INSERT|UPDATE)/.test(c.texto));

describe('F2: leitura da referência (só GET) e regras por folha', () => {
  it('lê estrutura, workflows e tipos só por GET, sem tocar em cards nem usuários', async () => {
    const { pedidos } = await ler();
    expect(pedidos.every((p) => p.metodo === 'GET')).toBe(true);
    expect(pedidos.map((p) => p.caminho)).toEqual(['/boards/25/currentStructure', '/boards/25/workflows', '/boards/35/currentStructure', '/boards/35/workflows', '/cardTypes']);
  });

  it('H-1: o nível sai do workflow; o mesmo quadro tem feature (type 1) e story (type 0); 35 é projeto; type 2 e type desconhecido ficam fora', async () => {
    expect([nivelDoWorkflow('25', 1), nivelDoWorkflow('25', 0), nivelDoWorkflow('35', 0), nivelDoWorkflow('25', 2)]).toEqual(['feature', 'story', 'projeto', 'nenhum']);
    const { lida } = await ler();
    const w = linhasWorkflow('25', lida.workflows.get(25));
    expect(w.ignorados).toBe(1);
    expect(w.linhas.map((l) => [l.workflow_id, l.tipo_api, l.nivel])).toEqual([['191', 1, 'feature'], ['192', 0, 'story'], ['193', 2, 'nenhum']]);
  });

  it('H-2 e H-17: Sprint não é item e não tem categoria; tipo conhecido leva a categoria; tipo fora do mapa vale o padrão', async () => {
    const { lida } = await ler();
    const t = new Map(linhasTipoCard(lida.tipos, conf).map((l) => [l.nome, l]));
    expect(t.get('Sprint')).toMatchObject({ eh_item: false, categoria: null });
    expect(t.get('Bug de Produção')).toMatchObject({ eh_item: true, categoria: 'defeito_producao' });
    expect(t.get('Chamado')).toMatchObject({ eh_item: true, categoria: 'requisicao' });
    expect(t.get('Tipo Novo')).toMatchObject({ eh_item: true, categoria: 'produto' });
  });

  it('H-8 a H-12 e H-26: papel e tipo por folha; Descartado da seção 4 é descarte, não entrega; limite 0 = sem limite', async () => {
    const { lida } = await ler();
    const c = new Map(linhasColuna('25', lida.estruturas.get(25), conf).map((l) => [l.coluna_id, l]));
    expect(c.get('2530')).toMatchObject({ papel: 'backlog', tipo_coluna: 'fila', workflow_id: '191', eh_folha: true });
    expect(c.get('2531')).toMatchObject({ papel: 'compromisso', tipo_coluna: 'fila' });
    expect(c.get('2533')).toMatchObject({ papel: 'homologacao', tipo_coluna: 'execucao', limite_wip: 4 });
    expect(c.get('2534')).toMatchObject({ papel: 'entrega', tipo_coluna: 'execucao', limite_wip: null });
    expect(c.get('2535')).toMatchObject({ papel: null, eh_descarte: true, section: 4 });
    expect(c.get('2540')).toMatchObject({ workflow_id: '192', limite_wip: null });
  });

  it('pergunta 2 (2026-10-31): a folha da exceção é trabalho e a entrega cai na folha seguinte da seção 4', async () => {
    const { lida } = await ler();
    const colunas = linhasColuna('25', lida.estruturas.get(25), conf).filter((l) => l.workflow_id === '191');
    expect(colunas.find((l) => l.coluna_id === '2532')).toMatchObject({ papel: 'trabalho', tipo_coluna: 'fila', section: 4 });
    expect(folhasDoMarco(colunas, 'entrega').map((l) => l.coluna_id)).toEqual(['2534']);
    // sem a exceção, a regra da seção 4 faria dela a primeira entrega
    const semExcecao = analisarConferencia(JSON.stringify({ ...conf, excecoes_papel_trabalho: [] }));
    const regra = linhasColuna('25', lida.estruturas.get(25), semExcecao).filter((l) => l.workflow_id === '191');
    expect(folhasDoMarco(regra, 'entrega').map((l) => l.coluna_id)).toEqual(['2532', '2534']);
  });

  it('H-23 por card: o compromisso é a primeira entrada na folha da seção 2 ou na seção 3; quem pula a seção 2 não fica sem marco', async () => {
    const { lida } = await ler();
    const colunas = linhasColuna('25', lida.estruturas.get(25), conf);
    // 191 tem seção 2 (2531); o card que vai de 2530 direto para 2533 (seção 3) tem o compromisso em 2533
    const marcos191 = folhasDoMarco(colunas.filter((l) => l.workflow_id === '191'), 'compromisso').map((l) => l.coluna_id);
    expect(marcos191).toEqual(['2531', '2533']);
    const primeira = (trajeto: string[]): string | undefined => trajeto.find((id) => marcos191.includes(id));
    expect(primeira(['2530', '2533', '2534'])).toBe('2533');
    expect(primeira(['2530', '2531', '2533', '2534'])).toBe('2531');
    expect(folhasDoMarco(colunas.filter((l) => l.workflow_id === '192'), 'compromisso').map((l) => l.coluna_id)).toEqual(['2541']);
    const so3 = [
      { coluna_id: 'b', eh_folha: true, section: 3, papel: 'homologacao', ordem: 1 }, { coluna_id: 'a', eh_folha: true, section: 3, papel: 'trabalho', ordem: 0 },
      { coluna_id: 'c', eh_folha: true, section: 4, papel: 'entrega', ordem: 2 },
    ];
    expect(folhasDoMarco(so3, 'compromisso').map((l) => l.coluna_id)).toEqual(['a', 'b']);
  });
});

describe('F2: carga com vigência (U-1) e folha sem conferência', () => {
  it('carga inicial: tudo entra com a vigência do início da carga, versão de partida sem métrica, nenhuma folha sem conferência', async () => {
    const { lida } = await ler();
    const db = dubleCom(vazio);
    const r = await sincronizarReferencia(db.pool, lida, conf, { ...opts, agora: new Date('2026-11-02T09:00:00Z') }, S);
    expect(r).toMatchObject({ fechadas: 0, semConferencia: 0, marca: false, workflowsIgnorados: 1 });
    const w = escritas(db.chamadas);
    expect(w.some((c) => c.texto.startsWith('UPDATE'))).toBe(false);
    const col = w.filter((c) => c.texto.includes('.ref_coluna ('));
    expect(col).toHaveLength(6 + 3 + 2);
    expect(col.every((c) => c.valores.at(-1) === INICIO)).toBe(true);
    const versao = w.filter((c) => c.texto.includes('ref_versao_criterio ('));
    expect(versao).toHaveLength(1);
    expect(versao[0]!.valores[0]).toBe(INICIO);
    expect(w.some((c) => c.texto.includes('ref_versao_criterio_metrica'))).toBe(false);
    expect(JSON.stringify(w)).not.toContain('chave-f2');
  });

  it('U-1, mudança de processo: fecha a vigência, abre outra na data com motivo processo e marca as métricas (T2.6)', async () => {
    const { lida } = await ler();
    const base = planejar(lida, vazio, conf, opts);
    const { lida: depois } = await ler((c) => {
      c['/boards/25/currentStructure'] = estrutura({ 191: WF191.map((x) => (x.id === 2534 ? { ...x, secao: 3 } : x)), 192: WF192 });
    });
    const db = dubleCom(comoVigentes(base));
    const r = await sincronizarReferencia(db.pool, depois, conf, { ...opts, motivo: 'processo' }, S);
    expect(r.mudancas).toContainEqual({ tabela: 'ref_coluna', chave: '25|2534', classe: 'semantica' });
    expect(r.marca).toBe(true);
    const w = escritas(db.chamadas);
    expect(w.find((c) => c.texto.startsWith('UPDATE'))!.valores).toEqual([HOJE, '25', '2534']);
    const nova = w.find((c) => c.texto.includes('.ref_coluna (') && c.valores.includes('2534'))!;
    expect(nova.valores).toContain('processo');
    expect(nova.valores.at(-1)).toBe(HOJE);
    const metricas = w.filter((c) => c.texto.includes('ref_versao_criterio_metrica')).map((c) => c.valores[1]);
    expect(metricas).toContain('O1');
    expect(metricas).toHaveLength(12);
  });

  it('U-1, correção: a nova vigência entra com motivo correcao, sem versão de critério nem marca; o texto vale para todo o período', async () => {
    const { lida } = await ler();
    const base = planejar(lida, vazio, conf, opts);
    const { lida: depois } = await ler((c) => {
      c['/boards/25/currentStructure'] = estrutura({ 191: WF191.map((x) => (x.id === 2534 ? { ...x, flow: 2 } : x)), 192: WF192 });
    });
    const db = dubleCom(comoVigentes(base));
    const r = await sincronizarReferencia(db.pool, depois, conf, { ...opts, motivo: 'correcao' }, S);
    expect(r.marca).toBe(false);
    const w = escritas(db.chamadas);
    expect(w.some((c) => c.texto.includes('ref_versao_criterio'))).toBe(false);
    expect(w.find((c) => c.texto.includes('.ref_coluna (') && c.valores.includes('2534'))!.valores).toContain('correcao');
  });

  it('a versão de critério do dia que já existe é reaproveitada: só as métricas que faltam entram', async () => {
    const { lida } = await ler();
    const base = planejar(lida, vazio, conf, opts);
    const { lida: depois } = await ler((c) => {
      c['/boards/25/currentStructure'] = estrutura({ 191: WF191.map((x) => (x.id === 2533 ? { ...x, limite: 9 } : x)), 192: WF192 });
    });
    const v = comoVigentes(base);
    const db = criarDublePg((c) => {
      const t = /FROM \S*\.(ref_\w+) WHERE vigente_ate IS NULL/.exec(c.texto)?.[1] as keyof Vigentes | undefined;
      if (t !== undefined) return v[t];
      return /ref_versao_criterio WHERE/.test(c.texto) ? [{ versao_id: '9' }] : [];
    });
    await sincronizarReferencia(db.pool, depois, conf, opts, S);
    const w = escritas(db.chamadas);
    expect(w.some((c) => c.texto.includes('ref_versao_criterio ('))).toBe(false);
    expect(w.filter((c) => c.texto.includes('ref_versao_criterio_metrica')).map((c) => c.valores)).toEqual([['9', 'O1']]);
  });

  it('vigenteEm: processo mede "como foi"; correção vale desde o início da versão corrigida', () => {
    const v = (vigente_de: string, motivo: string | null, papel: string) => ({ vigente_de, motivo, papel });
    const processo = [v('2025-11-02', null, 'entrega'), v('2026-06-01', 'processo', 'trabalho')];
    expect(vigenteEm(processo, '2026-05-31')?.papel).toBe('entrega');
    expect(vigenteEm(processo, '2026-06-01')?.papel).toBe('trabalho');
    const correcao = [v('2025-11-02', null, 'entrega'), v('2026-06-01', 'correcao', 'trabalho')];
    expect(vigenteEm(correcao, '2025-12-01')?.papel).toBe('trabalho');
    const mista = [v('2025-11-02', null, 'a'), v('2026-03-01', 'processo', 'b'), v('2026-06-01', 'correcao', 'c')];
    expect([vigenteEm(mista, '2026-01-01')?.papel, vigenteEm(mista, '2026-04-01')?.papel]).toEqual(['a', 'c']);
    expect(vigenteEm([], '2026-01-01')).toBeUndefined();
  });

  it('mudança de significado sem motivo não grava nada: o operador diz processo ou correção (nunca por inferência)', async () => {
    const { lida } = await ler();
    const base = planejar(lida, vazio, conf, opts);
    const { lida: depois } = await ler((c) => {
      c['/cardTypes'] = { data: TIPOS.map((t) => (t.name === 'Chamado' ? { ...t, name: 'Sprint' } : t)) };
    });
    const db = dubleCom(comoVigentes(base));
    await expect(sincronizarReferencia(db.pool, depois, conf, opts, S)).rejects.toMatchObject({ name: 'ErroReferencia', tipo: 'motivo' });
    expect(escritas(db.chamadas)).toEqual([]);
  });

  it('H-12: limite que sai de 0 para 8 é processo automático e marca só o O1; renomear coluna é correção sem marca', async () => {
    const { lida } = await ler();
    const base = planejar(lida, vazio, conf, opts);
    const { lida: depois } = await ler((c) => {
      c['/boards/25/currentStructure'] = estrutura({ 191: WF191.map((x) => (x.id === 2530 ? { ...x, limite: 8 } : x.id === 2531 ? { ...x, nome: 'Comprometidos' } : x)), 192: WF192 });
    });
    const p = planejar(depois, comoVigentes(base), conf, opts);
    expect(p.pendentes).toEqual([]);
    expect(p.mudancas.map((m) => [m.chave, m.classe])).toEqual([['25|2530', 'processo'], ['25|2531', 'rotulo']]);
    expect(p.metricasMarcadas).toEqual(['O1']);
    expect(p.operacoes.map((o) => o.motivo)).toEqual(['processo', 'correcao']);
  });

  it('mudança do type do workflow é nova vigência com marca; quadro editado à mão nunca é refeito', async () => {
    const { lida } = await ler();
    const base = planejar(lida, vazio, conf, opts);
    const vig = comoVigentes(base);
    vig.ref_quadro = vig.ref_quadro.map((q) => ({ ...q, equipe: 'Editado', eh_teste: true }));
    const { lida: depois } = await ler((c) => {
      c['/boards/25/workflows'] = { data: [{ workflow_id: 191, name: 'Iniciativas', type: 0 }, { workflow_id: 192, name: 'Time A', type: 0 }, { workflow_id: 193, name: 'Linha', type: 2 }] };
    });
    const p = planejar(depois, vig, conf, opts);
    expect(p.mudancas).toEqual([{ tabela: 'ref_workflow', chave: '25|191', classe: 'processo' }]);
    expect(p.metricasMarcadas).toHaveLength(12);
    expect(p.operacoes.some((o) => o.esp.tabela === 'ref_quadro')).toBe(false);
  });

  it('segunda mudança no mesmo dia da vigência aberta é recusada (a chave de vigência não repete a data)', async () => {
    const { lida } = await ler();
    const vig = comoVigentes(planejar(lida, vazio, conf, { hoje: HOJE, inicioCarga: HOJE }));
    const { lida: depois } = await ler((c) => {
      c['/boards/35/workflows'] = { data: [{ workflow_id: 300, name: 'Projetos', type: 1 }] };
    });
    expect(() => planejar(depois, vig, conf, opts)).toThrow(ErroReferencia);
  });

  it('folha nova fora do arquivo entra pela regra e é contada; a já listada no arquivo e a carga inicial não contam', async () => {
    const { lida } = await ler();
    const base = planejar(lida, vazio, conf, opts);
    expect(base.semConferencia).toEqual([]);
    const vig = comoVigentes(base);
    const { lida: depois } = await ler((c) => {
      c['/boards/25/currentStructure'] = estrutura({
        191: [...WF191, { id: 2599, nome: 'Nova etapa', secao: 3, flow: 1 }],
        192: [...WF192, { id: 2027, nome: 'Publicação APPLE e GOOGLE', secao: 4, flow: 2 }], // listada no arquivo (pergunta 2)
      });
    });
    const p = planejar(depois, vig, conf, opts);
    expect(p.semConferencia).toEqual(['25|2599']);
    expect(p.operacoes.find((o) => o.linha.coluna_id === '2599')!.linha).toMatchObject({ papel: 'trabalho', tipo_coluna: 'execucao' });
    const db = criarDublePg();
    await registrarFolhasSemConferencia(db.pool, 5, 1, S);
    expect(db.chamadas.map((c) => c.texto.split(' ')[0])).toEqual(['UPDATE', 'INSERT']);
    expect(db.chamadas[1]!.valores).toEqual([5, ENTIDADE_SEM_CONFERENCIA, 1]);
    const dub2 = criarDublePg(() => ({ rows: [], rowCount: 1 }));
    await registrarFolhasSemConferencia(dub2.pool, 5, 2, S);
    expect(dub2.chamadas).toHaveLength(1);
  });
});

describe('F2: forma inesperada da resposta e lista da F1 com a exceção de trabalho', () => {
  it('workflows, tipos e colunas fora do formato: o que não tem id ou tipo conhecido sai e é contado; nada é inferido', () => {
    const w = linhasWorkflow('25', { data: ['x', { workflow_id: 0, type: 0 }, { workflow_id: 5, type: '0' }, { workflow_id: 6, type: -1 }, { workflow_id: 8, type: 0 }] });
    expect(w.ignorados).toBe(4);
    expect(w.linhas).toEqual([{ quadro_id: '25', workflow_id: '8', nome: 'Workflow 8', tipo_api: 0, nivel: 'story' }]);
    expect(linhasTipoCard({ data: ['x', { type_id: 9 }, { name: 'Sem id' }] }, conf)).toEqual([{ tipo_id: '9', nome: 'Tipo 9', eh_item: true, categoria: 'produto' }]);
    expect(linhasColuna('1', { data: {} }, conf)).toEqual([]);
    expect(linhasColuna('1', null, conf)).toEqual([]);
    const c = new Map(linhasColuna('1', {
      data: {
        columns: {
          abc: { name: 'x' }, '7': 'texto', '10': {}, '14': { name: 'Solta', workflow_id: 6, section: 3, flow_type: 1 },
          '11': { name: '  ', workflow_id: 5, parent_column_id: 12, limit: 99999, flow_type: 1 },
          '12': { name: 'Mãe', section: 3, workflow_id: 5, flow_type: 9, limit: -1 },
          '13': { name: 'Órfã', workflow_id: 5, parent_column_id: 77, section: 9, flow_type: 1 },
        },
        child_columns: { '12': [11], '13': 'x' },
        workflows: { '5': { top_columns: [12, 13], bottom_columns: [11, 13] }, '6': 'texto' },
      },
    }, conf).map((l) => [l.coluna_id, l]));
    expect(c.get('10')).toMatchObject({ nome: 'Coluna 10', workflow_id: null, papel: null, tipo_coluna: null, ordem: 0, eh_folha: true });
    expect(c.get('11')).toMatchObject({ nome: 'Coluna 11', section: 3, papel: 'trabalho', tipo_coluna: 'execucao', limite_wip: 32767, ordem: 0 });
    expect(c.get('12')).toMatchObject({ eh_folha: false, papel: null, tipo_coluna: null, section: 3, flow_type: null, limite_wip: null, ordem: 0 });
    expect(c.get('13')).toMatchObject({ section: null, papel: null, tipo_coluna: 'execucao', ordem: 1 });
    expect(c.get('14')).toMatchObject({ ordem: 0 });
    expect(c.size).toBe(5);
  });

  it('renomear workflow ou tipo é só rótulo: nova vigência sem motivo e sem marca', async () => {
    const { lida } = await ler();
    const base = planejar(lida, vazio, conf, opts);
    const { lida: depois } = await ler((d) => {
      d['/boards/25/workflows'] = { data: [{ workflow_id: 191, name: 'Outro nome', type: 1 }, { workflow_id: 192, name: 'Time A', type: 0 }, { workflow_id: 193, name: 'Linha', type: 2 }] };
    });
    const p = planejar(depois, comoVigentes(base), conf, opts);
    expect(p.mudancas).toEqual([{ tabela: 'ref_workflow', chave: '25|191', classe: 'rotulo' }]);
    expect(p.operacoes.map((o) => o.motivo)).toEqual([null]);
    expect(p.metricasMarcadas).toEqual([]);
  });

  it('lista da F1: a folha da exceção de trabalho é marcada e não vira candidata de marco; exceção sem coluna na estrutura lida é apontada', () => {
    const lista = montarLista(new Map<number, unknown>([[25, estrutura({ 191: WF191, 202: [{ id: 1, nome: 'Backlog', secao: 1, flow: 2 }] })]]), conf);
    const marca = lista.find((l) => l.coluna === '2532')!;
    expect(marca).toMatchObject({ papel: 'trabalho', tipo: 'fila' });
    expect(marca.marca).toContain('exceção do arquivo: trabalho');
    expect(marca.marca).not.toContain('exceção de marco');
    expect(lista.find((l) => l.coluna === '2534')!.marca).toBe('');
    expect(excecoesSemColuna(lista, conf)).toContain('202/1721');
  });
});

describe('F2: U-2, o evento conta no workflow, no nível e no time do instante dele', () => {
  const vig = (vigente_de: string, vigente_ate: string | null, motivo: string | null = null) => ({ vigente_de, vigente_ate, motivo });
  const ref = {
    colunas: [
      { quadro_id: '25', coluna_id: '2533', workflow_id: '191', ...vig('2025-11-02', null) },
      { quadro_id: '25', coluna_id: '2541', workflow_id: '192', ...vig('2025-11-02', null) },
    ],
    workflows: [
      { quadro_id: '25', workflow_id: '191', nivel: 'feature', ...vig('2025-11-02', null) },
      { quadro_id: '25', workflow_id: '192', nivel: 'story', ...vig('2025-11-02', null) },
    ],
    times: [
      { workflow_id: '191', time_id: 1, situacao: 'time', ...vig('2025-11-02', null) },
      { workflow_id: '192', time_id: 2, situacao: 'time', ...vig('2025-11-02', '2026-06-01', 'carga_inicial') },
      { workflow_id: '192', time_id: 3, situacao: 'time', ...vig('2026-06-01', null, 'processo') },
    ],
  };
  it('card que muda de workflow: cada evento conta no time e no nível do workflow em que aconteceu', () => {
    expect(contextoDoEvento({ quadro: '25', coluna: '2533', dia: '2026-01-10' }, ref)).toEqual({ workflow: '191', nivel: 'feature', time_id: 1, situacao: 'time' });
    expect(contextoDoEvento({ quadro: '25', coluna: '2541', dia: '2026-02-10' }, ref)).toEqual({ workflow: '192', nivel: 'story', time_id: 2, situacao: 'time' });
  });
  it('time que mudou de definição: o evento antigo fica no time antigo e o novo no novo', () => {
    expect(contextoDoEvento({ quadro: '25', coluna: '2541', dia: '2026-05-31' }, ref).time_id).toBe(2);
    expect(contextoDoEvento({ quadro: '25', coluna: '2541', dia: '2026-06-01' }, ref).time_id).toBe(3);
    expect(contextoDoEvento({ quadro: '25', coluna: '9999', dia: '2026-06-01' }, ref)).toEqual({ workflow: null, nivel: null, time_id: null, situacao: null });
  });
});

describe('F2: mapa.ts, identidade por id da coluna (ADR 0016)', () => {
  const col = (id: string, nome: string, quadro = 'q1') =>
    ({ quadro_id: quadro, coluna_id: id, nome, tipo_coluna: 'fila', papel: 'trabalho', ordem: 1, limite_wip: null });
  it('nome único no quadro segue como está; nome repetido em workflows diferentes ganha o id e as colunas não se fundem', () => {
    const ls = [col('1', 'Backlog'), col('2', 'Backlog'), col('3', 'Fazendo'), col('4', 'Backlog', 'q2')];
    const n = nomesDeColuna(ls);
    expect([...n.values()]).toEqual(['Backlog (1)', 'Backlog (2)', 'Fazendo', 'Backlog']);
    expect(colunasDe(ls).map((c) => c.coluna)).toEqual(['Backlog (1)', 'Backlog (2)', 'Fazendo', 'Backlog']);
  });
});

describe('F2 volta 1: chaves ausentes, folhas sem papel e campo de pessoa', () => {
  it('A3: chave vigente que some do quadro é contada no Resultado e a vigência dela não é fechada', async () => {
    const { lida } = await ler();
    const vig = comoVigentes(planejar(lida, vazio, conf, opts));
    const { lida: depois } = await ler((c) => {
      c['/boards/25/currentStructure'] = estrutura({ 191: WF191.filter((x) => x.id !== 2530), 192: WF192 });
      c['/cardTypes'] = { data: TIPOS.filter((t) => t.type_id !== 5) };
      c['/boards/25/workflows'] = { data: [{ workflow_id: 191, name: 'Iniciativas', type: 1 }] };
    });
    const p = planejar(depois, vig, conf, { hoje: '2026-11-09', inicioCarga: INICIO });
    expect(p.ausentes).toEqual({ ref_coluna: 1, ref_workflow: 2, ref_tipo_card: 1 });
    expect(p.operacoes.filter((o) => o.fechar !== undefined && ['2530', '5'].includes(String(o.linha.coluna_id ?? o.linha.tipo_id)))).toEqual([]);
    const db = dubleCom(vig);
    const r = await sincronizarReferencia(db.pool, depois, conf, { hoje: '2026-11-09', inicioCarga: INICIO, motivo: 'correcao' }, S);
    expect(r.ausentes).toEqual({ ref_coluna: 1, ref_workflow: 2, ref_tipo_card: 1 });
    expect(escritas(db.chamadas).some((c) => c.texto.startsWith('UPDATE') && c.valores.includes('2530'))).toBe(false);
  });

  it('A5: folha sem papel (sem seção) é contada no Resultado; descarte não conta', async () => {
    const { lida: base } = await ler();
    expect(planejar(base, vazio, conf, opts).folhasSemPapel).toBe(0);
    const { lida } = await ler((c) => {
      c['/boards/35/currentStructure'] = estrutura({ 300: [...WF300, { id: 3009, nome: 'Fora de seção', secao: 9, flow: 1 }] });
    });
    const p = planejar(lida, vazio, conf, opts);
    expect(p.folhasSemPapel).toBe(1);
    const r = await sincronizarReferencia(dubleCom(vazio).pool, lida, conf, { ...opts, agora: new Date('2026-11-02T09:00:00Z') }, S);
    expect(r.folhasSemPapel).toBe(1);
  });

  it('A1 da segurança: campo de pessoa na resposta (owner, e-mail, nome) não chega às escritas nem ao erro', async () => {
    const pessoa = { owner_user_id: 'MARCA-OWNER-9', email: 'MARCA-EMAIL@x.test', realname: 'MARCA-NOME', username: 'MARCA-USER' };
    const { lida } = await ler((c) => {
      const ce = (c['/boards/25/currentStructure'] as { data: Record<string, Record<string, unknown>> }).data;
      Object.assign(ce, pessoa);
      for (const col of Object.values(ce.columns as Record<string, Record<string, unknown>>)) Object.assign(col, pessoa);
      for (const w of Object.values(ce.workflows as Record<string, Record<string, unknown>>)) Object.assign(w, pessoa);
      c['/boards/25/workflows'] = { data: [{ workflow_id: 191, name: 'Iniciativas', type: 1, ...pessoa }, { workflow_id: 192, name: 'Time A', type: 0, ...pessoa }] };
      c['/cardTypes'] = { data: TIPOS.map((t) => ({ ...t, ...pessoa })) };
    });
    const db = dubleCom(vazio);
    await sincronizarReferencia(db.pool, lida, conf, { ...opts, agora: new Date('2026-11-02T09:00:00Z') }, S);
    const texto = JSON.stringify(escritas(db.chamadas).map((c) => [c.texto, c.valores]));
    expect(texto).not.toMatch(/MARCA-|@x\.test/);
    const vig = comoVigentes(planejar(lida, vazio, conf, opts));
    const { lida: muda } = await ler((c) => {
      c['/boards/35/currentStructure'] = estrutura({ 300: [{ id: 3001, nome: 'Fazendo', secao: 4, flow: 1, ...pessoa } as never, ...WF300.slice(1)] });
    });
    let msg = '';
    try {
      await sincronizarReferencia(dubleCom(vig).pool, muda, conf, { hoje: '2026-11-09', inicioCarga: INICIO }, S);
    } catch (e) {
      msg = e instanceof Error ? e.message : String(e);
    }
    expect(msg).not.toBe('');
    expect(msg).not.toMatch(/MARCA-|@x\.test/);
  });
});
