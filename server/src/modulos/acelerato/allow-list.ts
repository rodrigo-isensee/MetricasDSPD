import { z } from 'zod';
import { ErroColeta } from './erros.js';
import {
  CAMPOS_ETAPA_F3, COLUNAS_DA_LINHA, DOMINIO_90_DIAS, NOME_CAMPO_90_DIAS, NOMES_ETAPA_LISTA, NOMES_ETAPA_PREENCHIDO, STATUS_SLA, type Reincidente90d,
} from './listas-fechadas.js';
import { PADRAO_DATA } from './tempo.js';

/**
 * Allow-list do Acelerato na fronteira (ADR 0023, item 4; ADR 0020; ameaças M4 e M11). Segunda camada: a primeira é o
 * texto das consultas (só colunas lidas). Cada linha passa por um schema zod `strict`: coluna ou chave fora da lista
 * FALHA FECHADO (`dados-invalidos`, nada gravado pela metade). O erro do zod é reduzido ao NOME da coluna, nunca ao
 * valor. Nenhuma coluna de pessoa tem entrada aqui; a lista de proibidos do teste é escrita no teste (ADR 0020, B-1).
 */

/** Listas de `ref_dominio` vigentes (carregadas do banco, nunca do `.env`): chave numérica -> rótulo, e vocabulários. */
export type ListasRecorte = {
  tipos: ReadonlyMap<number, string>;
  organizacoes: ReadonlyMap<number, string>;
  equipes: ReadonlyMap<number, string>;
  etapas: ReadonlySet<string>;
  prioridades: ReadonlySet<string>;
  /** `ref_dominio` campos `categoria` e `descricao_workflow` (A5 do parecer de segurança): texto livre só por domínio fechado. */
  categorias: ReadonlySet<string>;
  workflows: ReadonlySet<string>;
};

/** Contagens sem valor (`ctl_coleta_contagem`): o que ficou nulo por estar fora do domínio, o que falta, etc. */
export class Contadores {
  private readonly mapa = new Map<string, number>();
  somar(chave: string, n = 1): void { this.mapa.set(chave, (this.mapa.get(chave) ?? 0) + n); }
  obter(chave: string): number { return this.mapa.get(chave) ?? 0; }
  entradas(): [string, number][] { return [...this.mapa.entries()].sort(([a], [b]) => a.localeCompare(b)); }
}

type Escalar = string | number | boolean | null;
export type CamposChamado = Record<string, Escalar>;
export type RegistroChamado = Record<string, Escalar | CamposChamado>;

/** Sem NUL (o `jsonb` o recusa) e sem substituto isolado (UTF-16 malformado vira U+FFFD). */
const SUBSTITUTO_ISOLADO = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;
export const limpar = (s: string): string => s.replace(SUBSTITUTO_ISOLADO, '\uFFFD').replaceAll('\u0000', '');

const texto = (max: number) => z.string().max(max).transform(limpar);
const numero = z.union([z.number().finite(), z.string().regex(/^-?\d{1,15}(\.\d{1,6})?$/).transform(Number)]);
const inteiro = z.number().int().safe();
const chave = inteiro.positive();
const sinal = z.union([z.boolean(), z.literal(0), z.literal(1)]).transform((v) => v === true || v === 1);
const data = z.string().regex(PADRAO_DATA);
const statusSla = z.enum(STATUS_SLA);

/** Linha da Q1: exatamente as 35 colunas lidas e a derivada `com_agente`. */
const esquemaChamado = z.strictObject({
  ticket_key: chave, tipo_ticket_key: chave, tipo_ticket: texto(255), status_key: inteiro.nullable(), status: texto(255).nullable(),
  encerrado: sinal, categoria_key: inteiro.nullable(), categoria: texto(255).nullable(), organizacao_key: chave,
  organizacao: texto(255), equipe_key: chave, equipe: texto(255), com_agente: sinal, prioridade: texto(255).nullable(),
  data_criacao: data, data_atualizacao: data, data_pronto: data.nullable(), lixeira: sinal, arquivado: sinal, suspenso: sinal,
  impedido: sinal, tempo_vida_dias: numero.nullable(), tempo_ciclico_dias: numero.nullable(),
  sla_pa_tempo_min: numero.nullable(), sla_pa_saldo_min: numero.nullable(), sla_pa_prazo_min: numero.nullable(),
  sla_pa_violado: sinal.nullable(), sla_pa_status: statusSla.nullable(),
  sla_r_saldo_min: numero.nullable(), sla_r_prazo_min: numero.nullable(), sla_r_violado: sinal.nullable(), sla_r_status: statusSla.nullable(),
  data_primeiro_comentario: data.nullable(), primeiro_comentario_min_uteis: numero.nullable(),
  sincronizado_em: data.nullable(), estatisticas_em: data.nullable(),
});
/** Linha da Q2. */
const esquemaEtapa = z.strictObject({
  ticket_key: chave, etapa_key: inteiro.nullable(), descricao: texto(255).nullable(), descricao_workflow: texto(255).nullable(),
  tempo_sla: inteiro.nullable(), quantidade_vezes: inteiro.min(0).nullable(),
});
/** Linha da Q3. */
const esquemaCampo = z.strictObject({ ticket_key: chave, nome: texto(255), valor: texto(80).nullable() });

