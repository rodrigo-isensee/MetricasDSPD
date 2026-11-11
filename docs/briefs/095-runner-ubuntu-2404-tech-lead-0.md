## Objetivo
Review da troca de runner dos jobs com navegador: branch `melhoria/runner-ubuntu-2404`, worktree `/home/rodrigoisensee/MetricasDSPD-052h`, head 6f5b3e4c (código 60bdc206; parecer de devops aprovado; parecer de segurança aprovado em 6f5b3e4c), base develop eac38a64b0b580d7c920f4b2b501287f7fb56599.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff eac38a64b0b580d7c920f4b2b501287f7fb56599 60bdc206`.
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/devops/095-runner-ubuntu-2404.md` e `/home/rodrigoisensee/MetricasDSPD-052h/docs/security/095-runner-ubuntu-2404.md`.

## Entregar
- "E1.3 (tech-lead): review." (E1.3)
- (E1) (E1.3) Review: só os `runs-on` dos jobs com navegador mudaram, os nomes dos jobs e os checks exigidos pela proteção da `develop` e da `homolog` seguem iguais, o comentário explica o motivo e a volta. Parecer `docs/reviews/095-runner-ubuntu-2404.md` (novo) pela ferramenta Write, com `pedido: 095-runner-ubuntu-2404`, `branch: melhoria/runner-ubuntu-2404`, `commit:` o sha40 de 60bdc206 e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-269` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/melhoria/runner-ubuntu-2404` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/reviews/095-runner-ubuntu-2404.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/melhoria/runner-ubuntu-2404:docs/reviews/095-runner-ubuntu-2404.md` · espera: contém 'branch: melhoria/runner-ubuntu-2404'
