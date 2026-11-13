import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { carregarConfigColetaAcelerato } from '../src/modulos/acelerato/index.js';
import { ErroConfiguracao } from '../src/plataforma/categoria-erro.js';
import { lerConfig } from '../src/modulos/businessmap/diagnostico.js';
import { ambienteFilho } from './ajuda-cli-filho.js';

// K-304: sem as variáveis de ambiente, a coleta (BusinessMap e Acelerato) e o diagnóstico dizem QUAIS faltam, pelo NOME, e nunca mostram valor.
// Nada aqui lê o `.env` da máquina: o ambiente é montado no teste (o processo filho recebe só PATH e TMPDIR, mais o que o teste define).
const entrada = (nome: string): string => new URL(`../src/entradas/${nome}.ts`, import.meta.url).pathname;
const rodar = (nome: string, extra: Record<string, string> = {}) =>
  spawnSync(process.execPath, ['--import', 'tsx', entrada(nome), ...(nome === 'coleta' ? ['ac'] : nome === 'coleta-businessmap' ? ['incremental'] : [])], { encoding: 'utf8', env: ambienteFilho(extra), timeout: 60_000 });

const SEGREDO = 'segredo-nao-pode-aparecer-9f3a';
const AC_VALIDAS: Record<string, string> = {
  ACELERATO_MYSQL_HOST: 'host-acelerato.exemplo', ACELERATO_MYSQL_PORT: '3306', ACELERATO_MYSQL_DATABASE: 'banco',
  ACELERATO_MYSQL_USER: 'usuario-ac', ACELERATO_MYSQL_PASSWORD: SEGREDO, ACELERATO_MYSQL_TLS_SHA256: 'AA:'.repeat(31) + 'AA', ACELERATO_MYSQL_TLS_CERT_FILE: '/nao/existe.pem',
};

describe('coleta ac sem ambiente', () => {
  it('lista os nomes de todas as variáveis que faltam (worker e MySQL), sem valor', () => {
    const r = rodar('coleta');
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('coleta ac falhou: configuração: ');
    for (const nome of ['PG_COLETOR_URL', 'ACELERATO_MYSQL_HOST', 'ACELERATO_MYSQL_PORT', 'ACELERATO_MYSQL_DATABASE', 'ACELERATO_MYSQL_USER', 'ACELERATO_MYSQL_PASSWORD', 'ACELERATO_MYSQL_TLS_SHA256', 'ACELERATO_MYSQL_TLS_CERT_FILE']) {
      expect(r.stderr).toContain(nome);
    }
    expect(r.stderr).not.toContain('erro-interno');
    expect(r.stdout).toBe('');
  });

  it('com valores presentes e um faltando: nomeia só o que falta e nunca imprime os valores', () => {
    const { ACELERATO_MYSQL_USER: _fora, ...resto } = AC_VALIDAS;
    const r = rodar('coleta', { ...resto, PG_COLETOR_URL: `postgres://coletor:${SEGREDO}@db.exemplo:5432/dspd` });
    expect(r.status).toBe(1);
    expect(r.stderr).toBe('coleta ac falhou: configuração: ACELERATO_MYSQL_USER\n');
    expect(r.stderr + r.stdout).not.toContain(SEGREDO);
    expect(r.stderr + r.stdout).not.toContain('host-acelerato.exemplo');
  });

  it('valor inválido: nomeia a variável, sem eco do valor', () => {
    const r = rodar('coleta', { ...AC_VALIDAS, PG_COLETOR_URL: `nao-e-url-${SEGREDO}`, ACELERATO_MYSQL_PORT: `porta-${SEGREDO}` });
    expect(r.status).toBe(1);
    expect(r.stderr).toBe('coleta ac falhou: configuração: PG_COLETOR_URL, ACELERATO_MYSQL_PORT\n');
    expect(r.stderr).not.toContain(SEGREDO);
  });

  it('carregarConfigColetaAcelerato: ErroConfiguracao com os nomes, sem valores, e ordem estável', () => {
    const env = { ...AC_VALIDAS, ACELERATO_MYSQL_PASSWORD: '' };
    try {
      carregarConfigColetaAcelerato(env);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ErroConfiguracao);
      expect((e as ErroConfiguracao).nomes).toEqual(['PG_COLETOR_URL', 'ACELERATO_MYSQL_PASSWORD']);
      expect((e as Error).message).not.toContain(AC_VALIDAS.ACELERATO_MYSQL_HOST);
    }
  });
});

describe('coleta do BusinessMap sem ambiente', () => {
  // A entrada lê o `.env` da raiz sem sobrescrever variável já definida; por isso o teste define as variáveis (vazias ou inválidas) em vez de
  // depender de ausência, e o resultado não varia com o `.env` da máquina.
  it('variáveis vazias ou inválidas: lista os nomes e nunca o valor', () => {
    const r = rodar('coleta-businessmap', {
      BUSINESSMAP_URL_BASE: `http://usuario:${SEGREDO}@bm.exemplo`, BUSINESSMAP_APIKEY: '', PG_COLETOR_URL: '',
      PG_REF_URL: 'postgres://ref:x@db.exemplo:5432/dspd', DSPD_PWD_REF: '', 
    });
    expect(r.status).toBe(1);
    expect(r.stderr).toBe('bm:coleta falhou: configuração: BUSINESSMAP_URL_BASE, BUSINESSMAP_APIKEY, PG_COLETOR_URL\n');
    expect(r.stderr + r.stdout).not.toContain(SEGREDO);
    expect(r.stderr).not.toContain('erro-interno');
  });
});

describe('diagnóstico do BusinessMap sem ambiente', () => {
  it('sem nenhuma variável: lista as duas obrigatórias pelo nome', () => {
    const r = rodar('diagnostico-businessmap');
    expect(r.status).toBe(2);
    expect(r.stderr).toBe('variáveis obrigatórias ausentes: BUSINESSMAP_URL_BASE, BUSINESSMAP_APIKEY\n');
    expect(r.stdout).toBe('');
  });

  it('uma ausente: nomeia só ela e não ecoa o valor da outra', () => {
    expect(() => lerConfig({ BUSINESSMAP_APIKEY: SEGREDO })).toThrow(/^variável obrigatória ausente: BUSINESSMAP_URL_BASE$/);
    const r = rodar('diagnostico-businessmap', { BUSINESSMAP_APIKEY: SEGREDO });
    expect(r.stderr).toBe('variável obrigatória ausente: BUSINESSMAP_URL_BASE\n');
    expect(r.stderr).not.toContain(SEGREDO);
  });
});
