import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useSearchParams } from 'react-router'
import { useFonte } from '@/data'
import { useMemoriaAtual } from '@/features/filtros/memoria'
import { usePreferencias } from '@/features/preferencias'
import { DialogoExportar, type BaseExportacao } from './DialogoExportar'
import { gerarArquivo } from './gerar'
import { NIVEIS, itensDoNivel, type NivelExportacao } from './selecao'

/**
 * "Exportar" do painel (e da Visão geral) e "Exportação personalizada" (todos os níveis): liga o diálogo
 * às preferências do pedido 007 (só as métricas visíveis), à fonte de dados e ao cache dos cartões.
 */
export function BotaoExportar({ base }: { base: BaseExportacao }) {
  const fonte = useFonte()
  const clienteQuery = useQueryClient()
  const prefs = usePreferencias()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const memoria = useMemoriaAtual()
  const niveis: NivelExportacao[] =
    base === 'personalizada' ? NIVEIS.map((n) => n.id) : base === 'visao-geral' ? [] : [base]
  const itens = niveis.flatMap((n) => itensDoNivel(n, prefs.ocultosNaVisita(n)))
  return (
    <DialogoExportar
      base={base}
      itens={itens}
      mock={fonte.tipo === 'mock'}
      carregando={!prefs.pronto}
      agora={() => new Date()}
      gerar={(selecionados) =>
        gerarArquivo({
          base,
          itens: selecionados,
          fonte,
          clienteQuery,
          pathname,
          params,
          memoria,
          agora: new Date(),
        })
      }
    />
  )
}
