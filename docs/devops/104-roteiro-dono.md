# Roteiro do dono: ações na base real depois da release 104 (K-333)

**Escopo:** só o computador local (WSL), onde ficam os dados reais (decisão do dono de 14/11). A parte da VM (servidor interno) fica no cartão **K-340** e não está neste roteiro.

Para quem não é técnico. Nada deste documento foi executado pelo time: os comandos são seus, depois do merge da release 104 na `main`. Os comandos vêm do CHANGELOG da release ("Ações do dono na base real depois da release 104"). Nenhuma senha, chave ou nome de pessoa aparece aqui.

Como usar: abra o terminal na pasta do projeto (`cd ~/Metricas/MetricasDSPD`), com a `main` já atualizada (`git checkout main && git pull`). Copie um comando por vez. Os passos 2, 3, 4, 5 e 6 vêm entre parênteses com `set -a; . ./.env; set +a`: isso carrega o `.env` só para aquele comando (sem mostrar o conteúdo); sem isso eles podem parar com rc=1. Depois de cada um, rode `echo "rc=$?"`: **rc=0 é sucesso**; qualquer outro número é erro.

**Regra de ouro:** deu erro, PARE. Não tente o passo seguinte. Copie a mensagem de erro inteira (sem senhas) e mande ao Jarvis. Os tempos abaixo são estimativas, não medidas: se um passo passar de 15 minutos sem imprimir nada, também pare e avise.

## 0. Antes de começar: parar a coleta agendada

A coleta não pode rodar enquanto você mexe na base. O repositório não instala nenhuma agenda de coleta nesta máquina: os timers de `deploy/systemd/` são da VM (K-340) e o agendamento local descrito em `docs/engineering/operacao-banco.md` é só o do backup. Se você mesmo criou uma agenda de coleta aqui, ela está num destes lugares:

1. No Agendador de Tarefas do Windows: abra o programa, procure tarefas que chamem a coleta (BusinessMap ou Acelerato) e use "Desabilitar". Anote os nomes para religar na seção 4.
2. No cron do WSL: `crontab -l`. Se houver linha de coleta, edite com `crontab -e` e ponha `#` na frente (anote qual).
3. Se você nunca agendou coleta aqui, não há nada a desligar. Em dúvida sobre onde a sua está, pare e pergunte ao Jarvis; não adivinhe.

Conferir que nada roda agora:
```
ps aux | grep "entradas/coleta" | grep -v grep
```
Deve imprimir nada. Se imprimir, espere e repita. Confira também que não há coleta em contêiner: `docker ps` não deve listar contêiner `coleta`.

## 1. Os 7 passos da base real

Todos a partir da raiz do projeto, nesta ordem.

### Passo 1. Migrações
```
pnpm run db:migrate; echo "rc=$?"
```
- Tempo: segundos a poucos minutos.
- Deve mostrar: as migrações aplicadas (0037, e a 0036 e a 0034 se faltarem) e rc=0.
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
(set -a; . ./.env; set +a; pnpm run coleta ac --reconhecer-mudanca); echo "rc=$?"
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

## 2. K-216: aba Apontamento local (depois dos 7 passos)

Desenho em `docs/analises/086-prontidao-dado-real-vm.md` e pedido 076. Aqui o banco e a API são os do Compose desta máquina.

