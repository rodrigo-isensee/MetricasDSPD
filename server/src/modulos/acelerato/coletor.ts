import type { Esquemas } from '../../plataforma/db/esquemas.js';
import { emTransacao, type PoolLike } from '../../plataforma/db/pool.js';
import { comTravaDaFonte } from '../../plataforma/db/trava.js';
import {
  Contadores, registroChamado, registroContagem, registroEtapas, registroSaida, reincidente90d, type ChamadoLido, type EtapaLida, type ListasRecorte,
} from './allow-list.js';
import { comSessaoMysql, type DepsCliente, type SessaoMysql } from './cliente-mysql.js';
import type { ConfigAcelerato } from './config.js';
import {
  montarParametros, parametrosDiferentes, registrarContagens, registrarFalha, registrarSucesso, ultimoSucesso, type Contagem, type TarefaAcelerato,
} from './controle.js';
import { ErroColeta, comoErroColeta, repetivel } from './erros.js';
import { NOMES_CAMPO_FATIA_F1 } from './listas-fechadas.js';
import { carregarListas } from './referencia.js';
import { DATA_MINIMA, Q1_CHAMADOS, Q2_ETAPAS, Q3_CAMPOS, Q4_FORA_ORGANIZACOES, Q5_SAIDA, TAMANHO_PAGINA, expandir } from './sql.js';
import {
  chamadosConhecidos, gravarChamado, gravarEtapa, ultimasDeChamados, ultimasDeEtapas, type MarcasStaging, type Registro,
} from './staging.js';
import { instanteParaTexto, textoParaInstante } from './tempo.js';
import type { TlsPreparado } from './tls.js';

/**
 * Coletor do Acelerato, F1 (ADR 0023, itens 1 a 6; plano 056 §4): lê a tabela MySQL só leitura até o staging, sem dado de
 * pessoa. Duas fases: (1) lê toda a origem para a memória, dentro de UMA sessão só leitura (com até 3 tentativas para rede
 * e tempo esgotado); (2) grava tudo no PostgreSQL numa transação só, com a linha de `ctl_coleta` já no resultado final.
 * Falha em qualquer fase: nada é gravado no staging, e a falha vira uma linha de controle só com o código.
 */
export type ModoColeta = 'incremental' | 'releitura';
export type LogColeta = {
  info: (obj: Record<string, unknown>, msg: string) => void;
  error: (obj: Record<string, unknown>, msg: string) => void;
};
export type DepsColeta = {
  pool: PoolLike;
  config: ConfigAcelerato;
  tls: TlsPreparado;
  S: Esquemas;
  agora: () => Date;
  log: LogColeta;
  cliente?: DepsCliente;
  /** Espera entre tentativas; o teste injeta uma que não espera. */
  dormir?: (ms: number) => Promise<void>;
  /** Mudança de lista, de SQL ou de origem reconhecida por uma pessoa (T2.6): sem isto a coleta é recusada. */
  reconhecerMudanca?: boolean;
};

export type ResultadoColeta =
  | { estado: 'em-uso' }
  | {
      estado: 'ok';
      coletaId: number;
      modo: ModoColeta;
      chamados: { lidos: number; inseridos: number; jaExistentes: number };
      etapas: { lidos: number; inseridos: number; jaExistentes: number };
      foraDoRecorte: number;
      ausentes: number;
      /** Chamados SSSC das 3 equipes fora das organizações do recorte (só contagem); `null` se não foi medido nesta coleta. */
      foraOrganizacoes: number | null;
      contagens: Record<string, number>;
      sincronizadoEmMax: string | null;
      marcaDagua: string | null;
      semNovidade: boolean;
    };

export const esperar = (ms: number): Promise<void> => new Promise<void>((r) => { setTimeout(r, ms); });
const ESPERAS_MS = [1000, 4000] as const;
const TENTATIVAS = 3;
const LOTE_IDS = 1000;

type ChamadoCompleto = { chamado: ChamadoLido; etapas: EtapaLida[] };
type Leitura = {
  chamados: ChamadoCompleto[];
  contadores: Contadores;
  foraOrganizacoes: number | null;
  presentes: Set<string>;
  saida: { fora: Set<string>; ausentes: Set<string> };
  maxAtualizacao: string | null;
  maxSincronizado: string | null;
};

const agrupar = (linhas: readonly Record<string, unknown>[]): Map<string, Record<string, unknown>[]> => {
  const m = new Map<string, Record<string, unknown>[]>();
  for (const l of linhas) {
    const k = String(l.ticket_key);
    const g = m.get(k);
    if (g) g.push(l); else m.set(k, [l]);
  }
  return m;
};
const lotes = <T>(itens: readonly T[], n: number): T[][] => {
  const r: T[][] = [];
  for (let i = 0; i < itens.length; i += n) r.push(itens.slice(i, i + n));
  return r;
};
const chaves = (m: ReadonlyMap<number, string>): number[] => [...m.keys()];

