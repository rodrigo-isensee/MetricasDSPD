import type { FiltrosSustentacao } from '@metricas-dspd/contratos'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import { useMetrica } from '@/data'
import { fmtInteiro, fmtPct } from '@/lib/formatar'
import { NOTAS_SUSTENTACAO } from '../notas'
import { CartaoMotivos } from './CartaoMotivos'

const FOCO = 'Sem conhecimento técnico no N1'

export function CartaoS5({ filtros }: { filtros: FiltrosSustentacao }) {
  const m = entradaDoCatalogo('S5')
  const q = useMetrica('S5', filtros)
  const d = q.dados
  const dois = d?.motivos.slice(0, 2)
  const leitura = d
    ? d.base.n >= 20 && dois && dois.length === 2 && dois[0]?.pct != null && dois[1]?.pct != null
      ? `Os dois primeiros motivos (${dois[0].motivo} e ${dois[1].motivo}) somam ${fmtPct(dois[0].pct + dois[1].pct, 0)} das ${fmtInteiro(d.base.n)} escalações.`
      : `${fmtInteiro(d.base.n)} chamados escalados; abaixo de 20 só as contagens são publicadas.`
    : undefined
  return (
    <CartaoMotivos
      chave="s5"
      motivos={d?.motivos ?? []}
      evolucao={d?.evolucao ?? []}
      base={d?.base}
      total={d?.base.n ?? 0}
      foco={FOCO}
      estadoProps={{
        codigo: 'S5',
        titulo: m.nome,
        pergunta: m.pergunta,
        estado: q.estado,
        atualizando: q.atualizando,
        ...(d ? { criterios: d.criterios } : {}),
        ...(leitura ? { leitura } : {}),
        nota: NOTAS_SUSTENTACAO.S5 as NonNullable<(typeof NOTAS_SUSTENTACAO)[string]>,
        meta: m.meta,
        fonte: m.fonte,
        granularidade: m.granularidade,
        onTentarDeNovo: q.recarregar,
        erro: q.erro,
      }}
    />
  )
}
