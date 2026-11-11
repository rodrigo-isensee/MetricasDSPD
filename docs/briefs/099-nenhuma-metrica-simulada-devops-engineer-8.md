Agente destino: forge:devops-engineer
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: fix/k277-consultas-escape   Base: develop   Base-sha: 167f3a13f75e0de392397da1a9d0cab367122a24
Etapa: codigo   Cobre: E3.5

## Objetivo
K-277 do pedido 099: o comando único de consultas só de leitura (`pnpm run consultas:098-099`, já na develop pelo PR 329) tem uma lista de palavras proibidas que pode ser contornada por escape; o A5 da segurança pede recusar `U&`, `UESCAPE` e os prefixos `pg_` e `lo_`. Worktree `/home/rodrigoisensee/MetricasDSPD-052g` (hoje na branch do L4 do 097, já mesclada); branch nova `fix/k277-consultas-escape` a partir da `origin/develop` 167f3a13f75e0de392397da1a9d0cab367122a24.

## Ler
- O parecer de segurança do comando, `docs/security/099-consultas-leitura.md` em `origin/develop` (A5 e as sondas S8 a S12): leia com `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/develop:docs/security/099-consultas-leitura.md`.

## Entregar
- "E3.5 (devops-engineer): K-277, o comando de consultas de leitura recusa U&, UESCAPE e os prefixos pg_ e lo_ na lista de palavras (A5 da segurança), na branch fix/k277-consultas-escape a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-052g." (E3.5)
- (E4) (E3.5) Criar a branch com `git -C /home/rodrigoisensee/MetricasDSPD-052g fetch origin develop` e `git -C /home/rodrigoisensee/MetricasDSPD-052g checkout -b fix/k277-consultas-escape origin/develop` (o `config.lock` do repositório barra o `switch -c`; worktree limpa antes, se não, pare e relate). No script do comando, recusar consulta que contenha `U&`, `UESCAPE` ou identificador começando por `pg_` ou `lo_` (sem diferenciar maiúsculas), com mensagem clara; as 31 consultas `.sql` atuais continuam aceitas (se alguma usar `pg_`, pare e relate); teste com uma sonda de cada caso recusada e as consultas atuais aceitas. Nada roda contra banco real nem lê `.env*`. Testes tocados com `VITEST_MAX_WORKERS=2`, depois `pnpm run pronto` da raiz uma vez, relatando o código de saída do próprio comando (sem `tail` no meio). Commit com `Cartão: K-277` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/fix/k277-consultas-escape` (`github.com` em allowed_domains); sem PR. Arquivo necessário fora da lista abaixo: pare e relate antes de tocar.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: scripts/

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até 967be5645c9bda0e509df2bf6ecb5085e03fbf1f3b49edd9968a74fa2952fa93 (6 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
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
- "E2.6 (react-frontend): L2a, tirar a opção simulado de useMetrica e dos cartões, na branch fix/099-l2a-sem-opcao-simulado, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.7 (tech-lead): review do L2a." · etapa de outra delegação; continua no pedido
- "E2.8 (qa-engineer): QA do L2a." · etapa de outra delegação; continua no pedido
- "E2.9 (tech-lead): PR do L2a; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E2.10 (react-frontend): L2b, apagar FonteComSimulado.ts, simulado.ts, as exportações em data/index.ts e SemDadoRealErro.simulavel, com os testes desses arquivos, na branch fix/099-l2b-apaga-simulado, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.11 (node-backend): L3, tirar do contrato simulavel, podeSimular e METRICAS_SEM_SIMULACAO, com testes, docs/api/metricas.md e o OpenAPI, na branch fix/099-l3-contrato-sem-simulavel, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E2.12 (tech-lead): review por lote do 099 (L2b em diante)." · etapa de outra delegação; continua no pedido
- "E2.13 (qa-engineer): QA por lote do 099 (L2b em diante)." · etapa de outra delegação; continua no pedido
- "E2.14 (tech-lead): PR e merge por lote do 099 na develop, pela autorização do dono de 17:51." · etapa de outra delegação; continua no pedido
- "E2.15 (react-frontend): L2b e L2c juntos (o selo importa o que o L2b apaga): além do L2b, tirar o selo Simulado da interface (SeloSimulado, ramos de CartaoMetrica, OrigemCartao.simulado, OrigemDosCartoes, StatusMeta, CartaoT3, tokens.css) com os testes do selo, e o simulavel de HttpFonteMetricas, na branch fix/099-l2b-apaga-simulado, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E3.1 (devops-engineer): um comando único para o dono rodar as consultas só de leitura dos pedidos 098 e 099 (PostgreSQL da demo e MySQL do Acelerato), que grava a saída num arquivo sem dado de pessoa, na branch chore/consultas-leitura-098-099, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E3.2 (security-engineer): parecer de segurança do comando (lê o .env e os bancos reais, só leitura)." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): review e PR do comando; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.4 (qa-engineer): QA do comando (classe N pelo gatilho do package.json)." · etapa de outra delegação; continua no pedido
- "E3.6 (security-engineer): revalidação de segurança do K-277." · etapa de outra delegação; continua no pedido
- "E3.7 (qa-engineer): QA do K-277." · etapa de outra delegação; continua no pedido
- "E3.8 (tech-lead): review, PR e merge do K-277 na develop, pela autorização do dono de 17:51." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g log -1 --format=%B origin/fix/k277-consultas-escape` · espera: contém 'Cartão: K-277'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
