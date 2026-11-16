import { diaDeIso } from './calendario'
import {
  METRICA_IDS,
  fonteDaMetrica,
  type Intervalo,
  type MarcacaoCriterio,
  type MetricaId,
  type VersaoCriterio,
} from '@metricas-dspd/contratos'

export type { VersaoCriterio }

/**
 * O23 (estoque parado dentro do WIP, bloco do O2): limite em dias úteis, em constante única (A8).
 * Mudar o valor é mudar esta constante e registrar nova VersaoCriterio no mesmo commit (T2.6).
 */
export const LIMITE_PARADO_DIAS_UTEIS = 5

/** v1 do limite do O23: registro do critério que as bases (mock e real) incluem na sua lista de versões. */
export const VERSAO_CRITERIO_PARADOS_V1: VersaoCriterio = {
  id: 'criterio-2026-10-14-parados-v1',
  data: '2026-10-14',
  descricao: 'Estoque parado do O2: item sem mudar de coluna há mais de 5 dias úteis (v1)',
  afeta: ['O2'],
}

/**
 * Ids nascidas depois de 2026-10-15 (data da versão do descarte nativo): não entram no `afeta` dela nem no da versão
 * "excluído entregue" (a lista vale para as duas, que compartilham `METRICAS_DO_DESCARTE_NATIVO`), mesmo sendo do
 * BusinessMap. Quem criar uma métrica nova a lista aqui, nominalmente.
 * T11 (B11b): conta demandas criadas por mês, não usa `descartado()` nem o `ativo` do descarte.
 * Fase 2 do pedido 011 (O22, O26, T13, T14, E6 e E8): nasceram com o descarte nativo já vigente (nunca existiram com o
 * critério anterior), então nenhuma marcação de "mudou o critério" faz sentido nelas.
 */
export const NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO: readonly MetricaId[] = [
  'T11',
  'O22',
  'O26',
  'T13',
  'T14',
  'E6',
  'E8',
]

/** `afeta` do descarte nativo, derivado do catálogo: toda métrica de fonte BusinessMap, menos as nascidas depois. */
const METRICAS_DO_DESCARTE_NATIVO: MetricaId[] = METRICA_IDS.filter(
  (id) => fonteDaMetrica(id) === 'businessmap' && !NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO.includes(id),
)

/**
 * P-1 = A (pedido 011): "descartado" passa a ser o estado nativo `discarded` do BusinessMap ou o card excluído, em todas
 * as métricas. Card com motivo de descarte preenchido e sem descarte deixa de sair dos cálculos e vira aviso no O25.
 */
export const VERSAO_CRITERIO_DESCARTE_NATIVO: VersaoCriterio = {
  id: 'criterio-2026-10-15-descarte-nativo',
  data: '2026-10-15',
  descricao:
    'Descartado passou a ser o estado nativo do BusinessMap (descartado ou excluído); motivo preenchido sem descarte não sai mais dos cálculos',
  afeta: METRICAS_DO_DESCARTE_NATIVO,
}

/**
 * O25(b) = B (pedido 011, 2026-10-16): card entregue e excluído depois deixa de ser descarte e continua como entrega na
 * vazão e no ciclo. Mesma abrangência do descarte nativo (todas as métricas de fonte BusinessMap).
 */
export const VERSAO_CRITERIO_EXCLUIDO_ENTREGUE: VersaoCriterio = {
  id: 'criterio-2026-10-16-excluido-entregue',
  data: '2026-10-16',
  descricao:
    'Card entregue e depois excluído deixou de contar como descarte: segue como entrega na vazão e no ciclo',
  afeta: METRICAS_DO_DESCARTE_NATIVO,
}

/** O19-pct = B (pedido 011, 2026-10-16): o percentual de cada causa passa a ser sobre os dias úteis bloqueados. */
export const VERSAO_CRITERIO_O19_PCT_DIAS: VersaoCriterio = {
  id: 'criterio-2026-10-16-o19-pct-em-dias-uteis',
  data: '2026-10-16',
  descricao:
    'Percentual de cada causa de bloqueio passou a ser sobre os dias úteis bloqueados (antes, sobre o número de bloqueios); mínimo de 20 segue sobre os bloqueios da causa',
  afeta: ['O19'],
}

