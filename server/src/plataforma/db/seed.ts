import { gerarBaseMock, type BaseMock } from '@metricas-dspd/mock';
import { esquemasDoAmbiente, type Esquemas } from './esquemas.js';
import { emTransacao, type Consultavel, type PoolLike } from './pool.js';

/**
 * Seed da base analítica a partir do mock compartilhado (`gerarBaseMock`): nenhuma regra é duplicada aqui,
 * só o mapeamento para as tabelas do data-model. Sem relógio, sem Math.random: determinístico pela semente.
 * Grava projeções (`dim_card`, `fato_bloqueio`, `dim_chamado`, `fato_etapa_chamado`), `fato_transicao` e `ref_coluna`.
 * Não grava `responsaveis`, `usuario`, `justificativa_ajuste` (data-model §9). Nunca apaga nem sobrescreve.
 */
export const VERSAO_SEED = 'seed-mock';
export const TAMANHO_LOTE = 500;
const OFFSET_CIVIL_MS = -3 * 3600_000; // America/Sao_Paulo (ref_calendario.offset_minutos = -180)

type Valor = string | number | boolean | null;
export type Linha = Record<string, Valor>;
export type Tabela = { tabela: string; linhas: Linha[] };

/** epoch ms -> timestamptz(3) em UTC ('AAAA-MM-DD HH:MM:SS.mmm'; a sessão é UTC). */
export const dt = (ms: number): string => new Date(ms).toISOString().slice(0, 23).replace('T', ' ');
const dtn = (ms: number | null): string | null => (ms === null ? null : dt(ms));
/** epoch ms -> DATE civil no fuso do calendário. */
export const dia = (ms: number): string => new Date(ms + OFFSET_CIVIL_MS).toISOString().slice(0, 10);

/** Id ASCII estável para colunas do quadro: o nome (com acentos) fica em ref_coluna.nome. */
const idColuna = (ordem: number): string => `c${ordem}`;

export function mapearBM(base: BaseMock, coletaId: number, S: Esquemas = esquemasDoAmbiente()): Tabela[] {
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
    eh_subtarefa: c.eh_subtarefa, data_acordada: c.data_acordada === null ? null : dia(c.data_acordada),
    responsabilidade_atraso: c.responsabilidade_atraso, origem_demanda: c.origem_demanda,
    fase_deteccao: c.fase_deteccao, severidade: c.severidade, origem_bug: c.origem_bug,
    adicionado_apos_inicio_pai: c.adicionado_apos_inicio_pai,
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
    { tabela: `${S.bm}.dim_card`, linhas: dimCard },
    { tabela: `${S.bm}.fato_transicao`, linhas: fatoTransicao },
    { tabela: `${S.bm}.fato_bloqueio`, linhas: fatoBloqueio },
    { tabela: `${S.bm}.ref_coluna`, linhas: refColuna },
  ];
}

export function mapearAC(base: BaseMock, coletaId: number, S: Esquemas = esquemasDoAmbiente()): Tabela[] {
  const coletado = dt(new Date(base.config.hoje).getTime());
  const dimChamado = base.ac.chamados.map((c): Linha => ({
    chamado_id: c.chamado_id, natureza: c.natureza, equipe: c.equipe, organizacao: c.organizacao,
    tipo: c.tipo_fila, categoria_sistema: c.categoria_sistema, excluido: c.excluido, status: c.status,
    impacto: c.impacto, urgencia: c.urgencia, prioridade: c.prioridade,
    prioridade_ajustada_manualmente: c.prioridade_ajustada_manualmente, aberto_em: dt(c.aberto_em),
    primeiro_atendimento_em: dtn(c.primeiro_atendimento_em), restaurado_em: dtn(c.restaurado_em),
    data_finalizado: dtn(c.data_finalizado), status_sla_r: c.status_sla_r, status_sla_pa: c.status_sla_pa,
    motivo_escalacao: c.motivo_escalacao, motivo_pendencia_atual: c.motivo_pendencia_atual,
    previsao_retorno: dtn(c.previsao_retorno), motivo_encerramento: c.motivo_encerramento,
    avaliacao_problema: c.avaliacao_problema, excecao_sla_registro_posterior: c.excecao_sla_registro_posterior,
    incidente_critico_coordenado: c.incidente_critico_coordenado, nivel_resolucao: c.nivel_resolucao,
    coletado_em: coletado, atualizado_por_coleta_id: coletaId,
  }));
  const fatoEtapa = base.ac.etapas.map((e): Linha => ({
    chamado_id: e.chamado_id, etapa: e.etapa, entrada: dt(e.entrada), saida: dtn(e.saida),
    motivo_pendencia: e.motivo_pendencia, coletado_em: coletado, atualizado_por_coleta_id: coletaId,
  }));
  return [
    { tabela: `${S.ac}.dim_chamado`, linhas: dimChamado },
    { tabela: `${S.ac}.fato_etapa_chamado`, linhas: fatoEtapa },
  ];
}

