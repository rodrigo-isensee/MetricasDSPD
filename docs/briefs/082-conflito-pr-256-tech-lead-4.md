Agente destino: forge:tech-lead
Pedido: 082-conflito-pr-256
Tipo: codigo
Branch: integracao/2026-11-07   Base: develop   Base-sha: ab423d02fa03d131f2bf48841c83fb9b7e8009d9
Etapa: merge-integracao   Cobre: E1.3

## Objetivo
Juntar na branch de integração `integracao/2026-11-07` (head d2d55c04ea45e8860cfa0667e96e1dc7df44846a, já com o 075 4b) o PR 256 do Dependabot (head 4815799318ac8146e1296cc9db7b77d6c4385da2: sem conflito, CI verde, segurança aprovada e conferida), pela decisão do dono de 12:56 (merge agrupado). Worktree `/home/rodrigoisensee/MetricasDSPD-052e`, na branch `integracao/2026-11-07`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/082-conflito-pr-256.md` (inteiro, curto).

## Entregar
- "E1.3 (tech-lead): conferir a CI verde e deixar o PR pronto; o merge na develop segue o fluxo da noite." (E1.3) Pela decisão do dono de 12:56, o PR 256 entra na branch de integração em vez de ir sozinho à develop.
- (E1) (E1.3) Na worktree `/home/rodrigoisensee/MetricasDSPD-052e`: conferir `git -C /home/rodrigoisensee/MetricasDSPD-052e branch --show-current` = integracao/2026-11-07 e `status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-052e pull --ff-only origin integracao/2026-11-07`; `git -C /home/rodrigoisensee/MetricasDSPD-052e fetch origin dependabot/npm_and_yarn/develop/producao-d435e0b6dd`; conferir que o head remoto dela é 4815799318ac8146e1296cc9db7b77d6c4385da2 e que `gh pr checks 256 --repo rodrigo-isensee/MetricasDSPD` está todo verde (`api.github.com` em `allowed_domains`); `git -C /home/rodrigoisensee/MetricasDSPD-052e merge --no-ff 4815799318ac8146e1296cc9db7b77d6c4385da2` com a mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-tl-int-082.txt` (`-F` com esse caminho literal; assunto `merge: PR 256 (dependências de produção) na integração`, corpo com o pedido 082); se der conflito, pare e relate; enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052e push origin HEAD:refs/heads/integracao/2026-11-07`, em primeiro plano, com o comando puro (`github.com` em `allowed_domains`); push ou pre-push com mais de 15 minutos está preso: pare e relate; esperar a CI do push por chamadas curtas e relatar cada job. Sem PR, sem merge na develop, sem fechar o PR 256.

## Decisões e restrições
- 2026-11-07 12:01: DECISÃO DO DONO (literal): "resolva os conflitos do pr 256 os demais eu ja fiz merge". Pedido aberto (Jarvis). Recibo ao dono: vou fazer: o tech-lead faz o Dependabot refazer o PR 256 sobre a develop (ou atualiza a branch e regera o lockfile), mantendo as três versões, com a CI verde e o parecer de segurança; não vou: trocar versões, mexer em código nem mesclar outros PRs de dependência. Gatilho de segurança: dependência de produção.
- 2026-11-07 12:56: DECISÃO DO DONO (literal): "Isso a 1" (merge agrupado, leitura 1): cada lote segue com review, QA e conferência próprios e entra numa branch de integração; só ela vira um PR único para a develop. DECISÃO TÉCNICA (Jarvis): branch `integracao/2026-11-07` criada pelo tech-lead a partir da develop atual; cada lote, depois do QA conferido, entra nela por merge (--no-ff) feito pelo tech-lead, com o forge-check pr do lote limpo; no fim, um PR único integracao/2026-11-07 → develop (merge commit), com a lista de lotes e pareceres; os PRs 256 e 266 ficam abertos até lá e fecham com o PR único. O dono faz um update-branch e um merge só.
- O agente não abre, lê nem edita arquivos `.env*`. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O hook do Forge recusa variáveis de shell (`$X`), crases e `$(...)` em comandos com commit, push ou gh: use caminhos e ids literais. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- NÃO tocar: código, pareceres, o pedido, `KANBAN.md`, as worktrees além da 052e, a branch do Dependabot, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): resolver o conflito: primeiro pedir ao Dependabot que refaça o PR sobre a develop (comentário `@dependabot recreate` no PR 256); se ele não refizer, atualizar a branch com a develop e regerar o `pnpm-lock.yaml` com `pnpm install`, sem mudar versão além das três do PR." · etapa de outra delegação; feita
- "E1.2 (security-engineer): parecer de segurança das três atualizações (dependência de produção, R-SEGURANCA)." · etapa de outra delegação; feita
- "E1.5 (node-backend): regerar o `pnpm-lock.yaml` do merge da develop na branch do PR 256, commitar e enviar (o hook só deixa papel de dev rodar `pnpm install`; DECISÃO TÉCNICA de 12:09)." · etapa de outra delegação; feita
- "E1.4 (agile-coach): retrospectiva curta junto com as do 079 e do 080." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (push): `git ls-remote origin refs/heads/integracao/2026-11-07` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-052e rev-parse HEAD`)
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052e merge-base --is-ancestor 4815799318ac8146e1296cc9db7b77d6c4385da2 HEAD && echo contém` · espera: igual 'contém'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