type PedidoLeitura = {
  listas: ListasRecorte; inicio: string; medirForaOrganizacoes: boolean; conhecidos: ReadonlyMap<string, MarcasStaging> | null;
};

/** Uma passada de leitura da origem, com contadores novos (uma nova tentativa recomeça do zero). */
async function ler(s: SessaoMysql, p: PedidoLeitura): Promise<Leitura> {
  const { listas } = p;
  const L: Leitura = {
    chamados: [], contadores: new Contadores(), foraOrganizacoes: null, presentes: new Set(),
    saida: { fora: new Set(), ausentes: new Set() }, maxAtualizacao: null, maxSincronizado: null,
  };
  const tamanhos = { tipos: listas.tipos.size, organizacoes: listas.organizacoes.size, equipes: listas.equipes.size };
  let cursor = { data: p.inicio, chave: 0 };
  for (;;) {
    const linhas = await s.consultar(expandir(Q1_CHAMADOS, tamanhos), [
      ...chaves(listas.tipos), ...chaves(listas.organizacoes), ...chaves(listas.equipes), p.inicio, cursor.data, cursor.data, cursor.chave,
    ]);
    if (linhas.length === 0) break;
    const pagina = linhas.map((l) => registroChamado(l, listas, L.contadores));
    const ids = pagina.map((c) => Number(c.idOrigem));
    const etapas = agrupar(await s.consultar(expandir(Q2_ETAPAS, { chaves: ids.length }), ids));
    const campos = agrupar(await s.consultar(expandir(Q3_CAMPOS, { chaves: ids.length, nomes: NOMES_CAMPO_FATIA_F1.length }), [...ids, ...NOMES_CAMPO_FATIA_F1]));
    for (const chamado of pagina) {
      const doChamado = registroEtapas(etapas.get(chamado.idOrigem) ?? [], listas, L.contadores);
      if (doChamado.length === 0) L.contadores.somar('chamado_sem_etapas');
      chamado.payload.campos = { reincidente_90d: reincidente90d(campos.get(chamado.idOrigem) ?? [], L.contadores) };
      L.chamados.push({ chamado, etapas: doChamado });
      L.presentes.add(chamado.idOrigem);
      if (L.maxAtualizacao === null || chamado.dataAtualizacao > L.maxAtualizacao) L.maxAtualizacao = chamado.dataAtualizacao;
      if (chamado.sincronizadoEm !== null && (L.maxSincronizado === null || chamado.sincronizadoEm > L.maxSincronizado)) L.maxSincronizado = chamado.sincronizadoEm;
    }
    if (linhas.length < TAMANHO_PAGINA) break;
    const ultimo = pagina[pagina.length - 1]!;
    const proximo = { data: ultimo.dataAtualizacao, chave: Number(ultimo.idOrigem) };
    if (proximo.data === cursor.data && proximo.chave === cursor.chave) throw new ErroColeta('erro-origem', { entidade: 'chamado' });
    cursor = proximo;
  }
  if (p.medirForaOrganizacoes) {
    const r = await s.consultar(expandir(Q4_FORA_ORGANIZACOES, tamanhos), [...chaves(listas.tipos), ...chaves(listas.equipes), ...chaves(listas.organizacoes)]);
    L.foraOrganizacoes = registroContagem(r[0]);
  }
  if (p.conhecidos !== null) await lerSaida(s, p.conhecidos, listas, L);
  return L;
}

/** Saída do recorte (releitura): ids conhecidos e não vistos, só por chave; presente fora do recorte ou ausente da tabela. */
async function lerSaida(s: SessaoMysql, conhecidos: ReadonlyMap<string, MarcasStaging>, listas: ListasRecorte, L: Leitura): Promise<void> {
  const naoVistos = [...conhecidos.entries()].filter(([id, m]) => !L.presentes.has(id) && !m.ausente).map(([id]) => id);
  for (const lote of lotes(naoVistos, LOTE_IDS)) {
    const linhas = (await s.consultar(expandir(Q5_SAIDA, { ids: lote.length }), lote.map(Number))).map(registroSaida);
    const achados = new Set<string>();
    for (const l of linhas) {
      achados.add(l.idOrigem);
      const dentro = l.tipo !== null && l.organizacao !== null && l.equipe !== null
        && listas.tipos.has(l.tipo) && listas.organizacoes.has(l.organizacao) && listas.equipes.has(l.equipe);
      if (dentro) L.contadores.somar('saida_inconsistente'); else L.saida.fora.add(l.idOrigem);
    }
    for (const id of lote) if (!achados.has(id)) L.saida.ausentes.add(id);
  }
  // Recarga suspeita (M7): acima de 5% (estritamente maior: ausentes * 20 > conhecidos) a coleta para sem gravar as ausências.
  if (L.saida.ausentes.size * 20 > conhecidos.size) throw new ErroColeta('recarga-suspeita', { entidade: 'chamado' });
}

