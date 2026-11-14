---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k287-ids-antigos-sust
commit: f1005198173f69e21bb7c41cbee7887c8d16e089
parecer: aprovado
revisor: tech-lead
data: 2026-11-13
---

# Code review: K-287, a Sustentação só com o slug das equipes (E4.42)

Volta 0, head d3a14b45. Diff lido: `git diff e5092e05...d3a14b45` (base develop e5092e05; 17 arquivos, +72 -90; código e teste: 162 linhas, acima da orientação de 150 do M14: o corpo do PR precisa de `teto: excedido, 162 linhas, <motivo>`; o volume vem de testes e specs que trocam o id antigo pelo slug, um comportamento só). Commits: `0871ff3d refactor(sustentacao)`, `e42c225d test(sustentacao)`, `d3a14b45 test(filtros)`, Conventional Commits, cada um coerente.

## O que foi conferido
- **Link antigo não quebra calado:** sem o apelido, `lerLista` (`web/src/features/filtros/codec.ts:31`) manda `totvs`, `senior` e `fluig` para `invalidos`, que já alimenta o aviso `aviso-filtros-invalidos`; o `RedirecionaSustentacao` repassa o valor como veio e o codec o recusa. Coberto por `codec.test.ts:161`, `redireciona.test.tsx:75` e `equipe.test.tsx:243` (aviso com `equipe "totvs"`, URL limpa, Equipe: Todas).
- **Contrato com slug não recusa dado real:** `idEquipeSlug` (`packages/contratos/src/filtros.ts:11`) é a mesma regex do `idSlug` que o servidor já aplicava (`server/src/modulos/metricas/schemas.ts:10`), e os ids das opções saem de `slug(nome)` (`server/src/modulos/referencia/servico.ts:26`), que só produz `[a-z0-9-]` sem hífen nas pontas. O único caso fora (nome cujo slug passe de 60 caracteres ou fique vazio) já era recusado pelo servidor antes do K-287; não é regressão. O `filtrosSustentacaoSchema` não é usado para validar entrada em tempo de execução, só tipo e testes.
- **A6 sem objeto:** com o `APELIDO_EQUIPE_SUSTENTACAO` fora, não há mais busca por chave em objeto; a validação é `includes` sobre a lista de ids das opções, e `codec.test.ts:172` prova `constructor`, `tostring` e `__proto__` como inválidos. Aceitável.
- **Os 3 arquivos de `packages/metricas` fora do brief:** `acelerato/comum.ts` perde o import de `idEquipeSustentacao` (sem ele não compila), `filtros.intensivo.test.ts` e `varredura.test.ts` trocam `EQUIPES_SUSTENTACAO_ID` pelos slugs. Consequência direta da remoção; legítimos.
- **Fontes separadas:** nada do BusinessMap entra no caminho da Sustentação; `selecionarAC` compara `equipeId` dos chamados do Acelerato com o filtro; os testes do fluxo que citam `fluig` (`e7`, `e9`, `t11`, `businessmap.test.ts`) são sistema/equipe do BusinessMap e não mudaram.
- **Regras invioláveis:** sem cálculo novo, sem coluna de pessoa, histórico intocado.

## Execução
- CI do head pelos check-runs do commit d3a14b45: `testes` **failure** (run 43538800107, job 132274211564); `rapida`, `filtro`, `build`, `banco`, `openapi`, `seguranca`, `imagem` verdes; `e2e`, `perf` pulados.
- `npx vitest run src/tendencia.test.ts` em `packages/metricas` (TZ=UTC, 2 workers): 2 falham, 37 passam; reproduz o CI.
- `npx vitest run src/features/filtros/codec.test.ts src/app/redireciona.test.tsx` em `web/`: 52 passam.

## Achados
- A1 (bloqueante) packages/metricas/src/tendencia.test.ts:254 · o teste ainda espera que `['totvs']` dê 20 e `['senior']` dê 5 na `TENDENCIA_SUST`; com o apelido removido dá 0, e o job `testes` do CI fica vermelho (run 43538800107). Trocar por `sssc-totvs` e `sssc-senior`, e, se quiser manter a prova da remoção, afirmar que `['totvs']` dá 0.
- A2 (bloqueante) packages/metricas/src/tendencia.test.ts:271 · mesmo defeito no teste "097 L7a": `volume(['totvs'])` espera 20 e recebe 0; o nome do teste também afirma o apelido que saiu. Ajustar expectativa e nome.
- A3 (recomendado) web/src/data/mock/MockFonteMetricas.test.ts:40 · o caso "filtros estreitos" da Sustentação usa `equipe: ['fluig']`, que agora seleciona zero chamados; o teste segue verde, mas deixou de exercitar o recorte estreito com dado. Trocar por `sssc-fluig`.
- A4 (recomendado) packages/metricas/src/complementares.test.ts:271 · o `S8` "sem-referencia" usa `equipe: ['fluig']`; passa agora pelo recorte vazio, não pelo motivo original (4 semanas da SSSC FLUIG). Trocar por `sssc-fluig` e conferir que a expectativa se mantém.

## Veredito (volta 0)
Reprovado: A1 e A2 deixam o CI vermelho no head. O desenho da remoção está correto; a volta é só nos testes da tendência (e, recomendado, A3 e A4).

## Revalidação (volta 1, head f1005198)
- Delta lido: `forge-check parecer delta docs/reviews/097-k287-ids-antigos-sust.md` (intervalo d3a14b45..f1005198, sem o que veio da develop no merge 4daef93b). No domínio: `packages/metricas/src/tendencia.test.ts`, `packages/metricas/src/complementares.test.ts`, `web/src/data/mock/MockFonteMetricas.test.ts` (commit `f1005198 fix(metricas)`, +7 -6) e `packages/contratos/src/filtros.ts` (campo `setores?`, vindo da develop pelo merge, PR #388; fora deste review).
- A1 resolvido: `tendencia.test.ts:254` usa `sssc-totvs` (20) e `sssc-senior` (5) e afirma `['totvs']` = 0, prova da remoção do apelido.
- A2 resolvido: `tendencia.test.ts:272` espera `['totvs']` = 0, e o nome do teste L7a diz que o id antigo não seleciona mais nada.
- A3 resolvido: `MockFonteMetricas.test.ts:40` usa `sssc-fluig`, que é o id das opções do mock (`nucleoMock.ts:233`, `slug(nome)`) e o `equipeId` dos chamados (`acelerato/indice.ts:93`); o recorte estreito volta a ter dado.
- A4 resolvido: `complementares.test.ts:271` usa `sssc-fluig`; a expectativa `sem-referencia` se mantém.
- Execução: CI do head pelos check-runs do commit f1005198 (run 43540656683): `testes` **success** (era failure em d3a14b45); `rapida`, `filtro`, `build`, `banco`, `openapi`, `seguranca`, `imagem` verdes; `e2e`, `perf` pulados. Local: `vitest run src/tendencia.test.ts src/complementares.test.ts` em `packages/metricas`, 60 passam; `vitest run src/data/mock/MockFonteMetricas.test.ts` em `web/`, 18 passam.
- Tamanho: `git diff --numstat --no-renames origin/develop...HEAD` sem `.md` soma 175 linhas; o corpo do PR mantém `teto: excedido, <n> linhas, troca do id antigo pelo slug em testes e specs, um comportamento só`.

## Veredito
Aprovado no head f1005198: A1 a A4 resolvidos, CI verde.
