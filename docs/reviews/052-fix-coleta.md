---
tipo: review
contrato: 1
pedido: 052-fix-coleta
branch: feature/052-fix-coleta
commit: f763d6acffca29233c78966abe44882be10c1daa
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-01
---
# Review: 052-fix-coleta (correção da coleta real do BusinessMap, E2.83, K-182)

**Veredito (E2.85): aprovado** em `f763d6a`. A correção ataca as duas causas do 400 da carga do dono de 2026-11-01, preserva o fluxo dos responsáveis da ADR 0020 (4b e 4c) e não muda o recorte Q-2b e Q-2c. Dois recomendados, nenhum bloqueante.

## O que li
`git diff origin/develop..f763d6a` (base `55301e0`): `coleta.ts`, `http.ts`, o servidor falso `businessmap-coleta-duble.ts`, `coleta-businessmap.test.ts`, `http.test.ts`, `transicoes-businessmap.test.ts` e a seção 4.2 de `docs/integracao/businessmap-api-configuracao.md`. Para o contexto, li `extrairResponsaveis` em `allow-list.ts:177-188`, o `card()` dos testes e `BUSINESSMAP_LIMITE_POR_MINUTO` em `config.ts:63`.

## Foco pedido

**`co_owner_ids` de `fields` para `expand`.** `CAMPOS_PEDIDO_CARDS` mantém `owner_user_id` e tira `co_owner_ids` (`coleta.ts:31`); `EXPAND_COLETA` passa a ter `co_owner_ids` (`coleta.ts:36`). A allow-list do cliente (`EXPAND_CARDS`, `http.ts:45`) cresce só esse valor, com repetição de até 5 itens; `watcher_ids` e `/cards/5` com `expand` seguem recusados (`http.test.ts:170-171`). O fluxo 4b e 4c não muda: `extrairResponsaveis` lê as duas chaves do card como antes, e o teste novo (`coleta-businessmap.test.ts:397-415`) prova que os co-responsáveis chegam a `responsaveis` e ao `GET /users`, e que nenhum payload do staging traz `co_owner_ids` nem `owner_user_id`. Correto.

**`filtroDeData` com hora UTC.** `filtroDeData` só acrescenta `T00:00:00Z` ao dia (`coleta.ts:107`) e é aplicado no ponto único do filtro da carga inicial (`coleta.ts:257`). `inicio_carga` continua gravado como dia em `parametros`, então a comparação da retomada não muda e a carga do dono que falhou retoma do mesmo início (teste da retomada, `coleta-businessmap.test.ts:152-154`). O recorte é o mesmo: `active` sem filtro de data e `archived` e `discarded` a partir da meia-noite UTC do dia de início, pela data de arquivamento ou descarte (Q-2b, Q-2c). O incremental segue com `iso()`, que já tinha hora.

**Servidor falso que recusa os formatos inválidos.** `consultaValida` (`businessmap-coleta-duble.ts:53-58`) recusa com 400 e a mensagem da API real todo `fields` ou `expand` fora dos enums da OpenAPI v2 e todo filtro de data sem hora, e roda em todo `GET /cards` do servidor falso. Daí toda a suíte da coleta, incremental incluído, passa a exercitar a forma aceita. O falso é tão estrito quanto o defeito pede: a consulta antiga cai nos dois motivos, cada um isolado (`coleta-businessmap.test.ts:417-422`), e `expandir` tira `co_owner_ids` do card quando o `expand` não o pede, como a API. Sem isso, o teste dos responsáveis ficaria verde com o pedido errado (item 12 do checklist).

**Limite de requisições.** `BUSINESSMAP_LIMITE_POR_MINUTO` tem padrão 25 e máximo 25 (`config.ts:63`), abaixo dos 30 por minuto do dono. Sem mudança.

**Teto de linhas (decisão M14).** `git diff --numstat --no-renames origin/develop...f763d6a`, sem o `.md`: **153 linhas** (132 a mais e 21 a menos), 3 acima do teto. Um comportamento só: a consulta de `/cards` que a API real aceita, nas duas causas do mesmo 400. Aceito a exceção: dividir atrasaria a carga do dono por 3 linhas de teste. O PR da E2.87 leva `teto: excedido, 153 linhas, correção do 400 da coleta real (co_owner_ids por expand e filtro de data com hora), um comportamento`.

## Checklist (leitura)
Faz o que a E2.83 pede, sem mais. Respeita as ADRs 0015, 0020 e 0022 e as regras invioláveis: só GET, nada de pessoa no staging, nada misturado com o Acelerato. Nomes e comentários claros, sem código morto. Os testes cobrem as duas causas, a regressão e o fluxo dos responsáveis. Commit único, Conventional Commits em português.

## Outros pareceres e ferramentas (citados, não refeitos)
- Segurança aprovada em `f763d6a` (`docs/security/052-fix-coleta.md`, E2.84, `b06909d`).
- Relatório da E2.83: suíte unitária do server verde (1074 testes); os testes .pg ficam para o QA (E2.86).
- O `praticas.md` não tem regra "decidida por: `<comando>`": nenhuma saída de ferramenta a citar.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/allow-list.ts:183 · A forma de `co_owner_ids` com `expand` saiu da OpenAPI, sem leitura real. Se vier como objeto, `add` descarta calado e o card fica só com o dono. Na carga do dono, contar cards com mais de um responsável.
- A2 (recomendado) server/src/plataforma/http.ts:45 · A regex aceita até 5 valores com repetição (`co_owner_ids` 5 vezes passa). Inofensivo, só GET e lista fechada; um `Set` sem repetição deixaria a regra mais clara.
