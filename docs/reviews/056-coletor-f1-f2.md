---
tipo: review
contrato: 1
pedido: 056-acelerato-mysql
branch: feature/056-coletor-acelerato
commit: cb91ff56dbfb3582729064a4f0dad3bf6225490d
parecer: reprovado
revisor: tech-lead
data: 2026-10-30
---

# Code review: F1 e F2 do coletor do Acelerato (056, E4.9, K-190)

Intervalo lido: `11141d7..cb91ff5` (7 commits: ADR 0023 e listas, plano de testes, parecer de segurança da E4.2, driver, migração 0016, F1 em `ed631c0`, F2 em `cb91ff5`). 61 arquivos, 4.698 linhas a mais e 22 a menos.

**Veredito: reprovado.** O desenho da F1 segue a ADR 0023 com rigor e os testes são bons. Três bloqueantes: um defeito de população nas métricas de sustentação (A1), o frontmatter do plano de testes recusado pelo `forge-check docs` (A2) e o formato do PR (A3, M14). A1 é a única correção de código.

## Conferência contra a ADR 0023 e as regras do CLAUDE.md

- **Só leitura em três camadas (ADR 0023, item 1):** `cliente-mysql.ts` é o único importador do `mariadb` (teste estrutural em `acelerato-estatico.test.ts`). A sessão faz `SET SESSION TRANSACTION READ ONLY`, aplica o teto por placeholder, abre `START TRANSACTION READ ONLY` e termina sempre em `ROLLBACK` (`cliente-mysql.ts:97-108`). Há uma conexão por execução e um temporizador por operação, que destrói a conexão ao estourar. `multipleStatements`, `permitLocalInfile`, `compress` e `allowPublicKeyRetrieval` ficam explícitos em `false`.
- **TLS fixado (item 3):** a impressão do PEM é conferida na partida (`tls.ts:prepararTls`). A `checkServerIdentity` compara a `fingerprint256` normalizada com `rejectUnauthorized: true`, e `NODE_TLS_REJECT_UNAUTHORIZED=0` recusa a partida (`config.ts:48`). Confere.
- **Consultas constantes (itens 4 e 5):** Q1 a Q3 são as da ADR. Q4 (contagem fora das organizações) e Q5 (saída do recorte) são as do item 5 e do item 6. Os valores só entram por placeholder (`expandir` gera só `?`), lista vazia é recusada e o texto é igual ao de `docs/architecture/fontes/acelerato-mysql.sql` (teste de igualdade e hash). Nenhuma das 11 colunas barradas aparece, e `agente_key` só aparece como `IS NOT NULL`.
- **Nada de pessoa (ADR 0020):** a allow-list usa `strictObject` e falha fechado, com o erro reduzido ao nome da coluna. A fixture tem 50 colunas e os proibidos são escritos no teste (30 ou mais, cada um presente na fixture). `com_agente` é só booleano, com exceção nominal em `EXCECOES_PESSOA` (`lgpd.ts`). `COLUNAS_PESSOA` não muda. Confere.
- **Fontes separadas:** o módulo não referencia `dspd_bm` nem `dspd_core` (teste CT-37). A F2 escreve só em `dspd_ac`. O registro das versões de critério em `dspd_core` fica numa entrada própria, que roda com o migrador. Confere.
- **Biblioteca compartilhada:** o módulo não calcula percentil, média nem ranking (teste CT-50/57/58). `etapas-sinteticas.ts` monta os intervalos com `horasUteisEntre` da `core` (busca binária sobre a função da biblioteca, sem fórmula própria de calendário). Assim, a biblioteca devolve o `tempoSla` da ferramenta como duração (D-7). O mínimo de 20 e a janela continuam na biblioteca. Confere.
- **Nada sobrescrito:** o staging é só INSERT, com hash contra a última versão e cadeia por `anterior_sk`. O teste `.pg` cobre a negação de UPDATE e DELETE e o gatilho. A F2 apaga e refaz só as projeções vigentes `dim_chamado` e `fato_etapa_chamado` (grant `PROJECAO` existente). A história fica em `dim_chamado_versao`, só INSERT. Confere.
- **Marcas T2.6:** `criterios-acelerato.ts` registra a D-7 (S4, S9, S10) e a D-10 (S8) em `ref_versao_criterio`, com as métricas afetadas, de forma idempotente pela `referencia`. Confere. Ver o R1 sobre o reconhecimento de mudança da CA-8.
- **Incremental e saída do recorte (item 6):** a paginação usa a chave composta, sem `OFFSET`, e se protege do cursor parado. A marca d'água só avança em sucesso, com margem configurável. A recarga suspeita usa um corte de 5% estrito, e as falhas registram só o código. Confere, com o R2.

## Ferramenta (citada, não refeita)

