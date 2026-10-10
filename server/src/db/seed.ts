import { sql, type Kysely, type RawBuilder } from 'kysely';
import { gerarBaseMock, type BaseMock } from '@metricas-dspd/mock';

/**
 * Seed da base analítica a partir do mock compartilhado (`gerarBaseMock`): nenhuma regra é duplicada aqui,
 * só o mapeamento para as tabelas do data-model. Sem relógio, sem Math.random: determinístico pela semente.
 * Grava projeções (`dim_card`, `fato_bloqueio`, `dim_chamado`, `fato_etapa_chamado`), `fato_transicao` e `ref_coluna`.
 * Não grava `responsaveis`, `usuario`, `justificativa_ajuste` (data-model §9). Nunca apaga nem sobrescreve.
 */
export const VERSAO_SEED = 'seed-mock';
export const TAMANHO_LOTE = 500;
const OFFSET_CIVIL_MS = -3 * 3600_000; // America/Sao_Paulo (ref_calendario.offset_minutos = -180)

type Valor = string | number | null;
export type Linha = Record<string, Valor>;
export type Tabela = { tabela: string; linhas: Linha[] };

/** epoch ms -> DATETIME(3) em UTC ('AAAA-MM-DD HH:MM:SS.mmm'). */
export const dt = (ms: number): string => new Date(ms).toISOString().slice(0, 23).replace('T', ' ');
const dtn = (ms: number | null): string | null => (ms === null ? null : dt(ms));
/** epoch ms -> DATE civil no fuso do calendário. */
export const dia = (ms: number): string => new Date(ms + OFFSET_CIVIL_MS).toISOString().slice(0, 10);
const bit = (b: boolean): number => (b ? 1 : 0);

/** Id ASCII estável para colunas do quadro: o nome (com acentos) fica em ref_coluna.nome. */
const idColuna = (ordem: number): string => `c${ordem}`;

export function mapearBM(base: BaseMock, coletaId: number): Tabela[] {
  const { cards, transicoes, bloqueios, colunas } = base.bm;
  const inicio = base.config.hoje; // só para derivar datas; o corte vem da config
  const coletado = dt(new Date(inicio).getTime());
  const porNome = new Map(colunas.map((c) => [`${c.quadro_id}|${c.coluna}`, idColuna(c.ordem)]));
  const col = (quadro: string | undefined, nome: string | null): string | null =>
    nome === null || quadro === undefined ? null : (porNome.get(`${quadro}|${nome}`) ?? null);
  const destino = (q: string | undefined, nome: string): string => {
    const id = col(q, nome);
    if (id === null) throw new Error(`coluna de destino sem ref_coluna: ${q ?? '?'}|${nome}`);
    return id;
  };
  const quadroDe = new Map(cards.map((c) => [c.card_id, c.quadro_id]));
  const vigenteDe = dia(Math.min(...cards.map((c) => c.criado_em)));

  const dimCard = cards.map((c): Linha => ({
    card_id: c.card_id, tipo: c.tipo, classe_servico: c.classe_servico, sistema: c.sistema,
    area_solicitante: c.area_solicitante, fornecedor: c.fornecedor, objetivo_estrategico: c.objetivo_estrategico,
    card_pai: c.card_pai, criado_em: dt(c.criado_em), comprometido_em: dtn(c.comprometido_em),
    iniciado_em: dtn(c.iniciado_em), concluido_em: dtn(c.concluido_em), arquivado_em: dtn(c.arquivado_em),
    motivo_descarte: c.motivo_descarte, tamanho_declarado: c.tamanho_declarado, titulo: c.titulo,
    granularidade: c.granularidade, equipe: c.equipe, quadro_id: c.quadro_id,
    coluna_atual_id: col(c.quadro_id, c.coluna_atual), excluido_em: dtn(c.excluido_em),
    eh_subtarefa: bit(c.eh_subtarefa), data_acordada: c.data_acordada === null ? null : dia(c.data_acordada),
    responsabilidade_atraso: c.responsabilidade_atraso, origem_demanda: c.origem_demanda,
    fase_deteccao: c.fase_deteccao, severidade: c.severidade, origem_bug: c.origem_bug,
    adicionado_apos_inicio_pai: bit(c.adicionado_apos_inicio_pai),
    coletado_em: coletado, atualizado_por_coleta_id: coletaId,
  }));

  const fatoTransicao = transicoes.map((t, i): Linha => {
    const q = quadroDe.get(t.card_id);
    return {
      card_id: t.card_id, quadro_id: q ?? null, coluna_origem_id: col(q, t.coluna_origem),
      coluna_destino_id: destino(q, t.coluna_destino), tipo_coluna: t.tipo_coluna, direcao: t.direcao,
      fonte: 'revision', id_origem: `seed-${i}`, ocorrido_em: dt(t.timestamp), coletado_em: coletado, coleta_id: coletaId,
    };
  });

  const contador = new Map<string, number>();
  const fatoBloqueio = bloqueios.map((b): Linha => {
    const n = (contador.get(b.card_id) ?? 0) + 1;
    contador.set(b.card_id, n);
    return {
      card_id: b.card_id, id_origem: `seed-${n}`, motivo: b.motivo,
      coluna_em_que_bloqueou: col(quadroDe.get(b.card_id), b.coluna_em_que_bloqueou), fornecedor: b.fornecedor,
      inicio: dt(b.inicio), fim: dtn(b.fim), duracao_horas_uteis: b.duracao_horas_uteis,
      coletado_em: coletado, atualizado_por_coleta_id: coletaId,
    };
  });

  const refColuna = colunas.map((c): Linha => ({
    quadro_id: c.quadro_id, coluna_id: idColuna(c.ordem), vigente_de: vigenteDe, nome: c.coluna,
    tipo_coluna: c.tipo_coluna, papel: c.papel, ordem: c.ordem, limite_wip: c.limite_wip,
  }));

  return [
    { tabela: 'dspd_bm.dim_card', linhas: dimCard },
    { tabela: 'dspd_bm.fato_transicao', linhas: fatoTransicao },
    { tabela: 'dspd_bm.fato_bloqueio', linhas: fatoBloqueio },
    { tabela: 'dspd_bm.ref_coluna', linhas: refColuna },
  ];
}

