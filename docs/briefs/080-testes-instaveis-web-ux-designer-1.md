Agente destino: forge:ux-designer
Pedido: 080-testes-instaveis-web
Tipo: codigo
Branch: feature/080-testes-instaveis-web   Base: develop   Base-sha: 852b9406f019223acd82563cd21fc3a3d42a493a
Etapa: review   Cobre: E1.4

## Objetivo
Revisão de interface da E1.1 do pedido 080 (K-192): a entrega acrescenta `gap-y-1` (4 px entre linhas quebradas) nos dois contêineres do "Leia junto" (`LeiaJunto.tsx`), na ponta 6b7b3f5ee780e077efe3cc7bed7dfb0c3d933c82, como folga para o alvo de toque de 24 px (WCAG 2.5.8). Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, só leitura no código; o review do tech-lead corre em paralelo.

## Ler
- Com a ferramenta Read: `/home/rodrigoisensee/MetricasDSPD-056d/web/src/features/complementares/LeiaJunto.tsx`.
- docs/pedidos/080-testes-instaveis-web.md: só `## Escopo` e, do `## Histórico`, a linha da entrega da E1.1.

## Entregar
- "E1.4 (ux-designer): revisão de interface, só se o alvo de toque mudar a tela." (E1.4)
- (E2) (E1.4) Conferir se o espaçamento novo mantém o padrão visual do "Leia junto" e o alvo de toque de 24 px nas larguras 1280 e 375, só leitura; parecer em `/home/rodrigoisensee/MetricasDSPD-056d/docs/ux/080-revisao-leia-junto.md` pela ferramenta Write (sem editar depois), com `pedido: 080-testes-instaveis-web`, `branch: feature/080-testes-instaveis-web`, `commit: 6b7b3f5ee780e077efe3cc7bed7dfb0c3d933c82`, veredito e bloco `## Achados` (até 300 caracteres por achado, regra citada só pelo ID); sem commit (o tech-lead leva o arquivo ao PR).
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
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-056d/docs/ux/080-revisao-leia-junto.md`
- PQ-2 (cmd): `grep -c '^commit: 6b7b3f5ee780e077efe3cc7bed7dfb0c3d933c82' /home/rodrigoisensee/MetricasDSPD-056d/docs/ux/080-revisao-leia-junto.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
