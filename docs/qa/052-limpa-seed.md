---
tipo: qa
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-limpa-seed
commit: 6ff43dfd62c05101c32d5bba081dbbcb04afff7f
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-01
---
# QA: comando de limpeza do seed mock da base real (`db:limpar-seed`, pedido 052, E2.103, K-182)

Links: review `docs/reviews/052-limpa-seed.md` (aprovado em 6ff43df), segurança `docs/security/052-limpa-seed.md` (aprovado em 6ff43df), decisão do dono de 2026-11-01 14:25 (apagar só o seed mock, por script revisado), `docs/architecture/server.md` (comando e roteiro do dono, linhas 92 a 106).

**Parecer: aprovado**, sem bug aberto. O código testado é o de `6ff43df`; o HEAD `63cac88` só soma os pareceres de review e de segurança (só `docs/`). O comando, exercido no banco de teste pelo ponto de entrada real (`db:limpar-seed`), tira o seed e as versões de critério seed-mock dos domínios businessmap e acelerato, deixa a coleta real e o domínio pesquisa, simula sem gravar e recusa quando acharia dado real.

## Escopo e método
Tarefa de dados, sem especificação de UX nem contrato de API. As obrigações são a decisão do dono (só o seed sai, por simulação primeiro), as ADR 0022 (linha de coleta real não é tocada) e 0020 (nada de pessoa em saída), e o que o review e a segurança mandaram provar. Caixa-preta sobre o comportamento: banco real do Compose (PostgreSQL 17, `metricas_test`), papel dono `dspd_migrador`. O `.env` não foi lido e nada foi rodado no banco do dono; as variáveis de ambiente foram passadas na linha de comando, só para o banco de teste.

Exercício manual pelo comando de verdade (`pnpm --filter @metricas-dspd/server run db:limpar-seed`), num conjunto de esquemas próprio (`qa32limpa_dspd_*`, removido ao fim): migração, `semear` do mock (escala 0,05) e, por cima, uma carga "real" mínima (coleta `bm-f3/1` e `ac-f1/1`, 1 card com transição e staging, 1 chamado, 1 `ref_quadro` real, duas versões de critério reais com métrica). Script do QA fora do repositório; saída só com contagens.

## Critério, teste e resultado
| Obrigação | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Simulação (padrão) não grava e devolve só contagens | CLI sem opção, contagens antes e depois idênticas; `limpar-seed.pg.test.ts` (autor) | passou | simulação em transação somente leitura |
| `--aplicar` tira o seed do BusinessMap (card 505, transição 4138, bloqueio 151, 6 `ref_quadro`, `ref_coluna` 81, demais `ref_*`, 2 coletas) e do Acelerato (chamado 275, etapa 2040, 5 prioridades, 2 coletas) | CLI `--aplicar`; contagens depois: card 1, transição 1, bloqueio 0, `ctl_coleta` 1 por fonte | passou | chave inteira com `vigente_de`; `ref_quadro` 7 para 1 (o real fica) |
| Versões de critério seed-mock de businessmap e acelerato saem, com `ref_versao_criterio_metrica` (2 versões, 15 métricas) | CLI; contagem seed-mock por domínio 1 e 1 para 0 e 0 | passou | motivo `seed-mock` e referência `mock:` |
| Domínio pesquisa e versões reais ficam | CLI; pesquisa 1 para 1, versões reais 2 para 2, `ref_versao_criterio` 6 para 4 | passou | domínio fora da lista |
| Linhas da coleta real ficam idênticas (card, transição, staging, chamado, coleta, referência real) | CLI; contagens; `limpar-seed.pg.test.ts` compara a foto completa das linhas reais antes e depois | passou | linha real vizinha da do seed |
| Falha fechada: coleta real tocando card do seed (staging de coleta real com `id_origem` de card do seed) recusa tudo, com `--aplicar` | CLI após sabotar; saída `ligada-a-dado-real (stg_card: 1 linha(s) de staging com item do seed; nada foi removido)`, código 1, contagens iguais | passou | uma linha real apontando para o seed |
| Falha fechada nos demais casos (transição real em card do seed, marca da coleta fora das tabelas removidas, `ref_*` com chave do seed e conteúdo de outra origem, `ref_time` apontando para versão do seed) | `limpar-seed.pg.test.ts` e `limpar-seed.test.ts` (autor), lidos e rodados | passou | cada caso nomeado |
| Idempotência: segunda execução não faz nada | CLI simulação após aplicar: `coletas: 0` nas duas fontes, `criterios.tabelas` vazio | passou | seed já ausente |
| Gatilho append-only de `fato_transicao` volta ativo | `pg_trigger` no esquema após aplicar: `tg_fato_transicao_imutavel` e `tg_fato_transicao_sem_truncate` com `tgenabled = O` | passou | gatilho desligado só dentro da transação |
| Papel sem posse das tabelas não aplica e nada fica pela metade; trava curta (55P03) vira `trava` com ROLLBACK | `limpar-seed.pg.test.ts` (autor) | passou | permissão; trava ocupada |
| Argumento inválido recusado (código 2) | `limpar-seed.test.ts` (autor); CLI com `--` literal | passou | opção desconhecida |
| Nada de pessoa na saída (ADR 0020): saída só com contagens por tabela | leitura da saída inteira do CLI nos três modos | passou | nenhum id, nome ou título impresso |

