import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FORA_DE_TODO_CALCULO, TIMES_PROPRIOS } from '../migrations/0019_bm_carga_inicial_times.js';
import {
  agrupar, diaDe, instanteDoBm, projetarCard, FUSO_PADRAO_BM, type EntradaCard, type LinhaColuna, type Referencia, type TransicaoStg,
} from '../src/modulos/businessmap/normalizador.js';

// Nomes de time e workflow fora vêm das constantes da migração 0019 (não de times inventados).
const [TIME_A, TIME_B, TIME_C] = TIMES_PROPRIOS.map((t) => t[2]) as [string, string, string];
const WF_FORA = FORA_DE_TODO_CALCULO[0]![0];
// F4 do plano 052: normalizador puro. Cada decisão H tem caso próprio. Ids e nomes inventados; nenhum dado real.
const V = { vigente_de: '2020-01-01', vigente_ate: null };
const col = (id: string, wf: string, extra: Partial<LinhaColuna>): LinhaColuna => ({
  ...V, quadro_id: 'Q', coluna_id: id, workflow_id: wf, section: null, eh_descarte: false, papel: null, tipo_coluna: null, ordem: 0, ...extra,
});
const COLUNAS: LinhaColuna[] = [
  col('1', 'S', { section: 1, papel: 'backlog', tipo_coluna: 'fila', ordem: 1 }),
  col('2', 'S', { section: 2, papel: 'compromisso', tipo_coluna: 'fila', ordem: 2 }),
  col('3', 'S', { section: 3, papel: 'trabalho', tipo_coluna: 'execucao', ordem: 3 }),
  col('4', 'S', { section: 3, papel: 'trabalho', tipo_coluna: 'fila', ordem: 4 }),
  col('5', 'S', { section: 4, papel: 'entrega', tipo_coluna: 'execucao', ordem: 5 }),
  col('6', 'S', { section: 4, eh_descarte: true, ordem: 6 }),
  col('7', 'S', { section: 5, papel: 'entrega', tipo_coluna: 'fila', ordem: 7 }),
  col('11', 'F', { section: 3, papel: 'trabalho', tipo_coluna: 'execucao', ordem: 1 }),
  col('21', WF_FORA, { section: 3, papel: 'trabalho', tipo_coluna: 'execucao', ordem: 1 }),
  col('31', 'T2', { section: 3, papel: 'trabalho', tipo_coluna: 'execucao', ordem: 1 }),
  col('41', 'N', { section: 3, papel: 'trabalho', tipo_coluna: 'execucao', ordem: 1 }),
  col('51', 'Z', { section: 3, papel: 'trabalho', tipo_coluna: 'execucao', ordem: 1 }),
  col('61', 'S', { section: null, papel: null, tipo_coluna: null, ordem: 9 }),
];
const wf = (workflow_id: string, nivel: string, extra: Record<string, unknown> = {}) => ({ ...V, quadro_id: 'Q', workflow_id, nivel, ...extra });
const REF: Referencia = {
  colunas: agrupar(COLUNAS, (c) => `${c.quadro_id}|${c.coluna_id}`),
  workflows: agrupar([wf('S', 'story'), wf('F', 'feature'), wf(WF_FORA, 'story'), wf('T2', 'story'), wf('N', 'nenhum'), wf('P', 'projeto')], (w) => `${w.quadro_id}|${w.workflow_id}`),
  timesDoWorkflow: agrupar([
    { ...V, workflow_id: 'S', time_id: 1, situacao: 'time' }, { ...V, workflow_id: 'F', time_id: 1, situacao: 'time' },
    { ...V, workflow_id: WF_FORA, time_id: null, situacao: 'fora' }, { ...V, workflow_id: 'N', time_id: 1, situacao: 'time' },
    // dois times na história do workflow T2: até 2026-06-01 o 2 e depois o 3 (mudança de processo: vale a partir da data)
    { vigente_de: '2020-01-01', vigente_ate: '2026-06-01', workflow_id: 'T2', time_id: 2, situacao: 'time' },
    { vigente_de: '2026-06-01', vigente_ate: null, workflow_id: 'T2', time_id: 3, situacao: 'time' },
    { ...V, workflow_id: 'Z', time_id: 99, situacao: 'time' },
  ], (t) => t.workflow_id),
  times: agrupar([
    { ...V, time_id: 1, nome: TIME_A }, { ...V, time_id: 2, nome: TIME_B }, { ...V, time_id: 3, nome: TIME_C },
  ], (t) => String(t.time_id)),
  tipos: agrupar([
    { ...V, tipo_id: '10', eh_item: true, categoria: 'bug_interno' }, { ...V, tipo_id: '11', eh_item: true, categoria: 'produto' },
    { ...V, tipo_id: '12', eh_item: false, categoria: null },
  ], (t) => t.tipo_id),
  camposLista: new Map(),
};

