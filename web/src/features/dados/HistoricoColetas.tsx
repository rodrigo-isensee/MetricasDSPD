import { useState } from 'react'
import { POR_PAGINA_COLETAS, type Dominio } from '@metricas-dspd/contratos'
import { Botao, Icone, TabelaDados } from '@/components/ui'
import { useHistoricoColetas } from '@/data'
import { fmtDataHora, fmtInteiro } from '@/lib/formatar'
import { ROTULO_RESULTADO, fmtDuracao } from './rotulos'
import { SecaoDados } from './SecaoDados'

const ICONE = { ok: 'check', parcial: 'relogio', falha: 'alerta' } as const

/** Histórico de coletas, mais recente primeiro, 20 por página (CA-16). */
export function HistoricoColetas({ dominio }: { dominio: Dominio }) {
  const [pagina, setPagina] = useState(1)
  const q = useHistoricoColetas(dominio, pagina)
  const total = q.data?.total ?? 0
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA_COLETAS))
  return (
    <SecaoDados id="historico" titulo="Histórico de coletas">
      {q.isPending && (
        <p role="status" className="text-texto-2">
          Carregando o histórico…
        </p>
      )}
      {q.isError && (
        <div role="alert" className="flex flex-col items-start gap-2">
          <p className="flex items-center gap-2 font-semibold text-alerta">
            <Icone nome="alerta" /> Não foi possível carregar o histórico.
          </p>
          <Botao onClick={() => void q.refetch()}>Tentar de novo</Botao>
        </div>
      )}
      {q.data && (
        <>
          <TabelaDados
            codigo={`HISTORICO-${dominio}`}
            legenda="Histórico de coletas: data e hora, resultado, itens lidos e duração"
            vazio="Nenhuma coleta registrada."
            colunas={[
              { chave: 'data', titulo: 'Data e hora' },
              { chave: 'resultado', titulo: 'Resultado' },
              { chave: 'lidos', titulo: 'Itens lidos', alinhar: 'direita' },
              { chave: 'duracao', titulo: 'Duração', alinhar: 'direita' },
            ]}
            linhas={q.data.itens.map((e) => ({
              data: fmtDataHora(e.inicio),
              resultado: (
                <span className="inline-flex items-center gap-1">
                  <Icone nome={ICONE[e.resultado]} /> {ROTULO_RESULTADO[e.resultado]}
                </span>
              ),
              lidos: e.contagens ? fmtInteiro(e.contagens.lidos) : '—',
              duracao: fmtDuracao(e.duracaoMs),
            }))}
          />
          <nav
            aria-label="Paginação do histórico"
            className="flex flex-wrap items-center gap-3"
            aria-busy={q.isPlaceholderData || undefined}
          >
            <Botao onClick={() => setPagina((p) => p - 1)} disabled={pagina <= 1}>
              Página anterior
            </Botao>
            <span aria-live="polite" data-testid={`pagina-${dominio}`}>
              Página {pagina} de {paginas}
            </span>
            <Botao onClick={() => setPagina((p) => p + 1)} disabled={pagina >= paginas}>
              Próxima página
            </Botao>
          </nav>
        </>
      )}
    </SecaoDados>
  )
}
