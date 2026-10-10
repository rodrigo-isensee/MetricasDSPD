import type { ClasseServico, TipoCard } from '@metricas-dspd/contratos'

/** Equipes fictícias (uma por quadro). Nomes de equipe são recorte, nunca eixo de comparação. */
export const EQUIPES = [
  { nome: 'ERP Protheus', sistemas: ['Protheus'] },
  { nome: 'Fluig', sistemas: ['Fluig'] },
  { nome: 'Senior', sistemas: ['Senior'] },
  { nome: 'Marketing e Vendas', sistemas: ['CRM', 'Site/Marketing'] },
  { nome: 'Dados', sistemas: ['Data Lake'] },
  { nome: 'Plataforma 5G', sistemas: ['Core 5G', 'Portal do cliente'] },
] as const

export const SISTEMAS = [
  'Protheus',
  'Fluig',
  'Senior',
  'CRM',
  'Site/Marketing',
  'Data Lake',
  'Core 5G',
  'Portal do cliente',
] as const

/** Peso de cada sistema na carteira de projetos e na demanda sem projeto. */
export const PESO_SISTEMA: readonly (readonly [string, number])[] = [
  ['Protheus', 26],
  ['Fluig', 15],
  ['Senior', 15],
  ['CRM', 10],
  ['Site/Marketing', 9],
  ['Data Lake', 10],
  ['Core 5G', 11],
  ['Portal do cliente', 4],
]

export function equipeDoSistema(sistema: string): string {
  const e = EQUIPES.find((x) => (x.sistemas as readonly string[]).includes(sistema))
  return e ? e.nome : EQUIPES[0].nome
}

export const AREAS_EXTERNAS = [
  'Financeiro',
  'Comercial',
  'Operações',
  'Recursos Humanos',
  'Jurídico',
  'Logística',
  'Atendimento ao Cliente',
] as const
export const AREA_INTERNA = 'DSPD (interno)'

export const OBJETIVOS_ESTRATEGICOS = [
  'Crescer a base de clientes',
  'Reduzir o custo de operação',
  'Elevar a experiência do cliente',
  'Modernizar a plataforma',
] as const
export const OBJETIVO_OBRIGACAO_LEGAL = 'Obrigação legal'

export const FORNECEDORES = ['Fornecedor Alfa', 'Fornecedor Beta', 'Fornecedor Gama'] as const

export const MOTIVOS_DESCARTE = [
  'Duplicado',
  'Cancelado pelo solicitante',
  'Sem prioridade',
  'Resolvido sem desenvolvimento',
] as const

const VERBOS = [
  'Ajustar',
  'Criar',
  'Revisar',
  'Integrar',
  'Automatizar',
  'Corrigir',
  'Parametrizar',
  'Migrar',
  'Simplificar',
]
const OBJETOS: Record<string, readonly string[]> = {
  Protheus: [
    'cálculo de comissão',
    'conciliação bancária',
    'pedido de compra',
    'nota fiscal de serviço',
    'fechamento de estoque',
  ],
  Fluig: [
    'fluxo de aprovação',
    'formulário de reembolso',
    'portal de documentos',
    'processo de admissão',
  ],
  Senior: ['folha de pagamento', 'controle de ponto', 'férias coletivas', 'benefícios'],
  CRM: ['funil de vendas', 'importação de leads', 'painel de oportunidades'],
  'Site/Marketing': ['página de campanha', 'formulário de contato', 'catálogo de planos'],
  'Data Lake': ['carga diária', 'modelo de churn', 'tabela de faturamento'],
  'Core 5G': ['provisionamento de linha', 'regras de cobrança', 'monitoramento de rede'],
  'Portal do cliente': ['segunda via de fatura', 'abertura de chamado', 'área de planos'],
}

export function tituloFicticio(
  i: number,
  sistema: string,
  tipo: TipoCard | 'Projeto' | 'Frente',
): string {
  const objs = OBJETOS[sistema] ?? ['rotina']
  const v = VERBOS[i % VERBOS.length] as string
  const o = objs[(i * 7) % objs.length] as string
  if (tipo === 'Projeto') return `Programa ${o} (${sistema})`
  if (tipo === 'Frente') return `Frente: ${o} (${sistema})`
  if (tipo === 'Incidente') return `Falha em ${o} (${sistema})`
  if (tipo === 'Bug interno' || tipo === 'Defeito em produção') return `Erro em ${o} (${sistema})`
  return `${v} ${o} (${sistema})`
}

export function pseudonimo(rng: () => number, total = 24): string {
  return `Pessoa ${String(1 + Math.floor(rng() * total)).padStart(2, '0')}`
}

/** Classe de serviço por tipo. Intangível (capacidade fixa) = Dívida técnica; sem SLE. */
export function classePorTipo(tipo: TipoCard, r: number): ClasseServico {
  switch (tipo) {
    case 'Incidente':
      return r < 0.7 ? 'Urgente' : 'Padrão'
    case 'Defeito em produção':
      return r < 0.4 ? 'Urgente' : 'Padrão'
    case 'Requisição':
      return r < 0.1 ? 'Prazo fixo' : 'Padrão'
    case 'Melhoria':
      return r < 0.08 ? 'Prazo fixo' : r < 0.1 ? 'Urgente' : 'Padrão'
    case 'Dívida técnica':
      return r < 0.7 ? 'Intangível' : 'Padrão'
    default:
      return 'Padrão'
  }
}
