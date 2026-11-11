## Objetivo
Volta do K-267 pelos achados do review (aa4f287d, aprovado): A1, "quem" também casa dentro de "esquema" (falso positivo); A2, a regex de pessoa do S6 não pega `user_id`/`userId` (T2 do modelo de ameaças do 075) nem `motivo_texto` (T3). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `fix/k267-regex-pessoa` (ponta aa4f287d).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052f/docs/reviews/094-k267-regex-pessoa.md` (novo), achados A1 e A2.
- `/home/rodrigoisensee/MetricasDSPD-052f/server/tests/painel-real-f6.test.ts`, a regex de pessoa e os casos S6 e S6b.

## Entregar
- "E3.1 (node-backend): K-267, na branch fix/k267-regex-pessoa, worktree /home/rodrigoisensee/MetricasDSPD-052f." (E3.1) Nesta volta, os achados A1 e A2 do review.
- (E3) (E3.1) A1: "quem" só como palavra inteira (não dentro de "esquema" nem de outra palavra), com caso no S6b que prova que "esquema" passa e "quem" é pego. A2: a regex passa a pegar também `user_id`, `userId` e `motivo_texto` (e variações de separador), com caso no S6b para cada um; as chaves legítimas das respostas continuam passando e o S6 real segue verde. Só o arquivo de teste; produção não muda (se o S6 real achar vazamento, pare e relate). Rodar o arquivo com no máximo 2 workers (R-TETO). Commit com `Cartão: K-267` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/fix/k267-regex-pessoa` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) Nada a entregar aqui: não nesta delegação.
- arquivos: server/tests/painel-real-f6.test.ts

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f log -1 --format=%B origin/fix/k267-regex-pessoa` · espera: contém 'Cartão: K-267'
