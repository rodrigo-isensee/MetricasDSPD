/**
 * Datas da tabela de origem: texto `AAAA-MM-DD HH:MM:SS[.fff]` (o driver devolve datas como texto), horário de Brasília
 * fixo em -03:00 (P-DS-2 do plano 056; sem horário de verão desde 2019). O staging guarda o texto como veio; só a marca
 * d'água e a margem do incremental viram instante.
 */
export const PADRAO_DATA = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,6})?$/;
const DESLOCAMENTO_MS = 3 * 3_600_000;

/** Texto da origem -> instante (UTC). `null` se o texto não é uma data válida. */
export function textoParaInstante(texto: string): Date | null {
  if (!PADRAO_DATA.test(texto)) return null;
  const [data, hora] = texto.split(' ') as [string, string];
  const d = new Date(`${data}T${hora.slice(0, 12)}Z`);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getTime() + DESLOCAMENTO_MS);
}

/** Instante -> texto da origem (`AAAA-MM-DD HH:MM:SS`, -03:00). */
export function instanteParaTexto(instante: Date): string {
  return new Date(instante.getTime() - DESLOCAMENTO_MS).toISOString().slice(0, 19).replace('T', ' ');
}
