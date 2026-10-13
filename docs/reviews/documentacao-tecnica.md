---
contrato: 0
---
# Code review: documentação técnica (DDD, contratos, índice) — rodada 1

- Branch: `docs/documentacao-tecnica` (7 commits sobre `origin/develop`, b59a8d5..c1eaf00) · Revisor: `tech-lead` · Data: 2026-10-11
- Escopo: `tools/docs-contratos`, `server/src/plataforma/eventos/catalogo.ts` (e uso em `publicarEvento`/`receberWebhook`), `packages/metricas/package.json` (`./regras`), `server/package.json` (`./eventos`), `pnpm run pronto`, `.github/workflows/ci.yml`, `@mermaid-js/mermaid-cli` 12.0.0; documentação em `docs/architecture/ddd/*`, `docs/contratos/*`, `docs/README.md`, `docs/engineering/padrao-de-documentacao.md`, `docs/api/*`, `docs/tecnica/README.md`, ER do `dspd_core` e `overview.md`.

## Parecer: AJUSTES NECESSÁRIOS

O gerador e as checagens são bem construídos e o gate de compatibilidade falha no caso básico. Mas a política tem três furos que deixam passar quebras reais (B1 a B3), e parte da documentação contradiz o código desta mesma branch (B4). Volta para o autor: código (B1 a B3, I1, I3, I6) para o `tech-lead`/`node-backend` que escreveu o gerador; texto (B4, I2, I4, I5) para o `software-architect`.

## O que foi verificado

| Verificação | Resultado |
|---|---|
| `pnpm run pronto` na raiz | passa (lint, format, typecheck e cobertura de todos os pacotes; `tools/docs-contratos` 100%: 663/663 instruções, 417/417 ramos; `server` 100%) |
| `pnpm run docs:check` na raiz | `ok (282 páginas Markdown, 33 métricas, 2 eventos)` |
| Gate falha quando deveria: campo removido | simulei a remoção (campo obrigatório a mais na fotografia de `coleta.concluida`): `docs:check` e `docs:fotografar` saem com código 1. Correto. |
| Gate falha quando deveria: outros casos | **não** falha como incompatível em: rota/tipo `v2` existente (B1), contrato já aceito uma vez (B2), contrato removido (B3), `record`, tupla, `pattern`, `format`, `minimum`/`maximum`, `maxItems`, `strict` para `passthrough` (I1). Script de experimento com `classificar`/`contratosAceitos`. |
| `pnpm run docs:mermaid` | não verificado localmente: o Chromium do Playwright não abre nesta máquina (código 127, bibliotecas do sistema), e cada um dos 54 blocos sai como "não renderiza" (ver M1). Fica para o job `e2e` do CI, que instala com `--with-deps`. |
| CI | jobs `rapida`, `testes`, `e2e` com os mesmos nomes; `docs:check` acrescentado ao `testes` e `docs:mermaid` ao `e2e`; nenhum gate removido nem enfraquecido; `pnpm -r typecheck` cobre o pacote novo. |
| Dado de pessoa e segredo | nenhum nas páginas geradas nem nas fotografias (as ocorrências de "usuario" são o status `pendente-usuario`); exemplos vêm da base fictícia; schemas de evento `.strict()` e mensagem de erro sem valor. |
| Regras invioláveis | nada calcula fora da biblioteca; BM e AC separados nas páginas; mínimo de 20 itens refletido no schema (`n.minimum: 20`). Ressalva em I6. |
| Afirmações contra o código | conferidas por amostragem e corretas: `rotas.ts:15,19-20,23-27,33,45-48,53`, `schemas.ts:9,47`, `servico.ts:142-144,148,161`, `saude.ts:13-24`, `referencia/schemas.ts:26`, `operacao/rotas.ts:15,21`, `erros.ts:18,32,40,46,52`, `comum.ts:4,96,185`, `metricas.ts:87,103`, `regras.ts:68`, `cartoes.ts:127,150`, `lgpd.ts:7-8,11-15,18-21`, `ddl.ts:48-49`, `exportar/modelo.ts:24-34,114,163-164`, testes de paridade; identificadores citados em 01/02/05/07 existem; 43 caminhos no OpenAPI. Erradas: ver B4 e M5. |
| ER do `dspd_core` (`data-model.md` §5) | confere com `0010_core_referencia.ts` e `0011_core_outbox.ts` (colunas, PK, UK, FK, `CHECK`). |
| Modelo de Domínio do Siegard | `03-agregados.md` é gerado do frontmatter (57 elementos: 12 raízes, 10 entidades, 5 VOs, 1 serviço, 29 enumerações) e conferido no `docs:check`; 01 e 02 linkam elementos existentes; os cinco contextos e o papel estratégico batem com os `_context.md`. |
| Cadeia de suprimentos (`@mermaid-js/mermaid-cli`) | ver M9: aceitável, com registro no PR. |

