/**
 * Cortes únicos (K-280): as condições de `lerCards` e `lerChamados` (`metricas/repositorio.ts`) e das opções de filtro
 * (`referencia/repositorio.ts`) saem daqui; opção fora do corte da lista filtraria para vazio. Constantes fixas, sem entrada do usuário.
 */
export const CORTE_CARDS = 'criado_em IS NOT NULL AND granularidade IS NOT NULL AND tipo IS NOT NULL';
export const CORTE_CHAMADOS = 'aberto_em IS NOT NULL AND equipe IS NOT NULL AND fora_do_recorte = false';
