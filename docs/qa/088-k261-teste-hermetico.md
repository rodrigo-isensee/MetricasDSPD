---
tipo: qa
contrato: 1
pedido: 088-forge-0455
branch: fix/k261-teste-hermetico
commit: 0c16aeb52601a49cf7404bb5bfb65a3cec37492b
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 1
data: 2026-11-10
---
# QA: K-261, teste hermético de ref-sync-apontamento-entrada (BUG-088-QA1)

## Achados
- A1 (recomendado) server/tests/ref-sync-apontamento-entrada.test.ts:14 · tirar `--import SEM_ENV` do preludio padrão do filho sobrevive (7/7 verdes): o teste novo usa preludio próprio, então não guarda o padrão que o caso "sem configuração" usa. Afirmar o isolamento pelo `rodar` padrão.

## Escopo
Diff 129fc3d5..0c16aeb5: um arquivo de teste (+26/-3). Sem código de produção, contrato nem interface; sem `CA-n` novo. Obrigação: o caso "sem configuração" não depende do `.env` da máquina (A1 do QA do 088). Suíte completa: fica com o CI do PR (check-run `bateria` do mesmo sha); `pnpm run pronto` não foi rodado por ordem do brief.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Caso "sem configuração" independe do `.env` | "sem configuração: só a categoria com o nome da variável" + "o módulo de isolamento ignora um .env de mentira que define PG_REF_URL" | `.env` com `PG_REF_URL` presente (o de mentira é do próprio teste, em pasta temporária) | passa; o de mentira prova o módulo (sem ele lê, com ele ignora) |

## Execução
`pnpm --dir server exec vitest run tests/ref-sync-apontamento-entrada.test.ts --maxWorkers=2`, da worktree: 1 arquivo, 7 de 7 passam (25 s). Nenhum `.env` real foi aberto; o `.env` falso só existe na pasta temporária do teste.

## Mutação (restaurada, árvore limpa)
- M1: preludio padrão sem `--import SEM_ENV`: 7/7 passam. Sobrevive (A1). Na máquina sem `.env` com `PG_REF_URL` o caso "sem configuração" passa igual; o guarda real do padrão só aparece onde o `.env` existe.
- M2: conteúdo do módulo de isolamento trocado por vazio: o teste novo cai (`Expected "undefined"`, `Received "postgres://x:y@127.0.0.1:1/db"`). Pega.

## Bugs
- Baixo: o isolamento do caminho padrão do `rodar` não tem guarda própria (A1). Vira cartão no quadro (`R-QA`); não bloqueia, pois o módulo e o controle estão provados e o caso correto passa.

## Vermelho antes do verde
Não executado `forge-testes --vermelho`: pedido de teste hermético sem regra nova de produção; a prova de falha é M2 acima.
