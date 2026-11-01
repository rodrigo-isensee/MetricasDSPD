import { describe, expect, it } from 'vitest';
import { carregarConfigBusinessMap, carregarConfigColetaBusinessMap, carregarConfigProjetorBusinessMap } from '../src/plataforma/config.js';

const base = { BUSINESSMAP_URL_BASE: 'https://exemplo.kanbanize.com/api/v2', BUSINESSMAP_APIKEY: 'chave-de-teste' };

describe('config do coletor do BusinessMap (F0 do plano 052)', () => {
  it('só as duas obrigatórias: padrões de 25 por minuto, 30 s, página de 100 e nenhum quadro', () => {
    expect(carregarConfigBusinessMap(base)).toMatchObject({
      BUSINESSMAP_URL_BASE: base.BUSINESSMAP_URL_BASE, BUSINESSMAP_LIMITE_POR_MINUTO: 25, BUSINESSMAP_TIMEOUT_MS: 30_000,
      BUSINESSMAP_PAGINA_TAMANHO: 100, BUSINESSMAP_QUADROS_IDS: [],
    });
  });
  it('valores vazios (como no .env.example) valem como não definidos; quadros viram números sem repetição', () => {
    const c = carregarConfigBusinessMap({ ...base, BUSINESSMAP_QUADROS_IDS: '35,23,24,35', BUSINESSMAP_LIMITE_POR_MINUTO: '', BUSINESSMAP_TIMEOUT_MS: '', BUSINESSMAP_PAGINA_TAMANHO: '' });
    expect(c.BUSINESSMAP_QUADROS_IDS).toEqual([35, 23, 24]);
    expect(c.BUSINESSMAP_LIMITE_POR_MINUTO).toBe(25);
    expect(carregarConfigBusinessMap({ ...base, BUSINESSMAP_QUADROS_IDS: '' }).BUSINESSMAP_QUADROS_IDS).toEqual([]);
  });
  it('recusa: ausentes, http, credencial na URL, limite acima de 25, quadros mal formados; a mensagem cita só nomes', () => {
    const ruins: Record<string, string>[] = [
      {}, { BUSINESSMAP_APIKEY: 'x' }, { ...base, BUSINESSMAP_URL_BASE: 'http://exemplo.com' }, { ...base, BUSINESSMAP_URL_BASE: 'não é url' },
      { ...base, BUSINESSMAP_URL_BASE: 'https://u:senha-secreta@exemplo.com' }, { ...base, BUSINESSMAP_LIMITE_POR_MINUTO: '26' },
      { ...base, BUSINESSMAP_QUADROS_IDS: '1;2' }, { ...base, BUSINESSMAP_PAGINA_TAMANHO: '0' }, { ...base, BUSINESSMAP_APIKEY: '' },
    ];
    for (const env of ruins) expect(() => carregarConfigBusinessMap(env)).toThrow(/^Configuração inválida \(variáveis: BUSINESSMAP_[A-Z_, ]+\)$/);
    expect(() => carregarConfigBusinessMap({ ...base, BUSINESSMAP_URL_BASE: 'https://u:senha-secreta@exemplo.com' })).not.toThrow(/senha-secreta/);
  });
});

describe('config do comando da coleta (F3 do plano 052)', () => {
  const coletor = 'postgres://dspd_coletor:coletor_dev@127.0.0.1:5432/metricas';
  it('a URL do papel de referência vem de PG_REF_URL ou, sem ela, do coletor trocando papel e senha por DSPD_PWD_REF', () => {
    const derivada = carregarConfigColetaBusinessMap({ ...base, PG_COLETOR_URL: coletor, DSPD_PWD_REF: 'ref_dev' });
    expect(derivada.PG_REF_URL).toBe('postgres://dspd_ref:ref_dev@127.0.0.1:5432/metricas');
    expect(derivada.PG_COLETOR_URL).toBe(coletor);
    const explicita = carregarConfigColetaBusinessMap({ ...base, PG_COLETOR_URL: coletor, PG_REF_URL: 'postgres://dspd_ref:outra@127.0.0.1:5432/metricas', DSPD_PWD_REF: '' });
    expect(explicita.PG_REF_URL).toBe('postgres://dspd_ref:outra@127.0.0.1:5432/metricas');
    expect(explicita.BUSINESSMAP_PAGINA_TAMANHO).toBe(100);
  });
  it('recusa sem a URL do coletor ou sem como chegar ao papel de referência; a mensagem cita só nomes', () => {
    expect(() => carregarConfigColetaBusinessMap({ ...base, DSPD_PWD_REF: 'ref_dev' })).toThrow(/PG_COLETOR_URL/);
    expect(() => carregarConfigColetaBusinessMap({ ...base, PG_COLETOR_URL: coletor })).toThrow(/^Configuração inválida \(variáveis: PG_REF_URL\)$/);
    expect(() => carregarConfigColetaBusinessMap({ ...base, PG_COLETOR_URL: coletor, PG_REF_URL: 'nao-url' })).toThrow(/PG_REF_URL/);
    expect(() => carregarConfigColetaBusinessMap({ ...base, PG_COLETOR_URL: coletor, DSPD_PWD_REF: 'senha-secreta', BUSINESSMAP_APIKEY: '' })).not.toThrow(/senha-secreta/);
  });
});

describe('config do projetor (F4 do plano 052)', () => {
  const coletor = 'postgres://dspd_coletor:coletor_dev@127.0.0.1:5432/metricas';
  it('só o banco do coletor: não exige nem lê a chave nem a URL do BusinessMap', () => {
    expect(carregarConfigProjetorBusinessMap({ PG_COLETOR_URL: coletor })).toEqual({ DSPD_SCHEMA_PREFIXO: '', LOG_LEVEL: 'info', PG_COLETOR_URL: coletor });
    expect(carregarConfigProjetorBusinessMap({ PG_COLETOR_URL: coletor, ...base, DSPD_SCHEMA_PREFIXO: 't_', LOG_LEVEL: 'warn' })).toEqual({ DSPD_SCHEMA_PREFIXO: 't_', LOG_LEVEL: 'warn', PG_COLETOR_URL: coletor });
  });
  it('recusa sem a URL do coletor ou com URL inválida; a mensagem cita só o nome', () => {
    expect(() => carregarConfigProjetorBusinessMap({})).toThrow(/^Configuração inválida \(variáveis: PG_COLETOR_URL\)$/);
    expect(() => carregarConfigProjetorBusinessMap({ PG_COLETOR_URL: 'senha-secreta' })).not.toThrow(/senha-secreta/);
  });
});
