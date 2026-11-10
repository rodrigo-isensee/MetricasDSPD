import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao';
import { VERSAO_CRITERIO_TENDENCIA_FLUXO_DADO_REAL } from '@metricas-dspd/metricas/core';
import { gerarBaseMock } from '@metricas-dspd/mock';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import type { LinhaCard, LinhaChamado, LinhaColunaReal, LinhaTransicao } from '../src/modulos/metricas/repositorio.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { bancoDoMock } from './base-duble.js';
import { criarDublePg, type Chamada } from './duble-pg.js';

// Pedido 077, L5 (K-211, A11): a rota da TENDENCIA_FLUXO sobre a base real mínima (sem mock do serviço nem da biblioteca): a janela incompleta e o mês publicado
// no mesmo resultado, o tipo com 19 entregues, o Acelerato fora do resultado e a marca da virada.
const AGORA = new Date('2026-12-02T15:00:00Z');
const seed = gerarBaseMock({ escala: 0.1 });
const REAL = montarEsquemas('r_');
const DIA = 86_400_000;
const URL = '/api/v1/metricas/TENDENCIA_FLUXO';

const COLUNAS: LinhaColunaReal[] = [
  ['1', 'Backlog', 'fila', 'backlog', 1, 0], ['2', 'Pronto', 'fila', 'compromisso', 2, 0],
  ['3', 'Em desenvolvimento', 'execucao', 'trabalho', 3, 0], ['4', 'Entregue', 'execucao', 'entrega', 4, 0],
].map(([coluna_id, nome, tipo_coluna, papel, ordem, limite_wip]) => ({ quadro_id: '35', coluna_id, nome, tipo_coluna, papel, ordem, limite_wip, equipe: 'Time A' }) as LinhaColunaReal);
const VERSOES = COLUNAS.map((c) => ({ quadro_id: '35', coluna_id: c.coluna_id, tipo_coluna: c.tipo_coluna, vigente_de: '2020-01-01', vigente_ate: null, motivo: 'carga_inicial' }));

/** Card entregue em `fim` (ISO), iniciado três dias antes; só o que a regra de leitura exige. */
const entregue = (id: string, tipo: string, fim: number): LinhaCard => ({
  card_id: id, tipo, classe_servico: null, sistema: null, area_solicitante: null, fornecedor: null, objetivo_estrategico: null, card_pai: null,
  criado_em: new Date(fim - 5 * DIA), comprometido_em: new Date(fim - 4 * DIA), iniciado_em: new Date(fim - 3 * DIA), concluido_em: new Date(fim),
  arquivado_em: null, motivo_descarte: null, tamanho_declarado: null, titulo: 'Card de teste', granularidade: 'story', equipe: 'Time A', quadro_id: '35',
  coluna_atual_id: '4', excluido_em: null, eh_subtarefa: false, data_acordada: null, responsabilidade_atraso: null, origem_demanda: null, fase_deteccao: null,
  severidade: null, origem_bug: null, adicionado_apos_inicio_pai: false,
});
const transicoes = (k: LinhaCard): LinhaTransicao[] => [
  [null, '1', k.criado_em], ['1', '2', k.comprometido_em], ['2', '3', k.iniciado_em], ['3', '4', k.concluido_em],
].map(([de, para, quando]) => ({ card_id: k.card_id, quadro_id: '35', coluna_origem_id: de as string | null, coluna_destino_id: para as string, tipo_coluna: null, direcao: 'avanco', ocorrido_em: (quando as Date).getTime() }));

/** Uma entrega a cada dois dias, de 2026-03-15 a 2026-11-29 (toda janela de 12 semanas dos seis meses tem mais de 20) e 19 de outro tipo em outubro. */
const CARDS: LinhaCard[] = [
  ...Array.from({ length: 130 }, (_, i) => entregue(`M${i}`, 'Melhoria', Date.parse('2026-03-15T15:00:00Z') + i * 2 * DIA)),
  ...Array.from({ length: 19 }, (_, i) => entregue(`I${i}`, 'Incidente', Date.parse('2026-10-10T15:00:00Z') + i * DIA)),
];
const CHAMADO = { chamado_id: 'X1', natureza: 'incidente', equipe: 'SSSC', organizacao: 'Org', tipo: 'Incidente', categoria_sistema: 'Protheus', excluido: false, status: 'Encerrado', prioridade: 'P3', aberto_em: new Date('2026-07-01T12:00:00Z') } as unknown as LinhaChamado;

// A parte do corpo que os testes leem; o schema do contrato valida a forma inteira no primeiro teste.
type Mes = { mes: string; janelaIncompleta?: unknown; contagemParcial?: unknown; p85PorTipo: { tipo: string; n: number; estatistica: { status: string } }[] };
type Corpo = { meses: Mes[]; estado?: string; criterios: { serie: unknown[]; janela: unknown[] } };

