---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-causa-raiz-bm-coleta
commit: 43f5bd9ced0106086545e67f8cb2e11253e6eab9
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: coleta da causa raiz do bug do fluxo (BusinessMap, field 48), E7.86

Branch `feature/105-causa-raiz-bm-coleta` contra `develop` (base `ba45668f`). Rodada 1 no commit `28b25cf2` (9 arquivos; código e teste: 99 linhas, abaixo do teto de 150; um comportamento: a coleta do field 48 até `dim_card.causa_raiz`). Revalidação (E7.120) no commit `43f5bd9c`.

## Parecer
**Aprovado** no head `43f5bd9c`. A4 e A5 resolvidos, com o CI do head verde. A1 e A2 resolvidos no CHANGELOG e no plano de carga versionado; A3 entrou no passo 2 do plano. Novo A6 (recomendado), de operação, para o dono antes da recoleta.

Rodada 1 (head `28b25cf2`): reprovado por A4 e A5 (CI vermelho nos jobs `testes` e `banco`).

## Achados
- A4 (bloqueante) server/src/modulos/businessmap/allow-list.ts:91 · Ramo `values[]` com item escalar sem teste: o job `testes` (run 43841142798) falha na cobertura global de 100% (linhas 99.97%, ramos 99.9%). Teste o item escalar, ou tire o ramo se a API não manda essa forma. Resolvido em `2c6a33ee`.
- A5 (bloqueante) server/tests/dominio-businessmap.pg.test.ts:59 · O teste pg do arquivo real ainda espera `campos: 0` e `afeta` `['O15']` (linha 69); o job `banco` falha. Atualize para 1 campo, as 13 linhas do field 48 e `afeta` vazio, e afirme que `dominiosDeLinhas` devolve o field 48 com os 12 rótulos. Resolvido em `2c6a33ee`.
- A1 (recomendado) server/src/modulos/businessmap/dominio-businessmap.ts:254 · O domínio casa pelo rótulo; se a API mandar só `values[{value_id}]`, todo bug vira `desconhecido`. Rode o `bm:spike` num bug com o field 48 antes da recoleta e registre a forma no PR. Resolvido: passo 1 do plano e nota no CHANGELOG; o spike é do dono, antes da recoleta.
- A2 (recomendado) CHANGELOG.md:12 · Plano de carga numa frase e `referencia` (businessmap-dominio.json:7) fora do repositório. Escreva os comandos exatos, com o modo que revisita os bugs antigos. Resolvido no plano de carga versionado, com a ressalva do A6.
- A3 (recomendado) docs/architecture/fontes/businessmap-dominio.json:8 · Com `afeta` vazio, base que nunca sincronizou a versão da E7.5 grava a tabela de fases sem marcar o O15. No plano (A2), confira a versão da E7.5 em `ref_versao_criterio` antes do `ref-sync`. Resolvido: passo 2 do plano.
- A6 (recomendado) docs/architecture/fontes/businessmap-causa-raiz-carga.md:13 · A `carga-inicial` lê arquivados e descartados só desde `--inicio` (padrão 12 meses, coleta.ts:24); bug arquivado antes não ganha causa raiz. O plano diz "revisita todos": diga a janela ou passe `--inicio=`.

## Detalhe dos achados
- A1: `dominiosDeLinhas` monta a chave pelo `rotulo` (texto da opção) e o arquivo só traz rótulos. Sem casamento, a coluna fica nula e a nota `campo_fora_do_dominio` conta: não corrompe nem afeta métrica (afeta vazio), mas a entrega não teria efeito. Se vier só `value_id`, o arquivo troca para o que a API devolve (nova versão de critério), sem mudar código.
- A2: a coleta incremental só busca cards com `last_modified` depois da marca d'água (server/src/modulos/businessmap/coleta.ts:293); bug antigo sem alteração não ganha causa raiz no incremental, e o `bm:projetar` sozinho reprojeta o staging antigo, em que o field 48 foi descartado.
- A3: a versão de critério é gravada uma vez por hash do arquivo, append-only (server/src/modulos/businessmap/dominio-businessmap.ts:205-213); onde a versão da E7.5 já existe, a linha com O15 em `ref_versao_criterio_metrica` fica e nada se perde.
- A6: em `coleta.ts:286-288`, o filtro da carga inicial é `{}` para ativos e `archived_from`/`discarded_from` = início da carga para os outros. Não é defeito do diff (o modo é anterior); é precisão do plano de operação.

## O que conferi
- Fronteira (`reduzirCamposCustomizados`, server/src/modulos/businessmap/allow-list.ts): só `value`, `values[].value_id`, `values[].value` e item escalar de `values[]` são candidatos; a saída é só o código de `dominio.get`, ou `desconhecido`. Descrição de "Outros", `comment`, `text`, `description`, `label` e chaves extras nunca são lidas. Campo fora do domínio continua descartado.
- Lista positiva `TIPOS_SELECAO_UNICA = ['dropdown']`; o parecer de segurança dessa constante é do `security-engineer`; cito, não refaço.
- Histórico nunca sobrescrito: `causa_raiz` em `COLUNAS_LISTA` (server/src/modulos/businessmap/projetor.ts:272); versão nova em `dim_card_versao` com `ON CONFLICT DO NOTHING`. Sem migração nova.
- Duas causas raiz separadas (decisão do dono): nenhuma métrica do fluxo lê `causa_raiz`; o O17 segue do Acelerato; nada cruza `dspd_bm` × `dspd_ac`.

## Delta lido
`forge-check parecer delta docs/reviews/105-causa-raiz-bm.md`: intervalo `28b25cf2..43f5bd9c`; no domínio `CHANGELOG.md`, `docs/architecture/fontes/businessmap-causa-raiz-carga.md`, `server/src/modulos/businessmap/dominio-businessmap.ts` (só comentário), `server/tests/allow-list.test.ts`, `server/tests/dominio-businessmap.pg.test.ts`. Fora do domínio: os três pareceres.
- A4: teste novo de `values[]` com itens escalares (número e texto casam; nulo, booleano, lista e objeto com chaves não escalares são ignorados). Mutante na linha 91 do `allow-list.ts` (tirar o ramo `else if (ehChave(v))`): 1 teste falha, 30 passam; sem o mutante, 31 passam. Job `testes` (cobertura de 100%) verde.
- A5: o teste pg afirma 1 campo, 13 linhas do field 48 (370 no total), `campo_customizado` = `48 -> causa_raiz`, os 12 códigos em `causa_raiz` e `afeta` vazio. Job `banco` verde.
- A1: o teste de `value_id` usa agora o domínio real (`value_id` sozinho vira `desconhecido`; com o rótulo, casa).
- A2: plano com a sequência e o motivo da recoleta completa; os scripts conferem com `server/package.json` e o modo `carga-inicial [--projetar]` com `coleta-comando.ts:26`.
- A3: passo 2 do plano; o comentário de `dominio-businessmap.ts:33` foi ajustado e está certo.
- Teste novo de vazamento pelo fallback (`comment`, `text`, `description`, `label` com valor desconhecido): confere por `JSON.stringify` na saída e no `registroCard`; o código de produção não mudou.
- CI do head `43f5bd9c`, run 43846051567 (push): `completed success` (testes, banco, build, segurança, openapi, rápida; e2e e perf pulados pelo filtro). Suíte não rerrodada; rodei só `tests/allow-list.test.ts` (31 passaram) e o mutante.
