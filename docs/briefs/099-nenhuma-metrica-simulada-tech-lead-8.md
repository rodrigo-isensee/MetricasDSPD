## Objetivo
Review do comando único de consultas só de leitura dos pedidos 098 e 099: branch `chore/consultas-leitura-098-099`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, código em 1a3d8dd11103 (primeira versão aa8b6f20; volta 1 com os A1, A3 e A4 da segurança: lista do permitido, `--sandbox`, `ssl-fp`, saída fora do repositório e `.gitignore`), segurança aprovada em 83bf09d6, base develop c7c3e09289f130c159a0d3584278be427e648b17.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff c7c3e09289f130c159a0d3584278be427e648b17 1a3d8dd11103`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/security/099-consultas-leitura.md`.

## Entregar
- "E3.3 (tech-lead): review e PR do comando; o merge é do dono." (E3.3) Nesta delegação, só o review.
- (E4) (E3.3) Review: o script segue os padrões dos outros scripts do projeto (`scripts/lib-pg.sh`, `scripts/coleta.sh`), as 31 consultas batem com as análises, o teste cobre as sondas da segurança, a documentação diz como rodar e o que conferir na saída, e o `.gitignore` só ganhou a linha da saída. Rodar só o teste do script e o shellcheck. Parecer `docs/reviews/099-consultas-leitura.md` (novo) pela ferramenta Write, com `pedido: 099-nenhuma-metrica-simulada`, `branch: chore/consultas-leitura-098-099`, `commit:` o sha40 de 1a3d8dd11103 e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/chore/consultas-leitura-098-099` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/099-consultas-leitura.md, scripts/consultas-leitura-098-099.sh, scripts/consultas-leitura-098-099.test.sh, scripts/sql/consultas-098-099/, docs/engineering/demo-dado-real.md, [.]gitignore (a lista inteira é o escopo da entrega revisada, para a conferência; o review só grava o parecer; o .gitignore vai em glob porque o forge-check corta o ponto inicial)

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/chore/consultas-leitura-098-099:docs/reviews/099-consultas-leitura.md` · espera: contém 'branch: chore/consultas-leitura-098-099'
