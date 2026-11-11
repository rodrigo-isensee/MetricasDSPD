---
tipo: qa
contrato: 1
pedido: 096-criterios-apontamento-env
branch: fix/k271-criterios-robustez
commit: 567634140ff377ac20e017ca68bd1f9e7be9df37
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: robustez da entrada criterios-apontamento (096, E2.3, K-271)

Links: pedido `docs/pedidos/096-criterios-apontamento-env.md`, segurança `docs/security/096-criterios-apontamento-env.md` (A1, A2), base develop 00758ca1.

## Veredito
**Aprovado.** Diff `00758ca1..56763414`: `server/src/entradas/criterios-apontamento.ts` e `server/tests/criterios-apontamento-entrada.test.ts`. Nenhum bug.

## Execução
- `npx vitest run tests/criterios-apontamento-entrada.test.ts --maxWorkers=2` (R-TETO): 1 arquivo, 8 testes passaram, 0 pulados. A suíte inteira é do check-run `bateria` do CI do PR; aqui só os testes afetados.
- Hermético: o filho recebe só PATH e TMPDIR, `cwd` em pasta temporária, `loadEnvFile` trocado por módulo de teste; o banco é um socket local falso e o segredo é falso (`segredo-de-teste`). Nenhum `.env` real aberto e nenhuma base real tocada.
- Falha do banco: stderr casa `^bm:criterios-apontamento falhou: (conexão|outro)\n$`, sem pilha, sem `127.0.0.1` (host/porta), sem `migrador` (usuário) e sem `segredo-de-teste`. Sem `.env`: só `configuração: PG_MIGRADOR_URL` (nome, nunca valor).
- Data inválida (`2026-13-40`, `2026-02-30`, `abc`) e argumento a mais: código 2 e `uso: bm:criterios-apontamento [AAAA-MM-DD]`.
- Ramo EACCES: código 2 e `falha ao ler o .env (EACCES)`, só o código do erro.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Segurança A1: erro do banco só pela categoria | 2º e 8º testes: sem `.env` e com `.env` de teste | pilha, host, porta, usuário, senha fora da saída | passou |
| Segurança A2: data por `dataCivilValida` | `it.each` de 3 datas | data com formato certo e dia impossível; texto livre | passou |
| Segurança A2: quantidade de argumentos | teste do argumento a mais | argumento além do limite | passou |
| Review A2: uso com o nome do script | asserção de uso nos testes 4 a 7 (recusa) | texto do uso | passou |
| Review A3: ramo do `.env` que não é ENOENT | teste EACCES | erro de leitura que não é arquivo ausente | passou |
| Obrigação herdada do K-270 (carregador do `.env` da raiz) | testes 1 e 8 | caminho da raiz | passou |

## Mutação no código alterado
- Mutação: trocar `categoriaDoErro(e)` por `(e as Error).stack` na mensagem de falha (volta a imprimir o texto cru do erro). Resultado: 2 falharam, 6 passaram (`expected 'bm:criterios-apontamento falhou: Erro…' to contain 'bm:criterios-apontamento falhou: conf…'` e o casamento `(conexão|outro)`; a saída trazia `Error: Connection terminated unexpectedly`). Mutante morto. Arquivo restaurado por `git checkout`; `git status` limpo antes do commit.

## Achados
