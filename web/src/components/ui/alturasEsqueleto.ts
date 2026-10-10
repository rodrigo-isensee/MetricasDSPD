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
