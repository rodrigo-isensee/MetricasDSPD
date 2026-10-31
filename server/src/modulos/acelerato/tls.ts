import { X509Certificate } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { ConnectionOptions, PeerCertificate } from 'node:tls';
import { ErroColeta } from './erros.js';

/**
 * TLS exigido com o certificado do servidor fixado pela impressão SHA-256 (ADR 0023, item 3; ameaças M3).
 * A conferência de nome do certificado é TROCADA pela de impressão, nunca desligada: `rejectUnauthorized` fica `true`.
 */

/** Impressão em 64 dígitos hexadecimais minúsculos sem separador; com ou sem `:` na entrada; `null` se o formato não serve. */
export function normalizarImpressao(valor: string): string | null {
  const limpo = valor.replaceAll(':', '').toLowerCase();
  return /^[0-9a-f]{64}$/.test(limpo) ? limpo : null;
}

/** Impressão SHA-256 (DER) do primeiro certificado do PEM, normalizada. Lança `tls-configuracao` se o PEM não serve. */
export function impressaoDoPem(pem: string): string {
  try {
    return new X509Certificate(pem).fingerprint256.replaceAll(':', '').toLowerCase();
  } catch {
    throw new ErroColeta('tls-configuracao');
  }
}

export type TlsPreparado = { pem: string; impressao: string };

/**
 * Na partida: lê o PEM, calcula a impressão e RECUSA se não for igual à fixada. A impressão é a autoridade; o arquivo
 * sozinho não muda a confiança. Nunca ecoa o conteúdo do arquivo nem o valor das impressões.
 */
export function prepararTls(
  impressaoFixada: string, caminhoPem: string, ler: (caminho: string) => string = (c) => readFileSync(c, 'utf8'),
): TlsPreparado {
  let pem: string;
  try {
    pem = ler(caminhoPem);
  } catch {
    throw new ErroColeta('tls-configuracao');
  }
  if (impressaoDoPem(pem) !== impressaoFixada) throw new ErroColeta('tls-impressao-diferente');
  return { pem, impressao: impressaoFixada };
}

/**
 * Opções que o conector repassa ao `tls.connect` do Node. A verificação acontece no aperto de mão TLS, antes de o
 * driver enviar usuário e senha: impressão diferente = erro aqui, conexão destruída, credencial nunca enviada.
 */
export function opcoesSsl(tls: TlsPreparado): ConnectionOptions {
  return {
    ca: tls.pem,
    allowPartialTrustChain: true,
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2',
    checkServerIdentity: (_nome: string, certificado: PeerCertificate): Error | undefined => {
      const recebida = typeof certificado.fingerprint256 === 'string' ? normalizarImpressao(certificado.fingerprint256) : null;
      return recebida !== null && recebida === tls.impressao ? undefined : new ErroColeta('tls-impressao-diferente');
    },
  };
}
