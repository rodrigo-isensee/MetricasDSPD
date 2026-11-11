Agente destino: forge:qa-engineer
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: chore/consultas-leitura-098-099   Base: develop   Base-sha: c7c3e09289f130c159a0d3584278be427e648b17
Etapa: codigo   Cobre: E3.4

## Objetivo
QA do comando único de consultas só de leitura dos pedidos 098 e 099: branch `chore/consultas-leitura-098-099`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, head dcfa78f307c13cbb8c95a8c2ef3c2aebafad8139 (primeira versão aa8b6f20; volta 1 com a segurança; volta 2 com o review: "0 linhas" no MySQL vazio, `pwd -P`, análises versionadas), base develop c7c3e09289f130c159a0d3584278be427e648b17. Segurança (83bf09d6) e review (2b5590e7) aprovados nas rodadas anteriores.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff c7c3e09289f130c159a0d3584278be427e648b17 dcfa78f307c13cbb8c95a8c2ef3c2aebafad8139 --stat` e o diff do script e do teste.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/security/099-consultas-leitura.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/reviews/099-consultas-leitura.md`.

## Entregar
- "E3.4 (qa-engineer): QA do comando (classe N pelo gatilho do package.json)." (E3.4)
- (E4) (E3.4) Rodar o teste do script (`bash scripts/consultas-leitura-098-099.test.sh`) e o shellcheck; conferir com bancos falsos: recusa de SQL fora da lista do permitido (sondas S1 a S7), guarda de colunas (nada de pessoa no arquivo), "0 linhas" no MySQL vazio, saída fora do repositório (também por link), `.env` nunca impresso, rc certo em cada caso; a documentação de como rodar. Uma mutação (aceitar `SET` na lista do permitido) que o teste pega, restaurada antes do commit. Nada contra a base real nem `.env*`. Parecer `docs/qa/099-consultas-leitura.md` (novo) só pela ferramenta Write, com `pedido: 099-nenhuma-metrica-simulada`, `branch: chore/consultas-leitura-098-099`, `commit: dcfa78f307c13cbb8c95a8c2ef3c2aebafad8139`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado. Commit só do parecer com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/chore/consultas-leitura-098-099` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/099-consultas-leitura.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até 749af62fc05a42ee5f0a667657ff31c416e676086299f5e2d58ea7a43964c79a (5 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
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
- "E3.1 (devops-engineer): um comando único para o dono rodar as consultas só de leitura dos pedidos 098 e 099 (PostgreSQL da demo e MySQL do Acelerato), que grava a saída num arquivo sem dado de pessoa, na branch chore/consultas-leitura-098-099, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E3.2 (security-engineer): parecer de segurança do comando (lê o .env e os bancos reais, só leitura)." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): review e PR do comando; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/chore/consultas-leitura-098-099:docs/qa/099-consultas-leitura.md` · espera: contém 'commit: dcfa78f307c13cbb8c95a8c2ef3c2aebafad8139'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
