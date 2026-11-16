---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s1-escala-p1-p5
commit: 744e5a36e23676f9edc0cf6af88ef7b3e891890a
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: S1 só com a escala P1 a P5 (E7.238, review E7.308)

## O que foi conferido
- Diff `57989aa0...744e5a36`: 1 commit, 34 arquivos; 437 linhas de código e teste (`git diff --numstat --no-renames`, fora `.md` e `.json`). Um comportamento só (o recorte do S1 pela escala), mas passa da orientação de 150 (M14): o corpo do PR precisa de `teto: excedido, <n> linhas, <motivo>` (migração, comando de reprojeção com entrada e testes, contrato e cartão).
- **Migração 0040** (`server/migrations/0040_ac_dim_chamado_escala_p.ts:13-14`): `ADD COLUMN IF NOT EXISTS escala_p boolean NULL` em `dim_chamado` só, `down` com `DROP COLUMN IF EXISTS`. Uma mudança, caminho de volta, nenhuma linha reescrita, staging e `dim_chamado_versao` intocados (histórico preservado). Checksum novo em `checksums.json`, registro em `tests/migracoes.ts` e contagem estática 531 → 532. GRANT: `dim_chamado` tem SELECT de tabela inteira ao `dspd_api` (`grants.ts:57`, regra das projeções); a coluna é booleano derivado, sem dado de pessoa.
- **Regra da escala** (`normalizador.ts:235-239`): verdadeiro só para `ESCALA_P`, falso para o que a D-12 mapeia, nulo fora disso; é a mesma função no projetor (`ATRIBUTOS_DIM`, `projetor.ts:30`) e no comando, sem regra duplicada. Do staging só sai o booleano.
- **Comando `ac:reprojetar-escala`** (`reprojecao-escala.ts:301-341`): uma transação, `exigirEsquemaSemSeed`, cursor por `chamado_id` em lotes de `TAMANHO_LOTE`, `UPDATE ... WHERE d.escala_p IS NULL` só com resultado não nulo: não sobrescreve e repetir não muda dado (só uma linha em `ctl_coleta`). Entrada (`entradas/reprojetar-escala-ac.ts`) imprime só contagens e a categoria do erro, sem URL nem texto do banco; credencial do migrador.
- **Biblioteca** (`s1.ts:40-50`): `apuraveis` exige prioridade e `escala_p !== false` (ausente vale P, para mock e semeada); `foraDaMatriz` conta outras escalas e sem prazo sobre `selecionarAC(..., { semPrioridade: true })`, independente do filtro de prioridade, nunca estatística. Mínimo de 20 segue pela biblioteca (teste de 10 na escala P com 50 fora sai `insuficiente`). Só Acelerato.
- **Serviço** (`servico.ts:293-296`): base real com algum chamado de prioridade e `escala_p` ausente responde "sem dado real" com `MOTIVO_ESCALA_NAO_PROJETADA`; nada presumido. `mapa.ts:351` transforma nulo em ausente, o que casa com a guarda.
- **Contrato e critério**: `foraDaMatriz` opcional e aditivo (`schemas.ts:671`), openapi, contrato S1 e fotografia regenerados; critério `105:S1-escala-p` (T2.6) com CT-49 em oito entradas e linha no CHANGELOG.
- **Testes rodados aqui** (sem rerrodar a suíte): `server` `acelerato-reprojecao-escala`, `acelerato-normalizador` e `reprojetar-escala-ac-entrada`, 65 passaram; `packages/metricas` bloco "S1 só na escala P1 a P5", 4 passaram. Mutantes: (1) tirar `&& x.c.escala_p !== false` de `naMatriz` em `s1.ts:141` derruba 2 testes (morto); (2) tirar `&& c.escala_p === undefined` da guarda em `servico.ts:293` derruba o teste E7.238 de `painel-real-f6` (morto). Fonte restaurada, árvore limpa.
- **CI do head `744e5a36`**, run `43953253555` (push): job `banco` **vermelho** (`test:pg`, dois testes, ver A1 e A2); `testes` cancelado em `pnpm run cobertura` pelo push do parecer de segurança (`21ab8e20`), sem resultado; `rapida`, `build`, `openapi`, `seguranca`, `imagem` verdes. Sem PR: o parecer não afirma CI verde.
- **deploy/sql**: não existe nesta branch. A base `57989aa0` é anterior ao #497 (`f719f984`), que trouxe `deploy/sql/` e `pnpm run db:sql` à `develop` (até `0039_bm_toque_primeiro.sql` e `consolidado.sql`). Não há o que regenerar neste head; precisa ser regenerado **na integração**: ao trazer a `develop` antes do PR, rodar `pnpm run db:sql` e commitar `deploy/sql/0040_ac_dim_chamado_escala_p.sql` e o `consolidado.sql` novos. Nenhum check da CI confere essa sincronia; sem ela, o DBA aplica o esquema sem `escala_p` e o projetor, que agora grava a coluna, quebra a projeção do Acelerato na VM. Ver A3.
- Commit: Conventional Commits em português, escopo e pedido no assunto.

## Achados
- A1 (bloqueante) server/tests/pg/esquema.snapshot.json:1 · CI `banco` vermelho em `server/tests/catalogo.pg.test.ts:24` ("expected [ …(768) ] to deeply equal [ …(767) ]"): a fotografia do esquema não ganhou `dspd_ac.dim_chamado.escala_p boolean NULL`. Regravar com `ATUALIZAR_SNAPSHOT=1` no `test:pg` e conferir que a única linha nova é essa.
- A2 (bloqueante) server/tests/acelerato-l9c.pg.test.ts:25 · CI `banco` vermelho na linha 58: a subida da 0040 traz `escala_p` para a comparação de linhas. Tirar a coluna como se faz com `fluxo` (`- 'fluxo' - 'escala_p'`) e ajustar o comentário da linha 24.
- A3 (recomendado) deploy/sql/consolidado.sql:1 · pendente: na integração com a `develop` (que traz `deploy/sql/`), rodar `pnpm run db:sql` e commitar o `0040` e o consolidado na mesma branch, antes do PR. Condição do merge, não deste head.
- A4 (recomendado) server/tests/acelerato-reprojecao-escala.test.ts:496 · o "não sobrescreve" do comando só é afirmado pelo texto do SQL (`toContain('d.escala_p IS NULL')`) no banco falso; um caso no `test:pg` com uma linha já preenchida (valor oposto ao do staging) que segue igual depois do comando provaria o comportamento.

## Riscos e pendências fora do review
- Passo do dono depois do merge: migrar, rodar `ac:reprojetar-escala` com a coleta parada e registrar o critério com `criterios-ac`. Até lá o S1 real fica "sem dado real" com o motivo, como decidido.
- A guarda do serviço olha todos os chamados da base: um chamado com prioridade na dimensão e versão mais nova no staging ainda não projetada, com prioridade fora do mapa, fica nulo e segura o S1 até a próxima projeção. Raro e autocorrigido pela projeção seguinte; registrado para o QA.
- Revalidação: depois da volta, `forge-check parecer delta docs/reviews/105-s1-escala-p.md` e o CI do novo head com `banco` e `testes` verdes.
