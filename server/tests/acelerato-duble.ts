import { createHash } from 'node:crypto';
import type { Conectar, ConexaoMysql } from '../src/modulos/acelerato/cliente-mysql.js';
import type { ConfigAcelerato } from '../src/modulos/acelerato/config.js';
import { Q1_CHAMADOS, Q2_ETAPAS, Q3_CAMPOS, Q4_FORA_ORGANIZACOES, Q5_SAIDA, SET_TETO } from '../src/modulos/acelerato/sql.js';
import { criarDublePg, type Chamada } from './duble-pg.js';
import { DOMINIO_FIXTURE, linhaCompleta, type LinhaMysql } from './fixtures/acelerato-linha-50-colunas.js';

/** Ferramentas dos testes do coletor do Acelerato: MySQL falso que PROJETA as colunas do SELECT, e um PostgreSQL em memória. */

export const IMPRESSAO = 'ab'.repeat(32);
export const CONFIG: ConfigAcelerato = {
  host: 'host-de-teste.invalido', porta: 3306, banco: 'banco_de_teste', usuario: 'usuario_de_teste', senha: 'SENHA-DE-TESTE-056',
  tlsSha256: IMPRESSAO, tlsCertFile: '/nao/usado.pem', maxExecMs: 120_000, margemHoras: 24,
};
export const TLS = { pem: 'PEM-DE-TESTE', impressao: IMPRESSAO };

/** `linhaCompleta()` ajustada ao que a consulta devolve: status de SLA da lista fechada, `nomeCampo` do caminho do JSON e `SIM`. */
export function linha(sobrescrever: LinhaMysql = {}): LinhaMysql {
  const base = linhaCompleta();
  const campos = (JSON.parse(base.campos_personalizados as string) as { nome: string; valor: string }[])
    .map((c) => ({ nomeCampo: c.nome, valor: c.valor === 'Sim' ? 'SIM' : c.valor }));
  return linhaCompleta({
    sla_pa_status: 'REALIZADO_NO_PRAZO', sla_r_status: 'DENTRO_DO_PRAZO', campos_personalizados: JSON.stringify(campos), ...sobrescrever,
  });
}

export const LISTAS_BANCO = [
  { campo: 'tipo_recorte', codigo: String(DOMINIO_FIXTURE.tipoTicketKey), rotulo: DOMINIO_FIXTURE.tipoTicket },
  { campo: 'organizacao_recorte', codigo: String(DOMINIO_FIXTURE.organizacaoKey), rotulo: DOMINIO_FIXTURE.organizacao },
  { campo: 'equipe', codigo: String(DOMINIO_FIXTURE.equipeKey), rotulo: DOMINIO_FIXTURE.equipe },
  { campo: 'etapa', codigo: DOMINIO_FIXTURE.status, rotulo: DOMINIO_FIXTURE.status },
  { campo: 'etapa', codigo: 'Aguardando atribuicao', rotulo: 'Aguardando atribuicao' },
  { campo: 'prioridade', codigo: DOMINIO_FIXTURE.prioridade, rotulo: DOMINIO_FIXTURE.prioridade },
];

const chaveData = (l: LinhaMysql): string => String(l.data_atualizacao);
const numerosDe = (sql: string): number[] => [...sql.matchAll(/IN \(([?, ]+)\)/g)].map((m) => m[1]!.split('?').length - 1);

export type OpcoesMysql = {
  /** Erro a lançar ao conectar (por número da tentativa, a partir de 1); `undefined` conecta. */
  falharConexao?: (tentativa: number) => unknown;
  /** Erro a lançar em consulta cujo texto começa por... ; `undefined` responde. */
  falharConsulta?: (sql: string, tentativa: number) => unknown;
  /** Consulta que nunca responde (para o tempo esgotado). */
  travarEm?: (sql: string) => boolean;
  /** Altera as linhas já projetadas da Q1 (simula a origem devolvendo o que não devia). */
  adulterarQ1?: (linhas: LinhaMysql[]) => LinhaMysql[];
};

