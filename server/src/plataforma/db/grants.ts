/** Privilégios por papel (data-model §8). Usuários são provisionados pela operação; aqui só GRANT. MySQL não aceita curinga de tabela, então o chamador passa a lista real. */
export type Tabelas = { bm: string[]; ac: string[]; core: string[] };

const g = (priv: string, schema: string, tabelas: string[], user: string): string[] =>
  tabelas.map((t) => `GRANT ${priv} ON ${schema}.${t} TO '${user}'@'%'`);
const com = (t: string[], ...prefixos: string[]): string[] => t.filter((n) => prefixos.some((p) => n.startsWith(p)));
const projecao = (n: string): boolean => /^(dim_card|dim_chamado|fato_bloqueio|fato_etapa_chamado)$/.test(n);

/** Tabelas ref_ do core com `vigente_ate` (0010). */
export const REF_COM_VIGENCIA_CORE = ['ref_calendario_turno', 'ref_calendario_aplicacao'];

export function gerarGrants(t: Tabelas): string[] {
  const out: string[] = [];
  for (const [schema, tabs] of [['dspd_bm', t.bm], ['dspd_ac', t.ac]] as const) {
    const imutaveis = tabs.filter((n) => /^(stg_|evt_|rec_|fato_transicao$)/.test(n) || /_versao$/.test(n));
    out.push(...g('SELECT, INSERT', schema, imutaveis, 'dspd_coletor'));
    out.push(...g('SELECT, INSERT, UPDATE, DELETE', schema, tabs.filter(projecao), 'dspd_coletor'));
    // ctl_: UPDATE só por coluna, só da execução (status/fim/marca-d'água/erro); demais ctl_ são append-only.
    const ctl = com(tabs, 'ctl_');
    out.push(...g('SELECT, INSERT', schema, ctl, 'dspd_coletor'));
    if (ctl.includes('ctl_coleta'))
      out.push(`GRANT UPDATE (status, finalizado_em, marca_dagua_ate, erro_resumo) ON ${schema}.ctl_coleta TO 'dspd_coletor'@'%'`);
    if (ctl.includes('ctl_coleta_contagem')) out.push(`GRANT UPDATE ON ${schema}.ctl_coleta_contagem TO 'dspd_coletor'@'%'`);
    out.push(...g('SELECT', schema, com(tabs, 'ref_'), 'dspd_coletor'));
    out.push(...g('SELECT', schema, [...tabs.filter(projecao), ...com(tabs, 'vw_', 'ref_', 'ctl_')], 'dspd_api'));
    const ref = com(tabs, 'ref_');
    out.push(...g('SELECT, INSERT', schema, ref, 'dspd_ref'));
    for (const n of ref) out.push(`GRANT UPDATE (vigente_ate) ON ${schema}.${n} TO 'dspd_ref'@'%'`);
  }
  const refCore = com(t.core, 'ref_');
  out.push(...g('SELECT', 'dspd_core', refCore, 'dspd_coletor'), ...g('SELECT', 'dspd_core', refCore, 'dspd_api'),
    ...g('SELECT', 'dspd_core', refCore, 'dspd_automacao'), ...g('SELECT, INSERT', 'dspd_core', refCore, 'dspd_ref'));
  for (const n of refCore.filter((x) => REF_COM_VIGENCIA_CORE.includes(x)))
    out.push(`GRANT UPDATE (vigente_ate) ON dspd_core.${n} TO 'dspd_ref'@'%'`);
  out.push(`GRANT INSERT ON dspd_bm.stg_webhook_evento TO 'dspd_webhook'@'%'`);
  out.push(`GRANT SELECT, INSERT ON dspd_ac.ctl_automacao TO 'dspd_automacao'@'%'`);
  return out;
}
