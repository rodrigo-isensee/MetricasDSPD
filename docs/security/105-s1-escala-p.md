---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s1-escala-p1-p5
commit: 549dfd8b9d8c7e7f85eca204ac7db7740a2f561c
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105, S1 só com a escala P1 a P5 (E7.310, revalidações E7.384 e E7.423)

Head revisado: 549dfd8b (revalidação da junção com a develop edfff4d8, que trouxe o #505 EI_SUST e o #515 K-394; head aprovado antes: 07cfc675, base ab12a37f). Escopo: a migração 0040 (`dim_chamado.escala_p`), o comando novo `ac:reprojetar-escala`, que escreve na base, o caminho do campo até a API e o SQL do DBA (`deploy/sql/`).

**Veredito: aprovado.** A junção não mudou o S1: o remendo da branch contra a develop é, arquivo por arquivo, o mesmo aprovado em 07cfc675, fora a resolução do conflito no registro de critérios (o S1 passou a 10º, depois do EI_SUST). A coluna nova é um booleano derivado, não dado de pessoa nem texto livre; o `dspd_api` a lê pela regra geral das projeções, sem abrir coluna de pessoa; o comando só preenche nulos, numa transação, com a guarda do seed e sem vazar credencial nem texto do banco.

## Gatilhos
`R-SEGURANCA`: migração com GRANT (papel `dspd_api`, regra inviolável do GRANT por coluna), comando que escreve na base com a credencial do migrador, leitura do staging do Acelerato (allow-list de campos) e SQL entregue ao DBA.

## Achados
- A1 (recomendado) server/migrations/0040_ac_dim_chamado_escala_p.ts:14 · Resolvido em 07cfc675: deploy/sql/0040_ac_dim_chamado_escala_p.sql e consolidado.sql trazem a 0040; 9000_grants.sql não mudou (GRANT por tabela cobre a coluna nova).

## Sondas

## Detalhe dos achados
**Revalidação da junção (07cfc675..549dfd8b, E7.423).** 549dfd8b é o merge de `origin/develop` (edfff4d8) na branch. Lido o `forge-check parecer delta`: no domínio aparecem `openapi.json`, `origem.ts`, `schemas.ts` e `criterios-acelerato.ts`, todos com o conteúdo do EI_SUST (#505) vindo da develop (`composicao` da EI, `EI_SUST` no mapa real). Conferência do remendo: `git diff ab12a37f 07cfc675` (antes) e `git diff edfff4d8 549dfd8b` (agora) tocam os mesmos 42 arquivos mais `docs/devops/105-s1-escala-p.md` (fora do domínio); comparadas as linhas adicionadas e removidas de cada arquivo, só diferem os três pareceres em `docs/` e `server/tests/criterios-acelerato.test.ts` (dez entradas, S1 em 10º). Em `server/src/modulos/referencia/criterios-acelerato.ts:67` a entrada `105:S1-escala-p` é a mesma, só reposicionada depois de `105:EI_SUST` (`:61`); o S8 (`:55`) e a EI_SUST ficam intactos. `.env.example`, o `package.json` da raiz, o lockfile e `.github/` não estão no diff contra a develop, ou seja, são idênticos aos da develop e foram revistos nos pareceres de lá; o `server/package.json` traz só o script `ac:reprojetar-escala`, igual ao aprovado. Migração 0040, `deploy/sql/`, `reprojetar-escala-ac.ts`, `reprojecao-escala.ts`, `s1.ts` e `servico.ts` sem nenhuma mudança de conteúdo no remendo. Sem dependência, lockfile ou workflow novos.

**Revalidação anterior (744e5a36..07cfc675).** Os arquivos de produção do S1 não mudaram desde o head aprovado; entraram `deploy/sql/0040_ac_dim_chamado_escala_p.sql` (novo), `deploy/sql/consolidado.sql` (+4 linhas), `server/migrations/checksums.json` (entrada da 0040), `mapa.ts` (só repassa `escala_p` não nulo), `origem.ts` e `schemas.ts` (motivo e campo `foraDaMatriz`).

**SQL do DBA.** `deploy/sql/0040_ac_dim_chamado_escala_p.sql:5` só faz `ALTER TABLE dspd_ac.dim_chamado ADD COLUMN IF NOT EXISTS escala_p boolean NULL` e registra a migração em `pgmigrations`, numa transação; sem GRANT, sem segredo. O `consolidado.sql:1569` traz o mesmo ALTER antes do bloco de REVOKE/GRANT, que segue igual ao da develop: `GRANT SELECT ON dspd_ac.dim_chamado TO dspd_api` (`consolidado.sql:1831`, `9000_grants.sql:263`), sem GRANT novo e sem coluna de pessoa (a tabela não tem coluna em `COLUNAS_PESSOA` nem em `COLUNAS_FORA_DA_API`). O passo `arquivos` do gerador, rodado em 07cfc675, reproduziu as 40 migrações por arquivo sem diferença; o remendo desses arquivos não mudou na junção.

**Migração 0040 e GRANT.** `server/migrations/0040_ac_dim_chamado_escala_p.ts:14` só faz `ADD COLUMN IF NOT EXISTS escala_p boolean NULL`; não reescreve linha (histórico intacto) e o `down` só tira a coluna derivada da projeção. O GRANT vem de `gerarGrants`: `dim_chamado` casa `PROJECAO` (`server/src/plataforma/db/grants.ts:57`), então o `dspd_api` recebe SELECT na tabela inteira (`grants.ts:117`), como já recebia. O nome `escala_p` não casa `SEGMENTO_PESSOA`.

**Comando `ac:reprojetar-escala`.** Entrada em `server/src/entradas/reprojetar-escala-ac.ts:13` com a credencial do migrador, executado só pelo dono na máquina dele; não é exposto pela API. Erro sai só como categoria (`:17`), sem URL, senha nem texto do banco; a saída é só contagem. `server/src/modulos/acelerato/reprojecao-escala.ts:23` toma a trava do seed e recusa esquema com seed; tudo numa transação; SQL parametrizado; o `UPDATE` (`:44`) só toca linha com `escala_p IS NULL` e só grava resultado não nulo. Do staging sai só o booleano derivado do texto da prioridade; nada de pessoa, título ou descrição chega à dimensão.

**Caminho até a API.** O contrato ganha `foraDaMatriz` com duas contagens inteiras não negativas, sem estatística; sem escala projetada o serviço responde sem dado real com motivo (`server/src/modulos/metricas/servico.ts:295`), sem presumir. Nenhuma superfície de entrada nova.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Suíte: sem PR, a suíte inteira fica para o CI do PR; o autor informa `pnpm run pronto` com saída 0 em 549dfd8b; este parecer não afirma CI verde. Executado aqui no head 549dfd8b: `server/tests/criterios-acelerato.test.ts`, 1 arquivo, 6 testes, todos passaram (em 07cfc675: os testes da reprojeção, da entrada e o estático das migrações, 30 testes, todos passaram; não mudaram na junção). Ferramentas de varredura de segredos, de dependências, de SAST e de workflows não estão no PATH (lacuna).
