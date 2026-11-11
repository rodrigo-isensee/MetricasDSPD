---
tipo: revisao-devops
contrato: 1
pedido: 095-runner-ubuntu-2404
branch: melhoria/runner-ubuntu-2404
commit: 60bdc2060232fc1cd5258bec580aa53dde08dc31
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-11
---
# Review de devops: 095-runner-ubuntu-2404

## Achados
- A1 (recomendado) .github/workflows/ci.yml:195 · sem nova tentativa no passo de instalação do navegador; um DNS instável no 24.04 ainda derrubaria o job. Cartão futuro, sem `continue-on-error`.

## Detalhes
Aprovado. Mudança mínima de `runs-on`, sem alterar passos, permissões, cache ou ações.

Motivo: `ubuntu-latest` passou a apontar para a imagem Ubuntu 26.04. Nela o apt não resolve os espelhos (`azure.archive.ubuntu.com`, `archive.ubuntu.com`, `security.ubuntu.com`) no passo `playwright install --with-deps chromium` (ou `install-deps`). Os jobs com navegador falharam nos runs 43042533708 (homolog.yml) e 43042964812 (ci.yml), e de novo na reexecução. Diagnóstico completo em `docs/devops/093-runner-ubuntu26-dns.md` (rascunho do pedido 093). A causa na imagem não foi confirmada (sem acesso ao runner); a evidência é o log.

Jobs tocados (`runs-on: ubuntu-latest` para `ubuntu-24.04`, com comentário curto do motivo e do cartão K-269):
- `.github/workflows/ci.yml`: `e2e-parte` (linha 195) e `perf` (linha 262).
- `.github/workflows/homolog.yml`: `e2e-parte` (nome `e2e-homolog-parte`, linha 131) e `perf` (nome `perf-homolog`, linha 179).

Fora da mudança, de propósito: os agregadores `e2e` (ci.yml e homolog.yml) e os demais jobs não instalam navegador e seguem em `ubuntu-latest`. Os nomes dos jobs e dos checks não mudam, então o ruleset e o `portao` continuam consumindo os mesmos ids. A chave do cache do Playwright (`runner.os` e versão) segue válida: `runner.os` é `Linux` nos dois.

Volta ao `ubuntu-latest`: quando a imagem 26 resolver o DNS do apt (validar com um `workflow_dispatch` temporário do `ci.yml` numa branch `melhoria/*` com os quatro jobs em `ubuntu-latest`), trocar de volta nos quatro jobs e remover os comentários. Reverter o commit também desfaz tudo.

Ferramentas: `actionlint` ausente do PATH (lacuna registrada; o agente não instala ferramenta). Sintaxe validada com parser YAML (`yaml.safe_load` nos dois arquivos: ok). Sem `shellcheck` nem `docker build`, que não se aplicam (nenhum script ou Dockerfile mudou).

Campo `commit`: traz o sha do commit que mudou os workflows (`60bdc206`), sobre o qual o diff foi revisado. Este parecer vai em commit separado, só do arquivo do parecer, o que acolhe o A1 do review (o campo antes apontava a base `eac38a64`).

Pendências do fluxo (não são deste parecer): arquivo protegido de `.github/` pede o rótulo `afrouxa-regra` do dono no PR (catraca); o envio do commit de workflow exige o escopo `workflow`, que é do dono.

## Custo e rollback
Custo zero (`R-CUSTO`): `ubuntu-24.04` é runner padrão gratuito, mesmos minutos. Rollback: reverter o commit (ou trocar os quatro `runs-on` de volta para `ubuntu-latest`), sem efeito em dados ou ambiente.
