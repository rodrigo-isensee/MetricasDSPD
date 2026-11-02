import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

// Pedido 059, E2.19: as entradas de linha de comando do apontamento (`bm:ref-sync-apontamento`). A regra
// está nos módulos (testados com banco falso e no .pg); aqui se prova a casca: argumento inválido sai com código 2 e a linha de uso, antes de
// ler a configuração e sem chamar banco nem API, e nunca ecoa o valor recebido.
const entrada = (nome: string): string => new URL(`../src/entradas/${nome}.ts`, import.meta.url).pathname;
const rodar = (nome: string, args: string[]) => spawnSync(process.execPath, ['--import', 'tsx', entrada(nome), ...args], { encoding: 'utf8', env: { PATH: process.env.PATH ?? '' }, timeout: 60_000 });

describe('entradas do apontamento: argumento inválido', () => {
  it.each(['2026-02-30', 'ontem'])('bm:ref-sync-apontamento: data %s é recusada com a mensagem de uso e código 2, antes de ler a configuração', (data) => {
    const r = rodar('ref-sync-apontamento', [data]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('uso: bm:ref-sync-apontamento [AAAA-MM-DD]');
    expect(r.stdout).toBe('');
  });
});
