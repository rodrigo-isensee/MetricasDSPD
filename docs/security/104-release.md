---
tipo: revisao-seguranca
contrato: 1
pedido: 104-release-2026-11-14
branch: docs/104-release
commit: 24ce5f921d5184bcd37cc0df0d30dfeec991a83e
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-14
---
# Review de segurança: release 104 (develop b544000d contra main 8fe42306, PRs 383, 384, 386 a 401 e 403 a 409)

Propósito: parecer de segurança da release de 14/11 (E1.2). Li `git diff origin/main...origin/develop` (234 arquivos) por amostragem dos gatilhos: `server/`, `packages/contratos`, `packages/metricas/src/acelerato`, `scripts/`, `.github/`, `.githooks/`, manifestos e lockfile, e as partes da web que tocam armazenamento do navegador e dado de pessoa. A branch `docs/104-release` em `71f9ff8e` (Revisar-sha) só soma à develop o CHANGELOG; `af0c930d` soma o review da release (documentação). Os lotes com parecer próprio (L10a `86a3808f`, K-308 `58f4f927`, K-314 B1 `a3d95914`, K-319 `c316e690`, K-322 `95a65933`, FORGE0442-001 `bdb6669e`, todos `aprovado`) foram conferidos no estado final pelo diff entre o commit do parecer e a develop, sem refazer as sondas. Nada rodou contra a base real e nenhum `.env*` foi lido.

## Gatilhos
- Migração nova: `server/migrations/0037_ac_alvo_prioridade_exibicao.ts` (colunas `exibir_pa` e `exibir_r` em `ref_alvo_prioridade`).
- GRANTs: `server/src/plataforma/db/grants.ts` sem mudança; os GRANTs da `dspd_api` derivam do catálogo e de `COLUNAS_PESSOA`.
- Contratos com campo novo: O17 (`porCausa` anulável, `motivoCausaRaiz`), `setores` em `OpcoesFiltroFluxo` (L10a), `exibirEm` no S1 (K-314), filtro `equipe` da sustentação só slug (K-287).
- Entrada nova com credencial do migrador: `server/src/entradas/reprojetar-etapas-ac.ts` (K-308, K-321).
- Hook pre-push e scripts dos alterados: `scripts/lint-alterados.sh`, `scripts/typecheck-alterados.sh`, `scripts/suite-unica.sh` (K-317, K-319, K-322, FORGE0442-001/K-256).
- Manifestos: `package.json:12` e `:15`, `server/package.json:23`.

## Resultado
- **Migração 0037: conforme.** DDL fixa, só o esquema interpolado (prefixo validado na partida); colunas `text NULL` com `CHECK` fechado em `min|h|dia`, par obrigatório e "dia corrido" barrado; sem `DEFAULT` e sem reescrever vigência gravada (histórico intocado). Nenhuma coluna de pessoa. Checksum em `server/migrations/checksums.json:38`.
- **GRANTs e `dspd_api` sem coluna de pessoa: conforme.** `grants.ts` não muda; as colunas novas não são de pessoa e entram pelo GRANT derivado (`grants.ts:79-113`); `lerAlvos` (`server/src/modulos/metricas/repositorio.ts:168`) lê só colunas de prazo e unidade, e `exibirDe` (`server/src/modulos/metricas/mapa.ts:182`) recusa valor fora do domínio em vez de assumir padrão.
- **Allow-list do Acelerato: conforme, sem mudança.** `listas-fechadas.ts`, `allow-list.ts` e o normalizador do Acelerato não mudam; nome, e-mail, `usuarioKey`, título e descrição seguem fora. A reprojeção do K-308 lê só `dim_chamado` e as etapas do staging (sem coluna de pessoa, ADR 0020) e grava só `fato_etapa_chamado`, `ctl_coleta` e a versão de critério, numa transação.
- **Contratos: conforme.** O17: `porSistema` é `categoria_sistema` (não é pessoa) e `motivoCausaRaiz` é constante (`packages/contratos/src/origem.ts:54`), sem texto do chamado. K-287: o filtro `equipe` passa a exigir slug `^[a-z0-9][a-z0-9-]{0,59}$` (`packages/contratos/src/filtros.ts:11`), mais estrito, e os apelidos antigos saem. Setores (L10a): rótulo do dicionário versionado (hoje vazio, `docs/architecture/fontes/businessmap-dominio.json:17`), nunca do nome do quadro; a leitura do banco refiltra código e rótulo (`server/src/modulos/referencia/repositorio.ts:40`). `exibirEm` é enum de exibição.
- **Entrada `ac:reprojetar-etapas`: conforme.** Imprime só contagens; o erro sai por `categoriaDoErro` ou pela mensagem fixa de `ErroReprojecao` (lista de turnos e feriados, sem URL, senha ou texto do banco) (`server/src/entradas/reprojetar-etapas-ac.ts:19-21`); o teste do K-321 cobre com sentinela `postgres://segredo@...`. Desde o parecer do K-308 só mudaram imports (K-318) e `dataCivil` da referência.
- **Hook pre-push e scripts: conforme os pareceres próprios.** `.githooks/` não muda; `git diff 95a65933 origin/develop -- scripts .githooks` só traz o `suite-unica.sh` do FORGE0442-001, que é idêntico ao do parecer dele (`git diff bdb6669e origin/develop -- scripts/suite-unica.sh package.json` vazio). `package.json:12` só fixa o heap do eslint (`--max-old-space-size=4096`) e `:15` soma `pre-push.test.sh` ao `test:trava`; `server/eslint.config.js` só estreita imports (K-318).
- **Web: conforme.** A memória de "Recolher cartão" (`web/src/components/ui/Recolhidos.tsx:14-45`) guarda só códigos de cartão no `localStorage`, lida com zod, regex de painel e cartão (barra `__proto__`), teto de 100 e falha fechada; nada vai à URL nem ao servidor. As telas do Apontamento só reorganizam o que a API já entrega (`pessoaRef`, "Pessoa n"); nenhum campo de pessoa novo e nenhum `dangerouslySetInnerHTML`.
- **Workflows, dependências e lockfile: sem mudança.** Nenhum arquivo em `.github/` nem `pnpm-lock.yaml`; nenhuma dependência nova nos manifestos.
- **Nenhum segredo: conforme.** Busca nas linhas adicionadas fora de `docs/` por apikey, token, senha, password, secret, chave privada, URL com credencial, `ghp_`, `AKIA`, e-mail e `usuarioKey`: só sentinelas fictícias de teste (`chave-de-teste-0123456789`, `postgres://segredo@host/db`, `t@t` de repositório descartável) e comentários.
- **Regras invioláveis:** BusinessMap e Acelerato seguem separados (setores só no BusinessMap; o O17 e o S1 só no Acelerato); nenhuma visão nova por pessoa nem comparação entre equipes.
- **Suíte:** não rodei suíte; o QA da release roda o `pnpm run pronto` na ponta da develop (E1.3) e o portão da `homolog` roda a suíte completa e a migração a partir da main (E1.5). Este parecer não substitui esses portões.
- **Lacunas de ferramenta:** `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` não estão no PATH; não rodei nenhum. Sem dependência nova e sem workflow alterado, fica com o CI.

