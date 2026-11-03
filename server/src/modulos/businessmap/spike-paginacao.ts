import { lerConfig } from './diagnostico.js';

// Spike de paginação do /loggedTime (pedido 063, E1.6, K-200): exatamente 1 GET, `card_ids` = um card e `page=2`.
// Imprime só status, quantidade de registros, chaves do envelope e campos numéricos de paginação.
// Nunca o conteúdo dos registros, a chave, nem a URL com parâmetros.

export interface ResultadoSpikePaginacao {
  codigo: number;
  saida: string;
  erro: string;
}

export interface DepsSpikePaginacao {
  env: Record<string, string | undefined>;
  argumentos: string[];
  fetchImpl?: typeof fetch;
}

type Json = unknown;
const ehObjeto = (v: Json): v is Record<string, Json> => typeof v === 'object' && v !== null && !Array.isArray(v);
const NOME_SEGURO = /^\w{1,40}$/;

const nomes = (o: Record<string, Json>): string =>
  Object.keys(o).filter((k) => NOME_SEGURO.test(k)).slice(0, 20).join(', ') || '(sem chaves)';

/** Reduz a resposta à forma: quantidade de registros, chaves do envelope e números de paginação. */
export function descreverForma(corpo: Json): { registros: number | null; chaves: string; paginacao: string } {
  if (!ehObjeto(corpo)) return { registros: null, chaves: '(resposta sem objeto)', paginacao: '(nenhum)' };
  const d = corpo.data;
  const lista = Array.isArray(d) ? d : ehObjeto(d) && Array.isArray(d.data) ? d.data : undefined;
  const chaves = [`raiz: ${nomes(corpo)}`];
  if (ehObjeto(d)) chaves.push(`data: ${nomes(d)}`);
  const candidatos = [corpo.pagination, ehObjeto(d) ? d.pagination : undefined].filter(ehObjeto);
  const campos: string[] = [];
  for (const p of candidatos) {
    for (const [k, v] of Object.entries(p)) {
      if (NOME_SEGURO.test(k) && typeof v === 'number' && Number.isFinite(v)) campos.push(`${k}=${v}`);
    }
  }
  return { registros: lista ? lista.length : null, chaves: chaves.join(' · '), paginacao: campos.join(' · ') || '(nenhum)' };
}

export async function executarSpikePaginacao(deps: DepsSpikePaginacao): Promise<ResultadoSpikePaginacao> {
  const id = deps.argumentos[0];
  if (deps.argumentos.length !== 1 || id === undefined || !/^[1-9]\d{0,11}$/.test(id)) {
    return { codigo: 2, saida: '', erro: 'uso: informe um único id de card numérico (inteiro positivo)' };
  }
  let cfg: ReturnType<typeof lerConfig>;
  try {
    cfg = lerConfig(deps.env);
  } catch (e) {
    return { codigo: 2, saida: '', erro: (e as Error).message };
  }
  const fetchImpl = deps.fetchImpl ?? fetch;
  try {
    const resp = await fetchImpl(`${cfg.urlBase}/loggedTime?card_ids=${id}&page=2`, {
      method: 'GET',
      headers: { apikey: cfg.apikey, accept: 'application/json' },
      redirect: 'error',
      signal: AbortSignal.timeout(cfg.timeoutMs),
    });
    const texto = await resp.text();
    const linhas = ['# Spike de paginação do /loggedTime (1 GET, card_ids e page=2)', '', `- status HTTP: ${resp.status}`];
    if (resp.status >= 200 && resp.status < 300) {
      let corpo: Json;
      try {
        corpo = JSON.parse(texto);
      } catch {
        corpo = undefined;
      }
      const f = descreverForma(corpo);
      linhas.push(
        `- registros devolvidos: ${f.registros ?? '(não reconhecido)'}`,
        `- chaves do envelope: ${f.chaves}`,
        `- campos de paginação: ${f.paginacao}`,
      );
    }
    return { codigo: resp.status >= 200 && resp.status < 300 ? 0 : 1, saida: linhas.join('\n') + '\n', erro: '' };
  } catch (e) {
    const nome = (e as { name?: string }).name;
    const motivo = nome === 'TimeoutError' || nome === 'AbortError' ? 'tempo esgotado' : 'erro de rede';
    return { codigo: 1, saida: '', erro: `GET /loggedTime: ${motivo}` };
  }
}
