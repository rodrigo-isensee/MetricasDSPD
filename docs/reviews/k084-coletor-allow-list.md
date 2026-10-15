---
tipo: review
contrato: 1
pedido: 011-metricas-tambem-disponiveis
branch: fix/coletor-allow-list
commit: d81a6cb22238d9beefc3d14e6a41634a52fc9d47
parecer: aprovado
revisor: tech-lead
data: 2026-10-15
---

# Code review: K-084, allow-list do coletor do BusinessMap

## Volta 4: atualização com a develop, só docs (2941276..d81a6cb)

**Veredito: aprovado, sem mudança de conteúdo.** A `develop` avançou com o PR #76 (só documentação) e a branch recebeu `git merge origin/develop` (sem force). O merge não teve conflito.

- **Código intacto.** `git diff 2941276 HEAD -- server packages web e2e` está vazio: nenhum arquivo de código, de pacote, de front ou de E2E mudou. O código e os testes lidos nas voltas 2 e 3 são os mesmos.
- **O que entrou:** só arquivos de `docs/` (por exemplo `docs/kanban/estado-2026-10-14-noite.md`, `docs/security/adr-0020-protecao-de-pessoa.md` e `docs/ux/sustentacao-no-operacional/06-revisao-implementada.md`). Nenhum deles é tocado pelo diff do K-084 além do que já estava.
- **Ferramenta.** O `pronto` completo da volta 2 (9b7f0d3, EXIT=0) e os 29 testes da volta 3 valem, porque o conteúdo de código é idêntico. Não foi refeito.
- **Outros pareceres.** QA e segurança têm gatilho próprio e são revalidados pelos donos; este parecer não os refaz nem os edita.

## Volta 3 (delta de teste do QA, 9b7f0d3..8737be4)

**Veredito: aprovado.** O QA acrescentou testes em d0bce7f e o parecer em 8737be4. O delta desde a volta 2 (1f546c2, que só trouxe o meu parecer) tem 3 arquivos e 303 linhas a mais, nenhuma a menos: `server/tests/allow-list.qa.test.ts` (115), `server/tests/allow-list.qa.pg.test.ts` (118) e `docs/qa/k084-coletor-allow-list.md` (70).

- **Sem mudança de produção.** `git diff 1f546c2..HEAD` não toca nenhum arquivo fora de `server/tests` e `docs/qa`. O código aprovado na volta 2 é o mesmo.
- **Testes novos, lidos.** Os de unidade (`allow-list.qa.test.ts`) cobrem chaves de protótipo, entrada que não é objeto, proibido aninhado, 200 chaves desconhecidas, tipo de webhook disfarçado, log do tipo, hash estável e responsáveis. Os `.pg` usam os papéis reais (`dspd_webhook`, `dspd_coletor`) e conferem a linha gravada inteira (`t::text`) contra o marcador, a ordem das entregas, o encadeamento de versões, a revisão fora de ordem e a negação de UPDATE e DELETE. Nada deriva das constantes de produção: o marcador `MARCADOR-QA-PESSOA` e as listas de proibidos estão escritos à mão.
- **Item 11 do checklist (ausência).** Cada `not.toContain(M)` tem um positivo no mesmo teste (`toEqual`, `toMatchObject` ou `toHaveLength`), e o teste de 200 chaves afirma mínimos nas constantes (`CAMPOS_CARD > 20`, demais `>= 5`), contra constante esvaziada.
- **Observação (não bloqueia).** O teste de `extrairResponsaveis({ owner_user_id: M })` documenta que o id é texto e que o valor nunca chega à staging; a prova está no `.pg`. Está coerente com a regra.
- **Ferramenta (citada).** `vitest run tests/allow-list.qa.test.ts` na worktree, em 8737be4: 29 testes passaram. Os `.pg` dependem de `DATABASE_URL`; o QA registrou a execução no parecer dele, e o job `banco` da CI continua sendo o portão. O `pronto` completo da volta 2 (9b7f0d3, exit 0) vale, porque o delta só acrescenta testes.

Autoria e segurança: nada novo a citar; o parecer de segurança segue como na volta 2, e o delta não tem gatilho de segurança.

## Volta 2 (delta e2a6d50..9b7f0d3)