/** Reduz o erro do zod ao NOME da coluna (nunca ao valor, M8); chave desconhecida vira só o nome dela. */
function falhar(e: z.ZodError, entidade: string, idOrigem?: string): never {
  const primeiro = e.issues[0];
  const nome = primeiro?.code === 'unrecognized_keys' ? primeiro.keys[0] : primeiro?.path[0];
  throw new ErroColeta('dados-invalidos', { entidade, ...(idOrigem !== undefined ? { idOrigem } : {}), ...(typeof nome === 'string' ? { coluna: nome } : {}) });
}

/** Valor que só entra por domínio fechado: fora dele vira nulo, com contagem e sem o valor. */
function noDominio(valor: string | null, dominio: ReadonlySet<string>, contagem: string, c: Contadores): string | null {
  if (valor === null) return null;
  if (dominio.has(valor)) return valor;
  c.somar(contagem);
  return null;
}
export type ChamadoLido = {
  idOrigem: string;
  dataAtualizacao: string;
  sincronizadoEm: string | null;
  payload: RegistroChamado;
};

/** Confere uma chave e o nome que a acompanha contra a lista vigente: fora dela a coleta falha fechado (CA-11). */
function conferirRecorte(v: z.output<typeof esquemaChamado>, listas: ListasRecorte): void {
  const id = String(v.ticket_key);
  const pares: [ReadonlyMap<number, string>, number, string][] = [
    [listas.tipos, v.tipo_ticket_key, v.tipo_ticket], [listas.organizacoes, v.organizacao_key, v.organizacao], [listas.equipes, v.equipe_key, v.equipe],
  ];
  for (const [lista, k, nome] of pares) if (lista.get(k) !== nome) throw new ErroColeta('fora-do-recorte', { entidade: 'chamado', idOrigem: id });
}

/** Linha da Q1 -> registro do staging. Falha fechado em coluna fora da lista, valor inválido ou linha fora do recorte. */
export function registroChamado(linha: unknown, listas: ListasRecorte, c: Contadores): ChamadoLido {
  const r = esquemaChamado.safeParse(linha);
  if (!r.success) {
    const id = typeof (linha as { ticket_key?: unknown } | null)?.ticket_key === 'number' ? String((linha as { ticket_key: number }).ticket_key) : undefined;
    return falhar(r.error, 'chamado', id);
  }
  const v = r.data;
  conferirRecorte(v, listas);
  const payload: RegistroChamado = {};
  for (const coluna of COLUNAS_DA_LINHA) payload[coluna] = v[coluna];
  payload.status = noDominio(v.status, listas.etapas, 'fora_dominio_status', c);
  payload.prioridade = noDominio(v.prioridade, listas.prioridades, 'fora_dominio_prioridade', c);
  payload.categoria = noDominio(v.categoria, listas.categorias, 'fora_dominio_categoria', c);
  return { idOrigem: String(v.ticket_key), dataAtualizacao: v.data_atualizacao, sincronizadoEm: v.sincronizado_em, payload };
}

export type EtapaLida = { idOrigem: string; payload: { descricao: string | null; descricao_workflow: string | null; tempo_sla_segundos: number | null; quantidade_vezes: number | null } };

/** Linhas da Q2 de UM chamado -> etapas do staging (uma por `etapaKey`). Sem chave ou repetida: contada e descartada. */
export function registroEtapas(linhas: readonly unknown[], listas: ListasRecorte, c: Contadores): EtapaLida[] {
  const vistas = new Set<string>();
  const saida: EtapaLida[] = [];
  for (const linha of linhas) {
    const r = esquemaEtapa.safeParse(linha);
    if (!r.success) return falhar(r.error, 'etapa');
    const e = r.data;
    if (e.etapa_key === null) { c.somar('etapa_sem_chave'); continue; }
    const id = String(e.etapa_key);
    if (vistas.has(id)) { c.somar('etapa_repetida'); continue; }
    vistas.add(id);
    saida.push({
      idOrigem: id,
      payload: {
        descricao: noDominio(e.descricao, listas.etapas, 'fora_dominio_etapa', c),
        descricao_workflow: noDominio(e.descricao_workflow, listas.workflows, 'fora_dominio_workflow', c),
        tempo_sla_segundos: e.tempo_sla, quantidade_vezes: e.quantidade_vezes,
      },
    });
  }
  return saida;
}

