---
tipo: qa
contrato: 1
pedido: 095-runner-ubuntu-2404
branch: melhoria/runner-ubuntu-2404
commit: 60bdc2060232fc1cd5258bec580aa53dde08dc31
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: runner ubuntu-24.04 nos jobs com navegador (E1.8, classe C)

Links: pedido `docs/pedidos/095-runner-ubuntu-2404.md`, motivo em `docs/devops/093-runner-ubuntu26-dns.md`, devops `docs/devops/095-runner-ubuntu-2404.md`.

## Escopo
Diff `eac38a64..60bdc206` em `.github/`: 2 arquivos, 8 inserções e 4 remoções. Sem especificação de UX e sem critérios `CA-n` (mudança de infraestrutura de CI). Os pareceres de devops, segurança e review são de outros papéis e não foram relidos aqui. A suíte E2E não foi rodada localmente (`R-TETO`).

## Conferências
| Obrigação | Evidência | Resultado |
|---|---|---|
| Só a imagem mudou | O diff de `ci.yml` e `homolog.yml` traz 4 trocas `runs-on: ubuntu-latest` para `ubuntu-24.04`, cada uma com 1 linha de comentário; nenhum `run`, `uses`, `if`, `needs`, `strategy`, `timeout` ou `with` mudou | ok |
| Mesmos comandos, shards e filtros | `test:chromium --shard=${{ matrix.parte }}/2` (ci.yml:231, homolog.yml:149), `lighthouse` (ci.yml:293, homolog.yml:192) e a matriz `parte` fora do diff | ok |
| Os 4 jobs são todos os que instalam navegador | `git grep` em `.github` por `playwright install`, `install-deps`, `actions/playwright`, `chromium`, `puppeteer`, `lighthouse`: ocorrências só em `ci.yml` `e2e-parte` (195) e `perf` (262) e em `homolog.yml` `e2e-parte` (131) e `perf` (179), mais a ação `.github/actions/playwright` usada só pelos dois do homolog. Os demais jobs (19, nos 5 workflows) seguem em `ubuntu-latest` e não instalam navegador | ok |
| Nenhum teste pulado ou afrouxado | Nenhum arquivo de teste no diff; sem `skip`, `continue-on-error` ou mudança de limiar | ok |
| Nomes de job e de check preservados | `name:` e `needs:` intactos, então os checks exigidos seguem com os mesmos ids | ok |

Tabela critério, teste, resultado: não se aplica (sem `CA-n`); a fronteira protegida é o conjunto de testes por job, conferido acima.

## Prova de execução
Vermelho antes do verde e mutação: não se aplicam (nenhum teste novo, nenhum código de regra). A prova de que o `playwright install --with-deps` resolve o apt no `ubuntu-24.04` e de que os shards passam é o CI do PR (checks `e2e-parte` 1/2 e 2/2 e `perf`, e `e2e-homolog-parte` e `perf-homolog` quando a base for a homolog). O tech-lead relata os checks do sha do PR; sem eles verdes o parecer não vale como aprovação final. Este parecer não afirma execução local.

## Achados
