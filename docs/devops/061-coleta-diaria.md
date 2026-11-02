---
tipo: revisao-devops
contrato: 1
pedido: 061-coleta-diaria
branch: docs/061-coleta-diaria
commit: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-02
---
# Coleta diária no ambiente publicado: levantamento e proposta (pedido 061, E1.1, K-196)

Escopo: só leitura do código, dos scripts e da documentação na `develop` (`d05bbfc`). Nada foi agendado, executado, publicado nem mexido em servidor; o `.env` não foi aberto e `.env.example` ficou ilegível para este agente (regra de negação da sessão). As variáveis abaixo vêm do código de configuração. Não há mudança de infra sob revisão, por isso o parecer é `aprovado` por vazio de defeito; o que importa é a seção de recomendação.

## 1. Como cada coleta roda hoje

Todas são comandos manuais, sem registro em agenda (H-20 = C, plano 052). O `worker` do Compose existe, mas a lista de tarefas dele é vazia (`server/src/entradas/worker.ts`, "tarefas: []"): ele só consome a outbox, não coleta.

| Coleta | Comando (a partir da raiz) | Quando precisa rodar |
|---|---|---|
| Acelerato (incremental) | `pnpm coleta ac` (`scripts/coleta.sh`, que carrega o `.env` e chama `src/entradas/coleta.ts`) | diária |
| Acelerato (releitura do recorte) | `pnpm coleta ac --releitura` | semanal (ADR 0023 §6) |
| BusinessMap cards + projeção + worklog | `pnpm --filter @metricas-dspd/server run bm:coleta incremental --projetar` | diária (ADR 0022: 06:00; ADR 0025 item 3) |
| BusinessMap carga inicial | `bm:coleta carga-inicial`, mais `bm:apontamento carga-inicial` para o worklog | uma vez, com o dono presente; nunca agendada |
| Projetor isolado | `bm:projetar [--reconstruir]` | só reparo; o `--projetar` do `bm:coleta` já o chama |
| Pesquisa de percepção | `pnpm --filter @metricas-dspd/pesquisa carregar --trimestre ... --arquivo ...` (e `--confirmar`) | trimestral, por arquivo exportado pela coordenação; não é coleta |

Ordem e dependências:
- Acelerato: `ac:ref-sync` (lista de domínio, papel `dspd_ref`) antes da primeira coleta; depois `coleta ac`. A projeção roda na mesma execução, só se a coleta terminou `ok`.
- BusinessMap: `bm:ref-sync-apontamento` e a carga inicial feitas antes do incremental. No incremental com `--projetar`, o worklog roda como etapa final, depois dos cards, e só se `PESSOA_ELIMINADA_SAL` existir; sem o sal a etapa não existe e o campo `apontamento` sai `null`, sem erro.
- BusinessMap e Acelerato são independentes (bases e travas separadas) e podem rodar em paralelo ou em sequência.
- Pesquisa: independente das demais.

Travas contra execução dupla: `pg_try_advisory_lock` por fonte (`dspd:fonte:businessmap`, `dspd:fonte:acelerato`) em `server/src/plataforma/db/trava.ts`. BusinessMap com trava ocupada sai com erro `trava`; Acelerato devolve estado `em-uso`. O worklog usa a mesma trava do BusinessMap. Repetir é seguro: marca d'água, staging idempotente e nada é sobrescrito. A pesquisa não tem trava, mas repetir o mesmo arquivo não grava.

Códigos de saída: `0` ok; `3` coleta parcial, `em-uso` ou worklog que falhou; `1` erro; `2` uso ou `.env` ilegível. Saída em JSON só com contagens e códigos, no stdout. Cada execução grava linha em `ctl_coleta`, que alimenta o selo de frescor da API.

Variáveis (só nomes):
- Comuns: `PG_COLETOR_URL`, `DSPD_SCHEMA_PREFIXO`, `LOG_LEVEL`.
- BusinessMap: `BUSINESSMAP_URL_BASE`, `BUSINESSMAP_APIKEY`, `BUSINESSMAP_QUADROS_IDS`, `BUSINESSMAP_LIMITE_POR_MINUTO` (teto 25), `BUSINESSMAP_TIMEOUT_MS`, `BUSINESSMAP_PAGINA_TAMANHO`, `PG_REF_URL` ou `DSPD_PWD_REF`, `PESSOA_ELIMINADA_SAL` (32 caracteres ou mais).
- Acelerato (leitura de tabela MySQL, ADR 0023): `ACELERATO_MYSQL_HOST`, `_PORT`, `_DATABASE`, `_USER`, `_PASSWORD`, `_TLS_SHA256`, `_TLS_CERT_FILE`, `_MAX_EXEC_MS`, `_MARGEM_HORAS`. Com `NODE_TLS_REJECT_UNAUTHORIZED=0` a partida é recusada.
- Pesquisa: `PG_PESQUISA_URL` (papel `dspd_pesquisa`).
- Os programas `bm:*` leem o `.env` da raiz com `process.loadEnvFile`; sem arquivo (ENOENT) seguem com o ambiente do processo, o que serve a container e CI.