/** MySQL falso: a tabela tem as 50 colunas; cada consulta devolve só o que o SELECT pede (projeção real, não cópia da linha). */
export function criarMysqlFalso(tabela: LinhaMysql[], opcoes: OpcoesMysql = {}) {
  const reg = {
    conexoes: 0, encerradas: 0, destruidas: 0, opcoes: [] as Record<string, unknown>[],
    consultas: [] as { sql: string; valores: unknown[] }[], controles: [] as string[], tetos: [] as unknown[], viaQuery: [] as string[],
  };
  const projetar = (sql: string, l: LinhaMysql): LinhaMysql => {
    const lista = sql.slice('SELECT '.length, sql.indexOf('\nFROM')).replaceAll('\n', ' ').replace('(agente_key IS NOT NULL) AS com_agente', 'com_agente');
    const saida: LinhaMysql = {};
    for (const nome of lista.split(',').map((x) => x.trim()).filter(Boolean)) saida[nome] = nome === 'com_agente' ? (l.agente_key == null ? 0 : 1) : l[nome];
    return saida;
  };
  const responder = (sql: string, v: unknown[]): unknown[] => {
    if (sql.startsWith(Q1_CHAMADOS.slice(0, 40))) {
      const [nt, no, ne] = numerosDe(sql) as [number, number, number];
      const tipos = v.slice(0, nt); const orgs = v.slice(nt, nt + no); const eqs = v.slice(nt + no, nt + no + ne);
      const [inicio, curData, , curChave] = v.slice(nt + no + ne) as [string, string, string, number];
      return tabela
        .filter((l) => tipos.includes(l.tipo_ticket_key) && orgs.includes(l.organizacao_key) && eqs.includes(l.equipe_key))
        .filter((l) => chaveData(l) >= inicio && (chaveData(l) > curData || (chaveData(l) === curData && Number(l.ticket_key) > curChave)))
        .sort((a, b) => chaveData(a).localeCompare(chaveData(b)) || Number(a.ticket_key) - Number(b.ticket_key))
        .slice(0, 1000).map((l) => projetar(sql, l));
    }
    if (sql.startsWith(Q2_ETAPAS.slice(0, 40))) {
      return tabela.filter((l) => v.includes(l.ticket_key)).flatMap((l) => {
        const est = l.estatisticas == null ? null : (JSON.parse(l.estatisticas as string) as { workflow?: { etapas?: Record<string, unknown>[] } });
        return (est?.workflow?.etapas ?? []).map((e) => ({
          ticket_key: l.ticket_key, etapa_key: e.etapaKey ?? null, descricao: e.descricao ?? null, descricao_workflow: e.descricaoWorkflow ?? null,
          tempo_sla: e.tempoSla ?? null, quantidade_vezes: e.quantidadeDeVezes ?? null,
        }));
      });
    }
    if (sql.startsWith(Q3_CAMPOS.slice(0, 40))) {
      const [nc] = numerosDe(sql) as [number, number];
      const ids = v.slice(0, nc); const nomes = v.slice(nc);
      return tabela.filter((l) => ids.includes(l.ticket_key)).flatMap((l) =>
        (JSON.parse(l.campos_personalizados as string) as { nomeCampo: string; valor: unknown }[])
          .filter((c) => nomes.includes(c.nomeCampo)).map((c) => ({ ticket_key: l.ticket_key, nome: c.nomeCampo, valor: c.valor == null ? null : String(c.valor).slice(0, 80) })));
    }
    if (sql.startsWith(Q4_FORA_ORGANIZACOES.slice(0, 40))) {
      const [nt, ne, no] = numerosDe(sql) as [number, number, number];
      const tipos = v.slice(0, nt); const eqs = v.slice(nt, nt + ne); const orgs = v.slice(nt + ne, nt + ne + no);
      return [{ n: tabela.filter((l) => tipos.includes(l.tipo_ticket_key) && eqs.includes(l.equipe_key) && !orgs.includes(l.organizacao_key)).length }];
    }
    if (sql.startsWith(Q5_SAIDA.slice(0, 40))) {
      return tabela.filter((l) => v.includes(l.ticket_key)).map((l) => ({
        ticket_key: l.ticket_key, tipo_ticket_key: l.tipo_ticket_key, organizacao_key: l.organizacao_key, equipe_key: l.equipe_key, lixeira: l.lixeira, data_atualizacao: l.data_atualizacao,
      }));
    }
    throw new Error(`consulta desconhecida no MySQL falso: ${sql.slice(0, 30)}`);
  };
  const conectar: Conectar = (op) => {
    reg.conexoes += 1;
    const tentativa = reg.conexoes;
    reg.opcoes.push(op);
    const falha = opcoes.falharConexao?.(tentativa);
    if (falha !== undefined) return Promise.reject(falha);
    const conexao: ConexaoMysql = {
      query: (sql) => { reg.viaQuery.push(sql); reg.controles.push(sql); return Promise.resolve([]); },
      execute: (sql, valores = []) => {
        if (sql === SET_TETO) { reg.tetos.push(valores[0]); return Promise.resolve([]); }
        reg.consultas.push({ sql, valores });
        if (opcoes.travarEm?.(sql)) return new Promise<never>(() => undefined);
        const f = opcoes.falharConsulta?.(sql, tentativa);
        if (f !== undefined) return Promise.reject(f);
        const r = responder(sql, valores);
        return Promise.resolve(opcoes.adulterarQ1 && sql.startsWith(Q1_CHAMADOS.slice(0, 40)) ? opcoes.adulterarQ1(r as LinhaMysql[]) : r);
      },
      end: () => { reg.encerradas += 1; return Promise.resolve(); },
      destroy: () => { reg.destruidas += 1; },
    };
    return Promise.resolve(conexao);
  };
  return { conectar, reg };
}

