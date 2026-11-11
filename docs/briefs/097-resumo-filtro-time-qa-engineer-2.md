## Objetivo
QA da volta 1 do K-272: branch `fix/k272-ap-tipo-categoria`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, código em 1d691f4e1a0d147f65d0041849395f2c0b593562 (o id da categoria e o conjunto de type_id de `tipo=` vêm do histórico, não da janela; dois testes novos), sobre o parecer anterior em ac47260b (código 59fd6ba9).

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff 59fd6ba9b36e029eb47750f04ff08a0232a119d1 1d691f4e1a0d147f65d0041849395f2c0b593562`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/reviews/097-k272-ap-tipo.md` (o A1 e o A2) e o parecer anterior `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/097-k272-ap-tipo.md`.

## Entregar
- "E6.3 (qa-engineer): QA do K-272." (E6.3) Nesta delegação, a revalidação no head novo.
- (E6) (E6.3) Rodar `server/tests/apontamento-rota.test.ts` com no máximo 2 workers (R-TETO); conferir o caso do A1 (janela sem o menor type_id, link com o menor type_id, a categoria não zera) e a linha "Sem tipo" em `porTipo`; a leitura nova do histórico não traz coluna de pessoa nem mistura fontes. Mutação: voltar a calcular o id pelas linhas da janela; o teste novo tem de cair; restaurar antes do commit. Os `.pg` ficam com o CI. Regravar `docs/qa/097-k272-ap-tipo.md` pela ferramenta Write com `commit: 1d691f4e1a0d147f65d0041849395f2c0b593562`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado. Commit só do parecer com `Cartão: K-272` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/fix/k272-ap-tipo-categoria` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) (E4) (E5) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/097-k272-ap-tipo.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/fix/k272-ap-tipo-categoria:docs/qa/097-k272-ap-tipo.md` · espera: contém 'commit: 1d691f4e1a0d147f65d0041849395f2c0b593562'
