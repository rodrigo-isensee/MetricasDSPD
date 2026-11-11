import { createHash } from 'node:crypto';
import {
  classificarApontamento, MASCARA_FLAG, type DicionarioApontamento, type EntradaApontamento, type ResultadoApontamento,
} from '@metricas-dspd/metricas/coletor';
import { CAMPOS_APONTAMENTO, CAMPOS_CLASSIFICACAO, serializar } from '../allow-list.js';
import { instanteDoBm } from '../normalizador.js';

// Pedido 059 (K-193), A2: leitura de UM apontamento do worklog na fronteira do coletor (ADR 0020, revisão 4, R4-2; ADR 0025 itens 5 e 10).
// O objeto da API entra, a allow-list (`CAMPOS_APONTAMENTO`) corta o que vier a mais, a validação recusa o inválido SEM eco do valor
// (só código e `id_origem`), e o comentário e o `user_id` saem separados, SÓ em memória: o comentário vai à classificação e é descartado;
// o `user_id` vai ao projetor. Nada aqui lê banco, relógio nem ambiente: `hoje` (data civil) é parâmetro.

/**
 * Máscara de bits de `flags_qualidade` (lista fechada, 0 a 31), vinda da biblioteca (`MASCARA_FLAG`, ordem de `FLAGS_QUALIDADE` do contrato): o servidor
 * não repete os bits. Os três primeiros vêm da classificação; o quarto, da hierarquia; o quinto (`valor-atipico`) está reservado e nada o grava.
 */
export const FLAGS = {
  SEM_COMENTARIO: MASCARA_FLAG['sem-comentario'], GENERICO: MASCARA_FLAG.generico, SEM_VINCULO: MASCARA_FLAG['sem-vinculo'],
  SEM_INICIATIVA: MASCARA_FLAG['sem-iniciativa'], VALOR_ATIPICO: MASCARA_FLAG['valor-atipico'],
} as const;
/**
 * O que a classificação pode ligar (bits 1, 2 e 4; o bit 4, sem-vinculo, só para o subgrupo nao-classificado desde o pedido 089, D2). O bit 8 (sem-iniciativa) é da hierarquia: `atualizarHierarquia` o grava no fato. O bit 16
 * (valor-atipico) está RESERVADO: nada o grava, porque a soma diária é calculada na leitura (biblioteca e rota), nunca na coleta; a máscara
 * 24 do UPDATE do fato só o preserva para que um gravador futuro não seja apagado pela releitura.
 */
export const MASCARA_DA_CLASSIFICACAO = FLAGS.SEM_COMENTARIO | FLAGS.GENERICO | FLAGS.SEM_VINCULO;
export const SEGUNDOS_POR_DIA = 86_400;

/** Entrada da classificação: o comentário (texto livre, só em memória), o tipo do card e a categoria de tempo (nula no worklog real). */
export type EntradaClassificacao = EntradaApontamento;
/** Saída da classificação: só lista fechada e inteiros (`classificarApontamento` da biblioteca, ADR 0020 R4-2). */
export type SaidaClassificacao = ResultadoApontamento;
/** O dicionário já vem ligado à função: o coletor só a chama e descarta o comentário. */
export type ClassificarApontamento = (entrada: EntradaClassificacao) => SaidaClassificacao;

/** Liga a função pura da biblioteca (`classificarApontamento`, a única que vê o comentário) ao dicionário vigente (`ref_apontamento_*`). */
export const classificadorDoDicionario = (dicionario: DicionarioApontamento): ClassificarApontamento => (entrada) => classificarApontamento(entrada, dicionario);

