import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { classificarErroDriver, comSessaoMysql, opcoesConexao } from '../src/modulos/acelerato/cliente-mysql.js';
import { carregarConfigAcelerato, ErroColeta, prepararTls, VARIAVEIS_ACELERATO } from '../src/modulos/acelerato/index.js';
import { Q5_SAIDA, expandir } from '../src/modulos/acelerato/sql.js';
import { opcoesSsl, impressaoDoPem, normalizarImpressao } from '../src/modulos/acelerato/tls.js';
import { CONFIG, IMPRESSAO, TLS, criarMysqlFalso } from './acelerato-duble.js';
import { gerarCertificado, servidorMysqlFalso, temOpenssl, type Certificado } from './acelerato-tls-helper.js';

const ENV_OK: Record<string, string> = {
  ACELERATO_MYSQL_HOST: 'host-de-teste.invalido', ACELERATO_MYSQL_PORT: '3306', ACELERATO_MYSQL_DATABASE: 'banco_de_teste',
  ACELERATO_MYSQL_USER: 'usuario_de_teste', ACELERATO_MYSQL_PASSWORD: 'SENHA-DE-TESTE-056', ACELERATO_MYSQL_TLS_SHA256: IMPRESSAO,
  ACELERATO_MYSQL_TLS_CERT_FILE: '/caminho/servidor.pem',
};
const erroDe = (env: NodeJS.ProcessEnv): ErroColeta => {
  try { carregarConfigAcelerato(env); } catch (e) { return e as ErroColeta; }
  throw new Error('esperava recusa');
};

describe('CT-10: configuração', () => {
  it('aceita a configuração completa e aplica os dois padrões da ADR (teto de 120 s e margem de 24 h)', () => {
    expect(carregarConfigAcelerato(ENV_OK)).toEqual({
      host: 'host-de-teste.invalido', porta: 3306, banco: 'banco_de_teste', usuario: 'usuario_de_teste', senha: 'SENHA-DE-TESTE-056',
      tlsSha256: IMPRESSAO, tlsCertFile: '/caminho/servidor.pem', maxExecMs: 120_000, margemHoras: 24,
    });
    expect(carregarConfigAcelerato({ ...ENV_OK, ACELERATO_MYSQL_MAX_EXEC_MS: '5000', ACELERATO_MYSQL_MARGEM_HORAS: '48' })).toMatchObject({ maxExecMs: 5000, margemHoras: 48 });
  });

  it.each(['ACELERATO_MYSQL_HOST', 'ACELERATO_MYSQL_PORT', 'ACELERATO_MYSQL_DATABASE', 'ACELERATO_MYSQL_USER', 'ACELERATO_MYSQL_PASSWORD',
    'ACELERATO_MYSQL_TLS_SHA256', 'ACELERATO_MYSQL_TLS_CERT_FILE'])('sem %s: recusa, citando só o nome, sem valor padrão', (nome) => {
    for (const env of [{ ...ENV_OK, [nome]: undefined }, { ...ENV_OK, [nome]: '' }]) {
      const e = erroDe(env);
      expect(e).toMatchObject({ codigo: 'configuracao-invalida', coluna: nome });
      expect(JSON.stringify(e)).not.toContain('SENHA-DE-TESTE-056');
    }
  });

  it('valores inválidos são recusados sem ecoar o valor: porta fora da faixa, URL com senha no host, impressão curta, teto e margem fora', () => {
    const casos: [string, string][] = [
      ['ACELERATO_MYSQL_PORT', '0'], ['ACELERATO_MYSQL_PORT', '65536'], ['ACELERATO_MYSQL_PORT', 'abc'],
      ['ACELERATO_MYSQL_HOST', 'mysql://usuario:SENHA-SECRETA@host/banco'], ['ACELERATO_MYSQL_HOST', 'a b'],
      ['ACELERATO_MYSQL_DATABASE', 'banco;DROP'], ['ACELERATO_MYSQL_TLS_SHA256', 'abcd'], ['ACELERATO_MYSQL_TLS_SHA256', 'zz'.repeat(32)],
      ['ACELERATO_MYSQL_MAX_EXEC_MS', '10'], ['ACELERATO_MYSQL_MAX_EXEC_MS', '999999'], ['ACELERATO_MYSQL_MARGEM_HORAS', '0'],
    ];
    for (const [nome, valor] of casos) {
      const e = erroDe({ ...ENV_OK, [nome]: valor });
      expect(e.coluna, `${nome}=${valor}`).toBe(nome);
      expect(`${e.message}${JSON.stringify(e)}${e.stack}`).not.toContain('SENHA-SECRETA');
    }
  });

  it('CT-12: NODE_TLS_REJECT_UNAUTHORIZED=0 recusa a partida', () => {
    expect(erroDe({ ...ENV_OK, NODE_TLS_REJECT_UNAUTHORIZED: '0' })).toMatchObject({ codigo: 'configuracao-invalida', coluna: 'NODE_TLS_REJECT_UNAUTHORIZED' });
  });

  it('a mensagem é fixa por código e as variáveis lidas são só as ACELERATO_MYSQL_*', () => {
    expect(erroDe({}).message).toBe('Configuração do Acelerato inválida');
    expect(VARIAVEIS_ACELERATO.every((v) => v.startsWith('ACELERATO_MYSQL_'))).toBe(true);
  });

  it('o erro de coleta descarta detalhe com forma inesperada (nome de coluna com valor, id longo)', () => {
    const e = new ErroColeta('dados-invalidos', { entidade: 'x y', idOrigem: 'a'.repeat(33), coluna: 'valor com espaço' });
    expect(e.paraLog()).toEqual({ codigo: 'dados-invalidos' });
    expect(new ErroColeta('rede', { entidade: 'chamado', idOrigem: '42', coluna: 'a_b' }).paraLog()).toEqual({ codigo: 'rede', entidade: 'chamado', id_origem: '42', coluna: 'a_b' });
  });
});