export function mapearAC(base: BaseMock, coletaId: number): Tabela[] {
  const coletado = dt(new Date(base.config.hoje).getTime());
  const dimChamado = base.ac.chamados.map((c): Linha => ({
    chamado_id: c.chamado_id, natureza: c.natureza, equipe: c.equipe, organizacao: c.organizacao,
    tipo: c.tipo_fila, prioridade: c.prioridade, urgencia: c.urgencia, impacto: c.impacto, status: c.status,
    aberto_em: dt(c.aberto_em), data_finalizado: dtn(c.data_finalizado), status_sla_r: c.status_sla_r,
    motivo_escalacao: c.motivo_escalacao, motivo_encerramento: c.motivo_encerramento,
    avaliacao_problema: c.avaliacao_problema, excluido: bit(c.excluido),
    coletado_em: coletado, atualizado_por_coleta_id: coletaId,
  }));
  const fatoEtapa = base.ac.etapas.map((e): Linha => ({
    chamado_id: e.chamado_id, etapa: e.etapa, entrada: dt(e.entrada), saida: dtn(e.saida),
    motivo_pendencia: e.motivo_pendencia, coletado_em: coletado, atualizado_por_coleta_id: coletaId,
  }));
  return [
    { tabela: 'dspd_ac.dim_chamado', linhas: dimChamado },
    { tabela: 'dspd_ac.fato_etapa_chamado', linhas: fatoEtapa },
  ];
}

export function lotes<T>(itens: T[], tamanho = TAMANHO_LOTE): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < itens.length; i += tamanho) out.push(itens.slice(i, i + tamanho));
  return out;
}

/** INSERT parametrizado em lote (valores sempre como parâmetros; nomes vêm do mapeamento, não da entrada). */
export function insertLote(t: string, linhas: Linha[]): RawBuilder<unknown> {
  const cols = Object.keys(linhas[0] ?? {});
  const valores = linhas.map((l) => sql`(${sql.join(cols.map((c) => l[c] ?? null))})`);
  return sql`INSERT INTO ${sql.raw(t)} (${sql.raw(cols.join(', '))}) VALUES ${sql.join(valores)}`;
}

export type ResultadoSeed = 'semeado' | 'ja_semeado';

const SCHEMAS = [
  { schema: 'dspd_bm', mapear: mapearBM },
  { schema: 'dspd_ac', mapear: mapearAC },
] as const;

/**
 * Idempotente: se já existe a coleta `seed-mock` com a mesma semente, não faz nada; com semente diferente, recusa
 * (nunca sobrescreve histórico; para outra base, use um banco novo). Uma transação por schema (BM e AC não se misturam).
 */
export async function semear(db: Kysely<unknown>, base: BaseMock = gerarBaseMock()): Promise<ResultadoSeed> {
  const parametros = JSON.stringify({ semente: base.config.semente, hoje: base.config.hoje,
    escala: base.config.escala, mesesHistorico: base.config.mesesHistorico });
  const iniciado = dt(new Date(base.config.hoje).getTime());
  let gravou = false;
  for (const { schema, mapear } of SCHEMAS) {
    await db.transaction().execute(async (trx) => {
      const ex = await sql<{ coleta_id: string; parametros: unknown }>`
        SELECT coleta_id, parametros FROM ${sql.raw(schema)}.ctl_coleta WHERE versao_coletor = ${VERSAO_SEED} LIMIT 1`.execute(trx);
      const atual = ex.rows[0];
      if (atual) {
        const p = typeof atual.parametros === 'string' ? atual.parametros : JSON.stringify(atual.parametros);
        if (JSON.stringify(JSON.parse(p)) !== parametros) throw new Error(`${schema} já semeado com outra base; use um banco novo`);
        return;
      }
      const r = await sql`INSERT INTO ${sql.raw(schema)}.ctl_coleta
        (tarefa, iniciado_em, finalizado_em, status, versao_coletor, parametros)
        VALUES ('projecao', ${iniciado}, ${iniciado}, 'sucesso', ${VERSAO_SEED}, ${parametros})`.execute(trx);
      const coletaId = Number(r.insertId);
      for (const { tabela, linhas } of mapear(base, coletaId))
        for (const lote of lotes(linhas)) await insertLote(tabela, lote).execute(trx);
      gravou = true;
    });
  }
  return gravou ? 'semeado' : 'ja_semeado';
}
