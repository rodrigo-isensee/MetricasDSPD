import { Contadores, type RegistroChamado } from './allow-list.js';
import { textoParaInstante } from './tempo.js';
import type { Reincidente90d } from './listas-fechadas.js';

/**
 * Normalizador do Acelerato, F2 (plano 056 §3.1, §2 e D-2, D-7 a D-10): do registro do staging (já filtrado pela allow-list) para a linha
 * de `dim_chamado_versao` e `dim_chamado`. Só funções puras: nada aqui lê banco, calcula tempo em horas úteis nem estatística
 * de distribuição (isso é da biblioteca compartilhada, T2.5). Fuso fixo -03:00 (P-DS-2), natureza pelo mapa de `ref_dominio`, campo dos 90 dias por nome.
 * Nada de pessoa: o único dado de agente é o booleano `com_agente`, que o `SELECT` já derivou no MySQL.
 */
export type Natureza = 'incidente' | 'requisicao';
export type Veredito = 'dentro' | 'fora' | null;
export type NivelAtendimento = 'N1' | 'N2' | 'N3';
export type PrioridadeEscala = 'P1' | 'P2' | 'P3' | 'P4' | 'P5';

/** Lista fechada de natureza pelo prefixo da categoria (`ref_dominio` campo `natureza_prefixo`): prefixo -> natureza. */
export type NaturezaPorPrefixo = ReadonlyMap<string, Natureza>;

const DENTRO = new Set(['REALIZADO_NO_PRAZO', 'DENTRO_DO_PRAZO']);
const FORA = new Set(['REALIZADO_APOS_VENCIMENTO', 'VENCIDO']);

export type ResultadoSla = { veredito: Veredito; divergente: boolean };

/**
 * Veredito de SLA (D-2, plano §3.1): status que começa por "REALIZADO" vale como está; senão `*_violado` = 1 é fora e 0 é dentro; os dois
 * nulos (ou status sem flag) ficam sem veredito (à parte, nunca no denominador). `divergente` = status e flag discordam (contagem, sem valor).
 */
export function vereditoSla(status: string | null, violado: boolean | null): ResultadoSla {
  const divergente = status !== null && violado !== null && (DENTRO.has(status) ? violado : FORA.has(status) ? !violado : false);
  if (status !== null && status.startsWith('REALIZADO')) return { veredito: DENTRO.has(status) ? 'dentro' : FORA.has(status) ? 'fora' : null, divergente };
  if (violado === null) return { veredito: null, divergente };
  return { veredito: violado ? 'fora' : 'dentro', divergente };
}

/** Natureza pelo prefixo mais longo que casa; sem prefixo conhecido = nulo (contado, nunca inferido). */
export function naturezaDaCategoria(categoria: string | null, prefixos: NaturezaPorPrefixo): Natureza | null {
  if (categoria === null) return null;
  let melhor = '';
  for (const p of prefixos.keys()) if (categoria.startsWith(p) && p.length > melhor.length) melhor = p;
  return melhor === '' ? null : prefixos.get(melhor)!;
}

const ESCALA_P = /^P([1-5]) - /;
/**
 * Prioridade P1 a P5 SÓ do vocabulário da escala P (resp. 4). Os outros dois vocabulários (prefixos SSSC e DSPD) não são mapeados:
 * o mapeamento é a D-12, pendente do dono (CT-46). Fora da escala = nulo (o chamado não entra nas métricas por prioridade).
 */
export function prioridadeDaEscala(prioridade: string | null): PrioridadeEscala | null {
  if (prioridade === null) return null;
  const m = ESCALA_P.exec(prioridade);
  return m === null ? null : (`P${m[1]}` as PrioridadeEscala);
}

/** Nomes de etapa da biblioteca (`EtapaAcelerato`), por comparação sem diferença de caixa. Etapa fora desta lista fica com o nome da origem. */
export const ETAPAS_DA_BIBLIOTECA = [
  'Novo', 'Em triagem', 'Em diagnóstico', 'Em atendimento N1', 'Aguardando atribuição', 'Em atendimento N2', 'Em atendimento N3',
  'Pendente', 'Aguardando validação', 'Encerrado', 'Arquivar',
] as const;
const POR_NOME = new Map<string, string>(ETAPAS_DA_BIBLIOTECA.map((n) => [n.toLocaleLowerCase('pt-BR'), n]));
export const etapaDaBiblioteca = (descricao: string | null): string | null =>
  descricao === null ? null : (POR_NOME.get(descricao.trim().toLocaleLowerCase('pt-BR')) ?? descricao.trim());

export type EtapaTotal = { descricao: string | null; tempo_sla_segundos: number | null; quantidade_vezes: number | null };
const NIVEIS: readonly [string, NivelAtendimento][] = [['Em atendimento N3', 'N3'], ['Em atendimento N2', 'N2'], ['Em atendimento N1', 'N1']];

/**
 * Nível de resolução (S4, T5.3: "a partir da etapa de atendimento"). SUPOSIÇÃO a confirmar com o dono: sem instantes de entrada e saída,
 * vale o nível MAIS ALTO de atendimento por onde o chamado passou (tempo ou passagem maior que zero). "Fornecedor" não é derivado.
 */
