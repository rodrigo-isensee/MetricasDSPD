import { CALENDARIO_PADRAO, MS_HORA, horasUteisEntre, type Calendario } from '@metricas-dspd/metricas/core';
import { etapaDaBiblioteca, type EtapaTotal } from './normalizador.js';

/**
 * Tempo por etapa da ferramenta (D-7, plano §3 e §3.6) na forma que a biblioteca consome. A origem só tem o TOTAL por etapa (`tempoSla`,
 * segundos), sem instante de entrada e saída. A biblioteca (T2.5) calcula horas úteis sobre intervalos; para ela devolver exatamente o
 * total da ferramenta, cada etapa vira um intervalo que TERMINA em `data_finalizado` do chamado e começa onde a própria função de horas
 * úteis da biblioteca (`horasUteisEntre`, calendário padrão) fecha o total. Os instantes são uma representação, não um fato: servem à
 * janela (o fim) e ao cálculo (a duração). Só chamado fechado gera intervalos (como o dash, que também só olha fechados). O que a
 * ferramenta não informa (ordem das etapas, saída de Pendente, previsão de retorno) não é inventado. Critério versionado em
 * `ref_versao_criterio` (D-7) e marcado nos gráficos de S4, S9 e S10 (T2.6).
 */
export type IntervaloEtapa = { etapa: string; entrada: Date; saida: Date; horas: number };

/** Teto da busca: 20 anos de relógio. Acima disso a etapa não ganha intervalo (contada). */
const TETO_MS = 20 * 366 * 24 * MS_HORA;

/**
 * Maior instante `t` (ms) tal que as horas úteis entre `t` e `fim` ainda sejam pelo menos `horas`. `null` se `horas` não é positiva e
 * finita ou se nem o teto de busca alcança o total. Busca binária sobre a função da biblioteca; sem fórmula própria de calendário.
 */
export function entradaPorHorasUteis(fim: number, horas: number, cal: Calendario = CALENDARIO_PADRAO): number | null {
  if (!Number.isFinite(horas) || horas <= 0) return null;
  let passo = Math.min(Math.max(MS_HORA, horas * MS_HORA), TETO_MS);
  let baixo = fim - passo;
  while (horasUteisEntre(baixo, fim, cal) < horas) {
    if (passo >= TETO_MS) return null;
    passo *= 2;
    baixo = fim - passo;
  }
  let alto = fim; // horas úteis(alto, fim) = 0 < horas
  while (alto - baixo > 1) {
    const meio = Math.floor((baixo + alto) / 2);
    if (horasUteisEntre(meio, fim, cal) >= horas) baixo = meio; else alto = meio;
  }
  return baixo;
}

export type ResultadoSintese = { intervalos: IntervaloEtapa[]; semIntervalo: number };

/**
 * Totais por etapa -> intervalos que terminam em `dataFinalizado`. Etapas com o mesmo nome da biblioteca somam; total zero, negativo ou
 * ausente não gera linha (não é passagem de fato); total que não cabe na busca é contado em `semIntervalo`.
 */
export function intervalosDasEtapas(dataFinalizado: Date, etapas: readonly EtapaTotal[], cal: Calendario = CALENDARIO_PADRAO): ResultadoSintese {
  const somas = new Map<string, number>();
  for (const e of etapas) {
    const nome = etapaDaBiblioteca(e.descricao);
    const segundos = e.tempo_sla_segundos;
    if (nome === null || segundos === null || segundos <= 0) continue;
    somas.set(nome, (somas.get(nome) ?? 0) + segundos);
  }
  const fim = dataFinalizado.getTime();
  const intervalos: IntervaloEtapa[] = [];
  let semIntervalo = 0;
  for (const [etapa, segundos] of [...somas].sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))) {
    const horas = segundos / 3600;
    const entrada = entradaPorHorasUteis(fim, horas, cal);
    if (entrada === null) semIntervalo += 1; else intervalos.push({ etapa, entrada: new Date(entrada), saida: dataFinalizado, horas });
  }
  return { intervalos, semIntervalo };
}
