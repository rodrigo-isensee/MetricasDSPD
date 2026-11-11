---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k272-ap-tipo-categoria
commit: dbd120a49bfbe801f75c829d0eead0e12018d358
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: K-272, AP-TIPO e filtro tipo por categoria (097, E6.3), volta 1

Base develop eac38a64. Revalidação sobre o parecer anterior (ac47260b, código 59fd6ba9). Delta `59fd6ba9..1d691f4e`: `server/src/modulos/apontamento/repositorio.ts` (+17, nova `lerTiposDoHistorico`), `servico.ts` (id da categoria e conjunto de type_id vêm do histórico) e `server/tests/apontamento-rota.test.ts` (+2 testes e a dublê do histórico).

Revalidação depois do merge da develop (head dbd120a4), regravada pela ferramenta Write para constar a autoria: `forge-check parecer delta` (intervalo `dbd120a4..5fd965c5`) diz "nenhum arquivo do domínio mudou"; o que veio da base (`.github/actions/playwright/action.yml`, PR 318) não toca o item; `git diff 1d691f4e dbd120a4 -- server/src/modulos/apontamento server/tests/apontamento-rota.test.ts` vazio; `npx vitest run tests/apontamento-rota.test.ts --maxWorkers=2` em `server/`: 1 arquivo, 74 passaram. Mesmo veredito.

## Veredito
**Aprovado.** Sem bug aberto. O A1 do review (id da categoria dependente da janela) está corrigido e provado por teste; o A2 (teste do caso do A1 e da linha "Sem tipo" em `porTipo`) está atendido. Os testes `.pg` ficam com o CI (o check-run `bateria` do mesmo sha é a prova da suíte inteira, fora desta passada local).

## Execução
- `npx vitest run tests/apontamento-rota.test.ts --maxWorkers=2` (R-TETO), em `server/`: 1 arquivo, 74 testes passaram, 0 pulados.
- Mutação (voltar a calcular o id pelas linhas da janela: `categoriasDeTipo(await lerTiposDoHistorico(db, S))` trocado por `categoriasDeTipo(brutas)`, servico.ts:135): o teste "K-272 (A1): o id da categoria vem do histórico..." falhou (opções deixaram de ser `[34 Incidente], [9 Trabalho de produto]`); 1 falhou, 73 passaram. Arquivo restaurado com `git checkout`; árvore limpa.
- Leitura nova: `lerTiposDoHistorico` seleciona só `COALESCE(c.tipo, p.tipo)` e `h.type_id` de `S.bm.fato_apontamento`/`dim_card`, ativos (`excluido_em IS NULL`), sem filtro de data. Sem coluna de pessoa; só esquema BusinessMap, sem Acelerato (fontes não se misturam). O teste afirma que a consulta não contém `data_apontamento`.

## Critério → teste → resultado
| Obrigação (decisão P-097-7, opção a) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Uma linha por categoria no AP-TIPO, somando os type_id | K-272 (`porTipo` 'Trabalho de produto': 1 linha, 10 800 s, 2 apontamentos) | dois type_id na mesma categoria | passou |
| Uma opção por categoria, id = menor type_id | K-272 (opções `[34 Incidente], [9 Trabalho de produto]`) | menor type_id (9, não 12) | passou |
| Filtrar por qualquer type_id cobre a categoria | K-272 (`tipo=9` e `tipo=12` dão 10 800 s e 2 apontamentos) | type_id não-menor | passou |
| lerCardsIncompletos recebe todos os type_id | K-272 (`valores[3]` = `['9','12']`) | filtro no banco | passou |
| Id da categoria estável fora da janela (A1) | K-272 (A1): janela só com type_id 12, histórico com 9 e 12; opção id '9'; `tipo=9` = 3600 s, 1 apontamento; banco recebe `['9','12']` | janela sem o menor type_id | passou (cai na mutação) |
| "Sem tipo" à parte em `porTipo` e fora das opções (A2) | K-272 (A2): 1 linha "Sem tipo" com 900 s; opções só `['Melhoria']` | categoria nula | passou |
| Histórico lido sem filtro de data | K-272 (A1): consulta `fato_apontamento h` sem `data_apontamento` | sem janela | passou |
| Link antigo `tipo=<dígitos>` segue válido; fora de dígitos dá 400 | K-272 e teste existente de 400 | contrato do filtro | passou |

## Observação
O dublê do banco devolve, por padrão, os pares das próprias linhas quando `historicoTipos` não é informado; os testes de categoria que dependem da divergência janela x histórico informam `historicoTipos`. Sem risco.

## Achados
