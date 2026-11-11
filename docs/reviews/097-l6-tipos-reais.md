---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l6-tipos-reais
commit: 4bae9c60c8ca32a512a215f1a525d8f254f0be4a
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: L6 do 097, parte servidor (E4, opções de filtro do dado real)

Diff lido: `git diff 1d697d6a..4bae9c60` (5 arquivos, +36 -10): `server/src/modulos/referencia/repositorio.ts`, `servico.ts`, `server/tests/app.test.ts`, `server/tests/painel-real-f6.pg.test.ts`, `docs/api/metricas.md`. Plano: `docs/analises/097-filtros-plano.md`, seção 2 (opção T-A) e linha L6 da seção 6.

## O que foi conferido
- **Escopo:** faz o que a T-A pede. `opcoes.tipos` (BusinessMap) = `TIPOS_FILTRO` filtrado pelas categorias presentes em `dim_card` com `granularidade = 'story'`, ids de `TIPO_ID`, na ordem do contrato, sem `Incidente`; `opcoes.prioridades` (Acelerato) = `PRIORIDADES` filtrado pelas presentes em `dim_chamado`. A parte do front (BarraFiltros, codec, taticas) fica para o L6 front, como no plano.
- **Repositório e papel da API:** as duas consultas seguem o padrão do módulo (`Consultavel`, `Esquemas`, SQL sem entrada do usuário, logo sem injeção). Só leem `tipo`, `granularidade` (`dim_card`) e `prioridade` (`dim_chamado`), colunas que a API já lê em `lerCards` e `lerChamados` (`metricas/repositorio.ts:54` e `:107`); nenhuma coluna de pessoa, nenhuma contagem.
- **Contrato (política de mudança §2):** forma da resposta inalterada; as opções viram subconjunto do mesmo enum; a entrada `tipo` e `prioridade` continua o enum. Sem mudança de contrato, sem `openapi.json` a mexer.
- **Documentação:** `docs/api/metricas.md` atualizado nas duas linhas (`tipos` e `prioridades`, base vazia = lista vazia).
- **Regras invioláveis:** só listas de opção; nada compara times nem expõe pessoa; BusinessMap e Acelerato em consultas separadas.
- **Testes de ausência de `incidente`:** `app.test.ts` devolve `Incidente` e uma categoria fora do enum no falso de banco e exige a lista exata (`melhoria`, `bug-interno`), o que prova o filtro; base vazia exige `tipos: []`; prioridades com `P9` fora do enum e ordem P1..P5 provadas. `painel-real-f6.pg.test.ts` afirma `not.toContain('incidente')` e iguala os nomes ao `DISTINCT` da base. O falso casa `SELECT DISTINCT tipo` antes do ramo genérico `dim_card`, então não mascara a consulta nova.
- **Performance:** `DISTINCT` sem índice dedicado em `dim_card` e `dim_chamado`; tabelas de dimensão pequenas e resposta com `Cache-Control: private, max-age=60`. Aceitável; sem achado.

## Testes rodados
`npx vitest run tests/app.test.ts tests/painel-real-f6.pg.test.ts --maxWorkers=2` em `server/`, no commit revisado: 15 passaram, 6 pulados (o arquivo `.pg` pula sem PostgreSQL local; roda no CI). Suíte completa: CI do PR.

## Achados
- A1 (recomendado) server/src/modulos/referencia/repositorio.ts:40 · prioridades sem o corte de `lerChamados` (`fora_do_recorte = false`, `equipe` e `aberto_em` não nulos): prioridade só de chamado fora do recorte vira opção que filtra para vazio. Sugestão: mesmo WHERE de `lerChamados`.
- A2 (recomendado) server/src/modulos/referencia/repositorio.ts:33 · tipos sem `criado_em IS NOT NULL` de `lerCards`: categoria só de story de carga parcial vira opção sem item nos painéis. Sugestão: mesmo corte de `lerCards`.

## Veredito
**Aprovado** em 4bae9c60c8ca32a512a215f1a525d8f254f0be4a: cumpre a T-A do plano, contrato compatível, sem coluna de pessoa, ausência de `incidente` provada por teste. A1 e A2 são recomendados (opção que pode filtrar para vazio, caso que o plano já trata como Q-5 do UX), não bloqueiam.
