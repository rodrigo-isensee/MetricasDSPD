/**
 * Fonte única da regra LGPD de colunas de pessoa (data-model §9, garantia 1).
 * Usada pelos testes estáticos das migrações, do seed e do catálogo, e pelo `gerarGrants` (GRANT por coluna).
 * Decisão do usuário: nomes NÃO são pseudonimizados; nomes no analítico só nas colunas abaixo, que a API não lê.
 * As chaves usam os nomes de schema SEM prefixo de teste.
 */
export const SEGMENTO_PESSOA =
  /^(pessoa|responsav\w*|usuario\w*|user\w*|agente\w*|atendente\w*|solicitante\w*|autor\w*|criador\w*|email\w*|login\w*|assignee\w*|justificativa\w*)$/i;

/** Colunas de pessoa PERMITIDAS no analítico, por `schema.tabela.coluna`. Nova entrada exige mudar o data-model §9. */
export const COLUNAS_PESSOA: readonly string[] = [
  'dspd_bm.dim_card.responsaveis',
  'dspd_bm.dim_card_versao.responsaveis',
];

/** Exceções por `schema.tabela.coluna`, com justificativa. Sem curinga nem prefixo. Nova exceção exige mudar o data-model §9. */
export const EXCECOES_PESSOA: Readonly<Record<string, string>> = {
  'dspd_bm.dim_card.area_solicitante': 'área organizacional (briefing 4.5), não pessoa',
  'dspd_bm.dim_card_versao.area_solicitante': 'área organizacional (briefing 4.5), não pessoa',
  'dspd_ac.dim_chamado.justificativa_informada': 'indicador booleano derivado (FA-003); o texto livre nunca é gravado',
  'dspd_ac.dim_chamado_versao.justificativa_informada': 'indicador booleano derivado (FA-003); o texto livre nunca é gravado',
};

export const segmentos = (coluna: string): string[] => coluna.split('_').filter(Boolean);
export const colunaDePessoa = (coluna: string): boolean => segmentos(coluna).some((s) => SEGMENTO_PESSOA.test(s));
/** `schema.tabela` sem aspas e sem prefixo de teste; verdadeiro se a coluna viola a regra (não é permitida nem exceção). */
export const violaLgpd = (schemaTabela: string, coluna: string): boolean => {
  const chave = `${schemaTabela}.${coluna}`;
  return colunaDePessoa(coluna) && !(chave in EXCECOES_PESSOA) && !COLUNAS_PESSOA.includes(chave);
};