## Resultado real
- Suíte `.pg` do server (`pnpm run test:pg`, uma por vez, banco do Compose): 26 arquivos, 172 testes, todos passaram (39,9 s).
- Suíte do server (`pnpm --filter @metricas-dspd/server run test`): 57 arquivos passaram e 26 pulados (os `.pg`), 1130 testes passaram e 172 pulados (23,9 s).
- Exercício pelo comando, nesta ordem: simulação (nada gravado), sabotagem e `--aplicar` (recusado, nada removido), cenário refeito, `--aplicar` (seed fora, real e pesquisa ficam), segunda simulação (zerada). Esquemas de teste removidos ao fim; árvore do git limpa antes do parecer.
- Contagens do cenário (BusinessMap), antes e depois do `--aplicar`: `dim_card` 506 e 1, `fato_transicao` 4139 e 1, `fato_bloqueio` 151 e 0, `ctl_coleta` 3 e 1, `ref_coluna` 81 e 0. Acelerato: `dim_chamado` 276 e 1, `fato_etapa_chamado` 2040 e 0, `ctl_coleta` 3 e 1.
- Vermelho antes do verde: os testes são arquivos novos de um módulo que a base (81fcd63) não tem (`limpar-seed.ts`); sem a implementação eles não carregam. Não rodei `forge-testes --vermelho` (ferramenta do repositório do Forge, que não está neste projeto).
- Mutação: o projeto não tem o Stryker instalado e a delegação proibia tocar código; não rodei mutação. A falha fechada foi provada por sabotagem real e pelos 9 cenários `.pg` e pelos de dublê do autor.

## Observações (não devolvem)
- O roteiro do dono em `docs/architecture/server.md` (linhas 105 e 106) usa `pnpm --filter ... run db:limpar-seed --aplicar`, e essa forma funciona. A forma `pnpm run db:limpar-seed -- --aplicar` repassa o `--` literal e o comando recusa com erro de uso (código 2, nada gravado): seguro, mas pode confundir. Vale um aviso no roteiro.
- O roteiro cita 5792 linhas em `dim_card` e 46759 em `fato_transicao` para o seed de 2026-10-09; na base real a simulação deve mostrar esses números. Se não mostrar, é o dono quem decide antes de aplicar (a simulação não grava).
- Os recomendados do review (A4, mensagem de trava em DELETE lento) e da segurança (A1) seguem para depois de segunda.

## Achados
- A1 (recomendado) server/src/plataforma/db/limpar-seed.ts:48 · `--` literal vindo do `pnpm run script -- --aplicar` vira erro de uso; ignorar um `--` solto ou citar no roteiro a forma sem `--`. Seguro (recusa), só experiência.
