Agente destino: forge:tech-lead
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: fix/099-l1-sem-simulador   Base: develop   Base-sha: eac38a64b0b580d7c920f4b2b501287f7fb56599
Etapa: codigo   Cobre: E2.5

## Objetivo
PR do L1 do pedido 099 (desligar o simulador) para a develop: branch `fix/099-l1-sem-simulador`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, head 846267f1 (código dec8924c; QA aprovado em 93309e3a; review aprovado em 846267f1, com a ADR 0030 e o `Estado:` da 0028). A develop andou (a ponta de `origin/develop` tem os PRs 316 a 320).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/reviews/099-l1-sem-simulador.md` (A1 e A2) e `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/qa/099-l1-sem-simulador.md`.

## Entregar
- "E2.5 (tech-lead): PR do L1 para a develop; o merge é do dono." (E2.5)
- (E2) (E2.5) A2 do review: levar para a branch, sem mudar o texto, as duas análises que a ADR 0030 cita (`docs/analises/099-varredura-simulado.md` e `docs/analises/099-dado-real-operacional.md`, do repositório principal `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/`), num commit só de documentação com `Cartão: K-275`. Atualizar a branch com a develop só por merge (sem rebase nem force). Rodar da worktree `forge-check pr 099-nenhuma-metrica-simulada --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD`; se a pendência for só parecer desatualizado por arquivo que veio da base, ou a conferência de entrega do head novo, pare e relate com a saída. Sem pendência, enviar com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/fix/099-l1-sem-simulador` (`github.com` em allowed_domains) e abrir o PR para a `develop` (squash) pelo gh, com corpo curto (o que muda para o dono: nenhum número simulado na web; os cartões sem dado real mostram "Sem dado real"; os pareceres; a ADR 0030; `Cartão: K-275`). Esperar os checks e relatar cada um. Não mesclar: o merge é do dono.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/analises/099-varredura-simulado.md, docs/analises/099-dado-real-operacional.md, web/src/app/, docs/reviews/099-l1-sem-simulador.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até 125ff73356dbd97a31ffa0e5cef650a070a5ba52949550d675466b84b2a4d243 (4 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030, ADR 0026, ADR 0028, ADR 0023
- aplicáveis a E2.5 (copiadas literalmente):
- - 2026-11-11 14:05: DECISÃO DO DONO (literal): "pode desligaro  simulador". Libera o L1 (tirar o FonteComSimulado do App.tsx; os cartões sem dado real mostram "Sem dado real" até o plano de dado real chegar a cada um). Q-099-3 (remover o código do simulador ou só desligar) segue aberta: a decisão literal é desligar, e a remoção (L2a a L3) espera a resposta. DECISÃO TÉCNICA (Jarvis): o L1 começa já na worktree 041b, branch fix/099-l1-sem-simulador, a partir da develop eac38a64; a ADR 0030 (L0, revoga a 0028, cujo critério de reversão o dono acionou) corre em paralelo pelo arquiteto e entra no mesmo PR.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): varredura E1 e proposta por item (E2) e da guarda (E3), sem ler a base real." · etapa de outra delegação; continua no pedido
- "E2.1 (react-frontend): L1, App.tsx sem o FonteComSimulado e testes de composição ajustados, na branch fix/099-l1-sem-simulador, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): L0, ADR 0030 que revoga a 0028, e o plano de dado real de cada cartão simulado do Operacional." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): review do L1." · etapa de outra delegação; continua no pedido
- "E2.4 (qa-engineer): QA do L1." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --head fix/099-l1-sem-simulador --state all --json number` · espera: contém 'number'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