export function nivelDeResolucao(etapas: readonly EtapaTotal[]): NivelAtendimento | null {
  const passou = new Set(etapas.filter((e) => (e.tempo_sla_segundos ?? 0) > 0 || (e.quantidade_vezes ?? 0) > 0).map((e) => etapaDaBiblioteca(e.descricao)));
  return NIVEIS.find(([nome]) => passou.has(nome))?.[1] ?? null;
}

/** Instante (UTC) de uma data da origem, Brasília fixo; `null` se não é data válida. */
export const instanteDe = (texto: string | null): Date | null => (texto === null ? null : textoParaInstante(texto));

export type LinhaProjecao = {
  chamado_id: string;
  natureza: Natureza | null;
  equipe: string | null;
  organizacao: string | null;
  tipo: string | null;
  categoria_sistema: string | null;
  categoria_key: number | null;
  excluido: boolean;
  status: 'Concluído' | 'Aberto';
  etapa: string | null;
  prioridade: PrioridadeEscala | null;
  aberto_em: Date | null;
  restaurado_em: Date | null;
  data_finalizado: Date | null;
  status_sla_r: 'REALIZADO_NO_PRAZO' | 'REALIZADO_APOS_VENCIMENTO' | null;
  status_sla_pa: 'NO_PRAZO' | 'APOS_VENCIMENTO' | null;
  nivel_resolucao: NivelAtendimento | null;
  arquivado: boolean;
  com_agente: boolean;
  reincidente_90d: Reincidente90d | null;
  fora_do_recorte: boolean;
};

export type MarcasSaida = { ausente: boolean; fora: boolean };
const texto = (v: unknown): string | null => (typeof v === 'string' ? v : null);
const logico = (v: unknown): boolean | null => (typeof v === 'boolean' ? v : null);
const numero = (v: unknown): number | null => (typeof v === 'number' ? v : null);

/**
 * Registro do staging -> linha da projeção. Fechado = `data_pronto` preenchida (D-8); `encerrado` nunca define fechamento. `restaurado_em`
 * = `data_pronto` (fim do relógio de resolução, S1). `primeiro_atendimento_em` não é projetado: o MTTA espera a D-13 (CT-56).
 * `status_sla_r` só em chamado fechado (nulo só em aberto); o veredito de primeiro atendimento vale em qualquer estado.
 */
export function normalizarChamado(
  idOrigem: string, p: RegistroChamado, marcas: MarcasSaida, etapas: readonly EtapaTotal[], natureza: NaturezaPorPrefixo, c: Contadores,
): LinhaProjecao {
  const dataPronto = instanteDe(texto(p.data_pronto));
  const fechado = dataPronto !== null;
  const campos = p.campos as { reincidente_90d: Reincidente90d | null } | undefined;
  const categoria = texto(p.categoria);
  const prioridade = texto(p.prioridade);
  const comAgente = logico(p.com_agente) ?? true;
  if (!comAgente) c.somar('sem_agente');

  const pa = vereditoSla(texto(p.sla_pa_status), logico(p.sla_pa_violado));
  const r = vereditoSla(texto(p.sla_r_status), logico(p.sla_r_violado));
  for (const [nome, v] of [['pa', pa], ['r', r]] as const) {
    if (v.divergente) c.somar(`sla_${nome}_divergente`);
    if (v.veredito === null) c.somar(`sla_${nome}_sem_veredito`);
  }
  const nat = naturezaDaCategoria(categoria, natureza);
  if (nat === null) c.somar('natureza_sem_prefixo');
  const prioridadeP = prioridadeDaEscala(prioridade);
  if (prioridadeP === null) c.somar('prioridade_fora_da_escala_p');
  const nivel = fechado ? nivelDeResolucao(etapas) : null;

  return {
    chamado_id: idOrigem,
    natureza: nat,
    equipe: texto(p.equipe),
    organizacao: texto(p.organizacao),
    tipo: texto(p.tipo_ticket),
    categoria_sistema: categoria,
    categoria_key: numero(p.categoria_key),
    excluido: logico(p.lixeira) ?? false,
    status: fechado ? 'Concluído' : 'Aberto',
    etapa: etapaDaBiblioteca(texto(p.status)),
    prioridade: prioridadeP,
    aberto_em: instanteDe(texto(p.data_criacao)),
    restaurado_em: dataPronto,
    data_finalizado: dataPronto,
    status_sla_r: fechado && r.veredito !== null ? (r.veredito === 'dentro' ? 'REALIZADO_NO_PRAZO' : 'REALIZADO_APOS_VENCIMENTO') : null,
    status_sla_pa: pa.veredito === null ? null : pa.veredito === 'dentro' ? 'NO_PRAZO' : 'APOS_VENCIMENTO',
    nivel_resolucao: nivel,
    arquivado: logico(p.arquivado) ?? false,
    com_agente: comAgente,
    reincidente_90d: campos?.reincidente_90d ?? null,
    fora_do_recorte: marcas.ausente || marcas.fora,
  };
}
