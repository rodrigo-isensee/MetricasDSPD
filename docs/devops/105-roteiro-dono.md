# Roteiro do dono: cargas na base real depois da release 105 (E5.8)

**Escopo:** só o computador local (WSL), onde ficam os dados reais. A VM (servidor interno) segue no cartão **K-340** e não está neste roteiro.

Para quem não é técnico. Nada deste documento foi executado pelo time: os comandos são seus, depois do merge da release 105 na `main`. Cada comando foi conferido no código da `develop` (ponta `0358e417`); o que o código não prova aparece como **a confirmar**. Nenhuma senha, chave ou nome de pessoa aparece aqui.

Como usar: **não use a pasta `~/Metricas/MetricasDSPD`**. É a pasta onde o Jarvis grava o quadro o tempo todo, e um `git checkout main` ali é recusado quando há arquivo modificado. O roteiro roda numa pasta própria da `main`, `~/Metricas/MetricasDSPD-main`, sem mexer na do Jarvis.

Primeira vez (cria a pasta, uma vez só):
```
git -C ~/Metricas/MetricasDSPD worktree add ~/Metricas/MetricasDSPD-main main
```
Se a pasta já existir, só atualize (depois do merge da release 105 na `main`):
```
git -C ~/Metricas/MetricasDSPD-main pull
```
Nos dois casos, instale as dependências e entre na pasta:
```
cd ~/Metricas/MetricasDSPD-main && pnpm install; echo "rc=$?"
```
Rode **dessa pasta, no ramo `main`**, um comando por vez (todos os `cd` do roteiro são para `~/Metricas/MetricasDSPD-main`). Cada comando vem entre parênteses com `set -a; . ~/Metricas/MetricasDSPD/.env; set +a`: isso carrega o `.env` da pasta original, pelo caminho, só para aquele comando, sem mostrar o conteúdo e **sem copiar a credencial**. Não crie `.env` na pasta nova. Basta carregar assim porque os programas do servidor (`bm:coleta`, `bm:projetar`, `bm:criterios-classe-servico` e outros) tentam ler o `.env` da raiz da pasta onde rodam, aceitam que ele não exista e não sobrescrevem variável já carregada; `db:migrate` e `coleta ac` (scripts `db.sh` e `coleta.sh`) fazem o mesmo. Depois de cada um, rode `echo "rc=$?"` (já vai junto abaixo): **rc=0 é sucesso**; qualquer outro número é erro.

**Regra de ouro:** deu erro, PARE. Não tente o passo seguinte. Copie a mensagem de erro inteira (sem senhas) e mande ao Jarvis, junto com o número do passo e a duração. Nenhum passo apaga dado; todos podem ser repetidos. Não use `--force` nem apague tabelas. Os tempos não foram medidos: anote cada duração e devolva. Se um passo passar de 15 minutos sem imprimir nada (o passo 3 pode passar, ver lá), pare e avise.

## Linha de base (tirada pelo assistente na base real em 15/11, antes das cargas)

- 18879 cards não excluídos em `dspd_bm.dim_card`.
- 0 com `classe_servico`, 0 com `origem_bug`, 0 com `fase_deteccao`.
- `dspd_bm.ref_dominio` com 10 linhas.
- O coletor lê as três colunas: `has_column_privilege` = `t`.
- Migrações: a última aplicada é a **0037**; a **0038** (`dim_chamado.fluxo`, Acelerato) **falta**, então o `db:migrate` do passo 0.2 é obrigatório.
- `dspd_ac.dim_chamado` tem **5144 chamados**, todos com `fluxo` nulo (a coluna ainda não existe).

## 0. Antes de começar

### 0.1 A coleta agendada precisa parar? Sim, só se você mesmo criou uma

O repositório não instala agenda de coleta nesta máquina: o `worker` do Compose tem a lista de tarefas agendadas vazia (`server/src/entradas/worker.ts`), e os timers de `deploy/systemd/` e o serviço `coleta` (perfil `coleta` do Compose) são da VM. Se você criou uma agenda de coleta aqui:

