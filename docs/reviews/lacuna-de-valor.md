# Code review: lacuna de valor, PV1 (K-036) e acabamento das métricas (rodada 1)

- Branch: `feature/lacuna-de-valor` (comparada com `origin/develop`, até `b20b95e`, 31 commits)
- Revisor: tech-lead · Data: 2026-10-12
- Referências: `CLAUDE.md`, `docs/architecture/features/lacuna-de-valor.md`, `docs/alinhamentos/2026-10-11-decisoes-delegadas-ao-time.md` (22 a 31), `docs/engineering/praticas.md`, `docs/ux/lacuna-de-valor/06-revisao.md`
- Fora do escopo: os achados M-1 a M-3 da revisão de UX em `web/src/features/percepcao/`, que o react-frontend corrige em paralelo nesta rodada (as alterações dele ainda não estão commitadas e não foram revisadas aqui).

## Parecer

**Ajustes necessários.** Há 1 bloqueante (a senha do papel novo em homologação) e 5 importantes. Os demais pontos são menores. As regras invioláveis, o append-only, os grants e a carga segura estão conformes.

`pnpm run pronto` na árvore de trabalho falhou no `format:check` por causa de `web/src/features/percepcao/Tendencia.tsx`. Esse arquivo é edição em curso do react-frontend e não está commitado. No commit `b20b95e`, numa worktree limpa, o `pronto` passou com cobertura de 100% em todos os pacotes. O `test:pg` local falhou nos 7 testes de `pesquisa.pg.test.ts` por causa do ambiente (ver I-1). `pnpm run docs:check` passou: 335 páginas, 51 métricas, 2 eventos.

## O que foi verificado e está conforme

