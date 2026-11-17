---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-roteiro-vm-s1
commit: f0b151ca
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: roteiro da VM e do dono depois do S1 (E7.428; review E7.430; revalidação E7.433)

## Revalidação no head f0b151ca (E7.433)
Delta lido: `forge-check parecer delta docs/reviews/105-roteiro-vm-s1.md` → `intervalo: 9b6035030cb21921b214743f2756228e6faf5cc1..f0b151ca869346e8cf7bc2c556d71f043deedd5b`, `delta: nenhum arquivo do domínio mudou` (o domínio da ferramenta é código e teste; não há código no diff). Como os achados eram de texto, li só o diff de texto desse intervalo: `docs/devops/105-roteiro-dono.md` (linhas 31, 59 a 61 e a seção 4 reescrita, 198 a 249; seção 5, linha 257) e `docs/devops/105-implantacao-vm.md` (linhas 111, 199 e 259). Conferi contra a `origin/develop` em `0b4f8ca5`: desde `e1c98633` só mudou `server/src/plataforma/db/seed.ts` nos caminhos de migração, runner, Compose, scripts e Acelerato, sem efeito no roteiro. Sem PR para esta branch: não há CI a citar, e a prova do autor para texto é o `forge-check docs`. As duas receitas são provadas de novo pelo QA num Postgres descartável; aqui não as reexecuto.

### Achados anteriores
- A1 (resolvido) docs/devops/105-roteiro-dono.md:208 · A seção 4 diz agora que o segundo `down 1` tira a 0039 e derruba as tabelas do BusinessMap, e que a 0038 e a 0039 sozinhas não têm `down 1`. Confere com `checkOrder` (`server/src/plataforma/db/migrar.ts:91`) e com o `down` da 0039 (`server/migrations/0039_bm_toque_primeiro.ts`, `drop` de `ctl_toque_leitura` e `stg_toque_instante` e das colunas de toque de `dim_card`).
- A2 (resolvido) docs/devops/105-roteiro-dono.md:233 · A receita B é só da 0040, com a conferência de `pgmigrations` antes (linha 235) e depois (`0`, `2`, `0039_bm_toque_primeiro`, linhas 243 a 245), e o aviso para não repetir o comando. A ordem por `id` vale para a tabela do node-pg-migrate (`migrationsTable: 'pgmigrations'` em `dspd_core`, `migrar.ts:90-91`).
- A3 (resolvido) docs/devops/105-roteiro-dono.md:31 · As linhas 31 e 59 a 61 listam 0038, 0039 e 0040, os três arquivos de `server/migrations/` na `develop`.
- A4 (resolvido) docs/devops/105-implantacao-vm.md:199 · A tabela vai até `0040_...sql`.
- A5 (recomendado, segue aberto) docs/devops/105-implantacao-vm.md:107 · O parágrafo ainda não cita o K-398. Confere com o código (`reprojecao-escala.ts` insere a linha `projecao` em `ctl_coleta` antes do laço), então não bloqueia.

### Conferido contra o código no delta (confere)
- Receita A: `.dump` em `~/backups-metricas/metricas-*.dump` confere com `scripts/db-backup.sh` (`metricas-AAAAMMDD-HHMMSS.dump`, `pg_dump -Fc`). `CREATE DATABASE ... ENCODING 'UTF8' TEMPLATE template0`, `timezone` em UTC e `GRANT CREATE` ao `dspd_migrador` repetem `docker/postgres/init/01-databases-papeis.sh:18-27`. Os serviços `api`, `worker`, `coleta` e `web` existem no `docker-compose.yml`; o `postgres` é a imagem 17, que aceita `DROP DATABASE ... WITH (FORCE)`. A conferência `0, 0, 0` usa os nomes reais das três migrações e os schemas `dspd_ac`, `dspd_bm` e `dspd_core` (`esquemas.ts:12`).
- Seção 7, passo 2, e seção 2.1, item 4, da VM: `down 1` só com a 0040 como última, uma vez, e restauração como caminho recomendado. Coerente com a seção 4 do roteiro do dono.

