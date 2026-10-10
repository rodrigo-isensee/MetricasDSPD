import { useId } from 'react'
import { Botao } from './Botao'
import { useContextoPainel } from './ContextoPainel'
import { Icone } from './Icone'

interface Props {
  codigo?: string
  onTentarDeNovo?: () => void
  erro?: Error | null
  titulo?: string
  texto?: string
}

/** Erro de um cartão: não derruba a página. O primeiro da página é `alert`; os demais, `status`. */
export function EstadoErro({
  codigo,
  onTentarDeNovo,
  erro,
  titulo = 'Não foi possível carregar este gráfico',
  texto = 'Tivemos um problema ao ler os dados. Seus filtros foram mantidos.',
}: Props) {
  const id = useId()
  const { reivindicarAlerta } = useContextoPainel()
  const alerta = reivindicarAlerta(id)
  return (
    <div
      role={alerta ? 'alert' : 'status'}
      className="flex flex-col items-start gap-2 rounded-md border border-alerta bg-alerta-fundo p-4 text-sm"
      data-testid={codigo ? `estado-erro-${codigo}` : 'estado-erro'}
    >
      <p className="flex items-center gap-2 font-semibold text-alerta">
        <Icone nome="alerta" /> {titulo}
      </p>
      <p className="text-texto">{texto}</p>
      {onTentarDeNovo && <Botao onClick={onTentarDeNovo}>Tentar de novo</Botao>}
      {erro && (
        <details className="text-xs text-texto-2">
          <summary className="cursor-pointer">Detalhes técnicos</summary>
          <code>
            {erro.name}: {erro.message}
          </code>
        </details>
      )}
    </div>
  )
}
