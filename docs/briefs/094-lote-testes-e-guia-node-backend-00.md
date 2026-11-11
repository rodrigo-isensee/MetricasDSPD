## Objetivo
K-267: o teste S6 de `server/tests/painel-real-f6.test.ts` (perto da linha 339) prova que as respostas de BLOQUEADOS, O1, O2, O5 e O19 não trazem dado de pessoa, por uma regex que não cobre "bloqueado por", "quem", "comentário" e "observação", que o modelo de ameaças do 075 cita. Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `fix/k267-regex-pessoa` (a partir da develop 18701297fd058a6cf420c6361c08a264871dfc87).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052f/server/tests/painel-real-f6.test.ts`, o caso S6 e a regex de pessoa.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/075-modelo-ameacas.md`, os campos de pessoa e de texto livre do bloqueio.

## Entregar
- "E3.1 (node-backend): K-267, na branch fix/k267-regex-pessoa, worktree /home/rodrigoisensee/MetricasDSPD-052f." (E3.1)
- (E3) (E3.1) Ampliar a regex do S6 para cobrir também "bloqueado por" (e variações sem acento e em inglês, como blocked_by), "quem", "comentário" e "observação" (com e sem acento), sem afrouxar o que já pega; provar que ela pega cada termo novo (caso que injeta o campo numa resposta simulada e espera a falha) e que as respostas reais de hoje continuam passando. Só o arquivo de teste; código de produção não muda (se o teste novo achar um vazamento real, pare e relate). Rodar o arquivo com no máximo 2 workers (R-TETO) e o `pnpm run pronto` da raiz da worktree. Commit com `Cartão: K-267` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/fix/k267-regex-pessoa` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) Nada a entregar aqui: não nesta delegação.
- arquivos: server/tests/painel-real-f6.test.ts

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f log -1 --format=%B origin/fix/k267-regex-pessoa` · espera: contém 'Cartão: K-267'
