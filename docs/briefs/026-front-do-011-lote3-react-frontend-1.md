Agente destino: forge:react-frontend
Pedido: docs/pedidos/026-front-do-011-lote3.md
Tipo: codigo
Branch: feature/026-lote3-operacionais   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E1.1 do pedido 026 (cartão K-111): pôr no painel operacional (/operacional) as 8 métricas do lote 3 (O19, O20, O21, O22, O23, O24, O25 e O26), seguindo a especificação de UX e o padrão dos lotes 1 e 2 (cartões complementares). Crie a worktree com `git -C /home/rodrigoisensee/MetricasDSPD worktree add /home/rodrigoisensee/MetricasDSPD-026 -b feature/026-lote3-operacionais e342a2cd71c46df5acf60b756637ebf5a6c84709` e trabalhe só nela.

## Ler
- `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`: seções O19 a O26 (linhas 54 a 160).
- `docs/architecture/features/metricas-tambem-disponiveis.md`: seções O19 a O26 (linhas 95 a 230) e a seção 3, "Proteção de pessoa" (linha 338).
- Como modelo: `web/src/features/complementares/taticas.tsx` e `taticas.test.tsx` (lote 2) e `web/src/features/operacional/OperacionalPage.tsx`.

## Entregar
- (E1) Cartões das 8 métricas no /operacional, ligados à fonte de dados existente (mock), com os estados da especificação (carregando, vazio, amostra insuficiente abaixo de 20 itens, erro) e os "Leia junto" do catálogo; testes de unidade de cada cartão.
- (E1) Métrica cujo dado não existe ainda na fonte mock: monte a tela contra o contrato de `packages/contratos` com o estado "sem dado" e relate qual falta (o E2.1, em paralelo, completa o back); não calcule no front.
- (E2) Back em mock: não nesta delegação (E2.1, em paralelo, do node-backend).
- (E1) Commits com `Cartão: K-111`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`; `pnpm run pronto` completo uma vez, da raiz da worktree, antes do commit final; sem push e sem PR.

## Fora do escopo
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outro papel; não toque em `server/`, `packages/metricas` nem no contrato.
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outro papel.
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outro papel.
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · etapa de outro papel.
- Integrações reais; E2E (é do QA); push; PR; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): recibo do lote 3 aceito, com acréscimo ("Sim mas faca o que precisar de back mokado, so deixe as integracoes reais pro final").
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-27): integrações só depois de todo o backlog; prioridade nas operacionais ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais") (pedido 042).
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual nem comparação entre times (O26 e O22 sem nome de pessoa nem ranking); BusinessMap e Acelerato nunca se misturam; abaixo de 20 itens não publicar estatística; tempo, percentil e Monte Carlo só pela biblioteca compartilhada (`packages/metricas`); dúvida de regra de negócio vira pergunta, não inferência (relate e pare naquela métrica).
- R-TETO e a decisão de 2026-10-23: antes de rodar Vitest ou `pnpm run pronto`, `pgrep -fa 'playwright|vitest|vite'` sem outra suíte em curso (o QA do pedido 041 roda na worktree -041); se houver, espere ela acabar. O hook barra `$`, crase e `?` no Bash: use o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` como prefixo literal. R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio vira relato.
- ADR 0003: CLS < 0,1 e orçamento de interação em /operacional; reserve a altura dos cartões.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-026 log -1 --format=%H` · espera: o sha40 do último commit desta entrega
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 status --porcelain` · espera: linhas=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 diff e342a2cd71c46df5acf60b756637ebf5a6c84709 --name-only -- server packages/metricas` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