Tempo e falhas conhecidas:
- Duração não medida: não rodei coleta. O BusinessMap é limitado a 25 chamadas por minuto (cota de 30/min e 600/h compartilhada entre cards e worklog, ADR 0025); o Acelerato lê páginas de 1.000 linhas com teto de consulta de 120 s por padrão e até 3 tentativas em rede e tempo esgotado. Medir na primeira execução real.
- Falha do worklog sai com código 3 mas os cards ficam gravados.
- Acelerato: certificado do servidor trocado para a coleta (categoria `tls`, sem nova tentativa, exige atualizar a impressão no `.env`); acesso negado não tenta de novo.
- Aviso na saída: chamados SSSC fora das organizações do recorte saem em stderr (ADR 0023, item 5) e vão ao dono.
- Se a máquina que roda está desligada, a coleta seguinte recupera pela marca d'água; o selo de frescor mostra o atraso.

## 2. Restrições que decidem a escolha

1. ADR 0022 item 5 e ADR 0023: a coleta real roda só na máquina do dono; CI, homologação e servidor nunca receberam a apikey nem dado real. A apikey atual é a do próprio dono (pode alterar o quadro); a pendência registrada é trocar por usuário de serviço só leitor antes de qualquer coleta fora da máquina dele. Rodar em ambiente publicado exige revisar essa ADR.
2. Acelerato: conta compartilhada, host aberto, servidor que aceita texto puro; o pedido ao DBA (usuário próprio, host amarrado, `REQUIRE SSL`) vale "antes da coleta agendada" (ADR 0023 §2). A rede do ambiente publicado precisa alcançar esse host.
3. A imagem `server/Dockerfile` copia só `server/` e `packages/`. Os comandos de coleta leem `docs/architecture/fontes/*.json` por caminho relativo (`conferencia.ts`, `dominio-acelerato.ts`), então rodar `bm:coleta` ou `ref-sync` dentro dessa imagem falha por arquivo ausente. Qualquer opção em container exige acrescentar `docs/architecture/fontes/` à imagem (mudança de Dockerfile, pedido próprio).
4. `docker-compose.yml` não passa nenhuma variável do BusinessMap, do Acelerato nem `PESSOA_ELIMINADA_SAL` ao `worker`; ele só recebe `PG_COLETOR_URL`.
5. Postgres do Compose publica em `127.0.0.1`: um agendador externo ao host não o alcança sem túnel.
6. R-CUSTO: tudo abaixo cabe em custo zero, salvo onde dito.

## 3. Opções

### A. Agendador do sistema do servidor (cron ou timer do systemd) chamando o comando
- Precisa: um host Linux sempre ligado com Node 24, pnpm e o repositório (ou a imagem), `.env` com permissão 600 só para o usuário do job, rede até o Postgres, o BusinessMap e o MySQL do Acelerato. Duas linhas de agenda, por exemplo `bm:coleta incremental --projetar` às 06:00 e `coleta ac` às 06:30; releitura do Acelerato semanal.
- Custo: zero além do servidor que já será publicado.
- Riscos: segredo vive em arquivo no servidor; dependência de relógio e fuso (UTC no host, BRT no pedido); cron cala falha por padrão; sem retry.
- Avisar falha: o comando já sai com código diferente de zero; usar `systemd` com `OnFailure=` ou `cron` com `MAILTO`, além de um log em arquivo com rotação. Conferir também o selo de frescor da API.
- Reexecutar: `systemctl start <unidade>` ou rodar o mesmo comando; as travas impedem duplicidade.

