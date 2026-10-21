Agente destino: forge:security-engineer
Pedido: docs/pedidos/035-resolver-prs-do-dependabot-124-125-126.md
Branch: dependabot/npm_and_yarn/develop/dev-dependencies-71717c5124 (PR #130)   Base: develop   Base-sha: bfe0cb6311bfafb0a40b1a8254e3bae4af09a549

## Objetivo
Parecer de segurança (R-SEGURANCA: dependência atualizada é gatilho) do PR #130 do Dependabot, que substituiu o #125 e o #129: 7 atualizações de dependências de desenvolvimento, sem versão maior. Etapa E2.1 do pedido 035. O #124 e o #126 já foram mesclados pelo dono; este parecer cobre só o #130 (head bb536e41ab7ded4b4bfb64d94233990166ce80a1).

## Ler
- `docs/pedidos/035-resolver-prs-do-dependabot-124-125-126.md` (Escopo, Decisões do usuário e a linha de Andamento sobre o E1.2).
- O diff do PR: `/tmp/claude-1000/-home-rodrigoisensee-MetricasDSPD/bb718795-0b13-41a0-8af6-548bc3e933c2/scratchpad/035/pr-130.diff` (954 linhas: os `package.json` de raiz, `server`, `web`, `e2e`, `tools/docs-contratos`, `tools/pesquisa` e o `pnpm-lock.yaml`).
- Modelo de frontmatter: o cabeçalho de `docs/security/k085-grants-por-coluna.md`.

## Entregar
- (E2) Avaliar: só dependências de desenvolvimento e de teste; versões (correção e uma versão menor do @axe-core/playwright); pacotes novos ou transitivos novos no lock; mudança de origem (registry) ou de integridade; scripts de instalação novos; nada que chegue ao código de produção da API ou do coletor.
- (E2) Gravar o parecer em `/home/rodrigoisensee/MetricasDSPD/docs/security/035-dependabot-130.md` com a ferramenta Write (frontmatter no padrão do projeto, `tipo: revisao-seguranca`, `pedido: 035-resolver-prs-do-dependabot-124-125-126`, `branch: dependabot/npm_and_yarn/develop/dev-dependencies-71717c5124`, `commit: bb536e41ab7ded4b4bfb64d94233990166ce80a1`, `parecer:`, `revisor: forge:security-engineer`), sem commit (o security-engineer não tem Bash; o arquivo vai à develop no PR de documentação do Jarvis).

## Fora do escopo
- "E2.2 (forge:tech-lead): review dos três PRs.", "E2.3 (forge:qa-engineer): QA dos três PRs.", "E2.4 (forge:tech-lead): PR de documentação com os pareceres e merge dos três PRs na develop." e "E3.1 (forge:tech-lead): PR só de documentação do Jarvis para a develop, mesclado." · etapas de outro papel; vêm depois.
- "E1.1 (forge:tech-lead): comentários `@dependabot ignore` no #125 e conferir que o grupo foi refeito só com as cinco correções." e "E1.2 (forge:tech-lead): no #129 (que substituiu o #125), `@dependabot ignore` para o TypeScript 6 e, se preciso, `@dependabot recreate`, até o grupo ficar sem versão maior (decisão do dono de 2026-10-21, opção A)." · etapas de outro papel, já feitas.
- "E4.1 (forge:tech-lead): parecer de review da promoção, promoção develop → homolog e PR de release aberto.", "E4.2 (forge:qa-engineer): parecer de QA da promoção." e "E4.3 (dono): validar e mesclar o PR de release na `main`." · etapas de outro papel ou do dono.
- Os #124 e #126 (já mesclados pelo dono); mudar qualquer arquivo além do parecer; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Pedido do usuário (pedido 035, 2026-10-20): "estou com tres prs o 124,125 e 126 com problemas reoslva".
- 2026-10-17 — DECISÃO DO DONO (pedido 033): opção B (só as 6 correções agora: vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test; eslint 10 com @eslint/js 10 e TypeScript 7 viram cartões próprios). A contagem "6" foi corrigida pelo dono em 2026-10-20 (opção A, abaixo): são 5.
- 2026-10-20 — DECISÃO DO DONO: opção A (entram as 5 correções da lista: vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test; eslint 10, @eslint/js 10 e TypeScript 7 ficam de fora, como cartões próprios).
- 2026-10-21 — DECISÃO DO DONO: opção A (no #129, tirar o TypeScript 6, versão maior, com o mesmo tratamento do 7; aceitar jsdom 30.1.3 e @axe-core/playwright 4.14.0).
- 2026-10-17 — DECISÃO DO DONO (pedido 033): opção B (só as dev-dependencies agora; o react-router 8 vira cartão próprio). Recibo aceito.
- 2026-10-17 — DECISÃO DO DONO (pedido 023): "A regra do projeto nunca passa sobre a fábrica". Para esta promoção vale a tabela de etapas da fábrica: opção B (parecer de review e de QA próprios da promoção antes do PR develop → homolog). A decisão técnica anterior deste pedido (promoção sem parecer próprio) fica revogada.
- R-CONFORMIDADE: bloqueio não se contorna; vira relato.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/security/035-dependabot-130.md`
- PQ-2 (cmd): `grep -c '^parecer: ' /home/rodrigoisensee/MetricasDSPD/docs/security/035-dependabot-130.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
