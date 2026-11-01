# Retomada do Jarvis (estado salvo antes da troca de conta do dono)

Salvo em 2026-11-01 por volta das 15:50. O dono trocou o login do Claude Code no WSL, e a sessão é reiniciada com `--continue`. Branch do repositório principal: `docs/jarvis-2026-10-23`, com push até `732f3d3` (este arquivo vai no commit seguinte). Prazo: métricas operacionais funcionando na segunda, 2026-11-02, com o recorte "A": BusinessMap FL1 com dado real (O19 a O26 em mock até a F6b) e Acelerato/sustentação com dado real.

## Ao retomar (primeiro)
1. Ver se o PR 188 (F6) terminou: `gh pr view 188 --json state,isDraft,mergeable,statusCheckRollup`. O `forge:tech-lead` da E2.100 (brief `docs/briefs/052-integracao-businessmap-tech-lead-57.md`) estava rodando na hora da troca:
   - ele já tinha renovado `docs/reviews/052-ws1-estrutura.md` (2efa879) e aberto o PR 188 como draft;
   - faltavam `gh pr ready`, a espera pelos checks e o merge (o sandbox barra `gh pr merge`, e aí o merge é do dono).
   - Se o agente morreu na troca, relançar a E2.100 com um brief de retomada que vai só do `gh pr ready 188` aos checks, sem reabrir o PR.
2. Gravar no Histórico do pedido 052 a linha "E2.100 cumprida" ou "parcial", com o número do PR e os checks.
3. Regerar o brief da E2.102 (detalhes abaixo), mandar ao conferente e delegar.

## Pedido 052 (docs/pedidos/052-integracao-businessmap.md): etapa a etapa
- **F6, painel FL1 com origem real ou fictícia por métrica.** Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/052-f6-painel`, ponta `2efa879`. **PR 188 aberto, ainda draft.**
  - Pareceres em dia:
    - review da F6 e da WS1 (E2.97 e E2.100);
    - segurança: `052-fix-coleta` renovado na E2.105 (4ad0045) e F6 na E2.98;
    - QA: WS1 na E2.106 (3578041) e F6 na E2.99;
    - UX: c44bc7b.
  - O review aceitou a exceção de tamanho (cerca de 1962 linhas).
  - Falta: ready, checks verdes, **o dono mescla** (squash).
- **Limpeza do seed mock da base real** (decisão do dono "A", 2026-11-01 14:25). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/052-limpa-seed`, ponta `a217f1e`. Comando `pnpm --filter @metricas-dspd/server run db:limpar-seed [--aplicar]`, código em 26d097c.
  - E2.101, segurança: **aprovada** (a217f1e). Recomendados:
    - A1: `ref_sle`, `ref_alocacao_acordada`, `ref_ficha_resultado` e `ref_alvo_prioridade` saem só pela chave;
    - A2: `lock_timeout` curto antes do `ALTER TABLE`.
  - E2.102, code review: **brief não delegado ainda.**
    - O `tech-lead-58` foi reprovado pelo conferente por dois motivos: a ADR 0024 aparecia descrita como seed, mas ela trata do tipo do card; e o foco não incluía o gatilho append-only nem o papel `dspd_migrador`.
    - O script que montava o brief ficava no scratchpad da sessão antiga e não existe mais. Gerar de novo com `forge-check brief gerar --pedido 052-integracao-businessmap --destino forge:tech-lead --branch feature/052-limpa-seed`, com:
      - ADR 0022: "as linhas da coleta real não são tocadas; só o seed sai";
      - ADR 0024: "nada muda nesta etapa";
      - foco: gatilho append-only de `fato_transicao` e papel `dspd_migrador`, identificação do seed pela versão em `ctl_coleta`, regra dos `ref_*`, `fato_bloqueio` removido além do brief, `ref_versao_criterio` do `dspd_core` com motivo seed-mock (está coberto ou não pela decisão do dono), passo a passo e teto;
      - `commit:` em 26d097c0a51234e7f1c1ecf4aff9939abfb145e6.
    - Rodada de confirmação: `--anterior docs/briefs/052-integracao-businessmap-tech-lead-58.md --ref origin/feature/052-limpa-seed`.
  - Depois: E2.103, QA (`docs/qa/052-limpa-seed.md`, suíte .pg com `PG_TESTE_URL`), e E2.104, PR (**o dono mescla**).
  - Se o review achar que `fato_bloqueio` ou `ref_versao_criterio` estão fora da decisão "A", isso vira pergunta ao dono.
