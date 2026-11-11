Agente destino: forge:tech-lead
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: fix/099-l1-sem-simulador   Base: develop   Base-sha: f4c122f15c05fbf5fea86797c9c348656d11ab36
Etapa: codigo   Cobre: E2.5

## Objetivo
PR do L1 do pedido 099 (desligar o simulador) para a develop: branch `fix/099-l1-sem-simulador`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, head local 9cf5cb96 (código dec8924c; análises e ADRs na branch; merge limpo da develop em b7d0e684, entrega conferida às 15:11; QA revalidado em a03dc1b3 e review revalidado em 9cf5cb96, ambos aprovados). Nada enviado ainda.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/reviews/099-l1-sem-simulador.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/qa/099-l1-sem-simulador.md`.

## Entregar
- "E2.5 (tech-lead): PR do L1 para a develop; o merge é do dono." (E2.5)
- (E2) (E2.5) Rodar da worktree `forge-check pr 099-nenhuma-metrica-simulada --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref fix/099-l1-sem-simulador --base develop` e confirmar `veredito: aprovado` (se não, pare e relate). Enviar com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/fix/099-l1-sem-simulador` (`github.com` em allowed_domains). Abrir o PR para a `develop` (squash) pelo gh, com corpo curto: o que muda para o dono (nenhum número simulado na web; cartões sem dado real mostram "Sem dado real"), a ADR 0030, os pareceres, o A1 recomendado e `Cartão: K-275`. Se o hook recusar, pare e relate a mensagem literal. Esperar os checks e relatar cada um. Não mesclar: o merge é do dono.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: nenhum

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até 749af62fc05a42ee5f0a667657ff31c416e676086299f5e2d58ea7a43964c79a (5 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030, ADR 0026, ADR 0028, ADR 0023
- aplicáveis a E2.5 (copiadas literalmente):
- - 2026-11-11 14:05: DECISÃO DO DONO (literal): "pode desligaro  simulador". Libera o L1 (tirar o FonteComSimulado do App.tsx; os cartões sem dado real mostram "Sem dado real" até o plano de dado real chegar a cada um). Q-099-3 (remover o código do simulador ou só desligar) segue aberta: a decisão literal é desligar, e a remoção (L2a a L3) espera a resposta. DECISÃO TÉCNICA (Jarvis): o L1 começa já na worktree 041b, branch fix/099-l1-sem-simulador, a partir da develop eac38a64; a ADR 0030 (L0, revoga a 0028, cujo critério de reversão o dono acionou) corre em paralelo pelo arquiteto e entra no mesmo PR.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

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
