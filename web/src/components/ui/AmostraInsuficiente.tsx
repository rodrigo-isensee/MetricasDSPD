import clsx from 'clsx'
import { JANELA_PERCENTIS_PADRAO, MINIMO_AMOSTRA } from '@metricas-dspd/contratos'
import { fmtInteiro, textoJanela } from '@/lib/formatar'
import { Botao } from './Botao'
import { filtrosUnicos, useContextoPainel } from './ContextoPainel'
import { Icone } from './Icone'

interface Props {
  n: number
  /** Código da métrica, para o data-testid `amostra-insuficiente-{codigo}`. */
  codigo?: string
  /** O que deixou de ser publicado ("Percentis", "Histograma", "Taxa"). */
  oQue?: string
  /**
   * `padrao`: alerta (triângulo âmbar) com sugestões para chegar a 20. `lenta` (6.3.1): E1, T7,
   * EI-FL2 e EI-FL3, em que poucos itens terminam e isso é ESPERADO: visual neutro (ícone "i"),
   * sem sugerir mudar filtro, janela ou regra.
   */
  variante?: 'padrao' | 'lenta'
  /** Só na variante `lenta`: o que conta aqui. */
  entidade?: 'projetos' | 'frentes'
  /** Só na variante `lenta`: a janela de percentis, para o texto "nas últimas N semanas". */
  janela?: { unidade: 'semanas' | 'meses'; quantidade: number }
  /** Sugestões extras (ex.: "Escolher outro tipo"). */
  acoes?: React.ReactNode
  className?: string
}

const EXPLICACAO: Record<NonNullable<Props['entidade']>, string> = {
  projetos: 'projetos terminam em poucas unidades por trimestre',
  frentes: 'frentes terminam em número menor que stories',
}

/**
 * Substitui a estatística afetada (nunca o cartão inteiro) quando há de 1 a 19 itens (6.3).
 * Mostra a base declarada e uma barra `role="meter"` com o progresso até 20.
 */
export function AmostraInsuficiente({
  n,
  codigo,
  oQue,
  variante = 'padrao',
  entidade = 'projetos',
  janela = JANELA_PERCENTIS_PADRAO,
  acoes,
  className,
}: Props) {
  const { filtrosAtivos, removerFiltro } = useContextoPainel()
  const pct = Math.min(100, (n / MINIMO_AMOSTRA) * 100)
  const texto = `${fmtInteiro(n)} de ${MINIMO_AMOSTRA} itens mínimos`
  const lenta = variante === 'lenta'
  const sugestoes = filtrosUnicos(filtrosAtivos)
  return (
    <div
      className={clsx(
        'rounded-md border p-3 text-sm text-texto',
        lenta ? 'border-borda bg-superficie-2' : 'border-atencao bg-atencao-fundo',
        className,
      )}
      data-variante={variante}
      data-testid={codigo ? `amostra-insuficiente-${codigo}` : 'amostra-insuficiente'}
    >
      <p className={clsx('flex items-center gap-2 font-semibold', !lenta && 'text-atencao')}>
        <Icone nome={lenta ? 'info' : 'alerta'} /> Amostra insuficiente
      </p>
      {lenta ? (
        <>
          <p className="mt-1">
            Foram concluídos {fmtInteiro(n)} {entidade} nas últimas {textoJanela(janela)} ({texto}).
          </p>
          <p className="mt-1">
            Isso é esperado: {EXPLICACAO[entidade]}, então em {textoJanela(janela)} é comum ficar
            abaixo de {MINIMO_AMOSTRA}. Só publicamos percentis com pelo menos {MINIMO_AMOSTRA}{' '}
            itens, para não mostrar uma precisão que os dados não sustentam.
          </p>
          <p className="mt-1">
            Cada {entidade === 'projetos' ? 'projeto' : 'frente'} concluído aparece como ponto e a
            contagem está acima.
          </p>
        </>
      ) : (
        <p className="mt-1">
          Só publicamos {oQue ? oQue.toLowerCase() : 'esta estatística'} com pelo menos{' '}
          {MINIMO_AMOSTRA} itens. Aqui há {fmtInteiro(n)} {n === 1 ? 'item' : 'itens'} ({texto}).
        </p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <div
          role="meter"
          aria-valuenow={n}
          aria-valuemin={0}
          aria-valuemax={MINIMO_AMOSTRA}
          aria-label={texto}
          className={clsx(
            'h-2 w-40 overflow-hidden rounded-full border bg-superficie',
            lenta ? 'border-borda-controle' : 'border-atencao',
          )}
        >
          <div
            className={clsx('h-full', lenta ? 'bg-texto-2' : 'bg-atencao')}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs tabular-nums">
          {fmtInteiro(n)}/{MINIMO_AMOSTRA}
        </span>
      </div>
      {(!lenta || sugestoes.length > 0 || acoes) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {sugestoes.length > 0 ? (
            <>
              {!lenta && <span>Para chegar a {MINIMO_AMOSTRA}, tente:</span>}
              {sugestoes.map((f) => (
                <Botao key={f.chave} onClick={() => removerFiltro(f.chave)} className="text-xs">
                  Remover filtro {f.rotulo}
                </Botao>
              ))}
            </>
          ) : (
            !lenta && <span>Esta classe tem poucos itens mesmo sem filtros.</span>
          )}
          {acoes}
        </div>
      )}
    </div>
  )
}

/** Célula de tabela para estatística não publicada: nunca em branco (6.3). */
export function CelulaInsuficiente() {
  return (
    <span>
      <span aria-hidden="true">—</span>{' '}
      <abbr title="Menos de 20 itens: a estatística não é publicada" className="no-underline">
        amostra insuficiente
      </abbr>
    </span>
  )
}
