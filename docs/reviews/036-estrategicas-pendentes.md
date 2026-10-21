---
tipo: review
contrato: 1
pedido: 036-estrategicas-pendentes
branch: feature/036-estrategicas-pendentes
commit: 90d35a62eba38f81d6ab096d80be740c5d677c53
parecer: aprovado
revisor: tech-lead
data: 2026-10-20
---
# Code review: estratégicas pendentes (pedido 036, etapa E1.3)

- Branch `feature/036-estrategicas-pendentes`, commits `bf137a9`, `f3a2995`, `154f43a` e `a711371` sobre a `develop` `12018de` (ponta atual de `origin/develop`; a integração já está feita, nada a trazer).
- `a711371` é a edição do forge:ux-designer na especificação (E3.3), que ele não pôde commitar (sem Bash); revisei o diff e commitei só esse arquivo, com `git add` explícito, autoria citada no corpo e `Cartão: K-119`.
- Referências: `docs/pedidos/036-estrategicas-pendentes.md` (Escopo, Etapas, Andamento), `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (§5 E7, §11), `docs/engineering/praticas.md` (§8 e §9), ADR 0003 (F2).
- Ferramentas: o `praticas.md` não marca regra como "decidida por: `<comando>`". `pnpm run pronto` rodado por mim da raiz da worktree no `a711371`: rc=0 (lint, formato, tipos, cobertura de 100% em todos os pacotes; web 1078 testes, metricas 1082, contratos 161, server 591 + 84 pulados; orçamento de bundle F6/F8/F9/F11 ok; `docs:check` ok). O `pronto` não roda o E2E: o IF-A alterado fica com a execução do QA (4 rotas verdes, registrada no IFA-001) e com o job `e2e` da CI do PR.

## Leitura

- **E3, texto do E7 (bf137a9 + a711371).** Catálogo (`web/src/content/catalogo-metricas.ts:535`) e especificação (§5, linha 238) trazem exatamente a pergunta da decisão do dono: "Qual a participação de cada sistema nas nossas entregas?". A §11 ganha a linha de 2026-10-20 e corrige a nota de 2026-10-17 (que dizia que a pergunta não mudava) sem apagar o histórico. Nenhum teste citava o texto antigo (busca no repositório, fora `docs/pedidos` e a revisão de UX histórica, não acha mais "capacidade vai para manter"). Texto neutro, sem pessoa nem comparação entre times; a pergunta descreve contagem de entregas, coerente com a D2 = A (sem valor monetário) e com o comentário de `estrategicas.tsx:312`.
- **E1, FA-006 (f3a2995).** Só documentação do reteste: api 0,021 em 3 de 3, mock 0,001 em 3 de 3, abaixo do F2 (CLS < 0,1) da ADR 0003; a E1.2 não se aplica e o limite não muda. A falha de C6 em mock (212 ms numa execução) foi corretamente separada como ruído fora do bug (K-113), e a porta 4173 ocupada virou o K-120.
- **E2, IF-A de /estrategico (154f43a).** `minimo: 1` só na rota `/estrategico` (`e2e/tests/intensivo-filtros.spec.ts:394`), onde o cenário garante cartões "Não afetado por" (filtro de período 6m diferente do padrão 12m); a asserção (`:430`) roda antes do `expect(divergentes)` e faz a lista vazia falhar. As rotas de `/operacional` e `/tatico` ficam como estavam, o que é o esperado: o `/operacional` é fora do escopo (lote 3). A mutação descrita no bug (`!==` → `===`) faz o teste de `/estrategico` falhar, conforme o registro do QA. O teste é determinístico (filtros fixos na URL, mock). Atende ao item 11 do checklist da fábrica (teste que percorre lista afirma um mínimo).
- Regras invioláveis: nenhuma métrica ou visão individual, nenhum ranking, BM × AC não se tocam no diff; nada de cálculo novo (nenhuma passagem pela `core` a conferir).
- Commits: Conventional Commits em português, um por mudança. O `154f43a` ficou sem a linha `Cartão: K-091` (§9 do `praticas.md`); como o commit já foi enviado e não se reescreve (R-VERIFY), a linha vai na mensagem do squash do PR (E1.5).

## Achados

- A1 (recomendado) e2e/tests/intensivo-filtros.spec.ts:394 · commit `154f43a` sem a linha `Cartão: K-091` (§9 do `praticas.md`); sem reescrever o histórico, incluir `Cartão: K-091` (e `K-119` do E3) na mensagem do squash do PR para a `develop` (E1.5).
- A2 (recomendado) docs/qa/bugs/IFA-001-nao-afetado-sem-verificacao-em-operacional-e-estrategico.md:36 · "fica para as operacionais, pedido 036" contradiz o pedido 036, que põe o IFA-001 do `/operacional` fora do escopo (vai com as operacionais, lote 3, pedido seguinte); o QA pode corrigir o número numa próxima edição do bug, sem bloquear.

## Veredito

Aprovado. Segue para o QA (E1.4) sobre o head deste parecer.

## Revalidação (delta)

`forge-check delta` sobre o parecer anterior listou só `docs/ux/revisao-036-e7-pergunta.md` (+31, linhas 1-31), a revisão de UX (E1.6), documento novo, sem código: lido inteiro, veredito do UX aprovado e zero achado bloqueante. Já lido e mantido: o restante da branch (E2, E3 e commits `bf137a9` a `a711371`). Parecer segue aprovado (HEAD revisado `90d35a6`).
