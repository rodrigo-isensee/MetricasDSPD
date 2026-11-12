import { NumeroGrande } from '@/components/ui'
import type { FiltrosSustentacao } from '@metricas-dspd/contratos'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import { useMetrica } from '@/data'
import { fmtInteiro, fmtPct } from '@/lib/formatar'
import { NOTAS_SUSTENTACAO } from '../notas'
import { CartaoMotivos } from './CartaoMotivos'
import { TextoInsuficiente } from './comuns'

export function CartaoS6({ filtros }: { filtros: FiltrosSustentacao }) {
  const m = entradaDoCatalogo('S6')
  const q = useMetrica('S6', filtros)
  const d = q.dados
  const t = d?.taxaContorno
  const leitura = d
    ? d.taxaContorno.status === 'ok'
      ? `${fmtPct(d.taxaContorno.pct, 0)} dos encerramentos foram por contorno (${fmtInteiro(d.taxaContorno.k)} de ${fmtInteiro(d.taxaContorno.n)}): cada um é candidato a Registro de Problema.`
      : `Taxa de contorno indisponível: ${fmtInteiro(d.taxaContorno.n)} de 20 itens mínimos (${fmtInteiro(d.taxaContorno.k)} de ${fmtInteiro(d.taxaContorno.n)} por contorno).`
    : undefined
  return (
    <CartaoMotivos
      chave="s6"
      motivos={d?.motivos ?? []}
      evolucao={d?.evolucao ?? []}
      base={d?.base}
      total={d?.base.n ?? 0}
      {...(d ? { naoInformado: d.naoInformado } : {})}
      extra={
        t && (
          <NumeroGrande
            data-testid="s6-taxa-contorno"
            valor={t.status === 'ok' ? fmtPct(t.pct, 0) : '—'}
            rotulo="Taxa de contorno"
            textoCompleto={
              t.status === 'ok'
                ? `Taxa de contorno: ${fmtPct(t.pct, 0)}, ${t.k} de ${t.n} encerramentos`
                : `Taxa de contorno indisponível: ${t.k} de ${t.n}, abaixo de 20`
            }
            complemento={
              t.status === 'ok' ? (
                `${fmtInteiro(t.k)} de ${fmtInteiro(t.n)}`
              ) : (
                <TextoInsuficiente n={t.n} />
              )
            }
            className="w-fit"
          />
        )
      }
      estadoProps={{
        codigo: 'S6',
        titulo: m.nome,
        pergunta: m.pergunta,
        estado: q.estado,
        atualizando: q.atualizando,
        ...(d ? { criterios: d.criterios } : {}),
        ...(leitura ? { leitura } : {}),
        nota: NOTAS_SUSTENTACAO.S6 as NonNullable<(typeof NOTAS_SUSTENTACAO)[string]>,
        meta: m.meta,
        fonte: m.fonte,
        granularidade: m.granularidade,
        onTentarDeNovo: q.recarregar,
        erro: q.erro,
      }}
    />
  )
}
