---
tipo: revisao-devops
contrato: 1
pedido: 105-melhorias-15-11
branch: feat/105-t3-habilitador
commit: dbf457a1bb79ff1d76b9f090def832c067fa8cd9
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-17
---
# Review de devops: 105-t3-habilitador

## Achados
- A1 (recomendado) deploy/sql/0041_bm_ref_tipo_card_habilitador.sql:1 · O gerador (pnpm run db:sql, precisa de Docker) não foi reexecutado por mim; a igualdade com a migração foi conferida só por leitura. Fica no PQ do autor e no CI.
- A2 (recomendado) changelog.d/feat-105-t3-habilitador.md:16 · A ação do dono cita bm:ref-sync e a reprojeção do BM, mas o vm:preparar só roda o bm:ref-sync; a reprojeção (bm:projetar) fica manual. Nomeie o comando na nota da release.

## Detalhes
Aprovado. Escopo (E7.518): migração 0041, deploy/sql e caminho da VM; `.github/`, Dockerfile e compose não mudam.

- Migração `server/migrations/0041_bm_ref_tipo_card_habilitador.ts`: troca o CHECK `ref_tipo_card_categoria_check` (drop if exists + add) de seis para sete valores; nenhum valor sai, nenhuma linha é reescrita; repetível. O `down` volta a seis e falha se houver linha `habilitador`, de propósito (não apaga dado): caminho de volta escrito pelo dev da stack, aceitável. Registrada em `server/tests/migracoes.ts` e em `checksums.json` (o checksum é sobre o `ddl`, não sobre o arquivo; não pude recalcular porque a worktree não tem `node_modules` e não instalo ferramenta; o CI e o teste de checksums cobrem).
- `deploy/sql/0041_...sql`: mesmo padrão do 0040 (cabeçalho GERADO, BEGIN, DDL, INSERT em `dspd_core.pgmigrations`, COMMIT); o SQL bate com o DDL da migração (sete valores, mesma ordem). O `consolidado.sql` ganha o mesmo bloco antes dos REVOKE/GRANT; `deploy/sql` passa a ter 45 arquivos. Sem segredo. GRANTs não mudam (CHECK de coluna não altera privilégio; o GRANT por coluna da API fica intacto).
- Caminho do DBA: aplicar o 0041 (ou o consolidado em base nova) como `dspd_migrador`; o registro em `pgmigrations` vem no próprio arquivo, então runner e DBA convergem. Ordem: migração antes do `bm:ref-sync`, senão o banco recusa a categoria `habilitador`.
- `vm:preparar`: passos em ordem (migrar, ref:sync-calendario, bm:ref-sync, ...), parando no primeiro erro; a migração vem antes do ref-sync, e a trava de backup antes de migrar base com dados segue valendo. Sem mudança de código ali. A contagem "39 migrações" só aparece em QA e pareceres históricos, não em doc operacional vigente.
- Ferramentas: `docker` presente, gerador não rodado (A1); `actionlint` ausente e desnecessário (nenhum workflow mudou). Suíte inteira: fica para o CI do PR; cito o PQ do autor e não afirmo CI verde.
- A branch andou depois do Revisar-sha só com `docs/security/105-t3-habilitador.md`, fora do meu domínio; o parecer vale para dbf457a1.

## Custo e rollback
Sem minutos novos de CI nem recurso pago (`R-CUSTO`). Rollback: `down` da 0041 (CHECK de seis valores) com o app anterior, desde que nenhuma linha `habilitador` exista; se existir, volte antes a categoria no `bm:ref-sync` anterior. O vm:preparar exige o backup do dia antes de migrar.
