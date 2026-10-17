import { gerarBaseMock, gerarExtensaoTambemMock, gerarExtensoesMock } from '@metricas-dspd/mock';
import type { ExtensoesMetricas } from '@metricas-dspd/metricas';
import type { ExtensaoTambemBM } from '@metricas-dspd/metricas/businessmap';

let base: ReturnType<typeof gerarBaseMock> | undefined;
let memo: ExtensoesMetricas | undefined;
let memoTambem: ExtensaoTambemBM | undefined;

/** Base padrão do mock, a mesma que o seed grava; gerada uma vez por processo e só quando uma extensão é pedida. */
const baseMock = (): ReturnType<typeof gerarBaseMock> => (base ??= gerarBaseMock());

/**
 * Extensões das métricas complementares na fonte mock: derivadas da mesma base padrão que o seed grava, e geradas
 * uma vez por processo, só quando uma métrica complementar é pedida. Dados fictícios, sem pessoa.
 */
export const extensoesMock = (): ExtensoesMetricas => (memo ??= gerarExtensoesMock(baseMock()));

/**
 * Extensão do pedido 011 (entradas sazonais do T11 e os campos da fase 2: O22, O26, T13, E6, E8 e T14), só de mock e lazy como a anterior. Separada de propósito:
 * a montagem do contexto e as demais métricas não pagam por ela (ADR 0003, C1 e C2).
 */
export const extensaoTambemMock = (): ExtensaoTambemBM => (memoTambem ??= gerarExtensaoTambemMock(baseMock()));
