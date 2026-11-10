import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao';
import { VERSAO_CRITERIO_TENDENCIA_SUST_DADO_REAL } from '@metricas-dspd/metricas/core';
import { gerarBaseMock } from '@metricas-dspd/mock';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import type { LinhaCard, LinhaChamado } from '../src/modulos/metricas/repositorio.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { bancoDoMock } from './base-duble.js';
import { criarDublePg, type Chamada } from './duble-pg.js';

// Pedido 077, L7 (K-211, A11): a rota da TENDENCIA_SUST sobre a base real mínima (sem mock do serviço nem da biblioteca): a prioridade com 19 apuráveis,
// o BusinessMap fora do resultado, a marca da virada e a nota do S2. Pela P-077-6 = (a) o Acelerato não tem início de histórico: nada sai incompleto.
const AGORA = new Date('2026-12-02T15:00:00Z');
const seed = gerarBaseMock({ escala: 0.1 });
const REAL = montarEsquemas('r_');
const DIA = 86_400_000;
const URL = '/api/v1/metricas/TENDENCIA_SUST?dataReferencia=2026-12-01';

/** Chamado concluído em `fim` e apurável, aberto três dias antes, com os dois SLA cumpridos. */
const chamado = (id: string, prioridade: string, fim: number): LinhaChamado => ({
  chamado_id: id, natureza: 'incidente', equipe: 'SSSC TOTVS', organizacao: 'Org', tipo: 'Incidente', categoria_sistema: 'Protheus', excluido: false,
  status: 'Concluído', impacto: null, urgencia: null, prioridade, prioridade_ajustada_manualmente: false, justificativa_informada: false,
  aberto_em: new Date(fim - 3 * DIA), primeiro_atendimento_em: new Date(fim - 2 * DIA), restaurado_em: new Date(fim - DIA), data_finalizado: new Date(fim),
  status_sla_r: 'REALIZADO_NO_PRAZO', status_sla_pa: 'NO_PRAZO', motivo_escalacao: null, motivo_pendencia_atual: null, previsao_retorno: null,
  motivo_encerramento: null, avaliacao_problema: null, excecao_sla_registro_posterior: false, incidente_critico_coordenado: false, nivel_resolucao: null,
});
/** P3: um fechamento por dia de 2026-10-01 a 2026-11-29 (a janela de novembro tem mais de 20); P2: 19 em novembro. */
const CHAMADOS: LinhaChamado[] = [
  ...Array.from({ length: 60 }, (_, i) => chamado(`C${i}`, 'P3', Date.parse('2026-10-01T15:00:00Z') + i * DIA)),
  ...Array.from({ length: 19 }, (_, i) => chamado(`B${i}`, 'P2', Date.parse('2026-11-05T15:00:00Z') + i * DIA)),
];
const CARD = { card_id: 'K1', tipo: 'Melhoria', granularidade: 'story', equipe: 'Time A', quadro_id: '35', criado_em: new Date('2026-05-01T12:00:00Z') } as unknown as LinhaCard;

type Mes = { mes: string; janelaIncompleta?: unknown; prioridades: { prioridade: string; restauracao: { taxa: { status: string; n: number } } }[] };
type Corpo = { meses: Mes[]; notas?: string[]; criterios: { serie: unknown[]; janela: unknown[] } };

async function consultar(o: { cards?: LinhaCard[]; desde?: string } = {}) {
  const doSeed = bancoDoMock(seed);
  const d = criarDublePg((c: Chamada) => {
    const x = c.texto;
    if (!x.includes('r_dspd')) return doSeed(c);
    if (x.includes('FROM r_dspd_ac.dim_chamado')) return CHAMADOS;
    if (x.includes('FROM r_dspd_bm.dim_card')) return o.cards ?? [];
    if (x.includes('SELECT parametros')) return o.desde === undefined ? [] : [{ parametros: { tipo: 'carga_inicial', inicio_carga: o.desde } }];
    if (x.includes('.ctl_coleta')) return [{ coleta_id: '9', finalizado_em: new Date('2026-12-01T12:00:00Z') }];
    if (x.includes('FROM r_dspd_core.ref_versao_criterio')) return x.includes('ref_versao_criterio v') ? [] : [{ versao_id: '1' }];
    return [];
  });
  const app = await buildApp({ db: d.pool, S: REAL, agora: () => AGORA, nivelLog: 'silent' });
  const r = await app.inject(URL);
  return { r, corpo: r.json() as Corpo };
}
const prio = (corpo: Corpo, m: string, p: string) => corpo.meses.find((x) => x.mes === m)!.prioridades.find((x) => x.prioridade === p)!;

describe('TENDENCIA_SUST no mapa real (pedido 077, L7)', () => {
  it('responde com dado real, pelo schema, e a prioridade com 19 apuráveis sai insuficiente enquanto a de 60 publica', async () => {
    const { r, corpo } = await consultar();
    expect(r.statusCode).toBe(200);
    expect(r.headers['x-estado-dado']).toBeUndefined();
    expect(SCHEMAS_RESULTADO.TENDENCIA_SUST.safeParse(corpo).success).toBe(true);
    expect(prio(corpo, '2026-11', 'P2').restauracao.taxa).toMatchObject({ n: 19, status: 'insuficiente' });
    expect(prio(corpo, '2026-11', 'P3').restauracao.taxa.status).toBe('ok');
  });

  it('sem início de histórico (P-077-6 = a), nenhum mês sai com janela incompleta, mesmo com o do BusinessMap', async () => {
    const { corpo } = await consultar({ desde: '2026-11-20' });
    expect(corpo.meses.filter((m) => m.janelaIncompleta !== undefined)).toEqual([]);
  });

  it('dado do BusinessMap não altera o resultado', async () => {
    const sem = await consultar();
    const com = await consultar({ cards: [CARD] });
    expect(com.corpo).toEqual(sem.corpo);
  });

  it('a marca da virada aparece em criterios', async () => {
    const { corpo } = await consultar();
    const v = VERSAO_CRITERIO_TENDENCIA_SUST_DADO_REAL;
    expect([...corpo.criterios.serie, ...corpo.criterios.janela]).toContainEqual(expect.objectContaining({ id: v.id, data: v.data }));
  });

  it('a nota da exceção de SLA sem fonte vem no resultado real (CA-8 de ponta a ponta)', async () => {
    expect((await consultar()).corpo.notas).toEqual(['excecao-sla-sem-fonte']);
  });
});