## Bloqueantes

**B1. Rota ou tipo `v2` isenta justamente o contrato que deveria ficar congelado.**
`tools/docs-contratos/src/fotografias.ts:328-335` (com `:296`): se existe `/api/v2/metricas/O9`, `O9` entra em `aceitos`; se existe `coleta.concluida.v2`, `coleta.concluida` entra. Mas a fotografia comparada é a do contrato v1: `insumos.ts:79` monta a rota `/api/v1/...` e `:97` usa `SCHEMAS_RESULTADO[id]`. Experimento: com `/api/v2/metricas/O9`, remover um campo de O9 gera só `fotografia desatualizada (mudança aceita)`, e `docs:fotografar` grava. Isso inverte a política (`politica-de-mudanca.md` §1 e §3): o v1 tem de continuar igual durante a convivência.
Sugestão: v2 é contrato novo, com fotografia própria (`O9.v2`, `coleta.concluida.v2`); o v1 continua sendo conferido e nunca é isento automaticamente.

**B2. O aceite em `aceitas.json` é permanente e vale para qualquer mudança futura.**
`fotografias.ts:296` e `:320-327`: o aceite é só pelo nome do contrato. Depois de uma entrada para `O9`, toda quebra futura de O9 passa sem aviso, para sempre. Também há dois registros: o `aceitas.json` lido pela ferramenta e a seção "Registro de incompatibilidades aceitas" em `politica-de-mudanca.md:49-50`.
Sugestão: amarrar o aceite à mudança, por exemplo com o hash da fotografia nova ou do par antigo para novo. O `docs:check` deve falhar se uma entrada não corresponder a nenhuma mudança pendente, para obrigar a limpeza depois do `fotografar`. Um registro só: a página da política lista o JSON ou aponta para ele.

**B3. Remover uma métrica ou um tipo de evento não é detectado.**
`gerador.ts:107-126` percorre só os contratos atuais. A fotografia de um contrato que sumiu nunca é lida, e remover uma rota ou um evento, a mudança mais incompatível que existe, passa no `docs:check`.
Sugestão: listar `docs/contratos/snapshots/{resultados,eventos}/` e acusar como INCOMPATÍVEL toda fotografia sem contrato atual, salvo aceite (B2). Acrescentar um teste.

