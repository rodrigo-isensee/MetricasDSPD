import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  CAMINHOS_CATALOGO, ehEtiquetaDeSistema, etiquetasDeSistema, opcoesDoCatalogo, executarSpikeCampos, novoAcumulo, renderizarResumo, rotuloSeguro, somarCard, TETO_AMOSTRA,
} from '../src/modulos/businessmap/spike-campos.js';

// Dados fictícios e servidor local: nenhuma chamada ao BusinessMap real; o `.env` nunca é lido.
const KEY = 'chave-spike-campos-0123456789';
const card = (id: number, campos: unknown[], tags: unknown[] = []) => ({ card_id: id, custom_fields: campos, tag_ids: tags });
const dropdown = (field: number, valueId: number, rotulo: string) => ({ field_id: field, values: [{ value_id: valueId, value: rotulo }] });

describe('etiqueta de sistema', () => {
  it('reconhece o prefixo com tolerância e recusa o resto', () => {
    for (const r of ['SISTEMA - Alfa', 'sistema - beta', ' Sistema  -  Gama', 'SISTEMA-Delta', 'Sistema – Épsilon']) expect(ehEtiquetaDeSistema(r), r).toBe(true);
    for (const r of ['SISTEMAS - Alfa', 'Urgente', 'SISTEMA', 'SISTEMA - ', 'X SISTEMA - A', 42, undefined]) expect(ehEtiquetaDeSistema(r), String(r)).toBe(false);
  });
  it('rótulo seguro não quebra a tabela', () => {
    expect(rotuloSeguro('a|b`c\nd')).toBe('a b c d');
    expect(rotuloSeguro('x'.repeat(200))).toHaveLength(80);
  });
});

describe('acúmulo', () => {
  it('conta opções por card uma vez, forma do valor e preenchimento', () => {
    const ac = novoAcumulo();
    somarCard(ac, card(1, [dropdown(40, 7, 'Diretoria Alfa'), dropdown(41, 9, 'Gerência Um'), { field_id: 99, value: 'ignorado' }]));
    somarCard(ac, card(2, [dropdown(40, 7, 'Diretoria Alfa'), { field_id: 50, value: 'Receita' }]));
    somarCard(ac, card(2, [dropdown(40, 8, 'Repetido')])); // card repetido: ignorado
    somarCard(ac, card(3, [{ field_id: 49, values: [] }]));
    somarCard(ac, { sem: 'id' });
    expect(ac.cardsLidos.size).toBe(3);
    const c40 = ac.campos.get('40')!;
    expect(c40.opcoes.get('7')?.cards.size).toBe(2);
    expect(c40.opcoes.has('8')).toBe(false);
    expect(c40.forma.has('$.values[].value_id')).toBe(true);
    expect(ac.campos.get('50')!.opcoes.get('(escalar)')?.cards.size).toBe(1);
    expect(ac.campos.get('49')!.comEntrada.size).toBe(1);
    expect(ac.campos.get('49')!.preenchidos.size).toBe(0);
  });
  it('etiquetas: só as de sistema, com contagem de cards; aceita tag_ids em id ou objeto', () => {
    const ac = novoAcumulo();
    somarCard(ac, card(1, [], [10, '11', { tag_id: 12 }]));
    somarCard(ac, card(2, [], [10]));
    const cat = [
      { tag_id: 10, label: 'SISTEMA - Alfa' }, { tag_id: 10, label: 'SISTEMA - Alfa' }, { tag_id: 11, label: 'Urgente' },
      { tag_id: 12, label: 'sistema - Beta' }, { tag_id: 13, label: 'SISTEMA - Gama' }, { tag_id: 'x', label: 'SISTEMA - Z' },
    ];
    expect(etiquetasDeSistema(cat, ac)).toEqual([
      { tagId: '10', rotulo: 'SISTEMA - Alfa', cards: 2 }, { tagId: '12', rotulo: 'sistema - Beta', cards: 1 }, { tagId: '13', rotulo: 'SISTEMA - Gama', cards: 0 },
    ]);
    expect(renderizarResumo(ac, etiquetasDeSistema(cat, ac), [])).not.toMatch(/Alfa|Beta|Gama/);
  });
});

interface Pedido { metodo: string; url: string; caminho: string; apikey: string | undefined }
let servers: Server[] = [];
let tmp: string;
let raiz: string;
beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'spike-campos-'));
  raiz = join(tmp, 'clone');
  mkdirSync(raiz);
});
afterEach(async () => {
  for (const s of servers) {
    s.closeAllConnections();
    await new Promise<void>((ok) => s.close(() => ok()));
  }
  servers = [];
  rmSync(tmp, { recursive: true, force: true });
});

