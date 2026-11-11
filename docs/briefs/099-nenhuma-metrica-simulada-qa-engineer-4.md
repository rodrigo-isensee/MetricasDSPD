## Objetivo
QA do comando único de consultas só de leitura dos pedidos 098 e 099: branch `chore/consultas-leitura-098-099`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, head dcfa78f307c13cbb8c95a8c2ef3c2aebafad8139 (primeira versão aa8b6f20; volta 1 com a segurança; volta 2 com o review: "0 linhas" no MySQL vazio, `pwd -P`, análises versionadas), base develop c7c3e09289f130c159a0d3584278be427e648b17. Segurança (83bf09d6) e review (2b5590e7) aprovados nas rodadas anteriores.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff c7c3e09289f130c159a0d3584278be427e648b17 dcfa78f307c13cbb8c95a8c2ef3c2aebafad8139 --stat` e o diff do script e do teste.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/security/099-consultas-leitura.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/reviews/099-consultas-leitura.md`.

## Entregar
- "E3.4 (qa-engineer): QA do comando (classe N pelo gatilho do package.json)." (E3.4)
- (E4) (E3.4) Rodar o teste do script (`bash scripts/consultas-leitura-098-099.test.sh`) e o shellcheck; conferir com bancos falsos: recusa de SQL fora da lista do permitido (sondas S1 a S7), guarda de colunas (nada de pessoa no arquivo), "0 linhas" no MySQL vazio, saída fora do repositório (também por link), `.env` nunca impresso, rc certo em cada caso; a documentação de como rodar. Uma mutação (aceitar `SET` na lista do permitido) que o teste pega, restaurada antes do commit. Nada contra a base real nem `.env*`. Parecer `docs/qa/099-consultas-leitura.md` (novo) só pela ferramenta Write, com `pedido: 099-nenhuma-metrica-simulada`, `branch: chore/consultas-leitura-098-099`, `commit: dcfa78f307c13cbb8c95a8c2ef3c2aebafad8139`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado. Commit só do parecer com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/chore/consultas-leitura-098-099` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/099-consultas-leitura.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/chore/consultas-leitura-098-099:docs/qa/099-consultas-leitura.md` · espera: contém 'commit: dcfa78f307c13cbb8c95a8c2ef3c2aebafad8139'
