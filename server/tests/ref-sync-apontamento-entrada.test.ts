import { spawn } from 'node:child_process';
import { createServer, type Server } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';

const ENTRADA = new URL('../src/entradas/ref-sync-apontamento.ts', import.meta.url).pathname;
const rodar = (args: string[], env: Record<string, string> = {}): Promise<{ status: number | null; stdout: string; stderr: string }> =>
  new Promise((resolve, reject) => {
    const filho = spawn(process.execPath, ['--import', 'tsx', ENTRADA, ...args], { env: { PATH: process.env.PATH ?? '', ...env } });
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

/** Servidor que responde ao início de conexão do PostgreSQL com um ErrorResponse fatal 28P01 (senha recusada). */
const subirBancoQueRecusa = (): Promise<{ server: Server; porta: number }> =>
  new Promise((resolve) => {
    const server = createServer((socket) => {
      socket.on('error', () => undefined);
      socket.once('data', () => {
        const campos = Buffer.concat([
          Buffer.from('SFATAL\0C28P01\0Mpassword authentication failed for user "dspd_ref"\0\0'),
        ]);
        const cab = Buffer.alloc(5);
        cab.write('E', 0);
        cab.writeInt32BE(campos.length + 4, 1);
        socket.end(Buffer.concat([cab, campos]));
      });
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, porta: (server.address() as { port: number }).port }));
  });

describe('entrada bm:ref-sync-apontamento', () => {
  let banco: Server | undefined;
  afterEach(() => {
    banco?.close();
    banco = undefined;
  });

  it.each(['2026-02-30', '2026-13-01', 'ontem'])('data %s é recusada com a mensagem de uso e código 2', async (data) => {
    const r = await rodar([data]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('uso: bm:ref-sync-apontamento [AAAA-MM-DD]');
    expect(r.stdout).toBe('');
  });

  it('sem configuração: só a categoria com o nome da variável', async () => {
    const r = await rodar(['2026-11-04']);
    expect(r.status).toBe(1);
    expect(r.stderr).toBe('bm:ref-sync-apontamento falhou: configuração: PG_REF_URL\n');
    expect(r.stdout).toBe('');
  });

  it('credencial recusada pelo banco: só a categoria autenticação, sem senha, usuário nem texto do driver', async () => {
    const { server, porta } = await subirBancoQueRecusa();
    banco = server;
    const r = await rodar(['2026-11-04'], { PG_REF_URL: `postgres://dspd_ref:SENHA-MARCADOR-087@127.0.0.1:${porta}/db` });
    expect(r.status).toBe(1);
    expect(r.stderr).toBe('bm:ref-sync-apontamento falhou: autenticação\n');
    expect(`${r.stdout}${r.stderr}`).not.toMatch(/SENHA-MARCADOR-087|password|127\.0\.0\.1/);
  });

  it('conexão recusada: só a categoria conexão, sem senha nem endereço', async () => {
    const { server, porta } = await subirBancoQueRecusa();
    await new Promise((ok) => server.close(ok)); // a porta fica livre: nada escuta
    const r = await rodar(['2026-11-04'], { PG_REF_URL: `postgres://dspd_ref:SENHA-MARCADOR-087@127.0.0.1:${porta}/db` });
    expect(r.status).toBe(1);
    expect(r.stderr).toBe('bm:ref-sync-apontamento falhou: conexão\n');
    expect(`${r.stdout}${r.stderr}`).not.toMatch(/SENHA-MARCADOR-087|ECONNREFUSED|127\.0\.0\.1/);
  });
});
