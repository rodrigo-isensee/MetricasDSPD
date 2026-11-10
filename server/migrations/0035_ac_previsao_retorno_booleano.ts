import { migracao } from '../src/plataforma/db/executar.js';
import { dropView, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';
import { ddl as ddl0009 } from './0009_ac_projecoes_referencia.js';

/**
 * Pedido 069, L9-c (K-220), D-L9-1 (decisão do dono de 2026-11-05): `previsao_retorno` passa de `timestamptz` a booleano "tem previsão de
 * retorno"; a data prevista não é coletada. A coluna nunca foi projetada e está nula em toda linha. A troca usa
 * `USING (NULLIF(previsao_retorno IS NOT NULL, false))`: `IS NOT NULL` sozinho devolveria `false` para as linhas nulas e as mudaria; com o
 * `NULLIF` a linha nula segue nula e só valor existente viraria `true`. Antes da troca, a migração confere que nenhuma linha tem valor e,
 * se houver, falha sem mudar nada (a dúvida volta ao dono). As três views leem a coluna e impedem a troca de tipo: são recriadas com a
 * mesma definição da 0009 (os GRANTs são reaplicados pelo migrador ao fim). Nenhuma outra coluna nem linha é alterada ou apagada.
 * `down` volta o tipo só se a coluna estiver toda nula (senão o booleano seria descartado em silêncio).
 */
const TABELAS = ['dim_chamado', 'dim_chamado_versao'] as const;
const VIEWS = ['vw_abertos', 'vw_fechados_sla', 'vw_populacao_sssc'] as const;

const guarda = (S: Esquemas, motivo: string): string => `DO $guarda$ BEGIN
  IF ${TABELAS.map((t) => `EXISTS (SELECT 1 FROM ${S.ac}.${t} WHERE previsao_retorno IS NOT NULL)`).join(' OR ')} THEN
    RAISE EXCEPTION '${motivo}';
  END IF;
END $guarda$`;

export const ddl = (S: Esquemas): Ddl => {
  const criarViews = ddl0009(S).up.filter((i) => i.startsWith('CREATE VIEW'));
  const soltarViews = VIEWS.map((v) => dropView(`${S.ac}.${v}`));
  const trocar = (tipo: string, usando: string): string[] => [
    ...soltarViews,
    ...TABELAS.map((t) => `ALTER TABLE ${S.ac}.${t} ALTER COLUMN previsao_retorno TYPE ${tipo} USING (${usando})`),
    ...criarViews,
  ];
  return {
    up: [guarda(S, 'previsao_retorno tem valor: a troca para booleano foi recusada, nada foi alterado'),
      ...trocar('boolean', 'NULLIF(previsao_retorno IS NOT NULL, false)')],
    down: [guarda(S, 'previsao_retorno tem valor booleano: a volta para timestamptz foi recusada, nada foi alterado'),
      ...trocar('timestamptz(3)', 'NULL::timestamptz')],
  };
};
export const { up, down } = migracao(ddl);
