import { afterEach, describe, expect, it } from 'vitest';
import { coletarCards, type DepsColeta, type ModoColeta } from '../src/modulos/businessmap/coleta.js';
import {
  CAMPOS_CARD, COLUNAS_LISTA, classeDoRotuloDeTag, mapaDeTagsDeClasse, reduzirTagsDeClasse, registroCard, serializar,
} from '../src/modulos/businessmap/allow-list.js';
import { classeDeServicoDasTags } from '../src/modulos/businessmap/normalizador.js';
import { lerMapaDeTagsDeClasse } from '../src/modulos/businessmap/tags.js';
import { criarEsquemaDominioBm } from '../src/modulos/businessmap/dominio-businessmap.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarClienteHttp } from '../src/plataforma/http.js';
import { bancoFalso, subirServidorBm, type Cartao, type ServidorBm } from './businessmap-coleta-duble.js';

// Pedido 105, E7.3 (ADR 0020 item 4i): classe de serviço pelas etiquetas do card. Servidor falso; nada vai ao BusinessMap real.
// A lista de proibidos é escrita aqui, à mão (não deriva das constantes da allow-list).
const MARCADOR = 'ROTULO-MARCADOR-ETIQUETA';
const TAGS = [
  { tag_id: 1, label: 'Urgente', color: MARCADOR },
  { tag_id: 2, label: 'Prioritario' },
  { tag_id: 3, label: 'PrazoFixo' },
  { tag_id: 4, label: 'Padrao' },
  { tag_id: 5, label: `Tema ${MARCADOR}` },
  { tag_id: 6, label: ' padrão ' },
];
const MAPA = mapaDeTagsDeClasse(TAGS);

describe('rótulo da etiqueta -> classe (decisão do dono de 2026-11-15)', () => {
  it('Urgente, Prioritario, PrazoFixo e Padrao e as variações de caixa, acento e espaço', () => {
    for (const r of ['Urgente', 'URGENTE', 'urgente', ' Urgente ']) expect(classeDoRotuloDeTag(r), r).toBe('Urgente');
    for (const r of ['Prioritario', 'Prioritário', 'PRIORITÁRIO', 'prioritario']) expect(classeDoRotuloDeTag(r), r).toBe('Prioritário');
    for (const r of ['PrazoFixo', 'Prazo fixo', 'prazo-fixo', 'PRAZO FIXO', 'Prazo_Fixo']) expect(classeDoRotuloDeTag(r), r).toBe('Prazo fixo');
    for (const r of ['Padrao', 'Padrão', 'PADRÃO', 'padrao']) expect(classeDoRotuloDeTag(r), r).toBe('Padrão');
  });
  it('Intangível não é classe; texto fora da lista, não texto e rótulo enorme ficam sem classe', () => {
    for (const r of ['Intangível', 'Intangivel', 'Expedite', 'Standard', 'Urgentes', '', null, 7, undefined, 'a'.repeat(500)]) expect(classeDoRotuloDeTag(r), String(r)).toBeUndefined();
  });
  it('o mapa guarda só id e classe das etiquetas de classe; as outras somem', () => {
    expect([...MAPA.entries()]).toEqual([['1', 'Urgente'], ['2', 'Prioritário'], ['3', 'Prazo fixo'], ['4', 'Padrão'], ['6', 'Padrão']]);
  });
});

