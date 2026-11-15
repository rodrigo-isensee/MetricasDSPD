import { readdirSync } from 'node:fs';
import { DIR_MIGRACOES } from '../../src/plataforma/db/migrar.js';

/** Nomes das migrações de número >= `numero`, da mais nova para a mais antiga (a ordem em que o down desfaz). */
export function migracoesDesde(numero: number): string[] {
  return readdirSync(DIR_MIGRACOES)
    .filter((f) => /^\d{4}_.+\.ts$/.test(f))
    .map((f) => f.replace(/\.ts$/, ''))
    .filter((n) => Number(n.slice(0, 4)) >= numero)
    .sort()
    .reverse();
}

/** Quantas migrações o down precisa desfazer para voltar ao estado anterior à de número `numero`; não presume qual é a última. */
export function quantasDesde(numero: number): number {
  return migracoesDesde(numero).length;
}
