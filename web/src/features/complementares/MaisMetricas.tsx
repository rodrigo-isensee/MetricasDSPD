import { useEffect, type ReactNode } from 'react'
import { Secao, usePreferenciasPainel, type PreferenciasPainel } from '@/components/ui'
import { fmtInteiro, plural } from '@/lib/formatar'

/**
 * Seção recolhida "Mais métricas deste painel" (ideação, alternativa A). `<details>` fechado por padrão:
 * os cartões só são montados, e só então consultam dados, quando a pessoa abre (carga sob demanda).
 * Abrir e fechar é estado da visita, não preferência. Complementares não geram alerta e não têm meta própria.
 */
export function MaisMetricas({
  fonte,
  renderizar,
}: {
  fonte: 'BusinessMap' | 'Acelerato'
  renderizar: (id: string) => ReactNode
}) {
  const p = usePreferenciasPainel()
  return p ? <Conteudo p={p} fonte={fonte} renderizar={renderizar} /> : null
}

function Conteudo({
  p,
  fonte,
  renderizar,
}: {
  p: PreferenciasPainel
  fonte: 'BusinessMap' | 'Acelerato'
  renderizar: (id: string) => ReactNode
}) {
  const alvo = p.alvoComplementar
  const { secaoAberta: aberta, alvoAtendido } = p
  useEffect(() => {
    if (!aberta || !alvo) return
    const el = document.getElementById(alvo)
    el?.scrollIntoView({ block: 'start' })
    el?.querySelector<HTMLElement>('[data-cartao-titulo]')?.focus()
    alvoAtendido()
  }, [aberta, alvo, alvoAtendido])

  const visiveis = p.cartoes.filter((c) => c.grupo === 'complementar' && !p.estaOculto(c.id))
  if (visiveis.length === 0) {
    // Nunca some sem aviso: a pessoa ocultou tudo e precisa saber que a seção existe (o painel sempre tem complementares).
    const total = p.cartoes.filter((c) => c.grupo === 'complementar').length
    return (
      <p className="text-sm text-texto-2" data-testid="mais-metricas-ocultas">
        {fmtInteiro(total)} {plural(total, 'complementar oculta', 'complementares ocultas')} pelas
        suas preferências.
      </p>
    )
  }
  const secoes = [...new Map(visiveis.map((c) => [c.secao, c.secaoTitulo]))]
  return (
    <details
      open={aberta}
      onToggle={(e) => p.definirSecaoAberta(e.currentTarget.open)}
      className="rounded-lg border border-acento bg-superficie"
      data-testid="mais-metricas"
      id="mais-metricas"
    >
      <summary className="alvo cursor-pointer px-4 py-3 text-base font-bold">
        Mais métricas deste painel · {fmtInteiro(visiveis.length)}{' '}
        {plural(visiveis.length, 'complementar', 'complementares')}
      </summary>
      {aberta && (
        <div className="flex flex-col gap-4 px-4 pb-4">
          <p className="text-sm text-texto-2">
            Aprofundam as perguntas do núcleo. Não entram em "Pede atenção" e não têm meta própria.
            Fonte: {fonte}.
          </p>
          {secoes.map(([id, titulo]) => (
            <Secao key={id} id={`compl-${id}`} titulo={titulo}>
              {visiveis.filter((c) => c.secao === id).map((c) => renderizar(c.id))}
            </Secao>
          ))}
        </div>
      )}
    </details>
  )
}