/** Linha gravável (allow-list + classificação), com os nomes das colunas de `stg_apontamento` e `fato_apontamento`. */
export interface LinhaApontamento {
  logged_time_id: string; card_id: string; parent_card_id: string | null; subtask_id: string | null; lane_id: string | null;
  column_id: string | null; category_id: string | null; data_apontamento: string; segundos: number; registrado_em: string | null;
}
export type LinhaClassificada = LinhaApontamento & {
  subgrupo_codigo: string; flags_qualidade: number; qtd_palavras: number; versao_dicionario: string; registro_sha256: string;
};

/** Código da falha de validação (nunca o valor recebido): vai a `ctl_coleta_falha.erro`. */
export type CodigoFalha = 'id-invalido' | 'data-invalida' | 'data-futura' | 'tempo-invalido' | 'campo-invalido' | 'classificacao-falhou';
export type Leitura =
  | { ok: true; linha: LinhaApontamento; userId: string | null; comentario: string | null }
  | { ok: false; codigo: CodigoFalha; idOrigem: string | null };

const ID = /^[1-9]\d{0,11}$/;
const DIA = /^\d{4}-\d{2}-\d{2}$/;
const CODIGO_SUBGRUPO = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Id do BusinessMap: inteiro positivo de até 12 dígitos (número ou texto), em texto; qualquer outra coisa é `null`. */
export function idDoBm(v: unknown): string | null {
  const t = typeof v === 'number' && Number.isSafeInteger(v) ? String(v) : v;
  return typeof t === 'string' && ID.test(t) ? t : null;
}

const diaReal = (d: unknown): d is string => {
  if (typeof d !== 'string' || !DIA.test(d)) return false;
  const t = Date.parse(`${d}T00:00:00Z`);
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === d;
};

/** Id opcional: ausente ou nulo vira `null`; presente e inválido vira `undefined`. */
const idOpcional = (v: unknown): string | null | undefined => (v === undefined || v === null ? null : (idDoBm(v) ?? undefined));

const IDS_OPCIONAIS = ['parent_card_id', 'subtask_id', 'lane_id', 'column_id', 'category_id'] as const;

/**
 * Valida e reduz um registro de `/loggedTime`. `hoje` é a data civil de America/Sao_Paulo (`AAAA-MM-DD`): data depois dela é recusada.
 * Ids só dígitos; `date` real e não futura; `time` inteiro de 1 a 86 400 (soma diária acima do limite NÃO é recusada: vira flag na
 * projeção). Fora disso: `{ ok: false, codigo, idOrigem }`, com `idOrigem` só se o `logged_time_id` for válido.
 */
export function lerApontamento(bruto: unknown, hoje: string): Leitura {
  const o = ehObjeto(bruto) ? bruto : {};
  const id = idDoBm(o.logged_time_id);
  const falha = (codigo: CodigoFalha): Leitura => ({ ok: false, codigo, idOrigem: id });
  const card = idDoBm(o.card_id);
  if (id === null || card === null) return falha('id-invalido');
  const opcionais: Record<string, string | null> = {};
  for (const campo of IDS_OPCIONAIS) {
    const lido = idOpcional(o[campo]);
    if (lido === undefined) return falha('id-invalido');
    opcionais[campo] = lido;
  }
  const userId = idOpcional(o.user_id);
  if (userId === undefined) return falha('id-invalido');
  if (!diaReal(o.date)) return falha('data-invalida');
  if (o.date > hoje) return falha('data-futura');
  const tempo = o.time;
  if (typeof tempo !== 'number' || !Number.isInteger(tempo) || tempo < 1 || tempo > SEGUNDOS_POR_DIA) return falha('tempo-invalido');
  let registradoEm: string | null = null;
  if (o.logged_at !== undefined && o.logged_at !== null) {
    const ms = instanteDoBm(o.logged_at);
    if (ms === null) return falha('campo-invalido');
    registradoEm = new Date(ms).toISOString();
  }
  const linha: LinhaApontamento = {
    logged_time_id: id, card_id: card, parent_card_id: opcionais.parent_card_id!, subtask_id: opcionais.subtask_id!,
    lane_id: opcionais.lane_id!, column_id: opcionais.column_id!, category_id: opcionais.category_id!,
    data_apontamento: o.date, segundos: tempo, registrado_em: registradoEm,
  };
  return { ok: true, linha, userId, comentario: typeof o.comment === 'string' ? o.comment : null };
}

