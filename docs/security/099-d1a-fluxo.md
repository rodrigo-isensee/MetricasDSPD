---
tipo: revisao-seguranca
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-d1a-fluxo-chamado
commit: 54d69ddc26823ce5c2c4e30de4bc20576939c397
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-14
---
# Review de segurança: D1a, fluxo do chamado (E3.249)

Propósito: o D1 1a do 099 (`dim_chamado.fluxo`) no head `54d69ddc`, base `2c8b9bce`. Gatilho: banco (migração 0038 e GRANT). Lidos: `git diff 2c8b9bce...54d69ddc` (15 arquivos: migração 0038 e checksums, `normalizador.ts`, `projetor.ts`, data-model, CHANGELOG e testes), mais `server/src/plataforma/db/grants.ts`, `server/src/plataforma/db/lgpd.ts`, `server/src/modulos/acelerato/allow-list.ts`, `referencia.ts` e a ADR 0020. Rodados, sem banco, da pasta `server/`: `vitest run tests/acelerato-projetor.test.ts tests/migracoes.estatico.test.ts --maxWorkers=2` (2 arquivos, 35 testes, todos passaram). Os `.pg` (`acelerato-l9c`, `alvos-acelerato`, `apontamento`, `pesquisa`) não rodaram aqui (sem Postgres); li o diff, e a prova deles é o CI do head: run 43667674559, `success`, `headSha` 54d69ddc. Nada rodou contra base real e nenhum `.env*` foi aberto.

## Gatilhos
- Banco: `server/migrations/0038_ac_dim_chamado_fluxo.ts:13-14` (ADD/DROP COLUMN) e o GRANT do `dspd_api` sobre a coluna nova (sem mudança em `grants.ts`).

## Resultado por ponto

**1. `descricao_workflow` é vocabulário fechado da ferramenta, não dado de pessoa: conforme.** O valor só chega ao staging pela allow-list da fronteira: `allow-list.ts:66` (texto até 255) e `allow-list.ts:137`, que passa por `noDominio` (`:80-85`) contra `listas.workflows`; fora do domínio vira nulo com a contagem `fora_dominio_workflow`, sem o valor. O domínio vem de `ref_dominio` campo `descricao_workflow` (`referencia.ts:29`, `:36`), já registrado como texto livre só por domínio fechado (`allow-list.ts:22`, A5 de parecer anterior). `fluxoDoChamado` (`normalizador.ts:133-138`) só escolhe entre valores que já passaram por esse filtro; não lê outro campo. Nome, e-mail, `usuarioKey`, título e descrição seguem fora (CLAUDE.md, ADR 0020).

**2. GRANT sem mudança, e correto: conforme.** `dim_chamado` não tem coluna em `COLUNAS_PESSOA` (`lgpd.ts:11-24`), então o `dspd_api` recebe `GRANT SELECT` da tabela inteira (`grants.ts:108-113`) e passa a ler `fluxo`, que não é de pessoa: o nome não casa com `SEGMENTO_PESSOA` (`lgpd.ts:7-8`) e o conteúdo é o vocabulário do ponto 1. O `dspd_coletor` grava pela regra `PROJECAO` (`grants.ts:53`, `:92`). Nenhum papel ganha privilégio novo.

**3. Migração não reescreve histórico: conforme.** `ADD COLUMN IF NOT EXISTS fluxo text NULL` sem default nem UPDATE; `dim_chamado_versao` e o staging não mudam. O `down` remove só a coluna derivada de uma projeção que o projetor refaz a partir do staging append-only. Checksum novo em `checksums.json`; `migracoes.estatico` passou.

**4. Escrita parametrizada: conforme.** O projetor grava `fluxo` pelo mesmo `inserirLote` dos demais atributos (`projetor.ts:137-139`); o único texto interpolado no SQL é o nome de schema. Nos testes, `to_jsonb(d) - 'fluxo'` e o helper `migracoes-por-numero.ts` (leitura de `DIR_MIGRACOES`) são só de teste.

**5. Segregação e regras invioláveis:** a coluna é só do Acelerato e não entra em cálculo nenhum neste corte; sem segredo, dependência ou script novo no diff.

**Lacunas de ferramenta:** `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH. Sem dependência nova; o diff foi lido à procura de credencial.

## Achados

## Plano em cartões
Nenhum achado, nenhum cartão. O preenchimento da coluna na base real é a reprojeção do dono.

## Riscos aceitos
Nenhum.
