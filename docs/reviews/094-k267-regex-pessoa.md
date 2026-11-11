---
tipo: review
contrato: 1
pedido: 094-lote-testes-e-guia
branch: fix/k267-regex-pessoa
commit: 9f4ecf9923e4aa567e26649346fa5f8f18d63db3
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: regex de pessoa do S6 ampliada (094, E3.2, K-267)

## Achados
- A1 (recomendado) server/tests/painel-real-f6.test.ts:339 · `quem` sem âncora casa dentro de "esquema" (sonda: `esquema` e `esquemaVersao` dão true); hoje nenhuma chave das 5 rotas tem isso (S6 verde), mas uma chave futura assim reprova por falso positivo. Sugestão: `(^|[^a-z])quem|quem[A-Z_]`.
- A2 (recomendado) server/tests/painel-real-f6.test.ts:339 · a regex não pega `userId`/`user_id` (campo de pessoa da origem, 075 T2) nem `motivo_texto` (075 T3); fora do escopo do K-267, que pediu os quatro termos; vale cartão próprio para fechar a lista do 075.

## Sondas
- S1 · `PESSOA.test('esquema')` · espera: false · obtido: true (base de A1, não bloqueia)
- S2 · `PESSOA.test('user_id')` e `PESSOA.test('userId')` · espera: true · obtido: false (base de A2, lacuna anterior ao diff)

## Parecer
Aprovado. Diff lido: `18701297..9f4ecf99`, só `server/tests/painel-real-f6.test.ts` (+13 −1); nada de produção mudou (`server/src`, `web/`, `packages/` fora do diff).

- **O que pegava continua pegando:** a regex só ganhou alternativas no fim; os termos antigos ficaram intactos, e o S6b afirma `responsavel`, `usuarioKey`, `assignee`, `email` e `ranking`.
- **Termos novos:** "bloqueado por" (com `_`, `-`, espaço ou junto; feminino e plural; `blocked by`), "quem", "comentário"/"comment" e "observação"/"observation", que são os nomes de T2/T3 do `docs/security/075-modelo-ameacas.md` (linhas 49-50) e o "bloqueado por" do CA-075-11. O S6b prova cada termo, um por vez, numa resposta simulada aninhada pela mesma função `chaves` do S6, e exige que só a chave plantada seja pega.
- **Chaves legítimas não pegas:** o S6b afirma `bloqueados`, `bloqueadoHaDiasUteis`, `bloqueioMotivo`, `motivo` e `cardId` como falsos; a prova forte é o próprio S6, que roda a regex nova sobre as respostas reais de BLOQUEADOS, O1, O2, O5 e O19 e segue verde.
- **Execução:** `npx vitest run tests/painel-real-f6.test.ts --maxWorkers=2` na worktree: 1 arquivo, 39 testes passaram, nenhum pulado.
- Achados A1 e A2 são recomendados (sem defeito provado nas respostas de hoje) e não devolvem. Commit único, Conventional Commits em português, escopo correto.
