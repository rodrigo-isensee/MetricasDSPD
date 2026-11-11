---
tipo: review
contrato: 1
pedido: 094-lote-testes-e-guia
branch: fix/k267-regex-pessoa
commit: 914480843f9988b10bdceb18d38fac248f6839a5
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: regex de pessoa do S6 ampliada (094, E3.2, K-267)

## Achados
- A1 (recomendado) server/tests/painel-real-f6.test.ts:341 · resolvido em 91448084: `QUEM` casa "quem" só como palavra inteira ou `Quem` em camelCase; "esquema", "esquemaVersao" e "requemado" passam (S3), e o S6b afirma isso.
- A2 (recomendado) server/tests/painel-real-f6.test.ts:339 · resolvido em 91448084: `user[ _-]?id` e `motivo[ _-]?texto` entraram em `PESSOA_BASE`; `user_id`, `userId`, `USER_ID`, `motivo_texto` e `motivoTexto` dão true (S4), e o S6b prova cada forma.
- A3 (recomendado) server/tests/painel-real-f6.test.ts:341 · a âncora de A1 deixou de pegar `QUEM`/`QUEM_BLOQUEOU` (maiúsculas) e `quembloqueou` (tudo junto, minúsculo), que 9f4ecf99 pegava (S5); chaves das rotas são camelCase, então sem gatilho hoje. Sugestão: aceitar `QUEM` na primeira alternativa.

## Sondas
- S1 · `PESSOA.test('esquema')` em 9f4ecf99 · espera: false · obtido: true (base de A1)
- S2 · `PESSOA.test('user_id')` e `PESSOA.test('userId')` em 9f4ecf99 · espera: true · obtido: false (base de A2)
- S3 · `PESSOA.test` de `esquema`, `esquemaVersao`, `requemado` em 91448084 · espera: false · obtido: false
- S4 · `PESSOA.test` de `user_id`, `userId`, `USER_ID`, `motivo_texto`, `motivoTexto` em 91448084 · espera: true · obtido: true
- S5 · `PESSOA.test` de `QUEM`, `QUEM_BLOQUEOU`, `quembloqueou`, `porquem` em 91448084 · espera: true · obtido: false (base de A3)

## Parecer
Aprovado. Delta lido: `git diff aa4f287d 91448084`, só `server/tests/painel-real-f6.test.ts`; nada de produção mudou.

- **A1 e A2 resolvidos:** `PESSOA` virou um objeto com `test` que combina `PESSOA_BASE` (com flag `i`) e `QUEM` (sem flag, para separar o `Quem` do camelCase); as três chamadas do arquivo usam só `.test`, então a troca de tipo não quebra nada.
- **Sem afrouxar:** todos os termos de antes do K-267 (`responsavel`, `usuarioKey`, `assignee`, `email`, `ranking` e os demais) seguem em `PESSOA_BASE` sem mudança, e "bloqueado por", "comentário" e "observação" também. A única perda é a de A3, nas formas de "quem" fora de camelCase, e é recomendada.
- **S6 real verde:** `npx vitest run tests/painel-real-f6.test.ts --maxWorkers=2` na worktree: 1 arquivo, 39 testes passaram, nenhum pulado; o S6 roda a regex nova sobre as respostas de BLOQUEADOS, O1, O2, O5 e O19 sem achar chave de pessoa.
- Commit único da volta, Conventional Commits em português, escopo correto.