/** O20-destaque = A (pedido 011, 2026-10-16): o destaque do fluxo cumulativo não considera mais o Backlog. */
export const VERSAO_CRITERIO_O20_DESTAQUE_V2: VersaoCriterio = {
  id: 'criterio-2026-10-16-o20-destaque-sem-backlog',
  data: '2026-10-16',
  descricao:
    'Destaque do fluxo cumulativo considera só as filas a partir do compromisso (sem o Backlog)',
  afeta: ['O20'],
}

/** B11-001 = sim (pedido 011, 2026-10-17): o fornecedor do T10 é agrupado pelo nome normalizado (caixa e espaços). */
export const VERSAO_CRITERIO_T10_FORNECEDOR_NORMALIZADO: VersaoCriterio = {
  id: 'criterio-2026-10-17-t10-fornecedor-normalizado',
  data: '2026-10-17',
  descricao:
    'Fornecedor agrupado sem diferença de maiúsculas, minúsculas e espaços; exibe a grafia mais frequente',
  afeta: ['T10'],
}

/** E7.77 = A (pedido 105, decisão do dono de 2026-11-16): o T10 publica o tempo total esperando fornecedores (motivo "Aguardando fornecedor"), sem separar por fornecedor; substitui a P-075-11 "B". */
export const VERSAO_CRITERIO_T10_TEMPO_TOTAL_FORNECEDOR: VersaoCriterio = {
  id: 'criterio-2026-11-16-t10-tempo-total-fornecedor',
  data: '2026-11-16',
  descricao:
    'T10 passou a ter dado real: tempo total dos bloqueios encerrados com o motivo Aguardando fornecedor, sem separar por fornecedor',
  afeta: ['T10'],
}

/**
 * D2 = A (pedido 011, decisão de 2026-10-17; pedido 024): o E7 deixou de trazer custo em R$ e passou a mostrar só a
 * participação percentual de cada sistema pelas entregas do período. Revê a D-1' e a Q-E7-1.
 */
export const VERSAO_CRITERIO_E7_SEM_REAIS: VersaoCriterio = {
  id: 'criterio-2026-10-17-e7-sem-reais',
  data: '2026-10-17',
  descricao:
    'Capacidade por sistema passou a mostrar só a participação percentual nas entregas do período, sem custo em R$',
  afeta: ['E7'],
}

/** Pedido 065 (K-205): a parte de bloqueio do O1 e do O2 e o O5 inteiro saíram como "Sem dado real" na base real (antes saía zero). */
export const VERSAO_CRITERIO_BLOQUEIO_SEM_DADO_REAL: VersaoCriterio = {
  id: 'criterio-2026-11-04-bloqueio-sem-dado-real',
  data: '2026-11-04',
  descricao:
    'Na base real, a parte de bloqueio do O1 e do O2 e o O5 inteiro passaram a sair como "Sem dado real" (antes saía zero): a coleta ainda não grava os bloqueios',
  afeta: ['O1', 'O2', 'O5'],
}

/**
 * Pedido 075, lote 6b: data da primeira coleta real do BusinessMap (primeiro `coletado_em` de `stg_card`), da consulta do dono
 * (Histórico de 2026-11-10 22:10) e da versão de critério (2026-11-10 22:39). Ponto único: o id, a versão e o corte da série do
 * O1 derivam desta constante.
 */
export const DATA_BLOQUEIO_COM_DADO_REAL = '2026-11-01'

