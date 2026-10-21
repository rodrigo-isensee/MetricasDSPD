# Pedido 038: registrar a versão 0.27.0 do Forge no repositório

- **Data:** 2026-10-21
- **Origem:** usuário: "ok atualize a versao do forge no repositorio, baixo o fonte mais rewscente e continue o trabalho".
- **Modo:** implementar
- **Objetivo:** atualizar a versão do Forge registrada no repositório para a 0.27.0 (a mais recente publicada, tag v0.27.0 = main do Forge).
- **Clareza:** 2 confirmado, 1 técnico; 1 pergunta feita (aceita com "ok").

## Diagnóstico (2026-10-21)
- Plugin carregado na sessão: 0.27.0. `.forge/versao` na develop e na main: 0.26.0.
- PR #134 (`forge/upgrade-0.27.0` → develop, aberto pela conta do dono): DIRTY. A branch saiu de 00a634f (develop antiga) e o diff contra a develop atual tem 47 arquivos; o PR em si só muda `.forge/versao`.

## Escopo
- E1. Levar à develop a versão 0.27.0 em `.forge/versao` pelo PR #134 (conflito resolvido, diff final só da versão e dos pareceres), com review, QA e merge por squash. · `confirmado`

## Etapas
- E1.1 (forge:tech-lead): atualizar a branch `forge/upgrade-0.27.0` com a develop (merge da develop na branch, sem `--force`), resolver o conflito mantendo 0.27.0, push, parecer de review em `docs/reviews/038-atualizar-forge-0-27-0.md`.
- E1.2 (forge:qa-engineer): parecer de QA em `docs/qa/038-atualizar-forge-0-27-0.md` (CI do PR verde e `pnpm run pronto`).
- E1.3 (forge:tech-lead): merge por squash do #134 na develop com os checks verdes e limpeza da branch (R-FLUXO, "Depois do merge").
- E1.4 (dono): a versão chega à main na próxima release homolog → main.

## Fora do escopo
- Promover para homolog e main (vai na próxima release) · `confirmado`
- Ajustes de projeto pedidos pela 0.27.0 além do arquivo de versão (se o review achar algum, vira cartão próprio) · `técnico`

## Suposições
- "baixe o fonte mais recente" = sincronizar as branches locais com a origin (feito pelo Jarvis: `docs/jarvis-2026-10-20-noite` avançou para 568ea48) e usar a última versão publicada do Forge (0.27.0, igual à main do Forge) · `suposição` · base: estado do repositório e tags do Forge
- "continue o trabalho" = relançar os pedidos 037 (E2.2) e 025 (E1.1) com os briefs já aprovados · `confirmado`

## Critério de pronto
- PQ-1 `.forge/versao` na origin/develop igual a `0.27.0` · prova: merge · `técnico`

## Decisões do usuário (registro literal)
DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias, /home/rodrigoisensee/prompt-jarvis-forge-2026-10-21.md).
DECISÃO DO DONO (2026-10-21): "ok atualize a versao do forge no repositorio, baixo o fonte mais rewscente e continue o trabalho" (resposta à pergunta de passar o PR #134 ao forge:tech-lead).

## Registro de clareza
PERGUNTA: 2026-10-21 · passar o PR #134 ao tech-lead para resolver o conflito e mesclar a 0.27.0
ESCOPO+: nenhuma
NAO-ENTENDI: nenhuma
DEVOLVIDA: nenhuma

## Histórico
- 2026-10-21: pedido aberto; branch de docs do Jarvis avançada para origin/develop (568ea48).
- 2026-10-21 10:20: E1.1 barrada pelo hook R-CONFORMIDADE (`.forge/versao`: só o dono altera); merge abortado, worktree -038 limpa em 0c81b1c. A resolução do conflito volta ao dono; depois o tech-lead faz o parecer de review, o QA e o merge.
- 2026-10-21 10:32: o dono resolveu o conflito (801e8ec) e mesclou o #134 na develop (794b982) pela própria conta, sem os pareceres de review e QA (E1.1 parecer, E1.2 e E1.3 não feitos pelo time). `.forge/versao` na develop = 0.27.0 (PQ-1 cumprido). Falta a limpeza da branch e da worktree -038 (R-FLUXO).
- MELHORIA (tech-lead): o Forge não prevê um fluxo de upgrade em que o agente grave `.forge/versao` com autorização do dono; levar ao Forge.
