---
tipo: review
contrato: 1
pedido: 095-runner-ubuntu-2404
branch: melhoria/runner-ubuntu-2404
commit: 60bdc2060232fc1cd5258bec580aa53dde08dc31
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: runner ubuntu-24.04 nos jobs com navegador (095, E1.3, K-269)

## Achados
- A1 (recomendado) docs/devops/095-runner-ubuntu-2404.md:6 · o campo commit do parecer de devops traz o sha da base (eac38a64), não o do código (60bdc206); o diff revisado é o mesmo, então não invalida o parecer, mas o domínio fica preso à base. Ajuste é do devops-engineer, se a catraca pedir.
- A2 (recomendado) .github/workflows/ci.yml:194 · concordo com o A1 de segurança e o A1 de devops: cartão de volta ao ubuntu-latest com data de revisão e, à parte, nova tentativa na instalação do navegador; nenhum dos dois bloqueia esta troca.

## Sondas

## Parecer
Aprovado. Diff lido: `eac38a64..60bdc206`, em `.github/` 4 linhas removidas e 8 adicionadas, mais o parecer de devops.

- **Só os `runs-on` dos jobs com navegador mudaram:** `git diff -U0` filtrado sem as linhas `runs-on` e sem as de comentário K-269 sai vazio. Os quatro jobs trocados são exatamente os que rodam Playwright: `ci.yml` `e2e-parte` (:195) e `perf` (:262), `homolog.yml` `e2e-homolog-parte` (:131) e `perf-homolog` (:179). Os únicos `playwright install` dos workflows estão nesses jobs (`ci.yml:221-223`, `:284-286`; no `homolog.yml` pela ação composta `./.github/actions/playwright`, usada só nesses dois jobs). Agregadores e demais jobs seguem em `ubuntu-latest`.
- **Nomes dos jobs e checks exigidos iguais:** nenhuma linha `name:` nem id de job no diff; `e2e`, `e2e-homolog`, `perf`, `perf-homolog` e `portao` mantêm o mesmo nome, então os checks exigidos pela proteção da `develop` e da `homolog` e o `needs` do `portao` continuam casando. A chave do cache do Playwright usa `runner.os` (`Linux` nas duas imagens) e segue válida.
- **Comentário:** cada `runs-on` traz uma linha com o motivo (apt sem DNS dos espelhos na 26.04), o cartão K-269 e a condição de volta ao `ubuntu-latest`. O caminho de volta completo está no parecer de devops (validar por `workflow_dispatch` e trocar os quatro, ou reverter o commit).
- **Pareceres citados, não refeitos:** devops aprovado (`docs/devops/095-runner-ubuntu-2404.md`; sintaxe validada por `yaml.safe_load`, `actionlint` ausente); segurança aprovada em 6f5b3e4c (`docs/security/095-runner-ubuntu-2404.md`; sem permissão, segredo, gatilho ou ação nova).
- **Guardas e testes:** nenhuma guarda de código mudada e nenhum arquivo de teste tocado; não há teste local a rodar para `runs-on`. A prova é o CI do PR com os quatro jobs verdes no `ubuntu-24.04`.
- **Custo (`R-CUSTO`):** runner padrão gratuito, mesmos minutos.
- **Fluxo:** o envio de arquivo de workflow exige o escopo `workflow`, do dono (E1.4); arquivo protegido de `.github/` pode pedir o rótulo do dono no PR.
