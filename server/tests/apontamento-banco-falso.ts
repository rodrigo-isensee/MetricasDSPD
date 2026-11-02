import { criarDublePg, type Chamada, type Resposta } from './duble-pg.js';

// Banco falso, com estado, para `coletarApontamentos` (pedido 059, K-193). Responde pelo texto do SQL (as consultas são as do módulo) e imita
// as regras que a coleta usa: UNIQUE da staging e dos eventos com DO NOTHING, UPDATE só do que mudou, transação com ROLLBACK. O SQL de
// verdade é provado contra o PostgreSQL em `apontamento.pg.test.ts`; aqui a lógica de orquestração.

export interface FatoFalso {
  logged_time_id: string; card_id: string; parent_card_id: string | null; data_apontamento: string; registro_sha256: string;
  pessoa_ref: number | null; versoes: number; excluido_em: Date | null; flags_qualidade: number; subgrupo_codigo: string;
  iniciativa_card_id: string | null;
}
export interface OpcoesBancoAp {
  /** Cards do escopo (`dim_card`), com o `type_id` da staging. */
  escopo?: { card_id: string; type_id: string | null }[];
  cardsStatus?: string;
  marca?: Date | null;
  interrompidas?: string[];
  ultimaCarga?: { status: string; parametros: unknown };
  /** HMAC (hexadecimal) dos `user_id` na lista de supressão. */
  suprimidos?: string[];
  /** Ids de usuário que já têm linha em `dim_responsavel` (com `pessoa_ref`). */
  pessoas?: Record<string, number>;
  fatos?: FatoFalso[];
  cards?: { card_id: string; card_pai: string | null; granularidade: string | null }[];
  hierarquiaRowCount?: number;
  coletaId?: string;
  travaOcupada?: boolean;
  /** O driver devolve `rowCount` nulo nas projeções (o módulo trata como zero). */
  rowCountNulo?: boolean;
  /** Falha o SQL cujo texto contém um destes trechos (erro de banco). */
  falharEm?: string[];
}

