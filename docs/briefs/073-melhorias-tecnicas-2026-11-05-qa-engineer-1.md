Agente destino: forge:qa-engineer
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: feature/073-fronteira-eslint   Base: develop   Base-sha: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
Etapa: qa   Cobre: E3.3

## Objetivo
QA do item E4 do pedido 073 (K-225): a regra de fronteira do eslint do server cobre toda pasta de src fora de modulos, com teste de cobertura, na ponta 5af33d345bbbc68a7b2d58874437ebc1a43bc48b, depois do review aprovado (pedido 073, E3.3, K-225). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `feature/073-fronteira-eslint`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c diff 8a789d43dd6227255e7f686728bcaaaaa1ed1797...5af33d345bbbc68a7b2d58874437ebc1a43bc48b` e o parecer de review `docs/reviews/073-fronteira-eslint.md` na branch.

## Entregar
- "E3.3 (qa-engineer): QA por item." (E3.3)
- (E4) (E3.3) `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin feature/073-fronteira-eslint`; se o parecer de review não estiver aprovado na branch, pare e relate; rodar `npx eslint .` com cwd em `server/` (rc=0), o vitest do server com no máximo 2 workers (o teste novo `server/tests/fronteira-eslint.test.ts` e a suíte do server) e `pnpm run docs:check`; repetir à mão a prova de cobertura: criar a pasta temporária `server/src/zzqa` com um arquivo que importa um arquivo interno de um módulo, confirmar que `npx eslint src/zzqa` (cwd em `server/`) acusa `no-restricted-imports`, e apagar a pasta antes do commit; parecer em `docs/qa/073-fronteira-eslint.md` gravado inteiro pela ferramenta Write, com `pedido: 073-melhorias-tecnicas-2026-11-05`, `branch: feature/073-fronteira-eslint`, `commit: 5af33d345bbbc68a7b2d58874437ebc1a43bc48b`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); commit só do parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052c add docs/qa/073-fronteira-eslint.md` e `git -C /home/rodrigoisensee/MetricasDSPD-052c commit -m <mensagem> -m 'Cartão: K-225' -- docs/qa/073-fronteira-eslint.md` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/073-fronteira-eslint`; sem PR.
- (E1, E2, E3, E5, E6, E7, E8) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

## Decisões e restrições (o pedido não tem linha DECISÃO DO DONO; valem as DECISÕES TÉCNICAS abaixo, e para o E4 vale a segunda, que substitui a ordem "um por vez, depois da triagem" da primeira)
### ADRs citadas no pedido
- ADR 0028 (citada no pedido): só como molde de cabeçalho da proposta da ADR 0023 (E2); nada nesta entrega
### Do Histórico deste pedido, docs/pedidos/073-melhorias-tecnicas-2026-11-05.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 18:08: pedido aberto (Jarvis) a partir dos cartões K-224 a K-230. DECISÃO TÉCNICA (Jarvis): começa pela triagem do Dependabot (E1, security-engineer, só leitura) e pelo estado da ADR 0023 (E2, software-architect, sem commit), que não dependem de nada; os itens de código entram um por vez, depois da triagem; o dono é avisado no resumo, sem recibo, por ser melhoria técnica (autonomia dada pelo dono).
- 2026-11-05 18:16: DECISÃO TÉCNICA (Jarvis): com o dono fora da máquina depois das 18h e o uso liberado, o E4 (K-225, regra de fronteira do eslint) começa em paralelo à triagem, com o node-backend na worktree 052c (livre depois do merge do PR 238); é configuração e teste, sem relação com dependências.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código e testes (a pasta temporária zzqa é apagada antes do commit), os outros pareceres, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review e PR por item." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c show origin/feature/073-fronteira-eslint:docs/qa/073-fronteira-eslint.md` · espera: contém 'commit: 5af33d345bbbc68a7b2d58874437ebc1a43bc48b'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
