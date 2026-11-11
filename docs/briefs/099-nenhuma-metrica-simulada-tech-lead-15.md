Agente destino: forge:tech-lead
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: chore/consultas-leitura-098-099   Base: develop   Base-sha: c7c3e09289f130c159a0d3584278be427e648b17
Etapa: codigo   Cobre: E3.3

## Objetivo
Merge do PR 329 (comando único de consultas só de leitura, 098 e 099) na develop. O PR estava atrás da develop; a branch `chore/consultas-leitura-098-099` foi atualizada pelo GitHub e o head novo é 1549e65de4d765dc7c06dee76b78e2a2fdea0cf9 (merge da develop, só documentação da release 100, sem mudança em scripts/, server/ ou web/ desde d0d0c48e, onde segurança, review e QA aprovaram). A CI desse head está rodando. O dono autorizou às 17:51 o merge do time até a homolog; a main é só dele. O pedido de permissão do merge pode aparecer para aprovação humana: se for negado, pare e relate.

## Ler
- O PR 329 pelo gh (estado, `mergeStateStatus`, checks e head).

## Entregar
- "E3.3 (tech-lead): review e PR do comando; o merge é do dono." (E3.3) Nesta delegação, o merge do PR 329 na develop, pela autorização do dono de 17:51 (merge até a homolog é do time).
- (E4) (E3.3) Esperar em laços de até 170 s, relatando cada um, até todos os checks do head 1549e65d terminarem. Confirmar head 1549e65de4d765dc7c06dee76b78e2a2fdea0cf9, todos verdes e `mergeStateStatus` CLEAN (BEHIND, outro head ou check reprovado: pare e relate). Rodar da worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041` o `forge-check pr 099-nenhuma-metrica-simulada --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref chore/consultas-leitura-098-099 --base develop` e confirmar `veredito: aprovado`. Mesclar pelo nome da branch, num comando sozinho, sem `$`, `;` nem `echo`: `gh pr merge chore/consultas-leitura-098-099 --squash --match-head-commit 1549e65de4d765dc7c06dee76b78e2a2fdea0cf9`, nunca `--admin`. Depois, confirmar o sha do merge na develop e esperar o CI da develop desse sha em laços de até 170 s, dizendo no fim se ficou verde.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.
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
- "E2.9 (tech-lead): PR do L2a; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.1 (devops-engineer): um comando único para o dono rodar as consultas só de leitura dos pedidos 098 e 099 (PostgreSQL da demo e MySQL do Acelerato), que grava a saída num arquivo sem dado de pessoa, na branch chore/consultas-leitura-098-099, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E3.2 (security-engineer): parecer de segurança do comando (lê o .env e os bancos reais, só leitura)." · etapa de outra delegação; continua no pedido
- "E3.4 (qa-engineer): QA do comando (classe N pelo gatilho do package.json)." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr view chore/consultas-leitura-098-099 --json state` · espera: contém 'MERGED'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
