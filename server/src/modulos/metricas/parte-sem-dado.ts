/**
 * Pedido 065 (K-205): na base real, a parte de bloqueio do O1 e O2 sai `null` (nunca 0) com a nota `bloqueio-sem-dado-real`,
 * porque a coleta ainda não grava os bloqueios. Não calcula nada: não soma, não refaz percentil, não muda `n`. É publicação, como a H-24.
 */
import type { MetricaId, NotaCartaoId, NotaSustentacaoId } from '@metricas-dspd/contratos';

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
  if (id === 'S2') return comNotaSust(r, 'excecao-sla-sem-fonte');
  return resultado;
}
