/** Falha de uma chamada à API. Todo `ErroApi` vira o estado "erro" do cartão (o `useMetrica` trata por `isError`). */
export class ErroApi extends Error {
  /** Status HTTP; 0 quando a requisição nem chegou (rede, tempo esgotado). */
  readonly status: number
  /** `error.code` do corpo padrão, ou `REDE_INDISPONIVEL`, `TEMPO_ESGOTADO`, `RESPOSTA_INVALIDA`, `HTTP_<status>`. */
  readonly code: string
  /** `X-Request-Id`, para o suporte. */
  readonly requestId: string | null

  constructor(status: number, code: string, requestId: string | null = null) {
    super(`API ${status} ${code}`)
    this.name = 'ErroApi'
    this.status = status
    this.code = code
    this.requestId = requestId
  }
}
