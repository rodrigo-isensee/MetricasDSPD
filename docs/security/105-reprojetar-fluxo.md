---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-ac-reprojetar-fluxo
commit: ceb868773503b7c08d4831237e4beafedb5367fa
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-15
---
# Review de segurança: ac:reprojetar-fluxo (E6.19, revalidado em E6.27)

Propósito: conferir que o comando que preenche `dim_chamado.fluxo` dos chamados já projetados não leva pessoa nem texto livre do staging a lugar nenhum, que o SQL é parametrizado e que não há GRANT novo. Público: tech-lead, node-backend, qa-engineer. Revisão estática do diff `0358e417..ab43b72a` (código de `server/`) e, na revalidação, do commit `ceb86877`. Nenhum código foi alterado.

## Achados
- A1 (recomendado) server/src/modulos/acelerato/reprojecao-fluxo.ts:27 · a linha `ctl_coleta` de tarefa `projecao` move a marca d'água de "última carga" da tela até a próxima coleta; é integridade de informação, não vazamento, e o aviso está no CHANGELOG ("Ações do dono depois da release 105"), então não bloqueia.

## Gatilhos
Banco e credencial do migrador (`PG_MIGRADOR_URL`). Sem dependência nova, sem rota, sem fronteira externa.

## Evidência
- **Nada de pessoa nem texto livre.** O único dado lido do staging é `stg_etapa.payload` (`staging.ts:50-53`), já filtrado pela allow-list na fronteira do coletor. `etapasDoStaging` (`projetor.ts:74-82`) extrai só `descricao`, `descricao_workflow`, `tempo_sla_segundos` e `quantidade_vezes`; o resultado é reduzido por `fluxoDoChamado` a um texto da lista fechada de fluxos. Nenhuma coluna de `stg_chamado` (título, descrição, pessoa) é lida. Saem para o banco só o `chamado_id` e o fluxo; para o terminal, só contagens (`reprojetar-fluxo-ac.ts:14`); em falha, só `categoriaDoErro` (`:16`), sem URL, senha nem texto do erro.
- **SQL parametrizado.** `reprojecao-fluxo.ts`: `INSERT` do controle com `$1`, `$2`; `SELECT` do cursor com `$1`; `UPDATE ... FROM unnest($1::text[], $2::text[])` com ids e fluxos em parâmetros. A única interpolação é `S.ac` (vem de `montarEsquemas`, que valida o prefixo por `PREFIXO_VALIDO`, `esquemas.ts:11`) e `TAMANHO_LOTE` (constante 500, `projetor.ts:20`). Nenhuma entrada do operador chega ao texto do SQL.
- **Não sobrescreve nem apaga.** `UPDATE` só com `d.fluxo IS NULL` e só grava resultado não nulo; fluxo múltiplo e chamado sem etapa seguem nulos. `dim_chamado_versao`, staging e intervalos não são tocados; nenhum `DELETE`. Tudo numa transação (`emTransacao`): falha desfaz.
- **Sem GRANT novo.** O diff não toca `migrations/`; `0038_ac_dim_chamado_fluxo.ts` já existia na base. O comando só escreve em `dim_chamado.fluxo` (coluna da 0038) e em `ctl_coleta`/contagens, tabelas que o migrador já escreve. A API (`dspd_api`) não ganha acesso.
- **Credencial.** `carregarConfigMigrar()` lê o `.env` só no processo; pool `max: 1`; `pool.end()` no `finally`. Nenhum segredo no código, no `package.json` nem no CHANGELOG.
- **Controle.** `ctl_coleta` e as contagens gravam só números e a versão fixa `acelerato-f2/2-reprojecao-fluxo`.
- **Cadeia de suprimentos.** `server/package.json` ganha só um script (`ac:reprojetar-fluxo`); nenhum pacote novo, lockfile intocado.
- **Uso indevido.** Operar exige a credencial do migrador (já privilegiada); o comando não amplia o que ela faz e é idempotente.

## Revalidação (E6.27, head ceb86877)
- `forge-check parecer delta`: no domínio, só `server/src/modulos/acelerato/reprojecao-fluxo.ts` (o `CHANGELOG.md` é documentação). O diff é uma linha, `reprojecao-fluxo.ts:38`: `fluxoDoChamado(id, etapasDe.get(id) ?? [], c)`.
- Releitura de `fluxoDoChamado` (`normalizador.ts:135-140`): o `idOrigem` só é entregue a `c.somarChamado('fluxo_multiplo', idOrigem)`, o contador em memória que conta chamado distinto; não entra em SQL, log nem saída. Para o banco continua indo só o que já ia (`chamado_id` e fluxo no `UPDATE` parametrizado). O `id` vem de `dim_chamado.chamado_id`, identificador de origem, não dado de pessoa.
- Sem GRANT, migração, dependência, segredo nem fronteira nova; os demais itens da evidência acima seguem válidos. Nenhum achado novo.

## Provas
- CI do head `ceb86877`: run 43761287119, `success` (a suíte inteira, inclusive o job `banco` com os `.pg`, roda só no CI), conforme o brief E6.27. Os commits posteriores (`4d206f5b`, `e4bec57c`) tocam só `docs/reviews` e `docs/qa`.
- Testes do comando lidos na rodada anterior (`acelerato-reprojecao-fluxo.test.ts`, `.pg.test.ts`, `reprojetar-fluxo-ac-entrada.test.ts`); não rodei a suíte local.
- Ferramentas locais de varredura: nenhuma além da leitura; o job `seguranca` do CI cobre `gitleaks`, auditoria e SAST.

## Plano em cartões
- Nenhum cartão bloqueante. A1 já tratado pelo aviso do CHANGELOG; dono tech-lead, sem esforço.
