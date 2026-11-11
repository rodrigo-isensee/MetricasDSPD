---
tipo: review
contrato: 1
pedido: 096-criterios-apontamento-env
branch: fix/k271-criterios-robustez
commit: 567634140ff377ac20e017ca68bd1f9e7be9df37
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: robustez da entrada criterios-apontamento (096, E2.2, K-271)

## Achados
- A1 (recomendado) server/src/entradas/criterios-apontamento.ts:33 · sem `.env` a saída deixou de ser `Configuração inválida (variáveis: PG_MIGRADOR_URL)` e virou `bm:criterios-apontamento falhou: configuração: PG_MIGRADOR_URL`. O teste declara a troca, mas o corpo do commit não. Citar a troca no corpo do PR (E2.4).

## Sondas

## Parecer
Aprovado. Diff lido: `00758ca1..56763414` (2 arquivos, +41 −11: a entrada e o teste dela). Os achados A2 e A3 do review do K-270 e A1 e A2 da segurança foram fechados.

- **Erro só pela categoria, como no `ref-sync-apontamento`:** o `try/catch/finally` agora é o mesmo de `ref-sync-apontamento.ts:31-43`: `carregarConfigMigrar` e `criarPool` ficam dentro do `try`, o `catch` escreve `bm:criterios-apontamento falhou: ${categoriaDoErro(e)}` e põe `exitCode = 1`, sem `process.exit`, e assim o `finally` roda. A diferença do vizinho (o ramo `ErroDicionario`) não se aplica aqui. `categoriaDoErro` devolve só `configuração: <nomes>`, `autenticação`, `conexão` ou `outro`: nunca a mensagem, a URL nem a pilha.
- **O pool fecha no `finally`:** `let pool … | undefined` e `await pool?.end()`. Com a configuração recusada, o pool não existe e o `finally` não lança `TypeError`. Com o pool criado, ele fecha no sucesso e na falha.
- **Data e argumentos:** `dataCivilValida` (a mesma do `ref-sync-apontamento` e do calendário) recusa dia impossível (`2026-02-30`, `2026-13-40`) e texto livre. `process.argv.length > 3` recusa argumento a mais. A guarda roda antes da configuração e do pool, então não há o que fechar no `process.exit(2)`. A data padrão (hoje no fuso de Brasília) não mudou.
- **Testes sem vazar segredo:** o filho continua hermético (`ambienteFilho`, `cwd` temporário, `loadEnvFile` trocado). Num banco falso que derruba a conexão, o caso com `.env` afirma o stderr inteiro por `^…falhou: (conexão|outro)\n$` e confere que `127.0.0.1`, `migrador` e `segredo-de-teste` não aparecem. O ramo não ENOENT agora tem caso (EACCES, código 2, só o código do erro). Cada guarda nova ou mudada tem teste de comportamento do ramo de falha: data inválida (3 casos), argumento a mais e falha do banco. A mutação do QA (`categoriaDoErro` trocada pela pilha) morre.
- **Mensagem de falta do `.env`:** a mudança é intencional e mais segura, porque passa pelo mesmo formato das outras entradas. Nenhum roteiro nem o CHANGELOG cita o texto antigo para esta entrada (`grep` na branch: só o parecer histórico do QA do K-270). Falta declarar a troca no PR (A1).
- **Verificação local:** `npx vitest run --project unit --maxWorkers=2 tests/criterios-apontamento-entrada.test.ts` em d39c5624 (o código é igual ao de 56763414; o commit seguinte só traz o parecer do QA): 1 arquivo, 8 testes passaram. A suíte completa fica com o CI do PR.
- **Pareceres:** QA aprovado em d39c5624 (`docs/qa/096-k271-criterios-robustez.md`). Não o refaço.
- **Commit:** um só, Conventional Commits em português, escopo `apontamento`, com `Cartão: K-271`. O diff tem 52 linhas, dentro da orientação de 150.
