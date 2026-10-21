import type { Dominio, MetricaId } from '@metricas-dspd/contratos'

/** Opções que atravessam a fronteira do Worker: só número e string (ADR 0021, seção 2). */
export interface OpcoesNucleo {
  semente?: number
  /** Data de corte ISO com fuso (ex.: 2026-10-09T18:00:00-03:00). */
  hoje?: string
}

/** Métodos do núcleo que o RPC aceita, com os argumentos de cada um (objetos JSON simples). */
export interface ArgsPorMetodo {
  iniciar: [opcoes: OpcoesNucleo]
  obter: [id: MetricaId, filtros: unknown]
  opcoesFiltro: [dominio: Dominio]
  criterios: []
  dataReferencia: []
  estadoColeta: [dominio: Dominio]
  historicoColetas: [dominio: Dominio, pagina: number]
  latencia: []
}

export type Metodo = keyof ArgsPorMetodo

export type Pedido = {
  [M in Metodo]: { id: number; metodo: M; args: ArgsPorMetodo[M] }
}[Metodo]

export type Resposta =
  | { id: number; ok: true; valor: unknown }
  | { id: number; ok: false; erro: { nome: string; mensagem: string } }
