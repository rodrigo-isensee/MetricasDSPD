import { useState } from 'react'
import { AmostraInsuficiente, CartaoMetrica } from '@/components/ui'
import { Barras, marcaDoTipo } from '@/components/charts'
import { TIPOS_CARD } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import { useMetrica } from '@/data'
import { fmtDataCurta, fmtInteiro, semanasDoIntervalo, textoJanela } from '@/lib/formatar'
import { aplicaveisDe } from '@/features/painel/propsCartao'
import { NOTAS_OPERACIONAL } from '../notas'
import { LeiaJunto } from '@/features/complementares/LeiaJunto'

/**
 * CARTÃO DE REFERÊNCIA da fase A: mostra o padrão para os painéis da fase B.
 * useMetrica -> CartaoMetrica (estados) -> gráfico + AmostraInsuficiente quando for o caso.
 * Nenhum número escrito aqui: tudo vem do DTO; a frase de leitura é montada a partir dele.
 */
export function CartaoO4({ filtros }: { filtros: FiltrosFluxo }) {
  const m = entradaDoCatalogo('O4')
  const q = useMetrica('O4', filtros)
  const [porTipo, setPorTipo] = useState(false)
  const d = q.dados
  const faixa = d?.faixa
  // A janela da faixa vem do resultado: o texto "últimas N semanas" nunca é escrito à mão (4.0.3).
  const janela = d
    ? ({ unidade: 'semanas', quantidade: semanasDoIntervalo(d.janelaFaixa) } as const)
    : undefined
  const leitura =
    faixa?.status === 'ok' && janela
      ? `Nas últimas ${textoJanela(janela)} a vazão ficou entre ${fmtInteiro(faixa.valor.min)} e ${fmtInteiro(faixa.valor.max)} itens por semana; a mediana é ${fmtInteiro(faixa.valor.mediana)}.`
      : faixa
        ? `Faixa e mediana indisponíveis: ${fmtInteiro(faixa.n)} de 20 itens mínimos.`
        : undefined

  const series = porTipo
    ? TIPOS_CARD.filter((t) => d?.semanas.some((s) => s.porTipo.some((p) => p.tipo === t))).map(
        (t) => ({ chave: t, rotulo: t, ...marcaDoTipo(t) }),
      )
    : [{ chave: 'itens', rotulo: 'Itens concluídos', cor: 1 as const }]

  return (
    <CartaoMetrica
      codigo="O4"
      titulo={m.nome}
      pergunta={m.pergunta}
      estado={q.estado}
      atualizando={q.atualizando}
      {...(d
        ? {
            base: d.base,
            criterios: d.criterios,
            baseVariante:
              faixa?.status === 'insuficiente' && faixa.n > 0
                ? ('insuficiente' as const)
                : ('ok' as const),
          }
        : {})}
      {...(leitura ? { leitura } : {})}
      {...(janela ? { janelaPercentis: janela, periodo: filtros.periodo } : {})}
      nota={NOTAS_OPERACIONAL.O4}
      meta={m.meta}
      fonte={m.fonte}
      granularidade={m.granularidade}
      aplicaveis={aplicaveisDe('O4')}
      onTentarDeNovo={q.recarregar}
      erro={q.erro}
      className="lg:col-span-6"
      acoes={
        <label className="alvo flex cursor-pointer items-center gap-2 rounded px-1 text-xs">
          <input
            type="checkbox"
            className="size-4 accent-[var(--acento)]"
            checked={porTipo}
            onChange={(e) => setPorTipo(e.target.checked)}
          />
          Empilhar por tipo
        </label>
      }
    >
      {d && (
        <>
          <Barras
            descricao="Itens concluídos por semana"
            categorias={d.semanas.map((s) => ({
              rotulo: fmtDataCurta(s.semana),
              emAndamento: s.emAndamento,
              valores: porTipo
                ? Object.fromEntries(s.porTipo.map((p) => [p.tipo, p.itens]))
                : { itens: s.itens },
            }))}
            series={series}
            modo={porTipo ? 'empilhado' : 'agrupado'}
            unidade="itens"
            semLegenda={!porTipo}
            {...(faixa?.status === 'ok'
              ? {
                  faixa: {
                    min: faixa.valor.min,
                    max: faixa.valor.max,
                    rotulo: 'Faixa (mín a máx)',
                  },
                  referencias: [
                    { valor: faixa.valor.mediana, rotulo: 'Mediana', traco: 'tracejado' as const },
                  ],
                }
              : {})}
          />
          {faixa?.status === 'insuficiente' && (
            <AmostraInsuficiente n={faixa.n} codigo="O4" oQue="Faixa e mediana" className="mt-3" />
          )}
          <LeiaJunto id="o4" />
        </>
      )}
    </CartaoMetrica>
  )
}
