Agente destino: forge:tech-lead
Pedido: 095-runner-ubuntu-2404
Tipo: codigo
Branch: melhoria/runner-ubuntu-2404   Base: develop   Base-sha: eac38a64b0b580d7c920f4b2b501287f7fb56599
Etapa: codigo   Cobre: E1.5

## Objetivo
PR da troca de runner dos jobs com navegador para a develop: branch `melhoria/runner-ubuntu-2404`, worktree `/home/rodrigoisensee/MetricasDSPD-052h`, head ec6b89e2 (código 60bdc206; devops, segurança e review aprovados), base develop eac38a64b0b580d7c920f4b2b501287f7fb56599.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/095-runner-ubuntu-2404.md`, `/home/rodrigoisensee/MetricasDSPD-052h/docs/security/095-runner-ubuntu-2404.md` e `/home/rodrigoisensee/MetricasDSPD-052h/docs/devops/095-runner-ubuntu-2404.md`.

## Entregar
- "E1.5 (tech-lead): PR para a develop; o merge é do dono." (E1.5)
- (E1) (E1.5) Abrir o PR da branch para a `develop` (squash) pelo gh, com título e corpo curtos (o motivo: o runner Ubuntu 26.04 não resolve os espelhos do apt; os 4 jobs tocados; os três pareceres; `Cartão: K-269`), com a seção `## Sem teste` no corpo: mudança só de imagem do runner, sem teste local possível; a prova é o próprio CI do PR, com os jobs `e2e-parte` e `perf` verdes no ubuntu-24.04. Se a branch estiver atrás da develop, atualizar só por merge da develop na branch (sem rebase nem force) e relatar o novo head. Esperar os checks do PR e relatar o estado de cada um, em especial `e2e-parte` e `perf` no ubuntu-24.04 (falha: nome do check e linha do erro). Não mesclar: o merge é do dono.
- arquivos: .github/workflows/ci.yml, .github/workflows/homolog.yml, docs/reviews/095-runner-ubuntu-2404.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 095-runner-ubuntu-2404 até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/095-runner-ubuntu-2404.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): mudança dos `runs-on` dos jobs com navegador e parecer de devops, na branch melhoria/runner-ubuntu-2404, worktree /home/rodrigoisensee/MetricasDSPD-052h; commit sem push (o envio de arquivo de workflow exige o escopo `workflow`, que é do dono)." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança (gatilho CI/CD)." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.4 (dono): push da branch." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --head melhoria/runner-ubuntu-2404 --state open --json number` · espera: contém 'number'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
