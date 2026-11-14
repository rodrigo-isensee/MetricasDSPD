---
tipo: qa
contrato: 1
pedido: 102-forge-0460
branch: fix/k322-pre-push-nomes
commit: 95a65933fbee98afd00fba20b797934f01bb61bd
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-14
---
# QA do K-322: scripts do pre-push resistentes a nomes hostis (E1.27)

Escopo: `git diff 7cb86b26..95a65933` em `scripts/` (`lint-alterados.sh`, `typecheck-alterados.sh` e os dois testes). Acima de `95a65933` só há `.md` (devops, review). Sem `CA-n` (correção sem especificação de UX); as obrigações são as do cartão K-322 e do brief.

## Obrigação, teste, resultado
| Obrigação (K-322) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| nome começando por traço vai após `--` no eslint da raiz | `lint-alterados.test.sh` 3h (1º caso) | argumento tomado como opção | ok |
| idem no eslint do `server` | 3h (2º caso) | argumento tomado como opção | ok |
| nome com quebra de linha chega inteiro e erro de lint reprova | 3h (3º caso) | `\n` no nome | ok |
| nome com aspas / barra invertida chega inteiro | 3h (4º e 5º casos) | `"` e `\` no nome | ok |
| quebra de linha em `web/` casa com `web/*` no typecheck | `typecheck-alterados.test.sh` 8f | `\n` no nome | ok |
| acentuado não rastreado em `server/` roda o typecheck (A1 do K-319) | 8e | `ls-files --others` | ok |
| testes imunes a `GIT_DIR`/`GIT_INDEX_FILE`/`GIT_WORK_TREE` do hook | `unset` nos dois testes | ambiente de hook | ok |
| `pre-push.test.sh` segue verde | 2 casos | hook real | ok |

## Execução (código de `95a65933`, PATH do nvm literal)
- `lint-alterados.test.sh` 24 ok, 0 falha; `typecheck-alterados.test.sh` 19 ok, 0 falha; `pre-push.test.sh` 2 ok, rc=0.
- Suíte inteira: não rodei local; vale o check `bateria` do PR quando abrir. Escopo só de `scripts/` do pre-push: sem E2E nem acessibilidade.

## Vermelho antes do verde
Testes do head contra os scripts da base `7cb86b26` (cópia sob `node_modules/.cache`, removida depois; `git status` limpo):
```
lint-alterados (scripts da base): 9 FALHOU
  .ts/.tsx alterados vão ao eslint com cache
  server/ alterado vai ao eslint do pacote server
  arquivo acentuado na raiz chega inteiro ao eslint
  arquivo acentuado em server/ vai ao eslint do pacote server
  nome começando por traço vai logo após o --, no eslint da raiz
  nome começando por traço vai logo após o --, no eslint do server
  erro de lint em arquivo com quebra de linha no nome reprova
  erro de lint em arquivo com aspas no nome reprova
  erro de lint em arquivo com barra invertida no nome reprova
typecheck-alterados (scripts da base): 1 FALHOU
  nome com quebra de linha em web roda o typecheck do web
```
O 8e (acentuado não rastreado no typecheck) passa na base também: cobre mutante, não defeito (ver mutação).

## Mutação à mão (cópia, restaurada por `git show HEAD:`)
| Mutante | Falhas |
|---|---|
| lint: tirar `--` do eslint da raiz | 3, morreu |
| lint: tirar `--` do eslint do server | 3, morreu |
| lint: `read -r -d ''` para `read -r` | 14, morreu |
| lint: `sort -zu` para `sort -u` | 1, morreu |
| lint: tirar `-z` do `git diff` | 9, morreu |
| lint: tirar `-z` do `git ls-files` | 5, morreu |
| typecheck: `read -r -d ''` para `read -r` | 11, morreu |
| typecheck: `sort -zu` para `sort -u` | 1, morreu |
| typecheck: tirar `-z` do `git diff` | 3, morreu |
| typecheck: tirar `-z` do `git ls-files` | 2, morreu |

Nenhum sobrevivente; uma linha de guarda mudada no diff por mutante (`--` x2, `-d ''` x2, `sort -z` x2, `-z` diff x2, `-z` ls-files x2).

## Caso manual
Repositório descartável sob `node_modules/.cache` (removido depois), pnpm falso que ecoa os argumentos, `scripts/lint-alterados.sh` do head; commitados `-traco.ts`, `server/src/-st.ts` e `server/src/q<LF>l.ts`, mais `nao<LF>rastreado.tsx` não rastreado:
```
ARGS:[exec][eslint][--cache][--cache-location][node_modules/.cache/eslint][--no-warn-ignored][--][-traco.ts][$'nao\nrastreado.tsx']
ARGS:[--filter][@metricas-dspd/server][exec][eslint][--cache][--cache-location][node_modules/.cache/eslint][--][src/-st.ts][$'src/q\nl.ts']
```
Os nomes chegam inteiros, o traço vem após `--` e a quebra de linha não parte o nome.

## Achados

## Veredito
Segurança: parecer separado em `docs/security/102-k322-pre-push-nomes.md`, commitado por mim a pedido do brief; o QA não o julga. QA aprovado. Bugs: 0 críticos, 0 altos, 0 médios, 0 baixos.
