Agente destino: forge:react-frontend
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: fix/099-l2b-apaga-simulado   Base: develop   Base-sha: 58882fcf64fbf3c875ac2b85c43829bb7245b8b0
Etapa: codigo   Cobre: E2.10

## Objetivo
L2b do pedido 099 (ADR 0030): apagar o código do simulador que ficou parado na web depois do L1 e do L2a, já na develop. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b` (hoje na branch do L2a, já mesclada); branch nova `fix/099-l2b-apaga-simulado` a partir da `origin/develop` 58882fcf64fbf3c875ac2b85c43829bb7245b8b0. O selo "Simulado" da interface fica para o L2c; o contrato do servidor (`simulavel` em `origem.ts`) é do L3, em paralelo noutra worktree.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-varredura-simulado.md`, seção 7, linha L2b, e a seção 6 (guardas).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/architecture/adr/0030-sem-simulado-na-web.md`.

## Entregar
- "E2.10 (react-frontend): L2b, apagar FonteComSimulado.ts, simulado.ts, as exportações em data/index.ts e SemDadoRealErro.simulavel, com os testes desses arquivos, na branch fix/099-l2b-apaga-simulado, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." (E2.10)
- (E2) (E2.10) Criar a branch com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b switch -c fix/099-l2b-apaga-simulado origin/develop` (worktree limpa antes; se o `config.lock` do repositório barrar, use `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b checkout -b fix/099-l2b-apaga-simulado origin/develop` e relate). Apagar `web/src/data/FonteComSimulado.ts`, `web/src/data/simulado.ts`, as exportações deles em `web/src/data/index.ts` e o campo `SemDadoRealErro.simulavel`, mais os testes desses arquivos (`web/src/data/simulado.test.tsx`); ajustar quem importava. Nada do selo (`SeloSimulado`, `CartaoMetrica`, `OrigemDosCartoes`) nesta delegação. Cobertura de 100% mantida. Testes do web com `VITEST_MAX_WORKERS=2`, depois `pnpm run pronto` da raiz uma vez, relatando o código de saída do próprio comando (sem `tail` no meio). Commit com `Cartão: K-275` e, se passar de 150 linhas, a linha `teto: excedido, <n> linhas, <motivo>` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/fix/099-l2b-apaga-simulado` (`github.com` em allowed_domains); sem PR. Arquivo necessário fora da lista abaixo: pare e relate antes de tocar.
- (E1) (E3) (E4) Nada a entregar aqui: não nesta delegação.
- arquivos: web/src/data/, web/src/

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
- "E2.11 (node-backend): L3, tirar do contrato simulavel, podeSimular e METRICAS_SEM_SIMULACAO, com testes, docs/api/metricas.md e o OpenAPI, na branch fix/099-l3-contrato-sem-simulavel, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E2.12 (tech-lead): review por lote do 099 (L2b em diante)." · etapa de outra delegação; continua no pedido
- "E2.13 (qa-engineer): QA por lote do 099 (L2b em diante)." · etapa de outra delegação; continua no pedido
- "E2.14 (tech-lead): PR e merge por lote do 099 na develop, pela autorização do dono de 17:51." · etapa de outra delegação; continua no pedido
- "E3.1 (devops-engineer): um comando único para o dono rodar as consultas só de leitura dos pedidos 098 e 099 (PostgreSQL da demo e MySQL do Acelerato), que grava a saída num arquivo sem dado de pessoa, na branch chore/consultas-leitura-098-099, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E3.2 (security-engineer): parecer de segurança do comando (lê o .env e os bancos reais, só leitura)." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): review e PR do comando; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.4 (qa-engineer): QA do comando (classe N pelo gatilho do package.json)." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b log -1 --format=%B origin/fix/099-l2b-apaga-simulado` · espera: contém 'Cartão: K-275'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
