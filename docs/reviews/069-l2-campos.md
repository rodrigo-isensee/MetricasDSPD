---
tipo: review
contrato: 1
pedido: 069-lacunas-alta
branch: feature/069-l2-campos
commit: 1f62f203e7a0ced3947ec2b9c70eab644b98bc20
parecer: aprovado
revisor: tech-lead
data: 2026-11-04
---
# Code review: 069 L2-a, mapa de campos do BusinessMap por arquivo versionado e bm:ref-sync (K-220)

## Parecer

Aprovado. O lote entrega o mecanismo do desenho (seção "Lote L2-a") sem mudar o que a coleta grava hoje: o arquivo `docs/architecture/fontes/businessmap-dominio.json` nasce com `"campos": []`, a lista positiva `TIPOS_SELECAO_UNICA` nasce vazia e, sem linha vigente em `dspd_bm.ref_dominio`, `dominiosDaColeta` devolve mapa vazio, como a constante de antes.

## O que foi lido (diff `origin/develop...1f62f20`)

- Entrada `server/src/entradas/ref-sync-businessmap.ts`: segue o molde do `ac:ref-sync` (mesma data padrão em Brasília, código 2 com mensagem de uso, argumento extra recusado, caminho do arquivo constante). Lê e valida o arquivo antes de abrir o pool, então recusa de esquema não grava nada (CA-069-1 e CA-069-2). Falha com mensagem fixa; só `ErroDominio` mostra texto, e as mensagens dele trazem só o caminho do esquema.
- Módulo `dominio-businessmap.ts`: esquema zod `strict` na raiz, no campo, no valor e na versão de critério; `type` só pela lista positiva (refine sobre a constante, sem lista de negação); `field_id` `^\d{1,10}$`; coluna em `z.enum(COLUNAS_LISTA)`; `codigo` e `rotulo` com `textoSeguro`; duplicatas de `field_id`, coluna, código e rótulo e o código reservado `desconhecido` recusam. Os fields 36 e 42 recusam no arquivo também com zeros à esquerda (`String(Number(...))`).
- Gravação: `sincronizarDominioBm` reaproveita `planejarDominio` (só INSERT de vigência nova e `UPDATE (vigente_ate)`, numa transação), sempre leva `campo_customizado` mesmo vazio, para fechar o campo retirado, e registra a versão de critério (T2.6, domínio `businessmap`) uma vez por hash. Sem GRANT novo: o `dspd_coletor` já lê `ref_` (`grants.ts:107`) e o `dspd_ref` já insere e fecha vigência (`grants.ts:115-117`).
- Coletor: `dominiosDaColeta(db, S)` agora é assíncrona, lê só `campo_customizado` e as colunas do enum, e `dominiosDeLinhas` desconfia do banco: remove 36 e 42 depois da leitura (também com zeros à esquerda), ignora `field_id` não numérico, coluna fora do enum, field ligado a duas colunas, código inseguro ou reservado e rótulo que leva a dois códigos. A recusa nos dois lados (A4) está no código. A leitura acontece antes de abrir a `ctl_coleta`; uma falha ali derruba a coleta sem registro, como os outros erros de configuração.
- Desvios aceitos pelo Jarvis, e eu concordo: (1) `textoSeguro` exportado e `planejarDominio` com tipo estrutural `{ dominios: Partial<Record<string, Item[]>> }`: o comportamento do Acelerato não muda (o esquema dele continua validando antes), e é isso que permite reaproveitar o texto seguro e o planejador como o desenho pede, sem cópia; (2) `CAMPOS_CUSTOMIZADOS_FORA` movida para `allow-list.ts` e reexportada em `coleta.ts` com o mesmo nome e valor: evita o import circular entre `coleta.ts` e `dominio-businessmap.ts`, e o teste existente segue afirmando `['36', '42']`.
- Testes: unidade do esquema com as listas de proibidos e de tipos escritas no teste (B-1 da ADR 0020): CA-069-1, CA-069-2 (type de usuário, de texto, desconhecido, vazio, ausente e não texto; `field_id` `"42 "`, `"4a"`, `"-1"` e outros; coluna `owner_user_id`, `__proto__`, inexistente; `@`, U+200B, U+202E, U+2028 e controle no rótulo e no código; chave extra em todos os níveis; `__proto__` sem poluir o protótipo); CA-069-3 e CA-069-4 no coletor e no staging, com marcadores ausentes de log, estado do banco e resultado; dublê de PG para a gravação; pg real para idempotência, vigência, recusa no mesmo dia e privilégios; entrada com URL inválida e senha marcador.
- Regras invioláveis: nada individual; só BusinessMap; nenhum dado de pessoa entra (36 e 42 fora nos dois lados); histórico não sobrescrito (só fecha vigência). Cálculo não muda neste lote (arquivo vazio), então não há marca de critério nos gráficos.
- Documentação: `docs/architecture/server.md` descreve o comando, as recusas e a operação depois do primeiro arquivo com campos (varredura, ADR 0022 item 6).

