import { ORIGENS_DEMANDA, type FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras } from '@/components/charts'
import { CartaoMetrica, SeletorLocal, TabelaDados } from '@/components/ui'
import { useMetrica } from '@/data'
import { useParametroLocal } from '@/features/filtros/useParametroLocal'
import { fmtInteiro, fmtPct } from '@/lib/formatar'
import { NOTAS_TATICO } from '../notas'
import { propsCartao } from '@/features/painel/propsCartao'
import { LeiaJunto } from '@/features/complementares/LeiaJunto'

const ABAS = ['sistema', 'area'] as const
const SERIES = ['Demanda de valor', ...ORIGENS_DEMANDA]

export function CartaoT5({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('T5', filtros)
  const d = q.dados
  const [aba, setAba] = useParametroLocal('t5', ABAS, 'sistema')
  const grupos = d ? (aba === 'sistema' ? d.porSistema : d.porArea) : []
  // Ordem neutra: volume total (maior primeiro), desempate alfabético. Nunca pela parcela de falha.
  const ordenados = [...grupos].sort((a, b) => b.n - a.n || a.nome.localeCompare(b.nome, 'pt-BR'))
  const publicados = ordenados.flatMap((g) =>
    g.estatistica.status === 'ok' ? [{ g, e: g.estatistica }] : [],
  )
  const faltam = ordenados.filter((g) => g.estatistica.status === 'insuficiente')
  const foco = new Set(d?.variacaoSemestre.map((v) => v.sistema) ?? [])
  const primeiro = publicados[0]
  const leitura = primeiro
    ? `${primeiro.g.nome}, de maior volume: ${fmtPct(primeiro.e.valor.pctFalha)} dos pedidos existem porque algo antes falhou${primeiro.e.valor.origemMaior ? `; a maior origem é "${primeiro.e.valor.origemMaior}"` : ''}.`
    : d
      ? 'Nenhum grupo tem 20 itens ou mais para publicar a parcela de falha.'
      : undefined
  return (
    <CartaoMetrica
      {...propsCartao('T5', q, NOTAS_TATICO.T5)}
      {...(d && publicados.length === 0 ? { baseVariante: 'insuficiente' as const } : {})}
      {...(leitura ? { leitura } : {})}
      className="lg:col-span-6"
    >
      {d && (
        <>
          <SeletorLocal
            codigo="t5"
            rotulo="Agrupar demanda de falha"
            valor={aba}
            onChange={(v) => setAba(v === 'area' ? 'area' : 'sistema')}
            itens={[
              { valor: 'sistema', rotulo: 'Por sistema' },
              { valor: 'area', rotulo: 'Por área' },
            ]}
          >
            <div className="flex flex-col gap-3">
              <p className="text-sm text-texto-2">Ordem por volume de demanda. Não é um ranking.</p>
              {aba === 'area' && (
                <p className="text-sm text-texto-2">
                  A parcela de falha vem de processos e entregas anteriores, não das áreas.
                </p>
              )}
              {publicados.length > 0 && (
                <Barras
                  descricao={`Demanda de falha por ${aba === 'sistema' ? 'sistema' : 'área'}, por origem`}
                  orientacao="horizontal"
                  modo="percentual"
                  unidade="% da demanda"
                  categorias={publicados.map(({ g, e }) => ({
                    rotulo: g.nome,
                    valores: Object.fromEntries(
                      SERIES.map((s) => [s, e.valor.origens.find((o) => o.origem === s)?.n ?? 0]),
                    ),
                  }))}
                  series={SERIES.map((s) => ({ chave: s, rotulo: s }))}
                  larguraRotulos={130}
                />
              )}
              <TabelaDados
                legenda={`Volume e parcela de falha por ${aba === 'sistema' ? 'sistema' : 'área'}`}
                colunas={[
                  { chave: 'nome', titulo: aba === 'sistema' ? 'Sistema' : 'Área' },
                  { chave: 'n', titulo: 'Itens', alinhar: 'direita' },
                  { chave: 'falha', titulo: 'Parcela de falha', alinhar: 'direita' },
                  ...(aba === 'sistema' ? [{ chave: 'foco', titulo: 'Meta' }] : []),
                ]}
                linhas={publicados.map(({ g, e }) => ({
                  nome: g.nome,
                  n: fmtInteiro(g.n),
                  falha: fmtPct(e.valor.pctFalha),
                  foco: foco.has(g.nome) ? 'Foco da meta' : '',
                }))}
              />
              {aba === 'sistema' && d.variacaoSemestre.length > 0 && (
                <ul className="text-sm" aria-label="Variação contra o semestre anterior">
                  {d.variacaoSemestre.map((v) => (
                    <li key={v.sistema}>
                      <strong>{v.sistema}:</strong>{' '}
                      {v.variacaoPct === null
                        ? 'Comparação indisponível: amostra insuficiente em uma das janelas.'
                        : `${v.variacaoPct > 0 ? '+' : ''}${fmtPct(v.variacaoPct)} contra o semestre anterior (meta −15%).`}
                    </li>
                  ))}
                </ul>
              )}
              {faltam.length > 0 && (
                <div data-testid="t5-sem-amostra">
                  <h4 className="text-sm font-semibold">Sem amostra suficiente</h4>
                  <ul className="text-sm">
                    {faltam.map((g) => (
                      <li key={g.id}>
                        {g.nome}: {fmtInteiro(g.n)} de 20 itens mínimos
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </SeletorLocal>
          <LeiaJunto id="t5" />
        </>
      )}
    </CartaoMetrica>
  )
}
