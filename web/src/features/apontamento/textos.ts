import type { TextoNota } from '@/components/ui'
import { fmtMes, fmtNumero } from '@/lib/formatar'
import type { FaixaDiario, FiltroQualidade, FlagQualidade, NivelMatriz } from './types'

/**
 * Textos da aba (docs/ux/059-aba-apontamento-textos.md, E2.9). Sem número escrito à mão: valores entram
 * pelos parâmetros. Nenhum texto cita pessoa; a redação das cláusulas o1 a o4 é a aprovada em 2026-11-01 21:30.
 */

export const CLAUSULAS = [
  'a lista de pessoas vem em ordem neutra (alfabética); ordenar por total é escolha de quem lê;',
  'a utilização por pessoa não tem semáforo, faixa de bom ou ruim, nem comparação com a média;',
  'percentual por pessoa só aparece com 20 apontamentos ou mais; abaixo disso, só soma e contagem;',
  'a aba fica fora da exportação do painel.',
] as const

export const FINALIDADE_CURTA =
  'Estas horas servem para ver capacidade, utilização e distribuição do tempo do time e de cada pessoa. Não medem esforço de entrega, velocidade, custo de card nem meta.'

export const FINALIDADE_LONGA_ABERTURA =
  'A aba Apontamento é uma exceção à regra de que as métricas do painel não olham para pessoas. Ela existe só para entender onde o tempo apontado foi gasto e se a capacidade acompanha o período. Por isso:'

export const FINALIDADE_LONGA_FECHO =
  'O comentário do apontamento não é guardado nem exibido. Os dados vêm só do BusinessMap.'

export const AVISO_NOME_REAL =
  'Esta tela mostra nomes reais de pessoas. Não compartilhe prints, links com filtro nem o conteúdo da tela fora de quem deve vê-lo.'

export const AVISO_NOME_REAL_DETALHE =
  'Nomes aparecem porque o ambiente está configurado para isso (máquina ou rede local sob controle do responsável). Os dados servem à finalidade descrita acima. Para pedir a retirada dos seus dados, fale com o responsável pelo painel.'

export const LINHA_NOMES_OCULTOS = "Pessoas aparecem como 'Pessoa 1', 'Pessoa 2'..."

/** Provisório (decisão do dono de 2026-11-02, A-3 da revisão de UX): o texto é ajustável depois. */
export const NOTA_OUTRA_AREA =
  'Outra área: pessoas que não foram responsáveis por card do DSPD nos últimos 12 meses, somadas, sem nome.'

export const PESSOA_NAO_IDENTIFICADA = 'Pessoa não identificada'
export const DICA_NAO_IDENTIFICADA =
  'Não foi possível ligar este apontamento a uma pessoa. Ele não é somado a outra.'

export const SELO_LEITURA_RELATIVA = 'Comparação relativa; não é jornada total'
export const DICA_LEITURA_RELATIVA =
  'O apontamento cobre só parte da jornada. Por isso a utilização serve para comparar períodos, não para medir quanto alguém trabalhou. Pode passar de 100%.'

export const ROTULO_FILTRO_PESSOA = 'Pessoa que apontou'

export const FLAGS: Record<FlagQualidade | 'completo', string> = {
  'sem-comentario': 'Sem comentário',
  generico: 'Comentário genérico',
  'sem-vinculo': 'Sem vínculo claro',
  'sem-iniciativa': 'Card sem iniciativa',
  'valor-atipico': 'Possível erro de apontamento',
  completo: 'Completo',
}

export const FAIXAS: Record<FaixaDiario, string> = {
  zero: '0 h',
  'ate-4h': 'até 4 h',
  '4h-a-8h': '4 a 8 h',
  'mais-de-8h': 'mais de 8 h',
}

export const ANOMALIA = {
  marca: 'Possível erro de apontamento',
  filtro: 'Ocultar possíveis erros',
  dica: (limiteHoras: number) =>
    `Mais de ${fmtNumero(limiteHoras, 0)} h apontadas por uma pessoa em um dia. O valor foi mantido na soma e marcado para conferência.`,
} as const

export const ROTULO_CHIP_ORDEM = { rotulo: 'Ordem', valor: 'total de horas' } as const

export const ORDENS = [
  { valor: 'alfabetica', rotulo: 'Alfabética (padrão)' },
  { valor: 'total', rotulo: 'Total de horas (maior primeiro)' },
] as const

export const NIVEIS = [
  { valor: 'tipo', rotulo: 'Tipo' },
  { valor: 'subtarefa', rotulo: 'Subtarefa' },
  { valor: 'subgrupo', rotulo: 'Subgrupo' },
] as const

export const ROTULO_NIVEL: Record<NivelMatriz, string> = {
  tipo: 'Tipo',
  subtarefa: 'Subtarefa',
  subgrupo: 'Subgrupo',
}

