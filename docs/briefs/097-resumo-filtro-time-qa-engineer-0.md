## Objetivo
QA do K-272: branch `fix/k272-ap-tipo-categoria`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, código em 59fd6ba9b36e029eb47750f04ff08a0232a119d1 (AP-TIPO e opções do filtro tipo do Apontamento agrupados pela categoria do contrato; o id da opção é o menor type_id da categoria; filtrar por qualquer type_id cobre todos os da categoria), base develop eac38a64b0b580d7c920f4b2b501287f7fb56599.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff eac38a64b0b580d7c920f4b2b501287f7fb56599 59fd6ba9b36e029eb47750f04ff08a0232a119d1`.

## Entregar
- "E6.3 (qa-engineer): QA do K-272." (E6.3)
- (E6) (E6.3) Rodar `server/tests/apontamento-rota.test.ts` com no máximo 2 workers (R-TETO); conferir: uma linha e uma opção por categoria; soma igual para `tipo=` de qualquer type_id da categoria; "Sem tipo" à parte e fora das opções; link antigo com `tipo=<dígitos>` continua válido; nenhum rótulo repetido. Uma mutação (voltar a agrupar por type_id) que o teste pega, restaurada antes do commit. Os testes `.pg` ficam com o CI. Grave `docs/qa/097-k272-ap-tipo.md` (novo) pela ferramenta Write, com `pedido: 097-resumo-filtro-time`, `branch: fix/k272-ap-tipo-categoria`, `commit: 59fd6ba9b36e029eb47750f04ff08a0232a119d1`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado (vazio se não houver). Commit só do parecer com `Cartão: K-272` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/fix/k272-ap-tipo-categoria` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) (E4) (E5) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/097-k272-ap-tipo.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/fix/k272-ap-tipo-categoria:docs/qa/097-k272-ap-tipo.md` · espera: contém 'commit: 59fd6ba9b36e029eb47750f04ff08a0232a119d1'