**Veredito: aprovado.** Os três itens de documentação que bloqueavam foram corrigidos. O item 4 (a ADR 0020 versionada) está atendido pela `develop` (#76). Os recomendados 5 a 9 entraram neste cartão, com teste. A branch segue para o QA.

Escopo: 8767b1a (documentação e itens 5 a 9) e 9b7f0d3 (o parecer de segurança só troca o nome da constante; não é refeito aqui). São 10 arquivos, com 130 linhas a mais e 33 a menos.

**Ferramentas (citadas):**
- `flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto; echo EXIT=$?` na worktree, em 9b7f0d3: **EXIT=0**. Cobertura de 100%. No server, 447 testes passaram e 68 foram pulados (13 arquivos `.pg`, porque não havia `DATABASE_URL`). O `docs:check` deu ok.
- Para não deixar sem execução a prova com o papel real, rodei o `test:pg` do server contra o Postgres local do compose (`PG_TESTE_URL` montada como no `scripts/test-pg.sh`, com flock e nice). `responsaveis.pg`, `staging.pg`, `webhook.pg` e `catalogo.pg` passaram, num total de 61 testes. Falharam só os 7 testes de `pesquisa.pg.test.ts`, por permissão do papel `dspd_pesquisa` no banco local. É o mesmo defeito de ambiente, anterior a esta entrega, que o QA registrou no parecer da Sustentação (risco 5), e por isso o código de saída do `test:pg` foi 1. O job `banco` da CI continua sendo o portão.

| # (volta 1) | Situação |
|---|---|
| 1 `fontes.md:16` | **Resolvido.** O texto descreve o registro da allow-list (4f), o `payload_sha256` do corpo bruto e o 202 sem gravação para um tipo fora de `TIPOS_WEBHOOK_BM_GRAVADOS`. |
| 2 `fontes.md:20-21` | **Resolvido.** O texto passou a ser "[implementado]" para `stg_card`, `stg_revision` e `stg_webhook_evento`, e "[planejado]" para as outras quatro `stg_`, com a escrita negada até haver lista (B-K3). |
| 3 `server.md:170` | **Resolvido.** Agora diz "registro filtrado (ADR 0020, 4f)", e há uma linha nova sobre o coletor (K-084): responsáveis só nas `dim_`, e versão nova só com `vigente_de` posterior. |
| 4 ADR 0020 versionada | **Atendido** pela `develop` (4b933ac, #76). A branch está 2 commits atrás da `develop` e não tem a ADR. O PR por squash leva só o diff do K-084, e a ADR já está no destino. |
| 5 `child_card_stats` | **Parcial, como combinado.** As chaves agora são ordenadas, e o hash usa `serializar` (ordem canônica em todos os níveis), com teste. A enumeração das subchaves continua como pré-condição do cartão do cliente da API. |
| 6 `vigente_de` igual ou anterior | **Resolvido.** O código lê a versão vigente antes e não grava nada, nem na projeção, quando o conjunto é diferente e o `vigente_de` não é posterior. O `INSERT` também exige `$2 > v.vigente_de`. Há teste de unidade das bordas (igual, anterior, posterior, mesmo conjunto, sem vigente, null) e `.pg` para igual e anterior. |
| 7 `COLUNAS_VERSAO` | **Resolvido**, por outro caminho: compara com `tests/pg/esquema.snapshot.json`, que o `catalogo.pg.test.ts` confere contra o banco migrado. A cadeia fecha. `sistema_origem` fica fora da cópia e assume o padrão `'businessmap'`, o que está correto. |
| 8 JSDoc solto | **Resolvido.** |
| 9 nome da constante | **Resolvido.** O nome passou a `TIPOS_WEBHOOK_BM_GRAVADOS`, e o parecer de segurança acompanhou (9b7f0d3). |

Observações (não bloqueiam):
- `responsaveis.ts:38-43`: a leitura da vigente e o `UPDATE` em `dim_card` são duas instruções separadas. Com dois coletores no mesmo card ao mesmo tempo, a projeção ainda pode divergir da versão (o `INSERT` tem a própria guarda, o `UPDATE` não). Hoje o worker é único, e isso não é defeito. Quando houver concorrência no coletor, a saída é `SELECT ... FOR UPDATE` na transação do chamador ou a mesma condição de `vigente_de` no `UPDATE`. Fica registrado para o cartão do worker.
- `responsaveis.test.ts:44`: o nome do teste diz "a projeção é atualizada", mas ele afirma `dimCard: false` (o dublê devolve `rowCount: 0`). O comportamento está certo e o título engana. É cosmético.
- Trocar `JSON.stringify` por `serializar` muda o hash de dedupe dos registros já gravados. Como o coletor ainda não grava em produção (a lista de tarefas do worker está vazia), não há efeito. Se houvesse base, a primeira recoleta criaria uma versão por card.

**Autoria:** o parecer de segurança `docs/security/k084-coletor-allow-list.md` (9b7f0d3) não tem registro de autoria do papel `seguranca` em `.forge/run/autoria.jsonl` para a versão atual (hash 79bc97b2…), porque foi editado pelo Bash. O `forge-check pr` desta branch não o exige, porque não detectou gatilho de segurança no diff. Mesmo assim, o security-engineer deve regravá-lo com o Write antes do PR. Isso não se corrige aqui.

## Volta 1

Propósito: parecer de code review do K-084 (ADR 0020, itens 4a, 4b, 4c, 4d e 4f). Público: node-backend (autor), software-architect, security-engineer, qa-engineer, Jarvis.

**Veredito: ajustes necessários** (`parecer: reprovado` no frontmatter). O código está correto e fecha M-1, M-2 e M-3. O que impede a aprovação é a documentação: três trechos ainda descrevem o comportamento antigo, e a regra da seção 7, item 7, e da seção 8, item 10, das práticas é que doc ausente ou errada bloqueia. A correção é pequena e não muda código.

**Revisado:** `git diff origin/develop...HEAD` na worktree `MetricasDSPD-k084` (b5ac4f5..e2a6d50: 5352a67, código, e e2a6d50, parecer de segurança). Regras de leitura das práticas que alcançam o diff: seções 2 (código), 3 (sem pessoa), 4 (testes), 6 (modelagem, append-only, idempotência, pessoas) e 7/8 (documentação). Segurança: não refeita, ver `docs/security/k084-coletor-allow-list.md` (aprovado, achados B-K1 a B-K3 e I-1 a I-5).

## Ferramentas (citadas, não refeitas)
`flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto` na worktree, em e2a6d50: **exit 0**. Cobertura de 100% em todos os pacotes. No `server`, 23 arquivos e 439 testes passaram, e **13 arquivos `.pg` foram pulados** (67 testes), porque a estação não tinha `DATABASE_URL`. Entre eles estão `responsaveis.pg.test.ts`, `staging.pg.test.ts` e `webhook.pg.test.ts`, que são a prova com o papel real `dspd_coletor`. Quem roda esses testes é o job `banco` da CI no PR, e esse job precisa estar verde antes do merge.

## Achados

| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| 1 | `docs/contratos/fontes.md:16` | Diz "o corpo é guardado como veio (`jsonb`)". Desde este cartão, só o registro da allow-list é gravado. É o I-3 do parecer de segurança. | "só o registro da allow-list (ADR 0020, 4f); o `payload_sha256` é o do corpo bruto; tipo fora de `TIPOS_EVENTO_WEBHOOK` recebe 202 e não grava". | bloqueia |
| 2 | `docs/contratos/fontes.md:20-21` | A seção "Allow-list de campos [planejado]" diz que a lista não existe e que "o staging guarda o payload bruto". | Mudar para "[implementado] para `stg_card`, `stg_revision` e `stg_webhook_evento`", apontando `server/src/modulos/businessmap/allow-list.ts` e a ADR 0020. Manter "[planejado]" para `stg_bloqueio`, `stg_custom_field`, `stg_vinculo` e `stg_coluna`, com escrita negada até haver lista (B-K3). | bloqueia |
| 3 | `docs/architecture/server.md:170` | Diz "o dado bruto segue em `stg_webhook_evento`". | Trocar por "o registro filtrado (ADR 0020, 4f) segue em `stg_webhook_evento`". Na mesma seção, uma linha sobre `gravarStgRevision` e `gravarResponsaveis` (a 4b: responsáveis só em `dim_card` e `dim_card_versao`). | bloqueia |
| 4 | ADR 0020 (fora do diff) | O código cita a ADR 0020 em todo comentário, mas a ADR não está versionada: está só como arquivo não rastreado no diretório principal e não existe na `develop` nem nesta branch. | O software-architect versiona a ADR 0020 (revisão 1) e o parecer `docs/security/adr-0020-protecao-de-pessoa.md` na `develop` antes do merge do K-084, ou nesta mesma branch. Não é defeito do autor, mas é **pré-condição do PR**. | bloqueia o PR (não o código) |
| 5 | `server/src/modulos/businessmap/allow-list.ts:72-76` | `child_card_stats` copia **qualquer chave** cujo valor seja número ou booleano. A lista é fechada no tipo, mas não no nome, e um id numérico de pessoa numa subchave nova entraria. Além disso, a ordem das chaves é a da resposta da API, e por isso o hash de dedupe pode variar sem mudança real e gerar uma versão nova em `stg_card`. | Enumerar as subchaves depois do spike (como `CAMPOS_CARD`) e montar o objeto nessa ordem. Até lá, ordenar as chaves (`Object.keys(stats).sort()`) para o hash ficar estável. Avisar o security-engineer da lista quando ela existir. | recomendado (pré-condição do cartão do cliente da API) |
| 6 | `server/src/modulos/businessmap/responsaveis.ts:36-41` | Se `vigenteDe` for igual ao `vigente_de` da versão vigente, o `ON CONFLICT DO NOTHING` não insere nada, o `UPDATE` em `dim_card` acontece, e projeção e histórico divergem (é a observação funcional do parecer de segurança). Se `vigenteDe` for **anterior** ao da vigente, entra uma versão "no passado" com o conjunto novo, e o SCD2 fica fora de ordem. | Exigir `$2 > v.vigente_de` no `WHERE` e só atualizar `dim_card` quando a versão entrar (ou devolver o motivo). Teste de borda para os dois casos (igual e anterior). | recomendado |
| 7 | `server/src/modulos/businessmap/responsaveis.ts:14-16` | `COLUNAS_VERSAO` é uma cópia à mão das colunas de `dim_card_versao`. Uma migração futura que acrescente uma coluna deixaria a coluna nula na versão copiada, sem nenhum aviso. | Teste `.pg` que compara `COLUNAS_VERSAO` com `information_schema.columns` (menos as chaves, `responsaveis` e as colunas de coleta). | recomendado |
| 8 | `server/src/modulos/businessmap/staging.ts:8-19` | Dois blocos JSDoc seguidos antes de `EntradaStgCard`: o primeiro descreve `gravarStgCard` e ficou desligado da função. | Mover o primeiro bloco para cima de `gravarStgCard` (ou juntar os dois). | recomendado |
| 9 | `server/src/modulos/businessmap/index.ts:3,5` | O índice exporta `TIPO_EVENTO_WEBHOOK` (o tipo do evento da outbox, `bm.webhook.recebido`) e `TIPOS_EVENTO_WEBHOOK` (os tipos de evento do BusinessMap que são gravados). Os nomes diferem por um `S`, e o significado é outro. | Renomear o segundo para `TIPOS_WEBHOOK_BM_GRAVADOS` (ou parecido). | recomendado |

## Checklist (leitura)
1. **Escopo.** Faz o que o cartão pede: 4a, 4b, 4c, 4d e 4f. O que falta (4a `fields=`, 4b "na mesma execução") depende do cliente e do worker, que ainda não existem (I-2 da segurança). Fica como critério de pronto desses cartões.
2. **ADRs e regras invioláveis.** Nenhuma pessoa chega à staging. `responsaveis` vai só para as colunas de `COLUNAS_PESSOA`, que o `dspd_api` não lê. Append-only preservado: `dim_card_versao` só recebe `INSERT`, e o `UPDATE` vai para a projeção `dim_card`. Idempotência com `ON CONFLICT ON CONSTRAINT ... DO NOTHING` e alvo explícito. Não há cálculo de métrica, então a T2.5 não se aplica.
3. **Legibilidade.** Boa: há uma constante por entidade, as funções `registro*` são puras, e os comentários apontam o item da ADR. Ressalvas nos itens 8 e 9.
4. **Tipos e erros.** Entrada `unknown`, estreitada com guardas, sem `any` nem cast. O webhook falha fechado (`ignorado`, 202), e o log leva só o tipo validado por regex.
5. **Segurança.** Parecer próprio, aprovado. B-K2 (erro do `jsonb` ecoa trecho no log) e B-K3 (demais `stg_` sem lista) são pré-condição do cartão do worker. Esta revisão acrescenta o item 5 sobre as subchaves de `child_card_stats`.
6. **Performance.** O `INSERT ... SELECT` de `gravarResponsaveis` usa uma subconsulta `max(vigente_de)` por `card_id`, coberta por `uq_dim_card_versao` (`card_id`, `vigente_de`). É uma consulta por card, sem N+1 novo.
7. **Testes.** Os proibidos estão escritos à mão (não derivam da constante), o marcador é procurado em todos os níveis, e o `.pg` usa o papel real e confere o payload gravado campo a campo. Faltam as bordas do item 6.
8. **Acessibilidade.** Não se aplica (sem front).
9. **Commits.** Conventional Commits e `Cartão: K-084`. O corpo de 5352a67 está sem acentos ("seguranca"); é cosmético e não vale reescrever.
10. **Documentação.** Itens 1 a 4.
11. **Testes de ausência.** `PROIBIDOS` e o marcador procuram texto que existe no fixture, e cada `expect(...).not.toContain` tem um positivo correspondente no mesmo teste.

## Para aprovar
Um commit `docs(...)` do autor com os itens 1 a 3, e a ADR 0020 versionada (item 4). Os itens 5 a 9 podem ir como `fix(...)` neste cartão ou virar cartão próprio, a critério do autor e com registro no quadro. O item 5 é pré-condição do cartão do cliente da API. Depois disso, a volta 2 relê só o delta.
