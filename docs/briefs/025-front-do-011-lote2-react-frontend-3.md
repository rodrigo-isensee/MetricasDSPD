Agente destino: forge:react-frontend
Pedido: 025-front-do-011-lote2
Branch: feature/025-front-taticas   Base: develop   Base-sha: 568ea481bde436e220d23e99142aa2bfe4718e76

## Objetivo
Pôr no painel tático (/tatico) as métricas do lote 2 do pedido 011 (T10, T11, T12, T13 e T14), cujo back em mock já está na develop; etapa E1.1 do pedido 025, cartão K-110. Terceira rodada da entrega 07969c8 + 32a509f: um brief único com todo o Entregar (implementação, formalizações e o teste do E4), sem código novo. A worktree `/home/rodrigoisensee/MetricasDSPD-025` (branch `feature/025-front-taticas`, head 32a509f) já existe: não crie outra.

## Ler
- `docs/pedidos/025-front-do-011-lote2.md`: Escopo (E4) e a linha de 2026-10-21 em Andamento.
- `web/src/features/complementares/taticas.test.tsx`, linhas 98 a 108 (o teste atual do E4), e `web/src/features/complementares/taticas.tsx`, linhas 55 a 97.

## Entregar
- (E1) Cartões T10, T11, T12, T13 e T14 em /tatico conforme as fichas da especificação, com estados (§6), microcopy (§9), catálogo de métricas e testes de unidade (cobertura exigida do `web/`).
- (E2) T14: "outros times" oculto quando o back sinalizar que soma menos de 2 pessoas (R-1 = B).
- (E3) T14: com "outros times" oculto, a tela mostra só a fatia do meu time, sem `n` nem o total do projeto (T14-M1 = B; suposição S1 do pedido), com teste que prova que o total não aparece.
- (E1) Commits conforme a seção de commits do `docs/engineering/praticas.md`, com `git add` explícito por caminho e a linha `Cartão: K-110`; `pnpm run pronto` verde rodado da raiz da worktree; documentação afetada atualizada na mesma entrega (catálogo, ajuda); push da branch.
- (E4) Teste de unidade do T10 cujos dados de origem têm o mesmo fornecedor com grafias que diferem só em caixa ou espaços (por exemplo "TOTVS", "Totvs" e " totvs "), passando pelo caminho real dos dados da tela (a fonte de dados do mock com a normalização do back, sem reimplementá-la no front), provando que a tela mostra uma linha só para esse fornecedor. Feito em 32a509f. Se a normalização não estiver alcançável pelo caminho do front, pare e relate (não normalize no front).
- (E1) Ficam formalmente no escopo desta entrega, sem mudança (decisão técnica registrada no pedido, Andamento de 2026-10-21): `packages/contratos/src/cartoes.ts` e `cartoes.test.ts` (catálogo de cartões com T10 a T14 e os Leia junto recíprocos), `web/src/features/preferencias/preferencias.test.tsx` (contadores do catálogo) e `web/src/features/operacional/components/CartaoBloqueados.tsx` (Leia junto para o T10).
- (E1) Esta rodada (terceira, sem código novo): confirme que o head da branch continua 32a509f, sem mudança pendente na worktree.

## Fora do escopo
- "E1.2 (forge:qa-engineer): plano de testes e E2E do lote 2 a partir da especificação, em paralelo com o E1.1." · etapa de outro papel.
- "E1.3 (forge:tech-lead): code review." e "E1.7 (forge:tech-lead): PR para a develop (squash) e merge; limpeza da branch." · etapas de outro papel.
- "E1.4 (forge:security-engineer): review de segurança da tela da T14 (reidentificação: R-1 = B e T14-M1 = B na exibição), em paralelo com o E1.3." · etapa de outro papel.
- "E1.5 (forge:qa-engineer): QA e parecer." · etapa de outro papel.
- "E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação." · etapa de outro papel.
- Back das táticas (contrato da API, cálculo, `server/`, `packages/metricas`); T14-ordem; operacionais além do Leia junto do `CartaoBloqueados.tsx`; integrações; o Worker do pedido 037 (worktree -037: não tocar em `MockFonteMetricas`); o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual nem comparação entre times (a T14 não nomeia nem ranqueia outros times); abaixo de 20 itens não publicar estatística; nenhum cálculo no front (percentis e tempos vêm da biblioteca compartilhada, via API).
- ADR 0003: F2 CLS < 0,1 e C6 < 200 ms em /tatico (a S0 do pedido 037 viu CLS 0,103 em /tatico numa execução: reserve altura dos cartões).
- R-TETO: `pnpm run pronto` e Vitest são pesados; antes de cada execução, `pgrep -fa 'playwright|vitest'` vazio (sem `flock`). R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-025 log -1 --format=%h` da branch · espera: o hash do último commit da entrega (32a509f).
- PQ-2 (push): `git ls-remote origin refs/heads/feature/025-front-taticas` igual ao head local.
- PQ-3 (cmd): `pnpm run pronto` na raiz de `/home/rodrigoisensee/MetricasDSPD-025` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
