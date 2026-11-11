Agente destino: forge:devops-engineer
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: chore/consultas-leitura-098-099   Base: develop   Base-sha: c7c3e09289f130c159a0d3584278be427e648b17
Etapa: codigo   Cobre: E3.1

## Objetivo
Volta 1 do comando de consultas só de leitura (pedido 099, E3.1): a segurança aprovou sem bloqueante, mas com três recomendados que valem antes de o dono rodar o comando na máquina dele com as credenciais reais. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `chore/consultas-leitura-098-099`, head 83bf09d6 (código aa8b6f20).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/security/099-consultas-leitura.md` (A1, A3, A4 e as sondas S1 a S7).

## Entregar
- "E3.1 (devops-engineer): um comando único para o dono rodar as consultas só de leitura dos pedidos 098 e 099 (PostgreSQL da demo e MySQL do Acelerato), que grava a saída num arquivo sem dado de pessoa, na branch chore/consultas-leitura-098-099, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." (E3.1) Nesta volta, o A1, o A3 e o A4 da segurança.
- (E4) (E3.1) A1: trocar a recusa por lista de palavras proibidas por uma lista do que é permitido (um único `SELECT` ou `WITH` por arquivo, sem `;` no meio, sem meta-comando do cliente `\`, sem `SET`, `DO`, `EXECUTE`, `system`, `\!`, `\gexec`), e rodar o cliente mysql com `--sandbox` (e o equivalente no psql, sem leitura de `.psqlrc` e sem meta-comandos); um teste por sonda S1 a S7 provando a recusa. A3: fixar o certificado do MySQL por `ssl-fp` com a impressão, usar `--defaults-file` no lugar de `--defaults-extra-file`, e documentar que a verificação nunca se desliga. A4: gravar a saída fora do repositório quando chamado de dentro dele (por exemplo na pasta pessoal do dono) e acrescentar `consultas-098-099-*.txt` ao `.gitignore`. Rodar só o teste do script e o shellcheck. Commit com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/chore/consultas-leitura-098-099` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Não rodar nada contra a base real nem abrir `.env*`.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: scripts/consultas-leitura-098-099.sh, scripts/consultas-leitura-098-099.test.sh, scripts/sql/consultas-098-099/, docs/engineering/demo-dado-real.md, .gitignore

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
