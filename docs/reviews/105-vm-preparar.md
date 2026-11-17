---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vm-criterios-ac
commit: e0b84358cc250856eec48476842b47bb375a2d30
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: `vm:preparar` na subida (K-396, volta 1, E7.403; review E7.405)

## Escopo lido
`git diff 8a40f662...e0b84358`, só o código e o Compose: `server/src/entradas/vm-preparar.ts` (novo), `server/src/plataforma/db/vm-preparar.ts` (novo), `server/tests/vm-preparar.test.ts` (novo), `server/src/entradas/criterios-ac.ts` (catch por categoria, fecha o A5 do review anterior), `docker-compose.prod.yml` (serviço `migrate`), `package.json` e `server/package.json` (scripts). Da documentação, só a seção 2.1 de `docs/devops/105-implantacao-vm.md`. A ponta da branch andou depois (`b2d4b4a6`), mas só com os pareceres de devops e de segurança; o código revisado é o de `e0b84358`.

Tamanho (M14): 235 linhas de código e teste (`git diff --numstat --no-renames origin/develop...e0b84358`, sem `.md`). Passa da orientação de 150; um comportamento só (o preparo da base na subida). O PR tem de trazer `teto: excedido, 235 linhas, comando novo com a trava de backup e o teste`.

## Ordem dos passos
`PASSOS` (`server/src/plataforma/db/vm-preparar.ts:14-23`): migrar, ref:sync-calendario, bm:ref-sync, ac:ref-sync, ac:reprojetar-etapas, ac:reprojetar-fluxo, [ac:reprojetar-escala, opcional e ausente nesta versão], ac:criterios. São 7 passos nesta versão. Conferi a ordem contra o que cada passo precisa:
- migrar vem primeiro; os GRANTs do `dspd_ref` saem dele, e os passos 2 a 4 usam esse papel (`PG_REF_URL` agora está no serviço `migrate`).
- O calendário vem antes do `ac:ref-sync`, cujos alvos conferem o expediente vigente. Vem também antes do `ac:reprojetar-etapas`, que recusa sem ele (`reprojecao-etapas.ts:36`, "rode ref:sync-calendario antes").
- `ac:criterios` vem por último. A `099:D-7-528` é gravada pela reprojeção; as outras, por `registrarCriterio`, idempotente pela `referencia` (`criterios-acelerato.ts:76-77`).
- O `executarPassos` para no primeiro código diferente de 0, nomeia o passo e não roda os seguintes (testado). O `depends_on: service_completed_successfully` segura a API e o worker.
- A trava de backup roda antes do processo `migrar`, com o migrador. Ela compara os nomes de `server/migrations` (39 arquivos `.ts` mais o `checksums.json`, que é ignorado) com `pgmigrations`, o mesmo nome que o runner grava.

## Idempotência (passo a passo, lida no código)
- `ref:sync-calendario`, `bm:ref-sync`, `ac:ref-sync`: sem diferença entre o arquivo e o que está vigente, nada é gravado. A versão T2.6 sai uma por hash e dia (`dominio-acelerato.ts:170-199`; alvos em `alvos-acelerato.ts:221`).
- `ac:criterios` e a `099:D-7-528`: uma linha por `referencia`; repetir devolve `false`.
- `ac:reprojetar-fluxo`: só toca `fluxo IS NULL`, e só com resultado não nulo (`reprojecao-fluxo.ts:34-43`).
- `ac:reprojetar-etapas`: regrava `fato_etapa_chamado` de todos os chamados fechados a cada subida. Com o mesmo calendário, o resultado é igual, mas custa uma transação sobre a base inteira em toda subida (A3).
- Nenhum passo chama BusinessMap nem Acelerato. A imagem leva `docs/architecture/fontes` (`server/Dockerfile:18`), e o `.env` não entra nela (`.dockerignore`; a fase final não copia a raiz).
- `.env` à mão: `process.loadEnvFile` não sobrescreve variável já no ambiente, nem vazia (sonda S2). Isso confere com o comentário de `vm-preparar.ts:15`.

Os dois efeitos que se repetem a cada subida são as linhas `projecao` em `ctl_coleta` (A1) e a regravação das etapas (A3).

## As duas escolhas do autor
1. **`ac:ref-sync` na subida: concordo.** Com o mesmo arquivo, a repetição não grava nada, nem no mesmo dia nem em outro (plano vazio, sem versão). Com o arquivo mudado no mesmo dia de outra subida, o passo recusa e a subida para com o nome do passo. É o comportamento que a decisão 2 do dono aceita ("parando no primeiro erro"), e o roteiro dá a saída (`ac:ref-sync` com a data de amanhã, `105-implantacao-vm.md:106`). O mesmo vale para o `ref:sync-calendario` com turnos mudados no mesmo dia (`calendario.ts:188`). O roteiro só cita o caso do Acelerato (A4).
2. **`bm:ref-sync-apontamento` fora: concordo.** Numa base sem cards ele recusa (tipo de card ausente em `ref_tipo_card`) e derrubaria a primeira subida. Ele já roda no timer semanal de referências, e o `PROXIMO_PASSO` e o roteiro o mandam rodar depois da primeira carga. A decisão A do dono (primeira carga fora) é cumprida: o teste afirma que não há `coleta`, `carga` nem `classe-servico` nos nomes.