export const VAZIO = {
  titulo: 'Nenhum apontamento encontrado',
  texto: 'Nenhum apontamento atende aos filtros atuais.',
} as const

export const CARREGANDO = 'Carregando apontamentos'

export const SECOES = {
  kpis: 'Quanto foi apontado e com que qualidade?',
  distribuicao: 'Onde o esforço apontado está sendo gasto?',
  qualidade: 'Os apontamentos dizem o que foi feito?',
  capacidade: 'A capacidade apontada acompanha o período?',
  achados: 'O que mais chama atenção neste período?',
  diario: 'Como os apontamentos se distribuem dia a dia?',
} as const

const SEM_META = 'Esta aba não tem meta: nenhum valor aqui é avaliado como bom ou ruim.'
const CUIDADO_FINALIDADE =
  'Horas apontadas servem só para capacidade, utilização e distribuição do tempo; nunca como esforço de entrega, velocidade, custo de card ou meta.'

export interface TextosCartao {
  pergunta: string
  /** "Como ler" do UX. */
  comoLer: string
  /** Linha "Critério" do UX. */
  criterio: string
}

export const CARTOES = {
  kpis: {
    pergunta: 'Quanto foi apontado neste período?',
    comoLer:
      "Horas, apontamentos e pessoas que apontaram no período e nos filtros escolhidos. Horas são a soma do tempo registrado no BusinessMap, não a jornada de trabalho. 'Completos' é a parte dos apontamentos sem nenhum problema de qualidade; só aparece como percentual com 20 apontamentos ou mais.",
    criterio: 'Fonte: worklog do BusinessMap. O Acelerato não entra.',
  },
  qualidadeGeral: {
    pergunta: 'Os apontamentos descrevem o trabalho feito?',
    comoLer:
      "Cada apontamento pode ter mais de um problema (por exemplo, sem comentário e sem vínculo). Por isso as barras somam mais de 100%. 'Completo' significa nenhum problema encontrado. A qualidade avalia o texto do apontamento, não a pessoa nem o trabalho.",
    criterio:
      'Classificação por palavras-chave do dicionário. É uma heurística: confira a lista antes de tirar conclusões.',
  },
  qualidadePessoa: {
    pergunta: 'Em quais recortes os apontamentos têm menos detalhe?',
    comoLer:
      "Mostra, para cada pessoa, quantos apontamentos tiveram cada problema. O percentual só aparece com 20 apontamentos ou mais; abaixo disso você vê só a contagem. A lista segue ordem alfabética; use 'Ordem' se quiser outra. Não há meta nem comparação com a média.",
    criterio:
      'Classificação por palavras-chave do dicionário. É uma heurística: confira a lista antes de tirar conclusões.',
  },
  projeto: {
    pergunta: 'Quais projetos receberam mais horas apontadas?',
    comoLer:
      "Horas apontadas agrupadas pela iniciativa raiz do card. 'Projeto' aqui é só um rótulo de agrupamento das horas, não mede entrega nem esforço de conclusão. Projetos marcados 'Fora dos quadros coletados' têm a raiz em um quadro que o painel não lê; o título mostrado é o do card mais alto conhecido.",
    criterio: 'Hierarquia pela relação de card pai, até 10 níveis.',
  },
  tipo: {
    pergunta: 'Em que tipos de card o tempo foi apontado?',
    comoLer:
      'Horas apontadas por tipo de card do BusinessMap (por exemplo, tarefa, correção). Cada barra mostra a parte do total do recorte.',
    criterio: 'Tipo de card do BusinessMap.',
  },
  subgrupo: {
    pergunta: 'Que tipo de atividade as horas descrevem?',
    comoLer:
      "O subgrupo vem das palavras do comentário e do tipo do card, segundo o dicionário vigente. É uma estimativa, não uma verdade. 'Sem comentário' aqui conta só os apontamentos sem comentário que também não se encaixam em nenhum grupo por tipo de card. 'Execução técnica' mostra comentários que o dicionário não reconheceu: é um sinal para ampliar o dicionário, não uma falha de preenchimento.",
    criterio: 'Dicionário de subgrupos. Mudanças aparecem como marca no gráfico.',
  },
  matriz: {
    pergunta: 'Como o tempo de cada pessoa se divide entre as categorias?',
    comoLer:
      "Cada linha é uma pessoa; cada coluna, uma categoria do nível escolhido (tipo, subtarefa ou subgrupo). Um nível por vez: troque o nível no seletor acima da tabela. As células mostram horas e a parte da linha. A ordem inicial é alfabética; 'Ordem' é escolha de quem lê. A soma da linha é o total apontado, não a jornada.",
    criterio: 'Um nível por vez; os três níveis nunca aparecem juntos.',
  },
  capacidadeMensal: {
    pergunta: 'O tempo apontado acompanha a capacidade de cada mês?',
    comoLer:
      'Capacidade é a soma, por pessoa, dos dias úteis do mês (sem fins de semana e feriados) vezes as horas por dia do calendário. Utilização é o apontado dividido pela capacidade e pode passar de 100%. A base cobre só parte da jornada, então leia como comparação entre meses, não como ocupação total.',
    criterio: 'Calendário com feriados.',
  },
  capacidadePessoa: {
    pergunta: 'Quanto cada pessoa apontou frente aos dias úteis do seu intervalo?',
    comoLer:
      'Para cada pessoa, vai do primeiro ao último apontamento do período; conta os dias úteis desse intervalo vezes as horas por dia. A utilização é uma comparação relativa, sem meta, sem faixa de bom ou ruim e sem comparação com a média. Quem entrou ou saiu no meio do período tem intervalo menor. Com menos de 20 apontamentos, só aparecem soma e contagem.',
    criterio: 'Calendário com feriados.',
  },
  achados: {
    pergunta: 'O que os dados deste período destacam?',
    comoLer:
      'Frases geradas pelos dados do recorte, por regras fixas. Cada achado aponta algo para conferir, não é um julgamento. Nenhum achado cita pessoa. Se nada se destaca, a lista aparece vazia.',
    criterio: 'Regras fixas sobre os números do recorte.',
  },
  diario: {
    pergunta: 'Como as horas se distribuem pelos dias, por pessoa?',
    comoLer:
      "Cada célula é o total apontado por uma pessoa em um dia, em faixas fixas: 0 h, até 4 h, de 4 a 8 h e mais de 8 h. As faixas não mudam com a carga, então a mesma cor sempre significa a mesma faixa. Cinza neutro é fim de semana ou feriado; célula vazia com borda é dia útil sem apontamento. 'Possível erro de apontamento' marca dias acima do limite. Este cartão responde só ao filtro Pessoa.",
    criterio: 'Faixas fixas; limite de possível erro configurável no servidor.',
  },
} satisfies Record<string, TextosCartao>

