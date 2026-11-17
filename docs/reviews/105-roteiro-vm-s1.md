---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-roteiro-vm-s1
commit: 9b603503
parecer: reprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: roteiro da VM e do dono depois do S1 (E7.428; review E7.430)

## Escopo lido
Diff `origin/develop...9b603503`, só texto: `docs/devops/105-implantacao-vm.md` (seção 2.1, itens 2 a 4) e `docs/devops/105-roteiro-dono.md` (0.3, seção 4 e seção 5). Conferi o texto contra o código da `develop` (`e1c98633`). Não há código no diff: 0 linhas pela M14, e não há guarda nem mutante a declarar. Sem PR para esta branch, então não há CI a citar. O autor não declarou PQ de suíte; para texto, a prova é o `forge-check docs`.

## Conferido contra o código (confere)
- **8 passos do `vm:preparar`, com o `ac:reprojetar-escala`.** Em `PASSOS` (`server/src/plataforma/db/vm-preparar.ts:14-23`) a ordem é migrar, ref:sync-calendario, bm:ref-sync, ac:ref-sync, ac:reprojetar-etapas, ac:reprojetar-fluxo, ac:reprojetar-escala (opcional) e ac:criterios. O passo opcional entra se `src/entradas/reprojetar-escala-ac.ts` existir (`server/src/entradas/vm-preparar.ts:39`), e ele existe na `develop`. O resumo `vm:preparar: ok, 8 passo(s)` confere com `vm-preparar.ts:55`.
- **Backup confirmado antes do `up`.** `recusaDeBackup` (`plataforma/db/vm-preparar.ts:44-51`) recusa quando há migração pendente sobre base com dados e a data de hoje em Brasília não está em `DSPD_BACKUP_CONFIRMADO` nem em `DSPD_BACKUP_DIR`. O Compose passa a variável ao `migrate` (`docker-compose.prod.yml:28-29`).
- **Coleta do Acelerato parada antes do `up`.** Os nomes `metricas-coleta-acelerato.timer` e `metricas-coleta-acelerato-releitura.timer` existem nas unidades do systemd do repositório, e há quatro timers ao todo, o que confere com "pare os quatro timers".
- **K-397.** `reprojecao-etapas.ts:96` e `reprojecao-fluxo.ts:48` voltam sem gravar quando nada mudou. `reprojecao-escala.ts:26` grava a linha `projecao` em `ctl_coleta` sempre, antes do laço. O texto acerta nos dois casos e cita o arquivo.
- **0040 e a marca.** A 0040 tem `down` que tira `dim_chamado.escala_p` (`server/migrations/0040_ac_dim_chamado_escala_p.ts:14-15`). `105:S1-escala-p` está em `criterios-acelerato.ts:67`, e `ac:reprojetar-escala` está em `server/package.json:25`.
- **Travas do `down`.** `motivoDeRecusa` (`plataforma/db/trava-down.ts`) exige `DSPD_PERMITIR_DOWN=1` e o `ultimo-backup-ok` de hoje em `DSPD_BACKUP_DIR`, como o texto diz.

## Achados
- A1 (bloqueante) docs/devops/105-roteiro-dono.md:218 · "outro `down 1` depois" tira a 0039, não a 0038 (`checkOrder`, `migrar.ts:91`); o `down` da 0039 apaga `stg_toque_instante` e `ctl_toque_leitura`, dado de coleta do BusinessMap. Detalhe abaixo.
- A2 (bloqueante) docs/devops/105-roteiro-dono.md:208 · "Desfazer só a 0038" com `down 1`: com 0038 a 0040 aplicadas no 0.2, o `down 1` tira a 0040 e a conferência do item 3 segue em `1`. Detalhe abaixo.
- A3 (recomendado) docs/devops/105-roteiro-dono.md:60 · "Deve mostrar: a migração `0038` ... aplicada" ficou incompleto. Na `develop` o `db:migrate` aplica 0038, 0039 e 0040. O mesmo vale para as linhas 31 e 61. Sugestão: listar as três.
- A4 (recomendado) docs/devops/105-implantacao-vm.md:199 · A tabela do SQL do DBA para em `0039_...sql`, mas a `develop` tem a 0040 (`server/migrations/0040_ac_dim_chamado_escala_p.ts`). Sugestão: `0040_...sql`, ou "até a última migração".
- A5 (recomendado) docs/devops/105-implantacao-vm.md:107 · O texto diz que o K-397 não alcançou o `ac:reprojetar-escala`, mas não cita o K-398, a correção em curso. Sugestão: citar o K-398, para que o parágrafo seja atualizado quando ele entrar.

## Detalhe dos bloqueantes
- **A1.** Entre a 0038 e a 0040 existe a `0039_bm_toque_primeiro`, e o runner roda com `checkOrder` (`server/src/plataforma/db/migrar.ts:91`). Depois de desfeita a 0040, o próximo `down 1` desfaz a 0039. O `down` dela (`server/migrations/0039_bm_toque_primeiro.ts:51-56`) apaga `stg_toque_instante`, `ctl_toque_leitura` e as colunas de toque de `dim_card`: é dado coletado, não derivado. Sugestão: dizer que tirar a 0038 exige desfazer antes a 0040 e a 0039, uma por vez, e que a 0039 apaga dado de coleta (decisão do Jarvis, ou restaurar o backup).
- **A2.** Pela linha 31 do roteiro, a base do dono está na 0037. O passo 0.2 aplica 0038, 0039 e 0040 juntas, e o diff deixou a 0040 incondicional na seção 5. Seguido como está escrito, o item 2 desfaz a 0040, e a conferência do item 3 (coluna `fluxo`) continua imprimindo `1`. Sugestão: reescrever a seção 4 para a pilha 0038 a 0040, com a conferência do `pgmigrations` antes de cada `down 1` (como o item 5 já faz) e a ressalva do A1.

## Fora do diff, sem achado
O item 2.1.1 (`105-implantacao-vm.md:91`) põe a parada da coleta dentro do subitem "Versão com migração nova?". O texto em negrito vale para toda subida, e está certo: o `vm:preparar` roda as reprojeções em todo `up`. Só a posição pode confundir.

## Parecer
Reprovado por A1 e A2: a receita de rollback da seção 4 do roteiro do dono, seguida como está escrita, desfaz a migração errada, e no caso do A1 apaga dado de coleta do BusinessMap. O texto da VM (seção 2.1) confere com o código. A volta é do autor do texto; na revalidação leio só o delta.