**B4. A documentação contradiz o código desta branch (afirmações falsas).**
- `docs/contratos/eventos.md:15-17`: diz que o schema Zod por tipo é [planejado] e que o código aceita qualquer `tipo`. Hoje `catalogo.ts` valida em `publicarEvento` (`outbox.ts:26`) e recusa tipo fora do catálogo. O mesmo erro está em `docs/architecture/ddd/04-eventos.md:15` (cita `catalogo-eventos.ts`, que não existe; o arquivo é `catalogo.ts`).
- `docs/contratos/politica-de-mudanca.md:27`: diz que o teste de compatibilidade é [planejado] e que "a classificação é feita na revisão". Ele existe (`docs:check`). A página também não explica como o gate funciona: `docs:fotografar`, `aceitas.json`, o que conta como compatível.
- `docs/contratos/README.md:12` e `:25`, e `docs/contratos/http.md:6`: dizem que `metricas/` "ainda não existe neste commit". Existe e é gerada. `04-eventos.md:40` diz que `docs/api/README.md` é [planejado]; existe.
- Referências de linha que esta branch deslocou (o `outbox.ts` ganhou 7 linhas, o `webhook.ts` ganhou 3 e o `server/package.json` ganhou 3):
  - `eventos.md:13` diz `webhook.ts:33-47`; o certo é `:34-51`.
  - `eventos.md:28-36` cita `outbox.ts:18-25`, `41-65`, `44`, `54`, `11,52-53`, `9,13-16,79-87`, `42-43`, `38-39` e `10,90-93`; todas estão 5 a 7 linhas acima do lugar certo.
  - `eventos.md:37` diz `webhook.ts:28-41`; o certo é `:30-48`.
  - `http.md:19` diz `webhook.ts:51`; o certo é `:54`. `http.md:74` diz `:68`; o certo é `:71`. `http.md:75` diz `:56`; o certo é `:59`.
  - `politica-de-mudanca.md:12` diz `server/package.json:27`, que hoje é `start:worker`; `openapi:verificar` está em `:30`.
  - `dados.md:46` diz `outbox.ts:10`; `RETENCAO_DIAS` está em `:11`.
- Fato errado: `docs/contratos/eventos.md:49` e `:62` dizem que a reserva vencida volta para `pendente`. O código (`outbox.ts:59-60`) reserva de novo um evento que continua `processando`, e é isso que `05-ciclos-de-vida.md` desenha. As duas páginas se contradizem.
Sugestão: corrigir os trechos. Para não repetir o problema, citar símbolo (`outbox.ts`, `processarOutbox`) em vez de número de linha nas páginas escritas à mão, como já fazem 02 a 07. Quem quiser número de linha deveria ter checagem automática.

## Importantes

**I1. O classificador não enxerga várias palavras-chave do JSON Schema.**
`fotografias.ts:192-236` compara só `type`, `const`, `enum`, `items`, `properties`/`required` e `anyOf`/`oneOf`. No experimento, deram 0 incompatibilidades:
- valor de `z.record` que muda de tipo (`additionalProperties` com schema);
- tupla que muda de tipo (`prefixItems`);
- `pattern`, `format`, `minimum`/`maximum`, `maxItems` e `minLength` novos ou alterados;
- `strict` virando `passthrough`.

Tudo isso aparece só como "fotografia desatualizada (mudança aceita)", e `docs:fotografar` grava sem aceite. As fotografias atuais usam limites que importam (`n.minimum: 20` em estatística publicada, `maximum: 19` em insuficiente): afrouxá-los quebra quem consome. Hoje nenhum schema usa `record` nem tupla, então essa parte é latente.
Sugestão: inverter a lógica. Lista explícita do que é compatível; qualquer outra diferença de palavra-chave é INCOMPATÍVEL. Um teste por palavra-chave.

**I2. O classificador decide o que a política não decide.**
`fotografias.ts:186-191`, `:226-227` e `:258-259` tratam como compatíveis "valor novo de enum" e "opcional que passa a obrigatório", inclusive na saída. A tabela de `politica-de-mudanca.md` §2 não tem nenhum dos dois. Valor novo de enum numa resposta pode quebrar um consumidor exaustivo (por exemplo, um `switch` no `web`).
Sugestão: arquiteto e tech lead decidem e registram na política (saída e entrada separadas); o classificador segue a política.

**I3. O teste copia a lista de pessoa.**
`server/tests/eventos.catalogo.test.ts:10` redeclara o regex de `SEGMENTO_PESSOA` (`lgpd.ts:7-8`), já sem `justificativa`. O `data-model.md` §9 diz "Nenhum teste copia a lista". O teste também só olha chaves de primeiro nível e casa a chave inteira, não os segmentos.
Sugestão: importar `SEGMENTO_PESSOA` (ou `violaLgpd`), dividir por segmento e percorrer `properties` recursivamente.

