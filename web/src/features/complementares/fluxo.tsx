import { useState } from 'react'
import { TIPOS_CARD, type FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras, marcaDoTipo } from '@/components/charts'
import { AmostraInsuficiente, SeletorLocal, TabelaDados } from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtDiasUteis, fmtInteiro, fmtMes, fmtNumero, fmtPct, textoJanela } from '@/lib/formatar'
import { textoTaxa } from '@/features/painel/propsCartao'
import { CartaoComplementar } from './CartaoComplementar'
import { Leia, ListaInsuficientes } from './comuns'

interface P {
  filtros: FiltrosFluxo
}

/** O5: eficiência de fluxo por tipo (mediana das razões e razão agregada). */
export function CartaoO5({ filtros }: P) {
  const q = useMetrica('O5', filtros)
  const d = q.dados
  const ok = (d?.tipos ?? []).flatMap((t) =>
    t.estatistica.status === 'ok' ? [{ tipo: t.tipo, ...t.estatistica.valor }] : [],
  )
  const faltam = (d?.tipos ?? []).filter((t) => t.estatistica.status === 'insuficiente')
  const primeiro = ok[0]
  return (
    <CartaoComplementar
      id="O5"
      q={q}
      periodo={filtros.periodo}
      janelaPercentis={d?.janelaPercentis}
      baseVariante={ok.length === 0 ? 'insuficiente' : 'ok'}
      leitura={
        d
          ? primeiro
            ? `Em ${primeiro.tipo}, a mediana é ${fmtPct(primeiro.medianaPct, 0)} do ciclo em execução; o restante é fila e bloqueio.`
            : 'Nenhum tipo tem 20 itens: a eficiência não é publicada.'
          : undefined
      }
    >
      {(r) => (
        <div className="flex flex-col gap-3">
          {ok.length > 0 && (
            <Barras
              descricao={`Eficiência de fluxo por tipo, nas últimas ${textoJanela(r.janelaPercentis)}`}
              orientacao="horizontal"
              unidade="% do ciclo em execução"
              formatar={(v) => fmtPct(v, 0)}
              categorias={ok.map((t) => ({
                rotulo: t.tipo,
                valores: { mediana: t.medianaPct, agregada: t.agregadaPct },
              }))}
              series={[
                { chave: 'mediana', rotulo: 'Mediana por item' },
                { chave: 'agregada', rotulo: 'Razão agregada' },
              ]}
            />
          )}
          {ok.length === 0 && (
            <AmostraInsuficiente
              n={Math.max(0, ...faltam.map((t) => t.n))}
              codigo="O5"
              oQue="Eficiência de fluxo"
            />
          )}
          {ok.length > 0 && (
            <ListaInsuficientes itens={faltam.map((t) => ({ rotulo: t.tipo, n: t.n }))} />
          )}
          <Leia>
            Leia ao lado do tempo de ciclo (O3). Fila e bloqueio contam como não-execução.
          </Leia>
        </div>
      )}
    </CartaoComplementar>
  )
}

/** O6: previsibilidade (P85 ÷ P50) por classe de serviço, com a referência do briefing. */
export function CartaoO6({ filtros }: P) {
  const q = useMetrica('O6', filtros)
  const d = q.dados
  const ok = (d?.classes ?? []).flatMap((c) =>
    c.estatistica.status === 'ok' ? [{ classe: c.classe, ...c.estatistica.valor }] : [],
  )
  const faltam = (d?.classes ?? []).filter((c) => c.estatistica.status === 'insuficiente')
  const primeiro = ok[0]
  return (
    <CartaoComplementar
      id="O6"
      q={q}
      periodo={filtros.periodo}
      janelaPercentis={d?.janelaPercentis}
      baseVariante={ok.length === 0 ? 'insuficiente' : 'ok'}
      leitura={
        d
          ? primeiro
            ? `Classe ${primeiro.classe}: P85 ÷ P50 = ${fmtNumero(primeiro.razao, 1)} (P50 ${fmtDiasUteis(primeiro.p50)}, P85 ${fmtDiasUteis(primeiro.p85)}).`
            : 'Nenhuma classe tem 20 itens: a razão não é publicada.'
          : undefined
      }
    >
      {(r) => (
        <div className="flex flex-col gap-3">
          {ok.length > 0 && (
            <Barras
              descricao="Razão P85 ÷ P50 do tempo de ciclo, por classe de serviço"
              unidade="P85 ÷ P50"
              formatar={(v) => fmtNumero(v, 1)}
              semLegenda
              categorias={ok.map((c) => ({ rotulo: c.classe, valores: { razao: c.razao } }))}
              series={[{ chave: 'razao', rotulo: 'P85 ÷ P50' }]}
              referencias={[
                { valor: r.alvoMax, rotulo: `Referência: abaixo de ${fmtNumero(r.alvoMax, 1)}` },
              ]}
            />
          )}
          {ok.length === 0 && (
            <AmostraInsuficiente
              n={Math.max(0, ...faltam.map((c) => c.n))}
              codigo="O6"
              oQue="A razão P85 ÷ P50"
            />
          )}
          {ok.length > 0 && (
            <ListaInsuficientes itens={faltam.map((c) => ({ rotulo: c.classe, n: c.n }))} />
          )}
          <Leia>Referência do briefing, não meta de pessoa. Leia com O3 e O8.</Leia>
        </div>
      )}
    </CartaoComplementar>
  )
}

