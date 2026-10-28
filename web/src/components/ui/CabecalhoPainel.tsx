import { fmtData } from '@/lib/formatar'
import { BotaoCopiarLink } from './BotaoCopiarLink'

interface Props {
  titulo: string
  /** Pergunta central do painel. */
  pergunta: string
  /** Público e cadência: "Para times · diária e semanal". */
  publico?: string
  /** Data de corte (AAAA-MM-DD). */
  dataCorte?: string | undefined
  /** Fonte de dados do painel; omitida em páginas de texto (Ajuda). */
  fonte?: string
  slug: string
  /** "Copiar link" no cabeçalho (padrão: sim). Painéis com a barra única de ações passam `false` e o põem nela. */
  copiarLink?: boolean
  /** Frescor da fonte (selo, "Atualizado em", "Detalhes da coleta"), abaixo da pergunta central. */
  frescor?: React.ReactNode
  /** Conteúdo extra no cabeçalho (seletor de cadência, recorte). */
  children?: React.ReactNode
}

/**
 * `h1` do painel (recebe o foco ao trocar de rota), pergunta central, "Dados até" e "Copiar link".
 */
export function CabecalhoPainel({
  titulo,
  pergunta,
  publico,
  dataCorte,
  fonte,
  slug,
  copiarLink = true,
  frescor,
  children,
}: Props) {
  return (
    <div className="flex flex-col gap-2" data-testid={`painel-${slug}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h1 tabIndex={-1} data-foco-rota className="text-2xl font-bold">
          {titulo}
        </h1>
        <p className="min-h-5 w-full text-sm text-texto-2 sm:w-auto">
          {[dataCorte ? `Dados até ${fmtData(dataCorte)}` : null, fonte ? `Fonte: ${fonte}` : null]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-texto-2">
          {pergunta}
          {publico ? ` ${publico}` : ''}
        </p>
        {copiarLink && <BotaoCopiarLink />}
      </div>
      {frescor}
      {children}
    </div>
  )
}
