/**
 * Pedido 065 (K-205): com `BLOQUEIOS_COM_DADO_REAL` falso (reversão), a parte de bloqueio do O1 sai `null` (nunca 0).
 * Pedido 075, lote 9b: a nota `bloqueio-sem-dado-real` não existe mais no contrato; o O2 passa sem mudança.
 * Não calcula nada: não soma, não refaz percentil, não muda `n`. É publicação, como a H-24.
 */
import { DATA_BLOQUEIO_COM_DADO_REAL } from '@metricas-dspd/metricas';
import type { MetricaId, NotaSustentacaoId } from '@metricas-dspd/contratos';

type Linha = Record<string, unknown>;

const nulaBloqueados = (l: unknown): unknown => ({ ...(l as Linha), bloqueados: null });
const nulaLista = (l: unknown): unknown => (l as unknown[] | null)?.map(nulaBloqueados) ?? null;

/** O resultado da biblioteca sempre traz os campos abaixo (contrato `resultadoO1`); `porColuna` é `null` sem equipe única. */
export function semParteDeBloqueio(id: MetricaId, resultado: unknown): unknown {
  const r = resultado as Linha;
  if (id === 'O1') {
    return { ...r, hoje: nulaBloqueados(r.hoje), porColuna: nulaLista(r.porColuna), porTipoColuna: nulaLista(r.porTipoColuna), serie: nulaLista(r.serie) };
  }
  return resultado;
}

type NotaSust = NotaSustentacaoId;
const comNotaSust = (r: Linha, nota: NotaSust): Linha => {
  const atuais = (r.notas as NotaSust[] | undefined) ?? [];
  return { ...r, notas: atuais.includes(nota) ? atuais : [...atuais, nota] };
};

/**
 * Pedido 069, L9-a (K-220): na base real, enquanto `prioridade_ajustada_manualmente` não vem da fonte, o S3 publica
 * `ajustesManuais: null` (nunca 0) com a nota, e o S2 traz a nota da exceção de SLA sem fonte. Só publicação: nada é recalculado.
 */
export function semParteDeAjusteDePrioridade(id: MetricaId, resultado: unknown): unknown {
  const r = resultado as Linha;
  if (id === 'S3') {
    const meses = (r.meses as Linha[]).map((m) => ({ ...m, ajustesManuais: null }));
    return comNotaSust({ ...r, meses }, 'ajuste-prioridade-sem-dado-real');
  }
  // Pedido 077, L6a: a tendência de SLA herda a ressalva do S2, nas mesmas condições.
  if (id === 'S2' || id === 'TENDENCIA_SUST') return comNotaSust(r, 'excecao-sla-sem-fonte');
  return resultado;
}

/**
 * Pedido 075, lote 6a (CA-7, P-075-6): com o interruptor ligado, os pontos da série do O1 anteriores à data da versão de
 * critério saem com `bloqueados: null` (lacuna, nunca zero). Desligado, devolve o resultado como veio. Só publicação.
 */
export function comCorteDaSerieO1(id: MetricaId, resultado: unknown, ligado: boolean, desde: string = DATA_BLOQUEIO_COM_DADO_REAL): unknown {
  if (!ligado || id !== 'O1') return resultado;
  const r = resultado as Linha;
  const serie = (r.serie as Linha[]).map((p) => ((p.data as string) < desde ? { ...p, bloqueados: null } : p));
  return { ...r, serie };
}
