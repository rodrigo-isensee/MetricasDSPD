Agente destino: forge:agile-coach
Pedido: 095-runner-ubuntu-2404
Tipo: codigo
Branch: docs/retros-2026-11-11c   Base: develop   Base-sha: eac38a64b0b580d7c920f4b2b501287f7fb56599
Etapa: codigo   Cobre: E1.6

## Objetivo
Retrospectiva curta do pedido 095 (jobs com navegador da CI: primeiro o ubuntu-24.04, que não resolveu; depois o container oficial do Playwright; PR 318 mesclado pelo dono com a correção completa). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `docs/retros-2026-11-11c` (já tem as retrospectivas do 093 e do 094, que não devem ser tocadas).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/095-runner-ubuntu-2404.md` (inteiro).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md`: só as linhas do 095.

## Entregar
- "E1.6 (agile-coach): retrospectiva curta." (E1.6)
- (E1) (E1.6) Escrever pela ferramenta Write `/home/rodrigoisensee/MetricasDSPD-052f/docs/retrospectivas/2026-11-11-095-runner-ci.md` (novo), no formato das retrospectivas da pasta: o que correu bem, o que travou (diagnóstico inicial errado da causa, a imagem e não o apt; PR barrado por faltar QA e parecer novo; brief de PR sem rodar forge-check pr; etapa E1.10 aberta sem conferir a develop), retrabalho pelas conferências, lead time pelo Histórico e as linhas `MELHORIA:` (uma por linha, com evidência; o que é do Forge marcado "vai ao Forge"; o que já está em `docs/kanban/melhorias.md` fica só como dado). Commit só da retrospectiva com `Cartão: K-269` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/docs/retros-2026-11-11c` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/retrospectivas/2026-11-11-095-runner-ci.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 095-runner-ubuntu-2404 até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/095-runner-ubuntu-2404.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): mudança dos `runs-on` dos jobs com navegador e parecer de devops, na branch melhoria/runner-ubuntu-2404, worktree /home/rodrigoisensee/MetricasDSPD-052h; commit sem push (o envio de arquivo de workflow exige o escopo `workflow`, que é do dono)." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança (gatilho CI/CD)." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.4 (dono): push da branch." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (devops-engineer): parecer de devops novo, em commit separado e com `commit:` do código, enviado pelo próprio devops (o commit só de parecer não toca workflow e não pede o escopo `workflow`, como o da segurança e o do review)." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): parecer de QA (classe C), enviado pelo próprio QA." · etapa de outra delegação; continua no pedido
- "E1.9 (devops-engineer): a troca de imagem não resolveu (PR 318); diagnóstico e correção que não dependa do apt do runner na instalação do navegador (por exemplo, rodar os jobs com navegador no container oficial do Playwright, de versão fixada, ou instalar com nova tentativa e espelho alternativo), na mesma branch e worktree; commit sem push (workflow: o envio é do dono)." · etapa de outra delegação; continua no pedido
- "E1.10 (devops-engineer): o PR 318 entrou só com o runs-on; levar a correção do container e o parecer para uma branch nova fix/k269-container-playwright a partir da develop, na worktree /home/rodrigoisensee/MetricasDSPD-052h, sem push (workflow: o envio é do dono)." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f log -1 --format=%B origin/docs/retros-2026-11-11c` · espera: contém 'Cartão: K-269'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
