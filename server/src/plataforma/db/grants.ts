import { COLUNAS_PESSOA } from './lgpd.js';
import type { Esquemas } from './esquemas.js';

/** Colunas por tabela/view de cada schema, lidas do catálogo (a ordem é a do banco). */
export type Catalogo = { bm: Record<string, string[]>; ac: Record<string, string[]>; core: Record<string, string[]> };

export const PAPEIS = ['dspd_coletor', 'dspd_api', 'dspd_ref', 'dspd_webhook', 'dspd_automacao', 'dspd_pesquisa'] as const;

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
    dspd_webhook: [S.bm, S.core], dspd_automacao: [S.ac, S.core], dspd_pesquisa: [S.core],
  };
  for (const schema of [S.bm, S.ac, S.core]) {
    out.push(`REVOKE ALL ON SCHEMA ${schema} FROM PUBLIC, ${papeis}`, `REVOKE ALL ON ALL TABLES IN SCHEMA ${schema} FROM PUBLIC, ${papeis}`);
  }
  for (const papel of PAPEIS) out.push(`GRANT USAGE ON SCHEMA ${usage[papel].join(', ')} TO ${papel}`);

  const colunasApi = (chave: 'bm' | 'ac', tabela: string): string[] | null => {
    const todas = cat[chave][tabela]!;
    const permitidas = todas.filter((c) => !COLUNAS_PESSOA.includes(`${nomeLogico(chave)}.${tabela}.${c}`));
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
    g('SELECT', schema, COM(tabs, 'ref_'), 'dspd_coletor');
    // API: projeções, views, ref_ e ctl_; nunca stg_, evt_, *_versao. Tabela com coluna de pessoa: só as demais colunas.
    const paraApi = [...tabs.filter((n) => PROJECAO.test(n) || n === 'fato_transicao' || n === 'rec_transicao_par'), ...COM(tabs, 'vw_', 'ref_', 'ctl_')];
    for (const t of paraApi) {
      const cols = colunasApi(chave, t);
      out.push(cols ? `GRANT SELECT (${cols.join(', ')}) ON ${schema}.${t} TO dspd_api` : `GRANT SELECT ON ${schema}.${t} TO dspd_api`);
    }
    g('SELECT, INSERT', schema, COM(tabs, 'ref_'), 'dspd_ref');
    for (const n of COM(tabs, 'ref_').filter((x) => cat[chave][x]!.includes('vigente_ate')))
      out.push(`GRANT UPDATE (vigente_ate) ON ${schema}.${n} TO dspd_ref`);
  }
  const refCore = COM(Object.keys(cat.core), 'ref_');
  for (const papel of ['dspd_coletor', 'dspd_api', 'dspd_automacao']) g('SELECT', S.core, refCore, papel);
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
  out.push(`GRANT INSERT ON ${S.bm}.stg_webhook_evento TO dspd_webhook`,
    `GRANT SELECT (webhook_sk, payload_sha256) ON ${S.bm}.stg_webhook_evento TO dspd_webhook`);
  out.push(`GRANT SELECT, INSERT ON ${S.ac}.ctl_automacao TO dspd_automacao`);
  return out;
}