const tr = (coluna: string, inicio: string, extra: Partial<TransicaoStg> = {}): TransicaoStg => ({
  coluna, quadro: 'Q', workflow: null, inicio: instanteDoBm(inicio)!, ...extra,
});
const card = (extra: Record<string, unknown> = {}): Record<string, unknown> => ({
  card_id: 7, title: 'Card de teste', type_id: 10, created_at: '2026-03-01T12:00:00Z', board_id: 'Q', workflow_id: 'S', column_id: 3, ...extra,
});
const entrada = (c: Record<string, unknown>, transicoes: TransicaoStg[] = [], extra: Partial<EntradaCard> = {}): EntradaCard => ({
  id: '7', card: c, coletadoEm: new Date('2026-10-30T10:00:00Z'), excluidoDetectado: false, transicoes, tipoDoPai: () => undefined, ...extra,
});
const proj = (c: Record<string, unknown>, t: TransicaoStg[] = [], extra: Partial<EntradaCard> = {}, ref: Referencia = REF) => projetarCard(entrada(c, t, extra), ref)!;
const em = (d: Date | null): string | null => (d === null ? null : d.toISOString());

describe('instanteDoBm e diaDe', () => {
  it('aceita ISO com Z, com fuso, com fração e a forma com espaço (sem fuso vale o padrão); recusa o resto', () => {
    expect(FUSO_PADRAO_BM).toBe('+00:00');
    const z = instanteDoBm('2026-10-01T10:00:00Z')!;
    expect(new Date(z).toISOString()).toBe('2026-10-01T10:00:00.000Z');
    expect(instanteDoBm('2026-10-01 10:00:00')).toBe(z);
    expect(instanteDoBm('2026-10-01T10:00:00.123Z')).toBe(z);
    expect(instanteDoBm('2026-10-01T07:00:00-03:00')).toBe(z);
    expect(instanteDoBm('2026-10-01 10:00')).toBe(z);
    for (const ruim of [null, 7, '', 'ontem', '2026-10-01', '2026-13-01T10:00:00Z', '2026-10-32T10:00:00Z', '2026-10-01T24:00:00Z', '2026-10-01T10:60:00Z', '2026-00-10T10:00:00Z']) expect(instanteDoBm(ruim)).toBeNull();
  });
  it('A5 do review: `Z` explícito vale sempre +00:00; a constante só vale para data sem fuso', () => {
    // a constante é fixa em tempo de execução: o teste prova que o `Z` não passa por ela (a troca dela não desloca o `Z`)
    const fonte = readFileSync(new URL('../src/modulos/businessmap/normalizador.ts', import.meta.url), 'utf8');
    expect(fonte).toMatch(/=== 'Z' \? '\+00:00'/);
    expect(fonte).not.toMatch(/=== 'Z' \? FUSO_PADRAO_BM/);
    expect(new Date(instanteDoBm('2026-10-01T10:00:00Z')!).toISOString()).toBe('2026-10-01T10:00:00.000Z');
    expect(new Date(instanteDoBm('2026-10-01 10:00:00')!).toISOString()).toBe(`2026-10-01T10:00:00.000Z`);
    expect(instanteDoBm('2026-10-01T10:00:00z')).toBeNull();
  });
  it('o dia vigente é o civil do fuso -03:00', () => {
    expect(diaDe(instanteDoBm('2026-10-01T01:00:00Z')!)).toBe('2026-09-30');
    expect(diaDe(instanteDoBm('2026-10-01T12:00:00Z')!)).toBe('2026-10-01');
  });
});

