/**
 * Invólucro fino do Worker (ADR 0021): `onmessage` → núcleo → `postMessage`. Todo o cálculo está em `nucleoMock.ts`.
 * Carregado por `new Worker(new URL('./nucleoMock.worker.ts', import.meta.url), { type: 'module' })`, nunca por blob.
 */
import { tratarPedido, type EstadoWorker } from './nucleoMock'
import type { Pedido } from './protocolo'

const estado: EstadoWorker = {}

self.onmessage = (e: MessageEvent<Pedido>) => {
  const { id } = e.data
  void tratarPedido(estado, e.data).then((resposta) => {
    try {
      self.postMessage(resposta)
    } catch (erro) {
      // Resposta que não atravessa o clone (DataCloneError): sem isto o pedido ficaria pendente para sempre (ADR 0021 §2).
      const e = erro instanceof Error ? erro : new Error(String(erro))
      self.postMessage({ id, ok: false, erro: { nome: e.name, mensagem: e.message } })
    }
  })
}
