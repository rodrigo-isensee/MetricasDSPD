import { createConnection } from 'mariadb';
import type { ConfigAcelerato } from './config.js';
import { ErroColeta, type CodigoErro } from './erros.js';
import { CONTROLE, SET_TETO } from './sql.js';
import { opcoesSsl, type TlsPreparado } from './tls.js';

/**
 * ÚNICO arquivo que importa o driver MySQL (`mariadb`, versão exata no lockfile; ADR 0023, itens 1 e 2). Um teste
 * estrutural falha se outro arquivo o importar. Só leitura em três camadas: privilégio da conta, sessão (`READ ONLY`,
 * `ROLLBACK` no fim, teto de execução) e driver (sem múltiplas instruções, sem leitura de arquivo local, TLS sempre).
 * O erro do driver (que carrega configuração e usuário) nunca sai daqui: vira `ErroColeta` com código fechado.
 */
export type ConexaoMysql = {
  execute(sql: string, valores?: unknown[]): Promise<unknown>;
  query(sql: string): Promise<unknown>;
  end(): Promise<void>;
  destroy(): void;
  /** O `Connection` do driver é um EventEmitter; opcional para os duplos de teste. */
  on?(evento: 'error', ouvinte: (e: unknown) => void): unknown;
};
export type OpcoesConexao = Record<string, unknown>;
export type Conectar = (opcoes: OpcoesConexao) => Promise<ConexaoMysql>;

/** Conector real: o objeto `ssl` é repassado ao `tls.connect` do Node pelo `mariadb`. */
export const conectarMariadb: Conectar = (opcoes) => createConnection(opcoes) as unknown as Promise<ConexaoMysql>;

/** O que a coleta enxerga: só consultas preparadas, valores só por placeholder, sempre dentro da transação só leitura. */
export interface SessaoMysql {
  consultar<T extends Record<string, unknown> = Record<string, unknown>>(sql: string, valores: readonly unknown[]): Promise<T[]>;
}

export type DepsCliente = {
  conectar?: Conectar;
  /** Folga do tempo do lado do cliente sobre o teto do servidor (padrão 30 s: 150 s sobre os 120 s). */
  folgaMs?: number;
};

const TEMPO_CONEXAO_MS = 10_000;

/** Opções de conexão, sempre as mesmas: o que o driver faria por padrão fica explícito (ADR 0023, item 1.4). */
export function opcoesConexao(config: ConfigAcelerato, tls: TlsPreparado): OpcoesConexao {
  return {
    host: config.host, port: config.porta, database: config.banco, user: config.usuario, password: config.senha,
    ssl: opcoesSsl(tls),
    multipleStatements: false, permitLocalInfile: false, compress: false, allowPublicKeyRetrieval: false,
    // Sem redirecionamento a outro host e só os dois plugins de autenticação esperados (parecer de segurança, A1).
    permitRedirect: false, restrictedAuth: ['caching_sha2_password', 'mysql_native_password'],
    connectTimeout: TEMPO_CONEXAO_MS,
    // Datas como texto da origem; inteiros grandes como número (chaves cabem em 2^53); sem coerção implícita de tipo.
    dateStrings: true, bigIntAsNumber: true, insertIdAsNumber: true, checkNumberRange: true,
  };
}

const CODIGOS_REDE = new Set(['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EHOSTUNREACH', 'ENETUNREACH', 'EPIPE', 'EAI_AGAIN', 'ER_CONNECTION_TIMEOUT']);

/** Traduz o erro do driver para um código fechado, olhando só `code` e `errno` (nunca a mensagem, que traz configuração). */
export function classificarErroDriver(e: unknown): CodigoErro {
  if (e instanceof ErroColeta) return e.codigo;
  const campos = typeof e === 'object' && e !== null ? (e as { code?: unknown; errno?: unknown }) : {};
  const codigo = typeof campos.code === 'string' ? campos.code : '';
  if (codigo === 'ER_ACCESS_DENIED_ERROR' || codigo === 'ER_DBACCESS_DENIED_ERROR' || campos.errno === 1045) return 'autenticacao';
  if (/^(ERR_TLS_|ERR_SSL_|CERT_|DEPTH_ZERO|SELF_SIGNED|UNABLE_TO_VERIFY|HOSTNAME_MISMATCH|ERR_OSSL|ER_SERVER_SSL_DISABLED|ER_CLEAR_PASSWORD_WITHOUT_SSL)/.test(codigo)) return 'tls';
  if (CODIGOS_REDE.has(codigo)) return 'rede';
  return 'erro-origem';
}

/**
 * Abre UMA conexão (sem pool ocioso), prepara a sessão só leitura e entrega a `fn`; ao fim (inclusive em erro) faz
 * `ROLLBACK` (nunca `COMMIT`) e fecha. Tempo do lado do cliente acima do teto do servidor: ao estourar, destrói a conexão.
 */
export async function comSessaoMysql<T>(
  config: ConfigAcelerato, tls: TlsPreparado, fn: (sessao: SessaoMysql) => Promise<T>, deps: DepsCliente = {},
): Promise<T> {
  const conectar = deps.conectar ?? conectarMariadb;
  const limiteMs = config.maxExecMs + (deps.folgaMs ?? 30_000);
  let conexao: ConexaoMysql | undefined;
  let expirou = false;

  // Um temporizador POR operação: um compartilhado seria limpo pela operação errada quando duas se encadeiam.
  const comTempo = <R>(operacao: Promise<R>): Promise<R> =>
    new Promise<R>((resolver, rejeitar) => {
      const temporizador = setTimeout(() => {
        expirou = true;
        conexao?.destroy();
        rejeitar(new ErroColeta('tempo-esgotado'));
      }, limiteMs);
      operacao.then(resolver, rejeitar).finally(() => { clearTimeout(temporizador); });
    });
  const traduzir = (e: unknown): ErroColeta => {
    if (expirou) return new ErroColeta('tempo-esgotado');
    return e instanceof ErroColeta ? e : new ErroColeta(classificarErroDriver(e));
  };

  try {
    conexao = await comTempo(conectar(opcoesConexao(config, tls)));
    const aberta = conexao;
    // O driver emite `error` sem checar ouvinte; sem tratador, erro com a conexão ociosa derrubaria o processo com o texto cru
    // do driver. O tratador não imprime nada: a falha chega à operação em curso, já traduzida (parecer de segurança, A2).
    aberta.on?.('error', () => undefined);
    const sessao: SessaoMysql = {
      consultar: async <R extends Record<string, unknown>>(sql: string, valores: readonly unknown[]): Promise<R[]> =>
        (await comTempo(aberta.execute(sql, [...valores]))) as R[],
    };
    await comTempo(aberta.query(CONTROLE.somenteLeituraSessao));
    await comTempo(aberta.execute(SET_TETO, [config.maxExecMs]));
    await comTempo(aberta.query(CONTROLE.iniciarSomenteLeitura));
    return await fn(sessao);
  } catch (e) {
    throw traduzir(e);
  } finally {
    if (conexao !== undefined) {
      const aberta = conexao;
      // ROLLBACK (nunca COMMIT) e fechamento; falha aqui não troca o resultado, mas a conexão é destruída.
      await comTempo(aberta.query(CONTROLE.desfazer)).catch(() => undefined);
      await comTempo(aberta.end()).catch(() => { aberta.destroy(); });
    }
  }
}
