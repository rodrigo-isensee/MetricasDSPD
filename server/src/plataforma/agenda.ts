import type { Fonte } from './config.js';

/** Horário local (America/Sao_Paulo, UTC-3 fixo como em `isoLocal`) da execução. */
export type Periodicidade =
  | { tipo: 'diaria'; hora: number; minuto: number }
  | { tipo: 'semanal'; diaSemana: number; hora: number; minuto: number };

export type Tarefa = { nome: string; fonte: Fonte; periodicidade: Periodicidade; executar: () => Promise<void> };

const DESLOCAMENTO_MS = -3 * 3_600_000;
const DIA_MS = 86_400_000;

/** Último instante agendado que já passou (<= agora), em UTC. */
export function ultimoAgendado(p: Periodicidade, agora: Date): Date {
  const local = new Date(agora.getTime() + DESLOCAMENTO_MS);
  const meiaNoite = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  let alvo = meiaNoite + (p.hora * 60 + p.minuto) * 60_000;
  if (alvo > local.getTime()) alvo -= DIA_MS;
  if (p.tipo === 'semanal') {
    const diaDoAlvo = new Date(alvo).getUTCDay();
    alvo -= ((diaDoAlvo - p.diaSemana + 7) % 7) * DIA_MS;
  }
  return new Date(alvo - DESLOCAMENTO_MS);
}

/** Devida quando nunca rodou ou a última execução é anterior ao último horário agendado. Repetir é seguro (idempotente). */
export const devida = (t: Tarefa, agora: Date, ultima: Date | null): boolean =>
  ultima === null || ultima.getTime() < ultimoAgendado(t.periodicidade, agora).getTime();
