import { esquemasDoAmbiente, type Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';

/**
 * Leitura das projeções para montar `BaseBM` / `BaseAC` (amostras dos painéis). Só colunas explícitas (nunca `SELECT *`):
 * `dim_card.responsaveis` e `fato_transicao.usuario` (a view canônica também não a expõe) NÃO estão nas listas abaixo (a `dspd_api` nem tem privilégio sobre elas).
 * BusinessMap e Acelerato nunca na mesma consulta: cada função toca um único schema (`S.bm` ou `S.ac`).
 * Cartões arquivados e excluídos permanecem (nenhum filtro por `arquivado_em`/`excluido_em`).
 */
type Instante = Date | null;
type Texto = string | null;

export type LinhaCard = {
  card_id: string; tipo: Texto; classe_servico: Texto; sistema: Texto; area_solicitante: Texto; fornecedor: Texto;
  objetivo_estrategico: Texto; card_pai: Texto; criado_em: Date; comprometido_em: Instante; iniciado_em: Instante;
  concluido_em: Instante; arquivado_em: Instante; motivo_descarte: Texto; tamanho_declarado: Texto; titulo: Texto;
  granularidade: Texto; equipe: Texto; quadro_id: Texto; coluna_atual_id: Texto; excluido_em: Instante;
  eh_subtarefa: boolean | null; data_acordada: Texto; responsabilidade_atraso: Texto; origem_demanda: Texto;
  fase_deteccao: Texto; severidade: Texto; origem_bug: Texto; adicionado_apos_inicio_pai: boolean | null;
};
export type LinhaTransicao = {
  card_id: string; quadro_id: Texto; coluna_origem_id: Texto; coluna_destino_id: string; tipo_coluna: Texto;
  direcao: Texto; ocorrido_em: number;
};
export type LinhaBloqueio = {
  card_id: string; motivo: Texto; coluna_em_que_bloqueou: Texto; fornecedor: Texto; inicio: Date; fim: Instante;
  duracao_horas_uteis: Texto;
};
export type LinhaColuna = {
  quadro_id: string; coluna_id: string; nome: string; tipo_coluna: Texto; papel: Texto; ordem: number; limite_wip: number | null;
};
export type LinhaChamado = {
  chamado_id: string; natureza: Texto; equipe: Texto; organizacao: Texto; tipo: Texto; categoria_sistema: Texto;
  excluido: boolean; status: Texto; impacto: Texto; urgencia: Texto; prioridade: Texto;
  prioridade_ajustada_manualmente: boolean; aberto_em: Instante; primeiro_atendimento_em: Instante;
  restaurado_em: Instante; data_finalizado: Instante; status_sla_r: Texto; status_sla_pa: Texto;
  motivo_escalacao: Texto; motivo_pendencia_atual: Texto; previsao_retorno: Instante; motivo_encerramento: Texto;
  avaliacao_problema: Texto; excecao_sla_registro_posterior: boolean; incidente_critico_coordenado: boolean;
  nivel_resolucao: Texto;
};
/** Instantes das tabelas grandes vêm como epoch ms (float8): o parser de `timestamptz` do driver custa mais que a consulta. */
export type LinhaEtapa = { chamado_id: string; etapa: string; entrada: number; saida: number | null; motivo_pendencia: Texto };

/** Cartões que já têm os campos essenciais (carga parcial não entra no cálculo). */
export const lerCards = async (db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<LinhaCard[]> =>
  (await db.query<LinhaCard>(
    `SELECT card_id, tipo, classe_servico, sistema, area_solicitante, fornecedor, objetivo_estrategico, card_pai,
            criado_em, comprometido_em, iniciado_em, concluido_em, arquivado_em, motivo_descarte, tamanho_declarado,
            titulo, granularidade, equipe, quadro_id, coluna_atual_id, excluido_em, eh_subtarefa, data_acordada,
            responsabilidade_atraso, origem_demanda, fase_deteccao, severidade, origem_bug, adicionado_apos_inicio_pai
       FROM ${S.bm}.dim_card
      WHERE criado_em IS NOT NULL AND granularidade IS NOT NULL AND tipo IS NOT NULL
      ORDER BY card_id`)).rows;

/**
 * Lê a view canônica (`vw_transicao_canonica`: todas as revision + webhooks sem par em `rec_transicao_par`), nunca `fato_transicao`
 * direto: a mesma transição gravada pela coleta e pelo webhook contaria em dobro (auditoria R1/C1).
 * Sem ORDER BY: a biblioteca ordena as transições de cada card (timestamp, destino, origem); ordenar no banco custaria um sort em disco.
 */
export const lerTransicoes = async (db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<LinhaTransicao[]> =>
  (await db.query<LinhaTransicao>(
    `SELECT card_id, quadro_id, coluna_origem_id, coluna_destino_id, tipo_coluna, direcao,
            (extract(epoch FROM ocorrido_em) * 1000)::float8 AS ocorrido_em
       FROM ${S.bm}.vw_transicao_canonica
      WHERE tipo_coluna IS NOT NULL AND direcao IS NOT NULL`)).rows;

export const lerBloqueios = async (db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<LinhaBloqueio[]> =>
  (await db.query<LinhaBloqueio>(
    `SELECT card_id, motivo, coluna_em_que_bloqueou, fornecedor, inicio, fim, duracao_horas_uteis
       FROM ${S.bm}.fato_bloqueio
      WHERE motivo IS NOT NULL
      ORDER BY card_id, inicio, bloqueio_sk`)).rows;

export const lerColunas = async (db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<LinhaColuna[]> =>
  (await db.query<LinhaColuna>(
    `SELECT quadro_id, coluna_id, nome, tipo_coluna, papel, ordem, limite_wip
       FROM ${S.bm}.ref_coluna
      WHERE vigente_ate IS NULL
      ORDER BY quadro_id, ordem, coluna_id`)).rows;

export const lerChamados = async (db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<LinhaChamado[]> =>
  (await db.query<LinhaChamado>(
    `SELECT chamado_id, natureza, equipe, organizacao, tipo, categoria_sistema, excluido, status, impacto, urgencia,
            prioridade, prioridade_ajustada_manualmente, aberto_em, primeiro_atendimento_em, restaurado_em,
            data_finalizado, status_sla_r, status_sla_pa, motivo_escalacao, motivo_pendencia_atual, previsao_retorno,
            motivo_encerramento, avaliacao_problema, excecao_sla_registro_posterior, incidente_critico_coordenado,
            nivel_resolucao
       FROM ${S.ac}.dim_chamado
      WHERE aberto_em IS NOT NULL AND equipe IS NOT NULL AND prioridade IS NOT NULL
      ORDER BY chamado_id`)).rows;

/** Sem ORDER BY: a biblioteca ordena as etapas de cada chamado (entrada, etapa). */
export const lerEtapas = async (db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<LinhaEtapa[]> =>
  (await db.query<LinhaEtapa>(
    `SELECT chamado_id, etapa, (extract(epoch FROM entrada) * 1000)::float8 AS entrada,
            (extract(epoch FROM saida) * 1000)::float8 AS saida, motivo_pendencia
       FROM ${S.ac}.fato_etapa_chamado`)).rows;

/* ---------- referência (config das métricas) ---------- */

export type LinhaDominio = { codigo: string; rotulo: string };
export type LinhaGlobal = { classe: string; valor: string; desde: string };
export type LinhaFicha = { card_id: string; ficha: Record<string, unknown> };
export type LinhaAlvo = { prioridade: string; prazo_pa_horas_uteis: string; prazo_r_horas_uteis: string };

/** Valor global (não por equipe) é gravado com equipe = '*' (convenção provisória; ver docs/architecture/server.md). */
export const EQUIPE_GLOBAL = '*';

export const lerDominio = async (db: Consultavel, campo: string, S: Esquemas = esquemasDoAmbiente()): Promise<LinhaDominio[]> =>
  (await db.query<LinhaDominio>(
    `SELECT codigo, rotulo FROM ${S.bm}.ref_dominio WHERE campo = $1 AND vigente_ate IS NULL ORDER BY ordem, codigo`, [campo])).rows;

export const lerLimitesWip = async (db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<{ equipe: string; limite: number }[]> =>
  (await db.query<{ equipe: string; limite: number }>(
    `SELECT equipe, limite FROM ${S.bm}.ref_limite_wip_fluxo WHERE vigente_ate IS NULL ORDER BY equipe`)).rows;

export const lerLimiteFrentes = async (db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<number | null> => {
  const r = await db.query<{ limite: number }>(
    `SELECT limite FROM ${S.bm}.ref_limite_frentes WHERE vigente_ate IS NULL AND equipe = $1`, [EQUIPE_GLOBAL]);
  return r.rows[0]?.limite ?? null;
};

/** SLE publicado: percentil 85 (provisório), valor global. */
export const lerSle = async (db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<LinhaGlobal[]> =>
  (await db.query<LinhaGlobal>(
    `SELECT classe_servico AS classe, dias_uteis AS valor, to_char(vigente_de, 'YYYY-MM-DD') AS desde
       FROM ${S.bm}.ref_sle WHERE vigente_ate IS NULL AND equipe = $1 AND percentil = 85 ORDER BY classe_servico`,
    [EQUIPE_GLOBAL])).rows;

/** Alocação acordada por natureza (a coluna `classe_servico` carrega a natureza; provisório). */
export const lerAlocacao = async (db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<LinhaGlobal[]> =>
  (await db.query<LinhaGlobal>(
    `SELECT classe_servico AS classe, percentual AS valor, to_char(vigente_de, 'YYYY-MM-DD') AS desde
       FROM ${S.bm}.ref_alocacao_acordada WHERE vigente_ate IS NULL AND equipe = $1 ORDER BY classe_servico`,
    [EQUIPE_GLOBAL])).rows;

export const lerFichas = async (db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<LinhaFicha[]> =>
  (await db.query<LinhaFicha>(
    `SELECT card_id, ficha FROM ${S.bm}.ref_ficha_resultado WHERE vigente_ate IS NULL ORDER BY card_id`)).rows;

export const lerAlvos = async (db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<LinhaAlvo[]> =>
  (await db.query<LinhaAlvo>(
    `SELECT prioridade, prazo_pa_horas_uteis, prazo_r_horas_uteis FROM ${S.ac}.ref_alvo_prioridade
      WHERE vigente_ate IS NULL ORDER BY prioridade`)).rows;
