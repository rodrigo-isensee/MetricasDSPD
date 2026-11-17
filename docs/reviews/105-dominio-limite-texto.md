---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-dominio-limite-texto
commit: 6a4a95e56a3c31b72351ec7ff64722089c3b1f63
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: erro de texto acima do limite nomeia o campo e o tamanho (105, K-385, review E7.447)

Escopo: `12d2c849...6a4a95e5`, um commit, 3 arquivos (`dominio-businessmap.ts`, o teste e `CHANGELOG.md`); 27 linhas a mais e 1 a menos de código e teste, dentro do teto de 150 (M14).

**Veredito: aprovado**, com um recomendado.

## O que muda
- `dominio-businessmap.ts:175-181`: `descreverExcessoDeTexto` só atua em `too_big` de origem `string`; monta o caminho do esquema (índice vira `#`) e o tamanho lido do bruto, nunca o valor. `:195-196` acrescenta os excessos à mensagem de `ErroDominio` já existente; o limite, o esquema e o arquivo versionado não mudam.
- A leitura do bruto pelo `issue.path` é segura: um `too_big` de string só nasce num caminho que o esquema percorreu até uma string.
- Sem dado pessoal nem texto livre na mensagem: só nome de campo, tamanho e limite.

## Ferramentas (citadas, sem refazer)
- Sem PR para a branch: a suíte inteira fica para o CI do PR, e este parecer não afirma CI verde; vale o PQ do autor (`pnpm run pronto` rc=0).
- Rodei o teste do item no head: `npx vitest run tests/dominio-businessmap.test.ts` (em `server/`): 1 arquivo, 97 testes passaram. Os casos novos cobrem 3001 (recusa, sem o valor), 3000 (passa) e rótulo aninhado com 121.

## Checklist (leitura)
1. Faz o pedido, nem mais nem menos: sim.
2. Regras invioláveis: não tocadas; mensagem não vaza valor.
3-4. Legível; função pequena; a guarda `code/origin` tem os dois ramos exercidos pelos testes (mensagem com e sem excesso, pelos testes de recusa já existentes).
7. Borda no limite exato coberta.
9. Commit limpo, Conventional Commits.

## Achados
- A1 (recomendado) CHANGELOG.md:1 · entrada escrita direto no CHANGELOG; com o K-377 na develop, troque por `changelog.d/fix-105-dominio-limite-texto.md` antes do merge (praticas.md §9 aceita até a promoção).
