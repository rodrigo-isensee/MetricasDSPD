Agente destino: forge:tech-lead
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: feature/073-fronteira-eslint   Base: develop   Base-sha: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
Etapa: merge-integracao   Cobre: E3.2

## Objetivo
PR do item E4 do pedido 073 (K-225, regra de fronteira do eslint do server cobrindo toda pasta de src fora de modulos) para a develop e merge por squash com a CI verde, depois do review e do QA aprovados (pedido 073, E3.2, K-225). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `feature/073-fronteira-eslint`.

## Ler
- Os pareceres na branch: `docs/reviews/073-fronteira-eslint.md` e `docs/qa/073-fronteira-eslint.md` (sem gatilho de segurança: configuração de lint e teste).

## Entregar
- "E3.2 (tech-lead): review e PR por item." (E3.2)
- (E4) (E3.2) `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin feature/073-fronteira-eslint`; se o parecer de QA não estiver aprovado na branch, pare e relate; `forge-check pr 073-melhorias-tecnicas-2026-11-05 --ref origin/feature/073-fronteira-eslint --base origin/develop` limpo antes de abrir; abrir o PR com `gh pr create --repo rodrigo-isensee/MetricasDSPD --base develop --head feature/073-fronteira-eslint --title <título> --body-file <arquivo>`, corpo escrito pela ferramenta Write com o que muda, os dois pareceres e o A1 do review (o teste só confere o primeiro nível de src/); esperar os checks por chamadas curtas com pausa (sem `--watch`); se a develop andou, `gh pr update-branch` e esperar de novo, e se depois disso o forge-check pr pedir parecer novo, pare e relate; com todos verdes, `gh pr merge feature/073-fronteira-eslint --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head do PR>`, sem `--admin`; se um check falhar ou a permissão negar o merge, pare e relate; sem promover para a homolog.
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
- NÃO tocar: código, testes, os pareceres, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`; a develop só muda pelo merge do PR.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por item." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/073-fronteira-eslint --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