## Verificações e ferramentas
- Suíte: sem PR para a branch, a suíte inteira fica para o CI do PR; não afirmo CI verde neste head. O autor registra no roteiro a prova da 2ª subida do dia (`inseridos: 0, fechados: 0`). Rodei só o teste novo: `vitest run tests/vm-preparar.test.ts`, 11 de 11 passaram.
- Mutantes rodados no teste novo, um por guarda pura: `|| e.aplicadas === 0` removido, `.trim()` removido e `codigo !== 0` trocado por `codigo < 0`. Os três foram mortos (1 falha cada). O mutante de ordem da S1 sobrevive (A2).
- O `docs/engineering/praticas.md` não traz regra "decidida por" que alcance estes arquivos.
- Pipeline e segurança: o `devops-engineer` (`docs/devops/105-vm-preparar.md`) e o `security-engineer` (`docs/security/105-vm-preparar.md`) aprovaram. O `??` que não cai para `DSPD_BACKUP_DIR` no Docker é o A1 de segurança; não o repito.

## Sondas
- S1 · `ac:reprojetar-etapas` movido para logo depois de `migrar` em `PASSOS` · espera: o teste de ordem falha · obtido: `Tests 11 passed (11)`. O mutante sobrevive, e a ordem errada só apareceria na VM, com a recusa "rode ref:sync-calendario antes".
- S2 · `X_PREC=ambiente` e depois `X_PREC=` (vazio) com `process.loadEnvFile` de um arquivo que traz `X_PREC=arquivo` (Node 24.22.1) · espera: o ambiente vale mais · obtido: `ambiente` e `""`

## Efeito das reprojeções (base do A1)
As reprojeções gravam em `ctl_coleta` uma linha de tarefa `projecao` com status `sucesso` a cada subida (`reprojecao-fluxo.ts:27`, `reprojecao-etapas.ts:57`). A `lerMarcaDagua` conta `projecao` (`modulos/operacao/repositorio.ts:73`); a "última coleta" por fonte não muda, porque só conta `coleta_incremental`. O que muda é a data de corte S-a do Acelerato (`modulos/metricas/servico.ts:300`) e a `dataReferencia` (`modulos/referencia/servico.ts:66`): até a próxima coleta, a idade dos itens em aberto passa a ser contada até a hora da subida, além da última coleta. Isso contraria a regra do comentário em `servico.ts:297`, "nenhum painel mostra dado além da própria coleta", e o cache é invalidado. Se a reprojeção sem mudança deve deixar de gravar `ctl_coleta` é regra de negócio (S-a): vai ao dono, sem decisão por inferência.

## Achados
- A1 (recomendado) docs/devops/105-implantacao-vm.md:107 · O efeito descrito está errado: a subida não muda a "última carga", muda a data de corte S-a do Acelerato até a próxima coleta (ver "Efeito das reprojeções"). Corrigir o texto e levar ao dono, pelo Jarvis, se a reprojeção sem mudança deixa de gravar `ctl_coleta`.
- A2 (recomendado) server/tests/vm-preparar.test.ts:10 · O teste de ordem não prende a lista inteira, e a S1 mostra a reprojeção antes do calendário passando verde. Afirmar a sequência exata: `expect(PASSOS.map(p => p.nome)).toEqual([...])`.
- A3 (recomendado) server/src/plataforma/db/vm-preparar.ts:19 · `ac:reprojetar-etapas` regrava todas as etapas dos fechados em toda subida, numa transação, com a coleta ligada: o custo cresce com a base e há disputa de lock. Cartão próprio: pular se a `099:D-7-528` já existe e o calendário não mudou.
- A4 (recomendado) docs/devops/105-implantacao-vm.md:106 · O roteiro explica a recusa no mesmo dia só para o `ac:ref-sync`. O `ref:sync-calendario` também recusa turnos ou aplicação mudados no mesmo dia (`calendario.ts:188`, `:199`) e para a subida. Citar os dois, com a mesma saída (data de amanhã).
- A5 (recomendado) server/src/entradas/vm-preparar.ts:42 · A trava de backup e o laço da entrada não têm teste: a ligação `p.nome === 'migrar'` e a recusa que devolve 1 só valem por leitura. Um teste da entrada com `rodar` falso, ou a guarda movida para `executarPassos`, prenderia isso.
- A6 (recomendado) server/src/entradas/ref-sync-businessmap.ts:26 · Com `recusados` não vazio, o `bm:ref-sync` sai com 0 (grava por campo, K-383), e o resumo do `vm:preparar` diz `ok`. O campo recusado só aparece no JSON do passo. Citar no item 2.4 do roteiro que é preciso conferir `recusados` no log.

## Delta lido
Primeira leitura deste parecer (comando novo; o parecer anterior, `docs/reviews/105-vm-criterios-ac.md`, foi sobre `ffcafe2c`). O A1 de lá (backup depois da migração) foi fechado pela trava `recusaDeBackup` e pela ordem "backup, `up`" no item 2. O A5 de lá foi fechado pelo catch do `criterios-ac.ts`.
