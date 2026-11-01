import { METRICA_IDS, motivoDaOrigemMock, origemDaMetrica, type MetricaId } from '@metricas-dspd/contratos';
import { gerarBaseMock } from '@metricas-dspd/mock';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import type { LinhaCard, LinhaColunaReal, LinhaTransicao } from '../src/modulos/metricas/repositorio.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { bancoDoMock } from './base-duble.js';
import { criarDublePg, type Chamada, type Respondedor } from './duble-pg.js';

// QA da F6 (E2.75): obrigações do brief sobre o harness de duas bases. F6 do plano 052 (E2.69): o servidor escolhe a base por métrica (origem do contrato), nunca as duas na mesma; tipo da coluna resolvido
// na leitura (A4); O1 contra o limite da coluna (H-12); O3 com nota de SLE não definido (H-24); filtro de equipe pela tabela de times.
const AGORA = new Date('2026-10-10T15:00:00Z');
const seed = gerarBaseMock({ escala: 0.25 });
const REAL = montarEsquemas('r_');
const SEED = montarEsquemas();
const t = (iso: string): number => Date.parse(iso);

const card = (id: string, tipo: string | null, extra: Partial<LinhaCard> = {}): LinhaCard => ({
  card_id: id, tipo, classe_servico: null, sistema: null, area_solicitante: null, fornecedor: null, objetivo_estrategico: null, card_pai: null,
  criado_em: new Date('2026-09-01T12:00:00Z'), comprometido_em: new Date('2026-09-02T12:00:00Z'), iniciado_em: new Date('2026-09-03T12:00:00Z'),
  concluido_em: null, arquivado_em: null, motivo_descarte: null, tamanho_declarado: null, titulo: 'Card de teste', granularidade: 'story',
  equipe: 'Time A', quadro_id: '35', coluna_atual_id: '3', excluido_em: null, eh_subtarefa: false, data_acordada: null,
  responsabilidade_atraso: null, origem_demanda: null, fase_deteccao: null, severidade: null, origem_bug: null, adicionado_apos_inicio_pai: false,
  ...extra,
});
const col = (id: string, nome: string, tipo: string, papel: string, ordem: number, limite: number, equipe: string | null = 'Time A'): LinhaColunaReal =>
  ({ quadro_id: '35', coluna_id: id, nome, tipo_coluna: tipo, papel, ordem, limite_wip: limite, equipe });
const COLUNAS = [
  col('1', 'Backlog', 'fila', 'backlog', 1, 0), col('2', 'Pronto', 'fila', 'compromisso', 2, 0),
  col('3', 'Em desenvolvimento', 'execucao', 'trabalho', 3, 3), col('4', 'Entregue', 'execucao', 'entrega', 4, 0),
];
const VERSOES = COLUNAS.map((c) => ({ quadro_id: '35', coluna_id: c.coluna_id, tipo_coluna: c.tipo_coluna, vigente_de: '2020-01-01', vigente_ate: null, motivo: 'carga_inicial' }));
/** Transições como o fato as gravou: o `tipo_coluna` do fato fica nulo (auditoria) e o tipo vem da versão da coluna. */
const tr = (id: string, de: string | null, para: string, iso: string): LinhaTransicao =>
  ({ card_id: id, quadro_id: '35', coluna_origem_id: de, coluna_destino_id: para, tipo_coluna: null, direcao: 'avanco', ocorrido_em: t(iso) });

type OpcoesReal = { sle?: boolean; cards?: LinhaCard[] };
/** Banco falso de duas bases: o que é do schema `r_` é a base real mínima; o resto é o seed do mock (schemas sem prefixo). */
function banco(o: OpcoesReal = {}): Respondedor {
  const doSeed = bancoDoMock(seed);
  const cards = o.cards ?? [card('A', 'Bug interno'), card('B', 'Trabalho de produto', { granularidade: 'story' })];
  return (c: Chamada) => {
    const x = c.texto;
    if (!x.includes('r_dspd')) return doSeed(c);
    if (x.includes('FROM r_dspd_bm.dim_card')) return cards;
    if (x.includes('vw_transicao_canonica')) return cards.flatMap((k) => [tr(k.card_id, null, '1', '2026-09-01T12:00:00Z'), tr(k.card_id, '1', '2', '2026-09-02T12:00:00Z'), tr(k.card_id, '2', '3', '2026-09-03T12:00:00Z')]);
    if (x.includes('FROM r_dspd_bm.ref_coluna c')) return COLUNAS;
    if (x.includes('FROM r_dspd_bm.ref_coluna')) return VERSOES;
    if (x.includes('FROM r_dspd_bm.ref_time')) return [{ nome: 'Time A' }];
    if (x.includes('.ctl_coleta')) return [{ coleta_id: '9', finalizado_em: new Date('2026-10-09T12:00:00Z') }];
    if (x.includes('FROM r_dspd_core.ref_versao_criterio v')) return [];
    if (x.includes('FROM r_dspd_core.ref_versao_criterio')) return [{ versao_id: '1' }];
    if (x.includes('ref_sle')) return o.sle === true ? [{ classe: 'Padrão', valor: '5', desde: '2026-01-01' }] : [];
    return [];
  };
}