async function consultar(url: string, o: { desde?: string; chamados?: LinhaChamado[] } = {}) {
  const doSeed = bancoDoMock(seed);
  const d = criarDublePg((c: Chamada) => {
    const x = c.texto;
    if (!x.includes('r_dspd')) return doSeed(c);
    if (x.includes('FROM r_dspd_ac.dim_chamado')) return o.chamados ?? [];
    if (x.includes('FROM r_dspd_bm.dim_card')) return CARDS;
    if (x.includes('vw_transicao_canonica')) return CARDS.flatMap(transicoes);
    if (x.includes('FROM r_dspd_bm.ref_coluna c')) return COLUNAS;
    if (x.includes('FROM r_dspd_bm.ref_coluna')) return VERSOES;
    if (x.includes('FROM r_dspd_bm.ref_time')) return [{ nome: 'Time A' }];
    if (x.includes('SELECT parametros')) return o.desde === undefined ? [] : [{ parametros: { tipo: 'carga_inicial', inicio_carga: o.desde } }];
    if (x.includes('.ctl_coleta')) return [{ coleta_id: '9', finalizado_em: new Date('2026-12-01T12:00:00Z') }];
    if (x.includes('FROM r_dspd_core.ref_versao_criterio')) return x.includes('ref_versao_criterio v') ? [] : [{ versao_id: '1' }];
    return [];
  });
  const app = await buildApp({ db: d.pool, S: REAL, agora: () => AGORA, nivelLog: 'silent' });
  const r = await app.inject(url);
  return { r, corpo: r.json() as Corpo };
}
const mes = (corpo: Corpo, m: string) => corpo.meses.find((x) => x.mes === m)!;

describe('TENDENCIA_FLUXO no mapa real (pedido 077, L5)', () => {
  const U = `${URL}?dataReferencia=2026-12-01`;
  const D = '2026-07-01'; // A12 da revisão do desenho: junho a agosto incompletos, setembro a novembro publicados

  it('janela incompleta e mês publicado no mesmo resultado, pelo schema, sem tocar o seed', async () => {
    const { r, corpo } = await consultar(U, { desde: D });
    expect(r.statusCode).toBe(200);
    expect(r.headers['x-estado-dado']).toBeUndefined();
    expect(SCHEMAS_RESULTADO.TENDENCIA_FLUXO.safeParse(corpo).success).toBe(true);
    expect(corpo.meses.map((m: { mes: string }) => m.mes)).toEqual(['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11']);
    for (const m of ['2026-06', '2026-07', '2026-08']) {
      expect(mes(corpo, m).janelaIncompleta).toEqual({ historicoDesde: D });
      expect(mes(corpo, m).p85PorTipo).toEqual([]);
    }
    for (const m of ['2026-09', '2026-10', '2026-11']) expect(mes(corpo, m).janelaIncompleta).toBeUndefined();
    const melhoria = mes(corpo, '2026-11').p85PorTipo.find((t: { tipo: string }) => t.tipo === 'Melhoria');
    expect(melhoria?.estatistica.status).toBe('ok');
  });

  it('tipo com 19 entregues sai insuficiente, mesmo no mês publicado', async () => {
    const { corpo } = await consultar(U, { desde: D });
    const incidente = mes(corpo, '2026-11').p85PorTipo.find((t: { tipo: string }) => t.tipo === 'Incidente');
    expect(incidente?.n).toBe(19);
    expect(incidente?.estatistica.status).toBe('insuficiente');
  });

  it('dado do Acelerato não altera o resultado', async () => {
    const sem = await consultar(U, { desde: D });
    const com = await consultar(U, { desde: D, chamados: [CHAMADO] });
    expect(com.corpo).toEqual(sem.corpo);
  });

  it('o mês que começa antes do histórico leva contagemParcial (8a); o que começa nele, não', async () => {
    const { corpo } = await consultar(U, { desde: '2026-07-15' });
    expect(mes(corpo, '2026-07').contagemParcial).toEqual({ historicoDesde: '2026-07-15' });
    expect(mes(corpo, '2026-08').contagemParcial).toBeUndefined();
    expect(mes((await consultar(U, { desde: '2026-08-01' })).corpo, '2026-08').contagemParcial).toBeUndefined();
  });

  it('sem carga inicial com sucesso responde sem-dado-real, e com carga o resultado segue', async () => {
    const sem = await consultar(U);
    expect(sem.r.headers['x-estado-dado']).toBe('sem-dado-real');
    expect(sem.corpo).toMatchObject({ estado: 'sem-dado-real', metrica: 'TENDENCIA_FLUXO' });
    expect((await consultar(U, { desde: D })).corpo.meses).toHaveLength(6);
  });

  it('a marca da virada aparece em criterios', async () => {
    const { corpo } = await consultar(U, { desde: D });
    const v = VERSAO_CRITERIO_TENDENCIA_FLUXO_DADO_REAL;
    expect([...corpo.criterios.serie, ...corpo.criterios.janela]).toContainEqual(expect.objectContaining({ id: v.id, data: v.data }));
  });
});
