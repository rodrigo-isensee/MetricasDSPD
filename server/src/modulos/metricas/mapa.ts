import { TIPOS_CARD, type VersaoCriterio } from '@metricas-dspd/contratos';
import { CALENDARIO_PADRAO, diaDeIso, fimDoExpediente } from '@metricas-dspd/metricas/core';
import type { BaseAC, Chamado, EtapaChamado, ExtensaoAC } from '@metricas-dspd/metricas/acelerato';
import type {
  BaseBM, ConfigBM, DimCard, DimColuna, FatoBloqueio, FatoTransicao, FichaResultado,
} from '@metricas-dspd/metricas/businessmap';
import type {
  LinhaAlvo, LinhaBloqueio, LinhaCard, LinhaChamado, LinhaColuna, LinhaColunaReal, LinhaDominio, LinhaEtapa, LinhaFicha, LinhaGlobal,
  LinhaTransicao,
} from './repositorio.js';

/**
 * Linhas das projeções -> base em memória da biblioteca (`@metricas-dspd/metricas`). Mapeamento puro, sem regra de
 * cálculo. Pessoa nunca entra: `responsaveis = []` e `usuario = ''` (as colunas nem são lidas).
 * Colunas de referência viram rótulos pelo `ref_coluna` vigente, por id (o modelo da biblioteca usa o nome da coluna como chave).
 */
const ms = (d: Date | null): number | null => (d === null ? null : d.getTime());
/** `data_acordada` é data civil (coluna `date`): vale até o fim do expediente desse dia (calendário padrão, P2). */
const fimDoDia = (iso: string | null): number | null =>
  iso === null ? null : fimDoExpediente(diaDeIso(iso), CALENDARIO_PADRAO);
const campo = <T>(v: string | null): T => v as T;

export type NomesColuna = Map<string, string>;
/**
 * Identidade por id (ADR 0016): a chave de cada coluna é `quadro|coluna_id`, e o rótulo que a biblioteca usa como nome é o nome da
 * coluna quando ele é único no quadro; nome repetido no mesmo quadro (workflows diferentes com "Backlog" ou "Concluído") ganha o id
 * ao lado, para duas colunas nunca virarem uma. Sem repetição o rótulo é o nome de sempre, e as métricas não mudam.
 */
export function nomesDeColuna(colunas: LinhaColuna[]): NomesColuna {
  const vezes = new Map<string, number>();
  for (const c of colunas) vezes.set(`${c.quadro_id}|${c.nome}`, (vezes.get(`${c.quadro_id}|${c.nome}`) ?? 0) + 1);
  return new Map(colunas.map((c) => [`${c.quadro_id}|${c.coluna_id}`, vezes.get(`${c.quadro_id}|${c.nome}`)! > 1 ? `${c.nome} (${c.coluna_id})` : c.nome]));
}
/** Id sem `ref_coluna` vigente fica como está (o nome é a única referência que sobrou). */
const nome = (nomes: NomesColuna, quadro: string | null, id: string | null): string | null =>
  id === null ? null : (nomes.get(`${quadro ?? ''}|${id}`) ?? id);

export function cardDe(l: LinhaCard, nomes: NomesColuna): DimCard {
  return {
    card_id: l.card_id, titulo: l.titulo ?? '', tipo: campo(l.tipo), classe_servico: campo(l.classe_servico),
    sistema: l.sistema ?? '', area_solicitante: l.area_solicitante ?? '', fornecedor: l.fornecedor,
    objetivo_estrategico: l.objetivo_estrategico, card_pai: l.card_pai, criado_em: l.criado_em.getTime(),
    comprometido_em: ms(l.comprometido_em), iniciado_em: ms(l.iniciado_em), concluido_em: ms(l.concluido_em),
    arquivado_em: ms(l.arquivado_em), motivo_descarte: l.motivo_descarte, responsaveis: [],
    tamanho_declarado: campo(l.tamanho_declarado), granularidade: campo(l.granularidade), equipe: l.equipe ?? '',
    quadro_id: l.quadro_id ?? '', coluna_atual: nome(nomes, l.quadro_id, l.coluna_atual_id), excluido_em: ms(l.excluido_em),
    eh_subtarefa: l.eh_subtarefa === true, data_acordada: fimDoDia(l.data_acordada),
    responsabilidade_atraso: campo(l.responsabilidade_atraso), origem_demanda: campo(l.origem_demanda),
    fase_deteccao: campo(l.fase_deteccao), severidade: campo(l.severidade), origem_bug: l.origem_bug,
    adicionado_apos_inicio_pai: l.adicionado_apos_inicio_pai === true,
  };
}

export function transicaoDe(l: LinhaTransicao, nomes: NomesColuna, quadros: Map<string, string>): FatoTransicao {
  const q = l.quadro_id ?? quadros.get(l.card_id) ?? null;
  return {
    card_id: l.card_id, coluna_origem: nome(nomes, q, l.coluna_origem_id), coluna_destino: nome(nomes, q, l.coluna_destino_id) as string,
    tipo_coluna: campo(l.tipo_coluna), usuario: '', timestamp: l.ocorrido_em, direcao: campo(l.direcao),
  };
}

