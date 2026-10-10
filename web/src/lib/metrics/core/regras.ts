import type { Dominio, MetricaId } from '@/contracts/comum'

/**
 * Matriz de regras por métrica (M-005, `docs/architecture/regras-metricas.md`): as regras do
 * briefing como dados executáveis. Os testes de propriedade (`regras.property.test.ts`) iteram esta
 * tabela. Sem lógica de cálculo aqui. Célula que o briefing não responde vale `'pendente-usuario'`:
 * ninguém preenche por inferência.
 */
export type Pendente = 'pendente-usuario'
export type Celula<T> = T | Pendente

export type ChaveSegmentacao =
  | 'tipo'
  | 'classe-servico'
  | 'tipo-projeto'
  | 'natureza-alocacao'
  | 'objetivo'
  | 'prioridade'
  | 'nivel-resolucao'
  | 'motivo-escalacao'
  | 'motivo-encerramento'
  | 'tipo-reclassificacao'
  | 'fase-deteccao'
  | 'responsabilidade-atraso'
  | 'com-sem-bug'
  | 'sistema'
  | 'area'
  | 'coluna'
  | 'etapa'
  | 'faixa-idade'
  | 'relogio'
  | 'projeto'
  | 'iniciativa'
// Proibidas como segmentação: pessoa, responsável, equipe (equipe é só filtro; comparação entre times é proibida, 7.1).

export type GranularidadeRegra = 'story' | 'frente' | 'projeto' | 'chamado'
export type ParteComMinimo = 'percentis' | 'mediana' | 'faixa' | 'taxa' | 'referencia-percentil'

export interface RegraMetrica {
  /** 'composicao' = não calcula; só reexpõe resultados de outras métricas, em blocos por domínio. */
  readonly dominio: Dominio | 'composicao'
  /** A primeira chave é a classe estatística: percentis/taxas são calculados dentro dela, nunca entre classes. */
  readonly segmentacao: readonly ChaveSegmentacao[]
  /**
   * neutra = ordem fixa do domínio (fluxo, P1 a P5, taxonomia 4.3, domínio fechado) com desempate por id;
   * temporal = eixo de tempo (inclui aging, P2). Nos dois casos a saída não depende da ordem de entrada.
   */
  readonly ordem: 'neutra' | 'temporal'
  /** BM: card arquivado permanece no cálculo (4.2, 7.3, Q6). AC: o conceito não existe. */
  readonly incluiArquivados: Celula<boolean | 'nao-se-aplica'>
  /** 20 = abaixo de 20 itens na classe não publica as partes de `minimoSobre`; 0 = contagem/censo/retrato. */
  readonly minimo: 20 | 0
  readonly minimoSobre: readonly ParteComMinimo[]
  /** Lista só em 'composicao' (blocos separados por granularidade). */
  readonly granularidade: GranularidadeRegra | readonly GranularidadeRegra[]
  readonly refBriefing: string
  /** 'pendente-usuario' se qualquer célula for Pendente (verificado por teste, não declarado só à mão). */
  readonly status: 'ok' | Pendente
}

const PENDENTE = 'pendente-usuario' as const

/**
 * P1 (arquivado sem desfecho conta como aberto?) segue pendente para o usuário: as células afetadas
 * ficam `pendente-usuario` e a propriedade 1 as exclui nominalmente. O comportamento provisório do
 * time (sai do aberto, contado à parte) está nos testes de `regras.test.ts`, não na matriz.
 */
