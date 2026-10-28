import { Popover } from 'radix-ui'
import { Link } from 'react-router'
import type { Dominio } from '@metricas-dspd/contratos'
import { Botao, Icone, SeloFrescor } from '@/components/ui'
import { useEstadoColeta } from '@/data'
import { fmtDataHora } from '@/lib/formatar'
import { NOME_FONTE, ROTA_DADOS, SIGLA_FONTE } from './fontes'

interface Props {
  dominio: Dominio
  /** Mostra o nome da fonte antes do selo (páginas com as duas fontes, em blocos separados). */
  comNome?: boolean
  /**
   * Reserva a altura da linha extra do aviso de falha ("Coleta falhou em…"), que só aparece nesse estado: com ela o
   * cabeçalho não desce quando o estado chega (CLS do Resumo do Operacional, ADR 0003). A reserva é uma linha invisível
   * com o texto mais longo do aviso, que quebra como a real (a 375 px são duas linhas, não uma altura fixa) e fica em
   * todos os estados, para o cabeçalho também não subir quando o estado é "atual".
   */
  reservarFalha?: boolean
}

/** Texto mais longo do aviso de falha, só para reservar a altura (invisível). */
const TEXTO_FALHA_RESERVA =
  'Coleta falhou em 00/00/0000 00:00. Mostrando dados de 00/00/0000 00:00.'

/**
 * Frescor de UMA fonte no cabeçalho do painel: "Atualizado em", selo, "Detalhes da coleta" e, em falha, o aviso
 * de que os dados anteriores continuam na tela (CA-01, CA-03, CA-09). Nunca soma as duas fontes.
 */
export function FrescorFonte({ dominio, comNome = false, reservarFalha = false }: Props) {
  const q = useEstadoColeta(dominio)
  const nome = NOME_FONTE[dominio]
  const e = q.data
  return (
    <div
      className={`flex flex-col gap-1 text-sm${reservarFalha ? ' min-h-[50px]' : ''}`}
      data-testid={`frescor-${dominio}`}
      aria-busy={q.isPending || undefined}
    >
      {q.isPending && (
        // Reserva a altura da linha pronta (texto, selo, "Detalhes da coleta"): a linha invisível quebra como a real (IR-001).
        <div className="relative">
          <p role="status" className="absolute inset-x-0 top-0 text-texto-2">
            {comNome ? `${nome}: ` : ''}Verificando a coleta…
          </p>
          <p aria-hidden="true" className="invisible flex flex-wrap items-center gap-x-2 gap-y-1">
            {comNome && <span className="font-semibold">{nome}:</span>}
            <span>Atualizado em 00/00/0000 00:00</span>
            <SeloFrescor selo="atual" />
            <span className="alvo">Detalhes da coleta</span>
          </p>
        </div>
      )}
      {reservarFalha && q.isPending && (
        <p aria-hidden="true" className="invisible" data-testid={`reserva-falha-${dominio}`}>
          {TEXTO_FALHA_RESERVA}
        </p>
      )}
      {q.isError && (
        <p role="alert" className="flex flex-wrap items-center gap-2 text-alerta">
          <Icone nome="alerta" /> {comNome ? `${nome}: ` : ''}Não foi possível verificar a coleta.
          <Botao onClick={() => void q.refetch()} className="text-xs">
            Tentar de novo
          </Botao>
        </p>
      )}
      {e && (
        <>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {comNome && <span className="font-semibold">{nome}:</span>}
            <span className="text-texto-2">
              {e.ultimaOk
                ? `Atualizado em ${fmtDataHora(e.ultimaOk.fim)}`
                : 'Nenhuma coleta concluída'}
            </span>
            <SeloFrescor
              selo={e.selo}
              horas={e.horasDesdeUltimaOk}
              testid={`selo-frescor-${dominio}`}
            />
            {/* P2: o detalhe vira popover (sobreposto, não desloca o layout; CLS, ADR 0003 F2). */}
            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className="alvo text-acento underline"
                  data-testid={`detalhes-coleta-${dominio}`}
                  aria-label={`Detalhes da coleta do ${nome}`}
                >
                  Detalhes da coleta
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  align="start"
                  sideOffset={4}
                  collisionPadding={8}
                  className="z-50 flex max-w-[min(22rem,calc(100vw-1rem))] flex-col gap-2 rounded-md border border-borda-controle bg-superficie p-3 text-sm shadow-xl"
                  data-testid={`popover-coleta-${dominio}`}
                >
                  <p className="font-semibold">Coleta do {nome}</p>
                  <p>
                    {e.ultimaOk
                      ? `Última coleta concluída em ${fmtDataHora(e.ultimaOk.fim)}.`
                      : 'Nenhuma coleta concluída.'}
                  </p>
                  {e.ultimaTentativa && (
                    <p>Última tentativa em {fmtDataHora(e.ultimaTentativa.inicio)}.</p>
                  )}
                  <p className="text-texto-2">Cards arquivados e excluídos continuam na base.</p>
                  <Link
                    to={`${ROTA_DADOS}?fonte=${SIGLA_FONTE[dominio]}`}
                    className="alvo text-acento underline"
                  >
                    Abrir Dados e coletas do {nome}
                  </Link>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </p>
          {e.selo === 'falha' && e.ultimaTentativa && (
            <p className="text-texto-2" data-testid={`falha-coleta-${dominio}`}>
              Coleta falhou em {fmtDataHora(e.ultimaTentativa.inicio)}.
              {e.ultimaOk ? ` Mostrando dados de ${fmtDataHora(e.ultimaOk.fim)}.` : ''}
            </p>
          )}
          {reservarFalha && !(e.selo === 'falha' && e.ultimaTentativa) && (
            <p aria-hidden="true" className="invisible" data-testid={`reserva-falha-${dominio}`}>
              {TEXTO_FALHA_RESERVA}
            </p>
          )}
        </>
      )}
    </div>
  )
}
