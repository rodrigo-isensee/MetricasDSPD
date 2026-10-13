import type { pesquisa } from '@metricas-dspd/metricas';

/** Base da pesquisa e a versão de carga dela (muda a cada carga nova; entra na chave do cache). */
export type LeituraPesquisa = { versao: string; base: pesquisa.BasePesquisa };

/**
 * Fonte da pesquisa de percepção (PV1): só contagens agregadas por trimestre, área, pergunta e faixa, e os critérios
 * (`ref_versao_criterio` com `dominio = 'pesquisa'`). Implementações: o mock (`plataforma/db/pesquisa-mock.ts`) e, no B4, a leitura das tabelas
 * `pesq_*` / `ref_pesq_*` (a `dspd_api` não lê coluna de pessoa; nenhuma existe nessas tabelas). Cada uma cuida do próprio cache.
 */
export interface FontePesquisa {
  ler(): Promise<LeituraPesquisa>;
}
