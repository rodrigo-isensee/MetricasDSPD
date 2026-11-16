import type { ClienteHttp } from '../../plataforma/http.js';
import { mapaDeTagsDeClasse, type MapaTagsDeClasse } from './allow-list.js';
import { desembrulhar } from './spike-forma.js';

// Pedido 105 (E7.3, ADR 0020 item 4i): catálogo de etiquetas do BusinessMap (`GET /tags`, só leitura, sem consulta). O rótulo é texto
// escrito por pessoas: vive só nesta função e na memória da coleta, e o que sai é o mapa etiqueta -> classe (lista fechada). Nada é logado.

/** Teto de páginas do catálogo (a API não deve paginar `/tags`; o teto evita laço se paginar de forma inesperada). */
export const TETO_PAGINAS_TAGS = 50;

/** Aviso do teto: só números (páginas lidas e páginas declaradas pela API), nunca rótulo nem dado de pessoa. */
export interface AvisoTetoTags { lidas: number; declaradas: number }

/** Lê o catálogo e devolve só as etiquetas de classe (Urgente, Prioritário, Prazo fixo, Padrão e variações de grafia). Erro do cliente sobe sem mensagem alterada.
 * Se a API declara mais páginas que o teto, a leitura para no teto e `aoAtingirTeto` recebe as contagens (o teto não muda). */
export async function lerMapaDeTagsDeClasse(cliente: Pick<ClienteHttp, 'get'>, aoAtingirTeto?: (aviso: AvisoTetoTags) => void): Promise<MapaTagsDeClasse> {
  const itens: unknown[] = [];
  let total = 1;
  for (let pagina = 1; pagina <= total && pagina <= TETO_PAGINAS_TAGS; pagina += 1) {
    const env = desembrulhar(await cliente.get('/tags', pagina === 1 ? {} : { consulta: { page: pagina } }));
    itens.push(...env.itens);
    total = env.paginas ?? 1;
  }
  if (total > TETO_PAGINAS_TAGS) aoAtingirTeto?.({ lidas: TETO_PAGINAS_TAGS, declaradas: total });
  return mapaDeTagsDeClasse(itens);
}
