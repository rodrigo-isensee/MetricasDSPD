import { createHash } from 'node:crypto';

// Lote 2a do pedido 075 (ADR 0029): derivador puro, via A. Das versões de um card no `stg_card` deriva início e fim de bloqueio
// só por `is_blocked`. Sem banco, sem relógio. Marcos de saída e fornecedor ficam para o lote 2b. Nenhuma tradução de motivo.

export type VersaoBloqueio = {
  cardId: string; coletadoEm: string; isBlocked?: unknown; blockReasonId?: unknown; columnId?: unknown;
};
export type EventoBloqueio = {
  tipo: 'inicio' | 'fim'; idOrigem: string; ocorridoEm: string; motivoCodigo: string | null;
  colunaId: string | null; fornecedorCodigo: string | null;
};
export type ResultadoBloqueios = { eventos: EventoBloqueio[]; notas: string[] };

const PADRAO_MOTIVO = /^\d{1,10}$/;

const bloqueada = (v: unknown): boolean => v === true || v === 1;

function motivoDe(v: unknown): string | null {
  const t = typeof v === 'number' && Number.isInteger(v) ? String(v) : v;
  return typeof t === 'string' && PADRAO_MOTIVO.test(t) ? t : null;
}

function idOrigemDe(cardId: string, coletadoEm: string): string {
  return createHash('sha256').update(`${cardId}|${coletadoEm}`).digest('hex').slice(0, 32);
}

/** `versoes` em ordem de `stg_sk`. `marcos` e `mapaCampos` entram no lote 2b. */
export function derivarBloqueios(
  versoes: readonly VersaoBloqueio[], _marcos?: unknown, _mapaCampos?: unknown,
): ResultadoBloqueios {
  void _marcos; void _mapaCampos;
  const eventos: EventoBloqueio[] = [];
  const notas: string[] = [];
  let aberto: string | null = null;
  for (const v of versoes) {
    const agora = bloqueada(v.isBlocked);
    const colunaId = typeof v.columnId === 'string' || typeof v.columnId === 'number' ? String(v.columnId) : null;
    if (agora && aberto === null) {
      aberto = idOrigemDe(v.cardId, v.coletadoEm);
      const motivoCodigo = motivoDe(v.blockReasonId);
      if (motivoCodigo === null) notas.push('motivo_codigo_invalido');
      eventos.push({ tipo: 'inicio', idOrigem: aberto, ocorridoEm: v.coletadoEm, motivoCodigo, colunaId, fornecedorCodigo: null });
    } else if (!agora && aberto !== null) {
      eventos.push({ tipo: 'fim', idOrigem: aberto, ocorridoEm: v.coletadoEm, motivoCodigo: null, colunaId, fornecedorCodigo: null });
      aberto = null;
    }
  }
  return { eventos, notas };
}
