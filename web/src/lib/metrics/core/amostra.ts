import type { Dominio, Intervalo } from '@/contracts/comum'

/**
 * Amostra de valores de UMA classe de UM domínio. O tipo carrega o domínio e a classe para que
 * nenhuma função aceite misturar BusinessMap com Acelerato, nem story com frente ou projeto.
 * Não existe função de concatenação de amostras.
 * Os construtores públicos ficam em `businessmap/amostra.ts` e `acelerato/amostra.ts`.
 */
export interface Amostra<D extends Dominio = Dominio, G extends string = string> {
  readonly dominio: D
  readonly classe: G
  readonly valores: readonly number[]
  readonly janela: Intervalo
}

/** Uso interno dos construtores por domínio. Não importar fora de `businessmap/` e `acelerato/`. */
export function criarAmostraInterna<D extends Dominio, G extends string>(
  dominio: D,
  classe: G,
  valores: readonly number[],
  janela: Intervalo,
): Amostra<D, G> {
  return Object.freeze({ dominio, classe, valores: Object.freeze([...valores]), janela })
}
