## Objetivo
Review do K-272: branch `fix/k272-ap-tipo-categoria`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, código em 59fd6ba9b36e029eb47750f04ff08a0232a119d1 (AP-TIPO e opções do filtro tipo do Apontamento agrupados pela categoria do contrato; id da opção = menor type_id; contrato igual), QA aprovado em ac47260b, base develop eac38a64b0b580d7c920f4b2b501287f7fb56599.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff eac38a64b0b580d7c920f4b2b501287f7fb56599 59fd6ba9b36e029eb47750f04ff08a0232a119d1`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/097-k272-ap-tipo.md`.

## Entregar
- "E6.2 (tech-lead): review do K-272." (E6.2)
- (E6) (E6.2) Review: agrupamento pela categoria sem misturar fontes; a escolha do menor type_id como id é estável quando um type_id novo entra na categoria (link guardado continua valendo); "Sem tipo" fora das opções e a mudança de comportamento declarada; nada que vire comparação entre pessoas. Rodar o arquivo de teste com no máximo 2 workers (R-TETO). Parecer `docs/reviews/097-k272-ap-tipo.md` (novo) pela ferramenta Write, com `pedido: 097-resumo-filtro-time`, `branch: fix/k272-ap-tipo-categoria`, `commit: 59fd6ba9b36e029eb47750f04ff08a0232a119d1` e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-272` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/fix/k272-ap-tipo-categoria` (`github.com` em allowed_domains); commit e push em chamadas separadas. Sem PR nesta delegação.
- (E1) (E2) (E3) (E4) (E5) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/097-k272-ap-tipo.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/fix/k272-ap-tipo-categoria:docs/reviews/097-k272-ap-tipo.md` · espera: contém 'branch: fix/k272-ap-tipo-categoria'