1. Agendador de Tarefas do Windows: procure tarefas que chamem a coleta (BusinessMap ou Acelerato) e use "Desabilitar". Anote os nomes.
2. Cron do WSL: `crontab -l`; se houver linha de coleta, `crontab -e` e ponha `#` na frente (anote qual).
3. Sem agenda criada por você, nada a desligar. Em dúvida, pare e pergunte ao Jarvis.

A coleta deve ficar parada **durante todos os passos** e só voltar no fim (seção 3). Motivo: o passo 3 e o `bm:projetar` recusam rodar se outra coleta ou projeção do BusinessMap estiver em andamento (trava por fonte), e a releitura longa não deve disputar a base com uma coleta de costume.

Conferir que nada roda agora (deve imprimir nada nos dois):
```
ps aux | grep "entradas/coleta" | grep -v grep
docker ps --format '{{.Names}}' | grep -i coleta
```

### 0.2 Banco no ar e migração

O banco do Compose precisa estar de pé: `(set -a; . ~/Metricas/MetricasDSPD/.env; set +a; pnpm run db:up); echo "rc=$?"` (rc=0; é o mesmo banco da pasta original, porque o Compose usa o mesmo nome de projeto). Depois:
```
(set -a; . ~/Metricas/MetricasDSPD/.env; set +a; pnpm run db:migrate); echo "rc=$?"
```
- Tempo: segundos.
- Deve mostrar: a migração `0038` (coluna `fluxo` em `dim_chamado` do Acelerato) aplicada, se ainda faltar, e rc=0. Rodar de novo diz que não há migração pendente.
- Atenção: o rascunho do assistente dizia "nenhuma migração nova". Na `develop` existe a **0038** (pedido 099, D1); por isso este passo é obrigatório.
- Se der erro: pare e avise. Pode repetir.

### 0.3 Acelerato: preencher o fluxo dos chamados já na base (`ac:reprojetar-fluxo`)

Rode **uma vez**, com a coleta parada, **depois do `db:migrate` (0.2) e antes das cargas do BusinessMap** (passos 1 a 4). Comando novo, da branch `feature/105-ac-reprojetar-fluxo` (aprovado em review e QA; precisa estar mesclado na `main` junto com a release):
```
(set -a; . ~/Metricas/MetricasDSPD/.env; set +a; pnpm --filter @metricas-dspd/server run ac:reprojetar-fluxo); echo "rc=$?"
```
- O que faz: a migração 0038 criou `dim_chamado.fluxo` vazia e a coleta de costume só projeta versões novas do staging; este comando reaplica a regra de fluxo que já existe às etapas guardadas no staging e preenche `fluxo` **só onde ele é nulo**. Nunca troca valor existente, não chama o Acelerato e não toca no staging. Roda em lotes, numa transação só (tudo ou nada), com a credencial do migrador.
- Não recebe argumento. Imprime só contagens, em uma linha JSON: `coletaId`, `lidos`, `preenchidos`, `fluxoMultiplo`, `semFluxo`. Rc=0 é sucesso; rc=1 é erro (`ac:reprojetar-fluxo falhou: <categoria>`): pare e avise. Como é uma transação só, o erro não deixa nada pela metade.
- Repetir é seguro e não muda nenhum dado (só soma uma linha de execução em `ctl_coleta`); mesmo assim, não precisa repetir.
- Resultado esperado: `lidos` = 5144 e `preenchidos` quase todos. Chamado com **fluxo múltiplo** e chamado **sem etapa** seguem nulos de propósito (aparecem em `fluxoMultiplo` e `semFluxo`).
- Atenção: o "última carga" da tela do Acelerato passa a mostrar a hora desta reprojeção até a próxima coleta do Acelerato. Não é erro nem dado novo.
- Tempo: não medido; anote a duração e devolva.

## 1. Passos

