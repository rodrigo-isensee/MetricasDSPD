/**
 * Erros da coleta do Acelerato (ADR 0023, item 1.6; ameaças M2 e M8). O erro do driver (que carrega configuração,
 * usuário e até trecho de dado) nunca é propagado nem registrado: ele é traduzido para um código fechado, e a
 * mensagem é fixa por código. Só `codigo`, a entidade e o `id_origem` viajam; nunca `cause`, nunca o texto do driver.
 */
export const CODIGOS_ERRO = [
  'configuracao-invalida', 'tls-configuracao', 'tls-impressao-diferente', 'tls', 'autenticacao', 'rede', 'tempo-esgotado',
  'erro-origem', 'dados-invalidos', 'fora-do-recorte', 'listas-vazias', 'parametros-mudaram', 'recarga-suspeita', 'erro-interno',
] as const;
export type CodigoErro = (typeof CODIGOS_ERRO)[number];

const MENSAGEM: Record<CodigoErro, string> = {
  'configuracao-invalida': 'Configuração do Acelerato inválida',
  'tls-configuracao': 'Certificado do servidor ausente ou ilegível',
  'tls-impressao-diferente': 'A impressão digital do certificado não confere com a fixada',
  tls: 'Falha na verificação do transporte seguro (TLS)',
  autenticacao: 'Acesso negado pela origem',
  rede: 'Falha de rede ao falar com a origem',
  'tempo-esgotado': 'Tempo esgotado ao falar com a origem',
  'erro-origem': 'Erro devolvido pela origem',
  'dados-invalidos': 'Dado da origem fora da lista fechada',
  'fora-do-recorte': 'Linha fora do recorte do DSPD',
  'listas-vazias': 'Listas fechadas do recorte vazias em ref_dominio',
  'parametros-mudaram': 'Parâmetros da coleta mudaram sem versão de critério',
  'recarga-suspeita': 'Ausentes acima do limite: recarga suspeita da origem',
  'erro-interno': 'Erro interno da coleta',
};

export type DetalheErro = {
  entidade?: string;
  /** Chave do item na origem (ASCII visível, até 32 caracteres); qualquer outra coisa é descartada. */
  idOrigem?: string;
  /** Nome de coluna ou de parâmetro (nunca valor); qualquer outra coisa é descartada. */
  coluna?: string;
};

const PADRAO_ID = /^[\x21-\x7E]{1,32}$/;
const PADRAO_NOME = /^[A-Za-z0-9_.]{1,64}$/;
const PADRAO_COLUNA = /^[A-Za-z0-9_.,]{1,400}$/;

export class ErroColeta extends Error {
  readonly codigo: CodigoErro;
  readonly entidade: string | undefined;
  readonly idOrigem: string | undefined;
  readonly coluna: string | undefined;

  constructor(codigo: CodigoErro, detalhe: DetalheErro = {}) {
    super(MENSAGEM[codigo]);
    this.name = 'ErroColeta';
    this.codigo = codigo;
    this.entidade = detalhe.entidade !== undefined && PADRAO_NOME.test(detalhe.entidade) ? detalhe.entidade : undefined;
    this.idOrigem = detalhe.idOrigem !== undefined && PADRAO_ID.test(detalhe.idOrigem) ? detalhe.idOrigem : undefined;
    this.coluna = detalhe.coluna !== undefined && PADRAO_COLUNA.test(detalhe.coluna) ? detalhe.coluna : undefined;
  }

  /** O que pode ir ao log: só código e identificadores já validados. */
  paraLog(): { codigo: CodigoErro; entidade?: string; id_origem?: string; coluna?: string } {
    return {
      codigo: this.codigo,
      ...(this.entidade !== undefined ? { entidade: this.entidade } : {}),
      ...(this.idOrigem !== undefined ? { id_origem: this.idOrigem } : {}),
      ...(this.coluna !== undefined ? { coluna: this.coluna } : {}),
    };
  }
}

/** Qualquer erro vira `ErroColeta`; o que não for já um dele vira `erro-interno`, sem a mensagem original. */
export const comoErroColeta = (e: unknown): ErroColeta => (e instanceof ErroColeta ? e : new ErroColeta('erro-interno'));

/** Categorias que justificam nova tentativa (ADR 0023, item 1.6): rede e tempo esgotado. Acesso negado nunca. */
export const repetivel = (e: ErroColeta): boolean => e.codigo === 'rede' || e.codigo === 'tempo-esgotado';
