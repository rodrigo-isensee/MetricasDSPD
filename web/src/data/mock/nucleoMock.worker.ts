/**
 * Invólucro fino do Worker (ADR 0021): `onmessage` → núcleo → `postMessage`. Todo o cálculo está em `nucleoMock.ts`.
 * Carregado por `new Worker(new URL('./nucleoMock.worker.ts', import.meta.url), { type: 'module' })`, nunca por blob.
 */
import { tratarPedido, type EstadoWorker } from './nucleoMock'
import type { Pedido, Resposta } from './protocolo'

const estado: EstadoWorker = {}

self.onmessage = (e: MessageEvent<Pedido>) => {
  void tratarPedido(estado, e.data).then((resposta) => {
    try {
      self.postMessage(resposta)
    } catch (erro) {
      // Resposta não clonável: sem isto o pedido do cliente ficaria pendente para sempre.
      const r: Resposta = {
        id: resposta.id,
        ok: false,
        erro: {
          nome: erro instanceof Error || erro instanceof DOMException ? erro.name : 'Error',
          mensagem: `Falha ao responder do Worker do mock: ${erro instanceof Error || erro instanceof DOMException ? erro.message : String(erro)}`,
        },
      }
      self.postMessage(r)
    }
  })
}