describe('projetarCard: marcos, transições e eventos (H-9, H-10, H-11, H-23, biblioteca)', () => {
  it('card sem criação utilizável não é projetado (nada é inventado)', () => {
    expect(projetarCard(entrada(card({ created_at: 'ontem' })), REF)).toBeNull();
  });

  it('H-9, H-10 e 4.1: compromisso, início e entrega pela primeira entrada; transições encadeadas com tipo de coluna e direção', () => {
    const p = proj(card(), [
      tr('5', '2026-03-10T10:00:00Z'), tr('1', '2026-03-02T10:00:00Z'), tr('2', '2026-03-03T10:00:00Z'), tr('3', '2026-03-04T10:00:00Z'),
      tr('4', '2026-03-05T10:00:00Z'), tr('3', '2026-03-06T10:00:00Z'), tr('2', '2026-03-07T10:00:00Z'),
    ]);
    expect(p.dim).toMatchObject({
      card_id: '7', tipo: 'Bug interno', granularidade: 'story', equipe: TIME_A, quadro_id: 'Q', coluna_atual_id: '3', titulo: 'Card de teste', card_pai: null,
      motivo_descarte: null, arquivado_em: null, excluido_em: null,
    });
    expect([p.dim.criado_em, p.dim.comprometido_em, p.dim.iniciado_em, p.dim.concluido_em].map(em)).toEqual([
      '2026-03-01T12:00:00.000Z', '2026-03-03T10:00:00.000Z', '2026-03-04T10:00:00.000Z', '2026-03-10T10:00:00.000Z']);
    expect(p.transicoes.map((t) => [t.coluna_origem_id, t.coluna_destino_id, t.tipo_coluna, t.direcao])).toEqual([
      [null, '1', 'fila', 'avanco'], ['1', '2', 'fila', 'avanco'], ['2', '3', 'execucao', 'avanco'], ['3', '4', 'fila', 'avanco'],
      ['4', '3', 'execucao', 'retorno'], ['3', '2', 'fila', 'retorno'], ['2', '5', 'execucao', 'avanco'],
    ]);
    expect(p.transicoes[0]).toMatchObject({ card_id: '7', quadro_id: 'Q', id_origem: `7:1:${instanteDoBm('2026-03-02T10:00:00Z')}` });
    expect(p.eventos.map((e) => e.tipo)).toEqual(['criado']);
  });

  it('H-23: quem pulou a seção 2 compromete na primeira entrada da seção 3; quem pulou a 4 entrega na 5', () => {
    const p = proj(card(), [tr('1', '2026-03-02T10:00:00Z'), tr('3', '2026-03-04T10:00:00Z'), tr('7', '2026-03-08T10:00:00Z')]);
    expect([p.dim.comprometido_em, p.dim.concluido_em].map(em)).toEqual(['2026-03-04T10:00:00.000Z', '2026-03-08T10:00:00.000Z']);
  });

  it('H-11: entrar em Descartado descarta (mesmo na seção 4), não entrega e vale como arquivamento para a biblioteca; o nativo vale pelo instante', () => {
    const porColuna = proj(card({ archived_at: '2026-03-20T00:00:00Z' }), [tr('3', '2026-03-04T10:00:00Z'), tr('6', '2026-03-09T10:00:00Z')]);
    expect(porColuna.dim).toMatchObject({ motivo_descarte: 'coluna_descartado', concluido_em: null });
    expect(em(porColuna.dim.arquivado_em)).toBe('2026-03-09T10:00:00.000Z');
    expect(porColuna.eventos.map((e) => e.tipo)).toEqual(['criado', 'arquivado']);
    const nativo = proj(card({ discarded_at: '2026-03-08T00:00:00Z' }), [tr('3', '2026-03-04T10:00:00Z'), tr('6', '2026-03-09T10:00:00Z')]);
    expect(nativo.dim.motivo_descarte).toBe('descarte_nativo');
    expect(em(nativo.dim.arquivado_em)).toBe('2026-03-08T00:00:00.000Z');
    const colunaPrimeiro = proj(card({ discarded_at: '2026-03-12T00:00:00Z' }), [tr('6', '2026-03-09T10:00:00Z')]);
    expect(colunaPrimeiro.dim.motivo_descarte).toBe('coluna_descartado');
    const soArquivado = proj(card({ archived_at: '2026-03-20T00:00:00Z' }), [tr('5', '2026-03-09T10:00:00Z')]);
    expect(soArquivado.dim).toMatchObject({ motivo_descarte: null });
    expect(em(soArquivado.dim.arquivado_em)).toBe('2026-03-20T00:00:00.000Z');
  });

  it('card excluído detectado (F5) entra como evento e como excluido_em, no instante da coleta', () => {
    const p = proj(card(), [], { excluidoDetectado: true });
    expect(p.eventos.map((e) => e.tipo)).toEqual(['criado', 'excluido_detectado']);
    expect(em(p.dim.excluido_em)).toBe('2026-10-30T10:00:00.000Z');
  });

  it('card sem transição usa o workflow do próprio card; coluna sem referência existe no histórico, sem tipo nem marco', () => {
    const p = proj(card({ column_id: null, title: '' }), []);
    expect(p.dim).toMatchObject({ granularidade: 'story', equipe: TIME_A, coluna_atual_id: null, titulo: null, comprometido_em: null });
    const sem = proj(card(), [tr('999', '2026-03-04T10:00:00Z')]);
    expect(sem.transicoes[0]).toMatchObject({ coluna_destino_id: '999', tipo_coluna: null, direcao: 'avanco' });
    const semQuadro = proj(card({ board_id: undefined }), [{ coluna: '3', quadro: null, workflow: null, inicio: 1 }]);
    expect(semQuadro.transicoes[0]).toMatchObject({ quadro_id: null, tipo_coluna: null });
  });
});

