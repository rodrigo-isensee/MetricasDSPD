Agente destino: forge:devops-engineer
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: chore/consultas-leitura-098-099   Base: develop   Base-sha: c7c3e09289f130c159a0d3584278be427e648b17
Etapa: codigo   Cobre: E3.1

## Objetivo
Volta 2 do comando de consultas só de leitura (pedido 099, E3.1): o review aprovou sem bloqueante, com três recomendados que valem antes de o dono rodar. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `chore/consultas-leitura-098-099`, head 2b5590e7 (código 1a3d8dd1).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/reviews/099-consultas-leitura.md` (A1 a A3).

## Entregar
- "E3.1 (devops-engineer): um comando único para o dono rodar as consultas só de leitura dos pedidos 098 e 099 (PostgreSQL da demo e MySQL do Acelerato), que grava a saída num arquivo sem dado de pessoa, na branch chore/consultas-leitura-098-099, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." (E3.1) Nesta volta, o A1, o A2 e o A3 do review.
- (E4) (E3.1) A1: consulta MySQL sem nenhuma linha (o `mysql --batch` não imprime cabeçalho) tem de sair como "0 linhas" no arquivo, não como recusa nem rc 1; a recusa fica só para cabeçalho errado ou valor fora do tipo; teste com saída vazia. A2: a verificação de que a saída fica fora do repositório resolve links (`pwd -P` ou equivalente); teste com link. A3: levar para a branch, sem mudar o texto, as análises que as consultas citam (`docs/analises/099-revisao-campos.md`, `docs/analises/098-discovery.md`, `docs/analises/099-dado-real-operacional.md`, copiadas de `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/`), num commit só de documentação. Rodar só o teste do script e o shellcheck. Commits com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/chore/consultas-leitura-098-099` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Não rodar nada contra a base real nem abrir `.env*`.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: scripts/consultas-leitura-098-099.sh, scripts/consultas-leitura-098-099.test.sh, docs/analises/099-revisao-campos.md, docs/analises/098-discovery.md, docs/analises/099-dado-real-operacional.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até 749af62fc05a42ee5f0a667657ff31c416e676086299f5e2d58ea7a43964c79a (5 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030, ADR 0026, ADR 0028, ADR 0023
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): varredura E1 e proposta por item (E2) e da guarda (E3), sem ler a base real." · etapa de outra delegação; continua no pedido
- "E2.1 (react-frontend): L1, App.tsx sem o FonteComSimulado e testes de composição ajustados, na branch fix/099-l1-sem-simulador, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): L0, ADR 0030 que revoga a 0028, e o plano de dado real de cada cartão simulado do Operacional." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): review do L1." · etapa de outra delegação; continua no pedido
- "E2.4 (qa-engineer): QA do L1." · etapa de outra delegação; continua no pedido
- "E2.5 (tech-lead): PR do L1 para a develop; o merge é do dono. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 097; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido
- "E3.2 (security-engineer): parecer de segurança do comando (lê o .env e os bancos reais, só leitura)." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): review e PR do comando; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log -1 --format=%B origin/chore/consultas-leitura-098-099` · espera: contém 'Cartão: K-275'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
