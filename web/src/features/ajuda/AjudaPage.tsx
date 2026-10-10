import { CabecalhoPainel } from '@/components/ui'
import { useCriterios, useDataReferencia } from '@/data'
import { JANELA_PERCENTIS_PADRAO } from '@metricas-dspd/contratos'
import { fmtData, textoJanela } from '@/lib/formatar'

const GLOSSARIO: readonly { termo: string; definicao: string }[] = [
  {
    termo: 'WIP',
    definicao:
      'Itens em andamento: já começaram e ainda não foram entregues. Itens em fila e bloqueados contam.',
  },
  {
    termo: 'Cycle time (tempo de ciclo)',
    definicao: 'Tempo entre o início efetivo e a entrega, em dias úteis.',
  },
  {
    termo: 'Lead time do cliente',
    definicao: 'Tempo da entrada do pedido até a entrega.',
  },
  {
    termo: 'Lead time da equipe',
    definicao: 'Tempo do compromisso da equipe até a entrega.',
  },
  {
    termo: 'SLE',
    definicao:
      'Prazo esperado de entrega por classe de serviço: o P85 publicado, com a data da publicação.',
  },
  {
    termo: 'SLA',
    definicao:
      'Prazo de atendimento e de restauração dos chamados da Sustentação, definido pela matriz Impacto × Urgência.',
  },
  { termo: 'MTTA', definicao: 'Tempo até o primeiro atendimento do chamado.' },
  { termo: 'MTTR', definicao: 'Tempo até a restauração validada do chamado.' },
  {
    termo: 'Aging',
    definicao: 'Idade de um item ainda em andamento: do início até a data de corte, em dias úteis.',
  },
  { termo: 'Vazão', definicao: 'Demandas entregáveis ao solicitante concluídas por semana.' },
  {
    termo: 'Espera invisível',
    definicao:
      'A fração do tempo do cliente que acontece fora da gestão do time: (visão do cliente − visão do time) ÷ visão do cliente, sobre as medianas.',
  },
  {
    termo: 'Contenção',
    definicao: 'Bugs detectados antes da homologação ÷ total de bugs.',
  },
  { termo: 'Escape', definicao: 'Bugs encontrados em produção ÷ total de bugs.' },
  {
    termo: 'Densidade',
    definicao: 'Quantidade de bugs em relação às entregas, olhada entre as entregas afetadas.',
  },
  {
    termo: 'Objetivo estratégico',
    definicao: 'O objetivo do projeto de origem, ao qual a capacidade entregue é atribuída.',
  },
  {
    termo: 'Frente',
    definicao: 'Feature ou pacote de entrega que reúne stories; entre a story e o projeto.',
  },
  { termo: 'Projeto', definicao: 'Iniciativa que reúne frentes; o nível estratégico.' },
]

/** Ajuda: regras de uso, como lemos os números, fontes, glossário e mudanças de critério (#criterios). */
export default function AjudaPage() {
  const data = useDataReferencia()
  const criterios = useCriterios().data ?? []
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <CabecalhoPainel
        titulo="Ajuda"
        pergunta="Como ler os painéis: regras de uso, leitura dos números e mudanças de critério."
        dataCorte={data}
        slug="ajuda"
        copiarLink={false}
      />
      <section>
        <h2 className="text-lg font-bold">Como ler os painéis</h2>
        <p>
          Cada gráfico responde a uma pergunta. Procure primeiro a faixa &quot;Pede atenção&quot;.
          Cada cartão mostra de quantos itens vem o número e traz uma nota com o cálculo.
        </p>
      </section>
      <section id="regras" tabIndex={-1} className="outline-none">
        <h2 className="text-lg font-bold">Regras de uso</h2>
        <p>
          Nenhuma métrica deste sistema serve para avaliar pessoas. Não há visão por pessoa,
          ranking, meta individual nem comparação entre equipes. Os filtros por equipe recortam; não
          comparam.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-bold">Como lemos os números</h2>
        <p>
          Percentis 50/85/95, janela móvel de {textoJanela(JANELA_PERCENTIS_PADRAO)}, mínimo de 20
          itens, tempo em dias úteis e média nunca sozinha. Na Sustentação o tempo é em horas úteis
          (1 dia útil = 8 horas úteis).
        </p>
      </section>
      <section>
        <h2 className="text-lg font-bold">Fontes</h2>
        <p>
          BusinessMap (fluxo de projeto) e Acelerato (sustentação) nunca se misturam.
          &quot;Incidente&quot; e &quot;Requisição&quot; no fluxo são tipos de card do BusinessMap;
          não têm relação com os chamados do Acelerato, que só aparecem na Sustentação.
        </p>
      </section>
      <section id="glossario" tabIndex={-1} className="outline-none">
        <h2 className="text-lg font-bold">Glossário</h2>
        <dl className="m-0 grid gap-2 text-sm">
          {GLOSSARIO.map((g) => (
            <div key={g.termo}>
              <dt className="font-semibold">{g.termo}</dt>
              <dd className="m-0 text-texto-2">{g.definicao}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section id="criterios" tabIndex={-1} className="outline-none">
        <h2 className="text-lg font-bold">Mudanças de critério</h2>
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Mudanças de critério de cálculo</caption>
          <thead>
            <tr>
              <th scope="col" className="text-left">
                Data
              </th>
              <th scope="col" className="text-left">
                O que mudou
              </th>
              <th scope="col" className="text-left">
                Onde afeta
              </th>
            </tr>
          </thead>
          <tbody>
            {criterios.map((c) => (
              <tr key={c.id} className="border-t border-borda">
                <td className="py-1">{fmtData(c.data)}</td>
                <td>{c.descricao}</td>
                <td>{c.afeta.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="text-lg font-bold">Sobre os dados</h2>
        <p>
          Dados fictícios gerados com semente fixa. Data de referência: {data ? fmtData(data) : '…'}
          .
        </p>
      </section>
    </div>
  )
}

export const handle = { titulo: 'Ajuda' }
