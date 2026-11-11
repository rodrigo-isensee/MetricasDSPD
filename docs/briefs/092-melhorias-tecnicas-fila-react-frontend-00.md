## Objetivo
Continuação do K-268 na worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `fix/k268-simulado-intermitente` (a partir da develop d8d52103c20837fce3ece3d5bed5f6c68c88c8a2). A primeira rodada deixou, sem commit, uma mudança em `web/src/features/coleta/simulado.test.tsx`: o caso "o mock é criado uma só vez" espera o cartão do O12 sair do carregando antes de procurar o selo. Na prova de 30 execuções houve 1 falha em 30, sem saber em qual caso.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff` (a mudança já feita).
- `/home/rodrigoisensee/MetricasDSPD-052d/web/src/features/coleta/simulado.test.tsx` (inteiro).

## Entregar
- "E6.1 (react-frontend): K-268, teste intermitente de simulado.test.tsx, na branch fix/k268-simulado-intermitente, worktree /home/rodrigoisensee/MetricasDSPD-052d." (E6.1) Nesta volta, achar e tratar a falha que sobrou.
- (E6) (E6.1) Rodar o arquivo em laço até reproduzir a falha restante, guardando o nome do caso e a mensagem; tratar a causa do mesmo jeito (esperar a condição certa, sem aumentar timeout, sem retry e sem afrouxar o que o caso prova). Prova final: 30 execuções seguidas do arquivo com no máximo 2 workers, sem falha (sem rodar outra suíte junto, R-TETO). Só o arquivo de teste; se a causa for no componente, pare e relate com o caso e a mensagem. Commit com `Cartão: K-268` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/fix/k268-simulado-intermitente` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: web/src/features/coleta/simulado.test.tsx

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d log -1 --format=%B origin/fix/k268-simulado-intermitente` · espera: contém 'Cartão: K-268'
