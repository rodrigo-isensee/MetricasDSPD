import type { Fonte } from '../config.js';
import { fonteDoTipo } from './catalogo.js';

export type EventoOutbox = { eventoId: string; fonte: Fonte; tipo: string; payload: unknown; tentativas: number };
export type Consumidor = (e: EventoOutbox) => Promise<void>;

/**
 * Consumidores por (fonte, tipo). O poller roda uma fonte por vez e só enxerga os dela, então um consumidor
 * de `businessmap` nunca recebe evento de `acelerato`; o registro recusa o cruzamento já no cadastro.
 */
export class RegistroConsumidores {
  readonly #mapa = new Map<string, Consumidor>();

  registrar(fonte: Fonte, tipo: string, consumidor: Consumidor): this {
    const dona = fonteDoTipo(tipo);
    if (dona !== undefined && dona !== fonte) throw new Error(`Evento ${tipo} pertence a ${dona}, não a ${fonte}`);
    const chave = `${fonte}|${tipo}`;
    if (this.#mapa.has(chave)) throw new Error(`Consumidor duplicado: ${chave}`);
    this.#mapa.set(chave, consumidor);
    return this;
  }

  /** Tipos com consumidor para a fonte: o poller só reserva estes. */
  tipos(fonte: Fonte): string[] {
    const pre = `${fonte}|`;
    return [...this.#mapa.keys()].filter((k) => k.startsWith(pre)).map((k) => k.slice(pre.length));
  }

  obter(fonte: Fonte, tipo: string): Consumidor | undefined {
    return this.#mapa.get(`${fonte}|${tipo}`);
  }
}