- `tsc --noEmit` em `server/`, na ponta `cb91ff5`: saiu sem erro.
- `eslint` nos arquivos tocados de `server/` (acelerato, entradas, métricas, referência, migrações 0016 e 0017, testes do acelerato): sem saída.
- `vitest run` com os 12 arquivos de teste tocados, rodado pela trava `scripts/suite-unica.sh`: `Test Files 12 passed (12)`, `Tests 213 passed (213)`.
- `forge-check docs`: `docs/qa/056-coletor-plano-de-testes.md: tipo: plano-tecnico pertence a docs/architecture/features/ (ADR-0004)` (A2).
- Pendência do autor: para a F1, o pedido registra `pnpm run pronto` verde e 91 testes `.pg` (18:40). Para a F2, só "372 testes passando, os .pg não rodaram" (19:17). Não há prova do `pronto` nem do `test:pg` em `cb91ff5` (R3).
- Segurança: parecer da E4.2 em `docs/security/056-coletor-listas-e-driver.md` (aprovado); a E4.7 corre em paralelo e não é refeita aqui.

## Teto por PR (M14)

`git diff --numstat --no-renames 11141d7...cb91ff5`, sem `.md`, sem `tests/fixtures/` e sem o lockfile, dá **3.998 linhas** (F1 `11141d7..ed631c0`: 2.893; F2 `ed631c0..cb91ff5`: 1.119, na mesma contagem). São dois comportamentos: coletar até o staging e projetar para as métricas. Ver o A3. Para cada um dos dois PRs, a exceção ao teto fica **aceita** neste review, com a linha `teto: excedido, <n> linhas, <motivo>` no corpo, recontada na hora. Motivo aceito: a fatia mínima de cada fase, com cobertura de 100% e os testes de fronteira juntos.

## Achados

- A1 (bloqueante) server/src/modulos/metricas/repositorio.ts:91 · `prioridade IS NOT NULL` tira de TODAS as métricas de sustentação o chamado fora da escala P (normalizador.ts:131 grava nulo), contra a D-8 e a D-12. A reconciliação (reconciliacao.ts:59) não filtra prioridade e não pega a diferença. Mantenha-o na base; tipo com o arquiteto.
- A2 (bloqueante) docs/qa/056-coletor-plano-de-testes.md:2 · O `forge-check docs` recusa `tipo: plano-tecnico` em docs/qa (ADR-0004). Correção: trocar o frontmatter inteiro por `contrato: 0`, como em docs/qa/integracao-real.md. docs/qa é caminho livre e a troca não invalida pareceres.
- A3 (bloqueante) server/src/modulos/acelerato/projetor.ts:1 · Dois comportamentos num PR (M14): a F1 (coleta até o staging) e a F2 (projeção e métricas). Abrir dois PRs em sequência: o primeiro até ed631c0, o segundo com a F2 e o A1. Cada corpo leva a linha do teto (exceção aceita acima).
- R1 (recomendado) server/src/modulos/acelerato/coletor.ts:195 · `--reconhecer-mudanca` libera mudança de SQL, colunas ou campos sem entrada em ref_versao_criterio (ADR 0023 item 6; T2.6). Para sql/colunas/campos, exija a versão de critério e deixe a opção só para host, banco e TLS. Vira bloqueante no PR da Q4 (F3).
- R2 (recomendado) server/src/modulos/acelerato/coletor.ts:144 · Ausente que reaparece fora do recorte nunca é reconsultado (`!m.ausente`) e segue marcado ausente, sem `fora_do_recorte`. Incluir os ausentes na Q5 e cobrir com um teste.
- R3 (recomendado) server/src/modulos/acelerato/projetor.ts:271 · A F2 não tem teste .pg do projetor (DELETE e INSERT em dim_chamado pelo dspd_coletor, UPDATE de ctl_coleta, CHECK de reincidente_90d), e falta a prova do `pnpm run pronto` e do `test:pg` em cb91ff5. Rodar os dois antes do QA (E4.10).
- R4 (recomendado) docs/architecture/data-model.md:148 · O documento diz que vw_populacao_sssc filtra `fora_do_recorte = false`, mas a view da 0009 não mudou: só lerChamados filtra. Recriar a view numa migração ou corrigir o texto.
- R5 (recomendado) server/migrations/0016_ac_stg_chamado_recorte.ts:14 · A 0016 traz duas mudanças (coluna e CHECK), e a 0017 traz colunas e índice. A prática §6 pede uma mudança por migração. Vale a partir das próximas; não editar estas se já tiverem sido aplicadas em algum ambiente.

## O que a volta precisa trazer

- node-backend: A1 (com teste: chamado com prioridade fora da escala P conta no S2 e na reconciliação), mais R2 e R3, como commit novo `fix(...)` na branch, sem reescrever o histórico.
- qa-engineer: A2 no plano de testes.
- tech-lead (E4.11): A3, na abertura dos PRs.
- Revalidação por delta (`forge-check delta --parecer docs/reviews/056-coletor-f1-f2.md`).