export function bloqueioDe(l: LinhaBloqueio, nomes: NomesColuna, quadros: Map<string, string>): FatoBloqueio {
  return {
    card_id: l.card_id, motivo: campo(l.motivo),
    coluna_em_que_bloqueou: nome(nomes, quadros.get(l.card_id) ?? null, l.coluna_em_que_bloqueou) ?? '',
    fornecedor: l.fornecedor, inicio: l.inicio.getTime(), fim: ms(l.fim),
    duracao_horas_uteis: l.duracao_horas_uteis === null ? null : Number(l.duracao_horas_uteis),
  };
}

const PAPEIS: readonly string[] = ['backlog', 'compromisso', 'trabalho', 'homologacao', 'entrega'];
/**
 * Coluna sem tipo ou papel conhecido não entra em `colunas` (não se infere o papel). Base real (`real`, H-12): `limite_wip` 0 = coluna sem
 * limite (`null`) e a coluna leva o time do workflow dela (quando a leitura o trouxe).
 */
export const colunasDe = (ls: (LinhaColuna | LinhaColunaReal)[], real = false): DimColuna[] => {
  const rotulos = nomesDeColuna(ls);
  return ls.filter((c) => (c.tipo_coluna === 'fila' || c.tipo_coluna === 'execucao') && c.papel !== null && PAPEIS.includes(c.papel))
    .map((c) => {
      const equipe = (c as Partial<LinhaColunaReal>).equipe;
      return {
        quadro_id: c.quadro_id, coluna: rotulos.get(`${c.quadro_id}|${c.coluna_id}`)!, tipo_coluna: campo<DimColuna['tipo_coluna']>(c.tipo_coluna),
        papel: campo<DimColuna['papel']>(c.papel), ordem: c.ordem, limite_wip: real && c.limite_wip === 0 ? null : c.limite_wip,
        ...(real && equipe != null ? { equipe } : {}),
      };
    });
};

/** Papéis cujo limite de WIP conta no limite do time (as colunas de trabalho e de homologação, as mesmas do detalhe por coluna do O1). */
const PAPEIS_COM_LIMITE: readonly string[] = ['trabalho', 'homologacao'];
/** H-12: limite de WIP do time na base real = soma dos `limite_wip` maiores que 0 das colunas de trabalho e homologação dele; sem nenhum, o time fica sem limite. */
export function limitesDosTimes(colunas: readonly DimColuna[]): Record<string, number> {
  const por: Record<string, number> = {};
  for (const c of colunas) {
    if (c.equipe === undefined || !PAPEIS_COM_LIMITE.includes(c.papel) || c.limite_wip === null || c.limite_wip <= 0) continue;
    por[c.equipe] = (por[c.equipe] ?? 0) + c.limite_wip;
  }
  return por;
}

export type RefBM = {
  equipes: string[]; sistemas: LinhaDominio[]; limitesWip: { equipe: string; limite: number }[]; limiteFrentes: number | null;
  sle: LinhaGlobal[]; alocacao: LinhaGlobal[]; objetivos: LinhaDominio[]; areasInternas: LinhaDominio[];
  fichas: LinhaFicha[]; criterios: VersaoCriterio[];
};

export const fichaDe = (l: LinhaFicha): FichaResultado => ({ ...(l.ficha as Omit<FichaResultado, 'card_id'>), card_id: l.card_id });

export function configBM(r: RefBM, colunasReais?: readonly DimColuna[]): ConfigBM {
  return {
    ...(colunasReais === undefined ? {} : { limite_wip_por_coluna: true }),
    limite_wip_fluxo: colunasReais === undefined ? Object.fromEntries(r.limitesWip.map((x) => [x.equipe, x.limite])) : limitesDosTimes(colunasReais),
    limite_frentes: r.limiteFrentes ?? 0,
    sle: r.sle.map((x) => ({ classe: campo(x.classe), dias_uteis: Number(x.valor), publicado_em: x.desde })),
    alocacao: r.alocacao.map((x) => ({ natureza: campo(x.classe), pct: Number(x.valor) })),
    objetivos: r.objetivos.map((x) => x.rotulo), criterios: r.criterios,
    equipes: r.equipes.map((n) => ({ nome: n, sistemas: [] })), sistemas: r.sistemas.map((x) => x.codigo),
    areas_internas: r.areasInternas.map((x) => x.rotulo),
  };
}

export type LinhasBM = {
  cards: LinhaCard[]; transicoes: LinhaTransicao[]; bloqueios: LinhaBloqueio[]; colunas: (LinhaColuna | LinhaColunaReal)[]; ref: RefBM;
  /** Base real (F6 do 052): limite de WIP pelas colunas (H-12). Ausente = base semeada. */
  real?: boolean;
};
export type OpcoesMontagem = { aoDescartarTipo?: (quantos: number) => void };

const TIPOS_DO_CONTRATO: readonly string[] = TIPOS_CARD;

