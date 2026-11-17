---
tipo: revisao-devops
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vm-criterios-ac
commit: e0b84358cc250856eec48476842b47bb375a2d30
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-16
---
# Review de devops: vm:preparar na subida (K-396, E7.408)

## Parecer
Aprovado, sem achado bloqueante. Escopo lido por diff e por leitura dos arquivos no head `e0b84358`: `docker-compose.prod.yml`, `server/src/entradas/vm-preparar.ts`, `server/src/plataforma/db/vm-preparar.ts`, `docs/devops/105-implantacao-vm.md` (seções 2.1 e 7), `docs/devops/105-roteiro-dono.md` (seção 5) e os `package.json`. Sem workflow nem Dockerfile no diff. A suíte inteira fica para o CI do PR; não afirmo CI verde. Ponto de vista: quem opera a VM.

## Compose de produção
- `docker-compose.prod.yml:21-30` · o `migrate` troca o comando para `vm:preparar` e ganha `PG_REF_URL` e `DSPD_BACKUP_CONFIRMADO`. `docker compose config` com valores fictícios monta o serviço com as duas URLs em `sslmode=verify-full`, a CA montada só leitura e `DSPD_BACKUP_CONFIRMADO: ""` por padrão. Sem postgres no compose, sem senha padrão e porta só em `127.0.0.1` (inalterados). `DSPD_PWD_REF` já era exigido (`${VAR:?}`) pelo serviço `coleta`, mesmo em profile, então a variável nova não quebra nenhum `compose.env` que já passava no `config -q`.
- A imagem já leva o que os 7 passos leem: `server/Dockerfile` copia `docs/architecture/fontes` (calendario, dominios BusinessMap e Acelerato, alvos); `.dockerignore` não o corta. O `vm:preparar` carrega o `.env` da raiz só se existir (no contêiner não existe: vale o ambiente do Compose), e a ordem das variáveis já no ambiente sobre o arquivo está documentada.
- Papéis: migrar, reprojetar e `ac:criterios` usam o migrador; os três `ref:*`/`bm:ref-sync`/`ac:ref-sync` usam `dspd_ref` (só INSERT de vigência). Nenhum passo recebe apikey do BusinessMap nem credencial do Acelerato; menor privilégio preservado. Nenhum passo chama rede externa.
- `restart: "no"` no `migrate` e `depends_on: service_completed_successfully` em `api` e `worker`: falha em qualquer passo (parada no primeiro erro, com o nome) impede api e worker novos de subir. Num upgrade, a api antiga segue de pé sobre o banco já migrado até o `up` passar; isso é o comportamento certo, e o rollback da seção 7 cobre o caso.

## Subida e backup antes do `up`
- A ordem "backup, `up`, conferir o resumo" está escrita (2.1, item 2) e a trava é real: `recusaDeBackup` só recusa com migração pendente sobre base que já tem migração aplicada; base virgem e versão sem migração nova sobem sem confirmação. A data é a de Brasília, e a confirmação de ontem não vale (teste do autor). A confirmação é declaratória (a variável ou `ultimo-backup-ok`): não prova que o dump existe; é o que a decisão do dono pede, sem ação.
- Reexecução depois de falha: com `migrar` já feito, o segundo `up` não tem pendência e não pede backup de novo. Seguro. A mensagem de falha traz só categoria (sem URL nem senha).
- Recomendado 1 (não devolve) · a mensagem de recusa cita também `DSPD_BACKUP_DIR` com `ultimo-backup-ok`, mas o serviço `migrate` não recebe essa variável nem monta a pasta. No Docker só a variável `DSPD_BACKUP_CONFIRMADO` funciona; quem seguir a segunda opção dentro do contêiner continua recusado. A doc da VM já manda a variável certa. Ajuste de texto opcional (dev da stack).
- Recomendado 2 (não devolve) · cada `up` roda `ac:reprojetar-etapas`, `ac:reprojetar-fluxo` e `ac:criterios` com os timers do Acelerato ligados, e só o caso da 0040 manda parar a coleta antes. Os passos não têm trava contra a coleta (sem lock em `reprojecao-*`). Não provei corrida nem dado errado, e são idempotentes e o `ac:reprojetar-etapas` recusa se o calendário difere; porém, no redeploy com timers ligados, o operador deve conferir `systemctl list-timers 'metricas-*'` e evitar subir perto das 06:00 e da rodada do Acelerato. Sugestão para a doc: o aviso valer para todo `up` com migração nova, não só para a 0040.
- Efeito declarado pelo autor, conferido: as reprojeções gravam `tarefa = 'projecao'` em `ctl_coleta` (`reprojecao-etapas.ts:57`, `reprojecao-fluxo.ts:27`). A marca d'água da coleta incremental do Acelerato lê só `coleta_incremental` e `varredura` (`controle.ts:102-104`), então a subida **não** move a carga incremental; só a tela "última carga" mostra a hora da reprojeção, como a doc avisa. Sem ação.
- `ac:ref-sync` na subida: mesmo arquivo no mesmo dia não grava; arquivo mudado no mesmo dia recusa e para a subida, nomeando o passo. Para o operador isso é uma subida bloqueada por conteúdo de referência; a saída está escrita (`ac:ref-sync AAAA-MM-DD` com a data de amanhã ou esperar o dia virar). Aceito como escolha do autor.
- Pós-deploy (`/health/ready`, painel em 8080, `list-timers`) e o texto de próximo passo (primeira carga manual, com o dono) continuam coerentes.

## Rollback
- A seção 7 mantém a ordem correta (parar timers, `down`, banco, código anterior, `build`, `up`, conferir). O `migrate` do código antigo roda o comando antigo (só migrar), então a volta de código não reexecuta o `vm:preparar`.
- Ponto de atenção para quem opera (documentado em parte, sem ação): o `down 1` desfaz só a migração. Vigências de referência, reprojeções e marcas de critério gravadas pelo `vm:preparar` ficam no banco. A volta segura continua sendo restaurar o backup anterior à migração, e é por isso que o backup tem de vir antes do `up` (item 2.1.1). O roteiro do dono, seção 5, remete corretamente à seção 7.
- A migração tem volta, escrita pelo dev da stack; esta entrega não cria migração nova.

## Verificação
- `docker compose -f docker-compose.prod.yml config` com valores fictícios: monta, sem erro.
- `server/tests/vm-preparar.test.ts` (rodado no head): 11 testes passam.
- `forge-check docs` e a suíte completa: ver Provas no relatório e o CI do PR. `actionlint`: não aplicável (sem workflow no diff). `docker build`: não rodado (sem Dockerfile no diff).

## Custo e regras
Sem minuto de CI novo, sem serviço pago (`R-CUSTO`). Nenhum workflow tocado (`R-MAIN`, `R-VERIFY`). Nenhuma alteração de proteção de branch, segredo ou `environment` (`R-CONFORMIDADE`). Sem gatilho de segurança novo: nenhuma credencial nova entra no contêiner além do `dspd_ref`, já usado pelo `coleta`.
