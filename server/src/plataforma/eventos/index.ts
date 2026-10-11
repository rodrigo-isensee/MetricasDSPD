export { RegistroConsumidores, type Consumidor, type EventoOutbox } from './consumidores.js';
export {
  MAX_TENTATIVAS, RETENCAO_DIAS, backoffMs, processarOutbox, publicarEvento,
  type EventoNovo, type OpcoesProcessar, type ResultadoProcessar,
} from './outbox.js';