describe('projetarCard: granularidade, equipe, tipo e pai (H-1, H-2, H-7, H-17, U-2)', () => {
  it('H-1: o nível sai do workflow do evento (feature = frente; projeto) e H-17: a categoria sai do tipo', () => {
    expect(proj(card({ type_id: 11, workflow_id: 'F' }), [tr('11', '2026-03-04T10:00:00Z', { workflow: 'F' })]).dim).toMatchObject({ granularidade: 'frente', tipo: 'Trabalho de produto', equipe: TIME_A });
    const projeto = proj(card({ workflow_id: 'P' }), [], {}, { ...REF, timesDoWorkflow: agrupar([{ ...V, workflow_id: 'P', time_id: 1, situacao: 'time' }], (t) => t.workflow_id) });
    expect(projeto.dim.granularidade).toBe('projeto');
  });

  it('A1 do review (H-1): frente e projeto recebem a granularidade sem time (a 0019 não dá time a iniciativa nem ao quadro 35); story sem time fica fora', () => {
    const sem = { ...REF, timesDoWorkflow: new Map() };
    const frente = proj(card({ type_id: 11, workflow_id: 'F' }), [tr('11', '2026-03-04T10:00:00Z', { workflow: 'F' })], {}, sem);
    expect(frente.dim).toMatchObject({ granularidade: 'frente', equipe: null, tipo: 'Trabalho de produto' });
    expect(proj(card({ workflow_id: 'P' }), [], {}, sem).dim).toMatchObject({ granularidade: 'projeto', equipe: null });
    expect(proj(card(), [tr('3', '2026-03-04T10:00:00Z', { workflow: 'S' })], {}, sem).dim).toMatchObject({ granularidade: null, equipe: null });
    // workflow fora (H-7) de nível feature continua fora
    const foraFrente = { ...REF, workflows: agrupar([wf(WF_FORA, 'feature')], (w) => `${w.quadro_id}|${w.workflow_id}`) };
    expect(proj(card(), [tr('21', '2026-03-04T10:00:00Z', { workflow: WF_FORA })], {}, foraFrente).dim).toMatchObject({ granularidade: null, equipe: null });
  });

  it('A6 do review (U-2): a categoria do tipo vem da referência do dia do evento medido, não do dia da criação', () => {
    const tipos = agrupar([
      { vigente_de: '2020-01-01', vigente_ate: '2026-06-01', tipo_id: '10', eh_item: true, categoria: 'bug_interno' },
      { vigente_de: '2026-06-01', vigente_ate: null, tipo_id: '10', eh_item: true, categoria: 'melhoria' },
    ], (t) => t.tipo_id);
    const p = proj(card({ created_at: '2026-03-01T12:00:00Z' }), [tr('5', '2026-07-10T10:00:00Z')], {}, { ...REF, tipos });
    expect(p.dim.tipo).toBe('Melhoria'); // ADR 0024: o rótulo do contrato, não o código
  });

  it('U-2: o time e o nível são os do instante da entrega (card entregue depois de mudar de workflow conta no de antes); sem entrega, no de agora', () => {
    const entregueEmS = proj(card(), [tr('5', '2026-03-10T10:00:00Z', { workflow: 'S' }), tr('11', '2026-04-10T10:00:00Z', { workflow: 'F' })]);
    expect(entregueEmS.dim).toMatchObject({ granularidade: 'story', equipe: TIME_A });
    const abertoEmF = proj(card(), [tr('3', '2026-03-10T10:00:00Z', { workflow: 'S' }), tr('11', '2026-04-10T10:00:00Z', { workflow: 'F' })]);
    expect(abertoEmF.dim).toMatchObject({ granularidade: 'frente', equipe: TIME_A });
  });

  it('U-2 e U-1: o time da tabela vigente no dia do evento (antes e depois da mudança de time do workflow)', () => {
    const antes = proj(card(), [tr('31', '2026-05-20T10:00:00Z', { workflow: 'T2' })]);
    const depois = proj(card(), [tr('31', '2026-06-20T10:00:00Z', { workflow: 'T2' })]);
    expect([antes.dim.equipe, depois.dim.equipe]).toEqual([TIME_B, TIME_C]);
  });

  it('referência mais antiga que a primeira vigência vale a primeira (contada); sem nenhuma, o card fica fora', () => {
    const p = proj(card(), [tr('3', '2019-05-20T10:00:00Z', { workflow: 'S' })]);
    expect(p.dim).toMatchObject({ granularidade: 'story', equipe: TIME_A });
    expect(p.notas).toContain('referencia_anterior');
    const vazia = proj(card(), [tr('3', '2026-03-04T10:00:00Z', { workflow: 'S' })], {}, { ...REF, workflows: new Map(), timesDoWorkflow: new Map(), tipos: new Map() });
    expect(vazia.dim).toMatchObject({ granularidade: null, equipe: null, tipo: null });
    expect(vazia.notas).toEqual(expect.arrayContaining(['tipo_sem_referencia', 'workflow_sem_time', 'workflow_sem_nivel']));
  });

  it('H-7: workflow fora de todo cálculo fica na base, sem granularidade nem equipe; nível nenhum e time sem nome também', () => {
    const fora = proj(card(), [tr('21', '2026-03-04T10:00:00Z', { workflow: WF_FORA })]);
    expect(fora.dim).toMatchObject({ granularidade: null, equipe: null, tipo: 'Bug interno' });
    expect(fora.notas).toContain('workflow_fora');
    expect(proj(card(), [tr('41', '2026-03-04T10:00:00Z', { workflow: 'N' })]).dim.granularidade).toBeNull();
    const semNome = proj(card(), [tr('51', '2026-03-04T10:00:00Z', { workflow: 'Z' })], {}, { ...REF, workflows: agrupar([wf('Z', 'story')], (w) => `${w.quadro_id}|${w.workflow_id}`) });
    expect(semNome.dim).toMatchObject({ granularidade: null, equipe: null });
  });

  it('H-2: Sprint não é item (sem tipo nem granularidade); tipo fora da referência também fica fora', () => {
    const sprint = proj(card({ type_id: 12 }), [tr('3', '2026-03-04T10:00:00Z', { workflow: 'S' })]);
    expect(sprint.dim).toMatchObject({ tipo: null, granularidade: null, equipe: null });
    expect(sprint.notas).toContain('nao_item');
    expect(proj(card({ type_id: 'x' }), []).dim.tipo).toBeNull();
    expect(proj(card({ type_id: undefined }), []).dim.tipo).toBeNull();
    expect(proj(card({ workflow_id: undefined }), []).dim).toMatchObject({ granularidade: null, equipe: null });
  });

  it('pai pelo vínculo nativo parent; vários pais: o de menor id; pai Sprint não vale (H-2); pai fora do staging vale como está', () => {
    const vinculos = [{ card_id: 30, link_type: 'parent' }, { card_id: 9, link_type: 'parent' }, { card_id: 50, link_type: 'child' }, { card_id: 9, link_type: 'parent' }, null, { card_id: 8, link_type: 'relative' }];
    const doProduto = proj(card({ linked_cards: vinculos }), [], { tipoDoPai: (id) => (id === '9' ? '11' : undefined) });
    expect(doProduto.dim.card_pai).toBe('9');
    expect(doProduto.notas).toContain('varios_pais');
    const doSprint = proj(card({ linked_cards: [{ card_id: 9, link_type: 'parent' }] }), [], { tipoDoPai: () => '12' });
    expect(doSprint.dim.card_pai).toBeNull();
    expect(doSprint.notas).toContain('pai_sprint');
    expect(proj(card({ linked_cards: [{ card_id: 9, link_type: 'parent' }] }), []).dim.card_pai).toBe('9');
    expect(proj(card({ linked_cards: [{ card_id: 9, link_type: 'parent' }] }), [], { tipoDoPai: () => 'desconhecido' }).dim.card_pai).toBe('9');
    expect(proj(card({ linked_cards: [{ card_id: [1], link_type: 'parent' }] }), []).dim.card_pai).toBeNull();
    expect(proj(card({ linked_cards: 'x' }), []).dim.card_pai).toBeNull();
  });

  it('agrupar junta por chave e preserva a ordem', () => {
    expect([...agrupar([1, 2, 3, 4], (n) => (n % 2 === 0 ? 'par' : 'impar'))]).toEqual([['impar', [1, 3]], ['par', [2, 4]]]);
  });
});