**I4. Dois catálogos de eventos.**
`docs/contratos/eventos.md` e `docs/architecture/ddd/04-eventos.md` repetem tipo, produtor, consumidor, payload e garantias, e já divergem (B4). Isso contraria a regra "uma fonte por fato" (`00-plano.md:44`). `07-componentes.md:108` lista `plataforma/eventos` sem `catalogo.ts`.
Sugestão: um catálogo só (de preferência `contratos/eventos.md`, ao lado da fotografia); o 04 fica com a visão de domínio (outbox × `evt_card` × transição) e um link.

**I5. O padrão promete mais do que a ferramenta confere.**
`padrao-de-documentacao.md:61-67` diz "todo arquivo de `docs/`", "toda página não excluída" e "toda ADR tem a linha `Estado:`". Mas `verificar-docs.ts:32-36` só confere cabeçalho, órfãs e Mermaid em `docs/contratos/`, `docs/architecture/ddd/` e `docs/README.md`. Nenhuma ADR de 0001 a 0015 tem `Estado:`. As exclusões também divergem: o padrão não cita `retrospectivas/` nem `propostas/`. Além disso, `00-plano.md:45-46` promete `scripts/ddd-diagramas.mjs` (o feito é `tools/docs-contratos`) e testes que não existem: "evento registrado aparece em 04", "módulo aparece em 07", "elemento citado existe".
Sugestão: escrever o padrão com o escopo real e marcar o resto como [planejado], com cartão no quadro, ou ampliar o escopo da ferramenta. Atualizar o plano para o que foi feito.

**I6. `publicarEvento` não confere a fonte do evento.**
`outbox.ts:26` e `catalogo.ts:11-24` aceitam `coleta.concluida` com `payload.fonte` diferente de `e.fonte`, e `bm.*` publicado com `fonte = 'acelerato'`. Esse segundo evento fica `pendente` para sempre, porque `consumidores.ts:17-19` só recusa o cruzamento no cadastro. É a regra "BusinessMap e Acelerato nunca se misturam" no ponto de entrada da outbox.
Sugestão: em `publicarEvento`, recusar prefixo incompatível com a fonte e `payload.fonte !== e.fonte`. Acrescentar um teste.

## Menores

- **M1.** `mmdc.ts:166` e `main.ts:24-25`: se o binário não existe (`ENOENT`), o `spawnSync` devolve `stderr` `undefined`, o `.trim()` lança `TypeError` e o tipo `stderr: string` mente. Navegador que não abre vira 54 problemas "diagrama não renderiza". Sugestão: tratar `r.error` e falha de ambiente uma vez só, com mensagem própria.
- **M2.** `verificar-docs.ts:152`: um link para uma pasta conta como link para todas as páginas dela, o que enfraquece a checagem de órfãs. Sugestão: só o `README.md` da pasta herda o link.
- **M3.** `webhook.ts:36`: o comentário diz "valida antes de gravar", mas a validação roda depois do `INSERT` em `stg_webhook_evento`. A transação desfaz tudo, então não há bug; ajustar o texto. `validarPayload` lança `Error` genérico; um erro de domínio tipado seria melhor (prática "erros explícitos").
- **M4.** `docs/README.md:78` (achabilidade, tarefa 6): "diagrama do contexto `flow`" aponta para `_context.md`, que não tem diagrama; o diagrama está em `ddd/03-agregados.md`. `validacao.md` (`:80`) não existe: o teste de achabilidade continua pendente.
- **M5.** `contratos/http.md:57` cita `app.ts:44-47`, que é o hook `onSend`; a geração e a validação do id ficam em `app.ts:38` (`gerarRequestId`).
- **M6.** `contratos/dados.md:50-53` cita a ADR 0016, que existe só em `feature/metricas-complementares`. Quem for mesclado por último atualiza a seção.
- **M7.** `contratos/README.md:48`: a legenda diz "o rótulo traz o tipo", mas as setas do diagrama não têm rótulo.
- **M8.** `gerador.ts:147-149`: apagar uma fotografia e rodar `docs:fotografar` recria a fotografia sem comparar. Fica coberto pelo diff do PR; vale uma linha na política.
- **M9. Cadeia de suprimentos de `@mermaid-js/mermaid-cli` 12.0.0: aceitável.**
  - Licença MIT, versão fixada exata, só `devDependency` do `e2e`: não entra na imagem nem no build.
  - O `postinstall` do puppeteer não roda, porque `onlyBuiltDependencies` só libera o `esbuild`; o Chromium usado é o do Playwright.
  - Custo: cerca de 116 pacotes e 1.339 linhas a mais no lockfile.
  - `pnpm audit` acusa um aviso novo, baixo: `katex` GHSA-238p-pmpm-9mq7, irrelevante para diagramas do próprio repositório. Os dois altos e o moderado vêm do `@lhci/cli` e já existiam.
  - `--no-sandbox` é aceitável no runner porque a entrada é conteúdo do repositório.
  - Pendências: registrar tudo isso na descrição do PR; não há `minimumReleaseAge` (S-27 continua aberta).

