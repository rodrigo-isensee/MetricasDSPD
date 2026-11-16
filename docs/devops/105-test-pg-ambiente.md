---
tipo: revisao-devops
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-test-pg-ambiente
commit: 944aa74c86daea77411965377cc82f9c528f13b9
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-16
---
# Review de devops: 105-test-pg-ambiente (K-392, E7.335)

## Parecer
Aprovado. `scripts/test-pg.sh` sobe um Postgres descartável por execução e o derruba no fim; o caminho da CI não muda. Nenhum arquivo de `.github/`, `Dockerfile*` ou `docker-compose.yml` foi alterado (diff: `scripts/test-pg.sh` e `docs/engineering/operacao-banco.md`). Revisão estática; não subi o contêiner (a suíte roda no CI do PR, que ainda não existe: não afirmo CI verde). Prova do autor, não refeita: `test:pg` completo sem `.env`, 342 de 342.

- **Trap.** `trap limpar EXIT` roda `docker compose down -v --remove-orphans` em saída normal, em `exit 1` por falha do `up --wait` e em erro do `test:pg`; `trap 'exit 130' INT TERM` leva Ctrl-C e `kill` ao mesmo EXIT. O `down` usa o `COMPOSE_PROJECT_NAME` exportado antes do trap, então só atinge o projeto `metricasdspd-teste-<id>` (o `name:` do compose lê a variável) e nunca o `metricasdspd` de desenvolvimento. O volume `dspd-pg-data` é prefixado pelo projeto e sai com o `-v`. O trap só é armado dentro do ramo que sobe o banco, então com `PG_TESTE_URL` não há `down` nenhum.
- **Porta.** Porta livre pedida ao kernel (`listen(0, "127.0.0.1")`), publicada em `127.0.0.1:${PG_PORT}` pelo compose (sem exposição externa) e a URL usa `127.0.0.1`. Sobra a janela entre fechar o socket e o Docker abrir a porta (corrida): se perder, o `up` falha e o script sai com 1 e limpa; não dá resultado falso. Aceito, execuções concorrentes ainda passam pela trava `suite-unica.sh` (flock), o que a torna improvável.
- **Limpeza.** `.env` carregado antes dos exports: `COMPOSE_PROJECT_NAME`, `PG_PORT` e `POSTGRES_PASSWORD` do script vencem o que houver no `.env`, então um `.env` do dono não faz o teste cair no banco de desenvolvimento. Senha de administrador aleatória por instância (`od` em `/dev/urandom`), só em variável de ambiente do processo, nada gravado em disco nem na imagem. Senhas dos papéis são valores de desenvolvimento iguais aos padrões do compose e aos do job `banco` (`ci.yml:126-133`), sem credencial real.
- **Caminho da CI.** `ci.yml:134` e `homolog.yml:115` definem `PG_TESTE_URL` e chamam `pnpm --filter @metricas-dspd/server run test:pg` (`ci.yml:145`, `homolog.yml:123`), script do pacote do servidor, não o `scripts/test-pg.sh` da raiz (via `package.json:38` só no uso local) (`server/package.json:37`: `vitest run --project pg`). A CI, portanto, nem passa pelo `scripts/test-pg.sh`: o script novo só afeta o uso local, e o caminho da CI fica intacto (com `PG_TESTE_URL` definida, o script também pularia o contêiner). Os `DSPD_PWD_*` do job coincidem com os padrões do script. O job `banco` (service container + init do compose) não foi tocado.
- Mudança local de `.env` com `PG_TESTE_URL` definida também pula o contêiner (comportamento antigo preservado, é a mesma regra da CI).

## Ponto em aberto do autor (ADR 0014)
O ADR 0014 prevê um servidor com `metricas_test` compartilhado e schemas com prefixo por execução; o uso local agora sobe um servidor por execução, enquanto a CI segue com banco compartilhado e prefixo. Não é defeito: a divergência é de ambiente, o código dos testes é o mesmo nos dois e o isolamento local ficou mais forte (corrige schemas acumulados e senha divergente). Não bloqueia. Pendência para o `software-architect`/`tech-lead`: registrar a exceção no ADR 0014 (ou emenda) e ajustar o comentário de `docker-compose.yml:2` ("`metricas_test` ... um conjunto de schemas por execução"), que descreve só o caminho da CI; o `docker-compose.yml` é do devops e não foi alterado aqui (fora do diff revisado).

## Recomendações (não bloqueiam)
- recomendado: tratar `HUP` no trap (`trap 'exit 129' HUP`) para fechar o terminal do WSL no meio da suíte também derrubar o banco; hoje só `kill -9` e queda da máquina deixam sobras, e o `docker compose -p metricasdspd-teste-<id> down -v` as remove.
- recomendado: `shellcheck scripts/test-pg.sh` aponta SC2164 (`cd` sem `|| exit`) na linha 8; a linha 9 (SC1091) é informativa. Sem efeito prático (só falha se o diretório sumir).

## Custo e rollback
Custo zero (`R-CUSTO`): sem runner, serviço ou cache novos; nenhum minuto de CI novo. Rollback: reverter o commit; o `test:pg` volta a usar o banco compartilhado do `.env`.

## Lacunas
`actionlint` não aplicável (nenhum workflow mudou); `shellcheck` rodou (achados acima). Contêiner não subido nesta revisão. A segurança não tem gatilho de `R-SEGURANCA` (nenhum segredo real, porta só em loopback).
