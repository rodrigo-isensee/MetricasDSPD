import { MOTIVO_NAO_CLASSIFICADO, type FiltrosFluxo } from '@metricas-dspd/contratos'
import {
  ApoioMotivoNaoClassificado,
  CartaoMetrica,
  Icone,
  MotivoBloqueio,
  TabelaDados,
  textoMotivo,
} from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtDiasUteis, fmtInteiro, plural } from '@/lib/formatar'
import { NOTAS_OPERACIONAL } from '../notas'
import { LeiaJunto } from '@/features/complementares/LeiaJunto'
import { propsCartao } from '@/features/painel/propsCartao'

/** Bloqueados agora: lista (sem responsável), do mais antigo ao mais novo. Zero bloqueados é sucesso, não "vazio". */
export function CartaoBloqueados({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('BLOQUEADOS', filtros)
  const d = q.dados
  const itens = d
    ? [...d.itens].sort((a, b) => b.bloqueadoHaDiasUteis - a.bloqueadoHaDiasUteis)
    : []
  const maisAntigo = itens[0]
  const nenhum = !!d && itens.length === 0
  const leitura = maisAntigo
    ? `${fmtInteiro(itens.length)} ${plural(itens.length, 'item está', 'itens estão')} bloqueado${itens.length === 1 ? '' : 's'}. O mais antigo está bloqueado há ${fmtDiasUteis(maisAntigo.bloqueadoHaDiasUteis, 0)} ${textoMotivo(maisAntigo.motivo)}.`
    : undefined
  const props = propsCartao('BLOQUEADOS', q, NOTAS_OPERACIONAL.BLOQUEADOS)
  return (
    <CartaoMetrica
      {...props}
      estado={q.estado === 'vazio' ? 'ok' : q.estado}
      semTabela
      {...(leitura ? { leitura } : {})}
      className="lg:col-span-6"
    >
      {nenhum ? (
        <p
          className="flex items-center gap-2 text-sm font-semibold text-ok"
          data-testid="bloqueados-nenhum"
        >
          <Icone nome="check" /> Nenhum item bloqueado hoje.
        </p>
      ) : (
        <TabelaDados
          codigo="BLOQUEADOS"
          descritoPor="bloqueados-apoio"
          legenda="Itens bloqueados agora, do mais antigo ao mais novo"
          colunas={[
            { chave: 'card', titulo: 'Card' },
            { chave: 'tipo', titulo: 'Tipo' },
            { chave: 'etapa', titulo: 'Etapa em que bloqueou' },
            { chave: 'motivo', titulo: 'Motivo' },
            { chave: 'fornecedor', titulo: 'Fornecedor' },
            { chave: 'ha', titulo: 'Bloqueado há (dias úteis)', alinhar: 'direita' },
          ]}
          linhas={itens.map((i) => ({
            card: `${i.cardId} ${i.titulo}`,
            tipo: i.tipo,
            etapa: i.etapa,
            motivo: <MotivoBloqueio motivo={i.motivo} />,
            fornecedor: i.fornecedor ?? '—',
            ha: fmtInteiro(i.bloqueadoHaDiasUteis),
          }))}
        />
      )}
      {!nenhum && (
        <div id="bloqueados-apoio" className="mt-2 flex flex-col gap-1 text-xs text-texto-2">
          {itens.some((i) => i.motivo === MOTIVO_NAO_CLASSIFICADO) && (
            <ApoioMotivoNaoClassificado />
          )}
          <p>
            O início do bloqueio é a data da coleta que o viu; pode ser posterior ao início real.
          </p>
        </div>
      )}
      <LeiaJunto id="bloqueados" />
    </CartaoMetrica>
  )
}
