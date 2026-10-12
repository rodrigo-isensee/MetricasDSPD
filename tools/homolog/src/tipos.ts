/** Resultado de um comando externo. */
export interface ResultadoExec {
  codigo: number
  saida: string
}

export interface OpcoesExec {
  env?: Record<string, string>
  cwd?: string
}

/** Dependências de efeito colateral, injetadas para que a lógica seja testável sem Docker nem rede. */
export interface Dependencias {
  /** Executa um comando; nunca lança por código de saída diferente de zero. */
  exec: (comando: string, args: string[], opcoes?: OpcoesExec) => Promise<ResultadoExec>
  /** Lê um arquivo de texto; devolve `undefined` se não existir. */
  lerArquivo: (caminho: string) => string | undefined
  /** GET HTTP; devolve o status ou `undefined` se a conexão falhar. */
  obterStatus: (url: string) => Promise<number | undefined>
  espera: (ms: number) => Promise<void>
  log: (linha: string) => void
}
