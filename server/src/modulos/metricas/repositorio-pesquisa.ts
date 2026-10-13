import { createHash } from 'node:crypto';
import type { LinhaPesquisa } from '@metricas-dspd/contratos';
import type { pesquisa } from '@metricas-dspd/metricas';
import { esquemasDoAmbiente, type Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import { lerVersoes } from '../operacao/index.js';
import type { FontePesquisa, LeituraPesquisa } from './fonte-pesquisa.js';

/**
 * Leitura real da pesquisa de percepção (PV1) em `dspd_core`: `pesq_*` (contagens agregadas) e `ref_pesq_*`, com colunas explícitas
 * (nunca `SELECT *`). Nenhuma tabela tem coluna de pessoa ou de comentário. Lê TODAS as cargas (a vigente é a de maior `carga_id`
 * recebida até a data de referência, decidido na biblioteca); reenvios anteriores ficam na base e fora do resultado.
 */
type RowArea = { codigo: string; rotulo: string };
type RowPergunta = { versao_id: string; vigente_desde: string; codigo: string | null; ordem: number | null; texto: string | null };
type RowCarga = { carga_id: string; trimestre: string; versao_id: string; recebida_em: string; o_que_mudou: string | null };
type RowLinha = {
  carga_id: string; area_codigo: string; pergunta_codigo: string; f1: number; f2: number; f3: number; f4: number; f5: number; convidados: number;
};

/** Quanto tempo a leitura é reaproveitada antes de consultar o banco de novo (a carga é trimestral). */
export const TTL_PESQUISA_MS = 60_000;

export async function lerBasePesquisa(db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<pesquisa.BasePesquisa> {
  const s = S.core;
  const areas = await db.query<RowArea>(
    `SELECT DISTINCT ON (codigo) codigo, rotulo FROM ${s}.ref_pesq_area ORDER BY codigo, vigente_de DESC`);
  const perguntas = await db.query<RowPergunta>(
    `SELECT v.versao_id, v.vigente_desde, p.codigo, p.ordem, p.texto FROM ${s}.ref_versao_criterio v
     LEFT JOIN ${s}.ref_pesq_pergunta p ON p.versao_id = v.versao_id
     WHERE v.dominio = 'pesquisa' ORDER BY v.vigente_desde, v.versao_id, p.ordem`);
  const cargas = await db.query<RowCarga>(
    `SELECT carga_id, trimestre, versao_id, to_char(recebida_em AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS recebida_em, o_que_mudou
     FROM ${s}.pesq_carga ORDER BY carga_id`);
  const linhas = await db.query<RowLinha>(
    `SELECT r.carga_id, r.area_codigo, r.pergunta_codigo,
            coalesce(sum(r.contagem) FILTER (WHERE r.faixa = 1), 0)::int AS f1, coalesce(sum(r.contagem) FILTER (WHERE r.faixa = 2), 0)::int AS f2,
            coalesce(sum(r.contagem) FILTER (WHERE r.faixa = 3), 0)::int AS f3, coalesce(sum(r.contagem) FILTER (WHERE r.faixa = 4), 0)::int AS f4,
            coalesce(sum(r.contagem) FILTER (WHERE r.faixa = 5), 0)::int AS f5, p.convidados
     FROM ${s}.pesq_resultado r JOIN ${s}.pesq_participacao p ON p.carga_id = r.carga_id AND p.area_codigo = r.area_codigo
     GROUP BY r.carga_id, r.area_codigo, r.pergunta_codigo, p.convidados
     ORDER BY r.carga_id, r.area_codigo, r.pergunta_codigo`);

  const versoes = new Map<string, pesquisa.VersaoQuestionario>();
  for (const r of perguntas.rows) {
    const id = String(r.versao_id);
    const v = versoes.get(id) ?? { id, vigenteDesde: r.vigente_desde, perguntas: [] };
    if (r.codigo !== null) v.perguntas.push({ codigo: r.codigo, ordem: r.ordem as number, texto: r.texto as string });
    versoes.set(id, v);
  }
  const porCarga = new Map<string, LinhaPesquisa[]>();
  const trimestreDe = new Map(cargas.rows.map((c) => [String(c.carga_id), c.trimestre]));
  for (const l of linhas.rows) {
    const k = String(l.carga_id);
    const lista = porCarga.get(k) ?? [];
    lista.push({ trimestre: trimestreDe.get(k) as string, area: l.area_codigo, pergunta: l.pergunta_codigo,
      f1: l.f1, f2: l.f2, f3: l.f3, f4: l.f4, f5: l.f5, convidados: l.convidados });
    porCarga.set(k, lista);
  }
  return {
    areas: areas.rows.map((a) => ({ codigo: a.codigo, rotulo: a.rotulo })),
    versoes: [...versoes.values()],
    cargas: cargas.rows.map((c) => ({
      cargaId: Number(c.carga_id), trimestre: c.trimestre, versaoId: String(c.versao_id), recebidaEm: c.recebida_em,
      oQueMudou: c.o_que_mudou, linhas: porCarga.get(String(c.carga_id)) ?? [],
    })),
    criterios: await lerVersoes(db, 'pesquisa', S),
  };
}

/**
 * Fonte real da PV1 (`DADOS_FONTE=real`). A versão é o hash do conteúdo lido: muda a cada carga (ou ajuste de referência) e entra na chave
 * do cache do serviço. Dentro do TTL não consulta o banco; passado o TTL, relê e mantém a mesma leitura se nada mudou.
 */
export function criarFontePesquisaReal(db: Consultavel, S?: Esquemas, agora: () => number = Date.now): FontePesquisa {
  let atual: { lidoEm: number; leitura: LeituraPesquisa } | null = null;
  return {
    async ler() {
      const t = agora();
      if (atual !== null && t - atual.lidoEm < TTL_PESQUISA_MS) return atual.leitura;
      const base = await lerBasePesquisa(db, S);
      const versao = createHash('sha256').update(JSON.stringify(base)).digest('hex').slice(0, 16);
      const leitura = atual !== null && atual.leitura.versao === versao ? atual.leitura : { versao, base };
      atual = { lidoEm: t, leitura };
      return leitura;
    },
  };
}