/** O8: tamanho das demandas. Mediana e P85 sempre; a média nunca aparece sozinha. */
export function CartaoO8({ filtros }: P) {
  const q = useMetrica('O8', filtros)
  const d = q.dados
  const ok = (d?.tipos ?? []).flatMap((t) =>
    t.estatistica.status === 'ok' ? [{ ...t, v: t.estatistica.valor }] : [],
  )
  const faltam = (d?.tipos ?? []).filter((t) => t.estatistica.status === 'insuficiente')
  const primeiro = ok[0]
  return (
    <CartaoComplementar
      id="O8"
      q={q}
      semTabela
      periodo={filtros.periodo}
      janelaPercentis={d?.janelaPercentis}
      baseVariante={ok.length === 0 ? 'insuficiente' : 'ok'}
      leitura={
        d
          ? primeiro
            ? `Em ${primeiro.tipo}, a mediana do tempo em execução é ${fmtDiasUteis(primeiro.v.mediana)} e o P85 é ${fmtDiasUteis(primeiro.v.p85)}.`
            : 'Nenhum tipo tem 20 itens: as estatísticas de tamanho não são publicadas.'
          : undefined
      }
    >
      {() => (
        <div className="flex flex-col gap-3">
          {ok.length > 0 && (
            <TabelaDados
              codigo="O8"
              legenda="Tempo em execução por tipo, em dias úteis: mediana, P85 e média juntas"
              colunas={[
                { chave: 'tipo', titulo: 'Tipo' },
                { chave: 'n', titulo: 'Itens', alinhar: 'direita' },
                { chave: 'mediana', titulo: 'Mediana', alinhar: 'direita' },
                { chave: 'p85', titulo: 'P85', alinhar: 'direita' },
                { chave: 'media', titulo: 'Média (só com mediana e P85)', alinhar: 'direita' },
                { chave: 'acima', titulo: 'Acima do P85 anterior', alinhar: 'direita' },
              ]}
              linhas={ok.map((t) => ({
                tipo: t.tipo,
                n: fmtInteiro(t.n),
                mediana: fmtDiasUteis(t.v.mediana),
                p85: fmtDiasUteis(t.v.p85),
                media: fmtDiasUteis(t.v.media),
                acima: t.v.acimaP85AnteriorPct === null ? '—' : fmtPct(t.v.acimaP85AnteriorPct, 0),
              }))}
            />
          )}
          {ok.length === 0 && (
            <AmostraInsuficiente
              n={Math.max(0, ...faltam.map((t) => t.n))}
              codigo="O8"
              oQue="Mediana, P85 e média do tamanho"
            />
          )}
          {ok.length > 0 && (
            <ListaInsuficientes itens={faltam.map((t) => ({ rotulo: t.tipo, n: t.n }))} />
          )}
          {ok.length > 0 && (
            <Barras
              descricao="Mediana do tempo em execução por tipo e tamanho declarado"
              unidade="dias úteis"
              formatar={(v) => fmtNumero(v, 1)}
              categorias={ok.map((t) => ({
                rotulo: t.tipo,
                valores: Object.fromEntries(t.porTamanho.map((p) => [p.tamanho, p.mediana])),
              }))}
              series={['P', 'M', 'G', 'Sem tamanho'].map((t, i) => ({
                chave: t,
                rotulo: t === 'Sem tamanho' ? t : `Tamanho ${t}`,
                cor: ([1, 2, 3, 4] as const)[i] as 1,
              }))}
            />
          )}
          <Leia>Nunca a média isolada: leia ao lado do tempo de ciclo (O3) e da vazão (O4).</Leia>
        </div>
      )}
    </CartaoComplementar>
  )
}

