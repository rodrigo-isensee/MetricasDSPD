Agente destino: forge:qa-engineer
Pedido: 025-front-do-011-lote2
Branch: feature/025-front-taticas   Base: develop   Base-sha: 568ea481bde436e220d23e99142aa2bfe4718e76

## Objetivo
Brief único do QA do 025 (etapas E1.2 e E1.5, cartão K-110): registra o plano e os E2E já entregues (f06a6fb, 9e11071) e pede o reteste do head 222a0a8, com a correção de L2T-001 e L2T-002 (5108fcd, revisada em 222a0a8), e o parecer atualizado com as decisões do dono já tomadas. Worktree `/home/rodrigoisensee/MetricasDSPD-025`, branch `feature/025-front-taticas` (head 222a0a8).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-025/docs/qa/025-front-taticas.md` (o parecer anterior, seções de defeitos e "Decisões pendentes").
- `docs/pedidos/025-front-do-011-lote2.md`: Decisões (a de L2T e a de D1/D2) e o Andamento de 2026-10-21.

## Entregar
- (E1) Feito em f06a6fb e 9e11071 (só registro, sem refazer): plano de testes do lote 2, E2E de /tatico para T10 a T14 (estados, microcopy, catálogo, Leia junto), F2 CLS e C6 de /tatico, `E2E_PORTA`, servidor de teste das grafias e as contagens atualizadas de E2E existentes.
- (E2, E3) Feito em f06a6fb (só registro): E2E da T14 com "outros times" oculto (R-1 = B e T14-M1 = B), inclusive em frentes, e axe do cartão. Trabalho desta rodada: reteste do L2T-002 no head (T14: "1 demanda", "2 demandas", "1 frente", sem `n` nem total).
- (E4) Feito em f06a6fb (só registro): E2E do T10 com as grafias de "TOTVS" numa linha só.
- (E1) Trabalho desta rodada: reteste do L2T-001 no head (T13 em Frentes com o `n` das frentes, nunca "147 de 20"); rodar `e2e/tests-api/tatico-011-lote2.spec.ts` e `e2e/tests-api/t10-grafias.spec.ts` no head com porta própria; fechar L2T-001 e L2T-002 nos arquivos de bug.
- (E1) Trabalho desta rodada: atualizar o parecer `docs/qa/025-front-taticas.md`: frontmatter `commit: 5108fcd` (o head de código; depois dele só o parecer de review), a seção "Decisões pendentes" substituída pelas decisões do dono de 2026-10-21 (L2T-001 e L2T-002 corrigidos; L2T-003 pendência do PR no cartão K-133; D2 pendência no K-132), e manter o D1 listado como pendência do PR no K-131, pela decisão do dono, com a nota de que o E2.3c do pedido 037 o atribuiu ao `reuseExistingServer` (a reavaliação é do K-131); `aceite_usuario` só pelo que o dono decidiu; validar com o `forge-check docs`.
- (E1) Um commit do parecer e dos arquivos de bug atualizados, com `git add` explícito por caminho, gravando o parecer com a ferramenta Write ou Edit (não por script), mensagem conforme a seção de commits do `docs/engineering/praticas.md` e a linha `Cartão: K-110`; push da branch.

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 2 (T10 a T14), com testes de unidade e o `pnpm run pronto` verde." · etapa de outro papel, cumprida (5108fcd).
- "E1.3 (forge:tech-lead): code review." e "E1.4 (forge:security-engineer): review de segurança da tela da T14 (reidentificação: R-1 = B e T14-M1 = B na exibição), em paralelo com o E1.3." · etapas de outro papel, cumpridas (222a0a8 e 35686fd).
- "E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação." e "E1.7 (forge:tech-lead): PR para a develop (squash) e merge; limpeza da branch." · etapas de outro papel, depois desta.
- L2T-003 (K-133) e D2 (K-132): só listar; corrigir código; o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual nem comparação entre times (a T14 não nomeia nem ranqueia outros times); abaixo de 20 itens não publicar estatística; nenhum cálculo no front (percentis e tempos vêm da biblioteca compartilhada, via API).
- ADR 0003: F2 CLS < 0,1 e C6 < 200 ms em /tatico (a S0 do pedido 037 viu CLS 0,103 em /tatico numa execução: reserve altura dos cartões).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- DECISÃO DO DONO (2026-10-21): defeitos baixos do QA do 025, opção A ("A"): corrigir agora L2T-001 (T13 em Frentes: "Amostra insuficiente: 147 de 20 itens mínimos") e L2T-002 (T14: "Meu time: 1 demandas"); L2T-003 (CLS de 0,073 a 0,100 em /tatico com equipe na API, herdado) segue como pendência listada no PR, em cartão próprio.
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.
- R-TETO: uma suíte pesada por vez; antes de cada execução, `pgrep -af 'node .*(vitest|playwright)'` sem processo de outra worktree (o 037 corrige o W037-001 ao mesmo tempo); use porta própria (`E2E_PORTA`).

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-025 log -1 --format=%h -- docs/qa/025-front-taticas.md` · espera: o hash do commit do parecer atualizado.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/025-front-taticas` igual ao head local.
- PQ-3 (cmd): `grep -c '^commit: 5108fcd' /home/rodrigoisensee/MetricasDSPD-025/docs/qa/025-front-taticas.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
