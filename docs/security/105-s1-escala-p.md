---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s1-escala-p1-p5
commit: 07cfc675032c45616599d29a0dc9ec8de547bd8c
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105, S1 só com a escala P1 a P5 (E7.310, revalidação E7.384)

Head revisado: 07cfc675 (revalidação por delta desde 744e5a36; base develop ab12a37f). Escopo: a migração 0040 (`dim_chamado.escala_p`), o comando novo `ac:reprojetar-escala`, que escreve na base, o caminho do campo até a API e, nesta volta, o SQL do DBA regenerado (`deploy/sql/`).

**Veredito: aprovado.** A coluna nova é um booleano derivado, não dado de pessoa nem texto livre; o `dspd_api` a lê pela regra geral das projeções, sem abrir coluna de pessoa; o comando só preenche nulos, numa transação, com a guarda do seed e sem vazar credencial nem texto do banco. O A1 da rodada anterior (SQL do DBA sem a 0040) está resolvido.

## Gatilhos
`R-SEGURANCA`: migração com GRANT (papel `dspd_api`, regra inviolável do GRANT por coluna), comando que escreve na base com a credencial do migrador, leitura do staging do Acelerato (allow-list de campos) e SQL entregue ao DBA.

## Achados
- A1 (recomendado) server/migrations/0040_ac_dim_chamado_escala_p.ts:14 · Resolvido em 07cfc675: deploy/sql/0040_ac_dim_chamado_escala_p.sql e consolidado.sql trazem a 0040; 9000_grants.sql não mudou (GRANT por tabela cobre a coluna nova).

## Sondas

## Detalhe dos achados
**Revalidação (delta 744e5a36..07cfc675).** Lido pelo `forge-check parecer delta`. Os arquivos de produção do S1 (migração 0040, `server/src/entradas/reprojetar-escala-ac.ts`, `server/src/modulos/acelerato/`, repositório, serviço, `packages/metricas/src/acelerato/s1.ts`, `server/package.json`, `server/src/plataforma/`) não mudaram desde o head aprovado. O que mudou no domínio contra a develop (ab12a37f): `deploy/sql/0040_ac_dim_chamado_escala_p.sql` (novo), `deploy/sql/consolidado.sql` (+4 linhas), `server/migrations/checksums.json` (entrada da 0040), `criterios-acelerato.ts` (S8 da develop e S1 desta branch mantidos lado a lado no conflito), `mapa.ts` (só repassa `escala_p` não nulo), `origem.ts` e `schemas.ts` (motivo e campo `foraDaMatriz` já revistos). O restante do delta no domínio (T10, O12, S8, `openapi.json`) veio da develop pelo merge e é idêntico a ela. Sem mudança de dependência, lockfile nem workflow.

**SQL do DBA.** `deploy/sql/0040_ac_dim_chamado_escala_p.sql:5` só faz `ALTER TABLE dspd_ac.dim_chamado ADD COLUMN IF NOT EXISTS escala_p boolean NULL` e registra a migração em `pgmigrations`, numa transação; sem GRANT, sem segredo. O `consolidado.sql:1569` traz o mesmo ALTER antes do bloco de REVOKE/GRANT, que segue igual ao da develop: `GRANT SELECT ON dspd_ac.dim_chamado TO dspd_api` (`consolidado.sql:1831`, `9000_grants.sql:263`), sem GRANT novo e sem coluna de pessoa (a tabela não tem coluna em `COLUNAS_PESSOA` nem em `COLUNAS_FORA_DA_API`). Conferi a reprodutibilidade: o passo `arquivos` do gerador, rodado aqui no head, escreveu as 40 migrações por arquivo sem nenhuma diferença contra o commitado (inclusive a 0040); o `consolidado.sql` e o `9000_grants.sql` dependem do passo com Postgres descartável e não foram regerados aqui, mas o diff do consolidado contra a develop é só a 0040.

**Migração 0040 e GRANT.** `server/migrations/0040_ac_dim_chamado_escala_p.ts:14` só faz `ADD COLUMN IF NOT EXISTS escala_p boolean NULL`; não reescreve linha (histórico intacto) e o `down` só tira a coluna derivada da projeção. O GRANT vem de `gerarGrants`: `dim_chamado` casa `PROJECAO` (`server/src/plataforma/db/grants.ts:57`), então o `dspd_api` recebe SELECT na tabela inteira (`grants.ts:117`), como já recebia. O nome `escala_p` não casa `SEGMENTO_PESSOA`; o teste estático das migrações (LGPD por coluna) passa.

**Comando `ac:reprojetar-escala`.** Entrada em `server/src/entradas/reprojetar-escala-ac.ts:13` com a credencial do migrador, executado só pelo dono na máquina dele; não é exposto pela API. Erro sai só como categoria (`:17`), sem URL, senha nem texto do banco; a saída é só contagem. `server/src/modulos/acelerato/reprojecao-escala.ts:23` toma a trava do seed e recusa esquema com seed; tudo numa transação; SQL parametrizado; o `UPDATE` (`:44`) só toca linha com `escala_p IS NULL` e só grava resultado não nulo. Do staging sai só o booleano derivado do texto da prioridade; nada de pessoa, título ou descrição chega à dimensão.

**Caminho até a API.** O contrato ganha `foraDaMatriz` com duas contagens inteiras não negativas, sem estatística; sem escala projetada o serviço responde sem dado real com motivo (`server/src/modulos/metricas/servico.ts:295`), sem presumir. Nenhuma superfície de entrada nova.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Suíte: sem PR, a suíte inteira fica para o CI do PR; o autor informa `pnpm run pronto` com saída 0 e `test:pg` só com as 12 falhas conhecidas de ambiente (K-392); este parecer não afirma CI verde. Executado aqui no head 07cfc675: `server/tests/acelerato-reprojecao-escala.test.ts`, `server/tests/reprojetar-escala-ac-entrada.test.ts` e `server/tests/migracoes.estatico.test.ts`: 3 arquivos, 30 testes, todos passaram; e o passo `arquivos` do gerador do SQL do DBA, sem diferença (worktree restaurada depois). Ferramentas de varredura de segredos, de dependências, de SAST e de workflows não estão no PATH (lacuna); o SQL gerado foi lido à procura de segredo (só o cabeçalho "Sem segredo neste arquivo").
