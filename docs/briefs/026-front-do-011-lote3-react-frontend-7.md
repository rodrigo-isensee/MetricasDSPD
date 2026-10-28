Agente destino: forge:react-frontend
Pedido: 026-front-do-011-lote3
Tipo: volta
Branch: feature/026-lote3-operacionais   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709
Volta-de: docs/briefs/026-front-do-011-lote3-react-frontend-6.md sha256 9f91483efbf84e5eab0c693ba8737758d8a480fde01839b2d8a25dd42382210a

## Objetivo
Etapa E1.1 do pedido 026 (cartão K-111), volta da revisão de UX (E1.2, aprovada com ressalvas): aplicar no front do lote 3 (O19 a O26) os textos e ajustes decididos na revisão `docs/ux/revisao-026-front-operacionais.md` e nas duas decisões do dono de hoje, antes do QA. Worktree `/home/rodrigoisensee/MetricasDSPD-026` (já existe; não a recrie), branch `feature/026-lote3-operacionais`, head 78c6fcb12149d61afe91568423d6fca59158e165 (code review aprovado, já no remoto).

## Ler
- Esta volta: o Objetivo acima é copiado do brief anterior (o forge-check exige o mesmo texto numa volta); o ponto de partida agora é o head 6199302d327dd50472d2bdd28465d979fc3d6e66 (QA do E1.3, reprovado). Esta volta só trata o A1 do QA.
- `/home/rodrigoisensee/MetricasDSPD-026/docs/qa/bugs/L3-001-leia-junto-da-visao-diaria-nao-leva-ao-o19-e-o20.md`.
- `/home/rodrigoisensee/MetricasDSPD-026/web/src/features/complementares/LeiaJunto.tsx` e `leiajunto.test.tsx`; `web/src/lib/destinoCartao.ts`.
- docs/qa/026-lote3-operacionais.md (parecer, lido de 6199302): só `## Achados`.

## Entregar (volta 1)
- Escopo da entrega original, já conferido e inalterado; esta volta só corrige o achado A1 abaixo (E1, E1.1).
- (E2, E3) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).
- (qa 6199302 A1) Na visão diária, "Leia junto: O19" (BLOQUEADOS) e "O20" (O1) não fazem nada: tratam o par como do mesmo painel, mas O19 e O20 só existem na semanal. Falha SIS-CONS-02. Bug L3-001. Navegar a `cadencia=semanal#o19` (e `#o20`) quando o par só existe na outra cadência do mesmo painel, com o foco no cartão de destino; teste unitário em `leiajunto.test.tsx` que falha sem a correção. [web/src/features/complementares/LeiaJunto.tsx:34]
- (qa 6199302 A2) F4 resposta visual 134 a 141 ms contra 100 ms (ADR 0003): sem ação nesta volta. A branch ainda não tem a nova regra de medição do F4 do pedido 041 (sem a medição a frio, n >= 20); depois que o 041 entrar na develop, o tech-lead traz a develop para a branch e o reteste do QA mede de novo na branch e na develop. Só se a regressão continuar, volta ao react-frontend.
- (qa 6199302 A3) CLS a 375 px em /operacional: sem ação nesta volta; corrigido no pedido 041, chega pela develop (mesmo passo do A2).
- (qa 6199302 A4) CLS do Resumo a 375 px: sem ação nesta volta; mesma referência (041), chega pela develop.
- (qa 6199302 A5) COMP-01 da Sustentação a 1280 px: sem ação nesta volta; corrigido no 041, chega pela develop.
Recomendados:
- (qa 6199302 A6) vazio e "Amostra insuficiente" juntos: padrão anterior ao lote 3, decisão de UX; não nesta volta (cartão próprio da UX, depois do lote).
- (qa 6199302 A7) nota do O26 x mínimo de 20: é o A12 do review, texto da especificação da UX; não nesta volta (mesmo cartão da UX).
- (qa 6199302 A8) exceção da varredura de pessoa: aceita como está; segue o termo que a UX fixar no cartão acima.

## Fora do escopo
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outro papel; não toque em `server/`, `packages/metricas` nem no contrato (a opção A dispensa campo novo).
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · cumprida; A9 mantém a exceção do O21 em `packages/contratos/src/cartoes.test.ts:145` (não mexa).
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outro papel, depois desta; leva o A4 do review (contagens do catálogo nas E2E); não toque em `e2e/`.
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · etapa de outro papel; o re-review vem depois desta volta.
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · etapa de outro papel.
- Integrações reais; E2E; push; PR; o quadro; ler ou editar o `.env`; as worktrees dos pedidos 041 e 042; trazer a develop para a branch.

## Decisões e restrições
- Suíte por vez: o tech-lead do 043 pode estar rodando a suíte unittest do Forge; antes do `pnpm run pronto`, inclua `unittest` no `pgrep` abaixo e espere ela acabar. O reteste do E1.3 vem depois desta volta e do merge da develop.
- DECISÃO DO DONO (2026-10-27): recibo do lote 3 aceito, com acréscimo ("Sim mas faca o que precisar de back mokado, so deixe as integracoes reais pro final").
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-27): integrações só depois de todo o backlog; prioridade nas operacionais ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais") (pedido 042).
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-27): ficha do O26 (A10), opção A ("A"): ajustar a ficha à frase da tela (faixa mais comum, com percentual e P85 por faixa quando houver 20 itens ou mais); sem campo novo no contrato.
- DECISÃO DO DONO (2026-10-27): R8 do O21, opção A ("A"): a frase "A volta mais comum" ignora a reabertura (retorno a partir de "Entregue"), que segue na linha própria "reaberto".
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual (O22 e O26 sem pessoa nem ranking); abaixo de 20 itens não publicar estatística; mudança de critério marcada nos gráficos (T2.6); painel não agrega (nada de somar faixas na tela); dúvida de regra de negócio vira pergunta, não inferência (relate e pare naquela métrica).
- R-TETO e a decisão de 2026-10-23: o react-frontend do 041 roda testes E2E na worktree -041. Antes de rodar os testes do `web` ou o `pnpm run pronto`, `pgrep -fa 'playwright|vitest|vite'`; com outra suíte em curso, espere ela acabar. O hook barra `$`, crase e `?` no Bash: use o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` como prefixo literal. R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio vira relato.
- ADR 0003: CLS < 0,1 em /operacional; o que entrar no O2 (R6) reserva altura.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-026 log -1 --format=%H` · espera: o sha40 do último commit desta entrega
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 status --porcelain` · espera: linhas=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 diff 6199302d327dd50472d2bdd28465d979fc3d6e66 --name-only -- server packages e2e docs` · espera: linhas=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 diff 6199302d327dd50472d2bdd28465d979fc3d6e66 --name-only -- web/src/features/complementares/leiajunto.test.tsx` · espera: linhas=1
- PQ-5 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-026 && pnpm run pronto` · espera: rc=0
- PQ-6 (cmd, do autor): `forge-check entrega 026-front-do-011-lote3 --branch feature/026-lote3-operacionais --base develop --base-sha e342a2cd71c46df5acf60b756637ebf5a6c84709 --etapa codigo --desde c72b955a8d373eff99e6c7916634c7eba70461c9` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