/** Monta as cinco seções da nota do `CartaoMetrica` a partir do "Como ler" e do "Critério" do UX. */
export function notaDe(t: TextosCartao): TextoNota {
  return {
    oQueE: t.pergunta,
    comoSeCalcula: t.criterio,
    comoLer: t.comoLer,
    meta: SEM_META,
    cuidados: CUIDADO_FINALIDADE,
  }
}

/** Lê o valor de `valores` como número; ausente ou inválido devolve `null` (o achado é descartado). */
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const txt = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null)

export interface AchadoLido {
  codigo: string
  valores: Record<string, unknown>
  rotuloRef: string | null
}

export type AtalhoDoAchado =
  | { tipo: 'filtro'; rotulo: string; chave: 'subgrupo' | 'qualidade'; valor: string }
  | { tipo: 'projeto'; rotulo: string }
  | { tipo: 'ancora'; rotulo: string; ancora: string }

export interface FraseDoAchado {
  frase: string
  /** Atalho que leva ao que o achado cita: aplica o filtro correspondente ou vai ao cartão. */
  atalho: AtalhoDoAchado
}

/**
 * Frase de cada código de achado (textos do UX, item 2). Código desconhecido (versão nova do servidor) ou
 * `valores` sem as chaves esperadas: devolve `null` e o achado é descartado sem erro visível.
 */
