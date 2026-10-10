import type { Dominio, EventoColeta } from '@metricas-dspd/contratos'

import {
  CALENDARIO_PADRAO,
  MS_DIA,
  diaDeIso,
  instanteDe,
  isoLocal,
} from '@metricas-dspd/metricas/core'
import type { BaseMock } from './index'
import { derivar } from './prng'

/** Cenário padrão (plano integracao-real §3). Fora da BaseMock: o hash da base não muda (D4). */
const INICIO = { businessmap: '2026-01-05', acelerato: '2026-09-15' } as const
const FALHA_BM = '2026-10-09'
const MIN_06H = 360

export type ColetasMock = Record<Dominio, EventoColeta[]>

export function gerarColetasMock(base: BaseMock): ColetasMock {
  const hoje = Date.parse(base.config.hoje)
  return {
    businessmap: gerar('businessmap', base, hoje),
    acelerato: gerar('acelerato', base, hoje),
  }
}

function gerar(dominio: Dominio, base: BaseMock, hoje: number): EventoColeta[] {
  const prng = derivar(base.config.semente, `coletas:${dominio}`)
  const prefixo = dominio === 'businessmap' ? 'bm' : 'ac'
  const eventos: EventoColeta[] = []
  for (let dia = diaDeIso(INICIO[dominio]); ; dia++) {
    const inicioMs = instanteDe(dia, MIN_06H, CALENDARIO_PADRAO)
    if (inicioMs > hoje) break
    const diaIso = isoLocal(inicioMs).slice(0, 10)
    const duracaoMs = Math.round(20_000 + prng() * 70_000)
    const fimMs = inicioMs + duracaoMs
    const base_ = {
      id: `${prefixo}-${diaIso}`,
      inicio: isoLocal(inicioMs),
      fim: isoLocal(fimMs),
      duracaoMs,
    }
    if (dominio === 'businessmap' && diaIso === FALHA_BM) {
      eventos.push({
        ...base_,
        resultado: 'falha',
        tipoErro: 'tempo-esgotado',
        efeito: 'anteriores-mantidos',
        contagens: null,
      })
      continue
    }
    eventos.push({
      ...base_,
      resultado: 'ok',
      tipoErro: null,
      efeito: 'aplicada',
      contagens: contagens(dominio, base, inicioMs, fimMs, prng()),
    })
  }
  return eventos
}

/** Lê a base só para contar (nunca a altera). */
function contagens(dominio: Dominio, base: BaseMock, inicioMs: number, fimMs: number, r: number) {
  const dia = inicioMs - MS_DIA
  const novos =
    dominio === 'businessmap'
      ? base.bm.cards.filter((c) => c.criado_em > dia && c.criado_em <= inicioMs).length
      : base.ac.chamados.filter((c) => c.aberto_em > dia && c.aberto_em <= inicioMs).length
  const atualizados = Math.round(r * 10)
  return {
    lidos: novos + atualizados,
    novos,
    atualizados,
    arquivadosPreservados:
      dominio === 'businessmap'
        ? base.bm.cards.filter((c) => c.arquivado_em !== null && c.arquivado_em <= fimMs).length
        : 0,
    excluidosPreservados:
      dominio === 'businessmap'
        ? base.bm.cards.filter((c) => c.excluido_em !== null && c.excluido_em <= fimMs).length
        : base.ac.chamados.filter((c) => c.excluido).length,
  }
}