export function bancoApontamento(op: OpcoesBancoAp = {}) {
  const e = {
    stg: new Map<string, Record<string, unknown>>(),
    fatos: new Map<string, FatoFalso>((op.fatos ?? []).map((f) => [f.logged_time_id, f])),
    eventos: new Map<string, { id: string; tipo: string; chave: string; card: string }>(),
    falhas: [] as { entidade: string; idOrigem: unknown; erro: string }[],
    contagens: [] as { entidade: string; lidos: number; inseridos: number; jaExistentes: number; falhas: number }[],
    dim: new Map<string, number>(Object.entries(op.pessoas ?? {})),
    usuariosInseridos: [] as string[],
    raizes: [] as unknown[],
    checkpoints: [] as number[],
    fechamentos: [] as { coletaId: unknown; status: unknown; erro: unknown }[],
    abertas: [] as { params: readonly unknown[]; parametros: Record<string, unknown> }[],
    marca: undefined as { coletaId: unknown; ate: unknown } | undefined,
    sqlSuprimido: [] as string[],
    hierarquiaChamadas: 0,
    ativosPedidos: [] as { desde: string; cards: string[] }[],
  };
  let proxima = Object.values(op.pessoas ?? {}).reduce((m, v) => Math.max(m, v), 0);
  let foto: { stg: typeof e.stg; fatos: typeof e.fatos; eventos: typeof e.eventos; dim: typeof e.dim; falhas: typeof e.falhas } | undefined;
  const copiar = <T>(m: Map<string, T>): Map<string, T> => new Map([...m].map(([k, v]) => [k, structuredClone(v)]));

  const responder = (c: Chamada): Resposta => {
    const t = c.texto;
    const v = c.valores;
    if ((op.falharEm ?? []).some((f) => t.includes(f))) return new Error('falha simulada do banco');
    if (t === 'BEGIN') { foto = { stg: copiar(e.stg), fatos: copiar(e.fatos), eventos: copiar(e.eventos), dim: new Map(e.dim), falhas: structuredClone(e.falhas) }; return []; }
    if (t === 'ROLLBACK' && foto !== undefined) { e.stg = foto.stg; e.fatos = foto.fatos; e.eventos = foto.eventos; e.dim = foto.dim; e.falhas = foto.falhas; return []; }
    if (t.includes('pg_try_advisory_lock')) return [{ ok: op.travaOcupada !== true }];
    if (t.includes("tarefa = 'apontamento' AND status = 'em_andamento'")) return (op.interrompidas ?? []).map((coleta_id) => ({ coleta_id }));
    if (t.includes("tarefa = 'coleta_incremental' ORDER BY coleta_id DESC")) return op.cardsStatus === undefined ? [] : [{ status: op.cardsStatus }];
    if (t.includes("parametros ->> 'tipo' = 'carga_inicial'")) return op.ultimaCarga === undefined ? [] : [op.ultimaCarga];
    if (t.includes('max(marca_dagua_ate)')) return [{ marca: op.marca ?? null }];
    if (t.startsWith('INSERT INTO dspd_bm.ctl_coleta (')) {
      e.abertas.push({ params: v, parametros: JSON.parse(v[4] as string) as Record<string, unknown> });
      return [{ coleta_id: op.coletaId ?? '77' }];
    }
    if (t.includes("jsonb_set(parametros, '{lotes_concluidos}'")) { e.checkpoints.push(v[1] as number); return []; }
    if (t.startsWith('INSERT INTO dspd_bm.ctl_coleta_falha')) { e.falhas.push({ entidade: v[1] as string, idOrigem: v[2], erro: v[3] as string }); return []; }
    if (t.startsWith('INSERT INTO dspd_bm.ctl_coleta_contagem')) {
      e.contagens.push({ entidade: v[1] as string, lidos: v[2] as number, inseridos: v[3] as number, jaExistentes: v[4] as number, falhas: v[5] as number });
      return [];
    }
    if (t.includes('SET marca_dagua_ate')) { e.marca = { coletaId: v[0], ate: v[1] }; return []; }
    if (t.includes('SET status = $2, finalizado_em')) { e.fechamentos.push({ coletaId: v[0], status: v[1], erro: v[3] }); return { rows: [], rowCount: 1 }; }
    if (t.includes('INSERT INTO dspd_core.outbox')) return [{ evento_id: '1' }];
    if (t.includes('FROM dspd_bm.dim_card c')) return op.escopo ?? [];
    if (t.includes('FROM dspd_bm.cfg_pessoa_eliminada')) {
      e.sqlSuprimido.push(t);
      return (v[0] as string[]).filter((h) => (op.suprimidos ?? []).includes(h)).map((hash) => ({ hash }));
    }
    // `/users`: o que `resolverResponsaveis` pergunta e grava
    if (t.includes('FROM dspd_bm.dim_responsavel WHERE responsavel_id = ANY($1::text[]) AND atualizado_em')) return [];
    if (t.includes('pessoa_ref FROM dspd_bm.dim_responsavel')) return (v[0] as string[]).filter((i) => e.dim.has(i)).map((i) => ({ responsavel_id: i, pessoa_ref: String(e.dim.get(i)) }));
    if (t.startsWith('UPDATE dspd_bm.dim_responsavel')) return [];
    if (t.startsWith('INSERT INTO dspd_bm.dim_responsavel')) {
      for (const id of v[0] as string[]) if (!e.dim.has(id)) { proxima += 1; e.dim.set(id, proxima); e.usuariosInseridos.push(id); }
      return [];
    }
    if (t.startsWith('INSERT INTO dspd_bm.stg_apontamento')) {
      const novos: { logged_time_id: string }[] = [];
      for (const r of JSON.parse(v[0] as string) as Record<string, unknown>[]) {
        const k = `${String(r.logged_time_id)}|${String(r.registro_sha256)}`;
        if (!e.stg.has(k)) { e.stg.set(k, { ...r, coletado_em: v[1], coleta_id: v[2] }); novos.push({ logged_time_id: String(r.logged_time_id) }); }
      }
      return novos;
    }
    const versoesDe = (id: string): number => [...e.stg.keys()].filter((k) => k.startsWith(`${id}|`)).length;
    if (t.startsWith('UPDATE dspd_bm.fato_apontamento AS f SET\n') || t.startsWith('UPDATE dspd_bm.fato_apontamento AS f SET card_id')) {
      let n = 0;
      for (const r of JSON.parse(v[0] as string) as Record<string, unknown>[]) {
        const f = e.fatos.get(String(r.logged_time_id));
        const ref = r.pessoa_ref as number | null;
        if (f === undefined || !(f.registro_sha256 !== r.registro_sha256 || (ref !== null && f.pessoa_ref !== ref))) continue;
        Object.assign(f, {
          card_id: r.card_id, parent_card_id: r.parent_card_id, data_apontamento: r.data_apontamento, registro_sha256: r.registro_sha256,
          subgrupo_codigo: r.subgrupo_codigo, flags_qualidade: (r.flags_qualidade as number) | (f.flags_qualidade & 24), pessoa_ref: ref ?? f.pessoa_ref,
          versoes: versoesDe(f.logged_time_id),
        });
        n += 1;
      }
      return { rows: [], rowCount: op.rowCountNulo === true ? undefined : n };
    }
    if (t.startsWith('INSERT INTO dspd_bm.fato_apontamento')) {
      let n = 0;
      for (const r of JSON.parse(v[0] as string) as Record<string, unknown>[]) {
        const id = String(r.logged_time_id);
        if (e.fatos.has(id)) continue;
        e.fatos.set(id, {
          logged_time_id: id, card_id: String(r.card_id), parent_card_id: (r.parent_card_id as string | null), data_apontamento: String(r.data_apontamento),
          registro_sha256: String(r.registro_sha256), pessoa_ref: r.pessoa_ref as number | null, versoes: versoesDe(id), excluido_em: null,
          flags_qualidade: r.flags_qualidade as number, subgrupo_codigo: String(r.subgrupo_codigo), iniciativa_card_id: null,
        });
        n += 1;
      }
      return { rows: [], rowCount: op.rowCountNulo === true ? undefined : n };
    }
    if (t.includes('AND excluido_em IS NOT NULL') && t.startsWith('SELECT')) {
      return (v[0] as string[]).flatMap((id) => { const f = e.fatos.get(id); return f?.excluido_em ? [{ logged_time_id: id, card_id: f.card_id, parent_card_id: f.parent_card_id }] : []; });
    }
    if (t.includes('AND data_apontamento >= $1::date')) {
      e.ativosPedidos.push({ desde: v[0] as string, cards: v[1] as string[] });
      return [...e.fatos.values()].filter((f) => f.excluido_em === null && f.data_apontamento >= (v[0] as string)
        && ((v[1] as string[]).includes(f.card_id) || (f.parent_card_id !== null && (v[1] as string[]).includes(f.parent_card_id))))
        .map((f) => ({ logged_time_id: f.logged_time_id, card_id: f.card_id, parent_card_id: f.parent_card_id }));
    }
    if (t.startsWith('INSERT INTO dspd_bm.evt_apontamento')) {
      const novos: { logged_time_id: string }[] = [];
      const [idsE, cards, tipo, chave] = v as [string[], string[], string, string];
      idsE.forEach((id, i) => {
        const k = `${id}|${tipo}|${chave}`;
        if (!e.eventos.has(k)) { e.eventos.set(k, { id, tipo, chave, card: cards[i]! }); novos.push({ logged_time_id: id }); }
      });
      return novos;
    }
    if (t.includes('SET excluido_em = $2::timestamptz')) {
      for (const id of v[0] as string[]) { const f = e.fatos.get(id); if (f !== undefined && f.excluido_em === null) f.excluido_em = v[1] as Date; }
      return [];
    }
    if (t.includes('SET excluido_em = NULL')) {
      for (const id of v[0] as string[]) { const f = e.fatos.get(id); if (f !== undefined) f.excluido_em = null; }
      return [];
    }
    if (t.includes('FROM dspd_bm.dim_card WHERE card_id ~')) { e.hierarquiaChamadas += 1; return op.cards ?? []; }
    if (t.startsWith('UPDATE dspd_bm.dim_card_raiz') || t.startsWith('INSERT INTO dspd_bm.dim_card_raiz')) { e.raizes.push(JSON.parse(v[0] as string)); return []; }
    if (t.includes('SET iniciativa_card_id = n.raiz')) return { rows: [], rowCount: op.rowCountNulo === true ? undefined : (op.hierarquiaRowCount ?? 0) };
    return [];
  };
  return { ...criarDublePg(responder), estado: e };
}
