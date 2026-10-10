import { Botao } from './Botao'
import { filtrosUnicos, useContextoPainel } from './ContextoPainel'
import { Icone } from './Icone'

/**
 * Zero itens para os filtros (diferente de "amostra insuficiente", que é de 1 a 19 itens).
 * Oferece "Limpar filtros" e "Remover filtro X" para cada filtro ativo.
 */
export function EstadoVazio({
  codigo,
  titulo = 'Nenhum item encontrado',
  texto = 'Não há itens para estes filtros no período.',
}: {
  codigo?: string
  titulo?: string
  texto?: string
}) {
  const { filtrosAtivos, removerFiltro, limparFiltros } = useContextoPainel()
  return (
    <div
      className="flex flex-col items-start gap-2 rounded-md border border-dashed border-borda-controle p-4 text-sm"
      data-testid={codigo ? `estado-vazio-${codigo}` : 'estado-vazio'}
    >
      <p className="flex items-center gap-2 font-semibold text-texto">
        <Icone nome="info" /> {titulo}
      </p>
      <p className="text-texto-2">{texto}</p>
      {filtrosAtivos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Botao onClick={limparFiltros}>Limpar filtros</Botao>
          {filtrosUnicos(filtrosAtivos).map((f) => (
            <Botao key={f.chave} onClick={() => removerFiltro(f.chave)}>
              Remover filtro {f.rotulo}
            </Botao>
          ))}
        </div>
      )}
    </div>
  )
}

/** Estado positivo de lista vazia com dados válidos ("Nenhum item bloqueado hoje."): não é erro. */
export function EstadoPositivo({ texto, codigo }: { texto: string; codigo?: string }) {
  return (
    <p
      className="flex items-center gap-2 rounded-md bg-ok-fundo p-3 text-sm font-medium text-ok"
      data-testid={codigo ? `estado-positivo-${codigo}` : 'estado-positivo'}
    >
      <Icone nome="check" /> {texto}
    </p>
  )
}
