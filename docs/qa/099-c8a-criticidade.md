---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-c8a-criticidade
commit: 8c77eeffeafb79837ff245d37d163c9f0dd80e51
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---
# QA: 099 C8a, priority do BusinessMap em dim_card.severidade

Diff contra `develop` (3c34a63b), 7 arquivos (classe N): mapa `prioridade_severidade` em `businessmap-dominio.json`, esquema e `prioridadesDeLinhas` em `dominio-businessmap.ts`, `severidadeDaPrioridade` no `normalizador.ts`, `carregarReferencia` no `projetor.ts` e testes. Obrigações: `docs/analises/099-d3b-c8a.md` parte 2 (2.2 de-para, Q-099-33 recomendação A, 2.4 versão de critério afeta O16). Sem especificação de UX no lote. Os `.pg` e a suíte inteira ficam com o check-run `bateria` do mesmo sha; a rede está bloqueada aqui e não o consultei, então não o cito.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/projetor.ts:72 · nenhum `.pg` cobre a projeção ponta a ponta (priority no staging até dim_card.severidade); retirar `prioridades` de `carregarReferencia` passa nos testes locais. Somar ao `.pg` do projetor.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| 2.2: 1 Crítica, 2 Alta, 3 Média, 4 Baixa (decrescente) | `normalizador-businessmap.test.ts` (priority 1 a 4, e "1" e "4" em texto) | escala invertida | passou |
| 2.2: acima de 4 (e 0, -1, 2.5, "alta", "02", booleano, objeto) recusa e conta, nunca vira Baixa | mesmo arquivo, bloco `fora do mapa` (nota `priority_fora_do_mapa`) | valor logo fora do limite, tipos errados | passou |
| Q-099-33 A: nulo ou ausente sem severidade, sem nota, sem supor Média | mesmo arquivo, "priority nulo ou ausente" | vazio | passou |
| Sem mapa carregado (ref-sync não rodou) nada é projetado nem contado | mesmo arquivo, "sem o mapa carregado" | mapa vazio | passou |
| priority substitui a severidade de campo customizado só com mapa | mesmo arquivo, último `it` | coexistência com L2-b | passou |
| Mapa versionado: 4 linhas, repetir não grava mais nada | `dominio-businessmap.test.ts` e `.pg` (arquivo real) | idempotência | unitário passou; `.pg` com a bateria |
| Esquema só aceita as 4 severidades; priority repetido recusado; código só de 1 a 3 dígitos | `dominio-businessmap.test.ts` (esquema e `prioridadesDeLinhas`) | rótulo fora do contrato, zero à esquerda, duplicidade | passou |
| 2.4: versão de critério afeta O16 (`ref_versao_criterio_metrica`, uma linha por métrica) | `dominio-businessmap.test.ts` (afeta, métrica inexistente recusada) e `.pg` | métrica inexistente | unitário passou; `.pg` com a bateria |
| Visão geral na lista de afeta (conferência do brief) | O16 está no mapa real; `VISAO_GERAL` não consta e a Visão geral não lê o O16 neste lote | n/a | conferido; fora do escopo do diff |

## Execução local
- `server`: `vitest run tests/dominio-businessmap.test.ts tests/normalizador-businessmap.test.ts`: 99 passaram em 8c77eeff.
- Vermelho antes do verde (cópia com `server/src` e `docs/architecture/fontes` da base 3c34a63b e os testes do HEAD; não usei `forge-testes --vermelho`): caíram, entre outros, os 15 casos de priority do normalizador, o do arquivo real e o do esquema das quatro severidades. Com o HEAD, passam.

## Mutação (cópia descartável de `git archive`, restaurada a cada uma)
- M1 nulo vira "Média": 2 falhas. Morta.
- M2 fora do mapa vira "Baixa": 9 falhas no normalizador. Morta.
- M3 tirar a nota `priority_fora_do_mapa`: 9 falhas. Morta.
- M4 mapa vazio passa a projetar (`size === 0` tirado): 1 falha. Morta.
- M5 não gravar as métricas de `afeta`: 1 falha. Morta.
- M6 afrouxar a regex do código em `prioridadesDeLinhas`: 1 falha. Morta.
- Fora do alcance local: tirar `prioridades` de `carregarReferencia` só um `.pg` mata (A1).

## Veredito
Aprovado. Cada regra do de-para tem teste e as seis mutações morreram. O A1 é lacuna de integração no CI, não defeito provado; recomendado.