| Item | Situação |
|---|---|
| Nada individual | Nenhuma tabela `pesq_*`/`ref_pesq_*` tem coluna de pessoa ou de respondente. O PG testa isso por nome de coluna (`server/tests/pesquisa.pg.test.ts:131-132`). Áreas saem em ordem alfabética fixa, sem ranking, média, nota, meta nem semáforo. O schema é `.strict()` e a ordem é conferida por refinamento (`packages/contratos/src/schemas.ts:1270-1281`). |
| Resposta individual e comentário | Só entram contagens agregadas. O cabeçalho do CSV é fixo (`COLUNAS_CSV_PESQUISA`), e coluna a mais, aspas ou `@` recusam o arquivo inteiro (`tools/pesquisa/src/csv.ts:39-60`, `packages/contratos/src/pesquisa.ts:24-31`). O único texto livre é o `o_que_mudou`, escrito pela coordenação, com CHECK de e-mail e URL no banco (`server/migrations/0013_core_pesquisa.ts:7,34`). |
| < 20 sem percentual | Toda contagem passa por `core/estatistica.taxa`, e o `taxaSchema` recusa `pct` com n < 20. Os mínimos 5 e 3 estão no próprio schema, então `base-insuficiente` não carrega faixas. A propriedade P7 cobre 300 bases aleatórias (`packages/metricas/src/regras.property.test.ts:692-748`). |
| A10 (supressão complementar) | `agruparAreas` (`packages/metricas/src/pesquisa/anonimato.ts:87-114`). O schema recusa resto 1 ou 2 (`schemas.ts:1283-1294`). A propriedade testa qualquer subconjunto de grupos publicados (`regras.property.test.ts:732-737`): se a regra quebrar, o teste falha. |
| Fontes nunca misturadas | `FonteMetrica` fica fora de `Dominio`, e `fonteDaMetrica` é o ponto único. Os pontos binários "sustentação senão fluxo" foram migrados nos pacotes, no server, nas tools e no web. A PV1 está fora da calibração (`core/calibracao.ts:17`), da Visão geral (enum `.exclude(['PV1'])`) e da exportação (erro explícito em `exportar/modelo.ts`). O serviço monta `bm`/`ac` vazios para a PV1 (`servico.ts:149-171`). |
| T2.5 / T2.6 | Só `taxa`, `criteriosDe` e calendário da biblioteca. Questionário novo = `ref_versao_criterio` com `dominio = 'pesquisa'` e marca na tendência. |
| Append-only | Gatilho `appendOnly` nas três `pesq_*`. Uma carga só pode ser substituída uma vez (`uq_pesq_carga_substitui`), e a cadeia de substituição só aponta para cargas anteriores (CHECK `substitui_carga_id < carga_id`). O teste PG prova `UPDATE`/`DELETE`/`TRUNCATE` recusados até para o dono (55000/0A000) e 42501 para `dspd_pesquisa` (`pesquisa.pg.test.ts:80-88`). |
| Grants | `dspd_pesquisa`: `USAGE` só em `dspd_core`, `SELECT, INSERT` em `pesq_*` e `SELECT` em `ref_pesq_*`/`ref_versao_criterio*`. O `SELECT` em `pesq_*` é necessário para a idempotência e o `RETURNING`, e está de acordo com o plano 2.2. `dspd_api` só tem `SELECT`. O coletor não lê `pesq_*`. Tudo testado em PG (`pesquisa.pg.test.ts:90-101`). |
| Carga segura | Validador puro antes de qualquer escrita. Tudo roda numa transação com `pg_advisory_xact_lock` por trimestre. Lotes parametrizados: 2000 linhas × 25 parâmetros cabem no limite do PG. O identificador do schema é validado (`esquemaCoreDe`). Erros saem só com linha, coluna e regra, e o nome de coluna desconhecida vira `(nome inválido)`. `main.ts` só imprime `e.message`. A idempotência é por `sha256` contra a carga vigente. |
| Cobertura | `tools/pesquisa` com limite de 100% (`tools/pesquisa/vitest.config.ts:12`); só `main.ts` fica fora. Os demais pacotes mantêm os limites. |
| Mock | Stream próprio `derivar(semente, 'pesquisa')`, sem tocar a `BaseMock`. Os hashes antigos estão intactos e a pesquisa tem hash próprio. |
| Acabamento das métricas | P1 decidida (decisão 9): `pendente-usuario` saiu de O1, O2, BLOQUEADOS, O10, T4, T7 e T9 com `incluiArquivados: true`. O meta-teste "status pendente se e somente se há célula pendente" continua valendo. L-1 e L-7: `LinkO15` vira texto quando o O15 está oculto. |

## Achados

### Bloqueante

**B-1. O papel `dspd_pesquisa` nasce com a senha `pesquisa_dev` em homologação, e a proteção contra senhas de dev não pega.** Responsável: node-backend (código) + **usuário** (arquivos de exemplo).
- `docker/postgres/init/01-databases-papeis.sh:9`: `-v pwd_pesquisa="${DSPD_PWD_PESQUISA:-pesquisa_dev}"`. É o único papel com valor padrão no script de init. Os outros falham por `set -u` quando a variável falta.
- `docker-compose.homolog.yml:13-19`: não repassa `DSPD_PWD_PESQUISA` ao contêiner do Postgres, então o init de homologação usa sempre `pesquisa_dev`.
- `tools/homolog/src/ambiente.ts:5-13`: `SEGREDOS_OBRIGATORIOS` não tem `DSPD_PWD_PESQUISA`, então `validarEnv` e o teste `artefatos.test.ts:46-51` (que proíbe `_dev` no compose) passam: o padrão está no script de init, não no compose.
- `.github/workflows/homolog.yml:222`: o laço que gera os segredos do `.env.homolog` também não inclui a variável.

Resultado: em homologação, um papel com `INSERT` em `pesq_*` tem senha conhecida, publicada no repositório. As portas só abrem em 127.0.0.1, mas a regra do projeto ("senha de dev nunca vale em homologação") fica quebrada sem nenhum teste falhar.

