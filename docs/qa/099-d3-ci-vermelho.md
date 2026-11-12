---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-d3-ci-vermelho
commit: b4c40051ad21f0b62fd2e38ce1f4def9c8fc6432
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---
# QA: correção da develop vermelha pelo merge do D3 (E3.22)

Base `develop` d9f32012. A correção é exatamente `git diff origin/develop origin/feature/099-d3-alvo-prioridade` (11 arquivos, +93 -29), aplicada na branch. O `git fetch` falhou no sandbox (403); as refs locais `origin/develop` (= Base-sha) e `origin/feature/099-d3-alvo-prioridade` foram as usadas.

## Conferência do diff (só hashes e prettier, sem lógica)
- `docs/qa/evidencias/hash-base-fase-a.json` e `.nota.md`: `hashBase` 68a67741 para de6a8953, `hashAcelerato` 0113e077 para 20541e9d; `hashBusinessMap` 4540bc56 intacto; nota de regravação com motivo (unidade dos prazos em `config.alvos`).
- `packages/mock/src/*.test.ts` (6 arquivos): só literais de hash (base 68a67741 para de6a8953; escala 0,2 824092e4 para 345c5682; `ac` 0113e077 para 20541e9d; `ac` escala 0,2 39b4b005 para 34151797), títulos e um comentário.
- `packages/metricas/src/acelerato/modelo.ts`, `s1.ts`, `acelerato.test.ts`: só quebra de linha do prettier; valores de `ALVOS_PADRAO` e argumentos de `classe(...)` idênticos.

## Obrigação e resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Hash da base mock bate com a evidência regravada | `e2e/scripts/hash-base-mock.mjs --comparar docs/qa/evidencias/hash-base-fase-a.json` (parte de hash do gate) | base determinística, semente 20261009 | OK: "base mock idêntica à linha de base" (de6a8953, 4540bc56, 20541e9d; 5792 cards, 6062 chamados) |
| Testes do mock com os hashes novos | `packages/mock` vitest run (TZ=UTC) | n/a | 14 arquivos, 258 de 258 |
| D3 intacto após o prettier | `packages/metricas` vitest `src/acelerato` | unidade corrido/útil por prazo | 17 de 17 |
| Formatação | `prettier --check` em `packages/mock/src` e `packages/metricas/src/acelerato` | n/a | limpo |

## Vermelho antes do verde
Na base (sem a correção), `packages/mock/src/tambem.test.ts`: `Expected: "0113e077"  Received: "20541e9d"`, 1 falhou, 4 passaram. Com a correção, passa (suíte do mock inteira verde acima).

## Limites
- O gate completo (`pnpm --filter e2e gate`, com tamanho do bundle) e a suíte inteira não rodaram local (ordem do dono: um teste por vez); a prova é o check-run `bateria` do CI do PR neste sha. O `lint-alterados.sh` pulou (rodou antes do commit, sem `.ts` alterado contra `origin/develop`); a CI roda o lint inteiro.
- Mutação: sem lógica nova; não aplicável.

## Achados
Nenhum.
