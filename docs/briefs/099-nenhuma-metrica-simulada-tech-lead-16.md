Agente destino: forge:tech-lead
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: fix/099-l2a-sem-opcao-simulado   Base: develop   Base-sha: 27ac9064fc4ffad4e7f3bf18241aa1979912c009
Etapa: codigo   Cobre: E2.9

## Objetivo
PR e merge do L2a do 099 (opção simulado fora de `useMetrica` e dos cartões) na develop: branch `fix/099-l2a-sem-opcao-simulado`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, código 78e5a2c180c45e37cec36054a815c5b9696879bb, QA aprovado (54f464fd) e review aprovado (190cd91b) nesse código. O dono autorizou às 17:51 o merge do time até a homolog; a main é só dele. O pedido de permissão do merge pode aparecer para aprovação humana: se for negado, pare e relate.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/qa/099-l2a-sem-opcao-simulado.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/reviews/099-l2a-sem-opcao-simulado.md`.

## Entregar
- "E2.9 (tech-lead): PR do L2a; o merge é do dono." (E2.9) Nesta delegação, o PR e o merge na develop, pela autorização do dono de 17:51 (merge até a homolog é do time).
- (E2) (E2.9) Rodar da worktree `forge-check pr 099-nenhuma-metrica-simulada --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref fix/099-l2a-sem-opcao-simulado --base develop` e confirmar `veredito: aprovado` (se não, pare e relate). Abrir o PR para a `develop` (squash) pelo gh, com o corpo escrito por Write num arquivo do scratchpad e `--body-file` (os dois pareceres, A1 e A2 recomendados do review, a linha `teto: excedido, 423 linhas, <motivo>` no formato canônico, `Cartão: K-275`). Esperar os checks em laços de até 170 s, relatando cada um. Antes do merge, conferir `mergeStateStatus`: se vier BEHIND, rodar `gh pr update-branch fix/099-l2a-sem-opcao-simulado`, conferir que o que entrou da develop não toca os arquivos de `web/src` do diff do L2a (se tocar, pare e relate) e esperar de novo os checks do head novo. Com todos verdes e CLEAN, mesclar pelo nome da branch, num comando sozinho, sem `$`, `;` nem `echo`: `gh pr merge fix/099-l2a-sem-opcao-simulado --squash --match-head-commit` seguido do sha completo do head, nunca `--admin`. Depois, confirmar o sha do merge na develop e esperar o CI da develop desse sha, dizendo no fim se ficou verde.
- (E1) (E3) (E4) Nada a entregar aqui: não nesta delegação.
- arquivos: nenhum

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até 967be5645c9bda0e509df2bf6ecb5085e03fbf1f3b49edd9968a74fa2952fa93 (6 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030, ADR 0026, ADR 0028, ADR 0023
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): varredura E1 e proposta por item (E2) e da guarda (E3), sem ler a base real." · etapa de outra delegação; continua no pedido
- "E2.1 (react-frontend): L1, App.tsx sem o FonteComSimulado e testes de composição ajustados, na branch fix/099-l1-sem-simulador, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): L0, ADR 0030 que revoga a 0028, e o plano de dado real de cada cartão simulado do Operacional." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): review do L1." · etapa de outra delegação; continua no pedido
- "E2.4 (qa-engineer): QA do L1." · etapa de outra delegação; continua no pedido
- "E2.5 (tech-lead): PR do L1 para a develop; o merge é do dono. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 097; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido
- "E2.6 (react-frontend): L2a, tirar a opção simulado de useMetrica e dos cartões, na branch fix/099-l2a-sem-opcao-simulado, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.7 (tech-lead): review do L2a." · etapa de outra delegação; continua no pedido
- "E2.8 (qa-engineer): QA do L2a." · etapa de outra delegação; continua no pedido
- "E3.1 (devops-engineer): um comando único para o dono rodar as consultas só de leitura dos pedidos 098 e 099 (PostgreSQL da demo e MySQL do Acelerato), que grava a saída num arquivo sem dado de pessoa, na branch chore/consultas-leitura-098-099, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E3.2 (security-engineer): parecer de segurança do comando (lê o .env e os bancos reais, só leitura)." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): review e PR do comando; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.4 (qa-engineer): QA do comando (classe N pelo gatilho do package.json)." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr view fix/099-l2a-sem-opcao-simulado --json state` · espera: contém 'MERGED'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