describe('C5/C9: fronteira de registroCard (4i)', () => {
  const base = { card_id: 10, title: 'T', created_at: '2026-10-01T10:00:00Z' };
  it('C5: só `classes_tag` com classes do mapa; id fora do mapa, objeto com rótulo e chave desconhecida não deixam rastro', () => {
    const r = registroCard({ ...base, tag_ids: [3, '1', 5, 999, { tag_id: 4, label: MARCADOR }, { label: MARCADOR }, 'x', null, 1.5, -2], tags: [{ label: MARCADOR }], tag_novo: MARCADOR }, new Map(), MAPA);
    expect(r.classes_tag).toEqual(['Urgente', 'Prazo fixo', 'Padrão']);
    const texto = serializar(r);
    expect(texto).not.toContain(MARCADOR);
    for (const proibido of ['tag_ids', 'label', 'tags', 'tag_novo', '"5"', '999']) expect(Object.keys(r)).not.toContain(proibido);
    expect(texto).not.toMatch(/label|tag_id/);
  });
  it('classes sem repetição e na ordem fixa, mesmo com a ordem das etiquetas trocada', () => {
    expect(reduzirTagsDeClasse([4, 3, 4, 2, 1], MAPA)).toEqual(['Urgente', 'Prioritário', 'Prazo fixo', 'Padrão']);
    expect(serializar(registroCard({ ...base, tag_ids: [4, 1] }, new Map(), MAPA))).toBe(serializar(registroCard({ ...base, tag_ids: [1, 4, 6] }, new Map(), MAPA)));
  });
  it('lista vazia = lido sem etiqueta de classe; tag_ids que não é lista, ou ausente = não lido (sem a chave)', () => {
    expect(registroCard({ ...base, tag_ids: [] }, new Map(), MAPA).classes_tag).toEqual([]);
    expect(registroCard({ ...base, tag_ids: [5, 999] }, new Map(), MAPA).classes_tag).toEqual([]);
    for (const v of [undefined, null, 'Urgente', 7, { 1: 1 }]) expect(Object.keys(registroCard({ ...base, tag_ids: v }, new Map(), MAPA)), String(v)).not.toContain('classes_tag');
  });
  it('C9: sem catálogo lido (mapa ausente) o registro e o hash são os de antes, com ou sem tag_ids no card', () => {
    const sem = serializar(registroCard(base));
    expect(serializar(registroCard({ ...base, tag_ids: [1, 2, 3] }))).toBe(sem);
    expect(serializar(registroCard({ ...base, tag_ids: [1, 2, 3] }, new Map()))).toBe(sem);
  });
  it('`tag_ids` e `classes_tag` não são campo escalar da lista fechada', () => {
    expect(CAMPOS_CARD as readonly string[]).not.toContain('tag_ids');
    expect(CAMPOS_CARD as readonly string[]).not.toContain('classes_tag');
  });
});

describe('C6: classe no normalizador (4i)', () => {
  it('sem a chave: nula e classe_nao_lida; lista vazia: nula e classe_sem_tag (nunca Padrão); uma classe: ela; duas diferentes: nula e classe_tag_empate', () => {
    const n: string[] = [];
    expect(classeDeServicoDasTags({}, n)).toBeNull();
    expect(classeDeServicoDasTags({ classes_tag: [] }, n)).toBeNull();
    expect(classeDeServicoDasTags({ classes_tag: ['Padrão'] }, n)).toBe('Padrão');
    expect(classeDeServicoDasTags({ classes_tag: ['Padrão', 'Padrão'] }, n)).toBe('Padrão');
    expect(classeDeServicoDasTags({ classes_tag: ['Prioritário'] }, n)).toBe('Prioritário');
    expect(classeDeServicoDasTags({ classes_tag: ['Urgente', 'Padrão'] }, n)).toBeNull();
    expect(n).toEqual(['classe_nao_lida', 'classe_sem_tag', 'classe_tag_empate']);
  });
  it('valor fora das quatro classes (Intangível, lixo) não vira classe', () => {
    const n: string[] = [];
    expect(classeDeServicoDasTags({ classes_tag: ['Intangível'] }, n)).toBeNull();
    expect(classeDeServicoDasTags({ classes_tag: [7, null] }, n)).toBeNull();
    expect(n).toEqual(['classe_sem_tag', 'classe_sem_tag']);
  });
});

describe('C8: uma fonte por coluna', () => {
  it('classe_servico não é mais coluna de campo customizado; o esquema do arquivo a recusa', () => {
    expect(COLUNAS_LISTA as readonly string[]).not.toContain('classe_servico');
    const esquema = criarEsquemaDominioBm(['lista']);
    const campo = { field_id: '7', type: 'lista', coluna: 'classe_servico', valores: [{ codigo: 'a', rotulo: 'A' }] };
    expect(esquema.safeParse({ campos: [campo] }).success).toBe(false);
  });
});

const abertos: ServidorBm[] = [];
afterEach(async () => { for (const s of abertos.splice(0)) await s.fechar(); });
const S = montarEsquemas('');
const AGORA = new Date('2026-11-02T12:00:00Z');
const card = (id: number, extra: Cartao = {}): Cartao => ({ card_id: id, title: `Card ${id}`, type_id: 3, created_at: '2026-01-01T10:00:00Z', column_id: 2530, ...extra });
async function montar(cards: Cartao[], corpos: Record<string, unknown>, status: Record<string, number> = {}) {
  const servidor = await subirServidorBm({ cards: { '35|active': cards }, porPagina: 100, users: {}, status, corpos });
  abertos.push(servidor);
  const banco = bancoFalso();
  const logs: unknown[] = [];
  const cliente = criarClienteHttp({ urlBase: servidor.url, apikey: 'chave-e73-de-teste-0123456789', limitePorMinuto: 1000, timeoutMs: 2000 }, { dormir: () => Promise.resolve(), log: (e) => logs.push(e) });
  return { servidor, banco, logs, deps: { cliente, pool: banco.pool, S, quadros: [35], hostBase: 'bm.exemplo.test', agora: () => AGORA } satisfies DepsColeta };
}
const carga: ModoColeta = { tipo: 'carga_inicial' };

