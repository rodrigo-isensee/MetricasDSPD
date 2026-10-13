# FA-003 - O10, O12 e S7 com contagens diferentes do mock (complementos/extensões)
- Status: O10 e O12 corrigidos; S7 aberto (decisão de modelo de dados)
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

## Correção
O10 só divergia pelo que o seed não gravava (FA-002). O12: `data_acordada` é Data (briefing; coluna `date`) valendo até o fim do expediente do dia (P2), mas o gerador do mock sorteia um instante; a API só tem o dia. O `MockFonteMetricas` agora normaliza `data_acordada` para o fim do expediente do dia (mesma regra de `mockComoNoBanco`, já provada em `metricas.paridade.test.ts`); o gerador e os hashes da base não mudaram. S7 (`ajusteDePrioridade.justificados.k`: mock 44, API 0): a métrica conta chamados com `justificativa_ajuste` preenchida, mas o texto livre nunca vai ao banco (data-model §9, `lgpd.ts`), então a API não tem como contar. Não é defeito de seed nem de consulta: falta decidir se a projeção ganha uma coluna booleana derivada ("justificativa informada", sem o texto), o que exige migração, ajuste do coletor e do data-model. Pendente de decisão do usuário; sem alteração de regra no código.
