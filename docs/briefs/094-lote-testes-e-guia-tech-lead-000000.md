## Objetivo
Review do K-267: branch `fix/k267-regex-pessoa`, worktree `/home/rodrigoisensee/MetricasDSPD-052f`, commit 9f4ecf99 (só `server/tests/painel-real-f6.test.ts`: regex de pessoa do S6 ampliada e caso novo S6b), base develop 18701297fd058a6cf420c6361c08a264871dfc87.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff 18701297fd058a6cf420c6361c08a264871dfc87 9f4ecf99`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/075-modelo-ameacas.md`, os campos de pessoa e de texto livre do bloqueio.

## Entregar
- "E3.2 (tech-lead): review do K-267." (E3.2)
- (E3) (E3.2) Review: a regex continua pegando o que pegava e passa a pegar "bloqueado por" (e variações), "quem", "comentário" e "observação"; o S6b prova cada termo novo e prova que as chaves legítimas das respostas não são pegas; nada de produção mudou. Rodar o arquivo com no máximo 2 workers (R-TETO). Parecer `docs/reviews/094-k267-regex-pessoa.md` (novo) pela ferramenta Write, com `pedido: 094-lote-testes-e-guia`, `branch: fix/k267-regex-pessoa`, `commit:` o sha40 de 9f4ecf99 e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-267` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/fix/k267-regex-pessoa` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/094-k267-regex-pessoa.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/fix/k267-regex-pessoa:docs/reviews/094-k267-regex-pessoa.md` · espera: contém 'branch: fix/k267-regex-pessoa'
