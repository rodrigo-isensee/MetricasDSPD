---
tipo: review
contrato: 1
pedido: 056-acelerato-mysql
branch: feature/056-coletor-acelerato
commit: e6fd5fd3116216ae3eef60a2446d59cf590c64a1
parecer: aprovado
revisor: tech-lead
data: 2026-10-30
---

# Code review: F1 e F2 do coletor do Acelerato (056, E4.9 e E4.13, K-190)

## Renovação por delta (E4.11, 2026-10-30)

**Veredito: aprovado** sobre `e6fd5fd`. O parecer estava desatualizado porque `docs/architecture/fontes/acelerato-listas.md` mudou na E4.15 (`63e09f7`) e na E4.16 (`e6fd5fd`).

Delta lido: `forge-check delta --parecer` deu o intervalo `3b2f98f..e6fd5fd`, só `docs/architecture/fontes/acelerato-listas.md`, linhas 6-7 e 135-162. Li as linhas 6-7 (E4.16). Fica como "já lido" o trecho 135-162 (§12, E4.15, lido na E4.13) e os pareceres do intervalo (QA, segurança e este), que cito sem refazer. Nenhum arquivo de código mudou desde `3b2f98f`; as saídas de ferramenta abaixo seguem valendo.

- **R6: resolvido** (`e6fd5fd`). A linha 7 diz agora que status, prioridade e etapa fora da lista viram nulo com contagem e que o recorte (§4 a §6) falha com `fora-do-recorte`, como `allow-list.ts:96`, `110-111` e `133`.
- **R7 (recomendado, novo):** a mesma linha põe o §9 no grupo que vira nulo, mas o §9 são os status de SLA, recusados pelo schema (`allow-list.ts:46`, `dados-invalidos`). Só texto, sem efeito no código.
- Segurança: `docs/security/056-coletor-f1-f2.md` (`c86e6b3`, `riscos-aceitos` pelo R-1, aceito pelo dono na conversa) e `docs/security/056-coletor-listas-e-driver.md` (E4.17, aprovado). QA: `docs/qa/056-coletor-f1-f2.md` (aprovado, `414533f`).

## Revalidação sobre a volta 1 (E4.13, 2026-10-30)

**Veredito: aprovado** sobre `3b2f98f`. O A1, o único bloqueante de código, está resolvido, e o R2 e o R3 foram feitos. A volta não traz defeito novo. O A2 (plano de testes em `docs/qa/`) segue com a E4.10 (qa-engineer), por decisão técnica do Jarvis. O A3 (formato do PR) é cumprido na E4.11, pelo tech-lead. Nenhum dos dois volta ao autor do código.

Delta lido: `forge-check delta --parecer` deu o intervalo `cb91ff5..c86e6b3`. Li só a volta `aed1930..3b2f98f` (5 commits, `f3d928f` a `3b2f98f`; 19 arquivos, 204 linhas a mais e 28 a menos) e a E4.15 (`63e09f7`, `docs/architecture/fontes/acelerato-listas.md`). Fica como "já lido" o resto do intervalo: `e82c0a2` (este parecer), `aed1930` e `c86e6b3` (pareceres de segurança, que cito sem refazer) e os 61 arquivos de `11141d7..cb91ff5` fora do delta.

### Estado dos achados sobre a volta

