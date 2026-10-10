import { useState } from 'react'
import { TIPOS_CARD, type FiltrosFluxo, type TipoCard } from '@metricas-dspd/contratos'
import { Dispersao, type FormaPonto } from '@/components/charts'
import {
  AmostraInsuficiente,
  Botao,
  CartaoMetrica,
  SeletorLocal,
  TabelaDados,
} from '@/components/ui'
import { useMetrica } from '@/data'
import { useParametroLocal } from '@/features/filtros'
import { fmtDiasUteis, fmtInteiro, plural, textoJanela, semanasDoIntervalo } from '@/lib/formatar'
import { NOTAS_OPERACIONAL } from '../notas'
import { propsCartao, slug } from '@/features/painel/propsCartao'

const VALORES = TIPOS_CARD.map(slug)
const SITUACAO = {
  'acima-p95': 'Acima do P95 do tipo',
  'entre-p85-p95': 'Entre P85 e P95',
  dentro: 'Dentro do esperado',
  'sem-referencia': 'Sem referência: amostra insuficiente',
} as const
type Ordem = 'idade' | 'parado'

/** O2: idade do WIP. Pontos do tipo escolhido contra as linhas de percentil do tipo; a lista traz todos os tipos. */
export function CartaoO2({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('O2', filtros)
  const d = q.dados
  const sugerido = slug(d?.tipoSugerido ?? d?.tipos[0]?.tipo ?? TIPOS_CARD[0])
  const [aba, setAba] = useParametroLocal('o2', VALORES, sugerido)
  const [ordem, setOrdem] = useState<Ordem>('idade')
  const tipoSel: TipoCard | undefined = TIPOS_CARD.find((t) => slug(t) === aba)
  const ref = d?.tipos.find((t) => t.tipo === tipoSel)?.referencia
  const itens = d?.itens ?? []
  const doTipo = itens.filter((i) => i.tipo === tipoSel)
  const mais = [...itens].sort((a, b) => b.idadeDiasUteis - a.idadeDiasUteis)[0]
  const lista = [...itens]
    .sort((a, b) =>
      ordem === 'idade'
        ? b.idadeDiasUteis - a.idadeDiasUteis
        : b.semMoverHaDiasUteis - a.semMoverHaDiasUteis,
    )
    .slice(0, 10)
  const janela = d?.janelaPercentis
  const leitura = d
    ? d.acimaP95 > 0 && mais
      ? `${fmtInteiro(d.acimaP95)} ${plural(d.acimaP95, 'item está', 'itens estão')} acima do P95 do seu tipo. O mais velho tem ${fmtDiasUteis(mais.idadeDiasUteis, 0)} e está em "${mais.etapa}".`
      : `Nenhum item está acima do P95 do seu tipo.${mais ? ` O mais velho tem ${fmtDiasUteis(mais.idadeDiasUteis, 0)} e está em "${mais.etapa}".` : ''}`
    : undefined
  const forma = (s: (typeof itens)[number]): FormaPonto =>
    s.bloqueioMotivo
      ? 'anel'
      : s.situacao === 'acima-p95'
        ? 'triangulo'
        : s.situacao === 'entre-p85-p95'
          ? 'losango'
          : 'circulo'
  return (
    <CartaoMetrica
      {...propsCartao('O2', q, NOTAS_OPERACIONAL.O2)}
      {...(leitura ? { leitura } : {})}
      {...(d ? { statusMeta: d.statusMeta } : {})}
      {...(janela ? { janelaPercentis: janela, periodo: filtros.periodo } : {})}
      className="lg:col-span-12"
    >
      {d && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7" data-testid="o2-grafico">
            <SeletorLocal
              codigo="O2"
              rotulo="Ver por tipo"
              valor={aba}
              onChange={(v) => setAba(v)}
              itens={d.tipos.map((t) => ({
                valor: slug(t.tipo),
                rotulo: t.tipo,
                contagem: t.abertos,
                insuficiente: t.referencia.status === 'insuficiente',
              }))}
            >
              <Dispersao
                descricao={`Idade dos itens em andamento por etapa${tipoSel ? ` (${tipoSel})` : ''}`}
                rotuloY="Idade (dias úteis)"
                eixoX={{ tipo: 'categorias', categorias: d.etapas }}
                pontos={doTipo.map((i) => ({
                  id: i.cardId,
                  rotulo: `${i.cardId} ${i.titulo}`,
                  x: Math.max(0, d.etapas.indexOf(i.etapa)),
                  y: i.idadeDiasUteis,
                  forma: forma(i),
                }))}
                referencias={
                  ref?.status === 'ok'
                    ? [
                        { valor: ref.valor.p50, rotulo: 'P50', traco: 'pontilhado' },
                        { valor: ref.valor.p85, rotulo: 'P85', traco: 'tracejado' },
                        { valor: ref.valor.p95, rotulo: 'P95', traco: 'solido' },
                      ]
                    : []
                }
                legendaFormas={{
                  circulo: 'até o P85',
                  losango: 'entre o P85 e o P95',
                  triangulo: 'acima do P95',
                  anel: 'bloqueado',
                }}
              />
              {ref?.status === 'insuficiente' && (
                <AmostraInsuficiente
                  n={ref.n}
                  codigo="O2"
                  oQue="Linhas de percentil"
                  className="mt-3"
                />
              )}
              {ref?.status === 'ok' && janela && (
                <p className="mt-2 text-sm text-texto-2">
                  Referência: {fmtInteiro(ref.n)} itens concluídos do tipo nas últimas{' '}
                  {textoJanela({
                    unidade: 'semanas',
                    quantidade: semanasDoIntervalo(ref.janela),
                  })}
                  .
                </p>
              )}
            </SeletorLocal>
          </div>
          <div className="lg:col-span-5" data-testid="o2-lista">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold">Itens para olhar primeiro</h4>
              <div className="flex gap-1" role="group" aria-label="Ordenar por">
                <Botao
                  aria-pressed={ordem === 'idade'}
                  className={ordem === 'idade' ? 'bg-acento-fundo font-bold underline' : ''}
                  onClick={() => setOrdem('idade')}
                >
                  Idade
                </Botao>
                <Botao
                  aria-pressed={ordem === 'parado'}
                  className={ordem === 'parado' ? 'bg-acento-fundo font-bold underline' : ''}
                  onClick={() => setOrdem('parado')}
                >
                  Sem mover há
                </Botao>
              </div>
            </div>
            <TabelaDados
              legenda="Os 10 itens em andamento mais velhos"
              vazio="Nenhum item em andamento."
              colunas={[
                { chave: 'card', titulo: 'Card' },
                { chave: 'tipo', titulo: 'Tipo' },
                { chave: 'etapa', titulo: 'Etapa' },
                { chave: 'idade', titulo: 'Idade (dias úteis)', alinhar: 'direita' },
                { chave: 'parado', titulo: 'Sem mover há (dias úteis)', alinhar: 'direita' },
                { chave: 'situacao', titulo: 'Situação' },
                { chave: 'bloqueio', titulo: 'Bloqueado' },
              ]}
              linhas={lista.map((i) => ({
                card: `${i.cardId} ${i.titulo}`,
                tipo: i.tipo,
                etapa: i.etapa,
                idade: fmtInteiro(i.idadeDiasUteis),
                parado: fmtInteiro(i.semMoverHaDiasUteis),
                situacao: SITUACAO[i.situacao],
                bloqueio: i.bloqueioMotivo ?? '—',
              }))}
            />
          </div>
        </div>
      )}
    </CartaoMetrica>
  )
}