describe('C2a: data_acordada a partir do deadline nativo (parse estrito, 099-o12-deadline §2)', () => {
  it('forma válida AAAA-MM-DD vira o mesmo dia, sem nota', () => {
    const p = proj(card({ deadline: '2026-10-30' }));
    expect(p.dim.data_acordada).toBe('2026-10-30');
    expect(p.notas).not.toContain('deadline_fora_da_forma');
  });

  it('ausente ou nulo fica nulo, sem nota', () => {
    for (const c of [card(), card({ deadline: null })]) {
      const p = proj(c);
      expect(p.dim.data_acordada).toBeNull();
      expect(p.notas).not.toContain('deadline_fora_da_forma');
    }
  });

  it('data e hora, texto, número e data impossível viram nulo com a nota, sem converter e sem o valor', () => {
    const ruins = ['2026-10-30T00:00:00Z', '2026-10-30 10:00:00', 'amanhã', '30/10/2026', '2026-02-30', '2026-13-01', '0000-01-01', '0000-12-31', 20261030, true, ''];
    for (const deadline of ruins) {
      const p = proj(card({ deadline }));
      expect(p.dim.data_acordada).toBeNull();
      expect(p.notas.filter((n) => n === 'deadline_fora_da_forma')).toHaveLength(1);
      expect(JSON.stringify(p.notas)).not.toContain('2026-10-30');
    }
  });
});

