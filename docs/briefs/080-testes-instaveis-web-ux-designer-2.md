Agente destino: forge:ux-designer
Pedido: 080-testes-instaveis-web
Tipo: volta
Branch: feature/080-testes-instaveis-web   Base: develop   Base-sha: 852b9406f019223acd82563cd21fc3a3d42a493a
Etapa: review   Cobre: E1.4

## Objetivo
Volta da revisão de interface do pedido 080 (K-192): o seu parecer `/home/rodrigoisensee/MetricasDSPD-056d/docs/ux/080-revisao-leia-junto.md` saiu com os campos do cabeçalho como itens de lista (`- commit: ...`), e o PQ-2 e o `forge-check` leem a linha começando em `commit:`. Só a forma muda.

## Ler
- O seu parecer atual, pela ferramenta Read.

## Entregar
- "E1.4 (ux-designer): revisão de interface, só se o alvo de toque mudar a tela." (E1.4)
- (E2) (E1.4) Regravar o parecer pela ferramenta Write (sem editar depois), com o mesmo conteúdo e veredito, mas com os campos `pedido:`, `branch:`, `commit:`, `data:`, `agente:` e `veredito:` no começo da linha, sem o marcador `- `, e a frase mal formada da seção Conferido reescrita (28 px entre centros de linhas, folga de 4 px acima dos 24 px do alvo); sem commit.
- (E1) Nada a entregar aqui: o K-173 fechou sem mudança de tela.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 07:38).
- NÃO tocar: código, testes, o pedido, `KANBAN.md`, outras worktrees, a `develop`, a `homolog` e a `main`; o único arquivo é o seu parecer.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (react-frontend): implementação de E1 e E2 num lote só (mesmo papel, arquivos de teste da web e o alvo de toque)." · etapa de outra delegação; feita
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva do pedido 080." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `grep -c '^commit: 6b7b3f5ee780e077efe3cc7bed7dfb0c3d933c82' /home/rodrigoisensee/MetricasDSPD-056d/docs/ux/080-revisao-leia-junto.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
