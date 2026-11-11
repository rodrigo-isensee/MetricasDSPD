## Objetivo
Review do K-268: branch `fix/k268-simulado-intermitente`, worktree `/home/rodrigoisensee/MetricasDSPD-052d`, commit 52aa703d (só `web/src/features/coleta/simulado.test.tsx`), base develop d8d52103c20837fce3ece3d5bed5f6c68c88c8a2. O caso "o mock é criado uma só vez" passa a esperar o cartão do O12 sair do carregando e procura o selo dentro dele; 30 de 30 execuções verdes pelo autor.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff d8d52103c20837fce3ece3d5bed5f6c68c88c8a2 52aa703d`.

## Entregar
- "E6.2 (tech-lead): review do K-268." (E6.2)
- (E6) (E6.2) Review: a espera é por condição (não timeout nem retry); o caso continua provando que o mock nasce uma vez só, pelo primeiro cartão simulável; nada de componente mudou. Rodar o arquivo com no máximo 2 workers (R-TETO). Parecer `docs/reviews/092-k268-simulado.md` (novo) pela ferramenta Write, com `pedido: 092-melhorias-tecnicas-fila`, `branch: fix/k268-simulado-intermitente`, `commit:` o sha40 de 52aa703d e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-268` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/fix/k268-simulado-intermitente` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/092-k268-simulado.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/fix/k268-simulado-intermitente:docs/reviews/092-k268-simulado.md` · espera: contém 'branch: fix/k268-simulado-intermitente'
