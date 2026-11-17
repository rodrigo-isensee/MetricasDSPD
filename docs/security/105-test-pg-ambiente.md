---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-test-pg-ambiente
commit: 9edfaccf19e293243b026b2b6b13ec94c900205d
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105-test-pg-ambiente (K-392, E7.361)

Parecer novo, da branch inteira contra a `develop` (base 655029ad), no head 9edfaccf. Revisão estática do `scripts/test-pg.sh`, do `.env.example`, do `docker-compose.yml` e do init `docker/postgres/init/01-databases-papeis.sh` (não alterados, lidos como contexto), do `server/tests/pg/global-setup.ts` e `ctx.ts`, dos workflows (`ci.yml`, `homolog.yml`) e das docs do delta. **Aprovado**, com duas recomendações de baixa severidade, ambas anteriores a esta entrega (a entrega reduz o risco que elas descrevem).

Suíte: não há PR; a suíte inteira fica para o CI do PR e este parecer não afirma CI verde. Vale o PQ do autor conferido pelo QA (`docs/qa/105-test-pg-ambiente.md`: 342 de 342 sem `.env`, e as execuções A a D da volta 1 em 0c44ef94; o delta até 9edfaccf é só documentação do ADR 0014).

## Gatilhos
`R-SEGURANCA`: credenciais de banco (senha do administrador e dos papéis) e infraestrutura local que pode apontar para um banco existente. Sem dado pessoal, sem segredo de integração, sem workflow alterado.

## Conferência pedida
- **Segredos.** A senha do administrador da instância descartável é aleatória por execução, 96 bits de `/dev/urandom` (`scripts/test-pg.sh:30`), só em variável de ambiente do processo, nada gravado em disco, imagem ou log (o `down` vai para `/dev/null`). As senhas dos papéis (`scripts/test-pg.sh:18-19`) são os valores de desenvolvimento já padrão do compose (`docker-compose.yml:12-19`) e do job `banco` da CI (`ci.yml:126-133`); não dão acesso a nenhum banco real. O `.env.example` (linha 23 no head) passa a ter a `PG_TESTE_URL` comentada, com a mesma senha de desenvolvimento de antes. Nenhuma credencial nova entrou no repositório (varredura das linhas adicionadas do diff).
- **Portas.** A porta é pedida ao kernel em `127.0.0.1` (`scripts/test-pg.sh:26`) e publicada só em loopback (`docker-compose.yml:20`); a URL dos testes usa `127.0.0.1` (`scripts/test-pg.sh:36`) e os papéis derivam host e porta dela (`server/tests/pg/ctx.ts:21-22`). A corrida entre fechar o socket e o Docker publicar a porta falha fechada: o `up --wait` sai com erro, o trap limpa e nenhum teste roda.
- **Limpeza.** `trap limpar EXIT` com `down -v --remove-orphans` (`scripts/test-pg.sh:31-34`), armado só no ramo que sobe o banco e depois de exportar `COMPOSE_PROJECT_NAME`; INT, TERM e HUP convergem para o EXIT. O volume `dspd-pg-data` não tem `name:` fixo nem `external` (`docker-compose.yml:104-105`), então é prefixado pelo projeto e sai com o `-v`. `kill -9` deixa contêiner, volume e rede do projeto `metricasdspd-teste-<id>`, só em loopback e com senha de administrador que ninguém mais conhece; o comando de limpeza está documentado (README, `operacao-banco.md`, cabeçalho do script). Informativo.
- **Banco de desenvolvimento.** Não é atingido no caminho padrão: `COMPOSE_PROJECT_NAME`, `PG_PORT` e `POSTGRES_PASSWORD` são exportados depois de ler o `.env` e vencem o que houver nele (sonda S1 abaixo, com um `.env` hostil que fixa `COMPOSE_PROJECT_NAME=metricasdspd` e `PG_PORT=5432`); o `name:` do compose lê a variável (`docker-compose.yml:3`), então nem o `up` nem o `down -v` tocam o projeto `metricasdspd`. Uma `PG_TESTE_URL` vinda só do `.env` é descartada (`scripts/test-pg.sh:12-14`), o que fecha o caminho do bug original, em que o `.env` copiado do exemplo levava os testes ao servidor de desenvolvimento.
- **Banco real.** Só é alcançável por decisão explícita de quem exporta `PG_TESTE_URL` no ambiente com a credencial do migrador do banco real; mesmo então, o `globalSetup` migra num conjunto de schemas com prefixo aleatório `t<6>_` (`server/tests/pg/global-setup.ts:22-26`) e o teardown só remove esses três schemas (`global-setup.ts:34-35`); o prefixo nunca é vazio, então os schemas sem prefixo não são tocados. Comportamento anterior à entrega, sem guarda de destino: A1.
- **CI.** Inalterada: `ci.yml:134,145` e `homolog.yml:123` definem a URL no `env:` do job e chamam o `test:pg` do pacote do servidor, não o script da raiz.