### Novos achados (delta)
- A6 (recomendado) docs/devops/105-roteiro-dono.md:222 · Depois do `CREATE DATABASE`, a receita A refaz só o `GRANT` do `dspd_migrador`. O init também faz `REVOKE ALL ON DATABASE metricas FROM PUBLIC` e `GRANT CONNECT` aos oito papéis de login (`01-databases-papeis.sh:25-26`), e o `pg_restore` sem `--create` não traz ACL de banco. O banco restaurado fica com `CONNECT` e `TEMP` para `PUBLIC`. No Compose local, os papéis de login são os mesmos oito, então ninguém ganha acesso efetivo novo, mas o banco fica diferente do que o init cria. Sugestão: acrescentar as duas linhas do init. O parecer de segurança é do `security-engineer`.
- A7 (recomendado) docs/devops/105-implantacao-vm.md:259 · O passo 2 da seção 7 é o rollback geral de qualquer release, e agora cita a 0040 por número. Na próxima migração, o texto fica errado. Sugestão: "só se a última migração aplicada for a desta release e o `down` dela não apagar dado de coleta", com a 0040 como exemplo.

## Escopo lido (rodada E7.430)
Diff `origin/develop...9b603503`, só texto: `docs/devops/105-implantacao-vm.md` (seção 2.1, itens 2 a 4) e `docs/devops/105-roteiro-dono.md` (0.3, seção 4 e seção 5). Conferi o texto contra o código da `develop` (`e1c98633`). Não há código no diff: 0 linhas pela M14, e não há guarda nem mutante a declarar.

## Conferido contra o código (rodada E7.430, confere)
- **8 passos do `vm:preparar`, com o `ac:reprojetar-escala`.** Em `PASSOS` (`server/src/plataforma/db/vm-preparar.ts:14-23`), na ordem: migrar, ref:sync-calendario, bm:ref-sync, ac:ref-sync, ac:reprojetar-etapas, ac:reprojetar-fluxo, ac:reprojetar-escala (opcional) e ac:criterios. O passo opcional entra quando `src/entradas/reprojetar-escala-ac.ts` existe (`server/src/entradas/vm-preparar.ts:39`), e ele existe na `develop`.
- **Backup confirmado antes do `up`.** Confere com `recusaDeBackup` (`plataforma/db/vm-preparar.ts:44-51`) e com `docker-compose.prod.yml:28-29`.
- **Coleta do Acelerato parada antes do `up`.** Os timers citados existem nas unidades do systemd do repositório.
- **K-397.** Confere com `reprojecao-etapas.ts:96`, `reprojecao-fluxo.ts:48` e `reprojecao-escala.ts:26`.
- **0040, a marca e as travas do `down`.** Conferem com `0040_ac_dim_chamado_escala_p.ts:14-15`, `criterios-acelerato.ts:67`, `server/package.json:25` e `trava-down.ts` (`motivoDeRecusa`).

## Achados
- A1 (bloqueante) docs/devops/105-roteiro-dono.md:208 · resolvido em f8714842: o segundo `down 1` tira a 0039, e o texto agora diz isso.
- A2 (bloqueante) docs/devops/105-roteiro-dono.md:233 · resolvido em f8714842: receita B só da 0040, com conferência antes e depois.
- A3 (recomendado) docs/devops/105-roteiro-dono.md:31 · resolvido em f0b151ca: as três migrações listadas.
- A4 (recomendado) docs/devops/105-implantacao-vm.md:199 · resolvido em f8714842: a tabela vai até a 0040.
- A5 (recomendado) docs/devops/105-implantacao-vm.md:107 · segue aberto: citar o K-398 no parágrafo do efeito colateral.
- A6 (recomendado) docs/devops/105-roteiro-dono.md:222 · a receita A não refaz `REVOKE ALL ... FROM PUBLIC` nem `GRANT CONNECT` aos papéis de login (`01-databases-papeis.sh:25-26`).
- A7 (recomendado) docs/devops/105-implantacao-vm.md:259 · o rollback geral da seção 7 cita a 0040 por número e envelhece com a próxima migração.

## Parecer
Aprovado no head f0b151ca. A1 e A2 foram resolvidos: as receitas de rollback seguem a pilha real 0038 a 0040, o `down 1` fica restrito à 0040, com conferência antes e depois, e a restauração do backup é o caminho recomendado. A3 e A4 também foram resolvidos. A5, A6 e A7 são recomendados e não seguram a promoção. O A6 vai ao `security-engineer` como observação.
