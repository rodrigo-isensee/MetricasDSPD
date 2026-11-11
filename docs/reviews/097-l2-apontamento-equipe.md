---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l2-apontamento-equipe
commit: 18424b56d70cb11bc0428f9cede542b8c4e85b62
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: 097 L2, equipe no Apontamento (parte servidor), volta 1

Diff inteiro `1d697d6a..18424b56` (15 arquivos), com o delta da volta `bca89b99..18424b56` lido em detalhe. Pareceres no mesmo código: QA aprovado (`ac7445c8`, `docs/qa/097-l2-apontamento-equipe.md`), segurança aprovada (`4bea264d`, `docs/security/097-l2-apontamento-equipe.md`). Não refiz os pontos de GRANT nem de LGPD: cito a segurança.

## Execução (`VITEST_MAX_WORKERS=2`, sem `.env`, sem base real)
- `server`: `tests/apontamento-rota.test.ts` e `tests/times-sem-comparacao.test.ts`: `Test Files 2 passed (2)`, `Tests 89 passed (89)`.
- `packages/metricas`: `src/businessmap/apontamento`: `Test Files 1 passed (1)`, `Tests 66 passed (66)`.
- `apontamento-rota.pg.test.ts` roda no job banco do CI e não rodou aqui.

## Leitura
- **Plano L2 e repositório: segue.** O filtro `equipe` é recorte em `filtrar()` da biblioteca T2.5 (`filtros.ts:54`), igual a `projeto` e `tipo`. Nenhuma métrica ganha cálculo próprio no servidor. O servidor só resolve o time do card (`COALESCE(c.equipe, p.equipe)`, `repositorio.ts:36`) e o leva à linha por `equipeDe` (`servico.ts:24`).
- **Contrato aditivo (política de mudança §2): conforme.** `versaoContrato` continua `VERSAO_CONTRATO_APONTAMENTO = 1`. A consulta ganha `equipe` opcional e a resposta ganha `opcoes.equipes` opcional. Nada foi removido nem estreitado. `docs/api/apontamento.md` e `openapi.json` foram atualizados (QA: `openapi:verificar` em dia).
- **Volta 1 (A1 e A2 do QA): corrigida e simples.** Com o filtro ativo, `lerCardsIncompletos` passa a lista resolvida mesmo vazia (`repositorio.ts:201`), e `x = ANY('{}')` zera no Postgres. `filtroDeEquipe` aplica a mesma regra do slug vazio de `equipeDe` (`servico.ts:31-32`). As linhas e os incompletos agora usam a mesma definição de "sem time". O nome resolvido volta pelo slug, de modo que dois nomes com o mesmo slug entram juntos, como na opção.
- **Regras invioláveis: conforme.** Não há agrupamento, contagem nem ordem por time. `opcoes.equipes` sai em ordem neutra e a matriz não ganha nível por time. `times-sem-comparacao.test.ts` trava isso. BusinessMap só.
- **Testes provam algo.** O teste da biblioteca prova a semântica do recorte. Os testes de rota provam os parâmetros do SQL (lista vazia com filtro ativo, `['---']` com `semTime`), e os mutantes MA1 e MA2 do QA foram mortos. O `.pg` prova ponta a ponta as linhas (cada time, "Sem time", vários times, slug inexistente, combinação com `tipo`) e o GRANT. **Falta prova de ponta a ponta no `.pg` para os incompletos com `equipe`**: o arquivo não exercita `ctl_apontamento_cobertura`. A semântica de `ANY('{}')` e do `IS NULL` com `$6` só está provada pelo texto e pelos parâmetros (A1, recomendado). Não bloqueia, porque não há defeito provado e a semântica do Postgres é a esperada.
- **Arquivos fora do escopo declarado: necessários, ficam.** `packages/contratos/src/apontamento.ts` declara o parâmetro `equipe` e `opcoes.equipes`, e sem ele a rota recusaria a chave com 400. `tipos.ts` (`LinhaApontamento.equipe` e `FiltrosApontamento`) e `filtros.ts` (uma linha) põem o recorte na biblioteca compartilhada, como a regra do T2.5 exige. Fazer esse recorte no servidor seria cálculo próprio. O teste da biblioteca é a prova do recorte. `grants.ts` é o GRANT por coluna de `dim_card.equipe`, sem o qual o papel da aba recebe 42501, e já foi conferido pela segurança. Decisão técnica: os cinco ficam.
- **Tamanho:** 195 linhas de código e teste (`server/` e `packages/`), acima da orientação de 150. O conteúdo é um comportamento só (o recorte por time) que atravessa contrato, biblioteca, servidor e GRANT. O corpo do PR (E3.4) deve trazer `teto: excedido, 195 linhas, um recorte que cruza contrato, biblioteca, servidor e GRANT` (A2).
- **Menor:** o teste de contrato `contrato.match(/equipe/gi)?.length <= 6` (`times-sem-comparacao.test.ts:57`) conta palavras e vai cair num comentário futuro. É aceitável como trava, mas é frágil (A3).

## Achados
- A1 (recomendado) server/tests/apontamento-rota.pg.test.ts:234 · o caso 097 L2 não exercita `registroIncompleto` com `equipe` (slug inexistente → 0 cards, `sem-time` → card sem time); a semântica de `ANY('{}')`/`$6` só tem prova por parâmetro. Pôr um card incompleto no `.pg` (pedido técnico).
- A2 (recomendado) server/src/modulos/apontamento/servico.ts:1 · 195 linhas de código e teste, acima de 150: o PR do lote declara `teto: excedido, 195 linhas, <motivo>`.
- A3 (recomendado) server/tests/times-sem-comparacao.test.ts:57 · a contagem `equipe <= 6` no texto do contrato quebra com comentário novo; preferir só os nomes proibidos (`porEquipe`, `porTime`, `matrizEquipe`).