## Achados
- A1 (recomendado) server/tests/pg/global-setup.ts:20 · Sem guarda de destino: PG_TESTE_URL exportada no shell com host fora de loopback ou database sem sufixo _test leva migração e testes a esse banco (o dev ou o real). Recusar, salvo CI=true, host fora de 127.0.0.1/localhost/::1 ou database que não termine em _test.
- A2 (recomendado) scripts/test-pg.sh:13 · O .env inteiro é exportado (set -a) ao processo de teste, com apikey do BusinessMap, sal de eliminação e URLs do banco de dev, sem necessidade no caminho descartável. Ler do .env só as DSPD_PWD_* (ou nenhuma), por minimização.

## Sondas

## Detalhe dos achados
**A1.** Evidência: `server/tests/pg/global-setup.ts:20-26` aceita qualquer `PG_TESTE_URL`; `scripts/test-pg.sh:14` repassa a do ambiente sem conferir. Caminho: o próprio desenvolvedor (ou um agente) com uma `PG_TESTE_URL` persistida no perfil do shell apontando para `metricas` (dev) ou para o servidor interno roda `pnpm run test:pg`; a migração cria schemas `t<6>_dspd_*` e os testes escrevem e apagam dados ali. Não há atacante externo nem vazamento; o dano é escrita de teste num banco que não é de teste. A entrega diminui esse risco (antes o `.env` bastava para isso). Severidade: baixa. Correção mínima, no `globalSetup` (cobre local e CI, que passam por ele): fora de `CI=true`, recusar com mensagem clara quando o host da URL não for `127.0.0.1`, `localhost` ou `::1`, ou quando o database não terminar em `_test`; a CI usa `127.0.0.1:5432/metricas_test` (`ci.yml:134`) e passaria mesmo sem a exceção. Esforço P. Dono: `node-backend`, com teste do `qa-engineer`. Não bloqueia: comportamento anterior, sem caminho de ataque.

**A2.** Evidência: `scripts/test-pg.sh:13` faz `set -a` sobre o `.env` inteiro, que pelo `.env.example` pode trazer `BUSINESSMAP_APIKEY`, `PESSOA_ELIMINADA_SAL`, `PG_MIGRADOR_URL`, `PG_API_URL`, `PG_COLETOR_URL` e `PG_REF_URL` do banco de desenvolvimento. No caminho descartável o script só precisa das `DSPD_PWD_*` (e nem delas: os padrões bastam, porque o servidor nasce com as senhas do próprio script). Caminho: um teste ou dependência que leia ou registre o ambiente passa a ter a apikey real e as URLs do banco de dev; nenhum teste do projeto `pg` as lê hoje. Severidade: baixa (minimização, sem caminho de ataque realista). Correção mínima: trocar o `source` por leitura só das variáveis `DSPD_PWD_MIGRADOR`, `DSPD_PWD_COLETOR`, `DSPD_PWD_API`, `DSPD_PWD_REF`, `DSPD_PWD_WEBHOOK`, `DSPD_PWD_AUTOMACAO`, `DSPD_PWD_PESQUISA` e `DSPD_PWD_APONTAMENTO`, ou não ler o `.env` no ramo descartável. Esforço P. Dono: `devops-engineer` (dono do script, pelo parecer de devops).

**Informativo.** Um `.env` que defina `DOCKER_HOST` ou `DOCKER_CONTEXT` faria o descartável subir noutro motor; a URL continua em `127.0.0.1` local, a porta foi achada livre aqui, e o `down -v` só remove o projeto aleatório, então não atinge banco existente. Coberto pela correção de A2.

Sondas executadas (nenhuma prova bloqueante, por isso fora do bloco `## Sondas`): cópia das linhas 12-14 e 22-30 do script, com o `docker` e a porta trocados por eco, num diretório com um `.env` que define `PG_TESTE_URL` do dev, `COMPOSE_PROJECT_NAME=metricasdspd`, `PG_PORT=5432` e `POSTGRES_PASSWORD` fixa.
- S1, sem `PG_TESTE_URL` no ambiente: `sobe: projeto=metricasdspd-teste-7900bca6 porta=55555 senha_len=24 senha_do_env=nao` (o `.env` não decide projeto, porta, senha nem destino).
- S2, com `PG_TESTE_URL` no ambiente: `usa URL=<a do ambiente>`, nenhum `up` nem trap armado.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas: `shellcheck` (só SC1091, informativo), `git diff` e varredura das linhas adicionadas por credencial (só os valores de desenvolvimento já conhecidos). Lacunas: o gitleaks não está no PATH (não instalado, `R-CUSTO`); contêiner não subido nesta revisão (as execuções reais são o PQ do autor e as do QA); `git fetch` não rodou dentro do sandbox, a ponta remota conferida foi a do último fetch da worktree (9edfaccf).
