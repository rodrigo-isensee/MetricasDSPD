import { COLUNAS_PESSOA } from './lgpd.js';
import type { Esquemas } from './esquemas.js';

/** Colunas por tabela/view de cada schema, lidas do catálogo (a ordem é a do banco). */
export type Catalogo = { bm: Record<string, string[]>; ac: Record<string, string[]>; core: Record<string, string[]> };

export const PAPEIS = ['dspd_coletor', 'dspd_api', 'dspd_ref', 'dspd_webhook', 'dspd_automacao', 'dspd_pesquisa', 'dspd_api_apontamento'] as const;

/**
 * Pedido 059 (ADR 0020, revisão 4, R4-5): o papel da aba Apontamento lê SÓ estas colunas (GRANT por coluna, nada de `stg_`, `evt_` nem `ctl_` além do mínimo do
 * frescor). De `dim_responsavel`, só `pessoa_ref` e o nome (nunca `responsavel_id`); de `fato_apontamento`, sem `logged_time_id`, hash, comentário nem categoria.
 * Chave `bm.` ou `core.` + tabela; tabela ausente do catálogo é pulada (reaplicável em catálogo antigo).
 */
export const COLUNAS_API_APONTAMENTO: Readonly<Record<string, readonly string[]>> = {
  'bm.fato_apontamento': ['card_id', 'parent_card_id', 'subtask_id', 'data_apontamento', 'segundos', 'subgrupo_codigo', 'flags_qualidade', 'iniciativa_card_id', 'pessoa_ref', 'type_id', 'excluido_em'],
  'bm.dim_card_raiz': ['card_id', 'raiz_card_id', 'raiz_fora_do_escopo'],
  'bm.dim_card': ['card_id', 'titulo', 'tipo', 'equipe'],
  'bm.dim_responsavel': ['pessoa_ref', 'responsavel_nome'],
  'bm.apt_pessoa_time': ['pessoa_ref', 'vigencia_ate'],
  'bm.ref_apontamento_subgrupo': ['codigo', 'rotulo', 'incluido_por_versao_id'],
  'bm.ref_apontamento_termo': ['incluido_por_versao_id'],
  'bm.ref_apontamento_regra_tipo': ['incluido_por_versao_id'],
  'bm.ctl_coleta': ['coleta_id', 'tarefa', 'status', 'iniciado_em', 'finalizado_em'],
  // Pedido 063 (K-200, ADR 0020 R4-5 revista): estado de cobertura por card (sem pessoa nem horas); nunca `ctl_coleta_falha`.
  'bm.ctl_apontamento_cobertura': ['cobertura_sk', 'card_id', 'estado', 'detectado_em'],
  'core.ref_calendario': ['calendario_id', 'offset_minutos'],
  'core.ref_calendario_aplicacao': ['dominio', 'classe', 'calendario_id', 'vigente_ate'],
  'core.ref_feriado': ['calendario_id', 'data', 'incluido_por_versao_id'],
  'core.ref_versao_criterio': ['versao_id', 'vigente_desde', 'dominio', 'descricao'],
  'core.ref_versao_criterio_metrica': ['versao_id', 'metrica_id'],
};

/**
 * Colunas que a API não lê e que NÃO são de pessoa (ADR 0020, M-4), por `schema.tabela.coluna` sem prefixo de teste.
 * Lista própria, separada de `COLUNAS_PESSOA`, para não distorcer o catálogo LGPD. `agg_conhecimento_sistema.entregas`
 * entra aqui quando a tabela existir (fase 3 do pedido 011): a API lê `tem_entrega`, nunca a contagem.
 */
export const COLUNAS_FORA_DA_API: readonly string[] = [
  'dspd_bm.agg_conhecimento_sistema.entregas',
  // Pedido 052, F0 (data-model §8): quem mudou a lista de times (HMAC do `sub` ou `carga-inicial-057-E3`; nunca nome nem e-mail).
  'dspd_bm.ref_time.registrado_por',
  'dspd_bm.ref_time_workflow.registrado_por',
];

/** Tabelas inteiras que a API não lê, por `schema.tabela` (ADR 0020, B-3): só o `dspd_coletor` lê `ref_conta_automacao`. */
export const TABELAS_FORA_DA_API: readonly string[] = [
  'dspd_bm.ref_conta_automacao', 'dspd_ac.ref_conta_automacao', 'dspd_core.ref_conta_automacao',
  // Pedido 059 (CA-AP-1): o dicionário do apontamento é lido só pelo coletor e pelo papel da aba, nunca pelo `dspd_api`.
  'dspd_bm.ref_apontamento_subgrupo', 'dspd_bm.ref_apontamento_termo', 'dspd_bm.ref_apontamento_regra_tipo',
];

