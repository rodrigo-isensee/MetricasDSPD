## Objetivo
Code review do K-263: branch `fix/k263-reavalia-espera`, worktree `/home/rodrigoisensee/MetricasDSPD-056`, entrega conferida em d1693a72b467afaf6f74fcc97618481efd16565d (código e40524fd e parecer de devops), base develop 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13. O `pnpm run pronto` local caiu só nos testes de CLI do server por ambiente (K-264); a suíte completa vai ao CI do PR.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056 diff 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13 d1693a72b467afaf6f74fcc97618481efd16565d`.
- `/home/rodrigoisensee/MetricasDSPD-056/docs/devops/091-homolog-reavalia.md` (novo).

## Entregar
- "E1.2 (tech-lead): review; cada parecer (review, segurança e QA) commitado e enviado na própria branch por quem o grava." (E1.2)
- (E1) (E2) (E1.2) Review: a nova tentativa só acontece no caso "portão sem sucesso"; a regra (candidato = ponta da homolog, portão verde) não afrouxa; portão vermelho ou ausente continua falhando; o teste prova a nova tentativa (falha transitória vira verde; portão vermelho continua vermelho). Rodar só os testes de `tools/homolog` com no máximo 2 workers (R-TETO: a suíte inteira roda uma por vez, e a deste PR vai ao CI). Parecer `docs/reviews/091-homolog-reavalia.md` (novo) pela ferramenta Write, com `pedido: 091-homolog-reavalia-nova-tentativa`, `branch: fix/k263-reavalia-espera`, `commit: d1693a72b467afaf6f74fcc97618481efd16565d` e o veredito. Commit só do parecer com `Cartão: K-263` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/fix/k263-reavalia-espera` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/reviews/091-homolog-reavalia.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 show origin/fix/k263-reavalia-espera:docs/reviews/091-homolog-reavalia.md` · espera: contém 'commit: d1693a72b467afaf6f74fcc97618481efd16565d'
