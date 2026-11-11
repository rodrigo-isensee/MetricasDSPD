## Objetivo
Os jobs com navegador seguem falhando no PR 318 mesmo no ubuntu-24.04 (Image 20261101.360.1): "Temporary failure resolving 'azure.archive.ubuntu.com'" no `playwright install-deps chromium` (run 43058313572). A falha não é da imagem, é do apt do runner. Branch `melhoria/runner-ubuntu-2404`, worktree `/home/rodrigoisensee/MetricasDSPD-052h`, head 4a59c880.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/.github/workflows/ci.yml` (linhas 190 a 300), `/home/rodrigoisensee/MetricasDSPD-052h/.github/workflows/homolog.yml` e `/home/rodrigoisensee/MetricasDSPD-052h/.github/actions/playwright/action.yml`.
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/devops/095-runner-ubuntu-2404.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/devops/093-runner-ubuntu26-dns.md`.
- O log do run 43058313572 (`gh run view 43058313572 --log-failed`, com `api.github.com` e `*.actions.githubusercontent.com` em allowed_domains).

## Entregar
- "E1.9 (devops-engineer): a troca de imagem não resolveu (PR 318); diagnóstico e correção que não dependa do apt do runner na instalação do navegador (por exemplo, rodar os jobs com navegador no container oficial do Playwright, de versão fixada, ou instalar com nova tentativa e espelho alternativo), na mesma branch e worktree; commit sem push (workflow: o envio é do dono)." (E1.9)
- (E1) (E1.9) Escolher a correção com o motivo (comparar ao menos container fixado por digest e nova tentativa com espelho), sem afrouxar o que os testes provam, sem `continue-on-error` e sem pular teste; a versão do Playwright do container igual à do `pnpm-lock.yaml`. Se a escolha manter `ubuntu-24.04` ou voltar ao `ubuntu-latest`, dizer. Validar a sintaxe dos workflows (actionlint, se houver; senão um parser de YAML). Atualizar o parecer `docs/devops/095-runner-ubuntu-2404.md` pela ferramenta Write com o diagnóstico novo e `commit:` do commit da correção. Dois commits com `Cartão: K-269` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito): primeiro a correção, depois o parecer. Sem push (o dono envia, porque o commit toca workflow).
- Retira do escopo original: nada. Fora do escopo do pedido, mantido: "Jobs sem navegador (seguem no ubuntu-latest)"; não mudar o `runs-on` nem os passos de jobs sem navegador.
- arquivos: [.]github/workflows/ci.yml, [.]github/workflows/homolog.yml, [.]github/actions/playwright/action.yml, docs/devops/095-runner-ubuntu-2404.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h log -2 --format=%B` · espera: contém 'Cartão: K-269'
