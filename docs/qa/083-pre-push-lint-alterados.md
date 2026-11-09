---
tipo: qa
contrato: 1
pedido: 083-pre-push-lint-alterados
branch: feature/083-pre-push-lint
commit: e19c23b3674a660cad88150b218c7897a6d77d5a
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-09
---
# QA: 083-pre-push-lint-alterados

## Escopo
`scripts/lint-alterados.sh` (eslint só nos `.ts`/`.tsx` alterados contra `origin/develop`, com cache; pula sem nenhum; fallback para o lint inteiro sem `origin/develop`), `scripts/lint-alterados.test.sh`, a linha do `.githooks/pre-push` e o `test:trava`. Fora: typecheck, CI, suíte inteira (o diff não toca `server/`, `web/` nem `packages/`; nenhum código de produto mudou). Não há UX nem contrato de API; a obrigação vem da decisão do dono (opção A) e do brief E1.3.

## Execução
Cópia descartável (`git worktree add --detach` de e19c23b3 em `/tmp/claude-1000/qa-083/w`, `node_modules` por link; removida no fim). Commits de teste só nessa cópia; nada foi enviado ao GitHub.

| Obrigação | Cenário | Fronteira protegida | Resultado |
|---|---|---|---|
| Sem `.ts`/`.tsx` alterado pula | 1: HEAD igual à base | lista vazia | passou: "lint pulado", rc 0 |
| `.ts` com erro reprova | 2: `web/src/qa-erro.ts` com variável sem uso | erro de lint | passou: `no-unused-vars`, rc 1 |
| Mesmo arquivo corrigido passa | 3 | erro corrigido | passou: "eslint em 1 arquivo(s)", rc 0 |
| Só `.md` pula | 4: só `docs/qa-x.md` | arquivo não-ts | passou: "lint pulado", rc 0 |
| `.ts` removido não vai ao eslint | 5: remoção de `web/src/app/App.tsx` mais um `.ts` novo | `--diff-filter=d` | passou: "1 arquivo(s)" (o removido ficou fora) |
| CI segue com o lint inteiro | leitura de `.github/workflows/` | n/a | `ci.yml:34` e `homolog.yml:75` rodam `pnpm run lint` (`eslint .`); sem diff em `.github/` |
| Teste do próprio script | `bash scripts/lint-alterados.test.sh` | vazio, removido, sem base | 6 de 6 `ok` |

Nota do cenário 2: a primeira tentativa em `server/src/` passou sem erro porque `server/**` está em `ignores` do `eslint.config.js` (o `--no-warn-ignored` o cala); é o mesmo comportamento da CI, então não é defeito. Repeti em `web/src/`.

## Mutação à mão no script (rodando `lint-alterados.test.sh`)
| Mutante | Resultado |
|---|---|
| tirar `--diff-filter=d` | morreu: "FALHOU - .ts removido não vai ao eslint" |
| inverter o teste de lista vazia (`-eq 0` para `-ne 0`) | morreu: 4 falhas (só docs pula, só docs não chama pnpm, .ts/.tsx vão ao eslint, .ts removido) |

Vermelho antes do verde: o pedido é de melhoria no Forge-do-projeto sem teste de correção de regra de negócio; a prova de que o teste falha sem a implementação são os dois mutantes acima.

## Achados
- A1 (recomendado) scripts/lint-alterados.test.sh:1 · nenhum teste confere que `.githooks/pre-push` chama o script; trocar a linha 13 de volta para `pnpm run lint` não derruba teste algum
- A2 (recomendado) scripts/lint-alterados.sh:25 · só `.ts` em `server/**` (ignorado pelo eslint) imprime "eslint em N arquivo(s)" sem lintar nada; mensagem enganosa, igual à CI no resultado

## Veredito
Aprovado. Zero bugs; os dois achados são recomendações que não devolvem a entrega.
