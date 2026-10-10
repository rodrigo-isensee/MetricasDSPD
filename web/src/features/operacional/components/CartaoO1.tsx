import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras, SerieLinhas } from '@/components/charts'
import { CartaoMetrica, NumeroGrande } from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtData, fmtDataCurta, fmtInteiro, fmtPct, plural } from '@/lib/formatar'
import { NOTAS_OPERACIONAL } from '../notas'
import { propsCartao } from '@/features/painel/propsCartao'

/** O1: WIP e limite. A quebra por coluna só existe com uma equipe (porColuna != null); sempre mostra o tempo acima do limite. */
export function CartaoO1({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('O1', filtros)
  const d = q.dados
  const h = d?.hoje
  const dias = d?.diasDentroDoLimite
  const leitura =
    d && h
      ? `Hoje há ${fmtInteiro(h.total)} ${plural(h.total, 'item', 'itens')} em progresso para um limite de ${fmtInteiro(h.limite)} (${fmtInteiro(h.acimaDoLimite)} acima), ${fmtInteiro(h.bloqueados)} deles bloqueados.${dias ? ` Nos últimos ${fmtInteiro(dias.n)} dias úteis o WIP ficou dentro do limite em ${fmtInteiro(dias.k)}.` : ''}`
      : undefined
  return (
    <CartaoMetrica
      {...propsCartao('O1', q, NOTAS_OPERACIONAL.O1)}
      {...(leitura ? { leitura } : {})}
      {...(d ? { statusMeta: d.statusMeta } : {})}
      className="lg:col-span-6"
    >
      {d && h && (
        <div className="flex flex-col gap-4">
          {dias && (
            <NumeroGrande
              data-testid="o1-dias-dentro"
              valor={
                dias.status === 'ok'
                  ? fmtPct(dias.pct, 0)
                  : `${fmtInteiro(dias.k)} de ${fmtInteiro(dias.n)}`
              }
              rotulo={
                dias.status === 'ok'
                  ? `Dias dentro do limite: ${fmtInteiro(dias.k)} de ${fmtInteiro(dias.n)}`
                  : 'dias dentro do limite (percentual só com 20 dias úteis ou mais)'
              }
              textoCompleto={`Dias dentro do limite: ${fmtInteiro(dias.k)} de ${fmtInteiro(dias.n)} dias úteis`}
            />
          )}
          {d.porColuna ? (
            <Barras
              descricao="WIP por coluna do fluxo, com bloqueados dentro do total"
              orientacao="horizontal"
              modo="empilhado"
              unidade="itens"
              larguraRotulos={190}
              categorias={d.porColuna.map((c) => ({
                rotulo: `${c.tipoColuna === 'fila' ? 'Fila · ' : ''}${c.coluna} (limite ${c.limite === null ? 'não definido' : fmtInteiro(c.limite)})`,
                valores: { livres: c.itens - c.bloqueados, bloqueados: c.bloqueados },
              }))}
              series={[
                { chave: 'livres', rotulo: 'Em progresso', cor: 1, padrao: 'liso' },
                {
                  chave: 'bloqueados',
                  rotulo: 'Bloqueados (contam no WIP)',
                  cor: 2,
                  padrao: 'hachura',
                },
              ]}
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
                descricao="WIP em Fila e em Execução, com bloqueados dentro do total"
                orientacao="horizontal"
                modo="empilhado"
                unidade="itens"
                altura={140}
                categorias={d.porTipoColuna.map((c) => ({
                  rotulo: c.tipoColuna === 'fila' ? 'Fila' : 'Execução',
                  valores: { livres: c.itens - c.bloqueados, bloqueados: c.bloqueados },
                }))}
                series={[
                  { chave: 'livres', rotulo: 'Em progresso', cor: 1, padrao: 'liso' },
                  {
                    chave: 'bloqueados',
                    rotulo: 'Bloqueados (contam no WIP)',
                    cor: 2,
                    padrao: 'hachura',
                  },
                ]}
              />
            </div>
          )}
          <SerieLinhas
            descricao="WIP total por dia útil, com o limite"
            unidade="itens"
            formatarX={(x) => fmtDataCurta(x)}
            pontos={d.serie.map((p) => ({
              x: p.data,
              valores: { wip: p.wip, limite: p.limite },
            }))}
            series={[
              { chave: 'wip', rotulo: 'WIP total', cor: 1, traco: 'solido' },
              { chave: 'limite', rotulo: 'Limite', cor: 7, traco: 'tracejado' },
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
    </CartaoMetrica>
  )
}
