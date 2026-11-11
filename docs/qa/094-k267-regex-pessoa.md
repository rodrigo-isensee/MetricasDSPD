---
tipo: qa
contrato: 1
pedido: 094-lote-testes-e-guia
branch: fix/k267-regex-pessoa
commit: 914480843f9988b10bdceb18d38fac248f6839a5
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: regex de pessoa do S6 ampliada (094, E3.3, K-267)

Links: review `docs/reviews/094-k267-regex-pessoa.md` (aprovado), base develop 18701297.

## Veredito
**Aprovado.** Diff `18701297..91448084`: só `server/tests/painel-real-f6.test.ts` (+19 -1) e o parecer de review; nada de produção mudou. O HEAD da branch (b653e6d4) só soma documentação do review sobre o código testado.

## Execução
- `npx vitest run tests/painel-real-f6.test.ts --maxWorkers=2` (R-TETO): 1 arquivo, 39 testes passaram, 0 pulados.
- S6 sobre as respostas reais (BLOQUEADOS, O1, O2, O5, O19) com a regex nova: verde (`-t S6`: 3 passaram).
- S6b: afirma cada um dos 22 termos novos, um por vez, numa resposta simulada aninhada, exigindo que só a chave plantada seja pega; afirma que `esquema`, `esquemaVersao` e `requemado` não são pegos; que os termos antigos seguem pegos; e que `bloqueados`, `bloqueadoHaDiasUteis`, `bloqueioMotivo`, `motivo` e `cardId` não são pegos.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| K-267: regex pega "bloqueado por", "quem", "comentário", "observação" (e user_id, motivo_texto) | S6b | cada termo isolado; variações de separador e caixa | passou |
| "quem" só como palavra inteira (A1 do review) | S6b | `esquema`, `esquemaVersao`, `requemado` | passou |
| Regex nova não gera falso positivo nas respostas reais | S6 | chaves reais das 5 rotas | passou |

## Mutação no código alterado
Mutação: tirar `|user[ _-]?id` de `PESSOA_BASE` (sed, linha 339). Resultado: S6b falhou (`AssertionError: user_id: expected [] to deeply equal [ 'user_id' ]`; 1 falhou, 38 passaram). Arquivo restaurado por `git checkout` e árvore limpa antes do commit. Mutante morto.

Vermelho antes do verde: o teste S6b é novo e o código de produção não muda (a regex vive no próprio teste); a prova de que ele falha sem o termo é a mutação acima.

## Achados
