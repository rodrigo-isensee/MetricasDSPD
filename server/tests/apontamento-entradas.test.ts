import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { ambienteFilho } from './ajuda-cli-filho.js';

// Pedido 059, E2.19: as entradas de linha de comando do apontamento (`bm:apontamento`, `bm:eliminar-pessoa`, `bm:ref-sync-apontamento`). A regra
// está nos módulos (testados com banco falso e no .pg); aqui se prova a casca: argumento inválido sai com código 2 e a linha de uso, antes de
// ler a configuração e sem chamar banco nem API, e nunca ecoa o valor recebido.
const entrada = (nome: string): string => new URL(`../src/entradas/${nome}.ts`, import.meta.url).pathname;
const rodar = (nome: string, args: string[], input = '') => spawnSync(process.execPath, ['--import', 'tsx', entrada(nome), ...args], { encoding: 'utf8', env: ambienteFilho(), timeout: 60_000, input });

describe('entradas do apontamento: argumento inválido', () => {
  it.each([
    ['apontamento-businessmap', ['incremental'], 'uso: bm:apontamento carga-inicial [--inicio=AAAA-MM-DD]', 'bm:apontamento falhou: uso'],
    ['apontamento-businessmap', ['carga-inicial', '--inicio=senha-secreta'], 'uso: bm:apontamento carga-inicial', 'bm:apontamento falhou: uso'],
    ['eliminar-pessoa-apontamento', [], 'uso: bm:eliminar-pessoa --usuario=<id', 'bm:eliminar-pessoa falhou: uso'],
    ['eliminar-pessoa-apontamento', ['--usuario=senha-secreta'], 'uso: bm:eliminar-pessoa --usuario=<id', 'bm:eliminar-pessoa falhou: uso'],
  ])('%s %j: código 2, linha de uso, nada na saída padrão e sem eco do valor', (nome, args, uso, prefixo) => {
    const r = rodar(nome, args);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain(uso);
    expect(r.stderr).toContain(prefixo);
    expect(r.stderr).not.toContain('senha-secreta');
    expect(r.stdout).toBe('');
  });
  it.each(['2026-02-30', 'ontem'])('bm:ref-sync-apontamento: data %s é recusada com a mensagem de uso e código 2, antes de ler a configuração', (data) => {
    const r = rodar('ref-sync-apontamento', [data]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('uso: bm:ref-sync-apontamento [AAAA-MM-DD]');
    expect(r.stdout).toBe('');
  });

  it.each(['', '\n', 'senha-secreta\n', '0\n', '1234567890123\n', `${'9'.repeat(200)}\n`])('bm:eliminar-pessoa --usuario=-: id da entrada padrão fora do formato (%j) dá código 2 e não ecoa o que foi lido', (entradaPadrao) => {
    const r = rodar('eliminar-pessoa-apontamento', ['--usuario=-'], entradaPadrao);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('bm:eliminar-pessoa falhou: uso');
    expect(r.stderr).not.toContain('senha-secreta');
    expect(r.stderr).not.toContain('99999');
    expect(r.stdout).toBe('');
  });
});
