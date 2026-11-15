---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-release
commit: 4d89240da40fb458d2c4b607c52b887219e15229
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-15
---
# Review de segurança: release 105 (develop 4d89240d contra main b01a9d6a, PRs 418 a 469)

Propósito: parecer de segurança da release 105 (E5.15), para o dono validar. Li `git diff origin/main...origin/develop` pelos gatilhos: `server/src`, `server/migrations`, `packages/contratos`, `.github/`, manifestos e lockfile, e a web quanto a armazenamento do navegador. O Revisar-sha é a cabeça da develop, `4d89240d` (inclui o PR 469, que estava aberto no início e foi mesclado às 21:35Z). A branch `docs/105-release` já traz a develop `4d89240d` (merge `25c46a04`) e soma só o CHANGELOG, `docs/devops/105-roteiro-dono.md` e os pareceres da release (documentação); o push recusado por corrida foi resolvido com `git merge --no-edit origin/docs/105-release`. Os lotes com parecer próprio em `docs/security/` (por exemplo `105-reprojetar-fluxo.md`, `aprovado`) valem pelo diff entre o commit do parecer e a develop, sem refazer as sondas. Nada rodou contra a base real e nenhum `.env*` foi lido.

## Gatilhos
- Migração nova: `server/migrations/0038_ac_dim_chamado_fluxo.ts`, ainda não aplicada na base real.
- Fronteiras de coleta: allow-list do BusinessMap (`server/src/modulos/businessmap/allow-list.ts`, etiquetas como classe, E7.3) e do Acelerato (`server/src/modulos/acelerato/normalizador.ts`, `fluxo` e `primeiro_atendimento_em`); caminho novo `/tags` e `tag_ids` em `server/src/plataforma/http.ts`.
- GRANT por coluna da API: `server/src/plataforma/db/grants.ts` (`dim_card.quadro_id` e `ref_dominio`, K-337).
- Entradas com credencial: `ac:reprojetar-fluxo` (migrador) e `bm:d1-comment` (só GET, sem banco).
- Log de erro 5xx sem mensagem (`server/src/plataforma/erros.ts`, K-347); workflow `.github/workflows/restauracao.yml` (uma linha).
- Dependências: nenhum manifesto de dependência nem lockfile mudou (`server/package.json` ganha só dois scripts).

