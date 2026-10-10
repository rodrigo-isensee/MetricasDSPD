/**
 * Fonte única da regra LGPD de colunas de pessoa (data-model §9, garantia 1; review 002-K-017-r1).
 * Usada pelos testes estáticos das migrações, do seed e do information_schema. Não copiar a lista.
 * Decisão do usuário: nomes NÃO são pseudonimizados; a garantia é que nenhuma view/DTO expõe ou agrega por pessoa.
 */
export const SEGMENTO_PESSOA =
  /^(pessoa|responsav\w*|usuario\w*|user\w*|agente\w*|atendente\w*|solicitante\w*|autor\w*|criador\w*|email\w*|login\w*|assignee\w*|justificativa\w*)$/i;

/** Exceções por `schema.tabela.coluna`, com justificativa. Sem curinga nem prefixo. Nova exceção exige mudar o data-model §9. */
export const EXCECOES_PESSOA: Readonly<Record<string, string>> = {
  'dspd_bm.dim_card.area_solicitante': 'área organizacional (briefing 4.5), não pessoa',
  'dspd_bm.dim_card_versao.area_solicitante': 'área organizacional (briefing 4.5), não pessoa',
};

export const segmentos = (coluna: string): string[] => coluna.split('_').filter(Boolean);
export const colunaDePessoa = (coluna: string): boolean => segmentos(coluna).some((s) => SEGMENTO_PESSOA.test(s));
/** `schema.tabela` sem aspas/crases; verdadeiro se a coluna viola a regra e não tem exceção explícita. */
export const violaLgpd = (schemaTabela: string, coluna: string): boolean =>
  colunaDePessoa(coluna) && !(`${schemaTabela}.${coluna}` in EXCECOES_PESSOA);
