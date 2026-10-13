# FA-005 - Estado de erro do cartão não expõe o código do erro (`data-*`) nem o `requestId`
- Severidade: baixa (testabilidade e suporte)
- Responsável sugerido: react-frontend
- Ambiente: feature/front-via-api, SPA `VITE_FONTE=api`

## Passos para reproduzir
Em `/operacional?cadencia=semanal`, forçar 400, 500, 503 ou resposta fora do schema em `/api/v1/metricas/O4` (`page.route`, cenários FA5-10 a FA5-14).

## Resultado esperado
`data-erro-codigo` (`REDE_INDISPONIVEL`, `RESPOSTA_INVALIDA`, `HTTP_<status>` ou `error.code`) e `data-request-id` no `estado-erro-*`, para os E2E distinguirem as causas e o suporte achar o log.

## Resultado obtido
Todos os erros viram o mesmo cartão, sem atributo; os E2E só provam "erro no cartão". A causa `RESPOSTA_INVALIDA` só é verificável pelo `console.error` ("Resposta fora do contrato").

## Evidência
`e2e/tests-api/api.spec.ts` FA5-10 a FA5-14 (passam, sem poder distinguir a causa).
