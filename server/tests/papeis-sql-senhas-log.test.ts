import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// K-388 (pedido 105): as senhas dos papéis nunca podem chegar ao log do servidor. Todo comando que usa :'pwd_x' vem DEPOIS dos SET que
// tiram o comando do log (log_statement, log_min_duration_statement, log_min_error_statement), e o script para no primeiro erro.
const SQL = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'deploy', 'sql', '00_papeis_e_banco.sql'), 'utf8');
const linhas = SQL.split('\n').filter((l) => !l.startsWith('--'));
const primeira = (re: RegExp) => linhas.findIndex((l) => re.test(l));

describe('00_papeis_e_banco.sql: senhas fora do log do servidor', () => {
  const primeiroUso = primeira(/:'?pwd_/);
  it('usa as senhas (conferência e CREATE ROLE)', () => {
    expect(primeiroUso).toBeGreaterThan(-1);
    expect(SQL.match(/CREATE ROLE dspd_\w+ LOGIN PASSWORD :'pwd_\w+'/g)).toHaveLength(5);
  });
  it.each([
    [/^SET log_statement = 'none';/, 'log_statement'],
    [/^SET log_min_duration_statement = -1;/, 'log_min_duration_statement'],
    [/^SET log_min_error_statement = panic;/, 'log_min_error_statement'],
    [/^\\set ON_ERROR_STOP on/, 'ON_ERROR_STOP'],
  ])('%s (%s) vem antes do primeiro comando que usa :pwd_', (re) => {
    const i = primeira(re);
    expect(i).toBeGreaterThan(-1);
    expect(i).toBeLessThan(primeiroUso);
  });
  it('nenhum SELECT, DO ou CREATE vai ao servidor antes dos SET de log', () => {
    const ultimoSet = primeira(/^SET log_min_error_statement/);
    const antes = linhas.slice(0, ultimoSet).filter((l) => /^(SELECT|DO|CREATE|ALTER|INSERT|GRANT)\b/i.test(l.trim()));
    expect(antes).toEqual([]);
  });
  it('senha só de espaços é recusada como vazia', () => {
    expect(SQL).toContain("btrim(:'pwd_migrador') = ''");
    expect(SQL).not.toMatch(/\(:'pwd_\w+' = ''\)/);
  });
});
