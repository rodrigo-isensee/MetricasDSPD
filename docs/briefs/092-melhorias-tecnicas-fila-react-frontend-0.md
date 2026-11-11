## Objetivo
K-268: o caso "o mock é criado uma só vez, pelo primeiro cartão simulável" de `web/src/features/coleta/simulado.test.tsx` (perto da linha 94) é intermitente: o `selo-simulado-O12` não aparece a tempo e o job `testes` cai (CI dos PRs 311 e 315), passando na rodada seguinte do mesmo commit. O caso foi trocado no lote 6b (O12 na visão semanal no lugar de BLOQUEADOS). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `fix/k268-simulado-intermitente` (a partir da develop d8d52103c20837fce3ece3d5bed5f6c68c88c8a2).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/web/src/features/coleta/simulado.test.tsx`, o caso citado e o ajudante `fonteApiComSimulado`.
- O componente que mostra o selo de simulado e a criação do mock (o caminho está nos imports do teste).

## Entregar
- "E6.1 (react-frontend): K-268, teste intermitente de simulado.test.tsx, na branch fix/k268-simulado-intermitente, worktree /home/rodrigoisensee/MetricasDSPD-052d." (E6.1)
- (E6) (E6.1) Achar por que o selo do O12 demora (ordem de carga dos cartões, criação assíncrona do mock, cartão fora da área visível) e fazer o teste esperar a condição certa (por exemplo o cartão do O12 sair do estado de carregando antes de procurar o selo), sem aumentar timeout, sem retry e sem afrouxar o que o caso prova (o mock nasce uma vez só, pelo primeiro cartão simulável). Prova: o arquivo 30 vezes seguidas com no máximo 2 workers (R-TETO), sem falha (sem rodar outra suíte junto, R-TETO). Só o arquivo de teste; se a causa for no componente, pare e relate. Commit com `Cartão: K-268` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/fix/k268-simulado-intermitente` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: web/src/features/coleta/simulado.test.tsx

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d log -1 --format=%B origin/fix/k268-simulado-intermitente` · espera: contém 'Cartão: K-268'