- **A1: resolvido** (`f3d928f`). `repositorio.ts:91` não filtra mais `prioridade IS NOT NULL`. O tipo vira `prioridade?: Prioridade` (`modelo.ts:46`), e `mapa.ts:111-112` omite o campo quando a coluna é nula. O teste novo em `metricas-acelerato-f2.test.ts` prova que a leitura não filtra e que o chamado sem prioridade conta no `base.n` do S2 e do S3. A reconciliação (`reconciliacao.ts:59`) nunca filtrou por prioridade.
- **Guardas de `prioridade`: sem mudança de resultado em relação a `aed1930`.** A guarda de `comum.ts:33-34` só vale com filtro de prioridade escolhido. Ali, `undefined` já ficava fora antes, porque `includes(undefined)` é falso, e sem filtro o chamado entra. A guarda de `ei.ts:37` tira do EI o chamado sem prioridade. O EI só soma segmentos por prioridade (`ei.ts:48`, `prioridadesAlvo`), então esse chamado não caía em nenhum segmento. Em `aed1930` ele nem chegava à biblioteca (filtro do repositório). Para os chamados com prioridade, as duas guardas são só estreitamento de tipo. S1, S2, S3, S4, S10 e S11 comparam `x.c.prioridade === p`, e o resultado não muda.
- **R2: feito** (`50f8aa6`). `lerSaida` reconsulta também os já ausentes (`coletor.ts:144`). A recarga suspeita conta só as ausências novas (`coletor.ts:157-159`). O teste novo cobre a sequência ausente, continua ausente (sem versão nova) e reaparece fora do recorte (`fora: true`, `ausente: false`).
- **R3: feito** (`3b2f98f`). `acelerato-projetor.pg.test.ts` roda com o papel `dspd_coletor` e cobre o DELETE e o INSERT em `dim_chamado`, o UPDATE de `ctl_coleta` e o CHECK de `reincidente_90d`, mais o snapshot de esquema da 0016 e da 0017. A prova do autor está no Histórico do pedido (20:24): `pronto` rc=0 e `test:pg` com 94 passando. Não rodei o `test:pg`, que é da E4.10.
- **Segurança A1, A2 e A5** (`7bea909`, `d038e4f`): revalidadas na E4.14 (`c86e6b3`, sem achado novo). Cito sem refazer. A troca da forma curta pelo domínio fechado em `categoria` e `descricao_workflow` tem efeito de negócio: até o dono preencher as duas listas (E4.8), toda `categoria` vira nula, e a natureza também. A E4.15 (§12 das listas) documenta isso.
- **R1, R4 e R5:** fora da volta e sem mudança. Seguem como recomendação.

### Ferramenta (citada, não refeita), na árvore de `3b2f98f` (a ponta `c86e6b3` só traz o parecer de segurança)

- `tsc --noEmit` em `server/` e em `packages/metricas/`: saiu sem erro.
- `eslint` nos arquivos tocados pela volta (`server/src/modulos/acelerato`, `mapa.ts`, `repositorio.ts`, `seed.ts`, os testes da volta e os três de `packages/metricas/src/acelerato`): sem saída.
- `vitest run`, pela trava `scripts/suite-unica.sh`, com os 6 arquivos unitários tocados de `server/`: `Test Files 6 passed (6)`, `Tests 118 passed (118)`. Com `packages/metricas/src/acelerato`: `Tests 15 passed (15)`.
- `forge-check docs`: segue a recusa de `docs/qa/056-coletor-plano-de-testes.md` (A2, E4.10). As outras linhas são de arquivos antigos, fora deste pedido.
- Teto M14: a volta soma 232 linhas e entra no segundo PR (F2). A exceção aceita acima vale com a recontagem na E4.11.

### Achado novo

- R6, na E4.15: a linha 7 de `acelerato-listas.md` diz que o valor fora da lista nas colunas de vocabulário (§7 a §9) faz a coleta falhar fechado com `dados-invalidos`. O código só anula e conta em `status`, `prioridade` e etapa (`allow-list.ts:110-111` e `133`), como o CT-05 do plano de testes. O recorte (§4 a §6) falha com `fora-do-recorte` (`allow-list.ts:96`), e só o §9 recusa a linha pelo schema. A linha é anterior à volta (`753e264`). Fica como recomendação ao arquiteto, antes da E4.8, porque o dono lê esse cabeçalho na carga inicial.

## Parecer da E4.9 (sobre `cb91ff5`, reprovado)

Intervalo lido: `11141d7..cb91ff5` (7 commits: ADR 0023 e listas, plano de testes, parecer de segurança da E4.2, driver, migração 0016, F1 em `ed631c0`, F2 em `cb91ff5`). 61 arquivos, 4.698 linhas a mais e 22 a menos.

**Veredito: reprovado.** O desenho da F1 segue a ADR 0023 com rigor e os testes são bons. Três bloqueantes: um defeito de população nas métricas de sustentação (A1), o frontmatter do plano de testes recusado pelo `forge-check docs` (A2) e o formato do PR (A3, M14). A1 é a única correção de código.

### Conferência contra a ADR 0023 e as regras do CLAUDE.md

