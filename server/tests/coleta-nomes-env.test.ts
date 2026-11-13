import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { carregarConfigColetaAcelerato } from '../src/modulos/acelerato/index.js';
import { ErroConfiguracao } from '../src/plataforma/categoria-erro.js';
import { lerConfig } from '../src/modulos/businessmap/diagnostico.js';
import { ambienteFilho } from './ajuda-cli-filho.js';

// K-304: sem as variáveis de ambiente, a coleta (BusinessMap e Acelerato) e o diagnóstico dizem QUAIS faltam, pelo NOME, e nunca mostram valor.
// O processo filho recebe só PATH e TMPDIR, mais o que o teste define. A entrada `coleta ac` não lê o `.env`; a do BusinessMap lê (sem sobrescrever variável já
// definida), por isso o teste dela fixa todas as variáveis da configuração, as opcionais vazias, e o resultado não varia com o `.env` da máquina.
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
    const resto = { ...AC_VALIDAS };
    delete resto.ACELERATO_MYSQL_USER;
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

describe('carregarConfigColetaAcelerato no mesmo processo', () => {
  const PG = `postgres://coletor:${SEGREDO}@db.exemplo:5432/dspd`;
  const nomesDe = (env: NodeJS.ProcessEnv): readonly string[] => {
    try {
      carregarConfigColetaAcelerato(env);
    } catch (e) {
      expect(e).toBeInstanceOf(ErroConfiguracao);
      expect((e as Error).message).not.toContain(SEGREDO);
      return (e as ErroConfiguracao).nomes;
    }
    return expect.unreachable();
  };

  it('ambiente completo: devolve a configuração do worker e a do MySQL', () => {
    const r = carregarConfigColetaAcelerato({ ...AC_VALIDAS, PG_COLETOR_URL: PG });
    expect(r.worker.PG_COLETOR_URL).toBe(PG);
    expect(r.config).toMatchObject({ host: 'host-acelerato.exemplo', porta: 3306, banco: 'banco', usuario: 'usuario-ac', senha: SEGREDO, maxExecMs: 120_000, margemHoras: 24 });
  });

  it('duas variáveis do MySQL inválidas juntas: nomeia as duas, uma a uma', () => {
    expect(nomesDe({ ...AC_VALIDAS, PG_COLETOR_URL: PG, ACELERATO_MYSQL_PORT: `porta-${SEGREDO}`, ACELERATO_MYSQL_HOST: `host invalido ${SEGREDO}` }))
      .toEqual(['ACELERATO_MYSQL_HOST', 'ACELERATO_MYSQL_PORT']);
  });

  it('NODE_TLS_REJECT_UNAUTHORIZED=0: a recusa nomeia a variável', () => {
    expect(nomesDe({ ...AC_VALIDAS, PG_COLETOR_URL: PG, NODE_TLS_REJECT_UNAUTHORIZED: '0' })).toEqual(['NODE_TLS_REJECT_UNAUTHORIZED']);
  });

  it('NODE_TLS_REJECT_UNAUTHORIZED=0 com outras variáveis faltando: a lista sai completa, uma vez cada', () => {
    const { ACELERATO_MYSQL_USER: _a, ACELERATO_MYSQL_HOST: _b, ...resto } = AC_VALIDAS;
    expect(nomesDe({ ...resto, NODE_TLS_REJECT_UNAUTHORIZED: '0' }))
      .toEqual(['PG_COLETOR_URL', 'NODE_TLS_REJECT_UNAUTHORIZED', 'ACELERATO_MYSQL_HOST', 'ACELERATO_MYSQL_USER']);
  });

  it('DSPD_SCHEMA_PREFIXO inválido: nomeia a variável, sem eco do valor', () => {
    expect(nomesDe({ ...AC_VALIDAS, PG_COLETOR_URL: PG, DSPD_SCHEMA_PREFIXO: `Invalido-${SEGREDO}` })).toEqual(['DSPD_SCHEMA_PREFIXO']);
    expect(carregarConfigColetaAcelerato({ ...AC_VALIDAS, PG_COLETOR_URL: PG, DSPD_SCHEMA_PREFIXO: 't_ab' }).worker.DSPD_SCHEMA_PREFIXO).toBe('t_ab');
  });

  it('erro que não é de configuração não é engolido (worker e MySQL)', () => {
    const quebra = (nome: string): NodeJS.ProcessEnv => Object.defineProperty({ ...AC_VALIDAS, PG_COLETOR_URL: PG }, nome, { enumerable: true, get: () => { throw new TypeError('falha-inesperada'); } });
    expect(() => carregarConfigColetaAcelerato(quebra('PG_COLETOR_URL'))).toThrow('falha-inesperada');
    expect(() => carregarConfigColetaAcelerato(quebra('ACELERATO_MYSQL_HOST'))).toThrow('falha-inesperada');
  });
});

