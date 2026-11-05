import { z } from 'zod';
import type { SessaoMysql } from '../modulos/acelerato/cliente-mysql.js';
import { ErroColeta } from '../modulos/acelerato/erros.js';
import { NOMES_ETAPA_LISTA } from '../modulos/acelerato/listas-fechadas.js';
import { expandir } from '../modulos/acelerato/sql.js';

/**
 * Comando de apoio do L9-c (pedido 069, P-L9C-3 "A" do dono; `docs/analises/069-l9c-ordem.md` §8). SÓ LEITURA e SÓ CONTAGENS: duas consultas
 * agregadas sobre o mesmo MySQL e a mesma sessão só leitura da coleta do Acelerato. Nenhum valor de campo, nome de pessoa, título ou descrição sai
 * daqui; o único texto impresso é o nome de um dos 7 campos da lista fechada. Fica FORA de `CONSULTAS` (não é coleta e não entra no hash do SQL
 * versionado). Nada é escrito em base alguma. Quem roda é o dono, no terminal (`pnpm --filter @metricas-dspd/server ac:apoio-l9c`).
 *
 * Consulta A: `kanbanStatusKey` é a mesma chave que `etapaKey`? Consulta B: quantos chamados têm dois ou mais valores preenchidos diferentes no
 * mesmo campo (os que a ordem do fluxo decide). A consulta C do desenho (chamado com etapas de mais de um workflow) não faz parte desta entrega.
 */

/** Recorte da §8 do desenho (o mesmo da consulta de apoio entregue ao dono), por placeholder: tipo, organização e equipes do SSSC. */
export const RECORTE_APOIO = { tipo: 23, organizacao: 3, equipes: [7, 9, 332] } as const;

export const CONSULTA_A = [
  'SELECT COUNT(*) AS itens, SUM(f.k IS NULL) AS sem_chave,',
  "       SUM(EXISTS (SELECT 1 FROM JSON_TABLE(c.estatisticas, '$.workflow.etapas[*]' COLUMNS (ek BIGINT PATH '$.etapaKey')) e WHERE e.ek = f.k)) AS casa_etapa_key,",
  '       SUM(f.k = c.status_key) AS igual_status_atual',
  'FROM ACELERATO_CHAMADOS c,',
  "     JSON_TABLE(c.campos_personalizados_etapa, '$[*]' COLUMNS (nome VARCHAR(255) PATH '$.nome', k BIGINT PATH '$.kanbanStatusKey')) f",
  'WHERE c.tipo_ticket_key = ? AND c.organizacao_key = ? AND c.equipe_key IN (<equipes>)',
  '  AND f.nome IN (<nomes>)',
].join('\n');

export const CONSULTA_B = [
  'SELECT x.nome, COUNT(*) AS chamados',
  'FROM (SELECT c.ticket_key, f.nome',
  '      FROM ACELERATO_CHAMADOS c,',
  "           JSON_TABLE(c.campos_personalizados_etapa, '$[*]' COLUMNS (nome VARCHAR(255) PATH '$.nome', valor VARCHAR(80) PATH '$.valor')) f",
  '      WHERE c.tipo_ticket_key = ? AND c.organizacao_key = ? AND c.equipe_key IN (<equipes>)',
  '        AND f.nome IN (<nomes>)',
  '      GROUP BY c.ticket_key, f.nome',
  "      HAVING COUNT(DISTINCT NULLIF(TRIM(f.valor), '')) >= 2) x",
  'GROUP BY x.nome ORDER BY x.nome',
].join('\n');

/** Contagem do MySQL: inteiro ou texto decimal (`SUM` devolve DECIMAL); nulo (soma sem nenhuma linha) é zero. Qualquer outra coisa falha fechado. */
const contagem = z.union([z.number().int().min(0).safe(), z.string().regex(/^\d{1,15}$/).transform(Number), z.null().transform(() => 0)]);
const esquemaA = z.strictObject({ itens: contagem, sem_chave: contagem, casa_etapa_key: contagem, igual_status_atual: contagem });
const esquemaB = z.strictObject({ nome: z.enum(NOMES_ETAPA_LISTA as [string, ...string[]]), chamados: contagem });

export type ResultadoApoioL9c = {
  /** Itens de campo de etapa dos 7 nomes, e quantos: sem chave, com chave igual a algum `etapaKey` do chamado, com chave igual ao status atual. */
  a: { itens: number; sem_chave: number; casa_etapa_key: number; igual_status_atual: number };
  /** Por campo da lista fechada: chamados com dois ou mais valores preenchidos diferentes (zero quando a consulta não devolve o campo). */
  b: { campo: string; chamados: number }[];
};

/** Erro só com o NOME da coluna, nunca o valor (como a allow-list). */
function falhar(e: z.ZodError, entidade: string): never {
  const primeiro = e.issues[0];
  const nome = primeiro?.code === 'unrecognized_keys' ? primeiro.keys[0] : primeiro?.path[0];
  throw new ErroColeta('dados-invalidos', { entidade, ...(typeof nome === 'string' ? { coluna: nome } : {}) });
}

const parametros = (): unknown[] => [RECORTE_APOIO.tipo, RECORTE_APOIO.organizacao, ...RECORTE_APOIO.equipes, ...NOMES_ETAPA_LISTA];
const tamanhos = { equipes: RECORTE_APOIO.equipes.length, nomes: NOMES_ETAPA_LISTA.length };

export async function executarApoioL9c(sessao: SessaoMysql): Promise<ResultadoApoioL9c> {
  const linhasA = await sessao.consultar(expandir(CONSULTA_A, tamanhos), parametros());
  const a = esquemaA.safeParse(linhasA.length === 1 ? linhasA[0] : null); // um agregado sem GROUP BY devolve exatamente uma linha
  if (!a.success) return falhar(a.error, 'apoio_l9c_a');
  const porCampo = new Map<string, number>();
  for (const linha of await sessao.consultar(expandir(CONSULTA_B, tamanhos), parametros())) {
    const b = esquemaB.safeParse(linha);
    if (!b.success) return falhar(b.error, 'apoio_l9c_b');
    porCampo.set(b.data.nome, b.data.chamados);
  }
  return { a: a.data, b: NOMES_ETAPA_LISTA.map((campo) => ({ campo, chamados: porCampo.get(campo) ?? 0 })) };
}
