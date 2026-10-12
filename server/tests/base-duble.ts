import type { VersaoCriterio } from '@metricas-dspd/contratos';
import { CALENDARIO_PADRAO, diaLocal, fimDoExpediente } from '@metricas-dspd/metricas/core';
import type { BaseBM } from '@metricas-dspd/metricas/businessmap';
import type { BaseMock } from '@metricas-dspd/mock';
import { mapearAC, mapearBM, type Linha } from '../src/plataforma/db/seed.js';
import type { Respondedor } from './duble-pg.js';

/** 'AAAA-MM-DD HH:MM:SS.mmm' (UTC, como o seed grava) -> Date, como o `pg` devolve `timestamptz`. */
const DATA_HORA = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/;
const comoDriver = (l: Linha): Record<string, unknown> =>
  Object.fromEntries(Object.entries(l).map(([k, v]) => [k, typeof v === 'string' && DATA_HORA.test(v) ? new Date(`${v.replace(' ', 'T')}Z`) : v]));

export const CORTE_DATA = '2026-10-09';
const ehSust = (m: string): boolean => m.startsWith('S') || m === 'EI_SUST';
/** Critérios de cada fonte (a do mock tem os dois em ambas; o banco guarda cada um na sua) e os ids que o banco lhes dá (1, 2). */
export function criteriosPorFonte(base: BaseMock): { bm: VersaoCriterio[]; ac: VersaoCriterio[]; ids: Map<string, string> } {
  const bm = base.bm.config.criterios.filter((c) => c.afeta.every((m) => !ehSust(m)));
  const ac = base.ac.config.criterios.filter((c) => c.afeta.every(ehSust));
  return { bm, ac, ids: new Map([...bm, ...ac].map((v, i) => [v.id, String(i + 1)])) };
}

/**
 * Banco falso que responde às consultas do módulo `metricas` com as linhas que o SEED gravaria para o mock
 * (`mapearBM`/`mapearAC`) e com a referência derivada da `config` do mock. O que o banco não guarda (pessoa) não existe aqui.
 */
