import { gerarBaseMock, gerarExtensoesMock } from '@metricas-dspd/mock';
import type { ExtensoesMetricas } from '@metricas-dspd/metricas';

let memo: ExtensoesMetricas | undefined;

/**
 * Extensões das métricas complementares na fonte mock: derivadas da mesma base padrão que o seed grava, e geradas
 * uma vez por processo, só quando uma métrica complementar é pedida. Dados fictícios, sem pessoa.
 */
export const extensoesMock = (): ExtensoesMetricas => (memo ??= gerarExtensoesMock(gerarBaseMock()));
