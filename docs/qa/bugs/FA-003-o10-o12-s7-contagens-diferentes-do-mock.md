# FA-003 - O10, O12 e S7 com contagens diferentes do mock (complementos/extensões)
- Severidade: média (número diferente na tela entre mock e API; causa ainda não isolada)
- Responsável sugerido: node-backend (investigar `extensoesMock` do servidor x `gerarExtensoesMock(base)` e a leitura de colunas do banco)
- Ambiente: feature/front-via-api, `DADOS_FONTE=mock`

## Passos para reproduzir
`bash scripts/com-api-mock.sh pnpm --dir web run test:paridade` (sob `flock`), testes O10, O12 e S7, filtro padrão 12s.

## Resultado esperado
Contagens iguais às do mock.

## Resultado obtido
O10: `base.complemento.n` mock=133, API=169 (`acimaDe180.cliente` 25 x 41). O12: `base.complemento.n` mock=34, API=26. S7: `ajusteDePrioridade.justificados.k` mock=44, API=0. Hipótese (não confirmada): o complemento (natureza, ajuste de prioridade) é gerado por `extensoesMock` no servidor com chaves diferentes das do mock do front, ou o banco não guarda o campo usado. O3, O5 e outras complementares com filtro padrão não divergem por esse motivo.

## Evidência
Linhas `$.base.complemento.n: mock=133 api=169` etc. na saída do teste de paridade.
