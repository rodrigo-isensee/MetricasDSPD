/**
 * Altura reservada do corpo de cada cartão enquanto carrega, medida no conteúdo pronto em desktop
 * (1350 px, linha do grid já esticada). Evita o salto de layout quando os dados chegam (ADR 0003 F2).
 * Cartão fora da lista usa `ALTURA_ESQUELETO_PADRAO`. Remedir se o desenho de um cartão mudar muito.
 */
export const ALTURAS_ESQUELETO: Readonly<Record<string, number>> = {
  O1: 746,
  O2: 1300,
  BLOQUEADOS: 746,
  T1: 751,
  T2: 751,
  T3: 998,
  T4: 998,
  T5: 919,
  T7: 2683,
  T9: 2683,
  E1: 632,
  E2: 1229,
  E3: 1229,
  S1: 1336,
  S2: 780,
  S3: 696,
  S4: 618,
  S5: 860,
  S6: 860,
  S7: 798,
}

/**
 * Mesma ideia, para coluna única (abaixo de `lg`, medido a 375 px): o conteúdo fica mais alto porque os
 * gráficos e as listas quebram em mais linhas e não há linha de grid esticada. K-050 (bug 008).
 */
export const ALTURAS_ESQUELETO_MOBILE: Readonly<Record<string, number>> = {
  O1: 944,
  O2: 2121,
  BLOQUEADOS: 556,
  O3: 1627,
  O4: 358,
  O7: 2626,
  O9: 1968,
  O10: 1422,
  O12: 728,
  O15: 942,
  O18: 828,
  T1: 1131,
  T2: 1015,
  T3: 762,
  T4: 1207,
  T5: 1251,
  T7: 3977,
  T9: 2793,
  E1: 1077,
  E2: 704,
  E3: 1339,
  S1: 2156,
  S2: 1251,
  S3: 1068,
  S4: 1197,
  S5: 1156,
  S6: 1102,
  S7: 1788,
}
