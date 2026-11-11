## Objetivo
Parecer de segurança (gatilho CI/CD) da troca de runner dos jobs com navegador: branch `melhoria/runner-ubuntu-2404`, worktree `/home/rodrigoisensee/MetricasDSPD-052h`, commit 60bdc206 (já no origin), base develop eac38a64b0b580d7c920f4b2b501287f7fb56599.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff eac38a64b0b580d7c920f4b2b501287f7fb56599 60bdc206`.
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/devops/095-runner-ubuntu-2404.md`.

## Entregar
- "E1.2 (security-engineer): parecer de segurança (gatilho CI/CD)." (E1.2)
- (E1) (E1.2) Conferir que só os `runs-on` dos jobs com navegador mudaram (nenhuma permissão, segredo, gatilho, ação de terceiro ou passo novo) e o efeito de fixar uma imagem (atualizações de segurança da imagem 24.04 seguem chegando; risco de esquecer a volta). Parecer `docs/security/095-runner-ubuntu-2404.md` (novo) pela ferramenta Write, com `pedido: 095-runner-ubuntu-2404`, `branch: melhoria/runner-ubuntu-2404`, `commit:` o sha40 de 60bdc206 e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-269` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/melhoria/runner-ubuntu-2404` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Se o push for recusado por falta do escopo `workflow`, pare e relate (o commit só de parecer não deveria exigir).
- arquivos: docs/security/095-runner-ubuntu-2404.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/melhoria/runner-ubuntu-2404:docs/security/095-runner-ubuntu-2404.md` · espera: contém 'branch: melhoria/runner-ubuntu-2404'
