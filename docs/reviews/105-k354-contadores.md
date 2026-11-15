---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-k354-contadores-chamado
commit: 6b1ae7b74f7e1c04044343b3e1f44ed261a26073
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-15
---

# Code review: contadores por chamado distinto (K-354, E3.46)

Escopo: `git diff origin/develop...6b1ae7b7`, 1 commit, 4 arquivos (`allow-list.ts`, `normalizador.ts`, `acelerato-projetor.test.ts`, `CHANGELOG.md`), 35 linhas inseridas e 12 removidas. Um assunto só, dentro do M14. CI do head: run 43753464004, concluído com sucesso.

## Conferências

- **Decisão A:** `Contadores.somarChamado(chave, chamadoId)` soma 1 só na primeira vez do par chave/chamado; `normalizarChamado` usa-o em `sem_agente` e `fluxoDoChamado` (agora com `idOrigem`) em `fluxo_multiplo`. `somar` segue para os demais contadores, que não são por chamado.
- **Escopo do distinto:** `projetarAcelerato` cria um único `Contadores` por rodada (`projetor.ts:160`) e o passa a todos os lotes; o distinto vale na rodada inteira, não só no lote.
- **Memória:** o conjunto `vistos` vive no `Contadores` da rodada e é descartado com ela. Guarda só pares de texto curto (chave e id do chamado), só dos chamados com a condição, no máximo um por chamado e por chave. Custo linear nesse número, de ordem de poucos MB numa carga grande; não cresce entre rodadas.
- **Dado de pessoa:** a marca é `chave` + id de origem do chamado. Nome, e-mail, `usuarioKey`, título e descrição não entram no contador nem no conjunto.
- **Testes:** o novo teste unitário (duas versões do mesmo chamado contam 1) e o teste de lote por `projetarAcelerato` (2 versões, 1 chamado, `fluxo_multiplo` e `sem_agente` com 1 cada) cobrem o ramo de repetição. Os existentes foram ajustados à nova assinatura, com ids diferentes onde a contagem esperada é 2.

## Achados
