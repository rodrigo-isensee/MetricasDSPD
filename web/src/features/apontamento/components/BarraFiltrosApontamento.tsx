import clsx from 'clsx'
import { useId, useState } from 'react'
import { Botao, Icone, SeletorCadencia } from '@/components/ui'
import { ChipsFiltros } from '@/features/filtros/ChipsFiltros'
import { FiltroMulti } from '@/features/filtros/FiltroMulti'
import { filtrosUnicos } from '@/components/ui'
import type { AtivoApontamento, UsoFiltrosApontamento } from '../filtros'
import {
  LINHA_NOMES_OCULTOS,
  ORDENS,
  PESSOA_NAO_IDENTIFICADA,
  QUALIDADE_FILTRO_OPCOES,
  ROTULO_CHIP_ORDEM,
  ROTULO_FILTRO_PESSOA,
} from '../textos'
import type { OpcoesApontamento } from '../types'
import { NotaOutraArea } from './NotaOutraArea'

const nomes = (ls: readonly { id: string; rotulo: string }[]) =>
  ls.map((o) => ({ id: o.id, nome: o.rotulo }))

/**
 * Barra de filtros da aba: estado na URL, chips, "Limpar filtros". Ordem dos filtros: período, pessoa, projeto,
 * tipo, subgrupo, subtarefa, qualidade. No mobile recolhe num botão "Filtros (n)". A ordem das listas por pessoa
 * é escolha de quem lê (o1) e fica em controle próprio, fora dos filtros.
 */
export function BarraFiltrosApontamento({
  opcoes,
  uso,
  ativos,
  nomesReais,
}: {
  opcoes: OpcoesApontamento
  uso: UsoFiltrosApontamento
  ativos: readonly AtivoApontamento[]
  nomesReais: boolean
}) {
  const [aberta, setAberta] = useState(false)
  const idPainel = useId()
  const idDe = useId()
  const idAte = useId()
  const c = uso.consulta
  const de = c.de ?? ''
  const ate = c.ate ?? ''
  // De e até andam juntos: preencher um completa o outro com o limite do histórico; limpar um limpa o período.
  const mudarDe = (v: string) =>
    v ? uso.definirPeriodo(v, ate || opcoes.historico.fim) : uso.definirPeriodo(null, null)
  const mudarAte = (v: string) =>
    v ? uso.definirPeriodo(de || opcoes.historico.inicio, v) : uso.definirPeriodo(null, null)
  // A ordem por total não é filtro, mas quem chega por link precisa ver que a ordem não é a neutra (A-8).
  const chips: readonly AtivoApontamento[] =
    uso.ordem === 'total'
      ? [...ativos, { chave: 'ordem', ...ROTULO_CHIP_ORDEM, valorId: null }]
      : ativos
  const quantidade = filtrosUnicos(chips).length
  return (
    <section
      aria-label="Filtros"
      className="flex flex-col gap-2"
      data-testid="barra-filtros-apontamento"
    >
      <Botao
        className="w-fit md:hidden"
        aria-expanded={aberta}
        aria-controls={idPainel}
        onClick={() => setAberta((a) => !a)}
      >
        <Icone nome="filtro" /> Filtros ({quantidade})
      </Botao>
      <div
        id={idPainel}
        className={clsx('flex-wrap items-end gap-3', aberta ? 'flex' : 'hidden md:flex')}
      >
        <fieldset className="m-0 flex items-end gap-2 border-0 p-0">
          <legend className="sr-only">Período</legend>
          <label htmlFor={idDe} className="flex flex-col text-xs text-texto-2">
            De
            <input
              id={idDe}
              type="date"
              value={de}
              min={opcoes.historico.inicio}
              max={opcoes.historico.fim}
              onChange={(e) => mudarDe(e.target.value)}
              className="alvo rounded-md border border-borda-controle bg-superficie px-2 py-1 text-sm text-texto"
            />
          </label>
          <label htmlFor={idAte} className="flex flex-col text-xs text-texto-2">
            Até
            <input
              id={idAte}
              type="date"
              value={ate}
              min={opcoes.historico.inicio}
              max={opcoes.historico.fim}
              onChange={(e) => mudarAte(e.target.value)}
              className="alvo rounded-md border border-borda-controle bg-superficie px-2 py-1 text-sm text-texto"
            />
          </label>
        </fieldset>
        <div className="flex flex-col gap-1">
          <FiltroMulti
            id="pessoa"
            rotulo={ROTULO_FILTRO_PESSOA}
            opcoes={opcoes.pessoas.map((p) => ({
              id: p.pessoaRef,
              nome: p.identificada ? p.rotulo : PESSOA_NAO_IDENTIFICADA,
            }))}
            selecionados={c.pessoa ?? []}
            onChange={(ids, replace) => uso.definirLista('pessoa', ids, replace)}
            genero="f"
          />
          {!nomesReais && (
            <p className="text-xs text-texto-2" data-testid="linha-nomes-ocultos">
              {LINHA_NOMES_OCULTOS}
            </p>
          )}
          <NotaOutraArea linhas={opcoes.pessoas} />
        </div>
        <FiltroMulti
          id="projeto"
          rotulo="Projeto"
          opcoes={nomes(opcoes.projetos)}
          selecionados={c.projeto ?? []}
          genero="m"
          onChange={(ids, r) => uso.definirLista('projeto', ids, r)}
        />
        <FiltroMulti
          id="tipo"
          rotulo="Tipo"
          opcoes={nomes(opcoes.tipos)}
          selecionados={c.tipo ?? []}
          genero="m"
          onChange={(ids, r) => uso.definirLista('tipo', ids, r)}
        />
        <FiltroMulti
          id="subgrupo"
          rotulo="Subgrupo"
          opcoes={nomes(opcoes.subgrupos)}
          selecionados={c.subgrupo ?? []}
          genero="m"
          onChange={(ids, r) => uso.definirLista('subgrupo', ids, r)}
        />
        <FiltroMulti
          id="subtarefa"
          rotulo="Subtarefa"
          opcoes={nomes(opcoes.subtarefas)}
          selecionados={c.subtarefa ?? []}
          genero="f"
          onChange={(ids, r) => uso.definirLista('subtarefa', ids, r)}
        />
        <FiltroMulti
          id="qualidade"
          rotulo="Qualidade"
          opcoes={QUALIDADE_FILTRO_OPCOES}
          selecionados={c.qualidade ?? []}
          genero="f"
          onChange={(ids, r) => uso.definirLista('qualidade', ids, r)}
        />
        <label className="alvo flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-[var(--acento)]"
            checked={c.anomalos === 'ocultar'}
            onChange={(e) => uso.definirAnomalos(e.target.checked)}
          />
          Ocultar possíveis erros
        </label>
        <SeletorCadencia
          rotulo="Ordem"
          valor={uso.ordem}
          onChange={uso.definirOrdem}
          opcoes={ORDENS}
        />
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <ChipsFiltros chips={chips} onRemover={uso.remover} />
          <Botao onClick={uso.limpar} className="text-xs">
            Limpar filtros
          </Botao>
        </div>
      )}
      {uso.invalidos.length > 0 && (
        <p
          role="status"
          className="flex items-center gap-1 text-sm text-atencao"
          data-testid="filtros-invalidos"
        >
          <Icone nome="alerta" className="size-4" />
          Valor inválido ignorado em: {[...new Set(uso.invalidos)].join(', ')}.
        </p>
      )}
    </section>
  )
}