/** O11: composição do backlog, retrato no fim de cada mês. */
export function CartaoO11({ filtros }: P) {
  const q = useMetrica('O11', filtros)
  const d = q.dados
  const ultimo = d?.meses.at(-1)
  return (
    <CartaoComplementar
      id="O11"
      q={q}
      leitura={
        ultimo
          ? `No último retrato há ${fmtInteiro(ultimo.prontos)} itens prontos e ${fmtInteiro(ultimo.definicao)} em definição.`
          : undefined
      }
    >
      {(r) => (
        <div className="flex flex-col gap-3">
          <Barras
            descricao="Backlog no fim de cada mês: em definição e pronto"
            modo="empilhado"
            unidade="itens"
            categorias={r.meses.map((m) => ({
              rotulo: fmtMes(m.mes),
              emAndamento: m.emAndamento,
              valores: { definicao: m.definicao, prontos: m.prontos },
            }))}
            series={[
              { chave: 'definicao', rotulo: 'Em definição', cor: 2, padrao: 'hachura' },
              { chave: 'prontos', rotulo: 'Prontos', cor: 1, padrao: 'liso' },
            ]}
          />
          <p className="text-sm" data-testid="semanas-backlog">
            {r.semanasDeBacklogPronto === null
              ? 'Semanas de backlog pronto: sem vazão suficiente para calcular.'
              : `Semanas de backlog pronto: ${fmtNumero(r.semanasDeBacklogPronto, 1)}.`}
          </p>
        </div>
      )}
    </CartaoComplementar>
  )
}

/** O13: defeitos em produção por mês e seu peso na vazão. Sem alvo de volume. */
export function CartaoO13({ filtros }: P) {
  const q = useMetrica('O13', filtros)
  const d = q.dados
  const ultimo = d?.meses.at(-1)
  return (
    <CartaoComplementar
      id="O13"
      q={q}
      leitura={
        ultimo
          ? `Em ${fmtMes(ultimo.mes)}: ${fmtInteiro(ultimo.defeitos)} defeitos em produção entre ${fmtInteiro(ultimo.vazaoTotal)} entregas (${textoTaxa(ultimo.pct)}).`
          : undefined
      }
    >
      {(r) => (
        <div className="flex flex-col gap-3">
          <Barras
            descricao="Defeitos em produção entregues por mês e % da vazão"
            unidade="defeitos"
            categorias={r.meses.map((m) => ({
              rotulo: fmtMes(m.mes),
              emAndamento: m.emAndamento,
              valores: { defeitos: m.defeitos, pct: m.pct.status === 'ok' ? m.pct.pct : null },
            }))}
            series={[{ chave: 'defeitos', rotulo: 'Defeitos entregues' }]}
            semLegenda
            linha={{
              chave: 'pct',
              rotulo: '% da vazão',
              unidade: '% da vazão',
              formatar: (v) => fmtPct(v, 1),
            }}
          />
          <Leia>Sem alvo de volume. Leia junto com a taxa de escape (O15).</Leia>
        </div>
      )}
    </CartaoComplementar>
  )
}

/** O14: origem da demanda por área solicitante ou por sistema (nunca por pessoa). */
export function CartaoO14({ filtros }: P) {
  const q = useMetrica('O14', filtros)
  const [dim, setDim] = useState<'area' | 'sistema'>('area')
  const d = q.dados
  const bloco = d ? (dim === 'area' ? d.porArea : d.porSistema) : undefined
  const linhas = bloco ? [...bloco.itens, ...(bloco.demais ? [bloco.demais] : [])] : []
  const tipos = TIPOS_CARD.filter((t) => linhas.some((l) => l.porTipo.some((p) => p.tipo === t)))
  return (
    <CartaoComplementar
      id="O14"
      q={q}
      leitura={
        linhas[0]
          ? `${linhas[0].nome} é a origem com mais entregas: ${fmtInteiro(linhas[0].entregues)}.`
          : undefined
      }
    >
      {() => (
        <SeletorLocal
          codigo="O14"
          rotulo="Agrupar por"
          valor={dim}
          onChange={(v) => setDim(v as 'area' | 'sistema')}
          itens={[
            { valor: 'area', rotulo: 'Área solicitante' },
            { valor: 'sistema', rotulo: 'Sistema' },
          ]}
        >
          <div className="mt-3 flex flex-col gap-3">
            <Barras
              descricao={`Itens entregues por ${dim === 'area' ? 'área solicitante' : 'sistema'}, por tipo`}
              orientacao="horizontal"
              modo="empilhado"
              unidade="itens entregues"
              larguraRotulos={140}
              categorias={linhas.map((l) => ({
                rotulo: l.nome,
                valores: Object.fromEntries(l.porTipo.map((p) => [p.tipo, p.entregues])),
              }))}
              series={tipos.map((t) => ({ chave: t, rotulo: t, ...marcaDoTipo(t) }))}
            />
            <Leia>
              Por área ou sistema, nunca por pessoa. As dez maiores origens; o resto em "Demais".
            </Leia>
          </div>
        </SeletorLocal>
      )}
    </CartaoComplementar>
  )
}

