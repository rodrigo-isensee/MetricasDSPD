Agente destino: forge:security-engineer
Pedido: 025-front-do-011-lote2
Branch: feature/025-front-taticas   Base: develop   Base-sha: 568ea481bde436e220d23e99142aa2bfe4718e76

## Objetivo
Review de segurança da tela da T14 (risco de reidentificação de pessoas e de times na exibição), em paralelo com o code review. Etapa E1.4 do pedido 025, cartão K-110. Worktree `/home/rodrigoisensee/MetricasDSPD-025`, branch `feature/025-front-taticas` (head 32a509f, conferida).

## Ler
- `docs/pedidos/025-front-do-011-lote2.md`: Escopo (E2 e E3) e Decisões.
- `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`: §5, ficha T14.
- `web/src/features/complementares/taticas.tsx` (cartão da T14) e os testes da T14 em `taticas.test.tsx`; `docs/contratos/metricas/T14.md`.

## Entregar
- (E2, E3) Parecer de segurança em `docs/security/025-t14-reidentificacao.md`: se a tela da T14 permite reidentificar pessoa ou time quando "outros times" está oculto (R-1 = B) e se a fatia do meu time aparece sem `n` nem total do projeto (T14-M1 = B), sem nomear nem ranquear outros times; texto, tooltip, tabela, rótulos acessíveis e dados no DOM. Aprovado ou reprovado, com achados bloqueantes numa seção `## Achados`.
- (E4) No mesmo parecer, confirmar que o nome do fornecedor exibido no T10 é dado de empresa e não identifica pessoa (allow-list do `CLAUDE.md`).
- (E2) Um commit só do parecer, com `git add` explícito por caminho, mensagem conforme a seção de commits do `docs/engineering/praticas.md` e a linha `Cartão: K-110`; push da branch (se o tech-lead commitar ao mesmo tempo, `git pull --rebase` antes do push, sem `--force`).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 2 (T10 a T14), com testes de unidade e o `pnpm run pronto` verde." · etapa de outro papel, cumprida (32a509f, conferida).
- "E1.2 (forge:qa-engineer): plano de testes e E2E do lote 2 a partir da especificação, em paralelo com o E1.1." · etapa de outro papel.
- "E1.3 (forge:tech-lead): code review." · etapa de outro papel.
- "E1.5 (forge:qa-engineer): QA e parecer." · etapa de outro papel.
- "E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação." · etapa de outro papel.
- "E1.7 (forge:tech-lead): PR para a develop (squash) e merge; limpeza da branch." · etapa de outro papel.
- Back da T14 (cálculo e contrato da API no `server/` e em `packages/metricas`); corrigir código (achado vira parecer); o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual nem comparação entre times (a T14 não nomeia nem ranqueia outros times); abaixo de 20 itens não publicar estatística; nenhum cálculo no front (percentis e tempos vêm da biblioteca compartilhada, via API).
- ADR 0003: F2 CLS < 0,1 e C6 < 200 ms em /tatico (a S0 do pedido 037 viu CLS 0,103 em /tatico numa execução: reserve altura dos cartões).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-025 log -1 --format=%h -- docs/security/025-t14-reidentificacao.md` · espera: o hash do commit do parecer.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/025-front-taticas` igual ao head local.
- PQ-3 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-025/docs/security/025-t14-reidentificacao.md`

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