describe('L2-b: colunas de lista a partir de custom_fields e do mapa field_id -> coluna', () => {
  const COM_MAPA: Referencia = { ...REF, camposLista: new Map([['501', 'classe_servico'], ['502', 'sistema'], ['503', 'severidade']]) };
  const LISTA = ['classe_servico', 'sistema', 'area_solicitante', 'fornecedor', 'objetivo_estrategico', 'tamanho_declarado',
    'responsabilidade_atraso', 'origem_demanda', 'fase_deteccao', 'severidade'] as const;
  const cf = (...c: { field_id: unknown; valor: unknown }[]) => card({ custom_fields: c });

  it('campo mapeado preenche a coluna; o que não está no mapa fica nulo e não gera nota', () => {
    const p = proj(cf({ field_id: '501', valor: 'expedita' }, { field_id: 502, valor: 'sis-a' }, { field_id: '999', valor: 'x' }), [], {}, COM_MAPA);
    expect(p.dim).toMatchObject({ classe_servico: 'expedita', sistema: 'sis-a', severidade: null, area_solicitante: null });
    expect(p.notas).not.toContain('campo_fora_do_dominio');
  });

  it('desconhecido (e valor que não é texto) vira nulo com a nota, sem o valor', () => {
    const p = proj(cf({ field_id: '501', valor: 'desconhecido' }, { field_id: '502', valor: 7 }, { field_id: '503', valor: '' }), [], {}, COM_MAPA);
    expect(p.dim.classe_servico).toBeNull();
    expect(p.dim.sistema).toBeNull();
    expect(p.dim.severidade).toBeNull();
    expect(p.notas.filter((n) => n === 'campo_fora_do_dominio')).toHaveLength(3);
    expect(JSON.stringify(p.notas)).not.toContain('desconhecido');
  });

  it('coluna fora do enum no mapa é recusada (nada é gravado nem entra no dim)', () => {
    const ruim: Referencia = { ...REF, camposLista: new Map([['501', 'titulo'], ['502', 'responsaveis'], ['503', '__proto__']]) };
    const p = proj(cf({ field_id: '501', valor: 'x' }, { field_id: '502', valor: 'y' }, { field_id: '503', valor: 'z' }), [], {}, ruim);
    expect(p.dim.titulo).toBe('Card de teste');
    expect(Object.keys(p.dim)).not.toContain('responsaveis');
    expect(Object.keys(p.dim)).not.toContain('__proto__');
    expect(p.notas).not.toContain('campo_fora_do_dominio');
  });

  it('entrada malformada em custom_fields é ignorada', () => {
    for (const cfs of ['x', null, [null, 3, 'a', { valor: 'v' }, { field_id: [1], valor: 'v' }]]) {
      expect(LISTA.every((c) => proj(card({ custom_fields: cfs }), [], {}, COM_MAPA).dim[c] === null)).toBe(true);
    }
  });

  it('paridade: com o mapa vazio, mesmo com custom_fields no staging, o dim é o de antes do lote (todas as colunas de lista nulas)', () => {
    const t = [tr('3', '2026-03-04T10:00:00Z', { workflow: 'S' })];
    const sem = proj(card(), t);
    const com = proj(cf({ field_id: '501', valor: 'expedita' }), t);
    expect(com.dim).toEqual(sem.dim);
    expect(com.notas).toEqual(sem.notas);
    for (const c of LISTA) expect(sem.dim[c]).toBeNull();
    const antes = Object.fromEntries(Object.entries(sem.dim).filter(([k]) => !(LISTA as readonly string[]).includes(k)));
    expect(Object.keys(antes)).toEqual(['card_id', 'tipo', 'card_pai', 'criado_em', 'comprometido_em', 'iniciado_em', 'concluido_em', 'arquivado_em',
      'motivo_descarte', 'titulo', 'granularidade', 'equipe', 'quadro_id', 'coluna_atual_id', 'excluido_em', 'data_acordada']);
  });
});

