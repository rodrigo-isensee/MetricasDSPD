export { RegistroConsumidores, type Consumidor, type EventoOutbox } from './consumidores.js';
export {
  MAX_TENTATIVAS, RETENCAO_DIAS, backoffMs, processarOutbox, publicarEvento,
  type EventoNovo, type OpcoesProcessar, type ResultadoProcessar,
} from './outbox.js';
export {
  CATALOGO_EVENTOS, EXEMPLOS_EVENTOS, conferirFonte, fonteDoTipo, TIPO_COLETA_CONCLUIDA, TIPO_EVENTO_WEBHOOK, validarPayload, type CatalogoEventos,
} from './catalogo.js';