const somar = (a: { lidos: number; inseridos: number; jaExistentes: number }, r: 'inserido' | 'ja_existente'): void => {
  a.lidos += 1;
  if (r === 'inserido') a.inseridos += 1; else a.jaExistentes += 1;
};

/** Executa a coleta sob a trava da fonte. Falha vira linha de controle e é relançada como `ErroColeta`. */
export async function coletarAcelerato(d: DepsColeta, modo: ModoColeta): Promise<ResultadoColeta> {
  const iniciadoEm = d.agora();
  const tarefa: TarefaAcelerato = modo === 'incremental' ? 'coleta_incremental' : 'varredura';
  let tentativas = 1;
  try {
    const r = await comTravaDaFonte(d.pool, 'acelerato', () => executar(d, modo, tarefa, iniciadoEm, (n) => { tentativas = n; }));
    if (!r.executou) return { estado: 'em-uso' };
    d.log.info({ modo, coletaId: r.valor.coletaId, chamados: r.valor.chamados, etapas: r.valor.etapas, semNovidade: r.valor.semNovidade }, 'coleta do Acelerato concluída');
    return r.valor;
  } catch (e) {
    const erro = comoErroColeta(e);
    d.log.error(erro.paraLog(), 'coleta do Acelerato falhou');
    // Registro da falha: só código, entidade e id_origem. Se nem isto grava, o log acima já tem o código.
    await registrarFalha(d.pool, d.S, { tarefa, iniciadoEm, finalizadoEm: d.agora(), erro, tentativas })
      .catch(() => { d.log.error({ codigo: erro.codigo }, 'falha da coleta não pôde ser registrada em ctl_coleta'); });
    throw erro;
  }
}