## Pendências do usuário (não são do código; o Jarvis leva ao usuário antes do PR)

- `00-plano.md` §5: idioma da linguagem ubíqua; estados derivados dos marcos; e a pergunta 3, se aceita a dependência `mermaid-cli`. A dependência entrou antes da resposta: confirmar com o usuário ou registrar onde ele respondeu.
- `05-ciclos-de-vida.md`: 6 perguntas de regra (marcos opcionais, reabertura, descarte, pares de evento, transições do chamado, saída da população). Foram tratadas corretamente como perguntas, não como inferência.
- `ux/documentacao-tecnica/discovery.md` §6: mover pastas, arquivar a proposta serverless, link-check bloqueante ou só aviso. O CI já trata como bloqueante.

## Próximo passo

Autor corrige de B1 a B4 e de I1 a I6 (os menores ficam a critério do autor), e o `tech-lead` faz a rodada 2. QA depois do aprovado.

---

# Rodada 2

- Commits revisados: b127cc5, 885cc25, e2e614a, 84385c3, 60fae09, 360fb10, 6ae714a · Revisor: `tech-lead` · Data: 2026-10-11

## Parecer: APROVADO (com R1 e R2 a corrigir antes do envio da branch)

Os quatro bloqueantes e os seis importantes foram resolvidos, com teste para cada um. O que sobrou é texto: uma afirmação falsa (R1) e duas referências de linha que este próprio ajuste deslocou (R2). São correções de uma linha. Confiro no diff do PR, sem nova rodada. R3 e R4 ficam a critério do autor.

## Verificações

| Verificação | Resultado |
|---|---|
| `pnpm run pronto` na raiz | passa (código 0). Cobertura 100%: `tools/docs-contratos` com 744/744 instruções e 471/471 ramos; `server` com 941/941 e 523/523. A primeira execução falhou só porque outro processo do vitest rodava ao mesmo tempo na mesma worktree (trava do diretório `coverage`). Não é defeito do código. |
| `pnpm run docs:check` na raiz | `ok (284 páginas Markdown, 33 métricas, 2 eventos)` |
| Experimento independente com `classificar`/`avaliarFotografias` | dão INCOMPATÍVEL: `minimum` de 20 para 10, `exclusiveMinimum` novo, `additionalProperties` de `false` para `{}`, valor novo de enum e campo que passa a anulável. Com o aceite do hash, a mudança aparece como "mudança aceita". Depois de fotografar, o mesmo aceite vira "aceite sem mudança pendente" e o check falha. |

## Achados da rodada 1, item a item

