# Roteiro do dono: ações na base real depois da release 104 (K-333)

Para quem não é técnico. Nada deste documento foi executado pelo time: os comandos são seus, depois do merge da release 104 na `main`. Os comandos vêm do CHANGELOG da release ("Ações do dono na base real depois da release 104"). Nenhuma senha, chave ou nome de pessoa aparece aqui.

Como usar: abra o terminal do WSL na pasta do projeto (`cd ~/Metricas/MetricasDSPD`), com a `main` já atualizada (`git checkout main && git pull`). Copie um comando por vez. Os passos 2, 3, 4 e 6 vêm entre parênteses com `set -a; . ./.env; set +a`: isso carrega o `.env` só para aquele comando (sem mostrar o conteúdo); sem isso eles param com rc=1. Depois de cada um, rode `echo "rc=$?"`: **rc=0 é sucesso**; qualquer outro número é erro.

**Regra de ouro:** deu erro, PARE. Não tente o passo seguinte. Copie a mensagem de erro inteira (sem senhas) e mande ao Jarvis. Os tempos abaixo são estimativas, não medidas: se um passo passar de 15 minutos sem imprimir nada, também pare e avise.

## 0. Antes de começar: parar a coleta agendada

A coleta não pode rodar enquanto você mexe na base. Onde a agenda está depende de como foi instalada; confira os três lugares.

1. Servidor interno (VM), se a agenda de lá estiver ativa:
   ```
   sudo systemctl disable --now metricas-coleta-businessmap.timer metricas-coleta-acelerato.timer metricas-coleta-acelerato-releitura.timer
   systemctl list-timers 'metricas-coleta-*'
   ```
   Conferir: a lista final deve vir vazia (`0 timers listed`). Se a coleta estiver rodando agora, espere terminar: `systemctl list-units 'metricas-coleta-*.service' --state=running` deve vir vazio.
2. Nesta máquina, no Agendador de Tarefas do Windows: abra o programa, procure tarefas que chamem a coleta (BusinessMap ou Acelerato) e use "Desabilitar". Anote os nomes para religar na seção 4.
3. Nesta máquina, no cron do WSL: `crontab -l`. Se houver linha de coleta, edite com `crontab -e` e ponha `#` na frente (anote qual).

Conferir que nada roda agora:
```
ps aux | grep "entradas/coleta" | grep -v grep
```
Deve imprimir nada. Se imprimir, espere e repita. Se você nunca agendou coleta nesta máquina, os itens 2 e 3 não têm nada a desligar.

## 1. Os 7 passos da base real

Todos a partir da raiz do projeto, nesta ordem.

### Passo 1. Migrações
```
pnpm run db:migrate; echo "rc=$?"
```
- Tempo: segundos a poucos minutos.
- Deve mostrar: as migrações aplicadas (0037, e a 0036 se faltar) e rc=0.
- Conferir depois: rodar de novo deve dizer que não há migração pendente.
- Se der erro: pare e avise. Pode repetir com segurança (migração já aplicada não roda de novo).

### Passo 2. Calendário da Sustentação
```
(set -a; . ./.env; set +a; pnpm --filter @metricas-dspd/server run ref:sync-calendario); echo "rc=$?"
```
- Tempo: segundos.
- Deve mostrar: calendário gravado (turnos de 8 h 48) e rc=0.
- Conferir: o passo 6 usa isso; se o passo 6 recusar com código 4, o calendário não bateu.
- Se der erro: pare e avise (rc=1 sem detalhe costuma ser variável do `.env` faltando; só os nomes, nunca os valores). Pode repetir.

### Passo 3. Alvos de prioridade do Acelerato
**Só rode se o último `ac:ref-sync` foi em outro dia (não hoje).** Não sabe quando foi o último? Não rode: pare aqui e pergunte ao Jarvis, que confere na base; só siga para o passo 4 depois da resposta.
```
(set -a; . ./.env; set +a; pnpm --filter @metricas-dspd/server run ac:ref-sync); echo "rc=$?"
```
- Tempo: segundos.
- Deve mostrar: alvos carregados com a unidade de cada prazo e rc=0.
- Conferir: Painel de Sustentação, tela de prazos (S1), mostra a unidade de cada prazo (minutos, horas ou dias).
- Se der erro: pare e avise. Não repita no mesmo dia (duas cargas no mesmo dia confundem a data de vigência).

### Passo 4. Dicionários do BusinessMap
```
(set -a; . ./.env; set +a; pnpm --filter @metricas-dspd/server run bm:ref-sync); echo "rc=$?"
```
- Tempo: segundos.
- Deve mostrar: dicionário de setores (vazio por enquanto, é esperado) e de-para de severidade, rc=0.
- Conferir: nada na tela muda ainda.
- Se der erro: pare e avise. Pode repetir.

### Passo 5. Reconhecer a mudança dos campos do Acelerato (uma vez só)
```
pnpm run coleta ac --reconhecer-mudanca; echo "rc=$?"
```
- Tempo: pode levar vários minutos (é uma coleta do Acelerato); não interrompa.
- Deve mostrar: resumo da coleta com contagens e rc=0.
- Conferir: o selo de frescor da Sustentação mostra a data de hoje.
- Se der erro `parametros-mudaram`, o reconhecimento não foi aceito: pare e avise. Rc=3 (parcial) ou "em uso": pare e avise. Depois de rc=0, não precisa repetir.