/** Pedido 075 (K-204, via A): bloqueio volta com dado real, derivado da comparação entre coletas; histórico parcial (P-075-6). */
export const VERSAO_CRITERIO_BLOQUEIO_COM_DADO_REAL: VersaoCriterio = {
  id: `criterio-${DATA_BLOQUEIO_COM_DADO_REAL}-bloqueio-com-dado-real`,
  data: DATA_BLOQUEIO_COM_DADO_REAL,
  descricao: `histórico parcial de bloqueios: só há dado a partir de ${DATA_BLOQUEIO_COM_DADO_REAL} (primeira coleta); antes disso o tempo bloqueado é desconhecido. Início e fim do bloqueio são o instante da coleta que viu a mudança, não o instante real`,
  afeta: ['O1', 'O2', 'O5', 'O19', 'BLOQUEADOS'],
}

/** Pedido 077 (L5, K-211): a tendência do fluxo passou de "Sem dado real" para o dado real do BusinessMap (data do PR; a do merge corrige se escorregar). */
export const VERSAO_CRITERIO_TENDENCIA_FLUXO_DADO_REAL: VersaoCriterio = {
  id: 'criterio-2026-11-10-tendencia-fluxo-dado-real',
  data: '2026-11-10',
  descricao:
    'A tendência mensal do fluxo passou a ser calculada com o dado real do BusinessMap (antes saía como "Sem dado real")',
  afeta: ['TENDENCIA_FLUXO'],
}

/** Pedido 077 (L7, K-211): a tendência da sustentação passou de "Sem dado real" para o dado real do Acelerato (data do PR; a do merge corrige se escorregar). */
export const VERSAO_CRITERIO_TENDENCIA_SUST_DADO_REAL: VersaoCriterio = {
  id: 'criterio-2026-11-10-tendencia-sust-dado-real',
  data: '2026-11-10',
  descricao:
    'A tendência mensal da sustentação passou a ser calculada com o dado real do Acelerato (antes saía como "Sem dado real")',
  afeta: ['TENDENCIA_SUST'],
}

/** Pedido 099 (E3.20, B' da Q-099-7): o O17 passou de "Sem dado real" inteiro para dado real por sistema; a causa raiz segue sem dado real. */
export const VERSAO_CRITERIO_O17_POR_SISTEMA_DADO_REAL: VersaoCriterio = {
  id: 'criterio-2026-11-12-o17-por-sistema-dado-real',
  data: '2026-11-12',
  descricao:
    'Os defeitos por sistema passaram a ser calculados com o dado real do Acelerato (antes o cartão saía inteiro como "Sem dado real"); a causa raiz segue "sem dado real" até o Registro de Problemas com vínculo ao incidente',
  afeta: ['O17'],
}

/** Pedido 099 (A4, Q-099-4): o O8 passou de "Sem dado real" inteiro para o tempo em execução real; a divisão por tamanho segue sem dado real até o campo do WS1. */
export const VERSAO_CRITERIO_O8_TEMPO_REAL: VersaoCriterio = {
  id: 'criterio-2026-11-14-o8-tempo-real',
  data: '2026-11-14',
  descricao:
    'O tempo em execução das demandas passou a ser calculado com o dado real do BusinessMap (antes o cartão saía inteiro como "Sem dado real"); a divisão por tamanho segue "sem dado real" até o campo de tamanho no quadro (WS1)',
  afeta: ['O8'],
}

/** Pedido 099 (D9): o S12 entrou no mapa real só com o volume; a exceção de SLA por registro posterior sai nula (sem fonte), antes ficava no mock. */
export const VERSAO_CRITERIO_S12_VOLUME_REAL: VersaoCriterio = {
  id: 'criterio-2026-11-12-s12-volume-real',
  data: '2026-11-12',
  descricao:
    'O volume por sistema passou a ser calculado com o dado real do Acelerato; a exceção de SLA por registro posterior e a reincidência saem sem fonte (nulas, nunca 0%) até a coleta trazer os campos',
  afeta: ['S12'],
}

/**
 * Pedido 099 (O12, Q-099-10 = B, Q-099-23 = AAA, Q-099-4 = A): a data acordada é o prazo nativo (`deadline`) do card, convertido ao dia civil de Brasília
 * (Q-RO-6c, L13 opção c do dono de 2026-11-15: meia-noite UTC em ponto fica no dia gravado); a Visão geral entra porque o alerta de vencidos internos deixa de ser gerado sem o campo de
 * responsabilidade. Data do PR (a do merge corrige se escorregar): o dono confirma a da primeira projeção real com o prazo.
 */
