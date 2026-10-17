## Objetivo
Aplicar no back a decisão do usuário D2 = A: o E7 deixa de mostrar custo em R$ e passa a mostrar a participação percentual de cada sistema pelas entregas do período; junto, dois ajustes de contrato que o review do front do lote 1 pediu (E8/E9 com a janela do cálculo; `concluidoEm` no E6). Tem de entrar antes da promoção para a homolog, porque o front do lote 1 (PR do pedido 028) já mostra o E7 sem R$. Pedido 024, cartão K-114. Crie a worktree `/home/rodrigoisensee/MetricasDSPD-024` com a branch `feature/024-e7-sem-reais` a partir da `origin/develop` atual (`git fetch` antes).

## Ler
- `docs/pedidos/024-e7-sem-reais-participacao.md` (todo).
- `docs/pedidos/011-metricas-tambem-disponiveis.md`: só a linha da **D2 = A** (seção "Pergunta ao usuário (2026-10-17, segurança das táticas, M-1)").
- `packages/metricas/src/businessmap/e7.ts` e `e7.test.ts`; `packages/contratos/src/tambem.ts` (E6, E7, E8, E9); em `docs/api/metricas.md`, as seções do E6 ao E9.
- `packages/metricas/src/core/criterios.ts` (o padrão de `VersaoCriterio` para registrar mudança de critério, T2.6).

## Entregar
- (E1) E7 sem R$: remover `custoRateado`, `custoPorDemanda`, a configuração de custo e as fixtures de custo; publicar por sistema a participação percentual (entregas do sistema ÷ entregas do período), com o mínimo de 20 entregas por sistema ("k de n" abaixo disso, sem percentual); cálculo pela biblioteca compartilhada; contrato, OpenAPI (`openapi:verificar` em dia), `docs/api/metricas.md`, `docs/architecture/regras-metricas.md` e a mudança de critério registrada com data em `criterios.ts` (T2.6); testes atualizados e um teste que falhe se qualquer campo de valor em dinheiro voltar à saída do E7.
- (E1) Antes de mudar o contrato do E7, conferir com `git grep -n -E "custoRateado|custoPorDemanda|participacao" -- web e2e` (na develop atual e na `origin/feature/011-front-estrategicas`) quais campos o front do E7 lê; se o front ler um campo que sai, mantenha o nome que ele usa ou relate a quebra, sem tocar em `web/`.
- (E3) Contratos do E8 e do E9: hoje dizem que o filtro de período atua, mas o cálculo usa janela fixa; alinhar contrato, OpenAPI e `docs/api` à janela que o cálculo usa (não mudar o cálculo).
- (E4) Contrato do E6: trazer `concluidoEm` (data de conclusão) de cada projeto, do mock, com teste.
- (E1, E3, E4) `pnpm run pronto` da raiz da worktree, com `uptime` e `free -m` antes (load abaixo de 4); commits conforme `docs/engineering/praticas.md`, `git add` por caminho, e push da branch.
- Fora do escopo, outras etapas do pedido 024 (citadas de "## Etapas"): "E1.2 (forge:tech-lead): review."; "E1.3 (forge:qa-engineer): QA."; "E2.1 (forge:software-architect): plano §2 E7 e ADR."; "E2.2 (forge:ux-designer): CA do E7 na especificação."
- Fora do escopo: o front do E7 (já segue a regra nova); o PR (pedido a abrir depois do QA); o nome do E7 (pendente de confirmação do usuário).

## Decisões e restrições
- Decisão do usuário D2 = A (pedido 011, 2026-10-17): o E7 mostra a participação percentual de cada sistema pelas entregas do período (ex.: "Fluig: 23% das entregas"), sem R$; a D-1' (custo em R$) e a Q-E7-1 (pró-rata do custo) deixam de valer. Horas apontadas não entram em nenhum cálculo (métrica proibida, seção 7.1 do briefing): se algo no código pedir horas como esforço, pare e relate.
- Regras invioláveis do `CLAUDE.md`: abaixo de 20 itens, sem estatística; nenhuma métrica para avaliação individual; sem comparação entre times; BusinessMap e Acelerato nunca se misturam; cálculo pela biblioteca compartilhada; mudança de critério registrada com data. ADR 0011, ADR 0020, ADR 0003.
- NÃO tocar: `web/`, `e2e/`, `.github/`, a `main`, a develop direto, o diretório principal, as worktrees `-011-fase2` e `-011-front-estrategicas`, os documentos de arquitetura e de UX do E2 (plano, ADR, especificação). Sem `--no-verify` nem `--force`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): `pronto` uma vez, e só com load abaixo de 4 (o QA das operacionais roda o `pronto` dele em paralelo; espere se a máquina estiver carregada).

## Pronto quando
- PQ-1 (push): branch `feature/024-e7-sem-reais` no origin com os commits do E1, E3 e E4.
- PQ-2 (cmd): `pnpm run pronto` da raiz de `/home/rodrigoisensee/MetricasDSPD-024` · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-024 grep -n -i -E "custoRateado|custoPorDemanda" -- packages server docs/api` · espera: linhas=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-024 status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (shas, testes); riscos. Inclui as mudanças de contrato (E6, E7, E8, E9). Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
