## Objetivo
QA do K-268: branch `fix/k268-simulado-intermitente`, worktree `/home/rodrigoisensee/MetricasDSPD-052d`, código em 52aa703de382c0e3e3eb55175ce2536b1f7991e2 (só `web/src/features/coleta/simulado.test.tsx`), review aprovado (41ce5e3d), base develop d8d52103c20837fce3ece3d5bed5f6c68c88c8a2.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff d8d52103c20837fce3ece3d5bed5f6c68c88c8a2 52aa703de382c0e3e3eb55175ce2536b1f7991e2`.
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/reviews/092-k268-simulado.md` (novo).

## Entregar
- "E6.3 (qa-engineer): QA do K-268." (E6.3)
- (E6) (E6.3) Rodar o arquivo 20 vezes seguidas com no máximo 2 workers (R-TETO, sem outra suíte junto) e registrar quantas passaram; uma mutação (fazer o mock nascer duas vezes ou tirar a espera do cartão do O12) que o caso pega, restaurada antes do commit. Grave `docs/qa/092-k268-simulado.md` (novo) pela ferramenta Write, com `pedido: 092-melhorias-tecnicas-fila`, `branch: fix/k268-simulado-intermitente`, `commit: 52aa703de382c0e3e3eb55175ce2536b1f7991e2`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado (vazio se não houver). Commit só do parecer com `Cartão: K-268` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/fix/k268-simulado-intermitente` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/092-k268-simulado.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/fix/k268-simulado-intermitente:docs/qa/092-k268-simulado.md` · espera: contém 'commit: 52aa703de382c0e3e3eb55175ce2536b1f7991e2'