- **Do dono, depois dos dois merges:**
  1. no banco dele, `db:limpar-seed` sem opção (simulação, só contagens) e depois com `--aplicar`;
  2. depois que a F6 estiver mesclada, gerar de novo o mock no esquema próprio, com `DSPD_SCHEMA_PREFIXO_SEED`.
- Com isso, o FL1 e a sustentação ficam só com dado real (a sustentação já lê o esquema do Acelerato, recarregado em 2026-11-01).
- **E2.81 (tech-lead):** limpeza das branches já mescladas. Ainda não iniciada.

## Pedido 056 (docs/pedidos/056-acelerato-mysql.md)
- PR 187 mesclado (develop 81fcd63). A releitura do dono (E4.47) passou: 5093 chamados e 26590 etapas.
- Pendente, só depois de segunda:
  - cartão com os recomendados A1 a A5 do review e A1 da segurança;
  - o teste do QA guardado em `/tmp/claude-1000/qa-056-e445/`;
  - a worktree 056 (`feature/056-dominio-listas`), que já foi mesclada e entra na limpeza;
  - a worktree 056d (destacada em 81fcd63), que é a de execução do dono.

## Worktrees
- 041 e 041b: antigas, do pedido 041.
- 052b a 052f: branches já mescladas, aguardam a E2.81.
- 052g: limpeza do seed, em curso.
- 052h: F6, PR 188.
- 056: mesclada.
- 056d: execução do dono.

## Decisões do dono pendentes
- Nenhuma bloqueante agora.
- Pode surgir uma no review da E2.102: se `fato_bloqueio` e `ref_versao_criterio` entram na decisão "A".
- Opcional: o dono conferir 3 a 5 cards do BusinessMap sem responsável.

## Ações pendentes do dono
- Mesclar o PR 188 e, depois, o PR da limpeza.
- Rodar `db:limpar-seed` (simulação, depois `--aplicar`) e gerar o mock de novo.
- `.env.example` e `.env.homolog.example` estão alterados no clone principal, sem commit, por mudança que não é do Jarvis. O dono decide o que fazer com eles.

## Depois de segunda (sem bloquear)
- Cartão de triagem para 15 alertas do Dependabot na branch padrão (1 crítico, 3 altos).
- Recomendados da F6 (A1, A3 e A4) e da limpeza (A1 e A2), e a troca de nome do contador.
- Conferências de entrega que ficaram puladas.
- Retrospectiva com o agile-coach.
- Brief `security-engineer-31`: a mesma descrição errada da ADR 0024 passou pelo conferente. Registrar como tardio.

## Melhorias para o Forge (lista acumulada)
- `forge-check pr` não devia contar parecer de `docs/ux` (nem de qa, reviews ou security) como mudança relevante: cada parecer commitado força outra rodada de renovações.
- `docs/security/_modelo.md` citado pelo brief, mas inexistente no projeto.
- Mensagem ao conferente: o `forge-check brief mensagem` imprime linhas `jarvis-recorrente` antes de `modo: brief`, e o hook do Agent recusa a mensagem.
- Itens anteriores: `--volta` × etapa nova; Desde por branch; target-size; PATH do pnpm; revalidação por merge da develop; timeout do brief gerar; `gh pr checks --watch` estoura 600 s; pre-push do Forge sem skip em sessão de agente; neutralidade varrendo __pycache__; hook recusa `git branch` e `git worktree list` ao conferente; `forge-check pr` não lê o clone de contribuição.