## Delta (develop b544000d até 61286dac, branch em a881630b)
Desde o parecer em `71f9ff8e` (develop `b544000d`) entrou só o PR 402 (K-295, `61286dac`, filtros da web); a branch soma `3867cccb` (merge da develop) e `a881630b` (CHANGELOG). Li `git diff b544000d 61286dac` (14 arquivos) inteiro, por ser pequeno.
- **Contratos: conforme.** `TIPO_POR_ID` (`packages/contratos/src/filtros.ts:28`) é o inverso de `TIPO_ID`, derivado dele, sem campo novo na API nem no DTO; o servidor não o usa (`git grep TIPO_POR_ID 61286dac -- server packages` só acha a definição). O mapa local de `web/src/features/filtros/codec.ts` sai em favor deste, sem mudar a validação da URL.
- **Web: conforme.** As abas do T11 (`web/src/features/complementares/taticas.tsx:265`) e a lista de tipos (`web/src/features/filtros/BarraFiltros.tsx:39`) aceitam só ids que o contrato conhece e mostram o rótulo do contrato, não o `nome` vindo da API (mais estrito que antes); o texto de lista vazia (`web/src/features/filtros/FiltroMulti.tsx`) é constante interpolada pelo React. Sem `dangerouslySetInnerHTML`, sem armazenamento do navegador, sem dado de pessoa.
- **Dependências, lockfile, `.github/`, `.githooks/`, `scripts/` e `server/`: sem mudança** no delta.
- **Segredos: nenhum.** A mesma busca do parecer nas linhas adicionadas não acha nada fora de texto de documentação.
- **Regras invioláveis:** o mock e a lista de tipos do fluxo deixam de oferecer "Incidente" (que é do Acelerato), o que reforça a separação entre BusinessMap e Acelerato.
- **Suíte:** não rodei; vale o QA da release (E1.3) e o portão da `homolog` (E1.5). Os achados A1 e A2 seguem como estão; nenhum achado novo.

