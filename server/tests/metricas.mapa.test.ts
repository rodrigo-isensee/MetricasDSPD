import { describe, expect, it } from 'vitest';
import {
  bloqueioDe, cardDe, chamadoDe, colunasDe, configBM, etapaDe, fichaDe, montarBaseAC, montarBaseBM, nomesDeColuna, transicaoDe,
} from '../src/modulos/metricas/mapa.js';
import type { LinhaCard, LinhaChamado, LinhaColuna } from '../src/modulos/metricas/repositorio.js';

const T = new Date('2026-10-01T12:00:00Z');
const cardNulo: LinhaCard = {
  card_id: 'c1', tipo: 'Melhoria', classe_servico: null, sistema: null, area_solicitante: null, fornecedor: null, objetivo_estrategico: null,
  card_pai: null, criado_em: T, comprometido_em: null, iniciado_em: null, concluido_em: null, arquivado_em: null, motivo_descarte: null,
  tamanho_declarado: null, titulo: null, granularidade: 'story', equipe: null, quadro_id: null, coluna_atual_id: null, excluido_em: null,
  eh_subtarefa: null, data_acordada: null, responsabilidade_atraso: null, origem_demanda: null, fase_deteccao: null, severidade: null,
  origem_bug: null, adicionado_apos_inicio_pai: null,
};
const col = (quadro: string, id: string, nome: string, extra: Partial<LinhaColuna> = {}): LinhaColuna =>
  ({ quadro_id: quadro, coluna_id: id, nome, tipo_coluna: 'fila', papel: 'trabalho', ordem: 1, limite_wip: null, ...extra });