export const VERSAO_CRITERIO_O12_PRAZO_DO_CARD: VersaoCriterio = {
  id: 'criterio-2026-11-14-o12-prazo-do-card',
  data: '2026-11-14',
  descricao:
    'O12 usa como data acordada o prazo nativo (deadline) do card do BusinessMap, que pode mudar depois do compromisso; o prazo com hora vira o dia de Brasília; a responsabilidade do atraso segue sem dado real',
  afeta: ['O12', 'VISAO_GERAL'],
}

/**
 * Pedido 099 (D5a): a S9 passa a ler as esperas reais do Acelerato como pendência e a S1 as desconta do relógio. Decisão do dono (Q-099-8
 * revista e Q-099-21): Aguardando Solicitante, Suporte Terceiros, Fornecedor e Janela de Mudança contam; `Pendente` sem motivo é
 * "Não classificado". Equipe Interna, Aprovação, Mudança e Data Acordada ficam fora até o dono decidir.
 */
export const VERSAO_CRITERIO_S1_S9_ESPERAS_PENDENCIA: VersaoCriterio = {
  id: 'criterio-2026-11-14-s1-s9-esperas-pendencia',
  data: '2026-11-14',
  descricao:
    'As esperas Aguardando Solicitante, Suporte Terceiros, Fornecedor e Janela de Mudança contam como pendência no tempo em pendência (S9) e saem do relógio de resolução da S1; Pendente sem motivo é "Não classificado"; Equipe Interna, Aprovação, Mudança e Data Acordada ficam fora até decisão do dono',
  afeta: ['S1', 'S9'],
}

/**
 * Pedido 099 (D4, Q-099-5b = A): o S1 entrou no mapa real. O primeiro atendimento passa a ser o primeiro comentário da tabela do Acelerato
 * (inclui resposta automática) e a restauração segue `data_pronto`; antes o S1 não tinha dado real publicado.
 */
export const VERSAO_CRITERIO_S1_DADO_REAL: VersaoCriterio = {
  id: 'criterio-2026-11-15-s1-dado-real',
  data: '2026-11-15',
  descricao:
    'O S1 passou a ser calculado com o dado real do Acelerato: o primeiro atendimento é o primeiro comentário do chamado (inclui resposta automática) e a restauração vai até a data de pronto',
  afeta: ['S1'],
}

/**
 * Pedido 105 (E7.5, decisão do dono de 2026-11-15): o O15 passou de "Sem dado real" para dado real. A fase de detecção do bug é a coluna em que
 * estava o card da demanda (o pai do bug, vínculo parent e child) quando o bug foi criado, pela tabela coluna para fase aprovada (`fase_deteccao_coluna`);
 * só entram os bugs com pai na base. Data do PR (a do merge corrige se escorregar): o dono confirma a da primeira projeção com a tabela.
 */
export const VERSAO_CRITERIO_O15_FASE_DADO_REAL: VersaoCriterio = {
  id: 'criterio-2026-11-15-o15-fase-dado-real',
  data: '2026-11-15',
  descricao:
    'O15 passou a ser calculado com a fase em que o bug foi encontrado: a coluna do card da demanda (pai do bug) na abertura do bug, pela tabela coluna para fase aprovada; só entram os bugs com pai na base, com a nota de quantos ficaram fora; cada fase só publica a contagem com 20 bugs ou mais',
  afeta: ['O15'],
}

/**
 * Pedido 105 (D2): o campo "Prioridade ajustada manualmente?" passa a alimentar o S3 (`ajustesManuais`) e o S7; só "Sim" conta, e a coleta não
 * separa "Não" de campo vazio. Antes o S3 publicava `ajustesManuais: null` e o S7 não tinha dado real.
 */