### Passo 1. Acelerato: listas do PROC e alvos (S5, S6, S7)
```
(set -a; . ~/Metricas/MetricasDSPD/.env; set +a; pnpm --filter @metricas-dspd/server run ac:ref-sync); echo "rc=$?"
```
- Argumento opcional: data `AAAA-MM-DD` (vigência); sem data vale hoje (Brasília). Não informe.
- O que faz: grava em `dspd_ac.ref_dominio` as listas de `docs/architecture/fontes/acelerato-dominio.json`, incluindo `fluxo_proc` (os cinco fluxos do PROC), e os alvos de prazo por prioridade. Não chama o Acelerato.
- Tempo: segundos.
- Deve mostrar: uma linha JSON com `vigenteDesde` e contagens (incluindo `alvos`), rc=0.
- **Se o último `ac:ref-sync` foi hoje, não rode de novo:** duas cargas no mesmo dia confundem a data de vigência dos alvos (regra do roteiro da 104). Não sabe quando foi o último? Pare e pergunte ao Jarvis, que confere na base.
- Conferir: S5, S6 e S7 deixam de dizer "sem dado real: fluxos do PROC não carregados" **só se os chamados já tiverem o fluxo preenchido** (passo 0.3).
- Se der erro: `ac:ref-sync falhou: <categoria>`. Variável ausente no `.env`: confira só os nomes, nunca os valores. Pare e avise.

### Passo 2. BusinessMap: dicionário, com a tabela coluna para fase do O15
```
(set -a; . ~/Metricas/MetricasDSPD/.env; set +a; pnpm --filter @metricas-dspd/server run bm:ref-sync); echo "rc=$?"
```
- Argumento opcional: data `AAAA-MM-DD`; sem data, hoje. Não informe.
- O que faz: grava em `dspd_bm.ref_dominio` o dicionário de `docs/architecture/fontes/businessmap-dominio.json`, que agora inclui as 347 colunas para fase (`fase_deteccao_coluna`). Não chama o BusinessMap. Pode repetir.
- Tempo: segundos.
- Deve mostrar: uma linha JSON com `vigenteDesde`, contagens e o hash do arquivo, rc=0.
- Conferir (consulta na seção 2): `ref_dominio` do BusinessMap deixa de ter 10 linhas e passa a ter **cerca de 357 vigentes** (10 + 347). O número exato é **a confirmar**: o código não o fixa.
- Se der erro: `bm:ref-sync falhou: <mensagem>`. A validação do arquivo é fechada e o erro de formato vem escrito. Mande a mensagem ao Jarvis.

### Passo 3. BusinessMap: releitura completa com projeção (O24, O15, O18)
```
(set -a; . ~/Metricas/MetricasDSPD/.env; set +a; pnpm --filter @metricas-dspd/server run bm:coleta carga-inicial --projetar); echo "rc=$?"
```
- Por que `carga-inicial` e não `incremental`: o incremental só lê o que mudou desde a marca d'água, e as etiquetas (O24) dos cards parados só chegam relendo tudo. Pelo código, a carga inicial lê a janela dos últimos 12 meses (`MESES_CARGA`) para cards arquivados e excluídos, e os cards ativos inteiros. **A confirmar:** se com a base real de 18879 cards a releitura cobre todos os que hoje estão na base (o código não prova a cobertura; a conferência da seção 2 mostra o resultado).
- `--projetar`: ao fim da coleta, roda a projeção que preenche `dim_card.classe_servico` (O24), `origem_bug` (O18) e `fase_deteccao` (O15). Só GET no BusinessMap; nada é escrito lá. Histórico não é sobrescrito: cards arquivados e excluídos permanecem.
- Opções que **não** precisa usar: `--inicio=AAAA-MM-DD`, `--motivo=...`, `--motivo-chave=...` (só se a saída listar `motivosPendentes`; nesse caso pare e avise).
- Tempo: **a confirmar**; limite de 25 chamadas por minuto, então espere de minutos a algumas dezenas de minutos. **Não interrompa.** Se for interrompida, rodar o mesmo comando de novo retoma de onde parou (retomada por página).
- Deve mostrar: JSON com `"estado": "sucesso"` e rc=0. `rc=3` é parcial (estado diferente de `sucesso` ou falha na etapa do apontamento): os cards foram gravados mesmo assim; copie o JSON e avise. Repetir é seguro.
- Se der erro:
  - `bm:coleta falhou: trava (...)`: outra coleta ou projeção está em andamento. Espere terminar (ou pare o worker/agenda) e rode de novo.
  - `bm:coleta falhou: uso`: a linha de uso é impressa; confira o que digitou.
  - `esquema-com-seed`: a base recebeu dado de mock; pare e avise (não limpe por conta própria).
  - Mensagens trazem só a categoria (nunca texto da API). `erro-interno`: mande o código.