- **Só leitura em três camadas (ADR 0023, item 1):** `cliente-mysql.ts` é o único importador do `mariadb` (teste estrutural em `acelerato-estatico.test.ts`). A sessão faz `SET SESSION TRANSACTION READ ONLY`, aplica o teto por placeholder, abre `START TRANSACTION READ ONLY` e termina sempre em `ROLLBACK` (`cliente-mysql.ts:97-108`). Há uma conexão por execução e um temporizador por operação, que destrói a conexão ao estourar. `multipleStatements`, `permitLocalInfile`, `compress` e `allowPublicKeyRetrieval` ficam explícitos em `false`.
- **TLS fixado (item 3):** a impressão do PEM é conferida na partida (`tls.ts:prepararTls`). A `checkServerIdentity` compara a `fingerprint256` normalizada com `rejectUnauthorized: true`, e `NODE_TLS_REJECT_UNAUTHORIZED=0` recusa a partida (`config.ts:48`). Confere.
- **Consultas constantes (itens 4 e 5):** Q1 a Q3 são as da ADR. Q4 (contagem fora das organizações) e Q5 (saída do recorte) são as do item 5 e do item 6. Os valores só entram por placeholder (`expandir` gera só `?`), lista vazia é recusada e o texto é igual ao de `docs/architecture/fontes/acelerato-mysql.sql` (teste de igualdade e hash). Nenhuma das 11 colunas barradas aparece, e `agente_key` só aparece como `IS NOT NULL`.
- **Nada de pessoa (ADR 0020):** a allow-list usa `strictObject` e falha fechado, com o erro reduzido ao nome da coluna. A fixture tem 50 colunas e os proibidos são escritos no teste (30 ou mais, cada um presente na fixture). `com_agente` é só booleano, com exceção nominal em `EXCECOES_PESSOA` (`lgpd.ts`). `COLUNAS_PESSOA` não muda. Confere.
- **Fontes separadas:** o módulo não referencia `dspd_bm` nem `dspd_core` (teste CT-37). A F2 escreve só em `dspd_ac`. O registro das versões de critério em `dspd_core` fica numa entrada própria, que roda com o migrador. Confere.
- **Biblioteca compartilhada:** o módulo não calcula percentil, média nem ranking (teste CT-50/57/58). `etapas-sinteticas.ts` monta os intervalos com `horasUteisEntre` da `core` (busca binária sobre a função da biblioteca, sem fórmula própria de calendário). Assim, a biblioteca devolve o `tempoSla` da ferramenta como duração (D-7). O mínimo de 20 e a janela continuam na biblioteca. Confere.
- **Nada sobrescrito:** o staging é só INSERT, com hash contra a última versão e cadeia por `anterior_sk`. O teste `.pg` cobre a negação de UPDATE e DELETE e o gatilho. A F2 apaga e refaz só as projeções vigentes `dim_chamado` e `fato_etapa_chamado` (grant `PROJECAO` existente). A história fica em `dim_chamado_versao`, só INSERT. Confere.
- **Marcas T2.6:** `criterios-acelerato.ts` registra a D-7 (S4, S9, S10) e a D-10 (S8) em `ref_versao_criterio`, com as métricas afetadas, de forma idempotente pela `referencia`. Confere. Ver o R1 sobre o reconhecimento de mudança da CA-8.
- **Incremental e saída do recorte (item 6):** a paginação usa a chave composta, sem `OFFSET`, e se protege do cursor parado. A marca d'água só avança em sucesso, com margem configurável. A recarga suspeita usa um corte de 5% estrito, e as falhas registram só o código. Confere, com o R2.

### Ferramenta (citada, não refeita)

- `tsc --noEmit` em `server/`, na ponta `cb91ff5`: saiu sem erro.
- `eslint` nos arquivos tocados de `server/` (acelerato, entradas, métricas, referência, migrações 0016 e 0017, testes do acelerato): sem saída.
- `vitest run` com os 12 arquivos de teste tocados, rodado pela trava `scripts/suite-unica.sh`: `Test Files 12 passed (12)`, `Tests 213 passed (213)`.
- `forge-check docs`: `docs/qa/056-coletor-plano-de-testes.md: tipo: plano-tecnico pertence a docs/architecture/features/ (ADR-0004)` (A2).
- Pendência do autor: para a F1, o pedido registra `pnpm run pronto` verde e 91 testes `.pg` (18:40). Para a F2, só "372 testes passando, os .pg não rodaram" (19:17). Não há prova do `pronto` nem do `test:pg` em `cb91ff5` (R3).
- Segurança: parecer da E4.2 em `docs/security/056-coletor-listas-e-driver.md` (aprovado); a E4.7 corre em paralelo e não é refeita aqui.