## Resultado
- **Migração 0038: conforme.** DDL fixa, só o esquema interpolado: `ADD COLUMN IF NOT EXISTS fluxo text NULL` em `dim_chamado`; sem `DEFAULT`, sem reescrita de linha, sem `DROP`; `down` só tira a coluna derivada. Valor é `descricao_workflow` de domínio fechado, nunca texto livre nem pessoa. Checksum em `server/migrations/checksums.json`. A aplicação na base real é ação do dono (roteiro do CHANGELOG), com o migrador; o migrador reaplica os GRANTs ao fim.
- **Allow-list do Acelerato: conforme.** O normalizador só ganha `data_primeiro_comentario` (instante; nunca autor nem texto) e o `fluxo` (único workflow das etapas, ou nulo). `Contadores.somarChamado` guarda em memória o par chave e id do chamado só para contar distintos; o id não vai a SQL, log nem saída. Nome, e-mail, `usuarioKey`, título e descrição continuam fora.
- **Allow-list do BusinessMap: conforme.** `tag_ids` e o catálogo `/tags` existem só em memória da coleta; ao staging vai apenas `classes_tag`, com códigos de `CLASSES_SERVICO` (`allow-list.ts:98-140`): rótulo, id de etiqueta, cor e contagem morrem na hora, rótulo acima de 120 caracteres é recusado e id não numérico é descartado. `/tags` entra em `CAMINHOS_PERMITIDOS` só como GET sem consulta (`http.ts:17`), `tag_ids` na lista fechada de `expand`. O teto de 50 páginas de `/tags` (`tags.ts`) evita laço. `d1-comentario.ts` lê o `comment` do worklog só para contar presença e vazio (`CAMPOS_WORKLOG` traz o campo), e a saída é de quatro números; o erro sai por código fechado, nunca pela mensagem. `classe_servico` e `fase_deteccao` saíram de `COLUNAS_LISTA` (uma fonte por coluna), o que reduz a superfície.
- **Projetor de fase de detecção: conforme.** `projetarFasesDeteccao` usa SQL parametrizado (só `S.bm` e listas de colunas constantes interpoladas), só escreve `fase_deteccao` por `UPDATE ... IS DISTINCT FROM` e insere nova versão em `dim_card_versao` com `ON CONFLICT DO NOTHING`; não apaga nem altera versão existente (histórico preservado). Notas só com contagem, nunca id de card.
- **`ac:reprojetar-fluxo` (PR 469): conforme, parecer próprio `aprovado` com revalidação, CI do head verde.** O `UPDATE` só toca `fluxo IS NULL` e só grava resultado não nulo, em transação única, parametrizado; só contagens saem; sem GRANT, migração, dependência nem fronteira nova. A diferença entre `ceb86877` e a develop é só documentação e CHANGELOG (`git show --stat origin/develop` do merge mostra os arquivos).
- **GRANT por coluna da API: conforme.** `grants.ts` só soma `bm.dim_card.quadro_id` e `bm.ref_dominio` (`campo, codigo, rotulo, ordem, vigente_ate`) à lista de colunas do apontamento; nenhuma coluna de pessoa (`COLUNAS_PESSOA` intacta), `dim_card.titulo` já constava. `dspd_api` segue sem ler nome, e-mail nem `usuarioKey`. As colunas novas de `dim_card` e `dim_chamado` (`classe_servico`, `fase_deteccao`, `origem_bug`, `fluxo`) são de domínio fechado.
- **Log de erro: conforme (melhora).** Em qualquer 5xx o log leva só tipo e código (`erros.ts:31-52`), sem a mensagem do banco, que pode trazer valor de linha.
- **Workflow `restauracao.yml`: conforme.** A única mudança é a sonda `pg_isready` (host `127.0.0.1`, banco `metricas`); `permissions`, ações e segredos não mudam. Porta do container segue em `127.0.0.1`.
- **Web: conforme.** Nenhum `dangerouslySetInnerHTML`, `innerHTML` nem `eval` nas linhas adicionadas; o `localStorage` só aparece em testes (`afterEach` de limpeza). Sem campo de pessoa novo.
- **Nenhum segredo: conforme.** Busca nas linhas adicionadas fora de `docs/` e Markdown por apikey, token, senha, password, secret, chave privada, `ghp_`, `AKIA`, URL com credencial, e-mail e `usuarioKey`: só leitura de configuração (`cfg.BUSINESSMAP_APIKEY`, que vem do `.env`), comentários e sentinelas de teste (`postgres://segredo@host/db`, `x@y.com`, `a@b.c`).
- **Regras invioláveis: conforme.** BusinessMap e Acelerato seguem em módulos e tabelas separados (`bm`, `ac`); nenhuma visão por pessoa, ranking nem comparação entre times foi adicionado; carga incremental sem sobrescrever histórico (versões só inseridas).
- **Árvores de homolog e main (prova do assistente de 15/11, conferida).** `git rev-parse origin/homolog^{tree}` e `origin/main^{tree}` dão ambos `ae5fbd1599b257ec292b99d4a73e17867c93d74f`, e `git diff origin/homolog origin/main` é vazio. `git merge-tree --write-tree origin/main origin/develop` e `git merge-tree --write-tree origin/homolog origin/develop` dão a mesma árvore, `8c99c2ac224d5bb86bab3551eee3196fc45591df`, sem conflito: mesclar a develop na homolog e depois na main equivale a mesclar direto na main.
- **Suíte:** não rodei a suíte; CI da develop em `4d89240d` (run 43764517252): `success`, inclusive o job `banco` com os `.pg`. A branch `docs/105-release` só difere em documentação; o portão da `homolog` roda a suíte e a migração a partir da main.
- **Lacunas de ferramenta:** `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` não estão no PATH; não rodei nenhum. Sem dependência nova e com uma linha de workflow alterada, as varreduras ficam com o job `seguranca` do CI (verde no head da develop).

