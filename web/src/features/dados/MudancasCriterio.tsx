import { Link } from 'react-router'
import {
  fonteDaMetrica,
  type Dominio,
  type MetricaId,
  type VersaoCriterio,
} from '@metricas-dspd/contratos'
import { Icone, TabelaDados } from '@/components/ui'
import { useCriterios } from '@/data'
import { fmtData } from '@/lib/formatar'
import { SecaoDados } from './SecaoDados'

/** Fonte da aba: as duas de coleta ou a pesquisa de percepção (terceira fonte, `dominio = 'pesquisa'`). */
type FonteDaAba = Dominio | 'pesquisa'

/** A métrica é da fonte da aba. A Visão geral não é de nenhuma; a PV1 só aparece na aba da pesquisa. */
const daFonte = (dominio: FonteDaAba, id: string): boolean =>
  fonteDaMetrica(id as MetricaId) === dominio

/** Mudanças de critério (T2.6) que afetam a fonte da aba, com as métricas dela; nunca as da outra fonte (CA-18). */
export function MudancasCriterio({ dominio }: { dominio: FonteDaAba }) {
  const q = useCriterios()
  const linhas = (q.data ?? [])
    .map((c: VersaoCriterio) => ({ c, afeta: c.afeta.filter((id) => daFonte(dominio, id)) }))
    .filter((x) => x.afeta.length > 0)
  return (
    <SecaoDados id="criterios" titulo="Mudanças de critério (T2.6)">
      {q.isPending && (
        <p role="status" className="text-texto-2">
          Carregando as mudanças de critério…
        </p>
      )}
      {q.isError && (
        <p role="alert" className="flex items-center gap-2 text-alerta">
          <Icone nome="alerta" /> Não foi possível carregar as mudanças de critério.
        </p>
      )}
      {q.data && (
        <TabelaDados
          codigo={`CRITERIOS-${dominio}`}
          legenda="Mudanças de critério: data, descrição e métricas afetadas"
          vazio="Nenhuma mudança de critério registrada para esta fonte."
          colunas={[
            { chave: 'data', titulo: 'Data' },
            { chave: 'descricao', titulo: 'Descrição' },
            { chave: 'afeta', titulo: 'Métricas afetadas' },
          ]}
          linhas={linhas.map(({ c, afeta }) => ({
            data: fmtData(c.data),
            descricao: c.descricao,
            afeta: afeta.map((m) => m.replace('_', '-')).join(', '),
          }))}
        />
      )}
      <Link to="/ajuda#criterios" className="alvo w-fit text-acento underline">
        Ver critérios
      </Link>
    </SecaoDados>
  )
}
