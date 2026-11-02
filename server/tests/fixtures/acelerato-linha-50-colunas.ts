/**
 * Fixture sintética da tabela MySQL do Acelerato (pedido 056, E4.3). Valores inventados; nenhum dado real.
 * Obrigação: plano 056 §2 e §2.1 (M4 e), modelo de ameaças M4 e CA-1 do modelo.
 * Regra: os marcadores abaixo são escritos à mão, nunca derivados da allow-list de produção (B-1 da ADR 0020).
 * Cada coluna barrada e cada campo de pessoa ou de texto livre carrega um marcador; o teste prova que nenhum
 * chega ao staging, à base, ao log nem a `ctl_coleta_falha`.
 */

/** Prefixo comum: uma única busca por texto no resultado de qualquer camada. */
export const PREFIXO_MARCADOR = 'MARCADOR-056-';

const m = (rotulo: string): string => `${PREFIXO_MARCADOR}${rotulo}`;

/** Valores de domínio da fixture; o teste cadastra estes valores em `ref_dominio` do ambiente de teste. */
export const DOMINIO_FIXTURE = {
  tipoTicketKey: 9001,
  tipoTicket: 'DSPD - SSSC',
  organizacaoKey: 9101,
  organizacao: 'Organizacao Ficticia A',
  equipeKey: 9201,
  equipe: 'Equipe Ficticia N1',
  status: 'Em diagnostico',
  categoria: 'SSSC - Incidente - Sistema Ficticio',
  prioridade: 'SSSC - Alta',
  // Fora do recorte, para CA-11 (nenhum deles pode estar em ref_dominio):
  tipoTicketKeyFora: 9999,
  tipoTicketFora: 'Tipo Externo Ficticio',
  organizacaoKeyFora: 9199,
  organizacaoFora: 'Organizacao Externa Ficticia',
  equipeKeyFora: 9299,
} as const;

/** As 50 colunas, na ordem da §2 do plano. `LinhaMysql` e a forma bruta devolvida pelo driver (datas como texto). */
export type LinhaMysql = Record<string, unknown>;

export const COLUNAS_50: readonly string[] = [
  'ticket_key', 'tipo_ticket_key', 'tipo_ticket', 'titulo', 'status_key', 'status', 'encerrado', 'categoria_key', 'categoria',
  'organizacao_key', 'organizacao', 'equipe_key', 'equipe', 'agente_key', 'agente', 'agente_email', 'solicitante',
  'solicitante_email', 'prioridade', 'origem', 'data_criacao', 'data_atualizacao', 'data_pronto', 'lixeira', 'arquivado',
  'suspenso', 'impedido', 'tempo_vida_dias', 'tempo_ciclico_dias', 'url', 'sla_pa_tempo_min', 'sla_pa_saldo_min',
  'sla_pa_prazo_min', 'sla_pa_violado', 'sla_pa_status', 'sla_r_tempo_min', 'sla_r_saldo_min', 'sla_r_prazo_min',
  'sla_r_violado', 'sla_r_status', 'data_primeiro_comentario', 'primeiro_comentario_min_uteis', 'tempo_workflow_total',
  'solicitantes', 'campos_personalizados', 'campos_personalizados_etapa', 'estatisticas', 'raw', 'sincronizado_em',
  'estatisticas_em',
];

/** Colunas barradas da §2 (11) e a derivada no SQL: nenhum valor delas pode aparecer depois do SELECT. */
export const COLUNAS_BARRADAS: readonly string[] = [
  'titulo', 'agente', 'agente_email', 'solicitante', 'solicitante_email', 'origem', 'url', 'sla_r_tempo_min',
  'tempo_workflow_total', 'solicitantes', 'raw',
];

/** Marcador de `agente_key` (a coluna 14 so vira o booleano `com_agente`): numero distinto e improvavel. */
export const AGENTE_KEY_MARCADOR = 7650561;
/** Marcador numerico de `sla_r_tempo_min` (barrada por ter media negativa): negativo e improvavel. */
export const SLA_R_TEMPO_MARCADOR = -4056056;

/**
 * Lista de proibidos, escrita a mao. O teste procura cada texto (e os numeros acima) no JSON de tudo o que o
 * coletor gravou, logou ou devolveu. Cada item e um valor que so existe em local barrado da fixture.
 */