describe('impressão digital e certificado (CT-13, parte sem rede)', () => {
  let cert: Certificado;
  let dir = '';
  beforeAll(() => { if (temOpenssl()) { cert = gerarCertificado(); dir = mkdtempSync(join(tmpdir(), 'ac-pem-')); writeFileSync(join(dir, 'srv.pem'), cert.pem); } });
  afterAll(() => { if (dir) rmSync(dir, { recursive: true, force: true }); });
  const comCert = it.skipIf(!temOpenssl());

  it('normaliza maiúsculas e dois-pontos para 64 hexadecimais minúsculos; tamanho errado ou fora do hexadecimal é recusado', () => {
    const com = IMPRESSAO.toUpperCase().match(/../g)!.join(':');
    expect(normalizarImpressao(com)).toBe(IMPRESSAO);
    expect(normalizarImpressao(IMPRESSAO)).toBe(IMPRESSAO);
    for (const ruim of ['', IMPRESSAO.slice(1), `${IMPRESSAO}a`, 'g'.repeat(64)]) expect(normalizarImpressao(ruim)).toBeNull();
  });

  comCert('o PEM dá a mesma impressão que o Node calcula; PEM ilegível lança tls-configuracao', () => {
    expect(impressaoDoPem(cert.pem)).toBe(cert.impressao);
    expect(() => impressaoDoPem('isto não é um certificado')).toThrowError(expect.objectContaining({ codigo: 'tls-configuracao' }));
  });

  comCert('na partida, o PEM só vale se a impressão for igual à fixada; arquivo ausente e impressão diferente são recusados', () => {
    expect(prepararTls(cert.impressao, join(dir, 'srv.pem'))).toEqual({ pem: cert.pem, impressao: cert.impressao });
    expect(() => prepararTls(IMPRESSAO, join(dir, 'srv.pem'))).toThrowError(expect.objectContaining({ codigo: 'tls-impressao-diferente' }));
    expect(() => prepararTls(cert.impressao, join(dir, 'nao-existe.pem'))).toThrowError(expect.objectContaining({ codigo: 'tls-configuracao' }));
    expect(prepararTls(cert.impressao, 'qualquer', () => cert.pem).pem).toBe(cert.pem);
  });

  it('opções do TLS: verificação ligada, nunca rejectUnauthorized falso; a conferência de nome é trocada pela de impressão', () => {
    const o = opcoesSsl(TLS);
    expect(o).toMatchObject({ rejectUnauthorized: true, allowPartialTrustChain: true, minVersion: 'TLSv1.2', ca: 'PEM-DE-TESTE' });
    const confere = (fp: string | undefined): Error | undefined => o.checkServerIdentity!('qualquer-nome', { fingerprint256: fp } as never);
    expect(confere(IMPRESSAO.toUpperCase().match(/../g)!.join(':'))).toBeUndefined();
    expect(confere(IMPRESSAO)).toBeUndefined();
    expect(confere(`${IMPRESSAO.slice(0, 63)}0`)).toMatchObject({ codigo: 'tls-impressao-diferente' });
    expect(confere('')).toMatchObject({ codigo: 'tls-impressao-diferente' });
    expect(confere(undefined)).toMatchObject({ codigo: 'tls-impressao-diferente' });
  });
});

