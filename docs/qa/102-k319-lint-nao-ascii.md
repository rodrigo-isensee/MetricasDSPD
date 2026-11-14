---
tipo: qa
contrato: 1
pedido: 102-forge-0460
branch: fix/k319-lint-nao-ascii
commit: c316e6900edbf93765f49c4b594493613813d2d9
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 1
data: 2026-11-13
---
# QA do K-319: lint e typecheck dos alterados com nome não ASCII e ramo sem merge-base (E1.17)

Escopo: `git diff acf421e8..c316e690` (`scripts/lint-alterados.sh`, `scripts/typecheck-alterados.sh` e os dois testes). Acima de `c316e690` só há `.md` (devops, review, segurança). Não há `CA-n` (correção sem especificação de UX); as obrigações são as do cartão K-319 (K317-001 do QA do K-317) e do brief.

## Obrigação, teste, resultado
| Obrigação (K-319) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| arquivo acentuado na raiz chega inteiro ao eslint (sem octal do git) | `lint-alterados.test.sh` 3f (1º e 3º casos) | nome não ASCII | ok |
| arquivo acentuado em `server/` casa com `server/*` e vai ao eslint do pacote | 3f (2º caso); `typecheck-alterados.test.sh` 8c | prefixo `server/` com nome não ASCII | ok |
| arquivo acentuado novo não rastreado chega inteiro (lint) | 3f (4º caso) | `ls-files --others` | ok |
| arquivo acentuado novo não rastreado (typecheck) | nenhum | `ls-files --others` | sem teste (A1) |
| branch órfã sem merge-base cai no lint/typecheck inteiro e avisa | 3g, 8d (2 casos cada) | ramo `git merge-base` falho | ok |
| repositório dos testes sob `node_modules/.cache` | `mktemp -d` sob `node_modules/.cache` | n/a | ok |
| `pre-push.test.sh` segue verde | 2 casos | hook real | ok |

## Execução (código de `c316e690`, `node` do nvm no PATH)
- `lint-alterados.test.sh` 19/19, `typecheck-alterados.test.sh` 17/17, `pre-push.test.sh` 2/2, todos rc=0.
- Suíte inteira: não rodei local; a branch ainda não tem PR e o remoto não é alcançável do meu sandbox, então não há check `bateria` do sha para citar. Vale o CI do PR quando abrir. Escopo só de `scripts/` de pre-push: sem E2E nem acessibilidade.

## Vermelho antes do verde
`forge-testes` é do Forge; forma do projeto: testes do head contra os scripts da base `acf421e8` (restaurados depois por `git show HEAD:`; `git status` sem diferença nos scripts):
```
lint-alterados (scripts da base):      FALHOU arquivo acentuado na raiz chega inteiro ao eslint
                                       FALHOU arquivo acentuado em server/ vai ao eslint do pacote server
                                       FALHOU nenhum caminho em octal chega ao eslint
                                       FALHOU arquivo acentuado novo não rastreado também chega inteiro   (rc=1)
typecheck-alterados (scripts da base): FALHOU arquivo acentuado em server/ roda o typecheck do server       (rc=1)
```
Os casos da branch órfã (3g, 8d) passam na base também: o ramo já existia e o K-319 só o cobre com teste, sem mudança de código. Não são vermelho; os mutantes de ramo abaixo provam que pegam.

## Mutação à mão nas listagens (restaurada por `git show HEAD:`)
| Mutante | Resultado |
|---|---|
| lint: tirar `-c core.quotePath=false` do `git diff` | morreu (4 falhas) |
| lint: tirar do `git ls-files` | morreu (1 falha) |
| typecheck: tirar do `git diff` | morreu (1 falha) |
| typecheck: tirar do `git ls-files` | **sobreviveu** (0 falhas), ver A1 |
| lint: trocar a mensagem de "sem merge-base" | morreu (1) |
| lint: ramo órfão com `exit 0` em vez do lint inteiro | morreu (1) |
| typecheck: ramo órfão com `exit 0` | morreu (1) |

## Caso manual
Repositório descartável em `node_modules/.cache/qa-k319-manual` (removido depois), pnpm falso que ecoa os argumentos, arquivo `server/src/ação_ç.ts` commitado numa branch:
- head: `PNPM[--filter @metricas-dspd/server exec eslint ... src/ação_ç.ts]` e `PNPM[--filter @metricas-dspd/server run typecheck]`.
- base (script de `acf421e8`): `PNPM[exec eslint ... --no-warn-ignored "server/src/a\303\247\303\243o_\303\247.ts"]`: caiu no eslint da raiz, com o caminho em octal. O defeito original reproduz na base e está corrigido no head.

## Achados
- A1 (recomendado) scripts/typecheck-alterados.test.sh:149 · o `ls-files` do typecheck sem `core.quotePath=false` sobrevive: o 8c commita o arquivo e nenhum caso usa acentuado não rastreado no typecheck. Falta o espelho do 3f (`ñovo.ts` em `server/src`, não rastreado). Cartão baixo, sem bloquear.

## Veredito
Segurança: parecer separado em `docs/security/102-k319-lint-nao-ascii.md`, commitado por mim a pedido do brief; o QA não o julga. QA aprovado. Bugs: 0 críticos, 0 altos, 0 médios, 1 baixo (A1, vira cartão no quadro).
