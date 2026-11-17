import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { CartaoMetrica, RegiaoRolavel } from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtInteiro, fmtPct } from '@/lib/formatar'
import { NOTAS_TATICO } from '../notas'
import { propsCartao } from '@/features/painel/propsCartao'
import { LeiaJunto } from '@/features/complementares/LeiaJunto'

const ESTILOS = {
  concluidas: { background: 'var(--serie-1)' },
  andamento: {
    background: 'repeating-linear-gradient(45deg, var(--serie-1) 0 2px, transparent 2px 5px)',
  },
  aFazer: { border: '1px solid var(--texto-2)' },
  adicionadas: {
    background:
      'repeating-linear-gradient(45deg, var(--serie-2) 0 2px, transparent 2px 5px), repeating-linear-gradient(-45deg, var(--serie-2) 0 2px, transparent 2px 5px)',
  },
} as const

export function CartaoT9({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('T9', filtros)
  const d = q.dados
  // Ordem padrão da spec: maior crescimento de escopo (é por projeto, não por pessoa).
  const projetos = d
    ? [...d.projetos].sort((a, b) => b.crescimentoEscopoPct - a.crescimentoEscopoPct)
    : []
  const semInicio = d?.projetosSemInicio ?? 0
  const p0 = projetos[0]
  const leitura = p0
    ? `O projeto ${p0.projeto} tem ${fmtInteiro(p0.concluidas)} de ${fmtInteiro(p0.totalFrentes)} ${p0.totalFrentes === 1 ? 'frente concluída' : 'frentes concluídas'} (${fmtPct(p0.avancoPct)}). ${fmtInteiro(p0.adicionadas)} ${p0.adicionadas === 1 ? 'frente foi adicionada' : 'frentes foram adicionadas'} depois do início: ${p0.originais === 0 ? 'o projeto não tem frente original' : `o escopo cresceu ${fmtPct(p0.crescimentoEscopoPct)}`}.`
    : undefined
  const notaSemInicio =
    semInicio > 0
      ? `${fmtInteiro(semInicio)} ${semInicio === 1 ? 'projeto' : 'projetos'} sem data de início ${semInicio === 1 ? 'ficou' : 'ficaram'} fora desta conta.`
      : ''
  return (
    <CartaoMetrica
      {...propsCartao('T9', q, NOTAS_TATICO.T9)}
      baseVariante="censo"
      {...(leitura ? { leitura } : {})}
      semTabela
      {...(notaSemInicio
        ? {
            complementoVazio: (
              <p className="text-sm" data-testid="t9-nota-vazio">
                Fora da conta: {notaSemInicio}
              </p>
            ),
          }
        : {})}
      className="lg:col-span-6"
    >
      {d && (
        <div className="flex flex-col gap-3">
          <p className="text-sm" data-testid="t9-nota-escopo">
            Contamos como adicionada a frente criada depois do início do projeto. O sistema não
            registra quando a frente foi ligada ao projeto; por isso a frente criada antes do início
            e ligada depois conta como original.
            {notaSemInicio && ` ${notaSemInicio}`}
          </p>
          <ul className="flex flex-wrap gap-3 text-sm" aria-label="Legenda das barras">
            <li>Concluídas: sólido</li>
            <li>Em andamento: listras finas</li>
            <li>A fazer: contorno</li>
            <li>Adicionadas após o início: hachura cruzada</li>
          </ul>
          <RegiaoRolavel rotulo="Avanço e escopo por projeto" testid="tabela-T9">
            <table className="w-full text-sm">
              <caption className="sr-only">Avanço real e escopo por projeto</caption>
              <thead>
                <tr>
                  <th scope="col" className="px-2 py-1 text-left">
                    Projeto
                  </th>
                  <th scope="col" className="px-2 py-1 text-left">
                    Frentes
                  </th>
                  <th scope="col" className="px-2 py-1 text-left">
                    Avanço e escopo
                  </th>
                </tr>
              </thead>
              <tbody>
                {projetos.map((p) => (
                  <tr key={p.projetoId} className="border-t border-borda">
                    <th scope="row" className="px-2 py-1 text-left font-medium">
                      {p.projeto}
                    </th>
                    <td className="px-2 py-1">
                      <div
                        aria-hidden="true"
                        className="flex h-4 w-48 gap-px overflow-hidden rounded"
                      >
                        {(['concluidas', 'andamento', 'aFazer', 'adicionadas'] as const).map(
                          (k) => {
                            const n =
                              k === 'concluidas'
                                ? p.concluidas
                                : k === 'andamento'
                                  ? p.emAndamento
                                  : k === 'aFazer'
                                    ? p.aFazer
                                    : p.adicionadas
                            return n > 0 ? (
                              <span key={k} style={{ ...ESTILOS[k], flexGrow: n }} />
                            ) : null
                          },
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-1">
                      {fmtInteiro(p.concluidas)} de {fmtInteiro(p.totalFrentes)} frentes (
                      {fmtPct(p.avancoPct)}) ·{' '}
                      {p.originais === 0 ? (
                        <>
                          Escopo sem frente original (+{fmtInteiro(p.adicionadas)}{' '}
                          {p.adicionadas === 1 ? 'frente' : 'frentes'})
                        </>
                      ) : (
                        <>
                          Escopo cresceu {fmtPct(p.crescimentoEscopoPct)} (+
                          {fmtInteiro(p.adicionadas)} {p.adicionadas === 1 ? 'frente' : 'frentes'};{' '}
                          {fmtInteiro(p.originais)} originais)
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </RegiaoRolavel>
          <LeiaJunto id="t9" />
        </div>
      )}
    </CartaoMetrica>
  )
}
