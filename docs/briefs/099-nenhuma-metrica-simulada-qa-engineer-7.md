Agente destino: forge:qa-engineer
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: fix/099-l2a-sem-opcao-simulado   Base: develop   Base-sha: 27ac9064fc4ffad4e7f3bf18241aa1979912c009
Etapa: codigo   Cobre: E2.8

## Objetivo
L2a do pedido 099: tirar a opção `simulado` de `useMetrica` e dos cartões da web. Branch `fix/099-l2a-sem-opcao-simulado`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, código em 78e5a2c180c45e37cec36054a815c5b9696879bb (entrega conferida às 18:41), base develop 27ac9064fc4ffad4e7f3bf18241aa1979912c009. Classe N: review e QA no mesmo head. O autor tirou também o campo `origem` do retorno do hook (sem consumidor) e manteve `FonteComSimulado`, `simulado.ts`, o selo e `SemDadoRealErro.simulavel` para o L2b e o L2c.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b diff 27ac9064fc4ffad4e7f3bf18241aa1979912c009 78e5a2c180c45e37cec36054a815c5b9696879bb`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/architecture/adr/0030-sem-simulado-na-web.md`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-varredura-simulado.md`, a parte do L2a.

## Entregar
- "E2.8 (qa-engineer): QA do L2a." (E2.8) Nesta delegação, o parecer do L2a.
- (E2) (E2.8) Conferir que nenhum cartão da web pede ou mostra número simulado: sem `simulado: true` em `web/src` fora dos testes do decorador, o hook sem a opção, cartão sem dado real mostra "Sem dado real" nos painéis Operacional, Tático e Sustentação e na Espera invisível; cobertura de 100% mantida. Uma mutação (devolver a leitura simulada no hook) que os testes pegam, restaurada antes do commit. Testes do web com `VITEST_MAX_WORKERS=2` (o `web/vite.config.ts` fixa 4); no máximo uma rodada completa; nada contra a base real nem `.env*`. Parecer novo pela ferramenta Write, com `pedido: 099-nenhuma-metrica-simulada`, `branch: fix/099-l2a-sem-opcao-simulado`, `commit: 78e5a2c180c45e37cec36054a815c5b9696879bb`, o veredito, a contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado, ou vazio. Commit só do parecer com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/fix/099-l2a-sem-opcao-simulado` (`github.com` em allowed_domains); antes do commit, `git pull --rebase` do origin (o outro portão pode ter commitado o parecer dele), sem `--force`; commit e push em chamadas separadas; sem PR.
- (E1) (E3) (E4) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/099-l2a-sem-opcao-simulado.md, web/src/ (a pasta é o escopo da entrega revisada, para a conferência; o portão só grava o parecer)

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
- "E2.9 (tech-lead): PR do L2a; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.1 (devops-engineer): um comando único para o dono rodar as consultas só de leitura dos pedidos 098 e 099 (PostgreSQL da demo e MySQL do Acelerato), que grava a saída num arquivo sem dado de pessoa, na branch chore/consultas-leitura-098-099, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E3.2 (security-engineer): parecer de segurança do comando (lê o .env e os bancos reais, só leitura)." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): review e PR do comando; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.4 (qa-engineer): QA do comando (classe N pelo gatilho do package.json)." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b show origin/fix/099-l2a-sem-opcao-simulado:docs/qa/099-l2a-sem-opcao-simulado.md` · espera: contém 'commit: 78e5a2c180c45e37cec36054a815c5b9696879bb'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
