---
tipo: revisao-devops
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-test-pg-ambiente
commit: 0c44ef9448ecde1aba1f2ba2a2f2ba5f6816b0c6
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-16
---
# Review de devops: 105-test-pg-ambiente (K-392, E7.335)

## Parecer
Aprovado. `scripts/test-pg.sh` sobe um Postgres descartável por execução e o derruba no fim; o caminho da CI não muda. Nenhum arquivo de `.github/`, `Dockerfile*` ou `docker-compose.yml` foi alterado. Revisão estática; não subi o contêiner (a suíte roda no CI do PR, que ainda não existe: não afirmo CI verde). Prova do autor, não refeita: `test:pg` completo sem `.env`, 342 de 342, e os dois caminhos na volta 1.

- **Trap.** `trap limpar EXIT` roda `docker compose down -v --remove-orphans` em saída normal, em `exit 1` por falha do `up --wait` e em erro do `test:pg`; `trap 'exit 130' INT TERM` leva Ctrl-C e `kill` ao mesmo EXIT. O `down` usa o `COMPOSE_PROJECT_NAME` exportado antes do trap, então só atinge o projeto `metricasdspd-teste-<id>` (o `name:` do compose lê a variável) e nunca o `metricasdspd` de desenvolvimento. O volume `dspd-pg-data` é prefixado pelo projeto e sai com o `-v`. O trap só é armado dentro do ramo que sobe o banco, então com `PG_TESTE_URL` no ambiente não há `down` nenhum.
- **Porta.** Porta livre pedida ao kernel (`listen(0, "127.0.0.1")`), publicada em `127.0.0.1:${PG_PORT}` pelo compose (sem exposição externa) e a URL usa `127.0.0.1`. Sobra a janela entre fechar o socket e o Docker abrir a porta (corrida): se perder, o `up` falha e o script sai com 1 e limpa; não dá resultado falso. Aceito, execuções concorrentes ainda passam pela trava `suite-unica.sh` (flock), o que a torna improvável.
- **Limpeza.** `COMPOSE_PROJECT_NAME`, `PG_PORT` e `POSTGRES_PASSWORD` do script são exportados depois do `.env` e vencem o que houver nele, então um `.env` do dono não faz o teste cair no banco de desenvolvimento. Senha de administrador aleatória por instância (`od` em `/dev/urandom`), só em variável de ambiente do processo, nada gravado em disco nem na imagem. Senhas dos papéis são valores de desenvolvimento iguais aos padrões do compose e aos do job `banco` (`ci.yml:126-133`), sem credencial real.
- **Caminho da CI.** `ci.yml:134` e `homolog.yml:115` definem `PG_TESTE_URL` e chamam `pnpm --filter @metricas-dspd/server run test:pg` (`ci.yml:145`, `homolog.yml:123`), script do pacote do servidor, não o `scripts/test-pg.sh` da raiz (uso local, `package.json:38`). O script só afeta o uso local; o job `banco` (service container + init do compose) não foi tocado.

## Ponto em aberto do autor (ADR 0014)
O ADR 0014 prevê um servidor com `metricas_test` compartilhado e schemas com prefixo por execução; o uso local agora sobe um servidor por execução, enquanto a CI segue com banco compartilhado e prefixo. Não é defeito: a divergência é de ambiente, o código dos testes é o mesmo nos dois e o isolamento local ficou mais forte (corrige schemas acumulados e senha divergente). Não bloqueia. Pendência para o `software-architect`/`tech-lead`: registrar a exceção no ADR 0014 (ou emenda) e ajustar o comentário de `docker-compose.yml:2`, que descreve só o caminho da CI; o `docker-compose.yml` é do devops e não foi alterado aqui.

## Revalidação no head 0c44ef94 (K-392, volta 1)
Lido só o delta de `forge-check parecer delta` (intervalo 944aa74c..0c44ef94; no domínio: `scripts/test-pg.sh`; fora: `.env.example`, `README.md`, `operacao-banco.md`, `carga-da-pesquisa-de-percepcao.md`). O parecer segue aprovado.
- **Decisão pela `PG_TESTE_URL` do ambiente.** O script guarda `PG_TESTE_URL_AMBIENTE` antes de ler o `.env` e, depois dele, restaura só o valor do ambiente ou faz `unset`. Simulei as duas entradas com um `.env` que define a variável: ambiente vazio resulta em variável vazia (sobe o descartável); ambiente definido resulta no valor do ambiente. A CI define a variável em `env:` do job e chama o `test:pg` do pacote, então o caminho dela não muda. Efeito: quem copia o `.env.example` não pula mais o descartável por engano.
- **HUP no trap.** `trap 'exit 129' HUP` leva o fechamento do terminal ao EXIT e ao `down -v`, atendendo a recomendação anterior. O comentário do topo documenta a limpeza manual após `kill -9`.
- **`.env.example`.** A linha virou comentário, explicando que só vale no ambiente do shell ou da CI. Sem valor real (a senha é a de desenvolvimento já existente).
- **shellcheck.** O `cd ... || exit 1` resolveu o SC2164 (recomendação anterior atendida); resta só SC1091, informativo. `bash -n` passa.
- Docs (`README.md`, `operacao-banco.md`, `carga-da-pesquisa-de-percepcao.md`) estão fora do domínio devops; o delta é de uma linha em cada e não avaliei o conteúdo.
- A suíte inteira fica para o CI do PR; não afirmo CI verde.

## Custo e rollback
Custo zero (`R-CUSTO`): sem runner, serviço ou cache novos; nenhum minuto de CI novo. Rollback: reverter o commit; o `test:pg` volta a usar o banco compartilhado do `.env`.

## Lacunas
`actionlint` não aplicável (nenhum workflow mudou); `shellcheck` rodou. Contêiner não subido nesta revisão. A segurança não tem gatilho de `R-SEGURANCA` (nenhum segredo real, porta só em loopback).
