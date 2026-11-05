Agente destino: forge:qa-engineer
Pedido: 062-corrige-fast-uri
Tipo: codigo
Branch: feature/062-fast-uri   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: qa   Cobre: E1.4

## Objetivo
QA do override do fast-uri, com review e segurança aprovados (pedido 062, E1.4, K-198). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/062-fast-uri`, código em `5c85b0efccf37658e85c4fbdb8b2bd7a1d1e9e09`.

## Ler
- Os pareceres `docs/reviews/062-fast-uri.md` e `docs/security/062-fast-uri.md`; o diff de `pnpm-workspace.yaml` e `pnpm-lock.yaml` contra a develop.

## Entregar
- "E1.4 (qa-engineer): QA." (E1.4)
- (E1.4) Conferir no lockfile que só o fast-uri mudou e que todo consumidor aponta para 3.1.9 ou 4.2.3; rodar, se o sandbox permitir, os testes unitários do server que passam pelo fastify (validação de esquema e serialização), com 4 workers; o que não rodar fica para a CI do PR, registrado.
- (E1.4) Parecer `docs/qa/062-fast-uri.md` com veredito, `commit:` 5c85b0efccf37658e85c4fbdb8b2bd7a1d1e9e09, cenários e bloco `## Achados`; commit só do parecer com `Cartão: K-198`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/feature/062-fast-uri`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-02): "A" na E1.2 do pedido 060 (alertas): corrigir já os 11 recomendados; os 3 de desenvolvimento depois; #16 risco aceito.
- DECISÃO DO DONO (2026-11-02): "É isso" (recibo do 062): o node-backend troca a versão do fast-uri pela corrigida (#18 a #25) e atualiza o lockfile, com review, segurança, QA e PR para a develop; não mexe em #12, #14, #15, nos 3 do lhci nem no #16, e não dispensa alerta.
- 2026-11-02 20:17: E1.1 cumprida pelo node-backend: feature/062-fast-uri em 5c85b0efccf37658e85c4fbdb8b2bd7a1d1e9e09, sem PR. Overrides fast-uri@3: 3.1.9 e fast-uri@4: 4.2.3 em pnpm-workspace.yaml (onde ficam os overrides do projeto; o brief dizia package.json), lockfile só com o fast-uri; pronto rc=0 (fora do sandbox pela store somente leitura).
- 2026-11-03 04:05: E1.3 cumprida pelo security-engineer: parecer de segurança APROVADO em 5c85b0e (parecer 77c463ce28bcaff9991bb85dca5e3336a85a7319); lockfile só com fast-uri 3.1.9 e 4.2.3, os corrigidos de #18 a #25; nenhum pacote nem fonte nova; alertas fecham pelo Dependabot depois do merge, sem fechar à mão. A1 recomendado: integridade não conferida contra o registry (sem rede; a instalação congelada da CI valida).
- 2026-11-03 04:06: E1.2 cumprida pelo tech-lead: code review APROVADO em 5c85b0e (parecer d5499aa88abcd981f19c21b7e500d2856b4c7d61); 2 arquivos, 25 linhas; overrides só de patch (3.1.8 para 3.1.9 e 4.2.2 para 4.2.3); nenhuma outra dependência muda. A1 recomendado: tirar os overrides quando fastify, swagger e type-provider exigirem a faixa corrigida. Próximo: conferente das duas entregas paralelas (review e segurança); QA (E1.4).
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`.
- O agente nunca abre nem lê arquivos `.env*`; não instala nem atualiza dependência.
- O parecer é gravado pela ferramenta Write; frase de regra só pelo ID; cada achado com até 300 caracteres contando o `- ` inicial (conferir antes do commit); o campo `pedido:` é `062-corrige-fast-uri` e o `branch:` é `feature/062-fast-uri`.
- Commit só do parecer: pull antes, em chamada separada; `git -C /home/rodrigoisensee/MetricasDSPD-052h add -N docs/qa/062-fast-uri.md` e depois `git -C /home/rodrigoisensee/MetricasDSPD-052h commit --only -m <mensagem> -- docs/qa/062-fast-uri.md`.
- Recursos da máquina: carga abaixo de 7 antes de rodar teste; vitest com no máximo 4 workers; não rodar `pronto` (a trava da suíte não funciona no sandbox: fica para a CI do PR, registrado no parecer); nunca `pkill` amplo.
- NÃO tocar: código, dependências, o lockfile, o pnpm-workspace.yaml, outros pareceres, o `CLAUDE.md`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (node-backend): override e lockfile, pronto verde." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança (dependência)." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052h log --format=%H -1 origin/feature/062-fast-uri -- docs/qa/062-fast-uri.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).