import type { ClienteHttp } from '../../plataforma/http.js';
import { mapaDeTagsDeClasse, type MapaTagsDeClasse } from './allow-list.js';
import { desembrulhar } from './spike-forma.js';

// Pedido 105 (E7.3, ADR 0020 item 4i): catálogo de etiquetas do BusinessMap (`GET /tags`, só leitura, sem consulta). O rótulo é texto
// escrito por pessoas: vive só nesta função e na memória da coleta, e o que sai é o mapa etiqueta -> classe (lista fechada). Nada é logado.

/** Teto de páginas do catálogo (a API não deve paginar `/tags`; o teto evita laço se paginar de forma inesperada). */
const TETO_PAGINAS_TAGS = 50;

/** Lê o catálogo e devolve só as etiquetas de classe (Urgente, Prioritário, Prazo fixo, Padrão e variações de grafia). Erro do cliente sobe sem mensagem alterada. */
export async function lerMapaDeTagsDeClasse(cliente: Pick<ClienteHttp, 'get'>): Promise<MapaTagsDeClasse> {
  const itens: unknown[] = [];
  let total = 1;
  for (let pagina = 1; pagina <= total && pagina <= TETO_PAGINAS_TAGS; pagina += 1) {
    const env = desembrulhar(await cliente.get('/tags', pagina === 1 ? {} : { consulta: { page: pagina } }));
    itens.push(...env.itens);
    total = env.paginas ?? 1;
  }
  return mapaDeTagsDeClasse(itens);
}
