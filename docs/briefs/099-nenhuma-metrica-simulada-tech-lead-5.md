Agente destino: forge:tech-lead
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: fix/099-l1-sem-simulador   Base: develop   Base-sha: f4c122f15c05fbf5fea86797c9c348656d11ab36
Etapa: codigo   Cobre: E2.3

## Objetivo
Revalidação do review do L1 do pedido 099: branch `fix/099-l1-sem-simulador`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, head local b7d0e684 (código dec8924c; o seu parecer de review saiu em 846267f1 junto com as ADRs 0028 e 0030, o que a regra QA-TESTE-E-PARECER-SEPARADOS recusa; depois entraram as duas análises em a116a9d8 e o merge limpo da develop em b7d0e684). DECISÃO TÉCNICA (Jarvis): as análises e as ADRs ficam nesta branch.

## Ler
- A saída do `forge-check parecer delta` do seu parecer, rodado na worktree, e a do `forge-check pr 099-nenhuma-metrica-simulada --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref fix/099-l1-sem-simulador --base develop`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/reviews/099-l1-sem-simulador.md` (o seu parecer).

## Entregar
- "E2.3 (tech-lead): review do L1." (E2.3) Nesta delegação, a revalidação no head b7d0e684.
- (E2) (E2.3) Revalidar o review sobre o delta (análises e ADRs; o código não mudou) e regravar `docs/reviews/099-l1-sem-simulador.md` só pela ferramenta Write com `commit: b7d0e684` em sha40 e o veredito, num commit só do parecer com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito). Sem push e sem PR nesta delegação (o QA revalida em seguida na mesma branch).
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/099-l1-sem-simulador.md, docs/architecture/adr/0028-simulado-por-cartao.md, docs/architecture/adr/0030-sem-simulado-na-web.md, docs/analises/099-varredura-simulado.md, docs/analises/099-dado-real-operacional.md, web/src/app/

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até 749af62fc05a42ee5f0a667657ff31c416e676086299f5e2d58ea7a43964c79a (5 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030, ADR 0026, ADR 0028, ADR 0023
- aplicáveis a E2.3 (copiadas literalmente):
- - 2026-11-11 14:05: DECISÃO DO DONO (literal): "pode desligaro  simulador". Libera o L1 (tirar o FonteComSimulado do App.tsx; os cartões sem dado real mostram "Sem dado real" até o plano de dado real chegar a cada um). Q-099-3 (remover o código do simulador ou só desligar) segue aberta: a decisão literal é desligar, e a remoção (L2a a L3) espera a resposta. DECISÃO TÉCNICA (Jarvis): o L1 começa já na worktree 041b, branch fix/099-l1-sem-simulador, a partir da develop eac38a64; a ADR 0030 (L0, revoga a 0028, cujo critério de reversão o dono acionou) corre em paralelo pelo arquiteto e entra no mesmo PR.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): varredura E1 e proposta por item (E2) e da guarda (E3), sem ler a base real." · etapa de outra delegação; continua no pedido
- "E2.1 (react-frontend): L1, App.tsx sem o FonteComSimulado e testes de composição ajustados, na branch fix/099-l1-sem-simulador, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): L0, ADR 0030 que revoga a 0028, e o plano de dado real de cada cartão simulado do Operacional." · etapa de outra delegação; continua no pedido
- "E2.4 (qa-engineer): QA do L1." · etapa de outra delegação; continua no pedido
- "E2.5 (tech-lead): PR do L1 para a develop; o merge é do dono. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 097; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b log -1 --format=%B` · espera: contém 'Cartão: K-275'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
