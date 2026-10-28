import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { cartaoPorId, type CartaoId } from '@metricas-dspd/contratos'
import { Botao, Icone, usePreferenciasPainel, type PreferenciasPainel } from '@/components/ui'
import { useCriterios } from '@/data'
import { fmtData } from '@/lib/formatar'

/** Mudanças de critério que afetam a métrica: o aviso nunca some só porque o cartão está oculto (CA-11). */
function useCriteriosDoCartao(id: CartaoId, p: PreferenciasPainel) {
  const versoes = useCriterios().data ?? []
  const c = cartaoPorId(p.painel, id)
  return c ? versoes.filter((v) => v.afeta.some((m) => c.metricas.includes(m))) : []
}

/** O aviso de critério de uma métrica oculta, dentro do marcador. */
export function AvisoDentro({ id, p }: { id: CartaoId; p: PreferenciasPainel }) {
  const avisos = useCriteriosDoCartao(id, p)
  return (
    <>
      {avisos.map((v) => (
        <span
          key={v.id}
          role="note"
          className="flex w-full items-center gap-2 text-atencao"
          data-testid={`criterio-no-marcador-${id}`}
        >
          <Icone nome="alerta" className="size-4" /> Critério alterado em {fmtData(v.data)}.
        </span>
      ))}
    </>
  )
}

/**
 * Marcador de métrica oculta, no lugar do cartão (U2, P1): ocupa a posição da grade, diz o nome, o estado
 * ("no seu padrão" ou "nesta visita") e traz o "Mostrar", que é o desfazer, sem prazo. O botão faz o papel do
 * título para o foco (`data-cartao-titulo`): ocultar leva o foco até ele e o link para o cartão cai nele.
 */
export function MarcadorOculto({ id, className }: { id: CartaoId; className?: string }) {
  const p = usePreferenciasPainel()
  const registrar = p?.registrarMarcador
  useEffect(() => registrar?.([id]), [registrar, id])
  const chegou = p?.chegada === id
  // A borda de destaque dura 2 s; o texto de explicação fica (nada some sozinho).
  const [destaque, setDestaque] = useState(chegou)
  useEffect(() => {
    if (!destaque) return undefined
    const t = setTimeout(() => setDestaque(false), 2000)
    return () => clearTimeout(t)
  }, [destaque])
  const c = p ? cartaoPorId(p.painel, id) : undefined
  if (!p || !c) return null
  const nome = `${c.rotulo} (${c.codigo})`
  return (
    <div
      id={id}
      role="group"
      aria-label={`${nome}, oculta`}
      data-testid={`marcador-${c.codigo}`}
      className={clsx(
        'flex min-h-10 flex-wrap items-center gap-x-3 gap-y-1 self-start rounded-lg border border-dashed bg-superficie-2 px-3 py-1 text-sm',
        destaque ? 'border-acento' : 'border-borda-controle',
        className,
      )}
    >
      <Icone nome="olho-cortado" className="size-4 text-texto-2" />
      <span className="min-w-0 flex-1">
        <strong>{c.rotulo}</strong> ({c.codigo}) · oculta{' '}
        {p.ocultaNoPadrao(id) ? 'no seu padrão' : 'nesta visita'}
      </span>
      <Botao
        data-cartao-titulo
        aria-label={`Mostrar ${nome}`}
        className="min-h-11 min-w-11"
        onClick={() => p.mostrar(id)}
      >
        Mostrar
      </Botao>
      {chegou && (
        <span className="w-full text-texto-2" data-testid={`chegada-${c.codigo}`}>
          Você chegou a uma métrica oculta. Mostrar {nome} quando quiser.
        </span>
      )}
      <AvisoDentro id={id} p={p} />
    </div>
  )
}