/**
 * ADR 0024: card com `tipo` fora de `TIPOS_CARD` não entra no contexto (nunca um cast cego do tipo); só a contagem sai, por `aoDescartarTipo`.
 */
export function montarBaseBM(l: LinhasBM, o: OpcoesMontagem = {}): BaseBM {
  const nomes = nomesDeColuna(l.colunas);
  const cards = l.cards.filter((c) => c.tipo !== null && TIPOS_DO_CONTRATO.includes(c.tipo));
  if (cards.length < l.cards.length) o.aoDescartarTipo?.(l.cards.length - cards.length);
  const quadros = new Map(l.cards.map((c) => [c.card_id, c.quadro_id ?? '']));
  const colunas = colunasDe(l.colunas, l.real === true);
  return {
    cards: cards.map((c) => cardDe(c, nomes)),
    transicoes: l.transicoes.map((t) => transicaoDe(t, nomes, quadros)),
    bloqueios: l.bloqueios.map((b) => bloqueioDe(b, nomes, quadros)),
    colunas, fichas: l.ref.fichas.map(fichaDe), config: configBM(l.ref, l.real === true ? colunas : undefined),
  };
}

export function chamadoDe(l: LinhaChamado): Chamado {
  return {
    chamado_id: l.chamado_id, organizacao: campo(l.organizacao), tipo_fila: campo(l.tipo), equipe: campo(l.equipe),
    natureza: campo(l.natureza), categoria_sistema: l.categoria_sistema ?? '', excluido: l.excluido, status: campo(l.status),
    impacto: campo(l.impacto), urgencia: campo(l.urgencia),
    ...(l.prioridade === null ? {} : { prioridade: campo(l.prioridade) }),
    prioridade_ajustada_manualmente: l.prioridade_ajustada_manualmente, justificativa_ajuste: null,
    justificativa_informada: l.justificativa_informada,
    aberto_em: (l.aberto_em as Date).getTime(), primeiro_atendimento_em: ms(l.primeiro_atendimento_em),
    restaurado_em: ms(l.restaurado_em), data_finalizado: ms(l.data_finalizado), status_sla_r: campo(l.status_sla_r),
    status_sla_pa: campo(l.status_sla_pa), motivo_escalacao: campo(l.motivo_escalacao),
    motivo_pendencia_atual: campo(l.motivo_pendencia_atual), previsao_retorno: ms(l.previsao_retorno),
    motivo_encerramento: campo(l.motivo_encerramento), avaliacao_problema: campo(l.avaliacao_problema),
    excecao_sla_registro_posterior: l.excecao_sla_registro_posterior,
    incidente_critico_coordenado: l.incidente_critico_coordenado, nivel_resolucao: campo(l.nivel_resolucao),
  };
}

export const etapaDe = (l: LinhaEtapa): EtapaChamado => ({
  chamado_id: l.chamado_id, etapa: campo(l.etapa), entrada: l.entrada, saida: l.saida,
  motivo_pendencia: campo(l.motivo_pendencia),
});

export type LinhasAC = { chamados: LinhaChamado[]; etapas: LinhaEtapa[]; alvos: LinhaAlvo[]; criterios: VersaoCriterio[] };

export const montarBaseAC = (l: LinhasAC): BaseAC => ({
  chamados: l.chamados.map(chamadoDe), etapas: l.etapas.map(etapaDe),
  config: {
    alvos: l.alvos.map((a) => ({
      prioridade: campo(a.prioridade), primeiro_atendimento_horas: Number(a.prazo_pa_horas_uteis),
      restauracao_horas: Number(a.prazo_r_horas_uteis),
    })),
    criterios: l.criterios,
  },
});

export type ExtrasAC = { semAgenteFora: BaseAC; extensao: ExtensaoAC | undefined };

/**
 * Extras da base do Acelerato (F2, ADR 0023). `semAgenteFora`: a mesma base sem os chamados sem agente, para as métricas de SLA (D-9; o
 * contador à parte fica em `ctl_coleta_contagem`); é a própria base se todos têm agente. `extensao`: o campo dos 90 dias como a biblioteca o
 * lê (D-10): `sim` = reincidente; `não` e `sem resposta` contam como não reincidentes (denominador = todos os criados). Pessoa nunca entra.
 */
export function extrasAC(base: BaseAC, linhas: readonly LinhaChamado[]): ExtrasAC {
  const semAgente = new Set(linhas.filter((l) => l.com_agente === false).map((l) => l.chamado_id));
  const reabertoDe: Record<string, string> = {};
  for (const l of linhas) if (l.reincidente_90d === 'sim') reabertoDe[l.chamado_id] = l.chamado_id;
  return {
    semAgenteFora: semAgente.size === 0 ? base : { ...base, chamados: base.chamados.filter((c) => !semAgente.has(c.chamado_id)) },
    // Sem nenhum chamado com o campo projetado (base semeada, projeção ainda não rodou): sem extensão, o S8 sai "sem campo", nunca 0%.
    extensao: linhas.some((l) => l.reincidente_90d != null) ? { causasRaiz: {}, reabertoDe, registroProblema: {} } : undefined,
  };
}