async function executar(
  d: DepsColeta, modo: ModoColeta, tarefa: TarefaAcelerato, iniciadoEm: Date, anotarTentativas: (n: number) => void,
): Promise<Extract<ResultadoColeta, { estado: 'ok' }>> {
  const listas = await carregarListas(d.pool, d.S);
  const anterior = await ultimoSucesso(d.pool, d.S);

  // CA-8: mudança de origem, de lista ou de SQL sem reconhecimento recusa a coleta, antes de abrir qualquer conexão.
  const base = montarParametros(d.config, null);
  if (anterior.parametros !== null && d.reconhecerMudanca !== true) {
    const mudou = parametrosDiferentes(base, anterior.parametros);
    if (mudou.length > 0) throw new ErroColeta('parametros-mudaram', { coluna: mudou.join(',') });
  }

  const margemMs = d.config.margemHoras * 3_600_000;
  const comMarca = modo === 'incremental' && anterior.marca !== null;
  const inicioInstante = comMarca ? new Date(anterior.marca!.getTime() - margemMs) : null;
  const inicio = inicioInstante === null ? DATA_MINIMA : instanteParaTexto(inicioInstante);
  const conhecidos = modo === 'releitura' ? await chamadosConhecidos(d.pool, d.S) : null;
  const pedido: PedidoLeitura = { listas, inicio, medirForaOrganizacoes: modo === 'releitura' || anterior.marca === null, conhecidos };

  const dormir = d.dormir ?? esperar;
  let leitura: Leitura | undefined;
  for (let n = 1; leitura === undefined; n++) {
    anotarTentativas(n);
    try {
      leitura = await comSessaoMysql(d.config, d.tls, (s) => ler(s, pedido), d.cliente);
    } catch (e) {
      const erro = comoErroColeta(e);
      if (!repetivel(erro) || n >= TENTATIVAS) throw erro;
      await dormir(ESPERAS_MS[n - 1]!);
    }
  }

  let marcaAte: Date | null = null;
  if (modo === 'incremental') {
    marcaAte = anterior.marca;
    if (leitura.maxAtualizacao !== null) {
      marcaAte = textoParaInstante(leitura.maxAtualizacao);
      if (marcaAte === null) throw new ErroColeta('dados-invalidos', { entidade: 'chamado', coluna: 'data_atualizacao' });
    }
  }
  const lido = leitura;
  return emTransacao(d.pool, async (db) => {
    const parametros = montarParametros(d.config, lido.maxSincronizado);
    const coletaId = await registrarSucesso(db, d.S, {
      tarefa, iniciadoEm, finalizadoEm: d.agora(), marcaDe: inicioInstante, marcaAte,
      sobreposicaoS: modo === 'incremental' ? d.config.margemHoras * 3600 : 0, parametros,
    });
    const ctx = { db, S: d.S, coletaId, agora: d.agora() };
    const chamados = { lidos: 0, inseridos: 0, jaExistentes: 0 };
    const etapas = { lidos: 0, inseridos: 0, jaExistentes: 0 };
    const foraGravados = { lidos: 0, inseridos: 0, jaExistentes: 0 };
    const ausentesGravados = { lidos: 0, inseridos: 0, jaExistentes: 0 };
    const SEM_MARCA = { ausente: false, fora: false };

    for (const lote of lotes(lido.chamados, LOTE_IDS)) {
      const ids = lote.map((x) => x.chamado.idOrigem);
      const ultimas = await ultimasDeChamados(db, d.S, ids);
      const ultimasEtapas = await ultimasDeEtapas(db, d.S, ids);
      for (const { chamado, etapas: doChamado } of lote) {
        somar(chamados, (await gravarChamado(ctx, chamado.idOrigem, ultimas.get(chamado.idOrigem), chamado.payload, SEM_MARCA)).resultado);
        for (const e of doChamado) {
          somar(etapas, (await gravarEtapa(ctx, chamado.idOrigem, e.idOrigem, ultimasEtapas.get(`${chamado.idOrigem}|${e.idOrigem}`), e.payload, false)).resultado);
        }
      }
    }

    // Saída do recorte: nova versão com o MESMO payload da anterior e só a marca mudada (o hash inclui a marca).
    const marcarSaida = async (ids: ReadonlySet<string>, marcas: MarcasStaging, acumulado: typeof foraGravados): Promise<void> => {
      for (const lote of lotes([...ids], LOTE_IDS)) {
        const ultimas = await ultimasDeChamados(db, d.S, lote);
        const ultimasEtapas = marcas.ausente ? await ultimasDeEtapas(db, d.S, lote) : new Map();
        for (const id of lote) {
          const v = ultimas.get(id)!; // o id veio do próprio staging (ids conhecidos)
          somar(acumulado, (await gravarChamado(ctx, id, v, v.payload as Registro, marcas)).resultado);
        }
        // A marca entra no hash: etapa que já estava marcada é "já existente"; só a que não estava ganha versão nova.
        for (const e of ultimasEtapas.values()) await gravarEtapa(ctx, e.chamadoId, e.idOrigem, e, e.payload, true);
      }
    };
    await marcarSaida(lido.saida.fora, { ausente: false, fora: true }, foraGravados);
    await marcarSaida(lido.saida.ausentes, { ausente: true, fora: false }, ausentesGravados);

    const contagens: Contagem[] = [
      { entidade: 'chamado', lidos: chamados.lidos, inseridos: chamados.inseridos, jaExistentes: chamados.jaExistentes, falhas: 0 },
      { entidade: 'etapa', lidos: etapas.lidos, inseridos: etapas.inseridos, jaExistentes: etapas.jaExistentes, falhas: 0 },
      ...(modo === 'releitura' ? [
        { entidade: 'chamado_fora_do_recorte', lidos: foraGravados.lidos, inseridos: foraGravados.inseridos, jaExistentes: foraGravados.jaExistentes, falhas: 0 },
        { entidade: 'chamado_ausente', lidos: ausentesGravados.lidos, inseridos: ausentesGravados.inseridos, jaExistentes: ausentesGravados.jaExistentes, falhas: 0 },
      ] : []),
      ...lido.contadores.entradas().map(([entidade, n]) => ({ entidade, lidos: n, inseridos: 0, jaExistentes: 0, falhas: 0 })),
      ...(lido.foraOrganizacoes === null ? [] : [{ entidade: 'fora_organizacoes_recorte', lidos: lido.foraOrganizacoes, inseridos: 0, jaExistentes: 0, falhas: 0 }]),
    ];
    await registrarContagens(db, d.S, coletaId, contagens);

    return {
      estado: 'ok' as const, coletaId, modo, chamados, etapas, foraDoRecorte: lido.saida.fora.size, ausentes: lido.saida.ausentes.size,
      foraOrganizacoes: lido.foraOrganizacoes, contagens: Object.fromEntries(lido.contadores.entradas()),
      sincronizadoEmMax: lido.maxSincronizado, marcaDagua: marcaAte === null ? null : marcaAte.toISOString(),
      semNovidade: chamados.inseridos + etapas.inseridos + foraGravados.inseridos + ausentesGravados.inseridos === 0,
    };
  });
}
