import { Link } from 'react-router'
import { JANELA_PERCENTIS_PADRAO, type MarcacaoCriterio } from '@metricas-dspd/contratos'
import { fmtData, textoJanela } from '@/lib/formatar'
import { Icone } from './Icone'

/**
 * Faixa acima do gráfico quando a série atravessa uma mudança de critério (T2.6), ou quando a
 * janela de percentis inclui dados anteriores à mudança (`tipo="janela"`).
 */
export function AvisoCriterio({
  marcacoes,
  tipo = 'serie',
  janela = JANELA_PERCENTIS_PADRAO,
}: {
  marcacoes: readonly MarcacaoCriterio[]
  tipo?: 'serie' | 'janela'
  /** Parâmetro da janela de percentis (o texto é gerado dele). */
  janela?: { unidade: 'semanas' | 'meses'; quantidade: number }
}) {
  if (marcacoes.length === 0) return null
  return (
    <div
      role="note"
      className="flex flex-wrap items-center gap-2 rounded-md border border-atencao bg-atencao-fundo px-3 py-2 text-sm text-texto"
      data-testid="aviso-criterio"
    >
      <Icone nome="alerta" className="size-4 text-atencao" />
      {tipo === 'serie' ? (
        <span>
          Esta série atravessa uma mudança de critério. Não compare antes e depois diretamente.
        </span>
      ) : (
        <span>
          A janela de {textoJanela(janela)} inclui dados anteriores à mudança de critério de{' '}
          {marcacoes.map((m) => fmtData(m.data)).join(', ')}.
        </span>
      )}
      <ul className="m-0 flex list-none flex-wrap gap-x-3 p-0 text-xs text-texto-2">
        {marcacoes.map((m) => (
          <li key={m.id}>
            Mudança de critério em {fmtData(m.data)}: {m.descricao}
          </li>
        ))}
      </ul>
      <Link to="/ajuda#criterios" className="text-acento underline">
        Ver mudanças de critério
      </Link>
    </div>
  )
}