export const REGRAS_METRICA = {
  O1: {
    dominio: 'businessmap',
    segmentacao: ['coluna', 'tipo'],
    ordem: 'neutra',
    incluiArquivados: PENDENTE,
    minimo: 0,
    minimoSobre: [],
    granularidade: 'story',
    refBriefing: '06 O1; 4.2 colunas; 7.3 fila conta WIP',
    status: PENDENTE,
  },
  O2: {
    dominio: 'businessmap',
    segmentacao: ['tipo', 'etapa'],
    ordem: 'neutra',
    incluiArquivados: PENDENTE,
    minimo: 20,
    minimoSobre: ['referencia-percentil'],
    granularidade: 'story',
    refBriefing: '06 O2; 4.1 inicio',
    status: PENDENTE,
  },
  BLOQUEADOS: {
    dominio: 'businessmap',
    segmentacao: ['coluna', 'tipo'],
    ordem: 'neutra',
    incluiArquivados: PENDENTE,
    minimo: 0,
    minimoSobre: [],
    granularidade: 'story',
    refBriefing: '4.2 bloqueio marcado no card; 06 O1',
    status: PENDENTE,
  },
  O3: {
    dominio: 'businessmap',
    segmentacao: ['tipo'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['percentis', 'referencia-percentil'],
    granularidade: 'story',
    refBriefing: '06 O3; 4.1; 4.2',
    status: 'ok',
  },
  O4: {
    dominio: 'businessmap',
    segmentacao: ['tipo'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['faixa', 'mediana'],
    granularidade: 'story',
    refBriefing: '06 O4; 4.2 subtarefa não conta',
    status: 'ok',
  },
  O7: {
    dominio: 'businessmap',
    segmentacao: ['tipo'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 0,
    minimoSobre: [],
    granularidade: 'story',
    refBriefing: '06 O7; 4.1 entrada',
    status: 'ok',
  },
  O9: {
    dominio: 'businessmap',
    segmentacao: ['tipo', 'relogio'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['percentis', 'mediana'],
    granularidade: 'story',
    refBriefing: '06 O9; 4.1',
    status: 'ok',
  },
  O10: {
    dominio: 'businessmap',
    segmentacao: ['tipo', 'faixa-idade'],
    ordem: 'neutra',
    incluiArquivados: PENDENTE,
    minimo: 20,
    minimoSobre: ['percentis'],
    granularidade: 'story',
    refBriefing: '06 O10; 4.1 entrada/compromisso',
    status: PENDENTE,
  },
  O12: {
    dominio: 'businessmap',
    segmentacao: ['responsabilidade-atraso'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'story',
    refBriefing: '06 O12; 7.3 classificação no vencimento',
    status: 'ok',
  },
  O15: {
    dominio: 'businessmap',
    segmentacao: ['fase-deteccao'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'story',
    refBriefing: '06 O15; 4.3 bug/defeito; 4.2 janela 30 d; 7.2',
    status: 'ok',
  },
  O18: {
    dominio: 'businessmap',
    segmentacao: ['com-sem-bug', 'tipo'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'story',
    refBriefing: '06 O18; 4.2 janela 30 d',
    status: 'ok',
  },
  T1: {
    dominio: 'businessmap',
    segmentacao: ['classe-servico', 'etapa'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['percentis', 'mediana'],
    granularidade: 'story',
    refBriefing: '06 T1; Q3',
    status: 'ok',
  },
  T2: {
    dominio: 'businessmap',
    segmentacao: ['classe-servico', 'etapa'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'story',
    refBriefing: '06 T2; Q3',
    status: 'ok',
  },
  T3: {
    dominio: 'businessmap',
    segmentacao: ['natureza-alocacao'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'story',
    refBriefing: '06 T3; 4.3 natureza; P8 (UX, provisória)',
    status: 'ok',
  },
  T4: {
    dominio: 'businessmap',
    segmentacao: ['classe-servico'],
    ordem: 'temporal',
    incluiArquivados: PENDENTE,
    minimo: 20,
    minimoSobre: ['mediana', 'faixa'],
    granularidade: 'story',
    refBriefing: '06 T4; Q3',
    status: PENDENTE,
  },
  T5: {
    dominio: 'businessmap',
    segmentacao: ['sistema', 'area'],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'story',
    refBriefing: '06 T5; 4.2 janela 30 d',
    status: 'ok',
  },
  T7: {
    dominio: 'businessmap',
    segmentacao: ['projeto'],
    ordem: 'temporal',
    incluiArquivados: PENDENTE,
    minimo: 20,
    minimoSobre: ['percentis', 'referencia-percentil'],
    granularidade: 'frente',
    refBriefing: '06 T7; 02 feature = pacote; 7.3 granularidade; P2 (aging é eixo de tempo)',
    status: PENDENTE,
  },
  T9: {
    dominio: 'businessmap',
    segmentacao: ['projeto'],
    ordem: 'neutra',
    incluiArquivados: PENDENTE,
    minimo: 0,
    minimoSobre: [],
    granularidade: 'frente',
    refBriefing: '06 T9; 7.1 sem % de conclusão de tarefa',
    status: PENDENTE,
  },
  E1: {
    dominio: 'businessmap',
    segmentacao: ['tipo-projeto'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['percentis', 'mediana'],
    granularidade: 'projeto',
    refBriefing: '06 E1; Q4',
    status: 'ok',
  },
  E2: {
    dominio: 'businessmap',
    segmentacao: ['objetivo', 'natureza-alocacao'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'story',
    refBriefing: '06 E2; Q5 (Melhoria, Iniciativa, Dívida)',
    status: 'ok',
  },
  E3: {
    dominio: 'businessmap',
    segmentacao: ['iniciativa'],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 0,
    minimoSobre: [],
    granularidade: 'projeto',
    refBriefing: '06 E3',
    status: 'ok',
  },
  S1: {
    dominio: 'acelerato',
    segmentacao: ['prioridade'],
    ordem: 'temporal',
    incluiArquivados: 'nao-se-aplica',
    minimo: 20,
    minimoSobre: ['percentis', 'mediana'],
    granularidade: 'chamado',
    refBriefing: '06 S1; 3.2; Q2',
    status: 'ok',
  },
  S2: {
    dominio: 'acelerato',
    segmentacao: ['prioridade'],
    ordem: 'temporal',
    incluiArquivados: 'nao-se-aplica',
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'chamado',
    refBriefing: '06 S2; 3.2 status_sla_r; Q2',
    status: 'ok',
  },
  S3: {
    dominio: 'acelerato',
    segmentacao: ['prioridade'],
    ordem: 'temporal',
    incluiArquivados: 'nao-se-aplica',
    minimo: 0,
    minimoSobre: [],
    granularidade: 'chamado',
    refBriefing: '06 S3',
    status: 'ok',
  },
  S4: {
    dominio: 'acelerato',
    segmentacao: ['prioridade', 'nivel-resolucao'],
    ordem: 'neutra',
    incluiArquivados: 'nao-se-aplica',
    minimo: 20,
    minimoSobre: ['mediana'],
    granularidade: 'chamado',
    refBriefing: '06 S4; 7.2; Q2',
    status: 'ok',
  },
  S5: {
    dominio: 'acelerato',
    segmentacao: ['motivo-escalacao'],
    ordem: 'neutra',
    incluiArquivados: 'nao-se-aplica',
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'chamado',
    refBriefing: '06 S5; 7.3 domínio fechado',
    status: 'ok',
  },
  S6: {
    dominio: 'acelerato',
    segmentacao: ['motivo-encerramento'],
    ordem: 'neutra',
    incluiArquivados: 'nao-se-aplica',
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'chamado',
    refBriefing: '06 S6',
    status: 'ok',
  },
  S7: {
    dominio: 'acelerato',
    segmentacao: ['tipo-reclassificacao'],
    ordem: 'temporal',
    incluiArquivados: 'nao-se-aplica',
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'chamado',
    refBriefing: '06 S7 (medidos separadamente)',
    status: 'ok',
  },
  EI_FL1: {
    dominio: 'businessmap',
    segmentacao: ['tipo'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['mediana'],
    granularidade: 'story',
    refBriefing: 'T3.4; 06 EI; Q4',
    status: 'ok',
  },
  EI_FL2: {
    dominio: 'businessmap',
    segmentacao: [],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['mediana'],
    granularidade: 'frente',
    refBriefing: 'T3.4; 02',
    status: 'ok',
  },
  EI_FL3: {
    dominio: 'businessmap',
    segmentacao: ['tipo-projeto'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['mediana'],
    granularidade: 'projeto',
    refBriefing: 'T3.4; Q4',
    status: 'ok',
  },
  EI_SUST: {
    dominio: 'acelerato',
    segmentacao: ['prioridade'],
    ordem: 'temporal',
    incluiArquivados: 'nao-se-aplica',
    minimo: 20,
    minimoSobre: ['mediana'],
    granularidade: 'chamado',
    refBriefing: 'T3.4; Q2',
    status: 'ok',
  },
  VISAO_GERAL: {
    dominio: 'composicao',
    segmentacao: [],
    ordem: 'neutra',
    incluiArquivados: 'nao-se-aplica',
    minimo: 0,
    minimoSobre: [],
    granularidade: ['story', 'frente', 'projeto', 'chamado'],
    refBriefing: '3.1 da spec UX; Q1 (herda de cada métrica exposta; blocos por domínio)',
    status: 'ok',
  },
} as const satisfies Record<MetricaId, RegraMetrica>
