// Pedido 059 (K-193), ADR 0020 revisão 4, R4-5: validação de `Host` e `Origin` contra DNS rebinding. A lista é fechada e a comparação, exata
// (sem sufixo nem curinga); a porta não entra, porque o ataque troca o nome, não a porta. O valor recebido nunca é devolvido nem logado.

/** Nomes sempre aceitos; o endereço de `APONTAMENTO_REDE_LOCAL` entra quando declarado. IPv6 sem colchetes (a comparação tira os colchetes). */
export const NOMES_LOCAIS = ['localhost', '127.0.0.1', '::1'] as const;

export function nomesAceitos(redeLocal?: string): ReadonlySet<string> {
  return new Set<string>(redeLocal === undefined ? NOMES_LOCAIS : [...NOMES_LOCAIS, redeLocal]);
}

const HOST = /^(\[[0-9a-f:.]+\]|[^:/\s[\]]+)(?::\d{1,5})?$/i;
const semColchetes = (nome: string): string => (nome.startsWith('[') ? nome.slice(1, -1) : nome).toLowerCase();

/** Parte de nome do cabeçalho `Host` (sem porta, minúscula) ou `null` se a forma for inválida. */
export function nomeDoHost(host: unknown): string | null {
  if (typeof host !== 'string') return null;
  const m = HOST.exec(host);
  return m === null ? null : semColchetes(m[1]!);
}

/** Nome do `Origin` (só `http:` e `https:`; `null`, outro esquema ou forma inválida dão `null`). */
export function nomeDoOrigin(origin: string): string | null {
  if (!URL.canParse(origin)) return null;
  const u = new URL(origin);
  return u.protocol === 'http:' || u.protocol === 'https:' ? semColchetes(u.hostname) : null;
}

/** `true` se o `Host` está na lista fechada e o `Origin`, quando presente, também (esquema `http(s)` e nome da lista). */
export function origemPermitida(host: unknown, origin: unknown, aceitos: ReadonlySet<string>): boolean {
  const nome = nomeDoHost(host);
  if (nome === null || !aceitos.has(nome)) return false;
  if (origin === undefined) return true;
  const nomeOrigin = typeof origin === 'string' ? nomeDoOrigin(origin) : null;
  return nomeOrigin !== null && aceitos.has(nomeOrigin);
}
