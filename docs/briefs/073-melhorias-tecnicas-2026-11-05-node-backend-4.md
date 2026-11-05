Agente destino: forge:node-backend
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: feature/073-deps-patch   Base: develop   Base-sha: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
Etapa: codigo   Cobre: E3.1

## Objetivo
Atualizar por patch, no pnpm-lock.yaml, as três dependências que a triagem do Dependabot mandou atualizar já (alertas 17 body-parser para 1.20.9, 26 qs para 6.16.1 e 13 ip-address para 10.7.4), sem mexer em outra dependência (pedido 073, E3.1, item E8, K-228). Branch nova feature/073-deps-patch a partir da develop 8a789d43, na worktree `/home/rodrigoisensee/MetricasDSPD-052f`.

## Ler
- O parecer da triagem: `git -C /home/rodrigoisensee/Metricas/MetricasDSPD show origin/docs/jarvis-2026-10-23:docs/security/073-dependabot-triagem.md` (linhas dos alertas 17, 26 e 13: cadeia de quem puxa cada pacote).
- `pnpm-lock.yaml` e os `package.json` da raiz e dos pacotes que puxam as cadeias (express via @lhci/cli; ip-address).

## Entregar
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." (E3.1)
- (E8) (E3.1) `git -C /home/rodrigoisensee/MetricasDSPD-052f fetch origin`; `git -C /home/rodrigoisensee/MetricasDSPD-052f switch -c feature/073-deps-patch 8a789d43dd6227255e7f686728bcaaaaa1ed1797` (a worktree está na docs/071-release, já mesclada no PR 235; se tiver mudança local, pare e relate); subir só body-parser para 1.20.9, qs para 6.16.1 e ip-address para 10.7.4 no `pnpm-lock.yaml`, pelo meio que menos mexe no lock (atualização da cadeia com `pnpm update --depth` restrito a esses pacotes, ou `pnpm.overrides` no `package.json` da raiz com comentário do alerta, se a cadeia pai não aceitar a versão); conferir com `git -C /home/rodrigoisensee/MetricasDSPD-052f diff --stat` que só o lock (e, se usado, o `package.json` da raiz) mudou e que nenhuma outra versão subiu; rodar `pnpm install --frozen-lockfile` (rc=0), o vitest do server e dos pacotes com no máximo 2 workers, `npx eslint .` com cwd em `server/` e `pnpm run docs:check`; commits com `git -C /home/rodrigoisensee/MetricasDSPD-052f add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-228' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/073-deps-patch`; sem PR.
- (E1, E2, E3, E4, E5, E6, E7) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

## Decisões e restrições (o pedido não tem linha DECISÃO DO DONO; valem as DECISÕES TÉCNICAS abaixo, e para o E8 vale a terceira (e para o E4 a segunda), que substituem a ordem "um por vez, depois da triagem" da primeira)
### ADRs citadas no pedido
- ADR 0028 (citada no pedido): só como molde de cabeçalho da proposta da ADR 0023 (E2); nada nesta entrega
### Do Histórico deste pedido, docs/pedidos/073-melhorias-tecnicas-2026-11-05.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 18:08: pedido aberto (Jarvis) a partir dos cartões K-224 a K-230. DECISÃO TÉCNICA (Jarvis): começa pela triagem do Dependabot (E1, security-engineer, só leitura) e pelo estado da ADR 0023 (E2, software-architect, sem commit), que não dependem de nada; os itens de código entram um por vez, depois da triagem; o dono é avisado no resumo, sem recibo, por ser melhoria técnica (autonomia dada pelo dono).
- 2026-11-05 18:16: DECISÃO TÉCNICA (Jarvis): com o dono fora da máquina depois das 18h e o uso liberado, o E4 (K-225, regra de fronteira do eslint) começa em paralelo à triagem, com o node-backend na worktree 052c (livre depois do merge do PR 238); é configuração e teste, sem relação com dependências.
- 2026-11-05 18:24: DECISÃO TÉCNICA (Jarvis): o E8 começa em paralelo ao E4, com outro node-backend na worktree 052f (livre: a docs/071-release já está na develop pelo PR 235), branch feature/073-deps-patch; depende só da triagem, já pronta; pede parecer de segurança da dependência antes do PR.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código de produção, testes, outras dependências (nenhuma versão além das três), os pareceres, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review e PR por item." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por item." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052f ls-remote origin feature/073-deps-patch` · espera: contém 'refs/heads/feature/073-deps-patch'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/feature/073-deps-patch:pnpm-lock.yaml` · espera: contém 'body-parser@1.20.9'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