export function lotes<T>(itens: T[], tamanho = TAMANHO_LOTE): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < itens.length; i += tamanho) out.push(itens.slice(i, i + tamanho));
  return out;
}

/** INSERT parametrizado em lote (valores sempre em $n; nomes vêm do mapeamento, não da entrada). */
export function insertLote(t: string, linhas: Linha[]): { texto: string; valores: Valor[] } {
  const cols = Object.keys(linhas[0] ?? {});
  const valores: Valor[] = [];
  const grupos = linhas.map((l) => `(${cols.map((c) => { valores.push(l[c] ?? null); return `$${valores.length}`; }).join(', ')})`);
  return { texto: `INSERT INTO ${t} (${cols.join(', ')}) VALUES ${grupos.join(', ')}`, valores };
}

export type ResultadoSeed = 'semeado' | 'ja_semeado';

/** Comparação independente da ordem das chaves (o jsonb reordena). */
const canonico = (v: unknown): string =>
  JSON.stringify(v, (_k, x: unknown) =>
    x !== null && typeof x === 'object' && !Array.isArray(x)
      ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : 1)))
      : x);

/**
 * Idempotente: se já existe a coleta `seed-mock` com a mesma semente, não faz nada; com semente diferente, recusa
 * (nunca sobrescreve histórico; para outra base, use um banco novo). Uma transação por schema (BM e AC não se misturam);
 * `pg_advisory_xact_lock` por schema impede dois seeds simultâneos de gravarem duas vezes.
 */
export async function semear(
  pool: PoolLike, base: BaseMock = gerarBaseMock(), S: Esquemas = esquemasDoAmbiente(),
): Promise<ResultadoSeed> {
  const parametros = { semente: base.config.semente, hoje: base.config.hoje,
    escala: base.config.escala, mesesHistorico: base.config.mesesHistorico };
  const iniciado = dt(new Date(base.config.hoje).getTime());
  let gravou = false;
  const alvos: { schema: string; mapear: (b: BaseMock, c: number, s: Esquemas) => Tabela[] }[] = [
    { schema: S.bm, mapear: mapearBM },
    { schema: S.ac, mapear: mapearAC },
  ];
  for (const { schema, mapear } of alvos) {
    await emTransacao(pool, async (trx: Consultavel) => {
      await trx.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`dspd:seed:${schema}`]);
      const ex = await trx.query<{ coleta_id: string; parametros: unknown }>(
        `SELECT coleta_id, parametros FROM ${schema}.ctl_coleta WHERE versao_coletor = $1 LIMIT 1`, [VERSAO_SEED]);
      const atual = ex.rows[0];
      if (atual) {
        if (canonico(atual.parametros) !== canonico(parametros)) throw new Error(`${schema} já semeado com outra base; use um banco novo`);
        return;
      }
      const r = await trx.query<{ coleta_id: string }>(
        `INSERT INTO ${schema}.ctl_coleta (tarefa, iniciado_em, finalizado_em, status, versao_coletor, parametros)
         VALUES ('projecao', $1, $1, 'sucesso', $2, $3::jsonb) RETURNING coleta_id`,
        [iniciado, VERSAO_SEED, JSON.stringify(parametros)]);
      const coletaId = Number(r.rows[0]!.coleta_id);
      for (const { tabela, linhas } of mapear(base, coletaId, S))
        for (const lote of lotes(linhas)) {
          const q = insertLote(tabela, lote);
          await trx.query(q.texto, q.valores);
        }
      gravou = true;
    });
  }
  return gravou ? 'semeado' : 'ja_semeado';
}
