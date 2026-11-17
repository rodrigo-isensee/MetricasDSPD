import type { Consultavel } from './pool.js';
import type { Esquemas } from './esquemas.js';
import { hojeEmBrasilia } from './trava-down.js';

/** Um passo do `vm:preparar`: `entrada` é o arquivo de `src/entradas/` (sem extensão); `opcional` só roda se o arquivo existir na versão. */
export type Passo = { nome: string; entrada: string; opcional?: boolean };

/**
 * Ordem do preparo da base na subida (K-396). Todos idempotentes e sem rede externa (nenhum chama BusinessMap nem Acelerato).
 * O calendário vem antes do `ac:ref-sync` (os alvos em dias úteis conferem o expediente gravado) e das reprojeções (que o comparam).
 * Fora de propósito: a primeira carga e o que só funciona depois dela: `bm:criterios-classe-servico` (só grava depois) e
 * `bm:ref-sync-apontamento` (recusa com "o tipo de card ... não existe em ref_tipo_card" numa base sem cards; já roda no timer semanal de referências).
 */
export const PASSOS: readonly Passo[] = [
  { nome: 'migrar', entrada: 'migrar' },
  { nome: 'ref:sync-calendario', entrada: 'ref-sync-calendario' },
  { nome: 'bm:ref-sync', entrada: 'ref-sync-businessmap' },
  { nome: 'ac:ref-sync', entrada: 'ref-sync-ac' },
  { nome: 'ac:reprojetar-etapas', entrada: 'reprojetar-etapas-ac' },
  { nome: 'ac:reprojetar-fluxo', entrada: 'reprojetar-fluxo-ac' },
  { nome: 'ac:reprojetar-escala', entrada: 'reprojetar-escala-ac', opcional: true },
  { nome: 'ac:criterios', entrada: 'criterios-ac' },
];

/** Nomes das migrações do diretório, como o runner os registra em `pgmigrations` (sem extensão; ignora oculto e `.json`). */
export const nomesDeMigracao = (arquivos: readonly string[]): string[] =>
  arquivos.filter((a) => !a.startsWith('.') && !a.endsWith('.json')).map((a) => a.replace(/\.[^.]+$/, '')).sort();

export type EstadoMigracoes = { aplicadas: number; pendentes: string[] };

/** Lê quais migrações já constam em `pgmigrations`. Sem a tabela (base virgem) nenhuma foi aplicada. */
export async function estadoDasMigracoes(db: Consultavel, S: Esquemas, nomes: readonly string[]): Promise<EstadoMigracoes> {
  const tabela = await db.query<{ existe: boolean }>('SELECT to_regclass($1) IS NOT NULL AS existe', [`${S.core}.pgmigrations`]);
  if (!tabela.rows[0]!.existe) return { aplicadas: 0, pendentes: [...nomes] };
  const feitas = new Set((await db.query<{ name: string }>(`SELECT name FROM ${S.core}.pgmigrations`)).rows.map((l) => l.name));
  return { aplicadas: feitas.size, pendentes: nomes.filter((n) => !feitas.has(n)) };
}

/**
 * A1 do review: o `up` do Compose já migra, então o backup vem ANTES. Com migração pendente sobre base que já tem migração aplicada, recusa
 * se o backup de hoje (Brasília) não foi confirmado (`DSPD_BACKUP_CONFIRMADO=AAAA-MM-DD` ou `<DSPD_BACKUP_DIR>/ultimo-backup-ok`).
 * Base virgem (nada aplicado) não tem o que perder; sem pendência não há migração.
 */
export function recusaDeBackup(e: EstadoMigracoes & { confirmacao: string | undefined; agora: Date }): string | null {
  if (e.pendentes.length === 0 || e.aplicadas === 0) return null;
  const hoje = hojeEmBrasilia(e.agora);
  if (e.confirmacao?.trim() === hoje) return null;
  return (
    `há ${e.pendentes.length} migração(ões) pendente(s) (${e.pendentes.join(', ')}) e o backup de hoje (${hoje}) não foi confirmado. ` +
    `Faça o backup (scripts/db-backup.sh) e suba de novo com DSPD_BACKUP_CONFIRMADO=${hoje} (ou DSPD_BACKUP_DIR com o ultimo-backup-ok de hoje)`
  );
}

export type ResultadoPreparo = { ok: true; feitos: string[] } | { ok: false; feitos: string[]; falhou: string; codigo: number };

/** Roda os passos em ordem e PARA no primeiro que falhar (código diferente de 0), dizendo qual foi. `rodar` devolve o código de saída. */
export async function executarPassos(
  passos: readonly Passo[],
  rodar: (p: Passo, indice: number, total: number) => Promise<number>,
): Promise<ResultadoPreparo> {
  const feitos: string[] = [];
  for (const [i, p] of passos.entries()) {
    const codigo = await rodar(p, i + 1, passos.length);
    if (codigo !== 0) return { ok: false, feitos, falhou: p.nome, codigo };
    feitos.push(p.nome);
  }
  return { ok: true, feitos };
}

/** Texto final de sucesso: o que fica de fora de propósito e o próximo passo (a primeira carga é manual, com o dono). */
export const PROXIMO_PASSO =
  'Base preparada. Próximo passo (manual, com o dono presente; não faz parte da subida): primeira carga do BusinessMap ' +
  '(`bm:coleta carga-inicial --projetar`), do Apontamento (`bm:apontamento carga-inicial`) e do Acelerato (`coleta ac`); só depois ' +
  '`bm:ref-sync-apontamento`, `bm:criterios-classe-servico AAAA-MM-DD` e ligar os timers. Os usuários do banco (00_papeis_e_banco.sql) seguem com o DBA.';