## Delta 2 (develop 61286dac até 64826e90, branch em 24ce5f92)
Desde o Delta (develop `61286dac`) entraram o PR 411 (`09c8d269`, Dependabot) e o PR 412 (`64826e90`, K-326); a branch soma o merge da develop (`d4522fe3`) e documentação (CHANGELOG, review e QA da release). `24ce5f92` contém `64826e90`, e `git diff 64826e90 24ce5f92` só toca `CHANGELOG.md` e `docs/`. Li `git diff 61286dac 64826e90` (6 arquivos) inteiro.
- **mariadb 3.5.4 para 3.5.5 (`server/package.json:52`): conforme, e a atualização é desejável.** Li as notas da 3.5.5 (releases do conector no GitHub, leitura pública). Correções de segurança: CONJS-378 (`Pool.escape()` sob `NO_BACKSLASH_ESCAPES`), CONJS-379 e CONJS-380 (injeção por escape em big5, gbk, sjis e cp932), CONJS-381 (charset não suportado caía em utf8mb4 em silêncio), CONJS-371 (`changeUser` após TLS autoassinado) e CONJS-389 (`destroy()` não matava a consulta em TLS com verificação de certificado). Nenhuma nos atinge hoje: o cliente do Acelerato (`server/src/modulos/acelerato/cliente-mysql.ts:41-51`) usa `createConnection` (sem pool), não fixa charset (padrão utf8mb4), não chama `escape()` e passa valores só por `execute` com parâmetros (`:102`). Nada muda em TLS nem em autenticação do nosso lado: `ssl` explícito, `restrictedAuth` em `caching_sha2_password` e `mysql_native_password`, `permitRedirect: false`, `allowPublicKeyRetrieval: false`, `multipleStatements: false`, `permitLocalInfile: false` (`:44-47`). A leitura segue só de leitura nas três camadas (conta, sessão `READ ONLY` e transação somente leitura, `:104-106`); a versão nova não traz opção que escreva. O CONJS-385 só acerta tipos (`restrictedAuth` e `permitRedirect` passam a ser declarados), sem efeito em execução.
- **@tanstack/react-query 5.105.3 para 5.107.1 (`web/package.json:27`): conforme.** As notas de 5.106 a 5.107.1 são patch de `query-core`; nada de armazenamento do navegador, rede nova nem renderização de HTML.
- **Lockfile (`pnpm-lock.yaml`): conforme.** Toda entrada nova traz `integrity` sha512 (de 1083 para 1085 linhas: `@babel/runtime@7.29.13` e `ws@8.22.2`); nenhum nome de pacote novo, só versões novas de pacotes que já estavam: `@babel/runtime` (de `@testing-library/dom`), `ws` e `lilconfig` (de puppeteer e lighthouse, ferramentas de desenvolvimento), `@tanstack/query-core` e `mariadb`. Nenhum `tarball:` nem registro alternativo. A outra linha é a marca `deprecated` em `tldts-core@7.4.20` (publicação parcial no registro, issue 2735 do tldts), versão que já estava e vem só do lighthouse (`tldts-icann`), fora do que vai à produção: informativo.
- **PR 412 (K-326): conforme.** Só soma `server/tests/pg/colunas-pessoa.test.ts` (projeto `unit`, roda sempre, sem banco). `server/tests/pg/colunas-pessoa.ts`, `server/src/plataforma/db/lgpd.ts` (`COLUNAS_PESSOA`) e `grants.ts` não mudam desde `b544000d`, e as provas `.pg` seguem chamando `provarSemPessoa` para `dim_card`, `dim_card_versao`, `dim_responsavel`, `fato_apontamento` e `apt_pessoa_time`. O teste novo fecha as falhas silenciosas do helper: lista vazia lança, coluna legível falha, coluna inexistente falha (42703 não passa por 42501). Rodei `vitest run --project unit tests/pg/colunas-pessoa.test.ts`: 4 de 4 verdes.
- **Segredos: nenhum.** A mesma busca nas linhas adicionadas não acha nada; o teste novo usa só `responsaveis` e `schema_t`.
- **Suíte:** não rodei a suíte; CI de `64826e90` verde (`testes`, `banco`, `seguranca`, `build`, `rapida`, `filtro`, `openapi`, `imagem`). Valem o QA da release (E1.3) e o portão da `homolog` (E1.5). A1 e A2 seguem como estão; nenhum achado novo.
- **Lacunas de ferramenta:** as mesmas do parecer; `osv-scanner` não está no PATH, e a auditoria de dependências fica com o job `seguranca` da CI (verde em `64826e90`).

## Achados
- A1 (recomendado) .github/workflows/ci.yml:186 · herdado das releases 101 e 103, ainda aberto: a guarda G1 (web/scripts/sem-mock.mjs) não roda na CI; os jobs com pnpm run build (ci.yml:186, ci.yml:266, homolog.yml:82, homolog.yml:195) não chamam sem-mock. Dono: devops-engineer.
- A2 (recomendado) server/src/modulos/referencia/setor.ts:11 · herdado do A1 de docs/security/097-l10a-setor-dicionario.md: o guarda de sobrenome é lista negativa; hoje sem efeito, porque o dicionário de setores está vazio até a P-097-9. Fechar antes de o dono preencher os setores. Dono: node-backend.

## Plano em cartões
Nenhum bloqueante. A1 segue com o devops-engineer (envio de workflow é do dono, escopo `workflow`). A2 entra no lote que preencher `setores` (P-097-9), com o review de segurança desse lote. Os recomendados dos pareceres próprios (K-308 A1, K-319 A1 a A3, FORGE0442-001 A1 e A2) seguem com os seus donos e não seguram a release.

## Riscos aceitos
- Reidentificação de "Pessoa n" em equipe pequena no Apontamento (A1 de `docs/security/097-k286-mapa-diario-equipe.md`): aceito pelo dono em 2026-11-12 e confirmado na Decisão 28a (pedido 097), como registrado no parecer da release 103. Nenhuma mudança desta release o amplia.
