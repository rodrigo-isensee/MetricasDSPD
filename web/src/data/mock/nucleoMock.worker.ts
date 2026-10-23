/**
 * Invólucro fino do Worker (ADR 0021): `onmessage` → núcleo → `postMessage`. Todo o cálculo está em `nucleoMock.ts`.
 * Carregado por `new Worker(new URL('./nucleoMock.worker.ts', import.meta.url), { type: 'module' })`, nunca por blob.
 */
import { tratarPedido, type EstadoWorker } from './nucleoMock'
import type { Pedido } from './protocolo'

const estado: EstadoWorker = {}

self.onmessage = (e: MessageEvent<Pedido>) => {
  void tratarPedido(estado, e.data).then((resposta) => self.postMessage(resposta))
}
