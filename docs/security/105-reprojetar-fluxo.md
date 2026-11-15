---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-ac-reprojetar-fluxo
commit: ab43b72a12b1ae2bbd5ec8d62be368ee77414f61
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-15
---
# Review de segurança: ac:reprojetar-fluxo (E6.19)

Propósito: conferir que o comando que preenche `dim_chamado.fluxo` dos chamados já projetados não leva pessoa nem texto livre do staging a lugar nenhum, que o SQL é parametrizado e que não há GRANT novo. Público: tech-lead, node-backend, qa-engineer. Revisão estática do diff `0358e417..ab43b72a` (código de `server/`); os commits posteriores (`d99bb897`, `159fb3a2`) tocam só `docs/reviews` e `docs/qa`. Nenhum código foi alterado.

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

## Provas
- CI do head `ab43b72a`: run 43759194037, `success` (a suíte inteira, inclusive o job `banco` com os `.pg`, roda só no CI). Os runs posteriores são de commits só de `docs/`.
- Testes do comando lidos (`acelerato-reprojecao-fluxo.test.ts`, `.pg.test.ts`, `reprojetar-fluxo-ac-entrada.test.ts`); cobertos pelo CI acima, não rodei a suíte local.
- Ferramentas locais de varredura: nenhuma além da leitura; o job `seguranca` do CI cobre `gitleaks`, auditoria e SAST.

## Plano em cartões
- Nenhum cartão bloqueante. A1 já tratado pelo aviso do CHANGELOG; dono tech-lead, sem esforço.
