Agente destino: forge:tech-lead
Pedido: 101-release-filtros-sem-simulado
Tipo: review
Branch: fix/101-specs-e2e-api   Base: develop   Base-sha: ea826a9ca695f84e810387ff85ea86befa997d1f
Etapa: review   Cobre: E1.1
Revisar-sha: 43ebaabcbe336ffd04d8a7c09eac6d25f47e713b

## Objetivo
Correção dos 6 specs velhos do e2e chromium-api que reprovaram o QA da release 101 (branch `fix/101-specs-e2e-api`, head 43ebaabcbe336ffd04d8a7c09eac6d25f47e713b; 69 de 69 no chromium-api). Precisa entrar na develop para a release seguir.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g show --stat 43ebaabcbe336ffd04d8a7c09eac6d25f47e713b`.

## Entregar
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/101-release." (E1.1) Nesta delegação, o review da correção dos specs do e2e, na branch dela.
- (E1) (E1.1) Review do diff (`git -C /home/rodrigoisensee/MetricasDSPD-052g diff origin/develop...43ebaabcbe336ffd04d8a7c09eac6d25f47e713b`): só specs de `e2e/tests-api/`; nenhuma guarda afrouxada (em especial a regex PESSOA do CT-59: `descricao` sai da regex só fora de `criterios`; os nomes de campo de pessoa ficam). Parecer novo pela ferramenta Write em `docs/reviews/101-specs-e2e-api.md` com `branch: fix/101-specs-e2e-api`, `commit: 43ebaabcbe336ffd04d8a7c09eac6d25f47e713b`, o veredito e `## Achados` com linhas de até 300 caracteres, ou vazio. Commit só do parecer com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad com nome próprio, `git add` explícito); antes, `git -C /home/rodrigoisensee/MetricasDSPD-052g pull --rebase --autostash origin fix/101-specs-e2e-api`, sem `--force`; push em segundo plano com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/fix/101-specs-e2e-api` (`github.com` em allowed_domains). Sem PR, sem merge.
- arquivos: docs/reviews/101-specs-e2e-api.md, e2e/tests-api/ (escopo da entrega revisada, para a conferência; o portão só grava o parecer)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 101-release-filtros-sem-simulado até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/101-release-filtros-sem-simulado.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/101-release para a develop e merge com os checks verdes." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog e merge com o portão verde (o merge até a homolog é do time, pela autorização do dono de 17:51)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva curta da release." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR só de documentos para a develop com o que os agentes gravaram sem commit na árvore principal (revisões de UX e análises) e a segunda rodada do UX do 097 (branch docs/097-ux-recolher-setor), branch docs/101-documentos-da-noite, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E1.9 (qa-engineer): specs velhos do e2e chromium-api que reprovaram o QA da release (A1 a A3 do parecer de QA da release; o A4 investigado), branch fix/101-specs-e2e-api a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-052g. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/fix/101-specs-e2e-api:docs/reviews/101-specs-e2e-api.md` · espera: contém 'commit: 43ebaabcbe336ffd04d8a7c09eac6d25f47e713b'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
