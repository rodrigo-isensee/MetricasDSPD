import type { Dominio } from '@metricas-dspd/contratos'
import { Botao, EsqueletoCartao, Icone } from '@/components/ui'
import { useEstadoColeta } from '@/data'
import { NOME_FONTE } from '@/features/coleta/fontes'

/** Conteúdo de UMA fonte: carregando, erro com "Tentar de novo", vazio ou as seções (CA-20). */
export function PainelFonte({ dominio }: { dominio: Dominio }) {
  const q = useEstadoColeta(dominio)
  const nome = NOME_FONTE[dominio]
  if (q.isPending)
    return <EsqueletoCartao codigo={`DADOS-${dominio}`} titulo={`dados do ${nome}`} altura={420} />
  if (q.isError)
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-2 rounded-md border border-alerta bg-alerta-fundo p-4 text-sm"
        data-testid={`dados-erro-${dominio}`}
      >
        <p className="flex items-center gap-2 font-semibold text-alerta">
          <Icone nome="alerta" /> Não foi possível carregar os dados desta fonte
        </p>
        <p>Tivemos um problema ao ler as coletas do {nome}.</p>
        <Botao onClick={() => void q.refetch()}>Tentar de novo</Botao>
      </div>
    )
  if (q.data.ultimaTentativa === null)
    return (
      <div
        className="flex flex-col items-start gap-2 rounded-md border border-dashed border-borda-controle p-4 text-sm"
        data-testid={`dados-vazio-${dominio}`}
      >
        <p className="flex items-center gap-2 font-semibold">
          <Icone nome="info" /> Ainda não há coletas desta fonte
        </p>
        <p className="text-texto-2">A primeira coleta acontece no próximo ciclo diário.</p>
      </div>
    )
  return <div data-testid={`dados-conteudo-${dominio}`} />
}
