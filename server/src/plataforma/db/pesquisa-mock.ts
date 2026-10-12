import { CONFIG_PADRAO, gerarPesquisaMock } from '@metricas-dspd/mock';
import type { FontePesquisa, LeituraPesquisa } from '../../modulos/metricas/fonte-pesquisa.js';

let memo: LeituraPesquisa | undefined;

/** Fonte mock: função pura da config padrão (semente e hoje), gerada uma vez por processo. Dados fictícios. */
export const fontePesquisaMock: FontePesquisa = {
  ler: () => Promise.resolve((memo ??= { versao: 'mock', base: gerarPesquisaMock(CONFIG_PADRAO) })),
};
