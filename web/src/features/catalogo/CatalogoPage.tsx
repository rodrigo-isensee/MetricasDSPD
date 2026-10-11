import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { TabelaDados } from '@/components/ui'
import { fmtInteiro } from '@/lib/formatar'
import { linhasDoCatalogo } from './linhas'

const GRUPOS = ['Todos', 'Núcleo', 'Complementar'] as const

/**
 * `/metricas`: o catálogo das 45 métricas do briefing, com painel, grupo, fonte, status e link para o painel.
 * Dado estático do bundle (sem endpoint, sem dado pessoal). Nenhuma métrica é plotada aqui.
 */
export default function CatalogoPage() {
  const todas = useMemo(linhasDoCatalogo, [])
  const [grupo, setGrupo] = useState<(typeof GRUPOS)[number]>('Todos')
  const [painel, setPainel] = useState('todos')
  const paineis = [...new Map(todas.map((l) => [l.painel, l.painelRotulo]))]
  const linhas = todas.filter(
    (l) => (grupo === 'Todos' || l.grupo === grupo) && (painel === 'todos' || l.painel === painel),
  )
  return (
    <div className="flex flex-col gap-4">
      <h1 tabIndex={-1} data-foco-rota className="text-2xl font-bold">
        Catálogo de métricas
      </h1>
      <p className="text-sm text-texto-2">
        Tudo o que existe no DSPD: as métricas do núcleo e as complementares, que ficam na seção
        "Mais métricas deste painel". Complementares com dados fictícios usam dados gerados até a
        coleta real.
      </p>
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Painel
          <select
            value={painel}
            onChange={(e) => setPainel(e.target.value)}
            className="alvo rounded-md border border-borda-controle bg-superficie px-2"
          >
            <option value="todos">Todos</option>
            {paineis.map(([id, nome]) => (
              <option key={id} value={id}>
                {nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Grupo
          <select
            value={grupo}
            onChange={(e) => setGrupo(e.target.value as (typeof GRUPOS)[number])}
            className="alvo rounded-md border border-borda-controle bg-superficie px-2"
          >
            {GRUPOS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-texto-2" role="status" data-testid="contagem-catalogo">
          {fmtInteiro(linhas.length)} de {fmtInteiro(todas.length)} métricas
        </p>
      </div>
      <TabelaDados
        codigo="catalogo"
        legenda="Catálogo de métricas: código, nome, painel, grupo, fonte, granularidade e status"
        colunas={[
          { chave: 'c', titulo: 'Código' },
          { chave: 'n', titulo: 'Métrica' },
          { chave: 'p', titulo: 'Painel' },
          { chave: 'g', titulo: 'Grupo' },
          { chave: 'f', titulo: 'Fonte' },
          { chave: 'gr', titulo: 'Granularidade' },
          { chave: 's', titulo: 'Status' },
          { chave: 'a', titulo: 'Abrir' },
        ]}
        linhas={linhas.map((l) => ({
          c: l.codigo,
          n: l.nome,
          p: l.painelRotulo,
          g: l.grupo,
          f: l.fonte,
          gr: l.granularidade,
          s: l.status,
          a: (
            <Link to={l.destino} className="alvo inline-flex items-center text-acento underline">
              Ir ao painel <span className="sr-only">de {l.codigo}</span>
            </Link>
          ),
        }))}
      />
    </div>
  )
}

export const handle = { titulo: 'Catálogo de métricas' }
