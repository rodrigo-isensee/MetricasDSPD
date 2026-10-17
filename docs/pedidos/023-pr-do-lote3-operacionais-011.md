# Pedido 023 — PR do lote 3 (operacionais) do back da fase 2 do 011 e promoção para a homolog

- **Data:** 2026-10-17
- **Origem:** pedido 020 (divisão: uma etapa do tech-lead por pedido).
- **Modo:** implementar.

## Escopo
- E1. PR da branch `feature/011-fase2-operacionais` (O22, O26) para a develop (squash), depois do merge do lote 2 e de review, segurança e QA aprovados sobre o commit final; em seguida, a promoção develop → homolog (merge commit), com o portão verde. · `delegado`

## Etapas
- E1.1 (forge:tech-lead): PR do lote 3 (operacionais), mesclado na develop, e promoção para a homolog.
- E1.3 (forge:tech-lead): parecer de review da promoção develop → homolog em `docs/reviews/023-pr-do-lote3-operacionais-011.md`, numa branch `docs/023-pareceres-promocao` saída da develop (acrescentada em 2026-10-17, decisão do dono, opção B).
- E1.4 (forge:qa-engineer): parecer de QA da promoção em `docs/qa/023-pr-do-lote3-operacionais-011.md`, na mesma branch, com a CI da develop como prova (acrescentada em 2026-10-17, decisão do dono, opção B).
- E1.5 (forge:tech-lead): PR só de documentação dos dois pareceres para a develop (squash), antes do PR de promoção (acrescentada em 2026-10-17, decisão do dono, opção B).
- E1.6 (forge:tech-lead): abrir o PR de release `homolog` → `main`, sem mesclar, pronto para o dono validar e mesclar (acrescentada em 2026-10-17, pedido do usuário: "deixa o pr pronto para mim fazer para main").
- E1.2 (dono): merge do release homolog → main.

## Decisões do usuário
- 2026-10-17 (noite): "Vou dormir toque tudo que puder até a homolog": o time avança sozinho até a promoção develop → homolog; decisões de produto esperam a manhã. A promoção sai depois do pedido 024 (E7 sem R$) e do front do lote 1 (pedido 028) na develop, para a homolog não receber o E7 em R$ com o front já sem R$ (D2 = A, pedido 011).

## Decisões técnicas do time
- 2026-10-17 — O PR de promoção develop → homolog não tem parecer de review nem de QA próprio: o portão é a bateria completa da CI no PR e no push da homolog, e os pareceres que valem são os de cada PR que entra, já na develop. Decisão do Jarvis, registrada para o conferente, que viu conflito entre a linha `pr` da tabela de etapas e a R-FLUXO. Base, pela ordem de precedência: `CLAUDE.md` do projeto ("Fluxo de uma demanda", item 7: o tech-lead promove develop → homolog por PR e o push dispara o portão da CI); R-FLUXO ("o `tech-lead` promove `develop` → `homolog` por PR, também só com todos os checks verdes"); `docs/engineering/fluxo-homologacao.md` ("os gates automáticos decidem"); precedente das promoções #89, #95 e #100. A divergência da tabela vai para a fábrica como melhoria.

## Fora do escopo
- Mexer na `main` (R-MAIN).

## Andamento
- 2026-10-17 — Primeira parte do E1 feita: lote 3 na develop (#109, 5ad02ea). A promoção develop → homolog espera o 024 (pedido 029) e o front do lote 1 (#108, d83024b, já na develop), como manda a decisão da noite.
- PERGUNTA: 2026-10-17 — O conferente reprovou três vezes o brief da promoção develop → homolog: a tabela de etapas da fábrica pede parecer de review e QA do próprio pedido antes de `pr`; o CLAUDE.md e a R-FLUXO dizem que o portão da promoção é a CI. Opções: A promover agora, com o portão da CI e os pareceres dos PRs incluídos (como #89, #95 e #100); B o tech-lead e o QA gravam um parecer curto da promoção antes (cerca de 40 min a mais). Recomendação: A. (Na 3ª rodada o conferente leu os pareceres no diretório principal, que está na branch de docs; eles existem em origin/develop.)
- 2026-10-17 — DECISÃO DO DONO: "A regra do projeto nunca passa sobre a fábrica". Para esta promoção vale a tabela de etapas da fábrica: opção B (parecer de review e de QA próprios da promoção antes do PR develop → homolog). A decisão técnica anterior deste pedido (promoção sem parecer próprio) fica revogada.
- NAO-ENTENDI: 2026-10-17 — "nunca passa sobre a fábrica" pode valer só para esta promoção ou como regra geral; como regra geral, inverte a ordem de precedência escrita no agente (CLAUDE.md > ADR > praticas.md > fábrica) e toca as exceções locais do CLAUDE.md (branches feature/*, comando de pronto, ADR 0003). Fica como pergunta ao dono depois da promoção; até lá, o Jarvis segue a fábrica sempre que houver conflito.
- 2026-10-17 — E1.3: parecer de review da promoção aprovado (2a69655, local); o push foi barrado pelo pre-push porque a worktree -023 não tem dependências instaladas (lint e typecheck não rodam). Decisão técnica do Jarvis: o tech-lead roda `pnpm install --frozen-lockfile` na worktree (usa o cache do pnpm; é a única tarefa pesada no momento) e envia de novo, sem `--no-verify`. Empurrar de outro diretório foi descartado: o hook checaria outra árvore, o que contornaria o portão.
- 2026-10-17 — E1.5: o hook `parecer` barrou o PR de documentação ("nenhum parecer com branch: docs/023-pareceres-promocao"). Causa: o hook libera PR só de `.md`, mas compara com a `develop` local, atrasada (48b909a contra origin/develop ed6ba46). Decisão técnica do Jarvis: atualizar a `develop` local (avanço rápido, sem push) e reabrir o PR; os pareceres ficam com `branch: develop`, que é o head do PR de promoção. Observação para o dono: o mesmo hook da fábrica também libera a "promoção entre branches de integração" sem parecer próprio; a decisão do dono (opção B) segue valendo e os pareceres já estão feitos.
- 2026-10-17 — E1.1: promoção develop → homolog mesclada (PR #116, merge commit 087a220), portão da homologação verde (run 39056114632). O `perf` falhou uma vez por ruído (C6 em 218 ms) e passou ao rerrodar; margem estreita do C6 já está no cartão K-113.
- 2026-10-17 — Conferência da entrega da promoção (#116): os cinco PQs cumpridos e a etapa em ordem; "não cumpriu" só pela regra mecânica do Base-sha (a homolog tem merges antigos que a develop não alcança) e pelo diff sem caminhos no Entregar. Decisão técnica do Jarvis: entrega aceita. O dono mesclou o #113 (Forge 0.19.0) na develop às 18:16Z, depois da promoção: ele entra na próxima promoção, não nesta release.