type Linha = Record<string, unknown>;
export type EstadoBanco = {
  stgChamado: { sk: number; id: string; anterior: number | null; sha: Buffer; payload: Linha; ausente: boolean; fora: boolean; coleta: number }[];
  stgEtapa: { sk: number; chamado: string; id: string; anterior: number | null; sha: Buffer; payload: Linha; ausente: boolean; coleta: number }[];
  ctl: { id: number; tarefa: string; status: string; marcaAte: Date | null; parametros: Linha | null; erro: string | null }[];
  contagens: { coleta: number; entidade: string; lidos: number; inseridos: number; jaExistentes: number }[];
  falhas: { coleta: number; entidade: string; idOrigem: string | null; tentativas: number; erro: string }[];
};

/** PostgreSQL em memória que entende só as instruções do coletor do Acelerato (a ordem dos parâmetros é a do código). */
export function criarBancoMemoria(opcoes: { listas?: Linha[]; trava?: boolean; falharEm?: (texto: string) => Error | undefined } = {}) {
  const e: EstadoBanco = { stgChamado: [], stgEtapa: [], ctl: [], contagens: [], falhas: [] };
  let seq = 0;
  let marcador: { c: number; e: number; ctl: number; n: number; f: number } | null = null;
  const sha = (b: Buffer): string => b.toString('hex');
  const ultimaPorId = <T extends { id: string; sk: number }>(linhas: T[], chave: (x: T) => string): Map<string, T> => {
    const m = new Map<string, T>();
    for (const x of linhas) { const k = chave(x); const atual = m.get(k); if (!atual || x.sk > atual.sk) m.set(k, x); }
    return m;
  };
  const responder = (c: Chamada): unknown[] | Error => {
    const t = c.texto;
    const v = c.valores;
    const erro = opcoes.falharEm?.(t);
    if (erro) return erro;
    if (t.startsWith('BEGIN')) { marcador = { c: e.stgChamado.length, e: e.stgEtapa.length, ctl: e.ctl.length, n: e.contagens.length, f: e.falhas.length }; return []; }
    if (t.startsWith('COMMIT')) { marcador = null; return []; }
    if (t.startsWith('ROLLBACK')) {
      if (marcador) { e.stgChamado.length = marcador.c; e.stgEtapa.length = marcador.e; e.ctl.length = marcador.ctl; e.contagens.length = marcador.n; e.falhas.length = marcador.f; }
      marcador = null; return [];
    }
    if (t.includes('pg_try_advisory_lock')) return [{ ok: opcoes.trava !== false }];
    if (t.includes('pg_advisory_unlock')) return [];
    if (t.includes('.ref_dominio')) return opcoes.listas ?? LISTAS_BANCO;
    if (t.startsWith('SELECT parametros')) {
      const ult = [...e.ctl].reverse().find((x) => x.status === 'sucesso');
      return ult ? [{ parametros: ult.parametros }] : [];
    }
    if (t.startsWith('SELECT max(marca_dagua_ate)')) {
      const marcas = e.ctl.filter((x) => x.tarefa === 'coleta_incremental' && x.status === 'sucesso' && x.marcaAte).map((x) => x.marcaAte!.getTime());
      return [{ marca: marcas.length ? new Date(Math.max(...marcas)) : null }];
    }
    if (t.includes('DISTINCT ON (id_origem) id_origem, ausente_na_extracao, fora_do_recorte') && !t.includes('payload_sha256')) {
      return [...ultimaPorId(e.stgChamado, (x) => x.id).values()].map((x) => ({ id_origem: x.id, ausente_na_extracao: x.ausente, fora_do_recorte: x.fora }));
    }
    if (t.includes('DISTINCT ON (id_origem)')) {
      const ids = v[0] as string[];
      return [...ultimaPorId(e.stgChamado.filter((x) => ids.includes(x.id)), (x) => x.id).values()]
        .map((x) => ({ id_origem: x.id, stg_sk: String(x.sk), payload_sha256: x.sha, payload: x.payload, ausente_na_extracao: x.ausente, fora_do_recorte: x.fora }));
    }
    if (t.includes('DISTINCT ON (chamado_id, id_origem)')) {
      const ids = v[0] as string[];
      return [...ultimaPorId(e.stgEtapa.filter((x) => ids.includes(x.chamado)), (x) => `${x.chamado}|${x.id}`).values()]
        .map((x) => ({ chamado_id: x.chamado, id_origem: x.id, stg_sk: String(x.sk), payload_sha256: x.sha, payload: x.payload, ausente_na_extracao: x.ausente }));
    }
    if (t.includes('INSERT INTO') && t.includes('.stg_chamado')) {
      const [id, anterior, hash, json, ausente, fora, , coleta] = v as [string, string | null, Buffer, string, boolean, boolean, Date, number];
      const ant = anterior === null ? null : Number(anterior);
      if (e.stgChamado.some((x) => x.id === id && x.anterior === ant)) return [];
      const sk = ++seq;
      e.stgChamado.push({ sk, id, anterior: ant, sha: hash, payload: JSON.parse(json) as Linha, ausente, fora, coleta });
      return [{ stg_sk: String(sk) }];
    }
    if (t.includes('INSERT INTO') && t.includes('.stg_etapa')) {
      const [chamado, id, anterior, hash, json, ausente, , coleta] = v as [string, string, string | null, Buffer, string, boolean, Date, number];
      const ant = anterior === null ? null : Number(anterior);
      if (e.stgEtapa.some((x) => x.chamado === chamado && x.id === id && x.anterior === ant)) return [];
      const sk = ++seq;
      e.stgEtapa.push({ sk, chamado, id, anterior: ant, sha: hash, payload: JSON.parse(json) as Linha, ausente, coleta });
      return [{ stg_sk: String(sk) }];
    }
    if (t.includes('INSERT INTO') && t.includes('.ctl_coleta_contagem')) {
      e.contagens.push({ coleta: v[0] as number, entidade: v[1] as string, lidos: v[2] as number, inseridos: v[3] as number, jaExistentes: v[4] as number });
      return [];
    }
    if (t.includes('INSERT INTO') && t.includes('.ctl_coleta_falha')) {
      e.falhas.push({ coleta: v[0] as number, entidade: v[1] as string, idOrigem: v[2] as string | null, tentativas: v[3] as number, erro: v[4] as string });
      return [];
    }
    if (t.includes('INSERT INTO') && t.includes('.ctl_coleta')) {
      const id = e.ctl.length + 1;
      if (t.includes("'sucesso'")) {
        e.ctl.push({ id, tarefa: v[0] as string, status: 'sucesso', marcaAte: v[4] as Date | null, parametros: JSON.parse(v[7] as string) as Linha, erro: null });
      } else {
        e.ctl.push({ id, tarefa: v[0] as string, status: 'falha', marcaAte: null, parametros: null, erro: v[4] as string });
      }
      return [{ coleta_id: String(id) }];
    }
    throw new Error(`instrução desconhecida no banco falso: ${t.slice(0, 50)}`);
  };
  const duble = criarDublePg(responder);
  return { ...duble, estado: e, sha };
}

export const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');
