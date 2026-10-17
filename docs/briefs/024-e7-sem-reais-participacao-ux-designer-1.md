Agente destino: forge:ux-designer
Pedido: docs/pedidos/024-e7-sem-reais-participacao.md
Branch: feature/024-e7-sem-reais   Base: develop   Base-sha: d83024ba35763c0b56bebf8184cdbdf1d8da26e0

## Objetivo
Levar o nome novo do E7, "Entregas por sistema" (decisão do dono de 2026-10-17, pedido 021, opção A, que é a sua sugestão A-10), à especificação e aos documentos de UX do pedido 011. Etapa E5.2 do pedido 024, cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais`.

## Ler
- `docs/pedidos/024-e7-sem-reais-participacao.md`, seções "Escopo" (E5) e "Etapas".
- Na worktree, as linhas com "Capacidade por sistema" em `docs/ux/metricas-tambem-disponiveis/01-cobertura.md`, `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` e `docs/ux/revisao-011-front-estrategicas.md` (use a busca de texto da sua ferramenta).

## Entregar
- (E5) Em `01-cobertura.md` e `02-especificacao.md`, trocar o nome do E7 por "Entregas por sistema" (título, catálogo, critérios de aceite que citem o nome) e registrar a mudança com a data no histórico de revisões da especificação, citando a decisão do dono.
- (E5) Em `docs/ux/revisao-011-front-estrategicas.md`, acrescentar ao fim uma nota curta de 2026-10-17: A-10 aceita pelo dono (pedido 021) e aplicada no pedido 024; o texto antigo das seções anteriores não se reescreve (registro histórico).
- Sem commit: os arquivos ficam gravados na worktree; o tech-lead os commita antes de começar a rodada 2 do review (prática dos pedidos 021 e 024 para quem não tem Bash).

## Fora do escopo
- "E1.4 (forge:react-frontend): ajustar o teste do front que lê `custoConfigurado` e os testes que citam o título do E7 (E5)" · etapa de outro papel; `web/` e `e2e/` não se tocam.
- "E5.1 (forge:node-backend): nome "Entregas por sistema" no cartão do E7 (`packages/contratos`), contratos e documentação gerada, depois do E1.6." · já feita.
- "E1.2 (forge:tech-lead): review." e "E1.3 (forge:qa-engineer): QA." · etapas de outro papel.
- "E2.1 (forge:software-architect): plano §2 E7 e ADR.", "E3.1 (forge:node-backend): contrato do E8 e do E9 alinhado à janela do cálculo." e "E4.1 (forge:node-backend): `concluidoEm` no contrato do E6." · já feitas.
- As pendências baixas da revisão (A-9, A-11, `aria-hidden` do ícone `info`), mudar o layout do cartão, `docs/qa/`, `docs/reviews/`, `docs/architecture/`; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 021, 2026-10-17): o E7 passa a se chamar "Entregas por sistema" (opção A).
- Decisão do usuário D2 = A (pedido 011): E7 sem R$, participação percentual por entregas.
- NÃO tocar: código, `packages/`, `server/`, `web/`, `e2e/`, `.github/`, o diretório principal, a worktree `-011-fase2`.

## Pronto quando
- PQ-1 (cmd): `grep -c 'Capacidade por sistema' /home/rodrigoisensee/MetricasDSPD-024/docs/ux/metricas-tambem-disponiveis/02-especificacao.md` · espera: igual '0'
- PQ-2 (cmd): `grep -c 'Entregas por sistema' /home/rodrigoisensee/MetricasDSPD-024/docs/ux/metricas-tambem-disponiveis/02-especificacao.md` · espera: linhas=1
- PQ-3 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-024/docs/ux/revisao-011-front-estrategicas.md` com a nota de 2026-10-17 sobre a A-10 no fim.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (arquivos e trechos trocados); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