describe('mapa: linhas do banco -> base da biblioteca', () => {
  it('card com colunas nulas: texto vazio, booleanos falsos, instantes nulos; pessoa sempre vazia', () => {
    const c = cardDe(cardNulo, new Map());
    expect(c).toMatchObject({ titulo: '', sistema: '', area_solicitante: '', equipe: '', quadro_id: '', coluna_atual: null,
      eh_subtarefa: false, adicionado_apos_inicio_pai: false, data_acordada: null, responsaveis: [], criado_em: T.getTime(),
      comprometido_em: null, concluido_em: null });
  });
  it('card preenchido: nome da coluna pelo ref_coluna, data_acordada = fim do expediente do dia civil', () => {
    const nomes = nomesDeColuna([col('q1', 'c3', 'Em teste')]);
    const c = cardDe({ ...cardNulo, quadro_id: 'q1', coluna_atual_id: 'c3', eh_subtarefa: true, adicionado_apos_inicio_pai: true,
      data_acordada: '2026-10-05', concluido_em: T }, nomes);
    expect(c.coluna_atual).toBe('Em teste');
    expect(c.eh_subtarefa).toBe(true);
    expect(c.concluido_em).toBe(T.getTime());
    expect(new Date(c.data_acordada!).toISOString()).toBe('2026-10-05T20:00:00.000Z'); // 17:00 -03:00
    expect(cardDe({ ...cardNulo, quadro_id: 'q1', coluna_atual_id: 'cx' }, nomes).coluna_atual).toBe('cx');
  });
  it('transição: quadro da linha, do card ou desconhecido; sem coluna de origem', () => {
    const nomes = nomesDeColuna([col('q1', 'c1', 'Fila'), col('q1', 'c2', 'Feito')]);
    const base = { card_id: 'c1', tipo_coluna: 'fila', direcao: 'avanco', ocorrido_em: T.getTime(), coluna_destino_id: 'c2' };
    const quadros = new Map([['c1', 'q1']]);
    expect(transicaoDe({ ...base, quadro_id: 'q1', coluna_origem_id: 'c1' }, nomes, quadros)).toMatchObject({ coluna_origem: 'Fila', coluna_destino: 'Feito', usuario: '', timestamp: T.getTime() });
    expect(transicaoDe({ ...base, quadro_id: null, coluna_origem_id: null }, nomes, quadros)).toMatchObject({ coluna_origem: null, coluna_destino: 'Feito' });
    expect(transicaoDe({ ...base, card_id: 'zz', quadro_id: null, coluna_origem_id: null }, nomes, quadros).coluna_destino).toBe('c2');
  });
  it('bloqueio: duração numérica, fim nulo, coluna sem nome vira vazio', () => {
    const nomes = nomesDeColuna([col('q1', 'c1', 'Fila')]);
    const quadros = new Map([['c1', 'q1']]);
    const b = { card_id: 'c1', motivo: 'Fornecedor', coluna_em_que_bloqueou: 'c1', fornecedor: null, inicio: T, fim: null, duracao_horas_uteis: null };
    expect(bloqueioDe(b, nomes, quadros)).toMatchObject({ coluna_em_que_bloqueou: 'Fila', fim: null, duracao_horas_uteis: null });
    expect(bloqueioDe({ ...b, coluna_em_que_bloqueou: null, fim: T, duracao_horas_uteis: '12.50' }, nomes, quadros)).toMatchObject({ coluna_em_que_bloqueou: '', fim: T.getTime(), duracao_horas_uteis: 12.5 });
    expect(bloqueioDe({ ...b, card_id: 'zz' }, nomes, quadros).coluna_em_que_bloqueou).toBe('c1');
  });
  it('colunas sem tipo ou sem papel conhecido não entram (o papel não se infere)', () => {
    const r = colunasDe([col('q', 'a', 'A'), col('q', 'b', 'B', { tipo_coluna: null }), col('q', 'c', 'C', { papel: null }), col('q', 'd', 'D', { papel: 'outro' }), col('q', 'e', 'E', { tipo_coluna: 'execucao', papel: 'entrega', limite_wip: 3 })]);
    expect(r.map((c) => c.coluna)).toEqual(['A', 'E']);
    expect(r[1]).toMatchObject({ tipo_coluna: 'execucao', papel: 'entrega', limite_wip: 3, quadro_id: 'q' });
  });
  it('config do BM: sem linha de limite de frentes = 0; sem SLE = lista vazia; limite de WIP por equipe', () => {
    const vazio = configBM({ equipes: [], sistemas: [], limitesWip: [], limiteFrentes: null, sle: [], alocacao: [], objetivos: [], areasInternas: [], fichas: [], criterios: [] });
    expect(vazio).toMatchObject({ limite_frentes: 0, sle: [], limite_wip_fluxo: {}, equipes: [] });
    const c = configBM({ equipes: ['Fluig'], sistemas: [{ codigo: 'fluig', rotulo: 'Fluig' }], limitesWip: [{ equipe: 'Fluig', limite: 14 }], limiteFrentes: 12,
      sle: [{ classe: 'Padrão', valor: '5.0', desde: '2026-06-15' }], alocacao: [{ classe: 'Evolução', valor: '40.00', desde: '2026-01-01' }],
      objetivos: [{ codigo: 'o', rotulo: 'Crescer' }], areasInternas: [{ codigo: 'i', rotulo: 'DSPD (interno)' }], fichas: [], criterios: [] });
    expect(c).toEqual({ limite_wip_fluxo: { Fluig: 14 }, limite_frentes: 12, sle: [{ classe: 'Padrão', dias_uteis: 5, publicado_em: '2026-06-15' }],
      alocacao: [{ natureza: 'Evolução', pct: 40 }], objetivos: ['Crescer'], criterios: [], equipes: [{ nome: 'Fluig', sistemas: [] }],
      sistemas: ['fluig'], areas_internas: ['DSPD (interno)'] });
  });
  it('ficha de resultado: jsonb + card_id; base completa do BM', () => {
    const f = { resultado_esperado: 'x', declarado_antes_do_inicio: true, unidade: 'h', ganho_previsto: 1, ganho_medido: null, medida: 'm', data_declaracao: '2026-01-01' };
    expect(fichaDe({ card_id: 'i1', ficha: f })).toEqual({ ...f, card_id: 'i1' });
    const b = montarBaseBM({ cards: [cardNulo], transicoes: [], bloqueios: [], colunas: [], ref: { equipes: [], sistemas: [], limitesWip: [], limiteFrentes: 1, sle: [], alocacao: [], objetivos: [], areasInternas: [], fichas: [{ card_id: 'i1', ficha: f }], criterios: [] } });
    expect(b.cards).toHaveLength(1);
    expect(b.fichas[0]!.card_id).toBe('i1');
  });
  it('chamado, etapa e alvos do AC', () => {
    const l: LinhaChamado = {
      chamado_id: 'a1', natureza: 'incidente', equipe: 'SSSC TOTVS', organizacao: 'DSPD Sustentação', tipo: 'DSPD - SSSC', categoria_sistema: null,
      excluido: false, status: 'Aberto', impacto: 'Alto', urgencia: 'Alta', prioridade: 'P1', prioridade_ajustada_manualmente: false, justificativa_informada: true, aberto_em: T,
      primeiro_atendimento_em: null, restaurado_em: T, data_finalizado: null, status_sla_r: null, status_sla_pa: null, motivo_escalacao: null,
      motivo_pendencia_atual: null, previsao_retorno: null, motivo_encerramento: null, avaliacao_problema: null, excecao_sla_registro_posterior: false,
      incidente_critico_coordenado: false, nivel_resolucao: null,
    };
    expect(chamadoDe(l)).toMatchObject({ categoria_sistema: '', aberto_em: T.getTime(), restaurado_em: T.getTime(), primeiro_atendimento_em: null, justificativa_ajuste: null, justificativa_informada: true, tipo_fila: 'DSPD - SSSC' });
    expect(etapaDe({ chamado_id: 'a1', etapa: 'Novo', entrada: T.getTime(), saida: null, motivo_pendencia: null })).toEqual({ chamado_id: 'a1', etapa: 'Novo', entrada: T.getTime(), saida: null, motivo_pendencia: null });
    const ac = montarBaseAC({ chamados: [l], etapas: [], alvos: [{ prioridade: 'P1', prazo_pa_horas_uteis: '0.25', prazo_r_horas_uteis: '4.00' }], criterios: [] });
    expect(ac.config.alvos).toEqual([{ prioridade: 'P1', primeiro_atendimento_horas: 0.25, restauracao_horas: 4 }]);
  });
});
