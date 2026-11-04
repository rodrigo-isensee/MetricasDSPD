import { Barras } from '@/components/charts'
import { AmostraInsuficiente, Botao, CelulaInsuficiente, TabelaDados } from '@/components/ui'
import { fmtInteiro, fmtNumero } from '@/lib/formatar'
import { useDadosAba } from '../dados'
import { fmtApontamentos, fmtHoras } from '../formatar'
import { CARTOES, INCOMPLETO } from '../textos'
import type { LinhaDistribuicao, RespostaApontamento } from '../types'
import { SeloHorasIncompletas, temIncompleto } from './AvisoRegistroIncompleto'
import { CartaoApontamento } from './CartaoApontamento'

type Bloco = 'projeto' | 'tipo' | 'subgrupo'

const CFG: Record<
  Bloco,
  {
    codigo: string
    titulo: string
    chave: 'porProjeto' | 'porTipo' | 'porSubgrupo'
    coluna: string
  }
> = {
  projeto: {
    codigo: 'AP-PROJETO',
    titulo: 'Horas por projeto',
    chave: 'porProjeto',
    coluna: 'Projeto',
  },
  tipo: { codigo: 'AP-TIPO', titulo: 'Horas por tipo', chave: 'porTipo', coluna: 'Tipo' },
  subgrupo: {
    codigo: 'AP-SUBGRUPO',
    titulo: 'Horas por subgrupo',
    chave: 'porSubgrupo',
    coluna: 'Subgrupo',
  },
}

const rotuloLinha = (l: LinhaDistribuicao): string =>
  l.foraDoEscopo ? `${l.rotulo} (Fora dos quadros coletados)` : l.rotulo

function Corpo({ bloco, r }: { bloco: Bloco; r: RespostaApontamento }) {
  const cfg = CFG[bloco]
  const linhas = r.distribuicao[cfg.chave]
  const n = r.distribuicao.base.n
  const incompletos = new Set(
    bloco === 'projeto' && temIncompleto(r.registroIncompleto)
      ? r.registroIncompleto.projetoIds
      : [],
  )
  const comSelo = linhas.filter((l) => incompletos.has(l.id))
  return (
    <div className="flex flex-col gap-3">
      <Barras
        orientacao="horizontal"
        descricao={`${cfg.titulo} (horas apontadas)`}
        unidade="h"
        formatar={(v) => fmtNumero(v, 1)}
        larguraRotulos={200}
        altura={Math.max(200, linhas.length * 40)}
        semLegenda
        categorias={linhas.map((l) => ({
          rotulo: rotuloLinha(l),
          valores: { h: l.segundos / 3600 },
        }))}
        series={[{ chave: 'h', rotulo: 'Horas apontadas', cor: 1 }]}
      />
      {comSelo.length > 0 && (
        <ul
          className="flex flex-col gap-1 text-sm"
          aria-label={INCOMPLETO.projetosComSelo}
          data-testid="selos-projeto-incompleto"
        >
          {comSelo.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-2 break-words">
              <span>{rotuloLinha(l)}</span>
              <SeloHorasIncompletas />
            </li>
          ))}
        </ul>
      )}
      {n < 20 && <AmostraInsuficiente n={n} codigo={cfg.codigo} oQue="Os percentuais" />}
      <TabelaDados
        codigo={`${cfg.codigo}-detalhe`}
        legenda={`${cfg.titulo}: horas, apontamentos e parte das horas; a parte só aparece com 20 apontamentos ou mais`}
        colunas={[
          { chave: 'r', titulo: cfg.coluna },
          { chave: 'h', titulo: 'Horas', alinhar: 'direita' },
          { chave: 'a', titulo: 'Apontamentos', alinhar: 'direita' },
          { chave: 'p', titulo: 'Parte das horas', alinhar: 'direita' },
          ...(comSelo.length > 0 ? [{ chave: 'o', titulo: INCOMPLETO.colunaObservacao }] : []),
        ]}
        linhas={linhas.map((l) => ({
          r: rotuloLinha(l),
          h: fmtHoras(l.segundos),
          a: fmtInteiro(l.apontamentos),
          p:
            l.participacao.status === 'ok' ? (
              `${fmtNumero(l.participacao.pct, 0)}%`
            ) : (
              <CelulaInsuficiente />
            ),
          o: incompletos.has(l.id) ? INCOMPLETO.selo : '',
        }))}
      />
    </div>
  )
}

export function CartaoDistribuicao({ bloco }: { bloco: Bloco }) {
  const d = useDadosAba()
  const r = d.resposta
  const cfg = CFG[bloco]
  const linhas = r?.distribuicao[cfg.chave] ?? []
  const topo = linhas.reduce<LinhaDistribuicao | undefined>(
    (m, l) => (m === undefined || l.segundos > m.segundos ? l : m),
    undefined,
  )
  const leitura = topo
    ? `${rotuloLinha(topo)} reúne a maior parte das horas apontadas: ${fmtHoras(topo.segundos)}${
        topo.participacao.status === 'ok'
          ? ` (${fmtNumero(topo.participacao.pct, 0)}%)`
          : ` em ${fmtApontamentos(topo.apontamentos)}`
      }.`
    : undefined
  const marcasDicionario = (r?.criterios ?? []).filter((c) => c.id.startsWith('dicionario'))
  return (
    <CartaoApontamento
      codigo={cfg.codigo}
      titulo={cfg.titulo}
      texto={CARTOES[bloco]}
      leitura={leitura}
      comoLerExtra={
        bloco === 'projeto' && temIncompleto(r?.registroIncompleto) ? INCOMPLETO.comoLer : undefined
      }
      base={r ? { n: r.distribuicao.base.n, unidade: 'apontamentos' } : undefined}
      baseInsuficiente={!!r && r.distribuicao.base.n < 20}
      {...(bloco === 'subgrupo'
        ? { criterios: marcasDicionario, familiaCriterio: 'dicionario' as const }
        : {})}
      {...(bloco === 'subgrupo'
        ? {
            acoes: (
              <Botao
                className="text-xs"
                onClick={() => d.definirLista('subgrupo', ['nao-classificado'])}
              >
                Ver apontamentos não classificados
              </Botao>
            ),
          }
        : {})}
      className={bloco === 'projeto' ? 'lg:col-span-12' : 'lg:col-span-6'}
    >
      {(r) => <Corpo bloco={bloco} r={r} />}
    </CartaoApontamento>
  )
}