Correção:
1. Tirar o padrão do script de init: `-v pwd_pesquisa="$DSPD_PWD_PESQUISA"`. O padrão de dev já vem do `docker-compose.yml:18`.
2. `DSPD_PWD_PESQUISA: ${DSPD_PWD_PESQUISA:?defina no .env.homolog}` no `docker-compose.homolog.yml`.
3. `'DSPD_PWD_PESQUISA'` em `SEGREDOS_OBRIGATORIOS`.
4. A variável no laço de `homolog.yml:222` e `DSPD_PWD_PESQUISA: pesquisa_dev` nos blocos `env` da CI (`ci.yml:126-131`, `homolog.yml:107-112` e `208-213`), que hoje só funcionam por causa do padrão do item 1.
5. Teste novo em `tools/homolog`: toda `DSPD_PWD_*` usada em `01-databases-papeis.sh` está em `SEGREDOS_OBRIGATORIOS`, e o script não tem `:-` com valor padrão. Esse teste teria pegado a falha.

**Bloqueio do usuário:** o item 3 faz falhar `artefatos.test.ts:59-65` até que `.env.homolog.example` tenha a linha `DSPD_PWD_PESQUISA=`. O `.env.example` também precisa de `DSPD_PWD_PESQUISA=` (plano 2.2), e o guia de carga já cita a variável. O `.claude/settings.json` nega a leitura e a edição de `.env.*`, inclusive dos `*.example`, então **nenhum agente consegue fazer essa mudança: o usuário precisa acrescentar `DSPD_PWD_PESQUISA=` (sem valor) aos dois arquivos de exemplo** ou liberar a edição deles. Também é preciso definir um valor forte no `.env.homolog` local de quem usa `homolog:subir`. Os itens 1, 2, 4 e 5 podem ser feitos antes, e o item 3 entra no mesmo commit da mudança dos exemplos.

### Importante

**I-1. Volume já existente: `db:migrate` quebra com "role dspd_pesquisa does not exist".** Responsável: node-backend.
`server/src/plataforma/db/grants.ts:23,32,34` incluem `dspd_pesquisa` no `REVOKE ... FROM ..., dspd_pesquisa` e no `GRANT USAGE`. Esses comandos rodam a cada migração (`migrar.ts:34`). O init do Compose só roda em volume novo, então o volume de dev de quem já tem o banco, e o de homologação local se não for recriado, falham na primeira migração depois do merge. O guia (`docs/engineering/carga-da-pesquisa-de-percepcao.md`, "Antes da primeira carga" 1) traz o `CREATE ROLE` manual, mas o erro aparece antes de alguém ler esse guia.
Evidência: no volume de dev compartilhado, o papel `dspd_pesquisa` existe, mas sem `CONNECT` em `metricas` nem em `metricas_test`. O `test:pg` falha nos 7 testes da pesquisa com `permission denied for database`, e os outros 48 passam. O guia só manda `GRANT CONNECT ON DATABASE metricas`: falta `metricas_test`.
Sugestão: no guia, incluir `metricas_test`. Antes dos grants, checar `pg_roles` e, se faltar papel, falhar com uma mensagem que aponte o passo do guia (o migrador não deve criar papel com senha). Registrar o passo em `docs/engineering/fluxo-homologacao.md` e no texto do PR.

**I-2. A `dataReferencia` permite comparar a carga substituída com a que a substituiu, o que pode revelar as respostas de 1 ou 2 pessoas.** Responsável: software-architect + **pergunta ao usuário**.
`packages/metricas/src/pesquisa/pv1.ts:140-148` escolhe a carga vigente "recebida até o corte". No mock, a 2026-T2 tem a carga 5 (n=17, recebida em 08/07) e a carga 6 (n=19, recebida em 20/07) (`packages/mock/src/pesquisa.ts:85`). Com `dataReferencia=2026-07-10` a rota mostra n=17, e depois de 20/07 mostra n=19. Um reenvio que só acrescenta 2 respondentes atrasados expõe as faixas desses 2 por subtração, no consolidado e na área. É a mesma fuga que a A10 fecha dentro de um ciclo, agora entre duas versões de um mesmo trimestre. A P7 não cobre esse caso: cada trimestre tem uma carga só e `hoje` é sempre a última data.
Isso não se resolve por inferência, porque há uma troca entre reprodutibilidade (ver o painel como estava na data) e anonimato. Opções a levar ao usuário:
- (a) a vigente de um trimestre é sempre a mais recente, qualquer que seja o corte (a substituída fica guardada na base, mas nunca é publicada);
- (b) publicar a substituída só se a diferença em cada grupo for 0 ou maior ou igual a 3;
- (c) aceitar o risco e registrá-lo.