const subir = async (cards: unknown[], tags: unknown[]): Promise<{ url: string; pedidos: Pedido[] }> => {
  const pedidos: Pedido[] = [];
  const server = createServer((req, res) => {
    const u = new URL(req.url ?? '', 'http://x');
    pedidos.push({ metodo: req.method ?? '', url: req.url ?? '', caminho: u.pathname, apikey: req.headers.apikey as string | undefined });
    let corpo: unknown = {};
    if (u.pathname === '/cards') {
      const pagina = Number(u.searchParams.get('page'));
      const por = Number(u.searchParams.get('per_page'));
      corpo = { data: { data: cards.slice((pagina - 1) * por, pagina * por), pagination: { all_pages: Math.ceil(cards.length / por) } } };
    } else if (u.pathname === '/tags') corpo = { data: tags };
    else if (/^\/customFields\/\d+$/.test(u.pathname)) {
      const id = Number(u.pathname.split('/')[2]);
      corpo = { data: { field_id: id, allowed_values: [{ value_id: id * 10 + 1, value: `Opção Fictícia ${id}A`, position: 0 }, { value_id: id * 10 + 2, value: `Opção Fictícia ${id}B`, position: 1 }] } };
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(corpo));
  });
  await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok));
  servers.push(server);
  return { url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, pedidos };
};
const rodar = (url: string, dirSaida: string, extra: Record<string, string> = {}) =>
  executarSpikeCampos({ env: { BUSINESSMAP_URL_BASE: url, BUSINESSMAP_APIKEY: KEY, BUSINESSMAP_QUADROS_IDS: '10', ...extra }, dirSaida, raizRepositorio: raiz, agora: () => Date.parse('2026-11-16T12:00:00Z') });

describe('catálogo de opções', () => {
  it('lê allowed_values, values e options; ignora o que não tem value_id', () => {
    expect(opcoesDoCatalogo({ data: { allowed_values: [{ value_id: 1, value: 'A', position: 2 }, { value: 'sem id' }, 5] } })).toEqual([{ valueId: '1', rotulo: 'A', position: '2' }]);
    expect(opcoesDoCatalogo({ data: [{ values: [{ value_id: '9', label: 'B' }] }] })).toEqual([{ valueId: '9', rotulo: 'B', position: '' }]);
    expect(opcoesDoCatalogo({ data: { options: [] } })).toEqual([]);
    expect(opcoesDoCatalogo({ erro: 1 })).toEqual([]);
  });
});

describe('executarSpikeCampos', () => {
  it('só GET, amostra limitada a 200, relatório com rótulo fora do clone e stdout sem rótulo', async () => {
    const cards = Array.from({ length: 260 }, (_, i) => card(i + 1, [dropdown(40, 1 + (i % 2), i % 2 === 0 ? 'Diretoria Fictícia A' : 'Diretoria Fictícia B')], i % 3 === 0 ? [5] : []));
    const f = await subir(cards, [{ tag_id: 5, label: 'SISTEMA - Sistema Fictício' }, { tag_id: 6, label: 'Outra' }]);
    const saida = join(tmp, 'saida');
    const r = await rodar(f.url, saida);
    expect(r).toMatchObject({ codigo: 0, erro: '' });
    expect(r.saida).toContain('Cards distintos lidos: 200.');
    expect(r.saida).not.toMatch(/Fictíci/);
    expect(TETO_AMOSTRA).toBe(200);
    expect(f.pedidos.every((p) => p.metodo === 'GET' && p.apikey === KEY)).toBe(true);
    const cat = f.pedidos.filter((p) => p.caminho.startsWith('/customFields'));
    expect(cat.map((p) => p.url)).toEqual(['40', '41', '48', '49', '50'].map((i) => `/customFields/${i}`)); // sem consulta
    expect(f.pedidos.map((p) => p.caminho).every((c) => c === '/cards' || c === '/tags' || CAMINHOS_CATALOGO.some((r) => r.test(c)))).toBe(true);
    expect(r.saida).toContain('Catálogo do campo 48: 2 opções.');
    const arq = join(saida, 'relatorio-campos-sistemas.md');
    expect(statSync(arq).mode & 0o777).toBe(0o600);
    const rel = readFileSync(arq, 'utf8');
    expect(rel).toContain('| 1 | Diretoria Fictícia A | 100 |');
    expect(rel).toContain('| 5 | SISTEMA - Sistema Fictício | 67 |');
    expect(rel).toContain('| 481 | Opção Fictícia 48A | 0 |');
    expect(rel).toContain('| 502 | Opção Fictícia 50B | 1 |');
    expect(rel).not.toContain('Outra');
    expect(rel).not.toContain(KEY);
  });

  it('recusa saída dentro do clone e configuração sem quadros, sem ir à rede', async () => {
    const f = await subir([], []);
    expect(await rodar(f.url, join(raiz, 'x'))).toEqual({ codigo: 2, saida: '', erro: 'diretório da saída bruta dentro do repositório recusado' });
    const sem = await executarSpikeCampos({ env: { BUSINESSMAP_URL_BASE: f.url, BUSINESSMAP_APIKEY: KEY }, dirSaida: join(tmp, 's'), raizRepositorio: raiz });
    expect(sem.codigo).toBe(2);
    expect(f.pedidos).toHaveLength(0);
  });
});
