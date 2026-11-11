## Objetivo
Revalidação do review do K-267 depois da volta: o review aa4f287d aprovou 9f4ecf99 com A1 e A2 recomendados; a volta 91448084 (só `server/tests/painel-real-f6.test.ts`) tratou os dois. Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `fix/k267-regex-pessoa` (ponta 91448084).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff aa4f287d 91448084`.
- `/home/rodrigoisensee/MetricasDSPD-052f/docs/reviews/094-k267-regex-pessoa.md` (novo), achados A1 e A2.

## Entregar
- "E3.2 (tech-lead): review do K-267." (E3.2) Nesta volta, só o que mudou desde o parecer.
- (E3) (E3.2) Conferir que A1 (quem por palavra inteira; "esquema" passa) e A2 (user_id, userId e motivo_texto pegos) estão resolvidos, sem afrouxar o que a regex já pegava e com o S6 real verde; rodar o arquivo com no máximo 2 workers (R-TETO). Regravar `docs/reviews/094-k267-regex-pessoa.md` inteiro pela ferramenta Write, com `commit: 914480843f9988b10bdceb18d38fac248f6839a5`, o veredito e os achados atualizados (linhas de até 300 caracteres). Commit só do parecer com `Cartão: K-267` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/fix/k267-regex-pessoa` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/094-k267-regex-pessoa.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/fix/k267-regex-pessoa:docs/reviews/094-k267-regex-pessoa.md` · espera: contém 'commit: 91448084'
