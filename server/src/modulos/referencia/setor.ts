/**
 * Setor do filtro do fluxo (pedido 097, E7, L10a). O nome do setor NUNCA vem do nome do quadro no BusinessMap (que traz o sobrenome do responsável):
 * vem do dicionário `setores` de `docs/architecture/fontes/businessmap-dominio.json`, já sem sobrenome, gravado em `ref_dominio` com
 * `campo = 'setor_quadro'` (`codigo` = id do quadro, `rotulo` = nome do setor). Este arquivo guarda o que o arquivo e a leitura do banco repartem.
 */
/** Valor de `ref_dominio.campo` do mapa `quadro_id` (codigo) -> nome do setor sem sobrenome (rotulo). */
export const CAMPO_SETOR_QUADRO = 'setor_quadro';
/** Id de quadro: só dígitos. */
export const CODIGO_QUADRO = /^\d{1,10}$/;
/** Nome de quadro com sobrenome: termina em " - " mais letras maiúsculas (ex.: "Plataformas - SOBRENOME"). */
const SOBRENOME_EM_CAIXA_ALTA = /\s-\s\p{Lu}{2,}$/u;
/** Rótulo de setor aceito: sem o padrão de sobrenome em caixa alta e sem arroba (e-mail). Texto seguro geral é conferido por quem chama. */
export const rotuloDeSetorSeguro = (rotulo: string): boolean => !SOBRENOME_EM_CAIXA_ALTA.test(rotulo.trim()) && !rotulo.includes('@');