export function bancoDoMock(base: BaseMock, opcoes: { coletaId?: string; versaoCriterio?: string | null; finalizadoAC?: Date; semColeta?: boolean } = {}): Respondedor {
  const bm = Object.fromEntries(mapearBM(base, 1).map((t) => [t.tabela.split('.')[1]!, t.linhas.map(comoDriver)]));
  const ac = Object.fromEntries(mapearAC(base, 1).map((t) => [t.tabela.split('.')[1]!, t.linhas.map(comoDriver)]));
  const finalizado = new Date(base.config.hoje);
  const { bm: critBM, ac: critAC, ids } = criteriosPorFonte(base);
  const dominio = (campo: string): string[] =>
    campo === 'sistema' ? base.bm.config.sistemas : campo === 'objetivo_estrategico' ? base.bm.config.objetivos : base.bm.config.areas_internas;
  return (c) => {
    const t = c.texto;
    if (t.includes('FROM dspd_bm.dim_card')) return bm.dim_card!;
    if (t.includes('FROM dspd_bm.vw_transicao_canonica')) return bm.fato_transicao!.map((l) => ({ ...l, ocorrido_em: (l.ocorrido_em as Date).getTime() }));
    if (t.includes('FROM dspd_bm.fato_bloqueio')) return bm.fato_bloqueio!;
    if (t.includes('FROM dspd_bm.ref_coluna')) return bm.ref_coluna!;
    if (t.includes('FROM dspd_ac.dim_chamado')) return ac.dim_chamado!;
    if (t.includes('FROM dspd_ac.fato_etapa_chamado')) return ac.fato_etapa_chamado!.map((l) => ({ ...l, entrada: (l.entrada as Date).getTime(), saida: l.saida === null ? null : (l.saida as Date).getTime() }));
    if (t.includes('.ctl_coleta')) {
      if (opcoes.semColeta) return [];
      return [{ coleta_id: opcoes.coletaId ?? '1', finalizado_em: t.includes('dspd_ac') ? (opcoes.finalizadoAC ?? finalizado) : finalizado }];
    }
    if (t.includes('FROM dspd_core.ref_versao_criterio v')) {
      const dom = c.valores[0];
      return (dom === 'businessmap' ? critBM : critAC).flatMap((v) =>
        v.afeta.map((m) => ({ versao_id: ids.get(v.id), vigente_desde: v.data, descricao: v.descricao, metrica_id: m })));
    }
    if (t.includes('FROM dspd_core.ref_versao_criterio')) return opcoes.versaoCriterio === null ? [] : [{ versao_id: opcoes.versaoCriterio ?? '2' }];
    if (t.includes('FROM dspd_bm.ref_quadro')) return base.bm.config.equipes.map((e) => ({ equipe: e.nome }));
    if (t.includes('FROM dspd_bm.ref_dominio')) return dominio(c.valores[0] as string).map((x) => ({ codigo: x, rotulo: x }));
    if (t.includes('ref_limite_wip_fluxo')) return Object.entries(base.bm.config.limite_wip_fluxo).map(([equipe, limite]) => ({ equipe, limite }));
    if (t.includes('ref_limite_frentes')) return [{ limite: base.bm.config.limite_frentes }];
    if (t.includes('ref_sle')) return base.bm.config.sle.filter((s) => s.dias_uteis !== null).map((s) => ({ classe: s.classe, valor: String(s.dias_uteis), desde: s.publicado_em }));
    if (t.includes('ref_alocacao_acordada')) return base.bm.config.alocacao.map((a) => ({ classe: a.natureza, valor: String(a.pct), desde: '2026-01-01' }));
    if (t.includes('ref_ficha_resultado')) return base.bm.fichas.map((f) => ({ card_id: f.card_id, ficha: Object.fromEntries(Object.entries(f).filter(([k]) => k !== 'card_id')) }));
    if (t.includes('ref_alvo_prioridade')) return base.ac.config.alvos.map((a) => ({ prioridade: a.prioridade, prazo_pa_horas_uteis: String(a.primeiro_atendimento_horas), prazo_r_horas_uteis: String(a.restauracao_horas) }));
    return [];
  };
}

/**
 * O mock em memória com só o que o banco consegue representar (o contrato do seed): sem pessoa, `data_acordada` como data
 * civil (vale até o fim do expediente do dia), duração de bloqueio com 2 casas (numeric(12,2)), versões de critério com os
 * ids do banco e `justificativa_ajuste` fora (texto livre só no staging).
 */
export function mockComoNoBanco(base: BaseMock, idsDoBanco?: Map<string, string>): BaseMock {
  const ids = idsDoBanco ?? criteriosPorFonte(base).ids;
  const reid = (c: VersaoCriterio[]): VersaoCriterio[] => c.map((v) => ({ ...v, id: ids.get(v.id) ?? v.id }));
  const bm: BaseBM = {
    ...base.bm,
    cards: base.bm.cards.map((c) => ({ ...c, responsaveis: [], data_acordada: c.data_acordada === null ? null : fimDoExpediente(diaLocal(c.data_acordada, CALENDARIO_PADRAO), CALENDARIO_PADRAO) })),
    transicoes: base.bm.transicoes.map((t) => ({ ...t, usuario: '' })),
    bloqueios: base.bm.bloqueios.map((b) => ({ ...b, duracao_horas_uteis: b.duracao_horas_uteis === null ? null : Number(b.duracao_horas_uteis.toFixed(2)) })),
    config: { ...base.bm.config, criterios: reid(base.bm.config.criterios), equipes: base.bm.config.equipes.map((e) => ({ nome: e.nome, sistemas: [] })) },
  };
  const ac = {
    ...base.ac,
    chamados: base.ac.chamados.map((c) => ({ ...c, justificativa_ajuste: null })),
    config: { ...base.ac.config, criterios: reid(base.ac.config.criterios) },
  };
  return { ...base, bm, ac };
}
