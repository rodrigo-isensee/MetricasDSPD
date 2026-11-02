export interface Faixa {
  left: number
  right: number
}

/**
 * Quanto rolar na horizontal para a célula ficar inteira entre as colunas fixas (pessoa à esquerda, total à direita).
 * Positivo rola para a direita. `0` quando a célula já está à vista. Só geometria: nenhum cálculo de métrica.
 */
export function deslocamentoParaVer(
  celula: Faixa,
  area: Faixa,
  larguraFixaEsquerda: number,
  larguraFixaDireita: number,
): number {
  const minimo = area.left + larguraFixaEsquerda
  const maximo = area.right - larguraFixaDireita
  if (celula.left < minimo) return celula.left - minimo
  if (celula.right > maximo) return celula.right - maximo
  return 0
}

/**
 * Rola a região do mapa até a célula focada sair de baixo das colunas fixas (WCAG 2.4.11). A primeira e a última
 * coluna da linha são as fixas; a região é o ancestral com `role="region"`.
 */
export function rolarCelulaParaVista(celula: HTMLElement): void {
  const regiao = celula.closest<HTMLElement>('[role="region"]')
  const linha = celula.parentElement
  if (!regiao || !linha) return
  // A célula é filha da linha, então a linha tem primeira e última coluna (as fixas).
  const largura = (el: Element | null) => (el as Element).getBoundingClientRect().width
  const d = deslocamentoParaVer(
    celula.getBoundingClientRect(),
    regiao.getBoundingClientRect(),
    largura(linha.firstElementChild),
    largura(linha.lastElementChild),
  )
  if (d !== 0) regiao.scrollLeft += d
}
