---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-causa-raiz-bm-coleta
commit: 28b25cf22c3fdb5e0cd5d6e16fa6ae8be9ff26f8
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: coleta da causa raiz do bug do fluxo (BusinessMap, field 48), E7.86

Branch `feature/105-causa-raiz-bm-coleta` contra `develop` (base `ba45668f`), commit `28b25cf2` (9 arquivos; código e teste: 99 linhas, abaixo do teto de 150; um comportamento: a coleta do field 48 até `dim_card.causa_raiz`).

## Parecer
**Reprovado.** O desenho está certo (a fronteira só deixa passar o código do domínio fechado e o histórico não é sobrescrito), mas o CI do head `28b25cf2` está vermelho em dois jobs, por defeitos do diff: A4 e A5. Os recomendados A1 a A3 são de operação e devem estar resolvidos antes da carga no dado real (A1 e A2 no corpo do PR antes do merge).

## Achados
- A4 (bloqueante) server/src/modulos/businessmap/allow-list.ts:91 · Ramo `values[]` com item escalar sem teste: o job `testes` (run 43841142798) falha na cobertura global de 100% (linhas 99.97%, ramos 99.9%). Teste o item escalar, ou tire o ramo se a API não manda essa forma.
- A5 (bloqueante) server/tests/dominio-businessmap.pg.test.ts:59 · O teste pg do arquivo real ainda espera `campos: 0` e `afeta` `['O15']` (linha 69); o job `banco` falha. Atualize para 1 campo, as 13 linhas do field 48 e `afeta` vazio, e afirme que `dominiosDeLinhas` devolve o field 48 com os 12 rótulos.
- A1 (recomendado) server/src/modulos/businessmap/dominio-businessmap.ts:254 · O domínio casa pelo rótulo; se a API mandar só `values[{value_id}]`, todo bug vira `desconhecido`. Rode o `bm:spike` num bug com o field 48 antes da recoleta e registre a forma no PR.
- A2 (recomendado) CHANGELOG.md:12 · O plano de carga é uma frase só, e a `referencia` do arquivo (businessmap-dominio.json:7) aponta para arquivo fora do repositório. Escreva no PR os comandos exatos, com o modo de coleta que revisita os bugs antigos.
- A3 (recomendado) docs/architecture/fontes/businessmap-dominio.json:8 · Com `afeta` vazio, base que nunca sincronizou a versão da E7.5 grava a tabela de fases sem marcar o O15. No plano (A2), confira a versão da E7.5 em `ref_versao_criterio` antes do `ref-sync`.

## Detalhe dos achados
- A1: `dominiosDeLinhas` monta a chave pelo `rotulo` (texto da opção) e o arquivo só traz rótulos. Sem casamento, a coluna fica nula e a nota `campo_fora_do_dominio` conta: não corrompe nem afeta métrica (afeta vazio), mas a entrega não teria efeito. O teste de `value_id` (server/tests/allow-list.test.ts:95) usa um domínio com a chave `'12'` que o arquivo real nunca produz. Se vier só `value_id`, o arquivo troca para o que a API devolve (nova versão de critério), sem mudar código.
- A2: a coleta incremental só busca cards com `last_modified` depois da marca d'água (server/src/modulos/businessmap/coleta.ts:293); bug antigo sem alteração não ganha causa raiz no incremental, e o `bm:projetar` sozinho reprojeta o staging antigo, em que o field 48 foi descartado. Sequência sugerida: 1. forma do valor (A1); 2. conferência do A3; 3. `bm:ref-sync`; 4. `bm:coleta carga-inicial` (ou o modo que de fato revisita os bugs); 5. `bm:projetar`; 6. leitura da contagem de `campo_fora_do_dominio`. A `referencia` pode ser só o pedido e a etapa.
- A3: a versão de critério é gravada uma vez por hash do arquivo, append-only (server/src/modulos/businessmap/dominio-businessmap.ts:205-213); onde a versão da E7.5 já existe (main e homolog têm o arquivo com O15), a linha com O15 em `ref_versao_criterio_metrica` fica e nada se perde. O comentário em dominio-businessmap.ts:33 segue certo: a próxima troca da tabela de fases volta a pôr O15 no `afeta`.

## O que conferi
- Fronteira (`reduzirCamposCustomizados`, server/src/modulos/businessmap/allow-list.ts:109): só `value`, `values[].value_id` e `values[].value` são candidatos; a saída é só o código de `dominio.get`, ou `desconhecido`. Descrição de "Outros", `comment`, `text` e chaves extras nunca são lidas; o teste confere por `JSON.stringify` que o texto não aparece nem no `registroCard` inteiro. Campo fora do domínio (`field_id` sem lista) continua descartado.
- Lista positiva `TIPOS_SELECAO_UNICA = ['dropdown']`, com teste do field 48 com tipo de texto livre recusado. O parecer de segurança dessa constante é do `security-engineer` (rodada em paralelo); cito, não refaço.
- Histórico nunca sobrescrito: `causa_raiz` entra em `COLUNAS_LISTA`, que compõe `COLUNAS_VERSAO` e `COLUNAS_DIM` (server/src/modulos/businessmap/projetor.ts:272); a recoleta grava staging novo e versão nova em `dim_card_versao` com `ON CONFLICT DO NOTHING`; versões antigas ficam. A coluna já existia nas migrações 0005 e 0006, sem migração nova. `dim_card` é projeção refeita, como nas outras colunas.
- Valor fora da lista: `desconhecido` no staging vira coluna nula com a nota `campo_fora_do_dominio`, sem o valor (teste no normalizador).
- Duas causas raiz separadas (decisão do dono): nenhuma métrica do fluxo lê `causa_raiz`; o O17 segue do Acelerato; nada cruza `dspd_bm` × `dspd_ac`. `data-model.md` atualizado.
- Arquivo versionado: 12 opções com os rótulos do dono, conferidos no teste escrito à mão (sem importar do código, B-1 da ADR 0020); códigos únicos.
- Testes novos: rodei `vitest run` em `allow-list`, `dominio-businessmap` e `normalizador-businessmap` no head `28b25cf2`: 3 arquivos, 165 testes passaram.
- Suíte inteira: não rerrodei. CI do head `28b25cf2`, run 43841142798 (push): `completed failure`, jobs `testes` (cobertura: "Coverage for lines (99.97%) does not meet global threshold (100%)") e `banco` (`tests/dominio-businessmap.pg.test.ts`: "expected { …(5) } to match object { campos: +0, inseridas: 357, …(2) }"). Cobertura local só do `allow-list.ts` no projeto `unit`: linha descoberta 91.
- O teste pg do A5 é justamente a base nova do A3: ao corrigi-lo, a expectativa `afeta` vazio documenta que, numa base sem a versão da E7.5, a tabela de fases entra sem marcar o O15.

## Delta lido
Primeira rodada; sem delta.