export const VERSAO_CRITERIO_AJUSTE_PRIORIDADE_DADO_REAL: VersaoCriterio = {
  id: 'criterio-2026-11-15-ajuste-prioridade-dado-real',
  data: '2026-11-15',
  descricao:
    'O ajuste manual de prioridade passou a vir do campo "Prioridade ajustada manualmente?" do Acelerato (só "Sim" conta; "Não" e campo vazio não se separam), no S3 e no S7',
  afeta: ['S3', 'S7'],
}

/**
 * Pedido 105 (D2, P1 a P3 do dono): S5, S6 e S7 passam a ter dado real, só dos cinco fluxos do PROC; os motivos gravados entram por de-para só
 * dos pares óbvios (caixa e vírgula) e o preenchido sem par vira a faixa "Outro", separada de "Não informado".
 */
export const VERSAO_CRITERIO_MOTIVOS_PROC_DADO_REAL: VersaoCriterio = {
  id: 'criterio-2026-11-15-motivos-proc-dado-real',
  data: '2026-11-15',
  descricao:
    'S5, S6 e S7 passaram a ser calculados com o dado real do Acelerato, só dos cinco fluxos do PROC; motivo sem par no domínio vira "Outro", separado de "Não informado"',
  afeta: ['S5', 'S6', 'S7'],
}

/**
 * Pedido 105 (E7.4, O18 = c do dono, 2026-11-15): o bug é da entrega quando ligado a ela no BusinessMap por vínculo pai e filho ou relacionado;
 * vínculo de bug com bug não liga a entrega; a janela de 30 dias da entrega (briefing 4.2) segue. O bug conta pelo tipo, sem exigir fase de detecção.
 * Data do PR (a do merge corrige se escorregar).
 */
export const VERSAO_CRITERIO_O18_VINCULOS: VersaoCriterio = {
  id: 'criterio-2026-11-15-o18-vinculos',
  data: '2026-11-15',
  descricao:
    'O18 passou a ser calculado com o dado real do BusinessMap: o bug é da entrega quando ligado a ela por vínculo pai e filho ou relacionado, até 30 dias após a entrega; vínculo de bug com bug não liga a uma entrega',
  afeta: ['O18'],
}

/**
 * Pedido 105 (E7.68, D-T9 "T9 A", decisão do dono de 2026-11-16): o T9 passou de "Sem dado real" para dado real. Frente adicionada depois do início
 * é a frente criada depois do início do projeto; a frente criada antes e ligada depois conta como original (a base não guarda o instante do vínculo).
 * Data do PR (a do merge corrige se escorregar).
 */
export const VERSAO_CRITERIO_T9_ESCOPO_CRIADO_EM: VersaoCriterio = {
  id: 'criterio-2026-11-16-t9-escopo-criado-em',
  data: '2026-11-16',
  descricao:
    'T9 passou a ser calculado com o dado real do BusinessMap: o avanço é frentes concluídas sobre o total das filhas; frente adicionada depois do início é a criada depois do início do projeto (a criada antes e ligada depois conta como original); projeto sem início fica fora, com a contagem',
  afeta: ['T9'],
}

/**
 * Pedido 105 (E7.64, D-T11 "A" do dono, 2026-11-16): o T11 passa a ler `dim_card` (história real, 25 meses) em vez da série da extensão;
 * a demanda criada é a story que não é Bug interno (a chegada do T4 e do O7): arquivados entram; excluídos e subtarefas ficam fora; abaixo de 20 demandas não se publica.
 * Data do PR (a do merge corrige se escorregar).
 */
export const VERSAO_CRITERIO_T11_DADO_REAL: VersaoCriterio = {
  id: 'criterio-2026-11-16-t11-dado-real',
  data: '2026-11-16',
  descricao:
    'T11 passou a ser calculado com o dado real do BusinessMap: demandas criadas por mês (story que não é Bug interno; as arquivadas entram, as excluídas e as subtarefas ficam fora), sem publicar com menos de 20 demandas',
  afeta: ['T11'],
}

