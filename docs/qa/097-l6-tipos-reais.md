---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l6-tipos-reais
commit: 4bae9c60c8ca32a512a215f1a525d8f254f0be4a
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: L6 do 097, opções de filtro do dado real (servidor, E3.3)

Base develop 1d697d6a. Diff `1d697d6a..4bae9c60`: `server/src/modulos/referencia/repositorio.ts` (+`lerTiposBM`, +`lerPrioridadesAC`), `servico.ts` (filtros por presença), `server/tests/app.test.ts`, `server/tests/painel-real-f6.pg.test.ts`, `docs/api/metricas.md`. Plano: `docs/analises/097-filtros-plano.md`, seção 2 e linha L6.

## Veredito
**Aprovado.** Sem bug aberto. Um achado recomendado (teste de base vazia das prioridades). O teste `.pg` fica com o CI (job banco; o check-run `bateria` do mesmo sha é a prova da suíte inteira, não rodada aqui); nada contra a base real nem `.env*`.

## Execução
- `npx vitest run tests/app.test.ts tests/api.sistemico-intensivo.test.ts --maxWorkers=2` em `server/`: 2 arquivos, 161 testes passaram.
- Mutação 1 (devolver `incidente`: `t !== 'Incidente' && tiposPresentes.has(t)` trocado por `tiposPresentes.has(t) || t === 'Incidente'`, servico.ts): caíram 2 testes (`businessmap: equipes por slug, tipos...`, `businessmap com base vazia`); esperado `[melhoria, bug-interno]`, obtido com `incidente`.
- Mutação 2 (ignorar o distinct dos tipos: filtro só `t !== 'Incidente'`): caíram os mesmos 2 testes (obtido 6 tipos, `requisicao` primeiro).
- Mutação 3 (ignorar o distinct das prioridades: `PRIORIDADES` direto): caiu `acelerato: equipes fixas e prioridades presentes...` (obtido 5 prioridades).
- Os três arquivos restaurados com `git checkout`; árvore limpa.

## Critério → teste → resultado
| Obrigação (E4, L6) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| `opcoes.tipos` só com categorias presentes nas stories | app.test `businessmap: equipes por slug, tipos...` (distinct devolve 4, sai 2) | categoria sem story | passou; cai na mutação 2 |
| Sem `incidente`, mesmo que o banco o devolva | mesmo teste (dublê devolve 'Incidente') | Incidente | passou; cai na mutação 1 |
| Ordem de `TIPOS_FILTRO`, não a do banco | mesmo teste (banco devolve Melhoria, Bug interno; resposta na ordem do contrato) e rótulo fora do enum ('Categoria nova') descartado | ordem; valor fora do enum | passou |
| Base vazia: lista vazia de tipos | app.test `businessmap com base vazia` (`tipos` = `[]`) | vazio | passou; cai na mutação 1 |
| `opcoes.prioridades` só as presentes, de P1 a P5, descartando 'P9' | app.test `acelerato: ...` (banco P3, P1, P9; sai p1, p3) | ordem; fora do enum | passou; cai na mutação 3 |
| Base vazia: prioridades vazias | nenhum teste direto (ver A1) | vazio | lacuna recomendada |
| Entrada `tipo` continua aceitando o enum inteiro; `prioridade` inalterada | api.sistemico-intensivo (`tipo=${TIPOS.join(',')}`, `prioridade=p1,P2`, `P9` e `tipo=999` inválidos); `schemas.ts` fora do diff | entrada | passou |
| BusinessMap e Acelerato separados | consultas em `S.bm.dim_card` (só story) e `S.ac.dim_chamado`; dublê distingue pelo texto; resposta do Acelerato sem `tipos` (teste) | fontes | passou |
| Consulta sem pessoa nem contagem | leitura de `tipo`/`prioridade` apenas (diff) | colunas de pessoa | passou |
| Dado real: tipos da resposta = distinct das stories sem Incidente | painel-real-f6.pg (CI) | base real de teste | delegado ao CI |

## Achados
- A1 (recomendado) server/tests/app.test.ts:55 · a base vazia do Acelerato (`prioridades` = `[]`, afirmado em docs/api/metricas.md) não tem teste; só os tipos do BusinessMap têm. Somar `expect(j.prioridades).toEqual([])` com dublê sem `SELECT DISTINCT prioridade`.
