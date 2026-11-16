---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-o24-aviso-mapa-vazio
commit: 0610c5f442c4830006e2a8b6819306485ececce8
parecer: aprovado
revisor: tech-lead
data: 2026-11-15
---

# Code review: O24, aviso de mapa de etiquetas vazio (E7.53, fix/105-o24-aviso-mapa-vazio)

Escopo: `git diff 4ec9de5c..0610c5f4`, 1 commit, 4 arquivos: `allow-list.ts`, `coleta.ts`, `classe-servico-etiquetas.test.ts` e `CHANGELOG.md`. Tamanho: 40 linhas de código e teste, dentro do teto.

## Os pontos do brief

- **Sem rótulo nem dado de pessoa na contagem ou no log:** `coleta.ts:326-328` e `:361` gravam só inteiros (`lidos`, `falhas`) em `ctl_coleta_contagem`; `cardTemEtiqueta` (`allow-list.ts`) devolve booleano e não guarda `tag_ids` nem rótulo. O teste "mapa vazio" afirma que `Tema` não aparece nas contagens.
- **Regra de classe intacta:** `mapaDeTagsDeClasse` e `classesDasEtiquetas` não aparecem no diff; o teto de páginas segue como estava.
- **Aviso não muda o status:** `aviso_mapa_classe_vazio` usa `falhas: 1` na contagem (mesmo padrão de `tags_teto_paginas`), sem entrar em `x.falhas`; o teste confirma `estado: sucesso` e `estado.falhas` vazio.
- **Falha do `/tags`:** as contagens ficam dentro do `try` depois da leitura do mapa, e `cards_com_etiqueta` só sai com `mapaTags !== undefined` (`coleta.ts:361`); o teste com `/tags` 403 prova que nenhuma das duas é gravada.
- **Entregar contra os commits:** o item do brief (E7.53) tem o commit 0610c5f4; sem item pendente.

## CI do head

Run 43782011623: `testes` (inclui a cobertura de 100%), `banco`, `rapida`, `build`, `openapi`, `imagem`, `seguranca` e `filtro` verdes; `e2e` e `perf` pulados por regra do fluxo.

## Achados

- A1 (recomendado) server/src/modulos/businessmap/coleta.ts:227 · `cards_com_etiqueta` conta cada leitura do card, e um card lido em mais de um estado ou página entra mais de uma vez; é um indicador de diagnóstico, então não bloqueia, mas vale dizer "leituras" no texto do CHANGELOG se alguém passar a ler o número como cards distintos.