describe('CT-17/20: opções e sessão do cliente (driver simulado)', () => {
  it('opções efetivas: sem múltiplas instruções, sem arquivo local, sem compressão, TLS sempre, datas como texto', () => {
    const o = opcoesConexao(CONFIG, TLS);
    expect(o).toMatchObject({
      multipleStatements: false, permitLocalInfile: false, compress: false, allowPublicKeyRetrieval: false, dateStrings: true, connectTimeout: 10_000,
      host: CONFIG.host, port: 3306, database: CONFIG.banco, user: CONFIG.usuario,
    });
    expect(o.ssl).toMatchObject({ rejectUnauthorized: true });
    expect(o).not.toHaveProperty('infileStreamFactory');
  });

  it('uma conexão por execução; READ ONLY e teto antes da primeira consulta; ROLLBACK (nunca COMMIT) e fechamento ao fim', async () => {
    const m = criarMysqlFalso([]);
    const r = await comSessaoMysql(CONFIG, TLS, async (s) => (await s.consultar(expandir(Q5_SAIDA, { ids: 1 }), [7])).length, { conectar: m.conectar });
    expect(r).toBe(0);
    expect(m.reg.conexoes).toBe(1);
    expect(m.reg.viaQuery).toEqual(['SET SESSION TRANSACTION READ ONLY', 'START TRANSACTION READ ONLY', 'ROLLBACK']);
    expect(m.reg.tetos).toEqual([120_000]);
    expect(m.reg.encerradas).toBe(1);
    expect(m.reg.viaQuery.some((q) => /COMMIT/i.test(q))).toBe(false);
  });

  it('com falha no meio a conexão também é desfeita e fechada; e se o fechamento falha, é destruída', async () => {
    const m = criarMysqlFalso([]);
    await expect(comSessaoMysql(CONFIG, TLS, () => Promise.reject(new Error('SENHA-DE-TESTE-056')), { conectar: m.conectar })).rejects.toMatchObject({ codigo: 'erro-origem' });
    expect(m.reg.viaQuery.at(-1)).toBe('ROLLBACK');
    expect(m.reg.encerradas).toBe(1);
    const falhaAoFechar = async () => ({
      query: () => Promise.reject(new Error('x')), execute: () => Promise.resolve([]), end: () => Promise.reject(new Error('y')),
      destroy: () => { destruiu += 1; },
    });
    let destruiu = 0;
    await comSessaoMysql(CONFIG, TLS, () => Promise.resolve(1), { conectar: falhaAoFechar }).catch(() => undefined);
    expect(destruiu).toBe(1);
  });

  it('classifica o erro do driver só por code e errno, nunca pela mensagem', () => {
    const c = (code?: string, errno?: number) => classificarErroDriver(Object.assign(new Error('mensagem com SENHA-DE-TESTE-056'), { code, errno }));
    expect(c('ER_ACCESS_DENIED_ERROR')).toBe('autenticacao');
    expect(c(undefined, 1045)).toBe('autenticacao');
    expect(c('ER_DBACCESS_DENIED_ERROR')).toBe('autenticacao');
    expect(c('ECONNREFUSED')).toBe('rede');
    expect(c('ER_CONNECTION_TIMEOUT')).toBe('rede');
    expect(c('DEPTH_ZERO_SELF_SIGNED_CERT')).toBe('tls');
    expect(c('ER_SERVER_SSL_DISABLED')).toBe('tls');
    expect(c('ER_LOCAL_INFILE_DISABLED')).toBe('erro-origem');
    expect(c()).toBe('erro-origem');
    expect(classificarErroDriver('texto')).toBe('erro-origem');
    expect(classificarErroDriver(null)).toBe('erro-origem');
    expect(classificarErroDriver(new ErroColeta('rede'))).toBe('rede');
  });
});