async function montar(o: OpcoesReal = {}, extra: { linhas?: string[] } = {}) {
  const d = criarDublePg(banco(o));
  const app = await buildApp({
    db: d.pool, S: REAL, SMock: SEED, agora: () => AGORA, nivelLog: extra.linhas ? 'warn' : 'silent',
    ...(extra.linhas ? { destinoLog: { write: (m: string) => { extra.linhas!.push(m); } } } : {}),
  });
  return { app, d };
}


const TIMES_ALVO = ['Time A', 'Time B'];
const colB = (id: string, nome: string, tipo: string, papel: string, ordem: number, limite: number) => col(id, nome, tipo, papel, ordem, limite, 'Time B');
const REAIS = ['O1', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7', 'O9', 'O10', 'O11', 'O13', 'EI_FL1'] as MetricaId[];

/** Banco com dois times reais: serve para provar que nenhum resultado do painel traz o nome de um time (sem comparação, §7.1). */
function bancoDoisTimes(): Respondedor {
  const base = banco({ cards: [card('A', 'Bug interno'), card('B', 'Melhoria', { equipe: 'Time B', quadro_id: '35' })] });
  return (c: Chamada) => {
    if (/FROM r_dspd_bm\.ref_coluna c/.test(c.texto)) return [...COLUNAS, colB('13', 'Dev B', 'execucao', 'trabalho', 13, 2)];
    if (/FROM r_dspd_bm\.ref_time/.test(c.texto)) return TIMES_ALVO.map((nome) => ({ nome }));
    return base(c);
  };
}

type Nodo = Record<string, unknown>;
function varrer(o: unknown, aoNodo: (n: Nodo, caminho: string) => void, caminho = ''): void {
  if (Array.isArray(o)) o.forEach((v, i) => varrer(v, aoNodo, `${caminho}[${i}]`));
  else if (o !== null && typeof o === 'object') {
    aoNodo(o as Nodo, caminho);
    for (const [k, v] of Object.entries(o)) varrer(v, aoNodo, `${caminho}.${k}`);
  }
}

describe('QA F6 (CA do selo): origem exata por métrica e motivo', () => {
  it('fictícias do painel operacional são exatamente O8, O12, O14 a O18 (com o motivo da H-13) e O19 a O26; as reais são as 12 da H-13', () => {
    const ficticiasFL1 = ['O8', 'O12', 'O14', 'O15', 'O16', 'O17', 'O18'] as MetricaId[];
    const comp = ['O19', 'O20', 'O21', 'O22', 'O23', 'O24', 'O25', 'O26'] as MetricaId[];
    for (const id of ficticiasFL1) { expect(origemDaMetrica(id), id).toBe('mock'); expect(motivoDaOrigemMock(id), id).toBe('aguardando campo no quadro'); }
    for (const id of comp) expect(origemDaMetrica(id), id).toBe('mock');
    expect(METRICA_IDS.filter((m) => origemDaMetrica(m) === 'real').sort()).toEqual([...REAIS].sort());
    // FL2, FL3 e Sustentação (T, E, S, VISAO_GERAL) nunca reais: Acelerato e tático/estratégico ficam fora do recorte
    for (const id of METRICA_IDS.filter((m) => /^(T|E|S)\d/.test(m) || m === 'VISAO_GERAL')) expect(origemDaMetrica(id), id).toBe('mock');
  });
});

describe('QA F6 (abaixo de 20 não publica, P-3): todo cartão real com estatística segue a regra', () => {
  it('com 2 cards na base real nenhum percentil, taxa ou faixa de itens sai com número; a mensagem é a mesma (minimo 20)', async () => {
    const { app } = await montar();
    let insuficientes = 0;
    for (const id of REAIS) {
      const r = await app.inject(`/api/v1/metricas/${id}`);
      expect(r.statusCode, id).toBe(200);
      varrer(r.json(), (n, p) => {
        // estatística publicada exige n >= 20 (O1.diasDentroDoLimite conta dias da janela, não itens: n = dias)
        for (const k of ['p50', 'p85', 'p95', 'pct']) {
          if (typeof n[k] === 'number' && !(typeof n.n === 'number' && n.n >= 20)) throw new Error(`${id}${p}.${k} publicado com n<20`);
        }
        if (n.status === 'insuficiente' || n.status === 'insuficiente-amostra') {
          insuficientes += 1;
          expect(n.minimo, `${id}${p}`).toBe(20);
          expect(Number(n.n), `${id}${p}`).toBeLessThan(20);
          expect(Object.keys(n).some((k) => /^p\d\d$/.test(k)), `${id}${p}`).toBe(false);
        }
      });
    }
    expect(insuficientes).toBeGreaterThanOrEqual(15); // guarda contra suíte vazia: hoje são 21
  }, 60_000);
});

describe('QA F6 (nenhum cartão compara times, §7.1)', () => {
  it('com dois times reais, nenhuma métrica do painel sem filtro traz o nome de um time, nem chave por time', async () => {
    const d = criarDublePg(bancoDoisTimes());
    const app = await buildApp({ db: d.pool, S: REAL, SMock: SEED, agora: () => AGORA, nivelLog: 'silent' });
    for (const id of REAIS) {
      const texto = JSON.stringify((await app.inject(`/api/v1/metricas/${id}`)).json());
      for (const t of TIMES_ALVO) expect(texto, `${id} cita ${t}`).not.toContain(t);
      varrer(JSON.parse(texto) as unknown, (n, p) => { for (const k of ['equipes', 'times', 'porEquipe', 'porTime']) if (n[k] !== null && n[k] !== undefined && typeof n[k] === 'object') throw new Error(`${id}${p}.${k}`); });
    }
  }, 60_000);

  it('o filtro de equipe só recorta: o total do O1 de um time não vira ranking nem aparece no resultado do outro', async () => {
    const d = criarDublePg(bancoDoisTimes());
    const app = await buildApp({ db: d.pool, S: REAL, SMock: SEED, agora: () => AGORA, nivelLog: 'silent' });
    const a = JSON.stringify((await app.inject('/api/v1/metricas/O1?equipe=time-a')).json());
    expect(a).not.toContain('Time B');
    expect(a).not.toContain('Dev B');
  }, 60_000);
});

describe('QA F6 (nenhum acesso ao BusinessMap real, abuso: API como ponte de saída)', () => {
  it('servir todo o painel e os filtros não chama fetch nem abre conexão de rede (a API só lê o banco)', async () => {
    const fetchEspiao = vi.fn(() => { throw new Error('rede proibida na API do painel'); });
    vi.stubGlobal('fetch', fetchEspiao);
    try {
      const { app } = await montar({ sle: true });
      for (const id of METRICA_IDS) expect((await app.inject(`/api/v1/metricas/${id}`)).statusCode, id).toBe(200);
      expect((await app.inject('/api/v1/filtros/businessmap')).statusCode).toBe(200);
      expect(fetchEspiao).not.toHaveBeenCalled();
    } finally { vi.unstubAllGlobals(); }
  }, 120_000);

  it('os módulos de leitura do painel não importam o cliente do BusinessMap nem a chave', () => {
    for (const dir of ['modulos/metricas', 'modulos/referencia']) {
      const base = new URL(`../src/${dir}`, import.meta.url).pathname;
      const fontes = readdirSync(base).filter((n) => n.endsWith('.ts'));
      expect(fontes.length).toBeGreaterThanOrEqual(3);
      for (const f of fontes) {
        const t = readFileSync(join(base, f), 'utf8');
        expect(t, `${dir}/${f}`).not.toMatch(/businessmap\/cliente|BUSINESSMAP_APIKEY|BUSINESSMAP_URL|\bfetch\(|node:https?|node:net/);
      }
    }
  });
});
