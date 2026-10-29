import type { Dominio, MetricaId } from '@metricas-dspd/contratos'

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
  | 'severidade'
  | 'causa-raiz'
  | 'motivo-pendencia'
  | 'sprint'
  | 'pergunta'
  | 'motivo-bloqueio'
  | 'fornecedor'
  | 'mes-do-ano'
  | 'faixa-passagens'
// Proibidas como segmentação: pessoa, responsável, equipe (equipe é só filtro; comparação entre times é proibida, 7.1).

export type GranularidadeRegra = 'story' | 'frente' | 'projeto' | 'chamado' | 'resposta'
export type ParteComMinimo = 'percentis' | 'mediana' | 'faixa' | 'taxa' | 'referencia-percentil'

export interface RegraMetrica {
  /**
   * 'composicao' = não calcula; só reexpõe resultados de outras métricas, em blocos por domínio.
   * 'pesquisa' = pesquisa trimestral de percepção (PV1): terceira fonte, sem tempo nem percentil.
   */
  readonly dominio: Dominio | 'pesquisa' | 'composicao'
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
  /**
   * Dúvidas de regra de negócio em aberto com o usuário (o que o mock assumiu); lista em
   * `docs/alinhamentos/2026-10-11-metricas-complementares-pendencias.md`. Não vazia implica status pendente.
   */
  readonly pendencias?: readonly string[]
}

/**
 * P1 (decisão definitiva de 11/10): card arquivado sem entrega NÃO conta como aberto; sai do aberto, permanece
 * na base e é contado à parte (`regras.test.ts`). Por isso as métricas de aberto/idade/bloqueio têm
 * `incluiArquivados: true` (o arquivado fica na base) e nenhuma célula pendente.
 */