describe('C8a: severidade pelo priority nativo (1 Critical a 4 Low, escala decrescente)', () => {
  // Mapa escrito AQUI (fato da OpenAPI v2 do BusinessMap), não importado do código (B-1 da ADR 0020).
  const COM_PRIORIDADE: Referencia = { ...REF, prioridades: new Map([['1', 'Crítica'], ['2', 'Alta'], ['3', 'Média'], ['4', 'Baixa']]) };
  const sev = (priority: unknown, ref: Referencia = COM_PRIORIDADE) => projetarCard(entrada(card({ priority })), ref)!;
  it.each([[1, 'Crítica'], [2, 'Alta'], [3, 'Média'], [4, 'Baixa'], ['1', 'Crítica'], ['4', 'Baixa']])('priority %j vira %s', (priority, esperado) => {
    const p = sev(priority);
    expect(p.dim.severidade).toBe(esperado);
    expect(p.notas).not.toContain('priority_fora_do_mapa');
  });
  it('priority nulo ou ausente fica sem severidade (Q-099-33, recomendação A), sem nota e sem supor Média', () => {
    for (const p of [sev(null), sev(undefined)]) {
      expect(p.dim.severidade).toBeNull();
      expect(p.notas).not.toContain('priority_fora_do_mapa');
    }
  });
  it.each([[5], [0], [-1], [2.5], ['alta'], ['02'], [true], [{}], [NaN]])('priority %j fora do mapa fica sem severidade, com uma nota (nunca vira Baixa)', (priority) => {
    const p = sev(priority);
    expect(p.dim.severidade).toBeNull();
    expect(p.notas.filter((n) => n === 'priority_fora_do_mapa')).toHaveLength(1);
  });
  it('sem o mapa carregado (ref-sync não rodou) nada é projetado nem contado', () => {
    for (const ref of [REF, { ...REF, prioridades: new Map() }]) {
      const p = sev(1, ref);
      expect(p.dim.severidade).toBeNull();
      expect(p.notas).not.toContain('priority_fora_do_mapa');
    }
  });
  it('o priority substitui a coluna severidade vinda de campo customizado só quando há mapa; as outras colunas de lista seguem', () => {
    const ref: Referencia = { ...COM_PRIORIDADE, camposLista: new Map([['503', 'severidade'], ['502', 'sistema']]) };
    const c = card({ priority: 2, custom_fields: [{ field_id: '503', valor: 'x' }, { field_id: '502', valor: 'sis' }] });
    const p = projetarCard(entrada(c), ref)!;
    expect(p.dim.severidade).toBe('Alta');
    expect(p.dim.sistema).toBe('sis');
    expect(projetarCard(entrada(c), { ...ref, prioridades: undefined })!.dim.severidade).toBe('x');
  });
});

