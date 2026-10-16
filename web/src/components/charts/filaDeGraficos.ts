import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

/**
 * Fila de montagem dos gráficos (K-102). Quando os dados de vários cartões chegam juntos (visão Semanal),
 * montar todos os gráficos Recharts no mesmo commit vira uma tarefa longa (200 ms ou mais, TBT do
 * Lighthouse). A fila libera um gráfico por tarefa do navegador: o cartão, a frase de leitura e a tabela
 * aparecem na hora, e cada gráfico entra na sua vez dentro da caixa de altura já reservada (sem salto de layout).
 *
 * Atenção: o flushSync tem prioridade síncrona e interrompe transições em andamento (cada gráfico da fila
 * faz o render da transição recomeçar). Quem adotar startTransition/useTransition/useDeferredValue precisa
 * reavaliar esta fila.
 */
type Pedido = () => void
const fila: Pedido[] = []
let rodando = false
let imediata = false

/** Só para testes de gráfico isolado: sem fila, o gráfico monta no primeiro commit. */
export const definirFilaImediata = (v: boolean): void => {
  imediata = v
}

// Uma mensagem por tarefa: não sofre o piso de 1 s dos temporizadores em aba em segundo plano.
const canal = new MessageChannel()
const pendentes: Array<() => void> = []
canal.port1.onmessage = () => pendentes.shift()?.()
function proximaTarefa(f: () => void): void {
  pendentes.push(f)
  canal.port2.postMessage(null)
}

function servir() {
  const pedido = fila.shift()
  if (!pedido) {
    rodando = false
    return
  }
  // flushSync: o commit deste gráfico acontece nesta tarefa, e o próximo só na seguinte.
  // try/finally: uma exceção no pedido não pode parar a fila do app inteiro.
  try {
    flushSync(pedido)
  } finally {
    proximaTarefa(servir)
  }
}

function entrar(pedido: Pedido): () => void {
  fila.push(pedido)
  if (!rodando) {
    rodando = true
    // O primeiro turno espera o paint do que já está na tela (cartão, texto), depois segue gráfico a gráfico.
    requestAnimationFrame(() => proximaTarefa(servir))
  }
  return () => {
    const i = fila.indexOf(pedido)
    if (i >= 0) fila.splice(i, 1)
  }
}

/** `true` quando é a vez deste gráfico montar. Fica `true` para sempre depois de liberado. */
export function useVezDoGrafico(): boolean {
  const [liberado, setLiberado] = useState(imediata)
  useEffect(() => {
    if (liberado) return undefined
    return entrar(() => setLiberado(true))
  }, [liberado])
  return liberado
}