export const REGRAS_METRICA = {
  O1: {
    dominio: 'businessmap',
    segmentacao: ['coluna', 'tipo'],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 0,
    minimoSobre: [],
    granularidade: 'story',
    refBriefing: '06 O1; 4.2 colunas; 7.3 fila conta WIP',
    status: 'ok',
  },
  O2: {
    dominio: 'businessmap',
    segmentacao: ['tipo', 'etapa'],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['referencia-percentil'],
    granularidade: 'story',
    refBriefing: '06 O2; 4.1 inicio',
    status: 'ok',
  },
  BLOQUEADOS: {
    dominio: 'businessmap',
    segmentacao: ['coluna', 'tipo'],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 0,
    minimoSobre: [],
    granularidade: 'story',
    refBriefing: '4.2 bloqueio marcado no card; 06 O1',
    status: 'ok',
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
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['percentis'],
    granularidade: 'story',
    refBriefing: '06 O10; 4.1 entrada/compromisso',
    status: 'ok',
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
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['mediana', 'faixa'],
    granularidade: 'story',
    refBriefing: '06 T4; Q3',
    status: 'ok',
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
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['percentis', 'referencia-percentil'],
    granularidade: 'frente',
    refBriefing: '06 T7; 02 feature = pacote; 7.3 granularidade; P2 (aging é eixo de tempo)',
    status: 'ok',
  },
  T9: {
    dominio: 'businessmap',
    segmentacao: ['projeto'],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 0,
    minimoSobre: [],
    granularidade: 'frente',
    refBriefing: '06 T9; 7.1 sem % de conclusão de tarefa',
    status: 'ok',
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
  O5: {
    dominio: 'businessmap',
    segmentacao: ['tipo'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['mediana'],
    granularidade: 'story',
    refBriefing: '06 O5; 4.1 inicio; 4.2 bloqueio',
    status: 'ok',
  },
  O6: {
    dominio: 'businessmap',
    segmentacao: ['classe-servico'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['referencia-percentil'],
    granularidade: 'story',
    refBriefing: '06 O6; mesma amostra do O3',
    status: 'ok',
  },
  O8: {
    dominio: 'businessmap',
    segmentacao: ['tipo'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['percentis', 'mediana'],
    granularidade: 'story',
    refBriefing: '06 O8; 7.2 nunca média isolada',
    status: 'ok',
  },
  O11: {
    dominio: 'businessmap',
    segmentacao: ['tipo'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 0,
    minimoSobre: [],
    granularidade: 'story',
    refBriefing: '06 O11; retrato mensal',
    status: 'ok',
  },
  O13: {
    dominio: 'businessmap',
    segmentacao: ['tipo'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'story',
    refBriefing: '06 O13; sem alvo de volume',
    status: 'ok',
  },
  O14: {
    dominio: 'businessmap',
    segmentacao: ['area', 'sistema'],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 0,
    minimoSobre: [],
    granularidade: 'story',
    refBriefing: '06 O14; nunca por pessoa',
    status: 'ok',
  },
  O16: {
    dominio: 'businessmap',
    segmentacao: ['faixa-idade', 'severidade'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 0,
    minimoSobre: [],
    granularidade: 'story',
    refBriefing: '06 O16; 4.4 origem_bug',
    status: 'ok',
  },
  O17: {
    // Decisão do usuário (2026-10-11): vem do Acelerato (campo causa raiz via Metabase), painel Sustentação.
    dominio: 'acelerato',
    segmentacao: ['causa-raiz', 'sistema'],
    ordem: 'neutra',
    incluiArquivados: 'nao-se-aplica',
    minimo: 0,
    minimoSobre: [],
    granularidade: 'chamado',
    refBriefing: '06 O17; 4.4 causa raiz',
    status: 'ok',
  },
  T6: {
    dominio: 'businessmap',
    segmentacao: ['classe-servico'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['percentis'],
    granularidade: 'story',
    refBriefing: '06 T6; T2.5 Monte Carlo',
    status: 'ok',
  },
  T8: {
    dominio: 'businessmap',
    segmentacao: [],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'story',
    refBriefing: '06 T8; 7.2 sem alvo de 100%',
    status: 'ok',
  },
  O19: {
    dominio: 'businessmap',
    segmentacao: ['motivo-bloqueio'],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['percentis', 'taxa'],
    granularidade: 'story',
    refBriefing:
      'pedido 011 O19; bloqueio encerrado no período; o n da taxa é o número de bloqueios (R6)',
    status: 'ok',
  },
  T10: {
    dominio: 'businessmap',
    segmentacao: ['fornecedor'],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['percentis'],
    granularidade: 'story',
    refBriefing:
      'pedido 011 T10; D-10 = A (sem prazo contratado); R-5 (qualquer motivo com fornecedor informado); B11-001 = sim: fornecedor agrupado pelo nome normalizado (caixa e espaços), exibido pela grafia mais frequente',
    status: 'ok',
  },
  O20: {
    dominio: 'businessmap',
    segmentacao: [],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 0,
    minimoSobre: [],
    granularidade: 'story',
    refBriefing:
      'pedido 011 O20; varredura +1/-1 por coluna do O1 (B8); faixa por coluna (uma equipe) ou por papel (R5); contagem diaria, sem estatistica',
    status: 'ok',
  },
  O21: {
    dominio: 'businessmap',
    segmentacao: ['tipo'],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa', 'percentis'],
    granularidade: 'story',
    refBriefing:
      'pedido 011 O21; transicoes de retorno ate a conclusao; ciclo do O3 (entreguesDe); par com x sem so dentro do tipo, 20 em cada grupo (regra 7, CA-6); matriz por coluna (uma equipe) ou por papel (R5)',
    status: 'ok',
  },
  O24: {
    dominio: 'businessmap',
    segmentacao: ['tipo'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa', 'percentis'],
    granularidade: 'story',
    refBriefing:
      "pedido 011 O24; D-6' = A (fila de cada equipe, só classe Padrão, mesmo tipo; Urgente, Prazo fixo e Intangível fora, CA-17); R-1 = A (espera do ultrapassado, do início do primeiro que passou na frente até o próprio início, CA-37); P50/P85 por tipo (regra 7)",
    status: 'ok',
  },
  O22: {
    dominio: 'businessmap',
    segmentacao: ['tipo'],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['percentis'],
    granularidade: 'story',
    refBriefing:
      "pedido 011 O22; D-9' (só o primeiro comentário humano, CA-43); dias úteis da criação ao primeiro toque, P50/P85/P95 e histograma por tipo na janela de 12 semanas (regra 7); sem toque é retrato de hoje; mock: extensão primeiroToque (instante, sem autor nem texto)",
    status: 'ok',
  },
  O25: {
    dominio: 'businessmap',
    segmentacao: ['tipo'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa', 'percentis'],
    granularidade: 'story',
    refBriefing:
      "pedido 011 O25; R-2' = A (descartado = estado nativo discarded ou excluído, instante discarded_at; motivo sem descarte vira aviso); P-1 = A; D-13 (tempo consumido do início ao descarte; antes do início à parte); motivos de descarte = A (porMotivo nulo até ler /discardReasons, CA-44)",
    status: 'ok',
  },
  O26: {
    dominio: 'businessmap',
    segmentacao: ['tipo', 'faixa-passagens'],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['percentis', 'taxa'],
    granularidade: 'story',
    refBriefing:
      "pedido 011 O26; D-5' = B (troca = alguém sai e outro entra, ou o conjunto é substituído; incluir co-responsável não conta, CA-38); Q-a = 1 passagem (uma por revisão) e Q-b = conta (com o card sem responsável no meio compara com o último conjunto não vazio), decididas em 2026-10-16; só o inteiro passagens chega à biblioteca (ADR 0020); histograma sempre, percentual e P85 do ciclo por faixa com 20 ou mais",
    status: 'ok',
  },
  T11: {
    dominio: 'businessmap',
    segmentacao: ['mes-do-ano'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 0,
    minimoSobre: [],
    granularidade: 'story',
    refBriefing:
      'pedido 011 T11; contagem de demandas criadas por mês (censo, sem percentil), janela fixa de 24 meses fechados mais o corrente, fora do período do filtro (CA-12); mock: série própria da extensão (P-T3 = a)',
    status: 'ok',
  },
  T12: {
    dominio: 'businessmap',
    segmentacao: ['area'],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'story',
    refBriefing:
      'pedido 011 T12; D-8 = A (ida e volta = bloqueio por falta de informação antes do início, ou retorno compromisso -> backlog); área solicitante, nunca equipe',
    status: 'ok',
  },
  T13: {
    dominio: 'businessmap',
    segmentacao: ['tipo'],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa', 'percentis'],
    granularidade: 'story',
    refBriefing:
      "pedido 011 T13; D-14' = A (só vínculo predecessor com card de outro quadro, CA-40; pai/filho fora, CA-21) e R-4 = sim (vigente em algum momento antes da entrega); granularidade story ou frente, um bloco cada (CA-8); quadro desconhecido vai para semDado; par com x sem do lead time do T1, por tipo e com 20 em cada grupo (CA-6); só o booleano, nunca o quadro nem a equipe do outro lado",
    status: 'ok',
  },
  T14: {
    dominio: 'businessmap',
    segmentacao: [],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'story',
    refBriefing:
      'pedido 011 T14; Q-T14-1 = B (campo "Time responsável" do card), Q-T14-5 = D (projetos ligados a sistema do meu time, mesmo com 0%, mais os com 1 ou mais card do meu time), Q-T14-9 = A (usuário, provisória até confirmar a cardinalidade do campo), Q-T14-10 = B (decidida pelo usuário: cadastro de membros por time; no mock, simulado, na fase 3 vem da configuração) e T14-M1 = B (com outros times oculto, só a fatia do meu time, sem total nem n; K-130), Q-T14-6 = A revista pela R-1 = B (outros times é um inteiro só, sem nome, tempo, vazão nem ranking, e fica oculto quando somar menos de 2 pessoas); o filtro de equipe só diz qual é "meu time" e não recorta a população; exige exatamente uma equipe (CA-28); ordem dos visíveis pelo total de cards (CA-30) e, depois deles, os ocultos por código (Q-T14-12 = B, decidida pelo usuário em 2026-10-28); total do bloco e base só dos visíveis; percentual só com 20 ou mais cards com time informado (CA-31)',
    status: 'pendente-usuario',
    pendencias: [
      'Cardinalidade do campo "Time responsável" (escolha única ou múltipla) e nome exato, a confirmar na integração (Q-T14-1 = B); vale a Q-T14-9 = A (usuário) até lá',
      'Q-T14-2: nível de card contado (demanda por padrão, frente por seletor), suposição do time',
      'Q-T14-3: entram os cards não descartados, abertos e entregues, suposição do time',
      'Q-T14-4: o projeto inteiro, com o período escolhendo quais projetos aparecem; "em andamento no período" = iniciado até o fim do período e não concluído antes do início (CA-27), então o projeto ainda não iniciado fica fora mesmo com cards do meu time; suposição do time',
      'Q-T14-7: card sem time entra no total e fica fora do denominador do percentual, suposição do time',
      'Q-T14-8: vale o time na entrega (para o aberto, o atual), suposição do time',
      'Q-T14-11: na regra de 2 pessoas contam os membros cadastrados das equipes que têm card no projeto e na granularidade (o lado que oculta mais), suposição do desenho 048',
      'Membro cadastrado em mais de um time (parecer 048-t14-ameacas, pergunta 2): no mock cada membro simulado fica num time só e a fase 3 conta ids distintos, suposição do desenho 048',
    ],
  },
  E4: {
    dominio: 'businessmap',
    segmentacao: ['tipo-projeto'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 0,
    minimoSobre: [],
    granularidade: 'projeto',
    refBriefing: '06 E4',
    status: 'ok',
  },
  E5: {
    dominio: 'businessmap',
    segmentacao: [],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['percentis'],
    granularidade: 'frente',
    refBriefing: '06 E5; T2.5 Monte Carlo; T9',
    status: 'ok',
  },
  E6: {
    dominio: 'businessmap',
    segmentacao: [],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa', 'percentis'],
    granularidade: 'projeto',
    refBriefing:
      'pedido 011 E6; D-7 (vale a data registrada no compromisso; tolerância zero), CA-20; deslize em dias úteis com sinal; percentual e P50/P85 do deslize só com 20 ou mais projetos (os pontos saem sempre); mock: extensão datasProjeto, com poucos projetos de propósito (variante lenta)',
    status: 'ok',
  },
  E7: {
    dominio: 'businessmap',
    segmentacao: ['sistema', 'natureza-alocacao'],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'story',
    refBriefing:
      'pedido 011 E7; D2 = A (2026-10-17, pedido 024): participação percentual de cada sistema pelas entregas do período, sem R$ (revê a D-1\' e a Q-E7-1); D-2 (peso por contagem de entregas); percentual só para sistema com 20 ou mais entregas, abaixo disso "k de n"; CA-23 (naturezaDe do T3)',
    status: 'ok',
  },
  E8: {
    dominio: 'businessmap',
    segmentacao: [],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 0,
    minimoSobre: [],
    granularidade: 'story',
    refBriefing:
      'pedido 011 E8; D-3 = A (janela de 12 meses); R-1 = B (só a contagem de sistemas por faixa, sem nome de sistema nem de pessoa); recorte de menos de 5 sistemas não abre as faixas (CA-10); a faixa por sistema vem do agregado (ADR 0020), censo sem percentil',
    status: 'ok',
  },
  E9: {
    dominio: 'businessmap',
    segmentacao: ['tipo-projeto'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['referencia-percentil'],
    granularidade: 'projeto',
    refBriefing:
      'pedido 011 E9; R-6 (criado_em = aprovação); referência P85 por tipo de projeto (regra 7, Q4) importada do E1',
    status: 'ok',
  },
  S8: {
    dominio: 'acelerato',
    segmentacao: ['prioridade'],
    ordem: 'temporal',
    incluiArquivados: 'nao-se-aplica',
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'chamado',
    refBriefing: '06 S8; T4.2',
    status: 'ok',
  },
  S9: {
    dominio: 'acelerato',
    segmentacao: ['motivo-pendencia'],
    ordem: 'neutra',
    incluiArquivados: 'nao-se-aplica',
    minimo: 20,
    minimoSobre: ['percentis'],
    granularidade: 'chamado',
    refBriefing: '06 S9',
    status: 'ok',
  },
  S10: {
    dominio: 'acelerato',
    segmentacao: ['prioridade'],
    ordem: 'temporal',
    incluiArquivados: 'nao-se-aplica',
    minimo: 20,
    minimoSobre: ['percentis', 'taxa'],
    granularidade: 'chamado',
    refBriefing: '06 S10',
    status: 'ok',
  },
  S11: {
    dominio: 'acelerato',
    segmentacao: ['prioridade'],
    ordem: 'neutra',
    incluiArquivados: 'nao-se-aplica',
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'chamado',
    refBriefing: '06 S11',
    status: 'ok',
  },
  S12: {
    dominio: 'acelerato',
    segmentacao: ['sistema'],
    ordem: 'neutra',
    incluiArquivados: 'nao-se-aplica',
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'chamado',
    refBriefing: '06 S12',
    status: 'ok',
  },
  PV1: {
    dominio: 'pesquisa',
    segmentacao: ['pergunta', 'area'],
    ordem: 'neutra',
    incluiArquivados: 'nao-se-aplica',
    // O mínimo de 20 vale para o percentual (abaixo, só "k de n"). Os mínimos de publicação da pesquisa
    // (5 no consolidado, 3 por área) estão em `MINIMOS_PESQUISA` (contratos) e são aplicados na biblioteca.
    minimo: 20,
    minimoSobre: ['faixa', 'taxa'],
    granularidade: 'resposta',
    refBriefing:
      'Sustentação (lacuna de valor, não especificada no briefing); 4.2 mínimo de 20; T2.6; plano lacuna-de-valor',
    status: 'ok',
  },
  TENDENCIA_FLUXO: {
    // Cada ponto é o O3 (por tipo) no último dia do mês; a classe estatística continua sendo o tipo.
    dominio: 'businessmap',
    segmentacao: ['tipo'],
    ordem: 'temporal',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['percentis'],
    granularidade: 'story',
    refBriefing: 'ADR 0019; plano sustentacao-no-operacional (O3 e O4 por mês)',
    status: 'ok',
  },
  TENDENCIA_SUST: {
    // Cada ponto é o S2 (por prioridade) no último dia do mês; o volume é a contagem de abertos (base do S3).
    dominio: 'acelerato',
    segmentacao: ['prioridade'],
    ordem: 'temporal',
    incluiArquivados: 'nao-se-aplica',
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'chamado',
    refBriefing: 'ADR 0019; plano sustentacao-no-operacional (S2 e S3 por mês)',
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
