---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-causa-raiz-bm-coleta
commit: 43f5bd9ced0106086545e67f8cb2e11253e6eab9
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105-melhorias-15-11 (E7.97 e revalidação E7.122, coleta da causa raiz do BusinessMap)

Escopo: diff `ba45668f..28b25cf2` (9 arquivos): `allow-list.ts`, `dominio-businessmap.ts`, `normalizador.ts`, `businessmap-dominio.json`, `data-model.md`, CHANGELOG e três testes. Etapa E7.86 do pedido; decisão do dono de 2026-11-16 (duas causas raiz separadas). Revalidação por delta até `43f5bd9c` na seção própria abaixo.

## Gatilhos
`R-SEGURANCA`: a entrega abre a fronteira da coleta (allow-list, ADR 0020 4d) a um campo customizado novo e preenche a lista positiva de tipos (A3 do modelo de ameaças), o que a própria constante exige com parecer. Toca ainda a regra inviolável de dado pessoal e texto livre fora do staging e a segregação BusinessMap x Acelerato.

## Achados

## Sondas

## Detalhe dos achados
Sem achado bloqueante nem recomendado. O que foi conferido:

1. **Só o código do domínio passa.** `server/src/modulos/businessmap/allow-list.ts:109`: a saída de `reduzirCamposCustomizados` é `dominio.get(chave)` (o `codigo` do `ref_dominio`) ou o literal `desconhecido`; nenhum valor recebido da API é copiado. O domínio é um `Map` (sem herança de protótipo), montado em `dominio-businessmap.ts:246` só de linhas vigentes com código que passa `CODIGO_SEGURO`; o arquivo versionado valida `codigo` e `rotulo` com `textoSeguro` e recusa código `desconhecido` e rótulo repetido.
2. **Tratamento de `values[]`.** `allow-list.ts:83` lê só `value` (escalar), e de cada item de `values[]` só `value_id` e `value` escalares (string ou número); objeto, lista aninhada, `other_value`, `description` ou qualquer outra chave nunca são lidos. Texto livre só "casaria" se fosse idêntico a um rótulo do dono, e mesmo assim sai o código, não o texto.
3. **Nenhum texto livre nem pessoa chega ao staging.** O registro do card guarda `custom_fields` como `{field_id, valor}` com `valor` do domínio; os fields 36 e 42 seguem fora (o esquema do arquivo recusa e o mapa os descarta). No projetor, `normalizador.ts:148` grava em `causa_raiz` só código não vazio e diferente de `desconhecido`, cortado em 80; fora da lista fica nulo com a nota `campo_fora_do_dominio`, sem o valor.
4. **Lista positiva de tipos.** `dominio-businessmap.ts:41` passa de vazia a `['dropdown']`, um único tipo de seleção; o teste novo recusa o field 48 declarado como texto. Mesmo que um campo de texto fosse declarado `dropdown` por engano no arquivo, o item 1 garante que só código do domínio sai (defesa em profundidade).
5. **Segregação e histórico.** A coluna `causa_raiz` já existia em `dim_card` e `dim_card_versao` (migrações 0005 e 0006) e entra na cópia de versão (`responsaveis.ts`, `COLUNAS_VERSAO`), sem sobrescrever história. Nenhuma chave cruza com o Acelerato; a causa raiz de incidente segue só lá. Não é coluna de pessoa: a leitura pela API não muda o GRANT.

Informativo (sem caminho de ataque, por isso nem recomendado): o `bm:spike` não rodou; se a API mandar só `value_id` numérico, o domínio (chaveado pelo rótulo) não casa e tudo vira `desconhecido` contado. O efeito é perda de dado (falha fechada), não exposição; é assunto de QA e do dono na recoleta. Com vários itens em `values[]`, vale o primeiro que casa; idem, fidelidade de dado. Na volta 2 o risco foi documentado no CHANGELOG e no plano de carga (passo 1, `bm:spike` antes da recoleta).

Sondas executadas (nenhuma prova bloqueante, por isso fora do bloco `## Sondas`), por teste temporário apagado depois, sobre `reduzirCamposCustomizados` e `registroCard` com o domínio `Outros` e `Teste insuficiente`: `value_id` objeto com `toString`, `values` com lista aninhada, `value` lista, `other_value` com e-mail e `user_id` no item e no campo, chaves `__proto__` e `constructor`, field `048`, fields 36 e 42. Resultados: `desconhecido` nos casos de forma inválida e no de protótipo; `outros` sem o texto extra no caso do `other_value` (o registro do card também sem ele); `048` e 36/42 descartados (lista vazia); dois itens válidos levam o primeiro.

## Revalidação por delta (E7.122, head 43f5bd9c)
Intervalo `28b25cf2..43f5bd9c`, lido com `forge-check parecer delta`: commits 2c6a33ee (volta 1) e 43f5bd9c (volta 2), além dos pareceres de review, QA e segurança e de três merges da própria branch. No domínio entram só dois arquivos:

- `server/src/modulos/businessmap/dominio-businessmap.ts`: uma única linha muda, no comentário de `CAMPO_FASE_DETECCAO_COLUNA` (explica o `afeta` da versão da E7.5 e da versão do campo 48). Nenhum código muda.
- `docs/architecture/fontes/businessmap-causa-raiz-carga.md` (novo): plano de carga em prosa (`bm:spike`, conferência da versão da E7.5, `bm:ref-sync`, carga inicial, `bm:projetar`, conferência pela nota `campo_fora_do_dominio`). Não traz credencial nem comando destrutivo, não afrouxa a fronteira, mantém o histórico append-only e reafirma a segregação `dspd_bm` x `dspd_ac`.

Fora do domínio: `CHANGELOG.md` (nota de que o arquivo casa pelo rótulo), `server/tests/allow-list.test.ts` e `server/tests/dominio-businessmap.pg.test.ts`. A fronteira não mudou: `allow-list.ts`, `normalizador.ts`, `businessmap-dominio.json` e as migrações são idênticos ao commit revisado. Os testes novos fixam o que as sondas do parecer original tinham conferido: um valor desconhecido com `comment`, `text`, `description` e `label` sai `desconhecido`, e o texto não aparece na saída nem no registro do card; `value_id` sozinho contra o domínio real (chaveado pelo rótulo) vira `desconhecido`; itens escalares de `values[]` casam, e item nulo, booleano, lista ou objeto com chave não escalar é ignorado. O teste pg passa a esperar o arquivo real com o campo 48 (13 linhas) e a versão sem métrica afetada, o que bate com a decisão do dono. Nenhum achado novo.

## Riscos aceitos e ferramentas
Nenhum risco aceito. No parecer original, os testes dos três arquivos alterados rodaram no head 28b25cf2 (165 passaram). Na revalidação, `tests/allow-list.test.ts` rodou no head 43f5bd9c: 31 passaram.

Suíte completa: o CI de 28b25cf2 (run 43841142798) terminou vermelho por causas fora da segurança. No job `banco`, o teste pg ainda esperava o arquivo antigo; no job `testes`, a cobertura do server ficou abaixo de 100%. As duas voltas corrigiram isso, e o CI do head 43f5bd9c (run 43846051567, push) passou inteiro: `banco`, `testes`, `seguranca`, `rapida`, `build`, `imagem`, `openapi` e `filtro` verdes; os jobs de e2e e perf foram pulados pelo filtro.

Ferramentas de varredura de segredo, dependências e SAST não estão no PATH do ambiente. A lacuna fica registrada, e a varredura fica com o CI do projeto (job `seguranca` verde no run 43846051567). A entrega não muda dependências nem workflow.