## Triagem dos alertas do Dependabot (2 abertos na branch padrão)
- **#29 `minimatch` (GHSA-g3hv-75wg-m249, média, negação de serviço por amplificação de partes do padrão; corrigido em 11.0.1).** Versões no lockfile: 3.1.5 e 10.2.6 (a 11.0.8 já presente não é a vulnerável). A 3.1.5 vem só do eslint (desenvolvimento) e a 10.2.6, do typescript-eslint (desenvolvimento) e do `glob` 13.0.6. Em produção alcança só pelo caminho `server -> node-pg-migrate -> glob -> minimatch`. Alcance real: o padrão é do código do runner (`ignorePattern` e `dir` fixos em `server/src/plataforma/db/migrar.ts:87-92`), nunca entrada de usuário, e o migrador roda sob demanda com credencial do dono. Sem caminho de ataque. Ação recomendada: aguardar a atualização do `node-pg-migrate` ou do `glob` (Dependabot) e, se o gerenciador de pacotes permitir, um `overrides` para `minimatch` 11 depois de a suíte de migrações passar; não bloqueia a release.
- **#27 `glob` (GHSA-3g3m-2fjr-6pw4, média, cancelamento por `AbortSignal` não impede a varredura do sistema de arquivos depois do tempo limite; corrigido em 14.0.2).** Versões: 7.2.3 (só `rimraf` do `@lhci/cli`, ferramenta de desenvolvimento do `e2e`) e 13.0.6 (do `lighthouse` e do `@sentry/bundler-plugins`, desenvolvimento, e do `node-pg-migrate`, produção). Alcança produção só pelo migrador; o nosso uso não passa `AbortSignal` (`grep signal` em `migrar.ts` vazio) e a varredura é do diretório fixo de migrações. Sem caminho de ataque. Ação recomendada: igual à anterior; o pacote vulnerável não roda no processo da API, só no comando de migração.
- Os dois se resolvem juntos com um `node-pg-migrate` que use `glob` 14. Nenhum bloqueia a release.

## Achados
- A1 (recomendado) pnpm-lock.yaml:3517 · alertas #27 (`glob`) e #29 (`minimatch`) alcançam produção só via `node-pg-migrate` (migrador), sem entrada externa nem `AbortSignal`; atualizar quando o `node-pg-migrate` sair com `glob` 14. Dono: devops-engineer.
- A2 (recomendado) .github/workflows/ci.yml:186 · herdado das releases 101, 103 e 104: a guarda `web/scripts/sem-mock.mjs` não roda na CI. Dono: devops-engineer.
- A3 (recomendado) server/src/modulos/referencia/setor.ts:11 · herdado da release 104: o guarda de sobrenome do setor é lista negativa; sem efeito enquanto o dicionário de setores estiver vazio. Fechar antes de o dono preenchê-lo. Dono: node-backend.

## Sondas

## Detalhe dos achados
- A1: caminho de ataque inexistente hoje (quem controlaria o padrão ou o sinal seria quem já tem a credencial do migrador). Severidade informativa; correção mínima: aceitar o PR do Dependabot quando houver, ou `overrides` do gerenciador de pacotes para `glob` 14 e `minimatch` 11 com a suíte de migrações verde; esforço P.
- A2 e A3: os mesmos textos dos pareceres de 104 (`docs/security/104-release.md`), sem mudança de estado.

## Riscos aceitos e ferramentas
Nenhum risco aceito; o parecer é `aprovado`. Ferramentas: só leitura estática, `git`, `gh api` (alertas do Dependabot) e a árvore de dependências do gerenciador de pacotes. Faltaram no PATH `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy`.