### Teto por PR (M14)

`git diff --numstat --no-renames 11141d7...cb91ff5`, sem `.md`, sem `tests/fixtures/` e sem o lockfile, dá **3.998 linhas** (F1 `11141d7..ed631c0`: 2.893; F2 `ed631c0..cb91ff5`: 1.119, na mesma contagem). São dois comportamentos: coletar até o staging e projetar para as métricas. Ver o A3. Para cada um dos dois PRs, a exceção ao teto fica **aceita** neste review, com a linha `teto: excedido, <n> linhas, <motivo>` no corpo, recontada na hora. Motivo aceito: a fatia mínima de cada fase, com cobertura de 100% e os testes de fronteira juntos.

Achados da E4.9 sobre `cb91ff5`, para o histórico; o estado atual está no `## Achados` abaixo:

- A1 (bloqueante, resolvido em `f3d928f`): `repositorio.ts:91` filtrava `prioridade IS NOT NULL` e tirava de todas as métricas de sustentação o chamado fora da escala P.
- R2 e R3 (recomendados, feitos em `50f8aa6` e `3b2f98f`): reconsulta dos ausentes na Q5 e teste `.pg` do projetor.

O bloco abaixo traz o estado em `3b2f98f`. A2 e A3 não são código e não voltam ao autor: o A2 é da E4.10 e o A3 da E4.11, e a E4.11 confere os dois antes do PR.

## Achados

- A2 (bloqueante) docs/qa/056-coletor-plano-de-testes.md:2 · O `forge-check docs` recusa `tipo: plano-tecnico` em docs/qa (ADR-0004). Correção: trocar o frontmatter inteiro por `contrato: 0`, como em docs/qa/integracao-real.md. Remetido à E4.10 (qa-engineer), dono do arquivo.
- A3 (bloqueante) server/src/modulos/acelerato/projetor.ts:1 · Dois comportamentos num PR (M14): a F1 (coleta até o staging) e a F2 (projeção, métricas e a volta 1). Dois PRs em sequência: o primeiro até ed631c0, o segundo com o resto. Cada corpo leva a linha do teto. Cumpre-se na E4.11.
- R1 (recomendado) server/src/modulos/acelerato/coletor.ts:195 · `--reconhecer-mudanca` libera mudança de SQL, colunas ou campos sem entrada em ref_versao_criterio (ADR 0023 item 6; T2.6). Para sql/colunas/campos, exija a versão de critério e deixe a opção só para host, banco e TLS. Vira bloqueante no PR da Q4 (F3).
- R4 (recomendado) docs/architecture/data-model.md:148 · O documento diz que vw_populacao_sssc filtra `fora_do_recorte = false`, mas a view da 0009 não mudou: só lerChamados filtra. Recriar a view numa migração ou corrigir o texto.
- R5 (recomendado) server/migrations/0016_ac_stg_chamado_recorte.ts:14 · A 0016 traz duas mudanças (coluna e CHECK), e a 0017 traz colunas e índice. A prática §6 pede uma mudança por migração. Vale a partir das próximas; não editar estas se já tiverem sido aplicadas em algum ambiente.
- R7 (recomendado) docs/architecture/fontes/acelerato-listas.md:7 · Põe o §9 (status de SLA) no grupo que vira nulo com contagem; o schema recusa valor fora do §9 (allow-list.ts:46, dados-invalidos). Separar o §9 na frase.
- R6 (recomendado) docs/architecture/fontes/acelerato-listas.md:7 · Resolvido em e6fd5fd. Dizia que valor fora dos §7 a §9 falha fechado; o código anula e conta status, prioridade e etapa (allow-list.ts:110-111, 133) e o recorte falha com `fora-do-recorte`.

## O que ainda falta (sem volta ao autor do código)

- qa-engineer (E4.10): A2 no plano de testes, junto do QA.
- tech-lead (E4.11): A3, na abertura dos dois PRs, com a linha do teto recontada.
- software-architect: R7 (texto do §9), quando convier; não bloqueia a E4.8.
