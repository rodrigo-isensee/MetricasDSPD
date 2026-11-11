Agente destino: forge:devops-engineer
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: chore/consultas-leitura-098-099   Base: develop   Base-sha: c7c3e09289f130c159a0d3584278be427e648b17
Etapa: codigo   Cobre: E3.1

## Objetivo
O dono precisa rodar as consultas só de leitura que o arquiteto escreveu para os pedidos 098 e 099, e quer um comando único. Hoje elas estão espalhadas em três análises. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `chore/consultas-leitura-098-099` (a partir da develop c7c3e09289f130c159a0d3584278be427e648b17).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-revisao-campos.md` §3 (B1 a B6), `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/098-discovery.md` §1 (C-AC1 a C-AC5 e C-BM1 a C-BM5) e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-dado-real-operacional.md` (Q-RO-1 a Q-RO-11 e 6b).
- Na worktree: `scripts/lib-pg.sh`, `scripts/db.sh`, `scripts/coleta.sh` e `server/src/modulos/acelerato/cliente-mysql.ts` (como o projeto já fala com o PostgreSQL da demo e com o MySQL do Acelerato, lendo o `.env` sem imprimi-lo).

## Entregar
- "E3.1 (devops-engineer): um comando único para o dono rodar as consultas só de leitura dos pedidos 098 e 099 (PostgreSQL da demo e MySQL do Acelerato), que grava a saída num arquivo sem dado de pessoa, na branch chore/consultas-leitura-098-099, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." (E3.1)
- (E4) (E3.1) Um script `scripts/consultas-leitura-098-099.sh` (ou entrada `pnpm` equivalente) que o dono roda na demo dele: lê o `.env` do jeito que o projeto já lê (nada dele impresso), usa papéis e conexões só de leitura (no PostgreSQL, transação `READ ONLY`; no MySQL, só SELECT, com o usuário de leitura que a coleta já usa), roda as consultas na ordem das análises com o id de cada uma no cabeçalho, grava tudo em `consultas-098-099-<data>.txt` na pasta de onde foi chamado, e recusa ou corta qualquer coluna que não seja contagem, data ou nome de domínio (nunca nome, e-mail, `usuarioKey`, título ou descrição). As consultas ficam em arquivos `.sql` versionados em `scripts/sql/consultas-098-099/`, copiadas das análises sem mudar o sentido (ajuste de sintaxe vira nota). Teste que roda o script com bancos falsos ou só a montagem dos comandos, sem base real. Documentar em `docs/engineering/demo-dado-real.md` como rodar. Commit com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/chore/consultas-leitura-098-099` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Não rodar nada contra a base real nem abrir `.env*`.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: scripts/consultas-leitura-098-099.sh, scripts/consultas-leitura-098-099.test.sh, scripts/sql/consultas-098-099/, docs/engineering/demo-dado-real.md, package.json

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
