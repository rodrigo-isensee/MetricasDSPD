---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s1-escala-p1-p5
commit: 549dfd8b9d8c7e7f85eca204ac7db7740a2f561c
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: S1 só com a escala P1 a P5 (E7.238, review E7.308, revalidação E7.382, junção E7.421)

## Revalidação da junção no head `549dfd8b` (delta lido)
- Delta lido: `forge-check parecer delta docs/reviews/105-s1-escala-p.md`, intervalo `07cfc675..549dfd8b`, sem o que veio da `develop` (`edfff4d8`, com #505 EI_SUST, #514 e #515 K-394). No domínio: `CHANGELOG.md`, `docs/api/metricas.md`, `docs/api/openapi.json`, `packages/contratos/src/{origem.ts,origem.test.ts,schemas.ts}`, `packages/metricas/src/acelerato/acelerato.test.ts`, `server/src/modulos/referencia/criterios-acelerato.ts`, `server/tests/criterios-acelerato.test.ts`, `server/tests/painel-real-f6.test.ts`; todos são linhas do EI_SUST trazidas pela junção. `.env.example` e `package.json` vêm só da `develop`.
- **O remendo do S1 não mudou**: `git diff --numstat ab12a37f 07cfc675` (S1 contra a base antiga) e `git diff --numstat edfff4d8 549dfd8b` (S1 contra a base nova) dão os mesmos números em todo arquivo de código, teste, migração e documento; só os pareceres diferem. O diff completo, sem `index` e `@@`, difere só em dois pontos: o contexto da entrada vizinha (`105:S8-so-respondidos` antes, `105:EI_SUST` agora) e o teste CT-49.
- **Os três critérios** (`criterios-acelerato.ts:55-70`): `105:S8-so-respondidos` 8º, `105:EI_SUST` 9º, `105:S1-escala-p` 10º, cada um com a sua métrica; sem marcador de conflito. O teste (`server/tests/criterios-acelerato.test.ts`) espera as dez entradas, ids 8 S8, 9 EI_SUST, 10 S1; rodei o arquivo: 6 passaram.
- **SQL do DBA**: a `develop` não trouxe migração (`deploy/sql` e `server/migrations` contra `edfff4d8` só mostram a 0040 desta branch); o #515 muda no gerador só a trava do wrapper, sem mudar a saída. Não precisa regenerar.
- **CI do head `549dfd8b`**: `rapida`, `build`, `banco`, `openapi`, `seguranca`, `imagem` verdes; `testes` e `e2e-parte` em andamento na hora deste parecer. Do autor: `pnpm run pronto` rc=0. Sem PR: o parecer não afirma CI verde do PR.

## Revalidação no head `07cfc675` (delta lido)
- Delta lido: `forge-check parecer delta docs/reviews/105-s1-escala-p.md`, intervalo `744e5a36..07cfc675`, sem o que veio da `develop`. Commits da volta: `18e842c7` (testes de banco, SQL do DBA da 0040, testes dos mutantes) e `07cfc675` (integra a `develop` com o #508 e regenera o SQL do DBA).
- **A1 corrigido**: `server/tests/pg/esquema.snapshot.json:80` ganha só `dspd_ac.dim_chamado.escala_p boolean NULL`; nenhuma outra linha mudou na fotografia.
- **A2 corrigido**: `server/tests/acelerato-l9c.pg.test.ts:24-25` tira `escala_p` da comparação (`- 'fluxo' - 'escala_p'`), com o comentário dizendo de onde vem cada coluna.
- **A3 corrigido**: `deploy/sql/0040_ac_dim_chamado_escala_p.sql` novo (`ALTER TABLE dspd_ac.dim_chamado ADD COLUMN IF NOT EXISTS escala_p boolean NULL` e o registro em `pgmigrations`) e `consolidado.sql` com a 0040 (linha 1571). Conferido aqui: o passo `arquivos` do gerador (`scripts/gerar-sql-migracoes.mjs arquivos`) reproduz as 40 migrações sem nenhuma diferença; `consolidado.sql` e `9000_grants.sql` vêm do passo com o Postgres descartável, que não rodei (eles saem do mesmo gerador, e a 0040 não mexe em GRANT). Árvore restaurada e limpa. **O deploy/sql não precisa ser regenerado de novo nesta branch**: a `develop` não tem migração depois da 0039 (`git diff 07cfc675 origin/develop -- server/migrations deploy/sql` só mostra a 0040 desta branch). Isso muda se outra migração entrar na `develop` antes do merge.
- **A4 resolvido**: `server/tests/acelerato-escala-p.pg.test.ts` (QA) prova o "não sobrescreve" no banco: as linhas `d` (true) e `e` (false), com staging que diria o oposto, seguem como estavam, e a segunda passada não muda a foto da `dim_chamado`.
- **Conflito do #508** (`criterios-acelerato.ts` e o teste CT-49): as duas entradas ficam, `105:S8-so-respondidos` antes de `105:S1-escala-p`; o registro é idempotente pela referência, e a ordem só muda o id da versão no duplo do teste (8 S8, 9 S1). Sem perda de nenhum lado.
- **Teste novo dos mutantes** (`packages/metricas/src/acelerato/acelerato.test.ts:110`): rodei o bloco "S1 só na escala P1 a P5", 5 passaram. Mutante: em `s1.ts:86`, trocar `fechados.filter((x) => naMatriz(x)).length` por `fechados.length` derruba o teste novo (morto). Fonte restaurada.
- **CI do head `07cfc675`**, run `43982920812` (push): `banco` verde (A1 e A2 provados no `test:pg`); `rapida`, `build`, `openapi`, `seguranca`, `imagem` verdes; `testes` ainda em andamento na hora deste parecer. Do autor: `pnpm run pronto` exit 0 e `test:pg` só com as 12 falhas conhecidas de ambiente (K-392). Sem PR: o parecer não afirma CI verde do PR.

## O que foi conferido (rodada 1, head `744e5a36`)
- Migração 0040 com uma mudança e caminho de volta, sem reescrever histórico; `dim_chamado_versao` e staging intocados; coluna booleana derivada, sem dado de pessoa (GRANT de tabela ao `dspd_api`, `grants.ts:57`).
- Regra da escala numa função só (normalizador, projetor e comando); comando `ac:reprojetar-escala` numa transação, por lotes, só onde a coluna é nula; entrada imprime só contagens.
- Biblioteca: `escala_p !== false` vale P, `foraDaMatriz` contado e nunca estatística, mínimo de 20 pela biblioteca, só Acelerato. Serviço: sem escala projetada, "sem dado real" com o motivo.
- Contrato aditivo (`foraDaMatriz` opcional), openapi e critério `105:S1-escala-p` (T2.6) com CHANGELOG.
- Tamanho: passa da orientação de 150 linhas (M14); o corpo do PR precisa de `teto: excedido, <n> linhas, <motivo>`.

## Achados
- A1 (bloqueante) server/tests/pg/esquema.snapshot.json:80 · corrigido em `18e842c7`; `banco` verde no run `43982920812`.
- A2 (bloqueante) server/tests/acelerato-l9c.pg.test.ts:25 · corrigido em `18e842c7`; `banco` verde no run `43982920812`.
- A3 (recomendado) deploy/sql/consolidado.sql:1571 · corrigido em `18e842c7` e `07cfc675`: 0040 e consolidado gerados; regenerar só se outra migração entrar na `develop` antes do merge.
- A4 (recomendado) server/tests/acelerato-escala-p.pg.test.ts:83 · resolvido: o "não sobrescreve" é provado no banco.

## Riscos e pendências fora do review
- Passo do dono depois do merge: migrar, rodar `ac:reprojetar-escala` com a coleta parada e registrar o critério com `criterios-ac`. Até lá o S1 real fica "sem dado real" com o motivo, como decidido.
- Chamado com versão nova no staging ainda não projetada, com prioridade fora do mapa, fica nulo e segura o S1 até a próxima projeção; raro e autocorrigido (registrado para o QA na rodada 1).
- Job `testes` do run `43982920812` ainda em andamento: o merge espera o CI do PR verde.
