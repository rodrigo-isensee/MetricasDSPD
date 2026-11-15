/**
 * Pedido 065 (K-205): com `BLOQUEIOS_COM_DADO_REAL` falso (reversão), a parte de bloqueio do O1 sai `null` (nunca 0).
 * Pedido 075, lote 9b: a nota `bloqueio-sem-dado-real` não existe mais no contrato; o O2 passa sem mudança.
 * Não calcula nada: não soma, não refaz percentil, não muda `n`. É publicação, como a H-24.
 */
import { DATA_BLOQUEIO_COM_DADO_REAL } from '@metricas-dspd/metricas';
import type { MetricaId, NotaMotivosId, NotaS12Id, NotaS1Id, NotaSustentacaoId } from '@metricas-dspd/contratos';

const NOTA_S12: NotaS12Id = 'excecao-sla-s12-sem-fonte';
const NOTA_S1: NotaS1Id = 'primeiro-atendimento-inclui-automatica';

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

/** Junta a nota às que o resultado já traz, sem repetir (serve a qualquer enum de nota do contrato). */
const comNota = <T extends string>(r: Linha, nota: T): Linha => {
  const atuais = (r.notas as T[] | undefined) ?? [];
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
    return comNota<NotaSustentacaoId>({ ...r, meses }, 'ajuste-prioridade-sem-dado-real');
  }
  return resultado;
}

/**
 * Nota do S2 e da tendência da sustentação: a exceção de SLA por registro posterior não tem fonte, então todo chamado fechado conta como apurável.
 * Independe do ajuste de prioridade (pedido 105, D2: o interruptor do ajuste ligou e esta ressalva continua). Só publicação.
 */
export function comNotaExcecaoSlaSemFonte(id: MetricaId, resultado: unknown): unknown {
  if (id === 'S2' || id === 'TENDENCIA_SUST') return comNota<NotaSustentacaoId>(resultado as Linha, 'excecao-sla-sem-fonte');
  return resultado;
}

/**
 * Pedido 105 (D2): o S5 real não tem fonte para "Risco de estouro de SLA" (o campo do Acelerato não traz o valor): a faixa sai com n = 0 e a nota
 * diz por quê. Em todo S5 real, com ou sem amostra. Só publicação: nada é recalculado.
 */
export function comNotaS5SemRisco(id: MetricaId, resultado: unknown): unknown {
  return id === 'S5' ? comNota<NotaMotivosId>(resultado as Linha, 's5-risco-sla-sem-fonte') : resultado;
}

/**
 * Pedido 105 (D2, A2 do review): o S3 e o S7 reais contam o mesmo campo, e a coleta não separa "Não" de campo vazio (só "Sim" conta); a nota
 * (texto neutro, id `s7-nao-igual-vazio`) vai nos dois. No S3 sem dado real (ajustes `null`) ela não se aplica. Só publicação.
 */
export function comNotaAjusteNaoIgualVazio(id: MetricaId, resultado: unknown): unknown {
  if (id !== 'S3' && id !== 'S7') return resultado;
  const r = resultado as Linha;
  if (((r.notas as string[] | undefined) ?? []).includes('ajuste-prioridade-sem-dado-real')) return resultado;
  return comNota<NotaMotivosId>(r, 's7-nao-igual-vazio');
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

/** Pedido 099 (D9): o S12 sem fonte da exceção de SLA (`excecaoSla: null`) traz a nota. Só publicação: nada é recalculado. */
export function comNotaS12SemFonte(id: MetricaId, resultado: unknown): unknown {
  if (id !== 'S12') return resultado;
  const r = resultado as Linha;
  if (r.excecaoSla !== null) return resultado;
  const atuais = (r.notas as NotaS12Id[] | undefined) ?? [];
  return { ...r, notas: atuais.includes(NOTA_S12) ? atuais : [...atuais, NOTA_S12] };
}

/**
 * Pedido 099 (D4, Q-099-5b = A): o primeiro atendimento do S1 real é o primeiro comentário da tabela, que inclui resposta automática. A nota
 * vai em todo S1 real, com ou sem amostra (a ressalva é da fonte, não do volume). Só publicação: nada é recalculado.
 */
export function comNotaS1PrimeiroAtendimento(id: MetricaId, resultado: unknown): unknown {
  if (id !== 'S1') return resultado;
  const r = resultado as Linha;
  const atuais = (r.notas as NotaS1Id[] | undefined) ?? [];
  return { ...r, notas: atuais.includes(NOTA_S1) ? atuais : [...atuais, NOTA_S1] };
}
