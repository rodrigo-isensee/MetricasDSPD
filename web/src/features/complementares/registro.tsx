import type { ComponentType } from 'react'
import type { FiltrosFluxo, FiltrosSustentacao } from '@metricas-dspd/contratos'
import { CartaoO11, CartaoO13, CartaoO14, CartaoO16, CartaoO5, CartaoO6, CartaoO8 } from './fluxo'
import {
  CartaoO19,
  CartaoO20,
  CartaoO21,
  CartaoO22,
  CartaoO24,
  CartaoO25,
  CartaoO26,
} from './operacionais'
import { CartaoE6, CartaoE7, CartaoE8, CartaoE9 } from './estrategicas'
import { CartaoT10, CartaoT11, CartaoT12, CartaoT13, CartaoT14 } from './taticas'
import { CartaoE4, CartaoE5, CartaoT6, CartaoT8 } from './previsao'
import { CartaoO17, CartaoS10, CartaoS11, CartaoS12, CartaoS8, CartaoS9 } from './sustentacao'

/** Cartões complementares de fluxo (BusinessMap) por id de cartão; o catálogo único decide em que painel e seção. */
const FLUXO: Record<string, ComponentType<{ filtros: FiltrosFluxo }>> = {
  o5: CartaoO5,
  o6: CartaoO6,
  o8: CartaoO8,
  o11: CartaoO11,
  o13: CartaoO13,
  o14: CartaoO14,
  o16: CartaoO16,
  o19: CartaoO19,
  o20: CartaoO20,
  o21: CartaoO21,
  o22: CartaoO22,
  o24: CartaoO24,
  o25: CartaoO25,
  o26: CartaoO26,
  t6: CartaoT6,
  t10: CartaoT10,
  t11: CartaoT11,
  t12: CartaoT12,
  t13: CartaoT13,
  t14: CartaoT14,
  t8: CartaoT8,
  e4: CartaoE4,
  e5: CartaoE5,
  e6: CartaoE6,
  e7: CartaoE7,
  e8: CartaoE8,
  e9: CartaoE9,
}

const SUSTENTACAO: Record<string, ComponentType<{ filtros: FiltrosSustentacao }>> = {
  o17: CartaoO17,
  s8: CartaoS8,
  s9: CartaoS9,
  s10: CartaoS10,
  s11: CartaoS11,
  s12: CartaoS12,
}

export function cartaoDeFluxo(id: string, filtros: FiltrosFluxo) {
  const C = FLUXO[id] as ComponentType<{ filtros: FiltrosFluxo }>
  return <C key={id} filtros={filtros} />
}

export function cartaoDeSustentacao(id: string, filtros: FiltrosSustentacao) {
  const C = SUSTENTACAO[id] as ComponentType<{ filtros: FiltrosSustentacao }>
  return <C key={id} filtros={filtros} />
}
