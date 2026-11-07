/** Configuração recusada; `nomes` traz só os NOMES das variáveis (nunca valores), para a categoria de erro das entradas. */
export class ErroConfiguracao extends Error {
  readonly nomes: readonly string[];
  constructor(message: string, nomes: readonly string[]) {
    super(message);
    this.nomes = nomes;
    this.name = 'ErroConfiguracao';
  }
}

const CODIGOS_CONEXAO = new Set(['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN']);
const TEMPO_ESGOTADO = /timeout|timed out/i;

const codigoDe = (e: unknown): string | undefined => {
  const c = (e as { code?: unknown } | null)?.code;
  return typeof c === 'string' ? c : undefined;
};
const mensagemDe = (e: unknown): string => (e instanceof Error ? e.message : '');

/**
 * Categoria de uma falha de entrada de comando, para a mensagem `<entrada> falhou: <categoria>[: <nomes>]`. Devolve só a categoria e, para
 * configuração, os NOMES das variáveis: nunca valor, URL, senha nem texto do erro do banco (a mensagem é lida só para classificar).
 */
export function categoriaDoErro(e: unknown): string {
  if (e instanceof ErroConfiguracao) return `configuração: ${e.nomes.join(', ')}`;
  const filhos = e instanceof AggregateError ? e.errors : [];
  const codigos = [codigoDe(e), ...filhos.map(codigoDe)];
  if (codigos.some((c) => c !== undefined && c.startsWith('28'))) return 'autenticação';
  if (codigos.some((c) => c !== undefined && CODIGOS_CONEXAO.has(c)) || TEMPO_ESGOTADO.test(mensagemDe(e))) return 'conexão';
  return 'outro';
}
