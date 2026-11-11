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
- E1.7 (devops-engineer): parecer de devops novo, em commit separado e com `commit:` do código, enviado pelo próprio devops (o commit só de parecer não toca workflow e não pede o escopo `workflow`, como o da segurança e o do review).
- E1.8 (qa-engineer): parecer de QA (classe C), enviado pelo próprio QA.
- E1.9 (devops-engineer): a troca de imagem não resolveu (PR 318); diagnóstico e correção que não dependa do apt do runner na instalação do navegador (por exemplo, rodar os jobs com navegador no container oficial do Playwright, de versão fixada, ou instalar com nova tentativa e espelho alternativo), na mesma branch e worktree; commit sem push (workflow: o envio é do dono).
- E1.10 (devops-engineer): o PR 318 entrou só com o runs-on; levar a correção do container e o parecer para uma branch nova fix/k269-container-playwright a partir da develop, na worktree /home/rodrigoisensee/MetricasDSPD-052h, sem push (workflow: o envio é do dono).

## Fora do escopo
- Jobs sem navegador (seguem no ubuntu-latest) · `técnico`

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-11 12:22: pedido aberto pelo Jarvis depois de duas reexecuções com a mesma falha de DNS (runs 43042533708 e 43042964812); worktree 052h na branch melhoria/runner-ubuntu-2404 a partir da develop eac38a64.
- 2026-11-11 12:23: brief selado docs/briefs/095-runner-ubuntu-2404-devops-engineer-1.md c9e467695b46ce929d74d138c4c427cb89d6e4dc9024bc03ff186c58c46a6b00
- 2026-11-11 12:25: E1.1 entregue pelo devops (60bdc206, sem push): runs-on ubuntu-24.04 em e2e-parte e perf de ci.yml e homolog.yml, com comentário; parecer de devops aprovado (A1 recomendado: nova tentativa na instalação do navegador). Próximo: E1.4, push da branch pelo dono (escopo workflow); depois segurança, review e PR.
- 2026-11-11 12:37: E1.4 feito: a branch melhoria/runner-ubuntu-2404 (60bdc206) está no origin, enviada pela sessão "WSL ativação" a pedido do dono. Próximo: E1.2 (segurança) e E1.3 (review) em paralelo, depois E1.5 (PR).
- 2026-11-11 12:41: brief selado docs/briefs/095-runner-ubuntu-2404-security-engineer-1.md fbad2c7b5663428f5da8938d0505dfb195df3cc7e5b6cafb5d854baa2b029e55
- 2026-11-11 12:43: E1.2 parecer de segurança aprovado (docs/security/095-runner-ubuntu-2404.md, 6f5b3e4c, enviado sem pedir o escopo workflow): só os 4 runs-on mudaram; A1 recomendado (cartão de volta ao ubuntu-latest com revisão trimestral); actionlint, zizmor e gitleaks ausentes do PATH (lacuna declarada). Próximo: E1.3 (review).
- 2026-11-11 12:45: brief selado docs/briefs/095-runner-ubuntu-2404-tech-lead-1.md a410c3e91f971f1f31616939911a03534794b7f4ec50f83c1761e2b8631517a4
- 2026-11-11 12:47: E1.3 review aprovado (docs/reviews/095-runner-ubuntu-2404.md, ec6b89e2, enviado): só os 4 runs-on, nomes de jobs e checks exigidos iguais; A1 (commit do parecer de devops traz a base) e A2 (cartão de volta ao ubuntu-latest) recomendados. Próximo: E1.5 (PR).
- 2026-11-11 12:48: brief selado docs/briefs/095-runner-ubuntu-2404-tech-lead-3.md 2b08ab20d721d54a72ca553c58d68f17125deedd0ee72f9a8dbf02176ce668ab
- 2026-11-11 12:49: brief selado docs/briefs/095-runner-ubuntu-2404-tech-lead-5.md 45fdf457dbf6cb198d177618e7ff81b115e382e5df3201052030818ebf91cbf0
- 2026-11-11 13:09: E1.5 barrada pelo hook R-QA (forge-check pr: falta parecer de QA, o de devops está desatualizado, falta a entrega conferida). ERRO-JARVIS: PR delegado sem rodar forge-check pr antes. DECISÃO TÉCNICA (Jarvis): etapas E1.7 (parecer de devops novo, enviado pelo devops) e E1.8 (QA) acrescentadas; depois, a entrega conferida e o PR de novo. A conferência acusa os workflows como fora do declarado porque o forge-check corta o ponto inicial de `.github/` (melhoria do Forge anotada).
- 2026-11-11 13:10: brief selado docs/briefs/095-runner-ubuntu-2404-devops-engineer-4.md b62162f4e483ad5bbdf29dabbdb98417534c1bc7dc297e2fe8d35ae3ae8099c1
- 2026-11-11 13:12: brief selado docs/briefs/095-runner-ubuntu-2404-qa-engineer-1.md 5bc427081c0270a11f94afb5c4da4f7aa91d31ba360eb040fe9c8ce1ecfb0a43
- 2026-11-11 13:12: E1.7 parecer de devops novo (9919379c, enviado; commit: 60bdc206; acolhe o A1 do review). Próximo: E1.8 (QA), depois a entrega conferida e E1.5 (PR).
- 2026-11-11 13:14: E1.8 QA aprovado, 0 bugs (4a59c880): só os 4 runs-on, todos os jobs com navegador cobertos, nenhum teste pulado; a prova de execução é o CI do PR. Próximo: entrega conferida e E1.5 (PR), com os workflows declarados como `[.]github/...` no brief por causa do corte do ponto no forge-check.
- 2026-11-11 13:14: brief selado docs/briefs/095-runner-ubuntu-2404-tech-lead-7.md 15bb81e231ba353a1a82c58a8e002b2c2610e6774722a47842ad426e6fdb29e7
- 2026-11-11 13:14: entrega conferida 4a59c880f1761449e55c408dbac7a09bab073e29
- 2026-11-11 13:38: E1.5 PR 318 aberto (forge-check pr aprovado, head 4a59c880), mas e2e-parte 1/2 e 2/2 falharam também no ubuntu-24.04 (Image 20261101.360.1): "Temporary failure resolving 'azure.archive.ubuntu.com'" no playwright install-deps (run 43058313572). A troca de imagem não resolve; a falha é da rede ou do espelho do apt dos runners. Próximo: devops propõe como evitar o apt (cache ou container do Playwright) ou esperar; o PR 318 não deve ser mesclado como correção.
- 2026-11-11 13:47: DECISÃO TÉCNICA (Jarvis), para a E1.9: se a correção usar o container do Playwright, a versão dele é a mesma do Playwright travada no pnpm-lock.yaml, para o navegador do container casar com o do teste.
- 2026-11-11 13:48: brief selado docs/briefs/095-runner-ubuntu-2404-devops-engineer-7.md bcb606e9657576df8e55df359317800cf7471c93ab7f42d40c4e863fd13dea76
- 2026-11-11 13:51: E1.9 entregue pelo devops, sem push (1049e819 correção, e5831b10 parecer): diagnóstico novo, o apt do host não resolve azure.archive.ubuntu.com em nenhuma imagem; os 4 jobs com navegador rodam no container mcr.microsoft.com/playwright:v1.64.0-noble fixado por digest (versão do playwright-core do lock), sem apt nem download de navegador; a ação de instalação do Playwright vira conferência do Chromium; runs-on ubuntu-24.04 mantido; actionlint ausente. Pendências: push do dono (toca workflow), portões de novo no head novo (review, segurança, QA) e o rótulo afrouxa-regra que a catraca pede (decisão do dono, depois do review dizer por quê).
- 2026-11-11 14:14: dado novo: o PR 319 (pedido 096) passou nos e2e-parte no ubuntu-latest; a falha de DNS do apt é intermitente, não permanente. A correção do container (1049e819) segue útil para não depender do apt, mas os PRs 316 e 317 podem ficar verdes só com nova execução dos jobs que falharam.
- 2026-11-11 14:47: DECLARAÇÃO DO DONO (literal): "mesclei tudo que tinha aberto". Na develop: PR 316 (K-174 lote 1), 317 (K-268), 318 (K-269, só o runs-on ubuntu-24.04; a correção do container 1049e819 e o parecer e5831b10 ficaram locais na 052h, sem push), 319 (K-270) e 320 (lote 9a); develop em f4c122f1.
- 2026-11-11 15:16: brief selado docs/briefs/095-runner-ubuntu-2404-devops-engineer-9.md 4b047f3eeee3e1d2e720a34d1365006109dd762d9090221cc8b4ae1e909ac562
- 2026-11-11 15:17: E1.10 sem trabalho: o PR 318 entrou completo na develop (container do Playwright, ação de conferência e os pareceres); o dono enviou os commits antes de mesclar. ERRO-JARVIS: a etapa foi aberta sem conferir a develop (git diff contra origin/develop). Branch vazia removida. Pedido técnico concluído; falta só a retrospectiva (E1.6).
- 2026-11-11 15:33: brief selado docs/briefs/095-runner-ubuntu-2404-agile-coach-1.md a54905c7a56d62079077070274cd1d404551dc96560ef7b945c257a1648ef47c