const COM = (nomes: string[], ...prefixos: string[]): string[] => nomes.filter((n) => prefixos.some((p) => n.startsWith(p)));
const PROJECAO = /^(dim_card|dim_chamado|fato_bloqueio|fato_etapa_chamado)$/;
const IMUTAVEL = /^(stg_|evt_|rec_|fato_transicao$)|_versao$/;
const OUTBOX_COLUNAS_COLETOR = 'status, tentativas, disponivel_em, reservado_ate, processado_em, ultimo_erro';

const nomeLogico = (chave: 'bm' | 'ac' | 'core'): string => `dspd_${chave}`;

/**
 * Privilégios por papel (data-model §8). Pura: recebe o catálogo e devolve o SQL, começando por um REVOKE geral
 * (reaplicar = estado final igual). `dspd_api` recebe GRANT por coluna nas tabelas com coluna de `COLUNAS_PESSOA`.
 * `fato_transicao` e `rec_transicao_par` entram para a API só porque `vw_transicao_canonica` (security_invoker) as lê.
 */
export function gerarGrants(S: Esquemas, cat: Catalogo): string[] {
  const out: string[] = [];
  const papeis = PAPEIS.join(', ');
  const g = (priv: string, schema: string, tabs: string[], papel: string): void => {
    for (const t of tabs) out.push(`GRANT ${priv} ON ${schema}.${t} TO ${papel}`);
  };
  const usage: Record<(typeof PAPEIS)[number], string[]> = {
    dspd_coletor: [S.bm, S.ac, S.core], dspd_api: [S.bm, S.ac, S.core], dspd_ref: [S.bm, S.ac, S.core],
    dspd_webhook: [S.bm, S.core], dspd_automacao: [S.ac, S.core], dspd_pesquisa: [S.core], dspd_api_apontamento: [S.bm, S.core],
  };
  for (const schema of [S.bm, S.ac, S.core]) {
    out.push(`REVOKE ALL ON SCHEMA ${schema} FROM PUBLIC, ${papeis}`, `REVOKE ALL ON ALL TABLES IN SCHEMA ${schema} FROM PUBLIC, ${papeis}`);
  }
  for (const papel of PAPEIS) out.push(`GRANT USAGE ON SCHEMA ${usage[papel].join(', ')} TO ${papel}`);

  const colunasApi = (chave: 'bm' | 'ac', tabela: string): string[] | null => {
    const todas = cat[chave][tabela]!;
    const permitidas = todas.filter((c) => {
      const id = `${nomeLogico(chave)}.${tabela}.${c}`;
      return !COLUNAS_PESSOA.includes(id) && !COLUNAS_FORA_DA_API.includes(id);
    });
    return permitidas.length === todas.length ? null : permitidas;
  };

  for (const chave of ['bm', 'ac'] as const) {
    const schema = S[chave];
    const tabs = Object.keys(cat[chave]);
    g('SELECT, INSERT', schema, tabs.filter((n) => IMUTAVEL.test(n)), 'dspd_coletor');
    g('SELECT, INSERT, UPDATE, DELETE', schema, tabs.filter((n) => PROJECAO.test(n)), 'dspd_coletor');
    // ctl_: UPDATE só por coluna, só da execução (status/fim/marca-d'água/erro); demais ctl_ são append-only.
    const ctl = COM(tabs, 'ctl_');
    g('SELECT, INSERT', schema, ctl, 'dspd_coletor');
    if (ctl.includes('ctl_coleta'))
      out.push(`GRANT UPDATE (status, finalizado_em, marca_dagua_ate, erro_resumo) ON ${schema}.ctl_coleta TO dspd_coletor`);
    if (ctl.includes('ctl_coleta_contagem')) out.push(`GRANT UPDATE ON ${schema}.ctl_coleta_contagem TO dspd_coletor`);
    // Pedido 052, F3: a carga inicial do BusinessMap guarda a última página concluída em `parametros` (retomável por página).
    if (chave === 'bm' && ctl.includes('ctl_coleta')) out.push(`GRANT UPDATE (parametros) ON ${schema}.ctl_coleta TO dspd_coletor`);
    // `dim_responsavel` (F3): projeção de valor atual escrita só pelo coletor; nunca vai à API (fora de `paraApi`). Sem DELETE: o apagamento a pedido do titular é do migrador (DT-3).
    if (tabs.includes('dim_responsavel')) g('SELECT, INSERT, UPDATE', schema, ['dim_responsavel'], 'dspd_coletor');
    // Pedido 059 (ADR 0020 R4-4 e R4-6, ADR 0025 item 8): projeções do apontamento (sem DELETE; a eliminação a pedido é do migrador) e a
    // lista de supressão, que o coletor só LÊ (INSERT é do migrador, dono). Nenhuma delas vai à API (fora de `paraApi`).
    g('SELECT, INSERT, UPDATE', schema, tabs.filter((n) => n === 'fato_apontamento' || n === 'dim_card_raiz'), 'dspd_coletor');
    g('SELECT', schema, tabs.filter((n) => n === 'cfg_pessoa_eliminada'), 'dspd_coletor');
    g('SELECT', schema, COM(tabs, 'ref_'), 'dspd_coletor');
    // API: projeções, views, ref_ e ctl_; nunca stg_, evt_, *_versao. Tabela com coluna de pessoa: só as demais colunas.
    const paraApi = [...tabs.filter((n) => PROJECAO.test(n) || n === 'fato_transicao' || n === 'rec_transicao_par' || n === 'agg_conhecimento_sistema'),
      ...COM(tabs, 'vw_', 'ref_', 'ctl_')].filter((n) => !TABELAS_FORA_DA_API.includes(`${nomeLogico(chave)}.${n}`));
    for (const t of paraApi) {
      const cols = colunasApi(chave, t);
      out.push(cols ? `GRANT SELECT (${cols.join(', ')}) ON ${schema}.${t} TO dspd_api` : `GRANT SELECT ON ${schema}.${t} TO dspd_api`);
    }
    g('SELECT, INSERT', schema, COM(tabs, 'ref_'), 'dspd_ref');
    for (const n of COM(tabs, 'ref_').filter((x) => cat[chave][x]!.includes('vigente_ate')))
      out.push(`GRANT UPDATE (vigente_ate) ON ${schema}.${n} TO dspd_ref`);
  }
  const refCore = COM(Object.keys(cat.core), 'ref_');
  // Mesmo filtro de TABELAS_FORA_DA_API para o core (K-085, B-K2): a tabela fora da API não vira legível por estar em outro schema.
  const refCoreApi = refCore.filter((n) => !TABELAS_FORA_DA_API.includes(`${nomeLogico('core')}.${n}`));
  for (const papel of ['dspd_coletor', 'dspd_automacao']) g('SELECT', S.core, refCore, papel);
  g('SELECT', S.core, refCoreApi, 'dspd_api');
  g('SELECT, INSERT', S.core, refCore, 'dspd_ref');
  for (const n of refCore.filter((x) => cat.core[x]!.includes('vigente_ate'))) out.push(`GRANT UPDATE (vigente_ate) ON ${S.core}.${n} TO dspd_ref`);
  if (cat.core.outbox) {
    out.push(`GRANT SELECT, INSERT, DELETE ON ${S.core}.outbox TO dspd_coletor`,
      `GRANT UPDATE (${OUTBOX_COLUNAS_COLETOR}) ON ${S.core}.outbox TO dspd_coletor`, `GRANT INSERT ON ${S.core}.outbox TO dspd_webhook`);
  }
  // Pesquisa (PV1): sem coluna de pessoa em nenhuma tabela, então `COLUNAS_PESSOA` não muda. A carga só insere (append-only também por gatilho);
  // lê a lista fechada e as versões de critério para validar. A API só lê.
  const pesq = COM(Object.keys(cat.core), 'pesq_');
  g('SELECT, INSERT', S.core, pesq, 'dspd_pesquisa');
  g('SELECT', S.core, COM(Object.keys(cat.core), 'ref_pesq_', 'ref_versao_criterio'), 'dspd_pesquisa');
  g('SELECT', S.core, [...pesq, ...COM(Object.keys(cat.core), 'vw_pesq_')], 'dspd_api');
  for (const [chave, colunas] of Object.entries(COLUNAS_API_APONTAMENTO)) {
    const [esquema, tabela] = chave.split('.') as ['bm' | 'core', string];
    const existentes = cat[esquema][tabela];
    if (existentes === undefined) continue;
    const presentes = colunas.filter((c) => existentes.includes(c));
    if (presentes.length > 0) out.push(`GRANT SELECT (${presentes.join(', ')}) ON ${S[esquema]}.${tabela} TO dspd_api_apontamento`);
  }
  out.push(`GRANT INSERT ON ${S.bm}.stg_webhook_evento TO dspd_webhook`,
    `GRANT SELECT (webhook_sk, payload_sha256) ON ${S.bm}.stg_webhook_evento TO dspd_webhook`);
  out.push(`GRANT SELECT, INSERT ON ${S.ac}.ctl_automacao TO dspd_automacao`);
  return out;
}
