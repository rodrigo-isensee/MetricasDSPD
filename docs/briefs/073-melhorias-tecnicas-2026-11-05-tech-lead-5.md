Agente destino: forge:tech-lead
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: docs/073-changelog   Base: develop   Base-sha: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
Etapa: codigo   Cobre: E3.2

## Objetivo
Tirar da seção [Não publicado] do CHANGELOG.md os itens da release 068 que já estão na main pelo PR 229, deixando nela só o que de fato não foi publicado (pedido 073, E3.2, item E6, K-229). Branch nova docs/073-changelog a partir da develop 8a789d43, na worktree `/home/rodrigoisensee/MetricasDSPD-056d`.

## Ler
- `CHANGELOG.md` da develop (seções [Não publicado] e as releases já publicadas) e o corpo do PR 237: `gh pr view 237 --repo rodrigo-isensee/MetricasDSPD --json body` (a observação sobre os itens da 068 na seção [Não publicado]).
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log --oneline origin/main -20` (o que já está na main).

## Entregar
- "E3.2 (tech-lead): review e PR por item." (E3.2)
- (E6) (E3.2) `git -C /home/rodrigoisensee/MetricasDSPD-056d switch -c docs/073-changelog origin/develop` (a worktree está destacada na develop 8a789d43, limpa); em `CHANGELOG.md`, mover para a seção da release em que foram publicados (ou tirar da [Não publicado], se já estiverem lá) os itens da release 068 (PRs 212, 214 a 221, 224 e 225) e conferir que os da release 071 (PRs 222, 223, 230 a 236) estão na seção certa; nada de texto novo além da arrumação; `pnpm run docs:check`; commit só do CHANGELOG com `git -C /home/rodrigoisensee/MetricasDSPD-056d add CHANGELOG.md` e `git -C /home/rodrigoisensee/MetricasDSPD-056d commit -m <mensagem> -m 'Cartão: K-229' -- CHANGELOG.md` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/docs/073-changelog`; sem PR (o PR vem depois do review).
- (E1, E2, E3, E4, E5, E7, E8) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

## Decisões e restrições (o pedido não tem linha DECISÃO DO DONO; vale a DECISÃO TÉCNICA abaixo)
### ADRs citadas no pedido
- ADR 0028 (citada no pedido): só como molde de cabeçalho da proposta da ADR 0023 (E2); nada nesta entrega
### Do Histórico deste pedido, docs/pedidos/073-melhorias-tecnicas-2026-11-05.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 18:08: pedido aberto (Jarvis) a partir dos cartões K-224 a K-230. DECISÃO TÉCNICA (Jarvis): começa pela triagem do Dependabot (E1, security-engineer, só leitura) e pelo estado da ADR 0023 (E2, software-architect, sem commit), que não dependem de nada; os itens de código entram um por vez, depois da triagem; o dono é avisado no resumo, sem recibo, por ser melhoria técnica (autonomia dada pelo dono).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: outros arquivos além do CHANGELOG.md, outras worktrees, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por item." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-056d ls-remote origin docs/073-changelog` · espera: contém 'refs/heads/docs/073-changelog'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d diff --name-only 8a789d43dd6227255e7f686728bcaaaaa1ed1797 origin/docs/073-changelog` · espera: igual 'CHANGELOG.md'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