describe('C2a: ano 0000 no deadline (099-C2A-001; sondas S1 e S2 do parecer de segurança)', () => {
  // Entradas literais das sondas, gravadas no corpus: o JS aceita o ano 0 e o PostgreSQL recusa; por isso a guarda do normalizador exige ano >= 1.
  const SONDAS = [
    `docker exec metricasdspd-postgres-1 psql -U postgres -d postgres -Atc "select '0000-01-01'::date"`,
    `node -e "const v='0000-01-01';const d=new Date(v+'T00:00:00Z');console.log(!Number.isNaN(d.getTime()), d.toISOString().slice(0,10)===v)"`,
  ];
  it('as duas condições do JS aceitam 0000-01-01 (S2), então a guarda própria é necessária; o normalizador o recusa', () => {
    expect(SONDAS).toHaveLength(2);
    const d = new Date('0000-01-01T00:00:00Z');
    expect(!Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === '0000-01-01').toBe(true);
    const p = proj(card({ deadline: '0000-01-01' }));
    expect(p.dim.data_acordada).toBeNull();
    expect(p.notas.filter((n) => n === 'deadline_fora_da_forma')).toHaveLength(1);
  });
  it('ano 0001 é aceito', () => {
    expect(proj(card({ deadline: '0001-01-01' })).dim.data_acordada).toBe('0001-01-01');
  });
});
