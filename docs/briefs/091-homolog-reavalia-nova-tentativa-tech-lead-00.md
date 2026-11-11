## Objetivo
PR do K-263: branch `fix/k263-reavalia-espera` (worktree `/home/rodrigoisensee/MetricasDSPD-056`, ponta 86794f36; código d1693a72b467afaf6f74fcc97618481efd16565d conferido; review d315dea2, segurança 2242c6a5 e QA 86794f36 aprovados). O parecer de review tem forma que o `forge-check docs` recusa (achado A2 com mais de 300 caracteres e uma linha fora do formato no bloco `## Achados`).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-056/docs/reviews/091-homolog-reavalia.md` (novo), `/home/rodrigoisensee/MetricasDSPD-056/docs/security/091-homolog-reavalia.md` (novo) e `/home/rodrigoisensee/MetricasDSPD-056/docs/qa/091-homolog-reavalia.md` (novo).

## Entregar
- "E1.5 (tech-lead): PR para a develop; o merge é do dono." (E1.5)
- (E1) (E2) (E1.5) Corrigir só a forma do próprio parecer de review (A2 em até 300 caracteres; a linha "Nenhum achado bloqueante" fora do bloco `## Achados`), sem mudar o veredito nem o conteúdo; `forge-check docs` sem erro nesse arquivo; commit só dele com `Cartão: K-263` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/fix/k263-reavalia-espera` (`github.com` em allowed_domains); commit e push em chamadas separadas. Depois, abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write e passado com `--body-file`; `Cartão: K-263`; os três pareceres; os achados recomendados: A1 do review, `docs/engineering/fluxo-homologacao.md:170` ainda diz "sem espera", e A1 da segurança, comentários de `.github/workflows/homolog-aprovada.yml` com "sem espera"; o K-264 como causa das falhas do pronto local) e esperar a CI verde em laços de até 170 s por chamada. Não mesclar (o merge é do dono, E1.5).
- arquivos: docs/reviews/091-homolog-reavalia.md

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head fix/k263-reavalia-espera --base develop --json number --jq .[].number` · espera: linhas=1
