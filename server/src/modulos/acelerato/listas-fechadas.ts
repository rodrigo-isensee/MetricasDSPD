/**
 * Listas fechadas CONSTANTES do código (`docs/architecture/fontes/acelerato-listas.md` §1 a §3 e §9). As listas de
 * recorte (tipo, organizações, equipes) e de vocabulário (etapas, prioridades) NÃO estão aqui: vêm de `ref_dominio`
 * (arquivo versionado, `ref:sync`), nunca do `.env` e nunca com valor inventado no código (M11).
 * Mudar qualquer lista daqui é mudança de critério (T2.6): muda o hash em `ctl_coleta.parametros` e a coleta recusa
 * até a mudança ser reconhecida.
 */

/** Nome da tabela de origem: constante no código (ADR 0023, item 1.1). */
export const TABELA_ORIGEM = 'ACELERATO_CHAMADOS';

/** As 35 colunas lidas da §1 da lista (27 lidas e 8 só para reconciliação), na ordem do SELECT, mais `com_agente` (derivada). */
export const COLUNAS_LIDAS = [
  'ticket_key', 'tipo_ticket_key', 'tipo_ticket', 'status_key', 'status', 'encerrado',
  'categoria_key', 'categoria', 'organizacao_key', 'organizacao', 'equipe_key', 'equipe',
  'prioridade', 'data_criacao', 'data_atualizacao', 'data_pronto', 'lixeira', 'arquivado',
  'suspenso', 'impedido', 'tempo_vida_dias', 'tempo_ciclico_dias',
  'sla_pa_tempo_min', 'sla_pa_saldo_min', 'sla_pa_prazo_min', 'sla_pa_violado', 'sla_pa_status',
  'sla_r_saldo_min', 'sla_r_prazo_min', 'sla_r_violado', 'sla_r_status',
  'data_primeiro_comentario', 'primeiro_comentario_min_uteis', 'sincronizado_em', 'estatisticas_em',
] as const;

/** Derivada no `SELECT` (D-9): só o booleano `agente_key IS NOT NULL` sai do MySQL; o id do agente nunca. */
export const COLUNA_DERIVADA = 'com_agente';

/** Colunas que entram na linha devolvida pela Q1: a allow-list aceita exatamente estas 36 e falha fechado em qualquer outra. */
export const COLUNAS_DA_LINHA = [...COLUNAS_LIDAS, COLUNA_DERIVADA] as const;

/** Campos personalizados por nome EXATO (§3 da lista). Na F1 e na F2, só o campo dos 90 dias (S8, D-10). */
export const NOME_CAMPO_90_DIAS = 'Este problema já ocorreu nos últimos 90 dias?';
export const NOMES_CAMPO_FATIA_F1 = [NOME_CAMPO_90_DIAS] as const;

/** Domínio do valor do campo dos 90 dias (§3 da lista). Outra grafia: fora do domínio, nulo com contagem, sem o valor. */
export const DOMINIO_90_DIAS: Readonly<Record<string, 'sim' | 'nao'>> = { SIM: 'sim', 'NÃO': 'nao', NAO: 'nao' };
export type Reincidente90d = 'sim' | 'nao' | 'sem_resposta';

/** Status de SLA da origem (§9 da lista): os quatro valores; outro valor falha fechado. */
export const STATUS_SLA = ['REALIZADO_NO_PRAZO', 'REALIZADO_APOS_VENCIMENTO', 'DENTRO_DO_PRAZO', 'VENCIDO'] as const;

/** Chaves lidas de `estatisticas.workflow.etapas[]` (§2 da lista). Nunca `tempoSlaHoras`, nunca `impedimentos`. */
export const CHAVES_ETAPA = ['etapaKey', 'descricao', 'descricaoWorkflow', 'tempoSla', 'quantidadeDeVezes'] as const;
