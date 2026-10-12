import { Tabs } from 'radix-ui'
import { useSearchParams } from 'react-router'
import type { Dominio } from '@metricas-dspd/contratos'
import { Icone } from '@/components/ui'
import { DOMINIO_DA_SIGLA, NOME_FONTE, SIGLA_FONTE } from '@/features/coleta/fontes'
import { MudancasCriterio } from './MudancasCriterio'
import { PainelFonte } from './PainelFonte'

const FONTES: readonly Dominio[] = ['businessmap', 'acelerato']

/** Terceira aba: a pesquisa de percepção não tem coleta, só critérios de cálculo (T2.6). */
const SIGLA_PESQUISA = 'pq'
const NOME_PESQUISA = 'Pesquisa de percepção'

/** `?fonte=bm|ac`; qualquer outro valor cai em BusinessMap (CA-12). */
const lerFonte = (valor: string | null): Dominio => DOMINIO_DA_SIGLA[valor === 'ac' ? 'ac' : 'bm']

/**
 * Dados e coletas: estado das coletas de cada fonte, em abas que nunca se somam (CA-12). Só mostra o
 * estado das coletas; nenhuma informação por pessoa (CA-19). Sem tela de cadastro: a janela de
 * calibração é definida pelo sistema (CA-06).
 */
export default function DadosPage() {
  const [params, setParams] = useSearchParams()
  const naPesquisa = params.get('fonte') === SIGLA_PESQUISA
  const dominio = lerFonte(params.get('fonte'))
  const outra = FONTES.find((d) => d !== dominio) as Dominio
  const trocar = (sigla: string) =>
    setParams(
      (atual) => {
        const prox = new URLSearchParams(atual)
        prox.set('fonte', sigla)
        return prox
      },
      { replace: true },
    )
  return (
    <div className="flex flex-col gap-4" data-testid="painel-dados">
      <div className="flex flex-col gap-2">
        <h1 tabIndex={-1} data-foco-rota className="text-2xl font-bold">
          Dados e coletas
        </h1>
        <p
          className="flex w-fit items-start gap-2 rounded-md border border-borda bg-superficie-2 px-3 py-2 text-sm"
          data-testid="aviso-sem-pessoas"
        >
          <Icone nome="info" className="mt-0.5 size-4 shrink-0" />
          Esta tela mostra apenas o estado das coletas. Não há informação por pessoa.
        </p>
      </div>
      <Tabs.Root
        value={naPesquisa ? SIGLA_PESQUISA : SIGLA_FONTE[dominio]}
        onValueChange={trocar}
        className="flex flex-col gap-3"
      >
        <Tabs.List aria-label="Fonte de dados" className="flex flex-wrap gap-1">
          {FONTES.map((d) => (
            <Tabs.Trigger
              key={d}
              value={SIGLA_FONTE[d]}
              className="alvo rounded-md border border-borda-controle bg-superficie px-4 py-2 text-sm font-medium data-[state=active]:border-acento data-[state=active]:bg-acento data-[state=active]:font-semibold data-[state=active]:text-acento-texto"
            >
              {NOME_FONTE[d]}
            </Tabs.Trigger>
          ))}
          <Tabs.Trigger
            value={SIGLA_PESQUISA}
            className="alvo rounded-md border border-borda-controle bg-superficie px-4 py-2 text-sm font-medium data-[state=active]:border-acento data-[state=active]:bg-acento data-[state=active]:font-semibold data-[state=active]:text-acento-texto"
          >
            {NOME_PESQUISA}
          </Tabs.Trigger>
        </Tabs.List>
        <p className="text-sm text-texto-2" data-testid="nota-fontes-separadas">
          {naPesquisa
            ? 'A pesquisa de percepção é uma fonte à parte: não vem de coleta e nunca é somada nem comparada ao BusinessMap ou ao Acelerato.'
            : `As fontes nunca são somadas nem comparadas. Veja a aba ${NOME_FONTE[outra]} separadamente.`}
        </p>
        {FONTES.map((d) => (
          <Tabs.Content key={d} value={SIGLA_FONTE[d]} className="flex flex-col gap-4">
            <PainelFonte dominio={d} />
          </Tabs.Content>
        ))}
        <Tabs.Content value={SIGLA_PESQUISA} className="flex flex-col gap-4">
          <div className="flex flex-col gap-4" data-testid="dados-conteudo-pesquisa">
            <MudancasCriterio dominio="pesquisa" />
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

export const handle = { titulo: 'Dados e coletas' }
