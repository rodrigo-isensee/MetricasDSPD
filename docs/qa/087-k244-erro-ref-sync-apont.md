---
tipo: qa
contrato: 1
pedido: 087-paineis-dado-real-e-demo
branch: feature/087-k244-erro-ref-sync-apont
commit: b98021961ea5bff74e452a3aee831cdc7cc53939
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-10
---

# QA: K-244, categoria do erro em ref-sync-apontamento (E3.5)

Links: review `docs/reviews/087-k244-erro-ref-sync-apont.md` (aprovado, mesmo head), regra do CLAUDE.md (credenciais só em `.env`, nada de senha, host ou texto do driver na saída), achado A2 do review do pedido 081.

## Escopo
Diff `7a44f941...b9802196`: o `catch` de `server/src/entradas/ref-sync-apontamento.ts` passa a imprimir `categoriaDoErro(e)` no lugar da frase fixa; teste novo `server/tests/ref-sync-apontamento-entrada.test.ts` (subprocesso com ambiente limpo e servidor TCP falso). Sem especificação de UX nem contrato de API novos (correção técnica). Sem base real, sem `.env`. Fora: os demais ref-sync, que já usavam o mesmo padrão.

## Obrigações, testes e resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Uso: data inválida sai com código 2 e mensagem de uso | `data %s é recusada...` (`2026-02-30`, `2026-13-01`, `ontem`) | entrada inválida (dia inexistente, mês 13, texto) | passou |
| Sem configuração: só a categoria com o NOME da variável | `sem configuração: só a categoria...` (stderr exato `falhou: configuração: PG_REF_URL`) | vazio (variável ausente) | passou |
| Credencial recusada (SQLSTATE 28P01): só `autenticação`, sem senha, usuário nem texto do driver | `credencial recusada pelo banco...` | segredo na URL e texto do driver não vazam | passou |
| Conexão recusada: só `conexão`, sem senha nem endereço | `conexão recusada...` | porta sem escuta; endereço e `ECONNREFUSED` não vazam | passou |

## Execução
- `server/tests/ref-sync-apontamento-entrada.test.ts` com `--maxWorkers=2`: 1 arquivo, 6 testes, 6 passaram (10 s).
- Saídas conferidas pelas asserções de `stderr` exato: `bm:ref-sync-apontamento falhou: configuração: PG_REF_URL`, `... falhou: autenticação`, `... falhou: conexão`; `stdout` vazio nos três. A senha-marcador `SENHA-MARCADOR-087`, `password` e `127.0.0.1` não aparecem em nenhuma.
- Vermelho antes do verde por mutação (volta da frase fixa): troquei `categoriaDoErro(e)` por `'configuração ou banco inválidos'` na entrada, rodei o mesmo arquivo: `Tests 3 failed | 3 passed (6)`; caem os três testes de falha (configuração, autenticação, conexão); os de uso seguem verdes (não dependem do ramo). O arquivo foi restaurado por `git checkout` antes do commit (árvore limpa, só o parecer entra).
- A suíte inteira roda no CI do PR (check-run `bateria` do mesmo sha, a citar pelo tech-lead no PR); aqui só o arquivo afetado.

## Observações (sem bloqueio)
- Os testes sobem processo `node --import tsx` (uns 2 s cada); o teto de 60 s do subprocesso cobre carga alta sem espera fixa.
- Classe `outro` (erro inesperado) não tem teste neste arquivo; ela é coberta no teste de `categoriaDoErro` (unidade, pedido 081) e não é obrigação deste cartão.

## Achados
Nenhum.
