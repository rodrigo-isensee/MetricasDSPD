Agente destino: forge:devops-engineer
Pedido: 087-paineis-dado-real-e-demo
Tipo: codigo
Branch: feature/087-demo-dado-real   Base: develop   Base-sha: 4388083c63ea04993f2b1fbb7c94d45e518008ce
Etapa: codigo   Cobre: E4.1

## Objetivo
Comando único da demo com dado real (pedido 087, E4.1): o dono, com o `.env` dele e a partir da main, roda um comando que sobe o ambiente, migra, faz a carga inicial do BusinessMap, do Acelerato e do apontamento, projeta e imprime a consulta de prova do 075 (só contagens). Worktree `/home/rodrigoisensee/MetricasDSPD-056d` (livre: o 085 já está na develop), branch nova `feature/087-demo-dado-real`.

## Ler
- Da develop: `package.json` (scripts `db:*`, `coleta`, `homolog:*`), `scripts/coleta.sh`, `scripts/db.sh`, `tools/homolog/src/main.ts` (o que o `homolog:subir` já faz) e `docs/engineering/fluxo-homologacao.md` (só a seção do ambiente local).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/086-prontidao-dado-real-vm.md`, só a seção 4 (o que a migração exige: migrações até a 0034 antes da API, carga inicial, `--reconhecer-mudanca` na primeira coleta do Acelerato depois do L9-c).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`, só a "Prova do dono" do Lote 6b.

## Entregar
- "E4.1 (devops-engineer): o comando da demo (script e documentação), com parecer de devops, e o envio da branch de trabalho (o autor envia a branch, R-FLUXO)" (E4.1)
- (E4) (E4.1) Preparar: conferir `git -C /home/rodrigoisensee/MetricasDSPD-056d status --short` só com `docs/ux/080-revisao-leia-junto.md` não rastreado (de outro pedido: não adicionar nem apagar); `git -C /home/rodrigoisensee/MetricasDSPD-056d fetch origin develop`; `git -C /home/rodrigoisensee/MetricasDSPD-056d switch -c feature/087-demo-dado-real 4388083c63ea04993f2b1fbb7c94d45e518008ce` (a partir do sha, sem rastreio); conferir `branch --show-current` (se não trocou, pare e relate).
- (E4) (E4.1) Script `scripts/demo-dado-real.sh`, com o teste `scripts/demo-dado-real.test.sh`, e o atalho `pnpm run demo:dado-real` no `package.json`, que, nesta ordem, para no primeiro erro com a etapa e a categoria do erro (sem imprimir valor de credencial): confere que o `.env` existe e tem as variáveis necessárias (só os nomes); sobe o banco; roda as migrações; roda a carga inicial do BusinessMap, a do Acelerato (com `--reconhecer-mudanca` só se for a primeira depois do L9-c, como o `ac:` já pede) e a do apontamento, reusando os comandos existentes; projeta; sobe a API e a web como o `homolog:subir` faz; e imprime a consulta de prova do 075 (contagens de `fato_bloqueio`, de `evt_bloqueio` com fim e o primeiro `coletado_em` de `stg_card`), sem nome, e-mail nem texto livre. Só GET nas fontes (CLAUDE.md). Documentação curta em `docs/engineering/demo-dado-real.md` (o que roda, quanto tempo leva, o que o dono devolve ao Jarvis) e parecer de devops em `docs/devops/087-demo-dado-real.md`. Testes: o caminho do script sem `.env` falha com mensagem clara; `bash -n` e `shellcheck` limpos; nada roda contra base real aqui (o time não tem o `.env`). Commits com `Cartão: K-258` (mensagem por `git commit -F` de arquivo gravado por Write no scratchpad), `git add` explícito por caminho; push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/087-demo-dado-real` (`github.com` em allowed_domains); sem PR.
- arquivos: scripts/demo-dado-real.sh, scripts/demo-dado-real.test.sh, package.json, docs/engineering/demo-dado-real.md, docs/devops/087-demo-dado-real.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 087-paineis-dado-real-e-demo até b5c57ee36c8f03763459cab88c730903fa7e12a4d83ac61503fa8c866e69f5ce (1 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/087-paineis-dado-real-e-demo.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): release pelo pedido 078." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): lote 6b;" · etapa de outra delegação; continua no pedido
- "E2.2 (react-frontend): lote 9a;" · etapa de outra delegação; continua no pedido
- "E2.3 (node-backend): lote 9b; com review, QA e segurança por lote, pelo plano do 075." · etapa de outra delegação; continua no pedido
- "E3.1 (react-frontend): K-215." · etapa de outra delegação; continua no pedido
- "E3.2 (node-backend): K-244." · etapa de outra delegação; continua no pedido
- "E3.3 (software-architect): K-213, leitura só do código, parecer em docs/analises/, sem commit." · etapa de outra delegação; continua no pedido
- "E4.2 (tech-lead): review;" · etapa de outra delegação; continua no pedido
- "E4.3 (qa-engineer): QA sem base real (simulação do roteiro);" · etapa de outra delegação; continua no pedido
- "E4.4 (security-engineer): parecer (o script lê credenciais do `.env` e roda contra a base real quando o dono o executa);" · etapa de outra delegação; continua no pedido
- "E4.5 (tech-lead): PR." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): PR do Lote 7 pelo pedido 077." · etapa de outra delegação; continua no pedido
- "E6.1 (dono): mesclar na main, rodar a primeira coleta pelo comando da demo e devolver a saída da consulta de prova; depois, a segunda release e a demo final." · etapa de outra delegação; continua no pedido
- "E6.2 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d ls-remote origin refs/heads/feature/087-demo-dado-real` · espera: linhas=1
- PQ-2 (cmd): `bash -n /home/rodrigoisensee/MetricasDSPD-056d/scripts/demo-dado-real.sh` · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
