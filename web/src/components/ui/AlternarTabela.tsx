import { Botao } from './Botao'
import { Icone } from './Icone'
import type { ModoVisual } from './ModoTabela'

/**
 * "Ver como tabela" / "Ver como gráfico" (alternativa textual de todo gráfico, 8.4). O rótulo já
 * muda com o estado, então não há `aria-pressed` (o leitor de tela diria o estado duas vezes).
 */
export function AlternarTabela({
  modo,
  onAlternar,
  codigo,
}: {
  modo: ModoVisual
  onAlternar: () => void
  codigo?: string
}) {
  return (
    <Botao
      onClick={onAlternar}
      data-testid={codigo ? `alternar-tabela-${codigo}` : undefined}
      className="text-xs"
    >
      <Icone nome={modo === 'tabela' ? 'grafico' : 'tabela'} />
      {modo === 'tabela' ? 'Ver como gráfico' : 'Ver como tabela'}
    </Botao>
  )
}
