import { X509Certificate } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Duplex } from 'node:stream';
import tls from 'node:tls';

/**
 * Certificado de teste gerado em tempo de execução (nada de chave privada versionada): uma CA descartável e um certificado
 * de servidor folha (CA:FALSE) assinado por ela, como o que o MySQL gera sozinho. O servidor manda só a folha.
 */
export type Certificado = { pem: string; chave: string; impressao: string };

export function temOpenssl(): boolean {
  try { execFileSync('openssl', ['version'], { stdio: 'ignore' }); return true; } catch { return false; }
}

export function gerarCertificado(): Certificado {
  const dir = mkdtempSync(join(tmpdir(), 'ac-tls-'));
  const p = (n: string): string => join(dir, n);
  const run = (...args: string[]): void => { execFileSync('openssl', args, { stdio: 'ignore' }); };
  try {
    run('req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', p('ca.key'), '-out', p('ca.pem'), '-days', '2', '-subj', '/CN=ca-de-teste-056');
    run('req', '-newkey', 'rsa:2048', '-nodes', '-keyout', p('srv.key'), '-out', p('srv.csr'), '-subj', '/CN=servidor-de-teste-056');
    run('x509', '-req', '-in', p('srv.csr'), '-CA', p('ca.pem'), '-CAkey', p('ca.key'), '-CAcreateserial', '-out', p('srv.pem'), '-days', '2');
    const pem = readFileSync(p('srv.pem'), 'utf8');
    return { pem, chave: readFileSync(p('srv.key'), 'utf8'), impressao: new X509Certificate(pem).fingerprint256.replaceAll(':', '').toLowerCase() };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const pacote = (seq: number, corpo: Buffer): Buffer => {
  const h = Buffer.alloc(4);
  h.writeUIntLE(corpo.length, 0, 3);
  h[3] = seq;
  return Buffer.concat([h, corpo]);
};
const u16 = (n: number): Buffer => { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; };
const u32 = (n: number): Buffer => { const b = Buffer.alloc(4); b.writeUInt32LE(n); return b; };

/** Saudação (handshake v10) de um MySQL 8.0.35; `comSsl` liga a capacidade CLIENT_SSL. */
function saudacao(comSsl: boolean): Buffer {
  const CAP = 0x1 | 0x4 | 0x8 | 0x200 | 0x2000 | 0x8000 | (comSsl ? 0x800 : 0);
  return pacote(0, Buffer.concat([
    Buffer.from([10]), Buffer.from('8.0.35\0'), u32(1), Buffer.from('abcdefgh'), Buffer.from([0]), u16(CAP), Buffer.from([0xff]), u16(2),
    u16(0x0008), Buffer.from([21]), Buffer.alloc(10), Buffer.from('ijklmnopqrst\0'), Buffer.from('caching_sha2_password\0'),
  ]));
}

export type ServidorFalso = {
  porta: number;
  /** Bytes que o cliente mandou DEPOIS do aperto de mão TLS (a credencial só pode estar aí). */
  bytesAposTls: () => number;
  /** O aperto de mão TLS terminou do lado do servidor (o cliente aceitou o certificado). */
  tlsConcluido: () => boolean;
  /** Bytes recebidos em texto puro depois da saudação (o pedido de SSL tem 36; mais que isso seria credencial em claro). */
  bytesEmClaro: () => number;
  fechar: () => Promise<void>;
};

/** Servidor TCP que fala só o começo do protocolo MySQL: saudação, pedido de SSL e aperto de mão TLS com o certificado dado. */
export async function servidorMysqlFalso(cert: Certificado | null): Promise<ServidorFalso> {
  let aposTls = 0;
  let claro = 0;
  let concluido = false;
  const sockets = new Set<net.Socket>();
  const servidor = net.createServer((socket) => {
    sockets.add(socket);
    socket.on('error', () => undefined);
    socket.on('close', () => sockets.delete(socket));
    socket.write(saudacao(cert !== null));
    let atualizou = false;
    socket.on('data', (d: Buffer) => {
      if (cert === null) { claro += d.length; return; }
      if (atualizou) return;
      claro += Math.min(d.length, 36);
      if (claro < 36) return;
      atualizou = true;
      socket.removeAllListeners('data');
      // O pedido de SSL (36 bytes) e o começo do aperto de mão TLS podem chegar juntos: o resto vai ao TLS por um Duplex
      // (o TLSSocket sobre o socket cru ignoraria o que já foi lido em JavaScript).
      const ponte = new Duplex({ read: () => undefined, write: (c: Buffer, _e, cb) => { socket.write(c, cb); } });
      if (d.length > 36) ponte.push(d.subarray(36));
      socket.on('data', (c) => ponte.push(c));
      socket.on('end', () => ponte.push(null));
      const seguro = new tls.TLSSocket(ponte, { isServer: true, key: cert.chave, cert: cert.pem });
      seguro.on('error', () => undefined);
      seguro.on('secure', () => { concluido = true; });
      seguro.on('data', (b) => { aposTls += b.length; seguro.destroy(); });
    });
  });
  await new Promise<void>((r) => { servidor.listen(0, '127.0.0.1', r); });
  return {
    porta: (servidor.address() as net.AddressInfo).port,
    bytesAposTls: () => aposTls, tlsConcluido: () => concluido, bytesEmClaro: () => claro,
    fechar: () => new Promise<void>((r) => { for (const s of sockets) s.destroy(); servidor.close(() => r()); }),
  };
}
