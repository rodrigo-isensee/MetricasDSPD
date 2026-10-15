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
      'pedido 011 T10; D-10 = A (sem prazo contratado); R-5 (qualquer motivo com fornecedor informado)',
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
  E7: {
    dominio: 'businessmap',
    segmentacao: ['sistema', 'natureza-alocacao'],
    ordem: 'neutra',
    incluiArquivados: true,
    minimo: 20,
    minimoSobre: ['taxa'],
    granularidade: 'story',
    refBriefing:
      "pedido 011 E7; D-1' = A e D-2 (peso por contagem de entregas); CA-13 (sem R$ até configurar o custo); CA-23 (naturezaDe do T3)",
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