/** Confere a saída da classificação (a função vem de fora): lista fechada e inteiros. `null` = inválida (a falha vai ao controle como código). */
export function conferirClassificacao(s: unknown): SaidaClassificacao | null {
  if (!ehObjeto(s)) return null;
  const { subgrupo, flags, qtdPalavras, versaoDicionario } = s;
  const ok =
    typeof subgrupo === 'string' && subgrupo.length <= 80 && CODIGO_SUBGRUPO.test(subgrupo) &&
    Number.isInteger(flags) && (flags as number) >= 0 && (flags as number) <= MASCARA_DA_CLASSIFICACAO &&
    Number.isInteger(qtdPalavras) && (qtdPalavras as number) >= 0 && (qtdPalavras as number) <= 32_767 &&
    typeof versaoDicionario === 'string' && versaoDicionario !== '' && versaoDicionario.length <= 40;
  return ok ? (s as unknown as SaidaClassificacao) : null;
}

/**
 * `registro_sha256` (ADR 0020 R4-2): SHA-256 em hexadecimal do registro gravável (allow-list mais a saída da classificação) em forma
 * canônica (chaves em ordem). Nunca do comentário, do `user_id` nem do objeto da API: edição só do comentário gera versão nova
 * apenas se mudar a saída da classificação.
 */
export function classificar(linha: LinhaApontamento, saida: SaidaClassificacao): LinhaClassificada {
  const completa = {
    ...linha, subgrupo_codigo: saida.subgrupo, flags_qualidade: saida.flags, qtd_palavras: saida.qtdPalavras, versao_dicionario: saida.versaoDicionario,
  };
  return { ...completa, registro_sha256: createHash('sha256').update(serializar(completa)).digest('hex') };
}

/** Coluna de cada campo da API (CAMPOS_APONTAMENTO) em `stg_apontamento` e `fato_apontamento`. */
export const COLUNA_DO_CAMPO: Readonly<Record<(typeof CAMPOS_APONTAMENTO)[number], keyof LinhaApontamento>> = {
  logged_time_id: 'logged_time_id', card_id: 'card_id', parent_card_id: 'parent_card_id', subtask_id: 'subtask_id', lane_id: 'lane_id',
  column_id: 'column_id', category_id: 'category_id', date: 'data_apontamento', time: 'segundos', logged_at: 'registrado_em',
};

/** Colunas e tipos do registro gravável, na ordem do INSERT (lista fechada: o teste estrutural a compara com o esquema, CA-AP-13). */
export const TIPOS_DAS_COLUNAS: Readonly<Record<string, string>> = {
  logged_time_id: 'text', card_id: 'text', parent_card_id: 'text', subtask_id: 'text', lane_id: 'text', column_id: 'text', category_id: 'text',
  data_apontamento: 'date', segundos: 'integer', registrado_em: 'timestamptz', subgrupo_codigo: 'text', flags_qualidade: 'smallint',
  qtd_palavras: 'smallint', versao_dicionario: 'text', registro_sha256: 'text',
};
export const COLUNAS_REGISTRO: readonly string[] = [
  ...CAMPOS_APONTAMENTO.map((c) => COLUNA_DO_CAMPO[c]), ...CAMPOS_CLASSIFICACAO, 'registro_sha256',
];
/** `v(col tipo, ...)` de `jsonb_to_recordset`, sempre a partir de `COLUNAS_REGISTRO` (nunca de entrada externa). */
export const DEFINICAO_REGISTRO = COLUNAS_REGISTRO.map((c) => `${c} ${TIPOS_DAS_COLUNAS[c]}`).join(', ');