- Só se este passo não puder ser feito: `bm:projetar` sozinho (sem chamar o BusinessMap) preenche O18 e O15 a partir do que já está no staging, mas **não traz as etiquetas do O24**. Não use `--reconstruir` sem falar com o Jarvis (apaga e refaz `dim_card`).
- **Anote a data de hoje em que este passo terminou com sucesso** (formato `AAAA-MM-DD`): é o argumento do passo 4.

### Passo 4. Registrar a data do critério da classe por etiqueta (O24)
Troque `AAAA-MM-DD` pela data anotada no passo 3 (a da primeira coleta com etiquetas):
```
(set -a; . ~/Metricas/MetricasDSPD/.env; set +a; pnpm --filter @metricas-dspd/server run bm:criterios-classe-servico AAAA-MM-DD); echo "rc=$?"
```
- O que faz: registra a versão de critério `105:classe-por-etiqueta` (marca nos gráficos de O6, O24, T1, T2, T4 e T6). Usa o papel do migrador.
- **Só grava uma vez.** Se a versão já existir, o comando não muda nada (nem a data) e a saída traz `gravadas` vazio. Por isso, **só rode depois do passo 3 ter dado rc=0** e informe a data certa na primeira vez. O comando não confere se o passo 3 rodou. Como corrigir uma data errada: **a confirmar com o time** (não está documentado).
- Argumento inválido ou mais de um: recusa com `uso: bm:criterios-classe-servico [AAAA-MM-DD]`, rc=2.
- Tempo: segundos.
- Deve mostrar: `{"vigenteDesde":"AAAA-MM-DD","gravadas":["105:classe-por-etiqueta"]}` e rc=0.
- Se der erro: `bm:criterios-classe-servico falhou: <categoria>`; se for variável ausente, confira só os nomes no `.env` (URL e senha do migrador). Pode repetir (idempotente).

### Passo 5. Acelerato: coleta de costume
```
(set -a; . ~/Metricas/MetricasDSPD/.env; set +a; pnpm run coleta ac); echo "rc=$?"
```
- O preenchimento do fluxo dos chamados já na base **não é deste passo**: é o `ac:reprojetar-fluxo` do passo 0.3, que já deve ter rodado. Esta coleta só traz chamados novos e mudanças, e a projeção deles já preenche o `fluxo`. Não use `--releitura` por conta própria.
- Se a coleta recusar com `parametros-mudaram`, o reconhecimento da 103/104 não foi feito: pare e avise (o reconhecimento é `pnpm run coleta ac --reconhecer-mudanca`, uma vez, só com ordem do Jarvis).
- Tempo: vários minutos; não interrompa. Deve dar rc=0 (rc=3 é parcial: avise).

## 2. Conferência (só leitura)

Consultas pelo Compose, como superusuário do banco local (sem senha no comando; só contagens, nenhuma coluna de pessoa). Se o comando recusar o usuário `postgres`, pare e avise: o superusuário do seu banco local tem outro nome e o Jarvis confere.

Cards e as três colunas (esperado depois dos passos 3 e 4: `com_classe` maior que 0; `com_origem_bug` e `com_fase` maiores que 0 se houver bugs com pai na base):
```
docker compose exec -T postgres psql -U postgres -d metricas -tAc "select count(*) as total_nao_excluidos, count(classe_servico) as com_classe, count(origem_bug) as com_origem_bug, count(fase_deteccao) as com_fase from dspd_bm.dim_card"
```
O total não pode cair abaixo de 18879 (a base só cresce; se cair, pare e avise). A linha de base acima tinha 0, 0 e 0 nas três colunas.

Classes (só as quatro: Urgente, Prioritário, Prazo fixo e Padrão; card sem etiqueta fica com classe nula, nunca Padrão):
```
docker compose exec -T postgres psql -U postgres -d metricas -tAc "select coalesce(classe_servico,'(sem classe)'), count(*) from dspd_bm.dim_card group by 1 order by 2 desc"
```