/**
 * Linhas da Q3 de UM chamado -> `reincidente_90d` (D-10). Nome só por igualdade exata; sem linha ou vazio = sem resposta;
 * valor fora do domínio = nulo com contagem, sem o valor.
 */
export function reincidente90d(linhas: readonly unknown[], c: Contadores): Reincidente90d | null {
  let valor: string | null | undefined;
  for (const linha of linhas) {
    const r = esquemaCampo.safeParse(linha);
    if (!r.success) return falhar(r.error, 'campo');
    const campo = r.data;
    if (campo.nome !== NOME_CAMPO_90_DIAS) { c.somar('campo_nome_fora_da_lista'); continue; }
    valor = campo.valor;
  }
  if (valor === undefined || valor === null || valor === '') return 'sem_resposta';
  const codigo = Object.hasOwn(DOMINIO_90_DIAS, valor) ? DOMINIO_90_DIAS[valor] : undefined;
  if (codigo === undefined) { c.somar('campo_90d_fora_dominio'); return null; }
  return codigo;
}

/** Domínios dos campos de etapa de tratamento `lista`: chave do campo -> valores permitidos (de `ref_dominio`, só valores). */
export type DominiosEtapa = ReadonlyMap<string, ReadonlySet<string>>;
/** Posição de cada etapa no desenho do fluxo de atendimento: `kanbanStatusKey` -> posição (maior = vem depois). Lista `etapa_fluxo` de `ref_dominio`, escrita pelas pessoas. */
export type OrdemFluxo = ReadonlyMap<number, number>;

/**
 * Linha da Q6 (campo de etapa `lista`): nome só da constante, `valor` de até 80 caracteres ou nulo, `kanban_status_key` inteiro positivo ou nulo
 * (texto, decimal ou negativo falham); booleano, chave extra ou nome de outro tratamento falham.
 */
const esquemaEtapaLista = z.strictObject({
  ticket_key: chave, nome: z.enum(NOMES_ETAPA_LISTA as [string, ...string[]]), tipo: texto(40).nullable(), valor: texto(80).nullable(),
  kanban_status_key: chave.nullable(),
});
/** Linha da Q7 (campo de etapa `preenchido`): só o booleano; qualquer coluna `valor` falha fechado. */
const esquemaEtapaPreenchido = z.strictObject({ ticket_key: chave, nome: z.enum(NOMES_ETAPA_PREENCHIDO as [string, ...string[]]), preenchido: sinal });

/** Forma comparável de um nome de campo: NFD sem marcas combinantes, sem diferença de maiúscula e sem espaço nas pontas. */
const formaDoNome = (n: string): string => n.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
const CANONICO_POR_FORMA = new Map(CAMPOS_ETAPA_F3.map((f) => [formaDoNome(f.nome), f]));

/**
 * A consulta filtra `nome IN (...)` pela collation da conexão (ignora maiúscula, acento e espaço no fim); aqui o nome recebido volta ao nome
 * canônico da lista fechada antes da validação exata. Grafia diferente soma `nome_variante_<chave>`; nome que não casa segue como veio e falha
 * fechado no esquema, sem o valor.
 */
function nomeCanonico(linha: unknown, c: Contadores): unknown {
  if (typeof linha !== 'object' || linha === null || !('nome' in linha) || typeof linha.nome !== 'string') return linha;
  const campo = CANONICO_POR_FORMA.get(formaDoNome(linha.nome));
  if (campo === undefined) return linha;
  if (campo.nome !== linha.nome) c.somar(`nome_variante_${campo.chave}`);
  return { ...linha, nome: campo.nome };
}

/** `tipo` só recusa, nunca libera (A2): a fonte dizendo texto para um nome `lista` anula o valor. */
const tipoTexto = (tipo: string | null): boolean => tipo !== null && tipo.normalize('NFD').toLowerCase().includes('text');

type Preenchido = { valor: string; etapa: number | null };

/**
 * Valor de um campo de `lista` repetido em várias etapas (L9-c, decisão "B" do dono de 2026-11-05). Só os valores preenchidos competem (vazio nunca
 * apaga). Um só valor, ou valores iguais, valem sem consultar a posição. Com valores diferentes vale a etapa de MAIOR posição no desenho do fluxo
 * (nunca a ordem das linhas); etapa sem posição na lista, ou empate de posição com valores diferentes, deixa o campo nulo com contagem, sem o valor
 * e sem escolher por palpite (P-L9C-2 "A").
 */
