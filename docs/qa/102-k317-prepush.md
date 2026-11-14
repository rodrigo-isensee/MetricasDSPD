---
tipo: qa
contrato: 1
pedido: 102-forge-0460
branch: fix/k317-k309-prepush
commit: 23a8d56e40300954850020c39f69c27b6862623f
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 1
data: 2026-11-13
---
# QA do K-317: lint dos alterados com o server, árvore de trabalho e bit de execução (E1.12)

Escopo: `git diff 0c9cf759..23a8d56e` (`scripts/lint-alterados.sh`, `scripts/typecheck-alterados.sh`, os dois testes, `scripts/pre-push.test.sh` novo e a linha `test:trava`). Acima de `23a8d56e` só há dois `.md` (devops e review), sem código. O K-309 (hook do dono) fica fora. Não há `CA-n` (correção sem especificação de UX); as obrigações são as do cartão K-317 e do brief: server no lint, base contra a árvore de trabalho, bit de execução, teste do pre-push.

## Obrigação, teste, resultado
| Obrigação (K-317) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| `server/**` alterado vai ao eslint do pacote, com caminho relativo, e não ao da raiz | `lint-alterados.test.sh` 3b (3 casos) | roteamento por prefixo `server/` | ok |
| erro de lint em `server/` reprova (commitado e não commitado) | 3c, 3e | rc do eslint do pacote propagado | ok |
| raiz e server juntos: os dois rodam, erro de um reprova | 3d | dois eslints, soma de rc | ok |
| arquivo novo não rastreado entra na checagem (lint e typecheck) | 3e, `typecheck` 8b | `ls-files --others` | ok |
| árvore de trabalho entra (lint e typecheck) | 3e, 8b | diff contra o merge-base, não `base...HEAD` | ok |
| o hook real recusa o envio com erro no server e deixa passar sem erro | `pre-push.test.sh` (2 casos) | entrada padrão do git, mensagem de recusa | ok |
| bit de execução 100755 nos arquivos que faltavam | `git ls-files -s` | n/a | ok (`lint-alterados.sh`, `lint-alterados.test.sh`, `pre-push.test.sh` em 100755) |
| `pre-push.test.sh` roda no `test:trava` | `package.json` | n/a | ok |
| guarda "sem merge-base" cai no lint/typecheck inteiro | nenhum teste do ramo | branch órfã | sem teste (A1); sondado à mão, ok |

## Execução (código de `23a8d56e`, `node` do nvm no PATH, repositórios descartáveis sob `node_modules/.cache/qa`)
- `lint-alterados.test.sh` 13/13, `typecheck-alterados.test.sh` 14/14, `pre-push.test.sh` 2/2, todos rc=0.
- Suíte inteira: não rodei local; vale o check `bateria` do mesmo código no CI do PR (a review cita a CI do `3a98be19`, igual em código a `23a8d56e`: `rapida`, `testes`, `banco`, `build`, `openapi`, `seguranca`, `imagem`, `filtro` verdes). O pedido toca só `scripts/` de pre-push, sem fluxo de tela: sem E2E nem acessibilidade.

## Vermelho antes do verde
`forge-testes` é do Forge; aqui a forma do projeto: testes do head contra os scripts da base `0c9cf759`, numa cópia. Os 9 casos novos que provam o comportamento caem na base e passam no head:
```
lint-alterados:      FALHOU server/ alterado vai ao eslint do pacote server
                     FALHOU server/ alterado não vai ao eslint da raiz
                     FALHOU erro de lint em server/ alterado reprova
                     FALHOU raiz e server rodam os dois eslints e o erro da raiz reprova
                     FALHOU erro de lint não commitado em server/ reprova
                     FALHOU arquivo novo não rastreado com erro de lint reprova
typecheck-alterados: FALHOU mudança não commitada em web roda o typecheck do web
                     FALHOU arquivo novo não rastreado em server roda o typecheck do server
pre-push:            FALHOU erro de lint em server/ alterado recusa o envio
```
O caso "server/ limpo passa" e os pré-existentes passam nos dois; não são o vermelho.

## Mutação (à mão: `forge-mutante` é do Forge e o diff não toca `bin/`, `hooks/` nem `.githooks/`)
A review mediu 5 mutantes de `lint-alterados.sh` (4 mortos, o da guarda de merge-base vivo). Reproduzi o vivo: `... HEAD 2>/dev/null)" && false; then` em branch órfã com `origin/develop` dá `fatal: bad revision ''`, "lint pulado", rc=0, e os 13 casos seguem verdes. Os demais não repeti.

## Sondas
- S1 · branch órfã, script real · espera: lint inteiro · obtido: "sem merge-base com origin/develop; fallback para o lint inteiro", `pnpm run lint`, rc=0.
- S2 · nome com acento e espaço em server/src · espera: roteado ao server · obtido: git cita o nome com octais, o roteamento não casa, eslint falha "No files matching", rc=1 (falso vermelho, latente, anterior ao K-317, bug K317-001)

## A1 do review: bloqueia?
Para mim, não. A guarda está correta (S1), o ramo de falha só se alcança com histórico sem ancestral comum, e o efeito do defeito é "lint pulado" no pre-push, que a CI cobre com o `pnpm run lint` inteiro. Reproduzi o mutante vivo, então o buraco é real: recomendo (não bloqueia) o caso `git switch --orphan` em `lint-alterados.test.sh` e `typecheck-alterados.test.sh`, esperando `pnpm run lint` e `pnpm run typecheck`, em commit de teste do autor ou cartão.

## Achados
- A1 (recomendado) scripts/lint-alterados.sh:16 · guarda sem merge-base sem teste do ramo de falha (mutante `&& false` vive 13/13, rc=0 "lint pulado"); idem scripts/typecheck-alterados.sh:14. Caso com `git switch --orphan` esperando o lint/typecheck inteiro.
- A2 (recomendado) scripts/lint-alterados.sh:28 · nome não ASCII: o git cita com octais, o roteamento `server/*` não casa e o eslint recebe o nome com aspas (rc=1, falso vermelho). Usar `git -c core.quotepath=false` (bug K317-001, baixo, cartão).

## Bugs
- `docs/qa/bugs/K317-001-lint-alterados-nome-nao-ascii.md` (baixa; vira cartão sem aceite do usuário, `R-QA`).

## Conclusão
Aprovado no `23a8d56e`: 0 críticos, 0 altos, 0 médios, 1 baixo. Os critérios de prioridade alta passam; o CI do PR confirma a suíte inteira.