Até a decisão, o padrão mais restritivo é (a), com teste de propriedade para dois reenvios. Registrar em `docs/security/`.

**I-3. O mock usa 4 perguntas fora da decisão 22.** Responsável: node-backend.
`packages/mock/src/pesquisa.ts:25-30` tem `informado`, `prioridades`, `previsibilidade` e `valor`. A decisão 22 e o plano 2.1 definem as 5 perguntas da ideação: `resolve`, `prazo`, `informado`, `nao_volta`, `confianca`. A nota do cartão diz "cinco perguntas fechadas" (`web/src/features/percepcao/notas.ts`), o que contradiz o painel de dados fictícios que o usuário vai validar.
Sugestão: usar as 5 perguntas e os textos da decisão 22 (v2 muda só o texto de `informado`) e atualizar o hash próprio da pesquisa, a fotografia `docs/contratos/snapshots/resultados/PV1.json` e o E2E que depender dos textos.

**I-4. Teste de desempenho C6/009: "melhor de 3 medianas" afrouxa a proteção.** Responsável: react-frontend (dono de `e2e/perf`) + qa-engineer.
`e2e/perf/perf.spec.ts:62-81`: o limite de 200 ms não mudou, mas o critério virou "repetir enquanto falhar, até 3 vezes, e valer o menor resultado". Para uma regressão intermitente real, em que cerca de 60% das cargas passam de 200 ms, uma rodada falha com probabilidade de aproximadamente 0,68. Antes, o teste pegava a regressão nessa proporção. Agora, para pegá-la, as 3 rodadas precisam falhar: 0,68³ ≈ 0,31. A chance de deixar passar subiu de cerca de 32% para cerca de 69%. Além disso, as rodadas descartadas não aparecem no relatório.
Alternativa proposta:
- (a) Mediana **agregada** de todas as amostras coletadas (até 15), no lugar da melhor rodada. O ruído de uma rajada fica diluído, e uma regressão que aparece na maioria das cargas continua acima de 200 ms.
- (b) Registrar no `resultado.json` todas as rodadas e o p85 agregado, para dar visibilidade à tendência.
- (c) Na CI, onde o runner é estável e exclusivo, `PERF_RODADAS_C6=1`. Hoje nenhuma variável é definida na CI.
- (d) Localmente, o problema é concorrência entre processos. Rodar `test:perf` sob o mesmo `flock /tmp/metricas-pesado.lock` dos agentes ataca a causa em vez de tolerar o sintoma.

**I-5. Revisão de segurança do B4 não registrada.** Responsável: software-architect.
Os planos 9 R3 e R5 preveem registrar em `docs/security/` o papel `dspd_pesquisa`, o risco aceito do texto livre "O que mudou", a execução da carga em produção (P11) e agora o I-2. `grep` em `docs/security/` não encontra nenhuma menção a pesquisa ou PV1.

### Menor

