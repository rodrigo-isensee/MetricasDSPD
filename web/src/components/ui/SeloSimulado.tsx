import { createContext, useContext, useId, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { Botao } from './Botao'
import { Icone } from './Icone'

/** Textos validados pelo dono (pedido 070, E1.2). Fixos no front-end. */
export const TEXTO_SELO_SIMULADO = 'Simulado'
export const NOME_SELO_SIMULADO =
  'Dados simulados: este cartão mostra números de exemplo, não da operação.'
export const TEXTO_FAIXA_SIMULADO =
  'Dados de exemplo. Este cartão ainda não tem dado real, então os números abaixo não representam a operação.'
export const TEXTO_EXPLICACAO_SIMULADO =
  'Simulado quer dizer que os números e o gráfico deste cartão são inventados, só para mostrar como ele vai ficar. Não use para decidir nem para comparar. Quando o dado real da operação estiver disponível, este cartão passa a mostrá-lo sozinho e o aviso desaparece. Cada cartão muda por conta própria: um cartão real nunca traz números de exemplo misturados.'
export const LEGENDA_TABELA_SIMULADO = 'Dados de exemplo (simulado)'
export const PREFIXO_LEITURA_SIMULADO = 'Exemplo: '

/** O cartão atual é simulado: o `StatusMeta` dentro dele não mostra Dentro/Fora da meta (número inventado não se avalia). */
const CartaoSimuladoCtx = createContext(false)

export function ProvedorCartaoSimulado({
  ativo,
  children,
}: {
  ativo: boolean
  children: ReactNode
}) {
  return <CartaoSimuladoCtx.Provider value={ativo}>{children}</CartaoSimuladoCtx.Provider>
}

export const useCartaoSimulado = (): boolean => useContext(CartaoSimuladoCtx)

/** Selo "Simulado" do cabeçalho: texto real (não imagem) com nome acessível, ícone e borda; nunca só cor. */
export function SeloSimulado({ codigo }: { codigo: string }) {
  return (
    <span
      role="img"
      aria-label={NOME_SELO_SIMULADO}
      data-testid={`selo-simulado-${codigo}`}
      className="inline-flex items-center gap-1 rounded-full border-2 border-atencao bg-atencao-fundo px-2.5 py-0.5 text-xs font-bold text-atencao max-sm:basis-full"
    >
      <Icone nome="alerta" className="size-3.5" />
      {TEXTO_SELO_SIMULADO}
    </span>
  )
}

/**
 * Faixa de aviso entre o cabeçalho e o subtítulo do cartão simulado: aviso, motivo da falta de dado real e a explicação
 * expansível inline ("O que é simulado?"). `role="note"` (não `alert`, para não interromper a leitura).
 */
export function FaixaSimulado({ codigo, motivo }: { codigo: string; motivo: string }) {
  const [aberta, setAberta] = useState(false)
  const idExplicacao = useId()
  return (
    <div
      role="note"
      data-testid={`faixa-simulado-${codigo}`}
      className="mt-3 rounded-sm border-l-4 border-atencao bg-atencao-fundo px-3 py-2 text-sm text-atencao"
    >
      <p className="flex items-start gap-2">
        <Icone nome="alerta" className="mt-0.5 size-4 shrink-0" />
        <span>{TEXTO_FAIXA_SIMULADO}</span>
      </p>
      <p className="mt-1" data-testid={`motivo-simulado-${codigo}`}>
        <span className="font-semibold">Motivo:</span> {motivo}
      </p>
      <Botao
        onClick={() => setAberta((a) => !a)}
        aria-expanded={aberta}
        aria-controls={idExplicacao}
        className="alvo-44 mt-2 text-xs"
      >
        {aberta ? 'Fechar explicação' : 'O que é simulado?'}
      </Botao>
      <p
        id={idExplicacao}
        hidden={!aberta}
        data-testid={`explicacao-simulado-${codigo}`}
        className="mt-2 rounded-sm border border-atencao px-3 py-2"
      >
        {TEXTO_EXPLICACAO_SIMULADO}
      </p>
    </div>
  )
}

/** Marca d'água diagonal sobre a área do gráfico: decorativa (`aria-hidden`), a informação já está no texto. */
export function MarcaDaguaSimulado({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-testid="marca-dagua-simulado"
      className={clsx(
        'pointer-events-none absolute inset-0 overflow-hidden select-none',
        className,
      )}
    >
      <span className="absolute inset-0 flex -rotate-12 items-center justify-center text-4xl font-bold text-atencao opacity-15">
        SIMULADO
      </span>
    </span>
  )
}