export function fraseDoAchado(a: AchadoLido, rotuloForaDoEscopo = false): FraseDoAchado | null {
  const v = a.valores
  switch (a.codigo) {
    case 'nao-classificado-alto': {
      const pct = num(v.pct)
      const n = num(v.n)
      if (pct === null || n === null) return null
      return {
        frase: `${fmtNumero(pct, 0)}% das horas apontadas (${fmtNumero(n, 0)} apontamentos) estão em 'Sem comentário' e sem regra por tipo de card. Falta comentário no apontamento.`,
        atalho: {
          tipo: 'filtro',
          rotulo: SUBGRUPO_SEM_COMENTARIO.atalho,
          chave: 'subgrupo',
          valor: 'nao-classificado',
        },
      }
    }
    case 'sem-comentario-alto': {
      const pct = num(v.pct)
      const n = num(v.n)
      if (pct === null || n === null) return null
      return {
        frase: `${fmtNumero(pct, 0)}% dos apontamentos (${fmtNumero(n, 0)}) estão sem comentário. Sem texto, não dá para saber o que foi feito.`,
        atalho: {
          tipo: 'filtro',
          rotulo: 'Ver apontamentos',
          chave: 'qualidade',
          valor: 'sem-comentario',
        },
      }
    }
    case 'concentracao-em-projeto': {
      const pct = num(v.pct)
      if (pct === null) return null
      const nome = txt(a.rotuloRef)
      const sufixo = rotuloForaDoEscopo ? ' (fora dos quadros coletados)' : ''
      return {
        frase: `${nome ? `O projeto '${nome}${sufixo}'` : 'Um projeto'} concentra ${fmtNumero(pct, 0)}% das horas apontadas no período.`,
        atalho: { tipo: 'projeto', rotulo: 'Ver apontamentos' },
      }
    }
    case 'dias-atipicos': {
      const n = num(v.n)
      const limite = num(v.limite)
      if (n === null || limite === null) return null
      return {
        frase: `${fmtNumero(n, 0)} dias com mais de ${fmtNumero(limite, 0)} h apontadas por uma pessoa foram marcados como possível erro de apontamento.`,
        atalho: { tipo: 'ancora', rotulo: 'Ver mapa diário', ancora: 'ap-diario' },
      }
    }
    case 'utilizacao-mensal-variou': {
      const antes = num(v.pctAnterior)
      const pct = num(v.pct)
      const mesAnterior = txt(v.mesAnterior)
      const mes = txt(v.mes)
      if (antes === null || pct === null || mesAnterior === null || mes === null) return null
      return {
        frase: `A utilização da equipe passou de ${fmtNumero(antes, 0)}% em ${fmtMes(mesAnterior)} para ${fmtNumero(pct, 0)}% em ${fmtMes(mes)}.`,
        atalho: { tipo: 'ancora', rotulo: 'Ver capacidade mensal', ancora: 'ap-capacidade-mensal' },
      }
    }
    default:
      return null
  }
}

export const VAZIO_ACHADOS = 'Nenhum destaque neste período com os filtros atuais.'

export const QUALIDADE_FILTRO_OPCOES: { id: FiltroQualidade; nome: string }[] = [
  { id: 'sem-comentario', nome: FLAGS['sem-comentario'] },
  { id: 'generico', nome: FLAGS.generico },
  { id: 'sem-vinculo', nome: FLAGS['sem-vinculo'] },
  { id: 'sem-iniciativa', nome: FLAGS['sem-iniciativa'] },
  { id: 'valor-atipico', nome: FLAGS['valor-atipico'] },
  { id: 'completo', nome: FLAGS.completo },
]

/** Aviso de registro de horas incompleto (pedido 063, K-200; UX docs/ux/063-aviso-registro-incompleto.md). Sem prazo (Q-1). */
export const INCOMPLETO = {
  titulo: (n: number) => `Registro de horas incompleto em ${n} ${n === 1 ? 'card' : 'cards'}`,
  corpo:
    'As horas apontadas nesses cards estão incompletas, então os totais desta aba podem estar abaixo do real. Estamos buscando o restante.',
  abrirLista: 'Ver quais cards',
  fecharLista: 'Ocultar lista de cards',
  colunaCard: 'Card',
  colunaProjeto: 'Projeto',
  selo: 'Horas incompletas',
  dicaSelo:
    'Há card deste projeto com registro de horas incompleto. A soma pode estar abaixo do real.',
  colunaObservacao: 'Observação',
  irAoAviso: 'Ir ao aviso',
  notaKpis: 'Totais de horas podem estar abaixo do real: veja o aviso no topo.',
  comoLer: 'Cards com registro de horas incompleto entram nos totais só com o que já foi coletado.',
  projetosComSelo: 'Projetos com horas incompletas',
} as const
export const ID_AVISO_INCOMPLETO = 'aviso-registro-incompleto'

/** Subgrupo "Sem comentário" (não é a marca de qualidade de mesmo nome): explicação visível e atalho do subgrupo. */
export const SUBGRUPO_SEM_COMENTARIO = {
  explicacao:
    "Aqui, 'Sem comentário' conta só apontamentos sem comentário e sem regra por tipo de card. No cartão de Qualidade, 'Sem comentário' conta todos os apontamentos sem comentário, por isso o número lá é maior.",
  atalho: 'Ver apontamentos do subgrupo Sem comentário',
} as const

/** Nota de execução técnica no cartão de Qualidade (pedido 089, D2): sinal para ampliar o dicionário, não falha. */
export const EXECUCAO_TECNICA = {
  titulo: 'Execução técnica',
  /** Contagem na linha abaixo do título; singular com 1 (B-1); unidade das horas dita por extenso. */
  contagem: (n: number, nTexto: string, pctTexto: string | null): string =>
    `${nTexto} ${n === 1 ? 'apontamento' : 'apontamentos'} (${
      pctTexto === null
        ? 'percentual com 20 apontamentos ou mais'
        : `${pctTexto}% das horas apontadas`
    })`,
  explicacao:
    'Comentário com texto que a lista de palavras-chave (dicionário) não reconheceu. Não conta como problema de qualidade: é um sinal para ampliar essa lista.',
  atalho: 'Ver apontamentos de execução técnica',
} as const