## Ferramentas

Não refeitas aqui; cito o relato do autor no pedido: server 1677 testes verdes com cobertura 100%. Os testes pg (`dominio-businessmap.pg.test.ts`) foram escritos e não rodados por falta de PostgreSQL local: rodam na CI do PR, e o QA registra isso. O `praticas.md` do projeto não marca regra com "decidida por: <comando>", então não há saída de comando a citar nem pendência nova.

## Segurança

Parecer próprio do security-engineer em `docs/security/069-l2-campos.md` (commit 6281601, sobre esta mesma ponta); não refaço. Nenhum achado de segurança novo neste review, então nenhum cartão novo para ele. O A5 do modelo (rótulos vão à API) segue valendo para o PR que preencher o arquivo.

## Teto de linhas (M14)

`git diff --numstat --no-renames origin/develop...1f62f20`, só código e teste: 257 linhas em `server/src` e `server/package.json` (1 + 31 + 9 + 23 + 185 + 1 + 4 + 3) e 420 em `server/tests` (3 + 39 + 127 + 206 + 45), total 677. Fora da conta: o JSON de domínio (dado de configuração, como no 056-dominio-listas), o `.md` e o modelo de ameaças. O desenho estimou 300 linhas; 62% do total é teste, e o maior bloco são os casos de abuso que o modelo de ameaças exige. Leio um comportamento só: o mapa de campos sai da constante do código e passa a vir do arquivo versionado pelo `ref_dominio`, com o controle nos dois lados que o A4 exige juntos. Dividir carregador e coletor em dois PRs deixaria um PR com o carregador sem efeito e outro lendo uma tabela que nada preenche, sem ganho de leitura. Aceito a exceção com uma condição: o PR (E1.6) leva a linha `teto: excedido, 677 linhas, mapa de campos do BusinessMap pelo arquivo versionado (bm:ref-sync, esquema com lista positiva e recusa de 36 e 42 nos dois lados), 62% teste dos casos de abuso CA-069-1 a 4`, com o número recontado se a branch mudar. Sem essa linha no corpo do PR, vira achado bloqueante.

## Achados

- A1 (recomendado) server/src/modulos/businessmap/dominio-businessmap.ts:1 · Lote acima do teto M14 (677 linhas de código e teste). Exceção aceita: o corpo do PR precisa trazer `teto: excedido, <n> linhas, <motivo>` recontado na abertura; sem essa linha, vira bloqueante.
- A2 (recomendado) server/src/modulos/businessmap/dominio-businessmap.ts:104 · Campo retirado do arquivo fecha o `campo_customizado`, mas a lista da coluna fica vigente, órfã. O coletor já a ignora sem o mapa; fechar a lista junto evita lixo vigente. Pode ir no PR que preencher o arquivo.
- A3 (recomendado) server/src/modulos/businessmap/dominio-businessmap.ts:30 · `CODIGO_SEGURO` repete a regex de `textoSeguro`. Se uma mudar, os dois lados divergem; dá para derivar de `textoSeguro(80).safeParse`. Não devolve.
- A4 (recomendado) server/tests/dominio-businessmap.pg.test.ts:96 · O título diz que o `dspd_coletor` lê, mas a leitura usa o cliente do `dspd_ref` (o comentário explica). Ajustar o título; o SELECT do coletor já é coberto no teste de privilégios.
