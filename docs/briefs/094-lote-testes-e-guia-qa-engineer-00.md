## Objetivo
QA do K-267: branch `fix/k267-regex-pessoa`, worktree `/home/rodrigoisensee/MetricasDSPD-052f`, código em 914480843f9988b10bdceb18d38fac248f6839a5 (regex de pessoa do S6 ampliada, "quem" por palavra inteira, user_id e motivo_texto; caso S6b), review aprovado (b653e6d4), base develop 18701297fd058a6cf420c6361c08a264871dfc87.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff 18701297fd058a6cf420c6361c08a264871dfc87 914480843f9988b10bdceb18d38fac248f6839a5`.
- `/home/rodrigoisensee/MetricasDSPD-052f/docs/reviews/094-k267-regex-pessoa.md` (novo).

## Entregar
- "E3.3 (qa-engineer): QA do K-267." (E3.3)
- (E3) (E3.3) Rodar o arquivo com no máximo 2 workers (R-TETO); conferir que o S6 sobre as respostas reais segue verde e que o S6b pega cada termo; uma mutação (tirar um termo novo da regex, por exemplo `user[ _-]?id`) que o S6b pega, restaurada antes do commit. Grave `docs/qa/094-k267-regex-pessoa.md` (novo) pela ferramenta Write, com `pedido: 094-lote-testes-e-guia`, `branch: fix/k267-regex-pessoa`, `commit: 914480843f9988b10bdceb18d38fac248f6839a5`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado (vazio se não houver). Commit só do parecer com `Cartão: K-267` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/fix/k267-regex-pessoa` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/094-k267-regex-pessoa.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/fix/k267-regex-pessoa:docs/qa/094-k267-regex-pessoa.md` · espera: contém 'commit: 914480843f9988b10bdceb18d38fac248f6839a5'