### Passo 6. Refazer os intervalos por etapa (com a coleta ainda parada)
```
(set -a; . ./.env; set +a; pnpm --filter @metricas-dspd/server run ac:reprojetar-etapas); echo "rc=$?"
```
- Tempo: de segundos a alguns minutos.
- Deve mostrar: só contagens (cards e intervalos refeitos) e rc=0. Grava a versão de critério `099:D-7-528` com a data de hoje.
- Conferir: nas telas de Sustentação o aviso de mudança de critério aparece marcado na data de hoje.
- Se der erro com código 4: o calendário do passo 2 não bateu; pare e avise. Pode repetir com segurança.

### Passo 7. Coleta do BusinessMap e do Acelerato, como de costume
Veja a seção 4 (voltar a coleta) abaixo: este passo é a coleta manual dos dois, uma vez.

## 2. K-216: aba Apontamento na VM (depois dos 7 passos)

Só para o servidor interno (VM). Desenho em `docs/analises/086-prontidao-dado-real-vm.md` e pedido 076.

1. No `.env` da VM, inclua a variável `PG_APONTAMENTO_URL` apontando para o banco com o papel `dspd_api_apontamento`. A senha desse papel é a da VM (diferente da sua máquina local); você a escreve no arquivo, nunca aqui nem em mensagem. Confira só se o nome da variável existe: `grep -c '^PG_APONTAMENTO_URL=' .env` deve imprimir 1.
2. **Antes de subir a API**, rode a migração (a 0034 vem junto na `db:migrate`): `pnpm run db:migrate; echo "rc=$?"` deve dar rc=0.
3. Só então suba a API.
4. Conferir: abra a aba Apontamento. Ela deve carregar (sem a mensagem de erro de rota) e sem o aviso "registro de horas incompleto" por falta de tabela. Depois, peça ao Jarvis para rodar a consulta Q20 de novo.
5. Se a aba mostrar erro: pare, não mexa em mais nada, avise o Jarvis (provável `PG_APONTAMENTO_URL` ausente ou senha diferente).

## 3. Dicionário de setores (K-332): só quando o K-332 estiver na main

Reservado. Se o K-332 entrar nesta mesma release, o passo 4 já o carregou: nada a fazer aqui. Se entrar numa release depois, peça antes ao Jarvis para confirmar a data (a carga grava versão de critério com a data de hoje) e, depois do merge dele, rode uma vez:
```
(set -a; . ./.env; set +a; pnpm --filter @metricas-dspd/server run bm:ref-sync); echo "rc=$?"
```
- Deve mostrar: setores carregados (23, 24, 25, 27, 31, 35 e 79) e rc=0.
- Conferir: o filtro de setor aparece com os nomes na tela do BusinessMap.
- Se der erro: pare e avise.

## 4. Voltar a coleta e conferir a Sustentação

1. Coleta manual dos dois (é o passo 7), uma de cada vez:
   ```
   pnpm --filter @metricas-dspd/server run bm:coleta incremental --projetar; echo "rc=$?"
   pnpm run coleta ac; echo "rc=$?"
   ```
   Tempo: minutos cada. Deve dar rc=0 (rc=3 é parcial: avise). Podem ser repetidos; não duplicam dados.
2. Conferir a Sustentação, só a do Acelerato, nunca somada com a do BusinessMap: o selo de frescor mostra hoje; S1 mostra prazos com unidade; nenhuma tela mostra "parametros-mudaram" nem erro.
3. Conferir o BusinessMap separado: selo de frescor de hoje e o fluxo sem erro.
4. Se algo estiver estranho, pare e avise o Jarvis; não religue a agenda.
5. Só com tudo certo, religue a agenda que você parou no passo 0 (na VM: `sudo systemctl enable --now metricas-coleta-businessmap.timer metricas-coleta-acelerato.timer metricas-coleta-acelerato-releitura.timer`, e `systemctl list-timers 'metricas-coleta-*'` deve listar os 3; no Windows, "Habilitar" a tarefa; no cron, tire o `#`).

## 5. Mensagens prontas para você encaminhar

**Para quem administra o BusinessMap (K-212)**

> Olá! Os filtros de sistema, objetivo e área do painel do DSPD estão sem opções, porque o BusinessMap ainda não tem essas listas cadastradas como campos de lista. Pode cadastrar as três listas (sistema, objetivo e área) nos quadros do projeto e me mandar os valores de cada uma? Com os valores cadastrados o time carrega as opções no painel. Obrigado!

**Para a governança (K-214)**

> Olá! Para o painel mostrar se os prazos estão dentro da meta, precisamos que a governança defina a meta de prazo (SLE) de cada tipo de item: quantos dias úteis é o prazo esperado, e a partir de que data a meta vale. Sem essa definição o painel não mostra a linha de meta. Podem nos passar? Obrigado!

**Para a coordenação (nota de horas sem comentário)**

Só envie se o K-330 já tiver rodado (o comando só de leitura que conta, na API do BusinessMap, as horas com e sem comentário). Se ainda não rodou, não envie: espere o K-330 e peça ao Jarvis para avisar.

> Olá! Conferimos, só em contagem, quantos apontamentos de horas vêm sem comentário no BusinessMap (resultado em anexo). Podemos combinar como a nota "horas sem comentário" vai aparecer na aba de Apontamento e se esse volume está dentro do esperado para o dia a dia da equipe? Lembrando que o painel não avalia pessoas, só a qualidade do registro. Obrigado!