| Item | Situação | Evidência |
|---|---|---|
| B1: o v2 isentava o v1 | resolvido | 885cc25. `fotografias.ts` não procura v2 em lugar nenhum: `lerAceites` (`:260-263`) só lê `aceitas.json`. Teste em `gerador.test.ts:166`. A ausência de fotografia própria para `/api/v2/metricas/X` foi registrada como lacuna conhecida em `politica-de-mudanca.md:47`. Aceito: ainda não existe v2 de métrica, e o v1 continua congelado. |
| B2: aceite permanente por nome | resolvido | `Aceite` com `mudanca` = sha256 do par antigo para novo (`fotografias.ts:190-201`). O aceite só vale para aquele hash (`:224-234`), e aceite órfão é problema (`:241-245`), por isso é de uso único. O schema exige hash, motivo e data (`:249-258`). Testes em `fotografias.test.ts:269` e `:292`. Há um registro só (`politica-de-mudanca.md:69-70`). |
| B3: remoção não detectada | resolvido | `entradasFotografia` lista as fotografias sem contrato atual (`gerador.ts:115-148`), e `avaliarFotografias` as trata como "contrato removido" (`fotografias.ts:220-223`). `fotografar` apaga a fotografia só depois do aceite (`gerador.ts:160-173`). Testes em `gerador.test.ts:191` e `:225`. |
| B4: documentação contra o código | resolvido | 60fae09 e 360fb10. `eventos.md:17` descreve o catálogo existente. O ciclo de vida está certo, com a reserva vencida em `processando` (`eventos.md:38`, `:55`, `:69`). `politica-de-mudanca.md:34-45` explica o gate como ele funciona. O "ainda não existe" saiu de `contratos/README.md` e `http.md`. As referências corrigidas conferem: `webhook.ts:54`, `:59`, `:71`; `server/package.json:30`; `outbox.ts:11`; `app.ts:38`. A tabela de garantias passou a citar símbolos. Exceção: R2. |
| I1: classificador cego a palavras-chave | resolvido | lógica invertida, com lista fechada de compatíveis (`fotografias.ts:35-49`): qualquer outra palavra-chave diferente é incompatível (`:70-77`). Cobre `record` e `strict`/`passthrough` (`:137-148`) e tupla (`:124-135`). Testes em `fotografias.test.ts:77`, `:120`, `:137`. |
| I2: classificador decidindo fora da política | resolvido | a política agora tem linhas separadas para saída e entrada (`politica-de-mudanca.md:25-29`) e a ratificação conservadora (`:32`). O código segue a política (`fotografias.ts:103-106`, `:163-168`). |
| I3: teste copiando a lista de pessoa | resolvido | importa `SEGMENTO_PESSOA` e `segmentos` (`server/tests/eventos.catalogo.test.ts:7`), compara por segmento e em camelCase (`:19`), em qualquer nível (`:27`, `:35`). |
| I4: dois catálogos de eventos | resolvido | catálogo único em `contratos/eventos.md:19`. `04-eventos.md:8` remete para ele. `07-componentes.md` cita `catalogo.ts`. A tabela de garantias do 04 (`:17-30`) ainda repete o §3 do catálogo, mas hoje está consistente com ele. Ver R1. |
| I5: o padrão prometia mais que a ferramenta | resolvido | `padrao-de-documentacao.md` agora traz uma tabela com o escopo real e uma lista do que é [planejado]. As 15 ADRs têm `Estado:` na linha 2 (84385c3). `00-plano.md:46` reflete o que o `docs:check` confere. Exceção: R3. |
| I6: `publicarEvento` não conferia a fonte | resolvido | `conferirFonte` (`catalogo.ts:62-71`) roda antes de validar o payload e do `INSERT` (`outbox.ts:27`). Recusa prefixo de outra fonte e `payload.fonte` divergente, com mensagem sem valores. `consumidores.ts:15-16` reutiliza `fonteDoTipo` (fonte única do prefixo). Testes em `eventos.catalogo.test.ts:75` e `:86`. |
| DOC-01 (QA): alcance das páginas | resolvido | 6ae714a. `verificarOrfaos` faz busca em largura a partir de `docs/README.md` (`verificar-docs.ts:155-182`). Só o `README.md` herda o link para a pasta (`:163`), o que fecha o M2. A mensagem traz a página alcançável mais próxima e a cadeia de links. |
| DOC-03 (QA): stack trace no exemplo inválido | resolvido | `exigirValido` lista os campos (`insumos.ts:55-66`). A falha nos insumos vira `FalhaInsumos` e sai com código 1, sem stack trace (`cli.ts:44-62`). Erro de outra origem continua subindo. Testes em `cli.test.ts:51` e `:64`. |
| M5, M8 | resolvidos | `http.md:57` cita `app.ts:38` (`gerarRequestId`). O apagamento manual da fotografia está registrado em `politica-de-mudanca.md:43`. Os demais menores não foram reavaliados. |

