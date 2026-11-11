import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { ambienteFilho } from './ajuda-cli-filho.js';

const ENTRADA = new URL('../src/entradas/criterios-apontamento.ts', import.meta.url).pathname;
const RAIZ = new URL('../../', import.meta.url).pathname;

// Hermético: o filho carrega antes um módulo que troca `process.loadEnvFile`: no-op (sem `.env`) ou leitura de um `.env` de teste em pasta temporária.
// Nenhum `.env` da máquina entra e nenhuma base real é tocada (o "banco" é um socket local que recusa).
const pastaTemp = mkdtempSync(join(tmpdir(), 'criterios-entrada-'));
const TSX = import.meta.resolve('tsx');
const SEM_ENV = join(pastaTemp, 'sem-env.mjs');
writeFileSync(SEM_ENV, 'process.loadEnvFile = () => undefined;\n');
const CAMINHO = join(pastaTemp, 'caminho.txt');
const ENV_TESTE = join(pastaTemp, 'env-teste');
const COM_ENV = join(pastaTemp, 'com-env.mjs');
writeFileSync(
  COM_ENV,
  `import { appendFileSync } from 'node:fs';
const original = process.loadEnvFile.bind(process);
process.loadEnvFile = (p) => { appendFileSync(${JSON.stringify(CAMINHO)}, String(p)); original(${JSON.stringify(ENV_TESTE)}); };\n`,
);

const rodar = (isolador: string, env: Record<string, string> = {}): Promise<{ status: number | null; stdout: string; stderr: string }> =>
  new Promise((resolve, reject) => {
    const filho = spawn(process.execPath, ['--import', isolador, '--import', TSX, ENTRADA, '2026-01-05'], { cwd: pastaTemp, env: ambienteFilho(env) });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => filho.kill('SIGKILL'), 60_000);
    filho.stdout.on('data', (d) => (stdout += String(d)));
    filho.stderr.on('data', (d) => (stderr += String(d)));
    filho.on('error', reject);
    filho.on('close', (status) => {
      clearTimeout(timer);
      resolve({ status, stdout, stderr });
    });
  });

describe('entrada bm:criterios-apontamento', () => {
  afterAll(() => rmSync(pastaTemp, { recursive: true, force: true }));

  it('o script existe no package.json e usa o mesmo carregador de .env dos bm:*', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { scripts: Record<string, string> };
    expect(pkg.scripts['bm:criterios-apontamento']).toBe('tsx src/entradas/criterios-apontamento.ts');
    const fonte = readFileSync(ENTRADA, 'utf8');
    const ref = readFileSync(new URL('../src/entradas/ref-sync-apontamento.ts', import.meta.url), 'utf8');
    const trecho = "process.loadEnvFile(join(raiz, '.env'));";
    expect(fonte).toContain(trecho);
    expect(ref).toContain(trecho);
  });

  it('sem .env falha honesta: só o nome da variável faltante, código não zero', async () => {
    const r = await rodar(SEM_ENV);
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain('Configuração inválida (variáveis: PG_MIGRADOR_URL)');
  });

  it('com um .env de teste, lê o arquivo da raiz e usa o PG_MIGRADOR_URL dele, sem imprimi-lo', async () => {
    let conexoes = 0;
    const banco: Server = createServer((socket) => {
      conexoes += 1;
      socket.on('error', () => undefined);
      socket.destroy();
    });
    const porta = await new Promise<number>((res) => banco.listen(0, '127.0.0.1', () => res((banco.address() as { port: number }).port)));
    try {
      writeFileSync(ENV_TESTE, `PG_MIGRADOR_URL=postgres://migrador:segredo-de-teste@127.0.0.1:${porta}/db\n`);
      const r = await rodar(COM_ENV);
      expect(r.stderr).not.toContain('Configuração inválida');
      expect(conexoes).toBeGreaterThan(0);
      expect(readFileSync(CAMINHO, 'utf8')).toBe(join(RAIZ, '.env'));
      expect(r.stdout + r.stderr).not.toContain('segredo-de-teste');
    } finally {
      banco.close();
    }
  });
});