- **m-1.** `tools/pesquisa/src/csv.ts:33-35`: dois JSDoc empilhados. O de `nomeSeguro` ficou acima de `respondentesDe`. Mover o comentário para cima de `nomeSeguro` (linha 37). Responsável: node-backend.
- **m-2.** `server/tests/pesquisa.pg.test.ts:131`: `table_schema = $1 AND table_name LIKE 'pesq\_%' OR table_name LIKE 'ref\_pesq\_%'`. Pela precedência, o `OR` varre `ref_pesq_*` de **todos** os schemas. O teste passa, mas não restringe o que diz. Usar parênteses. Responsável: node-backend.
- **m-3.** `server/tests/pesquisa.pg.test.ts:4` importa `../../tools/pesquisa/src/carga.ts`, e por isso `server/tsconfig.json:5` ganhou `allowImportingTsExtensions` para o pacote inteiro. Isso acopla o server à tool. Preferível declarar `@metricas-dspd/pesquisa` como devDependency do server, ou mover o teste PG da carga para `tools/pesquisa` com o `ctx` de PG. Responsável: node-backend.
- **m-4.** `server/migrations/0013_core_pesquisa.ts:70`: a `vw_pesq_vigente` não é lida pela API (o repositório lê todas as cargas e a biblioteca decide, `repositorio-pesquisa.ts:32-34`). Ela só serve aos testes. Ou o plano 2.1 ("usada pela API") passa a dizer isso, ou a view sai numa migração futura. Não editar a 0013 depois de aplicada. Responsável: software-architect (documentação).
- **m-5.** `server/src/modulos/metricas/repositorio-pesquisa.ts:27`: o rótulo da área é o de maior `vigente_de` e ignora `vigente_ate`. Uma área encerrada ainda dá rótulo às cargas antigas, o que está correto, mas isso não está documentado. Um comentário basta. Responsável: node-backend.
- **m-6.** `tools/pesquisa/src/carga.ts:263`: a idempotência é só pelo `sha256` do CSV. Reenviar o mesmo arquivo com outro texto em "O que mudou" devolve `ja-carregada` e o texto novo é descartado em silêncio. Sugestão: incluir o texto no hash ou avisar "o arquivo é o vigente; o texto não foi alterado". Responsável: node-backend.
- **m-7.** `server/tests/pesquisa.pg.test.ts:26` e `server/tests/pg/ctx.ts:16` usam `||` para a senha da pesquisa e `??` para os demais papéis. Isso some quando o B-1 for corrigido: com a variável sempre definida, usar `??` como nos outros. Responsável: node-backend.
- **m-8.** `e2e/tests/lacuna-de-valor.spec.ts:158,168`: LV-11 e LV-12 continuam `test.fixme` com o motivo "aguarda F1 e B3", e os dois já foram entregues. A rota existe, então dá para simular o estado com `page.route`, ou registrar o novo motivo (o front usa o mock em memória). Responsável: qa-engineer.
- **m-9.** `web/src/features/catalogo/linhas.ts:28,39`: a PV1 aparece como grupo "Núcleo" no `/metricas`, e o comentário diz isso. Ela não é do briefing (L-9 da UX). Sugestão: um grupo "Percepção", ou mudar só o comentário se o usuário preferir. Responsável: react-frontend.
- **m-10.** Pendências de regra U1 (lista oficial de áreas), U2 (mostrar o total com base insuficiente, contra o "sem número" da decisão 24) e U3 ("Concordam" = 4+5) seguem provisórias. Precisam constar como pendências do usuário no texto do PR. Responsável: tech-lead (PR).

## Execução

- `pnpm run docs:check`: ok.
- `pnpm run pronto` na árvore de trabalho: falhou no `format:check` (`web/src/features/percepcao/Tendencia.tsx`, edição do react-frontend ainda não commitada; ele deve rodar `prettier --write` antes do commit).
- `pnpm run pronto` em worktree limpa no `b20b95e`: verde (lint, format, typecheck, build e cobertura de 100%). Contagens: contratos 41, mock 156, metricas 503, tools/pesquisa 32, server 278 (55 PG pulados), web 752 e docs-contratos 102 testes. Bundle: F6 186,80 KB < 200, F8 111,62 KB, F9 9,80 KB, F11 132,64 KB.
- `scripts/test-pg.sh` na mesma worktree, contra o PG de dev compartilhado: 48 passaram e os 7 de `pesquisa.pg.test.ts` falharam por falta de `CONNECT` do papel no volume antigo (I-1). Não é defeito do código, mas a evidência PG da carga precisa ser refeita pelo QA (Q2) num banco com o papel criado pelo init ou com o passo do guia corrigido.

