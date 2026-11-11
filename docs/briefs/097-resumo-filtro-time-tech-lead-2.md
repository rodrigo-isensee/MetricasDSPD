## Objetivo
Revalidação do review do K-272 depois da volta 1: branch `fix/k272-ap-tipo-categoria`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, código em 1d691f4e1a0d147f65d0041849395f2c0b593562 (id da categoria e type_id de `tipo=` vindos do histórico; testes do A1 e da linha "Sem tipo"), QA aprovado de novo em d7702b7b. O review anterior reprovou em d4f4037f (A1 bloqueante, A2 recomendado).

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff 59fd6ba9b36e029eb47750f04ff08a0232a119d1 1d691f4e1a0d147f65d0041849395f2c0b593562` (só o delta da volta).
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/reviews/097-k272-ap-tipo.md` (o seu parecer anterior).

## Entregar
- "E6.2 (tech-lead): review do K-272." (E6.2) Nesta delegação, a revalidação no head novo.
- (E6) (E6.2) Conferir que o A1 e o A2 estão resolvidos e que a leitura nova do histórico não traz coluna de pessoa, não mistura fontes e tem custo aceitável (consulta sem filtro de data: dizer se precisa de índice). Rodar o arquivo de teste com no máximo 2 workers (R-TETO). Regravar `docs/reviews/097-k272-ap-tipo.md` pela ferramenta Write com `commit: 1d691f4e1a0d147f65d0041849395f2c0b593562` e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-272` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/fix/k272-ap-tipo-categoria` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) (E4) (E5) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/097-k272-ap-tipo.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/fix/k272-ap-tipo-categoria:docs/reviews/097-k272-ap-tipo.md` · espera: contém 'commit: 1d691f4e1a0d147f65d0041849395f2c0b593562'