describe('coleta do BusinessMap sem ambiente', () => {
  // A entrada lê o `.env` da raiz sem sobrescrever variável já definida; por isso o teste define todas as variáveis da configuração (as opcionais
  // vazias, que valem como não definidas) em vez de depender de ausência.
  const OPCIONAIS_VAZIAS = {
    BUSINESSMAP_QUADROS_IDS: '', BUSINESSMAP_LIMITE_POR_MINUTO: '', BUSINESSMAP_TIMEOUT_MS: '', BUSINESSMAP_PAGINA_TAMANHO: '',
    PESSOA_ELIMINADA_SAL: '', DSPD_SCHEMA_PREFIXO: '', LOG_LEVEL: 'info',
  };
  it('variáveis vazias ou inválidas: lista os nomes e nunca o valor', () => {
    const r = rodar('coleta-businessmap', {
      BUSINESSMAP_URL_BASE: `http://usuario:${SEGREDO}@bm.exemplo`, BUSINESSMAP_APIKEY: '', PG_COLETOR_URL: '',
      PG_REF_URL: 'postgres://ref:x@db.exemplo:5432/dspd', DSPD_PWD_REF: '', ...OPCIONAIS_VAZIAS,
    });
    expect(r.status).toBe(1);
    expect(r.stderr).toBe('bm:coleta falhou: configuração: BUSINESSMAP_URL_BASE, BUSINESSMAP_APIKEY, PG_COLETOR_URL\n');
    expect(r.stderr + r.stdout).not.toContain(SEGREDO);
    expect(r.stderr).not.toContain('erro-interno');
  });
});

describe('coleta ac com DSPD_SCHEMA_PREFIXO inválido', () => {
  it('a entrada nomeia a variável: nunca erro-interno nem o valor', () => {
    const r = rodar('coleta', { ...AC_VALIDAS, PG_COLETOR_URL: `postgres://coletor:${SEGREDO}@db.exemplo:5432/dspd`, DSPD_SCHEMA_PREFIXO: `Invalido-${SEGREDO}` });
    expect(r.status).toBe(1);
    expect(r.stderr).toBe('coleta ac falhou: configuração: DSPD_SCHEMA_PREFIXO\n');
    expect(r.stderr + r.stdout).not.toContain(SEGREDO);
  });
});

describe('diagnóstico do BusinessMap sem ambiente', () => {
  it('sem nenhuma variável: lista as duas obrigatórias pelo nome', () => {
    const r = rodar('diagnostico-businessmap');
    expect(r.status).toBe(2);
    expect(r.stderr).toBe('variáveis obrigatórias ausentes: BUSINESSMAP_URL_BASE, BUSINESSMAP_APIKEY\n');
    expect(r.stdout).toBe('');
  });

  it('as duas ausentes: lista as duas no plural', () => {
    expect(() => lerConfig({})).toThrow(/^variáveis obrigatórias ausentes: BUSINESSMAP_URL_BASE, BUSINESSMAP_APIKEY$/);
  });

  it('valor só com espaços conta como ausente', () => {
    expect(() => lerConfig({ BUSINESSMAP_URL_BASE: 'https://bm.exemplo', BUSINESSMAP_APIKEY: '   ' })).toThrow(/^variável obrigatória ausente: BUSINESSMAP_APIKEY$/);
  });

  it('uma ausente: nomeia só ela e não ecoa o valor da outra', () => {
    expect(() => lerConfig({ BUSINESSMAP_APIKEY: SEGREDO })).toThrow(/^variável obrigatória ausente: BUSINESSMAP_URL_BASE$/);
    const r = rodar('diagnostico-businessmap', { BUSINESSMAP_APIKEY: SEGREDO });
    expect(r.stderr).toBe('variável obrigatória ausente: BUSINESSMAP_URL_BASE\n');
    expect(r.stderr).not.toContain(SEGREDO);
  });
});
