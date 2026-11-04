/**
 * Pedido 065 (K-205): na base real, a parte de bloqueio do O1 e O2 sai `null` (nunca 0) com a nota `bloqueio-sem-dado-real`,
 * porque a coleta ainda não grava os bloqueios. Não calcula nada: não soma, não refaz percentil, não muda `n`. É publicação, como a H-24.
 */
import type { MetricaId, NotaCartaoId } from '@metricas-dspd/contratos';

const NOTA: NotaCartaoId = 'bloqueio-sem-dado-real';

type Linha = Record<string, unknown>;

const nulaBloqueados = (l: unknown): unknown => ({ ...(l as Linha), bloqueados: null });
const nulaLista = (l: unknown): unknown => (l as unknown[] | null)?.map(nulaBloqueados) ?? null;

function comNota(r: Linha): Linha {
  const atuais = (r.notas as NotaCartaoId[] | undefined) ?? [];
  return { ...r, notas: atuais.includes(NOTA) ? atuais : [...atuais, NOTA] };
}

/** O resultado da biblioteca sempre traz os campos abaixo (contrato `resultadoO1`); `porColuna` é `null` sem equipe única. */
export function semParteDeBloqueio(id: MetricaId, resultado: unknown): unknown {
  const r = resultado as Linha;
  if (id === 'O1') {
    return comNota({ ...r, hoje: nulaBloqueados(r.hoje), porColuna: nulaLista(r.porColuna), porTipoColuna: nulaLista(r.porTipoColuna), serie: nulaLista(r.serie) });
  }
  if (id === 'O2') return comNota(r);
  return resultado;
}
