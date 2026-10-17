Agente destino: forge:tech-lead
Pedido: docs/pedidos/023-pr-do-lote3-operacionais-011.md
Branch: develop   Base: homolog   Base-sha: 0eebfe7213d2d5706ea3604a9965f36ebff1ae8d

## Objetivo
Promover a develop para a homolog (segunda parte do E1 do pedido 023), pela ordem do usuário da noite de 2026-10-17 ("toque tudo que puder até a homolog"). A develop (0cad9f3c66c072bbf9f488c166a8ca796cc4d720) já tem o lote 3 do back (#109), o front do lote 1 (#108) e o E7 sem R$ com o nome novo (#114), além de #102, #103, #105, #107 e #115 (os pareceres da promoção). Etapa E1.1 do pedido 023. Sem worktree: tudo pelo GitHub (`gh`), a partir de `/home/rodrigoisensee/MetricasDSPD`.

## Ler
- `docs/pedidos/023-pr-do-lote3-operacionais-011.md` (Escopo, Decisões do usuário e Andamento).
- `docs/engineering/fluxo-homologacao.md`, seções sobre a promoção develop → homolog (merge commit, portão da CI e congelamento da candidata).
- `git log --oneline origin/homolog..origin/develop`.

## Entregar
- (E1) Abrir o PR `develop` → `homolog` com o corpo listando os PRs que entram (#102, #103, #105, #107, #108, #109, #114, #115), cada um com uma linha do que muda; terminar com as linhas de atribuição da sessão.
- (E1) Esperar os checks exigidos do PR ficarem verdes; vermelho por ruído só se rerroda uma vez; vermelho de verdade: pare e relate. Mesclar por merge commit (`gh pr merge develop --merge`, nome da branch, sem `--admin`).
- (E1) Depois do merge, acompanhar o portão da CI disparado pelo push na `homolog` (o workflow da homologação) até terminar e relatar o resultado, com o link do run. Não apague `develop` nem `homolog`.

## Fora do escopo
- "E1.2 (dono): merge do release homolog → main." · etapa do dono; continua no pedido.
- O PR #113 (registro do Forge 0.19.0, do dono); qualquer mudança de código, pareceres ou `.github/`; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica"; para esta promoção vale a tabela de etapas da fábrica (opção B), com parecer próprio antes do PR.
- Decisão do usuário (pedido 023, 2026-10-17, noite): "Vou dormir toque tudo que puder até a homolog"; a promoção sai depois do 024 e do front do lote 1 na develop (D2 = A, pedido 011). As duas condições estão cumpridas (#108 e #114 na develop).
- Promoção develop → homolog por PR com merge commit, mesclada pelo tech-lead (`CLAUDE.md` do projeto, "Fluxo de uma demanda", item 7). A promoção tem parecer próprio de review e de QA (`docs/reviews/023-pr-do-lote3-operacionais-011.md` e `docs/qa/023-pr-do-lote3-operacionais-011.md`, `branch: develop`, `commit: ed6ba46`, ambos aprovados, já na develop pelo PR de documentação), pela DECISÃO DO DONO acima; rode `forge-check pr 023-pr-do-lote3-operacionais-011 --ref develop --base homolog` antes de abrir o PR e pare se acusar algo. Cite no corpo do PR esses dois pareceres e os de cada PR que entra (#105 `011-fase2-estrategicas`, #107 `011-fase2-taticas`, #109 `011-fase2-operacionais`, #103 `k102-perf-semanal`, #108 `011-front-estrategicas`, #114 `024-e7-sem-reais`; #102 é só documentação). R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`; sem `--admin`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): nada pesado local; o portão é a CI.

## Pronto quando
- PQ-1 (pr): PR `develop` → `homolog` aberto.
- PQ-2 (merge): PR mesclado na `homolog` por merge commit.
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD fetch -q origin && git -C /home/rodrigoisensee/MetricasDSPD merge-base --is-ancestor 0cad9f3c66c072bbf9f488c166a8ca796cc4d720 origin/homolog && echo contem` · espera: igual 'contem'
- PQ-5 (sha): merge commit da promoção na `homolog`, com pais `0eebfe7213d2d5706ea3604a9965f36ebff1ae8d` e `0cad9f3c66c072bbf9f488c166a8ca796cc4d720`.
- PQ-4 (run): run do portão da homologação no push da `homolog` com conclusão relatada (link e resultado).

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (número do PR, checks, sha do merge, link e resultado do portão); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