1. No `.env` da raiz do projeto, confirme que existe a variável `DSPD_PWD_APONTAMENTO`, com a senha do papel `dspd_api_apontamento` do seu banco local. Você escreve o valor no arquivo, nunca aqui nem em mensagem. O Compose monta sozinho a conexão da API a partir dela; não crie `PG_APONTAMENTO_URL` no `.env` para a API do Compose, ela não chega lá. Se `DSPD_PWD_APONTAMENTO` faltar, vale a senha padrão pública de desenvolvimento. Quem confere é você, olhando o arquivo; ninguém cola o valor.
2. **Antes de subir a API**, a migração 0034 já deve ter rodado: ela vem junto no passo 1. Se você chegou aqui sem o passo 1, rode `pnpm run db:migrate; echo "rc=$?"` (rc=0).
3. Recrie a API e o painel pelo Compose, para lerem a variável e o código novo: `docker compose up -d --build api web; echo "rc=$?"` deve dar rc=0. Se o `worker` estiver no ar (`docker compose ps`), acrescente `worker` ao comando. Espere ficar saudável: `docker compose ps api` deve mostrar `healthy` (leva alguns segundos).
4. Conferir que a aba funciona (é isso que vale): abra `http://127.0.0.1:8080` (ou a porta `WEB_PORT` do seu `.env`) e entre na aba Apontamento. Ela deve carregar os dados (sem mensagem de erro de rota ou de conexão) e sem o aviso "registro de horas incompleto" por falta de tabela. Depois, peça ao Jarvis para rodar a consulta Q20 de novo.
5. Se a aba mostrar erro: pare, não mexa em mais nada e avise o Jarvis com a mensagem da tela e a saída de `docker compose logs --tail 30 api` (sem senhas). Causas prováveis: `DSPD_PWD_APONTAMENTO` ausente ou diferente da senha do papel no banco, migração não rodada, ou o papel `dspd_api_apontamento` não existir (item 6).
6. Saber se o papel `dspd_api_apontamento` existe no banco local (só a contagem, nada de senha):
   ```
   docker compose exec -T postgres psql -U postgres -d metricas -tAc "select count(*) from pg_roles where rolname = 'dspd_api_apontamento'"
   ```
   - Imprimiu `1`: o papel existe. A senha dele não muda sozinha, nem pelo Compose nem pelo script de reparo; se a aba deu erro de conexão, a causa é a senha do `.env` diferente da do papel. Pare e avise o Jarvis, que prepara a troca de senha no banco.
   - Imprimiu `0`: o volume do banco é anterior ao pedido 059 e o papel nunca foi criado (o script de criação inicial só roda em volume novo). Pare e avise o Jarvis: ele prepara o reparo (`docker/postgres/reparar-papeis.sh`, que cria o papel sem apagar dados e depende de duas senhas do ambiente), e depois você repete os itens 3 e 4.
   - Se o comando recusar o usuário `postgres`, pare e avise: o nome do superusuário do seu banco local é outro e o Jarvis confere.

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
   (set -a; . ./.env; set +a; pnpm --filter @metricas-dspd/server run bm:coleta incremental --projetar); echo "rc=$?"
   (set -a; . ./.env; set +a; pnpm run coleta ac); echo "rc=$?"
   ```
   Tempo: minutos cada. Deve dar rc=0 (rc=3 é parcial: avise). Podem ser repetidos; não duplicam dados.
2. Conferir a Sustentação, só a do Acelerato, nunca somada com a do BusinessMap: o selo de frescor mostra hoje; S1 mostra prazos com unidade; nenhuma tela mostra "parametros-mudaram" nem erro.
3. Conferir o BusinessMap separado: selo de frescor de hoje e o fluxo sem erro.
4. Se algo estiver estranho, pare e avise o Jarvis; não religue a agenda.
5. Só com tudo certo, religue o que você parou no passo 0 (no Windows, "Habilitar" a tarefa; no cron, tire o `#`). Se não havia agenda de coleta aqui, nada a religar.

## 5. Mensagens prontas para você encaminhar

**Para quem administra o BusinessMap (K-212)**

> Olá! Os filtros de sistema, objetivo e área do painel do DSPD estão sem opções, porque o BusinessMap ainda não tem essas listas cadastradas como campos de lista. Pode cadastrar as três listas (sistema, objetivo e área) nos quadros do projeto e me mandar os valores de cada uma? Com os valores cadastrados o time carrega as opções no painel. Obrigado!

**Para a governança (K-214)**

> Olá! Para o painel mostrar se os prazos estão dentro da meta, precisamos que a governança defina a meta de prazo (SLE) de cada tipo de item: quantos dias úteis é o prazo esperado, e a partir de que data a meta vale. Sem essa definição o painel não mostra a linha de meta. Podem nos passar? Obrigado!

**Para a coordenação (nota de horas sem comentário)**

Só envie se o K-330 já tiver rodado (o comando só de leitura que conta, na API do BusinessMap, as horas com e sem comentário). Se ainda não rodou, não envie: espere o K-330 e peça ao Jarvis para avisar.

> Olá! Conferimos, só em contagem, quantos apontamentos de horas vêm sem comentário no BusinessMap (resultado em anexo). Podemos combinar como a nota "horas sem comentário" vai aparecer na aba de Apontamento e se esse volume está dentro do esperado para o dia a dia da equipe? Lembrando que o painel não avalia pessoas, só a qualidade do registro. Obrigado!
