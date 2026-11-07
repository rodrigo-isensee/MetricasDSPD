import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras, SerieLinhas, type SerieBarra } from '@/components/charts'
import { CartaoMetrica, NumeroGrande } from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtData, fmtDataCurta, fmtInteiro, fmtPct, plural } from '@/lib/formatar'
import { LeiaJunto } from '@/features/complementares/LeiaJunto'
import { NOTAS_OPERACIONAL } from '../notas'
import { propsCartao } from '@/features/painel/propsCartao'

type Barra = { livres: number; bloqueados?: number }
/** Sem bloqueio coletado (null) a barra mostra só o total em progresso: null nunca vira 0. */
const valoresBarra = (itens: number, bloqueados: number | null): Barra =>
  bloqueados === null ? { livres: itens } : { livres: itens - bloqueados, bloqueados }
const seriesBarra = (semBloqueio: boolean): SerieBarra[] => [
  { chave: 'livres', rotulo: 'Em progresso', cor: 1 as const, padrao: 'liso' as const },
  ...(semBloqueio
    ? []
    : [
        {
          chave: 'bloqueados',
          rotulo: 'Bloqueados (contam no WIP)',
          cor: 2 as const,
          padrao: 'hachura' as const,
        },
      ]),
]

/** O1: WIP e limite. A quebra por coluna só existe com uma equipe (porColuna != null); sempre mostra o tempo acima do limite. */
export function CartaoO1({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('O1', filtros, { simulado: true })
  const d = q.dados
  const h = d?.hoje
  // Pedido 065: sem bloqueios coletados a parte vem null (nunca 0); o resto do cartão segue igual.
  const semBloqueio =
    !!d && (d.hoje.bloqueados === null || d.notas?.includes('bloqueio-sem-dado-real') === true)
  const leitura =
    d && h
      ? `Hoje há ${fmtInteiro(h.total)} ${plural(h.total, 'item', 'itens')} em progresso para um limite de ${fmtInteiro(h.limite)} (${fmtInteiro(h.acimaDoLimite)} acima), ${h.bloqueados === null ? 'bloqueados: sem dado real' : `${fmtInteiro(h.bloqueados)} deles bloqueados`}. Nos últimos ${fmtInteiro(d.diasDentroDoLimite.n)} dias úteis o WIP ficou dentro do limite em ${fmtInteiro(d.diasDentroDoLimite.k)}.`
      : undefined
  return (
    <CartaoMetrica
      {...propsCartao('O1', q, NOTAS_OPERACIONAL.O1)}
      {...(leitura ? { leitura } : {})}
      {...(d ? { statusMeta: d.statusMeta } : {})}
      notasDoCartao={d?.notas}
      className="lg:col-span-6"
    >
      {d && h && (
        <div className="flex flex-col gap-4">
          <NumeroGrande
            data-testid="o1-dias-dentro"
            valor={
              d.diasDentroDoLimite.status === 'ok'
                ? fmtPct(d.diasDentroDoLimite.pct, 0)
                : `${fmtInteiro(d.diasDentroDoLimite.k)} de ${fmtInteiro(d.diasDentroDoLimite.n)}`
            }
            rotulo={
              d.diasDentroDoLimite.status === 'ok'
                ? `Dias dentro do limite: ${fmtInteiro(d.diasDentroDoLimite.k)} de ${fmtInteiro(d.diasDentroDoLimite.n)}`
                : 'dias dentro do limite (percentual só com 20 dias úteis ou mais)'
            }
            textoCompleto={`Dias dentro do limite: ${fmtInteiro(d.diasDentroDoLimite.k)} de ${fmtInteiro(d.diasDentroDoLimite.n)} dias úteis`}
          />
          {d.porColuna ? (
            <Barras
              descricao={
                semBloqueio
                  ? 'WIP por coluna do fluxo'
                  : 'WIP por coluna do fluxo, com bloqueados dentro do total'
              }
              orientacao="horizontal"
              modo="empilhado"
              unidade="itens"
              larguraRotulos={190}
              categorias={d.porColuna.map((c) => ({
                rotulo: `${c.tipoColuna === 'fila' ? 'Fila · ' : ''}${c.coluna} (limite ${c.limite === null ? 'não definido' : fmtInteiro(c.limite)})`,
                valores: valoresBarra(c.itens, c.bloqueados),
              }))}
              series={seriesBarra(semBloqueio)}
            />
          ) : (
            <div>
              <p className="mb-2 text-sm text-texto-2" data-testid="o1-selecione-equipe">
                Selecione uma equipe para ver por coluna.
                {d.equipesConsideradas > 1
                  ? ` Limite somado de ${fmtInteiro(d.equipesConsideradas)} equipes.`
                  : ''}
              </p>
              <Barras
                descricao={
                  semBloqueio
                    ? 'WIP em Fila e em Execução'
                    : 'WIP em Fila e em Execução, com bloqueados dentro do total'
                }
                orientacao="horizontal"
                modo="empilhado"
                unidade="itens"
                altura={140}
                categorias={d.porTipoColuna.map((c) => ({
                  rotulo: c.tipoColuna === 'fila' ? 'Fila' : 'Execução',
                  valores: valoresBarra(c.itens, c.bloqueados),
                }))}
                series={seriesBarra(semBloqueio)}
              />
            </div>
          )}
          {semBloqueio && (
            <p className="text-sm text-texto-2" data-testid="o1-bloqueados-sem-dado">
              Bloqueados: sem dado real. O WIP total e o limite seguem valendo.
            </p>
          )}
          <SerieLinhas
            descricao={
              semBloqueio
                ? 'WIP total por dia útil, com o limite'
                : 'WIP total por dia útil, com o limite e os bloqueados'
            }
            unidade="itens"
            formatarX={(x) => fmtDataCurta(x)}
            pontos={d.serie.map((p) => ({
              x: p.data,
              // Antes do dado real o bloqueado é null: o trecho fica sem ponto, nunca zero (CA-7).
              valores: { wip: p.wip, limite: p.limite, bloqueados: p.bloqueados },
            }))}
            series={[
              { chave: 'wip', rotulo: 'WIP total', cor: 1, traco: 'solido' },
              { chave: 'limite', rotulo: 'Limite', cor: 7, traco: 'tracejado' },
              ...(semBloqueio
                ? []
                : [
                    {
                      chave: 'bloqueados',
                      rotulo: 'Bloqueados',
                      cor: 2 as const,
                      traco: 'pontilhado' as const,
                    },
                  ]),
            ]}
            faixas={[
              {
                de: 'limite',
                ate: 'wip',
                rotulo: 'WIP acima do limite',
                cor: 2,
                padrao: 'hachura',
                somenteAcima: true,
              },
            ]}
            marcacoes={d.criterios.serie}
          />
          <p className="text-sm text-texto-2">
            Dias acima do limite no período:{' '}
            {fmtInteiro(d.serie.filter((p) => p.acimaDoLimite).length)} (
            {d.base.janela
              ? `${fmtData(d.base.janela.inicio)} a ${fmtData(d.base.janela.fim)}`
              : ''}
            ).
          </p>
        </div>
      )}
      <LeiaJunto id="o1" />
    </CartaoMetrica>
  )
}