/** Versões de critério que pertencem à biblioteca (constantes únicas); somam-se às da base, sem repetir id. */
export const VERSOES_DA_BIBLIOTECA: readonly VersaoCriterio[] = [
  VERSAO_CRITERIO_PARADOS_V1,
  VERSAO_CRITERIO_DESCARTE_NATIVO,
  VERSAO_CRITERIO_EXCLUIDO_ENTREGUE,
  VERSAO_CRITERIO_O19_PCT_DIAS,
  VERSAO_CRITERIO_O20_DESTAQUE_V2,
  VERSAO_CRITERIO_T10_FORNECEDOR_NORMALIZADO,
  VERSAO_CRITERIO_T10_TEMPO_TOTAL_FORNECEDOR,
  VERSAO_CRITERIO_E7_SEM_REAIS,
  VERSAO_CRITERIO_BLOQUEIO_SEM_DADO_REAL,
  VERSAO_CRITERIO_BLOQUEIO_COM_DADO_REAL,
  VERSAO_CRITERIO_TENDENCIA_FLUXO_DADO_REAL,
  VERSAO_CRITERIO_TENDENCIA_SUST_DADO_REAL,
  VERSAO_CRITERIO_O17_POR_SISTEMA_DADO_REAL,
  VERSAO_CRITERIO_O8_TEMPO_REAL,
  VERSAO_CRITERIO_S12_VOLUME_REAL,
  VERSAO_CRITERIO_O12_PRAZO_DO_CARD,
  VERSAO_CRITERIO_S1_S9_ESPERAS_PENDENCIA,
  VERSAO_CRITERIO_S1_DADO_REAL,
  VERSAO_CRITERIO_O15_FASE_DADO_REAL,
  VERSAO_CRITERIO_AJUSTE_PRIORIDADE_DADO_REAL,
  VERSAO_CRITERIO_MOTIVOS_PROC_DADO_REAL,
  VERSAO_CRITERIO_O18_VINCULOS,
  VERSAO_CRITERIO_T9_ESCOPO_CRIADO_EM,
  VERSAO_CRITERIO_T11_DADO_REAL,
]

/**
 * P-077-3: a tendência herda as marcações de critério das métricas de origem (tabela única; ADR 0019: O3/O4 no fluxo,
 * S2/S3 na sustentação). Métrica fora da tabela só vale por si.
 */
export const ORIGEM_DA_TENDENCIA: Readonly<Partial<Record<MetricaId, readonly MetricaId[]>>> = {
  TENDENCIA_FLUXO: ['O3', 'O4'],
  TENDENCIA_SUST: ['S2', 'S3'],
}

/**
 * Mudanças de critério de cálculo (T2.6). A lista vive na configuração da base; aqui só se
 * decide quais cruzam um período. Percentil tipo 7 e janela de 12 semanas são o critério v1.
 */
export function marcacoesNoPeriodo(
  metrica: MetricaId,
  periodo: Intervalo,
  versoes: readonly VersaoCriterio[],
): MarcacaoCriterio[] {
  const a = diaDeIso(periodo.inicio)
  const b = diaDeIso(periodo.fim)
  const todas = [
    ...versoes,
    ...VERSOES_DA_BIBLIOTECA.filter((l) => !versoes.some((v) => v.id === l.id)),
  ]
  const alvos: readonly MetricaId[] = [metrica, ...(ORIGEM_DA_TENDENCIA[metrica] ?? [])]
  return todas
    .filter((v) => v.afeta.some((m) => alvos.includes(m)))
    .filter((v) => {
      const d = diaDeIso(v.data)
      return d > a && d <= b
    })
    .map(({ id, data, descricao }) => ({ id, data, descricao }))
    .sort((x, y) => x.data.localeCompare(y.data))
}

export function criteriosDe(
  metrica: MetricaId,
  serie: Intervalo,
  janela: Intervalo,
  versoes: readonly VersaoCriterio[],
) {
  return {
    serie: marcacoesNoPeriodo(metrica, serie, versoes),
    janela: marcacoesNoPeriodo(metrica, janela, versoes),
  }
}
