// Ambiente mínimo do processo filho dos testes de CLI: só PATH e, quando definida, TMPDIR (o tsx precisa de uma pasta temporária gravável).
// Nada mais é herdado; o `.env` real continua ignorado (K-261).
export const ambienteFilho = (extra: Record<string, string> = {}): Record<string, string> => ({
  PATH: process.env.PATH ?? '',
  ...(process.env.TMPDIR ? { TMPDIR: process.env.TMPDIR } : {}),
  ...extra,
});
