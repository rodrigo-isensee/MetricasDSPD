# Pedido 095: jobs com navegador no Ubuntu 24.04 (DNS do runner Ubuntu 26)

- **Modo:** implementar
- **Objetivo:** os jobs com navegador da CI e do portão da homolog (`e2e-parte`, `perf`, `e2e-homolog-parte`, `perf-homolog`) falham desde a troca do `ubuntu-latest` para Ubuntu 26.04: o apt não resolve `archive.ubuntu.com` nem `security.ubuntu.com` ao instalar as dependências do Playwright. Duas reexecuções falharam igual. Sem isso, nenhum PR fica com a CI verde e o check `homolog-aprovada` não passa.
- **Clareza:** 0 confirmado; 1 técnico; 0 suposição; 0 perguntas
- **Origem:** E1.9 do pedido 093 (diagnóstico do devops em docs/devops/093-runner-ubuntu26-dns.md); fila de trabalho sem o dono.

## Escopo
- E1. Fixar `runs-on: ubuntu-24.04` nos jobs com navegador de `.github/workflows/ci.yml` e `.github/workflows/homolog.yml`, sem mudar o que os jobs testam · `técnico`

## Etapas
- E1.1 (devops-engineer): mudança dos `runs-on` dos jobs com navegador e parecer de devops, na branch melhoria/runner-ubuntu-2404, worktree /home/rodrigoisensee/MetricasDSPD-052h; commit sem push (o envio de arquivo de workflow exige o escopo `workflow`, que é do dono).
- E1.2 (security-engineer): parecer de segurança (gatilho CI/CD).
- E1.3 (tech-lead): review.
- E1.4 (dono): push da branch.
- E1.5 (tech-lead): PR para a develop; o merge é do dono.
- E1.6 (agile-coach): retrospectiva curta.

## Fora do escopo
- Jobs sem navegador (seguem no ubuntu-latest) · `técnico`

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-11 12:22: pedido aberto pelo Jarvis depois de duas reexecuções com a mesma falha de DNS (runs 43042533708 e 43042964812); worktree 052h na branch melhoria/runner-ubuntu-2404 a partir da develop eac38a64.
- 2026-11-11 12:23: brief selado docs/briefs/095-runner-ubuntu-2404-devops-engineer-1.md c9e467695b46ce929d74d138c4c427cb89d6e4dc9024bc03ff186c58c46a6b00
- 2026-11-11 12:25: E1.1 entregue pelo devops (60bdc206, sem push): runs-on ubuntu-24.04 em e2e-parte e perf de ci.yml e homolog.yml, com comentário; parecer de devops aprovado (A1 recomendado: nova tentativa na instalação do navegador). Próximo: E1.4, push da branch pelo dono (escopo workflow); depois segurança, review e PR.
- 2026-11-11 12:37: E1.4 feito: a branch melhoria/runner-ubuntu-2404 (60bdc206) está no origin, enviada pela sessão "WSL ativação" a pedido do dono. Próximo: E1.2 (segurança) e E1.3 (review) em paralelo, depois E1.5 (PR).