export const PROIBIDOS: readonly string[] = [
  m('TITULO'), m('AGENTE-NOME'), m('AGENTE-EMAIL@exemplo.invalido'), m('SOLICITANTE-NOME'), m('SOLICITANTE-EMAIL@exemplo.invalido'),
  m('ORIGEM'), m('URL-HTTPS'), m('TEMPO-WORKFLOW-TOTAL'),
  m('SOLICITANTES-NOME'), m('SOLICITANTES-EMAIL@exemplo.invalido'), m('SOLICITANTES-USUARIOKEY'),
  m('RAW-DESCRICAO'), m('RAW-REPORTER-NOME'), m('RAW-REPORTER-EMAIL@exemplo.invalido'), m('RAW-SEGUIDOR'), m('RAW-USUARIOKEY'),
  m('CP-ATENDENTE'), m('CP-SOLICITANTE'), m('CP-CARGO'), m('CP-BAIRRO'), m('CP-COMPLEMENTO'), m('CP-LOGIN'), m('CP-TEXTO-INFORME'),
  m('CP-DESCONHECIDO'),
  m('CPE-TEXTO-LIVRE'), m('CPE-JUSTIFICATIVA'), m('CPE-PREVISAO-TEXTO'), m('CPE-DESCONHECIDO'), m('CPE-LOGIN'),
  m('EST-IMPEDIMENTO-NOME'), m('EST-IMPEDIMENTO-USUARIOKEY'), m('EST-CHAVE-DESCONHECIDA'),
  m('COLUNA-DESCONHECIDA'),
  String(AGENTE_KEY_MARCADOR), String(SLA_R_TEMPO_MARCADOR),
];

/** Nomes de campo personalizado que nunca entram (plano §2.1, "Nunca na lista"), mais um desconhecido. */
export const NOMES_CAMPO_PROIBIDOS: readonly string[] = [
  'Acelerato - Atendente', 'Acelerato - Solicitante', 'Cargo', 'Bairro', 'Complemento do Problema',
  'USUARIO_LOGIN', 'Informe abaixo:', 'Campo Inventado Para O Teste',
];

