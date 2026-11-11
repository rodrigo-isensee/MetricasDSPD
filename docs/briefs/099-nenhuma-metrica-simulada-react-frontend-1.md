Agente destino: forge:react-frontend
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: fix/099-l1-sem-simulador   Base: develop   Base-sha: eac38a64b0b580d7c920f4b2b501287f7fb56599
Etapa: codigo   Cobre: E2.1

## Objetivo
O dono mandou desligar o simulador ("pode desligaro  simulador"): nenhum número inventado na web de uso diário. A origem é o `FonteComSimulado` ligado em `web/src/app/App.tsx:41-42`. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, branch `fix/099-l1-sem-simulador` (a partir da develop eac38a64b0b580d7c920f4b2b501287f7fb56599).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-varredura-simulado.md`, a origem (início) e o lote L1.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/web/src/app/App.tsx` e os testes de composição citados no L1.

## Entregar
- "E2.1 (react-frontend): L1, App.tsx sem o FonteComSimulado e testes de composição ajustados, na branch fix/099-l1-sem-simulador, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." (E2.1)
- (E2) (E2.1) A web de uso diário passa a usar `HttpFonteMetricas` sem o `FonteComSimulado`; o cartão sem dado real mostra o estado "Sem dado real" com o motivo, que já existe; ajustar os testes de composição (`app/composicao.test.tsx`, `app/app.test.tsx`) e acrescentar um que prova que, sem dado real, nenhum cartão mostra o selo "Simulado". Não remover o código do simulador nem a opção `simulado` dos cartões (é outra decisão do dono, Q-099-3), não mudar a API nem o modo homologação. Rodar `pnpm run pronto` da raiz da worktree. Commits com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/fix/099-l1-sem-simulador` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: web/src/app/

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até 7a86a43ba9d7d53effd2ef60345ebd4c7b88ae32d9cbeddda7b9dfb0a934f689 (3 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030, ADR 0026, ADR 0028
- aplicáveis a E2.1 (copiadas literalmente):
- - 2026-11-11 14:05: DECISÃO DO DONO (literal): "pode desligaro  simulador". Libera o L1 (tirar o FonteComSimulado do App.tsx; os cartões sem dado real mostram "Sem dado real" até o plano de dado real chegar a cada um). Q-099-3 (remover o código do simulador ou só desligar) segue aberta: a decisão literal é desligar, e a remoção (L2a a L3) espera a resposta. DECISÃO TÉCNICA (Jarvis): o L1 começa já na worktree 041b, branch fix/099-l1-sem-simulador, a partir da develop eac38a64; a ADR 0030 (L0, revoga a 0028, cujo critério de reversão o dono acionou) corre em paralelo pelo arquiteto e entra no mesmo PR.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): varredura E1 e proposta por item (E2) e da guarda (E3), sem ler a base real." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): L0, ADR 0030 que revoga a 0028, e o plano de dado real de cada cartão simulado do Operacional." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): review do L1." · etapa de outra delegação; continua no pedido
- "E2.4 (qa-engineer): QA do L1." · etapa de outra delegação; continua no pedido
- "E2.5 (tech-lead): PR do L1 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b log -1 --format=%B origin/fix/099-l1-sem-simulador` · espera: contém 'Cartão: K-275'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
