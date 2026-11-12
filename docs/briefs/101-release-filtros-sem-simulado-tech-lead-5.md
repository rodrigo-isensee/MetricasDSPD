Agente destino: forge:tech-lead
Pedido: 101-release-filtros-sem-simulado
Tipo: merge
Branch: fix/101-specs-e2e-api   Base: develop   Base-sha: ea826a9ca695f84e810387ff85ea86befa997d1f
Etapa: pr   Cobre: E1.4

## Objetivo
Correção dos 6 specs velhos do e2e chromium-api que reprovaram o QA da release 101 (branch `fix/101-specs-e2e-api`, head 9fa47232fed3f46e7d914db8fd1b7c063e9a9a69; 69 de 69 no chromium-api). Precisa entrar na develop para a release seguir.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g show --stat 9fa47232fed3f46e7d914db8fd1b7c063e9a9a69`.

## Entregar
- "E1.4 (tech-lead): PR da docs/101-release para a develop e merge com os checks verdes." (E1.4) Nesta delegação, o PR e o merge da correção dos specs do e2e, antes da release seguir.
- (E1) (E1.4) Rodar da worktree `forge-check pr 101-release-filtros-sem-simulado --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref origin/fix/101-specs-e2e-api --base develop` (aprovado; senão pare e relate). Abrir o PR para a `develop` (squash) com o resumo (A1 a A4 do QA da release, 69 de 69 no chromium-api, review). Esperar os checks do head em laços de até 170 s (`timeout --foreground` e `< /dev/null` em cada gh), por até 2 horas; imediatamente antes do merge, `gh pr view fix/101-specs-e2e-api --json mergeStateStatus,headRefOid`: só com CLEAN; se BEHIND, `gh pr update-branch fix/101-specs-e2e-api` e esperar os checks do head novo. Merge num comando sozinho: `gh pr merge fix/101-specs-e2e-api --squash --match-head-commit` seguido do sha completo, nunca `--admin`. Check vermelho ou permissão negada: pare e relate.
- arquivos: e2e/tests-api/ (escopo da entrega revisada; esta delegação não edita arquivo)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 101-release-filtros-sem-simulado até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/101-release-filtros-sem-simulado.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, pareceres, outras worktrees, a `homolog` e a `main`; o único merge é o do PR desta delegação, na `develop`, com os checks verdes.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog e merge com o portão verde (o merge até a homolog é do time, pela autorização do dono de 17:51)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva curta da release." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR só de documentos para a develop com o que os agentes gravaram sem commit na árvore principal (revisões de UX e análises) e a segunda rodada do UX do 097 (branch docs/097-ux-recolher-setor), branch docs/101-documentos-da-noite, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E1.9 (qa-engineer): specs velhos do e2e chromium-api que reprovaram o QA da release (A1 a A3 do parecer de QA da release; o A4 investigado), branch fix/101-specs-e2e-api a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-052g. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr view fix/101-specs-e2e-api --json state` · espera: contém 'MERGED'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
