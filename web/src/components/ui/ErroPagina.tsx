import { useEffect } from 'react'
import { Link } from 'react-router'
import { Botao } from './Botao'
import { Icone } from './Icone'
import { useDefinirTituloErro } from './TituloErro'

/**
 * Erro de página (6.4): falha ao abrir o painel. Aparece DENTRO do shell (cabeçalho, selo de dados
 * fictícios, navegação e rodapé continuam visíveis, WCAG 3.2.6). O `h1` recebe o foco ao trocar de rota.
 */
export function ErroPagina({
  onTentarDeNovo,
  erro,
}: {
  onTentarDeNovo: () => void
  erro?: unknown
}) {
  const definirTitulo = useDefinirTituloErro()
  useEffect(() => {
    definirTitulo(true)
    return () => definirTitulo(false)
  }, [definirTitulo])
  const detalhe =
    erro instanceof Error ? `${erro.name}: ${erro.message}` : typeof erro === 'string' ? erro : null
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-alerta bg-alerta-fundo p-4"
      data-testid="erro-pagina"
    >
      <h1 tabIndex={-1} data-foco-rota className="flex items-center gap-2 text-2xl font-bold">
        <Icone nome="alerta" className="text-alerta" /> Não foi possível abrir este painel
      </h1>
      <p className="text-sm text-texto">
        Tivemos um problema ao carregar esta tela. Seus filtros foram mantidos.
      </p>
      <div className="flex flex-wrap gap-2">
        <Botao onClick={onTentarDeNovo}>Tentar de novo</Botao>
        <Link
          to="/"
          className="alvo inline-flex items-center rounded-md border border-borda-controle bg-superficie px-3 py-1.5 text-sm font-medium text-texto hover:bg-superficie-2"
        >
          Ir para a Visão geral
        </Link>
      </div>
      {detalhe && (
        <details className="text-xs text-texto-2">
          <summary className="cursor-pointer">Detalhes técnicos</summary>
          <code>{detalhe}</code>
        </details>
      )}
    </div>
  )
}
