import { describe, expect, it } from 'vitest';
import { categoriaDoErro } from '../src/plataforma/categoria-erro.js';
import { carregarConfigRef, carregarConfigApi } from '../src/plataforma/config.js';

const SENHA = 'S3nh4-Secreta';
const URL_PG = `postgres://dspd_ref:${SENHA}@banco.interno:5432/dspd`;
const erroCom = (code: string, message = 'x'): Error => Object.assign(new Error(message), { code });

describe('categoriaDoErro', () => {
  it('configuração: só os nomes das variáveis, nunca o valor', () => {
    let capturado: unknown;
    try { carregarConfigRef({ PG_REF_URL: `mysql://u:${SENHA}@h/d`, LOG_LEVEL: 'valor-ruim' }); } catch (e) { capturado = e; }
    const cat = categoriaDoErro(capturado);
    expect(cat).toBe('configuração: LOG_LEVEL, PG_REF_URL');
    expect(cat).not.toContain(SENHA);
    expect(cat).not.toContain('valor-ruim');
  });
  it('configuração: variável removida da API', () => {
    let capturado: unknown;
    try { carregarConfigApi({ PG_API_URL: URL_PG, DADOS_FONTE: 'mock' }); } catch (e) { capturado = e; }
    expect(categoriaDoErro(capturado)).toBe('configuração: DADOS_FONTE');
  });
  it('autenticação: classe 28 do PostgreSQL, direta ou dentro de AggregateError', () => {
    expect(categoriaDoErro(erroCom('28P01'))).toBe('autenticação');
    expect(categoriaDoErro(erroCom('28000'))).toBe('autenticação');
    expect(categoriaDoErro(new AggregateError([erroCom('28P01')]))).toBe('autenticação');
  });
  it('conexão: recusa, tempo esgotado e host não encontrado', () => {
    for (const c of ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN']) expect(categoriaDoErro(erroCom(c))).toBe('conexão');
    expect(categoriaDoErro(Object.assign(new AggregateError([erroCom('ECONNREFUSED')]), { code: 'ECONNREFUSED' }))).toBe('conexão');
    expect(categoriaDoErro(new AggregateError([erroCom('ECONNREFUSED')]))).toBe('conexão');
    expect(categoriaDoErro(new Error('timeout exceeded when trying to connect'))).toBe('conexão');
    expect(categoriaDoErro(new Error('Connection terminated due to connection timeout'))).toBe('conexão');
  });
  it('outro: erro sem código, código de outra classe, não-Error e nulo', () => {
    expect(categoriaDoErro(new Error('boom'))).toBe('outro');
    expect(categoriaDoErro(erroCom('42P01'))).toBe('outro');
    expect(categoriaDoErro({ code: 42 })).toBe('outro');
    expect(categoriaDoErro('texto')).toBe('outro');
    expect(categoriaDoErro(null)).toBe('outro');
  });
  it('a saída nunca leva valor, URL, senha nem texto do erro do banco', () => {
    const texto = `password authentication failed for user "dspd_ref" em ${URL_PG} relation "pessoa" não existe`;
    for (const e of [erroCom('28P01', texto), erroCom('ECONNREFUSED', texto), erroCom('42P01', texto), new Error(texto), new AggregateError([erroCom('28P01', texto)], texto)]) {
      const cat = categoriaDoErro(e);
      for (const proibido of [SENHA, URL_PG, 'banco.interno', 'dspd_ref', 'password', 'pessoa']) expect(cat).not.toContain(proibido);
    }
  });
});
