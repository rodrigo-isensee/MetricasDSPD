---
tipo: review
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l2b-marcos
commit: 54d49872f824aee266062ded66c358c97e84d295
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---
# Code review: 075 L2b, marcos de saída e fornecedor no derivador (K-204)

## Parecer

Aprovado. O lote faz o que a seção "Lote 2b" de `docs/analises/075-plano.md` pede, nem mais nem menos: fecha o bloqueio aberto por marco de saída, aplica `fim = início` quando o marco é anterior ao início e lê o fornecedor da versão que abriu pela `colunasDeLista` exportada (não copiada). Os três achados são recomendados e não devolvem.

## O que foi lido (diff `e89ae3f3...54d49872`, 1 commit)

- `server/src/modulos/businessmap/bloqueios.ts`:
  - Marcos (P-075-5): arquivado nativo (`archivedAt` texto com data válida), exclusão detectada (`excluidoDetectado`), coluna de papel `entrega` e coluna de descarte (`marcos`). Com bloqueio aberto, o marco fecha no instante do arquivamento ou no `coletado_em` da versão.
  - P-075-9: `Math.max(marco, início)` dá `fim = início` (duração 0) quando o marco vem antes; teste com `archivedAt` anterior.
  - TL-A5: depois do fechamento por marco, a primeira versão ativa e bloqueada abre um bloqueio novo, com `id_origem` dessa versão; teste confere os dois `id_origem` diferentes e o motivo do novo início.
  - A9: card no marco e bloqueado não abre bloqueio (`!noMarco` no ramo de abertura); teste com versões seguidas no marco e com a primeira versão já na coluna de entrega: zero evento.
  - P-075-4: o fornecedor sai de `colunasDeLista({ custom_fields })` só no `inicio`; o `fim` grava `null`. Teste com fornecedor presente, ausente e trocado depois (vale o do início). CA-075-12: `fornecedor` e `label` fora de `custom_fields` e campo fora do mapa não chegam; valor vazio vira `null` com nota.
- `normalizador.ts`: só o `export` de `colunasDeLista`; o normalizador segue usando a mesma função (linha 230).
- Recomendados do 2a aplicados: A1 (`_marcos` e `_mapaCampos` agora usados, sem `void`); A2 (`is_blocked` ausente ou fora de true/false/1/0 não abre nem fecha, nota `is_blocked_invalido`, com teste). O A1 do QA (o `fim` não grava o motivo da versão que desbloqueia) também, com teste.
- Formato decidido pelo autor: `marcos: { entrega?, descarte? }` com conjuntos de ids de coluna em texto decimal e, na versão, `archivedAt`, `excluidoDetectado` e `customFields` opcionais. Aceito como está para o 4b; a condição de leitura do 4b está no A1 abaixo.
- Dois testes antigos mudaram de expectativa, ambos pela troca de `motivoDe` por `codigoDe` (inteiro decimal sem zeros à esquerda), usada também na coluna para casar com os conjuntos de `marcos`:
  - CA-075-2: `'0034'` agora vira `'34'` (antes `'0034'`). Aceito: o código normalizado é o que o domínio `motivo_bloqueio` do lote 3 vai casar, e o valor segue restrito a `^\d{1,10}$`.
  - Coluna do evento: `'abc'` agora vira `null` (antes `'abc'`). Aceito: id de coluna do BusinessMap é inteiro, e texto livre não chega ao evento.
- Regras invioláveis: só BusinessMap, nada individual, nenhum dado de pessoa na saída; nenhuma migração nem contrato, como o plano diz.
- Segurança (controles 5 e 9, SEG-A6): parecer do security-engineer na mesma branch, depois deste; não refaço.

## Ferramentas

- CI do push na ponta `54d49872`: run 42336163595, `completed`/`success`, `headSha` igual ao revisado.
- Teste do arquivo tocado (D-5): `vitest run tests/bloqueios.test.ts --maxWorkers=2` em `server`: 1 arquivo, 26 testes, todos verdes.
- Teto M14: `git diff --numstat --no-renames` soma 97 linhas de código e teste (`bloqueios.ts` 46, `normalizador.ts` 2, teste 49). Abaixo de 150, um comportamento só.

## Achados

- A1 (recomendado) server/src/modulos/businessmap/bloqueios.ts:45 · `archivedAt` só vale como texto; um `Date` vindo do pg é ignorado e o card arquivado não fecha o bloqueio. No 4b, a leitura entrega texto ISO ou o derivador aceita `Date`, com teste do caso.
- A2 (recomendado) server/src/modulos/businessmap/bloqueios.ts:50 · `coletadoEm` sem data válida no ramo de marco faz `new Date(NaN).toISOString()` lançar `RangeError` e derruba a derivação do lote; no 4b, garantir `coletado_em` ISO na leitura ou anotar e pular a versão.
- A3 (recomendado) server/src/modulos/businessmap/bloqueios.ts:58 · `colunasDeLista` percorre todos os campos do mapa e anota `campo_fora_do_dominio` também de campos que não são o fornecedor; a nota do bloqueio conta ruído de outros campos. Aceitável; se incomodar no 4b, filtrar o mapa ao fornecedor.
