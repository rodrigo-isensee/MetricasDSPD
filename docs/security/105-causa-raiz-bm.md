---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-causa-raiz-bm-coleta
commit: 28b25cf22c3fdb5e0cd5d6e16fa6ae8be9ff26f8
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105-melhorias-15-11 (E7.97, coleta da causa raiz do BusinessMap)

Escopo: diff `ba45668f..28b25cf2` (9 arquivos): `allow-list.ts`, `dominio-businessmap.ts`, `normalizador.ts`, `businessmap-dominio.json`, `data-model.md`, CHANGELOG e três testes. Etapa E7.86 do pedido; decisão do dono de 2026-11-16 (duas causas raiz separadas).

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

Informativo (sem caminho de ataque, por isso nem recomendado): o `bm:spike` não rodou; se a API mandar só `value_id` numérico, o domínio (chaveado pelo rótulo) não casa e tudo vira `desconhecido` contado. O efeito é perda de dado (falha fechada), não exposição; é assunto de QA e do dono na recoleta. Com vários itens em `values[]`, vale o primeiro que casa; idem, fidelidade de dado.

Sondas executadas (nenhuma prova bloqueante, por isso fora do bloco `## Sondas`), por teste temporário apagado depois, sobre `reduzirCamposCustomizados` e `registroCard` com o domínio `Outros` e `Teste insuficiente`: `value_id` objeto com `toString`, `values` com lista aninhada, `value` lista, `other_value` com e-mail e `user_id` no item e no campo, chaves `__proto__` e `constructor`, field `048`, fields 36 e 42. Resultados: `desconhecido` nos casos de forma inválida e no de protótipo; `outros` sem o texto extra no caso do `other_value` (o registro do card também sem ele); `048` e 36/42 descartados (lista vazia); dois itens válidos levam o primeiro.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Testes dos três arquivos alterados rodados localmente no head: 165 passaram.

Suíte completa: o CI do head (run 43841142798, push em 28b25cf2) terminou vermelho, por causas fora da segurança. Job `banco`: `tests/dominio-businessmap.pg.test.ts` ainda espera o arquivo de domínio sem campos (`campos: 0`, versão que afeta só o O15). Job `testes`: cobertura do server abaixo de 100% (linhas 99,97%, ramos 99,9%), provavelmente o ramo de item escalar de `values[]` em `allow-list.ts:91`, que nenhum teste exercita. Ambos ficam com o autor, o review e o QA; o commit de correção pede revalidação deste parecer por delta.

Ferramentas de varredura de segredo, dependências e SAST não estão no PATH do ambiente: lacuna registrada; a varredura fica com o CI do projeto (job `seguranca` verde no mesmo run). A entrega não muda dependências nem workflow.
