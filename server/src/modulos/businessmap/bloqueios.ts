import { createHash } from 'node:crypto';
import { colunasDeLista } from './normalizador.js';

// Lote 2a do pedido 075 (ADR 0029): derivador puro, via A. Das versões de um card no `stg_card` deriva início e fim de bloqueio
// por `is_blocked` e pelos marcos de saída (arquivado, descartado, excluído, entregue; lote 2b). Sem banco, sem relógio. Nenhuma tradução de motivo.

export type VersaoBloqueio = {
  cardId: string; coletadoEm: string; isBlocked?: unknown; blockReasonId?: unknown; columnId?: unknown;
  archivedAt?: unknown; excluidoDetectado?: boolean; customFields?: unknown;
};
/** Colunas de papel `entrega` e de descarte NA VIGÊNCIA da referência no instante da versão (A1 do review do 4a); o card nelas, arquivado ou excluído está num marco de saída. */
export type MarcosBloqueio = { entrega?: (colunaId: string, em: string) => boolean; descarte?: (colunaId: string, em: string) => boolean };
export type EventoBloqueio = {
  tipo: 'inicio' | 'fim'; idOrigem: string; ocorridoEm: string; motivoCodigo: string | null;
  colunaId: string | null; fornecedorCodigo: string | null;
};
export type ResultadoBloqueios = { eventos: EventoBloqueio[]; notas: string[] };

const PADRAO_MOTIVO = /^\d{1,10}$/;

const bloqueada = (v: unknown): boolean => v === true || v === 1;

/** Inteiro decimal sem zeros à esquerda (`'0034'` e 34 dão `'34'`); fora de `^\d{1,10}$` vira null. */
function codigoDe(v: unknown): string | null {
  const t = typeof v === 'number' && Number.isInteger(v) ? String(v) : v;
  return typeof t === 'string' && PADRAO_MOTIVO.test(t) ? String(Number(t)) : null;
}

function idOrigemDe(cardId: string, coletadoEm: string): string {
  return createHash('sha256').update(`${cardId}|${coletadoEm}`).digest('hex').slice(0, 32);
}

/** `versoes` em ordem de `stg_sk`; `mapaCampos` = `camposLista` do normalizador (field_id para coluna). */
export function derivarBloqueios(
  versoes: readonly VersaoBloqueio[], marcos: MarcosBloqueio = {}, mapaCampos: ReadonlyMap<string, string> = new Map(),
): ResultadoBloqueios {
  const eventos: EventoBloqueio[] = [];
  const notas: string[] = [];
  let aberto: EventoBloqueio | null = null;
  const soFornecedor = new Map([...mapaCampos].filter(([, coluna]) => coluna === 'fornecedor'));
  for (const v of versoes) {
    if (Number.isNaN(Date.parse(v.coletadoEm))) throw new RangeError('coletadoEm inválido');
    const valido = v.isBlocked === true || v.isBlocked === 1 || v.isBlocked === false || v.isBlocked === 0;
    if (!valido) notas.push('is_blocked_invalido');
    const agora = valido ? bloqueada(v.isBlocked) : aberto !== null;
    const colunaId = codigoDe(v.columnId);
    const arquivadoMs = v.archivedAt instanceof Date ? v.archivedAt.getTime() : typeof v.archivedAt === 'string' ? Date.parse(v.archivedAt) : NaN;
    const noMarco = !Number.isNaN(arquivadoMs) || v.excluidoDetectado === true
      || (colunaId !== null && (marcos.entrega?.(colunaId, v.coletadoEm) === true || marcos.descarte?.(colunaId, v.coletadoEm) === true));
    if (aberto !== null && (noMarco || !agora)) {
      // marco fecha no instante dele (arquivado nativo, nunca depois da coleta: SEG-A1) ou da coleta; antes do início observado, fim = início (P-075-9)
      const coletaMs = Date.parse(v.coletadoEm);
      const marcoMs = Math.max(Number.isNaN(arquivadoMs) ? coletaMs : Math.min(arquivadoMs, coletaMs), Date.parse(aberto.ocorridoEm));
      const ocorridoEm = noMarco ? new Date(marcoMs).toISOString() : v.coletadoEm;
      eventos.push({ tipo: 'fim', idOrigem: aberto.idOrigem, ocorridoEm, motivoCodigo: null, colunaId, fornecedorCodigo: null });
      aberto = null;
    } else if (agora && aberto === null && !noMarco) {
      // inclui a reabertura depois de marco (TL-A5); dentro do marco, bloqueado não abre nada (TL-A9)
      const motivoCodigo = codigoDe(v.blockReasonId);
      if (motivoCodigo === null) notas.push('motivo_codigo_invalido');
      const fornecedorCodigo = colunasDeLista({ custom_fields: v.customFields }, soFornecedor, notas).fornecedor;
      aberto = { tipo: 'inicio', idOrigem: idOrigemDe(v.cardId, v.coletadoEm), ocorridoEm: v.coletadoEm, motivoCodigo, colunaId, fornecedorCodigo };
      eventos.push(aberto);
    }
  }
  return { eventos, notas };
}
