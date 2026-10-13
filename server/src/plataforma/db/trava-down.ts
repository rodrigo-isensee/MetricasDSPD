import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Arquivo que `scripts/db-backup.sh` grava (só depois de verificar o dump) com a data do último backup bom, em Brasília. */
export const ARQUIVO_BACKUP_OK = 'ultimo-backup-ok';

/** Data civil (AAAA-MM-DD) em America/Sao_Paulo: o "dia" do backup é o de Brasília, não o UTC. */
export const hojeEmBrasilia = (agora: Date): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(agora);

export type EntradaTravaDown = {
  comando: string;
  prefixo: string;
  permitir: string | undefined;
  /** Conteúdo do arquivo de confirmação do backup (`undefined` = sem diretório ou sem arquivo). */
  confirmacaoBackup: string | undefined;
  agora: Date;
};

/**
 * C2: `down` e `redo` apagam dados. Sem prefixo de teste (ou seja, sobre os schemas reais) só passam com
 * `DSPD_PERMITIR_DOWN=1` e com o backup de hoje confirmado. Devolve o motivo da recusa, ou `null` se pode seguir.
 */
export function motivoDeRecusa(e: EntradaTravaDown): string | null {
  if (e.comando !== 'down' && e.comando !== 'redo') return null;
  if (e.prefixo !== '') return null;
  if (e.permitir !== '1') {
    return `${e.comando} recusado: sem DSPD_SCHEMA_PREFIXO ele apagaria os schemas reais. Para forçar, defina DSPD_PERMITIR_DOWN=1 (e tenha o backup de hoje).`;
  }
  const hoje = hojeEmBrasilia(e.agora);
  if (e.confirmacaoBackup?.trim() !== hoje) {
    return `${e.comando} recusado: backup de hoje (${hoje}) não confirmado em DSPD_BACKUP_DIR/${ARQUIVO_BACKUP_OK}. Rode scripts/db-backup.sh antes.`;
  }
  return null;
}

/** Lê a confirmação em `<dir>/ultimo-backup-ok`; sem diretório configurado ou sem arquivo, `undefined`. */
export function lerConfirmacaoBackup(dir: string | undefined): string | undefined {
  if (!dir) return undefined;
  try {
    return readFileSync(join(dir, ARQUIVO_BACKUP_OK), 'utf8');
  } catch {
    return undefined;
  }
}
