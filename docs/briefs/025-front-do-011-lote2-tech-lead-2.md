Agente destino: forge:tech-lead
Pedido: 025-front-do-011-lote2
Branch: feature/025-front-taticas   Base: develop   Base-sha: 568ea481bde436e220d23e99142aa2bfe4718e76

## Objetivo
Review incremental do 025 sobre o head 5108fcd: os E2E e ajustes de teste do QA (f06a6fb, 9e11071) e a correção de L2T-001 e L2T-002 (5108fcd), feitos depois do review aprovado em b6c7673. Etapa E1.3 do pedido 025, cartão K-110. Worktree `/home/rodrigoisensee/MetricasDSPD-025`, branch `feature/025-front-taticas` (head 5108fcd).

## Ler
- `git diff b6c7673..5108fcd` (testes E2E, `e2e/playwright.config.ts`, `server/tests/pg/servidor-api-mock.ts`, `web/src/features/complementares/`).
- `/home/rodrigoisensee/MetricasDSPD-025/docs/reviews/025-front-taticas.md` (o parecer anterior).
- `docs/pedidos/025-front-do-011-lote2.md`: Decisões e o Andamento de 2026-10-21.

## Entregar
- (E1) Atualizar o parecer `docs/reviews/025-front-taticas.md` com a revisão incremental `b6c7673..5108fcd` (E2E novos e ajustados: determinismo, sem `waitForTimeout`, sem asserção retirada; `E2E_PORTA` e o servidor de teste das grafias; a correção de L2T-001 com o `baseDoCartao` do `CartaoComplementar`), frontmatter `commit: 5108fcd`; aprovado ou reprovado, com achados bloqueantes em `## Achados`; validar com o `forge-check docs` antes do commit.
- (E3) No mesmo parecer, conferir L2T-002 (plural na T14) sem `n` nem total do projeto (T14-M1 = B).
- (E2, E4) No mesmo parecer, confirmar que R-1 = B e o B11-001 não mudaram.
- (E1) Gravar o parecer com a ferramenta Write ou Edit (não por script no Bash), para o hook registrar a autoria; um commit só do parecer, com `git add` explícito por caminho, mensagem conforme a seção de commits do `docs/engineering/praticas.md` e a linha `Cartão: K-110`; push da branch.

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 2 (T10 a T14), com testes de unidade e o `pnpm run pronto` verde." e "E1.4 (forge:security-engineer): review de segurança da tela da T14 (reidentificação: R-1 = B e T14-M1 = B na exibição), em paralelo com o E1.3." · etapas de outro papel, cumpridas.
- "E1.2 (forge:qa-engineer): plano de testes e E2E do lote 2 a partir da especificação, em paralelo com o E1.1." e "E1.5 (forge:qa-engineer): QA e parecer." · etapas de outro papel (o QA reconfirma o head depois deste review).
- "E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação." e "E1.7 (forge:tech-lead): PR para a develop (squash) e merge; limpeza da branch." · etapas de outro momento, depois do QA.
- Corrigir código (achado vira parecer); L2T-003 (cartão K-133); o quadro; PR.

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

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-025 log -1 --format=%h -- docs/reviews/025-front-taticas.md` · espera: o hash do commit do parecer.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/025-front-taticas` igual ao head local.
- PQ-3 (cmd): `grep -c '^commit: 5108fcd' /home/rodrigoisensee/MetricasDSPD-025/docs/reviews/025-front-taticas.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
