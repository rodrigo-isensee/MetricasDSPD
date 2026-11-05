Agente destino: forge:tech-lead
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: feature/073-deps-patch   Base: develop   Base-sha: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
Etapa: review   Cobre: E3.2

## Objetivo
Code review do item E8 do pedido 073 (K-232): só o pnpm-lock.yaml muda, subindo body-parser para 1.20.9, qs para 6.16.1 e ip-address para 10.7.4 (alertas 17, 26 e 13 da triagem), na ponta b9441f58e669e954a50e965ea8c5023bf38e7ca5 (pedido 073, E3.2, K-232). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/073-deps-patch`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff 8a789d43dd6227255e7f686728bcaaaaa1ed1797...b9441f58e669e954a50e965ea8c5023bf38e7ca5` (só o lock) e a triagem `git -C /home/rodrigoisensee/Metricas/MetricasDSPD show origin/docs/jarvis-2026-10-23:docs/security/073-dependabot-triagem.md`.

## Entregar
- "E3.2 (tech-lead): review e PR por item." (E3.2)
- (E8) (E3.2) `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/073-deps-patch`; revisar se só as três versões subiram, se nada mais mudou no lock, se as versões corrigem os alertas da triagem e se a mudança dispensa package.json; parecer em `docs/reviews/073-deps-patch.md` gravado inteiro pela ferramenta Write, com `pedido: 073-melhorias-tecnicas-2026-11-05`, `branch: feature/073-deps-patch`, `commit: b9441f58e669e954a50e965ea8c5023bf38e7ca5`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); commit só do parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052f add docs/reviews/073-deps-patch.md` e `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-232' -- docs/reviews/073-deps-patch.md` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/073-deps-patch`; sem PR (o PR vem depois do QA).
- (E1, E2, E3, E4, E5, E6, E7) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

## Decisões e restrições (o pedido não tem linha DECISÃO DO DONO; valem as DECISÕES TÉCNICAS abaixo, e para o E8 valem as duas últimas)
### ADRs citadas no pedido
- ADR 0028 (citada no pedido): só como molde de cabeçalho da proposta da ADR 0023 (E2); nada nesta entrega
### Do Histórico deste pedido, docs/pedidos/073-melhorias-tecnicas-2026-11-05.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 18:08: pedido aberto (Jarvis) a partir dos cartões K-224 a K-230. DECISÃO TÉCNICA (Jarvis): começa pela triagem do Dependabot (E1, security-engineer, só leitura) e pelo estado da ADR 0023 (E2, software-architect, sem commit), que não dependem de nada; os itens de código entram um por vez, depois da triagem; o dono é avisado no resumo, sem recibo, por ser melhoria técnica (autonomia dada pelo dono).
- 2026-11-05 18:24: DECISÃO TÉCNICA (Jarvis): o E8 começa em paralelo ao E4, com outro node-backend na worktree 052f (livre: a docs/071-release já está na develop pelo PR 235), branch feature/073-deps-patch; depende só da triagem, já pronta; pede parecer de segurança da dependência antes do PR.
- 2026-11-05 19:45: E8 enviado: feature/073-deps-patch em b9441f58 (só pnpm-lock.yaml: body-parser 1.20.9, qs 6.16.1, ip-address 10.7.4). DECISÃO TÉCNICA (Jarvis): parecer de segurança da dependência (security-engineer) e review (tech-lead) em paralelo, pareceres 073-deps-patch.md; QA depois do review, com os 4 testes de entrada provados na CI do PR.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, os outros pareceres, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E8.1 (security-engineer): parecer de segurança da dependência do E8 (pnpm-lock.yaml), antes do PR." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." · etapa de outra delegação; continua no pedido
- "E7.1 (tech-lead): trazer à develop, por uma branch de documentação e PR, os pareceres que só existem nas branches antigas (069-zz2-l7a e a revalidação do 011-back), sem mudar o texto deles." · etapa de outra delegação; continua no pedido
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por item." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/feature/073-deps-patch:docs/reviews/073-deps-patch.md` · espera: contém 'commit: b9441f58e669e954a50e965ea8c5023bf38e7ca5'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
