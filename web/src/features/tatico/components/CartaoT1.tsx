import { CLASSES_SERVICO, type FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras } from '@/components/charts'
import { CartaoMetrica, SeletorLocal, TabelaDados, useCartaoVisivel } from '@/components/ui'
import { useMetrica } from '@/data'
import { useParametroLocal } from '@/features/filtros/useParametroLocal'
import { fmtDiasUteis, fmtInteiro, fmtPct, textoJanela } from '@/lib/formatar'
import { NOTAS_TATICO } from '../notas'
import { propsCartao, slug } from '@/features/painel/propsCartao'
import { LeiaJunto } from '@/features/complementares/LeiaJunto'

/** Bloco do lead time e a chave correspondente no DTO. */
const BLOCOS = [
  ['Fila', 'fila'],
  ['Espera', 'espera'],
  ['Execução', 'execucao'],
  ['Homologação', 'homologacao'],
] as const

const DONOS = {
  Fila: 'Priorização',
  Espera: 'Fluxo do time',
  Execução: 'Time de execução',
  Homologação: 'Validação do negócio',
} as const
const VALORES = CLASSES_SERVICO.map(slug)

export function CartaoT1({ filtros }: { filtros: FiltrosFluxo }) {
  const t4Visivel = useCartaoVisivel('t4')
  const q = useMetrica('T1', filtros)
  const d = q.dados
  const [aba, setAba] = useParametroLocal('t1', VALORES, 'padrao')
  const classes = d?.classes ?? []
  const publicadas = classes.flatMap((c) =>
    c.estatistica.status === 'ok' ? [{ c, e: c.estatistica }] : [],
  )
  const insuficientes = classes.filter((c) => c.estatistica.status === 'insuficiente')
  const sel = publicadas.find((x) => slug(x.c.classe) === aba)
  const atual = sel ?? publicadas[0]
  const janela = d?.janelaPercentis
  const leitura = sel
    ? `Para a classe ${sel.c.classe}, a mediana do lead time é ${fmtDiasUteis(sel.e.valor.total.p50)}; ${fmtDiasUteis(sel.e.valor.blocos.fila)} de fila (mediana), ${fmtPct(sel.e.valor.fracaoFilaPct)} do tempo antes de a equipe assumir o pedido.`
    : publicadas.length === 0 && d
      ? 'Nenhuma classe tem amostra suficiente para publicar o lead time.'
      : undefined
  return (
    <CartaoMetrica
      {...propsCartao('T1', q, NOTAS_TATICO.T1)}
      {...(d && publicadas.length === 0 ? { baseVariante: 'insuficiente' as const } : {})}
      {...(leitura ? { leitura } : {})}
      {...(janela ? { janelaPercentis: janela, periodo: filtros.periodo } : {})}
      className="lg:col-span-6"
    >
      {d && (
        <div className="flex flex-col gap-3">
          {publicadas.length > 0 && (
            <Barras
              descricao="Lead time por classe de serviço: mediana de cada bloco"
              orientacao="horizontal"
              modo="empilhado"
              unidade="dias úteis"
              formatar={(v) => fmtInteiro(v)}
              categorias={publicadas.map(({ c, e }) => ({
                rotulo: `${c.classe} (P85 do total: ${fmtDiasUteis(e.valor.total.p85, 0)})`,
                valores: {
                  fila: e.valor.blocos.fila,
                  espera: e.valor.blocos.espera,
                  execucao: e.valor.blocos.execucao,
                  homologacao: e.valor.blocos.homologacao,
                },
              }))}
              series={[
                { chave: 'fila', rotulo: 'Fila' },
                { chave: 'espera', rotulo: 'Espera' },
                { chave: 'execucao', rotulo: 'Execução' },
                { chave: 'homologacao', rotulo: 'Homologação' },
              ]}
              larguraRotulos={190}
            />
          )}
          {insuficientes.length > 0 && (
            <ul className="text-sm">
              {insuficientes.map((c) => (
                <li key={c.classe} data-testid={`amostra-insuficiente-T1-${slug(c.classe)}`}>
                  <strong>{c.classe}:</strong> Amostra insuficiente ({fmtInteiro(c.n)} de 20 itens
                  mínimos), sem barra.
                </li>
              ))}
            </ul>
          )}
          {publicadas.length > 0 && (
            <SeletorLocal
              codigo="t1"
              rotulo="Classe de serviço para o detalhe"
              valor={slug((atual as NonNullable<typeof atual>).c.classe)}
              onChange={setAba}
              itens={publicadas.map(({ c }) => ({
                valor: slug(c.classe),
                rotulo: c.classe,
                contagem: c.n,
              }))}
            >
              {atual && (
                <TabelaDados
                  legenda={`Decomposição do lead time, classe ${atual.c.classe}`}
                  colunas={[
                    { chave: 'bloco', titulo: 'Bloco' },
                    { chave: 'mediana', titulo: 'Mediana', alinhar: 'direita' },
                    { chave: 'dono', titulo: 'Dono sugerido da ação' },
                  ]}
                  linhas={BLOCOS.map(([bloco, chave]) => ({
                    bloco,
                    mediana: fmtDiasUteis(atual.e.valor.blocos[chave]),
                    dono: DONOS[bloco],
                  }))}
                />
              )}
            </SeletorLocal>
          )}
          <p className="text-sm text-texto-2">
            As medianas dos blocos e a mediana do total são medidas separadas; uma não é a soma da
            outra. Janela de percentis: {textoJanela(d.janelaPercentis)}.
          </p>
          {t4Visivel && (
            <p className="text-sm">
              <a className="alvo text-acento underline" href="#t4">
                Leia junto com Demanda × capacidade (T4)
              </a>
            </p>
          )}
          <LeiaJunto id="t1" />
        </div>
      )}
    </CartaoMetrica>
  )
}