Fases do O15 (a tela só publica fase com 20 bugs ou mais; abaixo disso a contagem fica oculta de propósito):
```
docker compose exec -T postgres psql -U postgres -d metricas -tAc "select fase_deteccao, count(*) from dspd_bm.dim_card where fase_deteccao is not null group by 1 order by 2 desc"
```

Dicionário do BusinessMap (antes: 10 linhas; depois do passo 2: cerca de 357 vigentes, a confirmar):
```
docker compose exec -T postgres psql -U postgres -d metricas -tAc "select count(*) as vigentes from dspd_bm.ref_dominio where vigente_ate is null"
```

Linhas totais, para comparar com a linha de base de 10 (a base de comparação do assistente pode ter contado com ou sem vigência encerrada; **a confirmar** qual):
```
docker compose exec -T postgres psql -U postgres -d metricas -tAc "select count(*) as total from dspd_bm.ref_dominio"
```

Permissão do coletor nas três colunas (esperado `t` nas três; `f` em qualquer uma: pare e avise, a projeção não consegue gravar):
```
docker compose exec -T postgres psql -U postgres -d metricas -tAc "select has_column_privilege('dspd_coletor','dspd_bm.dim_card','classe_servico','SELECT'), has_column_privilege('dspd_coletor','dspd_bm.dim_card','origem_bug','SELECT'), has_column_privilege('dspd_coletor','dspd_bm.dim_card','fase_deteccao','SELECT')"
```

Versão de critério gravada (passo 4):
```
docker compose exec -T postgres psql -U postgres -d metricas -tAc "select vigente_desde, referencia from dspd_core.ref_versao_criterio where referencia in ('105:classe-por-etiqueta') order by 1"
```

Fluxo dos chamados do Acelerato (conferência do passo 0.3):
```
docker compose exec -T postgres psql -U postgres -d metricas -tAc "select count(*) as chamados, count(fluxo) as com_fluxo from dspd_ac.dim_chamado"
```
Esperado: `chamados` = 5144 (ou mais, se a coleta já trouxe novos) e `com_fluxo` subindo de **0** para **quase todos** (a diferença são os de fluxo múltiplo e sem etapa, que seguem nulos de propósito; deve bater com `fluxoMultiplo` + `semFluxo` impressos pelo comando). `com_fluxo` ainda 0: pare e avise.

### Nas telas (só o que cada passo prova)

- Operacional: O15 (Onde os bugs são encontrados), cada fase só com contagem a partir de 20 bugs; O18 (Entregas com e sem bug), mínimo de 20 entregas; O24 por classe.
- Tático: T1, T2, T4, T6 e O6 só com as quatro classes, com a marca de mudança de critério na data do passo 4.
- Sustentação (só Acelerato, nunca somada ao BusinessMap): S5, S6 e S7 com números e a nota de chamados fora do fluxo, **se** o fluxo estiver preenchido (passo 0.3).
- Métrica abaixo do mínimo de itens mostra "sem dado" por regra do projeto; não é erro.

## 3. Voltar a coleta

1. Se algo estiver estranho nas conferências, pare e avise o Jarvis; não religue a agenda.
2. Com tudo certo, faça a coleta de costume, uma de cada vez: `(set -a; . ~/Metricas/MetricasDSPD/.env; set +a; pnpm --filter @metricas-dspd/server run bm:coleta incremental --projetar); echo "rc=$?"` e `(set -a; . ~/Metricas/MetricasDSPD/.env; set +a; pnpm run coleta ac); echo "rc=$?"`. Deve dar rc=0 (rc=3 é parcial: avise).
3. Só então religue o que parou no 0.1 (no Windows, "Habilitar" a tarefa; no cron, tire o `#`). Se não havia agenda de coleta aqui, nada a religar.

## O que fica fora deste roteiro

- `ac:reprojetar-etapas`, `ref:sync-calendario` e `coleta ac --reconhecer-mudanca` são das releases 103 e 104 (`docs/devops/104-roteiro-dono.md`); só rode se aquele roteiro ainda não foi cumprido.
- `bm:apontamento`, `bm:ref-sync-apontamento` e `bm:criterios-apontamento` são do pedido 059.
- As versões de critério do D2, do O18 e do O15 já vêm no código com a data do PR; nenhuma ação do dono é pedida.