/** Linha valida e completa (50 colunas), dentro do recorte, com marcador em todas as colunas barradas e campos de pessoa. */
export function linhaCompleta(sobrescrever: LinhaMysql = {}): LinhaMysql {
  const d = DOMINIO_FIXTURE;
  const linha: LinhaMysql = {
    ticket_key: 900000001,
    tipo_ticket_key: d.tipoTicketKey,
    tipo_ticket: d.tipoTicket,
    titulo: m('TITULO'),
    status_key: 11,
    status: d.status,
    encerrado: 0,
    categoria_key: 21,
    categoria: d.categoria,
    organizacao_key: d.organizacaoKey,
    organizacao: d.organizacao,
    equipe_key: d.equipeKey,
    equipe: d.equipe,
    agente_key: AGENTE_KEY_MARCADOR,
    agente: m('AGENTE-NOME'),
    agente_email: m('AGENTE-EMAIL@exemplo.invalido'),
    solicitante: m('SOLICITANTE-NOME'),
    solicitante_email: m('SOLICITANTE-EMAIL@exemplo.invalido'),
    prioridade: d.prioridade,
    origem: m('ORIGEM'),
    data_criacao: '2026-09-01 09:00:00',
    data_atualizacao: '2026-09-02 10:30:00',
    data_pronto: null,
    lixeira: 0,
    arquivado: 0,
    suspenso: 0,
    impedido: 0,
    tempo_vida_dias: 1,
    tempo_ciclico_dias: 0,
    url: m('URL-HTTPS'),
    sla_pa_tempo_min: 30,
    sla_pa_saldo_min: 90,
    sla_pa_prazo_min: 120,
    sla_pa_violado: 0,
    sla_pa_status: 'Realizado dentro do prazo',
    sla_r_tempo_min: SLA_R_TEMPO_MARCADOR,
    sla_r_saldo_min: 400,
    sla_r_prazo_min: 480,
    sla_r_violado: 0,
    sla_r_status: 'Em andamento dentro do prazo',
    data_primeiro_comentario: '2026-09-01 09:20:00',
    primeiro_comentario_min_uteis: 20,
    tempo_workflow_total: m('TEMPO-WORKFLOW-TOTAL'),
    solicitantes: JSON.stringify([{ nome: m('SOLICITANTES-NOME'), email: m('SOLICITANTES-EMAIL@exemplo.invalido'), usuarioKey: m('SOLICITANTES-USUARIOKEY') }]),
    campos_personalizados: JSON.stringify([
      { nome: 'Este problema já ocorreu nos últimos 90 dias?', valor: 'Sim' },
      { nome: 'Acelerato - Atendente', valor: m('CP-ATENDENTE') },
      { nome: 'Acelerato - Solicitante', valor: m('CP-SOLICITANTE') },
      { nome: 'Cargo', valor: m('CP-CARGO') },
      { nome: 'Bairro', valor: m('CP-BAIRRO') },
      { nome: 'Complemento do Problema', valor: m('CP-COMPLEMENTO') },
      { nome: 'USUARIO_LOGIN', valor: m('CP-LOGIN') },
      { nome: 'Informe abaixo:', valor: m('CP-TEXTO-INFORME') },
      { nome: 'Campo Inventado Para O Teste', valor: m('CP-DESCONHECIDO') },
    ]),
    campos_personalizados_etapa: JSON.stringify([
      { nome: 'Motivo da Escalação', tipo: 'lista', valor: 'Motivo Ficticio 1', obrigatorio: true, kanbanStatusKey: 11 },
      { nome: 'Prioridade ajustada manualmente?', tipo: 'booleano', valor: true, obrigatorio: false, kanbanStatusKey: 11 },
      { nome: 'Se a prioridade foi ajustada, justifique', tipo: 'texto', valor: m('CPE-JUSTIFICATIVA'), obrigatorio: false, kanbanStatusKey: 11 },
      { nome: 'Motivo de Encerramento', tipo: 'texto', valor: m('CPE-TEXTO-LIVRE'), obrigatorio: false, kanbanStatusKey: 12 },
      { nome: 'Previsão de retorno', tipo: 'texto', valor: m('CPE-PREVISAO-TEXTO'), obrigatorio: false, kanbanStatusKey: 13 },
      { nome: 'ACELERATO_LOGIN', tipo: 'texto', valor: m('CPE-LOGIN'), obrigatorio: false, kanbanStatusKey: 11 },
      { nome: 'Campo Inventado Para O Teste', tipo: 'texto', valor: m('CPE-DESCONHECIDO'), obrigatorio: false, kanbanStatusKey: 11 },
    ]),
    estatisticas: JSON.stringify({
      workflow: {
        etapas: [
          { etapaKey: 101, descricao: 'Aguardando atribuicao', descricaoWorkflow: 'Fluxo Ficticio', tempoSla: 600, tempoSlaHoras: 0.17, quantidadeDeVezes: 1 },
          { etapaKey: 102, descricao: 'Em diagnostico', descricaoWorkflow: 'Fluxo Ficticio', tempoSla: 7200, tempoSlaHoras: 2, quantidadeDeVezes: 2 },
        ],
      },
      impedimentos: { usuarios: [{ nome: m('EST-IMPEDIMENTO-NOME'), usuarioKey: m('EST-IMPEDIMENTO-USUARIOKEY') }] },
      chaveNova: m('EST-CHAVE-DESCONHECIDA'),
    }),
    raw: JSON.stringify({
      descricao: m('RAW-DESCRICAO'),
      reporter: { nome: m('RAW-REPORTER-NOME'), email: m('RAW-REPORTER-EMAIL@exemplo.invalido'), usuarioKey: m('RAW-USUARIOKEY') },
      seguidores: [m('RAW-SEGUIDOR')],
    }),
    sincronizado_em: '2026-09-02 10:40:00',
    estatisticas_em: '2026-09-02 10:40:00',
  };
  return { ...linha, ...sobrescrever };
}

/** Linha com uma 51a coluna desconhecida, com marcador: a allow-list deve falhar fechado (CA-1 do modelo). */
export function linhaComColunaDesconhecida(): LinhaMysql {
  return { ...linhaCompleta(), coluna_nova_do_time: m('COLUNA-DESCONHECIDA') };
}

/** Linha de outro tipo, organizacao e equipe fora das listas fechadas (CA-11 do modelo). */
export function linhaForaDoRecorte(): LinhaMysql {
  const d = DOMINIO_FIXTURE;
  return linhaCompleta({
    ticket_key: 900000002, tipo_ticket_key: d.tipoTicketKeyFora, tipo_ticket: d.tipoTicketFora,
    organizacao_key: d.organizacaoKeyFora, organizacao: d.organizacaoFora, equipe_key: d.equipeKeyFora,
  });
}