function valorDoCampoRepetido(candidatos: readonly Preenchido[], ordem: OrdemFluxo, chaveCampo: string, c: Contadores): string | null {
  const valores = new Set(candidatos.map((x) => x.valor));
  if (valores.size <= 1) return candidatos[0]?.valor ?? null;
  const comPosicao = candidatos.map((x) => ({ valor: x.valor, posicao: x.etapa === null ? undefined : ordem.get(x.etapa) }));
  const sem = comPosicao.some((x) => x.posicao === undefined);
  if (sem) { c.somar(`etapa_fora_do_fluxo_${chaveCampo}`); return null; }
  const maior = Math.max(...comPosicao.map((x) => x.posicao!));
  const vencedores = new Set(comPosicao.filter((x) => x.posicao === maior).map((x) => x.valor));
  if (vencedores.size > 1) { c.somar(`empate_fluxo_${chaveCampo}`); return null; }
  return [...vencedores][0]!;
}

/**
 * Linhas da Q6 e da Q7 de UM chamado -> campos de etapa do `payload.campos` (F3). `lista`: o valor só segue se estiver no domínio do
 * campo (domínio ausente ou vazio = nulo com contagem `fora_dominio_<chave>`) e se o `tipo` não for texto (`tipo_texto_<chave>`);
 * `preenchido`: só o booleano (qualquer linha verdadeira vale). Nome repetido em várias etapas: vale o valor preenchido da etapa que vem por
 * último no desenho do fluxo (`ordemFluxo`), vazio não apaga (ver `valorDoCampoRepetido`). Sem linha: `lista` nula, `preenchido` falso. Falha fechado sem o valor.
 */
export function camposEtapa(
  listaLinhas: readonly unknown[], preenchidoLinhas: readonly unknown[], dominios: DominiosEtapa, ordemFluxo: OrdemFluxo, c: Contadores,
): CamposChamado {
  const chaveDe = new Map(CAMPOS_ETAPA_F3.map((f) => [f.nome as string, f.chave as string]));
  const candidatos = new Map<string, Preenchido[]>();
  const texto_ = new Set<string>();
  for (const linha of listaLinhas) {
    const r = esquemaEtapaLista.safeParse(nomeCanonico(linha, c));
    if (!r.success) return falhar(r.error, 'campo_etapa');
    const k = chaveDe.get(r.data.nome)!;
    if (tipoTexto(r.data.tipo)) { texto_.add(k); continue; }
    // Um vazio (nulo, texto vazio ou só espaços, como o TRIM da consulta B) nunca apaga um valor preenchido: só os preenchidos competem.
    if (r.data.valor !== null && r.data.valor.trim() !== '') candidatos.set(k, [...(candidatos.get(k) ?? []), { valor: r.data.valor, etapa: r.data.kanban_status_key }]);
  }
  const marcados = new Set<string>();
  for (const linha of preenchidoLinhas) {
    const r = esquemaEtapaPreenchido.safeParse(nomeCanonico(linha, c));
    if (!r.success) return falhar(r.error, 'campo_etapa');
    if (r.data.preenchido) marcados.add(chaveDe.get(r.data.nome)!);
  }
  const saida: CamposChamado = {};
  for (const f of CAMPOS_ETAPA_F3) {
    if (f.tratamento === 'preenchido') { saida[f.chave] = marcados.has(f.chave); continue; }
    if (texto_.has(f.chave)) { c.somar(`tipo_texto_${f.chave}`); saida[f.chave] = null; continue; }
    const v = valorDoCampoRepetido(candidatos.get(f.chave) ?? [], ordemFluxo, f.chave, c);
    if (v === null) { saida[f.chave] = null; continue; }
    const dominio = dominios.get(f.chave);
    if (dominio?.has(v) === true) saida[f.chave] = v;
    else { c.somar(`fora_dominio_${f.chave}`); saida[f.chave] = null; }
  }
  return saida;
}

/** Linha da consulta de saída do recorte (Q5): só a chave, as 3 chaves do recorte, `lixeira` e a data. */
const esquemaSaida = z.strictObject({
  ticket_key: chave, tipo_ticket_key: inteiro.nullable(), organizacao_key: inteiro.nullable(), equipe_key: inteiro.nullable(),
  lixeira: sinal.nullable(), data_atualizacao: data.nullable(),
});
export type LinhaSaida = { idOrigem: string; tipo: number | null; organizacao: number | null; equipe: number | null };

export function registroSaida(linha: unknown): LinhaSaida {
  const r = esquemaSaida.safeParse(linha);
  if (!r.success) return falhar(r.error, 'saida');
  return { idOrigem: String(r.data.ticket_key), tipo: r.data.tipo_ticket_key, organizacao: r.data.organizacao_key, equipe: r.data.equipe_key };
}

/** Linha da contagem (Q4): um número só. */
const esquemaContagem = z.strictObject({ n: inteiro.min(0) });
export function registroContagem(linha: unknown): number {
  const r = esquemaContagem.safeParse(linha);
  if (!r.success) return falhar(r.error, 'contagem');
  return r.data.n;
}