describe('CT-12/13: o driver REAL contra um servidor TCP de teste (TLS fixado por impressão)', () => {
  const comCert = it.skipIf(!temOpenssl());
  let cert: Certificado;
  beforeAll(() => { if (temOpenssl()) cert = gerarCertificado(); });
  const config = (porta: number) => ({ ...CONFIG, host: '127.0.0.1', porta, maxExecMs: 1000 });
  const sessao = (porta: number, impressao: string) => comSessaoMysql(config(porta), { pem: cert.pem, impressao }, () => Promise.resolve(1), { folgaMs: 300 });

  comCert('impressão igual: o aperto de mão TLS conclui e SÓ ENTÃO a credencial é enviada', async () => {
    const srv = await servidorMysqlFalso(cert);
    try {
      await sessao(srv.porta, cert.impressao).catch(() => undefined); // o servidor falso não autentica; o que importa é a ordem
      await new Promise((r) => setTimeout(r, 100));
      expect(srv.tlsConcluido()).toBe(true);
      expect(srv.bytesAposTls()).toBeGreaterThan(0);
      expect(srv.bytesEmClaro()).toBe(36); // só o pedido de SSL em claro
    } finally { await srv.fechar(); }
  });

  comCert('impressão com 1 caractere trocado: recusada no aperto de mão, categoria própria, nenhuma credencial enviada', async () => {
    const srv = await servidorMysqlFalso(cert);
    try {
      const errada = `${cert.impressao.slice(0, 63)}${cert.impressao.endsWith('0') ? '1' : '0'}`;
      await expect(sessao(srv.porta, errada)).rejects.toMatchObject({ codigo: 'tls-impressao-diferente' });
      await new Promise((r) => setTimeout(r, 100));
      expect(srv.bytesAposTls()).toBe(0);
      expect(srv.bytesEmClaro()).toBe(36);
    } finally { await srv.fechar(); }
  });

  comCert('impressão em maiúsculas e com ":" no .env vale (normalizada na configuração) e a mesma tem de passar na conexão', async () => {
    const srv = await servidorMysqlFalso(cert);
    try {
      const normalizada = normalizarImpressao(cert.impressao.toUpperCase().match(/../g)!.join(':'))!;
      await sessao(srv.porta, normalizada).catch(() => undefined);
      await new Promise((r) => setTimeout(r, 100));
      expect(srv.tlsConcluido()).toBe(true);
    } finally { await srv.fechar(); }
  });

  comCert('servidor sem TLS: a conexão é recusada, nada além da saudação é trocado e nunca cai para texto puro', async () => {
    const srv = await servidorMysqlFalso(null);
    try {
      await expect(sessao(srv.porta, cert.impressao)).rejects.toMatchObject({ codigo: 'tls' });
      expect(srv.bytesEmClaro()).toBe(0);
    } finally { await srv.fechar(); }
  });

  it('porta sem ninguém ouvindo: erro de rede, sem a mensagem do driver', async () => {
    const e = await comSessaoMysql({ ...CONFIG, host: '127.0.0.1', porta: 1, maxExecMs: 1000 }, TLS, () => Promise.resolve(1), { folgaMs: 300 }).catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ErroColeta);
    expect(['rede', 'tempo-esgotado']).toContain((e as ErroColeta).codigo);
    expect(`${(e as Error).message}${(e as Error).stack}`).not.toContain(CONFIG.senha);
  });
});
