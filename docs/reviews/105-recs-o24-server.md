---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-recs-o24-server
commit: a806f3f0ecd4489831f8cbfa416f62cd5f2c54c0
parecer: aprovado
revisor: tech-lead
data: 2026-11-15
---

# Code review: recomendados A1 e A2 do O24 no servidor (E7.48)

## O que foi conferido
- Diff `origin/develop...a806f3f0`: 1 commit, 4 arquivos (`coleta.ts`, `tags.ts`, `classe-servico-etiquetas.test.ts`, `CHANGELOG.md`), 59 adições e 6 remoções, dentro da orientação de 150 linhas (M14).
- **A1, guarda `rotulo.length <= 120` (`allow-list.ts:110`).** O teste novo cobre a borda: 120 caracteres passa, 121 não, e 500 espaços antes de "Padrão" fica sem classe, mesmo quando a forma normalizada seria uma classe. Mutante rodado: sem a guarda, o teste A1 falha (1 de 23).
- **A2, aviso do teto.** `lerMapaDeTagsDeClasse` recebe `aoAtingirTeto` opcional. O aviso leva só `{ lidas, declaradas }`, números, sem rótulo e sem dado de pessoa. Sem ouvinte, nada muda no caminho sem teto: a condição `total > TETO_PAGINAS_TAGS` só dispara acima de 50, e o teste do teto exato (50) confirma que não avisa. O `TETO_PAGINAS_TAGS` foi só exportado, com o mesmo valor.
- **Coleta (`coleta.ts`).** `registrarContagem(..., 'tags_teto_paginas', ...)` grava só contagens (`lidos` = páginas lidas, `falhas` = páginas sem ler). O teste da coleta prova `estado: sucesso` e `estado.falhas` vazio, então o status não muda, e que o `MARCADOR` não aparece nas contagens. O registro fica dentro do `try`, e o `catch` só captura `ErroBusinessMap`: falha de banco no registro sobe, como as demais.
- **Mutante do teto.** Trocando a condição por `total > 999`, falham 2 testes (o do aviso na leitura e o da coleta). O teste mata o mutante sem a guarda.
- **Execução.** Teste do arquivo no head: 23 de 23 verdes. CI do head `a806f3f0` (`gh run list --branch fix/105-recs-o24-server`): `completed: success`. Suíte inteira não rerrodada, vale o CI.
- Segurança (item 5): nenhum rótulo, nome ou e-mail entra no aviso, na contagem ou em log; só GET segue valendo.

## Achados

## Sondas
- S1 · remover `rotulo.length <= 120` · espera: teste A1 falha · obtido: 1 falha em 23
- S2 · trocar `total > TETO_PAGINAS_TAGS` por `total > 999` · espera: testes do aviso falham · obtido: 2 falhas em 23
