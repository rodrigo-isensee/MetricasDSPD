Agente destino: forge:qa-engineer
Pedido: 091-homolog-reavalia-nova-tentativa
Tipo: codigo
Branch: fix/k263-reavalia-espera   Base: develop   Base-sha: 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13
Etapa: codigo   Cobre: E1.4

## Objetivo
QA do K-263: branch `fix/k263-reavalia-espera`, worktree `/home/rodrigoisensee/MetricasDSPD-056`, código em d1693a72b467afaf6f74fcc97618481efd16565d (entrega conferida), review (d315dea2) e segurança (2242c6a5) aprovados, base develop 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056 diff 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13 d1693a72b467afaf6f74fcc97618481efd16565d`.
- `/home/rodrigoisensee/MetricasDSPD-056/docs/security/091-homolog-reavalia.md` (novo).

## Entregar
- "E1.4 (qa-engineer): QA." (E1.4)
- (E1) (E2) (E1.4) Rodar os testes de `tools/homolog` com no máximo 2 workers (R-TETO; a suíte inteira deste PR vai ao CI); conferir que a falha transitória vira verde, que portão vermelho ou ausente continua vermelho depois das tentativas e que portão verde de primeira não espera; uma mutação (tirar a nova tentativa ou aceitar portão não verde) que os testes pegam, restaurada antes do commit. Grave `docs/qa/091-homolog-reavalia.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 091-homolog-reavalia-nova-tentativa`, `branch: fix/k263-reavalia-espera`, `commit: d1693a72b467afaf6f74fcc97618481efd16565d`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado (cada uma com até 300 caracteres); rode `forge-check docs` antes do commit. Commit só do parecer com `Cartão: K-263` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/fix/k263-reavalia-espera` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/qa/091-homolog-reavalia.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 091-homolog-reavalia-nova-tentativa até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/091-homolog-reavalia-nova-tentativa.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): implementação em `tools/homolog/src/aprovacao.ts` e, se preciso, `.github/workflows/homolog-reavalia.yml` ou `homolog-aprovada.yml`, com teste em `tools/homolog/src/aprovacao.test.ts` e parecer de devops em docs/devops/, na branch fix/k263-reavalia-espera, worktree /home/rodrigoisensee/MetricasDSPD-056." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review; cada parecer (review, segurança e QA) commitado e enviado na própria branch por quem o grava." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança (gatilho CI/CD)." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 show origin/fix/k263-reavalia-espera:docs/qa/091-homolog-reavalia.md` · espera: contém 'commit: d1693a72b467afaf6f74fcc97618481efd16565d'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
