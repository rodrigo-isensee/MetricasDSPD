Agente destino: forge:tech-lead
Pedido: 062-corrige-fast-uri
Tipo: codigo
Branch: feature/062-fast-uri   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: review   Cobre: E1.2

## Objetivo
Code review do override do fast-uri (pedido 062, E1.2, K-198). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/062-fast-uri`, ponta `5c85b0efccf37658e85c4fbdb8b2bd7a1d1e9e09`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff origin/develop...5c85b0efccf37658e85c4fbdb8b2bd7a1d1e9e09 --stat` e o diff de `pnpm-workspace.yaml` e `pnpm-lock.yaml`; `docs/security/060-triagem-dependabot.md` na branch `origin/docs/060-triagem-dependabot` (`git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/060-triagem-dependabot:docs/security/060-triagem-dependabot.md`; alertas #18 a #25).

## Entregar
- "E1.2 (tech-lead): code review." (E1.2)
- (E1.2) Review: os overrides fast-uri@3 e fast-uri@4 só sobem patch, o lockfile resolve as duas linhas para as versões corrigidas e nenhuma outra dependência muda.
- (E1.2) Parecer `docs/reviews/062-fast-uri.md` com veredito, `commit:` 5c85b0efccf37658e85c4fbdb8b2bd7a1d1e9e09 e bloco `## Achados`; commit só do parecer com `Cartão: K-198`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/feature/062-fast-uri`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-02): "A" na E1.2 do pedido 060 (alertas): corrigir já os 11 recomendados; os 3 de desenvolvimento depois; #16 risco aceito.
- DECISÃO DO DONO (2026-11-02): "É isso" (recibo do 062): o node-backend troca a versão do fast-uri pela corrigida (#18 a #25) e atualiza o lockfile, com review, segurança, QA e PR para a develop; não mexe em #12, #14, #15, nos 3 do lhci nem no #16, e não dispensa alerta.
- 2026-11-02 20:17: E1.1 cumprida pelo node-backend: feature/062-fast-uri em 5c85b0efccf37658e85c4fbdb8b2bd7a1d1e9e09, sem PR. Overrides fast-uri@3: 3.1.9 e fast-uri@4: 4.2.3 em pnpm-workspace.yaml (onde ficam os overrides do projeto; o brief dizia package.json), lockfile só com o fast-uri; pronto rc=0 (fora do sandbox pela store somente leitura).
- 2026-11-02 20:33: entrega conferida 5c85b0efccf37658e85c4fbdb8b2bd7a1d1e9e09
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`.
- O agente nunca abre nem lê arquivos `.env*`; não instala nem atualiza dependência (só lê o lockfile e o pnpm-workspace.yaml).
- O parecer é gravado pela ferramenta Write; frase de regra só pelo ID; cada achado com até 300 caracteres contando o `- ` inicial (conferir antes do commit); o campo `pedido:` é `062-corrige-fast-uri` e o `branch:` é `feature/062-fast-uri`.
- Outro parecer é gravado em paralelo na mesma branch: pull antes do commit, em chamada separada; commit só do próprio parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052h add -N <parecer>` e depois `git -C /home/rodrigoisensee/MetricasDSPD-052h commit --only -m <mensagem> -- <parecer>`; push recusado por estar atrás: repita o pull e o push.
- Recursos da máquina: não rodar `pronto` nem testes pesados (ficam para a CI do PR); nunca `pkill` amplo.
- NÃO tocar: código, dependências, o lockfile, o pnpm-workspace.yaml, outros pareceres, o `CLAUDE.md`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (node-backend): override e lockfile, pronto verde." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança (dependência)." · etapa de outra delegação; continua no pedido
- "E1.4 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052h log --format=%H -1 origin/feature/062-fast-uri -- docs/reviews/062-fast-uri.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).