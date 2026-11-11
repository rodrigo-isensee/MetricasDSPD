## Objetivo
QA do L1 do pedido 099 (desligar o simulador): branch `fix/099-l1-sem-simulador`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, código em dec8924c79b0ea678d889272f68237c1c3f8dc48 (`web/src/app/App.tsx` usa `HttpFonteMetricas` sem o `FonteComSimulado`; dois testes novos em `web/src/app/composicao.test.tsx`), base develop eac38a64b0b580d7c920f4b2b501287f7fb56599.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b diff eac38a64b0b580d7c920f4b2b501287f7fb56599 dec8924c79b0ea678d889272f68237c1c3f8dc48`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-varredura-simulado.md`, lote L1 e guardas G1 a G4.

## Entregar
- "E2.4 (qa-engineer): QA do L1." (E2.4)
- (E2) (E2.4) Rodar `web/src/app` com no máximo 2 workers (R-TETO); conferir que a fonte da web de uso diário é a HTTP pura, que um cartão sem dado real mostra "Sem dado real" com o motivo e nenhum selo "Simulado", e que o modo homologação (`VITE_FONTE` diferente de `api`) não mudou. Mutação: religar o `FonteComSimulado` no `App.tsx`; o teste da fonte HTTP pura tem de cair; restaurar antes do commit. Registrar no parecer que o teste do selo é guarda de regressão (passa nos dois casos em jsdom), e que a prova de navegador real fica com o E2E do CI. Grave `docs/qa/099-l1-sem-simulador.md` (novo) pela ferramenta Write, com `pedido: 099-nenhuma-metrica-simulada`, `branch: fix/099-l1-sem-simulador`, `commit: dec8924c79b0ea678d889272f68237c1c3f8dc48`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado (vazio se não houver). Commit só do parecer com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/fix/099-l1-sem-simulador` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/099-l1-sem-simulador.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b show origin/fix/099-l1-sem-simulador:docs/qa/099-l1-sem-simulador.md` · espera: contém 'commit: dec8924c79b0ea678d889272f68237c1c3f8dc48'