/** O16: estoque e idade de bugs; os mais antigos pelo id do card, sem pessoa. */
export function CartaoO16({ filtros }: P) {
  const q = useMetrica('O16', filtros)
  const d = q.dados
  const ultimo = d?.meses.at(-1)
  return (
    <CartaoComplementar
      id="O16"
      q={q}
      leitura={
        ultimo
          ? `Em ${fmtMes(ultimo.mes)} entraram ${fmtInteiro(ultimo.entrada)} bugs, foram corrigidos ${fmtInteiro(ultimo.correcao)} e o estoque fechou em ${fmtInteiro(ultimo.estoqueFim)}.`
          : undefined
      }
    >
      {(r) => (
        <div className="flex flex-col gap-3">
          <Barras
            descricao="Bugs: entrada e correção por mês, com o estoque ao fim do mês"
            unidade="bugs"
            categorias={r.meses.map((m) => ({
              rotulo: fmtMes(m.mes),
              emAndamento: m.emAndamento,
              valores: { entrada: m.entrada, correcao: m.correcao, estoque: m.estoqueFim },
            }))}
            series={[
              { chave: 'entrada', rotulo: 'Entrada', cor: 2, padrao: 'hachura' },
              { chave: 'correcao', rotulo: 'Correção', cor: 1, padrao: 'liso' },
            ]}
            linha={{
              chave: 'estoque',
              rotulo: 'Estoque no fim do mês',
              unidade: 'bugs no estoque',
            }}
          />
          <TabelaDados
            codigo="O16-severidade"
            legenda="Bugs abertos hoje, por severidade"
            colunas={[
              { chave: 's', titulo: 'Severidade' },
              { chave: 'n', titulo: 'Abertos', alinhar: 'direita' },
            ]}
            linhas={r.abertosPorSeveridade.map((s) => ({ s: s.severidade, n: fmtInteiro(s.n) }))}
          />
          <TabelaDados
            codigo="O16-antigos"
            legenda="Os 10 bugs abertos mais antigos, pelo identificador do card"
            vazio="Nenhum bug aberto."
            colunas={[
              { chave: 'c', titulo: 'Card' },
              { chave: 't', titulo: 'Tipo' },
              { chave: 's', titulo: 'Severidade' },
              { chave: 'i', titulo: 'Idade', alinhar: 'direita' },
            ]}
            linhas={r.maisAntigos.map((b) => ({
              c: b.cardId,
              t: b.tipo,
              s: b.severidade,
              i: fmtDiasUteis(b.idadeDiasUteis, 0),
            }))}
          />
          <Leia>Sem alvo de volume. Leia junto com a taxa de escape (O15).</Leia>
        </div>
      )}
    </CartaoComplementar>
  )
}

/** O17: causa raiz e concentração por sistema dos bugs concluídos. */
export function CartaoO17({ filtros }: P) {
  const q = useMetrica('O17', filtros)
  const d = q.dados
  const topo = d?.porCausa.reduce((a, b) => (b.n > a.n ? b : a), { causa: '', n: -1 })
  return (
    <CartaoComplementar
      id="O17"
      q={q}
      leitura={
        topo && topo.n >= 0
          ? `A causa raiz mais frequente é ${topo.causa}, com ${fmtInteiro(topo.n)} bugs.`
          : undefined
      }
    >
      {(r) => (
        <div className="flex flex-col gap-3">
          <Barras
            descricao="Bugs concluídos por causa raiz"
            orientacao="horizontal"
            unidade="bugs"
            semLegenda
            larguraRotulos={140}
            categorias={r.porCausa.map((c) => ({ rotulo: c.causa, valores: { n: c.n } }))}
            series={[{ chave: 'n', rotulo: 'Bugs' }]}
          />
          <Barras
            descricao="Bugs concluídos por sistema"
            orientacao="horizontal"
            unidade="bugs"
            semLegenda
            larguraRotulos={140}
            categorias={r.porSistema.map((c) => ({ rotulo: c.sistema, valores: { n: c.n } }))}
            series={[{ chave: 'n', rotulo: 'Bugs' }]}
          />
          <Leia>A lista de causas é provisória até a decisão final do critério.</Leia>
        </div>
      )}
    </CartaoComplementar>
  )
}