### B. Container de coleta com agenda do host (`docker compose run --rm coleta ...` por cron/timer), ou serviço com laço próprio
- Precisa: serviço novo no Compose com a imagem do servidor, as variáveis por `environment` (nunca na imagem; o `.dockerignore` já exclui `.env`), `docs/architecture/fontes/` na imagem, rede interna até o Postgres. Mantém a separação de privilégio (credencial do coletor só neste serviço, não na API).
- Variante B2: preencher a lista de tarefas do `worker` (ADR 0014 prevê a agenda diária no worker). É mudança de código do servidor, com laço próprio sem cron e sem aviso nativo de falha; mais trabalho do dev da stack e mais superfície que a variante B1 (`run --rm` pelo agendador do host).
- Custo: zero.
- Riscos: imagem e `.env` do servidor precisam ficar em dia; o worker em laço longo esconde falha se ninguém olhar o log.
- Avisar falha: como na opção A (código de saída do `compose run`); na B2 seria preciso criar o aviso.
- Reexecutar: `docker compose run --rm coleta <comando>`.

### C. Agendamento da CI (GitHub Actions `schedule`)
- Precisa: o runner alcançar o Postgres e o MySQL do Acelerato. O Postgres publicado só em loopback não é alcançável; seria preciso expor o banco à internet ou abrir túnel, e entregar a apikey, a senha do MySQL e `PESSOA_ELIMINADA_SAL` como segredos do repositório.
- Custo: minutos gratuitos bastam, mas só se o banco estiver acessível de fora, o que aumenta a superfície de ataque; o agendamento do GitHub atrasa e pode ser pulado em repositório inativo.
- Riscos: contraria o ADR 0022 item 5 (nada de chave em CI); dado de pessoa (worklog) trafega e passa por log de runner; R-MAIN exigiria que o `schedule` vivesse na branch padrão. Segredos e `environments` são do dono (R-CONFORMIDADE).
- Avisar falha: e-mail nativo do GitHub ao autor do workflow; reexecutar: `workflow_dispatch` ou "Re-run".
- Não recomendada.

### D. Máquina do dono (agendador do Windows ou WSL), como o ADR 0022 prevê hoje
- Precisa: a máquina ligada às 06:00 e o repositório atualizado. Custo: zero. Risco: se desliga ou o dono viaja, a coleta para (a marca d'água recupera no dia seguinte, mas o painel publicado fica atrasado); é o desenho vigente, e a ADR 0022 prevê rever o local depois de sete execuções diárias seguidas em 30 dias.
- Só é coerente se o banco publicado for o mesmo que a máquina do dono alcança. Serve de ponte, não de destino.

## 4. Recomendação

Opção **B1** (container de coleta chamado pelo agendador do host, um `systemd timer` por fonte), com a ordem: BusinessMap às 06:00 com `--projetar`, Acelerato às 06:30, releitura do Acelerato aos domingos, pesquisa fora da agenda (é trimestral e por arquivo).

Base: as travas e a marca d'água já tornam o comando repetível; o código de saída já traduz falha; o container mantém o `.env` fora da imagem e a credencial do coletor longe da API; custo zero; menos código novo que a agenda dentro do `worker` (B2), que pede mudança de servidor, teste e novo aviso. Se o servidor for simples demais para container, a opção A é equivalente e mais curta. A opção C só depois de decisão sobre expor o banco e rever o ADR 0022.

Para a implementação (pedido próprio): Dockerfile ganha `docs/architecture/fontes/`; serviço `coleta` no Compose sem porta publicada; unidade de timer com `OnFailure`; verificação do selo de frescor depois de cada execução; teste de reexecução com trava ocupada; rollback é desligar o timer (nada de migração).

## 5. O que o dono precisa decidir ou providenciar

1. Onde o sistema será publicado, e se o host fica ligado 24 horas (pré-requisito de A e B).
2. Aceitar rever o ADR 0022 item 5 (coleta fora da máquina do dono) e trocar a apikey por usuário de serviço só leitor no BusinessMap antes da primeira execução publicada.
3. Pedir ao DBA do Acelerato usuário próprio, host amarrado ao IP do servidor e `REQUIRE SSL`, e liberar rede do servidor até o MySQL.
4. Providenciar os segredos no servidor, fora do repositório: apikey, senha do MySQL, `PESSOA_ELIMINADA_SAL`, a impressão e o PEM do certificado do Acelerato, as senhas dos papéis do Postgres.
5. Definir a quem o aviso de falha chega (e-mail ou canal) e o horário (06:00 e 06:30 BRT propostos).
6. Confirmar que a pesquisa de percepção continua manual por trimestre.

## 6. Observações

- O `CLAUDE.md` descreve o Acelerato como API pública só com GET; o código e o ADR 0023 leem uma tabela MySQL com transação somente leitura. Vale alinhar o texto do `CLAUDE.md` (tema do `tech-lead`, não alterado aqui).
- Ferramentas (`actionlint`, `docker build`) não foram usadas: nada de workflow ou imagem mudou neste pedido.