## Restantes

**R1 (corrigir antes do envio). Afirmação falsa em `docs/architecture/ddd/04-eventos.md:10`.**
- Problema: a página diz que, dos tipos `bm.*` e `ac.*`, "nenhum existe". Mas `bm.webhook.recebido` existe (`catalogo.ts:10`, `contratos/eventos.md:13`), e a linha 8 da mesma página o cita.
- Outro ponto: o propósito na linha 3 ainda diz "catalogar os eventos ... com produtor, consumidores, payload e garantias", o que contradiz as linhas 8 e 19 do catálogo único.
- Sugestão: dizer que `bm.webhook.recebido` existe e que `ac.*` é [planejado]. Reescrever o propósito como "visão de domínio dos eventos".
- Autor: `software-architect`.

**R2 (corrigir antes do envio). Referências de linha que b127cc5 deslocou, em `docs/contratos/eventos.md`.**
- `eventos.md:25` aponta `consumidores.ts:21` para o consumidor duplicado; hoje é `:18`.
- `eventos.md:24` aponta `consumidores.ts:7-19`; a recusa do cruzamento hoje está em `:15-16`.
- Sugestão: citar o símbolo (`RegistroConsumidores.registrar`), como o resto da página já faz.

**R3 (recomendado). `docs/architecture/ddd/00-plano.md` ainda descreve o que não foi feito.**
- `:45` diz "CI roda em modo `--verificar`". Esse modo não existe: o CLI tem `gerar|check|fotografar|mermaid` (`cli.ts:22`), e o CI roda `docs:check`.
- `:58` (tabela de fases) ainda cita `scripts/ddd-diagramas.mjs`.
- `docs/engineering/contratos-plano.md:47` e `:60` citam `catalogo-eventos.ts`. É um plano datado, então aceito. Uma nota "feito em `catalogo.ts`" evita confusão.

**R4 (recomendado). Mensagem de `exigirValido` (`tools/docs-contratos/src/insumos.ts:62-64`).**
- Problema: a mensagem sugere "registre o aceite em `aceitas.json`", mas o aceite não contorna essa falha. `exigirValido` roda antes da comparação de fotografias (`:89`, `:111`) e lança a exceção de qualquer jeito.
- Além disso, a mensagem chama de "mudança INCOMPATÍVEL" um caso que também pode ser defeito do cálculo ou do exemplo.
- Sugestão: "o exemplo gerado não passa no schema do contrato: ajuste o schema, o cálculo ou o exemplo". Tirar a menção ao aceite.

## Afirmações contra o código

Conferidas nesta rodada e corretas: `app.ts:38`, `:55`, `:61`, `:62`; `erros.ts:40`, `:44-49`; `server/package.json:30`; `worker.ts:15`; `concluida.ts:6`, `:25`; `webhook.ts:37` (`validarPayload`), `:47`, `:54`, `:59`, `:71`; `outbox.ts:11`, `:27`; `catalogo.ts:66-71`; `plataforma/db/trava.ts` e `plataforma/worker.ts` (`pg_try_advisory_lock`); `grants.ts`. Também conferem todas as referências de `fotografias.ts` e `gerador.ts` citadas em `politica-de-mudanca.md:32-45`. Falsas ou velhas: só R1, R2 e R3.

## Próximo passo

O `software-architect` corrige R1 e R2 (e R3, se quiser). O autor do gerador decide sobre R4. O `tech-lead` confere no diff. Depois vem o QA, e o PR leva as pendências do usuário da rodada 1 e o M9.
