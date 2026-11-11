## Objetivo
PR do L1 do pedido 099 (desligar o simulador) para a develop: branch `fix/099-l1-sem-simulador`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, head 846267f1 (código dec8924c; QA aprovado em 93309e3a; review aprovado em 846267f1, com a ADR 0030 e o `Estado:` da 0028). A develop andou (a ponta de `origin/develop` tem os PRs 316 a 320).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/reviews/099-l1-sem-simulador.md` (A1 e A2) e `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/qa/099-l1-sem-simulador.md`.

## Entregar
- "E2.5 (tech-lead): PR do L1 para a develop; o merge é do dono." (E2.5)
- (E2) (E2.5) A2 do review: levar para a branch, sem mudar o texto, as duas análises que a ADR 0030 cita (`docs/analises/099-varredura-simulado.md` e `docs/analises/099-dado-real-operacional.md`, do repositório principal `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/`), num commit só de documentação com `Cartão: K-275`. Atualizar a branch com a develop só por merge (sem rebase nem force). Rodar da worktree `forge-check pr 099-nenhuma-metrica-simulada --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD`; se a pendência for só parecer desatualizado por arquivo que veio da base, ou a conferência de entrega do head novo, pare e relate com a saída. Sem pendência, enviar com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/fix/099-l1-sem-simulador` (`github.com` em allowed_domains) e abrir o PR para a `develop` (squash) pelo gh, com corpo curto (o que muda para o dono: nenhum número simulado na web; os cartões sem dado real mostram "Sem dado real"; os pareceres; a ADR 0030; `Cartão: K-275`). Esperar os checks e relatar cada um. Não mesclar: o merge é do dono.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/analises/099-varredura-simulado.md, docs/analises/099-dado-real-operacional.md, web/src/app/, docs/reviews/099-l1-sem-simulador.md

## Pronto quando
- PQ-1 (cmd): `gh pr list --head fix/099-l1-sem-simulador --state all --json number` · espera: contém 'number'
