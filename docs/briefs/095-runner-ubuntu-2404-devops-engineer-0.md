## Objetivo
Os jobs com navegador falham no runner Ubuntu 26.04 (`ubuntu-latest` mudou): o apt não resolve os espelhos do Ubuntu ao instalar as dependências do Playwright. Fixar `ubuntu-24.04` só nesses jobs. Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `melhoria/runner-ubuntu-2404` (a partir da develop eac38a64b0b580d7c920f4b2b501287f7fb56599).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/devops/093-runner-ubuntu26-dns.md` (o diagnóstico).
- `/home/rodrigoisensee/MetricasDSPD-052h/.github/workflows/ci.yml` e `/home/rodrigoisensee/MetricasDSPD-052h/.github/workflows/homolog.yml`.

## Entregar
- "E1.1 (devops-engineer): mudança dos `runs-on` dos jobs com navegador e parecer de devops, na branch melhoria/runner-ubuntu-2404, worktree /home/rodrigoisensee/MetricasDSPD-052h; commit sem push (o envio de arquivo de workflow exige o escopo `workflow`, que é do dono)." (E1.1)
- (E1) (E1.1) Trocar `runs-on: ubuntu-latest` por `runs-on: ubuntu-24.04` só nos jobs que instalam navegador (os de e2e e perf, nos dois workflows), com um comentário curto do motivo; nada mais muda. Validar a sintaxe dos dois arquivos (actionlint se houver, senão um parser de YAML). Parecer `docs/devops/095-runner-ubuntu-2404.md` (novo) pela ferramenta Write, com o motivo, os jobs tocados e a volta ao `ubuntu-latest` quando a imagem 26 resolver o DNS. Commit com `Cartão: K-269` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelos três caminhos); sem push (o dono envia).
- arquivos: .github/workflows/ci.yml, .github/workflows/homolog.yml, docs/devops/095-runner-ubuntu-2404.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h log -1 --format=%B` · espera: contém 'Cartão: K-269'