## Próximos passos

1. node-backend: B-1 (itens 1, 2, 4 e 5), I-1, I-3, m-1 a m-3, m-5 a m-7.
2. Usuário: `DSPD_PWD_PESQUISA=` em `.env.example` e `.env.homolog.example` (bloqueio de permissão), e a decisão do I-2.
3. software-architect: I-2 (levar as opções ao usuário), I-5, m-4.
4. react-frontend: I-4 junto com o QA, m-9, e a formatação de `Tendencia.tsx`.
5. qa-engineer: m-8, e Q2 depois dos ajustes.
6. Rodada 2 de review só sobre os ajustes.

## Rodada 2: correções (node-backend, 2026-10-12)

| Achado | Correção | Commit |
|---|---|---|
| B-1 | Init sem `:-`; `DSPD_PWD_PESQUISA: ${...:?}` no compose de homologação; em `SEGREDOS_OBRIGATORIOS`; no laço de segredos de `homolog.yml` e nos blocos `env` da CI. Testes novos: `validarEnv` falha sem a variável ou com `pesquisa_dev`; todo `DSPD_PWD_*` do init está nos segredos, no compose e no laço da CI, e o init não tem padrão. **Pendente do usuário:** linha `DSPD_PWD_PESQUISA=` em `.env.example` e `.env.homolog.example` (o teste do exemplo de homologação tem uma exceção temporária `AGUARDA_EXEMPLO_DO_USUARIO`, a esvaziar quando a linha entrar) | `0f58624` |
| I-1 | `verificarPapeis` antes do `up`: papel ausente falha com a mensagem do passo de reparo; sem `CONNECT` avisa. Script idempotente `docker/postgres/reparar-papeis.sh` (cria o papel e dá `CONNECT` em `metricas` e `metricas_test`). Guia e fluxo de homologação atualizados | `d23567d` |
| I-2 | Decisão do time (a): sempre a última carga do trimestre; `dataReferencia` só decide se o trimestre existia. Teste sobre o mock e propriedade P7b com até 2 reenvios. Adendo datado em `decisoes-delegadas-ao-time.md` | `c4909c5` |
| I-3 | Mock com `resolve`, `prazo`, `informado`, `nao_volta`, `confianca` (v2 muda só `informado`); hash da pesquisa `b2eb2918`; BM/AC intactos (`924448d4`, `b2bfd4c0`); contrato gerado da PV1 regerado | `8ba9e0b`, `1169dec` |
| I-4 | C6 = mediana agregada de todas as amostras (rodadas x 5), sem "melhor rodada"; `resultado.json` com medianas por rodada e p85; `PERF_RODADAS_C6=1` em `ci.yml` e `homolog.yml`; perf rodado sob o `flock`. Medida local: C6 entre 117 e 139 ms nas 6 rotas (limite 200 ms) | `0f29aa2` |
| I-5 | `docs/security/pesquisa-de-percepcao.md` (dados, papéis, carga, A10, I-2, riscos aceitos) | `c4909c5` |
| m-1, m-6 | JSDoc de `nomeSeguro` no lugar. Mesmo arquivo com "O que mudou" diferente do vigente vira reenvio (exige `--substituir`); sem `--o-que-mudou` continua idempotente | `54597c3` |
| m-2, m-3, m-5, m-7 | Parênteses no filtro de tabelas; o teste PG importa `@metricas-dspd/pesquisa/carga` (devDependency do server); comentário sobre o rótulo da área; `??` na senha da pesquisa | `a231341` |
| m-4, m-8, m-9, m-10 | Não tratados aqui (documentação do arquiteto, QA, react-frontend e texto do PR) | n/a |