describe('coleta: catálogo de etiquetas antes dos cards (4i)', () => {
  it('lê /tags só com GET, pede tag_ids e grava no staging só a classe; rótulo, id e etiqueta fora do mapa não aparecem em staging, controle nem log', async () => {
    const m = await montar(
      [card(1, { tag_ids: [1, 5] }), card(2, { tag_ids: [] }), card(3, { tag_ids: [1, 4] }), card(4, { tag_ids: [2] })],
      { '/tags': { data: TAGS } });
    const r = await coletarCards(m.deps, carga);
    expect(r.estado).toBe('sucesso');
    const pedidos = m.servidor.pedidos;
    expect(pedidos.map((p) => p.caminho)).toEqual(['/tags', '/cards', '/cards', '/cards']);
    expect(pedidos.every((p) => p.metodo === 'GET')).toBe(true);
    expect(pedidos[0]!.consulta.toString()).toBe('');
    expect(pedidos[1]!.consulta.get('expand')).toContain('tag_ids');
    const classes = m.banco.estado.stg.map((s) => [s.idOrigem, (JSON.parse(s.payload) as Record<string, unknown>).classes_tag]);
    expect(classes).toEqual([['1', ['Urgente']], ['2', []], ['3', ['Urgente', 'Padrão']], ['4', ['Prioritário']]]);
    const tudo = JSON.stringify([m.banco.estado.stg, m.banco.estado.falhas, m.banco.chamadas.map((c) => [c.texto, c.valores]), m.logs]);
    expect(tudo).not.toContain(MARCADOR);
    for (const s of m.banco.estado.stg) expect(s.payload).not.toMatch(/tag_ids|label|"tag_id"/);
  });

  it('recoleta igual não duplica a versão; mudar a etiqueta do card é versão nova (append-only)', async () => {
    const m = await montar([card(1, { tag_ids: [4] })], { '/tags': { data: TAGS } });
    await coletarCards(m.deps, carga);
    await coletarCards(m.deps, carga);
    expect(m.banco.estado.stg).toHaveLength(1);
    m.servidor.cenario.cards['35|active'] = [card(1, { tag_ids: [1] })];
    await coletarCards(m.deps, carga);
    expect(m.banco.estado.stg.map((s) => (JSON.parse(s.payload) as { classes_tag: string[] }).classes_tag)).toEqual([['Padrão'], ['Urgente']]);
  });

  it('catálogo sem etiqueta de classe: lido, e os cards saem com lista vazia (sem classe, nunca Padrão)', async () => {
    const m = await montar([card(1, { tag_ids: [5] })], { '/tags': { data: [{ tag_id: 5, label: 'Tema' }] } });
    await coletarCards(m.deps, carga);
    expect((JSON.parse(m.banco.estado.stg[0]!.payload) as { classes_tag: unknown }).classes_tag).toEqual([]);
  });

  it('falha do /tags (403) para a leitura dos cards: nada é gravado sem a classe, a falha vai por código e a coleta termina em falha', async () => {
    const m = await montar([card(1, { tag_ids: [1] })], {}, { tags: 403 });
    const r = await coletarCards(m.deps, carga);
    expect(r.estado).toBe('falha');
    expect(m.servidor.pedidos.map((p) => p.caminho)).toEqual(['/tags']);
    expect(m.banco.estado.stg).toEqual([]);
    expect(m.banco.estado.falhas).toEqual([{ entidade: 'tags', idOrigem: null, erro: 'autenticacao' }]);
    expect(m.banco.estado.marca).toBeUndefined();
  });

  it('catálogo paginado: lê as páginas seguintes (page, só GET)', async () => {
    const paginas: Record<number, unknown[]> = { 1: [TAGS[0]], 2: [TAGS[3]] };
    const get = (_c: string, o?: { consulta?: Record<string, unknown> }): Promise<unknown> => {
      const p = Number(o?.consulta?.page ?? 1);
      return Promise.resolve({ data: { data: paginas[p], pagination: { all_pages: 2, current_page: p } } });
    };
    expect([...(await lerMapaDeTagsDeClasse({ get } as never)).entries()]).toEqual([['1', 'Urgente'], ['4', 'Padrão']]);
  });
});
